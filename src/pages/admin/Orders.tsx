import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ShoppingCart, Truck, Store, ChevronRight as ArrowNext, FileText, Search, X } from 'lucide-react'
import { useOrders, updateOrderStatus } from '../../hooks/useOrders'
import { notifyStatusChange } from '../../lib/webhooks'
import { useAdminMode } from '../../hooks/useAdminMode'
import type { OrderStatus, OrderWithDetails } from '../../lib/supabase'

const STATUS_STYLES: Record<OrderStatus, string> = {
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

function fmt(s: string): string {
  const labels: Record<string, string> = {
    pending: 'Order Placed', paid: 'Payment Confirmed', processing: 'Processing',
    packed: 'Packed', out_for_delivery: 'Out for Delivery', delivered: 'Delivered',
    ready_for_collection: 'Ready for Collection', collected: 'Collected', cancelled: 'Cancelled',
  }
  return labels[s] ?? s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const DELIVERY_NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'paid', paid: 'processing', processing: 'packed',
  packed: 'out_for_delivery', out_for_delivery: 'delivered',
}
const COLLECTION_NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'paid', paid: 'processing', processing: 'packed',
  packed: 'ready_for_collection', ready_for_collection: 'collected',
}

function getNext(order: OrderWithDetails): OrderStatus | null {
  const map = order.fulfillment_type === 'collection' ? COLLECTION_NEXT : DELIVERY_NEXT
  return map[order.status] ?? null
}

const ALL_STATUSES: OrderStatus[] = [
  'pending', 'paid', 'processing', 'packed',
  'out_for_delivery', 'delivered',
  'ready_for_collection', 'collected',
  'cancelled',
]

export function AdminOrders() {
  const [adminMode] = useAdminMode()
  const isDemo = adminMode === 'demo'
  const [status, setStatus] = useState<OrderStatus | undefined>()
  const [page, setPage] = useState(1)
  const [advancing, setAdvancing] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const { orders, loading, totalCount, refetch } = useOrders({ status, search: search || undefined, demoMode: isDemo, page, pageSize: 50 })
  const totalPages = Math.ceil(totalCount / 50)

  const applySearch = useCallback(() => {
    setPage(1)
    setSearch(searchInput.trim())
  }, [searchInput])

  function clearSearch() {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }

  async function advanceOrder(order: OrderWithDetails, next: OrderStatus) {
    setAdvancing(order.id)
    const { error } = await updateOrderStatus(order.id, next, 'admin')
    if (!error) {
      notifyStatusChange({ ...order, status: next }, order.status, next)
      refetch()
    }
    setAdvancing(null)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Orders <span className="text-sm font-normal text-gray-400">订单</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{totalCount} total</p>
        </div>

        {/* Search by order number */}
        <form
          onSubmit={(e) => { e.preventDefault(); applySearch() }}
          className="flex gap-2 flex-shrink-0"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Order number…"
              className="pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63939] w-48"
            />
            {searchInput && (
              <button type="button" onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button type="submit" className="px-3 py-2 text-sm font-semibold bg-[#0F172A] text-white rounded-lg hover:bg-[#1e293b] transition-colors">
            Search
          </button>
        </form>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => { setStatus(undefined); setPage(1) }}
          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
            !status ? 'bg-cxx-blue text-white border-cxx-blue' : 'border-gray-300 text-gray-600 hover:border-gray-400'
          }`}
        >
          All
        </button>
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1) }}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              status === s ? 'bg-cxx-blue text-white border-cxx-blue' : 'border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            {fmt(s)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-cxx-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <ShoppingCart className="w-8 h-8 mb-2" />
            <p className="text-sm">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Order #</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Customer</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Via</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Total</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const next = getNext(order)
                  const isAdvancing = advancing === order.id
                  return (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="font-medium text-cxx-blue hover:underline"
                      >
                        {order.order_number}
                      </Link>
                      <p className="text-xs text-gray-400 capitalize">{order.order_type}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{order.customers?.name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{order.customers?.email ?? ''}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                        order.fulfillment_type === 'collection'
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-sky-100 text-sky-700'
                      }`}>
                        {order.fulfillment_type === 'collection'
                          ? <Store className="w-3 h-3" />
                          : <Truck className="w-3 h-3" />}
                        {order.fulfillment_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      R{order.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[order.status]}`}>
                        {fmt(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-sm">
                      {new Date(order.created_at).toLocaleDateString('en-ZA', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/orders/${order.id}/invoice`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                          title="View Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                        {next && (
                          <button
                            onClick={() => advanceOrder(order, next)}
                            disabled={isAdvancing}
                            title={`Mark as ${fmt(next)}`}
                            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg
                              bg-cxx-blue text-white hover:bg-cxx-blue-hover transition-colors disabled:opacity-60"
                          >
                            {isAdvancing
                              ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                              : <ArrowNext className="w-3 h-3" />}
                            {fmt(next).split(' ')[0]}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
