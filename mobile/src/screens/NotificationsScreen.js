import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { notificationApi } from '../api'

const BRAND = '#f97316'
const TYPE_ICON = { ORDER_UPDATE: 'bicycle', PAYMENT_UPDATE: 'card', PROMO: 'gift', SYSTEM: 'megaphone' }
const TYPE_COLOR = { ORDER_UPDATE: '#f97316', PAYMENT_UPDATE: '#22c55e', PROMO: '#f59e0b', SYSTEM: '#6b7280' }

export default function NotificationsScreen() {
  const navigation = useNavigation()
  const [notifs,  setNotifs]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificationApi.getAll().then(r => setNotifs(r.data?.content || [])).finally(() => setLoading(false))
  }, [])

  const markAllRead = async () => {
    await notificationApi.markAllRead()
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={BRAND} /></View>

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={{ color: BRAND, fontWeight: '600', fontSize: 13 }}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {notifs.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="notifications-outline" size={64} color="#e5e7eb" />
          <Text style={{ color: '#9ca3af', fontSize: 15, marginTop: 12, fontWeight: '600' }}>You're all caught up!</Text>
        </View>
      ) : (
        <FlatList
          data={notifs} keyExtractor={n => n.id.toString()}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 100 }}
          renderItem={({ item: n }) => (
            <View style={[styles.card, !n.read && styles.cardUnread]}>
              <View style={[styles.iconBox, { backgroundColor: TYPE_COLOR[n.type] + '20' }]}>
                <Ionicons name={TYPE_ICON[n.type] || 'notifications'} size={20} color={TYPE_COLOR[n.type]} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.notifTop}>
                  <Text style={styles.notifTitle} numberOfLines={1}>{n.title}</Text>
                  {!n.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notifMsg} numberOfLines={2}>{n.message}</Text>
                <Text style={styles.notifTime}>
                  {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  topTitle:    { fontSize: 17, fontWeight: '800', color: '#111827' },
  card:        { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 14, gap: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, alignItems: 'flex-start' },
  cardUnread:  { borderLeftWidth: 3, borderLeftColor: BRAND },
  iconBox:     { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  notifTop:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  notifTitle:  { fontSize: 14, fontWeight: '700', color: '#111827', flex: 1 },
  unreadDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND },
  notifMsg:    { fontSize: 13, color: '#6b7280', lineHeight: 18, marginBottom: 5 },
  notifTime:   { fontSize: 11, color: '#9ca3af' },
})
