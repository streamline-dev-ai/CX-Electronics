import { Zap, Printer } from 'lucide-react'

const INVOICE = {
  number: 'CXX-2026-00142',
  date: '30 April 2026',
  customer: {
    name: 'Thabo Nkosi',
    email: 'thabo.nkosi@gmail.com',
    phone: '+27 82 345 6789',
    address: '14 Rivonia Road, Sandton, Gauteng, 2196',
  },
  items: [
    { name: '65W GaN USB-C Fast Charger', qty: 2, unit: 249.00 },
    { name: 'USB-C to USB-C Braided Cable 1.5m', qty: 3, unit: 89.00 },
    { name: 'Smart Watch Pro X1 — AMOLED', qty: 1, unit: 699.00 },
    { name: 'Wireless TWS Earbuds (ANC)', qty: 1, unit: 799.00 },
  ],
  shipping: 99.00,
  paymentMethod: 'PayFast (Credit Card)',
  paymentRef: 'PF-8823741920',
}

const VAT_RATE = 0.15

export function RetailInvoice() {
  const subtotal = INVOICE.items.reduce((s, i) => s + i.qty * i.unit, 0)
  const vat = subtotal * VAT_RATE
  const total = subtotal + vat + INVOICE.shipping

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:py-0">
      {/* Print button — hidden when printing */}
      <div className="max-w-3xl mx-auto mb-4 flex justify-end print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">

        {/* Header */}
        <div className="bg-[#111827] px-8 py-7 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E63939] rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <p className="font-extrabold text-white text-xl tracking-tight">CXX Electronics</p>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">Dragon City, Fordsburg, JHB</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[#E63939] text-xs font-bold uppercase tracking-widest mb-1">Receipt</p>
            <p className="text-white font-bold text-lg">{INVOICE.number}</p>
            <p className="text-white/50 text-sm mt-0.5">{INVOICE.date}</p>
          </div>
        </div>

        <div className="px-8 py-7 space-y-7">

          {/* Customer + Payment */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Bill To</p>
              <p className="font-bold text-gray-900">{INVOICE.customer.name}</p>
              <p className="text-sm text-gray-600 mt-0.5">{INVOICE.customer.email}</p>
              <p className="text-sm text-gray-600">{INVOICE.customer.phone}</p>
              <p className="text-sm text-gray-500 mt-1 leading-snug">{INVOICE.customer.address}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Payment</p>
              <p className="text-sm text-gray-900 font-semibold">{INVOICE.paymentMethod}</p>
              <p className="text-sm text-gray-500 mt-0.5">Ref: {INVOICE.paymentRef}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                PAID
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
                  <th className="text-right py-2 font-semibold text-gray-500 text-[11px] uppercase tracking-wider w-24">Unit Price</th>
                  <th className="text-right py-2 font-semibold text-gray-500 text-[11px] uppercase tracking-wider w-24">Total</th>
                </tr>
              </thead>
              <tbody>
                {INVOICE.items.map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/60' : ''}>
                    <td className="py-3 px-2 font-medium text-gray-900">{item.name}</td>
                    <td className="py-3 px-2 text-center text-gray-600">{item.qty}</td>
                    <td className="py-3 px-2 text-right text-gray-600">R{item.unit.toFixed(2)}</td>
                    <td className="py-3 px-2 text-right font-semibold text-gray-900">R{(item.qty * item.unit).toFixed(2)}</td>
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
                <span>R{(subtotal / (1 + VAT_RATE)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>VAT (15%)</span>
                <span>R{(subtotal - subtotal / (1 + VAT_RATE)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>R{INVOICE.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-gray-900 text-lg border-t-2 border-gray-200 pt-2 mt-2">
                <span>Total</span>
                <span className="text-[#E63939]">R{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-6 flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-400 leading-relaxed">
                CXX Electronics · Dragon City, Shop 14, Fordsburg, Johannesburg<br />
                Tel: +27 11 123 4567 · info@cxxelectronics.co.za<br />
                VAT Reg No: 4123456789
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">Thank you for your purchase!</p>
              <p className="text-xs text-gray-400 mt-0.5">12-month warranty on all products</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
