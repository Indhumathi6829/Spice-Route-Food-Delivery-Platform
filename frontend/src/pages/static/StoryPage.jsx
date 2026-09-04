import { StaticPage } from './StaticPage'
export default function StoryPage() {
  return (
    <StaticPage icon="📖" title="Our Story" subtitle="From a tiny cloud kitchen in Chennai to serving India.">
      <div className="space-y-6 text-gray-600 leading-relaxed">
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="font-bold text-gray-900 mb-2">🌱 2022 — The Beginning</h3>
          <p>SpiceRoute Kitchen started in a small kitchen in Adyar, Chennai. Just three chefs, twelve dishes, and a deep passion for authentic flavours. Our first order was a Hyderabadi Biryani delivered to a family in T. Nagar — we still remember it.</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="font-bold text-gray-900 mb-2">🚀 2023 — Growing Fast</h3>
          <p>Word spread quickly. We expanded to South Indian, Chinese, and Italian cuisines. Our delivery team grew to 20 partners. We served our 10,000th customer in December 2023.</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="font-bold text-gray-900 mb-2">🌍 2024–2026 — Pan-India</h3>
          <p>Today SpiceRoute Kitchen operates in 8+ cities, with over 100 menu items, 50,000+ happy customers, and a growing family of delivery partners. We're just getting started.</p>
        </div>
      </div>
    </StaticPage>
  )
}
