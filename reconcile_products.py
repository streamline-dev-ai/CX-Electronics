"""
Reconcile OCR'd PDF data against the Supabase DB.
- Cleans and deduplicates pdf_products.csv (one record per code, best stock price)
- Matches DB products by code prefix (e.g., 'C16-40-38')
- For matches: emits a price-correction plan (bulk = stock_price, retail = 2 * bulk)
- For unmatched OCR codes: emits an insert plan
- Identifies likely variant groups (BLACK/WHITE/RED/BLUE/PINK colour pairs)
Writes:
  - price_corrections.csv
  - missing_products.csv
  - variant_candidates.csv
"""
import os, csv, re, sys
from pathlib import Path
from collections import defaultdict
from dotenv import load_dotenv
from supabase import create_client

sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).parent
load_dotenv(ROOT / '.env.local')

sb = create_client(os.getenv('VITE_SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))

# ── Load DB products ─────────────────────────────────────────────────────
print('Loading DB products...')
db_products = []
page = 0
while True:
    r = sb.table('products').select('id,name,slug,retail_price,bulk_price,bulk_min_qty,variant_group_id,variant_label,thumbnail_url,category_id').range(page*1000, (page+1)*1000-1).execute()
    if not r.data: break
    db_products.extend(r.data)
    if len(r.data) < 1000: break
    page += 1
print(f'  {len(db_products)} products in DB')

CODE_RE = re.compile(r'(C\d+[-—]\d+[-—]\d+[A-Z]*)', re.IGNORECASE)

def extract_code(text):
    """Extract first product code from text."""
    if not text: return None
    m = CODE_RE.search(text.upper())
    return m.group(1).replace('—', '-') if m else None

# Index DB by code
db_by_code = {}
for p in db_products:
    code = extract_code(p['name']) or extract_code(p['slug'])
    if code:
        db_by_code[code] = p

print(f'  {len(db_by_code)} DB products have a code')

# ── Load OCR'd PDF data ──────────────────────────────────────────────────
print('\nLoading OCR data...')
ocr_records = []
with open(ROOT / 'pdf_products.csv', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        ocr_records.append(row)
print(f'  {len(ocr_records)} OCR rows')

# Clean: dedupe by code, prefer entries with both prices, valid prices, lowest stock_price
ocr_by_code = {}
for r in ocr_records:
    code = (r.get('code') or '').upper().replace('—', '-')
    if not code or not CODE_RE.match(code):
        continue
    try:
        stock = float(r['stock_price']) if r['stock_price'] else None
        box = float(r['box_price']) if r['box_price'] else None
        qty = int(r['qty']) if r['qty'] else None
    except: continue
    if stock is None or stock <= 0 or stock > 10000:
        continue
    # Heuristic: box <= stock, otherwise drop
    if box and box > stock * 1.5:
        box = None  # likely OCR misorder
    existing = ocr_by_code.get(code)
    score = (1 if box else 0) + (1 if qty else 0)
    if existing is None:
        ocr_by_code[code] = {'code':code,'name':r.get('name',''),'qty':qty,'stock':stock,'box':box,'pdf':r['pdf'],'page':r['page'],'score':score}
    else:
        # Prefer higher-quality record, then lowest stock (boxed-out outliers)
        if score > existing['score']:
            ocr_by_code[code] = {'code':code,'name':r.get('name',''),'qty':qty,'stock':stock,'box':box,'pdf':r['pdf'],'page':r['page'],'score':score}
print(f'  {len(ocr_by_code)} unique codes from OCR')

# ── Match & produce correction plan ──────────────────────────────────────
corrections = []
missing = []
for code, ocr in ocr_by_code.items():
    db = db_by_code.get(code)
    if not db:
        missing.append(ocr)
        continue
    new_bulk = ocr['stock']
    new_retail = round(new_bulk * 2, 2)
    new_qty = ocr['qty'] or db['bulk_min_qty']
    cur_bulk = float(db['bulk_price']) if db['bulk_price'] is not None else None
    cur_retail = float(db['retail_price']) if db['retail_price'] is not None else None
    cur_qty = db['bulk_min_qty']
    if (cur_bulk != new_bulk) or (cur_retail != new_retail) or (cur_qty != new_qty):
        corrections.append({
            'id': db['id'], 'name': db['name'], 'code': code, 'pdf': f"{ocr['pdf']} p{ocr['page']}",
            'cur_retail': cur_retail, 'new_retail': new_retail,
            'cur_bulk': cur_bulk, 'new_bulk': new_bulk,
            'cur_qty': cur_qty, 'new_qty': new_qty,
        })

print(f'\nPrice corrections: {len(corrections)}')
print(f'Missing products: {len(missing)}')

with open(ROOT / 'price_corrections.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=['id','name','code','pdf','cur_retail','new_retail','cur_bulk','new_bulk','cur_qty','new_qty'])
    w.writeheader(); w.writerows(corrections)

with open(ROOT / 'missing_products.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=['code','name','qty','stock','box','pdf','page','score'])
    w.writeheader(); w.writerows(missing)

# ── Variant candidates ───────────────────────────────────────────────────
COLOUR_RE = re.compile(r'\b(BLACK|WHITE|RED|BLUE|GREEN|YELLOW|PINK|PURPLE|ORANGE|GREY|GRAY|BROWN|GOLD|SILVER|TURQUOISE|BABY ?BLUE)\b', re.IGNORECASE)

def base_name(name):
    """Strip colour words and noise from a name to find variants."""
    if not name: return None
    stripped = COLOUR_RE.sub('', name).strip()
    # Strip code prefix
    stripped = CODE_RE.sub('', stripped).strip()
    # Strip parenthetical noise like (-) and dashes
    stripped = re.sub(r'[\(\)\-]+', ' ', stripped)
    stripped = re.sub(r'\s+', ' ', stripped).strip().upper()
    return stripped or None

# Group existing DB products by base name + check for colour mentions
groups = defaultdict(list)
for p in db_products:
    name = p['name']
    if not name: continue
    if not COLOUR_RE.search(name): continue  # only consider products with colour word
    base = base_name(name)
    if base and len(base) > 5:
        col_match = COLOUR_RE.search(name)
        colour = col_match.group(0).strip().title() if col_match else 'Unknown'
        groups[base].append({'id': p['id'], 'name': name, 'colour': colour, 'has_vg': bool(p['variant_group_id'])})

variant_candidates = []
for base, items in groups.items():
    if len(items) < 2: continue
    # Skip if all already have variant group
    if all(i['has_vg'] for i in items): continue
    variant_candidates.append({
        'base_name': base,
        'count': len(items),
        'colours': ', '.join(sorted(set(i['colour'] for i in items))),
        'product_ids': '|'.join(i['id'] for i in items),
        'product_names': ' / '.join(i['name'][:50] for i in items),
    })

print(f'Variant candidates: {len(variant_candidates)}')
with open(ROOT / 'variant_candidates.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=['base_name','count','colours','product_ids','product_names'])
    w.writeheader(); w.writerows(variant_candidates)

print('\nWrote:')
print('  price_corrections.csv')
print('  missing_products.csv')
print('  variant_candidates.csv')
