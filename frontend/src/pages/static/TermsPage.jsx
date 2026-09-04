import { StaticPage } from './StaticPage'
const sections = [
  { title: '1. Acceptance of Terms', body: 'By using SpiceRoute Kitchen, you agree to these Terms of Service. If you do not agree, please do not use our services.' },
  { title: '2. Use of Service', body: 'SpiceRoute Kitchen provides an online food ordering and delivery platform. You must be 18+ to create an account and use our services. You are responsible for maintaining the security of your account.' },
  { title: '3. Orders & Payment', body: 'All orders are subject to availability and confirmation. Prices are as displayed at the time of ordering. We accept Razorpay payments and Cash on Delivery. Orders are non-refundable once the restaurant has started preparing your food.' },
  { title: '4. Delivery', body: 'Delivery times are estimates and may vary due to traffic, weather, or demand. We are not liable for delays caused by circumstances beyond our control.' },
  { title: '5. Cancellation & Refunds', body: 'Orders can be cancelled within 2 minutes of placement. After restaurant confirmation, cancellations are subject to the restaurant\'s policy. Refunds for valid claims are processed within 5–7 business days.' },
  { title: '6. User Conduct', body: 'You agree not to use our platform for fraudulent orders, abusive behaviour towards delivery partners or staff, or any illegal activity. We reserve the right to suspend accounts that violate these terms.' },
  { title: '7. Intellectual Property', body: 'All content on SpiceRoute Kitchen — including logos, images, and text — is owned by SpiceRoute Kitchen and protected by copyright law.' },
  { title: '8. Limitation of Liability', body: 'SpiceRoute Kitchen is not liable for indirect, incidental, or consequential damages arising from use of our service beyond the order value.' },
]
export default function TermsPage() {
  return (
    <StaticPage icon="📋" title="Terms of Service" subtitle="Last updated: August 2026. Please read these terms carefully.">
      <div className="space-y-5">
        {sections.map(s => (
          <div key={s.title} className="bg-white rounded-2xl p-5 shadow-card">
            <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </StaticPage>
  )
}
