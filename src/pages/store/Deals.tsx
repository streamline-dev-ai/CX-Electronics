import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, ArrowRight, MessageCircle, BadgePercent, Truck, ShieldCheck, Tag } from 'lucide-react'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import SEO from '../../components/SEO'
import { ProductCardLight } from '../../components/store/ProductCardLight'
import { useProducts } from '../../hooks/useProducts'

const WHATSAPP_NUMBER = '27649533333'

const TIER_HIGHLIGHTS = [
  { qty: '6+', save: '15% off', tone: 'from-[#0F172A] to-[#1E293B]' },
  { qty: '20+', save: '20% off', tone: 'from-[#E63939] to-[#C82020]' },
  { qty: '50+', save: '25% off', tone: 'from-[#0F172A] to-[#1E293B]' },
]

const PERKS = [
  { icon: BadgePercent, title: 'Up to 25% off', sub: 'Wholesale tiers from 6 units' },
  { icon: Truck,        title: 'Same-day dispatch', sub: 'Order before 12pm in JHB' },
  { icon: ShieldCheck,  title: 'Tested stock',     sub: 'Quality verified before shipping' },
  { icon: Tag,          title: 'Direct importer',  sub: 'No middlemen — best price' },
]

export function Deals() {
  const { products: featured, loading: loadingFeatured } = useProducts({ featured: true, sort: 'featured', pageSize: 8 })
  const { products: bulk, loading: loadingBulk } = useProducts({ bulkOnly: true, sort: 'price_asc', pageSize: 8 })

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <SEO
        title="Deals & Wholesale Specials | CW Electronics"
        description="Best deals on electronics in South Africa. Wholesale tiers from 6 units — save up to 25% on chargers, CCTV, solar, routers and more. Direct importer pricing."
        url="/deals"
      />
      <Navbar />

      {/* Hero */}
      <section className="relative bg-[#0F172A] overflow-hidden border-b border-white/5">
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] bg-[#E63939]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[420px] h-[420px] bg-[#E63939]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 bg-[#E63939]/15 border border-[#E63939]/40 rounded-full px-4 py-1.5 text-xs text-[#E63939] font-bold mb-4 uppercase tracking-widest">
              <Flame className="w-3.5 h-3.5" />
              Today's Deals
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-3 text-balance">
              Wholesale Pricing on{' '}
              <span className="text-[#E63939]">Every Product</span>
            </h1>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-6 max-w-2xl">
              Buy 6 or more of any product and unlock instant wholesale pricing — no contracts,
              no minimum order value. Save up to 25% on retail.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/wholesale"
                className="inline-flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold px-6 py-3 rounded-lg transition-all shadow-lg shadow-[#E63939]/30 text-sm"
              >
                Browse Wholesale Catalogue
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi CW — I'd like a wholesale quote.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white font-bold px-6 py-3 rounded-lg transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Get a Custom Quote
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing tiers */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center max-w-xl mx-auto mb-8">
          <p className="text-xs font-bold text-[#E63939] uppercase tracking-widest mb-2">Tiered Savings</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            The more you buy, the more you save
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TIER_HIGHLIGHTS.map((tier, i) => (
            <motion.div
              key={tier.qty}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              className={`bg-gradient-to-br ${tier.tone} text-white rounded-2xl p-6 text-center`}
            >
              <p className="text-[11px] uppercase tracking-widest text-white/60 font-bold mb-1.5">
                Buy {tier.qty} units
              </p>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {tier.save}
              </p>
              <p className="text-xs text-white/70 mt-2">Applied automatically at checkout</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured deals */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-bold text-[#E63939] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                Top Picks This Week
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Featured Deals
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#E63939] hover:gap-2 transition-all"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {loadingFeatured
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
                ))
              : featured.length === 0 ? (
                  <p className="col-span-full text-center text-gray-400 py-12 text-sm">
                    No featured deals right now — check back soon.
                  </p>
                ) : featured.map((p) => (
                  <ProductCardLight key={p.id} product={p} basePath="/shop" />
                ))}
          </div>
        </div>
      </section>

      {/* Bulk-eligible products */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold text-[#E63939] uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <BadgePercent className="w-3.5 h-3.5" />
              Wholesale Ready
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Best Wholesale Value
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Products with the strongest savings when you order in volume.
            </p>
          </div>
          <Link
            to="/wholesale"
            className="inline-flex items-center gap-1 text-sm font-bold text-[#E63939] hover:gap-2 transition-all"
          >
            View Wholesale <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {loadingBulk
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
              ))
            : bulk.length === 0 ? (
                <p className="col-span-full text-center text-gray-400 py-12 text-sm">
                  No wholesale products yet — see our full <Link to="/shop" className="text-[#E63939] font-bold hover:underline">retail catalogue</Link>.
                </p>
              ) : bulk.map((p) => (
                <ProductCardLight key={p.id} product={p} basePath="/bulk" />
              ))}
        </div>
      </section>

      {/* Perks band */}
      <section className="bg-[#0F172A] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {PERKS.map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#E63939]/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#E63939]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{title}</p>
                  <p className="text-xs text-white/60">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-[#E63939] via-[#D62828] to-[#C82020]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 text-balance">
            Need something specific or in bigger volume?
          </h2>
          <p className="text-white/85 max-w-2xl mx-auto mb-7 text-sm sm:text-base">
            WhatsApp our trade desk for a custom quote — we usually respond within an hour.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi CW — I would like a custom wholesale quote.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#E63939] font-bold px-8 py-3.5 rounded-xl text-sm shadow-lg hover:-translate-y-0.5 transition-transform"
          >
            <MessageCircle className="w-4 h-4" />
            Chat on WhatsApp
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}
