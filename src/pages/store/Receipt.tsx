import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader2, Printer, ArrowLeft, Download } from 'lucide-react'
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

  function handlePrint() {
    window.print()
  }

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
        <Link to="/" style={{ color: '#E63939', fontSize: 14 }}>← Back to store</Link>
      </div>
    )
  }

  return (
    <>
      {/* Sticky action bar — hidden on print */}
      <div
        className="print:hidden"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: '#0F172A',
          color: '#fff',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          boxShadow: '0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13, fontWeight: 600,
            }}
          >
            <ArrowLeft size={14} /> Back to store
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Receipt {order.order_number}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handlePrint}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#E63939', color: '#fff', border: 'none',
              padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Printer size={14} /> Print
          </button>
          <button
            onClick={handlePrint}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
              padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Use your browser's Save as PDF in the print dialog"
          >
            <Download size={14} /> Save PDF
          </button>
        </div>
      </div>

      <div dangerouslySetInnerHTML={{ __html: getReceiptHTMLString(order) }} />
    </>
  )
}
