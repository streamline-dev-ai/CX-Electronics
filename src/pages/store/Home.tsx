import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Wifi, Shield, Watch, Sun, Plug, Smartphone,
  ArrowRight, ShoppingCart,
  Truck, Tag, BadgeCheck, MapPin, Star, TrendingUp,
  Phone, MessageCircle, Sparkles,
} from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import { TopBanner, HeroSection, BenefitCards, RedCTASection } from '../../components/store/HeroSection'
import SEO from '../../components/SEO'

// ── Branded contact constants ─────────────────────────────────
const WHATSAPP_NUMBER = '27000000000'
const MAP_EMBED =
  'https://www.google.com/maps?q=China+Mart+3+Press+Avenue+Crown+Mines+Johannesburg&output=embed'
const DIRECTIONS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=China+Mart+3+Press+Avenue+Crown+Mines+Johannesburg+2092'

// ── Categories ───────────────────────────────────────────────
const CATEGORIES = [
  { slug: 'chargers', label: 'Chargers & Cables', icon: Plug, desc: 'USB-C, Lightning, Fast Charge', img: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777483174/Chargers_Cables_Category_bcxrsr.jpg' },
  { slug: 'cctv', label: 'CCTV & Security', icon: Shield, desc: '4K Cameras & NVR Kits', img: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777483174/CCTV_Security_Category_2_y2g9zt.jpg' },
  { slug: 'routers', label: 'Routers & Networking', icon: Wifi, desc: 'WiFi 6, LTE, Mesh Systems', img: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777483174/Routers_Networking_Category_um72f1.jpg' },
  { slug: 'smartwatches', label: 'Smartwatches', icon: Watch, desc: 'Fitness & Health Tracking', img: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777483174/Smartwatches_c2flp6.jpg' },
  { slug: 'solar', label: 'Solar Lamps & Lighting', icon: Sun, desc: 'Off-Grid Street Lighting', img: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777483174/Solar_Lamps_Lighting_ev6x1n.jpg' },
  { slug: 'accessories', label: 'Phone & Laptop Accessories', icon: Smartphone, desc: 'Cases, Stands, Adapters', img: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777483174/Phone_Laptop_Accessories_y5kvpa.jpg' },
]

// ── Best Sellers — realistic SA electronics ─────────────────
const BEST_SELLERS = [
  { id: 'bs1', name: '4MP Dual-Lens IP CCTV Camera (PoE)',  price: 899,  bulk: 749,  image: '/products/cctv-camera-1.jpg',     tag: 'Best Seller', rating: 4.9, sold: '420+' },
  { id: 'bs2', name: '8-Channel NVR Kit + 4 Cameras',        price: 4499, bulk: 3999, image: '/products/nvr-kit-1.jpg',         tag: '-12%',        rating: 4.8, sold: '180+' },
  { id: 'bs3', name: '100W Solar LED Street Lamp (IP65)',    price: 699,  bulk: 549,  image: '/products/solar-light-1.jpg',     tag: 'Hot',         rating: 4.7, sold: '650+' },
  { id: 'bs4', name: 'WiFi 6 AX3000 Dual-Band Router',       price: 1299,             image: '/products/ax3000-router-1.jpg',   tag: 'New',         rating: 4.7, sold: '95+' },
  { id: 'bs5', name: '65W GaN USB-C PD Wall Charger',        price: 249,  bulk: 179,  image: '/products/65w-charger-1.jpg',                           rating: 4.8, sold: '910+' },
  { id: 'bs6', name: '30,000mAh Power Bank with PD',         price: 599,  bulk: 449,  image: '/products/powerbank-30k-1.jpg',                         rating: 4.6, sold: '320+' },
  { id: 'bs7', name: '1080p PTZ Indoor Dome Camera',         price: 1099, bulk: 899,  image: '/products/ptz-camera-1.jpg',      tag: '-18%',         rating: 4.7, sold: '210+' },
  { id: 'bs8', name: 'AMOLED Smartwatch X1 (Health Track)',  price: 599,  bulk: 449,  image: '/products/smartwatch-x1-1.jpg',                         rating: 4.5, sold: '500+' },
]

// ── Trust badges ─────────────────────────────────────────────
const TRUST = [
  { icon: Truck,      title: 'Free JHB Delivery',  sub: 'On orders over R2,000' },
  { icon: Tag,        title: 'Trade Pricing',      sub: 'Discounts from 10+ units' },
  { icon: BadgeCheck, title: 'Quality Guaranteed', sub: 'Tested with warranty' },
  { icon: MapPin,     title: 'Click & Collect',    sub: 'China Mart, Crown Mines' },
]

// ── Stats ────────────────────────────────────────────────────
const STATS = [
  { value: 10000, suffix: '+', label: 'Orders Delivered' },
  { value: 500,   suffix: '+', label: 'Trade Customers' },
  { value: 24,    suffix: 'h', label: 'JHB Delivery' },
  { value: 4.9,   suffix: '★', label: 'Customer Rating', isFloat: true },
]

// ── Smooth easing ────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1] as const

// ─────────────────────────────────────────────────────────────
export function Home() {
  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <SEO
        title="CW Electronics — Wholesale & Retail Electronics | Crown Mines JHB"
        description="Direct importer of chargers, CCTV, solar, routers, smartwatches & accessories in Johannesburg. Trade pricing for resellers. Free Gauteng delivery over R2,000."
        url="https://cw-electronics.co.za/"
      />
      <TopBanner />
      <Navbar />
      <HeroSection />
      <BenefitCards />
      <FeaturedCategories />
      <StatsBand />
      <BestSellers />
      <LocationSection />
      <WhyChooseCW />
      <RedCTASection />
      <Footer />
    </div>
  )
}
// ══════════════════════════════════════════════════════════════
// FEATURED CATEGORIES — white background with dark cards
// ══════════════════════════════════════════════════════════════
function FeaturedCategories() {
  return (
    <section className="py-16 sm:py-24 bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <p className="text-xs font-semibold text-[#E63939] uppercase tracking-widest mb-2">
            Browse By Category
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F172A] text-balance tracking-tight">
            Featured Categories
          </h2>
          <p className="text-[#0F172A]/70 mt-3 max-w-xl mx-auto text-pretty">
            From CCTV to chargers — explore the categories driving our biggest sales.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {CATEGORIES.map(({ slug, label, desc, icon: Icon, img }, i) => (
            <motion.div
              key={slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: EASE }}
              whileHover={{ y: -4 }}
              className="will-change-transform"
            >
              <Link
                to={`/shop?category=${slug}`}
                className="group block bg-white rounded-xl border border-[#E5E7EB] hover:border-[#E63939] hover:shadow-lg transition-all overflow-hidden h-full"
              >
                <div className="aspect-[16/10] bg-[#0F172A] overflow-hidden relative">
                  <img
                    src={img || '/placeholder.svg'}
                    alt={label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 w-10 h-10 bg-[#E63939]/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-[#E63939]/40">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="p-5 flex items-center justify-between bg-white">
                  <div>
                    <h3 className="font-semibold text-[#0F172A] mb-0.5 text-base">{label}</h3>
                    <p className="text-xs text-[#0F172A]/60">{desc}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#E63939] group-hover:gap-2 transition-all">
                    Shop
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-semibold px-8 py-3.5 rounded-lg transition-all text-sm"
          >
            Shop All Products
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
            <Link
              to="/shop?view=categories"
              className="group inline-flex items-center gap-2 border-2 border-[#E5E7EB] text-[#0F172A] hover:border-[#E63939] hover:text-[#E63939] font-semibold px-8 py-3.5 rounded-lg transition-all text-sm"
            >
            View All Categories
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function AnimatedStat({
  stat,
  delay,
}: {
  stat: typeof STATS[number]
  delay: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const target = stat.value
    const duration = 1400
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(stat.isFloat ? Number((target * eased).toFixed(1)) : Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, stat.value, stat.isFloat])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      className="text-center"
    >
      <p className="text-4xl sm:text-5xl font-bold tracking-tight">
        <span className="text-white">
          {stat.isFloat ? display.toFixed(1) : display.toLocaleString()}
        </span>
        <span className="text-[#E63939]">{stat.suffix}</span>
      </p>
      <p className="text-xs text-[#FFFFFF]/70 uppercase tracking-widest font-semibold mt-2">
        {stat.label}
      </p>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// STATS BAND with animated counters
// ═══════════════════════════════════════════════════════════════
function StatsBand() {
  return (
    <section className="py-14 bg-[#0F172A] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {STATS.map((s, i) => (
            <AnimatedStat key={s.label} stat={s} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  )
}


// ═══════════════════════════════════════════════════════════════
// BEST SELLERS — dark theme product grid
// ═══════════════════════════════════════════════════════════════
function BestSellers() {
  return (
    <section className="py-16 sm:py-24 bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E63939] uppercase tracking-widest mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Top Picks
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F172A] tracking-tight">
              Best Sellers
            </h2>
            <p className="text-[#0F172A]/70 mt-2 max-w-md text-sm">
              Real products. Real installer prices. Stocked in Crown Mines.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#E63939] hover:gap-2 transition-all"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {BEST_SELLERS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: (i % 4) * 0.06, duration: 0.5, ease: EASE }}
              whileHover={{ y: -4 }}
              className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all overflow-hidden flex flex-col will-change-transform"
            >
              <div className="aspect-square bg-slate-50 relative overflow-hidden">
                <img
                  src={p.image || '/placeholder.svg'}
                  alt={p.name}
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                {p.tag && (
                  <span className="absolute top-3 left-3 bg-[#E63939] text-white text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {p.tag}
                  </span>
                )}
                {p.bulk && (
                  <span className="absolute top-3 right-3 bg-[#0F172A]/90 text-white text-[10px] font-semibold px-2 py-1 rounded-md backdrop-blur-sm">
                    Wholesale R{p.bulk}
                  </span>
                )}

                {/* Hover quick-add overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <button
                    type="button"
                    className="w-full bg-white text-[#E63939] text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#E63939] hover:text-white transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Quick Add
                  </button>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1 bg-white">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3.5 h-3.5 fill-[#FFB400] text-[#FFB400]" />
                  <span className="text-xs font-semibold text-[#0F172A]">{p.rating}</span>
                  <span className="text-xs text-[#0F172A]/60">({p.sold} sold)</span>
                </div>

                <h3 className="font-semibold text-sm text-[#0F172A] mb-3 line-clamp-2 min-h-[2.5rem]">
                  {p.name}
                </h3>

                <div className="mt-auto flex items-end justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-[#0F172A]/60 uppercase tracking-wider leading-none">
                      Retail
                    </p>
                    <p className="text-xl font-bold text-[#E63939] leading-tight">
                      R{p.price.toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-1 bg-[#E63939] hover:bg-[#C82020] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all"
                    aria-label={`Add ${p.name} to cart`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 border-2 border-[#E5E7EB] text-[#0F172A] hover:border-[#E63939] hover:text-[#E63939] font-semibold px-8 py-3.5 rounded-lg transition-all text-sm"
          >
            View All Products
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// LOCATION SECTION — Google Maps + China Mart address
// ═══════════════════════════════════════════════════════════════
function LocationSection() {
  return (
    <section className="py-16 sm:py-24 bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <p className="text-xs font-semibold text-[#E63939] uppercase tracking-widest mb-2">
            Visit Our Showroom
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-balance tracking-tight">
            Find Us at China Mart
          </h2>
          <p className="text-[#FFFFFF]/70 mt-3 text-pretty leading-relaxed">
            Come see our full range in person. We&apos;re at China Mart, Crown Mines —
            ready to help installers, retailers, and walk-in customers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-3 gap-5"
        >
          {/* Map */}
          <div className="lg:col-span-2 rounded-xl overflow-hidden border border-[#E5E7EB] bg-[#F5F5F5] aspect-[16/10] lg:aspect-auto lg:min-h-[420px]">
            <iframe
              title="CW Electronics Location — China Mart, Crown Mines, Johannesburg"
              src={MAP_EMBED}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Address card */}
          <div className="bg-[#0F172A] text-white rounded-xl border border-[#E5E7EB] p-7 flex flex-col">
            <div className="w-12 h-12 bg-[#E63939]/10 rounded-lg flex items-center justify-center mb-5 border border-[#E63939]/20">
              <MapPin className="w-6 h-6 text-[#E63939]" />
            </div>
            <h3 className="text-xl font-bold mb-2">Our Showroom</h3>
            <p className="text-[#FFFFFF]/70 text-sm leading-relaxed mb-1">
              China Mart, Shop C15
            </p>
            <p className="text-[#FFFFFF]/70 text-sm leading-relaxed mb-1">
              3 Press Avenue
            </p>
            <p className="text-[#FFFFFF]/70 text-sm leading-relaxed mb-5">
              Crown Mines, Johannesburg, 2092
            </p>

            <div className="space-y-3 text-sm border-t border-[#E5E7EB] pt-5 mb-6">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-[#E63939] flex-shrink-0" />
                <div>
                  <div className="text-[#FFFFFF]/60 text-xs">Call</div>
                  <a href="tel:+27000000000" className="font-semibold text-white hover:text-[#E63939] transition-colors">
                    +27 00 000 0000
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle className="w-4 h-4 mt-0.5 text-[#E63939] flex-shrink-0" />
                <div>
                  <div className="text-[#FFFFFF]/60 text-xs">WhatsApp</div>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:text-[#E63939] transition-colors"
                  >
                    Chat with us
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 mt-0.5 text-[#E63939] flex-shrink-0" />
                <div>
                  <div className="text-[#FFFFFF]/60 text-xs">Trading Hours</div>
                  <div className="font-semibold">Mon–Sat: 09:00 – 17:00</div>
                </div>
              </div>
            </div>

            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center justify-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-semibold px-5 py-3 rounded-lg transition-colors text-sm"
            >
              <MapPin className="w-4 h-4" />
              Get Directions
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// WHY CHOOSE CW
// ═══════════════════════════════════════════════════════════════
function WhyChooseCW() {
  return (
    <section className="py-20 bg-[#0F172A] relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-[#E63939]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
            className="max-w-xl"
          >
            <p className="text-xs font-semibold text-[#E63939] uppercase tracking-widest mb-3">
              Why Choose CW Electronics
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 text-balance tracking-tight">
              Trusted by retailers, traders &amp; installers across SA
            </h2>
            <p className="text-slate-400 leading-relaxed mb-7 text-pretty">
              CW Electronics is a direct importer based at China Mart, Crown Mines.
              We supply CCTV, networking, solar &amp; mobile electronics at true wholesale
              prices — backed by quality testing and fast nationwide delivery.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/deals"
                className="group inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold px-7 py-3.5 rounded-lg transition-all text-sm"
              >
                Get a Bulk Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="tel:+27000000000"
                className="inline-flex items-center gap-2 border-2 border-neutral-700 hover:border-neutral-500 text-white font-semibold px-7 py-3.5 rounded-lg transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                Call Us
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            className="grid grid-cols-2 gap-3 sm:gap-4 w-full lg:w-auto lg:min-w-[480px]"
          >
            {TRUST.map(({ icon: Icon, title, sub }) => (
              <motion.div
                key={title}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 rounded-xl p-5 transition-all"
              >
                <div className="w-11 h-11 bg-[#DC2626]/10 rounded-lg flex items-center justify-center mb-3 border border-[#DC2626]/20">
                  <Icon className="w-5 h-5 text-[#DC2626]" />
                </div>
                <p className="text-sm font-semibold text-white mb-1">{title}</p>
                <p className="text-xs text-neutral-500 leading-relaxed">{sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}


