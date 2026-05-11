import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, CheckCircle2, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../../context/CartContext'
import { useProducts } from '../../hooks/useProducts'
import { ProductCardLight } from './ProductCardLight'

export function AddToCartDrawer() {
  const { lastAdded, clearLastAdded, itemCount } = useCart()

  const { products } = useProducts({
    categorySlug: lastAdded?.categorySlug,
    pageSize: 6,
    sort: 'featured',
  })

  const crossSells = products
    .filter((p) => p.name !== lastAdded?.name)
    .slice(0, 3)

  useEffect(() => {
    if (!lastAdded) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clearLastAdded()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lastAdded, clearLastAdded])

  return (
    <AnimatePresence>
      {lastAdded && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={clearLastAdded}
          />

          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-white rounded-l-2xl shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="font-bold text-emerald-600 text-sm">Added to cart</span>
              </div>
              <button
                onClick={clearLastAdded}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {lastAdded.image ? (
                  <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                    <img
                      src={lastAdded.image}
                      alt={lastAdded.name}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                    {lastAdded.name}
                  </p>
                  <p className="text-base font-extrabold text-gray-900 mt-1">
                    R{lastAdded.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {crossSells.length > 0 && (
                <>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                    You might also like
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {crossSells.map((product) => (
                      <div key={product.id} onClick={clearLastAdded}>
                        <ProductCardLight product={product} basePath="/shop" />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 grid grid-cols-2 gap-3">
              <button
                onClick={clearLastAdded}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:border-gray-400 transition-colors"
              >
                Continue Shopping
              </button>
              <Link
                to="/cart"
                onClick={clearLastAdded}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#E63939] hover:bg-[#C82020] text-white font-bold text-sm transition-colors shadow-lg shadow-[#E63939]/25"
              >
                <ShoppingBag className="w-4 h-4" />
                View Cart ({itemCount})
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
