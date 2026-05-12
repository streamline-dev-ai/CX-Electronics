import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Users, MessageSquare, LogOut, Globe } from 'lucide-react'
import { signOut } from '../../hooks/useAuth'
import { AdminLangProvider, useAdminLang } from '../../context/AdminLangContext'

function LangToggle() {
  const { lang, setLang } = useAdminLang()
  return (
    <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={() => setLang('en')}
        className={`px-2.5 py-1 text-xs font-bold transition-colors ${
          lang === 'en' ? 'bg-[#E63939] text-white' : 'text-white/70 hover:text-white'
        }`}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
      <button
        onClick={() => setLang('zh')}
        className={`px-2.5 py-1 text-xs font-bold transition-colors ${
          lang === 'zh' ? 'bg-[#E63939] text-white' : 'text-white/70 hover:text-white'
        }`}
        aria-pressed={lang === 'zh'}
      >
        中文
      </button>
    </div>
  )
}

function AdminShell() {
  const navigate = useNavigate()
  const { t } = useAdminLang()

  async function handleLogout() {
    await signOut()
    navigate('/admin/login')
  }

  const navLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, key: 'dashboard' as const },
    { to: '/admin/products',  icon: Package,         key: 'products' as const },
    { to: '/admin/orders',    icon: ShoppingCart,    key: 'orders' as const },
    { to: '/admin/customers', icon: Users,           key: 'customers' as const },
    { to: '/admin/messages',  icon: MessageSquare,   key: 'messages' as const },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex print:hidden flex-col w-56 bg-cxx-navy text-white fixed inset-y-0 left-0">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <img src="https://res.cloudinary.com/dzhwylkfr/image/upload/v1777722832/CW-Logo_ujfdip.png" alt="CW Electronics Logo" className="h-5 w-auto" />
          <span className="font-bold text-sm">CW {t('adminPanel')}</span>
        </div>

        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/50">
            <Globe className="w-3 h-3" />
            <span>Language</span>
          </div>
          <LangToggle />
        </div>

        <nav className="flex-1 py-4 space-y-0.5">
          {navLinks.map(({ to, icon: Icon, key }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-cxx-blue text-white font-medium'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{t(key)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-56 print:ml-0 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="md:hidden print:hidden flex items-center justify-between bg-cxx-navy text-white px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <img src="https://res.cloudinary.com/dzhwylkfr/image/upload/v1777722832/CW-Logo_ujfdip.png" alt="CW Electronics Logo" className="h-5 w-auto flex-shrink-0" />
            <span className="font-bold text-sm truncate">CW {t('adminPanel')}</span>
          </div>
          <LangToggle />
        </header>

        {/* Page content — pb-20 leaves room for the fixed mobile bottom nav */}
        <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </div>

        {/* Mobile bottom nav — fixed so it stays on screen while scrolling */}
        <nav className="md:hidden print:hidden fixed bottom-0 left-0 right-0 z-30 flex bg-cxx-navy border-t border-white/10">
          {navLinks.map(({ to, icon: Icon, key }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 pt-2.5 text-[10px] transition-colors ${
                  isActive ? 'text-cxx-blue' : 'text-white/60'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="truncate max-w-full px-1">{t(key)}</span>
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex-1 flex flex-col items-center py-2 pt-2.5 text-[10px] text-white/60 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 mb-0.5" />
            {t('logout')}
          </button>
        </nav>
      </main>
    </div>
  )
}

export function AdminLayout() {
  return (
    <AdminLangProvider>
      <AdminShell />
    </AdminLangProvider>
  )
}
