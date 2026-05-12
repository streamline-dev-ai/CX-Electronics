import CryptoJS from 'crypto-js'

const MERCHANT_ID  = import.meta.env.VITE_PAYFAST_MERCHANT_ID  as string
const MERCHANT_KEY = import.meta.env.VITE_PAYFAST_MERCHANT_KEY as string
const PASSPHRASE   = (import.meta.env.VITE_PAYFAST_PASSPHRASE  as string) || ''

// Toggle sandbox via env var — DEV alone is not enough since preview deploys use DEV=false
const IS_SANDBOX   = import.meta.env.VITE_PAYFAST_SANDBOX === 'true'

const PAYFAST_URL  = IS_SANDBOX
  ? 'https://sandbox.payfast.co.za/eng/process'
  : 'https://www.payfast.co.za/eng/process'

// ITN handler — Supabase Edge Function
const NOTIFY_URL   = 'https://vsneqdjdkzbykkvvliju.supabase.co/functions/v1/payfast-itn'

// Param order matters for signature — keep this array fixed
const PARAM_ORDER = [
  'merchant_id', 'merchant_key',
  'return_url', 'cancel_url', 'notify_url',
  'name_first', 'name_last', 'email_address', 'cell_number',
  'm_payment_id', 'amount', 'item_name',
  'custom_str1',
] as const

type ParamKey = typeof PARAM_ORDER[number]
type Params = Partial<Record<ParamKey, string>>

function buildSignature(params: Params): string {
  const qs = PARAM_ORDER
    .filter((k) => params[k] !== undefined && params[k] !== '')
    .map((k) => `${k}=${encodeURIComponent(params[k]!).replace(/%20/g, '+')}`)
    .join('&')

  const input = PASSPHRASE
    ? `${qs}&passphrase=${encodeURIComponent(PASSPHRASE).replace(/%20/g, '+')}`
    : qs

  return CryptoJS.MD5(input).toString()
}

export interface PayFastPayload {
  orderId:     string  // Supabase UUID — used in return/cancel URLs
  orderNumber: string  // CW-YYYY-NNNN — sent as m_payment_id for ITN lookup
  nameFirst:   string
  nameLast:    string
  email:       string
  phone?:      string
  amount:      number
}

export function redirectToPayFast(payload: PayFastPayload): void {
  const origin = window.location.origin

  const params: Params = {
    merchant_id:   MERCHANT_ID,
    merchant_key:  MERCHANT_KEY,
    return_url:    `${origin}/order/${payload.orderId}`,
    cancel_url:    `${origin}/checkout`,
    notify_url:    NOTIFY_URL,
    name_first:    payload.nameFirst,
    name_last:     payload.nameLast || payload.nameFirst,
    email_address: payload.email,
    cell_number:   payload.phone || undefined,
    m_payment_id:  payload.orderNumber,
    amount:        payload.amount.toFixed(2),
    item_name:     `CW Electronics Order ${payload.orderNumber}`,
    custom_str1:   payload.orderId,
  }

  const signature = buildSignature(params)

  const form = document.createElement('form')
  form.method = 'POST'
  form.action = PAYFAST_URL

  // Fields added in PARAM_ORDER so browser sends them in signature order
  for (const key of PARAM_ORDER) {
    const val = params[key]
    if (!val) continue
    const el = document.createElement('input')
    el.type  = 'hidden'
    el.name  = key
    el.value = val
    form.appendChild(el)
  }

  const sigEl = document.createElement('input')
  sigEl.type  = 'hidden'
  sigEl.name  = 'signature'
  sigEl.value = signature
  form.appendChild(sigEl)

  document.body.appendChild(form)
  form.submit()
}
