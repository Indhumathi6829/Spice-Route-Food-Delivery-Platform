import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { cartApi } from '../api'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart]       = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!user || user.role !== 'CUSTOMER') return
    try {
      setLoading(true)
      const { data } = await cartApi.get()
      setCart(data)
    } catch {}
    finally { setLoading(false) }
  }, [user])

  useEffect(() => { fetchCart() }, [fetchCart])

  const addItem = async (foodItemId, quantity = 1, customizations = null) => {
    try {
      const { data } = await cartApi.addItem({ foodItemId, quantity, customizations })
      setCart(data)
      toast.success('Added to cart!')
      return data
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not add item')
      throw e
    }
  }

  const updateItem = async (cartItemId, quantity) => {
    try {
      const { data } = await cartApi.updateItem(cartItemId, quantity)
      setCart(data)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not update item')
    }
  }

  const removeItem = async (cartItemId) => {
    try {
      const { data } = await cartApi.removeItem(cartItemId)
      setCart(data)
      toast.success('Removed from cart')
    } catch (e) {
      toast.error('Could not remove item')
    }
  }

  const clearCart = async () => {
    try {
      await cartApi.clear()
      setCart(null)
    } catch {}
  }

  const itemCount = cart?.itemCount || 0

  return (
    <CartContext.Provider value={{ cart, loading, itemCount, addItem, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
