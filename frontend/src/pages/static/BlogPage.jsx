import { StaticPage } from './StaticPage'
const POSTS = [
  { title: 'The Art of Hyderabadi Biryani', date: 'Aug 10, 2026', tag: 'Food Story', desc: 'Discover the 400-year history behind India\'s most beloved rice dish and how we recreate it fresh daily.', emoji: '🍚' },
  { title: 'Meet Our Delivery Heroes', date: 'Jul 25, 2026', tag: 'Team', desc: 'A day in the life of our delivery partners — the unsung heroes who bring your food on time, every time.', emoji: '🛵' },
  { title: 'Diwali Special Menu Launch', date: 'Oct 15, 2025', tag: 'Offers', desc: 'We launched our Diwali feast menu with 8 new dishes. Here\'s what inspired each recipe.', emoji: '🪔' },
  { title: 'Why We Source Local Ingredients', date: 'Jun 5, 2025', tag: 'Sustainability', desc: 'Our commitment to supporting local farmers and reducing our carbon footprint.', emoji: '🌿' },
]
export default function BlogPage() {
  return (
    <StaticPage icon="📝" title="SpiceRoute Blog" subtitle="Stories, recipes and news from our kitchen.">
      <div className="grid sm:grid-cols-2 gap-5">
        {POSTS.map(p => (
          <div key={p.title} className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-shadow">
            <div className="bg-gradient-to-br from-brand-50 to-orange-50 h-28 flex items-center justify-center text-5xl">{p.emoji}</div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-orange text-xs">{p.tag}</span>
                <span className="text-xs text-gray-400">{p.date}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{p.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              <button className="text-brand-500 text-xs font-semibold mt-3 hover:underline">Read more →</button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-gray-400 mt-8">More posts coming soon. Follow us on social media for updates.</p>
    </StaticPage>
  )
}
