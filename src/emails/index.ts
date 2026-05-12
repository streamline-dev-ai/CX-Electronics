import type { OrderWithDetails } from '../lib/supabase'

const NAVY   = '#0B1929'
const RED    = '#E63939'
const DARK   = '#111827'
const LOGO   = 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777722832/CW-Logo_ujfdip.png'
const SITE   = 'https://cw-electronics.co.za'

function wrap(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#F8F9FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:30px 16px;">
    <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#fff;box-shadow:0 10px 30px rgba(0,0,0,0.06);">

      <tr>
        <td style="background:${NAVY};padding:28px 40px;text-align:center;">
          <img src="${LOGO}" alt="CW Electronics" height="55" style="display:block;margin:0 auto 10px;" />
          <span style="color:#fff;font-size:24px;font-weight:700;letter-spacing:2px;">CW ELECTRONICS</span>
        </td>
      </tr>

      ${body}

      <tr>
        <td style="background:#F1F5F9;padding:32px 40px;text-align:center;font-size:13px;color:#64748B;">
          <p style="margin:0;">CW Electronics &bull; China Mart, Shop C15, Crown Mines, Johannesburg</p>
          <p style="margin:8px 0 0;">Questions? <a href="mailto:info@cw-electronics.co.za" style="color:${RED};text-decoration:none;">info@cw-electronics.co.za</a></p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

function itemsTable(order: OrderWithDetails): string {
  const rows = order.order_items.map((i) => `
    <tr>
      <td style="padding:16px 28px;border-bottom:1px solid #E5E7EB;width:76px;">
        ${i.thumbnail_url
          ? `<img src="${i.thumbnail_url}" alt="" width="60" style="display:block;">`
          : `<div style="width:60px;height:60px;background:#F3F4F6;"></div>`}
      </td>
      <td style="padding:16px 12px 16px 0;border-bottom:1px solid #E5E7EB;font-size:15px;color:#111827;">${i.product_name}</td>
      <td style="padding:16px 12px;border-bottom:1px solid #E5E7EB;text-align:center;font-size:14px;color:#4B5563;">&times;${i.quantity}</td>
      <td style="padding:16px 28px;border-bottom:1px solid #E5E7EB;text-align:right;font-size:15px;font-weight:600;color:#111827;">R${i.line_total.toFixed(2)}</td>
    </tr>`).join('')

  const shippingRow = `
    <tr>
      <td colspan="3" style="padding:14px 28px;font-size:14px;color:#6B7280;">Shipping</td>
      <td style="padding:14px 28px;font-size:14px;color:#6B7280;text-align:right;">${order.shipping_fee === 0 ? 'FREE' : `R${order.shipping_fee.toFixed(2)}`}</td>
    </tr>`

  const totalRow = `
    <tr style="background:${DARK};">
      <td colspan="3" style="padding:20px 28px;font-size:17px;font-weight:700;color:#fff;">Total</td>
      <td style="padding:20px 28px;font-size:22px;font-weight:800;color:#fff;text-align:right;">R${order.total.toFixed(2)}</td>
    </tr>`

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#FAFAFB;margin:24px 0;">
    <tr style="background:${DARK};">
      <td colspan="4" style="padding:16px 28px;color:#fff;font-size:14px;font-weight:600;">Order Summary</td>
    </tr>
    ${rows}
    ${shippingRow}
    ${totalRow}
  </table>`
}

function itemsListSimple(order: OrderWithDetails): string {
  const rows = order.order_items.map((i) => `
    <tr>
      <td style="padding:14px 28px;border-bottom:1px solid #E5E7EB;width:76px;">
        ${i.thumbnail_url
          ? `<img src="${i.thumbnail_url}" alt="" width="60" style="display:block;">`
          : `<div style="width:60px;height:60px;background:#F3F4F6;"></div>`}
      </td>
      <td style="padding:14px 0;border-bottom:1px solid #E5E7EB;font-size:15px;color:#111827;">${i.product_name}</td>
      <td style="padding:14px 28px;border-bottom:1px solid #E5E7EB;text-align:right;font-size:14px;color:#4B5563;">&times;${i.quantity}</td>
    </tr>`).join('')

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#FAFAFB;margin:24px 0;">
    <tr style="background:${DARK};">
      <td colspan="3" style="padding:16px 28px;color:#fff;font-size:14px;font-weight:600;">Items</td>
    </tr>
    ${rows}
  </table>`
}

function fulfillmentBlock(order: OrderWithDetails): string {
  if (order.fulfillment_type === 'collection') {
    return `
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;padding:20px 28px;margin:0 0 24px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Collection Point</p>
      <p style="margin:0;font-size:14px;color:#111827;font-weight:600;">China Mart, Shop C15</p>
      <p style="margin:4px 0 0;font-size:14px;color:#374151;">3 Press Avenue, Crown Mines, Johannesburg</p>
      ${order.collection_name ? `<p style="margin:8px 0 0;font-size:13px;color:#64748B;">Collecting: <strong>${order.collection_name}</strong></p>` : ''}
    </div>`
  }
  const addr = order.shipping_address
  const lines = addr
    ? [addr.address_line1, addr.address_line2, addr.city, addr.province, addr.postal_code].filter(Boolean)
    : []
  return `
  <div style="background:#F8FAFC;border:1px solid #E2E8F0;padding:20px 28px;margin:0 0 24px;">
    <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Delivery Address</p>
    ${lines.map((l) => `<p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">${l}</p>`).join('')}
  </div>`
}

function receiptButton(orderId: string): string {
  return `
  <div style="text-align:center;margin:28px 0;">
    <a href="${SITE}/receipt/${orderId}"
       style="background:${RED};color:#fff;padding:16px 38px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block;">
      View / Download Receipt
    </a>
  </div>`
}

// ─── Template 1: Order Placed (payment pending) ───────────────────────────────

export function orderPlacedCustomer(order: OrderWithDetails): string {
  const name = order.customers?.name ?? 'Customer'
  const body = `
    <tr><td style="padding:36px 40px 12px;">
      <h1 style="margin:0 0 8px;font-size:26px;color:#111827;">Thank you for your order!</h1>
      <p style="margin:0 0 20px;font-size:16px;color:#4B5563;">
        Order <strong>#${order.order_number}</strong> has been received.
      </p>
      <p style="margin:0 0 4px;font-size:15px;line-height:1.6;color:#374151;">
        Hi ${name}, we've got your order and are waiting to confirm your payment.
        Once confirmed we'll send you another email.
      </p>
    </td></tr>
    <tr><td style="padding:0 0 8px;">
      ${itemsTable(order)}
    </td></tr>
    <tr><td style="padding:0 40px 8px;">
      ${fulfillmentBlock(order)}
      <div style="background:#FEF9C3;border:1px solid #FDE68A;padding:16px 20px;">
        <p style="margin:0;font-size:14px;color:#92400E;">
          <strong>Payment pending</strong> — your order is reserved while we confirm your payment.
        </p>
      </div>
    </td></tr>
    <tr><td style="padding:16px 40px 36px;text-align:center;font-size:13px;color:#94A3B8;">
      Questions? <a href="mailto:info@cw-electronics.co.za" style="color:${RED};text-decoration:none;">info@cw-electronics.co.za</a>
    </td></tr>`

  return wrap(body)
}

// ─── Template 2: Payment Confirmed (customer) ────────────────────────────────

export function orderConfirmedCustomer(order: OrderWithDetails): string {
  const name = order.customers?.name ?? 'Customer'
  const body = `
    <tr><td style="padding:36px 40px 12px;">
      <h1 style="margin:0 0 8px;font-size:26px;color:#111827;">Thank you for your order!</h1>
      <p style="margin:0 0 20px;font-size:16px;color:#4B5563;">
        Order <strong>#${order.order_number}</strong> has been confirmed.
      </p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#374151;">
        Hi ${name}, your payment has been confirmed. We'll update you when your order is out for delivery or ready for collection.
      </p>
    </td></tr>
    <tr><td style="padding:0 0 8px;">
      ${itemsTable(order)}
    </td></tr>
    <tr><td style="padding:0 40px 36px;">
      ${fulfillmentBlock(order)}
      ${receiptButton(order.id)}
      <p style="margin:0;text-align:center;font-size:13px;color:#94A3B8;">
        Questions? <a href="mailto:info@cw-electronics.co.za" style="color:${RED};text-decoration:none;">info@cw-electronics.co.za</a>
      </p>
    </td></tr>`

  return wrap(body)
}

// ─── Template 3: Packed — Delivery ───────────────────────────────────────────

export function orderPackedDelivery(order: OrderWithDetails): string {
  const name = order.customers?.name ?? 'Customer'
  const addr = order.shipping_address
  const addrLines = addr
    ? [addr.address_line1, addr.address_line2, addr.city, addr.province].filter(Boolean)
    : []

  const body = `
    <tr><td style="padding:36px 40px 12px;">
      <h1 style="margin:0 0 8px;font-size:26px;color:#111827;">Your order has been packed!</h1>
      <p style="margin:0 0 20px;font-size:16px;color:#4B5563;">Order <strong>#${order.order_number}</strong></p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#374151;">
        Hi ${name}, your order has been packed and is being prepared for delivery.
        You'll receive another update once it's out for delivery.
      </p>
    </td></tr>
    <tr><td style="padding:0 0 8px;">
      ${itemsListSimple(order)}
    </td></tr>
    <tr><td style="padding:0 40px 36px;">
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;padding:20px 28px;margin-bottom:24px;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Delivering to</p>
        ${addrLines.map((l) => `<p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">${l}</p>`).join('')}
      </div>
      <p style="margin:0;text-align:center;font-size:13px;color:#94A3B8;">
        Questions? <a href="mailto:info@cw-electronics.co.za" style="color:${RED};text-decoration:none;">info@cw-electronics.co.za</a>
      </p>
    </td></tr>`

  return wrap(body)
}

// ─── Template 4: Packed — Collection ─────────────────────────────────────────

export function orderPackedCollection(order: OrderWithDetails): string {
  const name = order.customers?.name ?? 'Customer'
  const body = `
    <tr><td style="padding:36px 40px 12px;">
      <h1 style="margin:0 0 8px;font-size:26px;color:#111827;">Your order is ready!</h1>
      <p style="margin:0 0 20px;font-size:16px;color:#4B5563;">Order <strong>#${order.order_number}</strong> is ready for collection.</p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#374151;">
        Hi ${name}, your order has been packed and is waiting for you at our store.
      </p>
    </td></tr>
    <tr><td style="padding:0 0 8px;">
      ${itemsListSimple(order)}
    </td></tr>
    <tr><td style="padding:0 40px 36px;">
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;padding:20px 28px;margin-bottom:16px;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Collection Details</p>
        <p style="margin:0;font-size:15px;font-weight:700;color:#111827;">China Mart, Shop C15</p>
        <p style="margin:4px 0 0;font-size:14px;color:#374151;">3 Press Avenue, Crown Mines, Johannesburg</p>
        <p style="margin:4px 0 0;font-size:13px;color:#64748B;">Mon–Sat 09:00–15:00</p>
        ${order.collection_name ? `<p style="margin:10px 0 0;font-size:13px;color:#64748B;">Collector: <strong>${order.collection_name}</strong></p>` : ''}
      </div>
      <div style="background:#FEF9C3;border:1px solid #FDE68A;padding:14px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:14px;color:#92400E;">
          Please bring your order number <strong>#${order.order_number}</strong> when you collect.
        </p>
      </div>
      <p style="margin:0;text-align:center;font-size:13px;color:#94A3B8;">
        Questions? <a href="mailto:info@cw-electronics.co.za" style="color:${RED};text-decoration:none;">info@cw-electronics.co.za</a>
      </p>
    </td></tr>`

  return wrap(body)
}

// ─── Template 5: Out for Delivery ────────────────────────────────────────────

export function outForDelivery(order: OrderWithDetails): string {
  const name = order.customers?.name ?? 'Customer'
  const addr = order.shipping_address
  const addrLines = addr
    ? [addr.address_line1, addr.address_line2, addr.city, addr.province].filter(Boolean)
    : []

  const body = `
    <tr><td style="padding:36px 40px 12px;">
      <h1 style="margin:0 0 8px;font-size:26px;color:#111827;">Your order is on its way!</h1>
      <p style="margin:0 0 20px;font-size:16px;color:#4B5563;">Order <strong>#${order.order_number}</strong></p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#374151;">
        Hi ${name}, great news! Your order has been dispatched and is now on its way to you.
      </p>
    </td></tr>
    <tr><td style="padding:0 0 8px;">
      ${itemsListSimple(order)}
    </td></tr>
    <tr><td style="padding:0 40px 36px;">
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;padding:20px 28px;margin-bottom:24px;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Delivering to</p>
        ${addrLines.map((l) => `<p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">${l}</p>`).join('')}
      </div>
      <p style="margin:0;text-align:center;font-size:13px;color:#94A3B8;">
        Questions? <a href="mailto:info@cw-electronics.co.za" style="color:${RED};text-decoration:none;">info@cw-electronics.co.za</a>
      </p>
    </td></tr>`

  return wrap(body)
}

// ─── Template 6: Welcome Email (new customer signup) ─────────────────────────

export function welcomeEmail(name: string, email: string): string {
  const firstName = name.split(' ')[0] || name
  const body = `
    <tr><td style="padding:36px 40px 12px;">
      <h1 style="margin:0 0 8px;font-size:26px;color:#111827;">Welcome to CW Electronics!</h1>
      <p style="margin:0 0 20px;font-size:16px;color:#4B5563;">
        Hi ${firstName}, your account has been created.
      </p>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#374151;">
        Thanks for signing up! You can now track your orders, save your details, and enjoy a faster checkout experience every time you shop with us.
      </p>
    </td></tr>
    <tr><td style="padding:0 40px 8px;">
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;padding:20px 28px;margin-bottom:24px;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Account Details</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#111827;">${name}</p>
        <p style="margin:4px 0 0;font-size:14px;color:#374151;">${email}</p>
      </div>
    </td></tr>
    <tr><td style="padding:0 40px 36px;text-align:center;">
      <a href="${SITE}/shop"
         style="background:${RED};color:#fff;padding:16px 38px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block;">
        Start Shopping
      </a>
      <p style="margin:24px 0 0;font-size:13px;color:#94A3B8;">
        Questions? <a href="mailto:info@cw-electronics.co.za" style="color:${RED};text-decoration:none;">info@cw-electronics.co.za</a>
      </p>
    </td></tr>`

  return wrap(body)
}

// ─── Template 7: Order Delivered ─────────────────────────────────────────────

export function orderDelivered(order: OrderWithDetails): string {
  const name = order.customers?.name ?? 'Customer'
  const body = `
    <tr><td style="padding:36px 40px 12px;">
      <h1 style="margin:0 0 8px;font-size:26px;color:#111827;">Your order has been delivered!</h1>
      <p style="margin:0 0 20px;font-size:16px;color:#4B5563;">Order <strong>#${order.order_number}</strong></p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#374151;">
        Hi ${name}, your order has been successfully delivered. We hope you love your purchase!
      </p>
    </td></tr>
    <tr><td style="padding:0 0 8px;">
      ${itemsListSimple(order)}
    </td></tr>
    <tr><td style="padding:0 40px 36px;">
      ${receiptButton(order.id)}
      <p style="margin:0;text-align:center;font-size:13px;color:#94A3B8;">
        Questions? <a href="mailto:info@cw-electronics.co.za" style="color:${RED};text-decoration:none;">info@cw-electronics.co.za</a>
      </p>
    </td></tr>`
  return wrap(body)
}

// ─── Template 8: Order Collected ─────────────────────────────────────────────

export function orderCollected(order: OrderWithDetails): string {
  const name = order.customers?.name ?? 'Customer'
  const body = `
    <tr><td style="padding:36px 40px 12px;">
      <h1 style="margin:0 0 8px;font-size:26px;color:#111827;">Order collected — thank you!</h1>
      <p style="margin:0 0 20px;font-size:16px;color:#4B5563;">Order <strong>#${order.order_number}</strong></p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#374151;">
        Hi ${name}, your order has been collected. Thank you for shopping with us!
      </p>
    </td></tr>
    <tr><td style="padding:0 0 8px;">
      ${itemsListSimple(order)}
    </td></tr>
    <tr><td style="padding:0 40px 36px;">
      ${receiptButton(order.id)}
      <p style="margin:0;text-align:center;font-size:13px;color:#94A3B8;">
        Questions? <a href="mailto:info@cw-electronics.co.za" style="color:${RED};text-decoration:none;">info@cw-electronics.co.za</a>
      </p>
    </td></tr>`
  return wrap(body)
}

// ─── Template 9: Order Cancelled ─────────────────────────────────────────────

export function orderCancelled(order: OrderWithDetails): string {
  const name = order.customers?.name ?? 'Customer'
  const body = `
    <tr><td style="padding:36px 40px 12px;">
      <h1 style="margin:0 0 8px;font-size:26px;color:#111827;">Your order has been cancelled</h1>
      <p style="margin:0 0 20px;font-size:16px;color:#4B5563;">Order <strong>#${order.order_number}</strong></p>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#374151;">
        Hi ${name}, your order has been cancelled. If you didn't request this or have any questions, please reach out to us.
      </p>
      <div style="background:#FEF2F2;border:1px solid #FECACA;padding:16px 20px;">
        <p style="margin:0;font-size:14px;color:#991B1B;">
          If a payment was made, a refund will be processed within 3–5 business days.
        </p>
      </div>
    </td></tr>
    <tr><td style="padding:0 0 8px;">
      ${itemsListSimple(order)}
    </td></tr>
    <tr><td style="padding:24px 40px 36px;text-align:center;">
      <p style="margin:0;font-size:13px;color:#94A3B8;">
        Questions? <a href="mailto:info@cw-electronics.co.za" style="color:${RED};text-decoration:none;">info@cw-electronics.co.za</a>
      </p>
    </td></tr>`
  return wrap(body)
}

// ─── Template 10: Owner New Order Notification ───────────────────────────────

export function ownerNewOrder(order: OrderWithDetails): string {
  const isCollection = order.fulfillment_type === 'collection'
  const addr = order.shipping_address
  const addrStr = addr
    ? [addr.address_line1, addr.address_line2, addr.city, addr.province, addr.postal_code].filter(Boolean).join(', ')
    : '—'

  const itemRows = order.order_items.map((i) => `
    <tr>
      <td style="padding:14px 28px;border-bottom:1px solid #E5E7EB;width:76px;">
        ${i.thumbnail_url
          ? `<img src="${i.thumbnail_url}" alt="" width="60" style="display:block;">`
          : `<div style="width:60px;height:60px;background:#F3F4F6;"></div>`}
      </td>
      <td style="padding:14px 0;border-bottom:1px solid #E5E7EB;font-size:14px;color:#111827;">${i.product_name}</td>
      <td style="padding:14px 12px;border-bottom:1px solid #E5E7EB;text-align:center;font-size:14px;color:#4B5563;">&times;${i.quantity}</td>
      <td style="padding:14px 28px;border-bottom:1px solid #E5E7EB;text-align:right;font-size:14px;font-weight:600;color:#111827;">R${i.line_total.toFixed(2)}</td>
    </tr>`).join('')

  const body = `
    <tr><td style="background:${RED};padding:20px 40px;text-align:center;">
      <h1 style="margin:0;font-size:24px;color:#fff;">New Order Received</h1>
      <p style="margin:8px 0 0;font-size:16px;color:rgba(255,255,255,0.9);">
        #${order.order_number} &bull; R${order.total.toFixed(2)} &bull; ${isCollection ? 'Collection' : 'Delivery'}
      </p>
    </td></tr>
    <tr><td style="padding:28px 40px 12px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Customer</p>
      <p style="margin:0;font-size:15px;font-weight:600;color:#111827;">${order.customers?.name ?? '—'}</p>
      <p style="margin:2px 0 0;font-size:14px;color:#374151;">${order.customers?.email ?? '—'}</p>
      <p style="margin:2px 0 0;font-size:14px;color:#374151;">${order.customers?.phone ?? '—'}</p>
    </td></tr>
    <tr><td style="padding:0 0 8px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#FAFAFB;">
        <tr style="background:${DARK};">
          <td colspan="4" style="padding:16px 28px;color:#fff;font-size:14px;font-weight:600;">Items Ordered</td>
        </tr>
        ${itemRows}
        <tr>
          <td colspan="3" style="padding:14px 28px;font-size:14px;color:#6B7280;">Shipping</td>
          <td style="padding:14px 28px;font-size:14px;color:#6B7280;text-align:right;">${order.shipping_fee === 0 ? 'FREE' : `R${order.shipping_fee.toFixed(2)}`}</td>
        </tr>
        <tr style="background:${DARK};">
          <td colspan="3" style="padding:20px 28px;font-size:17px;font-weight:700;color:#fff;">Total</td>
          <td style="padding:20px 28px;font-size:22px;font-weight:800;color:#fff;text-align:right;">R${order.total.toFixed(2)}</td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="padding:20px 40px 36px;">
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;padding:20px 28px;margin-bottom:24px;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:1px;">${isCollection ? 'Collection' : 'Deliver to'}</p>
        <p style="margin:0;font-size:14px;color:#374151;">
          ${isCollection
            ? `China Mart, Shop C15, Crown Mines${order.collection_name ? ` · Collector: ${order.collection_name}` : ''}`
            : addrStr}
        </p>
      </div>
      <div style="text-align:center;">
        <a href="${SITE}/admin/orders/${order.id}"
           style="background:${RED};color:#fff;padding:16px 38px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block;">
          Process Order in Admin
        </a>
      </div>
    </td></tr>`

  return wrap(body)
}
