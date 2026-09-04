import { useEffect, useState } from 'react'
import { Users, Search, ToggleLeft, ToggleRight } from 'lucide-react'
import { adminApi } from '../../api'
import toast from 'react-hot-toast'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')

  useEffect(() => {
    adminApi.getCustomers().then(r => setCustomers(r.data)).finally(() => setLoading(false))
  }, [])

  const toggle = async (id, currentActive) => {
    try {
      await adminApi.toggleUser(id)
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, active: !currentActive } : c))
      toast.success(currentActive ? 'Account deactivated' : 'Account activated')
    } catch { toast.error('Failed to toggle account') }
  }

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title flex items-center gap-2"><Users className="w-6 h-6 text-brand-500" /> Customers</h1>
        <span className="badge badge-blue">{customers.length} total</span>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input className="input pl-9" placeholder="Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Customer', 'Email', 'Phone', 'Joined', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center font-semibold text-brand-600 text-xs flex-shrink-0">
                        {c.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900 truncate max-w-[120px]">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{c.email}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${c.active ? 'badge-green' : 'badge-red'}`}>{c.active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(c.id, c.active)} className="text-gray-500 hover:text-brand-600">
                      {c.active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-500 text-sm">No customers found</div>
          )}
        </div>
      )}
    </div>
  )
}
