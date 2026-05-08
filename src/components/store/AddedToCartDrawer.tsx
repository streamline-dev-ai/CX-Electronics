import { useEffect } from 'react'
import { X, ShoppingCart, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useProducts } from '../../hooks/useProducts'

interface AddedToCartDrawerProps {
  productId: string | null
  isOpen: boolean
  onClose: () => void
}

export function AddedToCartDrawer({ productId, isOpen, onClose }: AddedToCartDrawerProps) {
  const { items, closeCart } = useCart()
  const lastItem = items[items.length - 1]

  // Get complementary products for cross-sell
  const { products: suggestions } = useProducts({
    pageSize: 3,
    sort: 'featured',
  })

  // Filter to show different products (exclude current)
  const crossSells = suggestions.filter((p) => p.id !== productId).slice(0, 3)

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 4000)
    return () => clearTimeout(timer)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-20 right-4 z-40 max-w-md bg-white rounded-xl shadow-2xl border border-[#E5E7EB] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-[#F5F5F5] border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#000000]">Added to cart!</p>
                <p className="text-xs text-[#000000]/50">{lastItem?.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white rounded-lg transition-colors text-[#000000]/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cross-sell section */}
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-[#000000]/50 uppercase tracking-widest mb-3">
              Often bought together
            </p>
            <div className="space-y-2">
              {crossSells.map((product) => (
                <Link
                  key={product.id}
                  to={`/shop/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F5F5F5] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#F5F5F5] group-hover:bg-[#E5E7EB] flex-shrink-0 overflow-hidden">
                    {product.thumbnail_url && (
                      <img src={product.thumbnail_url} alt="" className="w-full h-full object-contain" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#000000] line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-[#E63939] font-bold">
                      R{product.retail_price.toFixed(2)}
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#000000]/30 group-hover:text-[#E63939] transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 px-5 py-3 bg-[#F5F5F5] border-t border-[#E5E7EB]">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-semibold text-[#000000] hover:bg-white rounded-lg transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => {
                closeCart()
                onClose()
              }}
              className="flex-1 px-4 py-2 text-sm font-semibold bg-[#E63939] hover:bg-[#C82020] text-white rounded-lg transition-colors"
            >
              View Cart
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
