import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Star, Clock, Flame, Heart, ShoppingCart,
  Plus, Minus, CheckCircle, Lock, MessageSquare
} from 'lucide-react'
import { foodApi, favoriteApi, reviewApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import AuthPromptModal from '../../components/AuthPromptModal'
import toast from 'react-hot-toast'

export default function FoodDetail() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const { user }    = useAuth()
  const { addItem } = useCart()

  const [item,    setItem]    = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [qty,     setQty]     = useState(1)
  const [fav,     setFav]     = useState(false)
  const [adding,  setAdding]  = useState(false)
  const [showPrompt,  setShowPrompt]  = useState(false)
  const [promptAction, setPromptAction] = useState('cart')

  useEffect(() => {
    Promise.all([
      foodApi.getById(id),
      reviewApi.getByFoodItem ? reviewApi.getByFoodItem(id, 0, 5) : Promise.resolve({ data: { content: [] } }),
    ]).then(([itemRes, reviewRes]) => {
      setItem(itemRes.data)
      setFav(itemRes.data.isFavorite || false)
      setReviews(reviewRes.data?.content || [])
    }).catch(() => {
      toast.error('Item not found')
      navigate('/browse')
    }).finally(() => setLoading(false))
  }, [id])

  const handleAdd = async () => {
    if (!user) { setPromptAction('cart'); setShowPrompt(true); return }
    setAdding(true)
    try {
      await addItem(item.id, qty)
      toast.success(`${item.name} added to cart!`)
      navigate('/cart')
    } finally { setAdding(false) }
  }

  const handleOrderNow = () => {
    if (!user) { setPromptAction('order'); setShowPrompt(true); return }
    handleAdd()
  }

  const handleFav = async () => {
    if (!user) { setPromptAction('wishlist'); setShowPrompt(true); return }
    try {
      if (fav) { await favoriteApi.remove(item.id); toast.success('Removed from favorites') }
      else     { await favoriteApi.add(item.id);    toast.success('Added to favorites!') }
      setFav(!fav)
    } catch {}
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="skeleton w-full aspect-video rounded-2xl mb-6" />
      <div className="space-y-3">
        <div className="skeleton h-8 w-1/2" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
      </div>
    </div>
  )

  if (!item) return null

  const discount = item.discountPrice && item.discountPrice < item.price
    ? Math.round((1 - item.discountPrice / item.price) * 100) : 0

  return (
    <>
      <div className="max-w-2xl mx-auto">
        {/* Image */}
        <div className="relative">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full aspect-video object-cover"
            onError={e => { e.target.src = `https://via.placeholder.com/800x450/f97316/white?text=${encodeURIComponent(item.name)}` }}
          />
          <button onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button onClick={handleFav}
            className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-100 transition-colors">
            <Heart className={`w-5 h-5 ${fav && user ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </button>
          {item.bestseller && (
            <div className="absolute bottom-4 left-4 bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Flame className="w-4 h-4" /> Bestseller
            </div>
          )}
          {discount > 0 && (
            <div className="absolute bottom-4 right-4 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              {discount}% OFF
            </div>
          )}
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <div className={item.vegetarian ? 'veg-dot' : 'nonveg-dot'} />
                <span className="text-xs text-gray-500">{item.vegetarian ? 'Vegetarian' : 'Non-Vegetarian'}</span>
                <span className="badge badge-orange">{item.categoryName}</span>
                {!item.available && <span className="badge badge-red">Currently Unavailable</span>}
              </div>
              <h1 className="text-2xl font-bold font-display text-gray-900">{item.name}</h1>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-gray-900">₹{item.effectivePrice || item.price}</p>
              {discount > 0 && (
                <>
                  <p className="text-sm text-gray-400 line-through">₹{item.price}</p>
                  <p className="text-xs text-green-600 font-semibold">{discount}% OFF</p>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Star,  val: `${Number(item.rating || 0).toFixed(1)} (${item.totalRatings || 0})`, label: 'Rating',    color: 'text-amber-500' },
              { icon: Clock, val: `${item.preparationTime || '?'} min`,    label: 'Prep Time',  color: 'text-brand-500' },
              { icon: Flame, val: `${item.calories || '?'} cal`,           label: 'Calories',   color: 'text-orange-500' },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-2xl p-3 text-center">
                <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
                <p className="font-semibold text-sm text-gray-900">{s.val}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {item.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About this dish</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
            </div>
          )}

          {/* Ingredients */}
          {item.ingredients && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {item.ingredients.split(',').map(ing => (
                  <span key={ing} className="badge bg-gray-100 text-gray-700 text-xs">{ing.trim()}</span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-500" />
                Customer Reviews
                {item.totalRatings > 0 && <span className="text-sm text-gray-500 font-normal">({item.totalRatings})</span>}
              </h3>
            </div>
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {r.customerName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm text-gray-900">{r.customerName}</p>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < r.foodRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle className="w-3 h-3" /> Verified Order
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Prompt to login to review */}
            {!user && (
              <p className="text-xs text-gray-400 mt-3">
                <button onClick={() => { setPromptAction('review'); setShowPrompt(true) }}
                  className="text-brand-500 hover:underline font-medium">Login</button>{' '}
                to write a review (requires a completed order).
              </p>
            )}
          </div>
        </div>

        {/* Add to Cart Footer */}
        {item.available && (
          <div className="sticky bottom-16 md:bottom-0 bg-white border-t border-gray-100 px-4 py-4 shadow-2xl">
            <div className="max-w-2xl mx-auto">
              {!user && (
                <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-xl p-3 mb-3">
                  <Lock className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  <p className="text-xs text-brand-700">
                    <Link to="/login" className="font-bold hover:underline">Login</Link> or{' '}
                    <Link to="/register" className="font-bold hover:underline">create an account</Link> to order.
                  </p>
                </div>
              )}
              <div className="flex items-center gap-4">
                {user && (
                  <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-3 py-2">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center text-brand-600 hover:bg-brand-50 transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-gray-900 w-6 text-center">{qty}</span>
                    <button onClick={() => setQty(q => Math.min(20, q + 1))}
                      className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center text-brand-600 hover:bg-brand-50 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <button onClick={handleAdd} disabled={adding}
                  className="flex-1 btn-primary py-3.5 text-base">
                  {adding
                    ? <><div className="spinner" /> Adding...</>
                    : !user
                      ? <><Lock className="w-5 h-5" /> Login to Order</>
                      : <><ShoppingCart className="w-5 h-5" /> Add to Cart — ₹{((item.effectivePrice || item.price) * qty).toFixed(0)}</>
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showPrompt && (
        <AuthPromptModal action={promptAction} onClose={() => setShowPrompt(false)} />
      )}
    </>
  )
}
