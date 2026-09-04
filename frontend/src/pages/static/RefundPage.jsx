import { StaticPage } from './StaticPage'
export default function RefundPage() {
  return (
    <StaticPage icon="💳" title="Refund Policy" subtitle="We want you to be 100% satisfied with every order.">
      <div className="space-y-5">
        {[
          { title: 'Eligible for Full Refund', items: ['Order cancelled within 2 minutes of placement', 'Item delivered is different from what was ordered', 'Food quality was significantly below standard with evidence', 'Payment charged but order not confirmed'] },
          { title: 'Eligible for Partial Refund', items: ['Missing items in an order', 'Significant delay beyond our stated delivery window', 'Order damaged during delivery'] },
          { title: 'Not Eligible for Refund', items: ['Change of mind after restaurant confirmation', 'Incorrect address provided by customer', 'Item unavailable substituted with customer approval', 'Promotional/discounted orders (case by case)'] },
        ].map(s => (
          <div key={s.title} className="bg-white rounded-2xl p-5 shadow-card">
            <h3 className="font-bold text-gray-900 mb-3">{s.title}</h3>
            <ul className="space-y-1.5">
              {s.items.map(i => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-brand-500 mt-0.5 flex-shrink-0">•</span> {i}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="bg-brand-50 rounded-2xl p-5">
          <h3 className="font-bold text-gray-900 mb-2">How to Request a Refund</h3>
          <p className="text-sm text-gray-600">Contact us within 24 hours of your order via <a href="mailto:support@spiceroute.com" className="text-brand-500 hover:underline">support@spiceroute.com</a> with your Order ID and description of the issue. Refunds are processed within 5–7 business days.</p>
        </div>
      </div>
    </StaticPage>
  )
}
