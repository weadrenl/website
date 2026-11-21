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
  flat?: string;
  art?: { src: string; w: number; h: number };
  /** What we want to learn from this one. */
  note?: string;
};

export const LAB_STATUS: Record<LabStatus, string> = {
  site: 'On the site · Batch 01',
  test: 'In test',
  idea: 'Idea',
};

export const LAB_COPY = {
  eyebrow: 'ADRENL design lab · private',
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
  flat: d.flat,
  art: { src: d.art.ink, w: d.art.w, h: d.art.h },
}));

export const LAB: LabDesign[] = [
  ...batch01,
  // New designs go here, for example:
  // { id: 'tide', name: 'TIDE', colour: 'Off white', swatch: '#ece8df', field: 'Sea', line: '...', story: '...',
  //   print: '...', status: 'test', show: true,
  //   shots: [{ label: 'Back', src: 'lab/tide/back.webp' }, { label: 'Front', src: 'lab/tide/front.webp' }],
  //   flat: 'lab/tide/flat.jpg', note: 'Does a light tee still feel rugged?' },
];
