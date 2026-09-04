import { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { foodApi, cartApi, favoriteApi } from '../api'

const BRAND = '#f97316'

export default function FoodDetailScreen() {
  const navigation = useNavigation()
  const { id }     = useRoute().params
  const [item,    setItem]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty,     setQty]     = useState(1)
  const [fav,     setFav]     = useState(false)
  const [adding,  setAdding]  = useState(false)

  useEffect(() => {
    foodApi.getById(id)
      .then(r => { setItem(r.data); setFav(r.data.isFavorite) })
      .catch(() => { Alert.alert('Error', 'Item not found'); navigation.goBack() })
      .finally(() => setLoading(false))
  }, [id])

  const handleAdd = async () => {
    setAdding(true)
    try {
      await cartApi.addItem({ foodItemId: item.id, quantity: qty })
      Alert.alert('Added!', `${item.name} added to cart`, [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
      ])
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Could not add item')
    } finally { setAdding(false) }
  }

  const toggleFav = async () => {
    try {
      if (fav) await favoriteApi.remove(item.id)
      else     await favoriteApi.add(item.id)
      setFav(!fav)
    } catch {}
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={BRAND} /></View>
  if (!item)   return null

  const discount = item.discountPrice && item.discountPrice < item.price
    ? Math.round((1 - item.discountPrice / item.price) * 100) : 0

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: item.imageUrl }} style={styles.hero} resizeMode="cover" />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#1f2937" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.favBtn} onPress={toggleFav}>
            <Ionicons name={fav ? 'heart' : 'heart-outline'} size={22} color={fav ? '#ef4444' : '#6b7280'} />
          </TouchableOpacity>
          {item.bestseller && (
            <View style={styles.bestsellerBadge}>
              <Text style={styles.bestsellerText}>🔥 Bestseller</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          {/* Header */}
          <View style={styles.rowBetween}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <View style={styles.rowLeft}>
                <View style={[styles.vegDot, { backgroundColor: item.vegetarian ? '#22c55e' : '#ef4444' }]} />
                <Text style={styles.catTag}>{item.categoryName}</Text>
              </View>
              <Text style={styles.name}>{item.name}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.price}>₹{item.effectivePrice || item.price}</Text>
              {discount > 0 && (
                <>
                  <Text style={styles.origPrice}>₹{item.price}</Text>
                  <Text style={styles.discountBadge}>{discount}% OFF</Text>
                </>
              )}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            {[
              { icon: 'star', color: '#f59e0b', val: `${Number(item.rating).toFixed(1)} (${item.totalRatings})`, label: 'Rating' },
              { icon: 'time',  color: BRAND,     val: `${item.preparationTime} min`, label: 'Prep Time' },
              { icon: 'flame', color: '#f97316', val: `${item.calories} kcal`,       label: 'Calories' },
            ].map(s => (
              <View key={s.label} style={styles.statCard}>
                <Ionicons name={s.icon} size={20} color={s.color} />
                <Text style={styles.statVal}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.desc}>{item.description}</Text>

          {/* Ingredients */}
          {item.ingredients && (
            <>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <View style={styles.tags}>
                {item.ingredients.split(',').map(i => (
                  <View key={i} style={styles.tag}><Text style={styles.tagText}>{i.trim()}</Text></View>
                ))}
              </View>
            </>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Add to cart bar */}
      {item.available ? (
        <View style={styles.bottomBar}>
          <View style={styles.qtyBox}>
            <TouchableOpacity onPress={() => setQty(q => Math.max(1, q-1))} style={styles.qtyBtn}>
              <Ionicons name="remove" size={18} color={BRAND} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{qty}</Text>
            <TouchableOpacity onPress={() => setQty(q => Math.min(20, q+1))} style={styles.qtyBtn}>
              <Ionicons name="add" size={18} color={BRAND} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.addBtn, adding && { opacity: 0.6 }]}
            onPress={handleAdd} disabled={adding}>
            <Ionicons name="cart" size={18} color="#fff" />
            <Text style={styles.addBtnText}>
              {adding ? 'Adding...' : `Add to Cart · ₹${((item.effectivePrice || item.price) * qty).toFixed(0)}`}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.bottomBar, { justifyContent: 'center' }]}>
          <Text style={{ color: '#ef4444', fontWeight: '700' }}>⚠️ Currently Unavailable</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero:           { width: '100%', height: 280 },
  backBtn:        { position: 'absolute', top: 48, left: 16, width: 40, height: 40, backgroundColor: '#fff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8 },
  favBtn:         { position: 'absolute', top: 48, right: 16, width: 40, height: 40, backgroundColor: '#fff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8 },
  bestsellerBadge:{ position: 'absolute', bottom: 12, left: 12, backgroundColor: '#f59e0b', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  bestsellerText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  body:           { padding: 20 },
  rowBetween:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  rowLeft:        { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  vegDot:         { width: 10, height: 10, borderRadius: 5 },
  catTag:         { fontSize: 12, color: BRAND, fontWeight: '600', backgroundColor: '#fff7ed', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  name:           { fontSize: 22, fontWeight: '800', color: '#111827', lineHeight: 28 },
  price:          { fontSize: 22, fontWeight: '800', color: '#111827' },
  origPrice:      { fontSize: 13, color: '#9ca3af', textDecorationLine: 'line-through', textAlign: 'right' },
  discountBadge:  { fontSize: 11, color: '#22c55e', fontWeight: '700', textAlign: 'right' },
  stats:          { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard:       { flex: 1, backgroundColor: '#f9fafb', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 },
  statVal:        { fontSize: 13, fontWeight: '700', color: '#111827', textAlign: 'center' },
  statLabel:      { fontSize: 10, color: '#9ca3af' },
  sectionTitle:   { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  desc:           { fontSize: 14, color: '#6b7280', lineHeight: 22, marginBottom: 16 },
  tags:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag:            { backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagText:        { fontSize: 12, color: '#374151' },
  bottomBar:      { flexDirection: 'row', padding: 16, gap: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6', elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  qtyBox:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 4 },
  qtyBtn:         { width: 36, height: 44, justifyContent: 'center', alignItems: 'center' },
  qtyText:        { fontSize: 16, fontWeight: '800', color: '#111827', width: 28, textAlign: 'center' },
  addBtn:         { flex: 1, backgroundColor: BRAND, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48 },
  addBtnText:     { color: '#fff', fontWeight: '700', fontSize: 15 },
})
