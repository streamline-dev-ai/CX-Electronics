import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://vsneqdjdkzbykkvvliju.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbmVxZGpka3pieWtrdnZsaWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NTMwMzIsImV4cCI6MjA5MzAyOTAzMn0.L_Me0ILetYXi0C-HxSsSWmivQTX8PbAt_ZO8g_WLhlg'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const CATEGORY_MAP = {
  accessories:  '654d3c50-6493-414e-92ab-7172664564f6',
  cables:       'a546a072-05f7-49ee-8c0e-4c88486ace91',
  cctv:         '8d7071bd-19ac-4d9b-b063-d45da728b19c',
  chargers:     '18f8eb90-4675-44f5-9ec3-c5fb813698d5',
  'power-banks':'3bd9fbe1-77c6-435a-887d-ec04b8da0dc0',
  routers:      'f8f9b2d3-bb86-41c8-a463-da52f3c4b8bb',
  smartwatches: 'ac942ec6-be4e-434b-94a4-12613891fa95',
  solar:        '7d7e8c76-f562-4a14-9e69-d85bca101a14',
  tools:        '195d358a-e1b7-47fd-bb9a-d3022b7fb2c3',
  kitchen:      '25eb82a4-56f1-47b6-80bc-c7b62b4d0d64',
  automobile:   '0eb54176-5a82-40d3-a09e-36ec6efea291',
}

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

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

async function main() {
  const csvPath = join(__dirname, '..', 'amazon-cleaned.csv')
  const text = readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(text)

  const [header, ...dataRows] = rows
  console.log(`Header: ${header.join(' | ')}`)
  console.log(`Total rows: ${dataRows.length}`)

  // Fetch existing slugs to avoid duplicates
  const { data: existing } = await supabase.from('products').select('slug')
  const existingSlugs = new Set((existing ?? []).map(p => p.slug))
  console.log(`Existing products in DB: ${existingSlugs.size}`)

  const products = []
  const skipped = []

  for (const row of dataRows) {
    if (row.length < 8) { skipped.push(`Short row: ${row[0]}`); continue }

    const [name, category, description, retail_price_raw, bulk_price_raw, bulk_min_qty_raw, is_bulk_available_raw, featured_raw, stock_status_raw] = row

    if (!name?.trim()) continue

    const categoryId = CATEGORY_MAP[category?.trim()?.toLowerCase()]
    if (!categoryId) {
      skipped.push(`Unknown category "${category}" for: ${name}`)
      continue
    }

    const retail_price = parseFloat(retail_price_raw)
    if (isNaN(retail_price)) { skipped.push(`Bad price for: ${name}`); continue }

    const bulk_price = bulk_price_raw?.trim() ? parseFloat(bulk_price_raw) : null
    const bulk_min_qty = bulk_min_qty_raw?.trim() ? parseInt(bulk_min_qty_raw) : null
    const is_bulk_available = is_bulk_available_raw?.trim()?.toLowerCase() === 'true'
    const featured = featured_raw?.trim()?.toLowerCase() === 'true'
    const stock_status = ['in_stock', 'out_of_stock', 'on_order'].includes(stock_status_raw?.trim())
      ? stock_status_raw.trim()
      : 'in_stock'

    // Generate unique slug
    let baseSlug = slugify(name)
    let slug = baseSlug
    let counter = 1
    while (existingSlugs.has(slug)) { slug = `${baseSlug}-${counter++}` }
    existingSlugs.add(slug)

    products.push({
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      retail_price,
      bulk_price: bulk_price ?? null,
      bulk_min_qty: bulk_min_qty ?? null,
      is_bulk_available,
      featured,
      stock_status,
      category_id: categoryId,
      active: true,
      images: [],
      thumbnail_url: null,
    })
  }

  console.log(`\nProducts to insert: ${products.length}`)
  if (skipped.length) {
    console.log(`Skipped ${skipped.length} rows:`)
    skipped.forEach(s => console.log('  -', s))
  }

  // Insert in batches of 50
  const BATCH = 50
  let inserted = 0
  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH)
    const { error } = await supabase.from('products').insert(batch)
    if (error) {
      console.error(`Batch ${Math.floor(i/BATCH)+1} error:`, error.message)
    } else {
      inserted += batch.length
      console.log(`Inserted batch ${Math.floor(i/BATCH)+1} (${inserted}/${products.length})`)
    }
  }

  console.log(`\nDone! ${inserted} products inserted.`)
}

main().catch(console.error)
