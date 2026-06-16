#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path('/Users/rudolfkonfal/.openclaw/workspace/banner-studio')
SRC = Path('/Users/rudolfkonfal/.openclaw/workspace/reporting-v2/data/current/wpj_products.json')
OUT = ROOT / 'real-feed.js'

SELECT_CODES = [
    'BC869',  # Collagen Active – komplexní lifting
    '12712',  # Collagen active tonikum
    '52901',  # Hyaluron maska
    '52903',  # Q10 maska
    '16001',  # Hyaluron serum
    '36006',  # Hyaluron gel lotion
    '30223',  # Tělová sůl Mrtvé moře
    '32604',  # Tělové mléko Slunečné olivy
]

SHAPE_BY_TITLE = [
    ('sérum', 'bottle'),
    ('gel', 'tube'),
    ('lotion', 'tube'),
    ('maska', 'sachet'),
    ('mléko', 'bottle'),
    ('tonikum', 'bottle'),
    ('sůl', 'jar'),
    ('collagen active', 'bundle'),
]


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
    if 'collagen' in low:
        return ['#f1ddd0', '#fffaf6', '#d3b29d']
    if 'olivy' in low:
        return ['#dce8cf', '#fbfff8', '#a4bc7f']
    if 'sůl' in low:
        return ['#e8d8ed', '#fff9ff', '#bf9fcb']
    return ['#f4dcc7', '#fff8f3', '#d7b297']


def make_benefits(title: str):
    low = title.lower()
    if 'collagen' in low:
        return ['Liftující dojem', 'Anti-age rutina', 'Prémiová péče', 'Výrazný hero produkt']
    if 'hyaluron' in low:
        return ['Hydratační fokus', 'Svěží vzhled', 'Lehká péče', 'Rychlá beauty rutina']
    if 'q10' in low:
        return ['Omlazující dojem', 'Jednoduché použití', 'Oblíbená maska', 'Rychlý rituál']
    if 'olivy' in low:
        return ['Jemná péče', 'Příjemný pocit', 'Každodenní použití', 'Hebčí dojem']
    if 'sůl' in low:
        return ['Relaxační rituál', 'Voňavý zážitek', 'Domácí wellness', 'Dárkový potenciál']
    return ['Top produkt', 'Silný prodejní benefit', 'Vhodné pro e-shop banner', 'Univerzální použití']


def main():
    payload = json.loads(SRC.read_text(encoding='utf-8'))
    items = payload['items']
    by_code = {str(item.get('code') or ''): item for item in items}
    products = []
    for code in SELECT_CODES:
        item = by_code.get(code)
        if not item:
            continue
        title = item['title']
        slug = item['url'].rstrip('/').split('/')[-1]
        price = int(round(float((item.get('price') or {}).get('withVat') or 0)))
        products.append({
            'id': slug,
            'type': 'product',
            'sku': str(item.get('code') or ''),
            'name': title,
            'url': item.get('url') or '',
            'price': price,
            'currency': 'Kč',
            'availability': 'Skladem' if (item.get('inStore') or 0) > 0 else 'Na dotaz',
            'category': 'real-feed',
            'packshotLabel': str(item.get('code') or ''),
            'gallery': [str(item.get('code') or ''), 'wpj', 'eshop'],
            'headline': title,
            'subtitle': 'Reálný produkt z WPJ feedu pro banner workflow',
            'cta': 'Prohlédnout produkt',
            'badge': 'WPJ produkt',
            'benefits': make_benefits(title),
            'colors': pick_colors(title),
            'packshotShape': pick_shape(title),
        })

    bundles = []
    if len(products) >= 2:
        bundles.append({
            'id': 'real-collagen-routine',
            'type': 'bundle',
            'name': 'Collagen Active rutina',
            'url': products[0]['url'],
            'price': sum(p['price'] for p in products[:2]),
            'currency': 'Kč',
            'availability': 'Skladem',
            'badge': 'WPJ sestava',
            'gallery': ['bundle', 'wpj', 'routine'],
            'headline': 'Collagen Active rutina pro silný anti-age banner',
            'subtitle': 'Sestava složená z reálných WPJ produktů',
            'cta': 'Chci sestavu',
            'benefits': ['Víc produktů v jedné kreativitě', 'Silnější upsell message', 'Sestava pro e-shop promo', 'Reálná WPJ data'],
            'colors': ['#ead8cf', '#fffaf7', '#cfae99'],
            'itemIds': [products[0]['id'], products[1]['id']],
            'packshotShape': 'bundle',
        })
    if len(products) >= 5:
        bundles.append({
            'id': 'real-mask-routine',
            'type': 'bundle',
            'name': 'Masky a hyaluron rutina',
            'url': products[2]['url'],
            'price': sum(p['price'] for p in products[2:5]),
            'currency': 'Kč',
            'availability': 'Skladem',
            'badge': 'WPJ sestava',
            'gallery': ['bundle', 'mask', 'hyaluron'],
            'headline': 'Masky a hyaluron jako připravená beauty sestava',
            'subtitle': 'Reálná produktová kombinace z lokálního feedu',
            'cta': 'Vyzkoušet sestavu',
            'benefits': ['Hydratační téma', 'Beauty rutina', 'Banner pro bundle promo', 'Více packshotů naráz'],
            'colors': ['#dbeaf3', '#fbfeff', '#a4bfd1'],
            'itemIds': [products[2]['id'], products[3]['id'], products[4]['id']],
            'packshotShape': 'bundle',
        })

    content = 'export const realProductFeed = ' + json.dumps(products, ensure_ascii=False, indent=2) + ';\n\n'
    content += 'export const realBundleFeed = ' + json.dumps(bundles, ensure_ascii=False, indent=2) + ';\n'
    OUT.write_text(content, encoding='utf-8')
    print(f'Wrote {len(products)} real products and {len(bundles)} bundles to {OUT}')

if __name__ == '__main__':
    main()
