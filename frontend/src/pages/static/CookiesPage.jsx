import { StaticPage } from './StaticPage'
export default function CookiesPage() {
  return (
    <StaticPage icon="🍪" title="Cookie Policy" subtitle="How we use cookies to improve your experience.">
      <div className="space-y-5">
        {[
          { title: 'What Are Cookies?', body: 'Cookies are small text files stored on your device when you visit our website. They help us remember your preferences and improve your browsing experience.' },
          { title: 'Essential Cookies', body: 'These cookies are required for the website to function. They manage your session (login state), shopping cart, and security tokens. These cannot be disabled.' },
          { title: 'Analytics Cookies', body: 'We use analytics to understand how visitors use our site — which pages are popular, how long people stay, and where they come from. This helps us improve. No personally identifiable information is collected.' },
          { title: 'Preference Cookies', body: 'These remember your settings such as language, location, and display preferences so you don\'t have to set them every visit.' },
          { title: 'How to Manage Cookies', body: 'You can disable non-essential cookies in your browser settings. Note that this may affect some features of our website. On mobile, you can clear app data in your device settings.' },
        ].map(s => (
          <div key={s.title} className="bg-white rounded-2xl p-5 shadow-card">
            <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </StaticPage>
  )
}
