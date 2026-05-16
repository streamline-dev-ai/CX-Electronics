import type { OrderWithDetails, OrderStatus } from './supabase'
import {
  orderPlacedCustomer,
  orderPlacedAwaitingPayment,
  orderConfirmedCustomer,
  orderPackedDelivery,
  orderPackedCollection,
  outForDelivery,
  orderDelivered,
  orderCollected,
  orderCancelled,
  ownerNewOrder,
  welcomeEmail,
} from '../emails'
import { getReceiptHTMLString } from './generateReceipt'
import { BANKING_DETAILS } from './banking'

const N8N_NEW_ORDER     = import.meta.env.VITE_N8N_NEW_ORDER as string | undefined
const N8N_STATUS_CHANGE = import.meta.env.VITE_N8N_STATUS_CHANGE as string | undefined
const N8N_SIGNUP        = import.meta.env.VITE_N8N_SIGNUP as string | undefined

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
    store_name: 'CW Electronics',
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
      thumbnail_url: i.thumbnail_url ?? null,
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

const STATUS_SUBJECTS: Partial<Record<OrderStatus, string>> = {
  paid:                 'Payment Confirmed',
  packed:               'Order Packed',
  out_for_delivery:     'Out for Delivery',
  delivered:            'Order Delivered',
  ready_for_collection: 'Ready for Collection',
  collected:            'Order Collected',
  cancelled:            'Order Cancelled',
}

export async function notifySignup(name: string, email: string): Promise<void> {
  await send(N8N_SIGNUP ?? N8N_NEW_ORDER, {
    event: 'customer_signup',
    customer_email_subject: `Welcome to CW Electronics, ${name.split(' ')[0]}!`,
    customer_email_html: welcomeEmail(name, email),
    customer: { name, email },
    timestamp: new Date().toISOString(),
    store_name: 'CW Electronics',
    store_email: 'info@cw-electronics.co.za',
  })
}

export async function notifyNewOrder(order: OrderWithDetails): Promise<void> {
  const awaitingEft = order.payment_method === 'eft' && order.payment_status === 'unpaid'

  const customerHtml = awaitingEft
    ? orderPlacedAwaitingPayment(order, BANKING_DETAILS)
    : orderPlacedCustomer(order)

  const customerSubject = awaitingEft
    ? `Order #${order.order_number} received — please make payment`
    : `Order Received — #${order.order_number}`

  const ownerSubject = awaitingEft
    ? `New EFT order — #${order.order_number} · R${order.total.toFixed(2)} · awaiting payment`
    : `New Order — #${order.order_number} · R${order.total.toFixed(2)}`

  await send(N8N_NEW_ORDER, {
    event: 'order_placed',
    awaiting_payment: awaitingEft,
    customer_email_subject: customerSubject,
    customer_email_html: customerHtml,
    owner_email_subject: ownerSubject,
    owner_email_html: ownerNewOrder(order),
    banking: awaitingEft ? {
      bank: BANKING_DETAILS.bank,
      account_holder: BANKING_DETAILS.accountHolder,
      account_number: BANKING_DETAILS.accountNumber,
      branch_code: BANKING_DETAILS.branchCode,
      account_type: BANKING_DETAILS.accountType,
      reference: order.payment_reference ?? order.order_number,
    } : null,
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
  } else if (newStatus === 'delivered') {
    customerEmailHtml = orderDelivered(updatedOrder)
  } else if (newStatus === 'collected') {
    customerEmailHtml = orderCollected(updatedOrder)
  } else if (newStatus === 'cancelled') {
    customerEmailHtml = orderCancelled(updatedOrder)
  }

  const subjectLabel = STATUS_SUBJECTS[newStatus] ?? 'Order Update'

  await send(N8N_STATUS_CHANGE, {
    event: 'order_status_change',
    previous_status: previousStatus,
    new_status: newStatus,
    customer_email_subject: customerEmailHtml ? `${subjectLabel} — #${order.order_number}` : null,
    customer_email_html: customerEmailHtml,
    owner_email_subject: ownerEmailHtml ? `Order Paid — #${order.order_number} · R${order.total.toFixed(2)}` : null,
    owner_email_html: ownerEmailHtml,
    receipt_html: receiptHtml,
    ...basePayload(updatedOrder),
  })
}
