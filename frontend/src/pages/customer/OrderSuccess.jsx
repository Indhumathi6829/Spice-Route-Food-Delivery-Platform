import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Clock, MapPin, ArrowRight } from 'lucide-react'
import { orderApi } from '../../api'

export default function OrderSuccess() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    orderApi.getById(id).then(r => setOrder(r.data))
  }, [id])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-5">
        <div className="card text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Order Placed!</h1>
          <p className="text-gray-500 mt-2">Your order #{id} has been placed successfully</p>

          {order && (
            <div className="mt-5 p-4 bg-gray-50 rounded-2xl text-left space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-brand-500" />
                <span>Estimated delivery: <strong>30–45 minutes</strong></span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span>{order.deliveryAddress?.city}, {order.deliveryAddress?.state}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 font-bold text-gray-900 flex justify-between">
                <span>Total Paid</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <Link to={`/orders/${id}`} className="flex-1 btn-primary">
              Track Order <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/home" className="flex-1 btn-secondary">Home</Link>
          </div>
        </div>

        <div className="card text-center bg-brand-50 border-none">
          <p className="text-2xl mb-1">🌶️</p>
          <p className="text-sm font-medium text-brand-700">Our chefs are preparing your food with love!</p>
        </div>
      </div>
    </div>
  )
}
