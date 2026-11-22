import { DESIGNS } from './data';

/**
 * The design lab (/lab): every tee we are weighing up, shown on a person, so the founder can pick what to make next.
 * Private: not linked from the site, noindex, kept out of robots and the sitemap.
 *
 * To add a design: put its pictures in public/img/lab/<id>/ (model cut-outs 512 x 1024, transparent, like the shop's),
 * add an entry below with status 'test', and it shows up. `show: false` takes a design off the page without deleting it.
 */
export type LabStatus = 'site' | 'test' | 'idea' | 'guest';
/** Which line a design belongs to: big full prints, a single line on black, or what is on sale now. */
export type LabRange = 'bold' | 'minimal' | 'batch01' | 'guest';
export type LabShot = { label: string; src: string };
/** A picture beside the story: flat lay, print plate, the design picture. `bg` puts a print made for a dark tee on a tile. */
export type LabRef = { src: string; w: number; h: number; label: string; bg?: string };
export type LabDesign = {
  id: string;
  name: string;
  colour: string;
  swatch: string;
  field: string;
  /** The tee's own motto, one line. */
  line: string;
  story: string;
  print: string;
  status: LabStatus;
  show: boolean;
  /** On a person: back first, then front and side, as in the shop. Paths under public/img. */
  shots: LabShot[];
  /** At most two: the first sits in the narrow column, the second in the wide one. */
  refs: LabRef[];
  /** What we want to learn from this one. */
  note?: string;
  range: LabRange;
  /** A sister design on the same idea in the other line, shown side by side in the full view (WAKE and BARREL). */
  pair?: { id: string; label: string };
};

/** The lines, in the order the lab shows them (founder, 2026-11-21). */
export const LAB_RANGES: { id: LabRange; name: string; blurb: string }[] = [
  { id: 'bold', name: 'Bold', blurb: 'Big prints, the whole back, colour that shows from across the street.' },
  { id: 'minimal', name: 'Minimal', blurb: 'One line on black. Quiet until someone looks closer.' },
  { id: 'batch01', name: 'Batch 01', blurb: 'RIDGE, GARUD and MARCOS: on sale now.' },
  // Another brand's design, credited, kept as a benchmark to compare ours against (founder's call, 2026-11-22).
  { id: 'guest', name: 'Guest', blurb: 'A friend\u2019s brand, here to compare.' },
];

export const LAB_STATUS: Record<LabStatus, string> = {
  site: 'On the site · Batch 01',
  test: 'In test',
  idea: 'Idea',
  guest: 'Guest design',
};

/** The short label on each card in the compare strip. */
export const LAB_BADGE: Record<LabStatus, string> = {
  site: 'Batch 01',
  test: 'New',
  idea: 'Idea',
  guest: 'Guest',
};

export const LAB_COPY = {
  eyebrow: 'ADRENL design lab',
  title: 'Adrenaline, worn.',
  motto: 'Hills, land, air and sea.',
  intro: 'Every design here is shown on a person first, so we see how it really looks before we make it. Open any design and tap the heart if you would wear it: that is how we decide what to make.',
};

/** Batch 01 comes straight from the shop's own data, so the lab never drifts from what is on sale. */
const batch01: LabDesign[] = DESIGNS.map((d) => ({
  id: d.id,
  name: d.name,
  colour: d.colour,
  swatch: d.swatch,
  field: d.field,
  line: d.line,
  story: d.story,
  print: d.print,
  status: 'site',
  show: true,
  range: 'batch01',
  shots: d.shots.map((s) => ({ label: s.label, src: s.cut })),
  refs: [
    { src: d.flat, w: 1100, h: 1375, label: 'Flat lay' },
    { src: d.art.ink, w: d.art.w, h: d.art.h, label: d.print },
  ],
}));

/**
 * New designs. Pictures on a person come from backend/scripts/lab_mockup.py (no GPU) until the AI try-on has a run;
 * the design picture as sent, and the prints alone, are kept in backend/designs/<id>/.
 */
// Public wording (the lab is shared from 2026-11-21): no laptops, model names or GPUs.
const MOCKUP = 'A preview: the print is placed on a photo, so it stays flat where real cloth would fold. Photos of the real tee come before it goes on sale.';

const tests: LabDesign[] = [
  {
    // 2026-11-21. Working name; the founder called it "skydiving".
    id: 'freefall', name: 'FREEFALL', colour: 'Black', swatch: '#1d1d1d', field: 'Open air',
    line: 'Leave a trail.',
    story: 'Ten thousand feet, the door open, one step out. FREEFALL is the minute after it: arms wide, the wind loud, a red trail tearing through the clouds behind you. On the front, only ADRENL, raised in the tee’s own black, and the trail coming off the shoulder.',
    print: 'Skydiver in freefall, red trail, clouds',
    status: 'test', show: true, range: 'bold',
    shots: [{ label: 'Back', src: 'lab/freefall/back.webp' }, { label: 'Front', src: 'lab/freefall/front.webp' }],
    refs: [
      { src: 'lab/freefall/back-print.webp', w: 342, h: 524, label: 'Back print: white line art, red trail', bg: '#151515' },
      { src: 'lab/freefall/flat.jpg', w: 1024, h: 708, label: 'The design, front and back' },
    ],
    note: MOCKUP,
  },
  {
    // 2026-11-21. Working name; the founder called it "car drifting".
    id: 'drift', name: 'DRIFT', colour: 'Black', swatch: '#1d1d1d', field: 'Tarmac',
    line: 'Lose the grip. Keep the line.',
    story: 'The back steps out, the wheel goes the other way, and for a second the car is flying sideways through its own smoke. DRIFT is that second: tyre lines burnt into the road, sparks, a flame from the exhaust. On the front, only ADRENL, raised in the tee’s own black, and the tyre lines curling up from the hem.',
    print: 'Drifting car, tyre lines, smoke and flame',
    status: 'test', show: true, range: 'bold',
    shots: [{ label: 'Back', src: 'lab/drift/back.webp' }, { label: 'Front', src: 'lab/drift/front.webp' }],
    refs: [
      { src: 'lab/drift/back-print.webp', w: 350, h: 515, label: 'Back print: car, smoke, tyre lines', bg: '#151515' },
      { src: 'lab/drift/flat.jpg', w: 1024, h: 708, label: 'The design, front and back' },
    ],
    note: MOCKUP,
  },
  {
    // 2026-11-21. Working name: a rider on a wakeboard, towed, cutting through spray.
    id: 'wake', name: 'WAKE', colour: 'Black', swatch: '#1d1d1d', field: 'Open water',
    line: 'Hold on. Lean back.',
    story: 'A rope, a board and a boat that will not slow down. WAKE is the moment you cut across your own spray and the sea goes white behind you. Only white on black; on the front, ADRENL raised in the tee’s own black and a wave rising from the hem.',
    print: 'Wakeboarder in spray, rising wave',
    status: 'test', show: true, range: 'minimal', pair: { id: 'barrel', label: 'The sea, two ways' },
    shots: [{ label: 'Back', src: 'lab/wake/back.webp' }, { label: 'Front', src: 'lab/wake/front.webp' }],
    refs: [
      { src: 'lab/wake/back-print.webp', w: 332, h: 235, label: 'Back print: rider and spray', bg: '#151515' },
      { src: 'lab/wake/flat.jpg', w: 1024, h: 700, label: 'The design, front and back' },
    ],
    note: MOCKUP,
  },
  {
    // 2026-11-21. Working name: a wingsuit flyer between cliffs.
    id: 'glide', name: 'GLIDE', colour: 'Black', swatch: '#1d1d1d', field: 'Between cliffs',
    line: 'Fly the gap.',
    story: 'Arms out, the suit fills, and the rock walls rush past a few metres away. GLIDE is that flight down the gap, held up by nothing but air. Dark on dark: grey rock, a silver line of wind, and on the front ADRENL raised in black with the same silver line coming over the shoulder.',
    print: 'Wingsuit flyer between cliffs, silver ribbon',
    status: 'test', show: true, range: 'bold',
    shots: [{ label: 'Back', src: 'lab/glide/back.webp' }, { label: 'Front', src: 'lab/glide/front.webp' }],
    refs: [
      { src: 'lab/glide/back-print.webp', w: 345, h: 506, label: 'Back print: flyer, cliffs, silver ribbon', bg: '#151515' },
      { src: 'lab/glide/flat.jpg', w: 1024, h: 690, label: 'The design, front and back' },
    ],
    note: MOCKUP,
  },
  {
    // 2026-11-21. Working name: an off-road buggy at the top of a white ridge line.
    id: 'climb', name: 'CLIMB', colour: 'Black', swatch: '#1d1d1d', field: 'Off road',
    line: 'Take the line up.',
    story: 'No road, just a white crest and a machine that wants the top of it. CLIMB is the moment the wheels bite and the line goes up. Almost nothing on it: one white ridge and the buggy at its top; on the front, ADRENL raised in black and a thin trail from the hem with a single marker, like a route on a map.',
    print: 'Buggy on a white ridge line, trail with a marker',
    status: 'test', show: true, range: 'minimal',
    shots: [{ label: 'Back', src: 'lab/climb/back.webp' }, { label: 'Front', src: 'lab/climb/front.webp' }],
    refs: [
      { src: 'lab/climb/back-print.webp', w: 318, h: 197, label: 'Back print: buggy and ridge line', bg: '#151515' },
      { src: 'lab/climb/flat.jpg', w: 1024, h: 645, label: 'The design, front and back' },
    ],
    note: MOCKUP,
  },
  {
    // 2026-11-21. Working name: a skater grinding the lip of a bowl.
    id: 'carve', name: 'CARVE', colour: 'Black', swatch: '#1d1d1d', field: 'Concrete',
    line: 'Drop in.',
    story: 'Down one wall, up the other, a grind along the lip and back in before you can think about it. CARVE is that line around the bowl. White and grey on black; on the front, ADRENL raised in black and one brushed curve of the bowl at the hem.',
    print: 'Skater on the lip of a bowl, carve line',
    status: 'test', show: true, range: 'minimal',
    shots: [{ label: 'Back', src: 'lab/carve/back.webp' }, { label: 'Front', src: 'lab/carve/front.webp' }],
    refs: [
      { src: 'lab/carve/back-print.webp', w: 282, h: 240, label: 'Back print: skater, bowl, carve line', bg: '#151515' },
      { src: 'lab/carve/flat.jpg', w: 1024, h: 690, label: 'The design, front and back' },
    ],
    note: MOCKUP,
  },
  {
    // 2026-11-21. Working name: a snowboarder down a steep face.
    id: 'powder', name: 'POWDER', colour: 'Black', swatch: '#1d1d1d', field: 'Snow',
    line: 'First tracks.',
    story: 'The slope drops away, the board finds the fall line and the snow explodes off every turn. POWDER is first tracks on a face nobody has touched yet. White and grey on black with one orange line through it; on the front, ADRENL raised in black and the slope rising from the hem.',
    print: 'Snowboarder in spray, mountain face, orange line',
    status: 'test', show: true, range: 'bold',
    shots: [{ label: 'Back', src: 'lab/powder/back.webp' }, { label: 'Front', src: 'lab/powder/front.webp' }],
    refs: [
      { src: 'lab/powder/back-print.webp', w: 342, h: 510, label: 'Back print: rider, snow, orange line', bg: '#151515' },
      { src: 'lab/powder/flat.jpg', w: 1024, h: 708, label: 'The design, front and back' },
    ],
    note: MOCKUP,
  },
  {
    // 2026-11-21. Working name: a freediver head down through a swirl of water.
    id: 'dive', name: 'DIVE', colour: 'Black', swatch: '#1d1d1d', field: 'Deep water',
    line: 'One breath.',
    story: 'One breath, then down, fins together, into blue that gets darker every metre. DIVE is the quiet kind of adrenaline. A turquoise swirl and a diver on black; on the front, ADRENL raised in black and the water falling from the shoulder to the hem.',
    print: 'Freediver in a turquoise swirl, bubbles',
    status: 'test', show: true, range: 'bold',
    shots: [{ label: 'Back', src: 'lab/dive/back.webp' }, { label: 'Front', src: 'lab/dive/front.webp' }],
    refs: [
      { src: 'lab/dive/back-print.webp', w: 305, h: 498, label: 'Back print: diver and swirl', bg: '#151515' },
      { src: 'lab/dive/flat.jpg', w: 1024, h: 708, label: 'The design, front and back' },
    ],
    note: MOCKUP,
  },
  {
    // 2026-11-21. Working name: a motorbike rider knee-down in a corner.
    id: 'apex', name: 'APEX', colour: 'Black', swatch: '#1d1d1d', field: 'Race track',
    line: 'Knee down.',
    story: 'Brake late, tip in, knee on the tarmac and the bike leaning further than feels possible. APEX is the middle of the corner, sparks behind you and the exit already in sight. On the front, ADRENL raised in black and a sweep of light and sparks.',
    print: 'Rider leaning into a corner, sparks, light trails',
    status: 'test', show: true, range: 'bold',
    shots: [{ label: 'Back', src: 'lab/apex/back.webp' }, { label: 'Front', src: 'lab/apex/front.webp' }],
    refs: [
      { src: 'lab/apex/back-print.webp', w: 335, h: 356, label: 'Back print: rider, sparks, light trails', bg: '#151515' },
      { src: 'lab/apex/flat.jpg', w: 1024, h: 708, label: 'The design, front and back' },
    ],
    note: MOCKUP,
  },
  {
    // 2026-11-21. Working name: a climber with a head torch on an ice face.
    id: 'icefall', name: 'ICEFALL', colour: 'Black', swatch: '#1d1d1d', field: 'Ice',
    line: 'One more pitch.',
    story: 'Head torch on, axe in, a wall of ice above and only the rope behind you. ICEFALL is the climb before sunrise. On the front, ADRENL raised in black and an ice axe bitten into the ice, its rope running up over the shoulder.',
    print: 'Climber on an ice face, head torch, ice axe and rope',
    status: 'test', show: true, range: 'bold',
    shots: [{ label: 'Back', src: 'lab/icefall/back.webp' }, { label: 'Front', src: 'lab/icefall/front.webp' }],
    refs: [
      { src: 'lab/icefall/back-print.webp', w: 188, h: 572, label: 'Back print: climber and ice face', bg: '#151515' },
      { src: 'lab/icefall/flat.jpg', w: 1024, h: 708, label: 'The design, front and back' },
    ],
    note: MOCKUP,
  },
  {
    // 2026-11-21. Working name: a surfer in the barrel of a wave, the wave wrapping round the left sleeve. WAKE's sea, bolder.
    id: 'barrel', name: 'BARREL', colour: 'Black', swatch: '#1d1d1d', field: 'Surf',
    line: 'Ride it out.',
    story: 'The wave stands up, throws over, and for a few seconds you are inside it with the light at the end of the tube. BARREL is that ride, and the wave does not stop at the back: it carries on round the left sleeve. On the front, only ADRENL raised in black and the wave coming round the sleeve.',
    print: 'Surfer in a breaking wave, wave round the left sleeve',
    status: 'test', show: true, range: 'bold', pair: { id: 'wake', label: 'The sea, two ways' },
    shots: [{ label: 'Back', src: 'lab/barrel/back.webp' }, { label: 'Front', src: 'lab/barrel/front.webp' }],
    refs: [
      { src: 'lab/barrel/back-print.webp', w: 301, h: 350, label: 'Back print: surfer in the barrel', bg: '#151515' },
      { src: 'lab/barrel/flat.jpg', w: 1024, h: 700, label: 'The design, front and back' },
    ],
    note: MOCKUP,
  },
  {
    // 2026-11-22. Drawn by Claude (backend/scripts/art_pulse_ink.py), the founder's yes to add it to Minimal: the heart rate
    // of one jump as a brush-ink mountain range. An earlier PULSE drawn as an instrument strip was turned down as "a
    // designer view, not art".
    id: 'pulse', name: 'PULSE', colour: 'Black', swatch: '#1d1d1d', field: 'Every jump',
    line: 'Every peak is a heartbeat.',
    story: 'Calm foothills, a climb, one summit the second the door opens, then racing peaks and the long way down: the heart rate of one jump, painted as a mountain range in dry-brush ink. The summit catches the sunrise as it breaks through the sun, and an ADRENL seal signs it. On the front, ADRENL raised in black with a small brush heartbeat under it.',
    print: 'Heartbeat as a brush-ink mountain range, orange sun, seal',
    status: 'test', show: true, range: 'minimal',
    shots: [{ label: 'Back', src: 'lab/pulse/back.webp' }, { label: 'Front', src: 'lab/pulse/front.webp' }],
    refs: [
      { src: 'lab/pulse/back-print.webp', w: 900, h: 658, label: 'Back print: the heartbeat range', bg: '#151515' },
      { src: 'lab/pulse/flat.jpg', w: 1400, h: 758, label: 'The artwork, back and front' },
    ],
    note: MOCKUP,
  },
  {
    // 2026-11-22. Not ADRENL's: Dead Bear's bear tee, a friend's brand, shown credited as a benchmark (founder's call). Their
    // print lifted from their product photo (backend/designs/_refs/) and placed on our model, so it is compared like ours.
    id: 'deadbear', name: 'BEAR', colour: 'Charcoal', swatch: '#2b2a28', field: 'Guest \u00b7 Dead Bear',
    line: 'A friend\u2019s design, here to compare.',
    story: 'Not an ADRENL tee: this one is by Dead Bear, a friend\u2019s brand, shown here so we can see how our designs compare with it. A bear\u2019s head drawn only as an outline of fur that glows, with nothing inside it.',
    print: 'Bear head as a glowing fur outline, by Dead Bear',
    status: 'guest', show: true, range: 'guest',
    shots: [{ label: 'Back', src: 'lab/deadbear/back.webp' }],
    refs: [{ src: 'lab/deadbear/photo.jpg', w: 894, h: 1200, label: 'Their photo \u00b7 Dead Bear' }],
    note: 'Design and photo by Dead Bear. On our model the print is placed on a photo, so every design here is seen the same way.',
  },
];

/** Grouped by line (Bold, Minimal, Batch 01), each in the order it came in. BARREL ends Bold and WAKE starts Minimal, so the
 * sea pair sits side by side under All. */
export const LAB: LabDesign[] = LAB_RANGES.flatMap((r) => [...tests, ...batch01].filter((d) => d.range === r.id));
