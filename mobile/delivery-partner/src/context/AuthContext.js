import { createContext, useContext, useState, useEffect } from 'react'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { authApi, deliveryApi } from '../api'

const AuthContext = createContext(null)

// ── FCM helpers ───────────────────────────────────────────────────────────────

/**
 * Returns the raw platform push token (FCM on Android, APNs on iOS).
 * Uses getDevicePushTokenAsync() — NOT getExpoPushTokenAsync() — so the
 * token is compatible with Firebase Admin SDK on the backend.
 * Returns null when permission is denied or on simulators.
 */
async function requestPushToken() {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync()
    let finalStatus = existing

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.log('[FCM] Notification permission denied')
      return null
    }

    const tokenData = await Notifications.getDevicePushTokenAsync()
    return tokenData?.data ?? null
  } catch (err) {
    // Simulators throw here — treat as non-fatal
    console.warn('[FCM] Could not get device push token:', err.message)
    return null
  }
}

/**
 * Register the raw FCM token with the backend.
 * Calls POST /api/delivery/device-token (delivery-partner-scoped endpoint).
 * Token is persisted in AsyncStorage as 'dp_push_token' for logout cleanup.
 */
async function registerPushToken() {
  const token = await requestPushToken()
  if (!token) return

  const platform = Platform.OS === 'ios' ? 'IOS'
                 : Platform.OS === 'android' ? 'ANDROID'
                 : 'WEB'

  try {
    await deliveryApi.registerToken({ token, platform })
    await AsyncStorage.setItem('dp_push_token', token)
    console.log('[FCM] Delivery partner token registered:', token.slice(0, 20) + '…')
  } catch (err) {
    // Non-fatal — partner is still logged in; push notifications won't work
    console.warn('[FCM] Token registration failed:', err.message)
  }
}

/**
 * Deactivate the stored token on logout so stale tokens are not used.
 * Must be called BEFORE clearing AsyncStorage so the JWT is still valid.
 */
async function deactivatePushToken() {
  try {
    const token = await AsyncStorage.getItem('dp_push_token')
    if (token) {
      await deliveryApi.deactivateToken(token)
      await AsyncStorage.removeItem('dp_push_token')
    }
  } catch (err) {
    console.warn('[FCM] Token deactivation failed:', err.message)
  }
}

// ── AuthProvider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on app start — only allow DELIVERY_PARTNER and SUPER_ADMIN
  useEffect(() => {
    AsyncStorage.getItem('dp_user').then(s => {
      if (s) {
        const u = JSON.parse(s)
        if (u.role === 'DELIVERY_PARTNER' || u.role === 'SUPER_ADMIN') setUser(u)
        else AsyncStorage.clear()
      }
      setLoading(false)
    })
  }, [])

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password })

    if (data.role !== 'DELIVERY_PARTNER' && data.role !== 'SUPER_ADMIN') {
      throw new Error('This app is for delivery partners only.')
    }

    await AsyncStorage.setItem('dp_token',   data.token)
    await AsyncStorage.setItem('dp_refresh', data.refreshToken)
    await AsyncStorage.setItem('dp_user',    JSON.stringify(data))
    setUser(data)

    // Register FCM token after JWT is persisted so the Axios interceptor
    // can attach the Bearer token to the registration request.
    await registerPushToken()

    return data
  }

  const logout = async () => {
    // Deactivate push token first, while JWT is still valid
    await deactivatePushToken()
    await AsyncStorage.multiRemove(['dp_token', 'dp_refresh', 'dp_user'])
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
