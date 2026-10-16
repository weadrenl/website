'use client';
import { useEffect, useRef, useState } from 'react';
import { COPY, DESIGNS, HERO_FILMS, type Film as FilmT } from '@/lib/data';
import { Dawn } from './Dawn';
import { RidgeEdge } from './Engrave';
import { Chars } from './Split';

/**
 * The visit's film is chosen by a tiny script in <head> (see app/layout.tsx) before the first paint and written to
 * <html data-film>. CSS then shows that film's still straight away, so the hero is never black. The film itself
 * fades in on top only once it is actually playing; if a phone blocks autoplay, the still simply stays.
 */
function filmIndex(): number {
  const v = Number(document.documentElement.dataset.film);
  return Number.isInteger(v) && v >= 0 && v < HERO_FILMS.length ? v : 0;
}

function Film({ f }: { f: FilmT }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [phone, setPhone] = useState<boolean | null>(null);
  const [lite, setLite] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const m = window.matchMedia('(max-width: 760px)');
    const pick = () => { setPhone(m.matches); setPlaying(false); };
    pick(); m.addEventListener('change', pick);
    // Data-saver, very slow connections and reduced motion keep the still and never download the film.
    const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setLite(Boolean(reduced || c?.saveData || (c?.effectiveType && /(^|-)2g$/.test(c.effectiveType))));
    return () => m.removeEventListener('change', pick);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => { /* autoplay blocked: the still stays, no play button is ever shown */ });
  }, [phone, lite]);

  if (phone === null || lite) return null;
  const c = phone ? f.port : f.land;
  return (
    <video ref={ref} key={phone ? 'p' : 'l'} className={`film ${playing ? 'on' : ''}`} muted loop playsInline autoPlay preload="auto"
      disablePictureInPicture disableRemotePlayback aria-hidden="true" tabIndex={-1} onPlaying={() => setPlaying(true)} src={c.video} />
  );
}

export function Hero() {
  const hasFilms = HERO_FILMS.length > 0;
  const [film, setFilm] = useState<number | null>(null);
  useEffect(() => { if (hasFilms) setFilm(filmIndex()); }, [hasFilms]);
  const f = film === null ? null : HERO_FILMS[film];
  const d = f ? DESIGNS[f.route] : null;

  return (
    <section className="hero" id="top" aria-labelledby="hero-t">
      <div className="hero-media">
        {hasFilms
          ? HERO_FILMS.map((x, i) => (
            <i key={i} className={`still still-${i}`} aria-hidden="true"
              style={{ ['--still-l' as string]: `url(${x.land.still})`, ['--still-p' as string]: `url(${x.port.still})` }} />
          ))
          : <Dawn />}
        {f && <Film f={f} />}
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
        <a className="hero-tag" href="#routes">
          <span>{d.roman}<i className="sep">·</i>{d.field}</span><b>{d.name}</b>
        </a>
      )}
      <RidgeEdge className="hero-edge" />
    </section>
  );
}
