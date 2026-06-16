#!/usr/bin/env python3
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path('/Users/rudolfkonfal/.openclaw/workspace/banner-studio')
OUT = ROOT / 'real-feed.js'
FEED_URL = 'https://www.kralovstvi-tiande.cz/feed/23/db0fa65b3fb4fa6ad3e44be839cc31b9a9b34b7b'
MAX_BUNDLES = 24

SHAPE_BY_TITLE = [
    ('sérum', 'bottle'),
    ('serum', 'bottle'),
    ('gel', 'tube'),
    ('krém', 'jar'),
    ('krem', 'jar'),
    ('lotion', 'tube'),
    ('maska', 'sachet'),
    ('mléko', 'bottle'),
    ('mleko', 'bottle'),
    ('tonikum', 'bottle'),
    ('šampon', 'bottle'),
    ('sampon', 'bottle'),
    ('balzám', 'tube'),
    ('balzam', 'tube'),
    ('sůl', 'jar'),
    ('sul', 'jar'),
    ('essence', 'bottle'),
    ('emulze', 'bottle'),
]

CATEGORY_HINTS = [
    ('collagen', 'collagen'),
    ('kolagen', 'collagen'),
    ('hyaluron', 'hyaluron'),
    ('q10', 'q10'),
    ('spirulina', 'spirulina'),
    ('master herb', 'master-herb'),
    ('zelený čaj', 'green-tea'),
    ('zeleny caj', 'green-tea'),
    ('broskev', 'peach'),
    ('grapefruit', 'grapefruit'),
    ('olivy', 'olives'),
    ('tea tree', 'tea-tree'),
    ('aloe', 'aloe'),
]


def slugify(value: str) -> str:
    value = value.lower().strip()
    replacements = {
        'á': 'a', 'ä': 'a', 'č': 'c', 'ď': 'd', 'é': 'e', 'ě': 'e', 'ë': 'e',
        'í': 'i', 'ľ': 'l', 'ĺ': 'l', 'ň': 'n', 'ó': 'o', 'ô': 'o', 'ö': 'o',
        'ř': 'r', 'š': 's', 'ť': 't', 'ú': 'u', 'ů': 'u', 'ü': 'u', 'ý': 'y', 'ž': 'z',
        '„': '', '“': '', '’': '', '"': '', "'": ''
    }
    for old, new in replacements.items():
        value = value.replace(old, new)
    value = re.sub(r'[^a-z0-9]+', '-', value)
    return value.strip('-') or 'produkt'


def pick_shape(title: str) -> str:
    low = title.lower()
    for needle, shape in SHAPE_BY_TITLE:
        if needle in low:
            return shape
    return 'jar'


def pick_colors(title: str):
    low = title.lower()
    if 'hyaluron' in low:
        return ['#d8eef7', '#f9fdff', '#9ec6d7']
    if 'q10' in low:
        return ['#f4d7c8', '#fff8f5', '#d9a37a']
    if 'collagen' in low or 'kolagen' in low:
        return ['#f1ddd0', '#fffaf6', '#d3b29d']
    if 'olivy' in low:
        return ['#dce8cf', '#fbfff8', '#a4bc7f']
    if 'sůl' in low or 'sul' in low:
        return ['#e8d8ed', '#fff9ff', '#bf9fcb']
    if 'tea tree' in low:
        return ['#d8eadf', '#fbfffd', '#8fb299']
    return ['#f4dcc7', '#fff8f3', '#d7b297']


def make_benefits(title: str, description: str):
    low = f'{title} {description}'.lower()
    if 'collagen' in low or 'kolagen' in low:
        return ['Liftující dojem', 'Anti-age rutina', 'Prémiová péče', 'Výrazný hero produkt']
    if 'hyaluron' in low:
        return ['Hydratační fokus', 'Svěží vzhled', 'Lehká péče', 'Rychlá beauty rutina']
    if 'q10' in low:
        return ['Omlazující dojem', 'Jednoduché použití', 'Oblíbená maska', 'Rychlý rituál']
    if 'olivy' in low:
        return ['Jemná péče', 'Příjemný pocit', 'Každodenní použití', 'Hebčí dojem']
    if 'sůl' in low or 'sul' in low:
        return ['Relaxační rituál', 'Voňavý zážitek', 'Domácí wellness', 'Dárkový potenciál']
    if 'vlasy' in low or 'šampon' in low or 'sampon' in low:
        return ['Každodenní rutina', 'Svěží dojem', 'Pečující formule', 'Silný e-shop vizuál']
    return ['Top produkt', 'Silný prodejní benefit', 'Vhodné pro e-shop banner', 'Univerzální použití']


def category_hint(title: str, description: str) -> str:
    low = f'{title} {description}'.lower()
    for needle, label in CATEGORY_HINTS:
        if needle in low:
            return label
    return 'general'


def text(node, path, default=''):
    found = node.find(path)
    return (found.text or '').strip() if found is not None and found.text else default


def first_sentence(description: str) -> str:
    cleaned = re.sub(r'\s+', ' ', description).strip()
    if not cleaned:
        return 'Reálný produkt z Perselio feedu pro banner workflow'
    parts = re.split(r'(?<=[.!?])\s+', cleaned)
    return parts[0][:180]


def parse_price(value: str) -> int:
    normalized = (value or '0').replace(' ', '').replace(',', '.')
    return int(round(float(normalized or '0')))


def build_products(root):
    products = []
    for item in root.findall('.//item'):
        name = text(item, 'name')
        url = text(item, 'url')
        image_url = text(item, 'image_url')
        if not (name and url and image_url):
            continue
        alt_images_parent = item.find('image_urls_alt')
        alt_images = []
        if alt_images_parent is not None:
            alt_images = [img.text.strip() for img in alt_images_parent.findall('image_url') if img.text and img.text.strip()]
        description = text(item, 'description')
        category = category_hint(name, description)
        product = {
            'id': slugify(f"{name}-{text(item, 'id') or text(item, 'url').rstrip('/').split('/')[-1]}"),
            'type': 'product',
            'sku': text(item, 'id'),
            'name': name,
            'url': url,
            'price': parse_price(text(item, 'price', '0')),
            'currency': 'Kč',
            'availability': 'Skladem' if text(item, 'available') == 'true' else 'Na dotaz',
            'stockCount': int(text(item, 'in_stock_count', '0') or '0'),
            'category': category,
            'packshotLabel': text(item, 'id'),
            'gallery': [category, 'perselio', 'eshop'],
            'headline': name,
            'subtitle': first_sentence(description),
            'cta': 'Prohlédnout produkt',
            'badge': 'Perselio feed',
            'benefits': make_benefits(name, description),
            'colors': pick_colors(name),
            'packshotShape': pick_shape(name),
            'imagePath': image_url,
            'altImagePaths': alt_images,
        }
        products.append(product)
    products.sort(key=lambda p: (p['availability'] != 'Skladem', p['name'].lower()))
    return products


def build_bundles(products):
    by_cat = {}
    for product in products:
        by_cat.setdefault(product['category'], []).append(product)
    bundles = []
    for category, items in by_cat.items():
        if len(items) < 2:
            continue
        chosen = sorted(items, key=lambda x: (-x['stockCount'], x['price']))[:3]
        bundles.append({
            'id': f'bundle-{category}',
            'type': 'bundle',
            'name': f'{category.replace("-", " ").title()} rutina',
            'url': chosen[0]['url'],
            'price': sum(item['price'] for item in chosen),
            'currency': 'Kč',
            'availability': 'Skladem' if all(item['availability'] == 'Skladem' for item in chosen) else 'Na dotaz',
            'badge': 'Perselio sestava',
            'gallery': [category, 'bundle', 'perselio'],
            'headline': f'{category.replace("-", " ").title()} sestava pro výraznější banner',
            'subtitle': 'Sestava poskládaná automaticky z Perselio feedu',
            'cta': 'Vyzkoušet sestavu',
            'benefits': ['Více produktů v jedné kreativitě', 'Silnější upsell message', 'Reálná dostupnost', 'Automatický bundle preset'],
            'colors': chosen[0]['colors'],
            'itemIds': [item['id'] for item in chosen],
            'packshotShape': 'bundle',
            'imagePaths': [item['imagePath'] for item in chosen[:2]],
            'altImagePaths': [img for item in chosen for img in item.get('altImagePaths', [])][:4],
        })
    bundles.sort(key=lambda b: b['name'].lower())
    return bundles[:MAX_BUNDLES]


def main():
    xml = urllib.request.urlopen(FEED_URL, timeout=60).read()
    root = ET.fromstring(xml)
    products = build_products(root)
    bundles = build_bundles(products)
    content = 'export const realProductFeed = ' + json.dumps(products, ensure_ascii=False, indent=2) + ';\n\n'
    content += 'export const realBundleFeed = ' + json.dumps(bundles, ensure_ascii=False, indent=2) + ';\n'
    OUT.write_text(content, encoding='utf-8')
    print(f'Wrote {len(products)} real products and {len(bundles)} bundles to {OUT}')


if __name__ == '__main__':
    main()
