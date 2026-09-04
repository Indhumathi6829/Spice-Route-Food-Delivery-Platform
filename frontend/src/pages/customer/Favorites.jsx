import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { favoriteApi } from '../../api'
import FoodCard from '../../components/FoodCard'
import SkeletonCard from '../../components/SkeletonCard'

export default function Favorites() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    favoriteApi.getAll()
      .then(r => setItems(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="page-container">
      <div className="skeleton h-8 w-40 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  )

  return (
    <div className="page-container">
      <h1 className="section-title mb-6 flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500 fill-red-500" /> Saved Items
      </h1>
      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-20 h-20 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700">No favorites yet</h2>
          <p className="text-gray-500 mt-1">Tap the heart icon on any food item to save it here</p>
          <Link to="/menu" className="btn-primary mt-6 inline-flex">Browse Menu</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => <FoodCard key={item.id} item={item} onFavoriteToggle={load} />)}
        </div>
      )}
    </div>
  )
}
