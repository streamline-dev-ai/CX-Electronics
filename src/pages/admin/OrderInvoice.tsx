import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Printer, ArrowLeft, Loader2 } from 'lucide-react'
import { getOrder } from '../../hooks/useOrders'
import type { OrderWithDetails } from '../../lib/supabase'

const VAT_RATE = 0.15
const LOGO_URL = 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1778137000/CW-Logo-black_mbfsn7.png'

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
  const subtotalExVat = order.subtotal / (1 + VAT_RATE)
  const vatAmount = order.subtotal - subtotalExVat

  const customerName = order.customers?.name ?? addr?.name ?? 'Customer'
  const customerEmail = order.customers?.email ?? ''
  const customerPhone = order.customers?.phone ?? addr?.phone ?? ''
  const deliveryLines = addr
    ? [addr.address_line1, addr.address_line2, addr.city, addr.province, addr.postal_code].filter(Boolean)
    : []

  const d = new Date(order.created_at)
  const date =
    d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ', ' +
    d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })

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

      {/* Receipt */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg print:shadow-none print:rounded-none px-10 py-10 print:px-8 print:py-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900">RECEIPT</h1>
            <p className="text-sm text-gray-500 mt-2">Receipt #: {order.order_number}</p>
            <p className="text-sm text-gray-500 mt-0.5">Date: {date}</p>
          </div>
          <div className="text-right">
            <img src={LOGO_URL} alt="CX Electronics" className="h-12 object-contain ml-auto block" />
            <p className="text-xs font-bold text-gray-900 mt-1 tracking-wide">CX Electronics</p>
          </div>
        </div>

        <hr className="border-gray-200 my-7" />

        {/* Customer / Fulfillment */}
        <div className="grid grid-cols-2 gap-8 mb-7">
          <div>
            <p className="text-sm font-bold text-gray-900 mb-2">Customer</p>
            <p className="font-semibold text-gray-900">{customerName}</p>
            {customerEmail && <p className="text-sm text-gray-600 mt-0.5">{customerEmail}</p>}
            {customerPhone && <p className="text-sm text-gray-600">{customerPhone}</p>}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 mb-2">Fulfillment</p>
            <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              {isCollection ? 'COLLECTION' : 'DELIVERY'}
            </p>
            <div className="mt-2 space-y-0.5">
              {isCollection ? (
                <>
                  <p className="text-sm text-gray-600">Dragon City Mall, Shop 14, Fordsburg, Johannesburg</p>
                  {order.collection_name && (
                    <p className="text-sm text-gray-600">Collector: {order.collection_name}</p>
                  )}
                </>
              ) : (
                deliveryLines.map((line, i) => (
                  <p key={i} className="text-sm text-gray-600">{line}</p>
                ))
              )}
            </div>
          </div>
        </div>

        <hr className="border-gray-200 mb-0" />

        {/* Items table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-900">
              <th className="text-left py-3 font-bold text-gray-900">Item</th>
              <th className="text-center py-3 font-bold text-gray-900 w-16">Qty</th>
              <th className="text-right py-3 font-bold text-gray-900 w-28">Unit</th>
              <th className="text-right py-3 font-bold text-gray-900 w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-2.5 text-gray-900">{item.product_name}</td>
                <td className="py-2.5 text-center text-gray-600">{item.quantity}</td>
                <td className="py-2.5 text-right text-gray-600">R {item.unit_price.toFixed(2)}</td>
                <td className="py-2.5 text-right font-semibold text-gray-900">R {item.line_total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="border-gray-200 mt-0 mb-5" />

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal (excl. VAT)</span>
              <span>R {subtotalExVat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>VAT (15%)</span>
              <span>R {vatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Shipping</span>
              <span>{order.shipping_fee === 0 ? 'FREE' : `R ${order.shipping_fee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-black text-gray-900 text-lg border-t-2 border-gray-900 pt-3 mt-1">
              <span>Total</span>
              <span>R {order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 mt-10 pt-5 flex items-start justify-between">
          <p className="text-xs text-gray-400 leading-relaxed">
            CX Electronics · Dragon City, Shop 14, Fordsburg, Johannesburg<br />
            info@cw-electronics.co.za
          </p>
          <p className="text-xs text-gray-400 text-right leading-relaxed">
            Thank you for your purchase.
          </p>
        </div>

      </div>
    </div>
  )
}
