import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ShoppingCart, Bell, LogOut, ChefHat, Menu, X, User,
  ShoppingBag, Heart, MapPin, Settings, ChevronDown,
  ClipboardList, Store, LayoutDashboard, Bike,
  Star, Wifi, WifiOff, Users, Package, BarChart2,
  Tag, Gift, MessageSquare, HelpCircle, Shield, Bot
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useState, useRef, useEffect } from 'react'

// ── Per-role dropdown menus ───────────────────────────────────────────────────

const CUSTOMER_MENU = [
  { label: 'My Profile',       to: '/profile',       icon: User        },
  { label: 'My Orders',        to: '/orders',         icon: ShoppingBag },
  { label: 'Wishlist',         to: '/favorites',      icon: Heart       },
  { label: 'Saved Addresses',  to: '/addresses',      icon: MapPin      },
  { label: 'Notifications',    to: '/notifications',  icon: Bell        },
  { label: 'Settings',         to: '/profile?tab=settings', icon: Settings },
  { label: 'Help Center',      to: '/help',           icon: HelpCircle  },
]

const DELIVERY_MENU = [
  { label: 'Dashboard',        to: '/delivery',          icon: LayoutDashboard },
  { label: 'Delivery History', to: '/delivery/history',  icon: ClipboardList   },
  { label: 'My Reviews',       to: '/delivery/history?tab=reviews', icon: Star },
  { label: 'Notifications',    to: '/notifications',     icon: Bell            },
  { label: 'Settings',         to: '/profile',           icon: Settings        },
  { label: 'Help Center',      to: '/help',              icon: HelpCircle      },
]

const ADMIN_MENU = [
  { label: 'Dashboard',        to: '/admin',                 icon: LayoutDashboard },
  { label: 'Orders',           to: '/admin/orders',          icon: ShoppingBag     },
  { label: 'Menu',             to: '/admin/menu',            icon: Store           },
  { label: 'Customers',        to: '/admin/customers',       icon: Users           },
  { label: 'Delivery',         to: '/admin/delivery',        icon: Bike            },
  { label: 'Reviews',          to: '/admin/reviews',         icon: Star            },
  { label: 'Offers',           to: '/admin/festival-offers', icon: Gift            },
  { label: 'Analytics',        to: '/admin/analytics',       icon: BarChart2       },
  { label: '🤖 AI Recovery',   to: '/admin/recovery',        icon: Bot             },
  { label: 'Notifications',    to: '/notifications',         icon: Bell            },
]

// ── Dropdown component ────────────────────────────────────────────────────────

function AccountDropdown({ user, menu, onClose, onLogout }) {
  return (
    <div
      className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden animate-fade-in"
      role="menu"
      aria-label="Account menu"
    >
      {/* User info header */}
      <div className="px-4 py-3.5 border-b border-gray-100 bg-gradient-to-r from-brand-50 to-orange-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-orange-400 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1.5 max-h-[320px] overflow-y-auto">
        {menu.map(item => {
          const Icon = item.icon
          return (
            <Link
              key={item.to + item.label}
              to={item.to}
              onClick={onClose}
              role="menuitem"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors group"
            >
              <Icon className="w-4 h-4 text-gray-400 group-hover:text-brand-500 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Logout */}
      <div className="border-t border-gray-100 py-1.5">
        <button
          onClick={onLogout}
          role="menuitem"
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  )
}

// ── Main Navbar ───────────────────────────────────────────────────────────────

export default function Navbar() {
  const { user, logout }  = useAuth()
  const { itemCount }     = useCart()
  const navigate          = useNavigate()
  const location          = useLocation()
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [dropdownOpen, setDropdown]   = useState(false)
  const dropdownRef = useRef(null)

  const isAdmin    = user?.role === 'RESTAURANT_ADMIN' || user?.role === 'SUPER_ADMIN'
  const isDelivery = user?.role === 'DELIVERY_PARTNER'
  const isCustomer = user?.role === 'CUSTOMER'

  const dropdownMenu = isAdmin ? ADMIN_MENU : isDelivery ? DELIVERY_MENU : CUSTOMER_MENU

  const handleLogout = () => {
    setDropdown(false)
    setMobileOpen(false)
    logout()
    navigate('/login')
  }

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!dropdownOpen) return
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false)
      }
    }
    const handleKey = (e) => { if (e.key === 'Escape') setDropdown(false) }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [dropdownOpen])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const adminLinks = [
    { to: '/admin',                  label: 'Dashboard' },
    { to: '/admin/menu',             label: 'Menu'      },
    { to: '/admin/orders',           label: 'Orders'    },
    { to: '/admin/delivery',         label: 'Delivery'  },
    { to: '/admin/coupons',          label: 'Coupons'   },
    { to: '/admin/festival-offers',  label: 'Offers'    },
    { to: '/admin/analytics',        label: 'Analytics' },
    { to: '/admin/reviews',          label: 'Reviews'   },
    { to: '/admin/recovery',         label: '🤖 AI Recovery', highlight: true },
  ]

  const deliveryLinks = [
    { to: '/delivery',         label: 'Active Deliveries' },
    { to: '/delivery/history', label: 'History'           },
  ]

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/')

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-brand-300 transition-shadow">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-gray-900 hidden sm:block">
              SpiceRoute <span className="text-brand-500">Kitchen</span>
            </span>
          </Link>

          {/* Desktop nav links (admin / delivery) */}
          {user && (
            <div className="hidden md:flex items-center gap-0.5 flex-1 px-4">
              {isAdmin && adminLinks.map(l => (
                <Link key={l.to} to={l.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    l.highlight
                      ? isActive(l.to)
                        ? 'bg-brand-500 text-white'
                        : 'bg-gradient-to-r from-brand-500 to-orange-400 text-white hover:opacity-90'
                      : isActive(l.to)
                        ? 'bg-brand-50 text-brand-600'
                        : 'text-gray-600 hover:text-brand-600 hover:bg-brand-50'
                  }`}>
                  {l.label}
                </Link>
              ))}
              {isDelivery && deliveryLinks.map(l => (
                <Link key={l.to} to={l.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(l.to)
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-gray-600 hover:text-brand-600 hover:bg-brand-50'
                  }`}>
                  {l.label}
                </Link>
              ))}
              {isCustomer && (
                <>
                  <Link to="/browse" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/browse') ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:text-brand-600 hover:bg-brand-50'}`}>
                    Browse
                  </Link>
                  <Link to="/menu" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/menu') ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:text-brand-600 hover:bg-brand-50'}`}>
                    Menu
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Right actions */}
          {user ? (
            <div className="flex items-center gap-1.5">
              {/* Cart — customers only */}
              {isCustomer && (
                <Link to="/cart" aria-label="Cart" className="relative p-2 rounded-xl hover:bg-brand-50 transition-colors">
                  <ShoppingCart className="w-6 h-6 text-gray-700" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce-in">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Notifications */}
              <Link to="/notifications" aria-label="Notifications" className="hidden sm:flex p-2 rounded-xl hover:bg-brand-50 transition-colors">
                <Bell className="w-6 h-6 text-gray-700" />
              </Link>

              {/* Account dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdown(v => !v)}
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                  aria-label="Account menu"
                  className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-brand-50 transition-colors border border-transparent hover:border-brand-100"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-orange-400 rounded-full flex items-center justify-center font-semibold text-white text-sm flex-shrink-0">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate">{user.name?.split(' ')[0]}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <AccountDropdown
                    user={user}
                    menu={dropdownMenu}
                    onClose={() => setDropdown(false)}
                    onLogout={handleLogout}
                  />
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
                onClick={() => setMobileOpen(v => !v)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login"    className="btn-ghost text-sm py-2 px-4">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && user && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          {/* User info */}
          <div className="px-4 py-3 bg-gradient-to-r from-brand-50 to-orange-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-orange-400 rounded-full flex items-center justify-center font-bold text-white">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="py-2 px-3 space-y-0.5 max-h-[70vh] overflow-y-auto">
            {/* Role-specific nav links */}
            {isAdmin && adminLinks.map(l => (
              <Link key={l.to} to={l.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700">
                {l.label}
              </Link>
            ))}
            {isDelivery && deliveryLinks.map(l => (
              <Link key={l.to} to={l.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700">
                {l.label}
              </Link>
            ))}
            {isCustomer && (
              <>
                <Link to="/browse" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700">
                  Browse Menu
                </Link>
                <Link to="/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700">
                  <ShoppingBag className="w-4 h-4" /> My Orders
                </Link>
                <Link to="/favorites" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700">
                  <Heart className="w-4 h-4" /> Wishlist
                </Link>
                <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700">
                  <User className="w-4 h-4" /> Profile
                </Link>
              </>
            )}
            <Link to="/notifications" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700">
              <Bell className="w-4 h-4" /> Notifications
            </Link>

            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
