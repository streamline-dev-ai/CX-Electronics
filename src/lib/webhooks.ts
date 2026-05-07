import type { OrderWithDetails, OrderStatus } from './supabase'

const URLS: Record<string, string | undefined> = {
  new_order:              import.meta.env.VITE_N8N_NEW_ORDER,
  paid:                   import.meta.env.VITE_N8N_ORDER_PAID,
  packed:                 import.meta.env.VITE_N8N_ORDER_PACKED,
  out_for_delivery:       import.meta.env.VITE_N8N_OUT_FOR_DELIVERY,
  delivered:              import.meta.env.VITE_N8N_DELIVERED,
  ready_for_collection:   import.meta.env.VITE_N8N_READY_FOR_COLLECTION,
  collected:              import.meta.env.VITE_N8N_COLLECTED,
  cancelled:              import.meta.env.VITE_N8N_CANCELLED,
}

async function send(key: string, payload: unknown): Promise<void> {
  const url = URLS[key]
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
  await send('new_order', { event: 'new_order', ...basePayload(order) })
}

export async function notifyStatusChange(
  order: OrderWithDetails,
  previousStatus: OrderStatus,
  newStatus: OrderStatus,
): Promise<void> {
  const key = newStatus === 'paid' ? 'paid'
    : newStatus === 'packed' ? 'packed'
    : newStatus === 'out_for_delivery' ? 'out_for_delivery'
    : newStatus === 'delivered' ? 'delivered'
    : newStatus === 'ready_for_collection' ? 'ready_for_collection'
    : newStatus === 'collected' ? 'collected'
    : newStatus === 'cancelled' ? 'cancelled'
    : null

  if (!key) return
  await send(key, {
    event: 'order_status_change',
    previous_status: previousStatus,
    new_status: newStatus,
    ...basePayload(order),
  })
}
