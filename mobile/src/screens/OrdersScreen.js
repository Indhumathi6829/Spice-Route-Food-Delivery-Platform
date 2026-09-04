import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { orderApi } from '../api'

const BRAND = '#f97316'
const STATUS_COLOR = {
  PLACED: '#3b82f6', CONFIRMED: '#f97316', PREPARING: '#f97316',
  READY_FOR_PICKUP: '#f59e0b', OUT_FOR_DELIVERY: '#8b5cf6',
  DELIVERED: '#22c55e', CANCELLED: '#ef4444',
}

export default function OrdersScreen() {
  const navigation = useNavigation()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderApi.getMyOrders().then(r => setOrders(r.data.content || [])).finally(() => setLoading(false))
  }, [])

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={BRAND} /></View>

  if (!orders.length) return (
    <View style={styles.center}>
      <Ionicons name="bag-outline" size={64} color="#e5e7eb" />
      <Text style={styles.emptyTitle}>No orders yet</Text>
      <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Menu')}>
        <Text style={styles.browseBtnText}>Order Now</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <Text style={styles.header}>My Orders</Text>
      <FlatList
        data={orders} keyExtractor={o => o.id.toString()}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        renderItem={({ item: o }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OrderTracking', { orderId: o.id })}>
            <View style={styles.cardTop}>
              <Text style={styles.orderId}>Order #{o.id}</Text>
              <View style={[styles.badge, { backgroundColor: STATUS_COLOR[o.status] + '20' }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLOR[o.status] }]}>
                  {o.status?.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>
            <Text style={styles.items} numberOfLines={1}>
              {o.items?.map(i => i.foodItemName).join(', ')}
            </Text>
            <View style={styles.cardBottom}>
              <Text style={styles.date}>
                {new Date(o.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.total}>₹{o.totalAmount}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyTitle:   { fontSize: 18, fontWeight: '700', color: '#374151' },
  browseBtn:    { backgroundColor: BRAND, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  browseBtnText:{ color: '#fff', fontWeight: '700' },
  header:       { fontSize: 22, fontWeight: '800', color: '#111827', padding: 16, paddingTop: 56 },
  card:         { backgroundColor: '#fff', borderRadius: 18, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  cardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderId:      { fontSize: 15, fontWeight: '800', color: '#111827' },
  badge:        { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:    { fontSize: 11, fontWeight: '700' },
  items:        { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  cardBottom:   { flexDirection: 'row', justifyContent: 'space-between' },
  date:         { fontSize: 12, color: '#9ca3af' },
  total:        { fontSize: 15, fontWeight: '800', color: '#111827' },
})
