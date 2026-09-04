import api from './axiosInstance'

// Auth
export const authApi = {
  register:      (data) => api.post('/auth/register', data),
  login:         (data) => api.post('/auth/login', data),
  refresh:       (data) => api.post('/auth/refresh', data),
  registerToken: (data) => api.post('/auth/device-token', data),
}

// Categories
export const categoryApi = {
  getAll:   (activeOnly = true) => api.get(`/categories?activeOnly=${activeOnly}`),
  getById:  (id)        => api.get(`/categories/${id}`),
  create:   (data)      => api.post('/categories', data),
  update:   (id, data)  => api.put(`/categories/${id}`, data),
  delete:   (id)        => api.delete(`/categories/${id}`),
  toggle:   (id)        => api.patch(`/categories/${id}/toggle`),
}

// Foods
export const foodApi = {
  search:             (params) => api.get('/foods', { params }),
  getById:            (id)     => api.get(`/foods/${id}`),
  getBestsellers:     ()       => api.get('/foods/bestsellers'),
  getTopRated:        (limit = 8) => api.get(`/foods/top-rated?limit=${limit}`),
  getPopular:         (limit = 8) => api.get(`/foods/popular?limit=${limit}`),
  getByCategory:      (catId)  => api.get(`/foods/category/${catId}`),
  create:             (data)   => api.post('/foods', data),
  update:             (id, data) => api.put(`/foods/${id}`, data),
  delete:             (id)     => api.delete(`/foods/${id}`),
  toggleAvailability: (id)     => api.patch(`/foods/${id}/toggle-availability`),
}

// Cart
export const cartApi = {
  get:        ()         => api.get('/cart'),
  addItem:    (data)     => api.post('/cart/items', data),
  updateItem: (id, qty)  => api.patch(`/cart/items/${id}?quantity=${qty}`),
  removeItem: (id)       => api.delete(`/cart/items/${id}`),
  clear:      ()         => api.delete('/cart'),
}

// Addresses
export const addressApi = {
  getAll:     ()         => api.get('/addresses'),
  add:        (data)     => api.post('/addresses', data),
  update:     (id, data) => api.put(`/addresses/${id}`, data),
  delete:     (id)       => api.delete(`/addresses/${id}`),
  setDefault: (id)       => api.patch(`/addresses/${id}/set-default`),
}

// Coupons
export const couponApi = {
  validate: (code, amount) => api.get(`/coupons/validate?code=${code}&orderAmount=${amount}`),
  getAll:   ()             => api.get('/coupons'),
  create:   (data)         => api.post('/coupons', data),
  update:   (id, data)     => api.put(`/coupons/${id}`, data),
  delete:   (id)           => api.delete(`/coupons/${id}`),
  toggle:   (id)           => api.patch(`/coupons/${id}/toggle`),
}

// Orders
export const orderApi = {
  place:          (data)         => api.post('/orders', data),
  getMyOrders:    (page = 0, size = 10) => api.get(`/orders?page=${page}&size=${size}`),
  getById:        (id)           => api.get(`/orders/${id}`),
  updateStatus:   (id, status)   => api.patch(`/orders/${id}/status?status=${status}`),
  getActive:      ()             => api.get('/orders/active'),
  assignDelivery: (id, partnerId) => api.patch(`/orders/${id}/assign-delivery?partnerId=${partnerId}`),
  availablePickup: ()            => api.get('/orders/available-for-pickup'),
  myDeliveries:   ()             => api.get('/orders/my-deliveries'),
}

// Payments
export const paymentApi = {
  create: (orderId) => api.post('/payments/create', { orderId }),
  verify: (data)    => api.post('/payments/verify', data),
}

// Delivery Partner
export const deliveryApi = {
  getProfile:       ()     => api.get('/delivery/profile'),
  updateProfile:    (data) => api.put('/delivery/profile', data),
  goOnline:         ()     => api.post('/delivery/online'),
  goOffline:        ()     => api.post('/delivery/offline'),
  updateLocation:   (data) => api.post('/delivery/location', data),
  getPendingRequest: ()    => api.get('/delivery/requests/pending'),
  acceptRequest:    (id)   => api.post(`/delivery/requests/${id}/accept`),
  rejectRequest:    (id)   => api.post(`/delivery/requests/${id}/reject`),
  getMyOrders:      ()     => api.get('/delivery/orders'),
  getAvailable:     ()     => api.get('/delivery/orders/available'),
  updateOrderStatus: (orderId, status) => api.patch(`/delivery/orders/${orderId}/status?status=${status}`),
  getAllPartners:    ()     => api.get('/delivery/partners'),
  getOnlinePartners: ()    => api.get('/delivery/partners/online'),
  manualAssign:     (orderId) => api.post(`/delivery/assign/${orderId}`),
  getNearbyPartners: (orderId) => api.get(`/delivery/nearby-partners/${orderId}`),
  assignPartner:    (orderId, partnerUserId) => api.post(`/delivery/assign-partner/${orderId}/${partnerUserId}`),
  registerToken:    (data) => api.post('/delivery/device-token', data),
}

// Reviews
export const reviewApi = {
  getPublic:               (page = 0, size = 10) => api.get(`/reviews/public?page=${page}&size=${size}`),
  getByOrderId:            (orderId)  => api.get(`/reviews/order/${orderId}`),
  getByFoodItem:           (foodId, page = 0, size = 10) => api.get(`/reviews/food/${foodId}?page=${page}&size=${size}`),
  getDeliveryPartnerReviews: (partnerUserId, page = 0, size = 10) => api.get(`/reviews/delivery-partner/${partnerUserId}?page=${page}&size=${size}`),
  getDeliveryPartnerStats: (partnerUserId) => api.get(`/reviews/delivery-partner/${partnerUserId}/stats`),
  getMyReviews:            (page = 0, size = 10) => api.get(`/reviews/my?page=${page}&size=${size}`),
  getAllAdmin:              (page = 0, size = 20) => api.get(`/reviews/all?page=${page}&size=${size}`),
  create:                  (data) => api.post('/reviews', data),
  update:                  (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview:            (id) => api.delete(`/reviews/${id}`),
  toggleApproval:          (id) => api.patch(`/reviews/${id}/toggle-approval`),
}

// Festival Offers
export const festivalOfferApi = {
  getActive: ()         => api.get('/festival-offers/active'),
  getAll:    ()         => api.get('/festival-offers'),
  getById:   (id)       => api.get(`/festival-offers/${id}`),
  create:    (data)     => api.post('/festival-offers', data),
  update:    (id, data) => api.put(`/festival-offers/${id}`, data),
  delete:    (id)       => api.delete(`/festival-offers/${id}`),
  toggle:    (id)       => api.patch(`/festival-offers/${id}/toggle`),
}

// Favorites
export const favoriteApi = {
  getAll: ()   => api.get('/favorites'),
  add:    (id) => api.post(`/favorites/${id}`),
  remove: (id) => api.delete(`/favorites/${id}`),
}

// Notifications
export const notificationApi = {
  getAll:      (page = 0, size = 20) => api.get(`/notifications?page=${page}&size=${size}`),
  unreadCount: () => api.get('/notifications/unread-count'),
  markAllRead: () => api.patch('/notifications/mark-all-read'),
  markRead:    (id) => api.patch(`/notifications/${id}/read`),
}

// Admin
export const adminApi = {
  getAnalytics:    () => api.get('/admin/analytics'),
  getCustomers:    () => api.get('/admin/customers'),
  getDeliveryPartners: () => api.get('/admin/delivery-partners'),
  toggleUser:      (id) => api.patch(`/admin/users/${id}/toggle-active`),
}

// AI Revenue Recovery
export const recoveryApi = {
  // Customer
  getStatus:         (orderId)  => api.get(`/recovery/status/${orderId}`),
  getMyRecoveries:   ()         => api.get('/recovery/my'),
  triggerRecovery:   (orderId)  => api.post(`/recovery/trigger/${orderId}`),
  retryPayment:      (orderId)  => api.post(`/recovery/retry-payment/${orderId}`),
  verifyPayment:     (data)     => api.post('/recovery/verify-payment', data),
  explain:           (orderId)  => api.get(`/recovery/explain/${orderId}`),
  reportFailed:      (orderId, razorpayPaymentId, failureReason, failureCode) =>
                       api.post('/payments/failed', { orderId, razorpayPaymentId, failureReason, failureCode }),
  // Admin / merchant
  getDashboard:      ()         => api.get('/recovery/dashboard'),
  getDetail:         (orderId)  => api.get(`/recovery/detail/${orderId}`),
  adminExplain:      (orderId)  => api.get(`/recovery/admin/explain/${orderId}`),
  markReview:        (attemptId, note) => api.patch(`/recovery/${attemptId}/mark-review`, { note }),
  resolveCase:       (attemptId, note) => api.patch(`/recovery/${attemptId}/resolve`, { note }),
  // Demo seeder (Buildathon)
  seedDemo:          ()         => api.post('/recovery/seed-demo'),
}
