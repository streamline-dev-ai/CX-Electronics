import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Package, TrendingUp, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Stats {
  ordersToday: number
  revenueThisWeek: number
  pendingOrders: number
  lowStockProducts: number
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: typeof ShoppingCart
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    ordersToday: 0,
    revenueThisWeek: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)

      const [ordersToday, revenueWeek, pending, lowStock] = await Promise.all([
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', today.toISOString()),
        supabase
          .from('orders')
          .select('total')
          .eq('payment_status', 'paid')
          .gte('created_at', weekAgo.toISOString()),
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('stock_status', 'out_of_stock')
          .eq('active', true),
      ])

      const revenue = (revenueWeek.data ?? []).reduce((sum, o) => sum + (o.total ?? 0), 0)

      setStats({
        ordersToday: ordersToday.count ?? 0,
        revenueThisWeek: revenue,
        pendingOrders: pending.count ?? 0,
        lowStockProducts: lowStock.count ?? 0,
      })
      setLoading(false)
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-cxx-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Dashboard <span className="text-sm font-normal text-gray-400">仪表盘</span></h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={ShoppingCart}
          label="Orders Today"
          value={stats.ordersToday}
          sub="今日订单"
          color="bg-blue-50 text-cxx-blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Revenue (7 days)"
          value={`R${stats.revenueThisWeek.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          sub="本周营收"
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="Pending Orders"
          value={stats.pendingOrders}
          sub="待处理订单"
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={Package}
          label="Out of Stock"
          value={stats.lowStockProducts}
          sub="缺货产品"
          color="bg-red-50 text-red-500"
        />
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions <span className="text-xs font-normal text-gray-400">快捷操作</span></h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 bg-cxx-blue text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-cxx-blue-hover transition-colors"
          >
            <Package className="w-4 h-4" />
            Add Product 添加产品
          </Link>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            View Orders 查看订单
          </Link>
        </div>
      </div>
    </div>
  )
}
