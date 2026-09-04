import { useEffect, useState } from 'react'
import { Plus, Tag, Edit2, Trash2, ToggleLeft, ToggleRight, X, Calendar, Percent, IndianRupee } from 'lucide-react'
import { festivalOfferApi } from '../../api'
import toast from 'react-hot-toast'

const EMPTY = {
  festivalName: '', title: '', description: '', bannerImage: '',
  discountType: 'PERCENTAGE', discountValue: '', maximumDiscount: '',
  minimumOrderValue: '', couponCode: '', startDate: '', endDate: '',
  applicableCategories: '', active: true,
}

const STATUS_COLORS = {
  ACTIVE:   'badge-green',
  UPCOMING: 'badge-blue',
  EXPIRED:  'badge-gray',
  INACTIVE: 'badge-red',
}

export default function AdminFestivalOffers() {
  const [offers,   setOffers]  = useState([])
  const [loading,  setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)

  const load = () => {
    setLoading(true)
    festivalOfferApi.getAll()
      .then(r => setOffers(r.data || []))
      .catch(() => toast.error('Failed to load offers'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openNew  = () => { setForm(EMPTY); setEditing(null); setShowForm(true) }
  const openEdit = (o) => {
    setForm({
      ...o,
      startDate: o.startDate?.slice(0, 16) || '',
      endDate:   o.endDate?.slice(0, 16)   || '',
      discountValue:    o.discountValue    || '',
      maximumDiscount:  o.maximumDiscount  || '',
      minimumOrderValue: o.minimumOrderValue || '',
    })
    setEditing(o.id)
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.festivalName || !form.title || !form.discountValue || !form.startDate || !form.endDate) {
      toast.error('Fill all required fields'); return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        discountValue:    Number(form.discountValue),
        maximumDiscount:  form.maximumDiscount  ? Number(form.maximumDiscount)  : undefined,
        minimumOrderValue: form.minimumOrderValue ? Number(form.minimumOrderValue) : 0,
        startDate: new Date(form.startDate).toISOString().replace('Z', ''),
        endDate:   new Date(form.endDate).toISOString().replace('Z', ''),
      }
      if (editing) {
        await festivalOfferApi.update(editing, payload)
        toast.success('Offer updated!')
      } else {
        await festivalOfferApi.create(payload)
        toast.success('Offer created!')
      }
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this festival offer?')) return
    try {
      await festivalOfferApi.delete(id)
      toast.success('Deleted')
      load()
    } catch { toast.error('Failed to delete') }
  }

  const handleToggle = async (id) => {
    try {
      await festivalOfferApi.toggle(id)
      load()
    } catch { toast.error('Failed') }
  }

  const field = (key, val) => setForm(f => ({ ...f, [key]: val }))

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title flex items-center gap-2">
          <Tag className="w-6 h-6 text-brand-500" /> Festival Offers
        </h1>
        <button onClick={openNew} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> New Offer
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Offers', val: offers.length,                                    color: 'text-gray-900', bg: 'bg-gray-50' },
          { label: 'Active Now',   val: offers.filter(o => o.status === 'ACTIVE').length,  color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Upcoming',     val: offers.filter(o => o.status === 'UPCOMING').length, color: 'text-blue-600',  bg: 'bg-blue-50' },
          { label: 'Expired',      val: offers.filter(o => o.status === 'EXPIRED').length, color: 'text-gray-400',  bg: 'bg-gray-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : offers.length === 0 ? (
        <div className="text-center py-16">
          <Tag className="w-14 h-14 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">No festival offers yet. Create your first one!</p>
          <button onClick={openNew} className="btn-primary mt-4 text-sm">Create Offer</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map(o => (
            <div key={o.id} className={`card relative overflow-hidden ${!o.active ? 'opacity-60' : ''}`}>
              {/* Color top bar by status */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                o.status === 'ACTIVE' ? 'bg-green-400' :
                o.status === 'UPCOMING' ? 'bg-blue-400' : 'bg-gray-300'
              }`} />
              <div className="pt-2">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{o.festivalName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{o.title}</p>
                  </div>
                  <span className={`badge ${STATUS_COLORS[o.status] || 'badge-gray'} text-xs flex-shrink-0`}>{o.status}</span>
                </div>

                <div className="flex items-center gap-3 text-sm font-bold text-brand-600 mb-2">
                  {o.discountType === 'PERCENTAGE'
                    ? <><Percent className="w-4 h-4" /> {o.discountValue}% OFF</>
                    : <><IndianRupee className="w-4 h-4" /> ₹{o.discountValue} OFF</>
                  }
                  {o.couponCode && (
                    <span className="font-mono text-xs bg-brand-50 border border-brand-200 px-2 py-0.5 rounded text-brand-700">
                      {o.couponCode}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                  <Calendar className="w-3 h-3" />
                  {new Date(o.startDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                  {' → '}
                  {new Date(o.endDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                </div>

                {o.minimumOrderValue > 0 && (
                  <p className="text-xs text-gray-400 mb-3">Min order: ₹{o.minimumOrderValue}</p>
                )}

                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(o)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => handleToggle(o.id)}
                    className={`p-1.5 rounded-lg transition-colors ${o.active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                    {o.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => handleDelete(o.id)}
                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl my-4"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{editing ? 'Edit Festival Offer' : 'Create Festival Offer'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Festival Name *</label>
                  <input className="input" value={form.festivalName} onChange={e => field('festivalName', e.target.value)} placeholder="Diwali Feast" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Offer Title *</label>
                  <input className="input" value={form.title} onChange={e => field('title', e.target.value)} placeholder="20% OFF on all orders" required />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
                <textarea className="input resize-none" rows={2} value={form.description}
                  onChange={e => field('description', e.target.value)} placeholder="Celebrate Diwali with SpiceRoute..." />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Discount Type *</label>
                  <select className="input" value={form.discountType} onChange={e => field('discountType', e.target.value)}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Discount Value *</label>
                  <input className="input" type="number" min="0.01" step="0.01" value={form.discountValue}
                    onChange={e => field('discountValue', e.target.value)} placeholder={form.discountType === 'PERCENTAGE' ? '20' : '100'} required />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Max Discount (₹)</label>
                  <input className="input" type="number" min="0" value={form.maximumDiscount}
                    onChange={e => field('maximumDiscount', e.target.value)} placeholder="200" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Coupon Code</label>
                  <input className="input font-mono uppercase" value={form.couponCode}
                    onChange={e => field('couponCode', e.target.value.toUpperCase())} placeholder="DIWALI20" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Min Order (₹)</label>
                  <input className="input" type="number" min="0" value={form.minimumOrderValue}
                    onChange={e => field('minimumOrderValue', e.target.value)} placeholder="199" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Start Date & Time *</label>
                  <input className="input" type="datetime-local" value={form.startDate}
                    onChange={e => field('startDate', e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">End Date & Time *</label>
                  <input className="input" type="datetime-local" value={form.endDate}
                    onChange={e => field('endDate', e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Banner Image URL</label>
                <input className="input" type="url" value={form.bannerImage}
                  onChange={e => field('bannerImage', e.target.value)} placeholder="https://..." />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="active" checked={form.active}
                  onChange={e => field('active', e.target.checked)} className="w-4 h-4 accent-brand-500" />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">Active (visible to customers)</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary py-3">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary py-3">
                  {saving ? 'Saving...' : editing ? 'Update Offer' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
