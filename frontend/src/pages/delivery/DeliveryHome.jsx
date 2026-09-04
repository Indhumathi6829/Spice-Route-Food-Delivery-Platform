import { useEffect, useState, useCallback } from 'react'
import { Bike, MapPin, Phone, CheckCircle, Package, Wifi, WifiOff, Navigation, Star, RefreshCw, Clock, Sun, CloudSun, Moon } from 'lucide-react'
import { deliveryApi, reviewApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function DeliveryHome() {
  const { user }                              = useAuth()
  const [profile,    setProfile]              = useState(null)
  const [available,  setAvailable]            = useState([])
  const [myOrders,   setMyOrders]             = useState([])
  const [stats,      setStats]                = useState(null)
  const [loading,    setLoading]              = useState(true)
  const [togglingStatus, setTogglingStatus]   = useState(false)
  const [pendingReq, setPendingReq]           = useState(null)
  const [accepting,  setAccepting]            = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [profileRes, availRes, ordersRes] = await Promise.all([
        deliveryApi.getProfile(),
        deliveryApi.getAvailable(),
        deliveryApi.getMyOrders(),
      ])
      setProfile(profileRes.data)
      setAvailable(availRes.data || [])
      setMyOrders((ordersRes.data || []).filter(o => o.status === 'OUT_FOR_DELIVERY'))

      // Check for pending assignment request
      try {
        const pr = await deliveryApi.getPendingRequest()
        setPendingReq(pr.data || null)
      } catch { setPendingReq(null) }

      // Load review stats
      try {
        const st = await reviewApi.getDeliveryPartnerStats(profileRes.data.userId)
        setStats(st.data)
      } catch {}
    } catch (err) {
      toast.error('Failed to load dashboard')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const toggleOnline = async () => {
    setTogglingStatus(true)
    try {
      if (profile?.isOnline) {
        await deliveryApi.goOffline()
        toast.success('You are now Offline')
      } else {
        await deliveryApi.goOnline()
        toast.success('You are now Online')
      }
      load()
    } finally { setTogglingStatus(false) }
  }

  const acceptOrder = async (assignmentId) => {
    setAccepting(true)
    try {
      await deliveryApi.acceptRequest(assignmentId)
      toast.success('Order accepted!')
      setPendingReq(null)
      load()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setAccepting(false) }
  }

  const rejectOrder = async (assignmentId) => {
    try {
      await deliveryApi.rejectRequest(assignmentId)
      toast('Request rejected')
      setPendingReq(null)
    } catch (e) { toast.error('Failed') }
  }

  const markDelivered = async (orderId) => {
    if (!confirm('Mark this order as delivered?')) return
    try {
      await deliveryApi.updateOrderStatus(orderId, 'DELIVERED')
      toast.success('Order marked as delivered!')
      load()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed') }
  }

  const markPickedUp = async (orderId) => {
    try {
      await deliveryApi.updateOrderStatus(orderId, 'OUT_FOR_DELIVERY')
      toast.success('Picked up!')
      load()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed') }
  }

  if (loading) return (
    <div className="page-container space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
    </div>
  )

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-orange-500 rounded-3xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm flex items-center gap-1.5">
              {new Date().getHours() < 12 ? (
                <><Sun className="w-4 h-4" /> Good morning</>
              ) : new Date().getHours() < 17 ? (
                <><CloudSun className="w-4 h-4" /> Good afternoon</>
              ) : (
                <><Moon className="w-4 h-4" /> Good evening</>
              )}
            </p>
            <h1 className="text-xl font-bold font-display mt-0.5">{user?.name}</h1>
          </div>
          <button onClick={toggleOnline} disabled={togglingStatus}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-sm transition-all ${
              profile?.isOnline
                ? 'bg-green-500 hover:bg-green-400 text-white'
                : 'bg-white/20 hover:bg-white/30 text-white border border-white/40'
            }`}>
            {togglingStatus ? <div className="spinner !w-4 !h-4 !border-2" />
              : profile?.isOnline ? <><Wifi className="w-4 h-4" /> Online</>
              : <><WifiOff className="w-4 h-4" /> Offline</>
            }
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-xl font-bold">{profile?.todayDeliveries || 0}</p>
            <p className="text-xs text-orange-100">Today</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-xl font-bold">{profile?.totalDeliveries ?? myOrders.filter(o => o.status === 'DELIVERED').length}</p>
            <p className="text-xs text-orange-100">Total</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-xl font-bold flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
              {Number(profile?.rating || 0).toFixed(1)}
            </p>
            <p className="text-xs text-orange-100">Rating</p>
          </div>
        </div>
      </div>

      {/* Pending assignment request */}
      {pendingReq && (
        <div className="card border-2 border-brand-400 bg-brand-50 animate-pulse-once">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <p className="font-bold text-gray-900">New Delivery Request!</p>
              </div>
              <p className="text-sm text-gray-700 font-medium">Order #{pendingReq.orderId}</p>
              <p className="text-sm text-gray-600">₹{pendingReq.totalAmount} · {pendingReq.paymentMethod?.replace(/_/g,' ')}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {pendingReq.deliveryAddress}
              </p>
              {pendingReq.distanceKm != null && (
                <p className="text-xs text-brand-600 font-semibold mt-1 flex items-center gap-1">
                  <Navigation className="w-3 h-3" /> ~{Number(pendingReq.distanceKm).toFixed(1)} km away
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => rejectOrder(pendingReq.id)}
              className="flex-1 btn-secondary py-2.5 text-sm">Decline</button>
            <button onClick={() => acceptOrder(pendingReq.id)} disabled={accepting}
              className="flex-1 btn-primary py-2.5 text-sm">
              {accepting ? 'Accepting...' : '✓ Accept Delivery'}
            </button>
          </div>
        </div>
      )}

      {/* Active deliveries */}
      {myOrders.length > 0 && (
        <section>
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-500" /> Active Deliveries
          </h2>
          <div className="space-y-3">
            {myOrders.map(order => (
              <div key={order.id} className="card border-l-4 border-brand-500">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">Order #{order.id}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-500" />
                      {order.deliveryAddress?.houseNumber}, {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                    </p>
                    {order.customerPhone && (
                      <a href={`tel:${order.customerPhone}`}
                        className="text-sm text-brand-600 flex items-center gap-1 mt-1 hover:underline">
                        <Phone className="w-3.5 h-3.5" /> {order.customerPhone}
                      </a>
                    )}
                    <p className="text-sm font-semibold text-gray-900 mt-1">₹{order.totalAmount}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {order.items?.slice(0, 3).map(i => (
                        <span key={i.id} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                          {i.foodItemName} ×{i.quantity}
                        </span>
                      ))}
                      {order.items?.length > 3 && <span className="text-xs text-gray-400">+{order.items.length - 3} more</span>}
                    </div>
                  </div>
                  <button onClick={() => markDelivered(order.id)}
                    className="btn-primary text-sm py-2 px-3 flex-shrink-0">
                    <CheckCircle className="w-4 h-4" /> Delivered
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Available for pickup */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-green-500" /> Available for Pickup
            {available.length > 0 && <span className="badge badge-green text-xs">{available.length}</span>}
          </h2>
          <button onClick={load} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {available.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-card">
            <p className="text-3xl mb-3">🛵</p>
            <p className="font-semibold text-gray-700">No orders ready for pickup</p>
            <p className="text-sm text-gray-500 mt-1">Stay online to receive assignments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {available.map(order => (
              <div key={order.id} className="card hover:shadow-card-hover transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">Order #{order.id}</p>
                    <p className="text-sm text-gray-600 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {order.deliveryAddress?.city}, {order.deliveryAddress?.state}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">₹{order.totalAmount}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {order.items?.slice(0, 2).map(i => (
                        <span key={i.id} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                          {i.foodItemName} ×{i.quantity}
                        </span>
                      ))}
                      {order.items?.length > 2 && <span className="text-xs text-gray-400">+{order.items.length - 2} more</span>}
                    </div>
                  </div>
                  <button onClick={() => markPickedUp(order.id)}
                    className="btn-primary text-sm py-2 px-3 flex-shrink-0">Accept</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My ratings summary */}
      {stats && Number(stats.totalReviews) > 0 && (
        <section className="card">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> My Ratings
          </h3>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-black text-amber-500">{Number(stats.averageRating).toFixed(1)}</p>
              <div className="flex gap-0.5 justify-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(stats.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{stats.totalReviews} reviews</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5,4,3,2,1].map(star => {
                const count = stats.ratingDistribution?.[star] || 0
                const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-3">{star}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                      <div className="h-1.5 bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-5 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
