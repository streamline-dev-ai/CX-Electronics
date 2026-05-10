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
import { ProductCardLight } from '../../components/store/ProductCardLight'
import { ProductSpecifications } from '../../components/store/ProductSpecifications'
import { FrequentlyBoughtTogether } from '../../components/store/FrequentlyBoughtTogether'
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
    const useWholesale = product!.is_bulk_available && product!.bulk_price && qty >= (product!.bulk_min_qty ?? Infinity)
    const activePrice = useWholesale ? product!.bulk_price! : product!.retail_price
    addItem({
      productId: product!.id,
      name: product!.name,
      price: activePrice,
      quantity: qty,
      image: product!.thumbnail_url ?? '',
      orderType: useWholesale ? 'bulk' : 'retail',
      categorySlug: product!.categories?.slug,
    })
  }

  const waMessage = `Bulk enquiry: ${product.name}${product.bulk_min_qty ? ` (min. ${product.bulk_min_qty} units)` : ''}. Bulk price: R${product.bulk_price?.toFixed(2) ?? 'TBD'}.`
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`

  // Build fallback specs for products that don't yet have specifications JSONB
  const fallbackSpecs = [
    product.categories && { label: 'Category', value: product.categories.name },
    { label: 'SKU', value: product.slug.toUpperCase().slice(0, 12) },
    { label: 'Stock', value: product.stock_status === 'in_stock' ? 'Available' : product.stock_status === 'on_order' ? 'On Order' : 'Out of Stock' },
    product.is_bulk_available && { label: 'Wholesale Available', value: 'Yes' },
    product.bulk_min_qty && { label: 'Min Wholesale Qty', value: `${product.bulk_min_qty} units` },
    { label: 'Warranty', value: '12 Months' },
    { label: 'Shipping', value: 'Same-day in Gauteng · 2-4 days nationwide' },
  ].filter(Boolean) as { label: string; value: string }[]

  // Render description text with paragraph + bullet-point support
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
        title={`${product.name} | CW Electronics`}
        description={product.description ? product.description.slice(0, 160) : `Buy ${product.name} at the best price in Johannesburg. Fast delivery across South Africa.`}
        image={images[0] || undefined}
        url={`https://cw-electronics.co.za/shop/${product.slug}`}
        type="product"
      />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6">
          <Link to="/shop" className="flex items-center gap-1 hover:text-[#E63939] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Shop
          </Link>
          {product.categories && (
            <>
              <span>/</span>
              <Link to={`/shop?category=${product.categories.slug}`} className="hover:text-[#E63939] transition-colors">
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
                        className={`flex-shrink-0 w-16 h-16 sm:w-full sm:h-20 rounded-xl overflow-hidden bg-white border-2 transition-all ${
                          activeImage === i
                            ? 'border-[#E63939] ring-2 ring-[#E63939]/20'
                            : 'border-gray-200 hover:border-gray-300'
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

                  {product.featured && (
                    <span className="absolute top-4 left-4 bg-[#E63939] text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">
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
                className="text-xs font-bold text-[#E63939] uppercase tracking-widest hover:underline"
              >
                {product.categories.name}
              </Link>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2 mb-4 leading-[1.15] text-balance">
              {name}
            </h1>

            {/* Rating + stock */}
            <div className="flex items-center gap-4 mb-5 flex-wrap">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                  />
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

            {/* Price block: Retail + Bulk side-by-side */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Retail */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <p className="text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-1">Retail</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-none">
                  R{product.retail_price.toFixed(2)}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">Single unit</p>
              </div>

              {/* Bulk */}
              {product.is_bulk_available && product.bulk_price ? (
                <div className="relative bg-[#E63939] rounded-2xl p-4 text-white shadow-lg shadow-[#E63939]/30">
                  {bulkSavingsPct > 0 && (
                    <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      -{bulkSavingsPct}%
                    </span>
                  )}
                  <p className="text-[11px] uppercase tracking-widest text-white/80 font-bold mb-1">
                    Wholesale ({product.bulk_min_qty}+ units)
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold leading-none">
                    R{product.bulk_price.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-white/80 mt-1">per unit</p>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-2xl p-4">
                  <p className="text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-1">Wholesale</p>
                  <p className="text-base font-bold text-gray-700 leading-tight">Contact for quote</p>
                </div>
              )}
            </div>

            {/* Wholesale progress bar */}
            {product.is_bulk_available && product.bulk_price && product.bulk_min_qty && (
              <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
                {qty >= product.bulk_min_qty ? (
                  <p className="text-sm font-bold text-emerald-600">
                    ✓ Wholesale price unlocked — save {bulkSavingsPct}%
                  </p>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      Buy {product.bulk_min_qty}+ units to unlock wholesale price —{' '}
                      <span className="text-[#E63939] font-bold">save {bulkSavingsPct}%</span>
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5">
                      <div
                        className="bg-[#E63939] h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((qty / product.bulk_min_qty) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Add {product.bulk_min_qty - qty} more unit{product.bulk_min_qty - qty !== 1 ? 's' : ''} for wholesale pricing
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4 mb-6">
                {product.variants.map((variant) => {
                  const isColor = /colou?r/i.test(variant.name)
                  return (
                    <div key={variant.name}>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        {variant.name}
                        {selectedVariants[variant.name] && (
                          <span className="ml-2 text-gray-700 normal-case font-semibold tracking-normal">
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
                                  active ? 'border-[#E63939] scale-110 ring-2 ring-[#E63939]/30' : 'border-gray-300 hover:border-gray-500'
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
                                  ? 'border-[#E63939] bg-[#FEE9E9] text-[#E63939]'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-400'
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
                <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-3 sm:px-4 py-3 hover:bg-gray-50 text-gray-600 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-bold text-gray-900 min-w-[2.5rem] text-center">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="px-3 sm:px-4 py-3 hover:bg-gray-50 text-gray-600 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#E63939]/30 text-sm sm:text-base"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart · R{(
                    (product.is_bulk_available && product.bulk_price && qty >= (product.bulk_min_qty ?? Infinity)
                      ? product.bulk_price
                      : product.retail_price) * qty
                  ).toFixed(2)}
                </motion.button>
              </div>
            )}

            {isOutOfStock && (
              <div className="py-3 px-4 bg-red-50 text-red-700 rounded-xl text-sm font-bold mb-3 text-center">
                Currently Out of Stock — {lang === 'zh' ? '请稍后再来' : 'Contact us for ETA'}
              </div>
            )}

            {/* Wishlist button */}
            <button
              onClick={() => product && toggle(product.id)}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all mb-3 ${
                inWishlist
                  ? 'border-[#E63939] bg-[#FEE9E9] text-[#E63939]'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-[#E63939]' : ''}`} />
              {inWishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
            </button>

            {/* Bulk Quote CTA */}
            {product.is_bulk_available && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#111827] hover:bg-[#0a1018] text-white font-bold py-3 rounded-xl transition-all border border-[#111827] hover:border-[#E63939] text-sm sm:text-base mb-6"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                Wholesale Enquiry · WhatsApp
              </a>
            )}

            {/* Trust strip */}
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

        <FrequentlyBoughtTogether
          currentProductId={product.id}
          categorySlug={product.categories?.slug}
          currentProductName={product.name}
          currentProductPrice={product.retail_price}
          currentProductImage={product.thumbnail_url ?? ''}
        />

        {/* ── Tabs: Description + Specifications ─────────── */}
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
                  <motion.span
                    layoutId="active-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E63939]"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            {tab === 'description' ? (
              <div className="max-w-none">
                {description ? (
                  renderDescription(description)
                ) : (
                  <p className="text-sm text-gray-400 italic">No description available for this product yet.</p>
                )}
              </div>
            ) : (
              /* Use rich accordion if specifications exist, otherwise fallback table */
              product.specifications && product.specifications.length > 0 ? (
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
              )
            )}
          </div>
        </div>

        {/* ── Related Products ────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="mt-12 lg:mt-16">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-[#E63939] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 fill-[#E63939]" />
                  You might also like
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Related Products</h2>
              </div>
              <Link
                to={`/shop${product.categories ? `?category=${product.categories.slug}` : ''}`}
                className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-[#E63939] hover:gap-2 transition-all"
              >
                View all <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {relatedProducts.map((p) => (
                <ProductCardLight key={p.id} product={p} basePath="/shop" />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  )
}
