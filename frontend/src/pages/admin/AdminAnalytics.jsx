import { useEffect, useState } from 'react'
import { adminApi } from '../../api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import { TrendingUp, IndianRupee, ShoppingBag, Users, Star, Bike, RefreshCw } from 'lucide-react'

const COLORS = ['#f97316','#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#ec4899']

export default function AdminAnalytics() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    adminApi.getAnalytics().then(r => setData(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="page-container">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    </div>
  )

  const kpis = [
    { icon: IndianRupee, label: 'Total Revenue',     value: `₹${Number(data?.totalRevenue || 0).toFixed(0)}`,  sub: `Today: ₹${Number(data?.todaysRevenue || 0).toFixed(0)}`,  color: 'text-green-600',  bg: 'bg-green-50' },
    { icon: ShoppingBag, label: 'Total Orders',      value: data?.totalOrders || 0,                             sub: `Today: ${data?.todaysOrders || 0}`,                        color: 'text-brand-600',  bg: 'bg-brand-50' },
    { icon: Users,       label: 'Customers',         value: data?.totalCustomers || 0,                          sub: 'Total registered',                                        color: 'text-blue-600',   bg: 'bg-blue-50' },
    { icon: ShoppingBag, label: 'Active Orders',     value: data?.activeOrders || 0,                            sub: `Pending: ${data?.pendingOrders || 0}`,                    color: 'text-amber-600',  bg: 'bg-amber-50' },
    { icon: Star,        label: 'Avg Rating',        value: `${Number(data?.averageRating || 0).toFixed(1)} ★`, sub: 'Customer satisfaction',                                   color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: IndianRupee, label: "Today's Revenue",   value: `₹${Number(data?.todaysRevenue || 0).toFixed(0)}`,  sub: 'Real-time',                                              color: 'text-rose-600',   bg: 'bg-rose-50' },
    { icon: TrendingUp,  label: 'Delivered Orders',  value: (data?.ordersByStatus?.find(s => s.status === 'DELIVERED')?.count || 0), sub: 'Total completed', color: 'text-teal-600', bg: 'bg-teal-50' },
    { icon: ShoppingBag, label: 'Cancelled Orders',  value: (data?.ordersByStatus?.find(s => s.status === 'CANCELLED')?.count || 0), sub: 'Total cancelled',  color: 'text-gray-600',  bg: 'bg-gray-50' },
  ]

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">Analytics</h1>
        <button onClick={load} className="btn-ghost text-sm"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map(k => (
          <div key={k.label} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">{k.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{k.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
              </div>
              <div className={`w-9 h-9 ${k.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <k.icon className={`w-5 h-5 ${k.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Revenue by day */}
        {data?.revenueByDay?.length > 0 && (
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-5">Revenue — Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.revenueByDay} barSize={28}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v?.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={v => [`₹${Number(v).toFixed(2)}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#f97316" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Orders by status pie */}
        {data?.ordersByStatus && (
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-5">Orders by Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.ordersByStatus.filter(s => s.count > 0)}
                     dataKey="count" nameKey="status" cx="50%" cy="50%"
                     outerRadius={80} innerRadius={40} paddingAngle={3}>
                  {data.ordersByStatus.filter(s => s.count > 0).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [v, name.replace(/_/g, ' ')]} />
                <Legend formatter={v => v.replace(/_/g, ' ')} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top food items */}
        {data?.topFoodItems?.length > 0 && (
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-5">Top Selling Items</h3>
            <div className="space-y-3">
              {data.topFoodItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-800 truncate max-w-[200px]">{item.name}</span>
                      <span className="text-gray-500 text-xs ml-2 shrink-0">{item.quantity} sold</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2 bg-brand-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (item.quantity / (data.topFoodItems[0]?.quantity || 1)) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary card */}
        <div className="card bg-gradient-to-br from-brand-500 to-orange-400 text-white">
          <h3 className="font-bold text-white mb-4">SpiceRoute Kitchen Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total Revenue',   value: `₹${Number(data?.totalRevenue || 0).toFixed(0)}` },
              { label: 'Total Orders',    value: data?.totalOrders || 0 },
              { label: 'Total Customers', value: data?.totalCustomers || 0 },
              { label: 'Avg Rating',      value: `${Number(data?.averageRating || 0).toFixed(1)} ★` },
            ].map(s => (
              <div key={s.label}>
                <p className="text-orange-100 text-xs">{s.label}</p>
                <p className="text-white text-xl font-bold mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
