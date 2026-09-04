import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChefHat, Search, Flame, Star, ArrowRight, Clock, MapPin,
  Zap, Shield
} from 'lucide-react'
import { categoryApi, foodApi, reviewApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import SkeletonCard from '../../components/SkeletonCard'
import PublicFoodCard from '../../components/PublicFoodCard'
import FestivalBanner from '../../components/FestivalBanner'
import CategoryIcon from '../../components/CategoryIcon'

export default function PublicHome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [categories,  setCategories]  = useState([])
  const [bestsellers, setBestsellers] = useState([])
  const [topRated,    setTopRated]    = useState([])
  const [reviews,     setReviews]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [searchQuery, setSearch]      = useState('')

  useEffect(() => {
    Promise.all([
      categoryApi.getAll(),
      foodApi.getBestsellers(),
      foodApi.getTopRated(8),
      reviewApi.getPublic(0, 6),
    ]).then(([cats, best, top, revs]) => {
      setCategories(cats.data || [])
      setBestsellers(best.data || [])
      setTopRated(top.data || [])
      setReviews(revs.data?.content || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/menu?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Festival Banners */}
      <FestivalBanner />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-600 via-brand-500 to-orange-400 text-white overflow-hidden">
        {/* Decorative background circles */}
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-60 h-60 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <ChefHat className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                🌶️ SpiceRoute Kitchen
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight">
              Authentic Flavours,<br />Delivered Fresh
            </h1>
            <p className="mt-4 text-lg text-orange-100 max-w-xl">
              From fragrant Biryanis to crispy Starters — every bite crafted with love and the finest spices.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-orange-100">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 25–45 min delivery</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Free delivery on ₹299+</span>
              <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> FSSAI Certified</span>
            </div>
            {/* Search */}
            <div className="mt-8 relative max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                value={searchQuery}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Search for Biryani, Pizza, Burger..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            {/* Auth CTA for guests */}
            {!user && (
              <div className="mt-6 flex gap-3 flex-wrap">
                <Link to="/register" className="bg-white text-brand-600 font-bold px-6 py-3 rounded-2xl hover:bg-orange-50 transition-all shadow-lg text-sm flex items-center gap-2">
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/login" className="border-2 border-white/60 text-white font-semibold px-6 py-3 rounded-2xl hover:bg-white/10 transition-all text-sm">
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Browse by Category</h2>
            <Link to="/menu" className="text-brand-500 text-sm font-medium hover:underline flex items-center gap-1">
              All categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-8 lg:grid-cols-10 md:overflow-visible">
            {loading
              ? [...Array(10)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div className="skeleton w-16 h-16 rounded-2xl" />
                    <div className="skeleton h-3 w-14 rounded" />
                  </div>
                ))
              : categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/menu/${encodeURIComponent(cat.name.toLowerCase().replace(/\s+/g, '-'))}?categoryId=${cat.id}`}
                  className="flex-shrink-0 flex flex-col items-center gap-2 group"
                  aria-label={cat.name}
                >
                  <CategoryIcon
                    name={cat.name}
                    size="w-7 h-7"
                    containerClass="w-16 h-16 group-hover:scale-110 group-hover:shadow-lg transition-all duration-200"
                  />
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight whitespace-nowrap">{cat.name}</span>
                </Link>
              ))
            }
          </div>
        </section>

        {/* Bestsellers */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-brand-500" />
              <h2 className="section-title">Bestsellers</h2>
            </div>
            <Link to="/menu?bestsellers=true" className="text-brand-500 text-sm font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 items-stretch">
            {loading
              ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
              : bestsellers.slice(0, 8).map(item => <PublicFoodCard key={item.id} item={item} />)
            }
          </div>
        </section>

        {/* Top Rated */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <h2 className="section-title">Highly Rated</h2>
            </div>
            <Link to="/menu?sortBy=rating" className="text-brand-500 text-sm font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 items-stretch">
            {loading
              ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
              : topRated.slice(0, 8).map(item => <PublicFoodCard key={item.id} item={item} />)
            }
          </div>
        </section>

        {/* Features */}
        <section className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: Zap, title: 'Lightning Fast', desc: '25–45 min average delivery with live tracking', color: 'text-amber-500', bg: 'bg-amber-50' },
            { icon: Star, title: '100+ Dishes', desc: 'Indian, Chinese, Italian, Japanese & more', color: 'text-brand-500', bg: 'bg-brand-50' },
            { icon: Shield, title: 'FSSAI Certified', desc: 'Safe, hygienic kitchen with contactless delivery', color: 'text-green-500', bg: 'bg-green-50' },
          ].map(f => {
            const Icon = f.icon
            return (
              <div key={f.title} className="bg-white rounded-2xl p-5 shadow-card flex items-start gap-4">
                <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{f.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            )
          })}
        </section>

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="bg-white rounded-3xl p-6 shadow-card">
            <h2 className="section-title mb-5">What Our Customers Say</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map(r => (
                <div key={r.id} className="bg-gray-50 rounded-2xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {r.customerName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{r.customerName}</p>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < r.foodRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3 italic">"{r.comment || 'Great food!'}"</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA for non-logged-in */}
        {!user && (
          <section className="bg-gradient-to-r from-brand-600 to-orange-500 rounded-3xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold font-display mb-2">Ready to order?</h2>
            <p className="text-orange-100 mb-6 max-w-md mx-auto">
              Create a free account to add items to your cart, track orders, and unlock exclusive offers.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Link to="/register" className="bg-white text-brand-600 font-bold px-7 py-3 rounded-2xl hover:bg-orange-50 transition-all shadow-lg text-sm">
                Create Free Account
              </Link>
              <Link to="/login" className="border-2 border-white/60 text-white font-semibold px-7 py-3 rounded-2xl hover:bg-white/10 transition-all text-sm">
                Login
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
