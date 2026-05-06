import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Coins, BadgeCheck, Package } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// TOP BANNER
// ═══════════════════════════════════════════════════════════════
export function TopBanner() {
  return (
    <div className="bg-[#DC2626] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="py-2.5 text-center text-xs sm:text-sm font-medium tracking-wide">
          Wholesale &amp; Retail Electronics — China Mart, Crown Mines JHB
        </p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════
export function HeroSection() {
  return (
    <section className="relative bg-[#0a0a0a] overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src="https://res.cloudinary.com/dzhwylkfr/image/upload/v1777485480/n2kIN_lmgy9y.jpg"
          alt=""
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/40" />
      </div>

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center text-center py-20 sm:py-28 lg:py-36 min-h-[500px] sm:min-h-[560px] lg:min-h-[620px]">
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight max-w-4xl">
            Wholesale Electronics
            <br />
            <span className="text-[#DC2626]">Direct Importer</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl text-neutral-400 max-w-2xl leading-relaxed text-pretty">
            Chargers, cables, adapters and routers — straight from the importer.
            <br className="hidden sm:block" />
            Stocked at China Mart, Crown Mines.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/shop"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 text-sm sm:text-base"
            >
              Shop Retail Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/bulk"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent border-2 border-neutral-600 hover:border-neutral-400 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 text-sm sm:text-base"
            >
              Browse Bulk Deals
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// BENEFIT CARDS
// ═══════════════════════════════════════════════════════════════
const BENEFITS = [
  {
    icon: Truck,
    title: 'Same-Day Collection',
    description: 'China Mart, Crown Mines',
  },
  {
    icon: Coins,
    title: 'Trade Pricing',
    description: 'From 10+ units',
  },
  {
    icon: BadgeCheck,
    title: 'Quality Guaranteed',
    description: 'Tested with warranty',
  },
  {
    icon: Package,
    title: 'Direct Importer',
    description: 'Lowest prices in JHB',
  },
]

export function BenefitCards() {
  return (
    <section className="bg-[#0a0a0a] border-t border-neutral-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 rounded-xl p-5 sm:p-6 transition-all duration-300"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#DC2626]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#DC2626]/20 transition-colors">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#DC2626]" />
              </div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-1">
                {title}
              </h3>
              <p className="text-neutral-500 text-xs sm:text-sm">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// RED CTA SECTION
// ═══════════════════════════════════════════════════════════════
export function RedCTASection() {
  return (
    <section className="bg-[#DC2626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="flex flex-col items-center text-center">
          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight max-w-2xl">
            Ready to grow your electronics business?
          </h2>

          {/* Subtext */}
          <p className="mt-4 sm:mt-5 text-white/90 text-sm sm:text-base lg:text-lg max-w-xl">
            Best prices &bull; Best products &bull; Wholesale &amp; retail — Direct importer from China
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/shop"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-100 text-[#DC2626] font-semibold px-8 py-4 rounded-lg transition-all duration-200 text-sm sm:text-base"
            >
              Shop Retail Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/bulk"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0a0a0a] hover:bg-neutral-900 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 text-sm sm:text-base"
            >
              Browse Bulk Deals
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
