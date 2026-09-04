import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { foodApi, categoryApi } from '../api'

const BRAND = '#f97316'

export default function MenuScreen() {
  const navigation = useNavigation()
  const route      = useRoute()
  const [foods,      setFoods]      = useState([])
  const [categories, setCategories] = useState([])
  const [selCat,     setSelCat]     = useState(route.params?.categoryId || null)
  const [search,     setSearch]     = useState(route.params?.q || '')
  const [loading,    setLoading]    = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    foodApi.search({
      q: search || undefined,
      categoryId: selCat || undefined,
      sortBy: 'rating', sortDir: 'desc',
      page: 0, size: 30,
    }).then(r => setFoods(r.data.content || []))
      .finally(() => setLoading(false))
  }, [search, selCat])

  useEffect(() => {
    categoryApi.getAll().then(r => setCategories([{ id: null, name: 'All', icon: '🍽️' }, ...r.data]))
  }, [])

  useEffect(() => { load() }, [load])

  const FoodItem = ({ item }) => (
    <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('FoodDetail', { id: item.id })}>
      <Image source={{ uri: item.imageUrl }} style={styles.rowImg} resizeMode="cover" />
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <View style={[styles.dot, { backgroundColor: item.vegetarian ? '#22c55e' : '#ef4444' }]} />
          <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
        </View>
        <Text style={styles.rowDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.rowMeta}>
          <Ionicons name="star" size={11} color="#f59e0b" />
          <Text style={styles.metaTxt}>{Number(item.rating).toFixed(1)}</Text>
          <Text style={styles.metaTxt}>· {item.preparationTime} min</Text>
        </View>
        <View style={styles.rowBottom}>
          <Text style={styles.price}>₹{item.effectivePrice || item.price}</Text>
          {item.discountPrice && item.discountPrice < item.price && (
            <Text style={styles.origPrice}>₹{item.price}</Text>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('FoodDetail', { id: item.id })}>
        <Ionicons name="add" size={20} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#9ca3af" />
        <TextInput style={styles.searchInput}
          placeholder="Search food..." placeholderTextColor="#9ca3af"
          value={search} onChangeText={setSearch}
          onSubmitEditing={load} returnKeyType="search"
        />
        {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close" size={18} color="#9ca3af" /></TouchableOpacity> : null}
      </View>

      {/* Category pills */}
      <FlatList horizontal showsHorizontalScrollIndicator={false}
        data={categories} keyExtractor={c => String(c.id)}
        contentContainerStyle={styles.cats}
        renderItem={({ item: c }) => (
          <TouchableOpacity
            style={[styles.catPill, selCat == c.id && styles.catPillActive]}
            onPress={() => setSelCat(c.id == null ? null : c.id)}>
            <Text style={[styles.catPillText, selCat == c.id && styles.catPillTextActive]}>
              {c.icon} {c.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={BRAND} /></View>
      ) : foods.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🍽️</Text>
          <Text style={{ color: '#6b7280', fontWeight: '600' }}>No items found</Text>
        </View>
      ) : (
        <FlatList
          data={foods} keyExtractor={f => f.id.toString()}
          renderItem={({ item }) => <FoodItem item={item} />}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f9fafb' },
  searchBar:       { flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, gap: 10, elevation: 3, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6 },
  searchInput:     { flex: 1, fontSize: 14, color: '#1f2937' },
  cats:            { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  catPill:         { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  catPillActive:   { backgroundColor: BRAND, borderColor: BRAND },
  catPillText:     { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  catPillTextActive: { color: '#fff' },
  center:          { flex: 1, justifyContent: 'center', alignItems: 'center' },
  row:             { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, alignItems: 'center' },
  rowImg:          { width: 90, height: 90 },
  rowBody:         { flex: 1, padding: 10 },
  rowTop:          { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  dot:             { width: 9, height: 9, borderRadius: 5 },
  rowName:         { fontSize: 14, fontWeight: '700', color: '#111827', flex: 1 },
  rowDesc:         { fontSize: 11, color: '#9ca3af', lineHeight: 16, marginBottom: 5 },
  rowMeta:         { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 5 },
  metaTxt:         { fontSize: 11, color: '#6b7280' },
  rowBottom:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  price:           { fontSize: 15, fontWeight: '800', color: '#111827' },
  origPrice:       { fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through' },
  addBtn:          { width: 36, height: 36, backgroundColor: BRAND, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
})
