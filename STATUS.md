# CXX Electronics â€” Build Status & Developer Guide
> Last updated: 29 April 2026 | Developer: Christiaan @ Streamline Automations

---

## âœ… DONE â€” Do Not Rebuild

### Infrastructure
- [x] Vite 5 + React 18 + TypeScript project scaffolded
- [x] Tailwind CSS configured with CXX brand colours
- [x] Brotli + gzip compression on every build
- [x] GitHub repo connected (streamline-autmations/CX-Electronics)
- [x] Netlify deployment configured (`netlify.toml` + `_redirects`)
- [x] Supabase project created (vsneqdjdkzbykkvvliju, eu-west-1)
- [x] All environment variables set in Netlify + local `.env.local`

### Database (Supabase)
- [x] `categories` table + 8 categories seeded (EN + ZH)
- [x] `products` table (retail + bulk pricing, images, status)
- [x] `customers` table
- [x] `orders` table (retail + bulk types, PayFast fields)
- [x] `order_items` table (price snapshot at time of order)
- [x] RLS policies (public read products/categories, admin-only orders)
- [x] `updated_at` auto-trigger on products + orders
- [x] All indexes (slug, category, status, created_at)
- [x] Storage bucket `products` (public, 5MB max, images only)

### Core Logic (src/lib/ + src/hooks/ + src/context/)
- [x] Supabase client + all TypeScript types
- [x] Cart singleton â€” add/remove/update, localStorage persist, R99 shipping / free over R2k
- [x] PayFast signature generation + redirect (sandbox wired, ready for live keys)
- [x] EN/ZH translations for all UI text
- [x] CartContext â€” cart state + open/close drawer
- [x] LangContext â€” language toggle
- [x] `useProducts` â€” paginated, filterable, searchable product list
- [x] `useProduct` â€” single product by slug
- [x] `useOrders` â€” paginated order list (admin)
- [x] `useCategories` â€” category list
- [x] `useAuth` â€” Supabase auth state for admin

### Admin Panel (/admin/*)
- [x] Login page (Supabase Auth email/password)
- [x] Protected routes (redirect to login if not authenticated)
- [x] Sidebar nav desktop + bottom tab nav mobile
- [x] Dashboard â€” live stats (orders today, revenue 7d, pending, out-of-stock)
- [x] Products list â€” search, category filter, pagination (50/page), inline stock toggle, active toggle, bulk delete
- [x] Product form â€” add + edit, retail price, bulk pricing toggle, image upload to Supabase Storage, bilingual fields, slug auto-gen
- [x] Orders list â€” filter by status, paginated
- [x] Order detail â€” line items, customer info, shipping address, payment status, status update buttons

### Public Store (/shop, /bulk, /cart, /checkout)
- [x] Navbar â€” logo, nav links, cart icon with count, EN/ZH toggle, mobile hamburger
- [x] Cart drawer â€” slide-in, item list, qty controls, totals, checkout CTA
- [x] Footer â€” links, contact placeholder, language toggle
- [x] Home page â€” hero, trust badges, category grid (8 icons), featured products, wholesale CTA
- [x] Shop page â€” category sidebar (desktop) + chip filter (mobile), product grid, pagination
- [x] ProductCard â€” image, name, price, add-to-cart, badges (featured/bulk/out-of-stock)
- [x] Product detail â€” image gallery, retail price, bulk pricing box (save % calculated), qty selector, add to cart
- [x] Bulk shop â€” wholesale hero, WhatsApp CTA, category filter, product grid
- [x] Bulk product detail â€” wholesale pricing display, WhatsApp enquiry CTA (pre-filled message)
- [x] Cart page â€” item list, qty controls, order summary, checkout link
- [x] Checkout â€” shipping form (SA provinces), order creation in Supabase, PayFast redirect
- [x] Order confirmation â€” order summary, payment status, shipping address

---

## âŒ NOT DONE â€” Still To Build

### After Client Meeting (TBC items)
- [ ] **WhatsApp number** â€” replace `27000000000` placeholder in `BulkShop.tsx` + `BulkProductDetail.tsx`
- [ ] **Footer contact details** â€” phone + email in `Footer.tsx`
- [ ] **Bulk page final behaviour** â€” currently WhatsApp CTA; upgrade to cart if client wants that
- [ ] **Shipping strategy confirmed** â€” currently R99 flat / free over R2k (in `src/lib/cart.ts`)
- [ ] **PayFast live credentials** â€” waiting on CIPC confirmation; swap sandbox â†’ live in `.env.local`

### Payments & Automation
- [ ] PayFast live merchant ID + key + passphrase (add to Netlify env vars)
- [ ] n8n webhook workflow (verify ITN â†’ update order to `paid` â†’ send emails)
- [ ] `VITE_N8N_WEBHOOK_URL` env var (set after n8n flow is built)

### Content & Branding
- [ ] Real logo file â†’ replace `/public/https://res.cloudinary.com/dzhwylkfr/image/upload/v1777722832/CW-Logo_ujfdip.png` (doesn't exist yet, browser shows default)
- [ ] Hero banner image (currently gradient placeholder)
- [ ] Product photography â€” upload via admin once client provides
- [ ] Footer phone number + email
- [ ] Returns/shipping policy page
- [ ] About/contact page (optional)

### Admin Setup
- [ ] Add admin user in Supabase Auth dashboard (Authentication â†’ Users â†’ Add user)
- [ ] Add all products via admin panel (/admin/products/new)

### Nice-to-Have (post-launch)
- [ ] Per-page SEO meta tags (og:title, description)
- [ ] Sitemap + robots.txt
- [ ] Google Analytics
- [ ] Search overlay (search icon in navbar is present, overlay not built yet)

---

## ðŸ“ FILE GUIDE â€” What to Touch vs What to Leave

### ðŸ”´ NEVER TOUCH â€” Core Logic (leave exactly as is)
These files handle database, payments, cart state and routing. Breaking them breaks everything.

| File | Why hands off |
|------|---------------|
| `src/lib/supabase.ts` | DB client + all TypeScript types â€” change this = type errors everywhere |
| `src/lib/cart.ts` | Cart singleton logic â€” touch this = cart breaks |
| `src/lib/payfast.ts` | Payment signature generation â€” touch this = payments fail |
| `src/hooks/useProducts.ts` | Supabase query logic |
| `src/hooks/useProduct.ts` | Single product query |
| `src/hooks/useOrders.ts` | Orders query + update |
| `src/hooks/useCategories.ts` | Categories query |
| `src/hooks/useAuth.ts` | Auth state management |
| `src/context/CartContext.tsx` | Cart state provider |
| `src/context/LangContext.tsx` | Language state provider |
| `src/components/admin/ProtectedRoute.tsx` | Auth guard for admin |
| `src/App.tsx` | All routing â€” only touch to add NEW routes |
| `vite.config.ts` | Build config â€” compression, aliases |
| `tsconfig*.json` | TypeScript config |
| `tailwind.config.js` | Brand colours â€” only touch to update colours |
| `.env.local` | API keys â€” never commit to GitHub |

### ðŸŸ¡ TOUCH WITH CARE â€” Admin Panel
These are built and functional. Only edit to add fields or change UI. Don't change query logic.

| File | What you can safely change |
|------|---------------------------|
| `src/pages/admin/Dashboard.tsx` | Add more stat cards, change layout |
| `src/pages/admin/Products.tsx` | Add columns to table, change sort order |
| `src/pages/admin/ProductForm.tsx` | Add new product fields (match DB schema) |
| `src/pages/admin/Orders.tsx` | Add columns, change filter options |
| `src/pages/admin/OrderDetail.tsx` | Add info sections |
| `src/pages/admin/Login.tsx` | Change logo/branding only |
| `src/components/admin/AdminLayout.tsx` | Add nav links, change sidebar styling |

### ðŸŸ¢ SAFE TO EDIT FREELY â€” Store Pages & Content
These are UI/content files. Change copy, layout, colours, sections freely.

| File | What to edit |
|------|-------------|
| `src/pages/store/Home.tsx` | Hero copy, sections, category icons, layout |
| `src/pages/store/Shop.tsx` | Grid layout, sort options, filter UI |
| `src/pages/store/ProductDetail.tsx` | Layout, add sections (specs, reviews, etc.) |
| `src/pages/store/BulkShop.tsx` | **Replace `27000000000` with real WhatsApp number** |
| `src/pages/store/BulkProductDetail.tsx` | **Replace `27000000000` with real WhatsApp number** |
| `src/pages/store/CartPage.tsx` | Layout only |
| `src/pages/store/Checkout.tsx` | Form fields, layout |
| `src/pages/store/OrderConfirmation.tsx` | Copy, layout |
| `src/components/store/Navbar.tsx` | Logo, nav links, styling |
| `src/components/store/Footer.tsx` | **Add real phone + email**, links, copy |
| `src/components/store/ProductCard.tsx` | Card layout, badge styling |
| `src/lib/translations.ts` | Any text changes in EN or ZH |

---

## ðŸ›’ HOW TO ADD PRODUCTS (Step by Step)

1. Go to `http://localhost:5173/admin/login` (or your Netlify URL + `/admin/login`)
2. Log in with the email you added in Supabase Auth dashboard
3. Click **Add Product**
4. Fill in:
   - **Product Name (EN)** â€” slug auto-generates
   - **Product Name (ZH)** â€” Chinese name (optional but recommended)
   - **Category** â€” select from dropdown
   - **Description** â€” EN + ZH
   - **Retail Price** â€” required
   - **Bulk toggle** â€” enable + set bulk price + min qty if applicable
   - **Images** â€” drag and drop (uploads to Supabase Storage, auto WebP)
   - **Status** â€” In Stock / Out of Stock / On Order
   - **Active** â€” tick to make visible in store
   - **Featured** â€” tick to show on homepage
5. Click **Save Product**

Product is live in the store immediately.

---

## âš¡ DOS AND DON'TS

### DO
- Add products through the admin panel â€” never directly in Supabase table editor
- Set `active = false` to hide a product without deleting it
- Use the `featured` toggle for homepage products (aim for 4-6 featured)
- Upload multiple images per product â€” first image is the cover photo
- Keep slugs lowercase with hyphens (auto-generated from name)
- Test checkout using PayFast sandbox before going live
- Run `npm run typecheck` before pushing any code changes

### DON'T
- Don't put the service role key in `.env.local` â€” anon key only in frontend
- Don't commit `.env.local` to GitHub â€” it's gitignored for a reason
- Don't delete tables or columns in Supabase without updating the TypeScript types
- Don't add `select('*')` queries â€” always list explicit columns
- Don't load all products at once â€” the 50/page pagination exists for a reason
- Don't change the `order_number` format (CXX-YYYY-XXXX) â€” PayFast ITN matches on it
- Don't edit `src/lib/cart.ts` shipping logic without testing the cart end-to-end

---

## ðŸ”‘ QUICK REFERENCE

| Thing | Location |
|-------|----------|
| Supabase dashboard | https://supabase.com/dashboard/project/vsneqdjdkzbykkvvliju |
| GitHub repo | https://github.com/streamline-autmations/CX-Electronics |
| Local dev | http://localhost:5173 (`npm run dev`) |
| Admin login | /admin/login |
| Add admin user | Supabase â†’ Authentication â†’ Users â†’ Add user |
| Brand colours | `tailwind.config.js` â†’ `cxx.*` keys |
| All UI text | `src/lib/translations.ts` |
| Shipping logic | `src/lib/cart.ts` â†’ `SHIPPING_THRESHOLD` + `SHIPPING_FLAT_RATE` |
| PayFast sandbox | Merchant ID: 10000100, Key: 46f0cd694581a |

