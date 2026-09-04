import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import { ActivityIndicator, View } from 'react-native'

// Auth screens
import LoginScreen    from '../screens/LoginScreen'
import RegisterScreen from '../screens/RegisterScreen'

// Customer screens
import HomeScreen          from '../screens/HomeScreen'
import MenuScreen          from '../screens/MenuScreen'
import FoodDetailScreen    from '../screens/FoodDetailScreen'
import CartScreen          from '../screens/CartScreen'
import CheckoutScreen      from '../screens/CheckoutScreen'
import OrderSuccessScreen  from '../screens/OrderSuccessScreen'
import OrdersScreen        from '../screens/OrdersScreen'
import OrderTrackingScreen from '../screens/OrderTrackingScreen'
import FavoritesScreen     from '../screens/FavoritesScreen'
import ProfileScreen       from '../screens/ProfileScreen'
import NotificationsScreen from '../screens/NotificationsScreen'

const Stack = createNativeStackNavigator()
const Tab   = createBottomTabNavigator()

const BRAND = '#f97316'

function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: BRAND,
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { borderTopWidth: 0.5, borderTopColor: '#e5e7eb', elevation: 10, shadowOpacity: 0.1, height: 60, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const icons = { Home: 'home', Menu: 'search', Orders: 'bag', Favorites: 'heart', Profile: 'person' }
          return <Ionicons name={icons[route.name]} size={size} color={color} />
        },
      })}>
      <Tab.Screen name="Home"      component={HomeScreen} />
      <Tab.Screen name="Menu"      component={MenuScreen} />
      <Tab.Screen name="Orders"    component={OrdersScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile"   component={ProfileScreen} />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  const { user, loading } = useAuth()

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color={BRAND} />
    </View>
  )

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login"    component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main"          component={CustomerTabs} />
            <Stack.Screen name="FoodDetail"    component={FoodDetailScreen} />
            <Stack.Screen name="Cart"          component={CartScreen} />
            <Stack.Screen name="Checkout"      component={CheckoutScreen} />
            <Stack.Screen name="OrderSuccess"  component={OrderSuccessScreen} />
            <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
