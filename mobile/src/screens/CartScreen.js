import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { cartApi } from '../api'

const BRAND = '#f97316'

export default function CartScreen() {
  const navigation = useNavigation()
  const [cart,    setCart]    = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    cartApi.get().then(r => setCart(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const updateQty = async (itemId, qty) => {
    try {
      const { data } = await cartApi.updateItem(itemId, qty)
      setCart(data)
    } catch {}
  }

  const remove = async (itemId) => {
    try {
      const { data } = await cartApi.removeItem(itemId)
      setCart(data)
    } catch {}
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={BRAND} /></View>

  if (!cart || !cart.items?.length) return (
    <View style={styles.center}>
      <Ionicons name="bag-outline" size={80} color="#e5e7eb" />
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySub}>Browse our menu to add items</Text>
      <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Menu')}>
        <Text style={styles.browseBtnText}>Browse Menu</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <Text style={styles.header}>Your Cart</Text>
      <FlatList
        data={cart.items} keyExtractor={i => i.id.toString()}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 220 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={{ uri: item.imageUrl }} style={styles.img} resizeMode="cover" />
            <View style={styles.rowBody}>
              <Text style={styles.itemName} numberOfLines={2}>{item.foodItemName}</Text>
              <Text style={styles.itemPrice}>₹{item.unitPrice}</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => item.quantity > 1 ? updateQty(item.id, item.quantity - 1) : remove(item.id)}>
                  <Ionicons name="remove" size={16} color={BRAND} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, item.quantity + 1)}>
                  <Ionicons name="add" size={16} color={BRAND} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 8 }}>
              <TouchableOpacity onPress={() => remove(item.id)}>
                <Ionicons name="trash-outline" size={20} color="#9ca3af" />
              </TouchableOpacity>
              <Text style={styles.lineTotal}>₹{item.lineTotal}</Text>
            </View>
          </View>
        )}
      />

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>₹{cart.subtotal?.toFixed(2)}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Delivery Fee</Text><Text style={styles.summaryValue}>₹{cart.deliveryFee?.toFixed(2)}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Tax (5%)</Text><Text style={styles.summaryValue}>₹{cart.tax?.toFixed(2)}</Text></View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{cart.total?.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate('Checkout')}>
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyTitle:     { fontSize: 18, fontWeight: '700', color: '#374151' },
  emptySub:       { fontSize: 14, color: '#9ca3af' },
  browseBtn:      { backgroundColor: BRAND, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  browseBtnText:  { color: '#fff', fontWeight: '700', fontSize: 15 },
  header:         { fontSize: 22, fontWeight: '800', color: '#111827', padding: 16, paddingTop: 56 },
  row:            { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, alignItems: 'center', padding: 12, gap: 12 },
  img:            { width: 72, height: 72, borderRadius: 12 },
  rowBody:        { flex: 1 },
  itemName:       { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
  itemPrice:      { fontSize: 13, color: BRAND, fontWeight: '600', marginBottom: 8 },
  qtyRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 10, alignSelf: 'flex-start', paddingHorizontal: 4 },
  qtyBtn:         { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  qtyText:        { fontSize: 14, fontWeight: '800', color: '#111827', width: 24, textAlign: 'center' },
  lineTotal:      { fontSize: 15, fontWeight: '800', color: '#111827' },
  summary:        { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, elevation: 20, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 20 },
  summaryRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel:   { fontSize: 14, color: '#6b7280' },
  summaryValue:   { fontSize: 14, color: '#111827' },
  totalRow:       { borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8, marginBottom: 12 },
  totalLabel:     { fontSize: 16, fontWeight: '800', color: '#111827' },
  totalValue:     { fontSize: 18, fontWeight: '800', color: '#111827' },
  checkoutBtn:    { backgroundColor: BRAND, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  checkoutBtnText:{ color: '#fff', fontWeight: '700', fontSize: 16 },
})
