import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Loader2, FileText } from 'lucide-react'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { supabase } from '../../lib/supabase'

interface OrderRow {
  id: string
  order_number: string
  status: string
  payment_status: string
  total: number
  created_at: string
  order_type: string
  fulfillment_type: string
}

const STATUS_STYLE: Record<string, string> = {
  pending:              'bg-yellow-500/20 text-yellow-400',
  paid:                 'bg-blue-500/20 text-blue-400',
  processing:           'bg-purple-500/20 text-purple-400',
  packed:               'bg-indigo-500/20 text-indigo-400',
  out_for_delivery:     'bg-sky-500/20 text-sky-400',
  delivered:            'bg-green-500/20 text-green-400',
  ready_for_collection: 'bg-teal-500/20 text-teal-400',
  collected:            'bg-green-500/20 text-green-400',
  cancelled:            'bg-white/10 text-white/40',
}

const STATUS_LABEL: Record<string, string> = {
  pending:              'Pending',
  paid:                 'Paid',
  processing:           'Processing',
  packed:               'Packed',
  out_for_delivery:     'Out for Delivery',
  delivered:            'Delivered',
  ready_for_collection: 'Ready for Collection',
  collected:            'Collected',
  cancelled:            'Cancelled',
}

export function MyOrders() {
  const { user } = useCustomerAuth()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.email) { setLoading(false); return }
    fetchOrders(user.email)
  }, [user])

  async function fetchOrders(email: string) {
    setLoading(true)

    // Look up customer record by email, then fetch their orders
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .single()

    if (customer?.id) {
      const { data } = await supabase
        .from('orders')
        .select('id, order_number, status, payment_status, total, created_at, order_type, fulfillment_type')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })

      setOrders(data ?? [])
    } else {
      setOrders([])
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-[#E63939] animate-spin" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
        <Package className="w-10 h-10 text-white/20 mx-auto mb-3" />
        <p className="text-white/60 font-semibold">No orders yet</p>
        <p className="text-sm text-white/30 mt-1">Your orders will appear here after checkout.</p>
        <Link to="/shop" className="inline-block mt-4 text-[#E63939] hover:underline text-sm font-medium">
          Start shopping →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="font-bold text-white text-lg">My Orders</h2>
      {orders.map((order) => {
        const isPaid = order.payment_status === 'paid' || order.status === 'paid'
        return (
          <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Link to={`/account/orders/${order.id}`} className="font-bold text-white text-sm hover:text-[#E63939] transition-colors">
                  {order.order_number}
                </Link>
                <p className="text-xs text-white/30 mt-0.5">
                  {new Date(order.created_at).toLocaleDateString('en-ZA', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                  {' · '}
                  {order.fulfillment_type === 'collection' ? 'Collection' : 'Delivery'}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[order.status] ?? 'bg-white/10 text-white/40'}`}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
                <p className="font-bold text-white text-sm">R{order.total.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-4">
              <Link
                to={`/account/orders/${order.id}`}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                View details →
              </Link>
              {isPaid && (
                <a
                  href={`/receipt/${order.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Receipt
                </a>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
