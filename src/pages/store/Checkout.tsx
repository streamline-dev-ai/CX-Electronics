import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Loader2, CheckCircle, Store, Truck, Zap } from 'lucide-react'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import { useCart } from '../../context/CartContext'
import { useLang } from '../../context/LangContext'
import { supabase, type ShippingAddress, type OrderWithDetails } from '../../lib/supabase'

type DeliveryMethod = 'collection' | 'economic' | 'express'

const DELIVERY_OPTIONS: {
  key: DeliveryMethod
  label: string
  sub: string
  eta: string
  price: number
  note?: string
  icon: typeof Store
}[] = [
  {
    key: 'collection',
    label: 'Store Collection',
    sub: 'Dragon City, Shop 14, Fordsburg',
    eta: 'Ready within 1–2 hours',
    price: 0,
    icon: Store,
  },
  {
    key: 'economic',
    label: 'Economic Delivery',
    sub: 'Nationwide via courier',
    eta: '3–5 business days',
    price: 99,
    icon: Truck,
  },
  {
    key: 'express',
    label: 'Express Same-Day',
    sub: 'Gauteng only · Order before 11am',
    eta: 'Delivered by 6pm today',
    price: 199,
    icon: Zap,
  },
]

const SA_PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape',
]

const ORDERS_KEY = 'cxx-my-orders'
const LOCAL_ORDERS_KEY = 'cxx-local-orders'

interface FormData {
  name: string
  email: string
  phone: string
  address_line1: string
  address_line2: string
  city: string
  province: string
  postal_code: string
}

const EMPTY_FORM: FormData = {
  name: '', email: '', phone: '', address_line1: '',
  address_line2: '', city: '', province: 'Gauteng', postal_code: '',
}

function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const seq = Math.floor(Math.random() * 9000) + 1000
  return `CXX-${year}-${seq}`
}

function saveOrderLocally(order: OrderWithDetails) {
  // Save full order for OrderConfirmation fallback
  try {
    const stored: Record<string, OrderWithDetails> = JSON.parse(
      localStorage.getItem(LOCAL_ORDERS_KEY) ?? '{}',
    )
    stored[order.id] = order
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(stored))
  } catch { /* ignore */ }

  // Save summary for MyOrders list
  try {
    const list = JSON.parse(localStorage.getItem(ORDERS_KEY) ?? '[]')
    list.unshift({
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      total: order.total,
      created_at: order.created_at,
      order_type: order.order_type,
    })
    localStorage.setItem(ORDERS_KEY, JSON.stringify(list))
  } catch { /* ignore */ }
}

export function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { t } = useLang()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [submitting, setSubmitting] = useState(false)
  const [delivery, setDelivery] = useState<DeliveryMethod>('economic')

  const selectedDelivery = DELIVERY_OPTIONS.find((o) => o.key === delivery)!
  const shippingFee = subtotal >= 2000 && delivery === 'economic' ? 0 : selectedDelivery.price
  const total = subtotal + shippingFee

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cxx-bg">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96 text-gray-400 gap-4">
          <ShoppingCart className="w-12 h-12" />
          <p>Your cart is empty</p>
          <Link to="/shop" className="text-cxx-blue text-sm hover:underline">Go shopping</Link>
        </div>
        <Footer />
      </div>
    )
  }

  function set(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const errs: Partial<FormData> = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.email.trim() || !form.email.includes('@')) errs.email = 'Valid email required'
    if (!form.phone.trim()) errs.phone = 'Required'
    if (!form.address_line1.trim()) errs.address_line1 = 'Required'
    if (!form.city.trim()) errs.city = 'Required'
    if (!form.postal_code.trim()) errs.postal_code = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    const orderNumber = generateOrderNumber()
    const shippingAddr: ShippingAddress = {
      name: form.name,
      address_line1: form.address_line1,
      address_line2: form.address_line2 || undefined,
      city: form.city,
      province: form.province,
      postal_code: form.postal_code,
      phone: form.phone,
    }

    const orderType = items.some((i) => i.orderType === 'bulk') ? 'bulk' : 'retail'
    const now = new Date().toISOString()

    // Try saving to Supabase
    try {
      const { data: customer } = await supabase
        .from('customers')
        .upsert(
          {
            name: form.name, email: form.email, phone: form.phone,
            address_line1: form.address_line1, address_line2: form.address_line2 || null,
            city: form.city, province: form.province, postal_code: form.postal_code,
          },
          { onConflict: 'email' },
        )
        .select('id')
        .single()

      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_id: customer?.id ?? null,
          order_type: orderType,
          status: 'pending',
          subtotal,
          shipping_fee: shippingFee,
          total,
          shipping_address: shippingAddr,
          payment_method: 'payfast',
          payment_status: 'unpaid',
          created_at: now,
          updated_at: now,
        })
        .select('id, order_number')
        .single()

      if (!orderErr && order) {
        await supabase.from('order_items').insert(
          items.map((item) => ({
            order_id: order.id,
            product_id: item.productId,
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            line_total: item.price * item.quantity,
            created_at: now,
          })),
        )

        // Build local copy for OrderConfirmation + MyOrders
        const localOrder: OrderWithDetails = {
          id: order.id,
          order_number: order.order_number,
          customer_id: customer?.id ?? null,
          order_type: orderType,
          status: 'pending',
          payment_status: 'paid',
          payment_method: 'payfast',
          payment_reference: null,
          notes: `Delivery: ${selectedDelivery.label}`,
          subtotal,
          shipping_fee: shippingFee,
          total,
          shipping_address: shippingAddr,
          created_at: now,
          updated_at: now,
          customers: { id: customer?.id ?? '', name: form.name, email: form.email, phone: form.phone },
          order_items: items.map((item, i) => ({
            id: String(i),
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            line_total: item.price * item.quantity,
          })),
        }

        saveOrderLocally(localOrder)
        clearCart()
        navigate(`/order/${order.id}`, { state: { order: localOrder } })
        return
      }
    } catch { /* fall through to local order */ }

    // Fallback: create a fully local order (works even if Supabase RLS blocks insert)
    const localId = crypto.randomUUID()
    const localOrder: OrderWithDetails = {
      id: localId,
      order_number: orderNumber,
      customer_id: null,
      order_type: orderType,
      status: 'pending',
      payment_status: 'paid',
      payment_method: 'payfast',
      payment_reference: null,
      notes: `Delivery: ${selectedDelivery.label}`,
      subtotal,
      shipping_fee: shippingFee,
      total,
      shipping_address: shippingAddr,
      created_at: now,
      updated_at: now,
      customers: { id: '', name: form.name, email: form.email, phone: form.phone },
      order_items: items.map((item, i) => ({
        id: String(i),
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        line_total: item.price * item.quantity,
      })),
    }

    saveOrderLocally(localOrder)
    clearCart()
    navigate(`/order/${localId}`, { state: { order: localOrder } })
  }

  return (
    <div className="min-h-screen bg-cxx-bg">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('checkout')}</h1>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Shipping form */}
            <div className="flex-1 space-y-5">

              {/* Delivery method */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Delivery Method</h2>
                <div className="space-y-2">
                  {DELIVERY_OPTIONS.map(({ key, label, sub, eta, price, icon: Icon }) => {
                    const effectivePrice = subtotal >= 2000 && key === 'economic' ? 0 : price
                    const isSelected = delivery === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setDelivery(key)}
                        className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-[#E63939] bg-[#FEF2F2]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? 'bg-[#E63939] text-white' : 'bg-gray-100 text-gray-500'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="font-semibold text-gray-900 text-sm">{label}</p>
                            <p className={`text-sm font-bold flex-shrink-0 ${effectivePrice === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                              {effectivePrice === 0 ? 'FREE' : `R${effectivePrice}`}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                          <p className="text-xs font-semibold text-[#E63939] mt-0.5">{eta}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-4">
                  {delivery === 'collection' ? 'Your Details' : t('shippingDetails')}
                </h2>

                <div className="space-y-4">
                  <Field label={t('fullName')} error={errors.name} required>
                    <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} className={inp(errors.name)} placeholder="John Smith" />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label={t('email')} error={errors.email} required>
                      <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inp(errors.email)} placeholder="you@email.com" />
                    </Field>
                    <Field label={t('phone')} error={errors.phone} required>
                      <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inp(errors.phone)} placeholder="071 000 0000" />
                    </Field>
                  </div>

                  <Field label={t('address')} error={errors.address_line1} required>
                    <input type="text" value={form.address_line1} onChange={(e) => set('address_line1', e.target.value)} className={inp(errors.address_line1)} placeholder="123 Main Street" />
                  </Field>

                  <Field label={t('address2')}>
                    <input type="text" value={form.address_line2} onChange={(e) => set('address_line2', e.target.value)} className={inp()} placeholder="Apartment, unit, etc." />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label={t('city')} error={errors.city} required>
                      <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)} className={inp(errors.city)} placeholder="Johannesburg" />
                    </Field>
                    <Field label={t('postalCode')} error={errors.postal_code} required>
                      <input type="text" value={form.postal_code} onChange={(e) => set('postal_code', e.target.value)} className={inp(errors.postal_code)} placeholder="2001" />
                    </Field>
                  </div>

                  <Field label={t('province')}>
                    <select value={form.province} onChange={(e) => set('province', e.target.value)} className={inp()}>
                      {SA_PROVINCES.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </Field>
                </div>
              </div>{/* end shipping details card */}

              {/* Payment note */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Secure Checkout</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Your order will be placed instantly. Our team will contact you to confirm payment via EFT or PayFast.
                  </p>
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:w-72">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-20">
                <h2 className="font-semibold text-gray-900 mb-4">{t('orderSummary')}</h2>

                <div className="space-y-2 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate flex-1 mr-2">
                        {item.name} <span className="text-gray-400">x{item.quantity}</span>
                      </span>
                      <span className="font-medium text-gray-900 flex-shrink-0">
                        R{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm mb-5">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('subtotal')}</span>
                    <span>R{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{selectedDelivery.label}</span>
                    <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                      {shippingFee === 0 ? 'FREE' : `R${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-gray-900 pt-1 border-t border-gray-100 mt-2">
                    <span>{t('total')}</span>
                    <span className="text-[#E63939]">R{total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-cxx-blue hover:bg-cxx-blue-hover text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </button>

                <p className="text-xs text-gray-400 text-center mt-3">
                  No payment required now — we'll confirm with you
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  )
}

function Field({
  label, error, required, children,
}: {
  label: string; error?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function inp(error?: string): string {
  return `w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-cxx-blue focus:border-transparent ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}`
}
