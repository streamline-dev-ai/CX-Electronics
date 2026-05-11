import { useState, useRef, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Zap, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../../context/CartContext'
import { useLang } from '../../context/LangContext'
import { useWishlist } from '../../context/WishlistContext'
import { getProductImageUrl } from '../../lib/supabase'
import type { ProductWithCategory } from '../../lib/supabase'

interface ProductCardLightProps {
  product: ProductWithCategory
  basePath?: '/shop' | '/bulk'
  columns?: 1 | 2 | 3 | 4
}

export function ProductCardLight({ product, basePath = '/shop' }: ProductCardLightProps) {
  const { addItem } = useCart()
  const { lang, t } = useLang()
  const { toggle, has } = useWishlist()
  const inWishlist = has(product.id)

  const [hoverImg, setHoverImg] = useState(0)
  const [isInView, setIsInView] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<number>(0)

  const isOutOfStock = product.stock_status === 'out_of_stock'
  const isBulkView = basePath === '/bulk'
  const price = isBulkView && product.bulk_price ? product.bulk_price : product.retail_price
  const name = lang === 'zh' && product.name_zh ? product.name_zh : product.name

  const groupSlug = product.product_variant_groups?.slug
  const isVariant = !!product.variant_group_id && !!groupSlug && !isBulkView
  const href = isVariant
    ? `/shop/group/${groupSlug}?variant=${product.slug}`
    : `${basePath}/${product.slug}`
  const displayName = isVariant && product.product_variant_groups?.name
    ? product.product_variant_groups.name
    : name

  const cardImages = useMemo(() => {
    if (product.images.length > 0) {
      return product.images.slice(0, 4).map((p) => getProductImageUrl(p, 400))
    }
    return product.thumbnail_url ? [product.thumbnail_url] : []
  }, [product.images, product.thumbnail_url])

  function startCycling() {
    if (cardImages.length < 2) return
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setHoverImg((prev) => (prev + 1) % cardImages.length)
    }, 2000)
  }

  function stopCycling() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    setHoverImg(0)
  }

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    if (!isMobile || cardImages.length < 2) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          touchStartRef.current = Date.now()
        } else {
          setIsInView(false)
          stopCycling()
        }
      },
      { threshold: 0.6 }
    )

    if (cardRef.current) observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [cardImages.length])

  useEffect(() => {
    if (!isInView || cardImages.length < 2) return
    const timeout = setTimeout(() => { startCycling() }, 1000)
    return () => { clearTimeout(timeout); stopCycling() }
  }, [isInView, cardImages.length])

  const savingsPct =
    isBulkView && product.bulk_price && product.retail_price > product.bulk_price
      ? Math.round((1 - product.bulk_price / product.retail_price) * 100)
      : 0

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (isOutOfStock) return
    addItem({
      productId: product.id,
      name: product.name,
      price,
      quantity: isBulkView && product.bulk_min_qty ? product.bulk_min_qty : 1,
      image: product.thumbnail_url ?? '',
      orderType: isBulkView ? 'bulk' : 'retail',
      bulkMinQty: product.bulk_min_qty ?? undefined,
    })
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
    >
      <Link to={href} className="group block h-full">
        <div className="relative bg-white rounded-xl border border-gray-200 group-hover:border-gray-300 group-hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">

          {/* Image area — light gray so white-bg product images have a visible edge */}
          <div
            className="relative aspect-square bg-white overflow-hidden"
            onMouseEnter={startCycling}
            onMouseLeave={stopCycling}
          >
            {/* Carousel dots — top center, Makro style */}
            {cardImages.length > 1 && (
              <div className="absolute top-2.5 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                {cardImages.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === hoverImg ? 'bg-gray-700 w-4' : 'bg-gray-300 w-1.5'
                    }`}
                  />
                ))}
              </div>
            )}

            {cardImages.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.img
                  key={hoverImg}
                  src={cardImages[hoverImg]}
                  alt={displayName}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className={`w-full h-full object-contain p-5 sm:p-7 transition-transform duration-500 ${
                    cardImages.length < 2 ? 'group-hover:scale-105' : ''
                  }`}
                  loading="lazy"
                />
              </AnimatePresence>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Zap className="w-12 h-12 text-gray-200" />
              </div>
            )}

            {/* Badges top-left */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
              {isOutOfStock && (
                <span className="text-[10px] bg-gray-800 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  {t('outOfStock')}
                </span>
              )}
              {product.featured && !isOutOfStock && (
                <span className="text-[10px] bg-[#E63939] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  {t('featured')}
                </span>
              )}
              {!isBulkView && product.is_bulk_available && product.bulk_price && (
                <span className="text-[10px] bg-gray-900 text-white px-2 py-0.5 rounded font-bold">
                  Bulk from R{product.bulk_price.toFixed(0)}
                </span>
              )}
            </div>

            {isBulkView && product.bulk_min_qty && (
              <span className="absolute bottom-2.5 left-2.5 text-[10px] bg-[#E63939] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                {product.bulk_min_qty}+ units
              </span>
            )}

            {savingsPct > 0 && (
              <span className="absolute bottom-2.5 right-2.5 text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                Save {savingsPct}%
              </span>
            )}

            {/* Wishlist */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.id) }}
              className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center transition-all hover:scale-110 ${
                inWishlist ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-[#E63939] text-[#E63939]' : 'text-gray-400'}`} />
            </button>
          </div>

          {/* Info */}
          <div className="p-3 sm:p-4 flex flex-col flex-1 border-t border-gray-100">
            {product.categories && (
              <p className="text-[10px] sm:text-[11px] text-gray-400 mb-1 truncate uppercase tracking-wider font-semibold">
                {product.categories.name}
              </p>
            )}
            <p className="font-medium text-gray-900 text-sm leading-snug line-clamp-2 mb-1 min-h-[2.5rem]">
              {displayName}
            </p>
            {isVariant && (
              <p className="text-[10px] text-[#E63939] font-bold uppercase tracking-wider mb-1">
                Multiple options available
              </p>
            )}

            <div className="mt-auto pt-2">
              {/* Price */}
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-base font-extrabold text-gray-900">
                  R{price.toFixed(2)}
                </span>
                {isBulkView && product.retail_price > price && (
                  <span className="text-xs text-gray-400 line-through">
                    R{product.retail_price.toFixed(2)}
                  </span>
                )}
                {savingsPct > 0 && (
                  <span className="text-xs font-bold text-[#E63939]">{savingsPct}% off</span>
                )}
              </div>
              {isBulkView && (
                <p className="text-[10px] text-gray-400 mb-1 font-medium">per unit</p>
              )}

              {/* Full-width Add to Cart — Makro style, red on hover */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full flex items-center justify-center gap-2 text-xs font-bold px-3 py-2.5 rounded-lg transition-all duration-200 mt-2 ${
                  isOutOfStock
                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'bg-white border border-gray-300 text-gray-800 hover:bg-[#E63939] hover:text-white hover:border-[#E63939]'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  {isOutOfStock ? 'Out of Stock' : isBulkView ? 'Get Quote' : 'Add to Cart'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
