// Deterministic wholesale price calculator.
// Picks a discount between 15% and 25% off retail, seeded by product id so
// the value is stable across renders/visits.

export const WHOLESALE_MIN_QTY = 6

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0)
}

export function getWholesalePrice(product: { id: string; retail_price: number; bulk_price?: number | null }): number {
  if (product.bulk_price && product.bulk_price < product.retail_price) {
    return product.bulk_price
  }
  // 0.75 — 0.85 of retail (15-25% off)
  const seed = hash(product.id) / 0xffffffff
  const factor = 0.75 + seed * 0.10
  const raw = product.retail_price * factor
  // Round to nearest rand for a clean look
  return Math.max(1, Math.round(raw))
}

export function getWholesaleSavingsPct(retail: number, wholesale: number): number {
  if (retail <= 0 || wholesale >= retail) return 0
  return Math.round((1 - wholesale / retail) * 100)
}

export function getWholesaleMinQty(_product: { bulk_min_qty?: number | null }): number {
  // Uniform wholesale tier across the catalogue: 6+ units for every product.
  return WHOLESALE_MIN_QTY
}
