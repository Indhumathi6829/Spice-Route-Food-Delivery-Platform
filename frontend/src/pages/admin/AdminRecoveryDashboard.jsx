import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Bot, TrendingUp, IndianRupee, RefreshCw, CheckCircle2,
  BarChart2, ArrowRight, Loader2, AlertCircle, Database,
  Zap, Clock, XCircle, AlertTriangle, Eye, Flag, CheckSquare
} from 'lucide-react'
import { recoveryApi } from '../../api'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  RECOVERED:   'bg-green-100 text-green-700',
  IN_PROGRESS: 'bg-blue-100  text-blue-700',
  PENDING:     'bg-amber-100 text-amber-700',
  FAILED:      'bg-red-100   text-red-700',
  CANCELLED:   'bg-gray-100  text-gray-500',
  EXPIRED:     'bg-gray-100  text-gray-400',
}

const STRATEGY_LABELS = {
  PAYMENT_RETRY:              'Payment Retry',
  ALTERNATIVE_PAYMENT_METHOD: 'Alt. Method',
  ABANDONED_CART_RECOVERY:    'Cart Recovery',
  GRACEFUL_STOP:              'Stopped',
}

const FILTER_TABS = [
  { key: 'ALL',          label: 'All',          color: 'text-gray-600'   },
  { key: 'IN_PROGRESS',  label: 'In Progress',  color: 'text-blue-600'   },
  { key: 'PENDING',      label: 'Pending',      color: 'text-amber-600'  },
  { key: 'RECOVERED',    label: 'Recovered',    color: 'text-green-600'  },
  { key: 'FAILED',       label: 'Failed',       color: 'text-red-600'    },
  { key: 'CANCELLED',    label: 'Cancelled',    color: 'text-gray-500'   },
]

function MetricCard({ icon: Icon, label, value, sub, color, bg, pulse }) {
  return (
    <div className={`card transition-all ${pulse ? 'ring-2 ring-brand-300 ring-offset-1' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  )
}

export default function AdminRecoveryDashboard() {
  const [data,       setData]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [seeding,    setSeeding]    = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [pulse,      setPulse]      = useState(false)
  const [filter,     setFilter]     = useState('ALL')
  const [actionId,   setActionId]   = useState(null) // attemptId being actioned

  const load = useCallback((silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    recoveryApi.getDashboard()
      .then(r => {
        setData(prev => {
          if (prev && (
            prev.successfulRecoveries !== r.data.successfulRecoveries ||
            prev.totalRecoveryAttempts !== r.data.totalRecoveryAttempts
          )) {
            setPulse(true)
            setTimeout(() => setPulse(false), 2500)
          }
          return r.data
        })
        setLastUpdate(new Date())
      })
      .catch(e => { if (!silent) setError(e.response?.data?.message || 'Failed to load') })
      .finally(() => { if (!silent) setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const iv = setInterval(() => load(true), 5000)
    return () => clearInterval(iv)
  }, [load])

  const handleSeedDemo = async () => {
    if (!confirm('Create 8 sample recovery scenarios for demo? This can be run multiple times.')) return
    setSeeding(true)
    try {
      const { data: r } = await recoveryApi.seedDemo()
      toast.success(`${r.created} demo scenarios created!`)
      load()
    } catch (e) { toast.error(e.response?.data?.message || 'Seeding failed') }
    finally { setSeeding(false) }
  }

  const handleMarkReview = async (attemptId) => {
    setActionId(attemptId)
    try {
      await recoveryApi.markReview(attemptId, '')
      toast.success('Marked for manual review')
      load(true)
    } catch (e) { toast.error(e.response?.data?.message || 'Action failed') }
    finally { setActionId(null) }
  }

  const handleResolve = async (attemptId) => {
    if (!confirm('Resolve this case operationally? Payment will NOT be marked as paid.')) return
    setActionId(attemptId)
    try {
      await recoveryApi.resolveCase(attemptId, '')
      toast.success('Case resolved operationally')
      load(true)
    } catch (e) { toast.error(e.response?.data?.message || 'Action failed') }
    finally { setActionId(null) }
  }

  if (loading && !data) return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="skeleton h-5 w-48 rounded" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  )

  if (error && !data) return (
    <div className="page-container">
      <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-200 rounded-2xl">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <div>
          <p className="font-semibold text-red-700">Could not load recovery data</p>
          <p className="text-sm text-red-600 mt-0.5">{error}</p>
        </div>
        <button onClick={() => load()} className="ml-auto btn-secondary text-sm py-1.5">Retry</button>
      </div>
    </div>
  )

  const rate = Math.min(100, Math.max(0, data?.recoveryRate || 0))

  const statusMetrics = [
    { icon: CheckCircle2,  label: 'Recovered',   value: data?.successfulRecoveries || 0, color: 'text-green-600', bg: 'bg-green-50',  pulse },
    { icon: RefreshCw,     label: 'In Progress', value: data?.inProgressCount || 0,      color: 'text-blue-600',  bg: 'bg-blue-50'   },
    { icon: Clock,         label: 'Pending',     value: data?.pendingCount || 0,          color: 'text-amber-600', bg: 'bg-amber-50'  },
    { icon: XCircle,       label: 'Failed',      value: data?.failedCount || 0,           color: 'text-red-600',   bg: 'bg-red-50'    },
  ]

  const filtered = (data?.recentAttempts || []).filter(a =>
    filter === 'ALL' || a.status === filter
  )

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="section-title mb-0">AI Revenue Recovery</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs text-gray-500">
                Live · auto-refreshes every 5s
                {lastUpdate && <span className="ml-2 text-gray-400">· {lastUpdate.toLocaleTimeString()}</span>}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSeedDemo}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-sm font-medium hover:bg-purple-100 transition-colors disabled:opacity-60"
          >
            {seeding ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Seeding...</> : <><Database className="w-3.5 h-3.5" /> Seed Demo</>}
          </button>
          <button onClick={() => load()} disabled={loading} className="btn-secondary text-sm py-2 flex items-center gap-1.5 disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Revenue cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <MetricCard icon={IndianRupee} label="Potential Lost Revenue"
          value={`₹${Number(data?.potentialLostRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          sub="Total across all failed payments" color="text-red-600" bg="bg-red-50" />
        <MetricCard icon={CheckCircle2} label="Recovered Revenue"
          value={`₹${Number(data?.recoveredRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          sub={`Avg ₹${Number(data?.averageRecoveredValue || 0).toFixed(0)} per order`}
          color="text-green-600" bg="bg-green-50" pulse={pulse} />
        <MetricCard icon={TrendingUp} label="Recovery Rate"
          value={`${Number(data?.recoveryRate || 0).toFixed(1)}%`}
          sub={`${data?.successfulRecoveries || 0} of ${data?.totalRecoveryAttempts || 0} attempts`}
          color="text-brand-600" bg="bg-brand-50" pulse={pulse} />
      </div>

      {/* ── Status breakdown ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statusMetrics.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* ── Recovery rate bar ── */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-brand-500" />
            <h3 className="font-bold text-gray-900">Recovery Rate</h3>
            {pulse && (
              <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-medium flex items-center gap-1">
                <Zap className="w-3 h-3" /> Updated
              </span>
            )}
          </div>
          <span className="text-2xl font-bold text-brand-600">{rate.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-brand-500 to-orange-400 rounded-full transition-all duration-700"
            style={{ width: `${rate}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1.5">
          <span>0%</span>
          <span>{data?.successfulRecoveries || 0} recovered / {data?.totalRecoveryAttempts || 0} total</span>
          <span>100%</span>
        </div>
      </div>

      {/* ── Filter tabs + table ── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            Recovery Cases
            <span className="text-xs text-gray-400 font-normal">({filtered.length} shown)</span>
          </h3>
          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === tab.key
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.key !== 'ALL' && data && (
                  <span className={`ml-1 ${tab.color}`}>
                    {tab.key === 'RECOVERED'   ? (data.successfulRecoveries || 0) :
                     tab.key === 'IN_PROGRESS' ? (data.inProgressCount || 0) :
                     tab.key === 'PENDING'     ? (data.pendingCount || 0) :
                     tab.key === 'FAILED'      ? (data.failedCount || 0) :
                     tab.key === 'CANCELLED'   ? (data.cancelledCount || 0) : ''}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {!filtered.length ? (
          <div className="py-12 text-center text-gray-400">
            <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">
              {filter === 'ALL' ? 'No recovery cases yet' : `No ${filter.toLowerCase().replace('_', ' ')} cases`}
            </p>
            {filter === 'ALL' && (
              <button onClick={handleSeedDemo} disabled={seeding}
                className="btn-secondary text-sm flex items-center gap-2 mx-auto mt-4">
                <Database className="w-4 h-4" />
                {seeding ? 'Creating...' : 'Seed Demo Scenarios'}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500">
                  <th className="text-left pb-3 font-medium">Order</th>
                  <th className="text-left pb-3 font-medium">Customer</th>
                  <th className="text-left pb-3 font-medium">Amount</th>
                  <th className="text-left pb-3 font-medium">Failure Reason</th>
                  <th className="text-left pb-3 font-medium">Strategy</th>
                  <th className="text-left pb-3 font-medium">Probability</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(a => (
                  <tr key={a.attemptId} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-mono text-brand-600 font-semibold">#{a.orderId}</td>
                    <td className="py-3 text-gray-700 max-w-[100px] truncate">{a.customerName}</td>
                    <td className="py-3 font-semibold text-gray-900">₹{Number(a.amount || 0).toFixed(0)}</td>
                    <td className="py-3 text-xs text-gray-500 max-w-[120px] truncate" title={a.failureReason || '-'}>
                      {a.failureReason || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-3 text-gray-500 text-xs">{STRATEGY_LABELS[a.strategy] || a.strategy}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-1.5 bg-brand-500 rounded-full transition-all"
                            style={{ width: `${Math.round((a.probability || 0) * 100)}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{Math.round((a.probability || 0) * 100)}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[a.status] || 'bg-gray-100 text-gray-500'}`}>
                        {a.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-gray-400 whitespace-nowrap">{a.createdAt}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        {/* View detail */}
                        <Link to={`/admin/recovery/${a.orderId}`}
                          className="p-1.5 rounded-lg hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors" title="View detail">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        {/* Mark review — only for active cases */}
                        {(a.status === 'IN_PROGRESS' || a.status === 'PENDING') && (
                          <button
                            onClick={() => handleMarkReview(a.attemptId)}
                            disabled={actionId === a.attemptId}
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors disabled:opacity-50"
                            title="Mark for review"
                          >
                            {actionId === a.attemptId
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Flag className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        {/* Resolve — only for non-recovered active cases */}
                        {a.status !== 'RECOVERED' && a.status !== 'EXPIRED' && (
                          <button
                            onClick={() => handleResolve(a.attemptId)}
                            disabled={actionId === a.attemptId}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                            title="Resolve (close without payment)"
                          >
                            {actionId === a.attemptId
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <CheckSquare className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
