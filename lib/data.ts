export const SITE = {
  name: 'ADRENL',
  url: 'https://adrenl.com',
  dropISO: '2026-10-31T00:00:00+05:30',
  dropLabel: '31 October 2026',
  dropShort: '31 Oct',
  price: 799,
  nextPrice: 999,
  currency: 'INR',
  made: 'Tiruppur, India',
};

/**
 * Hero films, one per route. Each visit plays the next one in turn (the choice is remembered in the browser).
 * `mobile` is a portrait (9:16) cut for phones, `desktop` a landscape (16:9) cut. Make new ones with
 * scripts/prep-film.sh. Leave the list empty and the hero shows the drawn dawn-ridge scene instead.
 */
/** `credit` is for our records only; Pexels does not require attribution, so it is not shown on the site. */
export type Film = { route: number; desktop: string; mobile: string; posterDesktop: string; posterMobile: string; credit: string };
const film = (id: string, route: number, credit: string): Film => ({
  route, credit,
  desktop: `/video/${id}-16x9.mp4`, mobile: `/video/${id}-9x16.mp4`,
  posterDesktop: `/video/${id}-16x9.jpg`, posterMobile: `/video/${id}-9x16.jpg`,
});
export const HERO_FILMS: Film[] = [
  film('ridge', 0, 'Vijay Kothare on Pexels'),
  film('garud', 1, 'Sanjiv Joshi on Pexels'),
  film('marcos', 2, 'Mike Art on Pexels'),
];

/** Brand copy. Voice first; exact specs live in DETAILS and the FAQ. */
export const COPY = {
  hero: {
    eyebrow: 'Batch 01 · Opens 31 October',
    lead: 'Tees for the ride before sunrise, the climb after the turn and the detour you never planned.',
    cta: 'Preorder Batch 01',
    link: 'Why we exist',
  },
  story: {
    eyebrow: 'Why ADRENL',
    lines: ['Cold starts.', 'Wrong turns.', 'One more hill.'],
    body: 'Some people chase the finish. We are here for everything before it: the alarm you hated, the tarmac that turned to gravel, the friend who said one more. ADRENL is what you pull on when the plan changes and you go anyway.',
    sign: 'Adrenaline, worn.',
  },
  routes: {
    eyebrow: 'Batch 01',
    title: 'Three routes out of town.',
    cta: 'Take this route',
  },
  shop: {
    eyebrow: 'Preorder · Opens 31 October 2026',
    title: 'Pick your route.',
  },
  build: {
    eyebrow: 'The tee',
    title: 'Built to be worn out.',
    sub: 'We made the tee we kept reaching for on long weekends, then made it sturdier. One cut, nothing fussy, nothing you have to baby.',
    facts: [
      { h: 'Holds its shape', p: 'Thick, soft cotton that still looks right after a hundred washes and a few bad decisions.' },
      { h: 'Cut to move', p: 'Boxy body, dropped shoulder. It falls straight from the shoulder instead of clinging.' },
      { h: 'Front and back', p: 'A small mark on the chest. The whole route across your back.' },
      { h: 'Made in Tiruppur', p: 'Cut, sewn and printed in India in one small run. No warehouse, no leftovers.' },
    ],
  },
  drop: {
    eyebrow: 'The drop',
    title: 'Batch 01 opens',
    titleEm: '31 October.',
    note: 'Put the date in your calendar so it does not sneak past you.',
  },
  foot: {
    title: 'Still here?',
    titleEm: 'Take the long way.',
  },
};

export type ViewKey = 'back' | 'front' | 'side';
export type Shot = { key: ViewKey; label: string; photo: string; cut: string; png: string };

export type Design = {
  id: 'ridge' | 'garud' | 'marcos';
  roman: string;
  name: string;
  field: string;
  colour: string;
  swatch: string;
  line: string;
  story: string;
  print: string;
  coords: string;
  alt: string;
  /** Section tint while this route is on screen. */
  paper: string;
  tint: string;
  /** Back first: the back print is what tells the three apart. */
  shots: Shot[];
  flat: string;
  art: { file: string; ink: string; w: number; h: number };
};

const shots = (id: string): Shot[] =>
  (['back', 'front', 'side'] as ViewKey[]).map((k) => ({
    key: k, label: k[0].toUpperCase() + k.slice(1), photo: `${id}-${k}-photo.webp`, cut: `${id}-${k}-model.webp`, png: `${id}-${k}-model.png`,
  }));

export const DESIGNS: Design[] = [
  {
    id: 'ridge', roman: 'I', name: 'RIDGE', field: 'High altitude', colour: 'Black', swatch: '#1d1d1d',
    line: 'The climb stays with you.',
    story: 'A contour line is a quiet record of effort. Every turn is another stretch of trail, another view earned on foot. RIDGE puts the mountain on your back and keeps the front calm.',
    print: 'Layered mountain contours',
    coords: '32.2396° N, 77.1887° E', alt: '3,450 m',
    paper: '#f2eee6', tint: '#1a1713',
    shots: shots('ridge'), flat: 'ridge-flat.jpg',
    art: { file: 'ridge-art.png', ink: 'ridge-art-ink.png', w: 600, h: 230 },
  },
  {
    id: 'garud', roman: 'II', name: 'GARUD', field: 'Open sky', colour: 'Black', swatch: '#1d1d1d',
    line: 'Take the open road.',
    story: 'An eagle with its wings thrown wide, drawn as freedom rather than rank. GARUD is the energy of a long ride: the next bend, the empty stretch, a sky that keeps getting bigger.',
    print: 'Mythic eagle with sun rays',
    coords: '34.1526° N, 77.5771° E', alt: '3,500 m',
    paper: '#f1e9de', tint: '#a4472a',
    shots: shots('garud'), flat: 'garud-flat.jpg',
    art: { file: 'garud-art.png', ink: 'garud-art-ink.png', w: 560, h: 490 },
  },
  {
    id: 'marcos', roman: 'III', name: 'MARCOS', field: 'Coast and current', colour: 'Deep navy', swatch: '#1c2846',
    line: 'Let the route change.',
    story: 'A compass gives you direction. Water reminds you that plans move. MARCOS puts the two together for coast roads, salt air and monsoon detours, in deep navy.',
    print: 'Compass rose over breaking waves',
    coords: '15.2993° N, 74.1240° E', alt: 'Sea level',
    paper: '#e8ebec', tint: '#1f3a63',
    shots: shots('marcos'), flat: 'marcos-flat.jpg',
    art: { file: 'marcos-art.png', ink: 'marcos-art-ink.png', w: 580, h: 360 },
  },
];

export const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

/** The exact product facts. Shown once, in the shop's Details panel. */
export const DETAILS = [
  { k: 'Cotton', v: 'Thick cotton jersey, combed, pre-shrunk and bio-washed. Target 240 GSM, confirmed on the final sample before the drop.' },
  { k: 'Cut', v: 'Relaxed and boxy with a dropped shoulder. The measured size chart is published once the sample is measured.' },
  { k: 'Print', v: 'Small ADRENL mark on the chest, large graphic across the back. DTF print, twin-needle hem.' },
  { k: 'Made', v: 'Sewn and printed in Tiruppur, India. Batch 01 is a single small run.' },
  { k: 'Exchange', v: 'One free size exchange within 7 days of delivery.' },
];

export const FAQ = [
  { q: 'What does preorder mean here?', a: 'Batch 01 is made after the drop opens, not pulled from a warehouse. We say so up front instead of pretending stock exists. Dispatch dates are confirmed before the drop.' },
  { q: 'What is the price, and what happens next batch?', a: 'Batch 01 is Rs 799. The next batch is planned at Rs 999. Nothing is crossed out and no fake discount is shown: Rs 799 is simply the price for the first run.' },
  { q: 'What if the size is wrong?', a: 'One free size exchange within 7 days of delivery. Exchange details are confirmed before the drop.' },
  { q: 'Are those the real tees?', a: 'Not yet. The pictures are design previews that show the intended fit, colours and graphics. Photos of the finished tees replace them once the sample is made.' },
  { q: 'How thick is the fabric?', a: 'The target is 240 GSM, which is on the heavy side for a tee. We confirm the number on the final sample and publish it here.' },
  { q: 'How do I pay?', a: 'Checkout opens with the drop on 31 October 2026. Payment options are confirmed then. This preview takes no orders and no money.' },
];

export type Quote = { text: string; name: string; context?: string };
// Real words only. Add a quote here once the person has said yes to it being published. The section stays hidden while this is empty.
export const QUOTES: Quote[] = [];
