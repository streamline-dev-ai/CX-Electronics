import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ShoppingCart, Truck, Store } from 'lucide-react'
import { useOrders } from '../../hooks/useOrders'
import type { OrderStatus } from '../../lib/supabase'

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

function formatStatus(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const ALL_STATUSES: OrderStatus[] = [
  'pending', 'paid', 'processing', 'packed',
  'out_for_delivery', 'delivered',
  'ready_for_collection', 'collected',
  'cancelled',
]

export function AdminOrders() {
  const [status, setStatus] = useState<OrderStatus | undefined>()
  const [page, setPage] = useState(1)

  const { orders, loading, totalCount } = useOrders({ status, page, pageSize: 50 })
  const totalPages = Math.ceil(totalCount / 50)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Orders <span className="text-sm font-normal text-gray-400">订单</span>
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{totalCount} total</p>
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
            {formatStatus(s)}
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
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Type</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Fulfillment</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Total</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="font-medium text-cxx-blue hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-gray-900">{order.customers?.name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{order.customers?.email ?? ''}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        order.order_type === 'bulk'
                          ? 'bg-cxx-blue-light text-cxx-blue'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {order.order_type}
                      </span>
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
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('en-ZA', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
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
