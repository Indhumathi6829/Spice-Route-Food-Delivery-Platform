import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ChefHat, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const [showPw, setShowPw] = useState(false)

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password)
      toast.success(`Welcome back, ${user.name}!`)
      switch (user.role) {
        case 'CUSTOMER':           navigate('/home');     break
        case 'RESTAURANT_ADMIN':
        case 'SUPER_ADMIN':        navigate('/admin');    break
        case 'DELIVERY_PARTNER':   navigate('/delivery'); break
        default:                   navigate('/')
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Login failed. Check your credentials.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo + heading */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display text-gray-900">Welcome back 🍴</h1>
          <p className="text-gray-500 mt-1">Sign in to SpiceRoute Kitchen</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input className="input" type="email" placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                })} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
              </div>
              <div className="relative">
                <input className="input pr-10" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 mt-2">
              {isSubmitting ? <><div className="spinner" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 font-semibold hover:underline">Create account</Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-5 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-xs font-semibold text-amber-800 mb-2">🧪 Demo Accounts</p>
            <div className="space-y-1 text-xs text-amber-700">
              <p>👤 Customer: <strong>priya@example.com</strong> / Test@123</p>
              <p>🛡️ Admin: <strong>admin@spiceroute.com</strong> / Admin@123</p>
              <p>🛵 Delivery: <strong>vijay@spiceroute.com</strong> / Delivery@123</p>
            </div>
          </div>
        </div>

        {/* Back to landing */}
        <p className="text-center text-xs text-gray-400 mt-6">
          <Link to="/" className="hover:text-brand-500 transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  )
}
