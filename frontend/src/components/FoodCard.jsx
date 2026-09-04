import { Star, Clock, Heart, Plus, Flame } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { favoriteApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function FoodCard({ item, onFavoriteToggle }) {
  const { user }    = useAuth()
  const { addItem } = useCart()
  const navigate    = useNavigate()
  const [adding, setAdding] = useState(false)
  const [fav, setFav]       = useState(item.isFavorite)

  const handleAdd = async (e) => {
    e.stopPropagation()
    if (!user) { navigate('/login'); return }
    setAdding(true)
    try { await addItem(item.id) }
    finally { setAdding(false) }
  }

  const handleFav = async (e) => {
    e.stopPropagation()
    if (!user) { navigate('/login'); return }
    try {
      if (fav) { await favoriteApi.remove(item.id); toast.success('Removed from favorites') }
      else     { await favoriteApi.add(item.id);    toast.success('Added to favorites!') }
      setFav(!fav)
      onFavoriteToggle?.()
    } catch {}
  }

  const discount = item.discountPrice && item.discountPrice < item.price
    ? Math.round((1 - item.discountPrice / item.price) * 100)
    : 0

  return (
    <div onClick={() => navigate(`/food/${item.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer group flex flex-col h-full">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 flex-shrink-0">
        <img src={item.imageUrl} alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => {
            e.target.onerror = null
            e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23fff7ed'/%3E%3Ccircle cx='200' cy='120' r='50' fill='%23fed7aa'/%3E%3Cpath d='M175 110 Q200 90 225 110 Q225 135 200 145 Q175 135 175 110Z' fill='%23f97316'/%3E%3Crect x='150' y='155' width='100' height='8' rx='4' fill='%23fdba74'/%3E%3Crect x='165' y='170' width='70' height='6' rx='3' fill='%23fdba74'/%3E%3C/svg%3E`
          }}
        />
        {/* Veg indicator */}
        <div className="absolute top-2 left-2 bg-white rounded-md p-1 shadow-sm">
          <div className={item.vegetarian ? 'veg-dot' : 'nonveg-dot'} />
        </div>
        {/* Bestseller */}
        {item.bestseller && (
          <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Flame className="w-3 h-3" /> Bestseller
          </div>
        )}
        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {discount}% OFF
          </div>
        )}
        {/* Fav button */}
        <button onClick={handleFav} aria-label={fav ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:scale-110 transition-transform">
          <Heart className={`w-4 h-4 ${fav ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>
      </div>

      {/* Info — flex-col so price row always sits at the bottom */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">{item.name}</h3>
        <p className="text-gray-500 text-xs mt-1 line-clamp-1">{item.description}</p>

        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            {Number(item.rating).toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {item.preparationTime} min
          </span>
        </div>

        {/* Push price row to bottom */}
        <div className="flex items-center justify-between mt-auto pt-3">
          <div>
            <span className="font-bold text-gray-900 text-base">₹{item.effectivePrice || item.price}</span>
            {discount > 0 && (
              <span className="text-xs text-gray-400 line-through ml-1.5">₹{item.price}</span>
            )}
          </div>
          {item.available ? (
            <button onClick={handleAdd} disabled={adding}
              aria-label={`Add ${item.name} to cart`}
              className="w-8 h-8 bg-brand-500 hover:bg-brand-600 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-brand-300 transition-all disabled:opacity-60">
              {adding ? <div className="spinner !w-4 !h-4 !border-2" /> : <Plus className="w-5 h-5" />}
            </button>
          ) : (
            <span className="text-xs text-red-500 font-medium">Unavailable</span>
          )}
        </div>
      </div>
    </div>
  )
}
