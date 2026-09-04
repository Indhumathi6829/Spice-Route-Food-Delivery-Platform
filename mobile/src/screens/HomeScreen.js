import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, StyleSheet, FlatList, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { categoryApi, foodApi } from '../api'
import { useNavigation } from '@react-navigation/native'

const BRAND = '#f97316'

export default function HomeScreen() {
  const navigation = useNavigation()
  const [categories,  setCategories]  = useState([])
  const [bestsellers, setBestsellers] = useState([])
  const [search,      setSearch]      = useState('')
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([categoryApi.getAll(), foodApi.getBestsellers()])
      .then(([cats, best]) => { setCategories(cats.data); setBestsellers(best.data) })
      .finally(() => setLoading(false))
  }, [])

  const FoodCard = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('FoodDetail', { id: item.id })}>
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover"
        defaultSource={{ uri: `https://via.placeholder.com/200x150/f97316/white?text=${item.name}` }} />
      <View style={styles.cardBody}>
        <View style={[styles.vegDot, { backgroundColor: item.vegetarian ? '#22c55e' : '#ef4444' }]} />
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.cardRow}>
          <Ionicons name="star" size={12} color="#f59e0b" />
          <Text style={styles.cardMeta}>{Number(item.rating).toFixed(1)}</Text>
          <Text style={styles.cardMeta}>· {item.preparationTime}min</Text>
        </View>
        <View style={styles.cardPriceRow}>
          <Text style={styles.price}>₹{item.effectivePrice || item.price}</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('FoodDetail', { id: item.id })}>
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
      <ActivityIndicator size="large" color={BRAND} />
    </View>
  )

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🌶️</Text>
        <Text style={styles.heroTitle}>SpiceRoute Kitchen</Text>
        <Text style={styles.heroSub}>Authentic flavours, delivered fresh</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput style={styles.searchInput}
            placeholder="Search Biryani, Pizza, Burger..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => navigation.navigate('Menu', { q: search })}
          />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
          horizontal showsHorizontalScrollIndicator={false}
          data={categories} keyExtractor={c => c.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          renderItem={({ item: cat }) => (
            <TouchableOpacity style={styles.catItem} onPress={() => navigation.navigate('Menu', { categoryId: cat.id })}>
              <View style={styles.catIcon}><Text style={{ fontSize: 26 }}>{cat.icon}</Text></View>
              <Text style={styles.catName}>{cat.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Bestsellers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Bestsellers</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Menu', {})}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal showsHorizontalScrollIndicator={false}
          data={bestsellers.slice(0, 10)} keyExtractor={f => f.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          renderItem={({ item }) => <FoodCard item={item} />}
        />
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#f9fafb' },
  hero:          { backgroundColor: BRAND, padding: 20, paddingTop: 60, paddingBottom: 30 },
  heroEmoji:     { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  heroTitle:     { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center' },
  heroSub:       { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 4, marginBottom: 16 },
  searchBox:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, gap: 10, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 },
  searchInput:   { flex: 1, fontSize: 14, color: '#1f2937' },
  section:       { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle:  { fontSize: 18, fontWeight: '700', color: '#111827' },
  seeAll:        { fontSize: 13, color: BRAND, fontWeight: '600' },
  catItem:       { alignItems: 'center', gap: 6 },
  catIcon:       { width: 64, height: 64, backgroundColor: '#fff7ed', borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  catName:       { fontSize: 11, fontWeight: '600', color: '#374151', textAlign: 'center', maxWidth: 64 },
  card:          { width: 160, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8 },
  cardImage:     { width: '100%', height: 110 },
  cardBody:      { padding: 10 },
  vegDot:        { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
  cardName:      { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 4 },
  cardRow:       { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 8 },
  cardMeta:      { fontSize: 11, color: '#6b7280' },
  cardPriceRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price:         { fontSize: 15, fontWeight: '800', color: '#111827' },
  addBtn:        { width: 30, height: 30, backgroundColor: BRAND, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
})
