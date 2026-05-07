import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Package, Truck, Store, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { getOrder, updateOrderStatus } from '../../hooks/useOrders'
import { notifyStatusChange } from '../../lib/webhooks'
import type { OrderWithDetails, OrderStatus } from '../../lib/supabase'

// ─── Status helpers ───────────────────────────────────────────────────────────

function formatStatus(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const STATUS_STYLES: Record<string, string> = {
  pending:               'bg-amber-100 text-amber-700',
  paid:                  'bg-blue-100 text-blue-700',
  processing:            'bg-purple-100 text-purple-700',
  packed:                'bg-indigo-100 text-indigo-700',
  out_for_delivery:      'bg-sky-100 text-sky-700',
  delivered:             'bg-green-100 text-green-700',
  ready_for_collection:  'bg-teal-100 text-teal-700',
  collected:             'bg-green-100 text-green-700',
  cancelled:             'bg-red-100 text-red-700',
}

// Delivery:   pending → paid → processing → packed → out_for_delivery → delivered
// Collection: pending → paid → processing → packed → ready_for_collection → collected
function getNextStatuses(
  status: OrderStatus,
  fulfillmentType: 'delivery' | 'collection',
): OrderStatus[] {
  const TERMINAL: OrderStatus[] = ['delivered', 'collected', 'cancelled']
  if (TERMINAL.includes(status)) return []

  const forward: Partial<Record<OrderStatus, OrderStatus>> =
    fulfillmentType === 'collection'
      ? {
          pending:    'paid',
          paid:       'processing',
          processing: 'packed',
          packed:     'ready_for_collection',
          ready_for_collection: 'collected',
        }
      : {
          pending:     'paid',
          paid:        'processing',
          processing:  'packed',
          packed:      'out_for_delivery',
          out_for_delivery: 'delivered',
        }

  const next: OrderStatus[] = []
  const fwd = forward[status]
  if (fwd) next.push(fwd)
  if (status !== 'pending') next.push('cancelled')
  return next
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<OrderStatus | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    if (!id) return
    getOrder(id).then((o) => { setOrder(o); setLoading(false) })
  }, [id])

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  async function changeStatus(newStatus: OrderStatus) {
    if (!order) return
    setUpdating(newStatus)
    const prev = order.status

    const { error } = await updateOrderStatus(order.id, newStatus, 'admin')
    if (error) {
      showToast(`Failed to update: ${error}`, false)
      setUpdating(null)
      return
    }

    const updated = { ...order, status: newStatus }
    setOrder(updated)
    // Reload status events (refetch full order)
    getOrder(order.id).then((o) => { if (o) setOrder(o) })

    // Fire webhook non-blocking
    notifyStatusChange(updated, prev, newStatus)

    showToast(`Order marked as ${formatStatus(newStatus)}`, true)
    setUpdating(null)
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
  const isCollection = order.fulfillment_type === 'collection'
  const nextStatuses = getNextStatuses(order.status, order.fulfillment_type)
  const events = order.order_status_events ?? []

  return (
    <div className="max-w-2xl relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.ok
            ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            : <XCircle className="w-4 h-4 flex-shrink-0" />}
          {toast.msg}
        </div>
      )}

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
        <div className="ml-auto flex items-center gap-2">
          {/* Fulfillment badge */}
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
            isCollection ? 'bg-teal-100 text-teal-700' : 'bg-sky-100 text-sky-700'
          }`}>
            {isCollection ? <Store className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
            {isCollection ? 'Collection' : 'Delivery'}
          </span>
          {/* Status badge */}
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {formatStatus(order.status)}
          </span>
        </div>
      </div>

      {/* Status actions */}
      {nextStatuses.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
          <p className="text-sm font-medium text-gray-700 mb-3">Update Status 更新状态</p>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((s) => {
              const isCancel = s === 'cancelled'
              const isLoading = updating === s
              return (
                <button
                  key={s}
                  onClick={() => changeStatus(s)}
                  disabled={updating !== null}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 ${
                    isCancel
                      ? 'border-red-300 text-red-600 hover:bg-red-50'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin inline mr-1.5" />}
                  {isCancel ? 'Cancel Order' : `Mark as ${formatStatus(s)}`}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Status timeline */}
      {events.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <h2 className="font-semibold text-gray-900 mb-4">Timeline 状态历史</h2>
          <ol className="space-y-3">
            {events.map((ev, i) => {
              const isLast = i === events.length - 1
              return (
                <li key={ev.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                      isLast ? 'bg-cxx-blue' : 'bg-gray-300'
                    }`} />
                    {!isLast && <div className="w-px h-full min-h-4 bg-gray-200 mt-1" />}
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`text-sm font-medium ${isLast ? 'text-gray-900' : 'text-gray-500'}`}>
                        {formatStatus(ev.status)}
                      </span>
                      <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ev.created_at).toLocaleString('en-ZA', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {ev.note && <p className="text-xs text-gray-400 mt-0.5">{ev.note}</p>}
                    <p className="text-xs text-gray-400">{ev.triggered_by}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      )}

      {/* Order items */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          Items 商品
        </h2>
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

      {/* Delivery address */}
      {!isCollection && addr && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-gray-400" />
            Delivery Address 收货地址
          </h2>
          <div className="text-sm text-gray-700 space-y-0.5">
            <p>{addr.name}</p>
            <p>{addr.address_line1}</p>
            {addr.address_line2 && <p>{addr.address_line2}</p>}
            <p>{addr.city}, {addr.province} {addr.postal_code}</p>
            <p className="text-gray-400">{addr.phone}</p>
          </div>
        </div>
      )}

      {/* Collection info */}
      {isCollection && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Store className="w-4 h-4 text-gray-400" />
            Collection Details 取货信息
          </h2>
          <div className="text-sm text-gray-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Collector</span>
              <span className="font-medium">{order.collection_name ?? order.customers?.name ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phone</span>
              <span>{order.collection_phone ?? order.customers?.phone ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Location</span>
              <span>Dragon City, Shop 14, Fordsburg</span>
            </div>
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
