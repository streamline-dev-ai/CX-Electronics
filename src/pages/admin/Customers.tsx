import { useState, useEffect, useCallback } from 'react'
import { Search, Users, ChevronLeft, ChevronRight, Mail, Phone } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAdminLang } from '../../context/AdminLangContext'

interface CustomerRow {
  id: string
  name: string
  email: string
  phone: string | null
  city: string | null
  province: string | null
  created_at: string
  order_count: number
  total_spent: number
  last_order_date: string | null
}

const PAGE_SIZE = 30

function fmt(n: number) {
  return `R${n.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function AdminCustomers() {
  const { t, lang } = useAdminLang()
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)

    // Get customers with order aggregates
    let q = supabase
      .from('customers')
      .select('id, name, email, phone, city, province, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

    if (query) {
      q = q.or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
    }

    const { data, count } = await q
    setTotal(count ?? 0)

    if (!data || data.length === 0) {
      setCustomers([])
      setLoading(false)
      return
    }

    // Fetch order aggregates for these customers
    const ids = data.map((c) => c.id)
    const { data: orders } = await supabase
      .from('orders')
      .select('customer_id, total, payment_status, created_at')
      .in('customer_id', ids)

    const statsMap: Record<string, { count: number; spent: number; last: string }> = {}
    for (const o of orders ?? []) {
      if (!o.customer_id) continue
      if (!statsMap[o.customer_id]) statsMap[o.customer_id] = { count: 0, spent: 0, last: '' }
      statsMap[o.customer_id].count += 1
      if (o.payment_status === 'paid') statsMap[o.customer_id].spent += o.total ?? 0
      if (!statsMap[o.customer_id].last || o.created_at > statsMap[o.customer_id].last) {
        statsMap[o.customer_id].last = o.created_at
      }
    }

    setCustomers(
      data.map((c) => ({
        ...c,
        order_count: statsMap[c.id]?.count ?? 0,
        total_spent: statsMap[c.id]?.spent ?? 0,
        last_order_date: statsMap[c.id]?.last ?? null,
      })),
    )
    setLoading(false)
  }, [query, page])

  useEffect(() => { load() }, [load])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setQuery(search)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('customersPage')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} {t('total')}</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'zh' ? '姓名、邮箱或电话…' : 'Name, email or phone…'}
              className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63939] w-full sm:w-64"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold bg-[#0F172A] text-white rounded-lg hover:bg-[#1e293b] transition-colors"
          >
            {t('search')}
          </button>
          {query && (
            <button
              type="button"
              onClick={() => { setSearch(''); setQuery(''); setPage(1) }}
              className="px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('clear')}
            </button>
          )}
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-[#E63939] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Users className="w-8 h-8 mb-2" />
            <p className="text-sm">{query ? 'No customers found' : 'No customers yet'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Contact</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Location</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Orders</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Total Spent</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Last Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Since {new Date(c.created_at).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-gray-700 hover:text-[#E63939] transition-colors text-xs">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        {c.email}
                      </a>
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors text-xs mt-0.5">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                          {c.phone}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {[c.city, c.province].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                        c.order_count > 0 ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {c.order_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {c.total_spent > 0 ? fmt(c.total_spent) : <span className="text-gray-300 font-normal">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {c.last_order_date
                        ? new Date(c.last_order_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
