import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Truck, ShieldCheck, BadgePercent, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../../context/CartContext'

export function ExitIntentPopup() {
  const { items, itemCount, total } = useCart()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('exitShown') === '1') return
    let armed = false
    const armTimer = setTimeout(() => { armed = true }, 8000) // don't fire for 8s after page load

    function handleMouseLeave(e: MouseEvent) {
      if (!armed) return
      if (e.clientY > 12) return
      if ((e.relatedTarget as Node | null)) return // ignore intra-page leaves
      setVisible(true)
      sessionStorage.setItem('exitShown', '1')
      document.removeEventListener('mouseleave', handleMouseLeave)
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      clearTimeout(armTimer)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  function close() {
    setVisible(false)
  }

  const hasItems = items.length > 0
  const previewItems = items.slice(0, 3)
  const overflow = items.length - 3

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] bg-[#0F172A]/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={close}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl shadow-black/40"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top hero strip */}
            <div className="relative bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] px-8 pt-10 pb-7 text-white overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#E63939]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-10 w-56 h-56 bg-[#E63939]/15 rounded-full blur-3xl pointer-events-none" />

              <button
                onClick={close}
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative">
                <div className="inline-flex items-center gap-1.5 bg-[#E63939]/20 border border-[#E63939]/40 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#FF8585] mb-4">
                  <BadgePercent className="w-3 h-3" />
                  Wait — don't go just yet
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight mb-2">
                  {hasItems
                    ? <>Your cart is still warm.<br/><span className="text-[#FF6B6B]">Finish your order now.</span></>
                    : <>Before you go —<br/><span className="text-[#FF6B6B]">save on your first order.</span></>}
                </h2>
                <p className="text-white/70 text-sm leading-relaxed">
                  {hasItems
                    ? <>You have <span className="text-white font-bold">{itemCount} item{itemCount !== 1 ? 's' : ''}</span> waiting — checkout in under 60 seconds.</>
                    : 'Direct-importer prices on chargers, CCTV, solar & more. Same-day Gauteng delivery.'}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="px-8 py-6">
              {hasItems && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-3 mb-5 space-y-2">
                  {previewItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          className="w-10 h-10 rounded-lg object-contain bg-white border border-gray-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty {item.quantity} · R{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  {overflow > 0 && (
                    <p className="text-xs text-gray-500 pl-1">
                      + {overflow} more item{overflow !== 1 ? 's' : ''}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-xs uppercase tracking-widest font-bold text-gray-500">Cart total</span>
                    <span className="text-lg font-extrabold text-gray-900">R{total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Trust strip */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-[#FEE9E9] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4 text-[#E63939]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 leading-tight">Fast Delivery</p>
                    <p className="text-[11px] text-gray-500">Same-day in JHB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-[#FEE9E9] rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-[#E63939]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 leading-tight">Secure Checkout</p>
                    <p className="text-[11px] text-gray-500">7-day returns</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={close}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:border-gray-300 hover:text-gray-800 transition-colors"
                >
                  Keep Browsing
                </button>
                <Link
                  to={hasItems ? '/checkout' : '/shop'}
                  onClick={close}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#E63939] hover:bg-[#C82020] text-white font-bold text-sm transition-all shadow-lg shadow-[#E63939]/30 hover:shadow-xl hover:shadow-[#E63939]/40 hover:-translate-y-0.5"
                >
                  {hasItems ? 'Complete Order' : 'Start Shopping'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
