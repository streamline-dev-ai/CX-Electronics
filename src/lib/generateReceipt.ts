import type { OrderWithDetails } from './supabase'

const LOGO_URL = 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1778137000/CW-Logo-black_mbfsn7.png'

// Opens the printable invoice page in a new tab — the browser's Print → Save as PDF
// gives the customer a clean A4 receipt without any extra PDF library.
export function generateReceipt(order: OrderWithDetails): void {
  window.open(`/admin/orders/${order.id}/invoice`, '_blank')
}

// Returns self-contained receipt HTML for inclusion in n8n webhook payloads.
// n8n can attach this as a PDF via its HTML-to-PDF node or send inline.
export function getReceiptHTMLString(order: OrderWithDetails): string {
  const isCollection = order.fulfillment_type === 'collection'

  const addr = order.shipping_address
  const customerName = order.customers?.name ?? addr?.name ?? 'Customer'
  const customerEmail = order.customers?.email ?? ''
  const customerPhone = order.customers?.phone ?? addr?.phone ?? ''
  const deliveryLines = addr
    ? [addr.address_line1, addr.address_line2, addr.city, addr.province, addr.postal_code].filter(Boolean)
    : []

  const d = new Date(order.created_at)
  const date =
    d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ', ' +
    d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })

  const itemRows = order.order_items
    .map(
      (item) => `
    <tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:10px 0;font-size:13px;color:#111827;">${item.product_name}</td>
      <td style="padding:10px 0;font-size:13px;color:#6b7280;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 0;font-size:13px;color:#6b7280;text-align:right;">R ${item.unit_price.toFixed(2)}</td>
      <td style="padding:10px 0;font-size:13px;color:#111827;font-weight:600;text-align:right;">R ${item.line_total.toFixed(2)}</td>
    </tr>`,
    )
    .join('')

  const deliveryAddrHtml = deliveryLines
    .map((line) => `<p style="margin:2px 0 0;font-size:13px;color:#374151;">${line}</p>`)
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Receipt ${order.order_number}</title>
<style>
  @page { size: A4 portrait; margin: 20mm; }
  body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #111827; background: #fff; }
</style>
</head>
<body style="padding:40px;max-width:720px;margin:0 auto;">

  <!-- Header -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:6px;">
    <tr>
      <td style="vertical-align:top;">
        <h1 style="margin:0;font-size:40px;font-weight:900;letter-spacing:-1.5px;color:#111827;">RECEIPT</h1>
        <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">Receipt #: ${order.order_number}</p>
        <p style="margin:3px 0 0;font-size:13px;color:#6b7280;">Date: ${date}</p>
      </td>
      <td style="vertical-align:top;text-align:right;">
        <img
          src="${LOGO_URL}"
          alt="CW Electronics"
          style="height:48px;object-fit:contain;display:block;margin-left:auto;"
        />
        <p style="margin:4px 0 0;font-size:11px;font-weight:700;color:#111827;text-align:right;letter-spacing:0.3px;">CW Electronics</p>
      </td>
    </tr>
  </table>

  <div style="border-top:1px solid #e5e7eb;margin:28px 0;"></div>

  <!-- Customer / Fulfillment -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
    <tr>
      <td style="width:50%;vertical-align:top;padding-right:32px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#111827;">Customer</p>
        <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${customerName}</p>
        ${customerEmail ? `<p style="margin:3px 0 0;font-size:13px;color:#374151;">${customerEmail}</p>` : ''}
        ${customerPhone ? `<p style="margin:2px 0 0;font-size:13px;color:#374151;">${customerPhone}</p>` : ''}
      </td>
      <td style="width:50%;vertical-align:top;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#111827;">Fulfillment</p>
        <p style="margin:0;font-size:13px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:0.5px;">${isCollection ? 'COLLECTION' : 'DELIVERY'}</p>
        <div style="margin-top:8px;">
          ${
            isCollection
              ? `<p style="margin:0;font-size:13px;color:#374151;">China Mart, Shop C15, 3 Press Avenue, Crown Mines, Johannesburg, 2092</p>
                 ${order.collection_name ? `<p style="margin:3px 0 0;font-size:13px;color:#374151;">Collector: ${order.collection_name}</p>` : ''}`
              : deliveryAddrHtml
          }
        </div>
      </td>
    </tr>
  </table>

  <div style="border-top:1px solid #e5e7eb;margin:0 0 16px;"></div>

  <!-- Items table -->
  <table width="100%" cellpadding="0" cellspacing="0">
    <thead>
      <tr style="border-bottom:2px solid #111827;">
        <th style="text-align:left;padding:10px 0;font-size:13px;font-weight:700;color:#111827;">Item</th>
        <th style="text-align:center;padding:10px 0;font-size:13px;font-weight:700;color:#111827;width:60px;">Qty</th>
        <th style="text-align:right;padding:10px 0;font-size:13px;font-weight:700;color:#111827;width:100px;">Unit</th>
        <th style="text-align:right;padding:10px 0;font-size:13px;font-weight:700;color:#111827;width:110px;">Total</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div style="border-top:1px solid #e5e7eb;margin:16px 0 20px;"></div>

  <!-- Totals -->
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td></td>
      <td style="width:260px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;">Subtotal</td>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;text-align:right;">R ${order.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;">Shipping</td>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;text-align:right;">${order.shipping_fee === 0 ? 'FREE' : `R ${order.shipping_fee.toFixed(2)}`}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding:0;"><div style="border-top:2px solid #111827;margin:8px 0 0;"></div></td>
          </tr>
          <tr>
            <td style="padding:12px 0 4px;font-size:17px;font-weight:900;color:#111827;">Total</td>
            <td style="padding:12px 0 4px;font-size:17px;font-weight:900;color:#111827;text-align:right;">R ${order.total.toFixed(2)}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Payment method & reference -->
  <div style="border-top:1px solid #e5e7eb;margin-top:28px;padding-top:14px;"></div>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
    <tr>
      <td style="vertical-align:top;">
        <p style="margin:0;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;">Payment</p>
        <p style="margin:4px 0 0;font-size:13px;color:#111827;text-transform:capitalize;">
          ${order.payment_method ?? 'EFT'} · ${order.payment_status ?? 'paid'}
        </p>
        ${order.payment_reference ? `<p style="margin:2px 0 0;font-size:11px;color:#9ca3af;">Ref: ${order.payment_reference}</p>` : ''}
      </td>
      <td style="vertical-align:top;text-align:right;">
        <p style="margin:0;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;">Status</p>
        <p style="margin:4px 0 0;font-size:13px;color:#059669;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
          ${order.status === 'paid' ? '✓ Paid' : order.status.replace(/_/g, ' ')}
        </p>
      </td>
    </tr>
  </table>

  <!-- Support strip -->
  <div style="margin-top:24px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:16px 20px;">
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#0F172A;text-transform:uppercase;letter-spacing:0.8px;">Need help with this order?</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="vertical-align:top;width:33%;">
          <p style="margin:0;font-size:11px;color:#64748B;">WhatsApp</p>
          <p style="margin:2px 0 0;font-size:13px;color:#111827;font-weight:600;">+27 64 953 3333</p>
        </td>
        <td style="vertical-align:top;width:33%;">
          <p style="margin:0;font-size:11px;color:#64748B;">Phone</p>
          <p style="margin:2px 0 0;font-size:13px;color:#111827;font-weight:600;">+27 62 805 8899</p>
        </td>
        <td style="vertical-align:top;width:34%;">
          <p style="margin:0;font-size:11px;color:#64748B;">Email</p>
          <p style="margin:2px 0 0;font-size:13px;color:#111827;font-weight:600;">info@cw-electronics.co.za</p>
        </td>
      </tr>
    </table>
  </div>

  <!-- Footer -->
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="vertical-align:top;">
          <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.7;">
            <strong style="color:#374151;">CW Electronics</strong><br />
            China Mart, Shop C15, 3 Press Avenue<br />
            Crown Mines, Johannesburg, 2092<br />
            Mon–Sat · 09:00–15:00
          </p>
        </td>
        <td style="vertical-align:top;text-align:right;">
          <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.7;">
            Thank you for your purchase.<br />
            <span style="color:#cbd5e1;">This receipt is a proof of purchase.<br />Not a tax invoice.</span>
          </p>
        </td>
      </tr>
    </table>
  </div>

</body>
</html>`
}
