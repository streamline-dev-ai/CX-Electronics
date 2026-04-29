import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, ChevronDown, X, Zap } from 'lucide-react'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import { ProductCard } from '../../components/store/ProductCard'
import { useProducts, type ProductSort } from '../../hooks/useProducts'
import { useCategories } from '../../hooks/useCategories'
import { useLang } from '../../context/LangContext'

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'featured', label: 'Best Selling' },
]

const PRICE_PRESETS = [
  { label: 'Under R200', min: 0, max: 200 },
  { label: 'R200 – R500', min: 200, max: 500 },
  { label: 'R500 – R1000', min: 500, max: 1000 },
  { label: 'R1000+', min: 1000, max: undefined },
]

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')
  const [sort, setSort] = useState<ProductSort>('newest')
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({})
  const [inStockOnly, setInStockOnly] = useState(false)
  const [bulkOnly, setBulkOnly] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const { t } = useLang()
  const { categories } = useCategories()

  const categorySlug = searchParams.get('category') ?? ''
  const search = searchParams.get('q') ?? ''

  // Reset page on filter change
  useEffect(() => {
    setPage(1)
  }, [categorySlug, search, sort, priceRange.min, priceRange.max, inStockOnly, bulkOnly])

  const { products, loading, totalCount, hasMore } = useProducts({
    categorySlug: categorySlug || undefined,
    search: search || undefined,
    sort,
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
    inStockOnly,
    bulkOnly,
    page,
    pageSize: 50,
  })

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
    setSort('newest')
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

  const FiltersPanel = (
    <div className="space-y-7">
      {/* Categories */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          {t('categories')}
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setCategory('')}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                !categorySlug
                  ? 'bg-[#E63939] text-white font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
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
                    ? 'bg-[#E63939] text-white font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
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
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Price Range
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setPriceRange({})}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                priceRange.min === undefined && priceRange.max === undefined
                  ? 'bg-[#111827] text-white font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
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
                      ? 'bg-[#111827] text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
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
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Availability
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#E63939] focus:ring-[#E63939]"
            />
            <span className="text-sm text-gray-700">In stock only</span>
          </label>
          <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={bulkOnly}
              onChange={(e) => setBulkOnly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#E63939] focus:ring-[#E63939]"
            />
            <span className="text-sm text-gray-700">Bulk eligible</span>
          </label>
        </div>
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
      <Navbar />

      {/* Hero / Page Header */}
      <section className="relative bg-[#111827] text-white overflow-hidden">
        {/* Decorative bolt */}
        <div className="pointer-events-none absolute -right-10 -top-10 opacity-10">
          <Zap className="w-72 h-72 text-[#E63939] fill-[#E63939]" strokeWidth={1} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="max-w-2xl">
            <span className="inline-block bg-[#E63939] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              All Products
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-balance">
              {activeCategoryName ? activeCategoryName : 'Shop Electronics'}
              <span className="text-[#E63939]">.</span>
            </h1>
            <p className="text-white/70 mt-3 text-base md:text-lg max-w-xl">
              Wholesale &amp; retail electronics — chargers, CCTV, routers, smartwatches, solar lighting and more.
            </p>

            {/* Search bar */}
            <form onSubmit={applySearch} className="mt-6 flex max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-white text-gray-900 pl-11 pr-4 py-3 rounded-l-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#E63939] text-sm"
                />
              </div>
              <button
                type="submit"
                className="bg-[#E63939] hover:bg-[#C82020] text-white font-semibold px-6 py-3 rounded-r-lg transition-colors text-sm"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Active filters bar */}
      {activeFilterCount > 0 && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">
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
            {inStockOnly && (
              <FilterChip label="In stock" onRemove={() => setInStockOnly(false)} />
            )}
            {bulkOnly && <FilterChip label="Bulk" onRemove={() => setBulkOnly(false)} />}
            <button
              onClick={clearAll}
              className="ml-auto text-xs font-semibold text-[#E63939] hover:text-[#C82020]"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar — desktop */}
          <aside className="hidden md:block w-60 flex-shrink-0">
            <div className="sticky top-28">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-5">
                <SlidersHorizontal className="w-4 h-4 text-[#E63939]" />
                Filters
              </div>
              {FiltersPanel}
            </div>
          </aside>

          {/* Main column */}
          <div className="flex-1 min-w-0">
            {/* Top bar: count + sort + mobile filter */}
            <div className="flex items-center justify-between mb-6 gap-3">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{products.length}</span>
                {totalCount > products.length && (
                  <>
                    {' '}of <span className="font-semibold text-gray-900">{totalCount}</span>
                  </>
                )}{' '}
                products
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="md:hidden flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-300 px-3 py-2 rounded-lg"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-[#E63939] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as ProductSort)}
                    className="appearance-none bg-white border border-gray-300 text-sm font-medium text-gray-700 pl-3 pr-9 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63939] focus:border-transparent cursor-pointer"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        Sort: {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Grid / states */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-3">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-base font-semibold text-gray-900">No products found</p>
                <p className="text-sm text-gray-500 mt-1">
                  Try adjusting your filters or search terms
                </p>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} basePath="/shop" />
                  ))}
                </div>

                {/* Pagination */}
                {(hasMore || page > 1) && (
                  <div className="flex items-center justify-center gap-3 mt-10">
                    {page > 1 && (
                      <button
                        onClick={() => setPage((p) => p - 1)}
                        className="px-5 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </button>
                    )}
                    <span className="text-sm text-gray-500 px-3">Page {page}</span>
                    {hasMore && (
                      <button
                        onClick={() => setPage((p) => p + 1)}
                        className="px-5 py-2.5 text-sm font-semibold bg-[#E63939] hover:bg-[#C82020] text-white rounded-lg transition-colors"
                      >
                        Next
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#E63939]" />
                Filters
              </h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-900"
                aria-label="Close filters"
              >
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
    <span className="inline-flex items-center gap-1.5 bg-white border border-gray-300 text-gray-800 text-xs font-medium pl-3 pr-2 py-1.5 rounded-full">
      {label}
      <button
        onClick={onRemove}
        className="text-gray-500 hover:text-[#E63939] transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  )
}
