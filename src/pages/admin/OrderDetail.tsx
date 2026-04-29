import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { getOrder, updateOrderStatus } from '../../hooks/useOrders'
import type { OrderWithDetails, OrderStatus } from '../../lib/supabase'

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

export function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!id) return
    getOrder(id).then((o) => {
      setOrder(o)
      setLoading(false)
    })
  }, [id])

  async function changeStatus(newStatus: OrderStatus) {
    if (!order) return
    setUpdating(true)
    await updateOrderStatus(order.id, newStatus)
    setOrder((prev) => prev ? { ...prev, status: newStatus } : prev)
    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-cxx-blue" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Order not found.</p>
        <Link to="/admin/orders" className="text-cxx-blue text-sm mt-2 inline-block">← Back to orders</Link>
      </div>
    )
  }

  const addr = order.shipping_address
  const nextStatuses = NEXT_STATUSES[order.status]

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/orders')} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{order.order_number}</h1>
          <p className="text-sm text-gray-400">
            {new Date(order.created_at).toLocaleString('en-ZA')} · {order.order_type}
          </p>
        </div>
        <span className={`ml-auto text-sm px-3 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[order.status]}`}>
          {order.status}
        </span>
      </div>

      {/* Status actions */}
      {nextStatuses.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
          <p className="text-sm font-medium text-gray-700 mb-3">Update Status 更新状态</p>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((s) => (
              <button
                key={s}
                onClick={() => changeStatus(s)}
                disabled={updating}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 capitalize transition-colors disabled:opacity-50"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> : null}
                Mark as {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Order items */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <h2 className="font-semibold text-gray-900 mb-4">Items 商品</h2>
        <div className="space-y-2">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900">{item.product_name}</p>
                <p className="text-gray-400">x{item.quantity} @ R{item.unit_price.toFixed(2)}</p>
              </div>
              <p className="font-semibold text-gray-900">R{item.line_total.toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 mt-4 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>R{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>{order.shipping_fee === 0 ? 'FREE' : `R${order.shipping_fee.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
            <span>Total</span>
            <span>R{order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Customer */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <h2 className="font-semibold text-gray-900 mb-3">Customer 客户</h2>
        <div className="text-sm space-y-1 text-gray-700">
          <p className="font-medium">{order.customers?.name ?? '—'}</p>
          <p className="text-gray-400">{order.customers?.email ?? ''}</p>
          <p className="text-gray-400">{order.customers?.phone ?? ''}</p>
        </div>
      </div>

      {/* Shipping address */}
      {addr && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <h2 className="font-semibold text-gray-900 mb-3">Shipping Address 收货地址</h2>
          <div className="text-sm text-gray-700 space-y-0.5">
            <p>{addr.name}</p>
            <p>{addr.address_line1}</p>
            {addr.address_line2 && <p>{addr.address_line2}</p>}
            <p>{addr.city}, {addr.province} {addr.postal_code}</p>
            <p className="text-gray-400">{addr.phone}</p>
          </div>
        </div>
      )}

      {/* Payment */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Payment 支付</h2>
        <div className="text-sm space-y-1.5">
          <div className="flex justify-between">
            <span className="text-gray-500">Method</span>
            <span className="font-medium capitalize">{order.payment_method ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className={`font-medium capitalize ${order.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
              {order.payment_status}
            </span>
          </div>
          {order.payment_reference && (
            <div className="flex justify-between">
              <span className="text-gray-500">Reference</span>
              <span className="font-mono text-xs">{order.payment_reference}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
