import { useParams, Link } from 'react-router-dom'
import { MessageCircle, ArrowLeft, Package, Loader2 } from 'lucide-react'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import SEO from '../../components/SEO'
import { useProduct } from '../../hooks/useProduct'
import { useLang } from '../../context/LangContext'

const WHATSAPP_NUMBER = '27000000000' // TODO: replace with client's WhatsApp number

export function BulkProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { product, loading } = useProduct(slug ?? '')
  const { lang, t } = useLang()

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-cxx-blue" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96 text-gray-400 gap-4">
          <Package className="w-12 h-12" />
          <Link to="/bulk" className="text-cxx-blue text-sm hover:underline">← Back to wholesale</Link>
        </div>
      </div>
    )
  }

  const name = lang === 'zh' && product.name_zh ? product.name_zh : product.name
  const description = lang === 'zh' && product.description_zh ? product.description_zh : product.description

  const waMessage = `${t('bulkEnquiryMessage')}: ${product.name}${product.bulk_min_qty ? ` (min. ${product.bulk_min_qty} units)` : ''}. Bulk price: R${product.bulk_price?.toFixed(2) ?? 'TBD'}.`
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`

  const images = product.images.length > 0 ? product.images : [product.thumbnail_url ?? '']

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={`${product.name} — Wholesale | CW Electronics`}
        description={description ? description.slice(0, 160) : `Wholesale pricing on ${product.name}. Bulk discounts available in Johannesburg. Min ${product.bulk_min_qty ?? 6} units.`}
        image={images[0] || undefined}
        url={`https://cw-electronics.co.za/bulk/${product.slug}`}
        type="product"
      />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/bulk" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-cxx-blue mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Wholesale
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden">
            <img
              src={images[0] || ''}
              alt={name}
              className="w-full h-full object-contain p-8"
            />
          </div>

          {/* Info */}
          <div>
            {product.categories && (
              <p className="text-sm text-cxx-blue mb-2">{product.categories.name}</p>
            )}
            <h1 className="text-2xl font-bold text-gray-900 mb-6">{name}</h1>

            {/* Wholesale pricing */}
            <div className="bg-cxx-navy rounded-2xl p-6 mb-6 text-white">
              <p className="text-sm text-white/60 mb-2">{t('bulkPrice')}</p>
              {product.bulk_price ? (
                <p className="text-4xl font-extrabold mb-1">R{product.bulk_price.toFixed(2)}</p>
              ) : (
                <p className="text-2xl font-bold mb-1">Contact for price</p>
              )}
              {product.bulk_min_qty && (
                <p className="text-sm text-white/60">
                  {t('bulkMinQty')}: {product.bulk_min_qty} {t('units')}
                </p>
              )}
              {product.retail_price && product.bulk_price && (
                <p className="text-xs text-cxx-blue mt-3">
                  Retail: R{product.retail_price.toFixed(2)} · Save {Math.round((1 - product.bulk_price / product.retail_price) * 100)}%
                </p>
              )}
            </div>

            {description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-6">{description}</p>
            )}

            {/* WhatsApp CTA — primary bulk enquiry method (TBC: upgrade to cart after client meeting) */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bc59] text-white font-semibold py-4 rounded-xl transition-colors w-full text-lg mb-3"
            >
              <MessageCircle className="w-6 h-6" />
              {t('enquireWhatsApp')}
            </a>

            <p className="text-xs text-center text-gray-400">
              We'll respond within 1 business hour with availability and delivery options.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
