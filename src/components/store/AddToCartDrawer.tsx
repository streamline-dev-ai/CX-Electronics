import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, X, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../../context/CartContext'

// Lightweight non-blocking toast — shows briefly after adding to cart.
// Does NOT auto-open the full cart drawer (that's now manual via the cart FAB).
export function AddToCartDrawer() {
  const { lastAdded, clearLastAdded, itemCount } = useCart()

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
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: -16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          className="fixed top-20 sm:top-24 right-4 sm:right-5 z-50 w-[calc(100%-2rem)] sm:w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          <div className="h-1 w-full bg-emerald-500" />
          <div className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-bold text-xs uppercase tracking-widest">Added to cart</span>
              </div>
              <button
                onClick={clearLastAdded}
                className="-mr-1 -mt-1 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-3">
              {lastAdded.image ? (
                <img
                  src={lastAdded.image}
                  alt=""
                  className="w-12 h-12 bg-gray-50 rounded-lg object-contain p-1 border border-gray-100 flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                  {lastAdded.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  R{lastAdded.price.toFixed(2)} · {itemCount} item{itemCount === 1 ? '' : 's'} in cart
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={clearLastAdded}
                className="py-2 rounded-lg border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors"
              >
                Keep Shopping
              </button>
              <Link
                to="/cart"
                onClick={clearLastAdded}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#E63939] hover:bg-[#C82020] text-white font-bold text-xs transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                View Cart
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
