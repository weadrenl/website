export const SITE = {
  name: 'ADRENL',
  url: 'https://adrenl.com',
  dropISO: '2026-10-31T00:00:00+05:30',
  dropLabel: '31 October 2026',
  price: 799,
  nextPrice: 999,
  currency: 'INR',
};

export type Design = {
  id: 'ridge' | 'garud' | 'marcos';
  n: string;
  name: string;
  field: string;
  colour: string;
  line: string;
  story: string;
  why: string;
  print: string;
  coords: string;
  alt: string;
  bg: string;
  accent: string;
  views: { key: 'front' | 'back' | 'side'; label: string; file: string }[];
  flat: string;
};

const v = (id: string) => [
  { key: 'front' as const, label: 'Front', file: `${id}-front-model.png` },
  { key: 'back' as const, label: 'Back', file: `${id}-back-model.png` },
  { key: 'side' as const, label: 'Side', file: `${id}-side-model.png` },
];

export const DESIGNS: Design[] = [
  {
    id: 'ridge', n: '01', name: 'RIDGE', field: 'High altitude', colour: 'Black',
    line: 'The climb stays with you.',
    story: 'A contour line is a quiet record of effort. Every turn is another stretch of trail, another view earned on foot. RIDGE puts the mountain on your back and keeps the front calm: a small ADRENL mark, nothing else.',
    why: 'Our clearest statement of what ADRENL is about: terrain, effort and the reward of getting outside. For early starts and hill roads.',
    print: 'Layered mountain contours, large back graphic',
    coords: '32.2396° N / 77.1887° E', alt: '3,450 M',
    bg: '#0f100e', accent: '#d8d3c4', views: v('ridge'), flat: 'ridge-flat.jpg',
  },
  {
    id: 'garud', n: '02', name: 'GARUD', field: 'Open sky', colour: 'Black',
    line: 'Take the open road.',
    story: 'An eagle with its wings thrown wide, drawn as freedom rather than rank. GARUD is the energy of a long ride: the next bend, the empty stretch, a sky that keeps getting bigger.',
    why: 'The loudest graphic from across the street. Indian myth meets road-trip energy, without borrowing any real military insignia.',
    print: 'Mythic eagle, large back graphic',
    coords: '34.1526° N / 77.5771° E', alt: '3,500 M',
    bg: '#17100c', accent: '#f0773a', views: v('garud'), flat: 'garud-flat.jpg',
  },
  {
    id: 'marcos', n: '03', name: 'MARCOS', field: 'Coast and current', colour: 'Deep navy',
    line: 'Let the route change.',
    story: 'A compass gives you direction. Water reminds you that plans move. MARCOS puts the two together for coast roads, salt air and monsoon detours, in deep navy with the ADRENL mark at the chest.',
    why: 'A different mood from the mountain tees. It rounds out Batch 01 with a water story and gives navy people a place to start.',
    print: 'Waves and compass, large back graphic',
    coords: '15.2993° N / 74.1240° E', alt: '0 M',
    bg: '#0a1426', accent: '#7fb6ee', views: v('marcos'), flat: 'marcos-flat.jpg',
  },
];

export const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export const SPECS = [
  { k: 'Fabric', v: 'Heavyweight cotton jersey', note: 'Target 240 GSM. Confirmed on the final sample before the drop.' },
  { k: 'Make', v: 'Combed, pre-shrunk, bio-washed', note: 'Planned specification. Made in Tiruppur, India.' },
  { k: 'Print', v: 'DTF graphics, front and back', note: 'Small ADRENL mark on the chest, large graphic on the back.' },
  { k: 'Fit', v: 'Relaxed, boxy, drop shoulder', note: 'Measured size chart is published once the sample is measured.' },
  { k: 'Hem', v: 'Twin-needle finish', note: 'Planned specification.' },
  { k: 'Batch', v: 'Batch 01 only', note: 'Small run. Preorder, not a stock promise.' },
];

export const FAQ = [
  { q: 'What does preorder mean here?', a: 'Batch 01 is made after the drop opens, not pulled from a warehouse. We say so up front instead of pretending stock exists. Dispatch dates are confirmed before the drop.' },
  { q: 'What is the price, and what happens next batch?', a: 'Batch 01 price is Rs 799. The next batch is planned at Rs 999. Nothing is crossed out and no fake discount is shown: Rs 799 is simply the price for the first run.' },
  { q: 'What if the size is wrong?', a: 'One free size exchange within 7 days of delivery. Exchange details are confirmed before the drop.' },
  { q: 'Are those the real tees?', a: 'Not yet. The pictures are design previews that show the intended fit, colours and graphics. Photos of the finished tees replace them once the sample is made.' },
  { q: 'How heavy is the fabric?', a: 'The target is 240 GSM. We will confirm the number on the final sample and publish it here.' },
  { q: 'How do I pay?', a: 'Checkout opens with the drop on 31 October 2026. Payment options are confirmed then. This preview takes no orders and no money.' },
];

export type Quote = { text: string; name: string; context?: string };
// Real words only. Add a quote here once the person has said yes to it being published.
export const QUOTES: Quote[] = [];
