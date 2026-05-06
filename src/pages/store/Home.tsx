import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap, Wifi, Shield, Watch, Sun, Plug, Smartphone,
  ArrowRight, ChevronLeft, ChevronRight, ShoppingCart,
  Truck, Tag, BadgeCheck, MapPin, Star, TrendingUp,
  Phone, MessageCircle, Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import { TopBanner, HeroSection, BenefitCards, RedCTASection } from '../../components/store/HeroSection'
import SEO from '../../components/SEO'

// ── Branded contact constants ─────────────────────────────────
const WHATSAPP_NUMBER = '27000000000'
const WA_RESELLER = `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20CW%2C%20I%27d%20like%20to%20become%20a%20reseller.`
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
    <div className="min-h-screen bg-[#0a0a0a]">
      <SEO
        title="CXX Electronics — Wholesale & Retail Electronics | Crown Mines JHB"
        description="Direct importer of chargers, CCTV, solar, routers, smartwatches & accessories in Johannesburg. Trade pricing for resellers. Free Gauteng delivery over R2,000."
        url="https://cxx-electronics.co.za/"
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

// ═══════════════════════════════════════════════════════════════
// HERO CAROUSEL with parallax + spring transitions
// ═══════��═══════════════════════════════════════════════════════
function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const yParallax = useTransform(scrollY, [0, 600], [0, 120])
  const opacityParallax = useTransform(scrollY, [0, 400], [1, 0.4])

  useEffect(() => {
    const t = setInterval(
      () => setIndex((i) => (i + 1) % HERO_SLIDES.length),
      6500,
    )
    return () => clearInterval(t)
  }, [])

  const slide = HERO_SLIDES[index]

  function go(delta: number) {
    setIndex((i) => (i + delta + HERO_SLIDES.length) % HERO_SLIDES.length)
  }

  return (
    <section
      ref={heroRef}
      className="relative bg-[#0F172A] overflow-hidden isolate"
    >
      <div className="relative h-[520px] sm:h-[580px] lg:h-[620px]">
        {/* Background parallax */}
        <motion.div
          style={{ y: yParallax, opacity: opacityParallax }}
          className="absolute inset-0"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.9, ease: EASE }}
              className="absolute inset-0"
            >
              <img
                src={slide.image || '/placeholder.svg'}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/90 via-[#0F172A]/60 to-[#0F172A]/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Decorative red lightning bolt */}
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-0 top-0 h-full w-1/2 hidden md:flex items-center justify-end pointer-events-none"
        >
          <Zap
            className="w-[480px] h-[480px] text-[#E63939] opacity-20 translate-x-20"
            strokeWidth={1}
          />
        </motion.div>

        {/* Red glow */}
        <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-[#E63939]/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Content */}
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="max-w-2xl"
            >
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-[#E63939]/15 border border-[#E63939]/40 rounded-full px-4 py-1.5 text-xs text-[#E63939] font-bold mb-5 uppercase tracking-widest backdrop-blur-sm"
              >
                <Zap className="w-3 h-3 fill-[#E63939]" />
                {slide.eyebrow}
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.6, ease: EASE }}
                className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.02] mb-5 text-balance tracking-tight"
              >
                {slide.title}
                <br />
                <span className="bg-gradient-to-r from-[#E63939] via-[#FF6B6B] to-[#E63939] bg-clip-text text-transparent">
                  {slide.titleAccent}
                </span>
              </motion.h1>

              {/* Sub */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.5 }}
                className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 max-w-xl text-pretty"
              >
                {slide.sub}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36, duration: 0.5 }}
                className="flex flex-wrap gap-3"
              >
                <Link
                  to={slide.primary.href}
                  className="group inline-flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-[#E63939]/40 text-sm hover:shadow-xl hover:shadow-[#E63939]/50 hover:-translate-y-0.5"
                >
                  {slide.primary.label}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to={slide.secondary.href}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors border border-white/20 text-sm backdrop-blur-md"
                >
                  {slide.secondary.label}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Arrows */}
        <button
          onClick={() => go(-1)}
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-[#E63939] backdrop-blur-md border border-white/20 rounded-full items-center justify-center text-white transition-all hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => go(1)}
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-[#E63939] backdrop-blur-md border border-white/20 rounded-full items-center justify-center text-white transition-all hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? 'w-10 bg-[#E63939]' : 'w-1.5 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// TRUST BAR
// ═══════════════════════════════════════════════════════════════
function TrustBar() {
  return (
    <section className="bg-white border-b border-gray-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
          {TRUST.map(({ icon: Icon, title, sub }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, ease: EASE }}
              className="flex items-center gap-3 px-5 py-5 group"
            >
              <div className="w-11 h-11 bg-[#FEE9E9] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#E63939] transition-colors">
                <Icon className="w-5 h-5 text-[#E63939] group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{title}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// FEATURED CATEGORIES — dark theme with hover effects
// ═══════════════════════════════════════════════════════════════
function FeaturedCategories() {
  return (
    <section className="py-16 sm:py-24 bg-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <p className="text-xs font-semibold text-[#DC2626] uppercase tracking-widest mb-2">
            Browse By Category
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-balance tracking-tight">
            Featured Categories
          </h2>
          <p className="text-neutral-400 mt-3 max-w-xl mx-auto text-pretty">
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
                className="group block bg-neutral-900 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all overflow-hidden h-full"
              >
                <div className="aspect-[16/10] bg-neutral-800 overflow-hidden relative">
                  <img
                    src={img || '/placeholder.svg'}
                    alt={label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 w-10 h-10 bg-[#DC2626]/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-[#DC2626]/30">
                    <Icon className="w-5 h-5 text-[#DC2626]" />
                  </div>
                </div>

                <div className="p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white mb-0.5 text-base">{label}</h3>
                    <p className="text-xs text-neutral-500">{desc}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#DC2626] group-hover:gap-2 transition-all">
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
            className="group inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold px-8 py-3.5 rounded-lg transition-all text-sm"
          >
            Shop All Products
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/shop?view=categories"
            className="group inline-flex items-center gap-2 border-2 border-neutral-700 text-white hover:border-neutral-500 font-semibold px-8 py-3.5 rounded-lg transition-all text-sm"
          >
            View All Categories
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// STATS BAND with animated counters
// ═══════════════════════════════════════════════════════════════
function StatsBand() {
  return (
    <section className="py-14 bg-[#0a0a0a] border-y border-neutral-800/50">
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
        <span className="text-[#DC2626]">{stat.suffix}</span>
      </p>
      <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold mt-2">
        {stat.label}
      </p>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// BEST SELLERS — dark theme product grid
// ═══════════════════════════════════════════════════════════════
function BestSellers() {
  return (
    <section className="py-16 sm:py-24 bg-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] uppercase tracking-widest mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Top Picks
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Best Sellers
            </h2>
            <p className="text-neutral-400 mt-2 max-w-md text-sm">
              Real products. Real installer prices. Stocked in Crown Mines.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#DC2626] hover:gap-2 transition-all"
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
              className="group bg-neutral-900 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all overflow-hidden flex flex-col will-change-transform"
            >
              <div className="aspect-square bg-neutral-800 relative overflow-hidden">
                <img
                  src={p.image || '/placeholder.svg'}
                  alt={p.name}
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                {p.tag && (
                  <span className="absolute top-3 left-3 bg-[#DC2626] text-white text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {p.tag}
                  </span>
                )}
                {p.bulk && (
                  <span className="absolute top-3 right-3 bg-neutral-900/90 text-white text-[10px] font-semibold px-2 py-1 rounded-md backdrop-blur-sm border border-neutral-700">
                    Bulk R{p.bulk}
                  </span>
                )}

                {/* Hover quick-add overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <button
                    type="button"
                    className="w-full bg-white text-[#DC2626] text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#DC2626] hover:text-white transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Quick Add
                  </button>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3.5 h-3.5 fill-[#FFB400] text-[#FFB400]" />
                  <span className="text-xs font-semibold text-white">{p.rating}</span>
                  <span className="text-xs text-neutral-500">({p.sold} sold)</span>
                </div>

                <h3 className="font-semibold text-sm text-white mb-3 line-clamp-2 min-h-[2.5rem]">
                  {p.name}
                </h3>

                <div className="mt-auto flex items-end justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider leading-none">
                      Retail
                    </p>
                    <p className="text-xl font-bold text-[#DC2626] leading-tight">
                      R{p.price.toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all"
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
            className="group inline-flex items-center gap-2 border-2 border-neutral-700 text-white hover:border-neutral-500 font-semibold px-8 py-3.5 rounded-lg transition-all text-sm"
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
    <section className="py-16 sm:py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <p className="text-xs font-semibold text-[#DC2626] uppercase tracking-widest mb-2">
            Visit Our Showroom
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-balance tracking-tight">
            Find Us at China Mart
          </h2>
          <p className="text-neutral-400 mt-3 text-pretty leading-relaxed">
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
          <div className="lg:col-span-2 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 aspect-[16/10] lg:aspect-auto lg:min-h-[420px]">
            <iframe
              title="CXX Electronics Location — China Mart, Crown Mines, Johannesburg"
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
          <div className="bg-neutral-900 text-white rounded-xl border border-neutral-800 p-7 flex flex-col">
            <div className="w-12 h-12 bg-[#DC2626]/10 rounded-lg flex items-center justify-center mb-5 border border-[#DC2626]/20">
              <MapPin className="w-6 h-6 text-[#DC2626]" />
            </div>
            <h3 className="text-xl font-bold mb-2">Our Showroom</h3>
            <p className="text-neutral-400 text-sm leading-relaxed mb-1">
              China Mart, Shop C15
            </p>
            <p className="text-neutral-400 text-sm leading-relaxed mb-1">
              3 Press Avenue
            </p>
            <p className="text-neutral-400 text-sm leading-relaxed mb-5">
              Crown Mines, Johannesburg, 2092
            </p>

            <div className="space-y-3 text-sm border-t border-neutral-800 pt-5 mb-6">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-[#DC2626] flex-shrink-0" />
                <div>
                  <div className="text-neutral-500 text-xs">Call</div>
                  <a href="tel:+27000000000" className="font-semibold hover:text-[#DC2626] transition-colors">
                    +27 00 000 0000
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle className="w-4 h-4 mt-0.5 text-[#DC2626] flex-shrink-0" />
                <div>
                  <div className="text-neutral-500 text-xs">WhatsApp</div>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:text-[#DC2626] transition-colors"
                  >
                    Chat with us
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 mt-0.5 text-[#DC2626] flex-shrink-0" />
                <div>
                  <div className="text-neutral-500 text-xs">Trading Hours</div>
                  <div className="font-semibold">Mon–Sat: 09:00 – 17:00</div>
                </div>
              </div>
            </div>

            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold px-5 py-3 rounded-lg transition-colors text-sm"
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
// WHY CHOOSE CXX
// ═══════════════════════════════════════════════════════════════
function WhyChooseCW() {
  return (
    <section className="py-20 bg-[#111111] relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-[#DC2626]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
            className="max-w-xl"
          >
            <p className="text-xs font-semibold text-[#DC2626] uppercase tracking-widest mb-3">
              Why Choose CXX Electronics
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 text-balance tracking-tight">
              Trusted by retailers, traders &amp; installers across SA
            </h2>
            <p className="text-neutral-400 leading-relaxed mb-7 text-pretty">
              CXX Electronics is a direct importer based at China Mart, Crown Mines.
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

// ═══════════════════════════════════════════════════════════════
// FINAL CTA — high-conversion, conversion-focused
// ═══════════════════════════════════════════════════════════════
function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#E63939] via-[#D62828] to-[#C82020] relative overflow-hidden">
      {/* Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Sparkles className="w-10 h-10 text-white mx-auto mb-4" />
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 text-balance tracking-tight">
            Ready to grow your security business?
          </h2>
          <p className="text-white/85 text-lg max-w-2xl mx-auto mb-8 text-pretty">
            Join hundreds of South African installers and retailers buying
            smarter from CW Electronics. Get trade pricing today.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={WA_RESELLER}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 bg-white text-[#E63939] font-bold px-8 py-4 rounded-xl transition-all shadow-2xl shadow-black/20 text-sm hover:-translate-y-0.5"
            >
              <MessageCircle className="w-4 h-4" />
              Get Trade Pricing
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-black hover:bg-black/85 text-white font-bold px-8 py-4 rounded-xl transition-all text-sm"
            >
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
