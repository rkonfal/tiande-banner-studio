# Banner Studio

Lehká statická interní appka pro tvorbu bannerů pro Království tianDe.

## Start

```bash
npm run dev
```

Pak otevři:

- http://localhost:3017

## Co umí teď

- celý produktový katalog z Perselio XML feedu
- produkty i automatické bundle presety
- 5 až 10 variant najednou
- preview ve formátech `16:9`, `4:5`, `1:1`, `9:16`
- workflow preview first, approve then export
- režimy obrázku `Auto`, `Packshot`, `Lifestyle`
- reálné packshoty i alt/lifestyle obrázky z feedu
- jednoduché odstranění skoro-bílého pozadí u packshotů při PNG exportu
- PNG export schválených variant
- bulk download
- ZIP export bez externích závislostí
- export manifestu JSON
- detail editor varianty
- asset manager pro ruční výměnu packshotu nebo lifestyle obrázku
- uložení více projektů do localStorage
- export/import projektu přes JSON

## Struktura

- `index.html` – UI shell
- `app.js` – renderer, exporty, editor, projekty
- `styles.css` – layout a styly
- `feed.js` – demo feed
- `real-feed.js` – reálný feed z Perselio XML
- `scripts_export_real_feed.py` – generátor feedu z XML endpointu
- `assets/packshots/` – dříve stažené lokální packshoty pro fallback / testy

## Poznámka

Appka je záměrně bez frameworku a bez `node_modules`, protože na stroji byl kriticky plný disk a bylo potřeba rychlé interní MVP, které jde snadno pushnout a vystavit live.
