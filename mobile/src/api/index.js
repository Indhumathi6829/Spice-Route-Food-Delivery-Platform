import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Update this to your backend IP for device testing
const BASE_URL = 'http://10.0.2.2:8080/api'  // Android emulator → localhost

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('sr_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  refresh:  (data) => api.post('/auth/refresh', data),
}

export const categoryApi = {
  getAll: () => api.get('/categories'),
}

export const foodApi = {
  search:       (params) => api.get('/foods', { params }),
  getById:      (id)     => api.get(`/foods/${id}`),
  getBestsellers: ()     => api.get('/foods/bestsellers'),
  getTopRated:    ()     => api.get('/foods/top-rated?limit=10'),
}

export const cartApi = {
  get:        ()    => api.get('/cart'),
  addItem:    (data) => api.post('/cart/items', data),
  updateItem: (id, qty) => api.patch(`/cart/items/${id}?quantity=${qty}`),
  removeItem: (id)  => api.delete(`/cart/items/${id}`),
  clear:      ()    => api.delete('/cart'),
}

export const orderApi = {
  place:       (data) => api.post('/orders', data),
  getMyOrders: (page = 0) => api.get(`/orders?page=${page}&size=10`),
  getById:     (id)  => api.get(`/orders/${id}`),
  updateStatus:(id, status) => api.patch(`/orders/${id}/status?status=${status}`),
}

export const addressApi = {
  getAll: () => api.get('/addresses'),
  add:    (data) => api.post('/addresses', data),
  delete: (id)  => api.delete(`/addresses/${id}`),
}

export const favoriteApi = {
  getAll: () => api.get('/favorites'),
  add:    (id) => api.post(`/favorites/${id}`),
  remove: (id) => api.delete(`/favorites/${id}`),
}

export const couponApi = {
  validate: (code, amount) => api.get(`/coupons/validate?code=${code}&orderAmount=${amount}`),
}

export const reviewApi = {
  getPublic: () => api.get('/reviews/public?page=0&size=10'),
  create:    (data) => api.post('/reviews', data),
}

export const notificationApi = {
  getAll:        ()      => api.get('/notifications?page=0&size=20'),
  unreadCount:   ()      => api.get('/notifications/unread-count'),
  markAllRead:   ()      => api.patch('/notifications/mark-all-read'),
  /**
   * Register an FCM device token so the backend can push notifications to
   * this device.  Calls POST /api/auth/device-token (available to any
   * authenticated user, not only delivery partners).
   *
   * @param {string} token     - Expo push token or raw FCM token
   * @param {string} platform  - 'ANDROID' | 'IOS' | 'WEB'
   */
  registerToken: (token, platform) =>
    api.post('/auth/device-token', { token, platform }),

  /**
   * Deactivate the stored token on logout so stale tokens are not used.
   * Calls DELETE /api/delivery/device-token.
   * The backend only needs the token string — platform is not required.
   */
  deactivateToken: (token) =>
    api.delete('/delivery/device-token', { data: { token } }),
}

// ── Delivery tracking (customer view) ────────────────────────────────────────
// These endpoints let the customer poll/stream the live state of their active
// delivery: the assigned partner's info and their current GPS position.

export const deliveryApi = {
  /**
   * Get the DeliveryAssignment for a given order.
   * Returns partner name, rating, vehicle, status, and distanceKm.
   * Endpoint: GET /api/orders/:orderId/assignment
   */
  getAssignment: (orderId) => api.get(`/orders/${orderId}/assignment`),

  /**
   * Get the delivery partner's current location for a live-tracking map.
   * Endpoint: GET /api/orders/:orderId/partner-location
   * Returns { latitude, longitude, lastUpdated }
   */
  getPartnerLocation: (orderId) => api.get(`/orders/${orderId}/partner-location`),
}
