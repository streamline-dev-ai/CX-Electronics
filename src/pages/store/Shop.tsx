import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, X,
  LayoutGrid, Grid2X2, Grid3X3, List,
} from 'lucide-react'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import SEO from '../../components/SEO'
import { ProductCard } from '../../components/store/ProductCard'
import { useProducts, type ProductSort } from '../../hooks/useProducts'
import { useCategories } from '../../hooks/useCategories'
import { useLang } from '../../context/LangContext'

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

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')
  const [sort, setSort] = useState<ProductSort>('popularity')
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({})
  const [inStockOnly, setInStockOnly] = useState(false)
  const [bulkOnly, setBulkOnly] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [gridCols, setGridCols] = useState<GridColumns>(4)

  const { t } = useLang()
  const { categories } = useCategories()

  const categorySlug = searchParams.get('category') ?? ''
  const search = searchParams.get('q') ?? ''

  // Reset page on filter change
  useEffect(() => {
    setPage(1)
  }, [categorySlug, search, sort, priceRange.min, priceRange.max, inStockOnly, bulkOnly])

  const { products, loading, totalCount } = useProducts({
    categorySlug: categorySlug || undefined,
    search: search || undefined,
    sort,
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
    inStockOnly,
    bulkOnly,
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
    setBulkOnly(false)
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
    if (bulkOnly) n++
    return n
  }, [categorySlug, search, priceRange, inStockOnly, bulkOnly])

  const activeCategoryName = useMemo(() => {
    if (!categorySlug) return null
    return categories.find((c) => c.slug === categorySlug)?.name ?? null
  }, [categorySlug, categories])

  // Generate page numbers with ellipsis
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

  // Grid column classes
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }

  const FiltersPanel = (
    <div className="space-y-7">
      {/* Categories */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
          {t('categories')}
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setCategory('')}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                !categorySlug
                  ? 'bg-[#DC2626] text-white font-semibold'
                  : 'text-neutral-300 hover:bg-neutral-800'
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
                  categorySlug === c.slug
                    ? 'bg-[#DC2626] text-white font-semibold'
                    : 'text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Price */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
          Price Range
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setPriceRange({})}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                priceRange.min === undefined && priceRange.max === undefined
                  ? 'bg-neutral-700 text-white font-semibold'
                  : 'text-neutral-300 hover:bg-neutral-800'
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
                    active
                      ? 'bg-neutral-700 text-white font-semibold'
                      : 'text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {p.label}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Toggles */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
          Availability
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-800 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-600 bg-neutral-800 text-[#DC2626] focus:ring-[#DC2626]"
            />
            <span className="text-sm text-neutral-300">In stock only</span>
          </label>
          <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-800 cursor-pointer">
            <input
              type="checkbox"
              checked={bulkOnly}
              onChange={(e) => setBulkOnly(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-600 bg-neutral-800 text-[#DC2626] focus:ring-[#DC2626]"
            />
            <span className="text-sm text-neutral-300">Bulk eligible</span>
          </label>
        </div>
      </section>

      {activeFilterCount > 0 && (
        <button
          onClick={clearAll}
          className="w-full text-sm font-medium text-[#DC2626] hover:text-[#B91C1C] py-2"
        >
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col">
      <SEO
        title="Shop Electronics | CW Electronics Johannesburg"
        description="Browse chargers, CCTV, solar lights, routers, smartwatches & more. Retail & bulk pricing available. Fast delivery across South Africa."
        url="https://cw-electronics.co.za/shop"
      />
      <Navbar />

      {/* Hero */}
      <section className="relative bg-[#1E293B] text-white border-b border-slate-700">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-[#DC2626] uppercase tracking-widest mb-2">
              All Products
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-balance text-white">
              {activeCategoryName ? activeCategoryName : 'Shop Electronics'}
            </h1>
            <p className="text-neutral-400 mt-2 text-sm md:text-base max-w-xl">
              CCTV, solar, chargers, routers, smartwatches and more — wholesale &amp; retail.
            </p>

            {/* Search */}
            <form onSubmit={applySearch} className="mt-5 flex max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-neutral-900 text-white placeholder:text-neutral-500 pl-11 pr-4 py-3 rounded-l-lg border border-neutral-700 border-r-0 focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:border-transparent text-sm"
                />
              </div>
              <button
                type="submit"
                className="bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold px-5 py-3 rounded-r-lg transition-colors text-sm"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Active filters */}
      {activeFilterCount > 0 && (
        <div className="bg-[#0a0a0a] border-b border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider mr-1">
              Filters:
            </span>
            {activeCategoryName && (
              <FilterChip label={activeCategoryName} onRemove={() => setCategory('')} />
            )}
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
                label={
                  priceRange.max === undefined
                    ? `R${priceRange.min}+`
                    : `R${priceRange.min ?? 0} – R${priceRange.max}`
                }
                onRemove={() => setPriceRange({})}
              />
            )}
            {inStockOnly && <FilterChip label="In stock" onRemove={() => setInStockOnly(false)} />}
            {bulkOnly && <FilterChip label="Bulk" onRemove={() => setBulkOnly(false)} />}
            <button
              onClick={clearAll}
              className="ml-auto text-xs font-semibold text-[#DC2626] hover:text-[#B91C1C]"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-28">
              <div className="flex items-center gap-2 text-sm font-semibold text-white mb-5">
                <SlidersHorizontal className="w-4 h-4 text-[#DC2626]" />
                Filters
              </div>
              {FiltersPanel}
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Top bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 bg-neutral-900 rounded-xl px-4 py-3 border border-neutral-800">
              {/* Count */}
              <p className="text-sm text-neutral-400">
                <span className="font-semibold text-white">{totalCount}</span> products
              </p>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Grid toggle - desktop only */}
                <div className="hidden sm:flex items-center gap-1 border border-neutral-700 rounded-lg p-1">
                  {([1, 2, 3, 4] as GridColumns[]).map((cols) => {
                    const Icon = cols === 1 ? List : cols === 2 ? Grid2X2 : cols === 3 ? Grid3X3 : LayoutGrid
                    return (
                      <button
                        key={cols}
                        onClick={() => setGridCols(cols)}
                        className={`p-1.5 rounded-md transition-colors ${
                          gridCols === cols
                            ? 'bg-[#DC2626] text-white'
                            : 'text-neutral-500 hover:text-white'
                        }`}
                        aria-label={`${cols} column${cols > 1 ? 's' : ''} view`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    )
                  })}
                </div>

                {/* Mobile filter */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="md:hidden flex items-center gap-2 text-sm font-medium text-white border border-neutral-700 px-3 py-2 rounded-lg"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-[#DC2626] text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as ProductSort)}
                    className="appearance-none bg-neutral-900 border border-neutral-700 text-sm font-medium text-white pl-3 pr-9 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:border-transparent cursor-pointer"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        Sort: {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Product grid */}
            {loading ? (
              <div className={`grid ${gridClasses[gridCols]} gap-4`}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-neutral-900 rounded-xl animate-pulse border border-neutral-800" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 bg-neutral-900 rounded-xl border border-dashed border-neutral-700">
                <div className="w-14 h-14 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center mb-3">
                  <Search className="w-6 h-6 text-neutral-500" />
                </div>
                <p className="text-base font-semibold text-white">No products found</p>
                <p className="text-sm text-neutral-500 mt-1">Try adjusting your filters</p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="mt-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className={`grid ${gridClasses[gridCols]} gap-4`}>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} basePath="/shop" columns={gridCols} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 sm:gap-2 mt-10">
                    {/* Previous */}
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        page === 1
                          ? 'text-neutral-600 cursor-not-allowed'
                          : 'text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {pageNumbers.map((p, i) =>
                        p === 'ellipsis' ? (
                          <span key={`ellipsis-${i}`} className="px-2 text-neutral-600">
                            ...
                          </span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${
                              page === p
                                ? 'bg-[#DC2626] text-white'
                                : 'text-neutral-300 hover:bg-neutral-800'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                    </div>

                    {/* Next */}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        page === totalPages
                          ? 'text-neutral-600 cursor-not-allowed'
                          : 'text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* WhatsApp Enquiry Banner */}
            <div className="mt-10 bg-neutral-900 border border-neutral-800 rounded-xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-white font-semibold text-base sm:text-lg">
                    Need bigger quantities, custom orders, or a product you don&apos;t see here?
                  </h3>
                  <p className="text-neutral-400 text-sm mt-1">
                    Get in touch — we&apos;ll source it or give you a bulk quote.
                  </p>
                </div>
                <a
                  href="https://wa.me/27000000000?text=Hi%20CXX%2C%20I%27d%20like%20to%20enquire%20about%20a%20product."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm whitespace-nowrap"
                >
                  Enquire on WhatsApp
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-[#0a0a0a] shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-[#0a0a0a] border-b border-neutral-800 px-5 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#DC2626]" />
                Filters
              </h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 text-neutral-400 hover:text-white"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-5">{FiltersPanel}</div>
            <div className="sticky bottom-0 bg-[#0a0a0a] border-t border-neutral-800 px-5 py-4">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold py-3 rounded-lg transition-colors"
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
    <span className="inline-flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-medium pl-3 pr-2 py-1.5 rounded-full">
      {label}
      <button
        onClick={onRemove}
        className="text-neutral-400 hover:text-[#DC2626] transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  )
}
