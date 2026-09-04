import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Home, Briefcase, MapPin, Star } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { addressApi } from '../../api'
import toast from 'react-hot-toast'

const TYPE_ICON = { HOME: Home, WORK: Briefcase, OTHER: MapPin }
const TYPE_COLOR = { HOME: 'text-blue-500', WORK: 'text-orange-500', OTHER: 'text-gray-500' }

export default function Addresses() {
  const [addresses, setAddresses] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  const load = () => {
    setLoading(true)
    addressApi.getAll().then(r => setAddresses(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const onSubmit = async (data) => {
    try {
      await addressApi.add({ ...data, isDefault: data.isDefault === 'true' })
      toast.success('Address saved!')
      setShowForm(false)
      reset()
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return
    try {
      await addressApi.delete(id)
      toast.success('Deleted')
      load()
    } catch { toast.error('Cannot delete') }
  }

  const setDefault = async (id) => {
    try {
      await addressApi.setDefault(id)
      toast.success('Default address updated')
      load()
    } catch {}
  }

  return (
    <div className="page-container max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/profile" className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="section-title flex-1">Saved Addresses</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 px-4">
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card mb-6 animate-slide-up">
          <h3 className="font-bold text-gray-900 mb-4">New Address</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Your Name</label>
                <input className="input text-sm" placeholder="Name for delivery" {...register('fullName')} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Phone</label>
                <input className="input text-sm" type="tel" placeholder="Mobile number" {...register('phone')} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">House / Flat No. *</label>
                <input className="input text-sm" placeholder="A-101"
                  {...register('houseNumber', { required: 'Required' })} />
                {errors.houseNumber && <p className="text-red-500 text-xs mt-1">{errors.houseNumber.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Street *</label>
                <input className="input text-sm" placeholder="MG Road"
                  {...register('street', { required: 'Required' })} />
                {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Area / Locality</label>
                <input className="input text-sm" placeholder="Anna Nagar" {...register('area')} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">City *</label>
                <input className="input text-sm" placeholder="Chennai"
                  {...register('city', { required: 'Required' })} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">State *</label>
                <input className="input text-sm" placeholder="Tamil Nadu"
                  {...register('state', { required: 'Required' })} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">PIN Code *</label>
                <input className="input text-sm" placeholder="600001"
                  {...register('postalCode', { required: 'Required', pattern: { value: /^\d{6}$/, message: '6-digit PIN' } })} />
                {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Type</label>
                <select className="input text-sm" {...register('addressType')}>
                  <option value="HOME">🏠 Home</option>
                  <option value="WORK">💼 Work</option>
                  <option value="OTHER">📍 Other</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input type="checkbox" id="isDefault" value="true" className="accent-brand-500" {...register('isDefault')} />
                <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">Set as default</label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary">
                {isSubmitting ? 'Saving...' : 'Save Address'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); reset() }} className="flex-1 btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-20">
          <MapPin className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No saved addresses</h3>
          <p className="text-gray-500 mt-1">Add your first delivery address above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map(a => {
            const Icon = TYPE_ICON[a.addressType] || MapPin
            return (
              <div key={a.id} className={`card flex items-start gap-4 ${a.isDefault ? 'ring-2 ring-brand-200' : ''}`}>
                <div className={`w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${TYPE_COLOR[a.addressType] || 'text-gray-500'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 text-sm">{a.fullName || a.addressType}</p>
                    <span className={`badge ${a.addressType === 'HOME' ? 'badge-blue' : a.addressType === 'WORK' ? 'badge-orange' : 'badge-gray'} text-xs`}>
                      {a.addressType}
                    </span>
                    {a.isDefault && (
                      <span className="badge badge-green text-xs flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-current" /> Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{a.houseNumber}, {a.street}{a.area ? `, ${a.area}` : ''}</p>
                  <p className="text-sm text-gray-600">{a.city}, {a.state} — {a.postalCode}</p>
                  {a.phone && <p className="text-xs text-gray-400 mt-0.5">{a.phone}</p>}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {!a.isDefault && (
                    <button onClick={() => setDefault(a.id)}
                      className="text-xs text-brand-600 hover:underline font-medium">
                      Set default
                    </button>
                  )}
                  <button onClick={() => handleDelete(a.id)}
                    className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors self-end">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
