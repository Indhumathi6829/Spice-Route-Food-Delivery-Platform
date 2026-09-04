import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useAuth } from '../context/AuthContext'

const BRAND = '#f97316'

export default function LoginScreen({ navigation }) {
  const { login } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please fill all fields'); return }
    setLoading(true)
    try {
      await login(email.trim(), password)
    } catch (e) {
      Alert.alert('Login Failed', e.response?.data?.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.emoji}>🌶️</Text>
          <Text style={styles.title}>SpiceRoute Kitchen</Text>
          <Text style={styles.sub}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} placeholder="you@example.com"
              value={email} onChangeText={setEmail}
              keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#9ca3af" />
          </View>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} placeholder="••••••••"
              value={password} onChangeText={setPassword}
              secureTextEntry placeholderTextColor="#9ca3af" />
          </View>

          <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkRow}>
            <Text style={styles.linkText}>Don't have an account? <Text style={{ color: BRAND, fontWeight: '700' }}>Sign up</Text></Text>
          </TouchableOpacity>

          {/* Demo credentials */}
          <View style={styles.demo}>
            <Text style={styles.demoTitle}>🧪 Demo Account</Text>
            <Text style={styles.demoText}>Email: priya@example.com</Text>
            <Text style={styles.demoText}>Password: Test@123</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container:   { flexGrow: 1, backgroundColor: '#fff7ed', padding: 24 },
  header:      { alignItems: 'center', paddingTop: 60, paddingBottom: 32 },
  emoji:       { fontSize: 60, marginBottom: 12 },
  title:       { fontSize: 28, fontWeight: '800', color: '#111827' },
  sub:         { fontSize: 15, color: '#6b7280', marginTop: 4 },
  form:        { backgroundColor: '#fff', borderRadius: 24, padding: 24, elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16 },
  inputBox:    { marginBottom: 16 },
  label:       { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input:       { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#111827', backgroundColor: '#f9fafb' },
  btn:         { backgroundColor: BRAND, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText:     { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkRow:     { alignItems: 'center', marginTop: 16 },
  linkText:    { fontSize: 14, color: '#6b7280' },
  demo:        { backgroundColor: '#fff7ed', borderRadius: 12, padding: 12, marginTop: 16, borderWidth: 1, borderColor: '#fed7aa' },
  demoTitle:   { fontSize: 12, fontWeight: '700', color: '#92400e', marginBottom: 4 },
  demoText:    { fontSize: 12, color: '#78350f' },
})
