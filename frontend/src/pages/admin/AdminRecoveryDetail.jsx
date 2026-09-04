import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Bot, ArrowLeft, CheckCircle2, XCircle, RefreshCw,
  TrendingUp, IndianRupee, MessageSquare, Loader2,
  ChevronDown, ChevronUp, AlertCircle, Clock
} from 'lucide-react'
import { recoveryApi } from '../../api'

const STATUS_CONFIG = {
  RECOVERED:   { label: 'Recovered',    color: 'text-green-700  bg-green-100  border-green-200',  Icon: CheckCircle2 },
  IN_PROGRESS: { label: 'In Progress',  color: 'text-blue-700   bg-blue-100   border-blue-200',   Icon: RefreshCw    },
  PENDING:     { label: 'Pending',      color: 'text-amber-700  bg-amber-100  border-amber-200',  Icon: Clock        },
  FAILED:      { label: 'Failed',       color: 'text-red-700    bg-red-100    border-red-200',    Icon: XCircle      },
  CANCELLED:   { label: 'Cancelled',    color: 'text-gray-600   bg-gray-100   border-gray-200',   Icon: XCircle      },
  EXPIRED:     { label: 'Expired',      color: 'text-gray-500   bg-gray-100   border-gray-200',   Icon: Clock        },
}

const STRATEGY_LABELS = {
  PAYMENT_RETRY:              'Payment Retry',
  ALTERNATIVE_PAYMENT_METHOD: 'Alternative Payment Method',
  ABANDONED_CART_RECOVERY:    'Abandoned Cart Recovery',
  GRACEFUL_STOP:              'Graceful Stop',
}

const RISK_COLORS = {
  HIGH_RECOVERY_POTENTIAL:   'text-green-700  bg-green-50  border-green-200',
  MEDIUM_RECOVERY_POTENTIAL: 'text-amber-700  bg-amber-50  border-amber-200',
  LOW_RECOVERY_POTENTIAL:    'text-orange-700 bg-orange-50 border-orange-200',
  NO_RECOVERY:               'text-red-700    bg-red-50    border-red-200',
}

const EVENT_ICONS = {
  PAYMENT_FAILED:              { dot: 'bg-red-400',    label: 'Payment Failed'            },
  AGENT_TRIGGERED:             { dot: 'bg-brand-400',  label: 'Agent Triggered'           },
  HISTORY_RETRIEVED:           { dot: 'bg-blue-400',   label: 'History Retrieved'         },
  PROBABILITY_CALCULATED:      { dot: 'bg-purple-400', label: 'Probability Calculated'    },
  STRATEGY_SELECTED:           { dot: 'bg-brand-500',  label: 'Strategy Selected'         },
  RECOVERY_INITIATED:          { dot: 'bg-brand-500',  label: 'Recovery Initiated'        },
  RECOVERY_PAYMENT_CREATED:    { dot: 'bg-amber-400',  label: 'Recovery Payment Created'  },
  PAYMENT_SUCCEEDED:           { dot: 'bg-green-500',  label: 'Payment Succeeded'         },
  PAYMENT_FAILED_AGAIN:        { dot: 'bg-red-500',    label: 'Payment Failed Again'      },
  STRATEGY_CHANGED:            { dot: 'bg-orange-400', label: 'Strategy Changed'          },
  RECOVERY_STOPPED:            { dot: 'bg-gray-400',   label: 'Recovery Stopped'          },
  SIGNATURE_VERIFICATION_FAILED:{ dot: 'bg-red-500',   label: 'Signature Verification Failed'},
  EXPIRED:                     { dot: 'bg-gray-300',   label: 'Expired'                   },
}

export default function AdminRecoveryDetail() {
  const { orderId } = useParams()

  const [detail,      setDetail]      = useState(null)
  const [explanation, setExplanation] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(true)
  const [loadingExplain, setLoadingExplain] = useState(false)
  const [showExplain, setShowExplain] = useState(false)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    setLoadingDetail(true)
    recoveryApi.getDetail(orderId)
      .then(r => setDetail(r.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load recovery detail'))
      .finally(() => setLoadingDetail(false))
  }, [orderId])

  const fetchExplanation = async () => {
    if (explanation) { setShowExplain(v => !v); return }
    setLoadingExplain(true)
    try {
      const { data } = await recoveryApi.adminExplain(orderId)
      setExplanation(data)
      setShowExplain(true)
    } catch {
      setExplanation({ explanation: 'Explanation not available.', aiGenerated: false })
      setShowExplain(true)
    } finally {
      setLoadingExplain(false)
    }
  }

  if (loadingDetail) return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-6">
        <div className="skeleton h-8 w-8 rounded-xl" />
        <div className="skeleton h-5 w-48 rounded" />
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    </div>
  )

  if (error) return (
    <div className="page-container">
      <Link to="/admin/recovery" className="flex items-center gap-2 text-gray-500 hover:text-brand-600 text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Recovery Dashboard
      </Link>
      <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-200 rounded-2xl">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <div>
          <p className="font-semibold text-red-700">Recovery case not found</p>
          <p className="text-sm text-red-600 mt-0.5">{error}</p>
        </div>
      </div>
    </div>
  )

  const sc       = STATUS_CONFIG[detail.status] || STATUS_CONFIG.PENDING
  const StatusIcon = sc.Icon
  const probPct  = Math.round((detail.recoveryProbability || 0) * 100)

  return (
    <div className="page-container">

      {/* Back */}
      <Link to="/admin/recovery"
        className="flex items-center gap-2 text-gray-500 hover:text-brand-600 text-sm mb-5 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Recovery Dashboard
      </Link>

      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900 text-xl">
            Recovery Case — Order <span className="text-brand-600">#{detail.orderId}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Attempt #{detail.attemptId} · Created {detail.createdAt
              ? new Date(detail.createdAt).toLocaleString() : '—'}
          </p>
        </div>
        <span className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${sc.color}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {sc.label}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">

        {/* ── Left: details ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Summary card */}
          <div className="card space-y-4">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Recovery Summary</h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-1">Recovery Amount</p>
                <p className="font-bold text-gray-900 text-lg flex items-center gap-1">
                  <IndianRupee className="w-4 h-4 text-brand-500" />
                  {Number(detail.recoveryAmount || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Strategy</p>
                <p className="font-semibold text-gray-900">
                  {STRATEGY_LABELS[detail.selectedStrategy] || detail.selectedStrategy || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Recovery Probability</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-brand-500 to-orange-400 rounded-full"
                      style={{ width: `${probPct}%` }} />
                  </div>
                  <span className="font-bold text-brand-600 text-sm flex-shrink-0">{probPct}%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Risk Level</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold ${
                  RISK_COLORS[detail.riskLevel] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                  {detail.riskLevel?.replace(/_/g, ' ') || '—'}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Attempts Made</p>
                <p className="font-semibold text-gray-900">{detail.attemptCount ?? 0}</p>
              </div>
              {detail.recoveryTransactionId && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Recovery Transaction</p>
                  <p className="font-mono text-xs text-green-700 bg-green-50 px-2 py-1 rounded-lg truncate">
                    {detail.recoveryTransactionId}
                  </p>
                </div>
              )}
            </div>

            {/* Reasons */}
            {detail.reasons?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Signals that influenced this decision:</p>
                <div className="space-y-1.5">
                  {detail.reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Explanation */}
          <div className="card">
            <button
              onClick={fetchExplanation}
              disabled={loadingExplain}
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-900"
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-500" />
                Ask AI: Why was this strategy chosen?
              </span>
              {loadingExplain
                ? <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                : showExplain
                  ? <ChevronUp className="w-4 h-4 text-gray-400" />
                  : <ChevronDown className="w-4 h-4 text-gray-400" />
              }
            </button>

            {showExplain && explanation && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-brand-600 font-semibold mb-2">
                  <Bot className="w-3.5 h-3.5" />
                  {explanation.aiGenerated ? 'AI-generated explanation' : 'Rule-based explanation'}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{explanation.explanation}</p>
              </div>
            )}
          </div>

          {/* Audit Timeline */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-500" />
              Recovery Timeline
            </h3>

            {!detail.auditLog?.length ? (
              <p className="text-sm text-gray-400">No events recorded yet.</p>
            ) : (
              <div className="space-y-0">
                {detail.auditLog.map((entry, i) => {
                  const evCfg = EVENT_ICONS[entry.event] || { dot: 'bg-gray-300', label: entry.event }
                  return (
                    <div key={i} className="flex gap-4">
                      {/* Timeline spine */}
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${evCfg.dot}`} />
                        {i < detail.auditLog.length - 1 && (
                          <div className="w-px flex-1 bg-gray-100 mt-1 mb-1 min-h-[20px]" />
                        )}
                      </div>
                      {/* Content */}
                      <div className="pb-4 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-800">{evCfg.label}</p>
                          <p className="text-xs text-gray-400 flex-shrink-0">
                            {entry.timestamp
                              ? new Date(entry.timestamp).toLocaleTimeString()
                              : ''}
                          </p>
                        </div>
                        {entry.details && (
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed break-all">
                            {entry.details}
                          </p>
                        )}
                        {entry.result && entry.result !== 'N_A' && (
                          <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                            entry.result === 'SUCCESS' ? 'bg-green-50 text-green-700' :
                            entry.result === 'FAILURE' ? 'bg-red-50 text-red-600' :
                            'bg-gray-50 text-gray-500'
                          }`}>
                            {entry.result}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-4">

          {/* Quick facts */}
          <div className="card space-y-3">
            <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">Quick Facts</h3>
            {[
              { label: 'Order ID',    value: `#${detail.orderId}` },
              { label: 'Attempt ID',  value: `#${detail.attemptId}` },
              { label: 'Status',      value: sc.label },
              { label: 'Probability', value: `${probPct}%` },
              { label: 'Amount',      value: `₹${Number(detail.recoveryAmount || 0).toFixed(2)}` },
              { label: 'Attempts',    value: detail.attemptCount ?? 0 },
            ].map(f => (
              <div key={f.label} className="flex justify-between text-sm">
                <span className="text-gray-500">{f.label}</span>
                <span className="font-semibold text-gray-900">{f.value}</span>
              </div>
            ))}
          </div>

          {/* View order link */}
          <Link
            to={`/orders/${detail.orderId}`}
            className="card flex items-center justify-between text-sm font-medium text-brand-600 hover:text-brand-700 hover:shadow-card-hover transition-all"
          >
            <span>View Full Order</span>
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>

          {/* Recovery status visual */}
          <div className={`card border ${sc.color} text-center`}>
            <StatusIcon className="w-8 h-8 mx-auto mb-2" />
            <p className="font-bold">{sc.label}</p>
            {detail.status === 'RECOVERED' && detail.recoveryTransactionId && (
              <p className="text-xs mt-1 opacity-80">
                ✅ ₹{Number(detail.recoveryAmount || 0).toFixed(0)} recovered
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
