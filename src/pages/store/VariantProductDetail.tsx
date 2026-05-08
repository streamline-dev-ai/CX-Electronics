import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import {
  ShoppingCart, Minus, Plus, ArrowLeft, Package, Loader2, Star,
  Truck, Shield, RotateCcw, BadgeCheck, Zap, Heart, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import { ProductCard } from '../../components/store/ProductCard'
import { supabase, getProductImageUrl, type ProductWithCategory, type ProductVariantGroup } from '../../lib/supabase'
import { useProducts } from '../../hooks/useProducts'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'

const FIELD_SELECT = 'id, name, name_zh, slug, description, description_zh, category_id, retail_price, bulk_price, bulk_min_qty, is_bulk_available, images, thumbnail_url, active, featured, stock_status, variants, variant_group_id, variant_label, created_at, updated_at, categories(id, name, name_zh, slug)'

function resolveProduct(data: Record<string, unknown>): ProductWithCategory {
  return {
    ...data,
    thumbnail_url: data.thumbnail_url ? getProductImageUrl(data.thumbnail_url as string, 800) : null,
    images: ((data.images ?? []) as string[]).map((p) => getProductImageUrl(p, 800)),
    categories: Array.isArray(data.categories) ? (data.categories[0] ?? null) : data.categories,
    variants: (data.variants as ProductWithCategory['variants']) ?? [],
  } as ProductWithCategory
}

export function VariantProductDetail() {
  const { groupSlug } = useParams<{ groupSlug: string }>()
  const [searchParams] = useSearchParams()

  const [group, setGroup] = useState<ProductVariantGroup | null>(null)
  const [variants, setVariants] = useState<ProductWithCategory[]>([])
  const [activeVariant, setActiveVariant] = useState<ProductWithCategory | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState<'description' | 'specs'>('description')
  const { addItem } = useCart()
  const { toggle, has } = useWishlist()

  const inWishlist = activeVariant ? has(activeVariant.id) : false

  useEffect(() => {
    if (!groupSlug) return
    let cancelled = false

    async function load() {
      setLoading(true)

      const { data: grp, error: grpErr } = await supabase
        .from('product_variant_groups')
        .select('id, name, slug, created_at')
        .eq('slug', groupSlug!)
        .single()

      if (cancelled) return
      if (grpErr || !grp) { setError('Product group not found'); setLoading(false); return }

      const { data: rows, error: rowErr } = await supabase
        .from('products')
        .select(FIELD_SELECT)
        .eq('variant_group_id', grp.id)
        .eq('active', true)
        .order('variant_label', { ascending: true })

      if (cancelled) return
      if (rowErr) { setError(rowErr.message); setLoading(false); return }

      const resolved = (rows ?? []).map(resolveProduct)
      setGroup(grp)
      setVariants(resolved)

      const variantSlug = searchParams.get('variant')
      const initial = (variantSlug ? resolved.find((v) => v.slug === variantSlug) : null) ?? resolved[0] ?? null
      setActiveVariant(initial)
      setActiveImageIndex(0)
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [groupSlug]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectVariant = useCallback((v: ProductWithCategory) => {
    setActiveVariant(v)
    setActiveImageIndex(0)
    window.history.replaceState(null, '', `/shop/group/${groupSlug}?variant=${v.slug}`)
  }, [groupSlug])

  const images = activeVariant
    ? (activeVariant.images.length > 0 ? activeVariant.images : [activeVariant.thumbnail_url ?? ''])
    : []

  const pricesVary = variants.length > 1 && variants.some((v) => v.retail_price !== variants[0].retail_price)

  // Wholesale price: db bulk_price or auto-calculate at 17.5% off retail
  const wholesalePrice = activeVariant
    ? (activeVariant.is_bulk_available && activeVariant.bulk_price
        ? activeVariant.bulk_price
        : Math.round(activeVariant.retail_price * 0.825 * 100) / 100)
    : 0
  const wholesaleMinQty = activeVariant?.bulk_min_qty ?? 6
  const wholesaleSavingsPct = activeVariant
    ? Math.round((1 - wholesalePrice / activeVariant.retail_price) * 100)
    : 0

  const { products: related } = useProducts({
    categorySlug: activeVariant?.categories?.slug,
    pageSize: 8,
    sort: 'featured',
  })

  const relatedProducts = related
    .filter((p) => !variants.some((v) => v.id === p.id))
    .slice(0, 4)

  function handleAddToCart() {
    if (!activeVariant || activeVariant.stock_status === 'out_of_stock') return
    addItem({
      productId: activeVariant.id,
      name: `${group?.name ?? activeVariant.name}${activeVariant.variant_label ? ` — ${activeVariant.variant_label}` : ''}`,
      price: activeVariant.retail_price,
      quantity: qty,
      image: activeVariant.thumbnail_url ?? '',
      orderType: 'retail',
    })
  }

  function prevImage() {
    setActiveImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  }
  function nextImage() {
    setActiveImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))
  }

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

  if (error || !activeVariant || !group) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96 text-gray-400 gap-4">
          <Package className="w-12 h-12" />
          <p>Product not found</p>
          <Link to="/shop" className="text-[#E63939] text-sm font-bold hover:underline">← Back to shop</Link>
        </div>
      </div>
    )
  }

  const isOutOfStock = activeVariant.stock_status === 'out_of_stock'

  const specs = [
    activeVariant.categories && { label: 'Category', value: activeVariant.categories.name },
    activeVariant.variant_label && { label: 'Variant', value: activeVariant.variant_label },
    { label: 'Stock', value: activeVariant.stock_status === 'in_stock' ? 'Available' : activeVariant.stock_status === 'on_order' ? 'On Order' : 'Out of Stock' },
    { label: 'Quality', value: 'Tested & Verified' },
    { label: 'Shipping', value: 'Same-day in Gauteng · 2-4 days nationwide' },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6">
          <Link to="/shop" className="flex items-center gap-1 hover:text-[#E63939] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Shop
          </Link>
          {activeVariant.categories && (
            <>
              <span>/</span>
              <Link to={`/shop?category=${activeVariant.categories.slug}`} className="hover:text-[#E63939] transition-colors">
                {activeVariant.categories.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-700 truncate max-w-[200px]">{group.name}</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
        >
          {/* ── Gallery ──────────────���─��─────────────────────── */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-12 gap-3">
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="col-span-12 sm:col-span-2 order-2 sm:order-1">
                  <div className="flex sm:flex-col gap-2 sm:max-h-[560px] overflow-x-auto sm:overflow-y-auto">
                    {images.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIndex(i)}
                        className={`flex-shrink-0 w-16 h-16 sm:w-full sm:h-20 rounded-xl overflow-hidden bg-white border-2 transition-all ${
                          activeImageIndex === i
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
                      key={`${activeVariant.id}-${activeImageIndex}`}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      src={images[activeImageIndex] || '/placeholder.svg'}
                      alt={group.name}
                      className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                    />
                  </AnimatePresence>

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {activeVariant.featured && (
                    <span className="absolute top-4 left-4 bg-[#E63939] text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                      Best Seller
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Info ─────────────────────────────────────────── */}
          <div className="lg:col-span-5">
            {activeVariant.categories && (
              <Link
                to={`/shop?category=${activeVariant.categories.slug}`}
                className="text-xs font-bold text-[#E63939] uppercase tracking-widest hover:underline"
              >
                {activeVariant.categories.name}
              </Link>
            )}

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2 mb-1 leading-[1.15] text-balance">
              {group.name}
            </h1>
            {activeVariant.variant_label && (
              <p className="text-sm text-gray-500 mb-4 font-medium">Variant: {activeVariant.variant_label}</p>
            )}

            {/* Rating + stock */}
            <div className="flex items-center gap-4 mb-5 flex-wrap">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                ))}
                <span className="text-xs text-gray-600 ml-1.5 font-medium">4.0 (24 reviews)</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${
                activeVariant.stock_status === 'in_stock' ? 'bg-emerald-50 text-emerald-700'
                  : activeVariant.stock_status === 'on_order' ? 'bg-amber-50 text-amber-700'
                  : 'bg-red-50 text-red-600'
              }`}>
                {activeVariant.stock_status === 'in_stock' ? 'In Stock' : activeVariant.stock_status === 'on_order' ? 'On Order' : 'Out of Stock'}
              </span>
            </div>

            {/* Price block: Retail + Wholesale */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#F5F5F5] border border-[#E5E7EB] rounded-xl p-4">
                <p className="text-[11px] uppercase tracking-widest text-[#000000]/50 font-semibold mb-1">
                  {pricesVary ? 'From' : 'Retail'}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-[#000000] leading-none">
                  R{activeVariant.retail_price.toFixed(2)}
                </p>
                {pricesVary && (
                  <p className="text-[11px] text-[#000000]/50 mt-1">Price varies by variant</p>
                )}
              </div>

              <div className="relative bg-[#000000] rounded-xl p-4 text-white">
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Save {wholesaleSavingsPct}%
                </span>
                <p className="text-[11px] uppercase tracking-widest text-white/70 font-semibold mb-1">
                  Wholesale ({wholesaleMinQty}+ units)
                </p>
                <p className="text-2xl sm:text-3xl font-bold leading-none">
                  R{wholesalePrice.toFixed(2)}
                </p>
                <p className="text-[11px] text-white/70 mt-1">per unit</p>
              </div>
            </div>

            {/* Volume bar */}
            <div className="mb-6 bg-[#F5F5F5] border border-[#E5E7EB] rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-[#000000] mb-1.5">
                Buy {wholesaleMinQty}+ units to unlock wholesale — save {wholesaleSavingsPct}%
              </p>
              <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E63939] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (qty / wholesaleMinQty) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#000000]/50 mt-1">
                {qty >= wholesaleMinQty
                  ? 'Wholesale price unlocked! Contact us to order.'
                  : `Add ${wholesaleMinQty - qty} more unit${wholesaleMinQty - qty === 1 ? '' : 's'} for wholesale pricing`}
              </p>
            </div>

            {/* Variant selector */}
            {variants.length > 1 && (
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Colour / Option:
                  <span className="ml-2 text-gray-700 normal-case font-semibold tracking-normal">
                    {activeVariant.variant_label}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const active = v.id === activeVariant.id
                    return (
                      <button
                        key={v.id}
                        onClick={() => selectVariant(v)}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg border-2 transition-all ${
                          active
                            ? 'border-[#E63939] bg-[#FEE9E9] text-[#E63939]'
                            : 'border-gray-200 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {v.variant_label ?? v.name}
                      </button>
                    )
                  })}
                </div>
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
                  Add to Cart · R{(activeVariant.retail_price * qty).toFixed(2)}
                </motion.button>
              </div>
            )}

            {isOutOfStock && (
              <div className="py-3 px-4 bg-red-50 text-red-700 rounded-xl text-sm font-bold mb-3 text-center">
                Currently Out of Stock — Contact us for ETA
              </div>
            )}

            {/* Wishlist */}
            <button
              onClick={() => activeVariant && toggle(activeVariant.id)}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all mb-6 ${
                inWishlist
                  ? 'border-[#E63939] bg-[#FEE9E9] text-[#E63939]'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-[#E63939]' : ''}`} />
              {inWishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
            </button>

            {/* Trust strip */}
            <div className="grid grid-cols-2 gap-3 pt-5 border-t border-gray-200">
              {[
                { icon: Truck, label: 'Fast Delivery', sub: 'Nationwide SA' },
                { icon: Shield, label: 'Quality Tested', sub: 'Verified products' },
                { icon: RotateCcw, label: 'Easy Returns', sub: '7-day policy' },
                { icon: BadgeCheck, label: 'Quality Tested', sub: 'Direct importer' },
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

        {/* ── Tabs ─────────────────────────────────────────── */}
        <div className="mt-12 lg:mt-16 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 flex">
            {(['description', 'specs'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-6 py-4 text-sm font-bold transition-colors relative ${
                  tab === key ? 'text-[#E63939]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {key === 'description' ? 'Description' : 'Specifications'}
                {tab === key && (
                  <motion.span layoutId="vgroup-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E63939]" />
                )}
              </button>
            ))}
          </div>
          <div className="p-6 sm:p-8">
            {tab === 'description' ? (
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                {activeVariant.description ? (
                  <p>{activeVariant.description}</p>
                ) : (
                  <p className="text-gray-400 italic">No description available for this product yet.</p>
                )}
              </div>
            ) : (
              <table className="w-full">
                <tbody>
                  {specs.map((row, i) => (
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

        {/* ── Related Products ─────────────────────────────── */}
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
                to={`/shop${activeVariant.categories ? `?category=${activeVariant.categories.slug}` : ''}`}
                className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-[#E63939] hover:gap-2 transition-all"
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
