import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, Utensils } from 'lucide-react'
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

export default function MenuBrowse() {
  const [params, setParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [foods, setFoods]           = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading]       = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(params.get('q') || '')

  const q          = params.get('q') || ''
  const categoryId = params.get('categoryId') || ''
  const vegetarian = params.get('vegetarian') || ''
  const sortBy     = params.get('sortBy') || 'rating'
  const page       = parseInt(params.get('page') || '0')

  const setParam = (key, val) => {
    const next = new URLSearchParams(params)
    if (val) next.set(key, val); else next.delete(key)
    next.delete('page')
    setParams(next)
  }

  const fetchFoods = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await foodApi.search({
        q: q || undefined,
        categoryId: categoryId || undefined,
        vegetarian: vegetarian || undefined,
        sortBy, sortDir: sortBy === 'price' ? 'asc' : 'desc',
        page, size: 16,
      })
      setFoods(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch {
      setFoods([])
    } finally { setLoading(false) }
  }, [q, categoryId, vegetarian, sortBy, page])

  useEffect(() => { categoryApi.getAll().then(r => setCategories(r.data || [])) }, [])
  useEffect(() => { fetchFoods() }, [fetchFoods])

  const activeCategory = categories.find(c => c.id == categoryId)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="section-title flex items-center gap-3">
          {activeCategory && (
            <CategoryIcon name={activeCategory.name} size="w-6 h-6" containerClass="w-10 h-10 flex-shrink-0" />
          )}
          {activeCategory ? activeCategory.name : 'Our Menu'}
        </h1>
        {activeCategory?.description && <p className="text-gray-500 text-sm mt-1">{activeCategory.description}</p>}
      </div>

      {/* Search & Filter bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            className="input pl-11"
            placeholder="Search food..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') setParam('q', searchInput)
            }}
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card mb-6 animate-slide-up">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
              <select className="input" value={categoryId} onChange={e => setParam('categoryId', e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Diet</label>
              <div className="flex gap-2">
                {[{ v: '', l: 'All' }, { v: 'true', l: '🟢 Veg' }, { v: 'false', l: '🔴 Non-Veg' }].map(o => (
                  <button key={o.v} onClick={() => setParam('vegetarian', o.v)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${vegetarian === o.v ? 'bg-brand-500 text-white border-brand-500' : 'border-gray-200 text-gray-600 hover:border-brand-300'}`}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
              <select className="input" value={sortBy} onChange={e => setParam('sortBy', e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          {(q || categoryId || vegetarian) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              {q         && <Chip label={`"${q}"`} onRemove={() => { setParam('q', ''); setSearchInput('') }} />}
              {categoryId && <Chip label={categories.find(c => c.id == categoryId)?.name} onRemove={() => setParam('categoryId', '')} />}
              {vegetarian && <Chip label={vegetarian === 'true' ? 'Veg Only' : 'Non-Veg Only'} onRemove={() => setParam('vegetarian', '')} />}
            </div>
          )}
        </div>
      )}

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        <button onClick={() => setParam('categoryId', '')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${!categoryId ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-400'}`}>
          All
        </button>
        {categories.map(c => (
          <button key={c.id} onClick={() => setParam('categoryId', c.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${categoryId == c.id ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-400'}`}>
            <CategoryIcon name={c.name} size="w-3.5 h-3.5" containerClass="w-5 h-5" />
            {c.name}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : foods.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">No items found</h3>
          <p className="text-gray-500 mt-1">Try a different search or category</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{foods.length}{totalPages > 1 ? '+' : ''} items found</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {foods.map(item => <PublicFoodCard key={item.id} item={item} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8 flex-wrap">
              {[...Array(Math.min(totalPages, 10))].map((_, i) => (
                <button key={i} onClick={() => { const n = new URLSearchParams(params); n.set('page', i); setParams(n) }}
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

function Chip({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1 bg-brand-100 text-brand-700 text-xs font-medium px-3 py-1.5 rounded-full">
      {label}
      <button onClick={onRemove}><X className="w-3 h-3" /></button>
    </span>
  )
}
