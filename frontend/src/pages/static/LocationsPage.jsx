import { StaticPage } from './StaticPage'
import { MapPin, Clock } from 'lucide-react'
const CITIES = [
  { name: 'Chennai', status: 'Active', hours: '10 AM – 11 PM', note: 'HQ — All areas served' },
  { name: 'Coimbatore', status: 'Active', hours: '10 AM – 10 PM', note: 'RS Puram, Gandhipuram, Peelamedu' },
  { name: 'Bangalore', status: 'Active', hours: '10 AM – 11 PM', note: 'Indiranagar, Koramangala, Whitefield' },
  { name: 'Hyderabad', status: 'Active', hours: '10 AM – 11 PM', note: 'Banjara Hills, Jubilee Hills, Hitech City' },
  { name: 'Mumbai', status: 'Active', hours: '10 AM – 11 PM', note: 'Bandra, Andheri, Powai' },
  { name: 'Delhi NCR', status: 'Active', hours: '10 AM – 10 PM', note: 'Connaught Place, Gurgaon, Noida' },
  { name: 'Pune', status: 'Coming Soon', hours: '—', note: 'Launching Q4 2026' },
  { name: 'Kolkata', status: 'Coming Soon', hours: '—', note: 'Launching Q1 2027' },
]
export default function LocationsPage() {
  return (
    <StaticPage icon="📍" title="Our Locations" subtitle="SpiceRoute Kitchen — delivering fresh food across India.">
      <div className="grid sm:grid-cols-2 gap-4">
        {CITIES.map(c => (
          <div key={c.name} className={`bg-white rounded-2xl shadow-card p-5 ${c.status === 'Coming Soon' ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.note}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> {c.hours}
                  </p>
                </div>
              </div>
              <span className={`badge text-xs ${c.status === 'Active' ? 'badge-green' : 'badge-gray'}`}>{c.status}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-gray-400 mt-8">Don't see your city? We're expanding fast. <a href="mailto:support@spiceroute.com" className="text-brand-500 hover:underline">Let us know!</a></p>
    </StaticPage>
  )
}
