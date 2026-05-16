import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, Printer, ArrowLeft, Download, Copy, Check, CheckCircle2, Clock } from 'lucide-react'
import { getOrder } from '../../hooks/useOrders'
import { getReceiptHTMLString } from '../../lib/generateReceipt'
import { BANKING_DETAILS } from '../../lib/banking'
import { useLang } from '../../context/LangContext'
import type { OrderWithDetails } from '../../lib/supabase'

const LOCAL_ORDERS_KEY = 'cxx-local-orders'

const WHATSAPP_HREF = 'https://wa.me/27649533333'
const EASING: [number, number, number, number] = [0.22, 1, 0.36, 1]

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

  const awaitingPayment = order.payment_status === 'unpaid' && order.payment_method === 'eft'

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
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            {awaitingPayment ? `Order ${order.order_number}` : `Receipt ${order.order_number}`}
          </span>
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

      {awaitingPayment && (
        <div className="print:hidden">
          <AwaitingPaymentBlock order={order} />
        </div>
      )}

      <div dangerouslySetInnerHTML={{ __html: getReceiptHTMLString(order) }} />
    </>
  )
}

// ─── Awaiting Payment block ──────────────────────────────────────────────────

function AwaitingPaymentBlock({ order }: { order: OrderWithDetails }) {
  const { lang } = useLang()
  const zh = lang === 'zh'

  return (
    <div style={{ background: '#F8F9FA', padding: '32px 16px 8px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Success header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASING }}
          style={{ textAlign: 'center', marginBottom: 24 }}
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: EASING, delay: 0.05 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#DCFCE7',
              marginBottom: 16,
            }}
          >
            <CheckCircle2 size={36} color="#16A34A" strokeWidth={2.4} />
          </motion.div>
          <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
            {zh ? '订单已下！' : 'Order placed!'}
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: '#64748B', lineHeight: 1.5 }}>
            {zh
              ? '请使用以下银行详情完成付款，确认后我们将开始处理您的订单。'
              : 'Complete your payment using the banking details below — we\'ll start processing as soon as it lands.'}
          </p>
        </motion.div>

        {/* Order number callout */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASING, delay: 0.08 }}
          style={{
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {zh ? '订单号' : 'Order number'}
          </p>
          <CopyableValue
            value={order.order_number}
            display={order.order_number}
            big
            ariaLabel={zh ? '复制订单号' : 'Copy order number'}
          />
        </motion.div>

        {/* Banking details */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASING, delay: 0.12 }}
          style={{
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: 22,
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
            {zh ? '银行详情' : 'Banking Details'}
          </h2>

          <BankRow label={zh ? '银行' : 'Bank'} value={BANKING_DETAILS.bank} />
          <BankRow label={zh ? '收款人' : 'Account Holder'} value={BANKING_DETAILS.accountHolder} />
          <BankRow label={zh ? '账号' : 'Account Number'} value={BANKING_DETAILS.accountNumber} mono />
          <BankRow label={zh ? '分行代码' : 'Branch Code'} value={BANKING_DETAILS.branchCode} mono />
          <BankRow label={zh ? '账户类型' : 'Account Type'} value={BANKING_DETAILS.accountType} last />

          {/* Reference highlight */}
          <div style={{
            marginTop: 18,
            background: '#FEF9C3',
            border: '1px solid #FACC15',
            borderRadius: 12,
            padding: 16,
          }}>
            <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 800, color: '#854D0E', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              {zh ? '请使用此参考号码 / Use this reference' : 'USE THIS PAYMENT REFERENCE'}
            </p>
            <CopyableValue
              value={order.payment_reference ?? order.order_number}
              display={order.payment_reference ?? order.order_number}
              big
              ariaLabel={zh ? '复制参考号码' : 'Copy reference'}
            />
            <p style={{ margin: '8px 0 0', fontSize: 12, color: '#854D0E' }}>
              {zh
                ? '没有正确的参考号码我们无法匹配您的付款。'
                : 'Without the correct reference we can\'t match your payment.'}
            </p>
          </div>

          {/* Total to pay */}
          <div style={{
            marginTop: 14,
            background: '#0F172A',
            borderRadius: 12,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
              {zh ? '应付金额' : 'Amount to pay'}
            </span>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>
              R{order.total.toFixed(2)}
            </span>
          </div>
        </motion.div>

        {/* What happens next */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASING, delay: 0.16 }}
          style={{
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: 22,
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
            {zh ? '接下来的步骤' : 'What happens next'}
          </h2>
          <Step n={1} text={zh ? '使用上述参考号码通过 EFT 支付总金额' : 'Pay the total via EFT using the reference above'} />
          <Step n={2} text={zh ? '我们在营业时间（每天 09:00–15:00）确认付款' : 'We confirm payment during trading hours (Mon–Sun 09:00–15:00)'} />
          <Step n={3} text={zh ? '付款确认后您会收到电子邮件' : 'You\'ll get an email when payment is confirmed'} />
          <Step n={4} text={zh ? '我们打包并发出您的订单' : 'We pack and ship your order'} last />
        </motion.div>

        {/* Trading hours notice */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASING, delay: 0.2 }}
          style={{
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <Clock size={18} color="#1D4ED8" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0, fontSize: 13, color: '#1E40AF', lineHeight: 1.5 }}>
            {zh
              ? '工作时间外付款将在下个工作日处理。'
              : 'Payments made outside trading hours will be confirmed the next business day.'}
          </p>
        </motion.div>

        {/* WhatsApp queries */}
        <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
              color: '#16A34A',
              textDecoration: 'none',
            }}
          >
            {zh ? '通过 WhatsApp 联系我们 →' : 'Questions? Message us on WhatsApp →'}
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Small components ────────────────────────────────────────────────────────

function BankRow({ label, value, mono, last }: { label: string; value: string; mono?: boolean; last?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      padding: '12px 0',
      borderBottom: last ? 'none' : '1px solid #F1F5F9',
    }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
        {label}
      </span>
      <CopyableValue
        value={value}
        display={value}
        mono={mono}
        ariaLabel={`Copy ${label}`}
      />
    </div>
  )
}

function CopyableValue({
  value,
  display,
  big,
  mono,
  ariaLabel,
}: {
  value: string
  display: string
  big?: boolean
  mono?: boolean
  ariaLabel: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Older browsers — fall through silently
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : 'inherit',
        fontSize: big ? 22 : 15,
        fontWeight: big ? 800 : 600,
        color: '#0F172A',
        letterSpacing: mono ? '0.04em' : 'normal',
      }}
    >
      <span>{display}</span>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: big ? 32 : 26,
        height: big ? 32 : 26,
        borderRadius: 8,
        background: copied ? '#DCFCE7' : '#F1F5F9',
        color: copied ? '#16A34A' : '#64748B',
        transition: 'background 0.18s ease, color 0.18s ease',
      }}>
        {copied ? <Check size={big ? 16 : 14} /> : <Copy size={big ? 16 : 14} />}
      </span>
    </button>
  )
}

function Step({ n, text, last }: { n: number; text: string; last?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      padding: '8px 0',
      borderBottom: last ? 'none' : '1px solid #F1F5F9',
    }}>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: '#E63939',
        color: '#fff',
        fontSize: 12,
        fontWeight: 700,
        flexShrink: 0,
      }}>{n}</span>
      <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>{text}</span>
    </div>
  )
}
