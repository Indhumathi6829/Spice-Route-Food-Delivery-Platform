import { Link } from 'react-router-dom'
import { ChefHat, Mail, Phone, MapPin, Heart, Instagram, Facebook, Linkedin, Twitter, Youtube } from 'lucide-react'

const LINKS = {
  About: [
    { label: 'About Us',       to: '/about' },
    { label: 'Our Story',      to: '/story' },
    { label: 'Careers',        to: '/careers' },
    { label: 'Help & Support', to: '/help' },
    { label: 'Blog',           to: '/blog' },
  ],
  Locations: [
    { label: 'Chennai',        to: '/locations' },
    { label: 'Coimbatore',     to: '/locations' },
    { label: 'Bangalore',      to: '/locations' },
    { label: 'Hyderabad',      to: '/locations' },
    { label: 'More cities…',   to: '/locations' },
  ],
  Legal: [
    { label: 'Privacy Policy',   to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Refund Policy',    to: '/refund' },
    { label: 'Cookie Policy',    to: '/cookies' },
  ],
}

// Social links — placeholder hrefs (no fake accounts created)
const SOCIALS = [
  { Icon: Instagram, label: 'Instagram' },
  { Icon: Facebook,  label: 'Facebook'  },
  { Icon: Twitter,   label: 'X/Twitter' },
  { Icon: Linkedin,  label: 'LinkedIn'  },
  { Icon: Youtube,   label: 'YouTube'   },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-2.5">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <ChefHat className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-sm font-display">SpiceRoute Kitchen</span>
            </Link>
            <p className="text-xs leading-relaxed mb-3">
              Fresh food, fast delivery — across India.
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {SOCIALS.map(({ Icon, label }) => (
                <button key={label} aria-label={label} disabled
                  title="Coming soon"
                  className="w-7 h-7 bg-gray-800 rounded-lg flex items-center justify-center opacity-50 cursor-not-allowed">
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          {/* About */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wide mb-3">About</h4>
            <ul className="space-y-1.5">
              {LINKS.About.map(l => (
                <li key={l.label}>
                  <Link to={l.to} className="text-xs hover:text-white transition-colors duration-150">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wide mb-3">Locations</h4>
            <ul className="space-y-1.5">
              {LINKS.Locations.map(l => (
                <li key={l.label}>
                  <Link to={l.to} className="text-xs hover:text-white transition-colors duration-150">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wide mb-3">Legal</h4>
            <ul className="space-y-1.5">
              {LINKS.Legal.map(l => (
                <li key={l.label}>
                  <Link to={l.to} className="text-xs hover:text-white transition-colors duration-150">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wide mb-3">Contact</h4>
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@spiceroute.com"
                  className="flex items-center gap-1.5 text-xs hover:text-white transition-colors">
                  <Mail className="w-3 h-3 text-brand-400 flex-shrink-0" />
                  support@spiceroute.com
                </a>
              </li>
              <li>
                <a href="tel:+919876543210"
                  className="flex items-center gap-1.5 text-xs hover:text-white transition-colors">
                  <Phone className="w-3 h-3 text-brand-400 flex-shrink-0" />
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-start gap-1.5 text-xs">
                <MapPin className="w-3 h-3 text-brand-400 flex-shrink-0 mt-0.5" />
                Chennai HQ · Pan-India
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>© 2026 SpiceRoute Kitchen. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500 mx-0.5" /> in India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  )
}
