# Banner Studio

Lehká statická interní appka pro tvorbu bannerů pro Království tianDe.

## Start

```bash
npm run dev
```

Pak otevři:

- http://localhost:3017

## Co umí teď

- produkty i sestavy
- 5 až 10 variant najednou
- preview ve formátech `16:9`, `4:5`, `1:1`, `9:16`
- workflow preview first, approve then export
- reálné packshoty z lokálního WPJ feedu
- PNG export schválených variant
- bulk download
- ZIP export bez externích závislostí
- export manifestu JSON
- detail editor varianty
- asset manager pro ruční výměnu packshotu
- uložení více projektů do localStorage
- export/import projektu přes JSON

## Struktura

- `index.html` – UI shell
- `app.js` – renderer, exporty, editor, projekty
- `styles.css` – layout a styly
- `feed.js` – demo feed
- `real-feed.js` – reálný feed z WPJ
- `assets/packshots/` – lokálně stažené packshoty
- `scripts_export_real_feed.py` – pomocný generátor feedu

## Poznámka

Appka je záměrně bez frameworku a bez `node_modules`, protože na stroji byl kriticky plný disk a bylo potřeba rychlé interní MVP, které půjde snadno pushnout i vystavit live.
