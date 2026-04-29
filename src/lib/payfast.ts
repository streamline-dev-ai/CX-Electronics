import MD5 from 'crypto-js/md5'
import type { ShippingAddress } from './supabase'

interface PayFastPaymentData {
  merchant_id: string
  merchant_key: string
  return_url: string
  cancel_url: string
  notify_url: string
  name_first: string
  name_last: string
  email_address: string
  cell_number?: string
  m_payment_id: string
  amount: string
  item_name: string
  item_description?: string
  custom_str1?: string   // order_number
  email_confirmation?: '1' | '0'
  confirmation_address?: string
}

const isSandbox = import.meta.env.DEV
const PAYFAST_URL = 'https://www.payfast.co.za/eng/process'
const SANDBOX_URL = 'https://sandbox.payfast.co.za/eng/process'

const config = {
  merchantId: import.meta.env.VITE_PAYFAST_MERCHANT_ID as string || '10000100',
  merchantKey: import.meta.env.VITE_PAYFAST_MERCHANT_KEY as string || '46f0cd694581a',
  passphrase: import.meta.env.VITE_PAYFAST_PASSPHRASE as string | undefined,
  notifyUrl: import.meta.env.VITE_N8N_WEBHOOK_URL as string || '',
}

function generateSignature(data: PayFastPaymentData, passphrase?: string): string {
  const paramString = (Object.keys(data) as (keyof PayFastPaymentData)[])
    .sort()
    .map((key) => {
      const value = data[key] ?? ''
      return `${key}=${encodeURIComponent(String(value)).replace(/%20/g, '+')}`
    })
    .join('&')

  const stringToHash = passphrase
    ? `${paramString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`
    : paramString

  return MD5(stringToHash).toString()
}

export interface PayFastOrderData {
  orderNumber: string    // e.g. CXX-2026-001
  orderId: string        // Supabase order UUID
  amount: number         // total in ZAR (including shipping)
  shippingAddress: ShippingAddress
  email: string
  items: Array<{ name: string; quantity: number; price: number }>
}

export function redirectToPayFast(data: PayFastOrderData): void {
  const origin = window.location.origin
  const nameParts = data.shippingAddress.name.trim().split(' ')
  const nameFirst = nameParts[0] ?? ''
  const nameLast = nameParts.slice(1).join(' ') || nameFirst

  const paymentData: PayFastPaymentData = {
    merchant_id: config.merchantId,
    merchant_key: config.merchantKey,
    return_url: `${origin}/order/${data.orderId}`,
    cancel_url: `${origin}/checkout?cancelled=true`,
    notify_url: config.notifyUrl,
    name_first: nameFirst,
    name_last: nameLast,
    email_address: data.email,
    cell_number: data.shippingAddress.phone || undefined,
    m_payment_id: data.orderId,
    amount: data.amount.toFixed(2),
    item_name: data.items.length === 1
      ? `${data.items[0].name} (x${data.items[0].quantity})`
      : `CXX Order (${data.items.length} items)`,
    item_description: data.items
      .map((i) => `${i.name} x${i.quantity} @ R${i.price.toFixed(2)}`)
      .join(', ')
      .slice(0, 255),
    custom_str1: data.orderNumber,
    email_confirmation: '1',
    confirmation_address: data.email,
  }

  const signature = generateSignature(paymentData, config.passphrase)
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = isSandbox ? SANDBOX_URL : PAYFAST_URL

  const allData = { ...paymentData, signature }
  for (const [key, value] of Object.entries(allData)) {
    if (value == null) continue
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = key
    input.value = String(value)
    form.appendChild(input)
  }

  document.body.appendChild(form)
  form.submit()
}
