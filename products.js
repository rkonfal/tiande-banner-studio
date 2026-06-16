import { productFeed, bundleFeed } from './feed.js';

export const catalog = {
  products: productFeed,
  bundles: bundleFeed,
};

export const templates = {
  clean: {
    label: 'Clean beauty',
    mood: 'jemný, čistý, elegantní',
    backgrounds: [
      'linear-gradient(135deg, #f4dcc7 0%, #fff8f3 55%, #d7b297 100%)',
      'linear-gradient(135deg, #f8e6da 0%, #fffdf9 58%, #e7c5ad 100%)'
    ],
    copyRules: {
      maxHeadlineWords: 8,
      bulletCount: 3,
    },
    layout: 'single-packshot',
  },
  promo: {
    label: 'Promo / akce',
    mood: 'výrazný, akční, prodejní',
    backgrounds: [
      'linear-gradient(135deg, #f1c9b8 0%, #fff4ee 45%, #de8b63 100%)',
      'linear-gradient(135deg, #f6d7c3 0%, #fffaf6 48%, #ca7448 100%)'
    ],
    copyRules: {
      maxHeadlineWords: 7,
      bulletCount: 2,
    },
    layout: 'price-badge',
  },
  arrows: {
    label: 'Se šipkama',
    mood: 'benefit-first, vysvětlující, produkt ve středu',
    backgrounds: [
      'radial-gradient(circle at center, #fff9f4 0%, #f3dfd0 55%, #d2aa8f 100%)',
      'radial-gradient(circle at center, #fffdf8 0%, #f5e4d8 50%, #d9b296 100%)'
    ],
    copyRules: {
      maxHeadlineWords: 6,
      bulletCount: 4,
    },
    layout: 'benefit-arrows',
  }
};
