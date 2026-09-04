import { useEffect, useState } from 'react'
import { RefreshCw, Search } from 'lucide-react'
import { orderApi, adminApi } from '../../api'
import toast from 'react-hot-toast'

const STATUS_FLOW = {
  PLACED: 'CONFIRMED', CONFIRMED: 'PREPARING', PREPARING: 'READY_FOR_PICKUP',
}
const STATUS_COLORS = {
  PLACED: 'badge-blue', CONFIRMED: 'badge-orange', PREPARING: 'badge-orange',
  READY_FOR_PICKUP: 'badge-orange', OUT_FOR_DELIVERY: 'badge-blue',
  DELIVERED: 'badge-green', CANCELLED: 'badge-red',
}

export default function AdminOrders() {
  const [orders,   setOrders]   = useState([])
  const [partners, setPartners] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([orderApi.getActive(), adminApi.getDeliveryPartners()])
      .then(([o, p]) => { setOrders(o.data); setPartners(p.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const advance = async (orderId, status) => {
    try {
      await orderApi.updateStatus(orderId, status)
      toast.success(`Order updated to ${status.replace(/_/g,' ')}`)
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update status')
    }
  }

  const assign = async (orderId, partnerId) => {
    try {
      await orderApi.assignDelivery(orderId, partnerId)
      toast.success('Delivery partner assigned!')
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to assign')
    }
  }

  const cancel = async (orderId) => {
    if (!confirm('Cancel this order?')) return
    try {
      await orderApi.updateStatus(orderId, 'CANCELLED')
      toast.success('Order cancelled')
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Cannot cancel')
    }
  }

  const filtered = orders.filter(o =>
    !search || o.id.toString().includes(search) || o.customerName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">Active Orders</h1>
        <button onClick={load} className="btn-ghost text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input className="input pl-9" placeholder="Search order ID or customer..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎉</p>
          <h3 className="text-lg font-semibold text-gray-700">No active orders</h3>
          <p className="text-gray-500 mt-1">All orders are fulfilled!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <div key={order.id} className="card">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900">Order #{order.id}</h3>
                    <span className={`badge ${STATUS_COLORS[order.status]}`}>{order.status?.replace(/_/g,' ')}</span>
                    <span className="badge badge-gray">{order.paymentMethod?.replace(/_/g,' ')}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>{order.customerName}</strong> · {order.deliveryAddress?.city}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.placedAt).toLocaleString('en-IN')}
                  </p>
                </div>
                <p className="font-bold text-xl text-gray-900">₹{order.totalAmount}</p>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-gray-600">
                {order.items?.map(i => <span key={i.id} className="bg-gray-100 px-2 py-1 rounded-lg">{i.foodItemName} ×{i.quantity}</span>)}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {STATUS_FLOW[order.status] && (
                  <button onClick={() => advance(order.id, STATUS_FLOW[order.status])}
                    className="btn-primary text-sm py-1.5 px-4">
                    → {STATUS_FLOW[order.status]?.replace(/_/g,' ')}
                  </button>
                )}
                {order.status === 'READY_FOR_PICKUP' && !order.deliveryPartnerId && (
                  <select onChange={e => e.target.value && assign(order.id, e.target.value)}
                    className="input py-1.5 text-sm w-auto">
                    <option value="">Assign delivery partner</option>
                    {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                )}
                {(order.status === 'PLACED' || order.status === 'CONFIRMED') && (
                  <button onClick={() => cancel(order.id)} className="btn-secondary text-sm py-1.5 px-4 border-red-300 text-red-600 hover:bg-red-50">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
