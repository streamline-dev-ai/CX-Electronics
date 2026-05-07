import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  ShoppingCart, Minus, Plus, ArrowLeft, Package, Loader2, Star,
  MessageCircle, Truck, Shield, RotateCcw, BadgeCheck, Zap, Heart,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import { ProductCard } from '../../components/store/ProductCard'
import SEO from '../../components/SEO'
import { useProduct } from '../../hooks/useProduct'
import { useProducts } from '../../hooks/useProducts'
import { useCart } from '../../context/CartContext'
import { useLang } from '../../context/LangContext'
import { useWishlist } from '../../context/WishlistContext'

const WHATSAPP_NUMBER = '27000000000'

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { product, loading, error } = useProduct(slug ?? '')
  const { addItem } = useCart()
  const { lang } = useLang()
  const { toggle, has } = useWishlist()
  const inWishlist = product ? has(product.id) : false
  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [tab, setTab] = useState<'description' | 'specs'>('description')
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

  // Redirect to group page if this product is part of a variant group
  useEffect(() => {
    if (!product?.variant_group_id) return
    supabase
      .from('product_variant_groups')
      .select('slug')
      .eq('id', product.variant_group_id)
      .single()
      .then(({ data }) => {
        if (data?.slug) {
          navigate(`/shop/group/${data.slug}?variant=${product.slug}`, { replace: true })
        }
      })
  }, [product, navigate])

  // Related products
  const { products: related } = useProducts({
    categorySlug: product?.categories?.slug,
    pageSize: 8,
    sort: 'featured',
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A]">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-[#E63939]" />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#0F172A]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96 text-slate-400 gap-4">
          <Package className="w-12 h-12" />
          <p>Product not found</p>
          <Link to="/shop" className="text-[#E63939] text-sm font-bold hover:underline">
            ← Back to shop
          </Link>
        </div>
      </div>
    )
  }

  const name = lang === 'zh' && product.name_zh ? product.name_zh : product.name
  const description = lang === 'zh' && product.description_zh ? product.description_zh : product.description
  const isOutOfStock = product.stock_status === 'out_of_stock'
  const images = product.images.length > 0 ? product.images : [product.thumbnail_url ?? '']

  const bulkSavingsPct =
    product.is_bulk_available && product.bulk_price
      ? Math.round((1 - product.bulk_price / product.retail_price) * 100)
      : 0

  // Filter related, exclude current product
  const relatedProducts = related.filter((p) => p.id !== product.id).slice(0, 4)

  function handleAddToCart() {
    if (isOutOfStock) return
    addItem({
      productId: product!.id,
      name: product!.name,
      price: product!.retail_price,
      quantity: qty,
      image: product!.thumbnail_url ?? '',
      orderType: 'retail',
    })
  }

  const waMessage = `Bulk enquiry: ${product.name}${product.bulk_min_qty ? ` (min. ${product.bulk_min_qty} units)` : ''}. Bulk price: R${product.bulk_price?.toFixed(2) ?? 'TBD'}.`
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`

  // Build specs (use available + sensible defaults so the table never looks empty)
  const specs = [
    product.categories && { label: 'Category', value: product.categories.name },
    { label: 'SKU', value: product.slug.toUpperCase().slice(0, 12) },
    { label: 'Stock', value: product.stock_status === 'in_stock' ? 'Available' : product.stock_status === 'on_order' ? 'On Order' : 'Out of Stock' },
    product.is_bulk_available && { label: 'Bulk Available', value: 'Yes' },
    product.bulk_min_qty && { label: 'Min Bulk Qty', value: `${product.bulk_min_qty} units` },
    { label: 'Warranty', value: '12 Months' },
    { label: 'Shipping', value: 'Same-day in Gauteng · 2-4 days nationwide' },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <SEO
        title={`${product.name} | CW Electronics`}
        description={product.description ? product.description.slice(0, 160) : `Buy ${product.name} at the best price in Johannesburg. Fast delivery across South Africa.`}
        image={images[0] || undefined}
        url={`https://cw-electronics.co.za/shop/${product.slug}`}
        type="product"
      />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-neutral-400 mb-6">
          <Link to="/shop" className="flex items-center gap-1 hover:text-[#DC2626] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Shop
          </Link>
          {product.categories && (
            <>
              <span>/</span>
              <Link to={`/shop?category=${product.categories.slug}`} className="hover:text-[#DC2626] transition-colors">
                {product.categories.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-neutral-300 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
        >
          {/* ── Gallery (left) ──────────────────────────── */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-12 gap-3">
              {/* Thumbnails (vertical on lg) */}
              {images.length > 1 && (
                <div className="col-span-12 sm:col-span-2 order-2 sm:order-1">
                  <div className="flex sm:flex-col gap-2 sm:max-h-[560px] overflow-x-auto sm:overflow-y-auto">
                    {images.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`flex-shrink-0 w-16 h-16 sm:w-full sm:h-20 rounded-xl overflow-hidden bg-neutral-800 border-2 transition-all ${
                          activeImage === i
                            ? 'border-[#DC2626] ring-2 ring-[#DC2626]/20'
                            : 'border-neutral-700 hover:border-neutral-600'
                        }`}
                        aria-label={`Image ${i + 1}`}
                      >
                        <img src={url || '/placeholder.svg'} alt="" className="w-full h-full object-contain p-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Main image */}
              <div className={`col-span-12 ${images.length > 1 ? 'sm:col-span-10' : ''} order-1 sm:order-2`}>
                <div className="relative aspect-square bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 group">
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

                  {product.featured && (
                    <span className="absolute top-4 left-4 bg-[#DC2626] text-white text-xs font-semibold px-3 py-1 rounded-md uppercase tracking-wider">
                      Best Seller
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Info (right) ────────────────────────────── */}
          <div className="lg:col-span-5">
            {product.categories && (
              <Link
                to={`/shop?category=${product.categories.slug}`}
                className="text-xs font-semibold text-[#DC2626] uppercase tracking-widest hover:underline"
              >
                {product.categories.name}
              </Link>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-2 mb-4 leading-[1.15] text-balance">
              {name}
            </h1>

            {/* Rating + stock */}
            <div className="flex items-center gap-4 mb-5 flex-wrap">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'text-neutral-600'}`}
                  />
                ))}
                <span className="text-xs text-neutral-400 ml-1.5 font-medium">4.0 (24 reviews)</span>
              </div>
              <span className="text-neutral-600">|</span>
              <span
                className={`text-xs px-2.5 py-1 rounded-md font-semibold uppercase tracking-wider ${
                  product.stock_status === 'in_stock'
                    ? 'bg-emerald-900/30 text-emerald-400'
                    : product.stock_status === 'on_order'
                    ? 'bg-amber-900/30 text-amber-400'
                    : 'bg-red-900/30 text-red-400'
                }`}
              >
                {product.stock_status === 'in_stock' ? 'In Stock' : product.stock_status === 'on_order' ? 'On Order' : 'Out of Stock'}
              </span>
            </div>

            {/* Price block: Retail + Bulk side-by-side */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Retail */}
              <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4">
                <p className="text-[11px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">Retail</p>
                <p className="text-2xl sm:text-3xl font-bold text-white leading-none">
                  R{product.retail_price.toFixed(2)}
                </p>
                <p className="text-[11px] text-neutral-400 mt-1">Single unit</p>
              </div>

              {/* Bulk */}
              {product.is_bulk_available && product.bulk_price ? (
                <div className="relative bg-[#DC2626] rounded-xl p-4 text-white">
                  {bulkSavingsPct > 0 && (
                    <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Save {bulkSavingsPct}%
                    </span>
                  )}
                  <p className="text-[11px] uppercase tracking-widest text-white/90 font-semibold mb-1">
                    Bulk ({product.bulk_min_qty}+)
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold leading-none">
                    R{product.bulk_price.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-white/90 mt-1">per unit</p>
                </div>
              ) : (
                <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
                  <p className="text-[11px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">Bulk</p>
                  <p className="text-base font-semibold text-neutral-300 leading-tight">Contact for quote</p>
                </div>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4 mb-6">
                {product.variants.map((variant) => {
                  const isColor = /colou?r/i.test(variant.name)
                  return (
                    <div key={variant.name}>
                      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">
                        {variant.name}
                        {selectedVariants[variant.name] && (
                          <span className="ml-2 text-neutral-300 normal-case font-semibold tracking-normal">
                            — {selectedVariants[variant.name]}
                          </span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {variant.options.map((opt) => {
                          const active = selectedVariants[variant.name] === opt
                          if (isColor) {
                            return (
                              <button
                                key={opt}
                                onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.name]: opt }))}
                                title={opt}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${
                                  active ? 'border-[#DC2626] scale-110 ring-2 ring-[#DC2626]/30' : 'border-neutral-600 hover:border-neutral-500'
                                }`}
                                style={{ backgroundColor: opt.toLowerCase() }}
                              />
                            )
                          }
                          return (
                            <button
                              key={opt}
                              onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.name]: opt }))}
                              className={`px-3 py-1.5 text-sm font-semibold rounded-lg border-2 transition-all ${
                                active
                                  ? 'border-[#DC2626] bg-[#DC2626]/10 text-[#DC2626]'
                                  : 'border-neutral-700 text-neutral-300 hover:border-neutral-600'
                              }`}
                            >
                              {opt}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Quantity + Add to cart */}
            {!isOutOfStock && (
              <div className="flex items-stretch gap-3 mb-3">
                <div className="flex items-center bg-neutral-900 border border-neutral-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-3 sm:px-4 py-3 hover:bg-neutral-800 text-neutral-400 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-bold text-white min-w-[2.5rem] text-center">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="px-3 sm:px-4 py-3 hover:bg-neutral-800 text-neutral-400 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold py-3 rounded-lg transition-all text-sm sm:text-base"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart · R{(product.retail_price * qty).toFixed(2)}
                </motion.button>
              </div>
            )}

            {isOutOfStock && (
              <div className="py-3 px-4 bg-red-900/20 text-red-400 rounded-lg text-sm font-semibold mb-3 text-center border border-red-800">
                Currently Out of Stock — {lang === 'zh' ? '请稍后再来' : 'Contact us for ETA'}
              </div>
            )}

            {/* Wishlist button */}
            <button
              onClick={() => product && toggle(product.id)}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all mb-3 ${
                inWishlist
                  ? 'border-[#DC2626] bg-[#DC2626]/10 text-[#DC2626]'
                  : 'border-neutral-700 text-neutral-400 hover:border-neutral-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-[#DC2626]' : ''}`} />
              {inWishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
            </button>

            {/* Bulk Quote CTA */}
            {product.is_bulk_available && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-3 rounded-lg transition-all border border-neutral-700 hover:border-[#DC2626] text-sm sm:text-base mb-6"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                Add to Bulk Quote · WhatsApp
              </a>
            )}

            {/* Trust strip */}
            <div className="grid grid-cols-2 gap-3 pt-5 border-t border-neutral-800">
              {[
                { icon: Truck, label: 'Fast Delivery', sub: 'Nationwide SA' },
                { icon: Shield, label: '12-Month Warranty', sub: 'On all products' },
                { icon: RotateCcw, label: 'Easy Returns', sub: '7-day policy' },
                { icon: BadgeCheck, label: 'Quality Tested', sub: 'Direct importer' },
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

        {/* ── Tabs: Description + Specs ───────────────────── */}
        <div className="mt-12 lg:mt-16 bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
          <div className="border-b border-neutral-800 flex">
            {([
              { key: 'description', label: 'Description' },
              { key: 'specs', label: 'Specifications' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-6 py-4 text-sm font-semibold transition-colors relative ${
                  tab === key ? 'text-[#DC2626]' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {label}
                {tab === key && (
                  <motion.span
                    layoutId="active-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DC2626]"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            {tab === 'description' ? (
              <div className="prose prose-sm max-w-none text-neutral-400 leading-relaxed">
                {description ? (
                  <p>{description}</p>
                ) : (
                  <p className="text-neutral-500 italic">No description available for this product yet.</p>
                )}
              </div>
            ) : (
              <table className="w-full">
                <tbody>
                  {specs.map((row, i) => (
                    <tr key={row.label} className={i % 2 === 0 ? 'bg-neutral-800/50' : ''}>
                      <td className="px-4 py-3 text-sm font-semibold text-white w-1/3">{row.label}</td>
                      <td className="px-4 py-3 text-sm text-neutral-400">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Related Products ────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="mt-12 lg:mt-16">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-semibold text-[#DC2626] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 fill-[#DC2626]" />
                  You might also like
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Related Products</h2>
              </div>
              <Link
                to={`/shop${product.categories ? `?category=${product.categories.slug}` : ''}`}
                className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[#DC2626] hover:gap-2 transition-all"
              >
                View all <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} basePath="/shop" />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  )
}
