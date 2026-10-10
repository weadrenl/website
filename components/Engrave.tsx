/* Drawn SVG motifs: contours, ridge edge, compass rose, route line, tee line drawing, icons. */
// Coordinates are rounded so server and client render identical markup.
const f = (n: number) => Math.round(n * 10) / 10;

function rng(seed: number) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

/** Topographic contour rings, seeded so they are stable between renders. */
export function Contours({ seed = 7, rings = 14, className = '' }: { seed?: number; rings?: number; className?: string }) {
  const r = rng(seed * 9301 + 49297);
  const ph = Array.from({ length: 4 }, () => r() * Math.PI * 2);
  const paths: string[] = [];
  for (let i = 1; i <= rings; i++) {
    const base = 26 + i * 22, pts: string[] = [];
    for (let s = 0; s <= 80; s++) {
      const a = (s / 80) * Math.PI * 2;
      const wob = Math.sin(a * 2 + ph[0]) * 0.1 + Math.sin(a * 3 + ph[1] + i * 0.16) * 0.07 + Math.sin(a * 5 + ph[2]) * 0.035 + Math.sin(a + ph[3]) * 0.05;
      const rad = base * (1 + wob * (1 + i / rings));
      pts.push(`${s ? 'L' : 'M'}${f(500 + Math.cos(a) * rad * 1.3)} ${f(400 + Math.sin(a) * rad * 0.9)}`);
    }
    paths.push(pts.join('') + 'Z');
  }
  return (
    <svg className={`topo ${className}`} viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {paths.map((d, i) => <path key={i} d={d} vectorEffect="non-scaling-stroke" opacity={f(0.35 + (i / paths.length) * 0.65)} />)}
    </svg>
  );
}

/** A mountain silhouette used as the bottom edge of the hero, filled with the page colour. */
export function RidgeEdge({ className = '' }: { className?: string }) {
  const pts: string[] = [];
  for (let i = 0; i <= 200; i++) {
    const x = i / 200;
    const y = 60
      - 26 * (0.5 + 0.5 * Math.sin(x * Math.PI * 2 * 1.3 + 0.6))
      - 16 * (1 - Math.abs(Math.sin(x * Math.PI * 2 * 3.1 + 1.2)))
      - 7 * (1 - Math.abs(Math.sin(x * Math.PI * 2 * 7.3 + 0.4)))
      - 3 * (1 - Math.abs(Math.sin(x * Math.PI * 2 * 17 + 2.1)));
    pts.push(`${i ? 'L' : 'M'}${f(x * 1440)} ${f(y + 30)}`);
  }
  return (
    <svg className={`ridge-edge ${className}`} viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true">
      <path d={`${pts.join('')}L1440 100L0 100Z`} />
    </svg>
  );
}

/** Sixteen-point compass rose with engraved (half-filled) points. */
export function CompassRose({ className = '' }: { className?: string }) {
  const c = 100;
  const point = (r: number, w: number, rot: number, i: number) => {
    const a = (rot * Math.PI) / 180;
    const tip = [f(c + Math.sin(a) * r), f(c - Math.cos(a) * r)];
    const l = [f(c + Math.sin(a - Math.PI / 2) * w), f(c - Math.cos(a - Math.PI / 2) * w)];
    const rr = [f(c + Math.sin(a + Math.PI / 2) * w), f(c - Math.cos(a + Math.PI / 2) * w)];
    return (
      <g key={`${rot}-${i}`}>
        <path d={`M${c} ${c}L${l[0]} ${l[1]}L${tip[0]} ${tip[1]}Z`} className="cr-dark" />
        <path d={`M${c} ${c}L${rr[0]} ${rr[1]}L${tip[0]} ${tip[1]}Z`} className="cr-light" />
      </g>
    );
  };
  const ticks: string[] = [];
  for (let i = 0; i < 72; i++) {
    const a = (i * 5 * Math.PI) / 180, long = i % 18 === 0 ? 10 : i % 6 === 0 ? 6 : 3;
    ticks.push(`M${f(c + Math.sin(a) * 92)} ${f(c - Math.cos(a) * 92)}L${f(c + Math.sin(a) * (92 - long))} ${f(c - Math.cos(a) * (92 - long))}`);
  }
  return (
    <svg className={`rose ${className}`} viewBox="0 0 200 200" aria-hidden="true">
      <circle cx={c} cy={c} r={92} className="cr-ring" />
      <circle cx={c} cy={c} r={78} className="cr-ring" />
      <circle cx={c} cy={c} r={30} className="cr-ring" />
      <path d={ticks.join('')} className="cr-tick" />
      {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((r, i) => point(44, 3.2, r, i))}
      {[45, 135, 225, 315].map((r, i) => point(60, 5, r, i))}
      {[0, 90, 180, 270].map((r, i) => point(84, 7, r, i))}
      <circle cx={c} cy={c} r={4} className="cr-hub" />
      <text x={c} y={11} textAnchor="middle" className="cr-txt">N</text>
      <text x={192} y={104} textAnchor="middle" className="cr-txt">E</text>
      <text x={c} y={197} textAnchor="middle" className="cr-txt">S</text>
      <text x={8} y={104} textAnchor="middle" className="cr-txt">W</text>
    </svg>
  );
}

/** The route line used by the drop timeline. */
export const ROUTE_D = 'M20 128C120 40 220 190 360 112S600 28 740 112S980 196 1180 72';
export function RoutePath({ className = '' }: { className?: string }) {
  return (
    <svg className={`route ${className}`} viewBox="0 0 1200 200" preserveAspectRatio="none" aria-hidden="true">
      <path d={ROUTE_D} className="route-ghost" />
      <path d={ROUTE_D} className="route-line" pathLength={1} />
    </svg>
  );
}

/** Line drawing of the tee with a few construction callouts. Paths use pathLength=1 so they can be drawn on scroll. */
export function TeeDrawing({ className = '' }: { className?: string }) {
  const body = 'M132 42Q200 92 268 42L352 70L398 192L336 216L320 172V402H80V172L64 216L2 192L48 70Z';
  const label = (x: number, y: number, t: string, anchor: 'start' | 'end' | 'middle' = 'start') => <text x={x} y={y} textAnchor={anchor} className="td-txt">{t}</text>;
  return (
    <svg className={`tee ${className}`} viewBox="-150 -24 690 470" aria-hidden="true">
      <rect x="138" y="178" width="124" height="118" rx="2" className="td-ghost" />
      <path d={body} className="td-line" pathLength={1} />
      <path d="M132 42Q200 118 268 42" className="td-line" pathLength={1} />
      <path d="M132 42Q200 20 268 42" className="td-line td-thin" pathLength={1} />
      <path d="M48 70L80 172M352 70L320 172" className="td-line td-thin" pathLength={1} />
      <path d="M80 392H320" className="td-line td-thin" pathLength={1} />
      <path d="M258 140l9 18h-18z" className="td-mark" />
      <path d="M200 58V4" className="td-lead" pathLength={1} />{label(200, -4, 'Rib collar', 'middle')}
      <path d="M46 74H-34" className="td-lead" pathLength={1} />{label(-40, 78, 'Dropped shoulder', 'end')}
      <path d="M268 150H412" className="td-lead" pathLength={1} />{label(418, 154, 'Chest mark')}
      <path d="M200 296V330" className="td-lead" pathLength={1} />{label(200, 346, 'Route on the back', 'middle')}
      <path d="M4 200H-34" className="td-lead" pathLength={1} />{label(-40, 204, 'Wide sleeve', 'end')}
      <path d="M320 397H412" className="td-lead" pathLength={1} />{label(418, 401, 'Double-stitched hem')}
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12.5 4.2 4L19 7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowIcon({ dir = 'right' }: { dir?: 'left' | 'right' }) {
  return (
    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true" style={dir === 'left' ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
