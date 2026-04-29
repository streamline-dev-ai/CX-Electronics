import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { useProducts } from '../../hooks/useProducts'
import { useCategories } from '../../hooks/useCategories'
import { supabase } from '../../lib/supabase'
import type { ProductWithCategory, StockStatus } from '../../lib/supabase'

const STOCK_LABELS: Record<StockStatus, { label: string; color: string }> = {
  in_stock: { label: 'In Stock', color: 'bg-green-100 text-green-700' },
  out_of_stock: { label: 'Out of Stock', color: 'bg-red-100 text-red-700' },
  on_order: { label: 'On Order', color: 'bg-amber-100 text-amber-700' },
}

export function AdminProducts() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  const { categories } = useCategories()
  const { products, loading, totalCount, refetch } = useProducts({
    search: debouncedSearch || undefined,
    categorySlug: categorySlug || undefined,
    page,
    pageSize: 50,
  })

  // Debounce search
  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    clearTimeout((window as unknown as Record<string, ReturnType<typeof setTimeout>>)._searchTimer)
    ;(window as unknown as Record<string, ReturnType<typeof setTimeout>>)._searchTimer = setTimeout(
      () => {
        setDebouncedSearch(value)
        setPage(1)
      },
      300,
    )
  }, [])

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === products.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(products.map((p) => p.id)))
    }
  }

  async function deleteSelected() {
    if (!selected.size) return
    if (!confirm(`Delete ${selected.size} product(s)? This cannot be undone.`)) return
    setDeleting(true)
    await supabase.from('products').delete().in('id', [...selected])
    setSelected(new Set())
    setDeleting(false)
    refetch()
  }

  async function toggleActive(product: ProductWithCategory) {
    await supabase
      .from('products')
      .update({ active: !product.active, updated_at: new Date().toISOString() })
      .eq('id', product.id)
    refetch()
  }

  async function toggleStock(product: ProductWithCategory) {
    const next: StockStatus =
      product.stock_status === 'in_stock' ? 'out_of_stock' : 'in_stock'
    await supabase
      .from('products')
      .update({ stock_status: next, updated_at: new Date().toISOString() })
      .eq('id', product.id)
    refetch()
  }

  const totalPages = Math.ceil(totalCount / 50)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Products <span className="text-sm font-normal text-gray-400">产品</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{totalCount} total</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 bg-cxx-blue text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-cxx-blue-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products... 搜索产品"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cxx-blue"
          />
        </div>
        <select
          value={categorySlug}
          onChange={(e) => { setCategorySlug(e.target.value); setPage(1) }}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cxx-blue"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-cxx-blue-light border border-cxx-blue/20 rounded-lg px-4 py-2.5 mb-4">
          <span className="text-sm text-cxx-blue font-medium">{selected.size} selected</span>
          <button
            onClick={deleteSelected}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-cxx-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Package className="w-8 h-8 mb-2" />
            <p className="text-sm">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="pl-4 pr-2 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={selected.size === products.length && products.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Product</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Price</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Stock</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Active</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => {
                  const stock = STOCK_LABELS[product.stock_status]
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="pl-4 pr-2 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(product.id)}
                          onChange={() => toggleSelect(product.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.thumbnail_url ? (
                            <img
                              src={product.thumbnail_url}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{product.name}</p>
                            {product.name_zh && (
                              <p className="text-xs text-gray-400 truncate">{product.name_zh}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {product.categories?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div>
                          <p className="font-medium text-gray-900">R{product.retail_price.toFixed(2)}</p>
                          {product.is_bulk_available && product.bulk_price && (
                            <p className="text-xs text-cxx-blue">Bulk: R{product.bulk_price.toFixed(2)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleStock(product)}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${stock.color}`}
                          title="Click to toggle"
                        >
                          {stock.label}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleActive(product)}
                          className={`relative w-9 h-5 rounded-full transition-colors ${
                            product.active ? 'bg-cxx-blue' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              product.active ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          to={`/admin/products/${product.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-cxx-blue hover:bg-cxx-blue-light rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages} · {totalCount} products
            </p>
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
