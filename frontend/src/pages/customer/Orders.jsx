import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, ChevronRight, Clock, Star, AlertCircle, Bot } from 'lucide-react'
import { orderApi, reviewApi } from '../../api'
import ReviewModal from '../../components/ReviewModal'

const STATUS_COLORS = {
  PLACED: 'badge-blue', CONFIRMED: 'badge-orange', PREPARING: 'badge-orange',
  READY_FOR_PICKUP: 'badge-orange', OUT_FOR_DELIVERY: 'badge-blue',
  DELIVERED: 'badge-green', CANCELLED: 'badge-red',
}

export default function Orders() {
  const [orders,      setOrders]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [page,        setPage]        = useState(0)
  const [totalPages,  setTotalPages]  = useState(0)
  const [reviewOrder, setReviewOrder] = useState(null)
  const [existing,    setExisting]    = useState(null)

  const load = (p = 0) => {
    setLoading(true)
    orderApi.getMyOrders(p, 10)
      .then(r => { setOrders(r.data?.content || []); setTotalPages(r.data?.totalPages || 0) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(page) }, [page])

  const openReview = async (order) => {
    try {
      const res = await reviewApi.getByOrderId(order.id)
      setExisting(res.data || null)
    } catch { setExisting(null) }
    setReviewOrder(order)
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-3">
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
    </div>
  )

  if (!loading && orders.length === 0) return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
      <ShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-700">No orders yet</h2>
      <p className="text-gray-500 mt-1">Your order history will appear here</p>
      <Link to="/browse" className="btn-primary mt-6 inline-flex">Browse Menu</Link>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="section-title mb-6">My Orders</h1>

      {/* ── Failed payments banner ── */}
      {orders.some(o => o.status === 'PLACED' && o.paymentMethod === 'RAZORPAY') && (
        <Link to="/orders/failed"
          className="flex items-center gap-3 mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl hover:bg-red-100 transition-colors group">
          <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-red-700 text-sm">You have pending payments</p>
            <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
              <Bot className="w-3 h-3" /> AI Recovery Agent is ready to help you retry
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}

      <div className="space-y-3">
        {orders.map(order => (
          <div key={order.id} className="card hover:shadow-card-hover transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                {order.paymentMethod === 'CASH_ON_DELIVERY' ? '💵' : '💳'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-bold text-gray-900 text-sm">Order #{order.id}</p>
                  <span className={`${STATUS_COLORS[order.status] || 'badge-gray'} badge text-xs`}>
                    {order.status?.replace(/_/g, ' ')}
                  </span>
                  {order.hasReview && (
                    <span className="badge bg-amber-100 text-amber-700 text-xs flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-amber-500" /> Reviewed
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{order.items?.map(i => i.foodItemName).join(', ')}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="font-semibold text-gray-900">₹{order.totalAmount}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <Link to={`/orders/${order.id}`}
                  className="flex items-center gap-1 text-xs text-brand-600 font-medium hover:underline">
                  Details <ChevronRight className="w-3 h-3" />
                </Link>
                {order.status === 'DELIVERED' && !order.hasReview && (
                  <button onClick={() => openReview(order)}
                    className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg font-medium hover:bg-amber-100 transition-colors flex items-center gap-1">
                    <Star className="w-3 h-3" /> Rate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
            className="btn-secondary text-sm py-2 px-4 disabled:opacity-40">Previous</button>
          <span className="px-4 py-2 text-sm text-gray-600">{page + 1} / {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
            className="btn-secondary text-sm py-2 px-4 disabled:opacity-40">Next</button>
        </div>
      )}

      {reviewOrder && (
        <ReviewModal
          order={reviewOrder}
          existing={existing}
          onClose={() => setReviewOrder(null)}
          onSuccess={() => { setReviewOrder(null); load(page) }}
        />
      )}
    </div>
  )
}
