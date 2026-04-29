import { Link } from 'react-router-dom'
import {
  Zap, Wifi, Shield, Watch, Sun, Battery, Plug, Cable,
  ArrowRight, ShoppingBag, Truck, Package, Star,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import { ProductCard } from '../../components/store/ProductCard'
import { useProducts } from '../../hooks/useProducts'
import { useLang } from '../../context/LangContext'

const CATEGORIES = [
  { slug: 'chargers', icon: Plug, labelKey: 'chargers' as const },
  { slug: 'cables', icon: Cable, labelKey: 'cables' as const },
  { slug: 'cctv', icon: Shield, labelKey: 'cctv' as const },
  { slug: 'routers', icon: Wifi, labelKey: 'routers' as const },
  { slug: 'smartwatches', icon: Watch, labelKey: 'smartwatches' as const },
  { slug: 'solar', icon: Sun, labelKey: 'solar' as const },
  { slug: 'power-banks', icon: Battery, labelKey: 'powerBanks' as const },
  { slug: 'accessories', icon: Zap, labelKey: 'accessories' as const },
]

const TRUST_BADGES = [
  { icon: Truck, text: 'Nationwide Delivery', sub: 'Free over R2,000' },
  { icon: Package, text: 'Wholesale Available', sub: 'Bulk pricing for traders' },
  { icon: Star, text: 'Quality Guaranteed', sub: 'All products tested' },
  { icon: ShoppingBag, text: 'Easy Returns', sub: '30-day policy' },
]

export function Home() {
  const { t } = useLang()
  const { products: featured } = useProducts({ featured: true, pageSize: 6 })

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-cxx-navy via-[#0a1628] to-cxx-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-cxx-blue rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-20 w-48 h-48 bg-cxx-blue rounded-full blur-2xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 bg-cxx-blue/20 border border-cxx-blue/30 rounded-full px-3 py-1 text-xs text-cxx-blue font-medium mb-5">
              <Zap className="w-3 h-3" />
              Dragon City, Fordsburg JHB
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              Electronics for<br />
              <span className="text-cxx-blue">Every Need</span>
            </h1>
            <p className="text-white/70 text-lg mb-8">
              Chargers, cables, CCTV, routers & more. Retail and wholesale pricing available.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-cxx-blue hover:bg-cxx-blue-hover text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                {t('shopNow')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/bulk"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-colors border border-white/20"
              >
                {t('bulk')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
            {TRUST_BADGES.map(({ icon: Icon, text, sub }) => (
              <div key={text} className="flex items-center gap-3 px-6 py-5">
                <div className="w-9 h-9 bg-cxx-blue-light rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-cxx-blue" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{text}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-cxx-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{t('shopByCategory')}</h2>
            <Link to="/shop" className="text-sm text-cxx-blue hover:underline flex items-center gap-1">
              {t('viewAll')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {CATEGORIES.map(({ slug, icon: Icon, labelKey }, i) => (
              <motion.div
                key={slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/shop?category=${slug}`}
                  className="flex flex-col items-center gap-2 p-3 sm:p-4 bg-white rounded-2xl border border-gray-100 hover:border-cxx-blue/40 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-cxx-blue-light rounded-xl flex items-center justify-center group-hover:bg-cxx-blue transition-colors">
                    <Icon className="w-5 h-5 text-cxx-blue group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                    {t(labelKey)}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{t('featuredProducts')}</h2>
              <Link to="/shop" className="text-sm text-cxx-blue hover:underline flex items-center gap-1">
                {t('viewAll')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Wholesale CTA */}
      <section className="py-16 bg-cxx-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-cxx-blue/20 rounded-full px-3 py-1 text-xs text-cxx-blue font-medium mb-4">
              <Package className="w-3 h-3" />
              Wholesale
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              {t('wholesaleBanner')}
            </h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto">{t('wholesaleBannerSub')}</p>
            <Link
              to="/bulk"
              className="inline-flex items-center gap-2 bg-cxx-blue hover:bg-cxx-blue-hover text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              {t('getQuote')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
