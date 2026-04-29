import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import { ProductCard } from '../../components/store/ProductCard'
import { useProducts } from '../../hooks/useProducts'
import { useCategories } from '../../hooks/useCategories'
import { useLang } from '../../context/LangContext'

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const { t } = useLang()
  const { categories } = useCategories()

  const categorySlug = searchParams.get('category') ?? ''
  const search = searchParams.get('q') ?? ''

  // Reset page on filter change
  useEffect(() => { setPage(1) }, [categorySlug, search])

  const { products, loading, totalCount, hasMore } = useProducts({
    categorySlug: categorySlug || undefined,
    search: search || undefined,
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('shop')}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{totalCount} products</p>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters — desktop */}
          <aside className="hidden md:block w-48 flex-shrink-0">
            <div className="sticky top-20">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <SlidersHorizontal className="w-4 h-4" />
                {t('categories')}
              </div>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setCategory('')}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                      !categorySlug ? 'bg-cxx-blue text-white font-medium' : 'text-gray-700 hover:bg-gray-100'
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
                        categorySlug === c.slug ? 'bg-cxx-blue text-white font-medium' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1 min-w-0">
            {/* Mobile category filter */}
            <div className="md:hidden flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setCategory('')}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  !categorySlug ? 'bg-cxx-blue text-white border-cxx-blue' : 'border-gray-300 text-gray-600'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.slug)}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    categorySlug === c.slug ? 'bg-cxx-blue text-white border-cxx-blue' : 'border-gray-300 text-gray-600'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-60 text-gray-400">
                <p className="text-sm">No products found</p>
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
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Previous
                      </button>
                    )}
                    <span className="text-sm text-gray-500">Page {page}</span>
                    {hasMore && (
                      <button
                        onClick={() => setPage((p) => p + 1)}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
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

      <Footer />
    </div>
  )
}
