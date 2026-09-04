import { useEffect, useState } from 'react'
import { Tag, Plus, Pencil, Trash2 } from 'lucide-react'
import { couponApi } from '../../api'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const { register, handleSubmit, reset } = useForm()

  const load = () => {
    setLoading(true)
    couponApi.getAll().then(r => setCoupons(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); reset({}); setShowForm(true) }
  const openEdit = (c) => { setEditing(c); reset(c); setShowForm(true) }

  const onSubmit = async (data) => {
    try {
      if (editing) { await couponApi.update(editing.id, data); toast.success('Coupon updated!') }
      else         { await couponApi.create(data);             toast.success('Coupon created!') }
      setShowForm(false); load()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete coupon?')) return
    try { await couponApi.delete(id); toast.success('Deleted!'); load() }
    catch { toast.error('Cannot delete') }
  }

  const handleToggle = async (id) => {
    try { await couponApi.toggle(id); load() }
    catch { toast.error('Toggle failed') }
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title flex items-center gap-2"><Tag className="w-6 h-6 text-brand-500" /> Coupons</h1>
        <button onClick={openAdd} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Add Coupon</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="font-bold text-lg mb-4">{editing ? 'Edit' : 'Create'} Coupon</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Coupon Code *</label>
                <input className="input uppercase" {...register('code', { required: true })} placeholder="SAVE50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
                  <select className="input" {...register('discountType', { required: true })}>
                    <option value="FLAT">Flat (₹)</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Value *</label>
                  <input className="input" type="number" step="0.01" {...register('discountValue', { required: true })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Min Order (₹)</label>
                  <input className="input" type="number" {...register('minimumOrderValue')} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Max Discount (₹)</label>
                  <input className="input" type="number" {...register('maximumDiscount')} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
                  <input className="input" type="datetime-local" {...register('startDate', { required: true })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Expiry Date</label>
                  <input className="input" type="datetime-local" {...register('expiryDate', { required: true })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Usage Limit (blank = unlimited)</label>
                <input className="input" type="number" {...register('usageLimit')} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" className="flex-1 btn-primary">Save</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {coupons.map(c => (
            <div key={c.id} className={`card flex items-center gap-4 flex-wrap ${!c.active || !c.valid ? 'opacity-60' : ''}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-brand-600 text-base bg-brand-50 px-2 py-0.5 rounded-lg">{c.code}</span>
                  <span className={`badge ${c.discountType === 'FLAT' ? 'badge-green' : 'badge-orange'}`}>
                    {c.discountType === 'FLAT' ? `₹${c.discountValue} OFF` : `${c.discountValue}% OFF`}
                  </span>
                  {c.active && c.valid ? <span className="badge badge-green">Active</span> : <span className="badge badge-red">Inactive</span>}
                </div>
                <div className="text-xs text-gray-500 mt-1 flex gap-3 flex-wrap">
                  {c.minimumOrderValue && <span>Min: ₹{c.minimumOrderValue}</span>}
                  {c.maximumDiscount && <span>Max: ₹{c.maximumDiscount}</span>}
                  <span>Used: {c.usageCount}/{c.usageLimit || '∞'}</span>
                  <span>Expires: {new Date(c.expiryDate).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="btn-ghost text-sm py-1.5 px-3"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleToggle(c.id)} className={`btn-ghost text-sm py-1.5 px-3 ${c.active ? 'text-green-600' : 'text-gray-400'}`}>
                  {c.active ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => handleDelete(c.id)} className="btn-ghost text-sm py-1.5 px-3 text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {coupons.length === 0 && <div className="text-center py-10 text-gray-500">No coupons yet. Create one!</div>}
        </div>
      )}
    </div>
  )
}
