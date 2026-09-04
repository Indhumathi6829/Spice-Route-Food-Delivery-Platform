import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import { deliveryApi } from '../api'

const BRAND = '#f97316'

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const [profile,  setProfile]  = useState(null)
  const [editing,  setEditing]  = useState(false)
  const [vehicle,  setVehicle]  = useState('')
  const [plate,    setPlate]    = useState('')
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    deliveryApi.getProfile().then(r => {
      setProfile(r.data)
      setVehicle(r.data.vehicleType || '')
      setPlate(r.data.vehicleNumber || '')
    }).catch(() => {})
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await deliveryApi.updateProfile({ vehicleType: vehicle, vehicleNumber: plate })
      setProfile(data)
      setEditing(false)
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ])
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: BRAND }]}>
          <Ionicons name="bicycle" size={12} color="#fff" />
          <Text style={styles.roleText}>Delivery Partner</Text>
        </View>
      </View>

      {/* Stats */}
      {profile && (
        <View style={styles.statsRow}>
          {[
            { label: 'Deliveries', value: profile.totalDeliveries || 0 },
            { label: 'Rating',     value: `${(profile.rating || 5.0).toFixed(1)}★` },
            { label: 'Today',      value: profile.todayDeliveries || 0 },
          ].map(s => (
            <View key={s.label} style={styles.statBox}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Vehicle info */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Ionicons name={editing ? 'close' : 'pencil'} size={18} color={BRAND} />
          </TouchableOpacity>
        </View>

        {editing ? (
          <View style={styles.editForm}>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Vehicle Type</Text>
              <TextInput style={styles.input} value={vehicle} onChangeText={setVehicle}
                placeholder="e.g. BIKE, SCOOTER, BICYCLE" placeholderTextColor="#6b7280" />
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Vehicle / Plate Number</Text>
              <TextInput style={styles.input} value={plate} onChangeText={setPlate}
                placeholder="e.g. TN 09 AB 1234" placeholderTextColor="#6b7280"
                autoCapitalize="characters" />
            </View>
            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={save} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.infoList}>
            {[
              { icon: 'bicycle',      label: 'Vehicle Type',   value: profile?.vehicleType   || 'Not set' },
              { icon: 'car-sport',    label: 'Plate Number',   value: profile?.vehicleNumber  || 'Not set' },
              { icon: 'call',         label: 'Phone',          value: user?.phone             || 'Not set' },
            ].map(i => (
              <View key={i.label} style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name={i.icon} size={16} color={BRAND} />
                </View>
                <View>
                  <Text style={styles.infoLabel}>{i.label}</Text>
                  <Text style={styles.infoValue}>{i.value}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>SpiceRoute Delivery v1.0.0</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#111827' },
  header:       { alignItems: 'center', paddingTop: 56, paddingBottom: 24, backgroundColor: '#1f2937', borderBottomWidth: 1, borderBottomColor: '#374151' },
  avatar:       { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f97316', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText:   { fontSize: 32, fontWeight: '800', color: '#fff' },
  name:         { fontSize: 20, fontWeight: '800', color: '#fff' },
  email:        { fontSize: 13, color: '#9ca3af', marginTop: 4 },
  roleBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginTop: 10 },
  roleText:     { fontSize: 12, fontWeight: '700', color: '#fff' },
  statsRow:     { flexDirection: 'row', padding: 16, gap: 12 },
  statBox:      { flex: 1, backgroundColor: '#1f2937', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#374151' },
  statValue:    { fontSize: 20, fontWeight: '800', color: '#fff' },
  statLabel:    { fontSize: 11, color: '#9ca3af', marginTop: 3 },
  section:      { backgroundColor: '#1f2937', borderRadius: 20, margin: 16, padding: 16, borderWidth: 1, borderColor: '#374151' },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  infoList:     { gap: 14 },
  infoRow:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIcon:     { width: 36, height: 36, backgroundColor: '#f97316' + '20', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  infoLabel:    { fontSize: 11, color: '#9ca3af' },
  infoValue:    { fontSize: 14, color: '#fff', fontWeight: '600', marginTop: 1 },
  editForm:     { gap: 14 },
  inputBox:     {},
  inputLabel:   { fontSize: 12, color: '#9ca3af', marginBottom: 6 },
  input:        { backgroundColor: '#111827', borderWidth: 1, borderColor: '#374151', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#fff' },
  saveBtn:      { backgroundColor: BRAND, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  saveBtnText:  { color: '#fff', fontWeight: '700' },
  logoutBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#1f2937', marginHorizontal: 16, borderRadius: 16, paddingVertical: 14, borderWidth: 1, borderColor: '#374151' },
  logoutText:   { fontSize: 16, fontWeight: '700', color: '#ef4444' },
  version:      { textAlign: 'center', color: '#4b5563', fontSize: 11, marginTop: 16 },
})
