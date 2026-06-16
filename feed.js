export const brandAssets = {
  logoText: 'Království tianDe',
  defaultBadge: 'E-shop banner',
  logoPlacement: 'bottom-right',
};

export const productFeed = [
  {
    id: 'kolagen-active',
    type: 'product',
    sku: 'BC869',
    name: 'Kolagen Active',
    price: 799,
    currency: 'Kč',
    availability: 'Skladem',
    category: 'anti-age',
    packshotLabel: 'Packshot 1',
    gallery: ['packshot-main', 'texture-soft', 'lifestyle-clean'],
    headline: 'Komplexní lifting pro obličej, krk i tělo',
    subtitle: 'Silná anti-age péče pro každodenní rituál',
    cta: 'Nakoupit teď',
    badge: 'Best seller',
    benefits: [
      'Vyhlazuje pleť',
      'Podporuje pevnější kontury',
      'Snadné každodenní použití',
      'Oblíbené anti-age řešení'
    ],
    colors: ['#f4dcc7', '#fff8f3', '#d7b297'],
    packshotShape: 'jar'
  },
  {
    id: 'master-herb-sampon',
    type: 'product',
    sku: 'VI377',
    name: 'Šampón Master Herb',
    price: 459,
    currency: 'Kč',
    availability: 'Skladem',
    category: 'vlasy',
    packshotLabel: 'Packshot 2',
    gallery: ['packshot-bottle', 'foam-clean', 'lifestyle-hair'],
    headline: 'Péče o vlasy, kterou si zamiluješ po pár použitích',
    subtitle: 'Jemný rituál pro svěží a upravený vzhled',
    cta: 'Prohlédnout produkt',
    badge: 'Top péče',
    benefits: [
      'Šetrná každodenní péče',
      'Příjemný pocit po umytí',
      'Snadné zařazení do rutiny',
      'Vhodné pro pravidelné používání'
    ],
    colors: ['#d9ecd8', '#f8fff6', '#93b48f'],
    packshotShape: 'bottle'
  },
  {
    id: 'spirulina-pletska-pece',
    type: 'product',
    sku: 'FY660',
    name: 'Spirulina pleťová péče',
    price: 529,
    currency: 'Kč',
    availability: 'Skladem',
    category: 'plet',
    packshotLabel: 'Packshot 3',
    gallery: ['packshot-jar', 'green-accent', 'lifestyle-fresh'],
    headline: 'Svěží vzhled a čistější dojem z pleti každý den',
    subtitle: 'Rychlý beauty reset pro běžný den',
    cta: 'Zjistit více',
    badge: 'Fresh look',
    benefits: [
      'Lehký a svěží pocit',
      'Podpora upraveného vzhledu',
      'Skvělé do ranní rutiny',
      'Oblíbené pro rychlý efekt'
    ],
    colors: ['#d8efe6', '#f8fffc', '#8cc4b0'],
    packshotShape: 'tube'
  }
];

export const bundleFeed = [
  {
    id: 'anti-age-ritual',
    type: 'bundle',
    name: 'Anti-age rituál',
    price: 1499,
    currency: 'Kč',
    availability: 'Skladem',
    badge: 'Sestava',
    gallery: ['bundle-2up', 'routine-soft'],
    headline: 'Kompletní omlazující sestava v jednom rituálu',
    subtitle: 'Vícekroková péče pro jednotný výsledek',
    cta: 'Chci sestavu',
    benefits: [
      'Produkty, které se vzájemně doplňují',
      'Silnější dojem z celé rutiny',
      'Jeden jasný beauty scénář',
      'Vhodné i jako dárek'
    ],
    colors: ['#ecd8e9', '#fff8fe', '#bf93b7'],
    itemIds: ['kolagen-active', 'spirulina-pletska-pece'],
    packshotShape: 'bundle'
  },
  {
    id: 'vlasovy-restart',
    type: 'bundle',
    name: 'Vlasový restart',
    price: 899,
    currency: 'Kč',
    availability: 'Skladem',
    badge: 'Routine set',
    gallery: ['bundle-hair', 'routine-beige'],
    headline: 'Sestava pro každodenní upravený vzhled vlasů',
    subtitle: 'Jednoduchý set pro pravidelnou péči',
    cta: 'Vyzkoušet sestavu',
    benefits: [
      'Jednoduchá péče v pár krocích',
      'Lepší disciplína v rutině',
      'Vhodné pro pravidelné použití',
      'Praktická kombinace produktů'
    ],
    colors: ['#e8dfcf', '#fffaf0', '#b79b76'],
    itemIds: ['master-herb-sampon'],
    packshotShape: 'bundle'
  }
];
