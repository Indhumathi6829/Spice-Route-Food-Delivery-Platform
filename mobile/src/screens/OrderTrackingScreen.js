import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { orderApi } from '../api'

const BRAND = '#f97316'
const STEPS = [
  { key: 'PLACED',            label: 'Order Placed',        emoji: '📝' },
  { key: 'CONFIRMED',         label: 'Confirmed',           emoji: '✅' },
  { key: 'PREPARING',         label: 'Preparing',           emoji: '👨‍🍳' },
  { key: 'READY_FOR_PICKUP',  label: 'Ready for Pickup',    emoji: '🛍️' },
  { key: 'OUT_FOR_DELIVERY',  label: 'Out for Delivery',    emoji: '🛵' },
  { key: 'DELIVERED',         label: 'Delivered',           emoji: '🎉' },
]

export default function OrderTrackingScreen() {
  const navigation = useNavigation()
  const { orderId } = useRoute().params
  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => orderApi.getById(orderId).then(r => setOrder(r.data)).finally(() => setLoading(false))

  useEffect(() => {
    load()
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [orderId])

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={BRAND} /></View>
  if (!order)  return <View style={styles.center}><Text style={{ color: '#6b7280' }}>Order not found</Text></View>

  const currentIdx = STEPS.findIndex(s => s.key === order.status)
  const cancelled  = order.status === 'CANCELLED'

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Order #{orderId}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}>
        {/* Status badge */}
        <View style={[styles.statusBanner, { backgroundColor: cancelled ? '#fef2f2' : '#fff7ed' }]}>
          <Text style={[styles.statusText, { color: cancelled ? '#ef4444' : BRAND }]}>
            {order.status?.replace(/_/g, ' ')}
          </Text>
        </View>

        {/* Timeline */}
        {!cancelled && (
          <View style={styles.card}>
            {STEPS.map((s, i) => {
              const done    = i <= currentIdx
              const current = i === currentIdx
              return (
                <View key={s.key} style={styles.step}>
                  <View style={styles.stepLeft}>
                    <View style={[styles.stepDot, done && styles.stepDotDone, current && styles.stepDotCurrent]}>
                      <Text style={styles.stepEmoji}>{done ? (current ? s.emoji : '✓') : ''}</Text>
                    </View>
                    {i < STEPS.length - 1 && (
                      <View style={[styles.stepLine, i < currentIdx && styles.stepLineDone]} />
                    )}
                  </View>
                  <Text style={[styles.stepLabel, current && { color: BRAND, fontWeight: '700' }, !done && { color: '#9ca3af' }]}>
                    {s.label}
                  </Text>
                </View>
              )
            })}
          </View>
        )}

        {/* Delivery partner */}
        {order.deliveryPartnerName && (
          <View style={styles.card}>
            <View style={styles.partnerRow}>
              <View style={styles.partnerAvatar}>
                <Text style={styles.partnerInitial}>{order.deliveryPartnerName.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.partnerName}>{order.deliveryPartnerName}</Text>
                <Text style={{ fontSize: 12, color: '#9ca3af' }}>Delivery Partner</Text>
              </View>
              {order.deliveryPartnerPhone && (
                <TouchableOpacity style={styles.callBtn}>
                  <Ionicons name="call" size={18} color={BRAND} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Address */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}><Ionicons name="location" size={14} color={BRAND} /> Delivery Address</Text>
          <Text style={styles.addrText}>
            {order.deliveryAddress?.houseNumber}, {order.deliveryAddress?.street}
          </Text>
          <Text style={styles.addrText}>
            {order.deliveryAddress?.city}, {order.deliveryAddress?.state}
          </Text>
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items Ordered</Text>
          {order.items?.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.foodItemName}</Text>
              <Text style={styles.itemQty}>×{item.quantity}</Text>
              <Text style={styles.itemTotal}>₹{item.lineTotal}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={{ fontWeight: '800', color: '#111827', fontSize: 14 }}>Total</Text>
            <Text style={{ fontWeight: '800', color: '#111827', fontSize: 15 }}>₹{order.totalAmount}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  topTitle:       { fontSize: 17, fontWeight: '800', color: '#111827' },
  statusBanner:   { borderRadius: 16, padding: 14, alignItems: 'center' },
  statusText:     { fontSize: 18, fontWeight: '800' },
  card:           { backgroundColor: '#fff', borderRadius: 18, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  cardTitle:      { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 10 },
  step:           { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepLeft:       { alignItems: 'center' },
  stepDot:        { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  stepDotDone:    { backgroundColor: '#fff7ed' },
  stepDotCurrent: { backgroundColor: BRAND },
  stepEmoji:      { fontSize: 14 },
  stepLine:       { width: 2, height: 28, backgroundColor: '#e5e7eb', marginTop: 0 },
  stepLineDone:   { backgroundColor: BRAND },
  stepLabel:      { fontSize: 14, color: '#374151', paddingTop: 6, paddingBottom: 20 },
  partnerRow:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  partnerAvatar:  { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff7ed', justifyContent: 'center', alignItems: 'center' },
  partnerInitial: { fontSize: 18, fontWeight: '800', color: BRAND },
  partnerName:    { fontSize: 15, fontWeight: '700', color: '#111827' },
  callBtn:        { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: BRAND, justifyContent: 'center', alignItems: 'center' },
  addrText:       { fontSize: 14, color: '#6b7280', lineHeight: 22 },
  itemRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  itemName:       { flex: 1, fontSize: 13, color: '#374151' },
  itemQty:        { fontSize: 13, color: '#9ca3af', marginRight: 12 },
  itemTotal:      { fontSize: 13, fontWeight: '700', color: '#111827' },
  divider:        { height: 1, backgroundColor: '#f3f4f6', marginVertical: 10 },
})
