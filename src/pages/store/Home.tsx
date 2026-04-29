import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap, Wifi, Shield, Watch, Sun, Plug, Smartphone,
  ArrowRight, ChevronLeft, ChevronRight, ShoppingCart,
  Truck, Tag, BadgeCheck, MapPin, Flame, Star, TrendingUp,
  Phone, MessageCircle, Sparkles, Clock,
} from 'lucide-react'
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'

// ── Hero slides ──────────────────────────────────────────────
const HERO_SLIDES = [
  {
    image: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777485480/n2kIN_lmgy9y.jpg',
    eyebrow: 'New Stock In',
    title: 'Powering South Africa',
    titleAccent: 'Direct from Dragon City',
    sub: 'Wholesale Electronics • Chargers • Cables • Adapters — straight from the importer',
    primary: { label: 'Shop Retail', href: '/shop' },
    secondary: { label: 'Browse Bulk Deals', href: '/deals' },
  },
  {
    image: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777485480/jjm1c_lyxled.jpg',
    eyebrow: 'Security First',
    title: 'CCTV & 4K Surveillance',
    titleAccent: 'Protect Your Business',
    sub: 'IP Cameras, NVRs, Dome Kits — Trade Pricing Available for Installers',
    primary: { label: 'Shop CCTV', href: '/shop?category=cctv' },
    secondary: { label: 'Get Installer Quote', href: '/deals' },
  },
  {
    image: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777485480/buLqZ_cik8zf.jpg',
    eyebrow: 'Off-Grid Ready',
    title: 'Solar Lamps & WiFi',
    titleAccent: 'Built for Africa',
    sub: 'Solar Street Lamps, Power Banks, Routers — Bulk Deals for Resellers',
    primary: { label: 'Shop Solar', href: '/shop?category=solar' },
    secondary: { label: 'Reseller Pricing', href: '/deals' },
  },
]

// ── Categories ───────────────────────────────────────────────
const CATEGORIES = [
  { slug: 'chargers', label: 'Chargers & Cables', icon: Plug, desc: 'USB-C, Lightning, Fast Charge', img: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777483174/Chargers_Cables_Category_bcxrsr.jpg' },
  { slug: 'cctv', label: 'CCTV & Security', icon: Shield, desc: '4K Cameras & NVR Kits', img: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777483174/CCTV_Security_Category_2_y2g9zt.jpg' },
  { slug: 'routers', label: 'Routers & Networking', icon: Wifi, desc: 'WiFi 6, LTE, Mesh Systems', img: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777483174/Routers_Networking_Category_um72f1.jpg' },
  { slug: 'smartwatches', label: 'Smartwatches', icon: Watch, desc: 'Fitness & Health Tracking', img: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777483174/Smartwatches_c2flp6.jpg' },
  { slug: 'solar', label: 'Solar Lamps & Lighting', icon: Sun, desc: 'Off-Grid Street Lighting', img: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777483174/Solar_Lamps_Lighting_ev6x1n.jpg' },
  { slug: 'accessories', label: 'Phone & Laptop Accessories', icon: Smartphone, desc: 'Cases, Stands, Adapters', img: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777483174/Phone_Laptop_Accessories_y5kvpa.jpg' },
]

// ── Best Sellers (placeholder demo) ─────────────────────────
const BEST_SELLERS = [
  { id: 'p1', name: 'USB-C Fast Charger 65W', price: 149, bulk: 99, image: '/products/usb-c-charger.jpg', tag: 'Best Seller', rating: 4.8 },
  { id: 'p2', name: '4K CCTV Camera Kit', price: 899, bulk: 749, image: '/products/cctv-camera.jpg', tag: '-15%', rating: 4.9 },
  { id: 'p3', name: 'WiFi 6 Mesh Router', price: 449, image: '/products/wifi-router.jpg', rating: 4.7 },
  { id: 'p4', name: 'Solar Street Lamp 60W', price: 699, bulk: 549, image: '/products/solar-lamp.jpg', tag: 'Hot', rating: 4.6 },
  { id: 'p5', name: '100W Power Bank Pro', price: 299, image: '/products/power-bank.jpg', rating: 4.8 },
  { id: 'p6', name: 'Smartwatch Fitness Tracker', price: 399, bulk: 329, image: '/products/smartwatch.jpg', tag: 'New', rating: 4.5 },
  { id: 'p7', name: 'Premium HDMI Cable 2m', price: 89, image: '/products/hdmi-cable.jpg', rating: 4.7 },
  { id: 'p8', name: 'Dual USB Car Charger', price: 129, bulk: 89, image: '/products/car-charger.jpg', rating: 4.6 },
]

// ── Trust badges ─────────────────────────────────────────────
const TRUST = [
  { icon: Truck, title: 'Fast JHB Delivery', sub: 'Same-day in Gauteng' },
  { icon: Tag, title: 'Wholesale Prices', sub: 'Direct importer pricing' },
  { icon: BadgeCheck, title: 'Quality Guaranteed', sub: 'All products tested' },
  { icon: MapPin, title: 'Click & Collect', sub: 'Dragon City, Fordsburg' },
]

// ── Stats ────────────────────────────────────────────────────
const STATS = [
  { value: 10000, suffix: '+', label: 'Orders Delivered' },
  { value: 500, suffix: '+', label: 'Active Resellers' },
  { value: 24, suffix: 'h', label: 'JHB Delivery' },
  { value: 4.9, suffix: '★', label: 'Customer Rating', isFloat: true },
]

// ── Smooth easing ────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1] as const

// ─────────────────────────────────────────────────────────────
export function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroCarousel />
      <TrustBar />
      <FeaturedDealStrip />
      <FeaturedCategories />
      <StatsBand />
      <BestSellers />
      <WhyChooseCXX />
      <FinalCTA />
      <Footer />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// HERO CAROUSEL with parallax + spring transitions
// ═══════════════════════════════════════════════════════════════
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
      className="relative bg-[#111827] overflow-hidden isolate"
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
                className="absolute inset-0 w-full h-full object-cover opacity-55"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#111827] via-[#111827]/85 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Decorative red lightning bolt with float animation */}
        <motion.div
          animate={{
            y: [0, -8, 0],
            rotate: [0, 2, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
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
    <section className="bg-white border-b border-gray-100">
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
// FEATURED DEAL STRIP — limited-time hot offer banner
// ═══════════════════════════════════════════════════════════════
function FeaturedDealStrip() {
  return (
    <section className="py-10 sm:py-12 bg-gradient-to-br from-[#111827] via-[#1F2937] to-[#111827] relative overflow-hidden">
      {/* Animated grid bg */}
      <div className="absolute inset-0 opacity-[0.07]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'linear-gradient(#E63939 1px, transparent 1px), linear-gradient(90deg, #E63939 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8"
        >
          {/* Left: badge + content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-flex items-center gap-1.5 bg-[#E63939] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest"
              >
                <Flame className="w-3 h-3" />
                Hot Deal
              </motion.div>
              <div className="inline-flex items-center gap-1.5 text-[#E63939] text-xs font-bold uppercase tracking-widest">
                <Clock className="w-3.5 h-3.5" />
                Limited Time
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 text-balance">
              50× USB-C Chargers — <span className="text-[#E63939]">R89 each</span>
            </h3>
            <p className="text-white/60 text-sm sm:text-base mb-4 text-pretty">
              Save 40% on retail. Min order 50 units, free JHB delivery.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/deals"
                className="group inline-flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-[#E63939]/30 text-sm"
              >
                Claim This Deal
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://wa.me/27123456789?text=Hi%20CXX%2C%20I%27d%20like%20to%20claim%20the%20USB-C%20charger%2050-pack%20deal."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-semibold"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Right: countdown / stat */}
          <div className="flex items-center gap-4 lg:border-l lg:border-white/10 lg:pl-10">
            <div className="text-center">
              <p className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                40%
              </p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold mt-1">
                You Save
              </p>
            </div>
            <div className="w-px h-14 bg-white/10" />
            <div className="text-center">
              <p className="text-4xl sm:text-5xl font-extrabold text-[#E63939]">R89</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold mt-1">
                Per Unit
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// FEATURED CATEGORIES — premium hover lift
// ═══════════════════════════════════════════════════════════════
function FeaturedCategories() {
  return (
    <section className="py-16 sm:py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <p className="text-xs font-bold text-[#E63939] uppercase tracking-widest mb-2">
            Browse By Category
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 text-balance tracking-tight">
            Featured Categories
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto text-pretty">
            From chargers to CCTV — explore our most popular product lines.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {CATEGORIES.map(({ slug, label, desc, icon: Icon, img }, i) => (
            <motion.div
              key={slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: EASE }}
              whileHover={{ y: -6 }}
              className="will-change-transform"
            >
              <Link
                to={`/shop?category=${slug}`}
                className="group block bg-white rounded-2xl border border-gray-100 hover:border-[#E63939]/40 hover:shadow-2xl hover:shadow-[#E63939]/10 transition-all overflow-hidden h-full"
              >
                <div className="aspect-[16/10] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
                  <img
                    src={img || '/placeholder.svg'}
                    alt={label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Icon */}
                  <div className="absolute top-3 left-3 w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:bg-[#E63939] transition-all duration-300">
                    <Icon className="w-5 h-5 text-[#E63939] group-hover:text-white transition-colors" />
                  </div>
                </div>

                <div className="p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-0.5 text-base">{label}</h3>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#E63939] group-hover:gap-2.5 transition-all">
                    Shop
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// STATS BAND with animated counters
// ═══════════════════════════════════════════════════════════════
function StatsBand() {
  return (
    <section className="py-14 bg-white border-y border-gray-100">
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
      <p className="text-4xl sm:text-5xl font-extrabold tracking-tight">
        <span className="bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
          {stat.isFloat ? display.toFixed(1) : display.toLocaleString()}
        </span>
        <span className="text-[#E63939]">{stat.suffix}</span>
      </p>
      <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-2">
        {stat.label}
      </p>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// BEST SELLERS
// ═══════════════════════════════════════════════════════════════
function BestSellers() {
  return (
    <section className="py-16 sm:py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E63939] uppercase tracking-widest mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Top Picks
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              Best Sellers
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-sm font-bold text-[#E63939] hover:gap-2 transition-all"
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
              className="group bg-white rounded-2xl border border-gray-100 hover:border-[#E63939]/40 hover:shadow-2xl hover:shadow-[#E63939]/10 transition-all overflow-hidden flex flex-col will-change-transform"
            >
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                <img
                  src={p.image || '/placeholder.svg'}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                {p.tag && (
                  <span className="absolute top-3 left-3 bg-[#E63939] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-md">
                    {p.tag}
                  </span>
                )}
                {p.bulk && (
                  <span className="absolute top-3 right-3 bg-[#111827] text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-md">
                    Bulk R{p.bulk}
                  </span>
                )}

                {/* Hover quick-add overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <button
                    type="button"
                    className="w-full bg-white text-[#E63939] text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#E63939] hover:text-white transition-colors"
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
                  <span className="text-xs font-bold text-gray-700">{p.rating}</span>
                  <span className="text-xs text-gray-400">(120+ sold)</span>
                </div>

                <h3 className="font-semibold text-sm text-gray-900 mb-3 line-clamp-2 min-h-[2.5rem]">
                  {p.name}
                </h3>

                <div className="mt-auto flex items-end justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider leading-none">
                      Retail
                    </p>
                    <p className="text-xl font-extrabold text-[#E63939] leading-tight">
                      R{p.price}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-1 bg-[#E63939] hover:bg-[#C82020] text-white text-xs font-bold px-3 py-2 rounded-lg transition-all hover:shadow-lg hover:shadow-[#E63939]/30 hover:-translate-y-0.5"
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
            className="group inline-flex items-center gap-2 border-2 border-[#E63939] text-[#E63939] hover:bg-[#E63939] hover:text-white font-bold px-8 py-3.5 rounded-xl transition-all text-sm hover:shadow-lg hover:shadow-[#E63939]/30"
          >
            View All Products
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// WHY CHOOSE CXX
// ═══════════════���═══════════════════════════════════════════════
function WhyChooseCXX() {
  return (
    <section className="py-20 bg-[#111827] relative overflow-hidden">
      {/* Animated bolt */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 1, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-0 top-0 h-full w-1/3 hidden md:flex items-center justify-end pointer-events-none opacity-10"
      >
        <Zap className="w-[460px] h-[460px] text-[#E63939]" strokeWidth={1} />
      </motion.div>

      {/* Glow */}
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-[#E63939]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
            className="max-w-xl"
          >
            <p className="text-xs font-bold text-[#E63939] uppercase tracking-widest mb-3">
              Why Choose CXX
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-5 text-balance tracking-tight">
              Trusted by retailers, traders &amp; installers across SA
            </h2>
            <p className="text-white/60 leading-relaxed mb-7 text-pretty">
              CXX Electronics is a direct importer based in Dragon City, Fordsburg.
              We supply chargers, CCTV, networking, solar &amp; smart accessories at
              true wholesale prices — backed by quality testing and fast nationwide delivery.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/deals"
                className="group inline-flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-[#E63939]/30 text-sm hover:-translate-y-0.5"
              >
                Get a Bulk Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="tel:+27123456789"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors border border-white/20 text-sm backdrop-blur-md"
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
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#E63939]/30 rounded-2xl p-5 transition-all backdrop-blur-md"
              >
                <div className="w-11 h-11 bg-[#E63939]/15 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#E63939]" />
                </div>
                <p className="text-sm font-bold text-white mb-1">{title}</p>
                <p className="text-xs text-white/50 leading-relaxed">{sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// FINAL CTA
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
            Ready to scale your business?
          </h2>
          <p className="text-white/85 text-lg max-w-xl mx-auto mb-8 text-pretty">
            Join 500+ South African resellers buying smarter from CXX Electronics.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/deals"
              className="group inline-flex items-center gap-2 bg-white text-[#E63939] font-bold px-8 py-4 rounded-xl transition-all shadow-2xl shadow-black/20 text-sm hover:-translate-y-0.5"
            >
              See Bulk Deals
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://wa.me/27123456789?text=Hi%20CXX%2C%20I%27d%20like%20to%20become%20a%20reseller."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#111827] hover:bg-black text-white font-bold px-8 py-4 rounded-xl transition-all text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Us
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
