import { Link } from 'react-router-dom'
import { ShoppingCart, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '../../context/CartContext'
import { useLang } from '../../context/LangContext'
import type { ProductWithCategory } from '../../lib/supabase'

interface ProductCardProps {
  product: ProductWithCategory
  basePath?: '/shop' | '/bulk'
}

export function ProductCard({ product, basePath = '/shop' }: ProductCardProps) {
  const { addItem } = useCart()
  const { lang, t } = useLang()

  const isOutOfStock = product.stock_status === 'out_of_stock'
  const isBulkView = basePath === '/bulk'
  const price = isBulkView && product.bulk_price ? product.bulk_price : product.retail_price
  const name = lang === 'zh' && product.name_zh ? product.name_zh : product.name

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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
    >
      <Link to={`${basePath}/${product.slug}`} className="group block h-full">
        <div className="relative bg-white rounded-2xl border border-gray-100 group-hover:border-[#E63939]/40 group-hover:shadow-[0_12px_32px_-12px_rgba(230,57,57,0.35)] transition-all duration-300 overflow-hidden h-full flex flex-col">
          {/* Image */}
          <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {product.thumbnail_url ? (
              <img
                src={product.thumbnail_url}
                alt={name}
                className="w-full h-full object-contain p-5 group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Zap className="w-12 h-12 text-gray-200" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
              {isOutOfStock && (
                <span className="text-[10px] bg-gray-900 text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  {t('outOfStock')}
                </span>
              )}
              {product.featured && !isOutOfStock && (
                <span className="text-[10px] bg-[#E63939] text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  {t('featured')}
                </span>
              )}
              {!isBulkView && product.is_bulk_available && product.bulk_price && (
                <span className="text-[10px] bg-[#111827] text-white px-2 py-0.5 rounded-md font-bold">
                  Bulk from R{product.bulk_price.toFixed(0)}
                </span>
              )}
            </div>

            {isBulkView && product.bulk_min_qty && (
              <span className="absolute top-2.5 right-2.5 text-[10px] bg-[#E63939] text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                {product.bulk_min_qty}+ units
              </span>
            )}

            {savingsPct > 0 && (
              <span className="absolute bottom-2.5 right-2.5 text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                Save {savingsPct}%
              </span>
            )}
          </div>

          {/* Info */}
          <div className="p-4 flex flex-col flex-1">
            {product.categories && (
              <p className="text-[11px] text-gray-400 mb-1 truncate uppercase tracking-wider font-semibold">
                {product.categories.name}
              </p>
            )}
            <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-3 min-h-[2.5rem]">
              {name}
            </p>

            <div className="mt-auto flex items-end justify-between gap-2">
              <div className="leading-tight">
                {isBulkView && product.retail_price > price && (
                  <p className="text-xs text-gray-400 line-through leading-none mb-0.5">
                    R{product.retail_price.toFixed(2)}
                  </p>
                )}
                <p className="text-xl font-extrabold text-[#E63939] leading-none">
                  R{price.toFixed(2)}
                </p>
                {isBulkView && (
                  <p className="text-[10px] text-gray-500 mt-1 font-medium">per unit</p>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-all ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#E63939] hover:bg-[#C82020] text-white group-hover:shadow-md group-hover:shadow-[#E63939]/30'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {isOutOfStock ? 'N/A' : isBulkView ? 'Quote' : 'Add'}
                </span>
              </button>
            </div>
          </div>

          {/* Subtle red bottom accent on hover */}
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E63939] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
        </div>
      </Link>
    </motion.div>
  )
}
