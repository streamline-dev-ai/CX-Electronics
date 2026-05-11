import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { getOrder } from '../../hooks/useOrders'
import { getReceiptHTMLString } from '../../lib/generateReceipt'
import type { OrderWithDetails } from '../../lib/supabase'

const LOCAL_ORDERS_KEY = 'cxx-local-orders'

export function PublicReceipt() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    try {
      const stored: Record<string, OrderWithDetails> = JSON.parse(
        localStorage.getItem(LOCAL_ORDERS_KEY) ?? '{}',
      )
      if (stored[id]) {
        setOrder(stored[id])
        setLoading(false)
        return
      }
    } catch { /* fall through */ }

    getOrder(id).then((o) => {
      setOrder(o)
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    if (!order) return
    const t = setTimeout(() => window.print(), 600)
    return () => clearTimeout(t)
  }, [order])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA' }}>
        <Loader2 style={{ width: 32, height: 32, color: '#E63939', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (!order) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#94A3B8', fontFamily: 'sans-serif' }}>
        <p>Receipt not found.</p>
        <a href="/" style={{ color: '#E63939', fontSize: 14 }}>← Back to store</a>
      </div>
    )
  }

  return (
    <div dangerouslySetInnerHTML={{ __html: getReceiptHTMLString(order) }} />
  )
}
