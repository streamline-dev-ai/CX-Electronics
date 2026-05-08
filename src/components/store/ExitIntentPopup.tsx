import { useEffect, useState } from 'react'
import { X, Truck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../../context/CartContext'

export function ExitIntentPopup() {
  const { items, total } = useCart()
  const [isVisible, setIsVisible] = useState(false)
  const [hasShownThisSession, setHasShownThisSession] = useState(false)

  useEffect(() => {
    if (hasShownThisSession || items.length === 0) return

    function handleMouseLeave(e: MouseEvent) {
      // Only show if leaving from top of page
      if (e.clientY <= 0) {
        setIsVisible(true)
        setHasShownThisSession(true)
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [hasShownThisSession, items.length])

  if (items.length === 0) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsVisible(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-[#000000] rounded-2xl shadow-2xl overflow-hidden relative">
              {/* Close button */}
              <button
                onClick={() => setIsVisible(false)}
                className="absolute top-4 right-4 p-2 hover:bg-[#E63939]/10 rounded-lg transition-colors text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="p-8">
                {/* Header */}
                <h2 className="text-2xl font-bold text-white mb-2">
                  Before you go…
                </h2>
                <p className="text-white/70 text-sm mb-6">
                  Complete your order and get free delivery in Gauteng on orders over R500!
                </p>

                {/* Offer highlight */}
                <div className="bg-[#E63939]/10 border border-[#E63939]/30 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-[#E63939] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white text-sm">
                        Free Gauteng Delivery
                      </p>
                      <p className="text-xs text-white/60">
                        On your order of {items.length} {items.length === 1 ? 'item' : 'items'} (R{total.toFixed(2)})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cart summary */}
                <div className="bg-[#1A1A1A] rounded-xl p-4 mb-6 max-h-32 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs mb-2 pb-2 border-b border-white/10 last:border-0 last:mb-0 last:pb-0">
                      <div>
                        <p className="text-white font-semibold">{item.name}</p>
                        <p className="text-white/50">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-[#E63939] font-bold">
                        R{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <p className="text-white/70 text-sm">Subtotal</p>
                  <p className="text-white font-bold text-lg">
                    R{total.toFixed(2)}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsVisible(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg text-white font-semibold hover:bg-white/10 transition-colors text-sm"
                  >
                    Continue browsing
                  </button>
                  <button
                    onClick={() => {
                      setIsVisible(false)
                      // Scroll to cart button or trigger cart drawer
                      const cartBtn = document.querySelector('[data-cart-button]')
                      cartBtn?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-[#E63939] hover:bg-[#C82020] text-white font-semibold transition-colors text-sm"
                  >
                    Complete Order
                  </button>
                </div>

                {/* Footer text */}
                <p className="text-center text-xs text-white/50 mt-4">
                  Free delivery is available throughout Gauteng.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
