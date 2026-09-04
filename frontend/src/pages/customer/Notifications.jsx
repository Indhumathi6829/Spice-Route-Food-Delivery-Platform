import { useEffect, useState } from 'react'
import { Bell, ShoppingBag, Tag, Star, Settings, CheckCheck, Package, Bike, AlertCircle } from 'lucide-react'
import { notificationApi } from '../../api'
import toast from 'react-hot-toast'

const TYPE_CONFIG = {
  ORDER_UPDATE:  { icon: ShoppingBag, color: 'text-brand-500',  bg: 'bg-brand-50'  },
  PAYMENT:       { icon: Tag,         color: 'text-green-500',  bg: 'bg-green-50'  },
  REVIEW:        { icon: Star,        color: 'text-amber-500',  bg: 'bg-amber-50'  },
  OFFER:         { icon: Tag,         color: 'text-purple-500', bg: 'bg-purple-50' },
  DELIVERY:      { icon: Bike,        color: 'text-blue-500',   bg: 'bg-blue-50'   },
  SYSTEM:        { icon: Settings,    color: 'text-gray-500',   bg: 'bg-gray-50'   },
  DEFAULT:       { icon: Bell,        color: 'text-gray-500',   bg: 'bg-gray-100'  },
}

const FILTERS = ['ALL', 'ORDER_UPDATE', 'OFFER', 'REVIEW', 'SYSTEM']

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60)     return 'Just now'
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [unread,        setUnread]        = useState(0)
  const [loading,       setLoading]       = useState(true)
  const [filter,        setFilter]        = useState('ALL')
  const [page,          setPage]          = useState(0)
  const [totalPages,    setTotalPages]    = useState(0)

  const load = (p = 0) => {
    setLoading(true)
    notificationApi.getAll(p, 20)
      .then(r => {
        setNotifications(r.data?.content || [])
        setTotalPages(r.data?.totalPages || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    notificationApi.unreadCount().then(r => setUnread(r.data || 0)).catch(() => {})
  }

  useEffect(() => { load() }, [])

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnread(0)
      toast.success('All marked as read')
    } catch {}
  }

  const markOne = async (id) => {
    try {
      await notificationApi.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setUnread(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const filtered = filter === 'ALL' ? notifications
    : notifications.filter(n => n.type === filter)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-900" />
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </div>
          <h1 className="section-title">Notifications</h1>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs text-brand-600 font-medium hover:underline">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              filter === f ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-400'
            }`}>
            {f === 'ALL' ? 'All' : f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-14 h-14 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-600">No notifications</p>
          <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.DEFAULT
            const Icon = cfg.icon
            return (
              <div key={n.id}
                onClick={() => !n.read && markOne(n.id)}
                className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                  n.read
                    ? 'bg-white border-gray-100 hover:border-gray-200'
                    : 'bg-brand-50/40 border-brand-100 hover:border-brand-200'
                }`}>
                <div className={`w-9 h-9 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <div className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0 mt-1.5" />}
              </div>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 0} onClick={() => { setPage(p => p - 1); load(page - 1) }}
            className="btn-secondary text-sm py-2 px-4 disabled:opacity-40">Previous</button>
          <span className="px-4 py-2 text-sm text-gray-600">{page + 1} / {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); load(page + 1) }}
            className="btn-secondary text-sm py-2 px-4 disabled:opacity-40">Next</button>
        </div>
      )}

    </div>
  )
}
