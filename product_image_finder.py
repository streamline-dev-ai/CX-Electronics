"""
Product Image Finder
--------------------
Searches Bing Images for each product and outputs a CSV with the top 3 image URLs.

Usage:
  - Hardcoded list:  set PRODUCTS below and run the script
  - From CSV file:   python product_image_finder.py --csv products.csv
                     (the CSV must have a "name" column)

Output: product_images.csv in the same folder as this script.
"""

import csv
import sys
import time
import random
import argparse
import re
import json
import os
from pathlib import Path
from urllib.parse import quote_plus

import requests
from bs4 import BeautifulSoup
from html import unescape

# ── Hardcoded product list (used when no --csv flag is given) ──────────────────
PRODUCTS = [
    "Battery Mate 12V LED Digital Battery and Alternator Tester with Status Indicators",
    "30x40cm Bamboo Cutting Board with Metal Ring, Rectangular, Natural Wood Grain, Kitchen Chopping Board",
    # Add more products here...
]

RESULTS_PER_PRODUCT = 3
OUTPUT_FILE = Path(__file__).parent / "product_images.csv"
MAX_RETRIES = 3

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


def search_bing_images(query: str, max_results: int = RESULTS_PER_PRODUCT) -> list[str]:
    """Scrape Bing Images and return up to max_results direct image URLs."""
    url = f"https://www.bing.com/images/search?q={quote_plus(query)}&form=HDRSC2"
    urls = []

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            resp.raise_for_status()

            # Bing HTML-encodes the embedded JSON with &quot; entities.
            # Decode first, then extract the murl (original image) field.
            decoded = unescape(resp.text)
            matches = re.findall(r'"murl":"(https?://[^"]+)"', decoded)

            seen = set()
            for m in matches:
                if m not in seen:
                    seen.add(m)
                    urls.append(m)
                if len(urls) >= max_results:
                    break

            if urls:
                return urls

            # If nothing found on first parse, try BeautifulSoup fallback
            soup = BeautifulSoup(resp.text, "html.parser")
            for tag in soup.select("a.iusc"):
                meta = tag.get("m", "")
                try:
                    data = json.loads(meta)
                    img_url = data.get("murl", "")
                    if img_url and img_url.startswith("http") and img_url not in seen:
                        seen.add(img_url)
                        urls.append(img_url)
                    if len(urls) >= max_results:
                        break
                except json.JSONDecodeError:
                    continue

            if urls:
                return urls

            print(f"         Attempt {attempt}: no URLs parsed, retrying...")

        except requests.RequestException as e:
            print(f"         Attempt {attempt} failed: {e}")

        if attempt < MAX_RETRIES:
            wait = random.uniform(4, 8)
            print(f"         Waiting {wait:.1f}s before retry...")
            time.sleep(wait)

    return urls


def pad(lst: list, length: int, fill: str = "") -> list:
    return lst[:length] + [fill] * (length - len(lst))


def load_products_from_csv(path: str) -> list[str]:
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if "name" not in (reader.fieldnames or []):
            sys.exit(f"ERROR: CSV must have a 'name' column. Found: {reader.fieldnames}")
        return [row["name"].strip() for row in reader if row["name"].strip()]


def main():
    parser = argparse.ArgumentParser(description="Find product images via Bing Images.")
    parser.add_argument("--csv", help="Path to a CSV file with a 'name' column.")
    args = parser.parse_args()

    products = load_products_from_csv(args.csv) if args.csv else PRODUCTS

    if not products:
        sys.exit("No products to process.")

    print(f"Processing {len(products)} product(s)\n")

    rows = []
    for i, name in enumerate(products, 1):
        print(f"[{i}/{len(products)}] {name[:90]}")
        urls = search_bing_images(name)

        if not urls:
            print("         WARNING: No image URLs found.")
        else:
            print(f"         Found {len(urls)} URL(s):")
            for j, u in enumerate(urls, 1):
                print(f"           {j}. {u[:100]}")

        padded = pad(urls, RESULTS_PER_PRODUCT)
        rows.append({
            "product_name": name,
            "image_url_1":  padded[0],
            "image_url_2":  padded[1],
            "image_url_3":  padded[2],
        })

        if i < len(products):
            delay = random.uniform(3, 6)
            print(f"         Sleeping {delay:.1f}s...\n")
            time.sleep(delay)

    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f, fieldnames=["product_name", "image_url_1", "image_url_2", "image_url_3"]
        )
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nSaved to: {OUTPUT_FILE}\n")
    print(f"{'PRODUCT':<60}  URLS FOUND")
    print("-" * 72)
    for row in rows:
        found = sum(1 for k in ["image_url_1", "image_url_2", "image_url_3"] if row[k])
        print(f"{row['product_name'][:58]:<60}  {found}/{RESULTS_PER_PRODUCT}")


if __name__ == "__main__":
    main()
