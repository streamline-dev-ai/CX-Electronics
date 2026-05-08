/**
 * CXX Electronics — n8n Webhook Triggers
 *
 * ARCHITECTURE:
 * Two webhook endpoints handle the full order lifecycle:
 *   VITE_N8N_NEW_ORDER      — fired when a new order is created (before payment)
 *   VITE_N8N_STATUS_CHANGE  — fired on every status transition by admin or payment gateway
 *
 * Each payload includes pre-rendered `customer_email_html` and/or `owner_email_html`
 * so n8n workflows only need to forward the HTML to their Send Email node — no
 * template logic required in n8n.
 *
 * n8n WORKFLOW SETUP:
 *
 * Workflow 1 — "CXX New Order" (VITE_N8N_NEW_ORDER):
 *   Webhook → Send Email to customer (customer_email_html)
 *   Triggered by: Checkout page on order creation
 *
 * Workflow 2 — "CXX Order Status Change" (VITE_N8N_STATUS_CHANGE):
 *   Webhook → Switch on `new_status`:
 *     "paid"                  → Send Email to customer (customer_email_html)
 *                             → Send Email to owner info@cw-electronics.co.za (owner_email_html)
 *                             → Attach receipt_html as PDF to customer email
 *     "packed" (delivery)     → Send Email to customer (customer_email_html)
 *     "packed" (collection)   → Send Email to customer (customer_email_html)
 *     "out_for_delivery"      → Send Email to customer (customer_email_html)
 *     other statuses          → no email (just log)
 *
 * PAYFAST ITN FLOW:
 *   1. PayFast sends ITN POST to: https://vsneqdjdkzbykkvvliju.supabase.co/functions/v1/payfast-itn
 *   2. Edge function verifies payment_status = 'COMPLETE'
 *   3. Edge function calls updateOrderStatus(orderId, 'paid', 'payment_gateway')
 *      which updates orders.status + inserts into order_status_events
 *   4. Edge function (or a Supabase webhook trigger) fires VITE_N8N_STATUS_CHANGE
 *      with new_status = 'paid'
 *   5. n8n sends orderConfirmedCustomer email + ownerNewOrder email with receipt attached
 */

import type { OrderWithDetails, OrderStatus } from './supabase'
import {
  orderPlacedCustomer,
  orderConfirmedCustomer,
  orderPackedDelivery,
  orderPackedCollection,
  outForDelivery,
  ownerNewOrder,
} from '../emails'
import { getReceiptHTMLString } from './generateReceipt'

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
    status: order.status,
    timestamp: new Date().toISOString(),
    store_name: 'CXX Electronics',
    store_email: 'info@cw-electronics.co.za',
    customer: {
      name: order.customers?.name ?? '',
      email: order.customers?.email ?? '',
      phone: order.customers?.phone ?? '',
    },
    items: order.order_items.map((i) => ({
      product_name: i.product_name,
      quantity: i.quantity,
      unit_price: i.unit_price,
      line_total: i.line_total,
    })),
    subtotal: order.subtotal,
    shipping_fee: order.shipping_fee,
    total: order.total,
    shipping_address: order.shipping_address ?? null,
    collection_name: order.collection_name ?? null,
    collection_phone: order.collection_phone ?? null,
    notes: order.notes ?? null,
    payment_method: order.payment_method ?? null,
    payment_reference: order.payment_reference ?? null,
    created_at: order.created_at,
  }
}

export async function notifyNewOrder(order: OrderWithDetails): Promise<void> {
  await send(N8N_NEW_ORDER, {
    event: 'order_placed',
    customer_email_html: orderPlacedCustomer(order),
    ...basePayload(order),
  })
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

  const updatedOrder = { ...order, status: newStatus }

  let customerEmailHtml: string | null = null
  let ownerEmailHtml: string | null = null
  let receiptHtml: string | null = null

  if (newStatus === 'paid') {
    customerEmailHtml = orderConfirmedCustomer(updatedOrder)
    ownerEmailHtml = ownerNewOrder(updatedOrder)
    receiptHtml = getReceiptHTMLString(updatedOrder)
  } else if (newStatus === 'packed') {
    customerEmailHtml = order.fulfillment_type === 'collection'
      ? orderPackedCollection(updatedOrder)
      : orderPackedDelivery(updatedOrder)
  } else if (newStatus === 'out_for_delivery') {
    customerEmailHtml = outForDelivery(updatedOrder)
  }

  await send(N8N_STATUS_CHANGE, {
    event: 'order_status_change',
    previous_status: previousStatus,
    new_status: newStatus,
    customer_email_html: customerEmailHtml,
    owner_email_html: ownerEmailHtml,
    receipt_html: receiptHtml,
    ...basePayload(updatedOrder),
  })
}
