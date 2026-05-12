import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Loader2, Package, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, getProductImageUrl } from '../../lib/supabase'
import { useLang } from '../../context/LangContext'

interface Hit {
  id: string
  name: string
  name_zh: string | null
  slug: string
  retail_price: number
  thumbnail_url: string | null
  category_name: string | null
}

interface SmartSearchBarProps {
  /** Current search value (controlled by parent). */
  value: string
  /** Called every keystroke — parent should debounce the URL update itself. */
  onChange: (q: string) => void
  /** Called when the user picks Enter / clicks "See all". */
  onSubmit: (q: string) => void
  /** Tone: 'dark' for navy hero, 'light' for white sections. */
  tone?: 'dark' | 'light'
  placeholder?: string
  /** Path to navigate to when a product suggestion is picked. */
  productBasePath?: string
}

// Smart, debounced as-you-type product suggestions for in-page search
// (Shop / Wholesale hero). Cancels in-flight requests, mobile-friendly.
export function SmartSearchBar({
  value,
  onChange,
  onSubmit,
  tone = 'dark',
  placeholder,
  productBasePath = '/shop',
}: SmartSearchBarProps) {
  const navigate = useNavigate()
  const { lang } = useLang()
  const [hits, setHits] = useState<Hit[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const q = value.trim()
    if (q.length < 2) {
      setHits([])
      setLoading(false)
      return
    }
    setLoading(true)
    const handle = setTimeout(async () => {
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      try {
        const escaped = q.replace(/[%_,()]/g, ' ').trim()
        const { data } = await supabase
          .from('products')
          .select('id, name, name_zh, slug, retail_price, thumbnail_url, categories!inner(id, name, slug)')
          .eq('active', true)
          .or(`name.ilike.%${escaped}%,name_zh.ilike.%${escaped}%,description.ilike.%${escaped}%,slug.ilike.%${escaped}%`)
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(6)
          .abortSignal(ctrl.signal)

        setHits(
          (data ?? []).map((p) => ({
            id: p.id as string,
            name: p.name as string,
            name_zh: (p.name_zh as string | null) ?? null,
            slug: p.slug as string,
            retail_price: p.retail_price as number,
            thumbnail_url: p.thumbnail_url ? getProductImageUrl(p.thumbnail_url as string, 120) : null,
            category_name: Array.isArray(p.categories)
              ? p.categories[0]?.name ?? null
              : (p.categories as { name?: string } | null)?.name ?? null,
          })),
        )
      } catch { /* aborted */ }
      setLoading(false)
    }, 200)
    return () => clearTimeout(handle)
  }, [value])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => setHighlight(-1), [hits])

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(hits.length - 1, h + 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(-1, h - 1))
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (highlight >= 0 && hits[highlight]) {
        setOpen(false)
        navigate(`${productBasePath}/${hits[highlight].slug}`)
      } else {
        setOpen(false)
        onSubmit(value)
      }
    }
  }

  const hasQuery = value.trim().length >= 2
  const showDropdown = open && hasQuery
  const isDark = tone === 'dark'

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <form
        onSubmit={(e) => { e.preventDefault(); setOpen(false); onSubmit(value) }}
        className={`flex w-full rounded-lg overflow-hidden transition-colors border ${
          isDark
            ? 'bg-white/10 border-white/20 focus-within:border-[#E63939]'
            : 'bg-white border-gray-200 focus-within:border-[#E63939]'
        }`}
      >
        <div className="relative flex-1">
          <Search
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${
              isDark ? 'text-white/40' : 'text-gray-400'
            }`}
          />
          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={(e) => { onChange(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKey}
            placeholder={placeholder ?? (lang === 'zh' ? '搜索产品...' : 'Search products...')}
            className={`w-full pl-11 pr-9 py-3 text-sm bg-transparent focus:outline-none ${
              isDark
                ? 'text-white placeholder:text-white/40'
                : 'text-gray-900 placeholder:text-gray-400'
            }`}
            aria-label="Search products"
            autoComplete="off"
          />
          {value && (
            <button
              type="button"
              onClick={() => { onChange(''); inputRef.current?.focus() }}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded transition-colors ${
                isDark ? 'text-white/50 hover:text-white' : 'text-gray-400 hover:text-gray-700'
              }`}
              aria-label="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="bg-[#E63939] hover:bg-[#C82020] text-white font-semibold px-5 sm:px-6 flex items-center justify-center transition-colors flex-shrink-0"
          aria-label="Search"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-sm">Search</span>}
        </button>
      </form>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
          >
            {loading && hits.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </div>
            ) : hits.length === 0 ? (
              <div className="py-6 px-5 text-center">
                <Package className="w-7 h-7 text-gray-200 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">No matches</p>
                <p className="text-xs text-gray-500 mt-0.5">Try a different keyword.</p>
              </div>
            ) : (
              <ul className="py-1.5">
                {hits.map((h, i) => {
                  const displayName = lang === 'zh' && h.name_zh ? h.name_zh : h.name
                  return (
                    <li key={h.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setHighlight(i)}
                        onClick={() => { setOpen(false); navigate(`${productBasePath}/${h.slug}`) }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                          highlight === i ? 'bg-[#FEE9E9]' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {h.thumbnail_url ? (
                            <img src={h.thumbnail_url} alt={displayName} className="w-full h-full object-contain p-1" />
                          ) : (
                            <Package className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                          {h.category_name && (
                            <p className="text-[11px] text-gray-400 truncate">{h.category_name}</p>
                          )}
                        </div>
                        <p className="text-sm font-bold text-[#E63939] flex-shrink-0">
                          R{h.retail_price.toFixed(0)}
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            {hits.length > 0 && (
              <button
                type="button"
                onClick={() => { setOpen(false); onSubmit(value) }}
                className="w-full flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50 hover:bg-gray-100 text-sm font-semibold text-gray-700 transition-colors"
              >
                <span>Filter all products by "<span className="text-[#E63939]">{value}</span>"</span>
                <ArrowRight className="w-4 h-4 text-[#E63939]" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
