import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { deliveryApi } from '../api'

const BRAND = '#f97316'

export default function HistoryScreen() {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    deliveryApi.getMyOrders()
      .then(r => setOrders(r.data.filter(o => ['DELIVERED', 'CANCELLED'].includes(o.status))))
      .finally(() => setLoading(false))
  }, [])

  const delivered = orders.filter(o => o.status === 'DELIVERED')
  const totalEarnings = delivered.length * 40  // ₹40 estimated per delivery

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={BRAND} /></View>

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Delivery History</Text>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{delivered.length}</Text>
          <Text style={styles.summaryLabel}>Delivered</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: '#22c55e' }]}>₹{totalEarnings}</Text>
          <Text style={styles.summaryLabel}>Est. Earnings</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{orders.filter(o => o.status === 'CANCELLED').length}</Text>
          <Text style={styles.summaryLabel}>Cancelled</Text>
        </View>
      </View>

      {orders.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="time-outline" size={64} color="#374151" />
          <Text style={styles.emptyText}>No delivery history yet</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => o.id.toString()}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 100 }}
          renderItem={({ item: o }) => (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <View style={[styles.iconBox, { backgroundColor: o.status === 'DELIVERED' ? '#22c55e20' : '#ef444420' }]}>
                  <Ionicons
                    name={o.status === 'DELIVERED' ? 'checkmark-circle' : 'close-circle'}
                    size={22}
                    color={o.status === 'DELIVERED' ? '#22c55e' : '#ef4444'}
                  />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.orderId}>Order #{o.id}</Text>
                  <Text style={styles.customer}>{o.customerName}</Text>
                  <Text style={styles.date}>
                    {new Date(o.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.amount}>₹{o.totalAmount}</Text>
                  {o.status === 'DELIVERED' && (
                    <Text style={styles.earning}>+₹40</Text>
                  )}
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#111827' },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  header:       { fontSize: 22, fontWeight: '800', color: '#fff', padding: 16, paddingTop: 56 },
  summaryRow:   { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 16 },
  summaryCard:  { flex: 1, backgroundColor: '#1f2937', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#374151' },
  summaryValue: { fontSize: 22, fontWeight: '800', color: '#fff' },
  summaryLabel: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  emptyText:    { color: '#9ca3af', fontSize: 15, marginTop: 12 },
  card:         { backgroundColor: '#1f2937', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#374151' },
  cardRow:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox:      { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  cardBody:     { flex: 1 },
  orderId:      { fontSize: 14, fontWeight: '700', color: '#fff' },
  customer:     { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  date:         { fontSize: 11, color: '#6b7280', marginTop: 2 },
  cardRight:    { alignItems: 'flex-end' },
  amount:       { fontSize: 15, fontWeight: '800', color: '#fff' },
  earning:      { fontSize: 12, color: '#22c55e', fontWeight: '700', marginTop: 2 },
})
