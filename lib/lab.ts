import { DESIGNS } from './data';

/**
 * The design lab (/lab): every tee we are weighing up, shown on a person, so the founder can pick what to make next.
 * Private: not linked from the site, noindex, kept out of robots and the sitemap.
 *
 * To add a design: put its pictures in public/img/lab/<id>/ (model cut-outs 512 x 1024, transparent, like the shop's),
 * add an entry below with status 'test', and it shows up. `show: false` takes a design off the page without deleting it.
 */
export type LabStatus = 'site' | 'test' | 'idea' | 'guest';
/** Which line a design belongs to: big full prints, a single line on black, what is on sale now, the second batch, or a guest. */
export type LabRange = 'bold' | 'minimal' | 'batch01' | 'batch02' | 'guest';
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
  // 2026-11-23, the founder: a new batch after the others. The hunter and the hunted, art where the eye goes, dark around it.
  { id: 'batch02', name: 'Batch 02', blurb: 'The hunter and the hunted. Drawn in full where you look, dark everywhere else.' },
  // Another brand's design, credited, kept as a benchmark to compare ours against (founder's call, 2026-11-22).
  { id: 'guest', name: 'Guest', blurb: 'Friends\u2019 brands, here to compare.' },
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
    // 2026-11-22. The founder's CHASE: one hunt wrapped round the tee. The deer was lowered 37 px on the back so its body meets
    // the front's at the same height at the wearer's right side seam (backend/scripts/lab_mockup.py, 'chase').
    id: 'chase', name: 'CHASE', colour: 'Black', swatch: '#1d1d1d', field: 'Jungle',
    line: 'Don\u2019t look back.',
    story: 'A tiger launches off your back. The deer it wants runs round your right side and bursts out across your chest, antlers up, eye red with fear. CHASE wraps one hunt round the whole tee: the back and the front are one picture, and the deer\u2019s body meets itself at the side seam.',
    print: 'Tiger chasing a deer, wrapping from back to front',
    status: 'test', show: true, range: 'bold',
    shots: [{ label: 'Back', src: 'lab/chase/back.webp' }, { label: 'Front', src: 'lab/chase/front.webp' }],
    refs: [
      { src: 'lab/chase/wrap.jpg', w: 1486, h: 960, label: 'The hunt unrolled: back and front meet at your right side' },
      { src: 'lab/chase/flat.jpg', w: 1024, h: 700, label: 'The design, front and back' },
    ],
    note: MOCKUP,
  },
  {
    // 2026-11-22. The founder's FERAL: a wolf on the front, a lynx on the back, their fur breaking into shards that meet at
    // the wearer's left side seam (backend/scripts/lab_mockup.py, 'feral'). Both live in the high Himalaya (Ladakh, Spiti).
    id: 'feral', name: 'FERAL', colour: 'Black', swatch: '#1d1d1d', field: 'Himalaya',
    line: 'Never tamed.',
    story: 'A wolf on your chest, a lynx on your back, both with their teeth out. The two hunters of the high Himalaya, from Ladakh to Spiti. Their fur breaks into shards that fly round your left side and meet, so the front and the back are one fight. FERAL is the part of you nobody trained.',
    print: 'Wolf on the front, lynx on the back, shards round the left side',
    status: 'test', show: true, range: 'bold',
    shots: [{ label: 'Back', src: 'lab/feral/back.webp' }, { label: 'Front', src: 'lab/feral/front.webp' }],
    refs: [
      { src: 'lab/feral/wrap.jpg', w: 1452, h: 790, label: 'Unrolled: wolf and lynx meet at your left side' },
      { src: 'lab/feral/flat.jpg', w: 1024, h: 700, label: 'The design, front and back' },
    ],
    note: MOCKUP,
  },
  {
    // 2026-11-25. The founder's design (backend/designs/slipstream), lifted onto the model (lab_mockup.py 'slipstream'). Named
    // by Claude: the swoosh reads as the air a racer leaves behind. Before BARREL, so BARREL and WAKE stay side by side.
    id: 'slipstream', name: 'SLIPSTREAM', colour: 'Black', swatch: '#1d1d1d', field: 'Speed',
    line: 'Sport. Train. Race. Repeat.',
    story: 'One brushstroke of white, fast enough to bend the air. On the front it rises from the hem across your body to the shoulder; on the back it loops into a big S round a lime star, framed like a frame of race footage, ADRENL across the top, sport, train, race, repeat in the corner.',
    print: 'A white brush swoosh and a lime star; on the back an S-curve, corner frames and type',
    status: 'test', show: true, range: 'bold',
    shots: [{ label: 'Back', src: 'lab/slipstream/back.webp' }, { label: 'Front', src: 'lab/slipstream/front.webp' }],
    refs: [
      { src: 'lab/slipstream/back-print.webp', w: 784, h: 980, label: 'The back print', bg: '#151515' },
      { src: 'lab/slipstream/flat.jpg', w: 1133, h: 746, label: 'The design, front and back' },
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
    // 2026-11-22, round 4 (rounds 1-3 were drawn in code and turned down). The founder's Gemini bat, inked by Claude
    // (backend/scripts/echo4.py): wings from the shoulders down both sleeves, so it opens when the arms go out; orange eyes.
    id: 'echo', name: 'ECHO', colour: 'Black', swatch: '#1d1d1d', field: 'Night',
    line: 'Own the dark.',
    story: 'A bat sits between your shoulders, eyes burning orange, and its wings run down both your arms. Arms down, it folds round you. Arms out, it opens to its full span, sleeve to sleeve, sparks flying off one wing. Drawn like an old etching, in white ink on black. On the front, only ADRENL raised in black.',
    print: 'Etched bat across the back and down both sleeves, orange eyes and sparks',
    status: 'test', show: true, range: 'minimal',
    shots: [
      { label: 'Back', src: 'lab/echo/back.webp' },
      { label: 'Front', src: 'lab/echo/front.webp' },
      { label: 'Arms out', src: 'lab/echo/arms.webp' },
    ],
    refs: [
      { src: 'lab/echo/arms-out.jpg', w: 1400, h: 962, label: 'Arms out: the wings open, sleeve to sleeve' },
      { src: 'lab/echo/print.jpg', w: 1400, h: 814, label: 'Back print, about 60 cm across; each sleeve carries a wing' },
    ],
    note: MOCKUP,
  },
  {
    // 2026-11-25. Drawn here, no GPU (backend/scripts/hem_graphic.py): a print that rises from the hem (the founder's brief,
    // after a sprayed-flames reference), in terrain, which code draws truthfully.
    id: 'ascent', name: 'ASCENT', colour: 'Black', swatch: '#1d1d1d', field: 'Altitude',
    line: 'First light is earned.',
    story: 'Ridges climb up from your hem, one behind the other, each paler in the haze. The highest catches the first light of the day, snow in its gullies, and one climber stands on top of it with his axe in the air: the moment all of it was for. On the front, only the lowest ridges, at the hem.',
    print: 'Mountain ridges rising from the hem in mist; the summit in first light, a climber on top',
    status: 'test', show: true, range: 'minimal',
    shots: [{ label: 'Back', src: 'lab/ascent/back.webp' }, { label: 'Front', src: 'lab/ascent/front.webp' }],
    refs: [
      { src: 'lab/ascent/back-print.webp', w: 900, h: 1006, label: 'The back print', bg: '#151515' },
      { src: 'lab/ascent/wrap.jpg', w: 1400, h: 1172, label: 'Back and front' },
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
  {
    // 2026-11-22. Not ADRENL's: a friend's CLIMB tee, shown credited as a benchmark (founder's call: "my friend's"). The label's
    // name was not given yet; add it to field, story, print, refs and note when it is. Print lifted from their product photo.
    id: 'climb-guest', name: 'CLIMB', colour: 'Black', swatch: '#1d1d1d', field: 'Guest · a friend’s label',
    line: 'A friend’s design, here to compare.',
    story: 'Not an ADRENL tee: this one is by a friend’s label, shown here so we can see how our designs compare with it. A climber hanging off the rock, cut out of a square of white smoke, over the word CLIMB spaced wide.',
    print: 'Climber in a square of smoke, by a friend’s label',
    status: 'guest', show: true, range: 'guest',
    shots: [{ label: 'Front', src: 'lab/climb-guest/front.webp' }],
    refs: [{ src: 'lab/climb-guest/photo.jpg', w: 900, h: 900, label: 'Their photo' }],
    note: 'Design and photo by a friend’s label. On our model the print is placed on a photo, so every design here is seen the same way.',
  },
];

/**
 * Batch 02 (2026-11-23), designed by Claude without a GPU (backend/scripts/batch02_art.py): the shapes come from pictures made
 * on our own GPU with open models (FLUX.2 klein 4B, Z-Image-Turbo; Apache-2.0); the art is drawn in full only where the eye
 * goes and fades into the tee's black, with the hunter and the hunted top and bottom (the founder's notes, 2026-11-23).
 * N°04-06 (CORNICE, COLD BLOOD, STRIKE) redone the same way on 2026-11-23.
 */
const batch02: LabDesign[] = [
  {
    id: 'stoop', name: 'STOOP', colour: 'Black', swatch: '#1d1d1d', field: 'Open sky',
    line: 'Fastest thing alive.',
    story: 'A peregrine falcon folds its wings and drops out of the sky head first, the fastest animal on earth. It is drawn in full only at its head and amber eye; its wings dissolve into the dark as they rise. Far below, across empty black, a small bird it has not reached yet. On your chest, one feather.',
    print: 'Peregrine falcon diving at a small bird far below; a feather on the chest',
    status: 'test', show: true, range: 'batch02',
    shots: [{ label: 'Back', src: 'lab/stoop/back.webp' }, { label: 'Front', src: 'lab/stoop/front.webp' }],
    refs: [
      { src: 'lab/stoop/back-print.webp', w: 900, h: 1538, label: 'The back print', bg: '#151515' },
      { src: 'lab/stoop/wrap.jpg', w: 1400, h: 1172, label: 'Front and back' },
    ],
    note: MOCKUP,
  },
  {
    id: 'nighthunt', name: 'NIGHT HUNT', colour: 'Black', swatch: '#1d1d1d', field: 'Night',
    line: 'One against all.',
    story: 'They came to hunt it. On your back a black panther steps out of the dark, only its pale eyes and whiskers lit, and all round it, a metre or two off, red eyes watch through the grass from every side. On your front, more of them, scattered: they are round you too.',
    print: 'A big cat\u2019s face in the dark, surrounded by red eyes; red eyes scattered on the front',
    status: 'test', show: true, range: 'batch02',
    shots: [{ label: 'Back', src: 'lab/nighthunt/back.webp' }, { label: 'Front', src: 'lab/nighthunt/front.webp' }],
    refs: [
      { src: 'lab/nighthunt/back-print.webp', w: 900, h: 1293, label: 'The back print', bg: '#151515' },
      { src: 'lab/nighthunt/wrap.jpg', w: 1400, h: 1172, label: 'Front and back' },
    ],
    note: MOCKUP,
  },
  {
    id: 'below', name: 'BELOW', colour: 'Black', swatch: '#1d1d1d', field: 'Open water',
    line: 'Look down.',
    story: 'One waterline runs right round you at chest height. On your chest a surfboard floats on it, two legs hanging into the light. On your back, out of the dark under the same line, a great white drives up through the sunbeams with its jaws thrown open, one eye burning red as it lunges at the surfer.',
    print: 'A waterline round the chest; a surfer above it, a great white striking up, jaws open, one red eye',
    status: 'test', show: true, range: 'batch02',
    shots: [{ label: 'Back', src: 'lab/below/back.webp' }, { label: 'Front', src: 'lab/below/front.webp' }],
    refs: [
      { src: 'lab/below/back-print.webp', w: 900, h: 1343, label: 'The back print', bg: '#151515' },
      { src: 'lab/below/wrap.jpg', w: 1400, h: 1172, label: 'Back and front, joined at your right side' },
    ],
    note: MOCKUP,
  },
  {
    id: 'cornice', name: 'CORNICE', colour: 'Black', swatch: '#1d1d1d', field: 'Big mountain',
    line: 'Commit.',
    story: 'High on your back a skier hangs in the air, small, the only colour on the tee, and below the snow bursts off the edge of the peak, the mountain falling away into a long empty drop. On your front, powder drifting over the shoulder.',
    print: 'A skier in the air above a burst of snow off the peak',
    status: 'test', show: true, range: 'batch02',
    shots: [{ label: 'Back', src: 'lab/cornice/back.webp' }, { label: 'Front', src: 'lab/cornice/front.webp' }],
    refs: [
      { src: 'lab/cornice/back-print.webp', w: 900, h: 1559, label: 'The back print', bg: '#151515' },
      { src: 'lab/cornice/wrap.jpg', w: 1400, h: 1172, label: 'Front and back, joined at your left side' },
    ],
    note: MOCKUP,
  },
  {
    id: 'coldblood', name: 'COLD BLOOD', colour: 'Black', swatch: '#1d1d1d', field: 'Ice',
    line: 'Someone is watching.',
    story: 'At the top of your back a snow leopard crouches on the ledge, looking down. Far below, across empty dark and a few flakes of snow, a climber small on a frozen fall. On your chest, the climber\u2019s ice axe biting the ice.',
    print: 'A snow leopard above, a climber far below on the ice; the ice axe on the chest',
    status: 'test', show: true, range: 'batch02',
    shots: [{ label: 'Back', src: 'lab/coldblood/back.webp' }, { label: 'Front', src: 'lab/coldblood/front.webp' }],
    refs: [
      { src: 'lab/coldblood/back-print.webp', w: 900, h: 1392, label: 'The back print', bg: '#151515' },
      { src: 'lab/coldblood/wrap.jpg', w: 1400, h: 1172, label: 'Back and front, joined at your right side' },
    ],
    note: MOCKUP,
  },
  {
    id: 'strike', name: 'STRIKE', colour: 'Black', swatch: '#1d1d1d', field: 'Storm',
    line: 'Send it anyway.',
    story: 'Lightning comes over your left shoulder and strikes down your back right behind a rider at the top of a jump in the rain. Cold light is the only colour. On your chest, the end of the bolt where it came over the shoulder.',
    print: 'Lightning striking down behind a rider in the air; the bolt over the left shoulder',
    status: 'test', show: true, range: 'batch02',
    shots: [{ label: 'Back', src: 'lab/strike/back.webp' }, { label: 'Front', src: 'lab/strike/front.webp' }],
    refs: [
      { src: 'lab/strike/back-print.webp', w: 900, h: 1540, label: 'The back print', bg: '#151515' },
      { src: 'lab/strike/wrap.jpg', w: 1400, h: 1172, label: 'Front and back, joined over your left shoulder' },
    ],
    note: MOCKUP,
  },
  {
    id: 'fangs', name: 'FANGS', colour: 'Black', swatch: '#1d1d1d', field: 'Ice',
    line: 'The mountain bites.',
    story: 'Ice hangs from the collar in a row of icicles, two of them long and curved in like canines, each about to drip: an upper jaw, not quite closed. Far below, a climber looks up and swings his axe into the ice towards it. Ice blue is the only colour. On your chest, a few short icicles at the collar, one dripping.',
    print: 'A jaw of icicles hanging from the collar; a climber far below swinging his axe up at it',
    status: 'test', show: true, range: 'batch02',
    shots: [{ label: 'Back', src: 'lab/fangs/back.webp' }, { label: 'Front', src: 'lab/fangs/front.webp' }],
    refs: [
      { src: 'lab/fangs/back-print.webp', w: 900, h: 1346, label: 'The back print', bg: '#151515' },
      { src: 'lab/fangs/wrap.jpg', w: 1400, h: 1172, label: 'Front and back, joined over your left shoulder' },
    ],
    note: MOCKUP,
  },
  {
    // 2026-11-23, N°10. From the founder's reference (a Pinterest picture of a black muscle car in fog, sent over WhatsApp;
    // backend/scripts/batch02_art.py 'prowl'). The picture is someone else's and the car is a recognisable model: redraw it
    // as our own car before it is printed or sold.
    id: 'prowl', name: 'PROWL', colour: 'Black', swatch: '#1d1d1d', field: 'Night road',
    line: 'You see the eyes first.',
    story: 'Out of a bank of fog a black car rolls towards you. It is drawn by nothing but the fog round it: the car is the tee’s own black, only its edges lit, its four headlights burning white, smoke rolling off the back wheel. On your chest, only the headlights, small: it is behind you too.',
    print: 'A black car cut out of fog, four glowing headlights; the headlights alone on the chest',
    status: 'test', show: true, range: 'batch02',
    shots: [{ label: 'Back', src: 'lab/prowl/back.webp' }, { label: 'Front', src: 'lab/prowl/front.webp' }],
    refs: [
      { src: 'lab/prowl/back-print.webp', w: 900, h: 1119, label: 'The back print', bg: '#151515' },
      { src: 'lab/prowl/wrap.jpg', w: 1400, h: 1172, label: 'Back and front' },
    ],
    note: MOCKUP,
  },
];

/** Grouped by line (Bold, Minimal, Batch 01), each in the order it came in. BARREL ends Bold and WAKE starts Minimal, so the
 * sea pair sits side by side under All. */
export const LAB: LabDesign[] = LAB_RANGES.flatMap((r) => [...tests, ...batch01, ...batch02].filter((d) => d.range === r.id));
