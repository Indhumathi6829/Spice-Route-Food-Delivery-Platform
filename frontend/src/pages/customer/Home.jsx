import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChefHat, Search, Flame, Star, ArrowRight, Clock, MapPin, Shield, Zap, AlertCircle, Bot } from 'lucide-react'
import { categoryApi, foodApi, reviewApi, recoveryApi, orderApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import FoodCard from '../../components/FoodCard'
import SkeletonCard from '../../components/SkeletonCard'
import FestivalBanner from '../../components/FestivalBanner'
import CategoryIcon from '../../components/CategoryIcon'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [categories,   setCategories]  = useState([])
  const [bestsellers,  setBestsellers] = useState([])
  const [topRated,     setTopRated]    = useState([])
  const [reviews,      setReviews]     = useState([])
  const [loading,      setLoading]     = useState(true)
  const [searchQuery,  setSearch]      = useState('')
  const [failedCount,  setFailedCount] = useState(0)   // AI Recovery banner

  useEffect(() => {
    Promise.all([
      categoryApi.getAll(),
      foodApi.getBestsellers(),
      foodApi.getTopRated(8),
      reviewApi.getPublic(0, 5),
    ]).then(([cats, best, top, revs]) => {
      setCategories(cats.data)
      setBestsellers(best.data)
      setTopRated(top.data)
      setReviews(revs.data?.content || [])
    }).finally(() => setLoading(false))

    // Silently check for failed/pending recovery cases
    Promise.all([
      recoveryApi.getMyRecoveries().catch(() => ({ data: [] })),
      orderApi.getMyOrders(0, 50).catch(() => ({ data: { content: [] } })),
    ]).then(([recRes, ordRes]) => {
      const myRecoveries  = recRes.data || []
      const allOrders     = ordRes.data?.content || []
      const activeRecoveries = myRecoveries.filter(r =>
        r.status === 'IN_PROGRESS' || r.status === 'PENDING'
      ).length
      const unrecoveredOrders = allOrders.filter(o =>
        o.status === 'PLACED' && o.paymentMethod === 'RAZORPAY'
      ).length
      setFailedCount(activeRecoveries + unrecoveredOrders)
    }).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Festival Banners */}
      <FestivalBanner />

      {/* ── AI Payment Recovery Banner (shown only when there are pending recoveries) ── */}
      {failedCount > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Link to="/orders/failed" className="flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    🔄 {failedCount} payment{failedCount > 1 ? 's' : ''} need{failedCount === 1 ? 's' : ''} recovery
                  </p>
                  <p className="text-xs text-orange-100">
                    AI Recovery Agent is ready — tap to view and retry your saved orders
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-xl text-sm font-medium flex-shrink-0">
                Recover Now <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-600 via-brand-500 to-orange-400 text-white overflow-hidden">
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-60 h-60 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <ChefHat className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                SpiceRoute Kitchen
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight">
              Authentic Flavours,<br />Delivered Fresh
            </h1>
            <p className="mt-4 text-lg text-orange-100 max-w-xl">
              From fragrant Biryanis to crispy Starters — every bite is crafted with love and the finest spices.
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
                onKeyDown={e => e.key === 'Enter' && searchQuery.trim() && navigate(`/menu?q=${encodeURIComponent(searchQuery)}`)}
                placeholder="Search for Biryani, Pizza, Burger..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Browse by Category</h2>
            <Link to="/browse" className="text-brand-500 text-sm font-medium hover:underline flex items-center gap-1">
              All categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-8 lg:grid-cols-10 md:overflow-visible" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
                  to={`/menu/${encodeURIComponent(cat.name.toLowerCase().replace(/\s+/g,'-'))}?categoryId=${cat.id}`}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 items-stretch">
            {loading
              ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
              : bestsellers.slice(0, 8).map(item => <FoodCard key={item.id} item={item} />)
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
              : topRated.slice(0, 8).map(item => <FoodCard key={item.id} item={item} />)
            }
          </div>
        </section>

        {/* Features strip */}
        <section className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: Zap,    title: 'Lightning Fast',    desc: '25–45 min average delivery with live tracking', color: 'text-amber-500', bg: 'bg-amber-50' },
            { icon: Star,   title: '100+ Dishes',       desc: 'Indian, Chinese, Italian, Japanese & more',     color: 'text-brand-500', bg: 'bg-brand-50' },
            { icon: Shield, title: 'FSSAI Certified',   desc: 'Safe, hygienic kitchen with contactless delivery', color: 'text-green-500', bg: 'bg-green-50' },
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

        {/* Restaurant info */}
        <section className="bg-gradient-to-r from-brand-600 to-orange-500 rounded-3xl p-8 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold font-display mb-3">About SpiceRoute Kitchen</h2>
              <p className="text-orange-100 leading-relaxed">
                A modern Indian restaurant bringing the rich culinary heritage of spices to your doorstep.
                From slow-cooked Hyderabadi Biryani to crispy street-style Starters — crafted with the finest ingredients.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-4">
                {[['500+', 'Happy Customers'], ['25+', 'Menu Items'], ['4.5★', 'Avg Rating']].map(([n, l]) => (
                  <div key={l}>
                    <p className="text-2xl font-bold">{n}</p>
                    <p className="text-xs text-orange-100">{l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { Icon: ChefHat, label: 'Expert Chefs'     },
                  { Icon: Flame,   label: 'Fresh Spices'     },
                  { Icon: Shield,  label: 'Quality Assured'  },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-xs text-orange-100">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
