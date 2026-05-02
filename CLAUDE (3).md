# CXX Electronics â€” Claude Code Context File
# Project: CX-Website
# Developer: Christiaan Steffen â€” Streamline Automations
# Last updated: 29 April 2026

---

## Project Overview

Building a full e-commerce website + admin panel for **C&X Electronics** â€” a Chinese electronics
importer based at Dragon City, Fordsburg, Johannesburg. They sell phone/laptop chargers, cables,
CCTV cameras, routers, smartwatches, solar lamps, and accessories.

**Live domain:** cxxelectronics.com
**Project folder:** C:\Users\User\Desktop\CW Electronics\CX-Website
**Supabase project:** [create new â€” do not share with BLOM]
**Vercel project:** cxx-electronics (new deployment)

---

## Reference Projects (Read These For Code)

Before building anything, read these existing projects and reuse logic where applicable:

**BLOM Store:**
`C:\Users\User\OneDrive\Blom-Cosmetics\Blom-Working_repo\blom-cosmetics-main`

**BLOM Admin:**
`C:\Users\User\Desktop\Blom Cosmetics\Blom-Admin-Trae\blom-admin`

### What to reuse from BLOM:
- `lib/supabase.ts` â€” copy, swap env keys
- Cart context and useCart hook â€” identical logic
- Checkout flow structure â€” adapt for CXX PayFast merchant ID
- Admin product form structure â€” extend with bulk pricing fields
- Admin orders table â€” same layout, add bulk order flag
- n8n order notification pattern â€” replicate, update webhook URL
- Supabase Auth setup for admin login

### What to build fresh:
- Homepage layout â€” catalogue-style, not beauty/lifestyle
- Product detail page â€” retail + bulk pricing display logic
- Retail vs Bulk page split (separate routes)
- Design/theme â€” clean, minimal, techy/functional, light or neutral tones
- Category structure â€” electronics categories (Chargers, Cables, CCTV, Routers, etc.)

---

## Tech Stack

| Layer      | Tool                  | Notes                                        |
|------------|-----------------------|----------------------------------------------|
| Frontend   | React 18 + TypeScript | Functional components + hooks only           |
| Build      | Vite 5                | vite-plugin-compression (brotli + gzip)      |
| Routing    | React Router DOM      | /admin/* protected, /* public store          |
| Styling    | Tailwind CSS          | Utility classes only â€” no CSS modules        |
| Animation  | Framer Motion         | whileInView + viewport={{ once: true }}      |
| Backend/DB | Supabase              | Auth, Postgres, Storage                      |
| Payments   | PayFast (or Ozow)     | TBC based on client CIPC docs                |
| Automation | n8n                   | Order notification emails                    |
| Hosting    | Vercel                | Auto-deploy from main branch on GitHub       |

---

## Project Structure

```
CX-Website/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ pages/
â”‚   â”‚   â”œâ”€â”€ store/
â”‚   â”‚   â”‚   â”œâ”€â”€ Home.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Shop.tsx              â† retail store
â”‚   â”‚   â”‚   â”œâ”€â”€ BulkShop.tsx          â† bulk/wholesale store (separate page)
â”‚   â”‚   â”‚   â”œâ”€â”€ Product.tsx           â† retail product detail
â”‚   â”‚   â”‚   â”œâ”€â”€ BulkProduct.tsx       â† bulk product detail (TBC exact behaviour)
â”‚   â”‚   â”‚   â”œâ”€â”€ Cart.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Checkout.tsx
â”‚   â”‚   â”‚   â””â”€â”€ OrderConfirmation.tsx
â”‚   â”‚   â””â”€â”€ admin/
â”‚   â”‚       â”œâ”€â”€ Login.tsx
â”‚   â”‚       â”œâ”€â”€ Dashboard.tsx
â”‚   â”‚       â”œâ”€â”€ Products.tsx          â† list, search, filter, bulk actions
â”‚   â”‚       â”œâ”€â”€ ProductForm.tsx       â† add/edit product (retail + bulk fields)
â”‚   â”‚       â”œâ”€â”€ Orders.tsx
â”‚   â”‚       â””â”€â”€ OrderDetail.tsx
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ store/
â”‚   â”‚   â”‚   â”œâ”€â”€ ProductCard.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ CategoryFilter.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ CartDrawer.tsx
â”‚   â”‚   â”‚   â””â”€â”€ Navbar.tsx
â”‚   â”‚   â””â”€â”€ admin/
â”‚   â”‚       â”œâ”€â”€ AdminNav.tsx
â”‚   â”‚       â”œâ”€â”€ ProductTable.tsx
â”‚   â”‚       â””â”€â”€ OrderTable.tsx
â”‚   â”œâ”€â”€ context/
â”‚   â”‚   â””â”€â”€ CartContext.tsx
â”‚   â”œâ”€â”€ lib/
â”‚   â”‚   â””â”€â”€ supabase.ts
â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”œâ”€â”€ useProducts.ts
â”‚   â”‚   â”œâ”€â”€ useOrders.ts
â”‚   â”‚   â””â”€â”€ useCart.ts
â”‚   â””â”€â”€ App.tsx
â”œâ”€â”€ public/
â”‚   â””â”€â”€ assets/
â”œâ”€â”€ CLAUDE.md
â”œâ”€â”€ .env.local
â””â”€â”€ vite.config.ts
```

---

## Routing Rules

```tsx
// App.tsx routing pattern
// Public store routes â€” no auth required
/                   â†’ Home
/shop               â†’ Retail shop (all products)
/shop/:slug         â†’ Retail product detail
/bulk               â†’ Bulk/wholesale shop
/bulk/:slug         â†’ Bulk product detail
/cart               â†’ Cart
/checkout           â†’ Checkout
/order/:id          â†’ Order confirmation

// Admin routes â€” Supabase Auth required
/admin              â†’ redirect to /admin/dashboard
/admin/login        â†’ Login page (no auth required)
/admin/dashboard    â†’ Overview stats
/admin/products     â†’ Product list + management
/admin/products/new â†’ Add product
/admin/products/:id â†’ Edit product
/admin/orders       â†’ Order list
/admin/orders/:id   â†’ Order detail
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

-- ADMIN USERS (Supabase Auth handles this â€” just track metadata)
-- Use supabase.auth.signInWithPassword() for admin login
-- Only emails you add to Supabase Auth dashboard can log in

-- RLS POLICIES
-- Products: public read, admin write
-- Orders: admin only
-- Customers: admin only
```

---

## Key Features & Rules

### Admin Panel â€” Priority #1: Ease of Use
The client manages 200â€“500+ products. The admin MUST be:
- **Fast to load** â€” paginate product lists (50 per page max)
- **Easy to search** â€” search bar on products page, filter by category
- **Bulk actions** â€” select multiple products, delete or toggle active/inactive
- **Image upload** â€” drag and drop, multiple images per product, Supabase Storage
- **Simple form** â€” add/edit product should be one clean page, no confusion
- **Mobile usable** â€” they may manage from a phone in-store

### Retail vs Bulk
- **Separate pages** (`/shop` and `/bulk`) â€” confirmed by client
- Exact behaviour of bulk page still TBC â€” confirm in tomorrow's meeting
- For now: assume bulk page shows same products but with bulk_price and bulk_min_qty displayed
- Add to confirmation checklist: does bulk have its own cart/checkout or just a WhatsApp/enquiry CTA?

### Language / i18n
- Store: English primary, Chinese (Simplified Mandarin) toggle at bottom of site
- Admin panel: bilingual English + Chinese labels on all key UI elements
- Approach: store all Chinese strings in a simple `zh.ts` translations object, toggle via context
- Do NOT use a heavy i18n library â€” keep it simple, inline translations only

### Product Images
- Multiple images per product stored in Supabase Storage
- Always serve via Supabase transform (WebP, sized to display width)
- Thumbnail = first image in array
- Admin: drag-and-drop multi-image upload, reorderable

### Shipping (TBC â€” confirm tomorrow)
- Options to present client: flat rate / free over R2000 / courier API
- Likely starting with flat rate or free-above-threshold â€” keep it simple
- Click & collect from Dragon City store â€” ask if they want this option

---

## Supabase Rules (Non-Negotiable)

```typescript
// NEVER select('*') â€” always explicit columns
const { data } = await supabase
  .from('products')
  .select('id, name, retail_price, thumbnail_url, category_id, stock_status')
  .eq('active', true)

// NEVER fetch in a loop â€” always join
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

**Primary:** PayFast â€” requires SA CIPC registration + SA bank account (confirming tomorrow)
**Fallback:** Ozow (instant EFT, lighter requirements) or Yoco

PayFast sandbox for development:
- Merchant ID: use test credentials from PayFast dev portal
- Notify URL: n8n webhook â†’ triggers order notification emails

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
// vite.config.ts â€” always include compression
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

- Functional components + TypeScript only â€” no class components
- Tailwind utility classes only â€” no CSS modules, no inline styles
- Named imports only â€” never `import * as x`
- Lazy-load admin routes â€” they're heavy and not needed on store pages
- Always paginate â€” never load all 500 products at once
- Run /compact every 15â€“20 messages
- Use /plan before any task that spans more than one file
- Add "ultrathink" for hard bugs

---

## What's Still TBC (Confirm Tomorrow)

- [ ] Bulk page exact behaviour â€” separate cart/checkout or enquiry/WhatsApp CTA?
- [ ] Shipping strategy â€” flat rate? Free over R2000? Click & collect?
- [ ] Do they have SA CIPC registration + SA bank account? (Determines PayFast vs Ozow)
- [ ] Product count â€” confirm 200â€“500 range
- [ ] Do they have existing product photos and data, or does it all need capturing?
- [ ] Who manages site day to day â€” the rep or someone else?
- [ ] Returns / shipping policy copy â€” do they have this or do we write it?
- [ ] Logo file â€” do they have a proper file or do we recreate?

