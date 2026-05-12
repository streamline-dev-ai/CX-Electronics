import { Link } from 'react-router-dom'
import { ShoppingCart, ArrowRight, Minus, Plus, Trash2 } from 'lucide-react'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import { useCart } from '../../context/CartContext'
import { useLang } from '../../context/LangContext'

export function CartPage() {
  const { items, subtotal, removeItem, updateQuantity } = useCart()
  const { t } = useLang()

  return (
    <div className="min-h-screen bg-cxx-bg">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('yourCart')}</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">{t('emptyCart')}</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-cxx-blue font-medium hover:underline"
            >
              {t('continueShopping')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Items */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-gray-400">R{item.price.toFixed(2)} each</p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1.5 hover:bg-gray-50 text-gray-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1.5 hover:bg-gray-50 text-gray-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">R{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <Link to="/shop" className="mt-4 inline-flex items-center text-sm text-cxx-blue hover:underline gap-1">
                ← {t('continueShopping')}
              </Link>
            </div>

            {/* Summary */}
            <div className="lg:w-72">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-20">
                <h2 className="font-semibold text-gray-900 mb-4">{t('orderSummary')}</h2>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('subtotal')}</span>
                    <span>R{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{t('shipping')}</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 mb-5">
                  <div className="flex justify-between font-bold text-lg text-gray-900">
                    <span>{t('total')}</span>
                    <span>R{subtotal.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Delivery fee added at the next step.</p>
                </div>

                <Link
                  to="/checkout"
                  className="block w-full text-center bg-cxx-blue hover:bg-cxx-blue-hover text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {t('checkout')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
