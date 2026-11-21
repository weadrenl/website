'use client';
import { useEffect, useRef, useState } from 'react';
import { img } from '@/lib/assets';
import { LAB_RANGES, type LabDesign, type LabRange } from '@/lib/lab';
import { labTrack } from '@/lib/labtrack';
import { startTracking } from '@/lib/track';
import { LabViewer } from './LabViewer';

export type ShowItem = LabDesign & { badge: string };

const VIEWS = ['Back', 'Front'];

/**
 * "I'd wear this" picks: kept in this browser, and each tap sent as an anonymous `lab_pick` event { id, on } to the shop's
 * own event store (lib/track.ts), so the founder can count which designs people would buy. Taps on a local copy carry
 * local: true, so tests can be left out of the count.
 */
const PICKS = 'adrenl-lab-picks';
/** "Would you buy it?" answers per design, rupees (0 = just liking it), so each design is asked once in this browser. */
const PRICES = 'adrenl-lab-prices';
const readPrices = (): Record<string, number> => {
  try {
    const v = JSON.parse(localStorage.getItem(PRICES) || '{}');
    return v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).filter(([, n]) => typeof n === 'number')) as Record<string, number> : {};
  } catch { return {}; }
};
const readPicks = (): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(PICKS) || '[]');
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch { return []; }
};

type Filter = 'all' | LabRange;
const isFilter = (v: string | null): v is Filter => v === 'all' || LAB_RANGES.some((r) => r.id === v);

/**
 * The lab's first screen: every design as a card, the whole person, the same side of each, to compare at a glance. Swipe on
 * a phone, a grid on wider screens. Tabs pick a line (All, Bold, Minimal, Batch 01; `?line=minimal` opens on one, to share a
 * single line). Back or Front turns every card at once. A tap opens the full view (LabViewer) on that design, inside the
 * chosen line; without script the card still jumps to its section below.
 * Opening /lab goes straight into the full view on the first design of the line (founder, 2026-11-21); x or the phone's back
 * leaves people on this page. A paper cover hides the page until then, and fades by itself if script never runs.
 */
export function LabShowroom({ items }: { items: ShowItem[] }) {
  const [view, setView] = useState(VIEWS[0]);
  const [filter, setFilter] = useState<Filter>('all');
  const [at, setAt] = useState(0);
  const [full, setFull] = useState<{ id: string; n: number; auto?: boolean } | null>(null);
  const [picks, setPicks] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [booted, setBooted] = useState(false);
  const strip = useRef<HTMLDivElement>(null);
  const shown = filter === 'all' ? items : items.filter((d) => d.range === filter);
  const blurb = LAB_RANGES.find((r) => r.id === filter)?.blurb;

  useEffect(() => {
    startTracking(); // the page view, so /insights can count visits to the lab
    setPicks(readPicks());
    setAnswers(readPrices());
    const q = new URLSearchParams(window.location.search).get('line');
    const f: Filter = isFilter(q) ? q : 'all';
    setFilter(f);
    const first = (f === 'all' ? items : items.filter((d) => d.range === f))[0] ?? items[0];
    if (first) setFull({ id: first.id, n: 0, auto: true });
    setBooted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const pickFilter = (f: Filter) => {
    setFilter(f);
    labTrack('lab_line', { line: f });
    setAt(0);
    if (strip.current) strip.current.scrollLeft = 0;
    try {
      const u = new URL(window.location.href);
      if (f === 'all') u.searchParams.delete('line'); else u.searchParams.set('line', f);
      window.history.replaceState(window.history.state, '', u);
    } catch { /* the address just does not follow */ }
  };
  // From the full view: open a design's sister (WAKE and BARREL sit in different lines, so widen to All if needed).
  const openPair = (id: string) => {
    if (!shown.some((d) => d.id === id)) setFilter('all');
    setFull((f) => ({ id, n: (f?.n ?? 0) + 1 }));
  };
  const togglePick = (id: string) => {
    const on = !picks.includes(id);
    const next = on ? [...picks, id] : picks.filter((x) => x !== id);
    setPicks(next);
    try { localStorage.setItem(PICKS, JSON.stringify(next)); } catch { /* private mode: this visit only */ }
    labTrack('lab_pick', { id, on });
  };
  const answerPrice = (id: string, price: number) => {
    const next = { ...answers, [id]: price };
    setAnswers(next);
    try { localStorage.setItem(PRICES, JSON.stringify(next)); } catch { /* this visit only */ }
    labTrack('lab_price', { id, price, buy: price > 0 });
  };

  const onScroll = () => {
    const el = strip.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const step = card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || '0');
    setAt(Math.min(shown.length - 1, Math.max(0, Math.round(el.scrollLeft / step))));
  };

  const tabs: { id: Filter; name: string; n: number }[] = [
    { id: 'all', name: 'All', n: items.length },
    ...LAB_RANGES.map((r) => ({ id: r.id, name: r.name, n: items.filter((d) => d.range === r.id).length })).filter((t) => t.n > 0),
  ];

  return (
    <section id="compare" className="lab-cmp" aria-label="All designs">
      <div className="lab-ranges" role="tablist" aria-label="Line">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={filter === t.id} className={filter === t.id ? 'on' : ''} onClick={() => pickFilter(t.id)}>
            {t.name}<span>{t.n}</span>
          </button>
        ))}
      </div>
      {blurb && <p className="lab-range-blurb">{blurb}</p>}
      <div className="lab-cmp-head">
        <p className="lab-hint">
          <span className="lab-phone">Swipe to compare · tap for full view</span>
          <span className="lab-wide">Tap one for the full view</span>
        </p>
        <div className="seg" role="radiogroup" aria-label="Side">
          {VIEWS.map((v) => (
            <button key={v} type="button" role="radio" aria-checked={view === v} className={view === v ? 'on' : ''} onClick={() => setView(v)}>{v}</button>
          ))}
        </div>
      </div>
      <div className="lab-cards" ref={strip} onScroll={onScroll}>
        {shown.map((d, i) => {
          const s = d.shots.find((x) => x.label === view) ?? d.shots[0];
          return (
            <a key={d.id} href={`#${d.id}`} className="lab-card" onClick={(e) => { e.preventDefault(); setFull({ id: d.id, n: 0 }); labTrack('lab_open', { id: d.id, line: filter }); }}>
              <figure>
                <img className="cut" src={img(s.src)} width={512} height={1024} alt={`${d.name}, ${s.label.toLowerCase()}, on a person`} loading={i < 3 ? 'eager' : 'lazy'} decoding="async" />
                <span className={`lab-st lab-${d.status}`}>{d.badge}</span>
                {picks.includes(d.id) && (
                  <span className="lab-card-pick" title="Your pick">
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-label="Your pick" role="img"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" /></svg>
                  </span>
                )}
              </figure>
              <span className="lab-card-name"><i style={{ background: d.swatch }} aria-hidden="true" />{d.name}</span>
              <span className="lab-card-line">{d.line}</span>
            </a>
          );
        })}
      </div>
      <p className="lab-at lab-phone" aria-hidden="true">{Math.min(at + 1, shown.length)} / {shown.length}</p>
      {!booted && <div className="lab-cover" aria-hidden="true" />}
      {full !== null && (
        <LabViewer items={shown} all={items} focus={full} instant={!!full.auto} view={view} picks={picks} onPick={togglePick} answers={answers} onAnswer={answerPrice} onPair={openPair} onClose={() => setFull(null)} />
      )}
    </section>
  );
}
