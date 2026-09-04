import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

// ⚠️ Update this to your backend IP for device/emulator testing
// Android emulator: http://10.0.2.2:8080/api
// iOS simulator:    http://localhost:8080/api
// Real device:      http://YOUR_MACHINE_IP:8080/api
const BASE_URL = 'http://10.0.2.2:8080/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('dp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      await AsyncStorage.multiRemove(['dp_token', 'dp_refresh', 'dp_user'])
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login:   (data) => api.post('/auth/login', data),
  refresh: (data) => api.post('/auth/refresh', data),
}

export const deliveryApi = {
  getProfile:      ()     => api.get('/delivery/profile'),
  updateProfile:   (data) => api.put('/delivery/profile', data),
  goOnline:        ()     => api.post('/delivery/online'),
  goOffline:       ()     => api.post('/delivery/offline'),
  updateLocation:  (data) => api.post('/delivery/location', data),
  getPending:      ()     => api.get('/delivery/requests/pending'),
  accept:          (id)   => api.post(`/delivery/requests/${id}/accept`),
  reject:          (id)   => api.post(`/delivery/requests/${id}/reject`),
  getMyOrders:     ()     => api.get('/delivery/orders'),
  updateStatus:    (orderId, status) => api.patch(`/delivery/orders/${orderId}/status?status=${status}`),
  registerToken:   (data) => api.post('/delivery/device-token', data),
  /**
   * Deactivate the stored FCM token on logout.
   * Calls DELETE /api/delivery/device-token.
   * Must be called before clearing AsyncStorage so the JWT is still valid.
   */
  deactivateToken: (token) =>
    api.delete('/delivery/device-token', { data: { token, platform: 'ANDROID' } }),
}

export const orderApi = {
  getById: (id) => api.get(`/orders/${id}`),
}
