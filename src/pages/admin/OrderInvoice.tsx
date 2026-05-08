import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Printer, ArrowLeft, Loader2 } from 'lucide-react'
import { getOrder } from '../../hooks/useOrders'
import type { OrderWithDetails } from '../../lib/supabase'

const VAT_RATE = 0.15

export function AdminOrderInvoice() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getOrder(id).then((o) => { setOrder(o); setLoading(false) })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#E63939]" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-3 text-gray-400">
        <p>Order not found.</p>
        <Link to="/admin/orders" className="text-[#E63939] text-sm hover:underline">← Back to orders</Link>
      </div>
    )
  }

  const addr = order.shipping_address
  const isCollection = order.fulfillment_type === 'collection'
  const subtotal = order.subtotal
  const vatAmount = subtotal - subtotal / (1 + VAT_RATE)
  const subtotalExVat = subtotal / (1 + VAT_RATE)

  const customerName = order.customers?.name ?? addr?.name ?? 'Customer'
  const customerEmail = order.customers?.email ?? ''
  const customerPhone = order.customers?.phone ?? addr?.phone ?? ''
  const customerAddress = addr
    ? [addr.address_line1, addr.address_line2, addr.city, addr.province, addr.postal_code].filter(Boolean).join(', ')
    : isCollection
      ? 'Dragon City Mall, Shop 14, Fordsburg, Johannesburg'
      : '—'

  const date = new Date(order.created_at).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:py-0">

      {/* Actions — hidden when printing */}
      <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between print:hidden">
        <Link
          to={`/admin/orders/${order.id}`}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to order
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>
      </div>

      {/* Invoice */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">

        {/* Header */}
        <div className="bg-[#0B1929] px-8 py-7 flex items-start justify-between">
          <div>
            <img
              src="https://res.cloudinary.com/dzhwylkfr/image/upload/v1777722832/CW-Logo_ujfdip.png"
              alt="CXX Electronics"
              className="h-8 mb-3"
            />
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">
              Dragon City Mall, Shop 14, Fordsburg, JHB
            </p>
          </div>
          <div className="text-right">
            <p className="text-[#E63939] text-xs font-bold uppercase tracking-widest mb-1">
              {order.order_type === 'bulk' ? 'Wholesale Invoice' : 'Invoice / Receipt'}
            </p>
            <p className="text-white font-bold text-lg">{order.order_number}</p>
            <p className="text-white/50 text-sm mt-0.5">{date}</p>
            <span className={`inline-block mt-2 text-xs font-bold px-2.5 py-1 rounded-full ${
              order.payment_status === 'paid'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}>
              {order.payment_status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="px-8 py-7 space-y-7">

          {/* Bill to + Fulfillment */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Bill To</p>
              <p className="font-bold text-gray-900">{customerName}</p>
              {customerEmail && <p className="text-sm text-gray-600 mt-0.5">{customerEmail}</p>}
              {customerPhone && <p className="text-sm text-gray-600">{customerPhone}</p>}
              <p className="text-sm text-gray-500 mt-1 leading-snug">{customerAddress}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                {isCollection ? 'Collection' : 'Delivery'}
              </p>
              {isCollection ? (
                <>
                  <p className="text-sm font-semibold text-gray-900">Store Collection</p>
                  <p className="text-sm text-gray-500 mt-0.5">Dragon City, Shop 14, Fordsburg</p>
                  {(order.collection_name || order.collection_phone) && (
                    <p className="text-sm text-gray-500 mt-1">
                      Collector: {order.collection_name ?? customerName}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-gray-900">
                    {order.notes?.replace('Delivery: ', '') ?? 'Standard Delivery'}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{customerAddress}</p>
                </>
              )}
              <div className="mt-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Payment</p>
                <p className="text-sm font-semibold capitalize text-gray-700">{order.payment_method ?? '—'}</p>
                {order.payment_reference && (
                  <p className="text-xs text-gray-400 mt-0.5">Ref: {order.payment_reference}</p>
                )}
              </div>
            </div>
          </div>

          {/* Items table */}
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="text-left py-2 font-semibold text-gray-500 text-[11px] uppercase tracking-wider">Item</th>
                  <th className="text-center py-2 font-semibold text-gray-500 text-[11px] uppercase tracking-wider w-16">Qty</th>
                  <th className="text-right py-2 font-semibold text-gray-500 text-[11px] uppercase tracking-wider w-28">Unit Price</th>
                  <th className="text-right py-2 font-semibold text-gray-500 text-[11px] uppercase tracking-wider w-28">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items.map((item, i) => (
                  <tr key={item.id} className={i % 2 === 0 ? 'bg-gray-50/60' : ''}>
                    <td className="py-3 px-2 font-medium text-gray-900">{item.product_name}</td>
                    <td className="py-3 px-2 text-center text-gray-600">{item.quantity}</td>
                    <td className="py-3 px-2 text-right text-gray-600">R{item.unit_price.toFixed(2)}</td>
                    <td className="py-3 px-2 text-right font-semibold text-gray-900">R{item.line_total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal (excl. VAT)</span>
                <span>R{subtotalExVat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>VAT (15%)</span>
                <span>R{vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>{order.shipping_fee === 0 ? 'FREE' : `R${order.shipping_fee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-extrabold text-gray-900 text-lg border-t-2 border-gray-200 pt-2 mt-2">
                <span>Total</span>
                <span className="text-[#E63939]">R{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-6 flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-400 leading-relaxed">
                CXX Electronics · Dragon City, Shop 14, Fordsburg, Johannesburg<br />
                info@cw-electronics.co.za<br />
                VAT Reg No: Pending registration
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">Thank you for your business!</p>
              <p className="text-xs text-gray-400 mt-0.5">All products tested and verified for quality</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
