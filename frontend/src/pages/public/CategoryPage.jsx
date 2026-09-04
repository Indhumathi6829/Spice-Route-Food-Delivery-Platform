/**
 * CategoryPage — /menu/:categorySlug?categoryId=X
 * Dedicated category browse page with proper title, description and filtered food grid.
 */
import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, SlidersHorizontal, Utensils } from 'lucide-react'
import { categoryApi, foodApi } from '../../api'
import PublicFoodCard from '../../components/PublicFoodCard'
import SkeletonCard from '../../components/SkeletonCard'
import CategoryIcon from '../../components/CategoryIcon'

const SORT_OPTIONS = [
  { value: 'rating',  label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price',   label: 'Price: Low to High' },
  { value: 'newest',  label: 'Newest' },
]

export default function CategoryPage() {
  const { categorySlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryId = searchParams.get('categoryId')
  const sortBy     = searchParams.get('sortBy') || 'rating'
  const vegetarian = searchParams.get('vegetarian') || ''
  const page       = parseInt(searchParams.get('page') || '0')

  const [category,   setCategory]   = useState(null)
  const [foods,      setFoods]      = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [showSort,   setShowSort]   = useState(false)

  useEffect(() => {
    if (categoryId) {
      categoryApi.getById(categoryId)
        .then(r => setCategory(r.data))
        .catch(() => {})
    }
  }, [categoryId])

  useEffect(() => {
    if (!categoryId) return
    setLoading(true)
    foodApi.search({
      categoryId,
      vegetarian: vegetarian || undefined,
      sortBy,
      sortDir: sortBy === 'price' ? 'asc' : 'desc',
      page, size: 20,
    }).then(r => {
      setFoods(r.data.content || [])
      setTotalPages(r.data.totalPages || 0)
    }).catch(() => setFoods([]))
     .finally(() => setLoading(false))
  }, [categoryId, vegetarian, sortBy, page])

  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams)
    if (val) next.set(key, val); else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back */}
      <Link to="/browse" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand-600 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      {/* Category header */}
      {category ? (
        <div className="flex items-center gap-4 mb-6">
          <CategoryIcon name={category.name} size="w-8 h-8" containerClass="w-16 h-16 flex-shrink-0" />
          <div>
            <h1 className="text-2xl font-bold font-display text-gray-900">{category.name}</h1>
            {category.description && <p className="text-gray-500 text-sm mt-0.5">{category.description}</p>}
          </div>
        </div>
      ) : (
        <div className="skeleton h-16 w-64 rounded-2xl mb-6" />
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {/* Diet filter */}
        <div className="flex gap-2">
          {[{ v: '', l: 'All' }, { v: 'true', l: '🟢 Veg' }, { v: 'false', l: '🔴 Non-Veg' }].map(o => (
            <button key={o.v} onClick={() => setParam('vegetarian', o.v)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${vegetarian === o.v ? 'bg-brand-500 text-white border-brand-500' : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300'}`}>
              {o.l}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="relative ml-auto">
          <button onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 hover:border-brand-400 transition-all">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Sort'}
          </button>
          {showSort && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden w-44">
              {SORT_OPTIONS.map(o => (
                <button key={o.value} onClick={() => { setParam('sortBy', o.value); setShowSort(false) }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${sortBy === o.value ? 'bg-brand-50 text-brand-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Food count */}
      {!loading && <p className="text-sm text-gray-500 mb-4">{foods.length}{totalPages > 1 ? '+' : ''} items</p>}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : foods.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CategoryIcon name={category?.name || ''} size="w-10 h-10" containerClass="w-20 h-20" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">No items found</h3>
          <p className="text-gray-500 mt-1">Try a different filter</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {foods.map(item => <PublicFoodCard key={item.id} item={item} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8 flex-wrap">
              {[...Array(Math.min(totalPages, 10))].map((_, i) => (
                <button key={i}
                  onClick={() => { const n = new URLSearchParams(searchParams); n.set('page', i); setSearchParams(n) }}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${i === page ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 hover:border-brand-400'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
