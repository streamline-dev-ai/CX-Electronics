import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  ShoppingCart, Menu, X, Zap, Search, Heart, User, ChevronDown,
  Plug, Shield, Wifi, Watch, Sun, Smartphone,
} from 'lucide-react'
import { useCart } from '../../context/CartContext'
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
  { slug: 'chargers',     label: 'Chargers & Cables',       icon: Plug },
  { slug: 'cctv',        label: 'CCTV & Security',          icon: Shield },
  { slug: 'routers',     label: 'Routers & Networking',     icon: Wifi },
  { slug: 'smartwatches',label: 'Smartwatches',             icon: Watch },
  { slug: 'solar',       label: 'Solar Lamps',              icon: Sun },
  { slug: 'accessories', label: 'Phone Accessories',        icon: Smartphone },
]

export function Navbar() {
  const { itemCount, openCart } = useCart()
  const { ids: wishlistIds } = useWishlist()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [catsOpen, setCatsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const catsRef = useRef<HTMLDivElement>(null)

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
      <header className="sticky top-0 z-40 bg-[#0a0a0a] border-b border-neutral-800">
        {/* Main row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-4 lg:gap-6">
          {/* Logo + brand name */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-[#DC2626] rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="hidden sm:block leading-tight">
              <span className="font-bold text-white text-base tracking-tight">CXX Electronics</span>
              <span className="block text-[10px] text-neutral-500 font-medium uppercase tracking-widest -mt-0.5">
                Wholesale &amp; Retail
              </span>
            </div>
          </Link>

          {/* Desktop search bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl mx-4">
            <div className="flex w-full bg-neutral-900 border border-neutral-700 rounded-lg overflow-hidden transition-colors focus-within:border-[#DC2626]">
              <input
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search chargers, CCTV, routers..."
                className="flex-1 px-4 py-2 text-sm bg-transparent text-white placeholder:text-neutral-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#DC2626] hover:bg-[#B91C1C] px-5 flex items-center justify-center transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Wishlist */}
            <Link
              to="/account/wishlist"
              aria-label="Wishlist"
              className="hidden sm:flex relative p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <Heart className={`w-5 h-5 ${wishlistIds.length > 0 ? 'fill-[#DC2626] text-[#DC2626]' : ''}`} />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#DC2626] text-white text-[9px] font-semibold rounded-full flex items-center justify-center ring-2 ring-[#0a0a0a]">
                  {wishlistIds.length > 9 ? '9+' : wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Account */}
            <Link
              to="/account/login"
              aria-label="My Account"
              className="hidden sm:flex p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden md:inline">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#DC2626] text-white text-[10px] font-semibold rounded-full flex items-center justify-center ring-2 ring-[#0a0a0a]">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Get a Quote */}
            <Link
              to="/bulk"
              className="hidden lg:inline-flex items-center gap-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              Get a Quote
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 text-neutral-400 hover:text-white rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Secondary nav row (desktop) */}
        <div className="hidden lg:block border-t border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-11 gap-1">
            {navLinks.map(({ to, label, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive ? 'text-[#DC2626]' : 'text-neutral-400 hover:text-white'
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
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white rounded-md transition-colors"
              >
                Categories
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${catsOpen ? 'rotate-180' : ''}`} />
              </button>

              {catsOpen && (
                <div className="absolute left-0 top-full mt-1 w-72 bg-neutral-900 rounded-xl border border-neutral-800 p-2 z-50">
                  {CATEGORIES.map(({ slug, label, icon: Icon }) => (
                    <Link
                      key={slug}
                      to={`/shop?category=${slug}`}
                      onClick={() => setCatsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-800 group transition-colors"
                    >
                      <div className="w-8 h-8 bg-neutral-800 group-hover:bg-[#DC2626] rounded-lg flex items-center justify-center transition-colors">
                        <Icon className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-neutral-200">{label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-neutral-800 bg-[#0a0a0a] px-4 py-4">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex bg-neutral-900 border border-neutral-700 rounded-lg overflow-hidden">
                <input
                  type="search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-4 py-2.5 text-sm text-white bg-transparent placeholder:text-neutral-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#DC2626] px-5 flex items-center justify-center"
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
                  `block py-3 text-sm border-b border-neutral-800 ${isActive ? 'text-[#DC2626] font-semibold' : 'text-neutral-400'}`
                }
              >
                {label}
              </NavLink>
            ))}

            <p className="mt-4 mb-2 text-[10px] uppercase tracking-widest text-neutral-600 font-semibold">
              Categories
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(({ slug, label, icon: Icon }) => (
                <Link
                  key={slug}
                  to={`/shop?category=${slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300 hover:bg-neutral-800 transition-colors"
                >
                  <Icon className="w-4 h-4 text-[#DC2626]" />
                  {label}
                </Link>
              ))}
            </div>

            <Link
              to="/bulk"
              onClick={() => setMobileOpen(false)}
              className="mt-4 flex items-center justify-center gap-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-semibold px-4 py-3 rounded-lg w-full transition-colors"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              Get a Quote
            </Link>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  )
}
