import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useAuth } from '../context/AuthContext'

const BRAND = '#f97316'

const ROLES = [
  { value: 'CUSTOMER',          label: 'Customer',          emoji: '👤', desc: 'Order food',         color: BRAND },
  { value: 'DELIVERY_PARTNER',  label: 'Delivery Partner',  emoji: '🛵', desc: 'Deliver & earn',     color: '#22c55e' },
  { value: 'ADMIN',             label: 'Admin',              emoji: '🛡️', desc: 'Manage restaurant',  color: '#8b5cf6' },
]

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth()
  const [form,       setForm]       = useState({ name: '', email: '', phone: '', password: '' })
  const [role,       setRole]       = useState('CUSTOMER')
  const [adminCode,  setAdminCode]  = useState('')
  const [loading,    setLoading]    = useState(false)

  const handleRegister = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in name, email and password.'); return
    }
    if (form.password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.'); return
    }
    if (role === 'ADMIN' && !adminCode.trim()) {
      Alert.alert('Authorization Required', 'Please enter the admin authorization code.'); return
    }

    setLoading(true)
    try {
      // Map UI 'ADMIN' → backend 'RESTAURANT_ADMIN'
      const backendRole = role === 'ADMIN' ? 'RESTAURANT_ADMIN' : role
      await register({
        ...form,
        role:      backendRole,
        adminCode: role === 'ADMIN' ? adminCode : undefined,
      })
    } catch (e) {
      Alert.alert('Registration Failed', e.response?.data?.message || 'Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (v) => setForm(prev => ({ ...prev, [key]: v }))

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🌶️</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.sub}>Join SpiceRoute Kitchen</Text>
        </View>

        <View style={styles.card}>

          {/* Role selector */}
          <Text style={styles.label}>I want to join as</Text>
          <View style={styles.roleRow}>
            {ROLES.map(r => (
              <TouchableOpacity key={r.value} onPress={() => setRole(r.value)}
                style={[styles.roleBtn, role === r.value && { borderColor: r.color, backgroundColor: r.color + '15' }]}>
                <Text style={styles.roleEmoji}>{r.emoji}</Text>
                <Text style={[styles.roleLabel, role === r.value && { color: r.color }]}>{r.label}</Text>
                <Text style={styles.roleDesc}>{r.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Fields */}
          {[
            { key: 'name',     label: 'Full Name *',       placeholder: 'Priya Sharma',    keyType: 'default',       secure: false, cap: 'words' },
            { key: 'email',    label: 'Email *',            placeholder: 'you@example.com', keyType: 'email-address', secure: false, cap: 'none'  },
            { key: 'phone',    label: 'Phone (optional)',   placeholder: '9876543210',      keyType: 'phone-pad',     secure: false, cap: 'none'  },
            { key: 'password', label: 'Password *',         placeholder: 'Min 6 characters', keyType: 'default',     secure: true,  cap: 'none'  },
          ].map(f => (
            <View key={f.key} style={styles.inputBox}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput style={styles.input}
                placeholder={f.placeholder} placeholderTextColor="#9ca3af"
                keyboardType={f.keyType} secureTextEntry={f.secure}
                autoCapitalize={f.cap}
                value={form[f.key]} onChangeText={set(f.key)}
              />
            </View>
          ))}

          {/* Admin code — only visible when Admin role selected */}
          {role === 'ADMIN' && (
            <View style={[styles.inputBox, styles.adminBox]}>
              <Text style={[styles.label, { color: '#7c3aed' }]}>🛡️ Admin Authorization Code *</Text>
              <TextInput style={[styles.input, { borderColor: '#8b5cf6' }]}
                placeholder="Enter authorization code"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                autoCapitalize="none"
                value={adminCode} onChangeText={setAdminCode}
              />
              <Text style={styles.adminHint}>Contact your system administrator to obtain this code.</Text>
            </View>
          )}

          <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister} disabled={loading}>
            <Text style={styles.btnText}>
              {loading ? 'Creating account…' : `Create ${ROLES.find(r => r.value === role)?.label} Account`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkRow}>
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={{ color: BRAND, fontWeight: '700' }}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container:  { flexGrow: 1, backgroundColor: '#fff7ed', padding: 24 },
  header:     { alignItems: 'center', paddingTop: 48, paddingBottom: 24 },
  emoji:      { fontSize: 52, marginBottom: 10 },
  title:      { fontSize: 26, fontWeight: '800', color: '#111827' },
  sub:        { fontSize: 14, color: '#6b7280', marginTop: 4 },
  card:       { backgroundColor: '#fff', borderRadius: 24, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16 },
  roleRow:    { flexDirection: 'row', gap: 8, marginBottom: 16 },
  roleBtn:    { flex: 1, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 14, padding: 10, alignItems: 'center', gap: 2 },
  roleEmoji:  { fontSize: 20, marginBottom: 2 },
  roleLabel:  { fontSize: 11, fontWeight: '700', color: '#374151', textAlign: 'center' },
  roleDesc:   { fontSize: 9, color: '#9ca3af', textAlign: 'center' },
  inputBox:   { marginBottom: 14 },
  label:      { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 5 },
  input:      { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#111827', backgroundColor: '#f9fafb' },
  adminBox:   { backgroundColor: '#faf5ff', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#ddd6fe' },
  adminHint:  { fontSize: 11, color: '#8b5cf6', marginTop: 5 },
  btn:        { backgroundColor: BRAND, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnDisabled:{ opacity: 0.6 },
  btnText:    { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkRow:    { alignItems: 'center', marginTop: 16 },
  linkText:   { fontSize: 14, color: '#6b7280' },
})
