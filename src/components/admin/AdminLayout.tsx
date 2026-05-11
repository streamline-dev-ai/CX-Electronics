import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, FlaskConical, Store } from 'lucide-react'
import { signOut } from '../../hooks/useAuth'
import { useAdminMode } from '../../hooks/useAdminMode'

const navLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', labelZh: '仪表盘' },
  { to: '/admin/products', icon: Package, label: 'Products', labelZh: '产品' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders', labelZh: '订单' },
  { to: '/admin/customers', icon: Users, label: 'Customers', labelZh: '客户' },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const [adminMode, setAdminMode] = useAdminMode()
  const isDemo = adminMode === 'demo'

  async function handleLogout() {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex print:hidden flex-col w-56 bg-cxx-navy text-white fixed inset-y-0 left-0">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <img src="https://res.cloudinary.com/dzhwylkfr/image/upload/v1777722832/CW-Logo_ujfdip.png" alt="CW Electronics Logo" className="h-5 w-auto" />
          <span className="font-bold text-sm">CW Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-0.5">
          {navLinks.map(({ to, icon: Icon, label, labelZh }) => (
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
              <span>
                {label} <span className="text-xs opacity-60">{labelZh}</span>
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Mode toggle */}
        <div className="px-4 py-3 border-t border-white/10">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">View Mode</p>
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            <button
              onClick={() => setAdminMode('real')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors ${
                !isDemo ? 'bg-cxx-blue text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <Store className="w-3 h-3" />
              Real
            </button>
            <button
              onClick={() => setAdminMode('demo')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors ${
                isDemo ? 'bg-amber-500 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <FlaskConical className="w-3 h-3" />
              Demo
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout 退出
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-56 print:ml-0 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="md:hidden print:hidden flex items-center justify-between bg-cxx-navy text-white px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="https://res.cloudinary.com/dzhwylkfr/image/upload/v1777722832/CW-Logo_ujfdip.png" alt="CW Electronics Logo" className="h-5 w-auto" />
            <span className="font-bold text-sm">CW Admin</span>
          </div>
        </header>

        {/* Demo mode banner */}
        {isDemo && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2">
            <FlaskConical className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-400 font-semibold">
              Demo Mode — showing demo orders only.{' '}
              <button onClick={() => setAdminMode('real')} className="underline hover:no-underline">
                Switch to Real
              </button>
            </p>
          </div>
        )}

        {/* Page content */}
        <div className="flex-1 p-4 md:p-6">
          <Outlet />
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden print:hidden flex bg-cxx-navy border-t border-white/10">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                  isActive ? 'text-cxx-blue' : 'text-white/60'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              {label}
            </NavLink>
          ))}
          <button
            onClick={() => setAdminMode(isDemo ? 'real' : 'demo')}
            className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${isDemo ? 'text-amber-400' : 'text-white/60'}`}
          >
            <FlaskConical className="w-5 h-5 mb-0.5" />
            {isDemo ? 'Demo' : 'Real'}
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 flex flex-col items-center py-2 text-xs text-white/60"
          >
            <LogOut className="w-5 h-5 mb-0.5" />
            Logout
          </button>
        </nav>
      </main>
    </div>
  )
}
