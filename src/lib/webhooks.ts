import type { OrderWithDetails, OrderStatus } from './supabase'

const N8N_NEW_ORDER     = import.meta.env.VITE_N8N_NEW_ORDER as string | undefined
const N8N_STATUS_CHANGE = import.meta.env.VITE_N8N_STATUS_CHANGE as string | undefined

async function send(url: string | undefined, payload: unknown): Promise<void> {
  if (!url) return
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch { /* fire-and-forget */ }
}

function basePayload(order: OrderWithDetails) {
  return {
    order_id: order.id,
    order_number: order.order_number,
    order_type: order.order_type,
    fulfillment_type: order.fulfillment_type,
    timestamp: new Date().toISOString(),
    store_owner_email: 'info@cw-electronics.co.za',
    customer: {
      name: order.customers?.name ?? '',
      email: order.customers?.email ?? '',
      phone: order.customers?.phone ?? '',
    },
    order: {
      subtotal: order.subtotal,
      shipping_fee: order.shipping_fee,
      total: order.total,
      items: order.order_items.map((i) => ({
        name: i.product_name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        line_total: i.line_total,
      })),
      shipping_address: order.shipping_address ?? null,
      collection_name: order.collection_name ?? null,
      collection_phone: order.collection_phone ?? null,
    },
  }
}

export async function notifyNewOrder(order: OrderWithDetails): Promise<void> {
  await send(N8N_NEW_ORDER, { event: 'new_order', ...basePayload(order) })
}

export async function notifyStatusChange(
  order: OrderWithDetails,
  previousStatus: OrderStatus,
  newStatus: OrderStatus,
): Promise<void> {
  const NOTIFY_STATUSES: OrderStatus[] = [
    'paid', 'packed', 'out_for_delivery', 'delivered',
    'ready_for_collection', 'collected', 'cancelled',
  ]
  if (!NOTIFY_STATUSES.includes(newStatus)) return
  await send(N8N_STATUS_CHANGE, {
    event: 'order_status_change',
    previous_status: previousStatus,
    new_status: newStatus,
    ...basePayload(order),
  })
}
