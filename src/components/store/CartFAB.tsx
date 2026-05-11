import { useEffect, useState, useRef } from 'react'
import { ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../../context/CartContext'

export function CartFAB() {
  const { itemCount, openCart } = useCart()
  const [shake, setShake] = useState(0)
  const [pop, setPop] = useState(0)
  const prevCount = useRef(itemCount)

  useEffect(() => {
    if (itemCount > prevCount.current) {
      setShake((s) => s + 1)
      setPop((s) => s + 1)
    }
    prevCount.current = itemCount
  }, [itemCount])

  return (
    <motion.button
      onClick={openCart}
      aria-label={`Open cart (${itemCount} item${itemCount === 1 ? '' : 's'})`}
      key={shake}
      animate={shake > 0 ? {
        rotate: [0, -12, 14, -10, 8, -4, 0],
        scale: [1, 1.1, 1.05, 1.08, 1.03, 1],
      } : {}}
      transition={{ duration: 0.7, ease: 'easeInOut' }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-5 right-5 z-40 w-14 h-14 sm:w-16 sm:h-16 bg-[#E63939] hover:bg-[#C82020] text-white rounded-full shadow-2xl shadow-[#E63939]/40 flex items-center justify-center transition-colors"
    >
      <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.2} />

      {/* Pulse ring on add */}
      <AnimatePresence>
        {pop > 0 && (
          <motion.span
            key={pop}
            initial={{ scale: 1, opacity: 0.55 }}
            animate={{ scale: 1.9, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-[#E63939] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Item count badge */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="absolute -top-1.5 -right-1.5 min-w-[24px] h-6 px-1.5 bg-[#0F172A] text-white text-xs font-extrabold rounded-full flex items-center justify-center ring-2 ring-white shadow-md"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
