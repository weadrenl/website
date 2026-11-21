'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { img } from '@/lib/assets';
import type { ShowItem } from './LabStrip';

/** The hint shows on the first open of a visit only. */
let hinted = false;

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Full view of the lab, phone first. One design per screen, the person as large as the screen allows.
 *   tap the person      turn them around (back, front, side)
 *   swipe sideways      the next or previous design
 *   drag up             the story, prints and notes, in a sheet; drag down or tap its top to close it
 *   back / Esc / x      close. Arrows and Esc on a keyboard.
 * "Both" puts the back and the front side by side; tapping one of them shows it alone.
 */
export function LabViewer({ items, start, view, onClose }: { items: ShowItem[]; start: number; view: string; onClose: () => void }) {
  const [at, setAt] = useState(start);
  // Per design: which view is shown. An index past the last shot means "Both".
  const [views, setViews] = useState(() => items.map((d) => Math.max(0, d.shots.findIndex((s) => s.label === view))));
  const [turning, setTurning] = useState(-1);
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const [hint, setHint] = useState(!hinted);
  const track = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const press = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const sheetPress = useRef<{ y: number; moved: boolean } | null>(null);

  const d = items[at] ?? items[0];
  const calm = () => setHint(false);

  const close = () => {
    if (window.history.state?.labViewer) window.history.back(); // popstate closes it, so the phone's back does the same
    else onClose();
  };
  const go = (step: number) => {
    const el = track.current;
    if (!el) return;
    const i = Math.min(items.length - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth) + step));
    el.scrollTo({ left: i * el.clientWidth, behavior: reducedMotion() ? 'auto' : 'smooth' });
  };
  const show = (i: number, to: number | ((x: number) => number)) => {
    const next = (x: number) => (typeof to === 'function' ? to(x) : to);
    calm();
    if (reducedMotion()) { setViews((v) => v.map((x, k) => (k === i ? next(x) : x))); return; }
    setTurning(i);
    window.setTimeout(() => { setViews((v) => v.map((x, k) => (k === i ? next(x) : x))); setTurning(-1); }, 170);
  };
  const turn = (i: number) => {
    const n = items[i].shots.length;
    if (n < 2 || turning !== -1) return;
    show(i, (x) => (x >= n ? 0 : (x + 1) % n));
  };

  const api = useRef({ close, go, setOpen });
  api.current = { close, go, setOpen };

  useLayoutEffect(() => {
    const el = track.current;
    if (el) el.scrollLeft = start * el.clientWidth;
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = 'hidden';
    if (!window.history.state?.labViewer) window.history.pushState({ labViewer: true }, '');
    const onPop = () => onClose();
    const onKey = (e: KeyboardEvent) => {
      const a = api.current;
      if (e.key === 'Escape') a.close();
      else if (e.key === 'ArrowRight') a.go(1);
      else if (e.key === 'ArrowLeft') a.go(-1);
      else if (e.key === 'ArrowUp') a.setOpen(true);
      else if (e.key === 'ArrowDown') a.setOpen(false);
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
    const t = window.setTimeout(() => setHint(false), 4500);
    return () => window.clearTimeout(t);
  }, [hint]);

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== at && i >= 0 && i < items.length) { setAt(i); setOpen(false); calm(); }
  };

  // A vertical swipe on the person opens or closes the story. Sideways is the browser's own scroll.
  const trackDown = (e: React.PointerEvent) => { press.current = { x: e.clientX, y: e.clientY }; swiped.current = false; };
  const trackUp = (e: React.PointerEvent) => {
    const p = press.current;
    press.current = null;
    if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    swiped.current = Math.hypot(dx, dy) > 10;
    if (Math.abs(dy) > 50 && Math.abs(dy) > Math.abs(dx) * 1.3) { setOpen(dy < 0); calm(); }
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
    setDrag(open ? Math.max(-24, dy) : Math.min(24, dy));
  };
  const sheetUp = (e: React.PointerEvent) => {
    const p = sheetPress.current;
    sheetPress.current = null;
    setDrag(null);
    if (!p) return;
    const dy = e.clientY - p.y;
    if (!p.moved) setOpen((o) => !o);
    else if (!open && dy < -40) setOpen(true);
    else if (open && dy > 60) setOpen(false);
    calm();
  };
  const sheetCancel = () => { sheetPress.current = null; setDrag(null); };

  const sheetStyle = drag === null ? undefined
    : { transform: `translateY(calc(${open ? '0px' : 'var(--lv-h) - var(--lv-peek)'} + ${drag}px))` };

  return (
    <div className="lv" role="dialog" aria-modal="true" aria-label="Designs, full view">
      <header className="lv-top">
        <span className="lv-count">{at + 1} / {items.length}</span>
        <span className="lv-brand">ADRENL design lab</span>
        <button ref={closeBtn} type="button" className="lv-x" onClick={close} aria-label="Close full view">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
        </button>
      </header>

      <div className="lv-track" ref={track} onScroll={onScroll} onPointerDown={trackDown} onPointerUp={trackUp} onPointerCancel={() => { press.current = null; }}>
        {items.map((x, i) => {
          const n = x.shots.length;
          const v = views[i];
          const both = n > 1 && v >= n;
          const near = Math.abs(i - start) <= 1;
          return (
            <section key={x.id} className="lv-slide" aria-roledescription="slide" aria-label={`${x.name}, ${i + 1} of ${items.length}`}>
              <div className={`lv-stage${both ? ' both' : ''}`}>
                {both ? x.shots.slice(0, 2).map((s, k) => (
                  <figure key={s.label} className="lv-fig" onClick={() => { if (!swiped.current) show(i, k); }}>
                    <img className="cut" src={img(s.src)} width={512} height={1024} alt={`${x.name}, ${s.label.toLowerCase()}`} decoding="async" />
                    <figcaption>{s.label}</figcaption>
                  </figure>
                )) : (
                  <figure className={`lv-fig${turning === i ? ' turning' : ''}`} onClick={() => { if (!swiped.current) turn(i); }}
                    role={n > 1 ? 'button' : undefined} aria-label={n > 1 ? `Turn ${x.name} around` : undefined}>
                    {x.shots.map((s, k) => (
                      <img key={s.label} className={`cut${k === v ? ' on' : ''}`} src={img(s.src)} width={512} height={1024}
                        alt={k === v ? `${x.name}, ${s.label.toLowerCase()}, on a person` : ''} loading={near ? 'eager' : 'lazy'} decoding="async" />
                    ))}
                  </figure>
                )}
              </div>
              {n > 1 && (
                <div className="lv-views" role="radiogroup" aria-label="Side">
                  {[...x.shots.map((s) => s.label), 'Both'].map((label, k) => (
                    <button key={label} type="button" role="radio" aria-checked={v === k} className={v === k ? 'on' : ''} onClick={() => show(i, k)}>{label}</button>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <button type="button" className="lv-arrow lv-prev" onClick={() => go(-1)} disabled={at === 0} aria-label="Previous design">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 4l-8 8 8 8" stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
      </button>
      <button type="button" className="lv-arrow lv-next" onClick={() => go(1)} disabled={at === items.length - 1} aria-label="Next design">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 4l8 8-8 8" stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
      </button>

      {hint && (
        <p className="lv-hint" aria-hidden="true">
          <span>Tap to turn around</span><span>Swipe for the next</span><span>Drag up for the story</span>
        </p>
      )}

      <section className={`lv-sheet${open ? ' open' : ''}${drag !== null ? ' dragging' : ''}`} style={sheetStyle} aria-label={`${d.name}: story and prints`}>
        <header className="lv-sheet-head" onPointerDown={sheetDown} onPointerMove={sheetMove} onPointerUp={sheetUp} onPointerCancel={sheetCancel}
          role="button" tabIndex={0} aria-expanded={open} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o); } }}>
          <i className="lv-grab" aria-hidden="true" />
          <div className="lv-title">
            <h2><i style={{ background: d.swatch }} aria-hidden="true" />{d.name}</h2>
            <span className={`lab-st lab-${d.status}`}>{d.badge}</span>
          </div>
          <p className="lv-line">{d.line}</p>
          <p className="lv-more">{open ? 'Drag down to close' : 'Drag up for the story'}</p>
        </header>
        <div className="lv-body">
          <p className="lv-meta">{d.colour} · {d.field} · {d.print}</p>
          <p>{d.story}</p>
          {d.note && <p className="lab-note"><b>Note:</b> {d.note}</p>}
          <div className="lv-refs">
            {d.refs.map((r) => (
              <figure key={r.src}>
                <img src={img(r.src)} width={r.w} height={r.h} alt={`${d.name}: ${r.label}`} loading="lazy" decoding="async" style={r.bg ? { background: r.bg, padding: 10 } : undefined} />
                <figcaption>{r.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
