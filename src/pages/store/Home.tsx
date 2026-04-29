import { Link } from 'react-router-dom'
import {
  Zap, Wifi, Shield, Watch, Sun, Battery, Plug, Cable,
  ArrowRight, ShoppingBag, Truck, Package, Star, ChevronRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import { ProductCard } from '../../components/store/ProductCard'
import { useProducts } from '../../hooks/useProducts'
import { useLang } from '../../context/LangContext'

const CATEGORIES = [
  { slug: 'chargers', icon: Plug, label: 'Chargers & Cables', color: 'bg-orange-50' },
  { slug: 'cctv', icon: Shield, label: 'CCTV Security', color: 'bg-blue-50' },
  { slug: 'routers', icon: Wifi, label: 'Routers & Networking', color: 'bg-green-50' },
  { slug: 'smartwatches', icon: Watch, label: 'Smartwatches', color: 'bg-purple-50' },
  { slug: 'solar', icon: Sun, label: 'Solar Lighting', color: 'bg-yellow-50' },
  { slug: 'accessories', icon: Zap, label: 'Phone Accessories', color: 'bg-red-50' },
  { slug: 'power-banks', icon: Battery, label: 'Power Banks', color: 'bg-teal-50' },
  { slug: 'cables', icon: Cable, label: 'Cables', color: 'bg-pink-50' },
]

const TRUST_BADGES = [
  { icon: Truck, text: 'Nationwide Delivery', sub: 'Free over R2,000' },
  { icon: Package, text: 'Wholesale Available', sub: 'Bulk pricing for traders' },
  { icon: Star, text: 'Quality Guaranteed', sub: 'All products tested' },
  { icon: ShoppingBag, text: 'Easy Returns', sub: '30-day return policy' },
]

export function Home() {
  const { t } = useLang()
  const { products: featured } = useProducts({ featured: true, pageSize: 8 })

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative bg-[#111827] overflow-hidden">
        {/* Grid texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Large decorative lightning bolt */}
        <div className="absolute right-0 top-0 h-full w-1/2 flex items-center justify-end pointer-events-none select-none overflow-hidden">
          <Zap
            className="w-[420px] h-[420px] text-[#E63939] opacity-10 translate-x-16"
            strokeWidth={1}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-2xl"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-[#E63939]/15 border border-[#E63939]/30 rounded-full px-4 py-1.5 text-xs text-[#E63939] font-semibold mb-6 uppercase tracking-wider">
              <Zap className="w-3 h-3 fill-[#E63939]" />
              South Africa&apos;s Wholesale Electronics Hub
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5 text-balance">
              Powering{' '}
              <span className="text-[#E63939]">South Africa</span>
              <br />
              Wholesale Electronics
            </h1>

            <p className="text-white/60 text-lg leading-relaxed mb-8">
              Chargers, CCTV, Solar Lamps &amp; More — Retail &amp; Bulk Pricing Available.
              <br />
              <span className="text-white/40 text-sm">Dragon City, Fordsburg JHB</span>
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold px-7 py-3.5 rounded-xl transition-colors shadow-lg shadow-[#E63939]/30 text-sm"
              >
                {t('shopNow')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/bulk"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors border border-white/20 text-sm"
              >
                <Package className="w-4 h-4" />
                Bulk Deals
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trust Badges ── */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
            {TRUST_BADGES.map(({ icon: Icon, text, sub }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 px-6 py-5"
              >
                <div className="w-10 h-10 bg-[#FEE9E9] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#E63939]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{text}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Categories ── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold text-[#E63939] uppercase tracking-widest mb-1">Browse</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Featured Categories</h2>
            </div>
            <Link
              to="/shop"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#E63939] hover:underline"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORIES.map(({ slug, icon: Icon, label, color }, i) => (
              <motion.div
                key={slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/shop?category=${slug}`}
                  className="flex flex-col items-center gap-2.5 p-4 bg-white rounded-2xl border border-gray-100 hover:border-[#E63939]/40 hover:shadow-lg transition-all group"
                >
                  <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center group-hover:bg-[#E63939] transition-colors`}>
                    <Icon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 text-center leading-tight">
                    {label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Best Sellers ── */}
      {featured.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-bold text-[#E63939] uppercase tracking-widest mb-1">Top Picks</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Best Sellers</h2>
              </div>
              <Link
                to="/shop"
                className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#E63939] hover:underline"
              >
                {t('viewAll')} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 border-2 border-[#E63939] text-[#E63939] hover:bg-[#E63939] hover:text-white font-bold px-8 py-3 rounded-xl transition-colors text-sm"
              >
                View All Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Wholesale CTA Banner ── */}
      <section className="py-16 bg-[#111827] relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-64 flex items-center justify-end pointer-events-none opacity-5">
          <Package className="w-64 h-64 text-white" strokeWidth={0.5} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-between gap-8"
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-[#E63939]/15 rounded-full px-3 py-1 text-xs text-[#E63939] font-semibold mb-3 uppercase tracking-wider">
                <Package className="w-3 h-3" />
                Wholesale Pricing
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 text-balance">
                {t('wholesaleBanner')}
              </h2>
              <p className="text-white/50 max-w-md">{t('wholesaleBannerSub')}</p>
            </div>
            <div className="flex-shrink-0">
              <Link
                to="/bulk"
                className="inline-flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-[#E63939]/20 text-sm whitespace-nowrap"
              >
                {t('getQuote')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
