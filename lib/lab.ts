import { DESIGNS } from './data';

/**
 * The design lab (/lab): every tee we are weighing up, shown on a person, so the founder can pick what to make next.
 * Private: not linked from the site, noindex, kept out of robots and the sitemap.
 *
 * To add a design: put its pictures in public/img/lab/<id>/ (model cut-outs 512 x 1024, transparent, like the shop's),
 * add an entry below with status 'test', and it shows up. `show: false` takes a design off the page without deleting it.
 */
export type LabStatus = 'site' | 'test' | 'idea';
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
};

export const LAB_STATUS: Record<LabStatus, string> = {
  site: 'On the site · Batch 01',
  test: 'In test',
  idea: 'Idea',
};

/** The short label on each card in the compare strip. */
export const LAB_BADGE: Record<LabStatus, string> = {
  site: 'Batch 01',
  test: 'New',
  idea: 'Idea',
};

export const LAB_COPY = {
  eyebrow: 'ADRENL design lab',
  title: 'Adrenaline, worn.',
  motto: 'Hills, land, air and sea.',
  intro: 'Every design here is shown on a person first, so we see how it really looks before we make it. The ones that look right go to the shop.',
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
const MOCKUP = 'A quick mock-up made on the laptop: the print is laid on the RIDGE photo, so it stays flat where real cloth would fold. The AI try-on drapes it properly; that needs one GPU run.';

const tests: LabDesign[] = [
  {
    // 2026-11-21. Working name; the founder called it "skydiving".
    id: 'freefall', name: 'FREEFALL', colour: 'Black', swatch: '#1d1d1d', field: 'Open air',
    line: 'Leave a trail.',
    story: 'Ten thousand feet, the door open, one step out. FREEFALL is the minute after it: arms wide, the wind loud, a red trail tearing through the clouds behind you. On the front, only ADRENL, raised in the tee’s own black, and the trail coming off the shoulder.',
    print: 'Skydiver in freefall, red trail, clouds',
    status: 'test', show: true,
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
    status: 'test', show: true,
    shots: [{ label: 'Back', src: 'lab/drift/back.webp' }, { label: 'Front', src: 'lab/drift/front.webp' }],
    refs: [
      { src: 'lab/drift/back-print.webp', w: 350, h: 515, label: 'Back print: car, smoke, tyre lines', bg: '#151515' },
      { src: 'lab/drift/flat.jpg', w: 1024, h: 708, label: 'The design, front and back' },
    ],
    note: MOCKUP,
  },
];

/** New designs first: they are what the lab is for. */
export const LAB: LabDesign[] = [...tests, ...batch01];
