import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Minus, Plus, ArrowLeft, Package, Loader2, Star } from 'lucide-react'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import { useProduct } from '../../hooks/useProduct'
import { useCart } from '../../context/CartContext'
import { useLang } from '../../context/LangContext'

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { product, loading, error } = useProduct(slug ?? '')
  const { addItem } = useCart()
  const { lang, t } = useLang()
  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState(0)

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

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96 text-gray-400 gap-4">
          <Package className="w-12 h-12" />
          <p>Product not found</p>
          <Link to="/shop" className="text-cxx-blue text-sm hover:underline">← Back to shop</Link>
        </div>
      </div>
    )
  }

  const name = lang === 'zh' && product.name_zh ? product.name_zh : product.name
  const description = lang === 'zh' && product.description_zh ? product.description_zh : product.description
  const isOutOfStock = product.stock_status === 'out_of_stock'
  const images = product.images.length > 0 ? product.images : [product.thumbnail_url ?? '']

  const bulkSavingsPct = product.is_bulk_available && product.bulk_price
    ? Math.round((1 - product.bulk_price / product.retail_price) * 100)
    : 0

  function handleAddToCart() {
    if (isOutOfStock) return
    addItem({
      productId: product!.id,
      name: product!.name,
      price: product!.retail_price,
      quantity: qty,
      image: product!.thumbnail_url ?? '',
      orderType: 'retail',
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/shop" className="flex items-center gap-1 hover:text-cxx-blue transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('shop')}
          </Link>
          {product.categories && (
            <>
              <span>/</span>
              <Link to={`/shop?category=${product.categories.slug}`} className="hover:text-cxx-blue transition-colors">
                {product.categories.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-600 truncate">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3">
              <img
                src={images[activeImage] || ''}
                alt={name}
                className="w-full h-full object-contain p-6"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                      activeImage === i ? 'border-cxx-blue' : 'border-transparent'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-contain p-1 bg-gray-50" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.categories && (
              <Link
                to={`/shop?category=${product.categories.slug}`}
                className="text-sm text-cxx-blue hover:underline mb-2 block"
              >
                {product.categories.name}
              </Link>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">{name}</h1>

            {/* Stock status */}
            <div className="mb-4">
              <span
                className={`text-sm px-3 py-1 rounded-full font-medium ${
                  product.stock_status === 'in_stock'
                    ? 'bg-green-100 text-green-700'
                    : product.stock_status === 'on_order'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {product.stock_status === 'in_stock' ? t('inStock') : product.stock_status === 'out_of_stock' ? t('outOfStock') : t('onOrder')}
              </span>
            </div>

            {/* Retail price */}
            <p className="text-3xl font-extrabold text-gray-900 mb-2">
              R{product.retail_price.toFixed(2)}
            </p>

            {/* Bulk pricing box */}
            {product.is_bulk_available && product.bulk_price && product.bulk_min_qty && (
              <div className="bg-cxx-blue-light border border-cxx-blue/20 rounded-xl p-4 mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-cxx-blue mb-1">
                      {t('bulkPrice')} — Buy {product.bulk_min_qty}+ units
                    </p>
                    <p className="text-2xl font-bold text-cxx-blue">
                      R{product.bulk_price.toFixed(2)}{' '}
                      <span className="text-sm font-normal text-cxx-muted">per unit</span>
                    </p>
                  </div>
                  {bulkSavingsPct > 0 && (
                    <span className="bg-cxx-blue text-white text-sm font-bold px-2 py-1 rounded-lg">
                      {t('bulkSavings')} {bulkSavingsPct}%
                    </span>
                  )}
                </div>
                <Link
                  to={`/bulk/${product.slug}`}
                  className="mt-3 block text-sm text-cxx-blue hover:underline font-medium"
                >
                  {t('enquireWhatsApp')} →
                </Link>
              </div>
            )}

            {/* Description */}
            {description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-6">{description}</p>
            )}

            {/* Reviews Preview */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Customer Reviews</h3>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">4.0 (8 reviews)</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Customer reviews coming soon</p>
            </div>

            {/* Quantity + Add to cart */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-4 py-3 hover:bg-gray-50 text-gray-600 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-semibold text-gray-900">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="px-4 py-3 hover:bg-gray-50 text-gray-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-cxx-blue hover:bg-cxx-blue-hover text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {t('addToCart')}
                </button>
              </div>
            )}

            {isOutOfStock && (
              <div className="py-3 px-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium mb-4">
                {t('outOfStock')} — {lang === 'zh' ? '请稍后再来' : 'Check back soon or contact us'}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
