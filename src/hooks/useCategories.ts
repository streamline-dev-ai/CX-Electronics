import { useState, useEffect } from 'react'
import { supabase, type Category } from '../lib/supabase'

interface UseCategoriesResult {
  categories: Category[]
  loading: boolean
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetch() {
      const { data } = await supabase
        .from('categories')
        .select('id, name, name_zh, slug, display_order, active, created_at')
        .eq('active', true)
        .order('display_order', { ascending: true })

      if (!cancelled) {
        setCategories(data ?? [])
        setLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [])

  return { categories, loading }
}
