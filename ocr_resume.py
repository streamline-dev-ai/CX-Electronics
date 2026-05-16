"""
Resume OCR for PDFs that haven't been processed yet.
Writes to pdf_products_part2.csv.
"""
import sys, re, csv, time, gc
from pathlib import Path
import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR

sys.stdout.reconfigure(encoding='utf-8')

PDF_DIR = Path(r'C:\Users\User\Desktop\CX-Catalog\Product-Pdfs')
PART1   = Path(__file__).parent / 'pdf_products_part1.csv'
OUT_CSV = Path(__file__).parent / 'pdf_products_part2.csv'

# Which PDFs are already done
done = set()
if PART1.exists():
    with open(PART1, encoding='utf-8') as f:
        r = csv.DictReader(f)
        for row in r:
            done.add(row['pdf'])
print(f'Already done: {sorted(done)}')

CODE_RE  = re.compile(r'^([Cc]\d+[-—]\d+[-—]\d+[A-Z]*)')
QTY_RE   = re.compile(r'QTY[:：]?\s*(\d+)', re.IGNORECASE)
PRICE_RE = re.compile(r'R\s*([\d.,]+)')

def parse_page_texts(texts):
    records = []
    n = len(texts)
    anchors = []
    for idx, t in enumerate(texts):
        m = CODE_RE.match(t.strip().replace(' ', ''))
        if m:
            anchors.append((idx, m.group(1).replace('—', '-')))
    for idx, code in anchors:
        window = texts[max(0,idx-8):min(n,idx+12)]
        name = None; qty = None; stock = None; box = None
        for t in window:
            if name is None:
                stripped = t.strip()
                if any(h in stripped for h in ['CODE ITEM','CODEITEM','货号品名','STOCK PRICE','BOX PRICE','批发价','整件价','装箱数量','QTY']): continue
                if CODE_RE.match(stripped.replace(' ','')): continue
                if stripped.startswith('R '): continue
                if len(stripped) > 5 and re.search(r'[A-Za-z]{3}', stripped):
                    name = stripped; break
        for t in window:
            m = QTY_RE.search(t)
            if m: qty = int(m.group(1)); break
        prices = []
        for t in window:
            for pm in PRICE_RE.finditer(t):
                try: prices.append(float(pm.group(1).replace(',', '.')))
                except: pass
        if len(prices) >= 1: stock = prices[0]
        if len(prices) >= 2: box = prices[1]
        records.append({'code':code,'name':name or '','qty':qty or '','stock_price':stock or '','box_price':box or ''})
    return records


def process_pdf(pdf_path, ocr):
    doc = fitz.open(pdf_path)
    for pno in range(doc.page_count):
        try:
            page = doc[pno]
            mat = fitz.Matrix(2, 2)
            pix = page.get_pixmap(matrix=mat)
            img = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
            arr = np.array(img)
            del pix, img
            try:
                result, _ = ocr(arr)
            except Exception as e:
                print(f'    Page {pno+1}: OCR error: {e}')
                continue
            del arr
            if not result: continue
            texts = [r[1] for r in result]
            for r in parse_page_texts(texts):
                r['pdf'] = pdf_path.name
                r['page'] = pno + 1
                yield r
        except Exception as e:
            print(f'    Page {pno+1}: page error: {e}')
            continue
        finally:
            gc.collect()
    doc.close()


def main():
    ocr = RapidOCR()
    all_records = []
    pdf_files = sorted(PDF_DIR.glob('*.pdf'), key=lambda p: int(p.stem))
    todo = [p for p in pdf_files if p.name not in done]
    print(f'To process: {len(todo)} PDFs')
    t0 = time.time()
    for pf in todo:
        t_pdf = time.time()
        try:
            pdf_records = list(process_pdf(pf, ocr))
        except Exception as e:
            print(f'  {pf.name}: FAILED entirely: {e}')
            continue
        all_records.extend(pdf_records)
        elapsed = time.time() - t_pdf
        print(f'  {pf.name}: {len(pdf_records)} products  ({elapsed:.1f}s)', flush=True)
        with open(OUT_CSV, 'w', newline='', encoding='utf-8') as f:
            w = csv.DictWriter(f, fieldnames=['pdf','page','code','name','qty','stock_price','box_price'])
            w.writeheader(); w.writerows(all_records)
        gc.collect()
    total = time.time() - t0
    print(f'\nDone. {len(all_records)} new records, {total:.1f}s total. Saved to {OUT_CSV}', flush=True)

if __name__ == '__main__':
    main()
