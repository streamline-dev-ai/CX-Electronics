import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ShoppingCart, Minus, Plus, ArrowLeft, Package, Loader2, Star,
  MessageCircle, Truck, Shield, RotateCcw, BadgeCheck, TrendingDown,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import { ProductCardLight } from '../../components/store/ProductCardLight'
import { ProductSpecifications } from '../../components/store/ProductSpecifications'
import SEO from '../../components/SEO'
import { useProduct } from '../../hooks/useProduct'
import { useProducts } from '../../hooks/useProducts'
import { useCart } from '../../context/CartContext'
import { useLang } from '../../context/LangContext'
import { getWholesalePrice, getWholesaleMinQty, getWholesaleSavingsPct } from '../../lib/wholesale'

const WHATSAPP_NUMBER = '27649533333'

export function BulkProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { product, loading, error } = useProduct(slug ?? '')
  const { addItem } = useCart()
  const { lang } = useLang()

  // Start at the wholesale min qty
  const [qty, setQty] = useState(6)
  const [activeImage, setActiveImage] = useState(0)
  const [tab, setTab] = useState<'description' | 'specs'>('description')

  const { products: related } = useProducts({
    categorySlug: product?.categories?.slug,
    pageSize: 8,
    sort: 'featured',
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-[#E63939]" />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96 text-gray-400 gap-4">
          <Package className="w-12 h-12" />
          <p>Product not found</p>
          <Link to="/wholesale" className="text-[#E63939] text-sm font-bold hover:underline">
            ← Back to wholesale
          </Link>
        </div>
      </div>
    )
  }

  const name = lang === 'zh' && product.name_zh ? product.name_zh : product.name
  const description = lang === 'zh' && product.description_zh ? product.description_zh : product.description
  const isOutOfStock = product.stock_status === 'out_of_stock'
  const images = product.images.length > 0 ? product.images : [product.thumbnail_url ?? '']

  const wholesalePrice = getWholesalePrice(product)
  const wholesaleMinQty = getWholesaleMinQty(product)
  const savingsPct = getWholesaleSavingsPct(product.retail_price, wholesalePrice)
  const savingsPerUnit = product.retail_price - wholesalePrice
  const meetsMin = qty >= wholesaleMinQty
  const unitsNeeded = Math.max(0, wholesaleMinQty - qty)
  const totalPrice = wholesalePrice * qty
  const totalSaved = savingsPerUnit * qty

  const relatedProducts = related.filter((p) => p.id !== product.id).slice(0, 4)

  function handleAddToCart() {
    if (isOutOfStock || !meetsMin) return
    addItem({
      productId: product!.id,
      name: product!.name,
      price: wholesalePrice,
      quantity: qty,
      image: product!.thumbnail_url ?? '',
      orderType: 'bulk',
      bulkMinQty: wholesaleMinQty,
      categorySlug: product!.categories?.slug,
    })
  }

  const waMessage = `Wholesale enquiry: ${product.name} — ${qty}+ units @ R${wholesalePrice.toFixed(2)}/unit. Total ≈ R${totalPrice.toFixed(2)}.`
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`

  const fallbackSpecs = [
    product.categories && { label: 'Category', value: product.categories.name },
    { label: 'SKU', value: product.slug.toUpperCase().slice(0, 12) },
    { label: 'Stock', value: product.stock_status === 'in_stock' ? 'Available' : product.stock_status === 'on_order' ? 'On Order' : 'Out of Stock' },
    { label: 'Wholesale Min Qty', value: `${wholesaleMinQty} units` },
    { label: 'Wholesale Price', value: `R${wholesalePrice.toFixed(2)} / unit` },
    { label: 'Retail Price', value: `R${product.retail_price.toFixed(2)} / unit` },
    { label: 'Warranty', value: '12 Months' },
    { label: 'Shipping', value: 'Same-day in Gauteng · 2-4 days nationwide' },
  ].filter(Boolean) as { label: string; value: string }[]

  function renderDescription(text: string) {
    const blocks = text.split(/\n\n+/)
    return (
      <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
        {blocks.map((block, i) => {
          const lines = block.split('\n').filter(Boolean)
          const hasLabel = lines[0]?.startsWith('**') && lines[0]?.endsWith('**')
          const hasBullets = lines.some((l) => l.trim().startsWith('•'))
          if (hasBullets || hasLabel) {
            return (
              <div key={i} className="space-y-1.5">
                {lines.map((line, j) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <p key={j} className="font-bold text-gray-800 text-xs uppercase tracking-widest mt-3 mb-1">
                        {line.replace(/\*\*/g, '')}
                      </p>
                    )
                  }
                  if (line.trim().startsWith('•')) {
                    return (
                      <div key={j} className="flex gap-2.5 items-start pl-1">
                        <span className="text-[#E63939] font-bold mt-px flex-shrink-0 text-base leading-none">·</span>
                        <span>{line.replace(/^[\s•]+/, '')}</span>
                      </div>
                    )
                  }
                  return line.trim() ? <p key={j}>{line}</p> : null
                })}
              </div>
            )
          }
          return <p key={i}>{block}</p>
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={`${product.name} — Wholesale | CW Electronics`}
        description={`Wholesale pricing on ${product.name}. Min ${wholesaleMinQty} units at R${wholesalePrice.toFixed(2)} each — save ${savingsPct}% on retail.`}
        image={images[0] || undefined}
        url={`https://cw-electronics.co.za/bulk/${product.slug}`}
        type="product"
      />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6">
          <Link to="/wholesale" className="flex items-center gap-1 hover:text-[#E63939] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Wholesale
          </Link>
          {product.categories && (
            <>
              <span>/</span>
              <Link to={`/wholesale?category=${product.categories.slug}`} className="hover:text-[#E63939] transition-colors">
                {product.categories.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-700 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
        >
          {/* Gallery */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-12 gap-3">
              {images.length > 1 && (
                <div className="col-span-12 sm:col-span-2 order-2 sm:order-1">
                  <div className="flex sm:flex-col gap-2 sm:max-h-[560px] overflow-x-auto sm:overflow-y-auto">
                    {images.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`flex-shrink-0 w-16 h-16 sm:w-full sm:h-20 rounded-xl overflow-hidden bg-white border-2 transition-all ${
                          activeImage === i ? 'border-[#E63939] ring-2 ring-[#E63939]/20' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        aria-label={`Image ${i + 1}`}
                      >
                        <img src={url || '/placeholder.svg'} alt="" className="w-full h-full object-contain p-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={`col-span-12 ${images.length > 1 ? 'sm:col-span-10' : ''} order-1 sm:order-2`}>
                <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 group">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImage}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      src={images[activeImage] || '/placeholder.svg'}
                      alt={name}
                      className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                    />
                  </AnimatePresence>

                  <span className="absolute top-4 left-4 bg-[#0F172A] text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" /> Wholesale
                  </span>
                  {savingsPct > 0 && (
                    <span className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                      Save {savingsPct}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-5">
            {product.categories && (
              <Link
                to={`/wholesale?category=${product.categories.slug}`}
                className="text-xs font-bold text-[#E63939] uppercase tracking-widest hover:underline"
              >
                {product.categories.name}
              </Link>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2 mb-4 leading-[1.15] text-balance">
              {name}
            </h1>

            <div className="flex items-center gap-4 mb-5 flex-wrap">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                ))}
                <span className="text-xs text-gray-600 ml-1.5 font-medium">4.0 (24 reviews)</span>
              </div>
              <span className="text-gray-300">|</span>
              <span
                className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${
                  product.stock_status === 'in_stock'
                    ? 'bg-emerald-50 text-emerald-700'
                    : product.stock_status === 'on_order'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {product.stock_status === 'in_stock' ? 'In Stock' : product.stock_status === 'on_order' ? 'On Order' : 'Out of Stock'}
              </span>
            </div>

            {/* Wholesale price hero card */}
            <div className="relative bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl p-5 mb-5 text-white overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#E63939]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] uppercase tracking-widest text-white/60 font-bold">
                    Wholesale Price · per unit
                  </p>
                  {savingsPct > 0 && (
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {savingsPct}% off
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-4xl font-extrabold text-[#FF6B6B] leading-none">
                    R{wholesalePrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-white/40 line-through">
                    R{product.retail_price.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-white/60">
                  Minimum {wholesaleMinQty} units · Save R{savingsPerUnit.toFixed(2)} per unit
                </p>
              </div>
            </div>

            {/* Min qty gate */}
            {!meetsMin && (
              <div className="mb-5 rounded-xl p-4 bg-amber-50 border border-amber-200">
                <p className="text-sm font-bold text-amber-900 mb-1">
                  Minimum {wholesaleMinQty} units required
                </p>
                <p className="text-xs text-amber-700">
                  Add {unitsNeeded} more unit{unitsNeeded !== 1 ? 's' : ''} to qualify for wholesale pricing.
                </p>
              </div>
            )}

            {/* Quantity */}
            {!isOutOfStock && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Quantity
                </label>
                <div className="flex items-stretch gap-3">
                  <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="px-3 sm:px-4 py-3 hover:bg-gray-50 text-gray-600 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center font-bold text-gray-900 bg-transparent focus:outline-none"
                    />
                    <button
                      onClick={() => setQty((q) => q + 1)}
                      className="px-3 sm:px-4 py-3 hover:bg-gray-50 text-gray-600 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setQty(wholesaleMinQty)}
                    className="text-xs font-bold text-[#E63939] hover:underline"
                  >
                    Set to min ({wholesaleMinQty})
                  </button>
                </div>
              </div>
            )}

            {/* Savings summary panel — total saved, % saved, total price, unit price */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div className="bg-white border border-gray-200 rounded-xl p-3.5">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Unit Price</p>
                <p className="text-xl font-extrabold text-gray-900 leading-none">R{wholesalePrice.toFixed(2)}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-3.5">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Total Price</p>
                <p className="text-xl font-extrabold text-gray-900 leading-none">R{totalPrice.toFixed(2)}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
                <p className="text-[10px] uppercase tracking-widest text-emerald-700 font-bold mb-1">You Save</p>
                <p className="text-xl font-extrabold text-emerald-700 leading-none">R{totalSaved.toFixed(2)}</p>
              </div>
              <div className="bg-[#FEE9E9] border border-[#E63939]/20 rounded-xl p-3.5">
                <p className="text-[10px] uppercase tracking-widest text-[#E63939] font-bold mb-1">% Off / Unit</p>
                <p className="text-xl font-extrabold text-[#E63939] leading-none">{savingsPct}%</p>
              </div>
            </div>

            {/* Actions */}
            {!isOutOfStock && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={!meetsMin}
                className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-all text-sm sm:text-base mb-3 ${
                  meetsMin
                    ? 'bg-[#E63939] hover:bg-[#C82020] text-white shadow-lg shadow-[#E63939]/30'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {meetsMin
                  ? <>Add {qty} to Cart · R{totalPrice.toFixed(2)}</>
                  : <>Add {unitsNeeded} more to unlock wholesale</>
                }
              </motion.button>
            )}

            {isOutOfStock && (
              <div className="py-3 px-4 bg-red-50 text-red-700 rounded-xl text-sm font-bold mb-3 text-center">
                Currently Out of Stock
              </div>
            )}

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold py-3 rounded-xl transition-all border border-[#0F172A] hover:border-[#E63939] text-sm sm:text-base mb-6"
            >
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              Need larger volume? WhatsApp us
            </a>

            <div className="grid grid-cols-2 gap-3 pt-5 border-t border-gray-200">
              {[
                { icon: Truck, label: 'Fast Delivery', sub: 'Nationwide SA' },
                { icon: Shield, label: 'Quality Tested', sub: 'Verified products' },
                { icon: RotateCcw, label: 'Easy Returns', sub: '7-day policy' },
                { icon: BadgeCheck, label: 'Direct Importer', sub: 'Best prices' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-[#FEE9E9] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#E63939]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 leading-tight">{label}</p>
                    <p className="text-[11px] text-gray-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mt-12 lg:mt-16 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 flex">
            {([
              { key: 'description', label: 'Description' },
              { key: 'specs', label: 'Specifications' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-6 py-4 text-sm font-bold transition-colors relative ${
                  tab === key ? 'text-[#E63939]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
                {tab === key && (
                  <motion.span layoutId="active-tab-bulk" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E63939]" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            {tab === 'description' ? (
              <div className="max-w-none">
                {description ? renderDescription(description) : (
                  <p className="text-sm text-gray-400 italic">No description available for this product yet.</p>
                )}
              </div>
            ) : product.specifications && product.specifications.length > 0 ? (
              <div className="-mx-6 sm:-mx-8 -mb-6 sm:-mb-8">
                <ProductSpecifications sections={product.specifications} />
              </div>
            ) : (
              <table className="w-full">
                <tbody>
                  {fallbackSpecs.map((row, i) => (
                    <tr key={row.label} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 w-1/3">{row.label}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <section className="mt-12 lg:mt-16">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-[#E63939] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <TrendingDown className="w-3 h-3" />
                  More wholesale picks
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Related Products</h2>
              </div>
              <Link
                to={`/wholesale${product.categories ? `?category=${product.categories.slug}` : ''}`}
                className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-[#E63939] hover:gap-2 transition-all"
              >
                View all <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {relatedProducts.map((p) => (
                <ProductCardLight key={p.id} product={p} basePath="/bulk" />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  )
}
