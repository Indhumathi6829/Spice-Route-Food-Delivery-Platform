import { StaticPage } from './StaticPage'
import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <StaticPage icon="🌶️" title="About SpiceRoute Kitchen"
      subtitle="Bringing the rich flavours of India and the world to your doorstep since 2022.">
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-brand-50 to-orange-50 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Our Story</h2>
          <p className="text-gray-600 leading-relaxed">
            SpiceRoute Kitchen was born from a simple belief — everyone deserves access to authentic, freshly made food.
            Founded in Chennai, we started as a small cloud kitchen with a handful of traditional Indian recipes and a
            dream to share them with the world.
          </p>
          <p className="text-gray-600 leading-relaxed mt-3">
            Today, we serve thousands of happy customers across India — from fragrant Hyderabadi Biryani and creamy
            Butter Chicken to crispy Korean Fried Chicken and classic Italian Pasta. Every dish is prepared fresh
            by our expert chefs using the finest spices and ingredients.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { stat: '50K+',  label: 'Happy Customers', emoji: '😊' },
            { stat: '100+',  label: 'Menu Items',       emoji: '🍽️' },
            { stat: '4.8★',  label: 'Average Rating',   emoji: '⭐' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-6 shadow-card text-center">
              <div className="text-3xl mb-2">{s.emoji}</div>
              <p className="text-3xl font-black text-brand-500">{s.stat}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Our Values</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { t: 'Quality First', d: 'We source fresh ingredients daily. No shortcuts, no compromises.' },
              { t: 'Fast & Reliable', d: '25–45 minute average delivery with real-time tracking.' },
              { t: 'Hygiene & Safety', d: 'FSSAI certified kitchen with strict hygiene standards.' },
              { t: 'Community', d: 'Supporting local farmers and suppliers across India.' },
            ].map(v => (
              <div key={v.t} className="flex gap-3">
                <span className="text-brand-500 font-bold text-lg">✦</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{v.t}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{v.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link to="/register" className="btn-primary inline-flex px-8 py-3 text-sm">
            Order Now — Taste the Difference
          </Link>
        </div>
      </div>
    </StaticPage>
  )
}
