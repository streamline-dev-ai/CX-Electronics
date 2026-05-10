import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../../context/CartContext'

export function ExitIntentPopup() {
  const { items, itemCount } = useCart()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('exitShown') === '1') return

    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY >= 10) return
      if (items.length === 0) return
      setVisible(true)
      sessionStorage.setItem('exitShown', '1')
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [items.length])

  function close() {
    setVisible(false)
  }

  const previewItems = items.slice(0, 3)
  const overflow = items.length - 3

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={close}
          >
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              className="relative bg-[#0F172A] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-1 w-full bg-[#E63939]" />

              <button
                onClick={close}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="px-8 pt-8 pb-7">
                <div className="flex justify-center mb-5">
                  <div className="w-12 h-12 bg-[#E63939]/15 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-[#E63939]" />
                  </div>
                </div>

                <h2 className="text-2xl font-extrabold text-white text-center mb-2">
                  Before you go...
                </h2>
                <p className="text-sm text-white/60 text-center mb-6">
                  You have{' '}
                  <span className="text-white font-bold">
                    {itemCount} item{itemCount !== 1 ? 's' : ''}
                  </span>{' '}
                  in your cart. Complete your order and get fast Gauteng delivery.
                </p>

                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-6 space-y-2">
                  {previewItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3">
                      <p className="text-sm text-white/80 truncate flex-1">{item.name}</p>
                      <span className="text-xs font-bold text-white/50 flex-shrink-0">
                        ×{item.quantity}
                      </span>
                    </div>
                  ))}
                  {overflow > 0 && (
                    <p className="text-xs text-white/40 pt-1">
                      +{overflow} more item{overflow !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={close}
                    className="py-3 rounded-xl border-2 border-white/20 text-white/70 font-bold text-sm hover:border-white/40 hover:text-white transition-colors"
                  >
                    Keep Browsing
                  </button>
                  <Link
                    to="/cart"
                    onClick={close}
                    className="flex items-center justify-center py-3 rounded-xl bg-[#E63939] hover:bg-[#C82020] text-white font-bold text-sm transition-colors shadow-lg shadow-[#E63939]/30"
                  >
                    Complete Order
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
