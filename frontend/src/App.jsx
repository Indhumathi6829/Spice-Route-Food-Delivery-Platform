import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

import Navbar            from './components/Navbar'
import BottomNav         from './components/BottomNav'
import Footer            from './components/Footer'
import PrivateRoute      from './components/PrivateRoute'
import ScrollToTop       from './components/ScrollToTop'

// Public
import Landing      from './pages/Landing'
import PublicHome   from './pages/public/PublicHome'
import MenuBrowse   from './pages/public/MenuBrowse'
import FoodDetail   from './pages/public/FoodDetail'
import CategoryPage from './pages/public/CategoryPage'

// Static pages
import AboutPage    from './pages/static/AboutPage'
import CareersPage  from './pages/static/CareersPage'
import HelpPage     from './pages/static/HelpPage'
import BlogPage     from './pages/static/BlogPage'
import LocationsPage from './pages/static/LocationsPage'
import PrivacyPage  from './pages/static/PrivacyPage'
import TermsPage    from './pages/static/TermsPage'
import RefundPage   from './pages/static/RefundPage'
import CookiesPage  from './pages/static/CookiesPage'
import ContactPage  from './pages/static/ContactPage'
import StoryPage    from './pages/static/StoryPage'

// Auth
import Login    from './pages/Login'
import Register from './pages/Register'

// Customer
import Home           from './pages/customer/Home'
import Cart           from './pages/customer/Cart'
import Checkout       from './pages/customer/Checkout'
import OrderSuccess   from './pages/customer/OrderSuccess'
import Orders         from './pages/customer/Orders'
import OrderTracking  from './pages/customer/OrderTracking'
import Favorites      from './pages/customer/Favorites'
import Profile        from './pages/customer/Profile'
import Notifications  from './pages/customer/Notifications'
import Addresses      from './pages/customer/Addresses'
import FailedOrders   from './pages/customer/FailedOrders'

// Restaurant Admin
import AdminDashboard    from './pages/admin/AdminDashboard'
import AdminMenu         from './pages/admin/AdminMenu'
import AdminOrders       from './pages/admin/AdminOrders'
import AdminCustomers    from './pages/admin/AdminCustomers'
import AdminCoupons      from './pages/admin/AdminCoupons'
import AdminReviews      from './pages/admin/AdminReviews'
import AdminDelivery     from './pages/admin/AdminDelivery'
import AdminAnalytics    from './pages/admin/AdminAnalytics'
import AdminFestivalOffers from './pages/admin/AdminFestivalOffers'
import AdminCategories    from './pages/admin/AdminCategories'
import AdminRecoveryDashboard from './pages/admin/AdminRecoveryDashboard'
import AdminRecoveryDetail    from './pages/admin/AdminRecoveryDetail'

// Delivery
import DeliveryHome     from './pages/delivery/DeliveryHome'
import DeliveryHistory  from './pages/delivery/DeliveryHistory'

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="spinner border-brand-500 border-t-transparent !w-10 !h-10 !border-4" />
    </div>
  )
  if (!user) return <Landing />
  switch (user.role) {
    case 'CUSTOMER':         return <Navigate to="/home" replace />
    case 'RESTAURANT_ADMIN': return <Navigate to="/admin" replace />
    case 'DELIVERY_PARTNER': return <Navigate to="/delivery" replace />
    case 'SUPER_ADMIN':      return <Navigate to="/admin" replace />
    default:                 return <Navigate to="/login" replace />
  }
}

function Layout({ children, showFooter = true }) {
  const { user } = useAuth()
  const isCustomer = user?.role === 'CUSTOMER'
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className={`flex-1 ${isCustomer ? 'pb-16 md:pb-0' : ''}`}>
        {children}
      </main>
      {isCustomer && <BottomNav />}
      {showFooter && <Footer />}
    </div>
  )
}

// Public layout — shows navbar & footer but no BottomNav (not logged in)
function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

// Static pages layout
function StaticLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Root */}
        <Route path="/" element={<RootRedirect />} />

        {/* Auth */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── PUBLIC (no login required) ── */}
        <Route path="/browse"             element={<PublicLayout><PublicHome /></PublicLayout>} />
        <Route path="/menu"               element={<PublicLayout><MenuBrowse /></PublicLayout>} />
        <Route path="/menu/:categorySlug" element={<PublicLayout><CategoryPage /></PublicLayout>} />
        <Route path="/food/:id"           element={<PublicLayout><FoodDetail /></PublicLayout>} />

        {/* ── STATIC pages ── */}
        <Route path="/about"     element={<StaticLayout><AboutPage /></StaticLayout>} />
        <Route path="/story"     element={<StaticLayout><StoryPage /></StaticLayout>} />
        <Route path="/careers"   element={<StaticLayout><CareersPage /></StaticLayout>} />
        <Route path="/help"      element={<StaticLayout><HelpPage /></StaticLayout>} />
        <Route path="/blog"      element={<StaticLayout><BlogPage /></StaticLayout>} />
        <Route path="/locations" element={<StaticLayout><LocationsPage /></StaticLayout>} />
        <Route path="/privacy"   element={<StaticLayout><PrivacyPage /></StaticLayout>} />
        <Route path="/terms"     element={<StaticLayout><TermsPage /></StaticLayout>} />
        <Route path="/refund"    element={<StaticLayout><RefundPage /></StaticLayout>} />
        <Route path="/cookies"   element={<StaticLayout><CookiesPage /></StaticLayout>} />
        <Route path="/contact"   element={<StaticLayout><ContactPage /></StaticLayout>} />

        {/* ── CUSTOMER (requires login) ── */}
        <Route path="/home"       element={<PrivateRoute roles={['CUSTOMER']}><Layout><Home /></Layout></PrivateRoute>} />
        <Route path="/cart"       element={<PrivateRoute roles={['CUSTOMER']}><Layout><Cart /></Layout></PrivateRoute>} />
        <Route path="/checkout"   element={<PrivateRoute roles={['CUSTOMER']}><Layout><Checkout /></Layout></PrivateRoute>} />
        <Route path="/order-success/:id" element={<PrivateRoute roles={['CUSTOMER']}><Layout><OrderSuccess /></Layout></PrivateRoute>} />
        <Route path="/orders"     element={<PrivateRoute roles={['CUSTOMER']}><Layout><Orders /></Layout></PrivateRoute>} />
        <Route path="/orders/failed" element={<PrivateRoute roles={['CUSTOMER']}><Layout><FailedOrders /></Layout></PrivateRoute>} />
        <Route path="/orders/:id" element={<PrivateRoute roles={['CUSTOMER','RESTAURANT_ADMIN','DELIVERY_PARTNER','SUPER_ADMIN']}><Layout><OrderTracking /></Layout></PrivateRoute>} />
        <Route path="/favorites"     element={<PrivateRoute roles={['CUSTOMER']}><Layout><Favorites /></Layout></PrivateRoute>} />
        <Route path="/profile"       element={<PrivateRoute roles={['CUSTOMER']}><Layout><Profile /></Layout></PrivateRoute>} />
        <Route path="/addresses"     element={<PrivateRoute roles={['CUSTOMER']}><Layout><Addresses /></Layout></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute roles={['CUSTOMER','RESTAURANT_ADMIN','DELIVERY_PARTNER']}><Layout><Notifications /></Layout></PrivateRoute>} />

        {/* ── ADMIN ── */}
        <Route path="/admin"                  element={<PrivateRoute roles={['RESTAURANT_ADMIN','SUPER_ADMIN']}><Layout><AdminDashboard /></Layout></PrivateRoute>} />
        <Route path="/admin/menu"             element={<PrivateRoute roles={['RESTAURANT_ADMIN','SUPER_ADMIN']}><Layout><AdminMenu /></Layout></PrivateRoute>} />
        <Route path="/admin/orders"           element={<PrivateRoute roles={['RESTAURANT_ADMIN','SUPER_ADMIN']}><Layout><AdminOrders /></Layout></PrivateRoute>} />
        <Route path="/admin/customers"        element={<PrivateRoute roles={['RESTAURANT_ADMIN','SUPER_ADMIN']}><Layout><AdminCustomers /></Layout></PrivateRoute>} />
        <Route path="/admin/coupons"          element={<PrivateRoute roles={['RESTAURANT_ADMIN','SUPER_ADMIN']}><Layout><AdminCoupons /></Layout></PrivateRoute>} />
        <Route path="/admin/reviews"          element={<PrivateRoute roles={['RESTAURANT_ADMIN','SUPER_ADMIN']}><Layout><AdminReviews /></Layout></PrivateRoute>} />
        <Route path="/admin/delivery"         element={<PrivateRoute roles={['RESTAURANT_ADMIN','SUPER_ADMIN']}><Layout><AdminDelivery /></Layout></PrivateRoute>} />
        <Route path="/admin/analytics"        element={<PrivateRoute roles={['RESTAURANT_ADMIN','SUPER_ADMIN']}><Layout><AdminAnalytics /></Layout></PrivateRoute>} />
        <Route path="/admin/festival-offers"  element={<PrivateRoute roles={['RESTAURANT_ADMIN','SUPER_ADMIN']}><Layout><AdminFestivalOffers /></Layout></PrivateRoute>} />
        <Route path="/admin/categories"       element={<PrivateRoute roles={['RESTAURANT_ADMIN','SUPER_ADMIN']}><Layout><AdminCategories /></Layout></PrivateRoute>} />
        <Route path="/admin/recovery"         element={<PrivateRoute roles={['RESTAURANT_ADMIN','SUPER_ADMIN']}><Layout><AdminRecoveryDashboard /></Layout></PrivateRoute>} />
        <Route path="/admin/recovery/:orderId" element={<PrivateRoute roles={['RESTAURANT_ADMIN','SUPER_ADMIN']}><Layout><AdminRecoveryDetail /></Layout></PrivateRoute>} />

        {/* ── DELIVERY ── */}
        <Route path="/delivery"         element={<PrivateRoute roles={['DELIVERY_PARTNER','SUPER_ADMIN']}><Layout><DeliveryHome /></Layout></PrivateRoute>} />
        <Route path="/delivery/history" element={<PrivateRoute roles={['DELIVERY_PARTNER']}><Layout><DeliveryHistory /></Layout></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  )
}
