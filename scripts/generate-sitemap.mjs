// Generate a sitemap.xml file from live Supabase product/category data.
// Run with: node scripts/generate-sitemap.mjs
// Reads VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY from .env (via dotenv or env vars).

import { createClient } from '@supabase/supabase-js'
import { writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SITE_URL = 'https://cw-electronics.co.za'
const OUT_PATH = resolve(__dirname, '..', 'public', 'sitemap.xml')

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const STATIC_ROUTES = [
  { loc: '/',         changefreq: 'weekly',  priority: '1.0' },
  { loc: '/shop',     changefreq: 'daily',   priority: '0.9' },
  { loc: '/wholesale',changefreq: 'weekly',  priority: '0.9' },
  { loc: '/deals',    changefreq: 'weekly',  priority: '0.8' },
  { loc: '/about',    changefreq: 'monthly', priority: '0.7' },
  { loc: '/contact',  changefreq: 'monthly', priority: '0.7' },
  { loc: '/terms',    changefreq: 'monthly', priority: '0.4' },
  { loc: '/returns',  changefreq: 'monthly', priority: '0.4' },
]

function urlEntry({ loc, lastmod, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${SITE_URL}${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : '',
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
    priority ? `    <priority>${priority}</priority>` : '',
    '  </url>',
  ].filter(Boolean).join('\n')
}

async function build() {
  const today = new Date().toISOString()

  const { data: products = [], error: prodErr } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('active', true)
    .order('updated_at', { ascending: false })
  if (prodErr) {
    console.error('Failed to fetch products:', prodErr.message)
    process.exit(1)
  }

  const { data: categories = [] } = await supabase
    .from('categories')
    .select('slug')

  const entries = [
    ...STATIC_ROUTES.map((r) => ({ ...r, lastmod: today })),
    ...categories.map((c) => ({
      loc: `/shop?category=${c.slug}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.7',
    })),
    ...products.map((p) => ({
      loc: `/shop/${p.slug}`,
      lastmod: p.updated_at ?? today,
      changefreq: 'weekly',
      priority: '0.8',
    })),
  ]

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(urlEntry),
    '</urlset>',
    '',
  ].join('\n')

  await writeFile(OUT_PATH, xml, 'utf8')
  console.log(`Wrote ${entries.length} URLs to ${OUT_PATH}`)
}

build().catch((e) => {
  console.error(e)
  process.exit(1)
})
