import { useEffect, useState, useRef, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import { useNavigation } from '@react-navigation/native'
import { deliveryApi } from '../api'
import { useAuth } from '../context/AuthContext'

const BRAND = '#f97316'
const LOCATION_INTERVAL_MS = 15000  // update every 15 sec

export default function DashboardScreen() {
  const navigation = useNavigation()
  const { user }   = useAuth()

  const [profile,   setProfile]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [toggling,  setToggling]  = useState(false)
  const [hasPending, setHasPending] = useState(false)
  const locationRef = useRef(null)
  const pollRef     = useRef(null)

  // ── Load profile ────────────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    try {
      const { data } = await deliveryApi.getProfile()
      setProfile(data)
    } catch {}
    finally { setLoading(false) }
  }, [])

  // ── Poll for pending assignment requests ─────────────────────────────────
  const pollPending = useCallback(async () => {
    try {
      const res = await deliveryApi.getPending()
      if (res.status === 200 && res.data?.id) {
        setHasPending(true)
        navigation.navigate('DeliveryRequest', { assignment: res.data })
      } else {
        setHasPending(false)
      }
    } catch {}
  }, [navigation])

  // ── Start / stop location tracking ──────────────────────────────────────
  const startLocationTracking = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Location Required', 'Please grant location permission to go online.')
      return
    }
    locationRef.current = setInterval(async () => {
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        await deliveryApi.updateLocation({
          latitude:        loc.coords.latitude,
          longitude:       loc.coords.longitude,
          speedKmh:        loc.coords.speed ? loc.coords.speed * 3.6 : null,
          headingDegrees:  loc.coords.heading,
        })
      } catch {}
    }, LOCATION_INTERVAL_MS)
  }, [])

  const stopLocationTracking = useCallback(() => {
    if (locationRef.current) { clearInterval(locationRef.current); locationRef.current = null }
  }, [])

  useEffect(() => {
    loadProfile()
    pollRef.current = setInterval(pollPending, 8000)
    return () => {
      clearInterval(pollRef.current)
      stopLocationTracking()
    }
  }, [loadProfile, pollPending, stopLocationTracking])

  // ── Go Online / Offline ──────────────────────────────────────────────────
  const toggleOnline = async (value) => {
    setToggling(true)
    try {
      if (value) {
        await deliveryApi.goOnline()
        await startLocationTracking()
      } else {
        await deliveryApi.goOffline()
        stopLocationTracking()
      }
      await loadProfile()
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update status')
    } finally { setToggling(false) }
  }

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color={BRAND} /></View>
  )

  const isOnline = profile?.isOnline || false

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subGreeting}>
            {isOnline ? "You're online and earning" : "You're currently offline"}
          </Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: isOnline ? '#22c55e' : '#6b7280' }]} />
      </View>

      {/* Online Toggle */}
      <View style={styles.toggleCard}>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>{isOnline ? '🟢 Online' : '⚫ Offline'}</Text>
            <Text style={styles.toggleSub}>
              {isOnline ? 'Receiving delivery requests' : 'Toggle to start accepting orders'}
            </Text>
          </View>
          {toggling
            ? <ActivityIndicator size="small" color={BRAND} />
            : <Switch value={isOnline} onValueChange={toggleOnline}
                trackColor={{ false: '#374151', true: '#f97316' }}
                thumbColor="#fff" />
          }
        </View>
        {hasPending && isOnline && (
          <View style={styles.pendingBanner}>
            <Ionicons name="notifications" size={16} color={BRAND} />
            <Text style={styles.pendingText}>New delivery request! Check it now.</Text>
            <TouchableOpacity onPress={() => pollPending()}>
              <Text style={{ color: BRAND, fontWeight: '700', fontSize: 12 }}>View →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Stats */}
      {profile && (
        <View style={styles.statsGrid}>
          {[
            { icon: 'bag',       label: 'Total Deliveries', value: profile.totalDeliveries || 0,    color: '#f97316' },
            { icon: 'today',     label: "Today's Deliveries", value: profile.todayDeliveries || 0,  color: '#22c55e' },
            { icon: 'star',      label: 'Rating',            value: `${(profile.rating || 5).toFixed(1)} ★`, color: '#f59e0b' },
            { icon: 'bicycle',   label: 'Vehicle',           value: profile.vehicleType || '—',     color: '#3b82f6' },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.color + '20' }]}>
                <Ionicons name={s.icon} size={20} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Quick actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {[
          { icon: 'bicycle-outline',  label: 'Active Delivery', screen: 'Active Delivery',  color: BRAND },
          { icon: 'time-outline',     label: 'History',         screen: 'History',           color: '#22c55e' },
          { icon: 'person-outline',   label: 'Profile',         screen: 'Profile',           color: '#3b82f6' },
          { icon: 'refresh-outline',  label: 'Refresh',         action: loadProfile,         color: '#9ca3af' },
        ].map(a => (
          <TouchableOpacity key={a.label} style={styles.actionCard}
            onPress={() => a.action ? a.action() : navigation.navigate(a.screen)}>
            <View style={[styles.actionIcon, { backgroundColor: a.color + '20' }]}>
              <Ionicons name={a.icon} size={24} color={a.color} />
            </View>
            <Text style={styles.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status info */}
      {profile?.currentLatitude && (
        <View style={styles.locationCard}>
          <Ionicons name="navigate" size={14} color="#22c55e" />
          <Text style={styles.locationText}>
            GPS active · {profile.currentLatitude.toFixed(4)}, {profile.currentLongitude.toFixed(4)}
          </Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#111827' },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },
  greeting:      { fontSize: 22, fontWeight: '800', color: '#fff' },
  subGreeting:   { fontSize: 13, color: '#9ca3af', marginTop: 3 },
  statusDot:     { width: 14, height: 14, borderRadius: 7 },
  toggleCard:    { backgroundColor: '#1f2937', borderRadius: 20, marginHorizontal: 16, padding: 18, borderWidth: 1, borderColor: '#374151', marginBottom: 16 },
  toggleRow:     { flexDirection: 'row', alignItems: 'center' },
  toggleTitle:   { fontSize: 18, fontWeight: '800', color: '#fff' },
  toggleSub:     { fontSize: 12, color: '#9ca3af', marginTop: 3 },
  pendingBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f97316' + '20', borderRadius: 12, padding: 10, marginTop: 14, borderWidth: 1, borderColor: '#f97316' + '40' },
  pendingText:   { flex: 1, fontSize: 12, color: '#fed7aa', fontWeight: '600' },
  statsGrid:     { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, marginBottom: 20 },
  statCard:      { flex: 1, minWidth: '44%', backgroundColor: '#1f2937', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#374151' },
  statIcon:      { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue:     { fontSize: 20, fontWeight: '800', color: '#fff' },
  statLabel:     { fontSize: 11, color: '#9ca3af', marginTop: 3, textAlign: 'center' },
  sectionTitle:  { fontSize: 16, fontWeight: '700', color: '#d1d5db', paddingHorizontal: 20, marginBottom: 12 },
  actionsGrid:   { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, marginBottom: 20 },
  actionCard:    { flex: 1, minWidth: '44%', backgroundColor: '#1f2937', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#374151' },
  actionIcon:    { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel:   { fontSize: 13, fontWeight: '600', color: '#d1d5db' },
  locationCard:  { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1f2937', borderRadius: 12, marginHorizontal: 16, padding: 10, borderWidth: 1, borderColor: '#374151' },
  locationText:  { fontSize: 11, color: '#9ca3af' },
})
