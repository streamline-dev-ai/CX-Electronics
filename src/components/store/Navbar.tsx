import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ShoppingCart, Menu, X, Zap } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useLang } from '../../context/LangContext'
import { CartDrawer } from './CartDrawer'

const navLinks = [
  { to: '/', label: 'home' as const, exact: true },
  { to: '/shop', label: 'shop' as const },
  { to: '/bulk', label: 'bulk' as const },
]

export function Navbar() {
  const { itemCount, openCart } = useCart()
  const { lang, setLang, t } = useLang()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 bg-cxx-navy/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mr-6 flex-shrink-0">
            <div className="w-8 h-8 bg-cxx-blue rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm leading-tight">
              C&X<br />
              <span className="text-cxx-blue text-xs font-medium">Electronics</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {t(label)}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Language toggle */}
            <div className="hidden sm:flex items-center bg-white/10 rounded-lg overflow-hidden text-xs">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 transition-colors ${
                  lang === 'en' ? 'bg-cxx-blue text-white font-medium' : 'text-white/60 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('zh')}
                className={`px-3 py-1.5 transition-colors ${
                  lang === 'zh' ? 'bg-cxx-blue text-white font-medium' : 'text-white/60 hover:text-white'
                }`}
              >
                中文
              </button>
            </div>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label={t('cart')}
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-cxx-blue text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-cxx-navy px-4 pb-4">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block py-2.5 text-sm ${isActive ? 'text-white font-medium' : 'text-white/70'}`
                }
              >
                {t(label)}
              </NavLink>
            ))}
            {/* Language toggle mobile */}
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
              <span className="text-xs text-white/40">Language:</span>
              <button onClick={() => setLang('en')} className={`text-sm ${lang === 'en' ? 'text-cxx-blue font-medium' : 'text-white/60'}`}>EN</button>
              <button onClick={() => setLang('zh')} className={`text-sm ${lang === 'zh' ? 'text-cxx-blue font-medium' : 'text-white/60'}`}>中文</button>
            </div>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  )
}
