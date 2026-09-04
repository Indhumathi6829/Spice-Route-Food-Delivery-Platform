import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search, FolderPlus, X, Check } from 'lucide-react'
import { foodApi, categoryApi } from '../../api'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function AdminMenu() {
  const [foods,      setFoods]      = useState([])
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [showForm,   setShowForm]   = useState(false)
  const [editing,    setEditing]    = useState(null)

  // inline new-category state
  const [showNewCat,    setShowNewCat]    = useState(false)
  const [newCatName,    setNewCatName]    = useState('')
  const [newCatLoading, setNewCatLoading] = useState(false)

  const { register, handleSubmit, reset, setValue, watch } = useForm()

  const load = () => {
    setLoading(true)
    Promise.all([foodApi.search({ page: 0, size: 100 }), categoryApi.getAll(false)])
      .then(([f, c]) => { setFoods(f.data.content || []); setCategories(c.data) })
      .finally(() => setLoading(false))
  }

  const loadCategories = () =>
    categoryApi.getAll(false).then(c => setCategories(c.data))

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditing(null)
    setShowNewCat(false)
    setNewCatName('')
    reset({})
    setShowForm(true)
  }

  const openEdit = (f) => {
    setEditing(f)
    setShowNewCat(false)
    setNewCatName('')
    reset({ ...f, categoryId: f.categoryId })
    setShowForm(true)
  }

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await foodApi.update(editing.id, data)
        toast.success('Food item updated!')
      } else {
        await foodApi.create(data)
        toast.success('Food item created!')
      }
      setShowForm(false)
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Operation failed')
    }
  }

  // Create new category inline and auto-select it
  const handleCreateCategory = async () => {
    if (!newCatName.trim()) { toast.error('Enter a category name'); return }
    setNewCatLoading(true)
    try {
      const res = await categoryApi.create({ name: newCatName.trim(), active: true })
      const created = res.data
      await loadCategories()
      setValue('categoryId', String(created.id))
      setNewCatName('')
      setShowNewCat(false)
      toast.success(`Category "${created.name}" created and selected!`)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create category')
    } finally {
      setNewCatLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this food item?')) return
    try {
      await foodApi.delete(id)
      toast.success('Deleted!')
      load()
    } catch { toast.error('Cannot delete') }
  }

  const handleToggle = async (id) => {
    try { await foodApi.toggleAvailability(id); load() }
    catch { toast.error('Toggle failed') }
  }

  const filtered = foods.filter(f =>
    !search || f.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">Menu Management</h1>
        <button onClick={openAdd} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* ── Food Item Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="font-bold text-lg text-gray-900 mb-4">{editing ? 'Edit' : 'Add'} Food Item</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">

                {/* Name */}
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Name *</label>
                  <input className="input" {...register('name', { required: true })} placeholder="Chicken Biryani" />
                </div>

                {/* Category + inline create */}
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Category *</label>

                  {!showNewCat ? (
                    <div className="flex gap-2">
                      <select className="input flex-1" {...register('categoryId', { required: true })}>
                        <option value="">Select category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowNewCat(true)}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-brand-300 bg-brand-50 text-brand-600 text-sm font-medium hover:bg-brand-100 transition-colors"
                        title="Create a new category"
                      >
                        <FolderPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">New</span>
                      </button>
                    </div>
                  ) : (
                    /* Inline new-category input */
                    <div className="rounded-xl border border-brand-300 bg-brand-50 p-3 space-y-2">
                      <p className="text-xs font-semibold text-brand-700 flex items-center gap-1">
                        <FolderPlus className="w-3.5 h-3.5" /> Create New Category
                      </p>
                      <div className="flex gap-2">
                        <input
                          autoFocus
                          className="input flex-1 text-sm"
                          placeholder="Category name e.g. Thai Food"
                          value={newCatName}
                          onChange={e => setNewCatName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateCategory() } }}
                        />
                        <button
                          type="button"
                          onClick={handleCreateCategory}
                          disabled={newCatLoading}
                          className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-60 transition-colors"
                        >
                          {newCatLoading
                            ? <span className="spinner !w-4 !h-4 !border-2 border-white border-t-transparent" />
                            : <Check className="w-4 h-4" />
                          }
                          <span className="hidden sm:inline">{newCatLoading ? 'Creating…' : 'Create'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowNewCat(false); setNewCatName('') }}
                          className="flex-shrink-0 p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-brand-500">Category will be created and auto-selected.</p>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Price (₹) *</label>
                  <input className="input" type="number" step="0.01" {...register('price', { required: true })} />
                </div>

                {/* Discount Price */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Discount Price (₹)</label>
                  <input className="input" type="number" step="0.01" {...register('discountPrice')} />
                </div>

                {/* Prep Time */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Prep Time (min)</label>
                  <input className="input" type="number" {...register('preparationTime')} />
                </div>

                {/* Image URL */}
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Image URL</label>
                  <input className="input" {...register('imageUrl')} placeholder="https://..." />
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                  <textarea className="input min-h-[70px] resize-none" {...register('description')} />
                </div>

                {/* Checkboxes */}
                <div className="col-span-2 flex gap-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-brand-500" {...register('vegetarian')} />
                    <span className="font-medium">Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-brand-500" {...register('bestseller')} />
                    <span className="font-medium">Bestseller</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-brand-500" {...register('available')} defaultChecked />
                    <span className="font-medium">Available</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 btn-primary">Save</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input className="input pl-9" placeholder="Search food items..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Food grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(f => (
            <div key={f.id} className={`card transition-opacity ${f.available ? '' : 'opacity-60'}`}>
              <div className="flex items-start gap-3">
                <img src={f.imageUrl} alt={f.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  onError={e => { e.target.src = `https://via.placeholder.com/64x64/f97316/white?text=${f.name?.[0]}` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className={f.vegetarian ? 'veg-dot' : 'nonveg-dot'} />
                    <h3 className="font-semibold text-sm text-gray-900 truncate">{f.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500">{f.categoryName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-brand-600">₹{f.effectivePrice || f.price}</span>
                    {f.discountPrice && <span className="text-xs text-gray-400 line-through">₹{f.price}</span>}
                  </div>
                  {f.bestseller && <span className="badge badge-orange text-xs mt-1">Bestseller</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => openEdit(f)} className="flex-1 btn-ghost text-xs py-1.5 gap-1 justify-center">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleToggle(f.id)}
                  className={`flex-1 btn-ghost text-xs py-1.5 gap-1 justify-center ${f.available ? 'text-green-600' : 'text-gray-400'}`}>
                  {f.available ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  {f.available ? 'On' : 'Off'}
                </button>
                <button onClick={() => handleDelete(f.id)} className="flex-1 btn-ghost text-xs py-1.5 gap-1 justify-center text-red-500">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
