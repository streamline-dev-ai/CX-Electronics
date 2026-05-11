import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, X,
  LayoutGrid, Grid2X2, Grid3X3, List, MessageCircle, TrendingDown,
  Truck, ShieldCheck, BadgePercent,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import SEO from '../../components/SEO'
import { ProductCardLight } from '../../components/store/ProductCardLight'
import { useProducts, type ProductSort } from '../../hooks/useProducts'
import { useCategories } from '../../hooks/useCategories'

const WHATSAPP_NUMBER = '27000000000'

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'featured', label: 'Best Sellers' },
]

const PRICE_PRESETS = [
  { label: 'Under R200', min: 0, max: 200 },
  { label: 'R200 – R500', min: 200, max: 500 },
  { label: 'R500 – R1000', min: 500, max: 1000 },
  { label: 'R1000+', min: 1000, max: undefined },
]

const PAGE_SIZE = 24
type GridColumns = 1 | 2 | 3 | 4

const TRUST = [
  { icon: BadgePercent, label: 'Up to 25% off retail' },
  { icon: Truck, label: 'Nationwide delivery' },
  { icon: ShieldCheck, label: 'Quality guaranteed' },
  { icon: MessageCircle, label: 'Trade account support' },
]

export function Wholesale() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')
  const [sort, setSort] = useState<ProductSort>('popularity')
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({})
  const [inStockOnly, setInStockOnly] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [gridCols, setGridCols] = useState<GridColumns>(4)

  const { categories } = useCategories()

  const categorySlug = searchParams.get('category') ?? ''
  const search = searchParams.get('q') ?? ''

  useEffect(() => {
    setPage(1)
  }, [categorySlug, search, sort, priceRange.min, priceRange.max, inStockOnly])

  const { products, loading, totalCount } = useProducts({
    categorySlug: categorySlug || undefined,
    search: search || undefined,
    sort,
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
    inStockOnly,
    page,
    pageSize: PAGE_SIZE,
  })

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  function setCategory(slug: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      slug ? next.set('category', slug) : next.delete('category')
      return next
    })
  }

  function applySearch(e: React.FormEvent) {
    e.preventDefault()
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      searchInput ? next.set('q', searchInput) : next.delete('q')
      return next
    })
  }

  function clearAll() {
    setPriceRange({})
    setInStockOnly(false)
    setSearchInput('')
    setSort('popularity')
    setSearchParams(new URLSearchParams())
  }

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (categorySlug) n++
    if (search) n++
    if (priceRange.min !== undefined || priceRange.max !== undefined) n++
    if (inStockOnly) n++
    return n
  }, [categorySlug, search, priceRange, inStockOnly])

  const activeCategoryName = useMemo(() => {
    if (!categorySlug) return null
    return categories.find((c) => c.slug === categorySlug)?.name ?? null
  }, [categorySlug, categories])

  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('ellipsis')
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i)
      }
      if (page < totalPages - 2) pages.push('ellipsis')
      pages.push(totalPages)
    }
    return pages
  }, [page, totalPages])

  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }

  const FiltersPanel = (
    <div className="space-y-7">
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Categories</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setCategory('')}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                !categorySlug ? 'bg-[#E63939] text-white font-semibold' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Products
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setCategory(c.slug)}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                  categorySlug === c.slug ? 'bg-[#E63939] text-white font-semibold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Wholesale Price</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setPriceRange({})}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                priceRange.min === undefined && priceRange.max === undefined
                  ? 'bg-[#0F172A] text-white font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Any price
            </button>
          </li>
          {PRICE_PRESETS.map((p) => {
            const active = priceRange.min === p.min && priceRange.max === p.max
            return (
              <li key={p.label}>
                <button
                  onClick={() => setPriceRange({ min: p.min, max: p.max })}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                    active ? 'bg-[#0F172A] text-white font-semibold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {p.label}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Availability</h3>
        <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#E63939] focus:ring-[#E63939]"
          />
          <span className="text-sm text-gray-700">In stock only</span>
        </label>
      </section>

      {activeFilterCount > 0 && (
        <button
          onClick={clearAll}
          className="w-full text-sm font-medium text-[#E63939] hover:text-[#C82020] py-2"
        >
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="Wholesale Electronics | CW Electronics"
        description="Wholesale pricing from 6+ units. Direct importer trade rates on chargers, CCTV, solar, routers & more. Save up to 25% on retail."
        url="https://cw-electronics.co.za/wholesale"
      />
      <Navbar />

      {/* Hero */}
      <section className="relative bg-[#0F172A] overflow-hidden border-b border-white/5">
        <div className="absolute -right-32 top-1/2 -translate-y-1/2 hidden md:block pointer-events-none">
          <TrendingDown className="w-[420px] h-[420px] text-[#E63939] opacity-10" strokeWidth={1} />
        </div>
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-[#E63939]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 bg-[#E63939]/15 border border-[#E63939]/40 rounded-full px-4 py-1.5 text-xs text-[#E63939] font-bold mb-4 uppercase tracking-widest">
              <TrendingDown className="w-3.5 h-3.5" />
              Wholesale — Min 6 Units
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-3 text-balance">
              Trade Prices on <span className="text-[#E63939]">Every Product</span>
            </h1>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-5 max-w-2xl text-pretty">
              Buy 6 or more and unlock wholesale pricing across the whole catalogue — up to 25% off retail.
            </p>

            <form onSubmit={applySearch} className="flex max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search wholesale products..."
                  className="w-full bg-white/10 text-white placeholder:text-white/40 pl-11 pr-4 py-3 rounded-l-lg border border-white/20 border-r-0 focus:outline-none focus:ring-2 focus:ring-[#E63939] focus:border-transparent text-sm"
                />
              </div>
              <button
                type="submit"
                className="bg-[#E63939] hover:bg-[#C82020] text-white font-semibold px-5 py-3 rounded-r-lg transition-colors text-sm"
              >
                Search
              </button>
            </form>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7 max-w-3xl">
              {TRUST.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                  <Icon className="w-4 h-4 text-[#E63939] flex-shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {activeFilterCount > 0 && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mr-1">Filters:</span>
            {activeCategoryName && <FilterChip label={activeCategoryName} onRemove={() => setCategory('')} />}
            {search && (
              <FilterChip
                label={`"${search}"`}
                onRemove={() => {
                  setSearchInput('')
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev)
                    next.delete('q')
                    return next
                  })
                }}
              />
            )}
            {(priceRange.min !== undefined || priceRange.max !== undefined) && (
              <FilterChip
                label={priceRange.max === undefined ? `R${priceRange.min}+` : `R${priceRange.min ?? 0} – R${priceRange.max}`}
                onRemove={() => setPriceRange({})}
              />
            )}
            {inStockOnly && <FilterChip label="In stock" onRemove={() => setInStockOnly(false)} />}
            <button onClick={clearAll} className="ml-auto text-xs font-semibold text-[#E63939] hover:text-[#C82020]">
              Clear all
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-8">
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-28">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-5">
                <SlidersHorizontal className="w-4 h-4 text-[#E63939]" />
                Filters
              </div>
              {FiltersPanel}
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{totalCount}</span> wholesale products
              </p>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex items-center gap-1 border border-gray-200 rounded-lg p-1">
                  {([1, 2, 3, 4] as GridColumns[]).map((cols) => {
                    const Icon = cols === 1 ? List : cols === 2 ? Grid2X2 : cols === 3 ? Grid3X3 : LayoutGrid
                    return (
                      <button
                        key={cols}
                        onClick={() => setGridCols(cols)}
                        className={`p-1.5 rounded-md transition-colors ${
                          gridCols === cols ? 'bg-[#E63939] text-white' : 'text-gray-400 hover:text-gray-700'
                        }`}
                        aria-label={`${cols} column${cols > 1 ? 's' : ''} view`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="md:hidden flex items-center gap-2 text-sm font-medium text-gray-900 border border-gray-200 px-3 py-2 rounded-lg"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-[#E63939] text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as ProductSort)}
                    className="appearance-none bg-white border border-gray-200 text-sm font-medium text-gray-900 pl-3 pr-9 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63939] focus:border-transparent cursor-pointer"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>Sort: {o.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className={`grid ${gridClasses[gridCols]} gap-4`}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse border border-gray-200" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Search className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-base font-semibold text-gray-900">No products found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="mt-4 bg-[#E63939] hover:bg-[#C82020] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className={`grid ${gridClasses[gridCols]} gap-4`}>
                  {products.map((product) => (
                    <ProductCardLight key={product.id} product={product} basePath="/bulk" columns={gridCols} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 sm:gap-2 mt-10">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {pageNumbers.map((p, i) =>
                        p === 'ellipsis' ? (
                          <span key={`ellipsis-${i}`} className="px-2 text-gray-300">...</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${
                              page === p ? 'bg-[#E63939] text-white' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="mt-10 bg-[#0F172A] rounded-xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-white font-semibold text-base sm:text-lg">Need bigger volume or custom pricing?</h3>
                  <p className="text-white/60 text-sm mt-1">WhatsApp our trade desk — we'll respond within 1 business hour.</p>
                </div>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I would like a wholesale quote')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bc59] text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Trade Desk
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-[#0F172A]/70" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#E63939]" />
                Filters
              </h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-5">{FiltersPanel}</div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-5 py-4">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full bg-[#E63939] hover:bg-[#C82020] text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Show {totalCount} products
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-900 text-xs font-medium pl-3 pr-2 py-1.5 rounded-full">
      {label}
      <button onClick={onRemove} className="text-gray-400 hover:text-[#E63939] transition-colors" aria-label={`Remove ${label} filter`}>
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  )
}
