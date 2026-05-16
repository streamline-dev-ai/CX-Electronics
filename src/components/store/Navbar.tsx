import { useState, useRef, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  ShoppingCart, Menu, X, Search, Heart, User, ChevronDown, MessageCircle,
  Package, LogOut, LogIn,
} from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { useCategories } from '../../hooks/useCategories'
import { CartDrawer } from './CartDrawer'
import { NavbarSearch } from './NavbarSearch'
import { getCategoryIcon } from '../../lib/categoryIcons'

function useScrolled(threshold = 12): boolean {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > threshold) }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}

const navLinks = [
  { to: '/', label: 'Home', exact: true },
  { to: '/shop', label: 'Shop' },
  { to: '/deals', label: 'Deals' },
  { to: '/wholesale', label: 'Wholesale' },
  { to: '/about', label: 'About' },
]

const WHATSAPP_NUMBER = '27649533333'
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi CW Electronics — I'd like to chat about a product.")}`

// CW Electronics logo URL
const LOGO_URL = 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777722832/CW-Logo_ujfdip.png'

export function Navbar() {
  const { itemCount, openCart } = useCart()
  const { ids: wishlistIds } = useWishlist()
  const { categories } = useCategories()
  const { user, signOut } = useCustomerAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [catsOpen, setCatsOpen] = useState(false)
  const [acctOpen, setAcctOpen] = useState(false)
  const catsRef = useRef<HTMLDivElement>(null)
  const acctRef = useRef<HTMLDivElement>(null)
  const scrolled = useScrolled(8)

  const firstName = user?.name?.trim().split(/\s+/)[0] || 'Account'

  const navCategories = categories.map((c) => ({
    slug: c.slug,
    label: c.name,
    icon: getCategoryIcon(c.slug),
  }))

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (catsRef.current && !catsRef.current.contains(e.target as Node)) {
        setCatsOpen(false)
      }
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) {
        setAcctOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0F172A]/85 backdrop-blur-xl border-b border-slate-700/60 shadow-lg shadow-black/20'
            : 'bg-[#0F172A] border-b border-slate-700'
        }`}
      >
        {/* ── Mobile row (lg:hidden) ── */}
        <div className="lg:hidden px-3 sm:px-4 h-16 grid grid-cols-[auto_1fr_auto] items-center gap-2">
          {/* Left: hamburger */}
          <button
            onClick={() => { setMobileOpen((v) => !v); setMobileSearchOpen(false) }}
            className="p-2 text-slate-300 hover:text-white rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Center: logo + brand */}
          <Link to="/" className="flex items-center justify-center gap-2 min-w-0">
            <img src={LOGO_URL} alt="CW Electronics" className="h-8 w-auto flex-shrink-0" />
            <span className="font-bold text-white text-sm sm:text-base tracking-tight truncate">
              CW Electronics
            </span>
          </Link>

          {/* Right: search + wishlist + cart */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => { setMobileSearchOpen((v) => !v); setMobileOpen(false) }}
              aria-label="Search"
              className={`p-2 rounded-lg transition-colors ${
                mobileSearchOpen ? 'bg-slate-700 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              to="/account/wishlist"
              aria-label="Wishlist"
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Heart className={`w-5 h-5 ${wishlistIds.length > 0 ? 'fill-[#E63939] text-[#E63939]' : ''}`} />
              {wishlistIds.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#E63939] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#0F172A]">
                  {wishlistIds.length > 9 ? '9+' : wishlistIds.length}
                </span>
              )}
            </Link>
            <button
              onClick={openCart}
              aria-label="Cart"
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-[#E63939] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#0F172A]">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile: inline search bar (toggled via Search icon) */}
        {mobileSearchOpen && (
          <div className="lg:hidden px-3 sm:px-4 pb-3">
            <NavbarSearch
              variant="mobile"
              onNavigate={() => setMobileSearchOpen(false)}
            />
          </div>
        )}

        {/* ── Desktop row (lg+) ── */}
        <div className="hidden lg:flex max-w-7xl mx-auto px-4 sm:px-6 items-center h-16 gap-6">
          {/* Logo + brand name */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <img src={LOGO_URL} alt="CW Electronics" className="h-9 w-auto" />
            <div className="leading-tight">
              <span className="font-bold text-white text-base tracking-tight">CW Electronics</span>
              <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-widest -mt-0.5">
                Wholesale &amp; Retail
              </span>
            </div>
          </Link>

          {/* Desktop search bar with autocomplete */}
          <div className="flex-1 max-w-xl mx-4">
            <NavbarSearch variant="desktop" />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            <Link
              to="/account/wishlist"
              aria-label="Wishlist"
              className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Heart className={`w-5 h-5 ${wishlistIds.length > 0 ? 'fill-[#E63939] text-[#E63939]' : ''}`} />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E63939] text-white text-[9px] font-semibold rounded-full flex items-center justify-center ring-2 ring-[#0F172A]">
                  {wishlistIds.length > 9 ? '9+' : wishlistIds.length}
                </span>
              )}
            </Link>

            {user ? (
              <div ref={acctRef} className="relative">
                <button
                  onClick={() => setAcctOpen((v) => !v)}
                  className="flex items-center gap-1.5 p-2 pr-2.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  aria-label="My Account"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium max-w-[7rem] truncate">{firstName}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${acctOpen ? 'rotate-180' : ''}`} />
                </button>

                {acctOpen && (
                  <div className="absolute right-0 top-full mt-1 w-60 bg-slate-800 rounded-xl border border-slate-700 p-2 z-50 shadow-2xl">
                    <div className="px-3 py-2 mb-1 border-b border-slate-700">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mb-0.5">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                    </div>
                    <Link to="/account/profile" onClick={() => setAcctOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-700 transition-colors">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <Link to="/account/orders" onClick={() => setAcctOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-700 transition-colors">
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                    <Link to="/account/wishlist" onClick={() => setAcctOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-700 transition-colors">
                      <Heart className="w-4 h-4" /> Wishlist
                    </Link>
                    <button
                      onClick={() => { setAcctOpen(false); signOut() }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border-t border-slate-700"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/account/login"
                aria-label="Sign in"
                className="flex items-center gap-1.5 p-2 pr-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">Sign in</span>
              </Link>
            )}

            <button
              onClick={openCart}
              className="relative flex items-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#E63939] text-white text-[10px] font-semibold rounded-full flex items-center justify-center ring-2 ring-[#0F172A]">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#E63939] hover:bg-[#C82020] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Contact Us
            </a>
          </div>
        </div>

        {/* Secondary nav row (desktop) */}
        <div className="hidden lg:block border-t border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-11 gap-1">
            {navLinks.map(({ to, label, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive ? 'text-[#E63939]' : 'text-slate-300 hover:text-white'
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
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-md transition-colors"
              >
                Categories
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${catsOpen ? 'rotate-180' : ''}`} />
              </button>

              {catsOpen && (
                <div className="absolute left-0 top-full mt-1 w-72 max-h-[70vh] overflow-y-auto bg-slate-800 rounded-xl border border-slate-700 p-2 z-50 shadow-2xl">
                  {navCategories.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-slate-400">Loading categories…</p>
                  ) : (
                    navCategories.map(({ slug, label, icon: Icon }) => (
                      <Link
                        key={slug}
                        to={`/shop?category=${slug}`}
                        onClick={() => setCatsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700 group transition-colors"
                      >
                        <div className="w-8 h-8 bg-slate-700 group-hover:bg-[#E63939] rounded-lg flex items-center justify-center transition-colors">
                          <Icon className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-sm font-medium text-slate-200">{label}</span>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-700 bg-[#0F172A] px-4 py-4">
            <NavbarSearch variant="mobile" onNavigate={() => setMobileOpen(false)} />

            <div className="mt-4">
              {navLinks.map(({ to, label, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block py-3 text-sm border-b border-slate-700 ${isActive ? 'text-[#E63939] font-semibold' : 'text-slate-300'}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>

            {user ? (
              <div className="mt-4 space-y-2">
                <div className="px-1">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">Signed in as</p>
                  <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Link to="/account/profile" onClick={() => setMobileOpen(false)}
                    className="flex flex-col items-center gap-1 py-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <Link to="/account/orders" onClick={() => setMobileOpen(false)}
                    className="flex flex-col items-center gap-1 py-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200">
                    <Package className="w-4 h-4" /> Orders
                  </Link>
                  <Link to="/account/wishlist" onClick={() => setMobileOpen(false)}
                    className="flex flex-col items-center gap-1 py-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200">
                    <Heart className="w-4 h-4" /> Wishlist
                  </Link>
                </div>
                <button
                  onClick={() => { setMobileOpen(false); signOut() }}
                  className="flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 text-sm font-semibold px-4 py-3 rounded-lg w-full transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                to="/account/login"
                onClick={() => setMobileOpen(false)}
                className="mt-4 flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 text-sm font-semibold px-4 py-3 rounded-lg w-full transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign in
              </Link>
            )}

            <p className="mt-4 mb-2 text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
              Categories
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto">
              {navCategories.map(({ slug, label, icon: Icon }) => (
                <Link
                  key={slug}
                  to={`/shop?category=${slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  <Icon className="w-4 h-4 text-[#E63939]" />
                  <span className="truncate">{label}</span>
                </Link>
              ))}
            </div>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="mt-4 flex items-center justify-center gap-1.5 bg-[#E63939] hover:bg-[#C82020] text-white text-sm font-semibold px-4 py-3 rounded-lg w-full transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Contact Us on WhatsApp
            </a>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  )
}
