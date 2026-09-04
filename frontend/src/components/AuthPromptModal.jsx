/**
 * AuthPromptModal — shown when a guest tries to add to cart, wishlist, or order.
 * Does NOT create anonymous orders. Simply prompts login/register.
 */
import { Link } from 'react-router-dom'
import { X, ShoppingCart, Heart, Lock, LogIn, UserPlus } from 'lucide-react'

const ACTION_COPY = {
  cart:     { icon: ShoppingCart, title: 'Login required to add to cart',    desc: 'Sign in to your account to add items and place orders.' },
  wishlist: { icon: Heart,        title: 'Login required to save items',      desc: 'Sign in to save your favourite dishes to your wishlist.' },
  order:    { icon: Lock,         title: 'Login required to place an order',  desc: 'Create a free account or sign in to complete your order.' },
  review:   { icon: Lock,         title: 'Login required to write a review',  desc: 'Sign in to share your experience with other customers.' },
  checkout: { icon: Lock,         title: 'Login required to checkout',        desc: 'Please sign in to proceed with your order.' },
}

export default function AuthPromptModal({ action = 'cart', onClose }) {
  const { icon: Icon, title, desc } = ACTION_COPY[action] || ACTION_COPY.cart

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
        />

        {/* Icon */}
        <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-brand-500" />
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-gray-900 text-center font-display mb-2">{title}</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{desc}</p>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            to="/login"
            onClick={onClose}
            className="btn-primary w-full justify-center py-3"
          >
            <LogIn className="w-4 h-4" />
            Login
          </Link>
          <Link
            to="/register"
            onClick={onClose}
            className="btn-secondary w-full justify-center py-3"
          >
            <UserPlus className="w-4 h-4" />
            Create Account — It's Free
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          You can continue browsing without logging in.
        </p>
      </div>
    </div>
  )
}
