import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ShoppingCart, Menu, X, Zap } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useLang } from '../../context/LangContext'
import { CartDrawer } from './CartDrawer'

const navLinks = [
  { to: '/shop', label: 'shop' as const },
  { to: '/bulk', label: 'bulk' as const },
]

export function Navbar() {
  const { itemCount, openCart } = useCart()
  const { lang, setLang, t } = useLang()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#111827] shadow-md">
        {/* Top bar */}
        <div className="bg-[#E63939] py-1.5 text-center text-xs text-white font-medium tracking-wide">
          Wholesale &amp; Retail Electronics — Dragon City, Fordsburg JHB &nbsp;|&nbsp; Free delivery over R2,000
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-[#E63939] rounded-lg flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-white text-lg tracking-tight">CXX</span>
              <span className="block text-[10px] text-white/50 font-medium uppercase tracking-widest -mt-0.5">Electronics</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-[#E63939]'
                      : 'text-white/70 hover:text-white'
                  }`
                }
              >
                {t(label)}
              </NavLink>
            ))}
            <NavLink
              to="/shop?category=chargers"
              className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-lg"
            >
              Categories
            </NavLink>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Language toggle */}
            <div className="hidden sm:flex items-center border border-white/20 rounded-lg overflow-hidden text-xs">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 transition-colors ${
                  lang === 'en' ? 'bg-[#E63939] text-white font-semibold' : 'text-white/60 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('zh')}
                className={`px-3 py-1.5 transition-colors ${
                  lang === 'zh' ? 'bg-[#E63939] text-white font-semibold' : 'text-white/60 hover:text-white'
                }`}
              >
                中文
              </button>
            </div>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              aria-label={t('cart')}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="w-5 h-5 bg-white text-[#E63939] text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 text-white/80 hover:text-white rounded-lg"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#111827] px-4 pb-4">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block py-3 text-sm border-b border-white/10 ${isActive ? 'text-[#E63939] font-semibold' : 'text-white/70'}`
                }
              >
                {t(label)}
              </NavLink>
            ))}
            <NavLink
              to="/shop?category=chargers"
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-sm text-white/70 border-b border-white/10"
            >
              Categories
            </NavLink>
            <div className="flex items-center gap-3 mt-3 pt-3">
              <span className="text-xs text-white/40">Language:</span>
              <button onClick={() => setLang('en')} className={`text-sm ${lang === 'en' ? 'text-[#E63939] font-semibold' : 'text-white/60'}`}>EN</button>
              <button onClick={() => setLang('zh')} className={`text-sm ${lang === 'zh' ? 'text-[#E63939] font-semibold' : 'text-white/60'}`}>中文</button>
            </div>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  )
}
