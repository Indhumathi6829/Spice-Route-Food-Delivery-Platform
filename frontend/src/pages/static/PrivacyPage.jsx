import { StaticPage } from './StaticPage'
const sections = [
  { title: '1. Information We Collect', body: 'We collect information you provide when creating an account (name, email, phone, address), placing orders, and using our app. We also collect device and location data when you enable location services.' },
  { title: '2. How We Use Your Information', body: 'Your information is used to process orders, provide delivery services, send notifications, personalise your experience, and improve our platform. We never sell your data to third parties.' },
  { title: '3. Data Sharing', body: 'We share necessary order information with our delivery partners to fulfil your orders. Payment data is processed securely by Razorpay. We do not share personal data beyond what is required for service delivery.' },
  { title: '4. Data Security', body: 'We use industry-standard encryption (TLS 1.3) for all data in transit. Passwords are hashed using BCrypt. We regularly audit our security practices.' },
  { title: '5. Location Data', body: 'Location is used to determine delivery areas, estimate delivery times, and assign nearby delivery partners. Location data is not stored beyond 24 hours unless actively tracking a delivery.' },
  { title: '6. Your Rights', body: 'You have the right to access, correct, or delete your personal data at any time. Contact support@spiceroute.com to exercise your rights.' },
  { title: '7. Cookies', body: 'We use cookies for session management and analytics. See our Cookie Policy for details. You can disable cookies in your browser settings.' },
  { title: '8. Contact', body: 'For privacy concerns, contact our Data Protection Officer at privacy@spiceroute.com or write to SpiceRoute Kitchen, Chennai, Tamil Nadu, India.' },
]
export default function PrivacyPage() {
  return (
    <StaticPage icon="🔒" title="Privacy Policy" subtitle="Last updated: August 2026. We take your privacy seriously.">
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
