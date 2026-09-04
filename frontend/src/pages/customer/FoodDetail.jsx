import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, Clock, Flame, Leaf, Heart, ShoppingCart, Plus, Minus } from 'lucide-react'
import { foodApi, favoriteApi } from '../../api'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

export default function FoodDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [item,    setItem]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty,     setQty]     = useState(1)
  const [fav,     setFav]     = useState(false)
  const [adding,  setAdding]  = useState(false)

  useEffect(() => {
    foodApi.getById(id)
      .then(r => { setItem(r.data); setFav(r.data.isFavorite) })
      .catch(() => { toast.error('Item not found'); navigate('/menu') })
      .finally(() => setLoading(false))
  }, [id])

  const handleAdd = async () => {
    setAdding(true)
    try {
      await addItem(item.id, qty)
      navigate('/cart')
    } finally { setAdding(false) }
  }

  const handleFav = async () => {
    try {
      if (fav) { await favoriteApi.remove(item.id); toast.success('Removed from favorites') }
      else     { await favoriteApi.add(item.id);    toast.success('Added to favorites!') }
      setFav(!fav)
    } catch {}
  }

  if (loading) return (
    <div className="page-container">
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
    <div className="max-w-2xl mx-auto">
      {/* Image */}
      <div className="relative">
        <img src={item.imageUrl} alt={item.name}
          className="w-full aspect-video object-cover"
          onError={e => { e.target.onerror = null; e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23fff7ed'/%3E%3Ccircle cx='400' cy='200' r='90' fill='%23fed7aa'/%3E%3Cpath d='M355 185 Q400 155 445 185 Q445 230 400 245 Q355 230 355 185Z' fill='%23f97316'/%3E%3Crect x='320' y='265' width='160' height='12' rx='6' fill='%23fdba74'/%3E%3C/svg%3E` }}
        />
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <button onClick={handleFav}
          className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-100 transition-colors">
          <Heart className={`w-5 h-5 ${fav ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
        </button>
        {item.bestseller && (
          <div className="absolute bottom-4 left-4 bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Flame className="w-4 h-4" /> Bestseller
          </div>
        )}
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <div className={item.vegetarian ? 'veg-dot' : 'nonveg-dot'} />
              <span className="text-xs text-gray-500">{item.vegetarian ? 'Vegetarian' : 'Non-Vegetarian'}</span>
              <span className="badge badge-orange">{item.categoryName}</span>
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
            { icon: Star, val: `${Number(item.rating).toFixed(1)} (${item.totalRatings})`, label: 'Rating', color: 'text-amber-500' },
            { icon: Clock, val: `${item.preparationTime} min`, label: 'Prep Time', color: 'text-brand-500' },
            { icon: Flame, val: `${item.calories} cal`, label: 'Calories', color: 'text-orange-500' },
          ].map(s => (
            <div key={s.label} className="bg-gray-50 rounded-2xl p-3 text-center">
              <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
              <p className="font-semibold text-sm text-gray-900">{s.val}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">About this dish</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
        </div>

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

        {!item.available && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center text-red-600 font-medium flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
            This item is currently unavailable
          </div>
        )}
      </div>

      {/* Add to Cart Footer */}
      {item.available && (
        <div className="sticky bottom-16 md:bottom-0 bg-white border-t border-gray-100 px-4 py-4 shadow-2xl">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
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
            <button onClick={handleAdd} disabled={adding}
              className="flex-1 btn-primary py-3.5 text-base">
              {adding ? <><div className="spinner" /> Adding...</>
                : <><ShoppingCart className="w-5 h-5" /> Add to Cart — ₹{((item.effectivePrice || item.price) * qty).toFixed(0)}</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
