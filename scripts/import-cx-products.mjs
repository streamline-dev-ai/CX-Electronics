import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://vsneqdjdkzbykkvvliju.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbmVxZGpka3pieWtrdnZsaWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NTMwMzIsImV4cCI6MjA5MzAyOTAzMn0.L_Me0ILetYXi0C-HxSsSWmivQTX8PbAt_ZO8g_WLhlg'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Robust CSV parser — handles quoted fields with embedded commas and newlines
function parseCSV(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (ch === '"' && next === '"') { field += '"'; i++ }
      else if (ch === '"') { inQuotes = false }
      else { field += ch }
    } else {
      if (ch === '"') { inQuotes = true }
      else if (ch === ',') { row.push(field); field = '' }
      else if (ch === '\r' && next === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++ }
      else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = '' }
      else { field += ch }
    }
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows
}

async function main() {
  // 1. Load CSV
  const csvPath = join(__dirname, '..', '..', 'products-improved.csv')
  let text
  try {
    text = readFileSync(csvPath, 'utf-8')
  } catch (e) {
    console.error(`Cannot read CSV at ${csvPath}\n${e.message}`)
    process.exit(1)
  }

  const rows = parseCSV(text)
  const [headerRow, ...dataRows] = rows
  const header = headerRow.map(h => h.trim())
  console.log(`Loaded ${dataRows.length} products from CSV`)
  console.log(`Columns: ${header.join(', ')}`)

  // 2. Fetch categories from DB
  const { data: cats, error: catErr } = await supabase.from('categories').select('id, name, slug')
  if (catErr) { console.error('Failed to fetch categories:', catErr.message); process.exit(1) }

  // Build name → id and slug → id maps (case-insensitive)
  const categoryByName = {}
  const categoryBySlug = {}
  for (const c of cats) {
    categoryByName[c.name.toLowerCase()] = c.id
    categoryBySlug[c.slug.toLowerCase()] = c.id
  }
  console.log(`\nCategories in DB: ${cats.map(c => c.name).join(', ')}`)

  // 3. Fetch existing slugs to avoid duplicates
  const { data: existing } = await supabase.from('products').select('slug')
  const existingSlugs = new Set((existing ?? []).map(p => p.slug))
  console.log(`Existing products in DB: ${existingSlugs.size}`)

  // 4. Build product objects
  const products = []
  const skipped = []

  for (const rawRow of dataRows) {
    if (rawRow.every(f => !f.trim())) continue  // skip blank rows

    // Map row to named fields via header
    const r = {}
    header.forEach((col, i) => { r[col] = (rawRow[i] ?? '').trim() })

    if (!r.name) continue

    // Resolve category — try name first, then slug
    const catKey = r.category?.toLowerCase()
    const categoryId = categoryByName[catKey] ?? categoryBySlug[catKey]
    if (!categoryId) {
      skipped.push(`Unknown category "${r.category}" for: ${r.name}`)
      continue
    }

    const retail_price = parseFloat(r.retail_price)
    if (isNaN(retail_price)) { skipped.push(`Bad retail price for: ${r.name}`); continue }

    const bulk_price = r.bulk_price ? parseFloat(r.bulk_price) : null
    const bulk_min_qty = r.bulk_min_qty ? parseInt(r.bulk_min_qty) : null
    const is_bulk_available = r.is_bulk_available?.toLowerCase() === 'true'
    const featured = r.featured?.toLowerCase() === 'true'
    const active = r.active?.toLowerCase() !== 'false'  // default true
    const stock_status = ['in_stock', 'out_of_stock', 'on_order'].includes(r.stock_status)
      ? r.stock_status : 'in_stock'

    // Parse specifications JSON
    let specifications = null
    if (r.specifications) {
      try { specifications = JSON.parse(r.specifications) }
      catch { skipped.push(`Bad specifications JSON for: ${r.name}`) }
    }

    // Use slug from CSV; deduplicate if already taken
    let slug = r.slug || r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    const baseSlug = slug
    let counter = 1
    while (existingSlugs.has(slug)) { slug = `${baseSlug}-${counter++}` }
    existingSlugs.add(slug)

    products.push({
      name: r.name,
      slug,
      description: r.full_description || null,
      description_zh: r.short_description || null,
      category_id: categoryId,
      retail_price,
      bulk_price: isNaN(bulk_price) ? null : bulk_price,
      bulk_min_qty: isNaN(bulk_min_qty) ? null : bulk_min_qty,
      is_bulk_available,
      featured,
      active,
      stock_status,
      images: [],
      thumbnail_url: null,
      specifications,
    })
  }

  console.log(`\nProducts ready to insert: ${products.length}`)
  if (skipped.length) {
    console.log(`Skipped ${skipped.length} rows:`)
    skipped.slice(0, 20).forEach(s => console.log('  -', s))
    if (skipped.length > 20) console.log(`  ... and ${skipped.length - 20} more`)
  }

  if (products.length === 0) {
    console.log('Nothing to insert.')
    return
  }

  // 5. Insert in batches of 50
  const BATCH = 50
  let inserted = 0
  let errors = 0

  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH)
    const { error } = await supabase.from('products').insert(batch)
    if (error) {
      console.error(`Batch ${Math.floor(i / BATCH) + 1} error:`, error.message)
      errors += batch.length
    } else {
      inserted += batch.length
      console.log(`  Inserted batch ${Math.floor(i / BATCH) + 1} — ${inserted}/${products.length} done`)
    }
  }

  console.log(`\n✓ Done! ${inserted} products inserted, ${errors} errors, ${skipped.length} skipped.`)
}

main().catch(console.error)
