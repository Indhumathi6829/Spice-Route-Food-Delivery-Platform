import { useEffect, useState } from 'react'
import {
  TrendingUp, ShoppingBag, Users, Clock, Star, IndianRupee,
  Bike, Tag, RefreshCw, ArrowRight, Store, BarChart2,
  Gift, LayoutDashboard, Package, Wifi, LayoutGrid, Bot
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const PIE_COLORS = ['#f97316','#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#ec4899']

function StatCard({ icon: Icon, label, value, sub, color, bg, to }) {
  const content = (
    <div className="card hover:shadow-card-hover transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      {to && <div className="mt-3 text-xs text-brand-500 font-medium flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></div>}
    </div>
  )
  return to ? <Link to={to}>{content}</Link> : content
}

export default function AdminDashboard() {
  const { user }    = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loading,   setLoading]   = useState(true)

  const load = () => {
    setLoading(true)
    adminApi.getAnalytics()
      .then(r => setAnalytics(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return { text: 'Good morning', Icon: () => <span className="text-2xl">☀️</span> }
    if (h < 17) return { text: 'Good afternoon', Icon: () => <span className="text-2xl">🌤️</span> }
    return { text: 'Good evening', Icon: () => <span className="text-2xl">🌙</span> }
  }

  if (loading) return (
    <div className="page-container">
      <div className="skeleton h-16 w-72 rounded-2xl mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    </div>
  )

  const stats = [
    { icon: IndianRupee, label: 'Total Revenue',     value: `₹${Number(analytics?.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: `Today: ₹${Number(analytics?.todaysRevenue || 0).toFixed(0)}`, color: 'text-green-600', bg: 'bg-green-50', to: '/admin/analytics' },
    { icon: ShoppingBag, label: 'Total Orders',      value: analytics?.totalOrders || 0,    sub: `Today: ${analytics?.todaysOrders || 0}`,                   color: 'text-brand-600', bg: 'bg-brand-50',  to: '/admin/orders' },
    { icon: Users,       label: 'Customers',         value: analytics?.totalCustomers || 0, sub: 'Registered',                                               color: 'text-blue-600',   bg: 'bg-blue-50',   to: '/admin/customers' },
    { icon: Clock,       label: 'Active Orders',     value: analytics?.activeOrders || 0,   sub: `Pending: ${analytics?.pendingOrders || 0}`,                color: 'text-amber-600',  bg: 'bg-amber-50',  to: '/admin/orders' },
    { icon: Star,        label: 'Avg Rating',        value: `${Number(analytics?.averageRating || 0).toFixed(1)} ★`, sub: 'Customer satisfaction',           color: 'text-purple-600', bg: 'bg-purple-50', to: '/admin/reviews' },
    { icon: Bike,        label: 'Delivery Partners', value: analytics?.totalDeliveryPartners || 0, sub: `Online: ${analytics?.onlineDeliveryPartners || 0}`, color: 'text-rose-600',   bg: 'bg-rose-50',   to: '/admin/delivery' },
  ]

  const quickLinks = [
    { label: 'Manage Menu',     to: '/admin/menu',            Icon: Store         },
    { label: 'View Orders',     to: '/admin/orders',          Icon: ShoppingBag   },
    { label: 'Categories',      to: '/admin/categories',      Icon: LayoutGrid    },
    { label: 'Delivery Mgmt',   to: '/admin/delivery',        Icon: Bike          },
    { label: 'Festival Offers', to: '/admin/festival-offers', Icon: Gift          },
    { label: 'Coupons',         to: '/admin/coupons',         Icon: Tag           },
    { label: 'Analytics',       to: '/admin/analytics',       Icon: BarChart2     },
    { label: 'AI Recovery',     to: '/admin/recovery',        Icon: Bot           },
  ]

  return (
    <div className="page-container">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-gray-900 flex items-center gap-2">
          {(() => {
            const g = greeting()
            return (
              <>
                {g.text}, {user?.name?.split(' ')[0]}
                <g.Icon />
              </>
            )
          })()}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening at SpiceRoute Kitchen.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-8">
        {quickLinks.map(q => (
          <Link key={q.label} to={q.to}
            className="bg-white rounded-2xl p-3 shadow-card hover:shadow-card-hover transition-all text-center group">
            <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-1.5 group-hover:bg-brand-100 transition-colors">
              <q.Icon className="w-5 h-5 text-brand-500" />
            </div>
            <p className="text-xs font-medium text-gray-700 group-hover:text-brand-600 transition-colors leading-tight">{q.label}</p>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {analytics?.revenueByDay?.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Revenue — Last 7 Days</h3>
              <Link to="/admin/analytics" className="text-xs text-brand-500 hover:underline flex items-center gap-1">
                Full report <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.revenueByDay}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={v => [`₹${v}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#f97316" radius={[5,5,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {analytics?.topFoodItems?.length > 0 && (
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Top Selling Items</h3>
            <div className="space-y-3">
              {analytics.topFoodItems.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-800 truncate">{item.name}</span>
                      <span className="text-gray-400 text-xs ml-2 flex-shrink-0">{item.quantity} sold</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className="h-1.5 bg-gradient-to-r from-brand-500 to-orange-400 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (item.quantity / (analytics.topFoodItems[0]?.quantity || 1)) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {analytics?.ordersByStatus && (
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Orders by Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={analytics.ordersByStatus.filter(s => s.count > 0)}
                  dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {analytics.ordersByStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend formatter={v => v?.replace(/_/g, ' ')} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Delivery partner summary */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Delivery Overview</h3>
            <Link to="/admin/delivery" className="text-xs text-brand-500 hover:underline flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Partners', val: analytics?.totalDeliveryPartners || 0, Icon: Users, color: 'text-gray-600', bg: 'bg-gray-100' },
              { label: 'Online Now',     val: analytics?.onlineDeliveryPartners || 0, Icon: Wifi, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Active Orders',  val: analytics?.activeOrders || 0,           Icon: Package, color: 'text-brand-600', bg: 'bg-brand-50' },
              { label: 'Avg Delivery Rating', val: `${Number(analytics?.averageDeliveryRating || 0).toFixed(1)}`, Icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 ${s.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <s.Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <p className="font-bold text-gray-900">{s.val}</p>
                </div>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
