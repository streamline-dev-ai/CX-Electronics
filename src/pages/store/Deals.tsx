import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap, Flame, ArrowRight, Phone, MessageCircle, Tag, TrendingDown,
  Package, BadgePercent, ShieldCheck, CheckCircle2, ChevronRight,
} from 'lucide-react'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import SEO from '../../components/SEO'

// ── Featured Deal Cards (big offers) ───────────────────────
const FEATURED_DEALS = [
  {
    id: 'deal-1',
    title: 'USB-C Fast Chargers',
    subtitle: '50 units bundle',
    image: '/products/usb-c-charger.jpg',
    retail: 149,
    bulk: 89,
    minQty: 50,
    badge: '40% OFF',
    accent: 'from-[#E63939] to-[#9B0E0E]',
  },
  {
    id: 'deal-2',
    title: '4K CCTV Camera Kit',
    subtitle: '10-pack security bundle',
    image: '/products/cctv-camera.jpg',
    retail: 899,
    bulk: 749,
    minQty: 10,
    badge: 'Save R1,500',
    accent: 'from-[#0F172A] to-[#374151]',
  },
  {
    id: 'deal-3',
    title: 'Solar Street Lamps',
    subtitle: 'Buy 20 get 4 FREE',
    image: '/products/solar-lamp.jpg',
    retail: 699,
    bulk: 549,
    minQty: 20,
    badge: '4 FREE',
    accent: 'from-[#E63939] to-[#7C0E0E]',
  },
]

// ── Pricing tiers table data ───────────────────────────────
const PRICING_TIERS = [
  {
    code: 'CXX-1001',
    name: 'USB-C Fast Charger 65W',
    image: '/products/usb-c-charger.jpg',
    retail: 149,
    tiers: [
      { qty: '10+', price: 119, save: '20%' },
      { qty: '50+', price: 99, save: '34%' },
      { qty: '100+', price: 89, save: '40%' },
    ],
  },
  {
    code: 'CXX-1002',
    name: '4K CCTV Camera',
    image: '/products/cctv-camera.jpg',
    retail: 899,
    tiers: [
      { qty: '5+', price: 799, save: '11%' },
      { qty: '10+', price: 749, save: '17%' },
      { qty: '25+', price: 699, save: '22%' },
    ],
  },
  {
    code: 'CXX-1003',
    name: 'WiFi 6 Mesh Router',
    image: '/products/wifi-router.jpg',
    retail: 549,
    tiers: [
      { qty: '5+', price: 469, save: '15%' },
      { qty: '20+', price: 419, save: '24%' },
      { qty: '50+', price: 379, save: '31%' },
    ],
  },
  {
    code: 'CXX-1004',
    name: 'Solar Street Lamp 60W',
    image: '/products/solar-lamp.jpg',
    retail: 699,
    tiers: [
      { qty: '10+', price: 599, save: '14%' },
      { qty: '20+', price: 549, save: '21%' },
      { qty: '50+', price: 499, save: '29%' },
    ],
  },
  {
    code: 'CXX-1005',
    name: '100W Power Bank Pro',
    image: '/products/power-bank.jpg',
    retail: 299,
    tiers: [
      { qty: '20+', price: 249, save: '17%' },
      { qty: '50+', price: 219, save: '27%' },
      { qty: '100+', price: 189, save: '37%' },
    ],
  },
  {
    code: 'CXX-1006',
    name: 'Smartwatch Fitness Tracker',
    image: '/products/smartwatch.jpg',
    retail: 399,
    tiers: [
      { qty: '10+', price: 339, save: '15%' },
      { qty: '50+', price: 289, save: '28%' },
      { qty: '100+', price: 249, save: '38%' },
    ],
  },
]

const WHY_BULK = [
  { icon: BadgePercent, title: 'Up to 40% Off', desc: 'Volume pricing direct from importer' },
  { icon: Package, title: 'Pre-built Bundles', desc: 'Ready-to-resell kits and packs' },
  { icon: ShieldCheck, title: 'Quality Guaranteed', desc: 'All products tested before dispatch' },
  { icon: TrendingDown, title: 'Lowest Prices in JHB', desc: 'Beat any quote — guaranteed' },
]

const WA = '27123456789'
const buildWA = (msg: string) =>
  `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`

export function Deals() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="Deals & Specials | CW Electronics Johannesburg"
        description="Hot deals on electronics — bulk discounts, clearance specials & trade pricing. Chargers, CCTV, solar & more. Limited stock, best prices in JHB."
        url="https://cw-electronics.co.za/deals"
      />
      <Navbar />
      <Hero />
      <FeaturedOffers />
      <WhyBulk />
      <PricingTables />
      <FinalCTA />
      <Footer />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative bg-[#0F172A] overflow-hidden">
      {/* Animated lightning bg */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute right-0 top-0 h-full w-1/2 flex items-center justify-end"
        >
          <Zap className="w-[700px] h-[700px] text-[#E63939]" strokeWidth={0.8} />
        </motion.div>
      </div>

      {/* Subtle red glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#E63939]/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 bg-[#E63939]/15 border border-[#E63939]/40 rounded-full px-4 py-1.5 text-xs text-[#E63939] font-bold mb-6 uppercase tracking-widest">
            <Flame className="w-3.5 h-3.5 fill-[#E63939]" />
            Limited-Time Wholesale Offers
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05] mb-5 text-balance">
            Special Bulk Deals.{' '}
            <span className="text-[#E63939]">Save Big</span> on Wholesale.
          </h1>

          <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-2xl text-pretty">
            Resellers, retailers and installers — unlock volume pricing on chargers,
            CCTV, routers, solar lamps and more. The more you order, the more you save.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="#offers"
              className="inline-flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-[#E63939]/30 text-sm hover:shadow-xl hover:shadow-[#E63939]/40 hover:-translate-y-0.5"
            >
              View Today's Offers
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={buildWA('Hi CXX Electronics — I would like a custom bulk quote.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors border border-white/20 text-sm backdrop-blur-sm"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp a Quote
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12 max-w-xl">
            {[
              { v: '40%', l: 'Max Savings' },
              { v: '500+', l: 'Bulk SKUs' },
              { v: '24h', l: 'Quote Response' },
            ].map(({ v, l }, i) => (
              <motion.div
                key={l}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="border-l-2 border-[#E63939]/60 pl-4"
              >
                <p className="text-2xl sm:text-3xl font-extrabold text-white">{v}</p>
                <p className="text-xs text-white/50 uppercase tracking-wider mt-0.5">
                  {l}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
function FeaturedOffers() {
  return (
    <section id="offers" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-[#E63939] uppercase tracking-widest mb-2">
            This Week's Top Offers
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-balance">
            Featured Bulk Deals
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto text-pretty">
            Hand-picked offers updated weekly — limited stock at these prices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {FEATURED_DEALS.map((deal, i) => {
            const savings = Math.round(((deal.retail - deal.bulk) / deal.retail) * 100)
            return (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-2xl hover:shadow-[#E63939]/15 hover:border-[#E63939]/40 transition-all"
              >
                {/* Image */}
                <div className={`relative aspect-[4/3] bg-gradient-to-br ${deal.accent} overflow-hidden flex items-center justify-center`}>
                  <Zap className="w-28 h-28 text-white/25 group-hover:scale-110 transition-transform duration-700" strokeWidth={1.2} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/40 via-transparent to-transparent" />

                  {/* Badge */}
                  <div className="absolute top-4 left-4 bg-white text-[#E63939] text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider">
                    {deal.badge}
                  </div>

                  {/* Min qty pill */}
                  <div className="absolute top-4 right-4 bg-[#0F172A]/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Min {deal.minQty} units
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-extrabold text-gray-900 mb-1">{deal.title}</h3>
                  <p className="text-xs text-gray-500 mb-4">{deal.subtitle}</p>

                  <div className="flex items-end gap-3 mb-5">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider leading-none">
                        Bulk Price
                      </p>
                      <p className="text-3xl font-extrabold text-[#E63939] leading-tight">
                        R{deal.bulk}
                      </p>
                      <p className="text-[10px] text-gray-400 leading-none">per unit</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-xs text-gray-400 line-through">R{deal.retail}</p>
                      <p className="inline-block text-[10px] font-bold bg-[#FEE9E9] text-[#E63939] px-2 py-0.5 rounded-md mt-1">
                        Save {savings}%
                      </p>
                    </div>
                  </div>

                  <a
                    href={buildWA(
                      `Hi CXX, I'd like a quote for ${deal.minQty}+ units of ${deal.title} at R${deal.bulk} each.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#E63939] hover:bg-[#C82020] text-white font-bold py-3 rounded-xl transition-all text-sm group-hover:shadow-lg group-hover:shadow-[#E63939]/30"
                  >
                    Request Bulk Quote
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
function WhyBulk() {
  return (
    <section className="py-14 bg-[#F8FAFC] border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {WHY_BULK.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#E63939]/30 hover:shadow-md transition-all"
            >
              <div className="w-11 h-11 bg-[#FEE9E9] rounded-xl flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-[#E63939]" />
              </div>
              <p className="font-bold text-sm text-gray-900 mb-1">{title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
function PricingTables() {
  const [openId, setOpenId] = useState<string | null>(PRICING_TIERS[0].code)

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-[#E63939] uppercase tracking-widest mb-2">
            Tiered Volume Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-balance">
            Retail vs Bulk Price Sheet
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto text-pretty">
            Click a product to view full tiered pricing — the more you order, the lower your cost per unit.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {PRICING_TIERS.map((p) => {
            const open = openId === p.code
            return (
              <motion.div
                key={p.code}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45 }}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-[#E63939]/40 hover:shadow-lg transition-all"
              >
                {/* Header */}
                <button
                  onClick={() => setOpenId(open ? null : p.code)}
                  className="w-full flex items-center gap-4 p-4 text-left"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={p.image || '/placeholder.svg'}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {p.code}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">
                      Retail: <span className="line-through">R{p.retail}</span>{' '}
                      <span className="ml-1 text-[#E63939] font-bold">
                        from R{p.tiers[p.tiers.length - 1].price}
                      </span>
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                      open ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {/* Tiers */}
                <motion.div
                  initial={false}
                  animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4">
                    <div className="bg-[#0F172A] rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left text-xs font-bold uppercase tracking-wider text-white/50 px-4 py-3">
                              Quantity
                            </th>
                            <th className="text-left text-xs font-bold uppercase tracking-wider text-white/50 px-4 py-3">
                              Price/Unit
                            </th>
                            <th className="text-left text-xs font-bold uppercase tracking-wider text-white/50 px-4 py-3">
                              You Save
                            </th>
                            <th className="text-right text-xs font-bold uppercase tracking-wider text-white/50 px-4 py-3">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.tiers.map((tier, idx) => (
                            <tr
                              key={tier.qty}
                              className={`${idx !== p.tiers.length - 1 ? 'border-b border-white/5' : ''}`}
                            >
                              <td className="px-4 py-3">
                                <span className="inline-block bg-white/10 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                                  {tier.qty} units
                                </span>
                              </td>
                              <td className="px-4 py-3 text-white font-extrabold">
                                R{tier.price}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-[#E63939] font-bold">{tier.save}</span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <a
                                  href={buildWA(
                                    `Hi CXX, please quote me on ${tier.qty} units of ${p.name} (${p.code}) @ R${tier.price} each.`,
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-bold text-[#E63939] hover:text-white hover:bg-[#E63939] px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  Quote
                                  <ArrowRight className="w-3 h-3" />
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>

        {/* Below table info */}
        <div className="mt-10 grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {[
            'Custom quantities? We can quote any volume.',
            'Mix & match across SKUs to hit volume pricing.',
            'Free delivery on bulk orders over R10,000 in JHB.',
            'Trade accounts available — Net 30 terms on approval.',
          ].map((t) => (
            <div key={t} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#E63939] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">{t}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-16 bg-[#0F172A] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <Zap className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] text-[#E63939]" strokeWidth={1} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Tag className="w-10 h-10 text-[#E63939] mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 text-balance">
            Don't see what you need? <span className="text-[#E63939]">Ask us.</span>
          </h2>
          <p className="text-white/60 max-w-xl mx-auto mb-8 text-pretty">
            We import almost every category of consumer electronics — talk to us about
            custom orders, white-label and container-load pricing.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={buildWA('Hi CXX — I would like a custom bulk quote.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1FB855] text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-black/30 text-sm hover:-translate-y-0.5"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Quote
            </a>
            <a
              href="tel:+27123456789"
              className="inline-flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-[#E63939]/30 text-sm hover:-translate-y-0.5"
            >
              <Phone className="w-4 h-4" />
              Call Sales
            </a>
            <Link
              to="/bulk"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors border border-white/20 text-sm"
            >
              Browse Wholesale
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
