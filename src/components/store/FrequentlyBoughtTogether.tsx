import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Check, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '../../context/CartContext'
import { useProducts } from '../../hooks/useProducts'

interface FrequentlyBoughtTogetherProps {
  currentProductId: string
  categorySlug?: string
}

export function FrequentlyBoughtTogether({ currentProductId, categorySlug }: FrequentlyBoughtTogetherProps) {
  const { addItem } = useCart()
  const { products } = useProducts({
    categorySlug,
    pageSize: 6,
    sort: 'featured',
  })

  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  // Get 2-3 complementary products
  const complementary = products
    .filter((p) => p.id !== currentProductId)
    .slice(0, 3)

  if (complementary.length === 0) return null

  const bundleTotal = complementary.reduce((sum, p) => sum + p.retail_price, 0)
  const bundleSavings = Math.round(bundleTotal * 0.1) // 10% bundle discount

  function handleAddToBundle(product: any) {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.retail_price,
      quantity: 1,
      image: product.thumbnail_url ?? '',
      orderType: 'retail',
    })
    setAddedIds((prev) => new Set(prev).add(product.id))
  }

  function handleAddAll() {
    complementary.forEach((p) => {
      addItem({
        productId: p.id,
        name: p.name,
        price: p.retail_price,
        quantity: 1,
        image: p.thumbnail_url ?? '',
        orderType: 'retail',
      })
    })
    setAddedIds(new Set(complementary.map((p) => p.id)))
  }

  return (
    <section className="mt-16 py-12 bg-[#F5F5F5] border border-[#E5E7EB] rounded-2xl">
      <div className="px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#E63939] uppercase tracking-widest mb-2">
            <Zap className="w-3.5 h-3.5 fill-[#E63939]" />
            Bundle Deal
          </div>
          <h2 className="text-2xl font-bold text-[#000000] mb-2">
            Frequently Bought Together
          </h2>
          <p className="text-sm text-[#000000]/60">
            Complete your setup with these popular complementary products — save up to 10% when you bundle!
          </p>
        </motion.div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {complementary.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl border border-[#E5E7EB] hover:border-[#E63939]/30 transition-colors overflow-hidden group"
            >
              <div className="aspect-square bg-[#F5F5F5] relative overflow-hidden">
                {product.thumbnail_url && (
                  <img
                    src={product.thumbnail_url}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                {addedIds.has(product.id) && (
                  <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                    <div className="bg-emerald-500 rounded-full p-2">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4">
                <Link
                  to={`/shop/${product.slug}`}
                  className="font-semibold text-sm text-[#000000] hover:text-[#E63939] line-clamp-2 mb-2 block"
                >
                  {product.name}
                </Link>
                <p className="text-lg font-bold text-[#E63939] mb-3">
                  R{product.retail_price.toFixed(2)}
                </p>
                <button
                  onClick={() => handleAddToBundle(product)}
                  disabled={addedIds.has(product.id)}
                  className={`w-full py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                    addedIds.has(product.id)
                      ? 'bg-emerald-100 text-emerald-700 cursor-default'
                      : 'bg-[#000000] text-white hover:bg-[#E63939]'
                  }`}
                >
                  {addedIds.has(product.id) ? 'Added ✓' : 'Add to Bundle'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bundle CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl border-2 border-[#E63939]/30"
        >
          <div>
            <p className="text-sm text-[#000000]/60 mb-1">
              Bundle all {complementary.length} items and save:
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#000000]">
                R{bundleTotal.toFixed(2)}
              </span>
              <span className="text-sm text-[#000000]/50 line-through">
                R{(bundleTotal + bundleSavings).toFixed(2)}
              </span>
            </div>
          </div>
          <button
            onClick={handleAddAll}
            className="flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold px-6 py-3 rounded-lg transition-all whitespace-nowrap"
          >
            <ShoppingCart className="w-4 h-4" />
            Add All to Cart
          </button>
        </motion.div>
      </div>
    </section>
  )
}
