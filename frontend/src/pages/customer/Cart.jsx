import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

export default function Cart() {
  const { cart, loading, updateItem, removeItem } = useCart()

  if (loading) return (
    <div className="page-container">
      <div className="skeleton h-8 w-40 mb-6" />
      {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl mb-3" />)}
    </div>
  )

  if (!cart || cart.items?.length === 0) return (
    <div className="page-container text-center py-20">
      <ShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-700">Your cart is empty</h2>
      <p className="text-gray-500 mt-1">Explore our menu and add some delicious items</p>
      <Link to="/menu" className="btn-primary mt-6 inline-flex">Browse Menu</Link>
    </div>
  )

  return (
    <div className="page-container">
      <h1 className="section-title mb-6">Your Cart</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.items.map(item => (
            <div key={item.id} className="card flex items-center gap-4 p-4">
              <img src={item.imageUrl} alt={item.foodItemName}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                onError={e => { e.target.src = `https://via.placeholder.com/80x80/f97316/white?text=${item.foodItemName?.[0]}` }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <div className={item.vegetarian ? 'veg-dot' : 'nonveg-dot'} />
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{item.foodItemName}</h3>
                </div>
                <p className="text-brand-600 font-bold">₹{item.unitPrice}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1">
                    <button onClick={() => updateItem(item.id, item.quantity - 1)}
                      className="text-brand-600 hover:text-brand-700">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold text-gray-900 w-5 text-center">{item.quantity}</span>
                    <button onClick={() => updateItem(item.id, item.quantity + 1)}
                      className="text-brand-600 hover:text-brand-700">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">= ₹{item.lineTotal}</span>
                </div>
              </div>
              <button onClick={() => removeItem(item.id)}
                className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="card sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.itemCount} items)</span>
                <span>₹{cart.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>₹{cart.deliveryFee?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (5%)</span>
                <span>₹{cart.tax?.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>₹{cart.total?.toFixed(2)}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary w-full mt-5 py-3.5">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/menu" className="btn-ghost w-full mt-2 justify-center text-sm">
              Add more items
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
