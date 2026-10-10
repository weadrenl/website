'use client';
import { useEffect, useRef, useState } from 'react';
import { COPY, DESIGNS, HERO_FILMS, type Film as FilmT } from '@/lib/data';
import { Dawn } from './Dawn';
import { RidgeEdge } from './Engrave';
import { Chars } from './Split';

const KEY = 'adrenl-film';

/** Next film for this visitor: the one after the last they saw, or a random one on a first visit. */
function nextFilm(): number {
  const n = HERO_FILMS.length;
  let last: number | null = null;
  try { const v = window.localStorage.getItem(KEY); if (v !== null) last = Number(v); } catch { /* storage blocked */ }
  const i = last === null || Number.isNaN(last) ? Math.floor(Math.random() * n) : (last + 1) % n;
  try { window.localStorage.setItem(KEY, String(i)); } catch { /* storage blocked */ }
  return i;
}

/** Full-bleed film. Portrait cut on phones, landscape elsewhere; reduced motion shows the poster only. */
function Film({ f }: { f: FilmT }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [phone, setPhone] = useState<boolean | null>(null);
  useEffect(() => {
    const m = window.matchMedia('(max-width: 760px)');
    const pick = () => setPhone(m.matches);
    pick(); m.addEventListener('change', pick);
    return () => m.removeEventListener('change', pick);
  }, []);
  // Data-saver or a very slow connection: show the still poster, do not download the film.
  const [lite, setLite] = useState(false);
  useEffect(() => {
    const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    setLite(Boolean(c?.saveData || (c?.effectiveType && /(^|-)2g$/.test(c.effectiveType))));
  }, []);
  useEffect(() => {
    const v = ref.current;
    if (!v || phone === null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { v.pause(); return; }
    v.play().catch(() => {});
  }, [phone, lite]);
  if (phone === null) return null;
  if (lite) return <img className="film" src={phone ? f.posterMobile : f.posterDesktop} alt="" aria-hidden="true" />;
  return (
    <video ref={ref} key={phone ? 'p' : 'l'} className="film" src={phone ? f.mobile : f.desktop} poster={phone ? f.posterMobile : f.posterDesktop}
      muted loop playsInline autoPlay preload="auto" aria-hidden="true" />
  );
}

export function Hero() {
  const hasFilms = HERO_FILMS.length > 0;
  const [film, setFilm] = useState<number | null>(null);
  useEffect(() => { if (hasFilms) setFilm(nextFilm()); }, [hasFilms]);
  const f = film === null ? null : HERO_FILMS[film];
  const d = f ? DESIGNS[f.route] : null;

  return (
    <section className="hero" id="top" aria-labelledby="hero-t">
      <div className="hero-media">
        {hasFilms ? (f && <Film f={f} />) : <Dawn />}
        <i className="hero-shade" aria-hidden="true" />
      </div>
      <div className="wrap hero-inner">
        <p className="eyebrow hero-eyebrow" data-hero>{COPY.hero.eyebrow}</p>
        <h1 id="hero-t" className="hero-title">
          <span className="line"><Chars text="Take the" /></span>
          <span className="line"><em><Chars text="long" /></em> <Chars text="way." /></span>
        </h1>
        <div className="hero-row" data-rise>
          <p className="hero-lead">{COPY.hero.lead}</p>
          <div className="hero-actions">
            <a className="btn btn-paper" href="#shop">{COPY.hero.cta}</a>
            <a className="tlink" href="#story">{COPY.hero.link}</a>
          </div>
        </div>
      </div>
      {d && (
        <a className="hero-tag" href="#routes" data-hero>
          <span>{d.roman}<i className="sep">·</i>{d.field}</span><b>{d.name}</b>
        </a>
      )}
      <RidgeEdge className="hero-edge" />
    </section>
  );
}
