'use client';
import { useRef, useState } from 'react';
import { img } from '@/lib/assets';
import type { LabDesign } from '@/lib/lab';
import { LabViewer } from './LabViewer';

export type ShowItem = LabDesign & { badge: string };

const VIEWS = ['Back', 'Front'];

/**
 * The lab's first screen: every design as a card, the whole person, the same side of each, to compare at a glance. Swipe on
 * a phone, a grid on wider screens. Back or Front turns every card at once. A tap opens the full view (LabViewer) on that
 * design; without script the card still jumps to its section below.
 */
export function LabShowroom({ items }: { items: ShowItem[] }) {
  const [view, setView] = useState(VIEWS[0]);
  const [at, setAt] = useState(0);
  const [full, setFull] = useState<number | null>(null);
  const strip = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    const el = strip.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const step = card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || '0');
    setAt(Math.min(items.length - 1, Math.max(0, Math.round(el.scrollLeft / step))));
  };

  return (
    <section id="compare" className="lab-cmp" aria-label="All designs">
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
        {items.map((d, i) => {
          const s = d.shots.find((x) => x.label === view) ?? d.shots[0];
          return (
            <a key={d.id} href={`#${d.id}`} className="lab-card" onClick={(e) => { e.preventDefault(); setFull(i); }}>
              <figure>
                <img className="cut" src={img(s.src)} width={512} height={1024} alt={`${d.name}, ${s.label.toLowerCase()}, on a person`} loading={i < 3 ? 'eager' : 'lazy'} decoding="async" />
                <span className={`lab-st lab-${d.status}`}>{d.badge}</span>
              </figure>
              <span className="lab-card-name"><i style={{ background: d.swatch }} aria-hidden="true" />{d.name}</span>
              <span className="lab-card-line">{d.line}</span>
            </a>
          );
        })}
      </div>
      <p className="lab-at lab-phone" aria-hidden="true">{at + 1} / {items.length}</p>
      {full !== null && <LabViewer items={items} start={full} view={view} onClose={() => setFull(null)} />}
    </section>
  );
}
