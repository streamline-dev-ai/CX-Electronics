import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Loader2, Truck, Store, CheckCircle2, XCircle,
  FileText, Download, Bell, User, MapPin, Package, Trash2,
} from 'lucide-react'
import { getOrder, updateOrderStatus, deleteOrder } from '../../hooks/useOrders'
import { notifyStatusChange } from '../../lib/webhooks'
import type { OrderWithDetails, OrderStatus } from '../../lib/supabase'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(s: string): string {
  const labels: Record<string, string> = {
    pending: 'Order Placed', paid: 'Payment Confirmed', processing: 'Processing',
    packed: 'Packed', out_for_delivery: 'Out for Delivery', delivered: 'Delivered',
    ready_for_collection: 'Ready for Collection', collected: 'Collected', cancelled: 'Cancelled',
  }
  return labels[s] ?? s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  packed: 'bg-indigo-100 text-indigo-700',
  out_for_delivery: 'bg-sky-100 text-sky-700',
  delivered: 'bg-green-100 text-green-700',
  ready_for_collection: 'bg-teal-100 text-teal-700',
  collected: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const DELIVERY_PATH: OrderStatus[] = ['pending', 'paid', 'processing', 'packed', 'out_for_delivery', 'delivered']
const COLLECTION_PATH: OrderStatus[] = ['pending', 'paid', 'processing', 'packed', 'ready_for_collection', 'collected']

function getNextForward(status: OrderStatus, fulfillment: 'delivery' | 'collection'): OrderStatus | null {
  const path = fulfillment === 'collection' ? COLLECTION_PATH : DELIVERY_PATH
  const idx = path.indexOf(status)
  return idx >= 0 && idx < path.length - 1 ? path[idx + 1] : null
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [notifying, setNotifying] = useState(false)
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
    setUpdating(true)
    const prev = order.status

    const { error } = await updateOrderStatus(order.id, newStatus, 'admin')
    if (error) { showToast(`Failed: ${error}`, false); setUpdating(false); return }

    notifyStatusChange({ ...order, status: newStatus }, prev, newStatus)
    getOrder(order.id).then((o) => { if (o) setOrder(o) })
    showToast(`Marked as ${fmt(newStatus)}`, true)
    setUpdating(false)
  }

  async function sendNotification() {
    if (!order) return
    setNotifying(true)
    await notifyStatusChange(order, order.status, order.status)
    showToast('Notification sent', true)
    setNotifying(false)
  }

  async function handleDelete() {
    if (!order) return
    const ok = window.confirm(`Delete ${order.order_number}? This cannot be undone.`)
    if (!ok) return
    setUpdating(true)
    const { error } = await deleteOrder(order.id)
    if (error) {
      showToast(`Failed: ${error}`, false)
      setUpdating(false)
      return
    }
    navigate('/admin/orders')
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
  const nextStatus = getNextForward(order.status, order.fulfillment_type)
  const isTerminal = ['delivered', 'collected', 'cancelled'].includes(order.status)
  const canCancel = !isTerminal && order.status !== 'pending'
  const events = order.order_status_events ?? []
  const completedStatuses = new Set(events.map((e) => e.status))
  const timelinePath = isCollection ? COLLECTION_PATH : DELIVERY_PATH

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
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
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
            isCollection ? 'bg-teal-100 text-teal-700' : 'bg-sky-100 text-sky-700'
          }`}>
            {isCollection ? <Store className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
            {isCollection ? 'Collection' : 'Delivery'}
          </span>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {fmt(order.status)}
          </span>
          <button
            onClick={handleDelete}
            disabled={updating}
            title="Delete order"
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-5 items-start">

        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Next Step */}
          {!isTerminal && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Next Step</p>
                  <p className="text-sm text-gray-600">
                    Current stage: <span className="font-semibold text-gray-900">{fmt(order.status)}</span>
                  </p>
                </div>
                {nextStatus && (
                  <button
                    onClick={() => changeStatus(nextStatus)}
                    disabled={updating}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white
                      bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600
                      shadow-sm disabled:opacity-60 transition-all whitespace-nowrap"
                  >
                    {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                    Mark as {fmt(nextStatus)}
                  </button>
                )}
              </div>
              {canCancel && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => changeStatus('cancelled')}
                    disabled={updating}
                    className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                  >
                    Cancel this order
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900">
                Order Items ({order.order_items.length})
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.order_items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-3 font-medium text-gray-900">{item.product_name}</td>
                    <td className="px-3 py-3 text-center text-cxx-blue font-semibold">{item.quantity}</td>
                    <td className="px-3 py-3 text-right text-gray-600">R{item.unit_price.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900">R{item.line_total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-4 border-t border-gray-200 space-y-1.5 text-sm bg-gray-50">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>R{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{order.shipping_fee === 0 ? 'FREE' : `R${order.shipping_fee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-200 mt-1">
                <span>Total</span><span>R{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-5">Timeline</h2>
            <ol className="space-y-0">
              {timelinePath.map((step, i) => {
                const isCompleted = completedStatuses.has(step)
                const isNext = !isCompleted && timelinePath[i - 1] !== undefined && completedStatuses.has(timelinePath[i - 1])
                const isFuture = !isCompleted && !isNext
                const ev = events.find((e) => e.status === step)

                return (
                  <li key={step} className="flex items-start gap-3">
                    {/* Dot + line */}
                    <div className="flex flex-col items-center pt-0.5">
                      {isCompleted ? (
                        <div className="w-3 h-3 rounded-full bg-cxx-blue flex-shrink-0" />
                      ) : isNext ? (
                        <div className="w-3 h-3 rounded-full border-2 border-gray-400 bg-white flex-shrink-0" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-200 flex-shrink-0 mt-0.5 ml-0.5" />
                      )}
                      {i < timelinePath.length - 1 && (
                        <div className={`w-px flex-1 min-h-[1.5rem] mt-1 ${isCompleted ? 'bg-cxx-blue/30' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    {/* Content */}
                    <div className={`flex-1 pb-4 ${isFuture ? 'opacity-40' : ''}`}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className={`text-sm ${isCompleted ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'}`}>
                          {fmt(step)}
                        </span>
                        {ev && (
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {new Date(ev.created_at).toLocaleString('en-ZA', {
                              year: 'numeric', month: '2-digit', day: '2-digit',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      {ev?.note && <p className="text-xs text-gray-400 mt-0.5">{ev.note}</p>}
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>

        {/* ── Right column ─────────────────────────────────────────────────── */}
        <div className="w-72 flex-shrink-0 space-y-4">

          {/* Customer */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900 text-sm">Customer</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Name</p>
                <p className="font-semibold text-gray-900 mt-0.5">{order.customers?.name ?? '—'}</p>
              </div>
              {order.customers?.email && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Email</p>
                  <a href={`mailto:${order.customers.email}`} className="text-cxx-blue hover:underline mt-0.5 block">
                    {order.customers.email}
                  </a>
                </div>
              )}
              {order.customers?.phone && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Phone</p>
                  <p className="text-gray-700 mt-0.5">{order.customers.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900 text-sm">Invoice</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Status</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Invoice Available
                </span>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Actions</p>
                <Link
                  to={`/admin/orders/${order.id}/invoice`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-semibold text-sm text-white
                    bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600
                    shadow-sm transition-all mb-2"
                >
                  <Download className="w-4 h-4" />
                  View / Download Invoice
                </Link>
                <button
                  onClick={sendNotification}
                  disabled={notifying}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-semibold text-sm
                    text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-60"
                >
                  {notifying
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Bell className="w-4 h-4" />}
                  Send Notification
                </button>
              </div>
            </div>
          </div>

          {/* Delivery / Collection Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900 text-sm">
                {isCollection ? 'Collection Details' : 'Delivery Details'}
              </h2>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Method</p>
                <p className="font-semibold text-gray-900 mt-0.5 capitalize">{order.fulfillment_type}</p>
              </div>
              {!isCollection && addr && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Shipping Address</p>
                  <div className="text-gray-700 space-y-0.5">
                    <p>{addr.address_line1}</p>
                    {addr.address_line2 && <p>{addr.address_line2}</p>}
                    <p>{addr.city}</p>
                    <p>{addr.province}</p>
                    <p>ZA</p>
                  </div>
                </div>
              )}
              {isCollection && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Collector</p>
                  <p className="font-medium text-gray-900">{order.collection_name ?? order.customers?.name ?? '—'}</p>
                  <p className="text-gray-500">{order.collection_phone ?? order.customers?.phone ?? ''}</p>
                  <p className="text-gray-400 text-xs mt-1">Dragon City, Shop 14, Fordsburg</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 text-sm mb-3">Payment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium uppercase text-gray-900 text-xs">{order.payment_method ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-semibold capitalize text-xs px-2 py-0.5 rounded-full ${
                  order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {order.payment_status}
                </span>
              </div>
              {order.payment_reference && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Ref</span>
                  <span className="font-mono text-xs text-gray-600">{order.payment_reference}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
