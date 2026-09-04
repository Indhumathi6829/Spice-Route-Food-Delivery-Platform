import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'

const BRAND = '#f97316'

export default function OrderSuccessScreen() {
  const navigation = useNavigation()
  const { orderId } = useRoute().params

  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
      </View>
      <Text style={styles.title}>Order Placed! 🎉</Text>
      <Text style={styles.sub}>Your order #{orderId} has been placed successfully</Text>
      <View style={styles.info}>
        <Ionicons name="time-outline" size={18} color={BRAND} />
        <Text style={styles.infoText}>Estimated delivery: 30–45 minutes</Text>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.trackBtn} onPress={() => navigation.replace('OrderTracking', { orderId })}>
          <Text style={styles.trackBtnText}>Track Order</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.homeBtnText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.emoji}>🌶️🍛</Text>
      <Text style={styles.chefMsg}>Our chefs are cooking your meal with love!</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconBox:   { width: 120, height: 120, backgroundColor: '#f0fdf4', borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title:     { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8 },
  sub:       { fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  info:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff7ed', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 32 },
  infoText:  { fontSize: 14, color: '#92400e', fontWeight: '600' },
  buttons:   { width: '100%', gap: 12 },
  trackBtn:  { backgroundColor: BRAND, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  trackBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  homeBtn:   { borderWidth: 2, borderColor: BRAND, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  homeBtnText: { color: BRAND, fontWeight: '700', fontSize: 16 },
  emoji:     { fontSize: 36, marginTop: 32 },
  chefMsg:   { fontSize: 13, color: '#9ca3af', marginTop: 8 },
})
