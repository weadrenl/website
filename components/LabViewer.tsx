'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { img } from '@/lib/assets';
import { LAB_RANGES } from '@/lib/lab';
import type { ShowItem } from './LabStrip';

/** The hint shows on the first open of a visit only. */
let hinted = false;

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Wide screens get photos left and the story right; below this, the phone layout. Keep in step with globals.css. */
const isWide = () => window.matchMedia('(min-width: 900px)').matches;
const views = (d: ShowItem) => (d.shots.length > 1 ? [...d.shots.map((s) => s.label), 'Both'] : d.shots.map((s) => s.label));

type Props = {
  /** The designs in the chosen line, in order. */
  items: ShowItem[];
  /** Every design, to find a sister in another line. */
  all: ShowItem[];
  /** Open on this design; a new n jumps to it while open (the pair button). */
  focus: { id: string; n: number };
  view: string;
  picks: string[];
  onPick: (id: string) => void;
  onPair: (id: string) => void;
  onClose: () => void;
};
const rangeName = (x: ShowItem) => LAB_RANGES.find((r) => r.id === x.range)?.name ?? '';

/**
 * Full view of the lab, built on what phones already teach (decided with the founder, 2026-11-21):
 *   up and down          the next or previous design, one per screen, like Reels
 *   sideways             the same design's back, front, side and both, like a product's photos, with labelled tabs
 *   tap the name bar     the story, prints and notes in a sheet; drag it down, tap its top or outside to close
 *   heart                "I'd wear this", remembered here and counted as an anonymous event
 * Wide screens: photos on the left, the story always on the right; arrow keys and buttons move. Back, x or Esc close.
 */
export function LabViewer({ items, all, focus, view, picks, onPick, onPair, onClose }: Props) {
  // Designs are followed by id, not position: the list can change while open (the pair button widens the line to All).
  const [cur, setCur] = useState(focus.id);
  const at = Math.max(0, items.findIndex((x) => x.id === cur));
  const [shown, setShown] = useState<Record<string, number>>(() => {
    const wide = isWide();
    return Object.fromEntries(all.map((d) => [d.id, wide && d.shots.length > 1 ? d.shots.length : Math.max(0, d.shots.findIndex((s) => s.label === view))]));
  });
  const lastFocus = useRef(-1);
  const [sheet, setSheet] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const [hint, setHint] = useState(!hinted);
  const track = useRef<HTMLDivElement>(null);
  const rails = useRef<(HTMLDivElement | null)[]>([]);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const sheetPress = useRef<{ y: number; moved: boolean } | null>(null);

  const d = items[at] ?? items[0];
  const calm = () => setHint(false);
  const behavior = (): ScrollBehavior => (reducedMotion() ? 'auto' : 'smooth');

  const close = () => {
    if (window.history.state?.labViewer) window.history.back(); // popstate closes it, so the phone's back does the same
    else onClose();
  };
  const goDesign = (step: number) => {
    const el = track.current;
    if (!el) return;
    const i = Math.min(items.length - 1, Math.max(0, Math.round(el.scrollTop / el.clientHeight) + step));
    el.scrollTo({ top: i * el.clientHeight, behavior: behavior() });
    calm();
  };
  const goView = (i: number, k: number) => {
    const el = rails.current[i];
    if (!el) return;
    const n = views(items[i]).length;
    el.scrollTo({ left: Math.min(n - 1, Math.max(0, k)) * el.clientWidth, behavior: behavior() });
    calm();
  };

  const side = (i: number) => shown[items[i]?.id] ?? 0;
  const api = useRef({ close, goDesign, goView, at, side, sheet, setSheet });
  api.current = { close, goDesign, goView, at, side, sheet, setSheet };

  // On open, and when the pair button asks for another design (or the line changes under us): put that design on screen and
  // each rail on its side, without animation.
  const ids = items.map((x) => x.id).join(',');
  useLayoutEffect(() => {
    const jump = lastFocus.current !== focus.n;
    lastFocus.current = focus.n;
    const i = Math.max(0, items.findIndex((x) => x.id === (jump ? focus.id : cur)));
    const el = track.current;
    if (el) el.scrollTop = i * el.clientHeight;
    rails.current.forEach((r, j) => { const x = items[j]; if (r && x) r.scrollLeft = (shown[x.id] ?? 0) * r.clientWidth; });
    if (items[i]) setCur(items[i].id);
    if (jump) setSheet(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus.n, ids]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = 'hidden';
    if (!window.history.state?.labViewer) window.history.pushState({ labViewer: true }, '');
    const onPop = () => onClose();
    const onKey = (e: KeyboardEvent) => {
      const a = api.current;
      if (e.key === 'Escape') { if (a.sheet) a.setSheet(false); else a.close(); }
      else if (e.key === 'ArrowDown' || e.key === 'PageDown') a.goDesign(1);
      else if (e.key === 'ArrowUp' || e.key === 'PageUp') a.goDesign(-1);
      else if (e.key === 'ArrowRight') a.goView(a.at, a.side(a.at) + 1);
      else if (e.key === 'ArrowLeft') a.goView(a.at, a.side(a.at) - 1);
      else return;
      e.preventDefault();
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener('keydown', onKey);
    closeBtn.current?.focus({ preventScroll: true });
    return () => {
      root.style.overflow = before;
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hint) return;
    hinted = true;
    const t = window.setTimeout(() => setHint(false), 5000);
    return () => window.clearTimeout(t);
  }, [hint]);

  const onTrack = () => {
    const el = track.current;
    if (!el) return;
    const x = items[Math.round(el.scrollTop / el.clientHeight)];
    if (x && x.id !== cur) { setCur(x.id); setSheet(false); calm(); }
  };
  const onRail = (i: number) => {
    const el = rails.current[i];
    const x = items[i];
    if (!el || !x) return;
    const k = Math.round(el.scrollLeft / el.clientWidth);
    if (k !== shown[x.id]) { setShown((v) => ({ ...v, [x.id]: k })); calm(); }
  };

  const sheetDown = (e: React.PointerEvent<HTMLElement>) => {
    sheetPress.current = { y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag(0);
  };
  const sheetMove = (e: React.PointerEvent) => {
    const p = sheetPress.current;
    if (!p) return;
    const dy = e.clientY - p.y;
    if (Math.abs(dy) > 6) p.moved = true;
    setDrag(Math.max(0, dy));
  };
  const sheetUp = (e: React.PointerEvent) => {
    const p = sheetPress.current;
    sheetPress.current = null;
    setDrag(null);
    if (p && (!p.moved || e.clientY - p.y > 70)) setSheet(false);
  };

  const heart = (on: boolean) => (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
  const pick = (x: ShowItem, where: string) => {
    const on = picks.includes(x.id);
    return (
      <button type="button" className={`lv-pick ${where}${on ? ' on' : ''}`} aria-pressed={on} onClick={() => { onPick(x.id); calm(); }}
        aria-label={on ? `You'd wear ${x.name}. Tap to undo` : `I'd wear ${x.name}`}>
        {heart(on)}<span>{on ? 'Your pick' : 'I’d wear this'}</span>
      </button>
    );
  };
  // A sister design on the same idea in the other line: both backs side by side, and a button over to the other.
  const pairBlock = (x: ShowItem) => {
    const p = x.pair && all.find((y) => y.id === x.pair!.id);
    if (!x.pair || !p) return null;
    return (
      <div className="lv-pair">
        <p className="lv-pair-h">{x.pair.label}</p>
        <div className="lv-pair-row">
          {[x, p].map((y) => (
            <figure key={y.id} className={y.id === x.id ? 'here' : undefined}>
              <img className="cut" src={img(y.shots[0].src)} width={512} height={1024} alt={`${y.name}, back, on a person`} loading="lazy" decoding="async" />
              <figcaption><b>{y.name}</b>{rangeName(y)}</figcaption>
            </figure>
          ))}
        </div>
        <button type="button" className="lv-pair-go" onClick={() => onPair(p.id)}>Open {p.name}</button>
      </div>
    );
  };
  const story = (x: ShowItem) => (
    <>
      <div className="lv-title">
        <h2><i style={{ background: x.swatch }} aria-hidden="true" />{x.name}</h2>
        <span className={`lab-st lab-${x.status}`}>{x.badge}</span>
      </div>
      <p className="lv-line">{x.line}</p>
      <p className="lv-meta">{rangeName(x)} · {x.colour} · {x.field} · {x.print}</p>
      <p className="lv-story">{x.story}</p>
      {pairBlock(x)}
      {x.note && <p className="lab-note"><b>Note:</b> {x.note}</p>}
      <div className="lv-refs">
        {x.refs.map((r) => (
          <figure key={r.src}>
            <img src={img(r.src)} width={r.w} height={r.h} alt={`${x.name}: ${r.label}`} loading="lazy" decoding="async" style={r.bg ? { background: r.bg, padding: 10 } : undefined} />
            <figcaption>{r.label}</figcaption>
          </figure>
        ))}
      </div>
    </>
  );
  const fig = (x: ShowItem, s: ShowItem['shots'][number], eager: boolean, caption: boolean) => (
    <figure className="lv-fig" key={s.label}>
      <img className="cut" src={img(s.src)} width={512} height={1024} alt={`${x.name}, ${s.label.toLowerCase()}, on a person`} loading={eager ? 'eager' : 'lazy'} decoding="async" />
      {caption && <figcaption>{s.label}</figcaption>}
    </figure>
  );

  return (
    <div className="lv" role="dialog" aria-modal="true" aria-label="Designs, full view">
      <header className="lv-top">
        <span className="lv-count">{at + 1} / {items.length}</span>
        <span className="lv-brand">ADRENL design lab</span>
        <div className="lv-top-r">
          <button type="button" className="lv-step" onClick={() => goDesign(-1)} disabled={at === 0} aria-label="Previous design">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 15l7-7 7 7" stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
          </button>
          <button type="button" className="lv-step" onClick={() => goDesign(1)} disabled={at === items.length - 1} aria-label="Next design">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 9l7 7 7-7" stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
          </button>
          <button ref={closeBtn} type="button" className="lv-x" onClick={close} aria-label="Close full view">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
          </button>
        </div>
      </header>

      <div className="lv-track" ref={track} onScroll={onTrack}>
        {items.map((x, i) => {
          const labels = views(x);
          const k = shown[x.id] ?? 0;
          const near = Math.abs(i - at) <= 1;
          return (
            <section key={x.id} className="lv-slide" aria-roledescription="slide" aria-label={`${x.name}, ${i + 1} of ${items.length}`}>
              <div className="lv-stage">
                <div className="lv-rail" ref={(el) => { rails.current[i] = el; }} onScroll={() => onRail(i)}>
                  {labels.map((label, j) => (
                    <div key={label} className={`lv-view${label === 'Both' ? ' both' : ''}`} aria-hidden={j !== k}>
                      {label === 'Both'
                        ? x.shots.slice(0, 2).map((s) => fig(x, s, near, true))
                        : fig(x, x.shots[j], near && (j === k || j === 0), false)}
                    </div>
                  ))}
                </div>
                {labels.length > 1 && (
                  <>
                    <div className="lv-tabs" role="tablist" aria-label="Side">
                      {labels.map((label, j) => (
                        <button key={label} type="button" role="tab" aria-selected={j === k} className={j === k ? 'on' : ''} onClick={() => goView(i, j)}>{label}</button>
                      ))}
                    </div>
                    <button type="button" className="lv-side lv-side-l" onClick={() => goView(i, k - 1)} disabled={k === 0} aria-label="Previous side">
                      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
                    </button>
                    <button type="button" className="lv-side lv-side-r" onClick={() => goView(i, k + 1)} disabled={k === labels.length - 1} aria-label="Next side">
                      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
                    </button>
                  </>
                )}
                {pick(x, 'lv-pick-float')}
              </div>
              <button type="button" className="lv-cap" onClick={() => { setSheet(true); calm(); }} aria-label={`${x.name}: open the story`}>
                <span className="lv-cap-name"><i style={{ background: x.swatch }} aria-hidden="true" />{x.name}<span className={`lab-st lab-${x.status}`}>{x.badge}</span></span>
                <span className="lv-cap-line">{x.line}</span>
                <span className="lv-cap-more">Story
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M5 15l7-7 7 7" stroke="currentColor" strokeWidth="1.8" fill="none" /></svg>
                </span>
              </button>
              <aside className="lv-aside" aria-label={`${x.name}: story and prints`}>
                {story(x)}
                {pick(x, 'lv-pick-wide')}
              </aside>
            </section>
          );
        })}
      </div>

      {hint && (
        <p className="lv-hint" aria-hidden="true">
          <span className="lv-hint-phone">Swipe up for the next tee</span>
          <span className="lv-hint-phone">Swipe sideways for the back</span>
          <span className="lv-hint-phone">Tap the name for the story</span>
          <span className="lv-hint-wide">↑ ↓ the next tee · ← → back and front</span>
        </p>
      )}

      <div className={`lv-scrim${sheet ? ' on' : ''}`} onClick={() => setSheet(false)} aria-hidden="true" />
      <section className={`lv-sheet${sheet ? ' open' : ''}${drag !== null ? ' dragging' : ''}`} style={drag !== null ? { transform: `translateY(${drag}px)` } : undefined}
        aria-hidden={!sheet} aria-label={`${d.name}: story and prints`}>
        <header className="lv-sheet-head" onPointerDown={sheetDown} onPointerMove={sheetMove} onPointerUp={sheetUp} onPointerCancel={() => { sheetPress.current = null; setDrag(null); }}
          role="button" tabIndex={sheet ? 0 : -1} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSheet(false); } }}>
          <i className="lv-grab" aria-hidden="true" />
          <span>Drag down to close</span>
        </header>
        <div className="lv-body">
          {story(d)}
          {pick(d, 'lv-pick-sheet')}
        </div>
      </section>
    </div>
  );
}
