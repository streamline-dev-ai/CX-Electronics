import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PAYFAST_PASSPHRASE = Deno.env.get('PAYFAST_PASSPHRASE') ?? ''
const N8N_STATUS_CHANGE  = Deno.env.get('N8N_STATUS_CHANGE')  ?? ''

// ─── MD5 via node:crypto compat ───────────────────────────────────────────────
async function md5(str: string): Promise<string> {
  const { createHash } = await import('node:crypto')
  return createHash('md5').update(str).digest('hex')
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseForm(body: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const pair of body.split('&')) {
    const idx = pair.indexOf('=')
    if (idx === -1) continue
    const k = decodeURIComponent(pair.slice(0, idx))
    const v = decodeURIComponent(pair.slice(idx + 1).replace(/\+/g, ' '))
    out[k] = v
  }
  return out
}

async function verifySignature(params: Record<string, string>, received: string): Promise<boolean> {
  const copy = { ...params }
  delete copy.signature

  const qs = Object.entries(copy)
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, '+')}`)
    .join('&')

  const input = PAYFAST_PASSPHRASE
    ? `${qs}&passphrase=${encodeURIComponent(PAYFAST_PASSPHRASE).replace(/%20/g, '+')}`
    : qs

  return (await md5(input)) === received
}

// ─── Handler ──────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200 })
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  try {
    const body   = await req.text()
    const params = parseForm(body)

    const sig = params.signature ?? ''
    if (!(await verifySignature(params, sig))) {
      console.error('PayFast ITN: invalid signature')
      return new Response('Invalid signature', { status: 400 })
    }

    // Only process completed payments
    if (params.payment_status !== 'COMPLETE') {
      return new Response('OK', { status: 200 })
    }

    const mPaymentId  = params.m_payment_id  // set by us (order_number)
    const pfPaymentId = params.pf_payment_id // PayFast's transaction ID

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Look up order by order_number (m_payment_id we pass to PayFast)
    const { data: order } = await supabase
      .from('orders')
      .select(`
        id, status, order_number, fulfillment_type,
        subtotal, shipping_fee, total,
        shipping_address, collection_name, collection_phone,
        customers ( name, email, phone ),
        order_items ( product_name, quantity, unit_price, line_total )
      `)
      .eq('order_number', mPaymentId)
      .single()

    if (!order) {
      console.error('PayFast ITN: order not found for', mPaymentId)
      return new Response('Order not found', { status: 404 })
    }

    // Idempotent — skip if already paid
    if (order.status === 'paid') {
      return new Response('OK', { status: 200 })
    }

    const now = new Date().toISOString()

    await supabase.from('orders').update({
      status: 'paid',
      payment_status: 'paid',
      payment_reference: pfPaymentId,
      updated_at: now,
    }).eq('id', order.id)

    await supabase.from('order_status_events').insert({
      order_id: order.id,
      status: 'paid',
      triggered_by: 'payment_gateway',
      note: `PayFast transaction ${pfPaymentId}`,
      created_at: now,
    })

    // Notify n8n
    if (N8N_STATUS_CHANGE) {
      try {
        await fetch(N8N_STATUS_CHANGE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'order_status_change',
            previous_status: order.status,
            new_status: 'paid',
            order_id: order.id,
            order_number: order.order_number,
            fulfillment_type: order.fulfillment_type,
            timestamp: now,
            store_owner_email: 'info@cw-electronics.co.za',
            customer: {
              name: (order.customers as { name: string } | null)?.name ?? '',
              email: (order.customers as { email: string } | null)?.email ?? '',
              phone: (order.customers as { phone: string } | null)?.phone ?? '',
            },
            order: {
              subtotal: order.subtotal,
              shipping_fee: order.shipping_fee,
              total: order.total,
              items: (order.order_items as { product_name: string; quantity: number; unit_price: number; line_total: number }[]).map((i) => ({
                name: i.product_name,
                quantity: i.quantity,
                unit_price: i.unit_price,
                line_total: i.line_total,
              })),
              shipping_address: order.shipping_address,
              collection_name: order.collection_name,
              collection_phone: order.collection_phone,
            },
          }),
        })
      } catch (e) {
        console.warn('PayFast ITN: n8n webhook failed', e)
      }
    }

    return new Response('OK', { status: 200 })
  } catch (e) {
    console.error('PayFast ITN error:', e)
    return new Response('Internal Server Error', { status: 500 })
  }
})
