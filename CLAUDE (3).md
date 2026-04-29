# CXX Electronics — Claude Code Context File
# Project: CX-Website
# Developer: Christiaan Steffen — Streamline Automations
# Last updated: 29 April 2026

---

## Project Overview

Building a full e-commerce website + admin panel for **C&X Electronics** — a Chinese electronics
importer based at Dragon City, Fordsburg, Johannesburg. They sell phone/laptop chargers, cables,
CCTV cameras, routers, smartwatches, solar lamps, and accessories.

**Live domain:** cxxelectronics.com
**Project folder:** C:\Users\User\Desktop\CX Electronics\CX-Website
**Supabase project:** [create new — do not share with BLOM]
**Vercel project:** cxx-electronics (new deployment)

---

## Reference Projects (Read These For Code)

Before building anything, read these existing projects and reuse logic where applicable:

**BLOM Store:**
`C:\Users\User\OneDrive\Blom-Cosmetics\Blom-Working_repo\blom-cosmetics-main`

**BLOM Admin:**
`C:\Users\User\Desktop\Blom Cosmetics\Blom-Admin-Trae\blom-admin`

### What to reuse from BLOM:
- `lib/supabase.ts` — copy, swap env keys
- Cart context and useCart hook — identical logic
- Checkout flow structure — adapt for CXX PayFast merchant ID
- Admin product form structure — extend with bulk pricing fields
- Admin orders table — same layout, add bulk order flag
- n8n order notification pattern — replicate, update webhook URL
- Supabase Auth setup for admin login

### What to build fresh:
- Homepage layout — catalogue-style, not beauty/lifestyle
- Product detail page — retail + bulk pricing display logic
- Retail vs Bulk page split (separate routes)
- Design/theme — clean, minimal, techy/functional, light or neutral tones
- Category structure — electronics categories (Chargers, Cables, CCTV, Routers, etc.)

---

## Tech Stack

| Layer      | Tool                  | Notes                                        |
|------------|-----------------------|----------------------------------------------|
| Frontend   | React 18 + TypeScript | Functional components + hooks only           |
| Build      | Vite 5                | vite-plugin-compression (brotli + gzip)      |
| Routing    | React Router DOM      | /admin/* protected, /* public store          |
| Styling    | Tailwind CSS          | Utility classes only — no CSS modules        |
| Animation  | Framer Motion         | whileInView + viewport={{ once: true }}      |
| Backend/DB | Supabase              | Auth, Postgres, Storage                      |
| Payments   | PayFast (or Ozow)     | TBC based on client CIPC docs                |
| Automation | n8n                   | Order notification emails                    |
| Hosting    | Vercel                | Auto-deploy from main branch on GitHub       |

---

## Project Structure

```
CX-Website/
├── src/
│   ├── pages/
│   │   ├── store/
│   │   │   ├── Home.tsx
│   │   │   ├── Shop.tsx              ← retail store
│   │   │   ├── BulkShop.tsx          ← bulk/wholesale store (separate page)
│   │   │   ├── Product.tsx           ← retail product detail
│   │   │   ├── BulkProduct.tsx       ← bulk product detail (TBC exact behaviour)
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   └── OrderConfirmation.tsx
│   │   └── admin/
│   │       ├── Login.tsx
│   │       ├── Dashboard.tsx
│   │       ├── Products.tsx          ← list, search, filter, bulk actions
│   │       ├── ProductForm.tsx       ← add/edit product (retail + bulk fields)
│   │       ├── Orders.tsx
│   │       └── OrderDetail.tsx
│   ├── components/
│   │   ├── store/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── CategoryFilter.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   └── Navbar.tsx
│   │   └── admin/
│   │       ├── AdminNav.tsx
│   │       ├── ProductTable.tsx
│   │       └── OrderTable.tsx
│   ├── context/
│   │   └── CartContext.tsx
│   ├── lib/
│   │   └── supabase.ts
│   ├── hooks/
│   │   ├── useProducts.ts
│   │   ├── useOrders.ts
│   │   └── useCart.ts
│   └── App.tsx
├── public/
│   └── assets/
├── CLAUDE.md
├── .env.local
└── vite.config.ts
```

---

## Routing Rules

```tsx
// App.tsx routing pattern
// Public store routes — no auth required
/                   → Home
/shop               → Retail shop (all products)
/shop/:slug         → Retail product detail
/bulk               → Bulk/wholesale shop
/bulk/:slug         → Bulk product detail
/cart               → Cart
/checkout           → Checkout
/order/:id          → Order confirmation

// Admin routes — Supabase Auth required
/admin              → redirect to /admin/dashboard
/admin/login        → Login page (no auth required)
/admin/dashboard    → Overview stats
/admin/products     → Product list + management
/admin/products/new → Add product
/admin/products/:id → Edit product
/admin/orders       → Order list
/admin/orders/:id   → Order detail
```

---

## Supabase Schema

```sql
-- CATEGORIES
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_zh text,                        -- Chinese translation
  slug text unique not null,
  display_order int default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- PRODUCTS
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_zh text,                        -- Chinese translation
  slug text unique not null,
  description text,
  description_zh text,
  category_id uuid references categories(id),
  
  -- Retail pricing
  retail_price numeric(10,2) not null,
  
  -- Bulk pricing
  bulk_price numeric(10,2),            -- price per unit when buying bulk
  bulk_min_qty int,                    -- minimum qty to qualify for bulk price
  is_bulk_available boolean default false,
  
  -- Media
  images text[],                       -- array of Supabase Storage URLs
  thumbnail_url text,
  
  -- Status
  active boolean default true,
  featured boolean default false,
  stock_status text default 'in_stock', -- in_stock | out_of_stock | on_order
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CUSTOMERS
create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  province text,
  postal_code text,
  created_at timestamptz default now()
);

-- ORDERS
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,   -- e.g. CXX-2026-001
  customer_id uuid references customers(id),
  
  order_type text default 'retail',    -- retail | bulk
  status text default 'pending',       -- pending | paid | processing | shipped | delivered | cancelled
  
  subtotal numeric(10,2) not null,
  shipping_fee numeric(10,2) default 0,
  total numeric(10,2) not null,
  
  shipping_address jsonb,
  notes text,
  
  -- Payment
  payment_method text,                 -- payfast | ozow | eft
  payment_status text default 'unpaid', -- unpaid | paid | refunded
  payment_reference text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ORDER ITEMS
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null,          -- snapshot at time of order
  quantity int not null,
  unit_price numeric(10,2) not null,   -- snapshot at time of order
  line_total numeric(10,2) not null,
  created_at timestamptz default now()
);

-- ADMIN USERS (Supabase Auth handles this — just track metadata)
-- Use supabase.auth.signInWithPassword() for admin login
-- Only emails you add to Supabase Auth dashboard can log in

-- RLS POLICIES
-- Products: public read, admin write
-- Orders: admin only
-- Customers: admin only
```

---

## Key Features & Rules

### Admin Panel — Priority #1: Ease of Use
The client manages 200–500+ products. The admin MUST be:
- **Fast to load** — paginate product lists (50 per page max)
- **Easy to search** — search bar on products page, filter by category
- **Bulk actions** — select multiple products, delete or toggle active/inactive
- **Image upload** — drag and drop, multiple images per product, Supabase Storage
- **Simple form** — add/edit product should be one clean page, no confusion
- **Mobile usable** — they may manage from a phone in-store

### Retail vs Bulk
- **Separate pages** (`/shop` and `/bulk`) — confirmed by client
- Exact behaviour of bulk page still TBC — confirm in tomorrow's meeting
- For now: assume bulk page shows same products but with bulk_price and bulk_min_qty displayed
- Add to confirmation checklist: does bulk have its own cart/checkout or just a WhatsApp/enquiry CTA?

### Language / i18n
- Store: English primary, Chinese (Simplified Mandarin) toggle at bottom of site
- Admin panel: bilingual English + Chinese labels on all key UI elements
- Approach: store all Chinese strings in a simple `zh.ts` translations object, toggle via context
- Do NOT use a heavy i18n library — keep it simple, inline translations only

### Product Images
- Multiple images per product stored in Supabase Storage
- Always serve via Supabase transform (WebP, sized to display width)
- Thumbnail = first image in array
- Admin: drag-and-drop multi-image upload, reorderable

### Shipping (TBC — confirm tomorrow)
- Options to present client: flat rate / free over R2000 / courier API
- Likely starting with flat rate or free-above-threshold — keep it simple
- Click & collect from Dragon City store — ask if they want this option

---

## Supabase Rules (Non-Negotiable)

```typescript
// NEVER select('*') — always explicit columns
const { data } = await supabase
  .from('products')
  .select('id, name, retail_price, thumbnail_url, category_id, stock_status')
  .eq('active', true)

// NEVER fetch in a loop — always join
const { data } = await supabase
  .from('orders')
  .select(`
    id, order_number, total, status, created_at, order_type,
    order_items ( id, product_name, quantity, unit_price ),
    customers ( name, email, phone )
  `)
  .order('created_at', { ascending: false })
  .limit(50)

// ALWAYS transform images from Storage
const { data } = supabase.storage
  .from('products')
  .getPublicUrl(path, {
    transform: { width: 600, height: 600, resize: 'contain', format: 'webp', quality: 85 }
  })

// ALWAYS clean up Realtime subscriptions
useEffect(() => {
  const channel = supabase.channel('orders')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, handler)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [])
```

---

## Payment Integration

**Primary:** PayFast — requires SA CIPC registration + SA bank account (confirming tomorrow)
**Fallback:** Ozow (instant EFT, lighter requirements) or Yoco

PayFast sandbox for development:
- Merchant ID: use test credentials from PayFast dev portal
- Notify URL: n8n webhook → triggers order notification emails

---

## n8n Order Notification Flow

Replicate the BLOM order notification pattern:
1. PayFast ITN (Instant Transaction Notification) hits n8n webhook
2. n8n verifies payment status = COMPLETE
3. n8n updates order status in Supabase to 'paid'
4. n8n sends email to owner (order details)
5. n8n sends confirmation email to customer

---

## ENV Variables Required

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_PAYFAST_MERCHANT_ID=
VITE_PAYFAST_MERCHANT_KEY=
VITE_PAYFAST_PASSPHRASE=
VITE_N8N_WEBHOOK_URL=
```

---

## Vite Config Rules

```typescript
// vite.config.ts — always include compression
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    viteCompression({ algorithm: 'brotliCompress' }),
    viteCompression({ algorithm: 'gzip' })
  ]
})
```

---

## Developer Rules

- Functional components + TypeScript only — no class components
- Tailwind utility classes only — no CSS modules, no inline styles
- Named imports only — never `import * as x`
- Lazy-load admin routes — they're heavy and not needed on store pages
- Always paginate — never load all 500 products at once
- Run /compact every 15–20 messages
- Use /plan before any task that spans more than one file
- Add "ultrathink" for hard bugs

---

## What's Still TBC (Confirm Tomorrow)

- [ ] Bulk page exact behaviour — separate cart/checkout or enquiry/WhatsApp CTA?
- [ ] Shipping strategy — flat rate? Free over R2000? Click & collect?
- [ ] Do they have SA CIPC registration + SA bank account? (Determines PayFast vs Ozow)
- [ ] Product count — confirm 200–500 range
- [ ] Do they have existing product photos and data, or does it all need capturing?
- [ ] Who manages site day to day — the rep or someone else?
- [ ] Returns / shipping policy copy — do they have this or do we write it?
- [ ] Logo file — do they have a proper file or do we recreate?
