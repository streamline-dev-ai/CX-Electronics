import { Link } from 'react-router-dom'
import { Printer, ArrowLeft } from 'lucide-react'

const LOGO_URL = 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1778137000/CW-Logo-black_mbfsn7.png'

const DEMO_ITEMS = [
  { id: '1',  product_name: 'Samsung 65" QLED 4K Smart TV — Charcoal Black',     quantity: 1, unit_price: 18999, line_total: 18999 },
  { id: '2',  product_name: 'Sony PlayStation 5 Console — Disc Edition',          quantity: 1, unit_price:  9999, line_total:  9999 },
  { id: '3',  product_name: 'Apple AirPods Pro (2nd Gen) — White',                quantity: 2, unit_price:  5499, line_total: 10998 },
  { id: '4',  product_name: 'LG 27" UltraGear Gaming Monitor — Black',            quantity: 1, unit_price:  7299, line_total:  7299 },
  { id: '5',  product_name: 'Logitech MX Master 3S Wireless Mouse — Graphite',   quantity: 1, unit_price:  1899, line_total:  1899 },
  { id: '6',  product_name: 'Logitech MX Keys Advanced Keyboard — Space Grey',   quantity: 1, unit_price:  2499, line_total:  2499 },
  { id: '7',  product_name: 'Samsung T7 Portable SSD 1TB — Deep Blue',           quantity: 2, unit_price:  1299, line_total:  2598 },
  { id: '8',  product_name: 'Anker 737 Power Bank 24000mAh — Black',             quantity: 1, unit_price:  1599, line_total:  1599 },
  { id: '9',  product_name: 'TP-Link Deco XE75 WiFi 6E Mesh System (3-pack)',    quantity: 1, unit_price:  4999, line_total:  4999 },
  { id: '10', product_name: 'Jabra Evolve2 85 Wireless Headset — Black',         quantity: 1, unit_price:  6799, line_total:  6799 },
  { id: '11', product_name: 'GoPro HERO12 Black Action Camera',                  quantity: 1, unit_price:  7499, line_total:  7499 },
  { id: '12', product_name: 'DJI Mini 4 Pro Drone — Grey',                       quantity: 1, unit_price: 14999, line_total: 14999 },
  { id: '13', product_name: 'Apple Watch Series 9 45mm — Midnight Aluminium',    quantity: 1, unit_price: 11999, line_total: 11999 },
  { id: '14', product_name: 'Sonos Era 300 Smart Speaker — Black',               quantity: 2, unit_price:  8999, line_total: 17998 },
  { id: '15', product_name: 'LG C3 55" OLED evo TV — Black',                    quantity: 1, unit_price: 22999, line_total: 22999 },
  { id: '16', product_name: 'Razer BlackShark V2 Pro Wireless Headset',          quantity: 1, unit_price:  3499, line_total:  3499 },
  { id: '17', product_name: 'Elgato Stream Deck MK.2 — Black',                  quantity: 1, unit_price:  2199, line_total:  2199 },
  { id: '18', product_name: 'Philips Hue Starter Kit E27 (4 bulbs + Bridge)',    quantity: 1, unit_price:  1999, line_total:  1999 },
  { id: '19', product_name: 'Belkin 3-in-1 MagSafe Wireless Charger — Black',   quantity: 2, unit_price:  1499, line_total:  2998 },
  { id: '20', product_name: 'SteelSeries Arctis Nova Pro Wireless Headset',      quantity: 1, unit_price:  5999, line_total:  5999 },
  { id: '21', product_name: 'HDMI 2.1 Cable 3m — Braided Black',                quantity: 3, unit_price:   299, line_total:   897 },
  { id: '22', product_name: 'Samsung 970 EVO Plus NVMe SSD 2TB',                quantity: 1, unit_price:  2799, line_total:  2799 },
  { id: '23', product_name: 'Corsair Vengeance RGB 32GB DDR5 Kit (2x16GB)',     quantity: 1, unit_price:  3299, line_total:  3299 },
  { id: '24', product_name: 'ASUS ROG Strix GeForce RTX 4070 Super 12GB',       quantity: 1, unit_price: 16999, line_total: 16999 },
  { id: '25', product_name: 'Noctua NH-D15 CPU Cooler — Chromax Black',         quantity: 1, unit_price:  1799, line_total:  1799 },
]

const subtotal    = DEMO_ITEMS.reduce((s, i) => s + i.line_total, 0)
const shippingFee = 0
const total       = subtotal + shippingFee

export function ReceiptDemo() {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:py-0">

      {/* Actions */}
      <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between print:hidden">
        <Link to="/admin/orders" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
          Back to orders
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 italic">Demo — 25 products</span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Receipt */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg print:shadow-none print:rounded-none px-10 py-10 print:px-8 print:py-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900">RECEIPT</h1>
            <p className="text-sm text-gray-500 mt-2">Receipt #: CW-2026-8842</p>
            <p className="text-sm text-gray-500 mt-0.5">Date: 8 May 2026, 14:32</p>
          </div>
          <div className="text-right">
            <img src={LOGO_URL} alt="CW Electronics" className="h-12 object-contain ml-auto block" />
            <p className="text-xs font-bold text-gray-900 mt-1 tracking-wide">CW Electronics</p>
          </div>
        </div>

        <hr className="border-gray-200 my-7" />

        {/* Customer / Fulfillment */}
        <div className="grid grid-cols-2 gap-8 mb-7">
          <div>
            <p className="text-sm font-bold text-gray-900 mb-2">Customer</p>
            <p className="font-semibold text-gray-900">John Smith</p>
            <p className="text-sm text-gray-600 mt-0.5">john.smith@email.com</p>
            <p className="text-sm text-gray-600">071 234 5678</p>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 mb-2">Fulfillment</p>
            <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">DELIVERY</p>
            <div className="mt-2 space-y-0.5">
              <p className="text-sm text-gray-600">123 Main Street</p>
              <p className="text-sm text-gray-600">Johannesburg</p>
              <p className="text-sm text-gray-600">Gauteng</p>
              <p className="text-sm text-gray-600">2001</p>
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
            {DEMO_ITEMS.map((item) => (
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
              <span>Subtotal</span>
              <span>R {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? 'FREE' : `R ${(shippingFee as number).toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-black text-gray-900 text-lg border-t-2 border-gray-900 pt-3 mt-1">
              <span>Total</span>
              <span>R {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 mt-10 pt-5 flex items-start justify-between">
          <p className="text-xs text-gray-400 leading-relaxed">
            CW Electronics · China Mart, Shop C15, Crown Mines, Johannesburg<br />
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
