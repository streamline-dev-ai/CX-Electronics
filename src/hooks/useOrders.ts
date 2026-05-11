import { useState, useEffect, useCallback } from 'react'
import { supabase, type OrderWithDetails, type OrderStatus, type OrderStatusEvent } from '../lib/supabase'

const ORDER_SELECT = `
  id, order_number, customer_id, order_type, status,
  fulfillment_type, collection_name, collection_phone,
  subtotal, shipping_fee, total,
  shipping_address, notes, payment_method, payment_status, payment_reference,
  created_at, updated_at,
  customers ( id, name, email, phone ),
  order_items ( id, product_name, quantity, unit_price, line_total, thumbnail_url )
`

const ORDER_DETAIL_SELECT = ORDER_SELECT + `,
  order_status_events ( id, status, note, triggered_by, created_at )
`

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

    async function load() {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = supabase
        .from('orders')
        .select(ORDER_SELECT, { count: 'exact' })
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

    load()
    return () => { cancelled = true }
  }, [status, page, pageSize, version])

  return { orders, loading, error, totalCount, refetch }
}

export async function getOrder(orderId: string): Promise<OrderWithDetails | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_DETAIL_SELECT)
    .eq('id', orderId)
    .order('created_at', { referencedTable: 'order_status_events', ascending: true })
    .single()

  if (error || !data) return null
  return data as unknown as OrderWithDetails
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  triggeredBy: 'admin' | 'system' | 'payment_gateway' = 'admin',
): Promise<{ error: string | null }> {
  const now = new Date().toISOString()

  const { error: updateErr } = await supabase
    .from('orders')
    .update({ status, updated_at: now })
    .eq('id', orderId)

  if (updateErr) return { error: updateErr.message }

  const { error: eventErr } = await supabase
    .from('order_status_events')
    .insert({ order_id: orderId, status, triggered_by: triggeredBy, created_at: now })

  if (eventErr) console.warn('Failed to log status event:', eventErr.message)

  return { error: null }
}

export async function getStatusEvents(orderId: string): Promise<OrderStatusEvent[]> {
  const { data } = await supabase
    .from('order_status_events')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })
  return (data ?? []) as OrderStatusEvent[]
}
