import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ShoppingCart, ArrowLeft, Package, Loader2,
  MessageCircle, Truck, Shield, RotateCcw, BadgeCheck, Zap, TrendingDown,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import SEO from '../../components/SEO'
import { useProduct } from '../../hooks/useProduct'
import { useCart } from '../../context/CartContext'
import { useLang } from '../../context/LangContext'

const WHATSAPP_NUMBER = '27000000000'

export function ProductDetailWholesale() {
  const { slug } = useParams<{ slug: string }>()
  const { product, loading, error } = useProduct(slug ?? '')
  const { addItem } = useCart()
  const { lang } = useLang()
  const [qty, setQtyInput] = useState(product?.bulk_min_qty ?? 6)
  const [activeImage, setActiveImage] = useState(0)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-[#DC2626]" />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96 text-neutral-400 gap-4">
          <Package className="w-12 h-12" />
          <p>Product not found</p>
          <Link to="/shop" className="text-[#DC2626] text-sm font-bold hover:underline">
            ← Back to shop
          </Link>
        </div>
      </div>
    )
  }

  const name = lang === 'zh' && product.name_zh ? product.name_zh : product.name
  const description = lang === 'zh' && product.description_zh ? product.description_zh : product.description
  const images = product.images.length > 0 ? product.images : [product.thumbnail_url ?? '']
  
  const retailPrice = product.retail_price
  const bulkPrice = product.bulk_price || retailPrice
  const bulkMinQty = product.bulk_min_qty || 6
  const savingsPct = Math.round((1 - bulkPrice / retailPrice) * 100)
  const savingsPerUnit = retailPrice - bulkPrice
  const totalPrice = bulkPrice * qty
  const totalSavings = savingsPerUnit * qty

  function handleAddToCart() {
    addItem({
      productId: product!.id,
      name: product!.name,
      price: bulkPrice,
      quantity: qty,
      image: product!.thumbnail_url ?? '',
      orderType: 'bulk',
    })
  }

  const waMessage = `Bulk enquiry: ${product.name} - Qty: ${qty} units @ R${bulkPrice.toFixed(2)}/unit = R${totalPrice.toFixed(2)} total`
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <SEO
        title={`${product.name} — Wholesale | CXX Electronics`}
        description={description ? description.slice(0, 160) : `Wholesale pricing on ${product.name}. Bulk discounts from ${bulkMinQty}+ units in Johannesburg.`}
        image={images[0] || undefined}
        url={`https://cxx-electronics.co.za/shop/wholesale/${product.slug}`}
        type="product"
      />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Back button */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14"
        >
          {/* ── Gallery (left) ──────────────────────────── */}
          <div className="flex flex-col gap-3">
            {/* Main image */}
            <div className="relative aspect-square bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 group">
              <img
                src={images[activeImage] || '/placeholder.svg'}
                alt={name}
                className="w-full h-full object-contain p-8"
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-neutral-800 border-2 transition-all ${
                      activeImage === i
                        ? 'border-[#DC2626]'
                        : 'border-neutral-700 hover:border-neutral-600'
                    }`}
                    aria-label={`Image ${i + 1}`}
                  >
                    <img src={url} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info (right) ────────────────────────────── */}
          <div>
            {/* Wholesale badge */}
            <span className="inline-flex items-center gap-1.5 bg-[#DC2626] text-white text-xs font-bold px-3 py-1.5 rounded-lg mb-4 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-white" />
              Wholesale Pricing
            </span>

            {/* Product name */}
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-[1.15] text-balance">
              {name}
            </h1>

            {/* Description */}
            {description && (
              <p className="text-neutral-400 text-sm sm:text-base leading-relaxed mb-8">
                {description}
              </p>
            )}

            {/* Price card - LARGE AND PROMINENT */}
            <div className="bg-gradient-to-br from-[#DC2626] to-[#B91C1C] rounded-xl p-7 sm:p-8 mb-8 relative overflow-hidden">
              {/* Decorative accent */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
              
              <p className="text-white/90 text-sm font-semibold uppercase tracking-wider mb-2">
                Unit Price (Bulk Order)
              </p>
              <p className="text-5xl sm:text-6xl font-bold text-white mb-4">
                R{bulkPrice.toFixed(2)}
              </p>
              <p className="text-white/90 font-medium mb-6 text-base">
                per unit for {bulkMinQty}+ units
              </p>

              {/* Savings messaging */}
              <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <TrendingDown className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-sm">
                      You save <span className="text-lg">R{savingsPerUnit.toFixed(2)}</span> per unit
                    </p>
                    <p className="text-white/80 text-xs mt-1">
                      ({savingsPct}% off retail price of R{retailPrice.toFixed(2)})
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Minimum order info */}
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-4 mb-8">
              <p className="text-white font-semibold text-sm mb-1">Minimum Order Quantity</p>
              <p className="text-2xl font-bold text-[#DC2626]">{bulkMinQty} units</p>
            </div>

            {/* Quantity input - LARGE AND EDITABLE */}
            <div className="mb-8">
              <label className="block text-white font-semibold text-sm mb-3">
                How many units do you need?
              </label>
              <div className="flex gap-3 items-center">
                <button
                  onClick={() => setQtyInput(Math.max(bulkMinQty, qty - 5))}
                  className="flex items-center justify-center w-11 h-11 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors border border-neutral-700"
                  aria-label="Decrease by 5"
                >
                  −5
                </button>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQtyInput(Math.max(bulkMinQty, parseInt(e.target.value) || bulkMinQty))}
                  className="flex-1 text-center text-white bg-neutral-900 border-2 border-neutral-700 focus:border-[#DC2626] rounded-lg px-4 py-3 text-lg font-bold focus:outline-none"
                  min={bulkMinQty}
                />
                <button
                  onClick={() => setQtyInput(qty + 5)}
                  className="flex items-center justify-center w-11 h-11 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors border border-neutral-700"
                  aria-label="Increase by 5"
                >
                  +5
                </button>
              </div>
            </div>

            {/* Total calculation - DYNAMIC AND PROMINENT */}
            <div className="bg-neutral-900 border-2 border-[#DC2626] rounded-xl p-6 mb-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-sm">{qty} units × R{bulkPrice.toFixed(2)}</span>
                  <span className="text-2xl font-bold text-white">R{totalPrice.toFixed(2)}</span>
                </div>
                <div className="border-t border-neutral-800 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#DC2626] font-semibold">Total Savings:</span>
                    <span className="text-2xl font-bold text-[#DC2626]">R{totalSavings.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    vs retail price of R{(retailPrice * qty).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 mb-8">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold py-4 rounded-lg transition-all text-base sm:text-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart · R{totalPrice.toFixed(2)}
              </motion.button>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-4 rounded-lg transition-colors border border-neutral-700 text-base"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                Send Quote Request on WhatsApp
              </a>
            </div>

            {/* Persuasive text */}
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-5 mb-8">
              <p className="text-white text-sm font-semibold mb-2">💡 Order in larger quantities to maximize savings!</p>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Get better per-unit rates on orders larger than {bulkMinQty} units. Contact our wholesale team for custom pricing on bulk orders of 50+ units.
              </p>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-2 gap-3 pt-5 border-t border-neutral-800">
              {[
                { icon: Truck, label: 'Fast Delivery', sub: 'Nationwide SA' },
                { icon: Shield, label: 'Warranty', sub: '12 months' },
                { icon: RotateCcw, label: 'Easy Returns', sub: '7-day policy' },
                { icon: BadgeCheck, label: 'Quality', sub: 'Direct importer' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-[#DC2626]/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#DC2626]/20">
                    <Icon className="w-4 h-4 text-[#DC2626]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white leading-tight">{label}</p>
                    <p className="text-[11px] text-neutral-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
