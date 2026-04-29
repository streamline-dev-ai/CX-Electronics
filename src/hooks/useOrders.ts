import { useState, useEffect, useCallback } from 'react'
import { supabase, type OrderWithDetails, type OrderStatus } from '../lib/supabase'

interface UseOrdersOptions {
  status?: OrderStatus
  page?: number
  pageSize?: number
}

interface UseOrdersResult {
  orders: OrderWithDetails[]
  loading: boolean
  error: string | null
  totalCount: number
  refetch: () => void
}

export function useOrders(opts: UseOrdersOptions = {}): UseOrdersResult {
  const { status, page = 1, pageSize = 50 } = opts
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
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
        .from('orders')
        .select(
          `id, order_number, customer_id, order_type, status, subtotal, shipping_fee, total,
           shipping_address, notes, payment_method, payment_status, payment_reference,
           created_at, updated_at,
           customers ( id, name, email, phone ),
           order_items ( id, product_name, quantity, unit_price, line_total )`,
          { count: 'exact' },
        )
        .order('created_at', { ascending: false })
        .range(from, to)

      if (status) query = query.eq('status', status)

      const { data, error: err, count } = await query

      if (cancelled) return

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      setOrders((data ?? []) as unknown as OrderWithDetails[])
      setTotalCount(count ?? 0)
      setError(null)
      setLoading(false)
    }

    fetch()
    return () => { cancelled = true }
  }, [status, page, pageSize, version])

  return { orders, loading, error, totalCount, refetch }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  return supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
}

export async function getOrder(orderId: string): Promise<OrderWithDetails | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(
      `id, order_number, customer_id, order_type, status, subtotal, shipping_fee, total,
       shipping_address, notes, payment_method, payment_status, payment_reference,
       created_at, updated_at,
       customers ( id, name, email, phone ),
       order_items ( id, product_name, quantity, unit_price, line_total )`,
    )
    .eq('id', orderId)
    .single()

  if (error || !data) return null
  return data as unknown as OrderWithDetails
}
