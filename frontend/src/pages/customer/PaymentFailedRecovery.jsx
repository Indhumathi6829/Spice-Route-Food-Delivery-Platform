import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bot, RefreshCw, CreditCard, CheckCircle2,
  ChevronDown, ChevronUp, Loader2, XCircle, TrendingUp, Zap
} from 'lucide-react'
import { recoveryApi } from '../../api'
import toast from 'react-hot-toast'

function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return }
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload  = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

const STRATEGY_LABELS = {
  PAYMENT_RETRY:              'Retry Payment',
  ALTERNATIVE_PAYMENT_METHOD: 'Try Another Payment Method',
  ABANDONED_CART_RECOVERY:    'Recover Your Order',
  GRACEFUL_STOP:              null,
}

const RISK_COLORS = {
  HIGH_RECOVERY_POTENTIAL:   'text-green-600 bg-green-50 border-green-200',
  MEDIUM_RECOVERY_POTENTIAL: 'text-amber-600 bg-amber-50 border-amber-200',
  LOW_RECOVERY_POTENTIAL:    'text-orange-600 bg-orange-50 border-orange-200',
  NO_RECOVERY:               'text-red-600 bg-red-50 border-red-200',
}

/**
 * PaymentFailedRecovery — shown below the payError block in Checkout.
 * Polls the backend every 3 s so the audit log and status update live
 * as the AI agent works through the recovery loop.
 */
export default function PaymentFailedRecovery({ orderId, amount, onSuccess }) {
  const navigate = useNavigate()

  const [status,        setStatus]        = useState(null)
  const [explanation,   setExplanation]   = useState(null)
  const [showExplain,   setShowExplain]   = useState(false)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [retrying,      setRetrying]      = useState(false)
  const [showAudit,     setShowAudit]     = useState(false)
  const [auditCount,    setAuditCount]    = useState(0)  // detect new events
  const [newEvent,      setNewEvent]      = useState(false)
  const intervalRef = useRef(null)

  // ── Fetch recovery status ─────────────────────────────────────────────────
  const fetchStatus = useCallback(async (silent = false) => {
    try {
      const { data } = await recoveryApi.getStatus(orderId)
      setStatus(prev => {
        // Detect new audit events → flash indicator
        const newCount = data.auditLog?.length || 0
        if (prev && newCount > (prev.auditLog?.length || 0)) {
          setNewEvent(true)
          setTimeout(() => setNewEvent(false), 2500)
          // Auto-open audit log when new events arrive
          setShowAudit(true)
        }
        setAuditCount(newCount)
        return data
      })
    } catch {
      // silent — recovery may not exist yet
    } finally {
      if (!silent) setLoadingStatus(false)
    }
  }, [orderId])

  // First fetch after 800 ms (give backend time to create the attempt)
  useEffect(() => {
    if (!orderId) return
    const t = setTimeout(() => fetchStatus(false), 800)
    return () => clearTimeout(t)
  }, [orderId, fetchStatus])

  // Poll every 3 s — stops once RECOVERED / FAILED / CANCELLED / EXPIRED
  useEffect(() => {
    if (!orderId) return
    intervalRef.current = setInterval(() => {
      fetchStatus(true)
    }, 3000)
    return () => clearInterval(intervalRef.current)
  }, [orderId, fetchStatus])

  // Stop polling once terminal state reached
  useEffect(() => {
    if (!status) return
    const terminal = ['RECOVERED', 'FAILED', 'CANCELLED', 'EXPIRED']
    if (terminal.includes(status.status)) {
      clearInterval(intervalRef.current)
    }
  }, [status])

  // ── AI explanation ────────────────────────────────────────────────────────
  const fetchExplanation = async () => {
    if (explanation) { setShowExplain(v => !v); return }
    try {
      const { data } = await recoveryApi.explain(orderId)
      setExplanation(data)
      setShowExplain(true)
    } catch {
      setExplanation({ explanation: 'Explanation not available.', aiGenerated: false })
      setShowExplain(true)
    }
  }

  // ── Retry payment ─────────────────────────────────────────────────────────
  const handleRetry = async () => {
    setRetrying(true)
    try {
      const loaded = await loadRazorpay()
      if (!loaded) {
        toast.error('Failed to load payment gateway.')
        setRetrying(false)
        return
      }

      const { data: rzpData } = await recoveryApi.retryPayment(orderId)

      const rzp = new window.Razorpay({
        key:         rzpData.keyId,
        amount:      rzpData.amount,
        currency:    rzpData.currency,
        order_id:    rzpData.razorpayOrderId,
        name:        'SpiceRoute Kitchen 🌶️',
        description: `Recovery — Order #${orderId}`,
        image:       '/favicon.svg',
        theme:       { color: '#f97316' },
        modal: {
          ondismiss: () => {
            setRetrying(false)
            toast.error('Payment cancelled. You can retry again.')
            fetchStatus(true)
          },
        },
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
              onSuccess ? onSuccess(orderId) : navigate(`/order-success/${orderId}`)
            }
          } catch {
            toast.error('Verification failed. Contact support with Order #' + orderId)
            fetchStatus(true)
            setRetrying(false)
          }
        },
      })

      rzp.on('payment.failed', async () => {
        toast.error('Payment failed again. AI agent is updating recovery plan...')
        fetchStatus(true)
        setRetrying(false)
      })

      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate recovery payment.')
      setRetrying(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loadingStatus) {
    return (
      <div className="mt-4 flex items-center gap-2 text-gray-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        AI Recovery Agent is analysing your order...
      </div>
    )
  }

  if (!status
    || status.selectedStrategy === 'GRACEFUL_STOP'
    || status.status === 'CANCELLED'
    || status.status === 'EXPIRED'
    || status.status === 'FAILED') {
    return (
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-500">
        <div className="flex items-center gap-2 mb-1">
          <XCircle className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-700">Recovery not available</span>
        </div>
        <p>This order cannot be automatically recovered. Please place a new order or contact support.</p>
      </div>
    )
  }

  if (status.status === 'RECOVERED') {
    return (
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-2xl text-sm">
        <div className="flex items-center gap-2 text-green-700 font-semibold">
          <CheckCircle2 className="w-5 h-5" />
          Order successfully recovered! ✅
        </div>
      </div>
    )
  }

  const strategyLabel  = STRATEGY_LABELS[status.selectedStrategy] || 'Retry Payment'
  const riskColorClass = RISK_COLORS[status.riskLevel] || RISK_COLORS.MEDIUM_RECOVERY_POTENTIAL
  const probabilityPct = Math.round((status.recoveryProbability || 0) * 100)

  return (
    <div className="mt-5 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-orange-50 overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-900">AI Recovery Assistant</p>
          <p className="text-xs text-gray-500">Your order is still available. We found a recovery plan.</p>
        </div>
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Live
        </div>
      </div>

      <div className="px-5 pb-5 space-y-4">

        {/* Probability bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-brand-500" /> Recovery Probability
            </span>
            <span className="font-bold text-brand-600">{probabilityPct}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-brand-500 to-orange-400 rounded-full transition-all duration-700"
              style={{ width: `${probabilityPct}%` }}
            />
          </div>
        </div>

        {/* Risk level */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${riskColorClass}`}>
          {status.riskLevel?.replace(/_/g, ' ')}
        </div>

        {/* Reasons */}
        {status.reasons?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-700">Why we think we can recover this:</p>
            {status.reasons.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        )}

        {/* Strategy + amount */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-brand-100 p-3">
            <p className="text-xs text-gray-500 mb-0.5">Recommended strategy</p>
            <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-500" />
              {strategyLabel}
            </p>
            {status.attemptCount > 0 && (
              <p className="text-xs text-amber-600 mt-1">Attempt {status.attemptCount + 1} of 3</p>
            )}
          </div>
          <div className="bg-white rounded-xl border border-brand-100 p-3">
            <p className="text-xs text-gray-500 mb-0.5">Amount to recover</p>
            <p className="font-bold text-gray-900 text-lg">₹{status.recoveryAmount || amount}</p>
          </div>
        </div>

        {/* Retry button */}
        <button
          onClick={handleRetry}
          disabled={retrying || status.status === 'RECOVERED'}
          className="w-full btn-primary py-3 gap-2 disabled:opacity-60"
        >
          {retrying
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
            : <><RefreshCw className="w-4 h-4" /> {strategyLabel}</>
          }
        </button>

        {/* AI explanation */}
        <button
          onClick={fetchExplanation}
          className="w-full flex items-center justify-between text-xs text-brand-600 hover:text-brand-700 font-medium pt-1"
        >
          <span className="flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5" />
            Why did AI choose this strategy?
          </span>
          {showExplain ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showExplain && explanation && (
          <div className="bg-white rounded-xl border border-brand-100 p-4 text-sm text-gray-700">
            <div className="flex items-center gap-2 mb-2 text-xs text-brand-600 font-semibold">
              <Bot className="w-3.5 h-3.5" />
              {explanation.aiGenerated ? 'AI Explanation' : 'Rule-based Explanation'}
            </div>
            <p className="leading-relaxed">{explanation.explanation}</p>
          </div>
        )}

        {/* Live audit log */}
        {status.auditLog?.length > 0 && (
          <>
            <button
              onClick={() => setShowAudit(v => !v)}
              className="w-full flex items-center justify-between text-xs text-gray-400 hover:text-gray-600 font-medium"
            >
              <span className="flex items-center gap-1.5">
                Recovery timeline ({status.auditLog.length} events)
                {newEvent && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">
                    <Zap className="w-2.5 h-2.5" /> New
                  </span>
                )}
              </span>
              {showAudit ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
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
                      {entry.details && (
                        <p className="text-gray-400 mt-0.5 leading-relaxed break-all">{entry.details}</p>
                      )}
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
    </div>
  )
}
