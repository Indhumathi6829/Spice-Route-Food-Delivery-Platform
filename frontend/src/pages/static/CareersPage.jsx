import { StaticPage } from './StaticPage'
import { Link } from 'react-router-dom'
export default function CareersPage() {
  const roles = [
    { title: 'Delivery Partner', type: 'Part-time / Full-time', location: 'Pan-India', desc: 'Join our fleet and earn on your schedule. Bike or scooter required.' },
    { title: 'Kitchen Staff', type: 'Full-time', location: 'Chennai, Bangalore', desc: 'Passionate about cooking? Join our kitchen team and cook for thousands daily.' },
    { title: 'Customer Support', type: 'Full-time', location: 'Remote', desc: 'Help our customers have the best experience with every order.' },
    { title: 'Software Engineer', type: 'Full-time', location: 'Remote / Chennai', desc: 'Build the tech powering SpiceRoute. React, Spring Boot, mobile apps.' },
  ]
  return (
    <StaticPage icon="💼" title="Careers at SpiceRoute" subtitle="Join our growing team. We're hiring across multiple roles.">
      <div className="space-y-4">
        {roles.map(r => (
          <div key={r.title} className="bg-white rounded-2xl p-5 shadow-card flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900">{r.title}</h3>
              <div className="flex gap-2 mt-1 flex-wrap">
                <span className="badge badge-orange text-xs">{r.type}</span>
                <span className="badge badge-blue text-xs">📍 {r.location}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">{r.desc}</p>
            </div>
            <a href="mailto:careers@spiceroute.com?subject=Application: ${r.title}"
              className="btn-primary text-xs py-2 px-4 flex-shrink-0">Apply</a>
          </div>
        ))}
        <p className="text-center text-sm text-gray-400 pt-4">
          Don't see your role? Email us at{' '}
          <a href="mailto:careers@spiceroute.com" className="text-brand-500 hover:underline">careers@spiceroute.com</a>
        </p>
      </div>
    </StaticPage>
  )
}
