import { useState, useEffect, useCallback } from 'react'
import { supabase, getProductImageUrl, type ProductWithCategory } from '../lib/supabase'

interface UseProductsOptions {
  categorySlug?: string
  search?: string
  featured?: boolean
  bulkOnly?: boolean
  page?: number
  pageSize?: number
}

interface UseProductsResult {
  products: ProductWithCategory[]
  loading: boolean
  error: string | null
  totalCount: number
  hasMore: boolean
  refetch: () => void
}

export function useProducts(opts: UseProductsOptions = {}): UseProductsResult {
  const { categorySlug, search, featured, bulkOnly, page = 1, pageSize = 50 } = opts
  const [products, setProducts] = useState<ProductWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [version, setVersion] = useState(0)

  const refetch = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function fetch() {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = supabase
        .from('products')
        .select(
          'id, name, name_zh, slug, description, description_zh, category_id, retail_price, bulk_price, bulk_min_qty, is_bulk_available, images, thumbnail_url, active, featured, stock_status, created_at, updated_at, categories!inner(id, name, name_zh, slug)',
          { count: 'exact' },
        )
        .eq('active', true)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (featured) query = query.eq('featured', true)
      if (bulkOnly) query = query.eq('is_bulk_available', true)
      if (search) query = query.ilike('name', `%${search}%`)
      if (categorySlug) query = query.eq('categories.slug', categorySlug)

      const { data, error: err, count } = await query

      if (cancelled) return

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      // Resolve thumbnail URL through Storage transform
      const resolved = (data ?? []).map((p) => ({
        ...p,
        thumbnail_url: p.thumbnail_url ? getProductImageUrl(p.thumbnail_url, 400) : null,
        categories: Array.isArray(p.categories) ? p.categories[0] ?? null : p.categories,
      })) as ProductWithCategory[]

      setProducts(resolved)
      setTotalCount(count ?? 0)
      setError(null)
      setLoading(false)
    }

    fetch()
    return () => { cancelled = true }
  }, [categorySlug, search, featured, bulkOnly, page, pageSize, version])

  return {
    products,
    loading,
    error,
    totalCount,
    hasMore: page * pageSize < totalCount,
    refetch,
  }
}
