import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('sr_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let pendingQueue = []

const processQueue = (token, error = null) => {
  pendingQueue.forEach(p => error ? p.reject(error) : p.resolve(token))
  pendingQueue = []
}

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      const refresh = localStorage.getItem('sr_refresh')
      if (!refresh) { clearAuth(); return Promise.reject(err) }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true
      try {
        const { data } = await axios.post('/api/auth/refresh', { refreshToken: refresh })
        localStorage.setItem('sr_token', data.token)
        localStorage.setItem('sr_refresh', data.refreshToken)
        processQueue(data.token)
        original.headers.Authorization = `Bearer ${data.token}`
        return api(original)
      } catch (e) {
        processQueue(null, e)
        clearAuth()
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(err)
  }
)

function clearAuth() {
  localStorage.removeItem('sr_token')
  localStorage.removeItem('sr_refresh')
  localStorage.removeItem('sr_user')
  window.location.href = '/login'
}

export default api
