"""
OCR all 25 supplier PDFs and extract product records.
Saves to pdf_products.csv with columns: pdf, page, code, name, qty, stock_price, box_price
"""
import sys, re, csv, time
from pathlib import Path
import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR

sys.stdout.reconfigure(encoding='utf-8')

PDF_DIR = Path(r'C:\Users\User\Desktop\CX-Catalog\Product-Pdfs')
OUT_CSV = Path(__file__).parent / 'pdf_products.csv'

ocr = RapidOCR()
CODE_RE  = re.compile(r'^([Cc]\d+[-—]\d+[-—]\d+[A-Z]*)')
QTY_RE   = re.compile(r'QTY[:：]?\s*(\d+)', re.IGNORECASE)
PRICE_RE = re.compile(r'R\s*([\d.,]+)')

def parse_page_texts(texts):
    """
    Parse a sequence of OCR text lines into product records.
    The layout (left-to-right, top-to-bottom) produces this approximate pattern per product:
      <NAME with code somewhere>
      装箱数量qty / QTY:NNN
      <CODE> (left column)
      批发价/STOCK PRICE / R XX.XX
      整件价/BOX PRICE / R XX.XX
    Strategy: collect a sliding window, look for code anchors, then look forward/back for price+qty.
    """
    records = []
    i = 0
    n = len(texts)
    # Find code anchors first (lines that look like just a product code)
    anchors = []
    for idx, t in enumerate(texts):
        m = CODE_RE.match(t.strip().replace(' ', ''))
        if m:
            anchors.append((idx, m.group(1).replace('—', '-')))

    # For each anchor, look at surrounding text (±15 lines) for name, qty, stock, box
    for idx, code in anchors:
        window = texts[max(0,idx-8):min(n,idx+12)]
        name = None
        qty = None
        stock = None
        box = None
        # Name: find a line containing the code OR an item-like line (long, alphanum, mixed case)
        for t in window:
            if name is None:
                # Try to find a name line: contains letters and possibly the code
                stripped = t.strip()
                # Skip header lines
                if any(h in stripped for h in ['CODE ITEM','CODEITEM','货号品名','STOCK PRICE','BOX PRICE','批发价','整件价','装箱数量','QTY']):
                    continue
                if CODE_RE.match(stripped.replace(' ','')):
                    continue
                if stripped.startswith('R '):
                    continue
                # Must have letters and a reasonable length
                if len(stripped) > 5 and re.search(r'[A-Za-z]{3}', stripped):
                    name = stripped
                    break
        # qty
        for t in window:
            m = QTY_RE.search(t)
            if m:
                qty = int(m.group(1)); break
        # Prices: find all R-prices in window, in order
        prices = []
        for t in window:
            for pm in PRICE_RE.finditer(t):
                try:
                    prices.append(float(pm.group(1).replace(',', '.')))
                except: pass
        if len(prices) >= 1: stock = prices[0]
        if len(prices) >= 2: box = prices[1]
        records.append({
            'code': code, 'name': name or '', 'qty': qty or '',
            'stock_price': stock or '', 'box_price': box or '',
        })
    return records


def process_pdf(pdf_path):
    """Render each page and OCR. Yields product records."""
    doc = fitz.open(pdf_path)
    for pno in range(doc.page_count):
        page = doc[pno]
        mat = fitz.Matrix(2, 2)
        pix = page.get_pixmap(matrix=mat)
        img = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
        arr = np.array(img)
        try:
            result, _ = ocr(arr)
        except Exception as e:
            print(f'    Page {pno}: OCR error: {e}')
            continue
        if not result:
            continue
        texts = [r[1] for r in result]
        records = parse_page_texts(texts)
        for r in records:
            r['pdf'] = pdf_path.name
            r['page'] = pno + 1
            yield r


def main():
    all_records = []
    pdf_files = sorted(PDF_DIR.glob('*.pdf'), key=lambda p: int(p.stem))
    print(f'Processing {len(pdf_files)} PDFs')
    t0 = time.time()
    for pf in pdf_files:
        t_pdf = time.time()
        pdf_records = list(process_pdf(pf))
        all_records.extend(pdf_records)
        elapsed = time.time() - t_pdf
        print(f'  {pf.name}: {len(pdf_records)} products  ({elapsed:.1f}s)')
        # Write progressively in case of interruption
        with open(OUT_CSV, 'w', newline='', encoding='utf-8') as f:
            w = csv.DictWriter(f, fieldnames=['pdf','page','code','name','qty','stock_price','box_price'])
            w.writeheader()
            w.writerows(all_records)
    total = time.time() - t0
    print(f'\nDone. {len(all_records)} records, {total:.1f}s total. Saved to {OUT_CSV}')

if __name__ == '__main__':
    main()
