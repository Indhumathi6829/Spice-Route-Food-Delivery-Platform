/**
 * FestivalBanner — fetches currently active festival offers and shows
 * a horizontally scrollable banner strip at the top of the public home page.
 * Only shows banners that are currently live (backend filters by date).
 */
import { useEffect, useState } from 'react'
import { Tag, X, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../api/axiosInstance'

export default function FestivalBanner() {
  const [offers,   setOffers]   = useState([])
  const [current,  setCurrent]  = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    api.get('/festival-offers/active')
      .then(r => setOffers(r.data || []))
      .catch(() => {})
  }, [])

  if (!offers.length || dismissed) return null

  const offer = offers[current]

  const DISCOUNT_TEXT = offer.discountType === 'PERCENTAGE'
    ? `${offer.discountValue}% OFF`
    : `₹${offer.discountValue} OFF`

  const BG_COLORS = [
    'from-orange-500 to-red-500',
    'from-purple-600 to-pink-500',
    'from-green-500 to-teal-500',
    'from-blue-500 to-indigo-500',
    'from-amber-500 to-orange-500',
  ]

  return (
    <div className={`relative bg-gradient-to-r ${BG_COLORS[current % BG_COLORS.length]} text-white`}>
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Prev */}
        {offers.length > 1 && (
          <button onClick={() => setCurrent(c => (c - 1 + offers.length) % offers.length)}
            className="p-1 rounded-full hover:bg-white/20 transition-colors flex-shrink-0">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Content */}
        <div className="flex items-center gap-3 flex-1 min-w-0 justify-center">
          <Tag className="w-4 h-4 flex-shrink-0" />
          <div className="flex flex-wrap items-center justify-center gap-x-2 text-sm font-medium text-center">
            <span className="font-bold">{offer.festivalName}:</span>
            <span>{offer.title}</span>
            <span className="bg-white/25 px-2 py-0.5 rounded-full font-bold text-xs">{DISCOUNT_TEXT}</span>
            {offer.couponCode && (
              <span>
                Use code:{' '}
                <span className="bg-white/25 px-2 py-0.5 rounded font-mono font-bold tracking-wide text-xs">
                  {offer.couponCode}
                </span>
              </span>
            )}
            {offer.minimumOrderValue > 0 && (
              <span className="text-xs opacity-80">Min order ₹{offer.minimumOrderValue}</span>
            )}
          </div>
        </div>

        {/* Next */}
        {offers.length > 1 && (
          <button onClick={() => setCurrent(c => (c + 1) % offers.length)}
            className="p-1 rounded-full hover:bg-white/20 transition-colors flex-shrink-0">
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Dismiss */}
        <button onClick={() => setDismissed(true)}
          className="p-1 rounded-full hover:bg-white/20 transition-colors flex-shrink-0 ml-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Dots */}
      {offers.length > 1 && (
        <div className="flex justify-center gap-1 pb-1">
          {offers.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
