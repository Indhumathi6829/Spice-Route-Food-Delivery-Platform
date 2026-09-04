import { useEffect, useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Linking } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { deliveryApi } from '../api'

const BRAND = '#f97316'

const STATUS_STEPS = [
  { key: 'CONFIRMED',        label: 'Order Confirmed',          icon: 'checkmark-circle',  color: '#22c55e' },
  { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup',         icon: 'bag-check',         color: '#f59e0b' },
  { key: 'OUT_FOR_DELIVERY', label: 'Picked Up — Out for Delivery', icon: 'bicycle',        color: '#f97316' },
  { key: 'DELIVERED',        label: 'Delivered',                icon: 'home',              color: '#22c55e' },
]

const NEXT_STATUS = {
  READY_FOR_PICKUP: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
}

const NEXT_LABEL = {
  READY_FOR_PICKUP: '📦 Mark Picked Up',
  OUT_FOR_DELIVERY: '🏠 Mark Delivered',
}

export default function ActiveDeliveryScreen() {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [updating, setUpdating] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await deliveryApi.getMyOrders()
      const active = data.filter(o =>
        ['CONFIRMED', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(o.status))
      setOrders(active)
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const updateStatus = async (orderId, newStatus) => {
    Alert.alert(
      'Confirm Status Update',
      `Mark order as ${newStatus.replace(/_/g, ' ')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm', style: 'default',
          onPress: async () => {
            setUpdating(orderId)
            try {
              await deliveryApi.updateStatus(orderId, newStatus)
              await load()
            } catch (e) {
              Alert.alert('Error', e.response?.data?.message || 'Failed to update status')
            } finally { setUpdating(null) }
          }
        }
      ]
    )
  }

  const openMaps = (lat, lng, label) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
    Linking.canOpenURL(url).then(ok => {
      if (ok) Linking.openURL(url)
      else Alert.alert('Maps', 'Could not open maps')
    })
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={BRAND} /></View>

  if (orders.length === 0) return (
    <View style={styles.center}>
      <Ionicons name="bicycle-outline" size={72} color="#374151" />
      <Text style={styles.emptyTitle}>No Active Deliveries</Text>
      <Text style={styles.emptySub}>New assignments will appear here when you accept a request</Text>
      <TouchableOpacity style={styles.refreshBtn} onPress={load}>
        <Ionicons name="refresh" size={16} color={BRAND} />
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Active Deliveries</Text>
        <TouchableOpacity onPress={load} style={styles.refreshIcon}>
          <Ionicons name="refresh" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {orders.map(order => {
        const currentStep = STATUS_STEPS.find(s => s.key === order.status)
        const nextStatus  = NEXT_STATUS[order.status]
        const addr        = order.deliveryAddress

        return (
          <View key={order.id} style={styles.card}>
            {/* Order header */}
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>Order #{order.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: currentStep?.color + '25' }]}>
                <Ionicons name={currentStep?.icon || 'ellipse'} size={12} color={currentStep?.color || '#9ca3af'} />
                <Text style={[styles.statusText, { color: currentStep?.color || '#9ca3af' }]}>
                  {order.status?.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>

            {/* Customer info */}
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={14} color="#9ca3af" />
              <Text style={styles.infoText}>{order.customerName}</Text>
              {order.customerPhone && (
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${order.customerPhone}`)}
                  style={styles.callBtn}>
                  <Ionicons name="call" size={14} color={BRAND} />
                  <Text style={styles.callText}>Call</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Address */}
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={14} color="#9ca3af" />
              <Text style={styles.infoText} numberOfLines={2}>
                {addr?.houseNumber}, {addr?.street}, {addr?.area ? addr.area + ', ' : ''}{addr?.city}
              </Text>
            </View>

            {/* Navigate button */}
            {addr?.latitude && addr?.longitude && (
              <TouchableOpacity style={styles.navBtn}
                onPress={() => openMaps(addr.latitude, addr.longitude, order.customerName)}>
                <Ionicons name="navigate" size={16} color="#fff" />
                <Text style={styles.navText}>Navigate to Customer</Text>
              </TouchableOpacity>
            )}

            {/* Items */}
            <View style={styles.itemsList}>
              {order.items?.slice(0, 3).map(i => (
                <Text key={i.id} style={styles.itemText}>
                  • {i.foodItemName} ×{i.quantity}
                </Text>
              ))}
              {order.items?.length > 3 && (
                <Text style={styles.itemText}>+{order.items.length - 3} more items</Text>
              )}
            </View>

            {/* Amount & payment */}
            <View style={styles.amountRow}>
              <View>
                <Text style={styles.amount}>₹{order.totalAmount}</Text>
                <Text style={styles.payMethod}>
                  {order.paymentMethod === 'CASH_ON_DELIVERY' ? '💵 Collect Cash' : '✅ Already Paid'}
                </Text>
              </View>
              {/* Status update button */}
              {nextStatus && (
                <TouchableOpacity
                  style={[styles.updateBtn, updating === order.id && { opacity: 0.6 }]}
                  onPress={() => updateStatus(order.id, nextStatus)}
                  disabled={updating === order.id}>
                  {updating === order.id
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.updateBtnText}>{NEXT_LABEL[order.status]}</Text>
                  }
                </TouchableOpacity>
              )}
            </View>
          </View>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#111827' },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827', padding: 32 },
  emptyTitle:   { fontSize: 18, fontWeight: '700', color: '#fff', marginTop: 16 },
  emptySub:     { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  refreshBtn:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1f2937', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, marginTop: 20, borderWidth: 1, borderColor: '#374151' },
  refreshText:  { color: BRAND, fontWeight: '700' },
  titleRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 40 },
  title:        { fontSize: 20, fontWeight: '800', color: '#fff' },
  refreshIcon:  { padding: 4 },
  card:         { backgroundColor: '#1f2937', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#374151', gap: 10 },
  cardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId:      { fontSize: 16, fontWeight: '800', color: '#fff' },
  statusBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText:   { fontSize: 11, fontWeight: '700' },
  infoRow:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText:     { flex: 1, fontSize: 13, color: '#d1d5db' },
  callBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f97316' + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  callText:     { fontSize: 12, color: BRAND, fontWeight: '700' },
  navBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#3b82f6', borderRadius: 12, paddingVertical: 10 },
  navText:      { color: '#fff', fontWeight: '700', fontSize: 13 },
  itemsList:    { backgroundColor: '#111827', borderRadius: 10, padding: 10 },
  itemText:     { fontSize: 12, color: '#9ca3af', marginBottom: 2 },
  amountRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, borderTopWidth: 1, borderTopColor: '#374151' },
  amount:       { fontSize: 20, fontWeight: '800', color: '#fff' },
  payMethod:    { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  updateBtn:    { backgroundColor: BRAND, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10 },
  updateBtnText:{ color: '#fff', fontWeight: '800', fontSize: 13 },
})
