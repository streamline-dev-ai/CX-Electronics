import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingCart, TrendingUp, BarChart2, Calendar, AlertTriangle } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { supabase } from '../../lib/supabase'

type DateFilter = 'today' | '7d' | '30d' | '90d' | 'all' | 'custom'

const FILTERS: { key: DateFilter; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
  { key: 'all', label: 'All Time' },
  { key: 'custom', label: 'Custom' },
]

interface RevenuePoint { date: string; revenue: number; orders: number }
interface ProductStat { name: string; units: number; revenue: number }
interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  totalUnits: number
  revenueChart: RevenuePoint[]
  topProducts: ProductStat[]
}

function getDateRange(filter: DateFilter, from: string, to: string) {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  switch (filter) {
    case 'today':
      return { from: startOfDay.toISOString(), to: now.toISOString() }
    case '7d': {
      const d = new Date(startOfDay); d.setDate(d.getDate() - 6)
      return { from: d.toISOString(), to: now.toISOString() }
    }
    case '30d': {
      const d = new Date(startOfDay); d.setDate(d.getDate() - 29)
      return { from: d.toISOString(), to: now.toISOString() }
    }
    case '90d': {
      const d = new Date(startOfDay); d.setDate(d.getDate() - 89)
      return { from: d.toISOString(), to: now.toISOString() }
    }
    case 'all':
      return { from: '2020-01-01T00:00:00.000Z', to: now.toISOString() }
    case 'custom':
      return {
        from: from ? new Date(from + 'T00:00:00').toISOString() : startOfDay.toISOString(),
        to: to ? new Date(to + 'T23:59:59').toISOString() : now.toISOString(),
      }
  }
}

function groupByDay(orders: { created_at: string; total: number }[]): RevenuePoint[] {
  const map: Record<string, RevenuePoint> = {}
  for (const o of orders) {
    const day = o.created_at.slice(0, 10)
    if (!map[day]) map[day] = { date: day, revenue: 0, orders: 0 }
    map[day].revenue = +(map[day].revenue + o.total).toFixed(2)
    map[day].orders += 1
  }
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
}

function buildTopProducts(items: { product_name: string; quantity: number; line_total: number }[]): ProductStat[] {
  const map: Record<string, ProductStat> = {}
  for (const item of items) {
    if (!map[item.product_name]) map[item.product_name] = { name: item.product_name, units: 0, revenue: 0 }
    map[item.product_name].units += item.quantity
    map[item.product_name].revenue = +(map[item.product_name].revenue + item.line_total).toFixed(2)
  }
  return Object.values(map).sort((a, b) => b.units - a.units).slice(0, 10)
}

function fmt(n: number) {
  return `R${n.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function StatCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: typeof ShoppingCart; label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5 leading-tight">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-3 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-600 mb-1.5 text-xs">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.dataKey === 'revenue' ? fmt(p.value) : `${p.value} orders`}
        </p>
      ))}
    </div>
  )
}

function ProductTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm max-w-[220px]">
      <p className="font-semibold text-gray-700 mb-1.5 leading-snug">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.dataKey === 'revenue' ? `Revenue: ${fmt(p.value)}` : `Units sold: ${p.value}`}
        </p>
      ))}
    </div>
  )
}

export function AdminDashboard() {
  const [filter, setFilter] = useState<DateFilter>('30d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData>({
    totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, totalUnits: 0,
    revenueChart: [], topProducts: [],
  })
  const [alerts, setAlerts] = useState({ pending: 0, outOfStock: 0 })

  // Always-fresh alert stats (not date-filtered)
  useEffect(() => {
    Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('stock_status', 'out_of_stock').eq('active', true),
    ]).then(([p, o]) => setAlerts({ pending: p.count ?? 0, outOfStock: o.count ?? 0 }))
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    const range = getDateRange(filter, customFrom, customTo)

    const { data: orders } = await supabase
      .from('orders')
      .select('id, total, payment_status, created_at')
      .gte('created_at', range.from)
      .lte('created_at', range.to)
      .order('created_at', { ascending: true })

    const ordersData = orders ?? []
    const orderIds = ordersData.map((o) => o.id)

    const { data: items } = orderIds.length > 0
      ? await supabase
          .from('order_items')
          .select('product_name, quantity, line_total')
          .in('order_id', orderIds)
      : { data: [] }

    const itemsData = items ?? []
    const paidOrders = ordersData.filter((o) => o.payment_status === 'paid')
    const totalRevenue = paidOrders.reduce((s, o) => s + (o.total ?? 0), 0)
    const totalOrders = ordersData.length
    const avgOrderValue = totalOrders > 0 ? totalRevenue / Math.max(paidOrders.length, 1) : 0
    const totalUnits = itemsData.reduce((s, i) => s + i.quantity, 0)

    setData({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      totalUnits,
      revenueChart: groupByDay(paidOrders),
      topProducts: buildTopProducts(itemsData),
    })
    setLoading(false)
  }, [filter, customFrom, customTo])

  useEffect(() => {
    if (filter !== 'custom' || (customFrom && customTo)) {
      loadData()
    }
  }, [loadData])

  return (
    <div className="space-y-6">

      {/* Header + filter row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Analytics <span className="text-sm font-normal text-gray-400">销售分析</span>
          </h1>
          {(alerts.pending > 0 || alerts.outOfStock > 0) && (
            <div className="flex items-center gap-3 mt-1.5">
              {alerts.pending > 0 && (
                <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {alerts.pending} pending orders
                </span>
              )}
              {alerts.outOfStock > 0 && (
                <span className="flex items-center gap-1 text-xs text-red-500 font-semibold">
                  <Package className="w-3.5 h-3.5" />
                  {alerts.outOfStock} out of stock
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filter === key
                  ? 'bg-[#111827] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date picker */}
      {filter === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-xl p-4">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#E63939]"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#E63939]"
            />
            {customFrom && customTo && (
              <button
                onClick={loadData}
                className="bg-[#E63939] text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-[#C82020] transition-colors"
              >
                Apply
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-[#E63939] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={TrendingUp}
              label="Total Revenue"
              value={fmt(data.totalRevenue)}
              sub="Paid orders only"
              color="bg-green-50 text-green-600"
            />
            <StatCard
              icon={ShoppingCart}
              label="Total Orders"
              value={data.totalOrders}
              sub={data.totalOrders > 0 ? `${pct(data.totalRevenue, data.totalOrders)} avg value` : 'No orders'}
              color="bg-blue-50 text-cxx-blue"
            />
            <StatCard
              icon={Package}
              label="Units Sold"
              value={data.totalUnits.toLocaleString('en-ZA')}
              sub="All order items"
              color="bg-purple-50 text-purple-600"
            />
            <StatCard
              icon={BarChart2}
              label="Avg Order Value"
              value={fmt(data.avgOrderValue)}
              sub={`From paid orders`}
              color="bg-amber-50 text-amber-600"
            />
          </div>

          {/* Revenue over time */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-900">Revenue Over Time</h2>
                <p className="text-xs text-gray-400 mt-0.5">Paid orders · grouped by day</p>
              </div>
              <span className="text-xs font-bold text-[#E63939]">{fmt(data.totalRevenue)}</span>
            </div>

            {data.revenueChart.length === 0 ? (
              <div className="h-52 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No paid orders in this period</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.revenueChart} margin={{ top: 4, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => {
                      const d = new Date(v + 'T12:00:00')
                      return d.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })
                    }}
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    yAxisId="rev"
                    orientation="left"
                    tickFormatter={(v) => v >= 1000 ? `R${(v / 1000).toFixed(0)}k` : `R${v}`}
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                  />
                  <YAxis
                    yAxisId="ord"
                    orientation="right"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Legend
                    formatter={(v) => v === 'revenue' ? 'Revenue' : 'Orders'}
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  />
                  <Line
                    yAxisId="rev"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#E63939"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: '#E63939', stroke: '#fff', strokeWidth: 2 }}
                  />
                  <Line
                    yAxisId="ord"
                    type="monotone"
                    dataKey="orders"
                    stroke="#111827"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="5 4"
                    activeDot={{ r: 4, fill: '#111827' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top products */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="mb-4">
              <h2 className="font-semibold text-gray-900">Top Products</h2>
              <p className="text-xs text-gray-400 mt-0.5">By units sold in selected period</p>
            </div>

            {data.topProducts.length === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <BarChart2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No sales data in this period</p>
                </div>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={Math.max(200, data.topProducts.length * 40)}>
                  <BarChart
                    data={data.topProducts}
                    layout="vertical"
                    margin={{ top: 0, right: 48, bottom: 0, left: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: '#9CA3AF' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={160}
                      tick={{ fontSize: 11, fill: '#374151' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: string) => v.length > 24 ? v.slice(0, 24) + '…' : v}
                    />
                    <Tooltip content={<ProductTooltip />} />
                    <Bar
                      dataKey="units"
                      fill="#E63939"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={22}
                      label={{ position: 'right', fontSize: 11, fill: '#6B7280' }}
                    />
                  </BarChart>
                </ResponsiveContainer>

                {/* Revenue breakdown table */}
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Revenue Breakdown</p>
                  <div className="space-y-2">
                    {data.topProducts.slice(0, 5).map((p, i) => (
                      <div key={p.name} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 font-mono w-4">{i + 1}</span>
                        <span className="flex-1 text-sm text-gray-700 truncate">{p.name}</span>
                        <span className="text-xs text-gray-500">{p.units} units</span>
                        <span className="text-sm font-bold text-gray-900 w-24 text-right">{fmt(p.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/products/new"
                className="inline-flex items-center gap-2 bg-cxx-blue text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-cxx-blue-hover transition-colors"
              >
                <Package className="w-4 h-4" />
                Add Product
              </Link>
              <Link
                to="/admin/orders"
                className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                View Orders
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function pct(revenue: number, orders: number) {
  if (orders === 0) return 'R0'
  return fmt(revenue / orders)
}
