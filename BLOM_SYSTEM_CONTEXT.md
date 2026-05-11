# Blom Cosmetics — Full System Context for New Store

This document explains every order, email, invoice, customer, analytics, and admin workflow
in the existing Blom Cosmetics system so the new store can replicate or connect to it correctly.

---

## 1. Tech Stack

| Layer | What |
|---|---|
| Database | Supabase (Postgres) |
| Backend functions | Netlify Functions (TypeScript) |
| Admin frontend | React + Vite + Tailwind (this repo) |
| Store frontend | Separate repo (React + Supabase direct) |
| Payments | PayFast (`m_payment_id` = PayFast payment reference) |
| Emails | Netlify function `order-status` → calls n8n webhook → sends email |
| Invoices | Netlify function `invoice-pdf` → generates PDF, stores URL on order |

---

## 2. Database Tables (orders & related)

### `orders`
The central table. Key columns:

| Column | Notes |
|---|---|
| `id` | UUID, primary key |
| `m_payment_id` | PayFast payment reference — the main human-readable order ID used everywhere |
| `order_number` | Alternative order number (may be null) |
| `status` | `pending` → `paid` → `packed` → `shipped` OR `ready_for_collection` |
| `payment_status` | `paid` / `pending` / `complete` |
| `total` | Rand value (e.g. 480.00) — **use this** |
| `total_cents` | Cents — often 0, **do not rely on this** |
| `created_at` | When row was created |
| `placed_at` | When order was placed (may differ from created_at) |
| `paid_at` | Set when payment confirmed |
| `updated_at` | Updated on every status change |
| `customer_name` / `buyer_name` | Customer full name (check both, one may be null) |
| `customer_email` / `buyer_email` | Customer email (check both) |
| `customer_phone` / `buyer_phone` | Customer phone (check both) |
| `delivery_method` | `delivery` or `collection` or `store-pickup` |
| `collection_location` | Text — which store branch for collection orders |
| `delivery_address` | JSONB — street, city, postal code for delivery orders |
| `fulfillment_status` | `fulfilled` / null |
| `fulfilled_at` | Timestamp when packed/shipped |
| `invoice_url` | Public URL to the generated PDF invoice |
| `short_code` | Short human-readable order code |
| `archived` | Boolean — soft-delete from orders list |

### `order_items`
One row per product line in an order.

| Column | Notes |
|---|---|
| `order_id` | FK to `orders.id` |
| `product_name` | **Use this** — `name` is always null |
| `quantity` | **Use this** — `qty` is always null |
| `unit_price` | Rand value — **use this** |
| `line_total` | Rand value — **use this** |
| `unit_price_cents` | Always 0 — **never use** |
| `line_total_cents` | Always 0 — **never use** |
| `variant_title` | e.g. "50ml / Rose" |
| `sku` | Product SKU |

> **CRITICAL DB QUIRK**: `unit_price_cents`, `line_total_cents`, `qty`, and `name` on `order_items` are always null/0 for all existing rows. Always use `unit_price`, `line_total`, `quantity`, and `product_name`.

### `payments`
Audit log of payment events.

| Column | Notes |
|---|---|
| `order_id` | FK to `orders.id` |
| `provider` | `payfast` / `manual` |
| `amount_cents` | Cents |
| `status` | `succeeded` |

### `contacts`
Contact form submissions from the store.

| Column | Notes |
|---|---|
| `name`, `email`, `phone` | Customer details |
| `message` | Free-text message |
| `image_url` | Optional attached image |
| `status` | `new` → `responded` → `archived` |

### `coupons`
Discount codes.

| Column | Notes |
|---|---|
| `code` | e.g. `BLOM10` |
| `type` | `percent` or `fixed` |
| `value` | Percentage or Rand amount |
| `min_order_total` | Minimum cart total to apply |
| `max_uses` | Cap on total redemptions (null = unlimited) |
| `uses` | How many times used so far |
| `is_active` | Boolean |
| `starts_at`, `ends_at` | Optional active window |

### Other tables
- `products` — product catalogue
- `bundles` / `bundle_items` — product bundles
- `specials` — time-limited specials/promotions
- `reviews` — product reviews (status: `pending` / `approved` / `rejected`)
- `stock_movements` — inventory audit log
- `operating_costs` — expense tracking for Finance page

---

## 3. Order Lifecycle (complete flow)

```
Customer places order
        ↓
Order row created in Supabase (status: "pending")
        ↓
PayFast redirect → customer pays
        ↓
PayFast ITN webhook fires → Netlify function confirms payment
  - Sets order status = "paid"
  - Sets payment_status = "paid"
  - Sets paid_at = now
  - Inserts row in payments table
        ↓
CheckoutSuccess page polls Supabase every 1.5s (up to 45s) for paid status
  - Once paid: calls /.netlify/functions/order-status (status=paid)
    → triggers n8n webhook → sends confirmation email to customer
  - Also calls /.netlify/functions/invoice-pdf
    → generates PDF receipt, stores invoice_url on the order
  - Clears the cart
        ↓
Admin sees order on /orders page
        ↓
Admin opens order → clicks "Mark as Packed"
  - Calls /.netlify/functions/admin-update-order-status
  - Sets status = "packed" on the order (NO email sent for packed)
        ↓
If DELIVERY order: admin clicks "Out for Delivery"
  - Calls /.netlify/functions/order-status (status=shipped)
  - n8n webhook fires → sends "your order is on its way" email
If COLLECTION order: admin clicks "Ready for Collection"
  - Calls /.netlify/functions/order-status (status=ready_for_collection)
  - n8n webhook fires → sends "ready to collect" email
```

---

## 4. Email System

Emails are NOT sent directly from code. The flow is:

1. Admin (or CheckoutSuccess page) calls `POST /.netlify/functions/order-status`
2. That function:
   - Updates `orders.status` in Supabase
   - Fires a webhook to n8n (URL from env var)
   - n8n handles the actual email sending
3. The function receives `{ m_payment_id, status, buyer_name, buyer_email, buyer_phone, site_url }`

### When emails are triggered

| Trigger | Status sent | Email sent to customer |
|---|---|---|
| Payment confirmed (CheckoutSuccess) | `paid` | Order confirmation + invoice link |
| Admin marks shipped | `shipped` | "Your order is out for delivery" |
| Admin marks ready | `ready_for_collection` | "Your order is ready to collect" |

### What the function expects
```json
{
  "m_payment_id": "PAY-123456",
  "status": "paid",
  "buyer_name": "Jane Smith",
  "buyer_email": "jane@example.com",
  "buyer_phone": "0821234567",
  "site_url": "https://blomcosmetics.co.za"
}
```

> For "Mark as Packed" — no email is sent. It only calls `admin-update-order-status` (simpler function, just updates DB).

---

## 5. Invoice / Receipt

### How it's generated
- Netlify function: `/.netlify/functions/invoice-pdf`
- Called with `{ order_id, m_payment_id }` via POST
- Generates a PDF, stores the URL in `orders.invoice_url`
- Can also return `{ return_url: true }` to get the URL back

### When it's generated
1. Automatically on payment confirmation (CheckoutSuccess fires it)
2. Admin can regenerate from the Orders list (hidden "Invoice Tools" — enable via `?tools=1` URL param)

### Customer downloads receipt
- CheckoutSuccess page shows a "Download Receipt" button
- Calls `invoice-pdf` with `{ order_id, download: true }`
- Returns a PDF blob that the browser downloads as `Invoice-{order_number}.pdf`

### Backfilling missing orders
- Hidden admin tool on Orders page (enabled via `?tools=1`)
- Calls `/.netlify/functions/admin-backfill-order`
- Creates an order row from a PayFast payment ID + amount + buyer info
- Used when a payment came through but the order row wasn't created

---

## 6. Admin Orders Page (`/orders`)

### What it shows
- Table of all orders, newest first, limit 200 (simple version in admin)
- Columns: ID, Payment/Order #, Fulfillment type (collection 📦 / delivery 🚚), Total, Status badge, Created, Paid

### Status badge colours
- `paid` → green
- anything else → yellow

### Fulfillment detection
```js
if (collection_location || delivery_method === 'collection' || delivery_method === 'store-pickup') {
  → "📦 collection"
} else {
  → "🚚 delivery"
}
```

### Filters (full Orders.jsx page)
The richer Orders.jsx (at `blom-admin/src/pages/Orders.jsx`) also supports:
- Date range (`dateFrom`, `dateTo`)
- Fulfillment type filter
- Status filter
- Search (customer name, email, order code)
- Pagination (20 per page)
- Archive order (soft-delete, sets `archived: true`)

---

## 7. Admin Order Detail Page (`/orders/:id`)

### What it shows
- Order header: ID, Payment #, Fulfillment type, Status, Total, Created, Paid
- Customer: name, email, phone
- Delivery address (JSON) or Collection location
- Line items table: product name, SKU/variant, qty, unit price, line total
- Order total footer

### Action buttons (conditional)

| Condition | Button shown |
|---|---|
| `status === 'paid'` OR `status === 'pending'` | **Mark as Packed** |
| `status === 'packed'` AND collection order | **Ready for Collection** |
| `status === 'packed'` AND delivery order | **Out for Delivery** |

### What each button does
- **Mark as Packed** → calls `admin-update-order-status` (just DB update, no email)
- **Ready for Collection** → calls `order-status` function with `status=ready_for_collection` (DB + email)
- **Out for Delivery** → calls `order-status` function with `status=shipped` (DB + email)

---

## 8. Customer-Facing Order Experience

There are no customer login accounts in the current system. Customers are identified by email only.

### CheckoutSuccess page
After paying, the customer lands on `/checkout-success?order={order_id}`:
1. Polls Supabase every 1.5s for up to 45s waiting for `status === 'paid'`
2. Shows spinner → "Order Confirmed!" once paid
3. Shows "Payment Pending" with retry button if not confirmed after 45s
4. Offers "Download Receipt" button (calls invoice-pdf)

### "Continue if payment failed" / retry flow
- If polling times out (45 attempts), shows pending state with a **"Check Again"** button
- Button increments `retryCount`, which re-triggers the `useCallback` polling loop
- No account needed — order is found by `order_id` from the URL param

### Customer updates / notifications
Customers receive emails via n8n for:
- Order confirmed (paid)
- Ready for collection
- Out for delivery
No SMS is sent currently (phone is captured but only used for WhatsApp links in admin).

---

## 9. Analytics Page (`/analytics` or linked from dashboard)

Fetches from `/.netlify/functions/admin-analytics-advanced?period=30`

### Metrics shown
- Total Revenue (30 days)
- Total Orders (30 days)
- Average Order Value
- Inventory Value + active product count

### Charts
- Revenue bar chart (daily, 30-day trend) — uses `revenueCents` field
- Top Selling Products list (rank, name, units sold, revenue, order count)

> The analytics function derives revenue from `orders` table `total` / `total_cents` columns.
> The `topProducts` comes from joining `order_items`.

---

## 10. Finance Page (`/finance`)

### Fetches
- `/.netlify/functions/admin-finance-stats?period=today|week|month`
- Returns: `{ revenue, cogs, expenses, profit, recentExpenses }`

### Period selector
- Today / Last 7 Days / Last 30 Days

### Stat cards
- Total Revenue
- COGS (estimated)
- Operating Expenses
- Net Profit (green if positive, red if negative)

### Add Expense
- Admin can record operating costs (description, amount, category, date)
- Categories: marketing, software, logistics, office, other
- Stored in `operating_costs` table via `api.createOperatingCost()`

---

## 11. Messages / Contacts Page (`/messages`)

### Source
Contact form on the store website posts to Supabase `contacts` table.

### Admin workflow
1. `/messages` — table view of all messages, filter by status
2. Click row → `/messages/:id` — full message detail

### Contact Detail actions
- Change status via dropdown: `new` → `responded` → `archived`
- **WhatsApp button** — opens `https://wa.me/{phone}` in new tab
- **Email button** — opens `mailto:{email}` in mail client
- Attached image shown if `image_url` is set

---

## 12. Coupons Page (`/coupons`)

- Lists all coupons from `/.netlify/functions/admin-coupons`
- Create / edit via modal (calls `/.netlify/functions/admin-coupon` POST)
- View usage history per coupon (calls `/.netlify/functions/admin-coupon-usage?couponId=X`)
- Usage shows: when used, which order, buyer email, order total, order status

### Coupon fields
- `code` (uppercase), `type` (percent/fixed), `value`, `min_order_total`
- `max_uses` (null = unlimited), `uses` (counter), `is_active`
- `starts_at`, `ends_at` (optional date window)

---

## 13. Webhooks

The admin uses a webhook hook called `useWebhookSender`:
- URL comes from env var `VITE_SPECIALS_WEBHOOK`
- Debounces 800ms before sending
- Sends `{ ...data, type, timestamp }` via POST
- Used for pushing specials/promotions data to external systems

The order-status emails use a separate webhook (n8n) configured server-side in the `order-status` Netlify function env vars.

---

## 14. Authentication

- Auth is handled by Supabase Auth
- Admin app uses `AuthContext` — checks if user is registered in the system
- If not registered → shows `UserNotRegisteredError` component
- If not authenticated → redirects to login
- The Netlify functions that need elevated access use `SUPABASE_SERVICE_ROLE_KEY` (server-side only, never exposed to browser)

---

## 15. Netlify Functions Reference

| Function | Method | Purpose |
|---|---|---|
| `admin-update-order-status` | POST | Update order status in DB only (no email). Used for "Mark as Packed". |
| `order-status` | POST | Update order status + fire n8n email webhook. Used for paid/shipped/ready. |
| `invoice-pdf` | POST | Generate PDF invoice, store URL on order, optionally return blob. |
| `admin-orders` | GET | Fetch all orders for the admin list. |
| `admin-order` | PATCH | Update a single order (archive, etc). |
| `admin-finance-stats` | GET | Revenue, COGS, expenses, profit for a period. |
| `admin-analytics-advanced` | GET | Full analytics: trends, top products, inventory. |
| `admin-coupons` | GET | List all coupons. |
| `admin-coupon` | POST | Create or update a coupon. |
| `admin-coupon-usage` | GET | Usage history for a coupon. |
| `admin-backfill-order` | POST | Manually create an order row from a PayFast payment. |
| `save-product` | POST | Upsert a product (uses service role). |
| `save-bundle` | POST | Upsert a bundle (uses service role). |
| `reviews-intake` | POST | Submit a product review from store. |
| `reviews-approve` | POST | Approve a pending review. |
| `reviews-reject` | POST | Reject a pending review. |

---

## 16. Key Env Vars the New Store Needs to Know About

| Var | Used for |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase writes (Netlify functions only) |
| `VITE_SUPABASE_URL` | Client-side Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Client-side Supabase anon key |
| `VITE_SPECIALS_WEBHOOK` | Webhook URL for pushing specials to external systems |
| *(server-only)* n8n webhook URL | Inside `order-status` function — fires emails |

---

## 17. Price / Currency Rules

- All prices displayed in South African Rand (ZAR), formatted as `R 480.00`
- `orders.total` is in Rand (numeric, e.g. `480.00`) — **always use this**
- `orders.total_cents` is unreliable — may be 0
- `order_items.unit_price` and `.line_total` are in Rand — **always use these**
- `order_items.unit_price_cents` and `.line_total_cents` are always 0 — **never use**
- Currency helper: `moneyZAR(value)` formats a number as `R X,XXX.XX`

---

## 18. What the New Store Needs to Implement / Replicate

| Feature | Where it lives now | Notes for new store |
|---|---|---|
| Create order on checkout | Store frontend → Supabase direct | Write to `orders` + `order_items`, set `status='pending'` |
| PayFast ITN confirmation | Netlify function (not in this repo) | Must set `status='paid'`, `paid_at`, insert into `payments` |
| Confirmation email | `order-status` function via n8n | Call after payment confirmed, pass `m_payment_id` + customer info |
| Invoice PDF | `invoice-pdf` function | Call after payment confirmed with `order_id` |
| Checkout success page | `CheckoutSuccess.tsx` | Poll Supabase, show status, download receipt button |
| Customer retry for failed payment | Retry button on CheckoutSuccess | Re-polls, no account needed |
| Order tracking (customer) | No dedicated page currently | Customers rely on email notifications |
| Admin order management | This admin app | Mark packed → shipped/ready → email fires |
| Coupons applied at checkout | Store frontend | Validate against `coupons` table, increment `uses` on order |
| Contact form | Store frontend → Supabase `contacts` | Submits directly to `contacts` table |
| Reviews | `reviews-intake` Netlify function | Store calls this; admin approves/rejects |
