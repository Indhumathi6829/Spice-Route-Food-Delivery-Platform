import { StaticPage } from './StaticPage'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const FAQS = [
  { q: 'How long does delivery take?', a: 'Our average delivery time is 25–45 minutes depending on your location and order size. You can track your order live in the app.' },
  { q: 'How do I cancel an order?', a: 'You can cancel within 2 minutes of placing an order. After the restaurant confirms, cancellation may not be possible. Contact support for help.' },
  { q: 'What payment methods are accepted?', a: 'We accept all major credit/debit cards, UPI (Razorpay), Net Banking, and Cash on Delivery.' },
  { q: 'Is there a minimum order value?', a: 'There is no minimum order value. Delivery fee of ₹49 applies; free delivery on orders above ₹299.' },
  { q: 'How do I track my order?', a: 'Once your order is placed, go to "My Orders" in the app and tap on the order to view live tracking.' },
  { q: 'Can I change my delivery address?', a: 'Delivery address can be changed before the restaurant confirms your order. Contact support immediately if needed.' },
  { q: 'How do I apply a coupon?', a: 'At checkout, enter your coupon code in the "Apply Coupon" field. Valid coupons are automatically applied.' },
  { q: 'What if I receive a wrong order?', a: 'Contact our support team immediately with your order ID. We will investigate and arrange a replacement or refund.' },
]

function Accordion({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
        <span className="font-semibold text-gray-900 text-sm pr-4">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-brand-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>
      {open && <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{a}</p>}
    </div>
  )
}

export default function HelpPage() {
  return (
    <StaticPage icon="🤝" title="Help & Support" subtitle="Find answers to common questions or reach out to us directly.">
      <div className="space-y-3 mb-10">
        {FAQS.map(f => <Accordion key={f.q} q={f.q} a={f.a} />)}
      </div>
      <div className="bg-brand-50 rounded-2xl p-6 text-center">
        <p className="font-bold text-gray-900 mb-1">Still need help?</p>
        <p className="text-sm text-gray-500 mb-4">Our support team is available 9 AM – 11 PM, 7 days a week.</p>
        <div className="flex justify-center gap-3 flex-wrap">
          <a href="mailto:support@spiceroute.com" className="btn-primary text-sm py-2 px-5">📧 Email Support</a>
          <a href="tel:+919876543210" className="btn-secondary text-sm py-2 px-5">📞 Call Us</a>
        </div>
      </div>
    </StaticPage>
  )
}
