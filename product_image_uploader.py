"""
Product Image Uploader
----------------------
Reads a CSV of product names + source image URLs, uploads each image to Cloudinary
(Cloudinary fetches the URL — no local download needed), then updates the matching
product row in Supabase with the permanent Cloudinary CDN URLs.

Usage:
  python product_image_uploader.py --csv products.csv           # full run
  python product_image_uploader.py --csv products.csv --test 2  # test first 2 rows
  python product_image_uploader.py --csv products.csv --dry-run # validate without uploading
  python product_image_uploader.py --csv products.csv --overwrite # re-upload even if images exist

CSV columns required:
  slug | product_name | image_url_1 | image_url_2 | image_url_3
  (slug is used for matching — product_name is just for reference)
  (image_url_2 and image_url_3 are optional)

Credentials — add these to your .env.local file:
  CLOUDINARY_CLOUD_NAME=...
  CLOUDINARY_API_KEY=...
  CLOUDINARY_API_SECRET=...
  SUPABASE_SERVICE_ROLE_KEY=...
  VITE_SUPABASE_URL=...   (already in .env.local)
"""

import argparse
import csv
import os
import re
import sys
import time
from pathlib import Path

import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from supabase import create_client

# ── Load credentials ────────────────────────────────────────────────────────
ENV_FILE = Path(__file__).parent / ".env.local"
load_dotenv(ENV_FILE)

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "")
CLOUDINARY_API_KEY    = os.getenv("CLOUDINARY_API_KEY", "")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "")
SUPABASE_URL          = os.getenv("VITE_SUPABASE_URL", "")
SUPABASE_SERVICE_KEY  = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

LOG_FILE = Path(__file__).parent / "upload_log.csv"
UPLOAD_DELAY = 0.5  # seconds between Cloudinary uploads


def check_credentials():
    missing = []
    if not CLOUDINARY_CLOUD_NAME: missing.append("CLOUDINARY_CLOUD_NAME")
    if not CLOUDINARY_API_KEY:    missing.append("CLOUDINARY_API_KEY")
    if not CLOUDINARY_API_SECRET: missing.append("CLOUDINARY_API_SECRET")
    if not SUPABASE_URL:          missing.append("VITE_SUPABASE_URL")
    if not SUPABASE_SERVICE_KEY:  missing.append("SUPABASE_SERVICE_ROLE_KEY")
    if missing:
        print("ERROR: Missing credentials in .env.local:")
        for m in missing:
            print(f"  {m}=your_value_here")
        sys.exit(1)


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text[:80]


def upload_to_cloudinary(source_url: str, public_id: str, dry_run: bool) -> str | None:
    """Upload a URL to Cloudinary. Returns the secure_url or None on failure."""
    if dry_run:
        return f"https://res.cloudinary.com/{CLOUDINARY_CLOUD_NAME}/image/upload/DRY_RUN/{public_id}.jpg"
    try:
        result = cloudinary.uploader.upload(
            source_url,
            public_id=public_id,
            folder="cx-electronics/products",
            overwrite=True,
            transformation=[
                # Resize to max 1000x1000, keep aspect ratio, never upscale
                {"width": 1000, "height": 1000, "crop": "limit"},
                # Smart quality (Cloudinary picks the best quality/size tradeoff)
                # fetch_format: auto serves WebP to modern browsers, AVIF where supported
                # strip_profile removes EXIF/camera metadata (saves 20-80KB per image)
                # progressive makes JPEG load top-to-bottom while downloading
                {"quality": "auto:good", "fetch_format": "auto",
                 "flags": ["strip_profile", "progressive"]},
            ],
        )
        return result.get("secure_url")
    except Exception as e:
        print(f"         Cloudinary upload failed: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(description="Upload product images to Cloudinary and update Supabase.")
    parser.add_argument("--csv",       required=True, help="Path to CSV file")
    parser.add_argument("--test",      type=int, metavar="N", help="Only process first N rows")
    parser.add_argument("--dry-run",   action="store_true", help="Validate without uploading or writing to Supabase")
    parser.add_argument("--overwrite", action="store_true", help="Re-upload even if product already has images")
    args = parser.parse_args()

    check_credentials()

    # Configure Cloudinary
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET,
        secure=True,
    )

    # Connect to Supabase with service role key (bypasses RLS)
    sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    # Load all products from Supabase for slug matching
    print("Loading products from Supabase...")
    resp = sb.table("products").select("id, name, slug, thumbnail_url, images").execute()
    products_by_slug = {p["slug"]: p for p in resp.data}
    print(f"Found {len(products_by_slug)} products in Supabase.\n")

    # Read CSV
    csv_path = Path(args.csv)
    if not csv_path.exists():
        sys.exit(f"ERROR: CSV file not found: {csv_path}")

    with open(csv_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    # Normalise column names (strip whitespace)
    rows = [{k.strip(): v.strip() for k, v in row.items()} for row in rows]

    if "slug" not in (rows[0] if rows else {}):
        sys.exit("ERROR: CSV must have a 'slug' column.")

    if args.test:
        rows = rows[:args.test]
        print(f"TEST MODE: processing first {args.test} row(s).\n")

    if args.dry_run:
        print("DRY RUN: no uploads or Supabase writes will happen.\n")

    log_rows = []
    skipped = 0
    updated = 0
    failed  = 0

    for i, row in enumerate(rows, 1):
        slug = row.get("slug", "").strip()
        name = row.get("product_name", slug).strip()
        src_urls = [
            row.get("image_url_1", "").strip(),
            row.get("image_url_2", "").strip(),
            row.get("image_url_3", "").strip(),
        ]
        src_urls = [u for u in src_urls if u and u.startswith("http")]

        print(f"[{i}/{len(rows)}] {name[:80]}")

        # Match product in Supabase by slug
        product = products_by_slug.get(slug)
        if not product:
            print(f"         WARNING: No Supabase match for slug '{slug}' — skipping.")
            log_rows.append({"product_name": name, "status": "no_match", "cloudinary_url_1": "", "cloudinary_url_2": "", "cloudinary_url_3": "", "error": f"No match for slug: {slug}"})
            failed += 1
            continue

        # Skip if already has images (unless --overwrite)
        if not args.overwrite and product.get("thumbnail_url"):
            print(f"         Already has images — skipping. Use --overwrite to replace.")
            log_rows.append({"product_name": name, "status": "skipped", "cloudinary_url_1": product.get("thumbnail_url",""), "cloudinary_url_2": "", "cloudinary_url_3": "", "error": ""})
            skipped += 1
            continue

        if not src_urls:
            print(f"         No image URLs in CSV row — skipping.")
            log_rows.append({"product_name": name, "status": "no_urls", "cloudinary_url_1": "", "cloudinary_url_2": "", "cloudinary_url_3": "", "error": "No image URLs in CSV"})
            failed += 1
            continue

        # Upload each image URL to Cloudinary
        slug = product.get("slug") or slug
        cloudinary_urls = []
        upload_error = ""

        for j, src_url in enumerate(src_urls, 1):
            public_id = f"{slug}-{j}"
            print(f"         Uploading image {j}: {src_url[:80]}...")
            cdn_url = upload_to_cloudinary(src_url, public_id, args.dry_run)
            if cdn_url:
                cloudinary_urls.append(cdn_url)
                print(f"         -> {cdn_url[:90]}")
            else:
                upload_error = f"Image {j} upload failed"
                print(f"         -> FAILED")
            if not args.dry_run:
                time.sleep(UPLOAD_DELAY)

        if not cloudinary_urls:
            print(f"         All uploads failed — skipping Supabase update.")
            log_rows.append({"product_name": name, "status": "upload_failed", "cloudinary_url_1": "", "cloudinary_url_2": "", "cloudinary_url_3": "", "error": upload_error})
            failed += 1
            continue

        # Update Supabase
        padded = (cloudinary_urls + ["", "", ""])[:3]
        if not args.dry_run:
            try:
                sb.table("products").update({
                    "thumbnail_url": cloudinary_urls[0],
                    "images": cloudinary_urls,
                    "updated_at": "now()",
                }).eq("id", product["id"]).execute()
                print(f"         Supabase updated.")
            except Exception as e:
                print(f"         Supabase update failed: {e}")
                log_rows.append({"product_name": name, "status": "supabase_failed", "cloudinary_url_1": padded[0], "cloudinary_url_2": padded[1], "cloudinary_url_3": padded[2], "error": str(e)})
                failed += 1
                continue
        else:
            print(f"         [dry-run] Would update Supabase.")

        log_rows.append({"product_name": name, "status": "ok", "cloudinary_url_1": padded[0], "cloudinary_url_2": padded[1], "cloudinary_url_3": padded[2], "error": ""})
        updated += 1
        print()

    # Write log
    with open(LOG_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["product_name", "status", "cloudinary_url_1", "cloudinary_url_2", "cloudinary_url_3", "error"])
        writer.writeheader()
        writer.writerows(log_rows)

    print("=" * 60)
    print(f"Done.  Updated: {updated}  Skipped: {skipped}  Failed: {failed}")
    print(f"Log saved to: {LOG_FILE}")


if __name__ == "__main__":
    main()
