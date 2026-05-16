"""
Add missing products to CX Electronics Supabase DB:
1. C15-40-2 Spray Gun 4-Piece Set
2. 4x White cable tie variants (4 sizes)
3. Inspect product_variant_groups table and link variants
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

ENV_FILE = Path(__file__).parent / ".env.local"
load_dotenv(ENV_FILE)

SUPABASE_URL      = os.getenv("VITE_SUPABASE_URL", "")
SUPABASE_KEY      = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
TOOLS_CATEGORY_ID = "195d358a-e1b7-47fd-bb9a-d3022b7fb2c3"

sb = create_client(SUPABASE_URL, SUPABASE_KEY)

# -- 1. Load all products --------------------------------------------------
resp = sb.table("products").select("id, name, slug, thumbnail_url").execute()
products_by_slug = {p["slug"]: p for p in resp.data}
print(f"Total products in DB: {len(products_by_slug)}")

# -- 2. Find black cable ties in DB ----------------------------------------
black_ties = {s: p for s, p in products_by_slug.items()
              if "black" in s and "cable-tie" in s}
print(f"\nBlack cable ties found ({len(black_ties)}):")
for slug, p in sorted(black_ties.items()):
    print(f"  [{p['id']}] {p['name']}")

# -- 3. Inspect product_variant_groups table --------------------------------
try:
    vg_resp = sb.table("product_variant_groups").select("*").limit(5).execute()
    has_vg = True
    print("\nproduct_variant_groups EXISTS.")
    if vg_resp.data:
        print(f"  Columns: {list(vg_resp.data[0].keys())}")
        for row in vg_resp.data:
            print(f"  {row}")
    else:
        print("  (empty table)")
        # Attempt to discover columns via a dummy insert
        try:
            test = sb.table("product_variant_groups").insert({"__test__": 1}).execute()
        except Exception as ce:
            print(f"  Schema hint from error: {ce}")
except Exception as e:
    has_vg = False
    print(f"\nproduct_variant_groups: {e}")

# -- 4. Insert C15-40-2 Spray Gun 4-Piece Set ------------------------------
spray_gun_slug = "c15-40-2-spray-gun-4-piece-set"
if spray_gun_slug in products_by_slug:
    print(f"\nSpray gun already in DB -- skipping.")
    spray_gun_id = products_by_slug[spray_gun_slug]["id"]
else:
    spray_gun = {
        "name":             "C15-40-2 Spray Gun 4-Piece Set",
        "slug":             spray_gun_slug,
        "category_id":      TOOLS_CATEGORY_ID,
        "retail_price":     80.0,
        "bulk_price":       29.0,
        "bulk_min_qty":     50,
        "is_bulk_available": True,
        "active":           True,
        "stock_status":     "in_stock",
        "images":           [],
        "thumbnail_url":    None,
        "featured":         False,
    }
    res = sb.table("products").insert(spray_gun).execute()
    if res.data:
        spray_gun_id = res.data[0]["id"]
        print(f"\nInserted spray gun: {spray_gun['name']} (id: {spray_gun_id})")
        products_by_slug[spray_gun_slug] = res.data[0]
    else:
        print(f"\nFAILED to insert spray gun")
        spray_gun_id = None

# -- 5. Insert white cable tie variants ------------------------------------
white_ties_def = [
    {"size": "4x200mm", "slug": "4x200mm-white-cable-ties-pack", "retail": 17.0, "bulk": 6.0,  "bulk_qty": 300, "black_pattern": "4x200mm-black"},
    {"size": "4x300mm", "slug": "4x300mm-white-cable-ties-pack", "retail": 25.0, "bulk": 8.5,  "bulk_qty": 200, "black_pattern": "4x300mm-black"},
    {"size": "4x400mm", "slug": "4x400mm-white-cable-ties-pack", "retail": 35.0, "bulk": 12.0, "bulk_qty": 150, "black_pattern": "4x400mm-black"},
    {"size": "4x500mm", "slug": "4x500mm-white-cable-ties-pack", "retail": 45.0, "bulk": 16.0, "bulk_qty": 120, "black_pattern": "4x500mm-black"},
]

print("\n-- White cable ties --------------------------------------------------")
white_ids = {}
for td in white_ties_def:
    slug = td["slug"]
    if slug in products_by_slug:
        print(f"Already exists: {slug}")
        white_ids[td["size"]] = products_by_slug[slug]["id"]
        continue

    product = {
        "name":              f"{td['size']} White Cable Ties Pack",
        "slug":              slug,
        "category_id":       TOOLS_CATEGORY_ID,
        "retail_price":      td["retail"],
        "bulk_price":        td["bulk"],
        "bulk_min_qty":      td["bulk_qty"],
        "is_bulk_available": True,
        "active":            True,
        "stock_status":      "in_stock",
        "images":            [],
        "thumbnail_url":     None,
        "featured":          False,
    }
    res = sb.table("products").insert(product).execute()
    if res.data:
        pid = res.data[0]["id"]
        print(f"Inserted: {product['name']} (id: {pid})")
        white_ids[td["size"]] = pid
        products_by_slug[slug] = res.data[0]
    else:
        print(f"FAILED: {product['name']}")

# -- 6. Variant groups ------------------------------------------------------
print("\n-- Variant groups ----------------------------------------------------")
if not has_vg:
    print("product_variant_groups table not accessible -- skipping.")
else:
    for td in white_ties_def:
        black_match = next(
            (p for s, p in black_ties.items() if td["black_pattern"] in s), None
        )
        white_id = white_ids.get(td["size"])

        if not black_match:
            print(f"  MISS: no black tie for {td['size']}")
            continue
        if not white_id:
            print(f"  MISS: no white tie for {td['size']}")
            continue

        black_id = black_match["id"]
        print(f"  {td['size']}: black={black_id}, white={white_id}")

print("\nDone.")
