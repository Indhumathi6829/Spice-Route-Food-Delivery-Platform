import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { deliveryApi } from '../api'

const BRAND   = '#f97316'
const TIMEOUT = 60  // seconds to respond

export default function DeliveryRequestScreen() {
  const navigation = useNavigation()
  const { assignment } = useRoute().params

  const [seconds,    setSeconds]    = useState(TIMEOUT)
  const [responding, setResponding] = useState(false)
  const timerRef  = useRef(null)
  const pulseAnim = useRef(new Animated.Value(1)).current

  // Countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(timerRef.current)
          navigation.goBack()
          return 0
        }
        return s - 1
      })
    }, 1000)

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 600, useNativeDriver: true }),
      ])
    ).start()

    return () => clearInterval(timerRef.current)
  }, [navigation, pulseAnim])

  const accept = async () => {
    clearInterval(timerRef.current)
    setResponding(true)
    try {
      await deliveryApi.accept(assignment.id)
      navigation.replace('Active Delivery')
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to accept. Order may have been reassigned.')
      navigation.goBack()
    }
  }

  const reject = async () => {
    clearInterval(timerRef.current)
    setResponding(false)
    try {
      await deliveryApi.reject(assignment.id)
    } catch {}
    navigation.goBack()
  }

  const timerColor = seconds > 30 ? '#22c55e' : seconds > 15 ? '#f59e0b' : '#ef4444'
  const distText   = assignment.distanceKm ? `${assignment.distanceKm.toFixed(1)} km away` : 'Nearby'
  const earning    = Math.round((assignment.totalAmount || 0) * 0.1 + 20)

  return (
    <View style={styles.container}>
      {/* Timer */}
      <View style={styles.timerRow}>
        <Text style={styles.timerLabel}>Respond within</Text>
        <Text style={[styles.timer, { color: timerColor }]}>{seconds}s</Text>
      </View>

      {/* Pulse badge */}
      <Animated.View style={[styles.badge, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.badgeText}>NEW DELIVERY REQUEST 🛵</Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* Order details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Details</Text>
          <View style={styles.row}>
            <Ionicons name="receipt-outline" size={16} color="#9ca3af" />
            <Text style={styles.rowText}>Order #{assignment.orderId}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="person-outline" size={16} color="#9ca3af" />
            <Text style={styles.rowText}>{assignment.customerName}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={16} color="#9ca3af" />
            <Text style={styles.rowText} numberOfLines={2}>{assignment.deliveryAddress}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="bag-outline" size={16} color="#9ca3af" />
            <Text style={styles.rowText}>
              {assignment.items?.map(i => `${i.foodItemName} ×${i.quantity}`).join(', ')}
            </Text>
          </View>
        </View>

        {/* Earning estimate */}
        <View style={styles.earningCard}>
          <View style={styles.earningItem}>
            <Text style={styles.earningLabel}>Order Value</Text>
            <Text style={styles.earningValue}>₹{assignment.totalAmount}</Text>
          </View>
          <View style={styles.earningDivider} />
          <View style={styles.earningItem}>
            <Text style={styles.earningLabel}>Your Earning</Text>
            <Text style={[styles.earningValue, { color: '#22c55e' }]}>~₹{earning}</Text>
          </View>
          <View style={styles.earningDivider} />
          <View style={styles.earningItem}>
            <Text style={styles.earningLabel}>Distance</Text>
            <Text style={styles.earningValue}>{distText}</Text>
          </View>
        </View>

        {/* Payment type */}
        <View style={styles.paymentChip}>
          <Ionicons
            name={assignment.paymentMethod === 'CASH_ON_DELIVERY' ? 'cash-outline' : 'card-outline'}
            size={16} color={assignment.paymentMethod === 'CASH_ON_DELIVERY' ? '#f59e0b' : '#22c55e'} />
          <Text style={styles.paymentText}>
            {assignment.paymentMethod === 'CASH_ON_DELIVERY' ? 'Collect Cash on Delivery' : 'Already Paid Online'}
          </Text>
        </View>
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.rejectBtn} onPress={reject} disabled={responding}>
          <Ionicons name="close" size={22} color="#ef4444" />
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.acceptBtn, responding && { opacity: 0.6 }]}
          onPress={accept} disabled={responding}>
          <Ionicons name="checkmark" size={22} color="#fff" />
          <Text style={styles.acceptText}>{responding ? 'Accepting...' : 'Accept'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#111827' },
  timerRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 8 },
  timerLabel:    { fontSize: 13, color: '#9ca3af' },
  timer:         { fontSize: 28, fontWeight: '800' },
  badge:         { backgroundColor: '#f97316', marginHorizontal: 16, borderRadius: 16, paddingVertical: 12, alignItems: 'center', marginBottom: 12 },
  badgeText:     { color: '#fff', fontWeight: '800', fontSize: 16 },
  body:          { padding: 16, gap: 14, paddingBottom: 120 },
  card:          { backgroundColor: '#1f2937', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#374151', gap: 10 },
  cardTitle:     { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
  row:           { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  rowText:       { flex: 1, fontSize: 14, color: '#d1d5db', lineHeight: 20 },
  earningCard:   { backgroundColor: '#1f2937', borderRadius: 18, padding: 16, flexDirection: 'row', borderWidth: 1, borderColor: '#374151' },
  earningItem:   { flex: 1, alignItems: 'center', gap: 4 },
  earningLabel:  { fontSize: 11, color: '#9ca3af' },
  earningValue:  { fontSize: 18, fontWeight: '800', color: '#fff' },
  earningDivider:{ width: 1, backgroundColor: '#374151' },
  paymentChip:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1f2937', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#374151' },
  paymentText:   { fontSize: 13, color: '#d1d5db', fontWeight: '600' },
  buttons:       { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, padding: 20, paddingBottom: 36, backgroundColor: '#111827', borderTopWidth: 1, borderTopColor: '#1f2937' },
  rejectBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1f2937', borderRadius: 16, paddingVertical: 16, borderWidth: 2, borderColor: '#ef4444' },
  rejectText:    { color: '#ef4444', fontWeight: '700', fontSize: 16 },
  acceptBtn:     { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#f97316', borderRadius: 16, paddingVertical: 16 },
  acceptText:    { color: '#fff', fontWeight: '800', fontSize: 16 },
})
