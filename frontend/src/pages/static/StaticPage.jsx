/**
 * Reusable polished placeholder for static pages.
 */
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function StaticPage({ icon, title, subtitle, children }) {
  const navigate = useNavigate()
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">{icon}</div>
        <h1 className="text-3xl font-bold font-display text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-500 mt-2 max-w-lg mx-auto">{subtitle}</p>}
      </div>
      <div className="prose prose-gray max-w-none">{children}</div>
    </div>
  )
}
