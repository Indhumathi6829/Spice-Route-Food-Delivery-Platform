import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search, Tag } from 'lucide-react'
import { categoryApi } from '../../api'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { CategoryIcon } from '../../components/CategoryIcon'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [showForm,   setShowForm]   = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const load = () => {
    setLoading(true)
    categoryApi.getAll(false)
      .then(r => setCategories(r.data))
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditing(null)
    reset({ name: '', description: '', imageUrl: '', icon: '', sortOrder: '', active: true })
    setShowForm(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    reset({
      name:        cat.name        || '',
      description: cat.description || '',
      imageUrl:    cat.imageUrl    || '',
      icon:        cat.icon        || '',
      sortOrder:   cat.sortOrder   ?? '',
      active:      cat.active      ?? true,
    })
    setShowForm(true)
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    const payload = {
      name:        data.name,
      description: data.description || null,
      imageUrl:    data.imageUrl    || null,
      icon:        data.icon        || null,
      sortOrder:   data.sortOrder   ? Number(data.sortOrder) : null,
      active:      data.active,
    }
    try {
      if (editing) {
        await categoryApi.update(editing.id, payload)
        toast.success('Category updated!')
      } else {
        await categoryApi.create(payload)
        toast.success('Category created!')
      }
      setShowForm(false)
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return
    try {
      await categoryApi.delete(id)
      toast.success('Category deleted')
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Cannot delete — category may have food items')
    }
  }

  const handleToggle = async (id) => {
    try {
      await categoryApi.toggle(id)
      load()
    } catch {
      toast.error('Toggle failed')
    }
  }

  const filtered = categories.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">Food Categories</h1>
        <button onClick={openAdd} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <h2 className="font-bold text-lg text-gray-900 mb-4">
              {editing ? 'Edit Category' : 'New Category'}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  className={`input ${errors.name ? 'border-red-400 focus:ring-red-300' : ''}`}
                  placeholder="e.g. Biryani"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                <textarea
                  className="input min-h-[72px] resize-none"
                  placeholder="Short description of this category"
                  {...register('description')}
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Image URL</label>
                <input
                  className="input"
                  placeholder="https://..."
                  {...register('imageUrl')}
                />
              </div>

              {/* Icon */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Icon (emoji or name)</label>
                <input
                  className="input"
                  placeholder="e.g. 🍛 or pizza"
                  {...register('icon')}
                />
              </div>

              {/* Sort Order */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Sort Order</label>
                <input
                  className="input"
                  type="number"
                  placeholder="0"
                  {...register('sortOrder')}
                />
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-brand-500"
                  {...register('active')}
                />
                <span className="text-sm font-medium text-gray-700">Active (visible to customers)</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn-primary disabled:opacity-60"
                >
                  {submitting ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          className="input pl-9"
          placeholder="Search categories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Summary chips */}
      {!loading && (
        <div className="flex gap-3 mb-5 text-sm">
          <span className="px-3 py-1 bg-brand-50 text-brand-600 rounded-full font-medium">
            {categories.length} total
          </span>
          <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full font-medium">
            {categories.filter(c => c.active).length} active
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full font-medium">
            {categories.filter(c => !c.active).length} inactive
          </span>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Tag className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-medium">No categories found</p>
          {search && <p className="text-sm mt-1">Try a different search term</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(cat => (
            <div
              key={cat.id}
              className={`card flex items-center gap-4 transition-all ${
                !cat.active ? 'opacity-60' : ''
              }`}
            >
              {/* Icon */}
              <CategoryIcon
                name={cat.name}
                size="w-7 h-7"
                containerClass="w-14 h-14 flex-shrink-0"
                variant="gradient"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 truncate">{cat.name}</p>
                  {!cat.active && (
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-full flex-shrink-0">
                      inactive
                    </span>
                  )}
                </div>
                {cat.description && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">{cat.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  {cat.itemCount ?? 0} item{cat.itemCount !== 1 ? 's' : ''}
                  {cat.sortOrder != null ? ` · order ${cat.sortOrder}` : ''}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-1.5 rounded-lg hover:bg-brand-50 text-gray-500 hover:text-brand-600 transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggle(cat.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    cat.active
                      ? 'hover:bg-amber-50 text-amber-500 hover:text-amber-600'
                      : 'hover:bg-green-50 text-gray-400 hover:text-green-600'
                  }`}
                  title={cat.active ? 'Deactivate' : 'Activate'}
                >
                  {cat.active
                    ? <ToggleRight className="w-4 h-4" />
                    : <ToggleLeft  className="w-4 h-4" />
                  }
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
