import { useEffect, useState } from 'react'
import {
  Bike, Wifi, WifiOff, MapPin, RefreshCw, Navigation,
  Package, Star, Users, CheckCircle, Clock, AlertCircle, UserCheck
} from 'lucide-react'
import { deliveryApi, orderApi } from '../../api'
import toast from 'react-hot-toast'

export default function AdminDelivery() {
  const [partners,  setPartners]  = useState([])
  const [orders,    setOrders]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [tab,       setTab]       = useState('partners')
  const [assigning, setAssigning] = useState(null)

  // Location-based assignment UI state
  const [nearbyMap,     setNearbyMap]     = useState({})   // orderId → [partners sorted by distance]
  const [loadingNearby, setLoadingNearby] = useState(null) // orderId currently loading nearby
  const [directAssigning, setDirectAssigning] = useState(null) // { orderId, partnerUserId }

  const load = async () => {
    setLoading(true)
    try {
      const [p, o] = await Promise.all([deliveryApi.getAllPartners(), orderApi.getActive()])
      setPartners(p.data || [])
      setOrders(o.data || [])
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const triggerAuto = async (orderId) => {
    setAssigning(orderId)
    try {
      await deliveryApi.manualAssign(orderId)
      toast.success(`Auto-assignment started for order #${orderId}`)
      setTimeout(load, 2000)
    } catch (e) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setAssigning(null) }
  }

  const loadNearby = async (orderId) => {
    setLoadingNearby(orderId)
    try {
      const res = await deliveryApi.getNearbyPartners(orderId)
      setNearbyMap(prev => ({ ...prev, [orderId]: res.data || [] }))
    } catch { toast.error('Could not load nearby partners') }
    finally { setLoadingNearby(null) }
  }

  const directAssign = async (orderId, partnerUserId) => {
    setDirectAssigning({ orderId, partnerUserId })
    try {
      await deliveryApi.assignPartner(orderId, partnerUserId)
      toast.success('Partner assigned successfully!')
      setNearbyMap(prev => { const n = { ...prev }; delete n[orderId]; return n })
      setTimeout(load, 1000)
    } catch (e) { toast.error(e.response?.data?.message || 'Assignment failed') }
    finally { setDirectAssigning(null) }
  }

  const onlineCount    = partners.filter(p => p.isOnline).length
  const offlineCount   = partners.filter(p => !p.isOnline).length
  const busyCount      = partners.filter(p => p.isOnline && !p.isAvailable).length
  const availableCount = partners.filter(p => p.isOnline && p.isAvailable).length
  const readyOrders    = orders.filter(o => o.status === 'READY_FOR_PICKUP' && !o.deliveryPartnerId)

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title flex items-center gap-2">
          <Bike className="w-6 h-6 text-brand-500" /> Delivery Management
        </h1>
        <button onClick={load} className="btn-ghost text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total Partners', value: partners.length,    color: 'text-gray-900',  bg: 'bg-gray-50' },
          { label: 'Online',         value: onlineCount,        color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Offline',        value: offlineCount,       color: 'text-gray-500',  bg: 'bg-gray-50' },
          { label: 'On Delivery',    value: busyCount,          color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Available',      value: availableCount,     color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: 'Need Partner',   value: readyOrders.length, color: 'text-red-600',   bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-3`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {[
          { key: 'partners', label: 'Partners' },
          { key: 'orders',   label: 'Orders', badge: readyOrders.length },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              tab === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
            {t.badge > 0 && <span className="badge bg-red-100 text-red-600 text-xs">{t.badge}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : tab === 'partners' ? (

        /* ── Partners grid ── */
        <div>
          {partners.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              No delivery partners registered yet.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {partners.map(p => (
                <div key={p.id} className="card hover:shadow-card-hover transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                      p.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                        <span className={`badge text-xs flex items-center gap-0.5 ${p.isOnline ? 'badge-green' : 'badge-gray'}`}>
                          {p.isOnline ? <><Wifi className="w-3 h-3" /> Online</> : <><WifiOff className="w-3 h-3" /> Offline</>}
                        </span>
                        {p.isOnline && !p.isAvailable && (
                          <span className="badge bg-amber-100 text-amber-700 text-xs">On Delivery</span>
                        )}
                        {p.isOnline && p.isAvailable && (
                          <span className="badge bg-brand-100 text-brand-700 text-xs">Available</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{p.phone || 'No phone'}</p>
                      {p.vehicleType && (
                        <p className="text-xs text-gray-400">{p.vehicleType} · {p.vehicleNumber || '—'}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {Number(p.rating || 0).toFixed(1)}</span>
                        <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {p.totalDeliveries} total</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {p.todayDeliveries} today</span>
                      </div>
                      {p.currentLatitude && p.currentLongitude && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-brand-400" />
                          {Number(p.currentLatitude).toFixed(4)}, {Number(p.currentLongitude).toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      ) : (

        /* ── Orders needing assignment ── */
        <div className="space-y-4">
          {readyOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <CheckCircle className="w-12 h-12 text-green-200 mx-auto mb-3" />
              <p className="font-semibold">All orders assigned!</p>
              <p className="text-sm mt-1">No orders waiting for a delivery partner.</p>
            </div>
          ) : readyOrders.map(o => (
            <div key={o.id} className="card border-l-4 border-amber-400 space-y-3">
              {/* Order summary */}
              <div className="flex items-start gap-3 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900">Order #{o.id}</span>
                    <span className="badge badge-orange text-xs">Ready for Pickup</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {o.customerName} · ₹{o.totalAmount} · {o.paymentMethod?.replace(/_/g,' ')}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {o.deliveryAddress?.houseNumber}, {o.deliveryAddress?.street}, {o.deliveryAddress?.city}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => nearbyMap[o.id] ? setNearbyMap(p => { const n={...p}; delete n[o.id]; return n }) : loadNearby(o.id)}
                    disabled={loadingNearby === o.id}
                    className="btn-secondary text-xs py-2 px-3">
                    {loadingNearby === o.id ? 'Loading...' : nearbyMap[o.id] ? 'Hide Partners' : '📍 Show Nearby'}
                  </button>
                  <button onClick={() => triggerAuto(o.id)} disabled={assigning === o.id}
                    className="btn-primary text-xs py-2 px-3">
                    {assigning === o.id ? 'Finding...' : '🤖 Auto Assign'}
                  </button>
                </div>
              </div>

              {/* ── Location-based partner recommendations ── */}
              {nearbyMap[o.id] && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-brand-500" />
                    Nearby Available Partners (sorted by distance)
                  </p>
                  {nearbyMap[o.id].length === 0 ? (
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                      <AlertCircle className="w-4 h-4" />
                      No available partners online right now. Partners must be online and available.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {nearbyMap[o.id].slice(0, 5).map((p, idx) => (
                        <div key={p.id}
                          className={`flex items-center justify-between gap-3 p-2.5 rounded-lg border bg-white ${
                            idx === 0 ? 'border-green-300 bg-green-50/50' : 'border-gray-100'
                          }`}>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {idx === 0 && (
                              <span className="badge bg-green-100 text-green-700 text-xs flex-shrink-0">Recommended</span>
                            )}
                            <div className="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {p.name?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="flex items-center gap-0.5">
                                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {Number(p.rating || 0).toFixed(1)}
                                </span>
                                {p.vehicleType && <span>{p.vehicleType}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-brand-600">
                              {p.distanceKm != null ? `${p.distanceKm.toFixed(1)} km` : 'Unknown dist.'}
                            </p>
                            <button
                              onClick={() => directAssign(o.id, p.userId)}
                              disabled={directAssigning?.orderId === o.id && directAssigning?.partnerUserId === p.userId}
                              className="mt-1 btn-primary text-xs py-1 px-3">
                              {directAssigning?.orderId === o.id && directAssigning?.partnerUserId === p.userId
                                ? 'Assigning...' : 'Assign'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Active orders section */}
          {orders.filter(o => o.status !== 'READY_FOR_PICKUP' || o.deliveryPartnerId).length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Bike className="w-4 h-4 text-brand-500" /> All Active Orders
              </h3>
              <div className="space-y-2">
                {orders.filter(o => o.status !== 'READY_FOR_PICKUP' || o.deliveryPartnerId).map(o => (
                  <div key={o.id} className="card flex items-center gap-3 py-3 opacity-80">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">Order #{o.id}</span>
                        <span className="badge badge-blue text-xs">{o.status?.replace(/_/g, ' ')}</span>
                      </div>
                      <p className="text-xs text-gray-500">{o.customerName}</p>
                    </div>
                    {o.deliveryPartnerName && (
                      <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <UserCheck className="w-3.5 h-3.5" /> {o.deliveryPartnerName}
                      </div>
                    )}
                    <span className="font-bold text-gray-900 text-sm">₹{o.totalAmount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
