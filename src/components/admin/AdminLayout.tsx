import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut } from 'lucide-react'
import { signOut } from '../../hooks/useAuth'

const navLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', labelZh: '仪表盘' },
  { to: '/admin/products', icon: Package, label: 'Products', labelZh: '产品' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders', labelZh: '订单' },
  { to: '/admin/customers', icon: Users, label: 'Customers', labelZh: '客户' },
]

export function AdminLayout() {
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex print:hidden flex-col w-56 bg-cxx-navy text-white fixed inset-y-0 left-0">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <img src="https://res.cloudinary.com/dzhwylkfr/image/upload/v1777722832/CW-Logo_ujfdip.png" alt="CW Electronics Logo" className="h-5 w-auto" />
          <span className="font-bold text-sm">CW Admin</span>
        </div>

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
        <header className="md:hidden print:hidden flex items-center bg-cxx-navy text-white px-4 py-3">
          <img src="https://res.cloudinary.com/dzhwylkfr/image/upload/v1777722832/CW-Logo_ujfdip.png" alt="CW Electronics Logo" className="h-5 w-auto mr-2" />
          <span className="font-bold text-sm">CW Admin</span>
        </header>

        {/* Page content — pb-20 leaves room for the fixed mobile bottom nav */}
        <div className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </div>

        {/* Mobile bottom nav — fixed so it stays on screen while scrolling */}
        <nav className="md:hidden print:hidden fixed bottom-0 left-0 right-0 z-30 flex bg-cxx-navy border-t border-white/10">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 pt-2.5 text-[11px] transition-colors ${
                  isActive ? 'text-cxx-blue' : 'text-white/60'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              {label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex-1 flex flex-col items-center py-2 pt-2.5 text-[11px] text-white/60 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 mb-0.5" />
            Logout
          </button>
        </nav>
      </main>
    </div>
  )
}
