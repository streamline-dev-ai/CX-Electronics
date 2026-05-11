import { useState, type FormEvent } from 'react'
import { Lock, CreditCard, CheckCircle, X, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  amount: number
  orderNumber: string
  onPay: () => Promise<void>
  onCancel: () => void
}

function formatCardNumber(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(v: string) {
  const digits = v.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits
}

export function DemoPaymentModal({ amount, orderNumber, onPay, onCancel }: Props) {
  const [card, setCard] = useState('')
  const [name, setName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [state, setState] = useState<'form' | 'processing' | 'done'>('form')
  const [error, setError] = useState<string | null>(null)

  async function handlePay(e: FormEvent) {
    e.preventDefault()
    const raw = card.replace(/\s/g, '')
    if (raw.length < 13) { setError('Enter a valid card number'); return }
    if (!name.trim()) { setError('Enter the name on your card'); return }
    if (expiry.length < 5) { setError('Enter a valid expiry date'); return }
    if (cvv.length < 3) { setError('Enter your CVV'); return }

    setError(null)
    setState('processing')

    // Simulate processing delay, then trigger the real order completion
    await new Promise((r) => setTimeout(r, 2200))
    await onPay()
    setState('done')
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 340 }}
          className="w-full max-w-sm bg-[#0F172A] rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#E63939] rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">Secure Payment</p>
                <p className="text-white/40 text-xs mt-0.5">Order {orderNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-widest">
                Demo
              </span>
              {state === 'form' && (
                <button onClick={onCancel} className="text-white/40 hover:text-white/70 transition-colors ml-1">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="px-6 pt-5 pb-1">
            <p className="text-xs text-white/40 font-semibold uppercase tracking-widest">Amount due</p>
            <p className="text-3xl font-extrabold text-white mt-0.5">R{amount.toFixed(2)}</p>
          </div>

          {state === 'processing' ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="w-14 h-14 border-2 border-[#E63939] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-white font-semibold">Processing payment…</p>
              <p className="text-white/40 text-sm mt-1">Please wait</p>
            </div>
          ) : state === 'done' ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <CheckCircle className="w-14 h-14 text-green-400 mb-4" />
              <p className="text-white font-semibold text-lg">Payment Confirmed</p>
              <p className="text-white/40 text-sm mt-1">Redirecting…</p>
            </div>
          ) : (
            <form onSubmit={handlePay} className="px-6 pb-6 pt-4 space-y-3">
              {error && (
                <div className="bg-red-900/40 border border-red-500/30 rounded-xl px-4 py-2.5 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* Card number */}
              <div>
                <label className="block text-xs text-white/40 font-semibold uppercase tracking-widest mb-1.5">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={card}
                    onChange={(e) => setCard(formatCardNumber(e.target.value))}
                    placeholder="0000 0000 0000 0000"
                    className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63939] placeholder:text-white/20 tracking-widest"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs text-white/40 font-semibold uppercase tracking-widest mb-1.5">Name on Card</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="J. Smith"
                  autoComplete="cc-name"
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63939] placeholder:text-white/20"
                />
              </div>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 font-semibold uppercase tracking-widest mb-1.5">Expiry</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63939] placeholder:text-white/20"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 font-semibold uppercase tracking-widest mb-1.5">CVV</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="•••"
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63939] placeholder:text-white/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 flex items-center justify-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
              >
                <Lock className="w-4 h-4" />
                Pay R{amount.toFixed(2)}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-white/30 text-xs pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                256-bit SSL · Demo environment
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
