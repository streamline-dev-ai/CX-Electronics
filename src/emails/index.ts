import type { OrderWithDetails } from '../lib/supabase'

// CXX Electronics email templates — inline HTML/CSS, self-contained.
// These are rendered on the client and sent inside n8n webhook payloads.
// n8n uses the html string directly in its Send Email node (no template building needed on n8n side).

const RED = '#e63329'
const DARK = '#0a0a0a'
const CARD = '#141414'
const BORDER = '#2a2a2a'
const WHITE = '#ffffff'
const MUTED = '#9a9a9a'

function wrap(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${DARK};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${WHITE};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${DARK};padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- Header -->
      <tr>
        <td style="background:${CARD};border:1px solid ${BORDER};border-bottom:3px solid ${RED};border-radius:12px 12px 0 0;padding:28px 32px;">
          <p style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;color:${WHITE};">
            CXX<span style="color:${RED};">.</span> Electronics
          </p>
          <p style="margin:4px 0 0;font-size:12px;color:${MUTED};letter-spacing:1px;text-transform:uppercase;">
            Dragon City, Fordsburg, Johannesburg
          </p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="background:${CARD};border:1px solid ${BORDER};border-top:none;border-bottom:none;padding:32px;">
          ${body}
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#0d0d0d;border:1px solid ${BORDER};border-top:1px solid ${BORDER};border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
          <p style="margin:0;font-size:12px;color:${MUTED};">
            CXX Electronics &bull; Dragon City, Shop 14, Fordsburg, Johannesburg<br />
            <a href="mailto:info@cw-electronics.co.za" style="color:${RED};text-decoration:none;">info@cw-electronics.co.za</a>
          </p>
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
      <td style="padding:10px 12px;border-bottom:1px solid ${BORDER};font-size:14px;color:${WHITE};">${i.product_name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${BORDER};font-size:14px;color:${MUTED};text-align:center;">${i.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${BORDER};font-size:14px;color:${MUTED};text-align:right;">R${i.unit_price.toFixed(2)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${BORDER};font-size:14px;color:${WHITE};text-align:right;font-weight:600;">R${i.line_total.toFixed(2)}</td>
    </tr>`).join('')

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-radius:8px;overflow:hidden;margin:20px 0;">
    <thead>
      <tr style="background:#1a1a1a;">
        <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.8px;">Product</th>
        <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.8px;">Qty</th>
        <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.8px;">Price</th>
        <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.8px;">Total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`
}

function itemsListSimple(order: OrderWithDetails): string {
  const rows = order.order_items.map((i) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid ${BORDER};font-size:14px;color:${WHITE};">${i.product_name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid ${BORDER};font-size:14px;color:${MUTED};text-align:center;">×${i.quantity}</td>
    </tr>`).join('')

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-radius:8px;overflow:hidden;margin:20px 0;">
    <tbody>${rows}</tbody>
  </table>`
}

function totalsBlock(order: OrderWithDetails): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;">
    <tr>
      <td style="padding:6px 0;font-size:14px;color:${MUTED};">Subtotal</td>
      <td style="padding:6px 0;font-size:14px;color:${MUTED};text-align:right;">R${order.subtotal.toFixed(2)}</td>
    </tr>
    <tr>
      <td style="padding:6px 0;font-size:14px;color:${MUTED};">Shipping</td>
      <td style="padding:6px 0;font-size:14px;color:${MUTED};text-align:right;">${order.shipping_fee === 0 ? 'FREE' : `R${order.shipping_fee.toFixed(2)}`}</td>
    </tr>
    <tr>
      <td style="padding:10px 0 4px;font-size:16px;font-weight:800;color:${WHITE};border-top:1px solid ${BORDER};">Total</td>
      <td style="padding:10px 0 4px;font-size:16px;font-weight:800;color:${RED};text-align:right;border-top:1px solid ${BORDER};">R${order.total.toFixed(2)}</td>
    </tr>
  </table>`
}

function fulfillmentBlock(order: OrderWithDetails): string {
  const isCollection = order.fulfillment_type === 'collection'
  if (isCollection) {
    return `
    <div style="background:#1a1a1a;border:1px solid ${BORDER};border-radius:8px;padding:16px 20px;margin-top:20px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.8px;">Collection</p>
      <p style="margin:0;font-size:14px;color:${WHITE};font-weight:600;">Store Collection — Dragon City</p>
      <p style="margin:4px 0 0;font-size:13px;color:${MUTED};">Dragon City Mall, Shop 14, Fordsburg, Johannesburg</p>
      ${order.collection_name ? `<p style="margin:6px 0 0;font-size:13px;color:${MUTED};">Collecting: <span style="color:${WHITE};">${order.collection_name}</span></p>` : ''}
    </div>`
  }
  const addr = order.shipping_address
  const addrStr = addr
    ? [addr.address_line1, addr.address_line2, addr.city, addr.province].filter(Boolean).join(', ')
    : '—'
  return `
  <div style="background:#1a1a1a;border:1px solid ${BORDER};border-radius:8px;padding:16px 20px;margin-top:20px;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.8px;">Delivery Address</p>
    <p style="margin:0;font-size:14px;color:${WHITE};">${addrStr}</p>
  </div>`
}

// ─── Template 1: Order Placed (payment pending) ───────────────────────────────

export function orderPlacedCustomer(order: OrderWithDetails): string {
  const name = order.customers?.name ?? 'Customer'
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${WHITE};">Thanks for your order, ${name}!</h1>
    <p style="margin:0 0 24px;font-size:15px;color:${MUTED};">
      We've received your order <strong style="color:${WHITE};">#${order.order_number}</strong> and are waiting to confirm your payment.
      Once confirmed we'll send you another email with your receipt.
    </p>

    ${itemsTable(order)}
    ${totalsBlock(order)}
    ${fulfillmentBlock(order)}

    <div style="background:#1c1208;border:1px solid #3d2a0a;border-radius:8px;padding:14px 18px;margin-top:24px;">
      <p style="margin:0;font-size:13px;color:#f59e0b;">
        <strong>Payment pending</strong> — your order is reserved while we confirm your payment.
        If you have any questions, email us at
        <a href="mailto:info@cw-electronics.co.za" style="color:${RED};">info@cw-electronics.co.za</a>.
      </p>
    </div>`

  return wrap(`CXX Order #${order.order_number} — Payment Pending`, body)
}

// ─── Template 2: Payment Confirmed (customer) ────────────────────────────────

export function orderConfirmedCustomer(order: OrderWithDetails): string {
  const name = order.customers?.name ?? 'Customer'
  const body = `
    <div style="display:inline-block;background:#0d2b1a;border:1px solid #1a5c35;border-radius:6px;padding:6px 14px;margin-bottom:20px;">
      <p style="margin:0;font-size:12px;font-weight:700;color:#4ade80;text-transform:uppercase;letter-spacing:1px;">Payment Confirmed</p>
    </div>

    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${WHITE};">Great news, ${name}!</h1>
    <p style="margin:0 0 24px;font-size:15px;color:${MUTED};">
      Your payment for order <strong style="color:${WHITE};">#${order.order_number}</strong> has been confirmed.
      Your receipt is attached to this email.
    </p>

    ${itemsTable(order)}
    ${totalsBlock(order)}
    ${fulfillmentBlock(order)}

    <p style="margin:24px 0 0;font-size:14px;color:${MUTED};">
      We'll send you another update once your order has been packed and is on its way.
    </p>`

  return wrap(`Payment Confirmed — CXX Order #${order.order_number}`, body)
}

// ─── Template 3: Packed — Delivery ───────────────────────────────────────────

export function orderPackedDelivery(order: OrderWithDetails): string {
  const name = order.customers?.name ?? 'Customer'
  const addr = order.shipping_address
  const addrStr = addr
    ? [addr.address_line1, addr.address_line2, addr.city, addr.province].filter(Boolean).join(', ')
    : '—'

  const body = `
    <div style="display:inline-block;background:#0d1f2b;border:1px solid #1a4a6b;border-radius:6px;padding:6px 14px;margin-bottom:20px;">
      <p style="margin:0;font-size:12px;font-weight:700;color:#60a5fa;text-transform:uppercase;letter-spacing:1px;">Order Packed</p>
    </div>

    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${WHITE};">Your order has been packed, ${name}!</h1>
    <p style="margin:0 0 24px;font-size:15px;color:${MUTED};">
      Order <strong style="color:${WHITE};">#${order.order_number}</strong> has been packed and is being prepared for delivery.
      You'll receive another update once it's out for delivery.
    </p>

    ${itemsListSimple(order)}

    <div style="background:#1a1a1a;border:1px solid ${BORDER};border-radius:8px;padding:16px 20px;margin-top:4px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.8px;">Delivering to</p>
      <p style="margin:0;font-size:14px;color:${WHITE};">${addrStr}</p>
    </div>`

  return wrap(`CXX Order #${order.order_number} Has Been Packed`, body)
}

// ─── Template 4: Packed — Collection ─────────────────────────────────────────

export function orderPackedCollection(order: OrderWithDetails): string {
  const name = order.customers?.name ?? 'Customer'
  const collectorName = order.collection_name ?? name

  const body = `
    <div style="display:inline-block;background:#0d2b1a;border:1px solid #1a5c35;border-radius:6px;padding:6px 14px;margin-bottom:20px;">
      <p style="margin:0;font-size:12px;font-weight:700;color:#4ade80;text-transform:uppercase;letter-spacing:1px;">Ready for Collection</p>
    </div>

    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${WHITE};">Your order is ready, ${name}!</h1>
    <p style="margin:0 0 24px;font-size:15px;color:${MUTED};">
      Order <strong style="color:${WHITE};">#${order.order_number}</strong> has been packed and is ready for collection.
    </p>

    ${itemsListSimple(order)}

    <div style="background:#1a1a1a;border:1px solid ${BORDER};border-radius:8px;padding:16px 20px;margin-top:4px;">
      <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.8px;">Collection Details</p>
      <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:${WHITE};">Dragon City Mall, Shop 14</p>
      <p style="margin:0 0 4px;font-size:13px;color:${MUTED};">Fordsburg, Johannesburg</p>
      <p style="margin:0 0 4px;font-size:13px;color:${MUTED};">Collection hours: Mon–Sat 09:00–18:00</p>
      ${order.collection_name ? `<p style="margin:10px 0 0;font-size:13px;color:${MUTED};">Collecting: <strong style="color:${WHITE};">${collectorName}</strong></p>` : ''}
    </div>

    <div style="background:#1c1208;border:1px solid #3d2a0a;border-radius:8px;padding:14px 18px;margin-top:16px;">
      <p style="margin:0;font-size:13px;color:#f59e0b;">
        Please bring your order number <strong>#${order.order_number}</strong> when you collect.
      </p>
    </div>`

  return wrap(`CXX Order #${order.order_number} Is Ready for Collection`, body)
}

// ─── Template 5: Out for Delivery ────────────────────────────────────────────

export function outForDelivery(order: OrderWithDetails): string {
  const name = order.customers?.name ?? 'Customer'
  const addr = order.shipping_address
  const addrStr = addr
    ? [addr.address_line1, addr.address_line2, addr.city, addr.province].filter(Boolean).join(', ')
    : '—'

  const body = `
    <div style="display:inline-block;background:#1a0d2b;border:1px solid #4a1a6b;border-radius:6px;padding:6px 14px;margin-bottom:20px;">
      <p style="margin:0;font-size:12px;font-weight:700;color:#c084fc;text-transform:uppercase;letter-spacing:1px;">Out for Delivery</p>
    </div>

    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${WHITE};">Your order is on its way, ${name}!</h1>
    <p style="margin:0 0 24px;font-size:15px;color:${MUTED};">
      Order <strong style="color:${WHITE};">#${order.order_number}</strong> is out for delivery today.
    </p>

    ${itemsListSimple(order)}

    <div style="background:#1a1a1a;border:1px solid ${BORDER};border-radius:8px;padding:16px 20px;margin-top:4px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.8px;">Delivering to</p>
      <p style="margin:0;font-size:14px;color:${WHITE};">${addrStr}</p>
    </div>

    <p style="margin:20px 0 0;font-size:14px;color:${MUTED};">
      Any issues? Contact us at
      <a href="mailto:info@cw-electronics.co.za" style="color:${RED};">info@cw-electronics.co.za</a>
    </p>`

  return wrap(`CXX Order #${order.order_number} Is On Its Way!`, body)
}

// ─── Template 6: Owner New Order Notification ────────────────────────────────

export function ownerNewOrder(order: OrderWithDetails): string {
  const isCollection = order.fulfillment_type === 'collection'
  const addr = order.shipping_address
  const addrStr = addr
    ? [addr.address_line1, addr.address_line2, addr.city, addr.province, addr.postal_code].filter(Boolean).join(', ')
    : '—'

  const fulfillmentBadge = isCollection
    ? `<span style="background:#0d2b1a;border:1px solid #1a5c35;color:#4ade80;font-size:13px;font-weight:800;padding:4px 12px;border-radius:4px;letter-spacing:1px;text-transform:uppercase;">COLLECTION</span>`
    : `<span style="background:#0d1f2b;border:1px solid #1a4a6b;color:#60a5fa;font-size:13px;font-weight:800;padding:4px 12px;border-radius:4px;letter-spacing:1px;text-transform:uppercase;">DELIVERY</span>`

  const itemRows = order.order_items.map((i) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid ${BORDER};font-size:13px;color:${WHITE};">${i.product_name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid ${BORDER};font-size:13px;color:${MUTED};text-align:center;">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid ${BORDER};font-size:13px;color:${MUTED};text-align:right;">R${i.unit_price.toFixed(2)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid ${BORDER};font-size:13px;color:${WHITE};text-align:right;font-weight:600;">R${i.line_total.toFixed(2)}</td>
    </tr>`).join('')

  const body = `
    <div style="margin-bottom:20px;">
      <span style="font-size:18px;font-weight:800;color:${WHITE};">New Order: ${order.order_number}</span>
      &nbsp;&nbsp;${fulfillmentBadge}
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-radius:8px;overflow:hidden;margin-bottom:20px;">
      <tr style="background:#1a1a1a;">
        <td style="padding:10px 14px;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.8px;width:130px;">Customer</td>
        <td style="padding:10px 14px;font-size:14px;color:${WHITE};font-weight:600;">${order.customers?.name ?? '—'}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.8px;">Email</td>
        <td style="padding:10px 14px;font-size:14px;color:${WHITE};">${order.customers?.email ?? '—'}</td>
      </tr>
      <tr style="background:#1a1a1a;">
        <td style="padding:10px 14px;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.8px;">Phone</td>
        <td style="padding:10px 14px;font-size:14px;color:${WHITE};">${order.customers?.phone ?? '—'}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.8px;">
          ${isCollection ? 'Collection' : 'Deliver to'}
        </td>
        <td style="padding:10px 14px;font-size:14px;color:${WHITE};">
          ${isCollection
            ? `Dragon City, Shop 14, Fordsburg${order.collection_name ? ` · Collector: ${order.collection_name}` : ''}`
            : addrStr}
        </td>
      </tr>
      <tr style="background:#1a1a1a;">
        <td style="padding:10px 14px;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.8px;">Payment</td>
        <td style="padding:10px 14px;font-size:14px;color:${WHITE};">
          ${order.payment_method ?? '—'}
          ${order.payment_reference ? `<span style="color:${MUTED};font-size:12px;"> · Ref: ${order.payment_reference}</span>` : ''}
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-radius:8px;overflow:hidden;margin-bottom:16px;">
      <thead>
        <tr style="background:#1a1a1a;">
          <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.8px;">Product</th>
          <th style="padding:8px 12px;text-align:center;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.8px;">Qty</th>
          <th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.8px;">Price</th>
          <th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.8px;">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:4px 0;font-size:13px;color:${MUTED};">Subtotal</td>
        <td style="padding:4px 0;font-size:13px;color:${MUTED};text-align:right;">R${order.subtotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;color:${MUTED};">Shipping</td>
        <td style="padding:4px 0;font-size:13px;color:${MUTED};text-align:right;">${order.shipping_fee === 0 ? 'FREE' : `R${order.shipping_fee.toFixed(2)}`}</td>
      </tr>
      <tr>
        <td style="padding:10px 0 4px;font-size:18px;font-weight:800;color:${WHITE};border-top:1px solid ${BORDER};">TOTAL</td>
        <td style="padding:10px 0 4px;font-size:18px;font-weight:800;color:${RED};text-align:right;border-top:1px solid ${BORDER};">R${order.total.toFixed(2)}</td>
      </tr>
    </table>

    <a href="https://cw-electronics.co.za/admin/orders/${order.id}"
       style="display:inline-block;background:${RED};color:${WHITE};font-size:13px;font-weight:700;padding:10px 22px;border-radius:6px;text-decoration:none;letter-spacing:0.5px;">
      View Order in Admin →
    </a>

    <p style="margin:20px 0 0;font-size:12px;color:${MUTED};">
      This is an automated notification from CXX Electronics store.
    </p>`

  return wrap(`New Order — #${order.order_number} (R${order.total.toFixed(2)})`, body)
}
