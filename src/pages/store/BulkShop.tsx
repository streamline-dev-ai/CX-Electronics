import { useState } from 'react'
import { Package, MessageCircle } from 'lucide-react'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import { useProducts } from '../../hooks/useProducts'
import { useCategories } from '../../hooks/useCategories'
import { useLang } from '../../context/LangContext'
import { ProductCard } from '../../components/store/ProductCard'

const WHATSAPP_NUMBER = '27000000000' // TODO: replace with client's WhatsApp number

export function BulkShop() {
  const [categorySlug, setCategorySlug] = useState('')
  const [page, setPage] = useState(1)
  const { t } = useLang()
  const { categories } = useCategories()
  const { products, loading, totalCount, hasMore } = useProducts({
    bulkOnly: true,
    categorySlug: categorySlug || undefined,
    page,
    pageSize: 50,
  })

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-cxx-navy to-[#0a1e3d] py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Package className="w-6 h-6 text-cxx-blue" />
            <span className="text-cxx-blue text-sm font-semibold uppercase tracking-wide">Wholesale</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('wholesaleTitle')}</h1>
          <p className="text-white/60">{t('wholesaleSubtitle')}</p>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I would like a wholesale price list')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bc59] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp for Price List
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">{totalCount} wholesale products</p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => { setCategorySlug(''); setPage(1) }}
            className={`flex-shrink-0 text-sm px-4 py-1.5 rounded-full border transition-colors ${
              !categorySlug ? 'bg-cxx-blue text-white border-cxx-blue' : 'border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => { setCategorySlug(c.slug); setPage(1) }}
              className={`flex-shrink-0 text-sm px-4 py-1.5 rounded-full border transition-colors ${
                categorySlug === c.slug ? 'bg-cxx-blue text-white border-cxx-blue' : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-gray-400 gap-3">
            <Package className="w-10 h-10" />
            <p className="text-sm">No wholesale products in this category</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} basePath="/bulk" />
              ))}
            </div>

            {(hasMore || page > 1) && (
              <div className="flex items-center justify-center gap-3 mt-10">
                {page > 1 && (
                  <button onClick={() => setPage((p) => p - 1)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                    Previous
                  </button>
                )}
                <span className="text-sm text-gray-500">Page {page}</span>
                {hasMore && (
                  <button onClick={() => setPage((p) => p + 1)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                    Next
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
