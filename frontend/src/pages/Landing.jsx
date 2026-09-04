import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChefHat, Star, Clock, MapPin, Shield, Zap, Heart,
  ArrowRight, CheckCircle, Instagram, Facebook, Linkedin,
  Twitter, Youtube, Phone, Mail, Menu, X, Bike
} from 'lucide-react'

/* ─── Static Data ──────────────────────────────────────────────────────── */

const CATEGORIES = [
  { emoji: '🍛', name: 'Indian',        color: 'from-orange-400 to-red-400'     },
  { emoji: '🍕', name: 'Pizza',         color: 'from-yellow-400 to-orange-400'  },
  { emoji: '🍔', name: 'Burgers',       color: 'from-amber-400 to-yellow-400'   },
  { emoji: '🍜', name: 'Chinese',       color: 'from-red-400 to-pink-400'       },
  { emoji: '🍝', name: 'Italian',       color: 'from-green-400 to-teal-400'     },
  { emoji: '🌮', name: 'Mexican',       color: 'from-lime-400 to-green-400'     },
  { emoji: '🍣', name: 'Japanese',      color: 'from-pink-400 to-rose-400'      },
  { emoji: '🍗', name: 'Korean',        color: 'from-purple-400 to-indigo-400'  },
  { emoji: '🥙', name: 'Middle Eastern',color: 'from-teal-400 to-cyan-400'      },
  { emoji: '🍰', name: 'Desserts',      color: 'from-pink-300 to-purple-400'    },
  { emoji: '🍟', name: 'Snacks',        color: 'from-yellow-300 to-amber-400'   },
  { emoji: '🥤', name: 'Juices',        color: 'from-cyan-400 to-blue-400'      },
]

const FEATURED_DISHES = [
  {
    name: 'Hyderabadi Biryani',
    desc: 'Fragrant basmati with tender chicken',
    price: '₹349',
    rating: 4.9,
    time: '35 min',
    img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80',
    tag: 'Bestseller',
    veg: false,
  },
  {
    name: 'Butter Chicken',
    desc: 'Rich tomato-cream gravy, soft naan',
    price: '₹349',
    rating: 4.8,
    time: '25 min',
    img: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&q=80',
    tag: 'Fan Favourite',
    veg: false,
  },
  {
    name: 'Margherita Pizza',
    desc: 'Wood-fired, fresh mozzarella & basil',
    price: '₹299',
    rating: 4.7,
    time: '20 min',
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
    tag: 'Top Rated',
    veg: true,
  },
  {
    name: 'Paneer Tikka',
    desc: 'Tandoor-grilled cottage cheese, masala',
    price: '₹229',
    rating: 4.8,
    time: '18 min',
    img: 'https://images.unsplash.com/photo-1599487562484-e98e9c1ab3ca?w=400&q=80',
    tag: 'Pure Veg',
    veg: true,
  },
  {
    name: 'Chocolate Lava Cake',
    desc: 'Molten centre, vanilla ice cream',
    price: '₹179',
    rating: 4.9,
    time: '15 min',
    img: 'https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=400&q=80',
    tag: 'Must Try',
    veg: true,
  },
  {
    name: 'Classic Smash Burger',
    desc: 'Double patty, caramelised onions',
    price: '₹349',
    rating: 4.7,
    time: '15 min',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    tag: 'Crowd Pleaser',
    veg: false,
  },
]

const REVIEWS = [
  {
    name: 'Priya Sharma',
    city: 'Chennai',
    rating: 5,
    text: 'The Hyderabadi Biryani is absolutely authentic. Reminds me of Old Hyderabad. Fast delivery too!',
    avatar: 'P',
  },
  {
    name: 'Arjun Reddy',
    city: 'Bangalore',
    rating: 5,
    text: 'Butter Chicken was creamy and perfectly spiced. The naan was soft and fresh. Will order again!',
    avatar: 'A',
  },
  {
    name: 'Kavya Nair',
    city: 'Coimbatore',
    rating: 5,
    text: 'Amazing variety — from South Indian to Italian! The Paneer Tikka is a must-try. 10/10!',
    avatar: 'K',
  },
  {
    name: 'Ravi Kumar',
    city: 'Hyderabad',
    rating: 5,
    text: "Quick delivery in 25 minutes and the food was still hot! Best food delivery I've tried.",
    avatar: 'R',
  },
  {
    name: 'Meena Iyer',
    city: 'Mumbai',
    rating: 5,
    text: 'The Chocolate Lava Cake is divine. My family loves SpiceRoute. Consistent quality every time.',
    avatar: 'M',
  },
  {
    name: 'Dinesh Patel',
    city: 'Ahmedabad',
    rating: 4,
    text: 'Wide variety, great prices, and super fresh ingredients. The Masala Chai is surprisingly good!',
    avatar: 'D',
  },
]

const FEATURES = [
  {
    icon: Zap,
    title: 'Lightning Fast Delivery',
    desc: '25–45 minute average delivery. Live tracking so you always know where your food is.',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    icon: Star,
    title: 'Curated Worldwide Menu',
    desc: 'Indian, Chinese, Italian, Japanese, Mexican — 100+ dishes from around the world.',
    color: 'text-brand-500',
    bg: 'bg-brand-50',
  },
  {
    icon: Shield,
    title: 'Safe & Hygienic',
    desc: 'FSSAI certified kitchen, contactless delivery, and real-time partner tracking.',
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
  {
    icon: Heart,
    title: 'Made with Love',
    desc: 'Every dish crafted by our expert chefs using the finest spices and fresh ingredients.',
    color: 'text-rose-500',
    bg: 'bg-rose-50',
  },
]

const STATS = [
  { value: '50K+',  label: 'Happy Customers' },
  { value: '100+',  label: 'Menu Items' },
  { value: '4.8★',  label: 'Average Rating' },
  { value: '25 min', label: 'Avg Delivery' },
]

const CITIES = ['Chennai', 'Bangalore', 'Coimbatore', 'Hyderabad', 'Mumbai', 'Delhi', 'Pune', 'Kolkata']

/* ─── Sub-components ───────────────────────────────────────────────────── */

function StarRow({ rating, size = 'w-4 h-4' }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${size} ${i <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
        />
      ))}
    </div>
  )
}

function DishCard({ dish, idx }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      style={{ animationDelay: `${idx * 80}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden h-48">
        <img
          src={dish.img}
          alt={dish.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${hovered ? 'scale-110' : 'scale-100'}`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full text-gray-800">
          {dish.tag}
        </span>
        <span className={`absolute top-3 right-3 w-5 h-5 rounded border-2 flex items-center justify-center ${dish.veg ? 'border-green-600' : 'border-red-600'}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${dish.veg ? 'bg-green-600' : 'bg-red-600'}`} />
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm">{dish.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{dish.desc}</p>
        <div className="flex items-center gap-1 mt-2">
          <StarRow rating={Math.round(dish.rating)} size="w-3 h-3" />
          <span className="text-xs text-gray-500 ml-0.5">{dish.rating}</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-base font-bold text-gray-900">{dish.price}</span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {dish.time}
          </div>
        </div>
      </div>
    </div>
  )
}

function CategoryPill({ cat }) {
  const slug = cat.name.toLowerCase().replace(/\s+/g, '-')
  return (
    <Link to={`/menu/${encodeURIComponent(slug)}?q=${encodeURIComponent(cat.name)}`} className="flex-shrink-0 group">
      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl md:text-3xl shadow-md group-hover:scale-110 transition-transform duration-200`}>
        {cat.emoji}
      </div>
      <p className="text-xs font-medium text-gray-700 text-center mt-2 leading-tight">{cat.name}</p>
    </Link>
  )
}

/* ─── Main Component ───────────────────────────────────────────────────── */

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [reviewIdx, setReviewIdx] = useState(0)

  useEffect(() => {
    // Fade-in on mount
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  // Auto-advance reviews carousel every 4s
  useEffect(() => {
    const t = setInterval(() => setReviewIdx(i => (i + 1) % Math.ceil(REVIEWS.length / 3)), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className={`min-h-screen bg-white transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg leading-tight font-display">
              SpiceRoute<span className="text-brand-500"> Kitchen</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#menu"      className="hover:text-brand-600 transition-colors">Menu</a>
            <a href="#features"  className="hover:text-brand-600 transition-colors">Features</a>
            <a href="#reviews"   className="hover:text-brand-600 transition-colors">Reviews</a>
            <a href="#locations" className="hover:text-brand-600 transition-colors">Locations</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-brand-600 transition-colors px-4 py-2 rounded-xl hover:bg-brand-50">
              Login
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-5">
              Create Account
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            <a href="#menu"     className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMobileMenuOpen(false)}>Menu</a>
            <a href="#features" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#reviews"  className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMobileMenuOpen(false)}>Reviews</a>
            <div className="flex gap-3 pt-2">
              <Link to="/login"    className="flex-1 btn-secondary text-sm py-2.5" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="flex-1 btn-primary  text-sm py-2.5" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-orange-400 text-white">
        {/* Background decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] left-[-60px] w-60 h-60 rounded-full bg-white/5" />

        {/* Floating food emojis */}
        {['🍛','🍕','🍔','🌶️','🍚','🍣','🌮','🥙'].map((e, i) => (
          <div
            key={i}
            className="absolute text-4xl md:text-5xl opacity-10 select-none pointer-events-none"
            style={{
              top:  `${10 + (i * 11) % 70}%`,
              left: `${5  + (i * 13) % 90}%`,
              animation: `float-${i % 3} ${4 + i}s ease-in-out infinite`,
            }}
          >
            {e}
          </div>
        ))}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left column */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Delivering across India
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-tight">
                Good food.<br />
                Great moments.<br />
                <span className="text-yellow-300">Delivered to you.</span>
              </h1>
              <p className="mt-5 text-lg text-orange-100 max-w-md leading-relaxed">
                From authentic Indian flavours to world cuisines — 100+ dishes crafted fresh and delivered hot to your doorstep.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register" className="bg-white text-brand-600 font-bold px-7 py-3.5 rounded-2xl hover:bg-orange-50 transition-all shadow-lg flex items-center gap-2 text-sm">
                  Explore Menu <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/login" className="border-2 border-white/60 text-white font-semibold px-7 py-3.5 rounded-2xl hover:bg-white/10 transition-all text-sm">
                  Login
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex items-center gap-4 text-sm text-orange-100">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-300" /> FSSAI Certified</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-300" /> Live Tracking</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-300" /> 30 min avg</span>
              </div>
            </div>

            {/* Right column — dish cards */}
            <div className="hidden md:block">
              <div className="relative">
                {/* Primary card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&q=80"
                    alt="Biryani"
                    className="w-full h-56 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">Hyderabadi Biryani</p>
                        <p className="text-xs text-gray-500">Fragrant basmati, tender chicken</p>
                      </div>
                      <span className="font-bold text-brand-600 text-lg">₹349</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <StarRow rating={5} size="w-3.5 h-3.5" />
                      <span className="text-xs text-gray-500">4.9 · 1,200+ orders</span>
                    </div>
                  </div>
                </div>

                {/* Floating mini card */}
                <div className="absolute -bottom-6 -left-8 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-3 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bike className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">25 min delivery</p>
                    <p className="text-xs text-green-600">Partner on the way!</p>
                  </div>
                </div>

                {/* Rating badge */}
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-gray-900 rounded-2xl shadow-lg p-3 text-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <p className="text-2xl font-black">4.8</p>
                  <p className="text-xs font-bold flex items-center justify-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Rating
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats band ─────────────────────────────────────────────────── */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(s => (
              <div key={s.label}>
                <p className="text-3xl font-black text-brand-400">{s.value}</p>
                <p className="text-sm text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────────────────────── */}
      <section id="menu" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-display text-gray-900">Explore Cuisines</h2>
            <p className="text-gray-500 mt-2">From Indian street food to world cuisine — something for everyone</p>
          </div>
          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-6 lg:grid-cols-12 md:overflow-visible scrollbar-hide">
            {CATEGORIES.map(cat => <CategoryPill key={cat.name} cat={cat} />)}
          </div>
        </div>
      </section>

      {/* ── Featured Dishes ────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold font-display text-gray-900">Most Loved Dishes</h2>
              <p className="text-gray-500 mt-1">Order favourites of thousands of happy customers</p>
            </div>
            <Link to="/browse" className="hidden md:flex items-center gap-1 text-brand-600 font-semibold text-sm hover:underline">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {FEATURED_DISHES.map((dish, i) => <DishCard key={dish.name} dish={dish} idx={i} />)}
          </div>
          <div className="text-center mt-8">
            <Link to="/browse" className="btn-primary inline-flex px-8 py-3">
              Browse Menu <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-gray-900">Why SpiceRoute Kitchen?</h2>
            <p className="text-gray-500 mt-2">Built for food lovers who expect the best</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => {
              const Icon = f.icon
              return (
                <div key={f.title} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 ${f.bg} rounded-2xl flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-gray-900">Order in 3 Simple Steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', emoji: '📍', title: 'Set Your Location', desc: 'Enter your delivery address or use current location. We deliver pan-India.' },
              { step: '02', emoji: '🍽️', title: 'Choose Your Food', desc: 'Browse 100+ dishes across 12 cuisines. Filter by category, rating, or price.' },
              { step: '03', emoji: '🚀', title: 'Fast Delivery', desc: 'Pay online or cash. Track your order live. Delivered in 25–45 minutes.' },
            ].map(s => (
              <div key={s.step} className="text-center group">
                <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:bg-brand-100 transition-colors">
                  {s.emoji}
                </div>
                <div className="text-xs font-bold text-brand-400 tracking-widest mb-2">STEP {s.step}</div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ────────────────────────────────────────────────────── */}
      <section id="reviews" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-display text-gray-900">What Customers Say</h2>
            <p className="text-gray-500 mt-2">Real reviews from real food lovers across India</p>
          </div>

          {/* Stars aggregate */}
          <div className="flex justify-center items-center gap-3 mb-10">
            <div className="text-center">
              <p className="text-5xl font-black text-gray-900">4.8</p>
              <StarRow rating={5} size="w-5 h-5" />
              <p className="text-sm text-gray-500 mt-1">Based on 2,400+ reviews</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {REVIEWS.map(r => (
              <div key={r.name} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <StarRow rating={r.rating} size="w-4 h-4" />
                <p className="text-sm text-gray-700 mt-3 leading-relaxed">"{r.text}"</p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-9 h-9 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {r.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {r.city}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Locations ──────────────────────────────────────────────────── */}
      <section id="locations" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-display text-gray-900">Delivering Across India</h2>
            <p className="text-gray-500 mt-2">Already serving these cities — and expanding!</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {CITIES.map(c => (
              <span key={c} className="flex items-center gap-1.5 bg-brand-50 text-brand-700 font-semibold text-sm px-4 py-2.5 rounded-full border border-brand-100 hover:bg-brand-100 transition-colors cursor-pointer">
                <MapPin className="w-3.5 h-3.5" /> {c}
              </span>
            ))}
            <span className="flex items-center gap-1.5 bg-gray-100 text-gray-600 font-medium text-sm px-4 py-2.5 rounded-full">
              + 50 more cities
            </span>
          </div>
        </div>
      </section>

      {/* ── CTA banner ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-brand-600 to-orange-500 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Ready to taste the difference?
          </h2>
          <p className="text-orange-100 mb-8 text-lg">
            Join 50,000+ happy customers. First order gets 50% off with code WELCOME50.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-brand-600 font-bold px-8 py-4 rounded-2xl hover:bg-orange-50 transition-all shadow-lg text-sm">
              Create Free Account
            </Link>
            <Link to="/browse" className="border-2 border-white/70 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all text-sm">
              Browse Menu First
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                  <ChefHat className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white text-sm">SpiceRoute Kitchen</span>
              </div>
              <p className="text-xs leading-relaxed">Bringing delicious food closer to you. Fresh, fast, and full of flavour.</p>
              <div className="flex gap-3 mt-4">
                {[Instagram, Facebook, Twitter, Linkedin, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-brand-500 transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* About */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">About</h4>
              <ul className="space-y-2 text-xs">
                {[['About Us','/about'],['Our Story','/story'],['Careers','/careers'],['Help & Support','/help'],['Blog','/blog']].map(([l,to]) => (
                  <li key={l}><Link to={to} className="hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>

            {/* Locations */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Locations</h4>
              <ul className="space-y-2 text-xs">
                {[['Chennai','/locations'],['Bangalore','/locations'],['Hyderabad','/locations'],['Mumbai','/locations'],['Delhi','/locations'],['More...','/locations']].map(([l,to]) => (
                  <li key={l}><Link to={to} className="hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-xs">
                {[['Privacy Policy','/privacy'],['Terms of Service','/terms'],['Refund Policy','/refund'],['Cookie Policy','/cookies']].map(([l,to]) => (
                  <li key={l}><Link to={to} className="hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Contact</h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                  <a href="mailto:support@spiceroute.com" className="hover:text-white transition-colors">support@spiceroute.com</a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                  <span>+91 98765 43210</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                  <span>Pan-India delivery</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
            <p>© 2026 SpiceRoute Kitchen. All rights reserved.</p>
            <div className="flex items-center gap-1">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500 inline mx-0.5" />
              <span>in India 🇮🇳</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating animation keyframes */}
      <style>{`
        @keyframes float-0 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes float-1 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-18px); } }
        @keyframes float-2 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px);  } }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
