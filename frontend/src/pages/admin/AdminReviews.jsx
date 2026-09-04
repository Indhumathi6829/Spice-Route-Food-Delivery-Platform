import { useEffect, useState } from 'react'
import { Star, MessageSquare, CheckCircle, XCircle, Bike, Search, Filter } from 'lucide-react'
import { reviewApi } from '../../api'
import toast from 'react-hot-toast'

export default function AdminReviews() {
  const [reviews,  setReviews]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [page,     setPage]     = useState(0)
  const [total,    setTotal]    = useState(0)
  const [filter,   setFilter]   = useState('ALL')  // ALL | APPROVED | HIDDEN

  const load = (p = 0) => {
    setLoading(true)
    reviewApi.getAllAdmin(p, 20)
      .then(r => { setReviews(r.data?.content || []); setTotal(r.data?.totalElements || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const toggle = async (id) => {
    try {
      await reviewApi.toggleApproval(id)
      toast.success('Review status updated')
      load(page)
    } catch { toast.error('Failed') }
  }

  const displayed = filter === 'ALL' ? reviews
    : filter === 'APPROVED' ? reviews.filter(r => r.approved)
    : reviews.filter(r => !r.approved)

  const approvedCount = reviews.filter(r => r.approved).length
  const hiddenCount   = reviews.filter(r => !r.approved).length

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-brand-500" /> Customer Reviews
        </h1>
        <p className="text-sm text-gray-500">{total} total reviews</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
          <p className="text-xs text-gray-500 mt-1">Loaded</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4">
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
          <p className="text-xs text-gray-500 mt-1">Approved</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-4">
          <p className="text-2xl font-bold text-red-500">{hiddenCount}</p>
          <p className="text-xs text-gray-500 mt-1">Hidden</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {['ALL', 'APPROVED', 'HIDDEN'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              filter === f ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No reviews found.</div>
      ) : (
        <div className="space-y-3">
          {displayed.map(r => (
            <div key={r.id} className={`card transition-opacity ${!r.approved ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center font-bold text-brand-600 flex-shrink-0">
                  {r.customerName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{r.customerName}</p>
                      <p className="text-xs text-gray-400">Order #{r.orderId}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`badge text-xs ${r.approved ? 'badge-green' : 'badge-red'}`}>
                        {r.approved ? 'Approved' : 'Hidden'}
                      </span>
                      <button onClick={() => toggle(r.id)}
                        className={`p-1.5 rounded-lg transition-colors text-xs ${r.approved ? 'hover:bg-red-50 text-red-400' : 'hover:bg-green-50 text-green-500'}`}
                        title={r.approved ? 'Hide review' : 'Approve review'}>
                        {r.approved ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Food rating */}
                  <div className="flex items-center gap-1 mt-1.5">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.foodRating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">Food</span>
                    {r.deliveryRating && (
                      <>
                        <div className="flex gap-0.5 ml-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < r.deliveryRating ? 'fill-blue-400 text-blue-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-1">Delivery</span>
                      </>
                    )}
                  </div>

                  {r.deliveryPartnerName && (
                    <p className="text-xs text-blue-500 flex items-center gap-1 mt-0.5">
                      <Bike className="w-3 h-3" /> {r.deliveryPartnerName}
                    </p>
                  )}
                  {r.comment && <p className="text-sm text-gray-600 mt-1 italic">"{r.comment}"</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-6">
        <button disabled={page === 0} onClick={() => { const p = page - 1; setPage(p); load(p) }}
          className="btn-secondary text-sm py-2 px-4 disabled:opacity-40">Previous</button>
        <button disabled={displayed.length < 20} onClick={() => { const p = page + 1; setPage(p); load(p) }}
          className="btn-secondary text-sm py-2 px-4 disabled:opacity-40">Next</button>
      </div>
    </div>
  )
}
