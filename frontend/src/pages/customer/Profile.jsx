import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User, MapPin, Bell, LogOut, ShoppingBag, Heart,
  Star, Settings, ChevronRight, Edit2, Camera, Phone, Mail
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { orderApi, reviewApi, addressApi } from '../../api'
import toast from 'react-hot-toast'

const TABS = [
  { key: 'profile',   label: 'Profile',   icon: User },
  { key: 'orders',    label: 'Orders',    icon: ShoppingBag },
  { key: 'reviews',   label: 'My Reviews',icon: Star },
  { key: 'addresses', label: 'Addresses', icon: MapPin },
  { key: 'settings',  label: 'Settings',  icon: Settings },
]

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab]             = useState('profile')
  const [orders, setOrders]       = useState([])
  const [reviews, setReviews]     = useState([])
  const [addresses, setAddresses] = useState([])
  const [loadingOrders,   setLO]  = useState(false)
  const [loadingReviews,  setLR]  = useState(false)
  const [loadingAddresses,setLA]  = useState(false)

  useEffect(() => {
    if (tab === 'orders' && !orders.length) {
      setLO(true)
      orderApi.getMyOrders(0, 5).then(r => setOrders(r.data?.content || [])).finally(() => setLO(false))
    }
    if (tab === 'reviews' && !reviews.length) {
      setLR(true)
      reviewApi.getMyReviews(0, 10).then(r => setReviews(r.data?.content || [])).finally(() => setLR(false))
    }
    if (tab === 'addresses' && !addresses.length) {
      setLA(true)
      addressApi.getAll().then(r => setAddresses(r.data || [])).finally(() => setLA(false))
    }
  }, [tab])

  const STATUS_COLORS = {
    PLACED: 'badge-blue', CONFIRMED: 'badge-orange', PREPARING: 'badge-orange',
    READY_FOR_PICKUP: 'badge-orange', OUT_FOR_DELIVERY: 'badge-blue',
    DELIVERED: 'badge-green', CANCELLED: 'badge-red',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-orange-500 rounded-3xl p-6 text-white mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center font-bold text-3xl">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold font-display">{user?.name}</h2>
            <p className="text-orange-100 text-sm mt-0.5">{user?.email}</p>
            {user?.phone && <p className="text-orange-100 text-sm">{user.phone}</p>}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[220px,1fr] gap-5">
        {/* Sidebar tabs */}
        <div className="bg-white rounded-2xl shadow-card p-3 h-fit space-y-1">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  tab === t.key ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:bg-gray-50'
                }`}>
                <Icon className="w-4 h-4" />
                {t.label}
                {tab === t.key && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </button>
            )
          })}
          <div className="border-t border-gray-100 pt-2 mt-2">
            <Link to="/notifications"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
              <Bell className="w-4 h-4" /> Notifications
            </Link>
            <Link to="/favorites"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
              <Heart className="w-4 h-4" /> Wishlist
            </Link>
            <button onClick={() => { logout(); navigate('/') }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Content panel */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          {/* ── Profile ── */}
          {tab === 'profile' && (
            <div className="space-y-5">
              <h3 className="font-bold text-gray-900">Personal Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: User,  label: 'Full Name',  val: user?.name },
                  { icon: Mail,  label: 'Email',       val: user?.email },
                  { icon: Phone, label: 'Phone',       val: user?.phone || 'Not set' },
                  { icon: User,  label: 'Role',        val: user?.role?.replace(/_/g, ' ') },
                ].map(f => {
                  const Icon = f.icon
                  return (
                    <div key={f.label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{f.label}</p>
                        <p className="font-medium text-gray-900 text-sm">{f.val}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="bg-brand-50 rounded-xl p-4 flex items-center gap-3">
                <Edit2 className="w-4 h-4 text-brand-500" />
                <p className="text-sm text-brand-700">Profile editing coming soon. Contact <a href="mailto:support@spiceroute.com" className="underline">support</a> to update your details.</p>
              </div>
            </div>
          )}

          {/* ── Orders ── */}
          {tab === 'orders' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Recent Orders</h3>
                <Link to="/orders" className="text-brand-500 text-xs font-medium hover:underline">View all</Link>
              </div>
              {loadingOrders ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-10">
                  <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No orders yet</p>
                  <Link to="/browse" className="btn-primary inline-flex mt-4 text-sm py-2 px-4">Start Ordering</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map(o => (
                    <Link key={o.id} to={`/orders/${o.id}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-brand-50 transition-colors group">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                        {o.paymentMethod === 'CASH_ON_DELIVERY' ? '💵' : '💳'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 text-sm">Order #{o.id}</p>
                          <span className={`${STATUS_COLORS[o.status] || 'badge-gray'} badge text-xs`}>{o.status?.replace(/_/g,' ')}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{o.items?.map(i => i.foodItemName).join(', ')}</p>
                        <p className="text-xs text-gray-400 mt-0.5">₹{o.totalAmount}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Reviews ── */}
          {tab === 'reviews' && (
            <div>
              <h3 className="font-bold text-gray-900 mb-4">My Reviews</h3>
              {loadingReviews ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-10">
                  <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No reviews yet</p>
                  <p className="text-gray-400 text-xs mt-1">Complete an order to write your first review</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Order #{r.orderId}</p>
                          <div className="flex gap-0.5 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < r.foodRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">Food</span>
                          </div>
                          {r.deliveryRating && (
                            <div className="flex gap-0.5 mt-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < r.deliveryRating ? 'fill-blue-400 text-blue-400' : 'text-gray-300'}`} />
                              ))}
                              <span className="text-xs text-gray-500 ml-1">Delivery</span>
                            </div>
                          )}
                          <p className="text-sm text-gray-700 mt-1">{r.comment}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Addresses ── */}
          {tab === 'addresses' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Saved Addresses</h3>
                <Link to="/addresses" className="btn-primary text-xs py-2 px-3">Manage Addresses</Link>
              </div>
              {loadingAddresses ? (
                <div className="skeleton h-20 rounded-xl" />
              ) : addresses.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No addresses saved</p>
                  <Link to="/addresses" className="btn-primary inline-flex mt-3 text-sm py-2 px-4">Add Address</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(a => (
                    <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-brand-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{a.addressType}</p>
                        <p className="text-xs text-gray-500">{a.houseNumber}, {a.street}, {a.city}</p>
                        {a.isDefault && <span className="badge badge-green text-xs mt-1">Default</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Settings ── */}
          {tab === 'settings' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Settings</h3>
              {[
                { label: 'Order Notifications', desc: 'Get notified for order updates', defaultOn: true },
                { label: 'Promotional Offers',  desc: 'Festival deals and discount alerts', defaultOn: true },
                { label: 'Review Reminders',    desc: 'Remind me to review after delivery', defaultOn: true },
                { label: 'Location Services',   desc: 'Allow location for faster delivery', defaultOn: false },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{s.label}</p>
                    <p className="text-xs text-gray-500">{s.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={s.defaultOn} className="sr-only peer" />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500"></div>
                  </label>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100">
                <button onClick={() => { logout(); navigate('/') }}
                  className="w-full flex items-center gap-2 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
