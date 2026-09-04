import { useState } from 'react'
import { X, Star, Send, Loader, Utensils, Bike } from 'lucide-react'
import { reviewApi } from '../api'
import toast from 'react-hot-toast'

function StarPicker({ value, onChange, label }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div>
      <div className="text-sm font-medium text-gray-700 mb-2">{label}</div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <button key={i} type="button"
            onClick={() => onChange(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110">
            <Star className={`w-8 h-8 transition-colors ${
              i <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300'
            }`} />
          </button>
        ))}
        {value > 0 && (
          <span className="ml-2 text-sm font-semibold text-amber-600 self-center">
            {['','Poor','Fair','Good','Great','Excellent'][value]}
          </span>
        )}
      </div>
    </div>
  )
}

export default function ReviewModal({ order, existing, onClose, onSuccess }) {
  const [foodRating,     setFoodRating]     = useState(existing?.foodRating     || 0)
  const [deliveryRating, setDeliveryRating] = useState(existing?.deliveryRating || 0)
  const [comment,        setComment]        = useState(existing?.comment        || '')
  const [saving,         setSaving]         = useState(false)

  const hasDelivery = !!order.deliveryPartnerId || !!order.deliveryPartnerName

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (foodRating === 0) { toast.error('Please rate the food'); return }
    setSaving(true)
    try {
      if (existing?.id) {
        await reviewApi.update(existing.id, {
          orderId: order.id, foodRating,
          deliveryRating: deliveryRating || undefined,
          comment,
        })
        toast.success('Review updated!')
      } else {
        await reviewApi.create({
          orderId: order.id, foodRating,
          deliveryRating: deliveryRating || undefined,
          comment,
        })
        toast.success('Thank you for your review!')
      }
      onSuccess?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in"
      onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-slide-up"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900 font-display">
              {existing ? 'Edit Your Review' : 'Rate Your Order'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Order #{order.id}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Items summary */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 line-clamp-2">
              {order.items?.map(i => `${i.foodItemName} ×${i.quantity}`).join(' · ')}
            </p>
          </div>

          {/* Food rating */}
          <StarPicker value={foodRating} onChange={setFoodRating}
            label={<span className="flex items-center gap-1.5"><Utensils className="w-4 h-4 text-brand-500" /> How was your food?</span>} />

          {/* Delivery rating */}
          {hasDelivery && (
            <StarPicker
              value={deliveryRating}
              onChange={setDeliveryRating}
              label={
                <span className="flex items-center gap-1.5">
                  <Bike className="w-4 h-4 text-blue-500" />
                  {`Delivery${order.deliveryPartnerName ? ' by ' + order.deliveryPartnerName : ''}`}
                </span>
              }
            />
          )}

          {/* Comment */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Comments <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Tell others about your experience..."
              className="input resize-none text-sm"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/500</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 btn-secondary py-3">Cancel</button>
            <button type="submit" disabled={saving || foodRating === 0}
              className="flex-1 btn-primary py-3">
              {saving ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</>
                : <><Send className="w-4 h-4" /> {existing ? 'Update' : 'Submit Review'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
