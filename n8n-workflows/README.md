# CXX Electronics — n8n Workflow Setup

Two workflows to import. Both send beautiful HTML emails via Zoho SMTP.

---

## Step 1 — Create your SMTP credential in n8n

1. In n8n, go to **Credentials → Add Credential → SMTP**
2. Fill in:
   - **Host:** `smtp.zoho.com` (or `smtp.zoho.eu` if your Zoho account is EU-based)
   - **Port:** `587`
   - **Secure:** TLS
   - **Username:** your Zoho email (e.g. `info@cw-electronics.co.za`)
   - **Password:** your Zoho Mail password (or an App Password if 2FA is on)
3. Save — note the **credential ID** from the URL (e.g. `8` in `/credentials/8/edit`)

---

## Step 2 — Import the workflows

### Workflow 1: New Order (`new-order.json`)
Triggers when a customer places an order. Sends:
- **Customer** → order confirmation email
- **Store owner** → new order alert email

### Workflow 2: Status Change (`status-change.json`)
Triggers when admin updates order status (paid, packed, out for delivery, etc). Sends:
- **Customer** → status-specific update email

**To import:**
1. In n8n, click **+ New Workflow → Import from file**
2. Select the JSON file
3. Open each **Send Email** node and update the **SMTP credential** to the one you created in Step 1
4. **Activate** the workflow

---

## Step 3 — Get your webhook URLs

After activating, click the **Webhook** node in each workflow to see its URL:
- Copy `new-order` webhook URL → paste into `.env.local` as `VITE_N8N_NEW_ORDER`
- Copy `status-change` webhook URL → paste into `.env.local` as `VITE_N8N_STATUS_CHANGE`

Rebuild and redeploy the site after updating `.env.local`.

---

## Step 4 — PayFast ITN (when you go live)

When PayFast is configured, set the **Notify URL** in your PayFast settings to:
```
https://vsneqdjdkzbykkvvliju.supabase.co/functions/v1/payfast-itn
```

Also set these secrets in **Supabase → Edge Functions → Secrets**:
- `PAYFAST_PASSPHRASE` — your PayFast passphrase (leave blank if not set)
- `N8N_STATUS_CHANGE` — your status-change webhook URL from Step 3

---

## Email previews

| Trigger | Subject | Recipient |
|---|---|---|
| Order placed | `Order Confirmed — #CXX-2026-xxxx` | Customer |
| Order placed | `🛒 New Order #CXX-2026-xxxx — Rxx.xx` | Store owner |
| Payment confirmed | `Payment Confirmed ✓ — Order #...` | Customer |
| Order packed | `Order Packed 📦 — Order #...` | Customer |
| Out for delivery | `Out for Delivery 🚚 — Order #...` | Customer |
| Delivered | `Order Delivered ✓ — Order #...` | Customer |
| Ready for collection | `Ready for Collection 🏪 — Order #...` | Customer |
| Collected | `Order Collected ✓ — Order #...` | Customer |
| Cancelled | `Order Cancelled — Order #...` | Customer |
