'use client';
import { useRef, useState } from 'react';
import { img } from '@/lib/assets';

export type StripItem = {
  id: string;
  name: string;
  line: string;
  swatch: string;
  status: 'site' | 'test' | 'idea';
  badge: string;
  shots: { label: string; src: string }[];
};

const VIEWS = ['Back', 'Front'];

/**
 * The lab's first screen: every design as a card, the same side of each, to compare at a glance. Swipe on a phone, a grid
 * on wider screens. Back or Front turns every card at once; a tap goes to that design's views, story and prints below.
 */
export function LabStrip({ items }: { items: StripItem[] }) {
  const [view, setView] = useState(VIEWS[0]);
  const [at, setAt] = useState(0);
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
          <span className="lab-phone">Swipe to compare · tap one to see it all</span>
          <span className="lab-wide">Tap one to see it from every side</span>
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
            <a key={d.id} href={`#${d.id}`} className="lab-card">
              <figure>
                <img src={img(s.src)} width={512} height={1024} alt={`${d.name}, ${s.label.toLowerCase()}, on a person`} loading={i < 3 ? 'eager' : 'lazy'} decoding="async" />
                <span className={`lab-st lab-${d.status}`}>{d.badge}</span>
              </figure>
              <span className="lab-card-name"><i style={{ background: d.swatch }} aria-hidden="true" />{d.name}</span>
              <span className="lab-card-line">{d.line}</span>
            </a>
          );
        })}
      </div>
      <p className="lab-at lab-phone" aria-hidden="true">{at + 1} / {items.length}</p>
    </section>
  );
}
