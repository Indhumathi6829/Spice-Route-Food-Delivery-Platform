import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Circle, Clock, MapPin, Phone, Star, Navigation, Edit2, Trash2, Package, ChefHat, Bike, ShoppingBag, CheckCheck, PartyPopper } from 'lucide-react'
import { orderApi, reviewApi } from '../../api'
import { useForm } from 'react-hook-form'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import toast from 'react-hot-toast'

const STEPS = [
  { key: 'PLACED',            label: 'Order Placed',           desc: 'Your order has been received',        Icon: ShoppingBag  },
  { key: 'CONFIRMED',         label: 'Restaurant Confirmed',   desc: 'Restaurant accepted your order',      Icon: CheckCheck   },
  { key: 'PREPARING',         label: 'Preparing Your Food',    desc: 'Our chefs are cooking your meal',     Icon: ChefHat      },
  { key: 'READY_FOR_PICKUP',  label: 'Ready for Pickup',       desc: 'Finding a delivery partner...',       Icon: Package      },
  { key: 'OUT_FOR_DELIVERY',  label: 'Out for Delivery',       desc: 'Your order is on the way!',           Icon: Bike         },
  { key: 'DELIVERED',         label: 'Delivered',              desc: 'Enjoy your meal!',                    Icon: CheckCircle  },
]

const STATUS_COLORS = {
  PLACED: 'badge-blue', CONFIRMED: 'badge-orange', PREPARING: 'badge-orange',
  READY_FOR_PICKUP: 'badge-orange', OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700',
  DELIVERED: 'badge-green', CANCELLED: 'badge-red',
}

function StarSelect({ value, onChange, label }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="focus:outline-none transition-transform hover:scale-110"
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                n <= value
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-gray-200 text-gray-200 hover:fill-amber-200 hover:text-amber-200'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-500 self-center">
          {value ? `${value}/5` : 'Tap to rate'}
        </span>
      </div>
    </div>
  )
}

export default function OrderTracking() {
  const { id } = useParams()
  const [order,      setOrder]      = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [partnerLoc, setPartnerLoc] = useState(null)
  const [showReview, setShowReview] = useState(false)
  const [existingReview, setExistingReview] = useState(null)
  const [editMode,   setEditMode]   = useState(false)
  const [foodRating,     setFoodRating]     = useState(5)
  const [deliveryRating, setDeliveryRating] = useState(5)
  const stompRef = useRef(null)
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  const fetchOrder = useCallback(() => {
    orderApi.getById(id).then(r => {
      setOrder(r.data)
    }).finally(() => setLoading(false))
  }, [id])

  const fetchReview = useCallback(() => {
    reviewApi.getByOrderId(id).then(r => {
      if (r.status === 200) {
        setExistingReview(r.data)
        setFoodRating(r.data.foodRating)
        setDeliveryRating(r.data.deliveryRating || 5)
      }
    }).catch(() => {/* no review yet — ignore */})
  }, [id])

  useEffect(() => {
    fetchOrder()
    const poll = setInterval(fetchOrder, 20000)
    return () => clearInterval(poll)
  }, [fetchOrder])

  useEffect(() => {
    // Only fetch existing review if the order was delivered
    if (order?.status === 'DELIVERED') {
      fetchReview()
    }
  }, [order?.status, fetchReview])

  // WebSocket for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('sr_token')
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders:   token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay:   5000,
      onConnect: () => {
        client.subscribe(`/topic/orders/${id}`, (msg) => {
          try {
            const data = JSON.parse(msg.body)
            if (data.status) setOrder(prev => prev ? { ...prev, status: data.status } : prev)
          } catch {}
          fetchOrder()
        })
        client.subscribe(`/topic/tracking/${id}`, (msg) => {
          try {
            const loc = JSON.parse(msg.body)
            setPartnerLoc({ lat: loc.latitude, lng: loc.longitude })
          } catch {}
        })
      },
    })
    client.activate()
    stompRef.current = client
    return () => { if (stompRef.current) stompRef.current.deactivate() }
  }, [id, fetchOrder])

  const openNewReview = () => {
    setFoodRating(5)
    setDeliveryRating(5)
    reset({ comment: '' })
    setEditMode(false)
    setShowReview(true)
  }

  const openEditReview = () => {
    if (!existingReview) return
    setFoodRating(existingReview.foodRating)
    setDeliveryRating(existingReview.deliveryRating || 5)
    reset({ comment: existingReview.comment || '' })
    setEditMode(true)
    setShowReview(true)
  }

  const submitReview = async (data) => {
    const payload = {
      orderId:        parseInt(id),
      foodRating,
      deliveryRating: order?.deliveryPartnerName ? deliveryRating : undefined,
      comment:        data.comment,
    }
    try {
      if (editMode && existingReview) {
        const updated = await reviewApi.update(existingReview.id, payload)
        setExistingReview(updated.data)
        toast.success('Review updated!')
      } else {
        const created = await reviewApi.create(payload)
        setExistingReview(created.data)
              toast.success('Thanks for your review!')
      }
      setShowReview(false)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit review')
    }
  }

  const deleteReview = async () => {
    if (!existingReview) return
    if (!window.confirm('Delete your review?')) return
    try {
      await reviewApi.deleteReview(existingReview.id)
      setExistingReview(null)
      toast.success('Review deleted')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete')
    }
  }

  if (loading) return (
    <div className="page-container max-w-2xl mx-auto">
      <div className="skeleton h-8 w-48 mb-6" />
      <div className="skeleton h-64 rounded-2xl mb-4" />
      <div className="skeleton h-40 rounded-2xl" />
    </div>
  )

  if (!order) return (
    <div className="page-container text-center py-20">
      <p className="text-gray-500">Order not found</p>
      <Link to="/orders" className="btn-primary mt-4 inline-flex">My Orders</Link>
    </div>
  )

  const currentIdx  = STEPS.findIndex(s => s.key === order.status)
  const isCancelled = order.status === 'CANCELLED'

  // Google Maps embed URL
  const destLat = order.deliveryAddress?.latitude
  const destLng = order.deliveryAddress?.longitude
  const mapSrc  = destLat && destLng
    ? `https://www.google.com/maps/embed/v1/place?key=${window.__GOOGLE_MAPS_KEY__ || ''}&q=${destLat},${destLng}&zoom=15`
    : null

  return (
    <div className="page-container max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/orders" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="section-title">Order #{order.id}</h1>
          <p className="text-sm text-gray-500">{new Date(order.placedAt).toLocaleString('en-IN')}</p>
        </div>
        <span className={`badge ${STATUS_COLORS[order.status] || 'badge-gray'}`}>
          {order.status?.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Live map (when GPS available) */}
      {(partnerLoc || (destLat && destLng)) && order.status === 'OUT_FOR_DELIVERY' && (
        <div className="card mb-5 p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <Navigation className="w-4 h-4 text-brand-500 animate-pulse" />
            <span className="text-sm font-semibold text-gray-700">Live Tracking</span>
            <span className="ml-auto text-xs text-green-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live
            </span>
          </div>
          {mapSrc ? (
            <iframe src={mapSrc} title="Delivery Location" className="w-full h-56 border-0" allowFullScreen loading="lazy" />
          ) : (
            <div className="h-56 bg-gradient-to-br from-brand-50 to-orange-50 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center">
                <Bike className="w-8 h-8 text-brand-500" />
              </div>
              <p className="text-sm font-semibold text-brand-600">Delivery partner is on the way!</p>
              {partnerLoc && (
                <p className="text-xs text-gray-500">
                  Location: {partnerLoc.lat.toFixed(4)}, {partnerLoc.lng.toFixed(4)}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Status timeline */}
      {!isCancelled && (
        <div className="card mb-5">
          <h3 className="font-bold text-gray-900 mb-5">Order Timeline</h3>
          <div className="space-y-0">
            {STEPS.map((s, i) => {
              const done    = i <= currentIdx
              const current = i === currentIdx
              return (
                <div key={s.key} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      current ? 'bg-brand-500 text-white shadow-md shadow-brand-200 scale-110'
                      : done   ? 'bg-green-500 text-white'
                               : 'bg-gray-100 text-gray-400'
                    }`}>
                      {done && !current
                        ? <CheckCircle className="w-4 h-4" />
                        : (() => { const SI = s.Icon; return <SI className="w-4 h-4" /> })()
                      }
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 transition-all ${
                        i < currentIdx ? 'bg-green-400' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                  <div className={`pt-1.5 pb-6 transition-opacity ${done ? 'opacity-100' : 'opacity-35'}`}>
                    <p className={`font-semibold text-sm ${current ? 'text-brand-600' : 'text-gray-700'}`}>{s.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                    {order.statusHistory?.find(h => h.status === s.key) && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(order.statusHistory.find(h => h.status === s.key).timestamp)
                          .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="card mb-5 bg-red-50 border border-red-200 text-center py-6">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Circle className="w-7 h-7 text-red-400" />
          </div>
          <p className="font-bold text-red-700">Order Cancelled</p>
          {order.cancelledAt && (
            <p className="text-xs text-red-500 mt-1">at {new Date(order.cancelledAt).toLocaleString('en-IN')}</p>
          )}
        </div>
      )}

      {/* Delivery partner card */}
      {order.deliveryPartnerName && (
        <div className="card mb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
              {order.deliveryPartnerName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">{order.deliveryPartnerName}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1"><Bike className="w-3 h-3" /> Your Delivery Partner</p>
              {existingReview?.deliveryRating && (
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className={`w-3 h-3 ${n <= existingReview.deliveryRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">Your delivery rating</span>
                </div>
              )}
            </div>
            {order.deliveryPartnerPhone && (
              <a href={`tel:${order.deliveryPartnerPhone}`}
                className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-3 py-2 rounded-xl hover:bg-green-100 transition-colors">
                <Phone className="w-4 h-4" /> Call
              </a>
            )}
          </div>
        </div>
      )}

      {/* Address + summary grid */}
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <div className="card">
          <p className="font-bold text-sm text-gray-900 mb-2 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-brand-500" /> Delivering To
          </p>
          <p className="text-sm text-gray-600">{order.deliveryAddress?.houseNumber}, {order.deliveryAddress?.street}</p>
          {order.deliveryAddress?.area && <p className="text-sm text-gray-600">{order.deliveryAddress.area}</p>}
          <p className="text-sm text-gray-600">{order.deliveryAddress?.city}, {order.deliveryAddress?.state}</p>
        </div>
        <div className="card">
          <p className="font-bold text-sm text-gray-900 mb-2">Price Breakdown</p>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>₹{order.deliveryFee}</span></div>
            {parseFloat(order.discountAmount) > 0 && (
              <div className="flex justify-between text-green-600"><span>Discount</span><span>−₹{order.discountAmount}</span></div>
            )}
            <div className="flex justify-between font-bold text-gray-900 pt-1 border-t">
              <span>Total</span><span>₹{order.totalAmount}</span>
            </div>
            <div className="mt-1"><span className="badge badge-gray">{order.paymentMethod?.replace(/_/g, ' ')}</span></div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card mb-5">
        <p className="font-bold text-gray-900 mb-3">Items Ordered</p>
        <div className="space-y-3">
          {order.items?.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <img src={item.imageUrl} alt={item.foodItemName} className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                onError={e => { e.target.src = `https://via.placeholder.com/48x48/f97316/white?text=${item.foodItemName?.[0]}` }} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.foodItemName}</p>
                <p className="text-xs text-gray-500">×{item.quantity} × ₹{item.priceAtOrderTime}</p>
              </div>
              <p className="text-sm font-bold text-gray-900">₹{item.lineTotal}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Review section ─────────────────────────────────────────────────── */}

      {/* CTA: rate order (only when delivered and not yet reviewed) */}
      {order.status === 'DELIVERED' && !existingReview && !showReview && (
        <button onClick={openNewReview}
          className="w-full btn-secondary py-3 gap-2 mb-5">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Rate Your Order
        </button>
      )}

      {/* Existing review summary */}
      {order.status === 'DELIVERED' && existingReview && !showReview && (
        <div className="card mb-5 bg-amber-50 border border-amber-200">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-amber-800 flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> Your Review
            </p>
            <div className="flex gap-2">
              <button onClick={openEditReview}
                className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors" title="Edit review">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={deleteReview}
                className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Delete review">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 w-20 flex-shrink-0">Food:</span>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} className={`w-4 h-4 ${n <= existingReview.foodRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                ))}
              </div>
            </div>
            {existingReview.deliveryRating && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-20 flex-shrink-0">Delivery:</span>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className={`w-4 h-4 ${n <= existingReview.deliveryRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
            )}
            {existingReview.comment && (
              <p className="text-sm text-amber-800 mt-2 italic">"{existingReview.comment}"</p>
            )}
          </div>
        </div>
      )}

      {/* Review form (new or edit) */}
      {showReview && (
        <div className="card mb-5">
          <h3 className="font-bold text-gray-900 mb-5">
            {editMode ? 'Update Your Review' : 'Rate Your Order'}
          </h3>
          <form onSubmit={handleSubmit(submitReview)} className="space-y-5">

            {/* Food Rating */}
            <StarSelect
              value={foodRating}
              onChange={setFoodRating}
              label="Food Rating *"
            />

            {/* Delivery Rating — only if a delivery partner exists */}
            {order.deliveryPartnerName && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                  <Bike className="w-3.5 h-3.5 text-blue-500" /> Rate your delivery partner: <strong className="text-gray-700">{order.deliveryPartnerName}</strong>
                </p>
                <StarSelect
                  value={deliveryRating}
                  onChange={setDeliveryRating}
                  label="Delivery Rating"
                />
              </div>
            )}

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Experience <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                className="input min-h-[80px] resize-none"
                placeholder="Tell us about your meal, the delivery speed, or anything else..."
                {...register('comment')}
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary">
                {isSubmitting ? 'Submitting...' : editMode ? 'Update Review' : 'Submit Review'}
              </button>
              <button type="button" onClick={() => setShowReview(false)} className="flex-1 btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-3">
        <Link to="/orders" className="flex-1 btn-secondary justify-center">View All Orders</Link>
        <Link to="/menu"   className="flex-1 btn-primary justify-center">Order Again</Link>
      </div>
    </div>
  )
}
