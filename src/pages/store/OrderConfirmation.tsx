import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Package, Loader2 } from 'lucide-react'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import { getOrder } from '../../hooks/useOrders'
import type { OrderWithDetails } from '../../lib/supabase'

export function OrderConfirmation() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getOrder(id).then((o) => {
      setOrder(o)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-cxx-bg">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-cxx-blue" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-cxx-bg">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96 text-gray-400 gap-4">
          <Package className="w-12 h-12" />
          <p>Order not found</p>
          <Link to="/shop" className="text-cxx-blue text-sm hover:underline">Continue shopping</Link>
        </div>
        <Footer />
      </div>
    )
  }

  const addr = order.shipping_address

  return (
    <div className="min-h-screen bg-cxx-bg">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Order Confirmed!</h1>
          <p className="text-gray-500">Order #{order.order_number}</p>
        </div>

        {/* Payment status */}
        <div className={`rounded-xl p-4 mb-5 text-sm font-medium text-center ${
          order.payment_status === 'paid'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          Payment: {order.payment_status === 'paid' ? '✓ Paid — thank you!' : 'Awaiting payment confirmation'}
        </div>

        {/* Order items */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
          <h2 className="font-semibold text-gray-900 mb-4">Your Order</h2>
          <div className="space-y-2">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.product_name} <span className="text-gray-400">x{item.quantity}</span></span>
                <span className="font-medium">R{item.line_total.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span><span>R{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span>{order.shipping_fee === 0 ? 'FREE' : `R${order.shipping_fee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-1">
              <span>Total</span><span>R{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        {addr && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-8">
            <h2 className="font-semibold text-gray-900 mb-3">Shipping to</h2>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p>{addr.name}</p>
              <p>{addr.address_line1}</p>
              {addr.address_line2 && <p>{addr.address_line2}</p>}
              <p>{addr.city}, {addr.province} {addr.postal_code}</p>
            </div>
          </div>
        )}

        <Link
          to="/shop"
          className="block w-full text-center bg-cxx-blue hover:bg-cxx-blue-hover text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Continue Shopping
        </Link>
      </div>

      <Footer />
    </div>
  )
}
