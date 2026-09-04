import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MapPin, Tag, CreditCard, Banknote, Plus, Check, ArrowLeft, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { addressApi, couponApi, orderApi, paymentApi } from '../../api'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'
import PaymentFailedRecovery from './PaymentFailedRecovery'

const DELIVERY_FEE = 49
const TAX_RATE     = 0.05

/** Load Razorpay checkout script once */
function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src   = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload  = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function Checkout() {
  const navigate = useNavigate()
  const { cart, clearCart } = useCart()

  const [addresses,    setAddresses]    = useState([])
  const [selAddr,      setSelAddr]      = useState(null)
  const [coupon,       setCoupon]       = useState('')
  const [couponData,   setCouponData]   = useState(null)
  const [couponErr,    setCouponErr]    = useState('')
  const [payMethod,    setPayMethod]    = useState('CASH_ON_DELIVERY')
  const [placing,      setPlacing]      = useState(false)
  const [payError,     setPayError]     = useState('')
  const [failedOrderId, setFailedOrderId] = useState(null)   // AI recovery hook
  const [showAddAddr,  setShowAddAddr]  = useState(false)
  const [specialNote,  setSpecialNote]  = useState('')

  const { register, handleSubmit, reset, formState: { errors: formErrors } } = useForm()

  useEffect(() => {
    addressApi.getAll().then(r => {
      setAddresses(r.data)
      const def = r.data.find(a => a.isDefault) || r.data[0]
      if (def) setSelAddr(def.id)
    }).catch(() => {})
  }, [])

  if (!cart || cart.items?.length === 0) {
    navigate('/cart')
    return null
  }

  const subtotal = parseFloat(cart.subtotal || 0)
  const discount = couponData
    ? (couponData.discountType === 'FLAT'
        ? Math.min(parseFloat(couponData.discountValue), subtotal)
        : Math.min(subtotal * parseFloat(couponData.discountValue) / 100,
                   couponData.maximumDiscount ? parseFloat(couponData.maximumDiscount) : Infinity))
    : 0
  const tax   = (subtotal - discount) * TAX_RATE
  const total = subtotal + DELIVERY_FEE + tax - discount

  const applyCoupon = async () => {
    setCouponErr(''); setCouponData(null)
    if (!coupon.trim()) return
    try {
      const { data } = await couponApi.validate(coupon.trim(), subtotal)
      setCouponData(data)
      toast.success(`Coupon applied! ✅`)
    } catch (e) {
      setCouponErr(e.response?.data?.message || 'Invalid or expired coupon')
    }
  }

  const placeOrder = async () => {
    if (!selAddr) { toast.error('Please select a delivery address'); return }
    setPlacing(true); setPayError('')

    try {
      const { data: order } = await orderApi.place({
        addressId:           selAddr,
        items:               cart.items.map(i => ({ foodItemId: i.foodItemId, quantity: i.quantity })),
        couponCode:          couponData ? coupon.trim() : null,
        paymentMethod:       payMethod,
        specialInstructions: specialNote,
      })

      if (payMethod === 'RAZORPAY') {
        const loaded = await loadRazorpay()
        if (!loaded) {
          setPayError('Failed to load payment gateway. Check your internet connection.')
          setPlacing(false)
          return
        }

        const { data: rzpData } = await paymentApi.create(order.id)

        const rzp = new window.Razorpay({
          key:         rzpData.keyId,
          amount:      rzpData.amount,
          currency:    rzpData.currency,
          order_id:    rzpData.razorpayOrderId,
          name:        'SpiceRoute Kitchen 🌶️',
          description: `Order #${order.id}`,
          image:       '/favicon.svg',
          prefill:     { name: '', email: '', contact: '' },
          theme:       { color: '#f97316' },
          modal: {
            ondismiss: () => {
              setPlacing(false)
              toast.error('Payment cancelled. Your order is saved — you can retry from Order History.')
              // ── AI Recovery hook (additive) ────────────────────────────
              setFailedOrderId(order.id)
            },
          },
          handler: async (response) => {
            try {
              await paymentApi.verify({
                razorpayOrderId:   response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              })
      toast.success('Payment successful!')
              navigate(`/order-success/${order.id}`)
            } catch (verifyErr) {
              setPayError('Payment was deducted but verification failed. Contact support with Order #' + order.id)
              setPlacing(false)
            }
          },
        })
        rzp.on('payment.failed', (response) => {
          setPayError(`Payment failed: ${response.error.description}`)
          setPlacing(false)
          // ── AI Recovery hook (additive) ──────────────────────────────────
          setFailedOrderId(order.id)
          try {
            import('../../api').then(({ recoveryApi }) => {
              recoveryApi.reportFailed(
                order.id,
                response.error?.metadata?.payment_id || '',
                response.error?.description || '',
                response.error?.reason || ''
              )
            })
          } catch (_) { /* recovery failure must not crash checkout */ }
        })
        rzp.open()
      } else {
        // COD — go straight to success
        navigate(`/order-success/${order.id}`)
      }
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to place order. Please try again.'
      setPayError(msg)
      toast.error(msg)
      setPlacing(false)
    }
  }

  const saveAddress = async (data) => {
    try {
      const { data: addr } = await addressApi.add({ ...data, isDefault: false, addressType: data.addressType || 'HOME' })
      setAddresses(prev => [...prev, addr])
      setSelAddr(addr.id)
      setShowAddAddr(false)
      reset()
      toast.success('Address saved!')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save address')
    }
  }

  const selAddrObj = addresses.find(a => a.id === selAddr)

  return (
    <div className="page-container">
      {/* Back button */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/cart" className="flex items-center gap-2 text-gray-500 hover:text-brand-600 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="section-title">Checkout</h1>
      </div>

      {payError && (
        <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{payError}</p>
        </div>
      )}

      {/* ── AI Revenue Recovery (additive — only shown after payment failure) ── */}
      {failedOrderId && (
        <PaymentFailedRecovery
          orderId={failedOrderId}
          amount={total.toFixed(2)}
          onSuccess={(id) => navigate(`/order-success/${id}`)}
        />
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Address */}
          <div className="card">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-brand-500" /> Delivery Address
            </h2>
            {addresses.length === 0 ? (
              <p className="text-gray-500 text-sm mb-3">No saved addresses. Add one below.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map(a => (
                  <label key={a.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selAddr === a.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'
                  }`}>
                    <input type="radio" name="address" value={a.id} checked={selAddr === a.id}
                      onChange={() => setSelAddr(a.id)} className="mt-1 accent-brand-500" />
                    <div className="text-sm flex-1">
                      <p className="font-semibold text-gray-900">{a.fullName || 'Home'}</p>
                      <p className="text-gray-600">{a.houseNumber}, {a.street}{a.area ? `, ${a.area}` : ''}</p>
                      <p className="text-gray-600">{a.city}, {a.state} — {a.postalCode}</p>
                    </div>
                    <span className={`badge shrink-0 ${
                      a.addressType === 'HOME' ? 'badge-blue' :
                      a.addressType === 'WORK' ? 'badge-orange' : 'badge-gray'}`}>
                      {a.addressType}
                    </span>
                  </label>
                ))}
              </div>
            )}
            <button onClick={() => setShowAddAddr(!showAddAddr)}
              className="mt-3 flex items-center gap-2 text-brand-600 text-sm font-medium hover:underline">
              <Plus className="w-4 h-4" /> {showAddAddr ? 'Cancel' : 'Add new address'}
            </button>

            {showAddAddr && (
              <form onSubmit={handleSubmit(saveAddress)} className="mt-4 space-y-3 bg-gray-50 p-4 rounded-xl">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">House / Flat *</label>
                    <input className="input text-sm" placeholder="A-101"
                      {...register('houseNumber', { required: 'Required' })} />
                    {formErrors.houseNumber && <p className="text-red-500 text-xs mt-1">{formErrors.houseNumber.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Street *</label>
                    <input className="input text-sm" placeholder="MG Road"
                      {...register('street', { required: 'Required' })} />
                    {formErrors.street && <p className="text-red-500 text-xs mt-1">{formErrors.street.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Area</label>
                    <input className="input text-sm" placeholder="Anna Nagar" {...register('area')} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">City *</label>
                    <input className="input text-sm" placeholder="Chennai"
                      {...register('city', { required: 'Required' })} />
                    {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">State *</label>
                    <input className="input text-sm" placeholder="Tamil Nadu"
                      {...register('state', { required: 'Required' })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">PIN Code *</label>
                    <input className="input text-sm" placeholder="600001"
                      {...register('postalCode', { required: 'Required', pattern: { value: /^\d{6}$/, message: '6-digit PIN' } })} />
                    {formErrors.postalCode && <p className="text-red-500 text-xs mt-1">{formErrors.postalCode.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Label</label>
                    <select className="input text-sm" {...register('addressType')}>
                      <option value="HOME">🏠 Home</option>
                      <option value="WORK">💼 Work</option>
                      <option value="OTHER">📍 Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Your Name</label>
                    <input className="input text-sm" placeholder="Name for delivery" {...register('fullName')} />
                  </div>
                </div>
                <button type="submit" className="btn-primary text-sm py-2">Save Address</button>
              </form>
            )}
          </div>

          {/* Coupon */}
          <div className="card">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-brand-500" /> Apply Coupon
            </h2>
            {couponData ? (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-green-700 text-sm">{couponData.code} applied!</p>
                  <p className="text-xs text-green-600">{couponData.description}</p>
                </div>
                <button onClick={() => { setCouponData(null); setCoupon('') }}
                  className="text-xs text-gray-500 hover:text-red-500 font-medium">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="Enter coupon code"
                  value={coupon} onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponErr('') }} />
                <button onClick={applyCoupon} disabled={!coupon.trim()}
                  className="btn-secondary px-5 py-2.5 disabled:opacity-40">Apply</button>
              </div>
            )}
            {couponErr && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {couponErr}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {['WELCOME50', 'FLAT100', 'WEEKEND20', 'SPICE50'].map(c => (
                <button key={c} onClick={() => { setCoupon(c); setCouponErr('') }}
                  className="text-xs bg-gray-100 hover:bg-brand-50 text-gray-600 hover:text-brand-600 px-2.5 py-1 rounded-lg font-medium transition-colors">
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Special instructions */}
          <div className="card">
            <label className="font-bold text-gray-900 text-sm mb-2 block">Special Instructions (optional)</label>
            <textarea className="input min-h-[60px] resize-none text-sm"
              placeholder="e.g. Ring the bell, leave at door..."
              value={specialNote} onChange={e => setSpecialNote(e.target.value)} />
          </div>

          {/* Payment */}
          <div className="card">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-brand-500" /> Payment Method
            </h2>
            <div className="space-y-3">
              {[
                { id: 'RAZORPAY',         icon: CreditCard, label: 'Pay Online',         sub: 'UPI · Cards · NetBanking · Wallets via Razorpay' },
                { id: 'CASH_ON_DELIVERY', icon: Banknote,   label: 'Cash on Delivery',   sub: 'Pay with cash when your order arrives' },
              ].map(m => (
                <label key={m.id} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  payMethod === m.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'
                }`}>
                  <input type="radio" name="payment" value={m.id} checked={payMethod === m.id}
                    onChange={() => { setPayMethod(m.id); setPayError('') }} className="accent-brand-500" />
                  <m.icon className="w-6 h-6 text-brand-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{m.label}</p>
                    <p className="text-xs text-gray-500">{m.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Summary ── */}
        <div>
          <div className="card sticky top-24 space-y-5">
            <h2 className="font-bold text-gray-900">Order Summary</h2>

            {/* Selected address preview */}
            {selAddrObj && (
              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600">
                <p className="font-semibold text-gray-800 flex items-center gap-1 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-500" /> Delivering to
                </p>
                <p>{selAddrObj.houseNumber}, {selAddrObj.street}</p>
                <p>{selAddrObj.city}, {selAddrObj.state} — {selAddrObj.postalCode}</p>
              </div>
            )}

            {/* Items */}
            <div className="space-y-2 border-b border-gray-100 pb-3">
              {cart.items?.map(i => (
                <div key={i.id} className="flex justify-between text-xs text-gray-600">
                  <span className="flex-1 line-clamp-1">{i.foodItemName} × {i.quantity}</span>
                  <span className="ml-2 font-medium text-gray-800">₹{i.lineTotal}</span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span><span>₹{DELIVERY_FEE.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount ({couponData?.code})</span>
                  <span>−₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2.5 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span><span>₹{total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500 text-center">
                {payMethod === 'RAZORPAY' ? '🔒 Secured by Razorpay' : '💵 Cash on delivery'}
              </p>
            </div>

            <button onClick={placeOrder} disabled={placing || !selAddr}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-50">
              {placing
                ? <><div className="spinner" /> Processing...</>
                : payMethod === 'RAZORPAY'
                  ? '🔒 Proceed to Pay'
                  : '✅ Place Order'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              By placing an order you agree to our terms of service.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
