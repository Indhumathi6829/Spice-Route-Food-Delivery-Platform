import { StaticPage } from './StaticPage'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
export default function ContactPage() {
  return (
    <StaticPage icon="📞" title="Contact Us" subtitle="We're here to help. Reach out through any of these channels.">
      <div className="grid sm:grid-cols-2 gap-5 mb-8">
        {[
          { icon: Mail,  label: 'Email Support', val: 'support@spiceroute.com', href: 'mailto:support@spiceroute.com', note: 'Response within 2–4 hours' },
          { icon: Phone, label: 'Phone Support', val: '+91 98765 43210',        href: 'tel:+919876543210',            note: '9 AM – 11 PM daily' },
          { icon: MapPin,label: 'Headquarters',  val: 'Chennai, Tamil Nadu, India', href: null, note: 'Pan-India delivery operations' },
          { icon: Clock, label: 'Support Hours', val: '9 AM – 11 PM',          href: null, note: '7 days a week including holidays' },
        ].map(c => {
          const Icon = c.icon
          return (
            <div key={c.label} className="bg-white rounded-2xl p-5 shadow-card flex items-start gap-4">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{c.label}</p>
                {c.href
                  ? <a href={c.href} className="text-brand-500 hover:underline text-sm font-medium">{c.val}</a>
                  : <p className="text-gray-700 text-sm">{c.val}</p>
                }
                <p className="text-xs text-gray-400 mt-0.5">{c.note}</p>
              </div>
            </div>
          )
        })}
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <h3 className="font-bold text-gray-900 mb-4">Send us a Message</h3>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); window.location.href = 'mailto:support@spiceroute.com' }}>
          <div className="grid sm:grid-cols-2 gap-4">
            <input className="input" placeholder="Your Name" required />
            <input className="input" type="email" placeholder="Email Address" required />
          </div>
          <input className="input" placeholder="Subject" required />
          <textarea className="input resize-none" rows={4} placeholder="Your message..." required />
          <button type="submit" className="btn-primary w-full py-3">Send Message</button>
        </form>
      </div>
    </StaticPage>
  )
}
