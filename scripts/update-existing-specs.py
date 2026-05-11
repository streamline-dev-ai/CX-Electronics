"""
Fetch all products in the CX Electronics DB that have no specifications,
generate specs using the same logic as process_products.py, and update them.
"""

import sys
import os
import json
import urllib.request
import urllib.parse

# Import spec generation from the main script
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from process_products import generate_specifications, extract_specs

SUPABASE_URL = 'https://vsneqdjdkzbykkvvliju.supabase.co'
# Service role key — only used in this local script, never in the frontend
SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbmVxZGpka3pieWtrdnZsaWp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ1MzAzMiwiZXhwIjoyMDkzMDI5MDMyfQ.HpMsZKNG8qGm-H4eUo4uM490nIya9XAQ4vNkqeJx8RA'

HEADERS = {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
}

def supabase_get(path: str) -> list:
    url = f'{SUPABASE_URL}/rest/v1/{path}'
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def supabase_patch(path: str, data: dict):
    url = f'{SUPABASE_URL}/rest/v1/{path}'
    body = json.dumps(data).encode()
    req = urllib.request.Request(url, data=body, headers=HEADERS, method='PATCH')
    with urllib.request.urlopen(req) as resp:
        return resp.status

def main():
    # 1. Fetch categories so we can map id → name
    print('Fetching categories...')
    cats = supabase_get('categories?select=id,name')
    cat_map = {c['id']: c['name'] for c in cats}
    print(f'  {len(cat_map)} categories loaded')

    # 2. Fetch ALL products (re-generate specs for everyone)
    print('Fetching all products...')
    products = supabase_get(
        'products?select=id,name,description,category_id&active=eq.true&limit=1000'
    )
    print(f'  {len(products)} products to update')

    if not products:
        print('Nothing to update.')
        return

    # 3. Generate and update specs
    updated = 0
    errors = 0

    for i, p in enumerate(products, 1):
        name        = p.get('name') or ''
        description = p.get('description') or ''
        category    = cat_map.get(p.get('category_id', ''), '')
        specs_dict  = extract_specs(name, description)

        specs_json = generate_specifications(name, category, description, specs_dict)

        try:
            specs_parsed = json.loads(specs_json)
        except Exception as e:
            print(f'  [{i}] JSON parse error for "{name}": {e}')
            errors += 1
            continue

        product_id = p['id']
        try:
            supabase_patch(
                f'products?id=eq.{product_id}',
                {'specifications': specs_parsed}
            )
            updated += 1
            if i % 50 == 0 or i == len(products):
                print(f'  {i}/{len(products)} updated...')
        except Exception as e:
            print(f'  [{i}] Update error for "{name}": {e}')
            errors += 1

    print(f'\nDone! {updated} products updated, {errors} errors.')

if __name__ == '__main__':
    main()
