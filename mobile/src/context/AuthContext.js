import { createContext, useContext, useState, useEffect } from 'react'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { authApi, notificationApi } from '../api'

const AuthContext = createContext(null)

// ── FCM helpers ───────────────────────────────────────────────────────────────

/**
 * Request notification permission and return the RAW device push token.
 *
 * WHY getDevicePushTokenAsync() and NOT getExpoPushTokenAsync():
 *   - getExpoPushTokenAsync() → returns "ExponentPushToken[xxx]", which is
 *     an Expo-managed token routed through Expo's push proxy service.
 *   - getDevicePushTokenAsync() → returns the raw FCM registration token on
 *     Android and the raw APNs device token on iOS.
 *
 * The backend uses Firebase Admin SDK (FirebaseMessaging.getInstance().send())
 * which requires the RAW FCM token. Sending an Expo push token to Firebase
 * Admin SDK will always fail with INVALID_ARGUMENT / UNREGISTERED.
 *
 * Returns null on simulators (no FCM binding) or when permission is denied.
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

    // getDevicePushTokenAsync returns the raw platform token:
    //   Android → FCM registration token (long alphanumeric string)
    //   iOS     → APNs device token (hex string)
    // This is what Firebase Admin SDK expects when calling send().
    const tokenData = await Notifications.getDevicePushTokenAsync()
    return tokenData?.data ?? null
  } catch (err) {
    // Simulators have no FCM/APNs binding — this throws; treat as non-fatal.
    console.warn('[FCM] Could not get device push token:', err.message)
    return null
  }
}

/**
 * Register the FCM token with the backend so the server can push
 * notifications to this device.
 */
async function registerPushToken() {
  const token = await requestPushToken()
  if (!token) return

  const platform = Platform.OS === 'ios' ? 'IOS'
                 : Platform.OS === 'android' ? 'ANDROID'
                 : 'WEB'

  try {
    await notificationApi.registerToken(token, platform)
    // Persist so we can deactivate it on logout without requesting again.
    await AsyncStorage.setItem('sr_push_token', token)
    console.log('[FCM] Token registered:', token.slice(0, 20) + '…')
  } catch (err) {
    // Non-fatal — the user is still logged in; notifications just won't work.
    console.warn('[FCM] Token registration failed:', err.message)
  }
}

/**
 * Tell the backend this token is no longer active so stale tokens are not
 * used for future pushes.
 */
async function deactivatePushToken() {
  try {
    const token = await AsyncStorage.getItem('sr_push_token')
    if (token) {
      await notificationApi.deactivateToken(token)
      await AsyncStorage.removeItem('sr_push_token')
    }
  } catch (err) {
    console.warn('[FCM] Token deactivation failed:', err.message)
  }
}

// ── AuthProvider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from storage on app start.
  useEffect(() => {
    AsyncStorage.getItem('sr_user').then(stored => {
      if (stored) setUser(JSON.parse(stored))
      setLoading(false)
    })
  }, [])

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password })
    await AsyncStorage.setItem('sr_token',   data.token)
    await AsyncStorage.setItem('sr_refresh', data.refreshToken)
    await AsyncStorage.setItem('sr_user',    JSON.stringify(data))
    setUser(data)

    // Register FCM token after credentials are persisted so the Axios
    // interceptor can attach the Bearer token to the registration request.
    await registerPushToken()

    return data
  }

  const register = async (payload) => {
    const { data } = await authApi.register(payload)
    await AsyncStorage.setItem('sr_token',   data.token)
    await AsyncStorage.setItem('sr_refresh', data.refreshToken)
    await AsyncStorage.setItem('sr_user',    JSON.stringify(data))
    setUser(data)

    // Same as login — register FCM token immediately after account creation.
    await registerPushToken()

    return data
  }

  const logout = async () => {
    // Deactivate the push token first while we still have a valid JWT.
    await deactivatePushToken()
    await AsyncStorage.multiRemove(['sr_token', 'sr_refresh', 'sr_user'])
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
