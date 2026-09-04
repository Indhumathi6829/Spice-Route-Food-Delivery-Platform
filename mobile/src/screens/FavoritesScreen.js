import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { favoriteApi } from '../api'

const BRAND = '#f97316'

export default function FavoritesScreen() {
  const navigation = useNavigation()
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    favoriteApi.getAll().then(r => setItems(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const remove = async (id) => {
    await favoriteApi.remove(id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={BRAND} /></View>

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <Text style={styles.header}>❤️ Favorites</Text>
      {items.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="heart-outline" size={64} color="#e5e7eb" />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySub}>Tap the heart on any food item to save it here</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Menu')}>
            <Text style={styles.browseBtnText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items} keyExtractor={i => i.id.toString()}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
          numColumns={2} columnWrapperStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('FoodDetail', { id: item.id })}>
              <Image source={{ uri: item.imageUrl }} style={styles.img} resizeMode="cover" />
              <TouchableOpacity style={styles.removeFav} onPress={() => remove(item.id)}>
                <Ionicons name="heart" size={16} color="#ef4444" />
              </TouchableOpacity>
              <View style={styles.cardBody}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.price}>₹{item.effectivePrice || item.price}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyTitle:   { fontSize: 18, fontWeight: '700', color: '#374151' },
  emptySub:     { fontSize: 13, color: '#9ca3af', textAlign: 'center', paddingHorizontal: 32 },
  browseBtn:    { backgroundColor: BRAND, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  browseBtnText:{ color: '#fff', fontWeight: '700' },
  header:       { fontSize: 22, fontWeight: '800', color: '#111827', padding: 16, paddingTop: 56 },
  card:         { flex: 1, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  img:          { width: '100%', height: 120 },
  removeFav:    { position: 'absolute', top: 8, right: 8, width: 30, height: 30, backgroundColor: '#fff', borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  cardBody:     { padding: 10 },
  name:         { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 4 },
  price:        { fontSize: 14, fontWeight: '800', color: BRAND },
})
