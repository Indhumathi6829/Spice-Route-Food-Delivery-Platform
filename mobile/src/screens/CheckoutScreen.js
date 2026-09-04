import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { addressApi, couponApi, orderApi, cartApi } from '../api'

const BRAND = '#f97316'

export default function CheckoutScreen() {
  const navigation = useNavigation()
  const [cart,      setCart]      = useState(null)
  const [addresses, setAddresses] = useState([])
  const [selAddr,   setSelAddr]   = useState(null)
  const [coupon,    setCoupon]    = useState('')
  const [couponData,setCouponData]= useState(null)
  const [payMethod, setPayMethod] = useState('CASH_ON_DELIVERY')
  const [placing,   setPlacing]   = useState(false)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([cartApi.get(), addressApi.getAll()])
      .then(([c, a]) => {
        setCart(c.data)
        setAddresses(a.data)
        const def = a.data.find(x => x.isDefault) || a.data[0]
        if (def) setSelAddr(def.id)
      }).finally(() => setLoading(false))
  }, [])

  const applyCoupon = async () => {
    if (!coupon.trim()) return
    try {
      const { data } = await couponApi.validate(coupon.trim(), cart.subtotal)
      setCouponData(data)
      Alert.alert('Coupon Applied!', `You save ₹${data.discountValue}`)
    } catch (e) {
      Alert.alert('Invalid Coupon', e.response?.data?.message || 'Coupon not valid')
    }
  }

  const placeOrder = async () => {
    if (!selAddr) { Alert.alert('Error', 'Please select a delivery address'); return }
    setPlacing(true)
    try {
      const { data: order } = await orderApi.place({
        addressId: selAddr,
        items: cart.items.map(i => ({ foodItemId: i.foodItemId, quantity: i.quantity })),
        couponCode: couponData ? coupon : null,
        paymentMethod: payMethod,
      })
      navigation.replace('OrderSuccess', { orderId: order.id })
    } catch (e) {
      Alert.alert('Order Failed', e.response?.data?.message || 'Could not place order')
    } finally { setPlacing(false) }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={BRAND} /></View>

  const discount = couponData ? parseFloat(couponData.discountValue) : 0
  const total = (cart?.subtotal || 0) + 49 + (cart?.tax || 0) - discount

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Checkout</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 160 }}>
        {/* Address */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}><Ionicons name="location" size={16} color={BRAND} /> Delivery Address</Text>
          {addresses.map(a => (
            <TouchableOpacity key={a.id} style={[styles.addrRow, selAddr === a.id && styles.addrRowActive]}
              onPress={() => setSelAddr(a.id)}>
              <View style={[styles.radioOuter, selAddr === a.id && styles.radioOuterActive]}>
                {selAddr === a.id && <View style={styles.radioInner} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addrType}>{a.addressType}</Text>
                <Text style={styles.addrText}>{a.houseNumber}, {a.street}, {a.city}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {addresses.length === 0 && (
            <Text style={{ color: '#9ca3af', fontSize: 13 }}>No addresses saved. Add one from the Profile screen.</Text>
          )}
        </View>

        {/* Payment */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}><Ionicons name="card" size={16} color={BRAND} /> Payment Method</Text>
          {[
            { id: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', icon: 'cash' },
            { id: 'RAZORPAY',         label: 'Pay Online (Razorpay)', icon: 'card' },
          ].map(m => (
            <TouchableOpacity key={m.id} style={[styles.methodRow, payMethod === m.id && styles.methodRowActive]}
              onPress={() => setPayMethod(m.id)}>
              <View style={[styles.radioOuter, payMethod === m.id && styles.radioOuterActive]}>
                {payMethod === m.id && <View style={styles.radioInner} />}
              </View>
              <Ionicons name={m.icon} size={20} color={BRAND} style={{ marginHorizontal: 8 }} />
              <Text style={styles.methodLabel}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Coupon */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}><Ionicons name="pricetag" size={16} color={BRAND} /> Apply Coupon</Text>
          {couponData ? (
            <View style={styles.couponApplied}>
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              <Text style={styles.couponAppliedText}>{couponData.code} — Save ₹{couponData.discountValue}</Text>
              <TouchableOpacity onPress={() => { setCouponData(null); setCoupon('') }}>
                <Ionicons name="close" size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.couponRow}>
              <View style={[styles.couponInput, { flex: 1 }]}>
                <Text style={{ color: coupon ? '#111827' : '#9ca3af', fontSize: 14 }} onPress={() => {}}>
                  {coupon || 'WELCOME50'}
                </Text>
              </View>
              <TouchableOpacity style={styles.applyBtn} onPress={applyCoupon}>
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.couponChips}>
            {['WELCOME50', 'FLAT100', 'WEEKEND20'].map(c => (
              <TouchableOpacity key={c} style={styles.chip} onPress={() => setCoupon(c)}>
                <Text style={styles.chipText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Price Summary</Text>
          {[
            { l: 'Subtotal', v: `₹${(cart?.subtotal || 0).toFixed(2)}` },
            { l: 'Delivery Fee', v: '₹49.00' },
            { l: 'Tax (5%)', v: `₹${(cart?.tax || 0).toFixed(2)}` },
            ...(discount > 0 ? [{ l: 'Discount', v: `-₹${discount.toFixed(2)}`, green: true }] : []),
          ].map(r => (
            <View key={r.l} style={styles.priceRow}>
              <Text style={styles.priceLabel}>{r.l}</Text>
              <Text style={[styles.priceValue, r.green && { color: '#22c55e' }]}>{r.v}</Text>
            </View>
          ))}
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotal}>₹{total.toFixed(2)}</Text>
          <Text style={styles.bottomItems}>{cart?.itemCount || 0} items</Text>
        </View>
        <TouchableOpacity style={[styles.orderBtn, placing && { opacity: 0.6 }]}
          onPress={placeOrder} disabled={placing}>
          <Text style={styles.orderBtnText}>{placing ? 'Placing...' : 'Place Order'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  center:           { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  topTitle:         { fontSize: 18, fontWeight: '800', color: '#111827' },
  card:             { backgroundColor: '#fff', borderRadius: 20, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  cardTitle:        { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  addrRow:          { flexDirection: 'row', alignItems: 'flex-start', padding: 12, borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', marginBottom: 8, gap: 10 },
  addrRowActive:    { borderColor: BRAND, backgroundColor: '#fff7ed' },
  radioOuter:       { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#d1d5db', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  radioOuterActive: { borderColor: BRAND },
  radioInner:       { width: 10, height: 10, borderRadius: 5, backgroundColor: BRAND },
  addrType:         { fontSize: 13, fontWeight: '700', color: '#111827' },
  addrText:         { fontSize: 12, color: '#6b7280', marginTop: 2 },
  methodRow:        { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', marginBottom: 8 },
  methodRowActive:  { borderColor: BRAND, backgroundColor: '#fff7ed' },
  methodLabel:      { fontSize: 14, fontWeight: '600', color: '#111827' },
  couponApplied:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f0fdf4', borderRadius: 12, padding: 12 },
  couponAppliedText:{ flex: 1, fontSize: 14, color: '#166534', fontWeight: '600' },
  couponRow:        { flexDirection: 'row', gap: 10 },
  couponInput:      { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, backgroundColor: '#f9fafb' },
  applyBtn:         { backgroundColor: BRAND, borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center' },
  applyBtnText:     { color: '#fff', fontWeight: '700' },
  couponChips:      { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  chip:             { backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  chipText:         { fontSize: 12, color: '#374151', fontWeight: '600' },
  priceRow:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel:       { fontSize: 14, color: '#6b7280' },
  priceValue:       { fontSize: 14, color: '#111827' },
  totalLine:        { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  totalLabel:       { fontSize: 16, fontWeight: '800', color: '#111827' },
  totalValue:       { fontSize: 18, fontWeight: '800', color: '#111827' },
  bottomBar:        { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f3f4f6', elevation: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  bottomTotal:      { fontSize: 20, fontWeight: '800', color: '#111827' },
  bottomItems:      { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  orderBtn:         { backgroundColor: BRAND, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14 },
  orderBtnText:     { color: '#fff', fontWeight: '700', fontSize: 16 },
})
