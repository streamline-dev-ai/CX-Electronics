import { Zap, Printer } from 'lucide-react'

const INVOICE = {
  number: 'CXX-WHL-2026-0038',
  date: '30 April 2026',
  dueDate: '14 May 2026',
  paymentTerms: 'Net 14 days',
  client: {
    company: 'Bright Future Trading (Pty) Ltd',
    contact: 'Sarah Mokoena',
    email: 'purchasing@brightfuture.co.za',
    phone: '+27 73 456 7890',
    vatNo: '4987654321',
    address: '22 Industrial Road, Germiston, Gauteng, 1401',
  },
  items: [
    { name: '65W GaN USB-C Fast Charger', sku: 'CXX-CHR-65W', qty: 50, unit: 159.00 },
    { name: '20W USB-C Wall Charger', sku: 'CXX-CHR-20W', qty: 100, unit: 79.00 },
    { name: 'USB-C to USB-C Braided Cable 1.5m', sku: 'CXX-CBL-USBC', qty: 100, unit: 49.00 },
    { name: '10000mAh Slim Power Bank 22.5W', sku: 'CXX-PWR-10K', qty: 30, unit: 219.00 },
    { name: 'Wireless TWS Earbuds ANC', sku: 'CXX-AUD-TWS', qty: 20, unit: 529.00 },
  ],
  notes: 'Goods to be collected from Dragon City, Fordsburg or delivered via agreed courier. All prices exclude VAT. Payment via EFT only.',
}

const VAT_RATE = 0.15

export function WholesaleInvoice() {
  const subtotal = INVOICE.items.reduce((s, i) => s + i.qty * i.unit, 0)
  const vat = subtotal * VAT_RATE
  const total = subtotal + vat

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:py-0">
      {/* Print button */}
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
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">Wholesale Division</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[#E63939] text-xs font-bold uppercase tracking-widest mb-1">Tax Invoice</p>
            <p className="text-white font-bold text-lg">{INVOICE.number}</p>
            <p className="text-white/50 text-sm mt-0.5">Issued: {INVOICE.date}</p>
            <p className="text-white/50 text-sm">Due: {INVOICE.dueDate}</p>
          </div>
        </div>

        <div className="px-8 py-7 space-y-7">

          {/* From + To */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">From</p>
              <p className="font-bold text-gray-900">CXX Electronics (Pty) Ltd</p>
              <p className="text-sm text-gray-600 mt-0.5">Shop 14, Dragon City</p>
              <p className="text-sm text-gray-600">Fordsburg, Johannesburg, 2092</p>
              <p className="text-sm text-gray-600 mt-1">Tel: +27 11 123 4567</p>
              <p className="text-sm text-gray-600">info@cxxelectronics.co.za</p>
              <p className="text-sm text-gray-500 mt-1">VAT No: 4123456789</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Bill To</p>
              <p className="font-bold text-gray-900">{INVOICE.client.company}</p>
              <p className="text-sm text-gray-600 mt-0.5">Attn: {INVOICE.client.contact}</p>
              <p className="text-sm text-gray-600">{INVOICE.client.email}</p>
              <p className="text-sm text-gray-600">{INVOICE.client.phone}</p>
              <p className="text-sm text-gray-500 mt-1 leading-snug">{INVOICE.client.address}</p>
              <p className="text-sm text-gray-500">VAT No: {INVOICE.client.vatNo}</p>
            </div>
          </div>

          {/* Payment terms badge */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-[#111827] text-white px-3 py-1.5 rounded-lg uppercase tracking-wider">
              {INVOICE.paymentTerms}
            </span>
            <span className="text-xs text-gray-500">EFT payment required before dispatch</span>
          </div>

          {/* Items table */}
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="text-left py-2 font-semibold text-gray-500 text-[11px] uppercase tracking-wider">Description</th>
                  <th className="text-left py-2 font-semibold text-gray-500 text-[11px] uppercase tracking-wider w-28">SKU</th>
                  <th className="text-center py-2 font-semibold text-gray-500 text-[11px] uppercase tracking-wider w-16">Qty</th>
                  <th className="text-right py-2 font-semibold text-gray-500 text-[11px] uppercase tracking-wider w-28">Unit (excl.)</th>
                  <th className="text-right py-2 font-semibold text-gray-500 text-[11px] uppercase tracking-wider w-28">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {INVOICE.items.map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/60' : ''}>
                    <td className="py-3 px-2 font-medium text-gray-900">{item.name}</td>
                    <td className="py-3 px-2 text-gray-400 text-xs font-mono">{item.sku}</td>
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
                <span>R{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>VAT (15%)</span>
                <span>R{vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-gray-900 text-lg border-t-2 border-gray-200 pt-2 mt-2">
                <span>Total Due</span>
                <span className="text-[#E63939]">R{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Banking details */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Banking Details (EFT)</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
              {[
                ['Bank', 'First National Bank (FNB)'],
                ['Account Name', 'CXX Electronics (Pty) Ltd'],
                ['Account Number', '62841239876'],
                ['Branch Code', '250655'],
                ['Account Type', 'Business Cheque'],
                ['Reference', INVOICE.number],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <span className="text-gray-400 w-32 flex-shrink-0">{label}:</span>
                  <span className="font-semibold text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes + Footer */}
          <div className="space-y-3">
            {INVOICE.notes && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Notes</p>
                <p className="text-sm text-gray-500 leading-relaxed">{INVOICE.notes}</p>
              </div>
            )}
            <div className="border-t border-gray-100 pt-4 flex items-end justify-between">
              <p className="text-xs text-gray-400">
                CXX Electronics · Dragon City, Fordsburg, JHB · VAT Reg: 4123456789<br />
                This is a computer-generated invoice and requires no signature.
              </p>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">Thank you for your business.</p>
                <p className="text-xs text-gray-400 mt-0.5">cxxelectronics.co.za</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
