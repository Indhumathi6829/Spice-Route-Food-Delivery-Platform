import { NavLink } from 'react-router-dom'
import { Home, Search, ShoppingBag, Heart, User } from 'lucide-react'
import { useCart } from '../context/CartContext'

const tabs = [
  { to: '/home',      icon: Home,        label: 'Home' },
  { to: '/browse',    icon: Search,      label: 'Menu' },
  { to: '/orders',    icon: ShoppingBag, label: 'Orders' },
  { to: '/favorites', icon: Heart,       label: 'Saved' },
  { to: '/profile',   icon: User,        label: 'Profile' },
]

export default function BottomNav() {
  const { itemCount } = useCart()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 safe-b">
      <div className="flex">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
              isActive ? 'text-brand-500' : 'text-gray-400 hover:text-gray-600'
            }`
          }>
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon className={`w-6 h-6 ${isActive ? 'text-brand-500' : ''}`} />
                  {to === '/orders' && itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span className="mt-0.5">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
