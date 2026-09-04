import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('sr_user')
    const token  = localStorage.getItem('sr_token')
    if (stored && token) {
      try { setUser(JSON.parse(stored)) } catch { clearAuth() }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password })
    saveAuth(data)
    return data
  }

  const register = async (payload) => {
    const { data } = await authApi.register(payload)
    saveAuth(data)
    return data
  }

  const logout = () => {
    clearAuth()
    setUser(null)
    toast.success('Logged out successfully')
  }

  const saveAuth = (data) => {
    localStorage.setItem('sr_token',   data.token)
    localStorage.setItem('sr_refresh', data.refreshToken)
    localStorage.setItem('sr_user',    JSON.stringify(data))
    setUser(data)
  }

  const clearAuth = () => {
    localStorage.removeItem('sr_token')
    localStorage.removeItem('sr_refresh')
    localStorage.removeItem('sr_user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
