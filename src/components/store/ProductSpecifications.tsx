import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { SpecSection } from '../../lib/supabase'

interface Props {
  sections?: SpecSection[] | null
}

export function ProductSpecifications({ sections }: Props) {
  const [open, setOpen] = useState<Set<number>>(new Set([0]))

  if (!sections || sections.length === 0) return null

  function toggle(i: number) {
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div className="mt-6 lg:mt-8 bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="text-xs font-bold text-[#E63939] uppercase tracking-widest">Product Information</p>
      </div>

      <div className="divide-y divide-gray-100">
        {sections.map((section, i) => {
          const isOpen = open.has(i)
          return (
            <div key={section.title}>
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50/60 transition-colors"
              >
                <span className="text-sm font-bold text-gray-900">{section.title}</span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="flex-shrink-0 ml-4"
                >
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <table className="w-full border-t border-gray-100">
                      <tbody>
                        {section.items.map((item, j) => (
                          <tr
                            key={item.label}
                            className={j % 2 === 0 ? 'bg-gray-50/60' : 'bg-white'}
                          >
                            <td className="px-6 py-3 text-sm font-semibold text-gray-700 w-2/5 align-top">
                              {item.label}
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-600 align-top">
                              {item.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
