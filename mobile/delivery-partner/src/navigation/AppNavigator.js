import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import { ActivityIndicator, View } from 'react-native'

import LoginScreen    from '../screens/LoginScreen'
import DashboardScreen from '../screens/DashboardScreen'
import DeliveryRequestScreen from '../screens/DeliveryRequestScreen'
import ActiveDeliveryScreen  from '../screens/ActiveDeliveryScreen'
import HistoryScreen  from '../screens/HistoryScreen'
import ProfileScreen  from '../screens/ProfileScreen'

const Stack = createNativeStackNavigator()
const Tab   = createBottomTabNavigator()
const BRAND = '#f97316'

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: BRAND,
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { borderTopWidth: 0.5, borderTopColor: '#e5e7eb', height: 60, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const icons = { Dashboard: 'speedometer', 'Active Delivery': 'bicycle', History: 'time', Profile: 'person' }
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />
        },
      })}>
      <Tab.Screen name="Dashboard"       component={DashboardScreen} />
      <Tab.Screen name="Active Delivery" component={ActiveDeliveryScreen} />
      <Tab.Screen name="History"         component={HistoryScreen} />
      <Tab.Screen name="Profile"         component={ProfileScreen} />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  const { user, loading } = useAuth()

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1f2937' }}>
      <ActivityIndicator size="large" color={BRAND} />
    </View>
  )

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main"            component={MainTabs} />
            <Stack.Screen name="DeliveryRequest" component={DeliveryRequestScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
