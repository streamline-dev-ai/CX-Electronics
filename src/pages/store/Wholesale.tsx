import { useState, useMemo } from 'react'
import { Search, Sliders, X, Package, ArrowRight, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import SEO from '../../components/SEO'
import { useProducts, type ProductSort } from '../../hooks/useProducts'
import { useCategories } from '../../hooks/useCategories'
import { useCart } from '../../context/CartContext'
import { useLang } from '../../context/LangContext'
import { useNavigate } from 'react-router-dom'

const WHATSAPP_NUMBER = '27000000000' // TODO: replace with client's WhatsApp number
const MIN_WHOLESALE_QTY = 6

const PRICE_RANGES = [
  { label: 'Under R100', min: 0, max: 100 },
  { label: 'R100 – R250', min: 100, max: 250 },
  { label: 'R250 – R500', min: 250, max: 500 },
  { label: 'R500 – R1000', min: 500, max: 1000 },
  { label: 'R1000+', min: 1000, max: undefined },
]

export function Wholesale() {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { t } = useLang()
  const { categories } = useCategories()

  const [categorySlug, setCategorySlug] = useState('')
  const [search, setSearch] = useState('')
  const [priceIdx, setPriceIdx] = useState<number | null>(null)
  const [sort, setSort] = useState<ProductSort>('featured')
  const [page, setPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [quantities, setQuantities] = useState<Record<number, number>>({})

  const priceRange = priceIdx !== null ? PRICE_RANGES[priceIdx] : null

  const { products, loading, totalCount } = useProducts({
    bulkOnly: true,
    categorySlug: categorySlug || undefined,
    search: search || undefined,
    minPrice: priceRange?.min,
    maxPrice: priceRange?.max,
    sort,
    page,
    pageSize: 20,
  })

  const activeFilterCount = [categorySlug, search, priceIdx !== null].filter(Boolean).length

  function clearAll() {
    setCategorySlug('')
    setSearch('')
    setPriceIdx(null)
    setPage(1)
  }

  function handleAddToCart(product: any) {
    const qty = quantities[product.id] || MIN_WHOLESALE_QTY
    if (qty < MIN_WHOLESALE_QTY) {
      alert(`Minimum quantity is ${MIN_WHOLESALE_QTY} units`)
      return
    }
    addItem(product.id, qty, true)
    setQuantities((prev) => ({ ...prev, [product.id]: MIN_WHOLESALE_QTY }))
  }

  function handleQuantityChange(productId: number, value: string) {
    const num = parseInt(value) || MIN_WHOLESALE_QTY
    setQuantities((prev) => ({ ...prev, [productId]: num }))
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="Wholesale Pricing | CW Electronics"
        description="Bulk pricing from 6+ units. Direct importer pricing for resellers, installers & businesses. CCTV, solar, chargers, routers & more."
        url="https://cw-electronics.co.za/wholesale"
      />
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 bg-[#E63939]/10 border border-[#E63939]/30 rounded-full px-4 py-1.5 text-xs text-[#E63939] font-bold mb-4 uppercase tracking-widest">
              Bulk Pricing
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] leading-tight mb-3 text-balance">
              Wholesale
            </h1>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-6 max-w-2xl text-pretty">
              Bulk pricing from 6+ units • Direct importer pricing
            </p>
            <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
              Best prices for resellers, traders & installers. Select your quantities, add to cart, or enquire for custom bulk quotes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-4">
                  Categories
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => { setCategorySlug(''); setPage(1) }}
                    className={`w-full text-left text-sm px-4 py-2.5 rounded-lg transition-colors ${
                      !categorySlug
                        ? 'bg-[#E63939] text-white font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setCategorySlug(c.slug); setPage(1) }}
                      className={`w-full text-left text-sm px-4 py-2.5 rounded-lg transition-colors ${
                        categorySlug === c.slug
                          ? 'bg-[#E63939] text-white font-semibold'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-4">
                  Price Range
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => { setPriceIdx(null); setPage(1) }}
                    className={`w-full text-left text-sm px-4 py-2.5 rounded-lg transition-colors ${
                      priceIdx === null
                        ? 'bg-slate-200 text-[#0F172A] font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Any Price
                  </button>
                  {PRICE_RANGES.map((range, idx) => (
                    <button
                      key={range.label}
                      onClick={() => { setPriceIdx(idx); setPage(1) }}
                      className={`w-full text-left text-sm px-4 py-2.5 rounded-lg transition-colors ${
                        priceIdx === idx
                          ? 'bg-slate-200 text-[#0F172A] font-semibold'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearAll}
                  className="w-full text-sm font-semibold text-[#E63939] hover:text-[#C82020] py-2 border-t border-slate-200 pt-4"
                >
                  Clear filters
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Top bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
              {/* Mobile filter button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 text-sm font-medium text-[#0F172A] border border-slate-300 px-3 py-2 rounded-lg hover:bg-white"
              >
                <Sliders className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-[#E63939] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Product count */}
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-[#0F172A]">{products.length}</span> products
              </p>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value as ProductSort); setPage(1) }}
                className="text-sm border border-slate-300 rounded-lg px-3 py-2 font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#E63939]/30 bg-white hover:border-slate-400"
              >
                <option value="featured">Best Selling</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {/* Search */}
            <form
              onSubmit={(e) => { e.preventDefault(); setPage(1) }}
              className="mb-6 flex"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search wholesale products..."
                  className="w-full bg-white text-[#0F172A] placeholder:text-slate-400 pl-11 pr-4 py-3 rounded-l-lg border border-slate-300 border-r-0 focus:outline-none focus:ring-2 focus:ring-[#E63939] focus:border-transparent text-sm"
                />
              </div>
              <button
                type="submit"
                className="bg-[#E63939] hover:bg-[#C82020] text-white font-semibold px-5 py-3 rounded-r-lg transition-colors text-sm"
              >
                Search
              </button>
            </form>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-slate-100 rounded-xl h-96 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Package className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-base font-semibold text-slate-700">No products found</p>
                <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((product) => {
                  const qty = quantities[product.id] || MIN_WHOLESALE_QTY
                  const bulkPrice = product.bulk_price || product.retail_price
                  const totalPrice = bulkPrice * qty

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all"
                    >
                      {/* Image */}
                      <div className="relative aspect-square bg-slate-50 overflow-hidden group">
                        {product.thumbnail_url ? (
                          <img
                            src={product.thumbnail_url}
                            alt={product.name}
                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-slate-200" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        {/* Category */}
                        {product.categories && (
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">
                            {product.categories.name}
                          </p>
                        )}

                        {/* Name */}
                        <h3 className="font-semibold text-[#0F172A] text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                          {product.name}
                        </h3>

                        {/* Price */}
                        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                            Per Unit
                          </p>
                          <p className="text-2xl font-bold text-[#E63939]">
                            R{bulkPrice.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            Min. {MIN_WHOLESALE_QTY} units
                          </p>
                        </div>

                        {/* Quantity Input */}
                        <div className="mb-4">
                          <label className="block text-xs font-medium text-[#0F172A] mb-2">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min={MIN_WHOLESALE_QTY}
                            value={qty}
                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#E63939] focus:border-transparent"
                          />
                        </div>

                        {/* Total */}
                        <div className="mb-4 p-3 bg-[#E63939]/5 rounded-lg">
                          <p className="text-xs text-slate-600 mb-1">Total (approx.)</p>
                          <p className="text-lg font-bold text-[#E63939]">
                            R{totalPrice.toFixed(2)}
                          </p>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-[#E63939] hover:bg-[#C82020] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mb-2"
                        >
                          Add to Cart
                        </button>

                        {/* Product Link */}
                        <button
                          onClick={() => navigate(`/bulk/${product.slug}`)}
                          className="w-full text-[#E63939] hover:text-[#C82020] font-medium py-2 text-sm border-t border-slate-200 pt-3"
                        >
                          View Details
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Enquiry CTA */}
            <div className="mt-12 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-[#0F172A] font-semibold text-base sm:text-lg mb-1">
                    Need larger quantities or a product not listed?
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Enquire on WhatsApp for custom bulk quotes and special pricing
                  </p>
                </div>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I would like to enquire about bulk pricing')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bc59] text-white font-semibold px-6 py-3 rounded-lg transition-all text-sm whitespace-nowrap hover:scale-105"
                >
                  <MessageCircle className="w-4 h-4" />
                  Enquire on WhatsApp
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#0F172A]">Filters</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-3">
                  Categories
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => { setCategorySlug(''); setPage(1); setMobileFiltersOpen(false) }}
                    className={`w-full text-left text-sm px-4 py-2.5 rounded-lg transition-colors ${
                      !categorySlug
                        ? 'bg-[#E63939] text-white font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setCategorySlug(c.slug); setPage(1); setMobileFiltersOpen(false) }}
                      className={`w-full text-left text-sm px-4 py-2.5 rounded-lg transition-colors ${
                        categorySlug === c.slug
                          ? 'bg-[#E63939] text-white font-semibold'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-3">
                  Price Range
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => { setPriceIdx(null); setPage(1); setMobileFiltersOpen(false) }}
                    className={`w-full text-left text-sm px-4 py-2.5 rounded-lg transition-colors ${
                      priceIdx === null
                        ? 'bg-slate-200 text-[#0F172A] font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Any Price
                  </button>
                  {PRICE_RANGES.map((range, idx) => (
                    <button
                      key={range.label}
                      onClick={() => { setPriceIdx(idx); setPage(1); setMobileFiltersOpen(false) }}
                      className={`w-full text-left text-sm px-4 py-2.5 rounded-lg transition-colors ${
                        priceIdx === idx
                          ? 'bg-slate-200 text-[#0F172A] font-semibold'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={() => { clearAll(); setMobileFiltersOpen(false) }}
                  className="w-full text-sm font-semibold text-[#E63939] hover:text-[#C82020] py-2 border-t border-slate-200 pt-4"
                >
                  Clear filters
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  )
}
