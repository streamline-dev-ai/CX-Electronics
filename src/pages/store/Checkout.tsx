import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import { useCart } from '../../context/CartContext'
import { useLang } from '../../context/LangContext'
import { supabase, type ShippingAddress } from '../../lib/supabase'
import { redirectToPayFast } from '../../lib/payfast'

const SA_PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape',
]

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

export function Checkout() {
  const { items, subtotal, shippingFee, total, clearCart } = useCart()
  const { t } = useLang()
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [submitting, setSubmitting] = useState(false)

  // Redirect if cart is empty
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

    try {
      const shippingAddr: ShippingAddress = {
        name: form.name,
        address_line1: form.address_line1,
        address_line2: form.address_line2 || undefined,
        city: form.city,
        province: form.province,
        postal_code: form.postal_code,
        phone: form.phone,
      }

      // 1. Upsert customer
      const { data: customer } = await supabase
        .from('customers')
        .upsert(
          { name: form.name, email: form.email, phone: form.phone,
            address_line1: form.address_line1, address_line2: form.address_line2 || null,
            city: form.city, province: form.province, postal_code: form.postal_code },
          { onConflict: 'email' },
        )
        .select('id')
        .single()

      const orderNumber = generateOrderNumber()

      // 2. Create order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_id: customer?.id ?? null,
          order_type: items.some((i) => i.orderType === 'bulk') ? 'bulk' : 'retail',
          status: 'pending',
          subtotal,
          shipping_fee: shippingFee,
          total,
          shipping_address: shippingAddr,
          payment_method: 'payfast',
          payment_status: 'unpaid',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id, order_number')
        .single()

      if (orderErr || !order) throw orderErr

      // 3. Insert order items
      await supabase.from('order_items').insert(
        items.map((item) => ({
          order_id: order.id,
          product_id: item.productId,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          line_total: item.price * item.quantity,
          created_at: new Date().toISOString(),
        })),
      )

      // 4. Clear cart + redirect to PayFast
      clearCart()
      redirectToPayFast({
        orderNumber: order.order_number,
        orderId: order.id,
        amount: total,
        shippingAddress: shippingAddr,
        email: form.email,
        items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
      })
    } catch (err) {
      console.error('Checkout error:', err)
      setSubmitting(false)
    }
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
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-4">{t('shippingDetails')}</h2>

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
                      <span className="font-medium text-gray-900 flex-shrink-0">R{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm mb-5">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('subtotal')}</span>
                    <span>R{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t('shipping')}</span>
                    <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                      {shippingFee === 0 ? t('freeShipping') : `R${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-gray-900 pt-1">
                    <span>{t('total')}</span>
                    <span>R{total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-cxx-blue hover:bg-cxx-blue-hover text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Processing...' : t('proceedToPayment')}
                </button>

                <p className="text-xs text-gray-400 text-center mt-3">
                  Secure payment via PayFast
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

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
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
