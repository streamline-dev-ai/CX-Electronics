import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  ShoppingCart, Menu, X, Zap, Search, Heart, User, ChevronDown,
  Plug, Shield, Wifi, Watch, Sun, Smartphone,
} from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useLang } from '../../context/LangContext'
import { useWishlist } from '../../context/WishlistContext'
import { CartDrawer } from './CartDrawer'

const navLinks = [
  { to: '/', label: 'Home', exact: true },
  { to: '/shop', label: 'Shop' },
  { to: '/deals', label: 'Deals' },
  { to: '/bulk', label: 'Wholesale' },
  { to: '/about', label: 'About' },
]

const CATEGORIES = [
  { slug: 'chargers', label: 'Chargers & Cables', icon: Plug },
  { slug: 'cctv', label: 'CCTV & Security', icon: Shield },
  { slug: 'routers', label: 'Routers & Networking', icon: Wifi },
  { slug: 'smartwatches', label: 'Smartwatches', icon: Watch },
  { slug: 'solar', label: 'Solar Lamps', icon: Sun },
  { slug: 'accessories', label: 'Phone Accessories', icon: Smartphone },
]

export function Navbar() {
  const { itemCount, openCart } = useCart()
  const { lang, setLang } = useLang()
  const { ids: wishlistIds } = useWishlist()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [catsOpen, setCatsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const catsRef = useRef<HTMLDivElement>(null)

  // Close categories dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (catsRef.current && !catsRef.current.contains(e.target as Node)) {
        setCatsOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchValue.trim()
    if (q) navigate(`/shop?q=${encodeURIComponent(q)}`)
    else navigate('/shop')
    setMobileOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-black shadow-lg shadow-black/50">
        {/* Top promo bar */}
        <div className="bg-[#E63939] py-1.5 text-center text-xs text-white font-semibold tracking-wide">
          Wholesale &amp; Retail Electronics — China Mart, Crown Mines JHB &nbsp;|&nbsp; Free delivery on orders over R2,000
        </div>

        {/* Main row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-4 lg:gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0"><img src="https://res.cloudinary.com/dzhwylkfr/image/upload/v1777722832/CW-Logo_ujfdip.png" alt="CW Electronics Logo" className="h-10 w-auto" /></Link>

          {/* Desktop search bar (centered) */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex flex-1 max-w-xl mx-4"
          >
            <div className="flex w-full bg-white rounded-lg overflow-hidden">
              <input
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search chargers, CCTV, routers..."
                className="flex-1 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#E63939] hover:bg-[#C82020] px-5 flex items-center justify-center transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Lang toggle */}
            <div className="hidden xl:flex items-center border border-white/20 rounded-lg overflow-hidden text-xs">
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1.5 transition-colors ${lang === 'en' ? 'bg-[#E63939] text-white font-semibold' : 'text-white/60 hover:text-white'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('zh')}
                className={`px-2.5 py-1.5 transition-colors ${lang === 'zh' ? 'bg-[#E63939] text-white font-semibold' : 'text-white/60 hover:text-white'}`}
              >
                ä¸­æ–‡
              </button>
            </div>

            {/* Wishlist */}
            <Link
              to="/account/wishlist"
              aria-label="Wishlist"
              className="hidden sm:flex relative p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Heart className={`w-5 h-5 ${wishlistIds.length > 0 ? 'fill-[#E63939] text-[#E63939]' : ''}`} />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E63939] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#111827]">
                  {wishlistIds.length > 9 ? '9+' : wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Account */}
            <Link
              to="/account/login"
              aria-label="My Account"
              className="hidden sm:flex p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden md:inline">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#E63939] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-black">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Get a Quote â€” desktop only */}
            <Link
              to="/bulk"
              className="hidden lg:inline-flex items-center gap-1.5 bg-[#E63939] hover:bg-[#C82020] text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors shadow-md shadow-[#E63939]/30 whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              Get a Quote
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 text-white/80 hover:text-white rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Secondary nav row (desktop) */}
        <div className="hidden lg:block border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-11 gap-1">
            {navLinks.map(({ to, label, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                    isActive ? 'text-[#E63939]' : 'text-white/80 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            {/* Categories dropdown */}
            <div ref={catsRef} className="relative">
              <button
                onClick={() => setCatsOpen((v) => !v)}
                className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-white/80 hover:text-white rounded-md transition-colors"
              >
                Categories
                <ChevronDown className={`w-4 h-4 transition-transform ${catsOpen ? 'rotate-180' : ''}`} />
              </button>

              {catsOpen && (
                <div className="absolute left-0 top-full mt-1 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-50">
                  {CATEGORIES.map(({ slug, label, icon: Icon }) => (
                    <Link
                      key={slug}
                      to={`/shop?category=${slug}`}
                      onClick={() => setCatsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#FEE9E9] group transition-colors"
                    >
                      <div className="w-8 h-8 bg-gray-100 group-hover:bg-[#E63939] rounded-lg flex items-center justify-center transition-colors">
                        <Icon className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 bg-black px-4 py-4">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex bg-white rounded-lg overflow-hidden">
                <input
                  type="search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#E63939] px-5 flex items-center justify-center"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>
            </form>

            {navLinks.map(({ to, label, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block py-3 text-sm border-b border-white/10 ${isActive ? 'text-[#E63939] font-semibold' : 'text-white/70'}`
                }
              >
                {label}
              </NavLink>
            ))}

            <p className="mt-4 mb-2 text-[10px] uppercase tracking-widest text-white/40 font-bold">
              Categories
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(({ slug, label, icon: Icon }) => (
                <Link
                  key={slug}
                  to={`/shop?category=${slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 p-2.5 bg-white/5 rounded-lg text-xs text-white/80 hover:bg-white/10"
                >
                  <Icon className="w-4 h-4 text-[#E63939]" />
                  {label}
                </Link>
              ))}
            </div>

            <Link
              to="/bulk"
              onClick={() => setMobileOpen(false)}
              className="mt-4 flex items-center justify-center gap-1.5 bg-[#E63939] hover:bg-[#C82020] text-white text-sm font-bold px-4 py-3 rounded-lg w-full"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              Get a Quote
            </Link>

            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/10">
              <span className="text-xs text-white/40">Language:</span>
              <button
                onClick={() => setLang('en')}
                className={`text-sm ${lang === 'en' ? 'text-[#E63939] font-semibold' : 'text-white/60'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('zh')}
                className={`text-sm ${lang === 'zh' ? 'text-[#E63939] font-semibold' : 'text-white/60'}`}
              >
                ä¸­æ–‡
              </button>
            </div>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  )
}


