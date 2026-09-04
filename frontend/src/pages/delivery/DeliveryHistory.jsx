import { useEffect, useState } from 'react'
import { Package, Star, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react'
import { deliveryApi, reviewApi } from '../../api'
import { useAuth } from '../../context/AuthContext'

export default function DeliveryHistory() {
  const { user }                    = useAuth()
  const [orders,  setOrders]        = useState([])
  const [reviews, setReviews]       = useState([])
  const [stats,   setStats]         = useState(null)
  const [tab,     setTab]           = useState('history')
  const [loading, setLoading]       = useState(true)
  const [profile, setProfile]       = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [profileRes, ordersRes] = await Promise.all([
          deliveryApi.getProfile(),
          deliveryApi.getMyOrders(),
        ])
        setProfile(profileRes.data)
        setOrders(ordersRes.data || [])

        const [statsRes, reviewsRes] = await Promise.all([
          reviewApi.getDeliveryPartnerStats(profileRes.data.userId),
          reviewApi.getDeliveryPartnerReviews(profileRes.data.userId, 0, 20),
        ])
        setStats(statsRes.data)
        setReviews(reviewsRes.data?.content || [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const delivered  = orders.filter(o => o.status === 'DELIVERED')
  const cancelled  = orders.filter(o => o.status === 'CANCELLED')

  const STATUS_COLORS = {
    DELIVERED: 'badge-green',
    CANCELLED: 'badge-red',
    OUT_FOR_DELIVERY: 'badge-blue',
  }

  if (loading) return (
    <div className="page-container space-y-3">
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
    </div>
  )

  return (
    <div className="page-container">
      {/* Header stats */}
      <div className="bg-gradient-to-r from-brand-600 to-orange-500 rounded-3xl p-5 text-white mb-6">
        <h1 className="text-xl font-bold font-display mb-3">My Performance</h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{orders.length}</p>
            <p className="text-xs text-orange-100">Total Deliveries</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{delivered.length}</p>
            <p className="text-xs text-orange-100">Completed</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
              {Number(profile?.rating || 0).toFixed(1)}
            </p>
            <p className="text-xs text-orange-100">Avg Rating</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{stats?.totalReviews || 0}</p>
            <p className="text-xs text-orange-100">Reviews</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
        {[
          { key: 'history', label: 'Delivery History' },
          { key: 'reviews', label: 'My Reviews' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'history' ? (
        <div>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-14 h-14 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">No delivery history yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(o => (
                <div key={o.id} className="card flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    o.status === 'DELIVERED' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {o.status === 'DELIVERED'
                      ? <CheckCircle className="w-5 h-5 text-green-600" />
                      : <XCircle className="w-5 h-5 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm">Order #{o.id}</p>
                      <span className={`badge text-xs ${STATUS_COLORS[o.status] || 'badge-gray'}`}>
                        {o.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{o.customerName} · ₹{o.totalAmount}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {o.placedAt ? new Date(o.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Rating distribution */}
          {stats && Number(stats.totalReviews) > 0 && (
            <div className="card mb-5">
              <div className="flex items-center gap-6">
                <div className="text-center flex-shrink-0">
                  <p className="text-5xl font-black text-amber-500">{Number(stats.averageRating).toFixed(1)}</p>
                  <div className="flex gap-0.5 justify-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(stats.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{stats.totalReviews} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5,4,3,2,1].map(star => {
                    const count = stats.ratingDistribution?.[star] || 0
                    const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-3">{star}</span>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full">
                          <div className="h-2 bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-5 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-14 h-14 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">No reviews yet. Complete deliveries to earn ratings!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="card">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {r.customerName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{r.customerName}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < r.deliveryRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                        ))}
                        <span className="text-xs text-gray-400 ml-1">{r.deliveryRating}/5</span>
                      </div>
                      {r.comment && <p className="text-sm text-gray-600 mt-1 italic">"{r.comment}"</p>}
                      <p className="text-xs text-gray-400 mt-1">Order #{r.orderId} · {new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
