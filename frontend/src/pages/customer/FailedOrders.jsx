import { useEffect, useState, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle, RefreshCw, Bot, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Clock, Loader2, TrendingUp,
  CreditCard, ArrowLeft, ShoppingBag, Zap, Info
} from 'lucide-react'
import { orderApi, recoveryApi } from '../../api'
import toast from 'react-hot-toast'

/* ── helpers ── */
function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return }
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true); s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

const RISK_COLORS = {
  HIGH_RECOVERY_POTENTIAL:   'text-green-700 bg-green-50 border-green-200',
  MEDIUM_RECOVERY_POTENTIAL: 'text-amber-700 bg-amber-50 border-amber-200',
  LOW_RECOVERY_POTENTIAL:    'text-orange-700 bg-orange-50 border-orange-200',
  NO_RECOVERY:               'text-red-700 bg-red-50 border-red-200',
}

const STRATEGY_LABELS = {
  PAYMENT_RETRY:              'Retry Payment',
  ALTERNATIVE_PAYMENT_METHOD: 'Try Another Method',
  ABANDONED_CART_RECOVERY:    'Recover Order',
  GRACEFUL_STOP:              null,
}

const STATUS_BADGE = {
  RECOVERED:   'bg-green-100 text-green-700',
  IN_PROGRESS: 'bg-blue-100  text-blue-700',
  PENDING:     'bg-amber-100 text-amber-700',
  FAILED:      'bg-red-100   text-red-600',
  CANCELLED:   'bg-gray-100  text-gray-500',
  EXPIRED:     'bg-gray-100  text-gray-400',
}

const RECOVERY_TIPS = {
  GRACEFUL_STOP: 'Recovery probability is too low to retry automatically. Your order is safely saved.',
  CANCELLED:     'This case was closed. You can place a new order anytime.',
  EXPIRED:       'The recovery window has passed. Please place a new order.',
  FAILED:        'All recovery attempts were exhausted. Please place a new order.',
  RECOVERED:     'Payment was successfully recovered. Your order is confirmed! ✅',
}

/* ── Failure reason badge ── */
function FailureTag({ reason }) {
  if (!reason) return null
  const lower = reason.toLowerCase()
  let color = 'bg-red-50 text-red-600 border-red-200'
  let label = reason
  if (lower.includes('insufficient') || lower.includes('funds'))  { color = 'bg-orange-50 text-orange-700 border-orange-200'; label = 'Insufficient funds' }
  else if (lower.includes('timeout') || lower.includes('timed'))  { color = 'bg-amber-50 text-amber-700 border-amber-200';  label = 'Payment timeout'   }
  else if (lower.includes('cancel'))                               { color = 'bg-gray-50 text-gray-600 border-gray-200';     label = 'Cancelled'         }
  else if (lower.includes('network') || lower.includes('error'))  { color = 'bg-amber-50 text-amber-700 border-amber-200';  label = 'Network error'     }
  else if (lower.includes('auth') || lower.includes('verif'))     { color = 'bg-purple-50 text-purple-700 border-purple-200'; label = 'Auth failure'    }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}

/* ── Single recovery card ── */
function RecoveryCard({ recovery, onRetrySuccess }) {
  const navigate = useNavigate()
  const [expanded,    setExpanded]    = useState(false)
  const [retrying,    setRetrying]    = useState(false)
  const [triggering,  setTriggering]  = useState(false)
  const [explanation, setExplanation] = useState(null)
  const [showExplain, setShowExplain] = useState(false)
  const [showAudit,   setShowAudit]   = useState(false)
  const [newEvent,    setNewEvent]    = useState(false)
  const [status,      setStatus]      = useState(recovery)
  const prevAuditLen = useRef(recovery?.auditLog?.length || 0)
  const intervalRef  = useRef(null)

  const refreshStatus = useCallback(async () => {
    try {
      const { data } = await recoveryApi.getStatus(recovery.orderId)
      setStatus(prev => {
        const newLen = data.auditLog?.length || 0
        if (newLen > (prev?.auditLog?.length || 0)) {
          setNewEvent(true); setTimeout(() => setNewEvent(false), 2500)
          setShowAudit(true)
        }
        return data
      })
    } catch { /* silent */ }
  }, [recovery.orderId])

  // Poll every 4s while active
  useEffect(() => {
    intervalRef.current = setInterval(refreshStatus, 4000)
    return () => clearInterval(intervalRef.current)
  }, [refreshStatus])

  useEffect(() => {
    const terminal = ['RECOVERED', 'FAILED', 'CANCELLED', 'EXPIRED']
    if (terminal.includes(status?.status)) clearInterval(intervalRef.current)
  }, [status?.status])

  const handleRetry = async () => {
    setRetrying(true)
    try {
      const loaded = await loadRazorpay()
      if (!loaded) { toast.error('Could not load payment gateway'); setRetrying(false); return }

      const { data: rzpData } = await recoveryApi.retryPayment(status.orderId)
      const rzp = new window.Razorpay({
        key: rzpData.keyId, amount: rzpData.amount, currency: rzpData.currency,
        order_id: rzpData.razorpayOrderId,
        name: 'SpiceRoute Kitchen 🌶️',
        description: `Recovery — Order #${status.orderId}`,
        image: '/favicon.svg', theme: { color: '#f97316' },
        modal: { ondismiss: () => { setRetrying(false); toast.error('Payment cancelled. You can retry again.'); refreshStatus() } },
        handler: async (response) => {
          try {
            const { data: result } = await recoveryApi.verifyPayment({
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            if (result.status === 'SUCCESS') {
              toast.success('Payment recovered! Order confirmed ✅')
              clearInterval(intervalRef.current)
              onRetrySuccess && onRetrySuccess()
              navigate(`/order-success/${status.orderId}`)
            }
          } catch { toast.error('Verification failed. Contact support with Order #' + status.orderId); setRetrying(false); refreshStatus() }
        },
      })
      rzp.on('payment.failed', () => {
        toast.error('Payment failed again. AI is updating the plan...')
        setRetrying(false); refreshStatus()
      })
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start recovery payment')
      setRetrying(false)
    }
  }

  const handleTrigger = async () => {
    setTriggering(true)
    try {
      const { data } = await recoveryApi.triggerRecovery(status.orderId)
      setStatus(data)
      toast.success('AI Recovery Agent triggered!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not trigger recovery')
    } finally { setTriggering(false) }
  }

  const fetchExplanation = async () => {
    if (explanation) { setShowExplain(v => !v); return }
    try {
      const { data } = await recoveryApi.explain(status.orderId)
      setExplanation(data); setShowExplain(true)
    } catch {
      setExplanation({ explanation: 'Explanation not available.', aiGenerated: false })
      setShowExplain(true)
    }
  }

  const prob       = Math.round((status?.recoveryProbability || 0) * 100)
  const strategy   = STRATEGY_LABELS[status?.selectedStrategy]
  const isTerminal = ['RECOVERED', 'CANCELLED', 'EXPIRED', 'FAILED'].includes(status?.status)
  const canRetry   = status && !isTerminal && strategy !== null
  const needsTrigger = !status || status.status === 'NO_RECOVERY_YET'

  return (
    <div className="card border border-gray-100 overflow-hidden">
      {/* Header — always visible */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(v => !v)}>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
          status?.status === 'RECOVERED' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          {status?.status === 'RECOVERED'
            ? <CheckCircle2 className="w-5 h-5 text-green-500" />
            : <AlertCircle  className="w-5 h-5 text-red-500"   />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 text-sm">Order #{status?.orderId}</span>
            {status?.status && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[status.status] || 'bg-gray-100 text-gray-500'}`}>
                {status.status.replace('_', ' ')}
              </span>
            )}
            {/* Live dot while active */}
            {status && !isTerminal && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
              </span>
            )}
            <FailureTag reason={status?.failureReason} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {status?.createdAt ? new Date(status.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            }) : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="font-bold text-gray-900">₹{status?.recoveryAmount || '—'}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {/* Expanded recovery panel */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">

          {/* ── No recovery triggered yet ── */}
          {needsTrigger && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <Bot className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 text-sm">AI Recovery not triggered yet</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Click below to let the AI analyse your failed payment and recommend the best recovery strategy.
                  </p>
                </div>
              </div>
              <button onClick={handleTrigger} disabled={triggering}
                className="w-full btn-primary py-2.5 gap-2 disabled:opacity-60">
                {triggering
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing...</>
                  : <><Bot className="w-4 h-4" /> Start AI Recovery</>}
              </button>
            </div>
          )}

          {/* ── Terminal state message ── */}
          {isTerminal && RECOVERY_TIPS[status?.status] && (
            <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
              status.status === 'RECOVERED'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}>
              {status.status === 'RECOVERED'
                ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                : <Info         className="w-4 h-4 flex-shrink-0 mt-0.5" />}
              <p>{RECOVERY_TIPS[status.status]}</p>
            </div>
          )}

          {/* ── Active recovery panel ── */}
          {status && !needsTrigger && status.status !== 'NO_RECOVERY_YET' && (
            <div className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 to-orange-50 p-4 space-y-4">

              {/* Agent header */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">🤖 AI Recovery Assistant</p>
                  <p className="text-xs text-gray-500">
                    {status.status === 'RECOVERED'
                      ? 'Your payment was successfully recovered!'
                      : 'Analysed your payment — recovery plan ready'}
                  </p>
                </div>
              </div>

              {/* Probability bar */}
              {prob > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-brand-500" /> Recovery Probability
                    </span>
                    <span className="font-bold text-brand-600">{prob}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-brand-500 to-orange-400 rounded-full transition-all duration-700"
                      style={{ width: `${prob}%` }} />
                  </div>
                </div>
              )}

              {/* Risk + failure reason */}
              <div className="flex items-center gap-2 flex-wrap">
                {status.riskLevel && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${RISK_COLORS[status.riskLevel] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                    {status.riskLevel.replace(/_/g, ' ')}
                  </span>
                )}
                <FailureTag reason={status.failureReason} />
              </div>

              {/* Reasons */}
              {status.reasons?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-gray-700">Why AI thinks it can recover this:</p>
                  {status.reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Strategy + amount */}
              {!isTerminal && strategy && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl border border-brand-100 p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Recommended</p>
                    <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-brand-500" /> {strategy}
                    </p>
                    {status.attemptCount > 0 && (
                      <p className="text-xs text-amber-600 mt-1">Attempt {status.attemptCount + 1}/3</p>
                    )}
                  </div>
                  <div className="bg-white rounded-xl border border-brand-100 p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Amount</p>
                    <p className="font-bold text-gray-900 text-lg">₹{status.recoveryAmount}</p>
                  </div>
                </div>
              )}

              {/* Retry button */}
              {canRetry && (
                <button onClick={handleRetry} disabled={retrying}
                  className="w-full btn-primary py-3 gap-2 disabled:opacity-60">
                  {retrying
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    : <><RefreshCw className="w-4 h-4" /> {strategy}</>}
                </button>
              )}

              {/* AI explanation */}
              <button onClick={fetchExplanation}
                className="w-full flex items-center justify-between text-xs text-brand-600 hover:text-brand-700 font-medium">
                <span className="flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" /> Why did AI choose this strategy?
                </span>
                {showExplain ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showExplain && explanation && (
                <div className="bg-white rounded-xl border border-brand-100 p-3 text-xs text-gray-700">
                  <p className="text-brand-600 font-semibold mb-1">
                    {explanation.aiGenerated ? '🤖 AI Explanation' : '📋 Rule-based Explanation'}
                  </p>
                  <p className="leading-relaxed">{explanation.explanation}</p>
                </div>
              )}

              {/* Live audit timeline */}
              {status.auditLog?.length > 0 && (
                <>
                  <button onClick={() => setShowAudit(v => !v)}
                    className="w-full flex items-center justify-between text-xs text-gray-400 hover:text-gray-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Recovery timeline ({status.auditLog.length} events)
                      {newEvent && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">
                          <Zap className="w-2.5 h-2.5" /> New
                        </span>
                      )}
                    </span>
                    {showAudit ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  {showAudit && (
                    <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-0">
                      {status.auditLog.map((entry, i) => (
                        <div key={i} className="flex gap-3 text-xs">
                          <div className="flex flex-col items-center">
                            <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                              entry.result === 'SUCCESS' ? 'bg-green-500' :
                              entry.result === 'FAILURE' ? 'bg-red-400' : 'bg-brand-400'
                            }`} />
                            {i < status.auditLog.length - 1 && (
                              <div className="w-px flex-1 bg-gray-100 mt-1 mb-1 min-h-[14px]" />
                            )}
                          </div>
                          <div className="pb-2 flex-1 min-w-0">
                            <p className="font-medium text-gray-700">{entry.event?.replace(/_/g, ' ')}</p>
                            {entry.details && <p className="text-gray-400 mt-0.5 break-all leading-relaxed">{entry.details}</p>}
                            <p className="text-gray-300 mt-0.5">
                              {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Main page ── */
export default function FailedOrders() {
  const [recoveries, setRecoveries] = useState([])   // from /recovery/my
  const [placedOrders, setPlacedOrders] = useState([]) // unrecovered PLACED+RAZORPAY orders
  const [loading, setLoading]  = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      recoveryApi.getMyRecoveries().catch(() => ({ data: [] })),
      orderApi.getMyOrders(0, 100).catch(() => ({ data: { content: [] } })),
    ]).then(([recRes, ordRes]) => {
      const myRecoveries = recRes.data || []
      const allOrders    = ordRes.data?.content || []

      // Orders with a recovery attempt — use recovery data
      setRecoveries(myRecoveries)

      // Orders that are PLACED + RAZORPAY but have NO recovery attempt yet
      const recoveredOrderIds = new Set(myRecoveries.map(r => r.orderId))
      const unrecovered = allOrders.filter(o =>
        o.status === 'PLACED' &&
        o.paymentMethod === 'RAZORPAY' &&
        !recoveredOrderIds.has(o.id)
      )
      setPlacedOrders(unrecovered)
    }).finally(() => setLoading(false))
  }, [refreshKey])

  const totalCases = recoveries.length + placedOrders.length

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
      {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link to="/orders" className="flex items-center gap-2 text-gray-500 hover:text-brand-600 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> My Orders
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="section-title mb-0">Payment Recovery</h1>
      </div>

      {/* Explainer banner */}
      <div className="mb-5 flex items-start gap-3 p-4 bg-gradient-to-r from-brand-50 to-orange-50 border border-brand-100 rounded-2xl">
        <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">🤖 AI Recovery Agent</p>
          <p className="text-xs text-gray-600 mt-0.5">
            Every failed payment gets analysed by AI. It calculates recovery probability,
            selects the best strategy, and guides you through the retry — so no order is ever lost.
          </p>
        </div>
      </div>

      {totalCases === 0 ? (
        <div className="py-20 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-700">No failed payments</h2>
          <p className="text-gray-500 text-sm mt-1">All your recent orders were paid successfully.</p>
          <Link to="/home" className="btn-primary mt-6 inline-flex text-sm">Browse Menu</Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {totalCases} order{totalCases !== 1 ? 's' : ''} with pending or failed payment
          </p>

          <div className="space-y-3">
            {/* Orders that have a RecoveryAttempt */}
            {recoveries.map(r => (
              <RecoveryCard key={r.orderId} recovery={r} onRetrySuccess={() => setRefreshKey(k => k + 1)} />
            ))}

            {/* PLACED+RAZORPAY orders with no recovery attempt yet */}
            {placedOrders.map(order => (
              <RecoveryCard
                key={order.id}
                recovery={{
                  orderId:         order.id,
                  status:          'NO_RECOVERY_YET',
                  recoveryAmount:  order.totalAmount,
                  createdAt:       order.placedAt,
                  auditLog:        [],
                  reasons:         [],
                }}
                onRetrySuccess={() => setRefreshKey(k => k + 1)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
