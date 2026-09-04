import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useAuth } from '../context/AuthContext'

const BRAND = '#f97316'

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const navigation = useNavigation()

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ])
  }

  const menuItems = [
    { icon: 'bag-outline',        label: 'My Orders',         onPress: () => navigation.navigate('Orders') },
    { icon: 'heart-outline',      label: 'Favorites',         onPress: () => navigation.navigate('Favorites') },
    { icon: 'notifications-outline', label: 'Notifications',  onPress: () => navigation.navigate('Notifications') },
    { icon: 'help-circle-outline', label: 'Help & Support',   onPress: () => Alert.alert('Support', 'Email: support@spiceroute.com') },
  ]

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.phone && <Text style={styles.phone}>{user?.phone}</Text>}
      </View>

      {/* Menu */}
      <View style={styles.card}>
        {menuItems.map((item, i) => (
          <TouchableOpacity key={i} style={[styles.menuRow, i < menuItems.length - 1 && styles.menuRowBorder]}
            onPress={item.onPress}>
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={20} color={BRAND} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>SpiceRoute Kitchen v1.0.0</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  header:       { backgroundColor: BRAND, paddingTop: 60, paddingBottom: 28, alignItems: 'center', gap: 6 },
  avatar:       { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  avatarText:   { fontSize: 32, fontWeight: '800', color: '#fff' },
  name:         { fontSize: 20, fontWeight: '800', color: '#fff' },
  email:        { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  phone:        { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  card:         { backgroundColor: '#fff', borderRadius: 20, margin: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, overflow: 'hidden' },
  menuRow:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, gap: 12 },
  menuRowBorder:{ borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  menuIcon:     { width: 38, height: 38, backgroundColor: '#fff7ed', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuLabel:    { flex: 1, fontSize: 15, fontWeight: '600', color: '#111827' },
  logoutBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, paddingVertical: 14, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 },
  logoutText:   { fontSize: 16, fontWeight: '700', color: '#ef4444' },
  version:      { textAlign: 'center', color: '#9ca3af', fontSize: 12, marginTop: 16 },
})
