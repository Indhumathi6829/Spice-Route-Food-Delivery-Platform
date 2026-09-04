import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'

const BRAND = '#f97316'

export default function LoginScreen() {
  const { login } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPw,   setShowPw]   = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password) { Alert.alert('Error', 'Please fill all fields'); return }
    setLoading(true)
    try {
      await login(email.trim().toLowerCase(), password)
    } catch (e) {
      Alert.alert('Login Failed', e.message || e.response?.data?.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Ionicons name="bicycle" size={52} color={BRAND} />
          </View>
          <Text style={styles.title}>SpiceRoute Delivery</Text>
          <Text style={styles.sub}>Partner Login</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input}
              placeholder="vijay@spiceroute.com" placeholderTextColor="#9ca3af"
              value={email} onChangeText={setEmail}
              keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Password</Text>
            <View style={{ position: 'relative' }}>
              <TextInput style={[styles.input, { paddingRight: 44 }]}
                placeholder="••••••••" placeholderTextColor="#9ca3af"
                value={password} onChangeText={setPassword}
                secureTextEntry={!showPw} />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(!showPw)}>
                <Ionicons name={showPw ? 'eye-off' : 'eye'} size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>
        </View>

        {/* Demo */}
        <View style={styles.demo}>
          <Text style={styles.demoTitle}>🧪 Demo Credentials</Text>
          <Text style={styles.demoText}>vijay@spiceroute.com / Delivery@123</Text>
        </View>

        <Text style={styles.note}>This app is for SpiceRoute delivery partners only.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#111827', padding: 24, justifyContent: 'center' },
  header:    { alignItems: 'center', marginBottom: 32 },
  iconBox:   { width: 88, height: 88, backgroundColor: '#1f2937', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#374151' },
  title:     { fontSize: 26, fontWeight: '800', color: '#fff' },
  sub:       { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  card:      { backgroundColor: '#1f2937', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#374151' },
  inputBox:  { marginBottom: 16 },
  label:     { fontSize: 13, fontWeight: '600', color: '#d1d5db', marginBottom: 6 },
  input:     { backgroundColor: '#111827', borderWidth: 1, borderColor: '#374151', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: '#fff' },
  eyeBtn:    { position: 'absolute', right: 12, top: 12 },
  btn:       { backgroundColor: BRAND, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText:   { color: '#fff', fontWeight: '800', fontSize: 16 },
  demo:      { backgroundColor: '#1f2937', borderRadius: 12, padding: 12, marginTop: 16, borderWidth: 1, borderColor: '#374151' },
  demoTitle: { color: '#9ca3af', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  demoText:  { color: '#6b7280', fontSize: 12 },
  note:      { color: '#4b5563', fontSize: 11, textAlign: 'center', marginTop: 20 },
})
