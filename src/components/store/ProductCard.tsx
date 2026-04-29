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
  const price = basePath === '/bulk' && product.bulk_price ? product.bulk_price : product.retail_price
  const name = lang === 'zh' && product.name_zh ? product.name_zh : product.name

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (isOutOfStock) return
    addItem({
      productId: product.id,
      name: product.name,
      price,
      quantity: 1,
      image: product.thumbnail_url ?? '',
      orderType: basePath === '/bulk' ? 'bulk' : 'retail',
      bulkMinQty: product.bulk_min_qty ?? undefined,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`${basePath}/${product.slug}`} className="group block">
        <div className="bg-white rounded-2xl border border-gray-100 hover:border-cxx-blue/30 hover:shadow-lg transition-all duration-200 overflow-hidden">
          {/* Image */}
          <div className="relative aspect-square bg-gray-50 overflow-hidden">
            {product.thumbnail_url ? (
              <img
                src={product.thumbnail_url}
                alt={name}
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Zap className="w-12 h-12 text-gray-200" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isOutOfStock && (
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">
                  {t('outOfStock')}
                </span>
              )}
              {product.featured && !isOutOfStock && (
                <span className="text-xs bg-cxx-blue text-white px-2 py-0.5 rounded-full font-medium">
                  {t('featured')}
                </span>
              )}
              {product.is_bulk_available && basePath === '/shop' && (
                <span className="text-xs bg-cxx-navy text-white px-2 py-0.5 rounded-full font-medium">
                  {t('bulkAvailable')}
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            {product.categories && (
              <p className="text-xs text-cxx-muted mb-1 truncate">{product.categories.name}</p>
            )}
            <p className="font-medium text-gray-900 text-sm leading-snug line-clamp-2 mb-3">{name}</p>

            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-bold text-lg text-gray-900">R{price.toFixed(2)}</p>
                {basePath === '/bulk' && product.bulk_min_qty && (
                  <p className="text-xs text-cxx-muted">
                    {t('bulkMinQty')}: {product.bulk_min_qty} {t('units')}
                  </p>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-shrink-0 flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-colors ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-cxx-blue hover:bg-cxx-blue-hover text-white'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">{isOutOfStock ? t('outOfStock') : t('addToCart')}</span>
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
