import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ChefHat, Eye, EyeOff, User, Bike, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const ROLES = [
  {
    value: 'CUSTOMER',
    label: 'Customer',
    icon: User,
    desc: 'Order food & track deliveries',
    color: 'brand',
  },
  {
    value: 'DELIVERY_PARTNER',
    label: 'Delivery Partner',
    icon: Bike,
    desc: 'Deliver orders & earn money',
    color: 'green',
  },
  {
    value: 'ADMIN',
    label: 'Admin',
    icon: ShieldCheck,
    desc: 'Manage restaurant & orders',
    color: 'purple',
  },
]

const COLOR_MAP = {
  brand:  { ring: 'ring-brand-500',  bg: 'bg-brand-50',  text: 'text-brand-600',  icon: 'text-brand-500'  },
  green:  { ring: 'ring-green-500',  bg: 'bg-green-50',  text: 'text-green-600',  icon: 'text-green-500'  },
  purple: { ring: 'ring-purple-500', bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
}

export default function Register() {
  const { register: authRegister } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { role: 'CUSTOMER' },
  })
  const [showPw,  setShowPw]  = useState(false)
  const [showCode, setShowCode] = useState(false)

  const selectedRole = watch('role')
  const isAdmin = selectedRole === 'ADMIN'

  const onSubmit = async (data) => {
    // Map our UI 'ADMIN' value to backend RESTAURANT_ADMIN
    const backendRole = data.role === 'ADMIN' ? 'RESTAURANT_ADMIN' : data.role

    try {
      const user = await authRegister({
        name:      data.name,
        email:     data.email,
        password:  data.password,
        phone:     data.phone,
        role:      backendRole,
        adminCode: data.adminCode || undefined,
      })
      toast.success(`Welcome to SpiceRoute, ${user.name}!`)
      switch (user.role) {
        case 'CUSTOMER':           navigate('/home');     break
        case 'RESTAURANT_ADMIN':
        case 'SUPER_ADMIN':        navigate('/admin');    break
        case 'DELIVERY_PARTNER':   navigate('/delivery'); break
        default:                   navigate('/')
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display text-gray-900">Join SpiceRoute Kitchen</h1>
          <p className="text-gray-500 mt-1">Create your account to get started</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Role selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">I want to join as</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(r => {
                  const c = COLOR_MAP[r.color]
                  const Icon = r.icon
                  const selected = selectedRole === r.value
                  return (
                    <label key={r.value}
                      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all
                        ${selected
                          ? `${c.ring} ring-2 ${c.bg} border-transparent`
                          : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                      <input type="radio" value={r.value} {...register('role')} className="sr-only" />
                      <Icon className={`w-5 h-5 ${selected ? c.icon : 'text-gray-400'}`} />
                      <span className={`text-xs font-semibold text-center leading-tight ${selected ? c.text : 'text-gray-600'}`}>
                        {r.label}
                      </span>
                    </label>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 mt-1.5 text-center">
                {ROLES.find(r => r.value === selectedRole)?.desc}
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input className="input" placeholder="Priya Sharma"
                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input className="input" type="email" placeholder="you@example.com"
                {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone <span className="text-gray-400">(optional)</span></label>
              <input className="input" type="tel" placeholder="9876543210"
                {...register('phone', { pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit mobile number' } })} />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input className="input pr-10" type={showPw ? 'text' : 'password'} placeholder="Min 6 characters"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Admin code — only shown when Admin role is selected */}
            {isAdmin && (
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <p className="text-xs text-purple-700 font-medium mb-2 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin authorization required
                </p>
                <div className="relative">
                  <input className="input text-sm" type={showCode ? 'text' : 'password'}
                    placeholder="Enter admin authorization code"
                    {...register('adminCode', { required: isAdmin ? 'Authorization code required for admin signup' : false })} />
                  <button type="button" onClick={() => setShowCode(!showCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.adminCode && <p className="text-red-500 text-xs mt-1">{errors.adminCode.message}</p>}
                <p className="text-xs text-purple-500 mt-1">Contact your system administrator to obtain this code.</p>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 mt-2">
              {isSubmitting
                ? <><div className="spinner" /> Creating account...</>
                : `Create ${ROLES.find(r => r.value === selectedRole)?.label} Account`}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
