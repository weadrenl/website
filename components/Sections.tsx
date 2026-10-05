'use client';
import { useState } from 'react';
import { FAQ, QUOTES, SPECS, SITE, DESIGNS } from '@/lib/data';
import { img } from '@/lib/assets';
import { Mark } from './Mark';
import { Chars, Words } from './Split';
import { Contours } from './Contours';
import { pad, rupee, useCountdown } from './hooks';

export function Countdown() {
  const t = useCountdown(SITE.dropISO);
  const cell = (n: number | null, l: string) => <div><b>{n === null ? '--' : pad(n)}</b><span>{l}</span></div>;
  if (t?.done) return <div className="count" role="timer"><b className="live">The drop is live</b></div>;
  return (
    <div className="count mono" role="timer" aria-label={`Time until the ${SITE.dropLabel} drop`}>
      {cell(t?.d ?? null, 'Days')}{cell(t?.h ?? null, 'Hrs')}{cell(t?.m ?? null, 'Min')}{cell(t?.s ?? null, 'Sec')}
    </div>
  );
}

export function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-t">
      <Contours seed={3} rings={16} className="hero-contours" />
      <div className="wrap hero-wrap">
        <div className="hero-copy">
          <p className="mono hero-eyebrow" data-hero>Batch 01 / Three routes / Drops {SITE.dropLabel}</p>
          <h1 id="hero-t" className="hero-title">
            <span className="line"><Chars text="TAKE THE" /></span>
            <span className="line is-outline"><Chars text="LONG" /></span>
            <span className="line"><Chars text="WAY." /></span>
          </h1>
          <p className="hero-lead" data-hero>Graphic tees for the road before sunrise, the climb after the turn and the detour worth taking. Small batch. Made to be worn outside.</p>
          <div className="hero-cta" data-hero>
            <a className="btn magnet" href="#shop" data-cursor="Go">Pick your route <span aria-hidden="true">&darr;</span></a>
            <div className="hero-price mono"><b>{rupee(SITE.price)}</b> Batch 01 price</div>
          </div>
          <div data-hero><Countdown /></div>
        </div>
        <div className="hero-cards" aria-hidden={false}>
          {DESIGNS.map((d, i) => (
            <a key={d.id} href={`#${d.id}`} className={`hcard hc-${i}`} data-cursor={d.name} aria-label={`Jump to ${d.name}`}>
              <img src={img(d.views[0].file)} width={512} height={1024} alt={`${d.name} tee`} />
              <span className="hc-label mono">{d.n} {d.name}</span>
            </a>
          ))}
        </div>
      </div>
      <div className="scroll-cue mono" aria-hidden="true"><i /> Scroll</div>
    </section>
  );
}

export function Marquee({ text }: { text: string }) {
  const item = <span className="mq-item">{text}<Mark className="mq-mark" title="" /></span>;
  return (
    <div className="marquee" aria-hidden="true">
      <div className="mq-track">{item}{item}{item}{item}{item}{item}</div>
    </div>
  );
}

export function Manifesto() {
  return (
    <section className="manifesto" aria-label="Manifesto">
      <div className="wrap">
        <p className="mono" data-reveal>What we make</p>
        <Words text="Not every route is on the map. Some of the best ones start with a wrong turn, a closed road or a friend saying one more hill. We make heavyweight graphic tees for the people who take those routes, and wear them out." />
      </div>
    </section>
  );
}

export function Specs() {
  return (
    <section className="specs" id="build" aria-labelledby="specs-t">
      <div className="wrap">
        <header data-reveal><p className="mono">The build</p><h2 id="specs-t">Heavy on purpose.</h2>
          <p className="specs-sub">This is the planned specification for Batch 01. We confirm it on the final sample before the drop and will say so if anything changes.</p></header>
        <div className="spec-grid">
          {SPECS.map((s, i) => (
            <div className="spec" key={s.k} data-reveal style={{ ['--i' as string]: i }}>
              <span className="mono">{pad(i + 1)} / {s.k}</span><b>{s.v}</b><p>{s.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Batch() {
  const steps = [
    { t: 'Now', h: 'Design preview', p: 'Three routes drawn. Real samples next.' },
    { t: SITE.dropLabel, h: 'Batch 01 opens', p: `${rupee(SITE.price)} Batch 01 price. Preorder.` },
    { t: 'After Batch 01', h: 'Next batch', p: `Planned at ${rupee(SITE.nextPrice)}.` },
  ];
  return (
    <section className="batch" aria-labelledby="batch-t">
      <div className="wrap">
        <header data-reveal><p className="mono">The first run</p><h2 id="batch-t">Batch 01 is the low price.</h2></header>
        <ol className="steps">
          {steps.map((s, i) => (
            <li key={s.h} data-reveal style={{ ['--i' as string]: i }} className={i === 1 ? 'is-hot' : ''}>
              <span className="mono">{s.t}</span><b>{s.h}</b><p>{s.p}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Voices() {
  return (
    <section className="voices" id="voices" aria-labelledby="voices-t">
      <div className="wrap">
        <header data-reveal><p className="mono">From the people who saw them first</p><h2 id="voices-t">In their words.</h2></header>
        {QUOTES.length > 0 ? (
          <div className="quotes">
            {QUOTES.map((q, i) => (
              <figure key={i} className="quote" data-reveal><blockquote>&ldquo;{q.text}&rdquo;</blockquote><figcaption className="mono">{q.name}{q.context ? ` / ${q.context}` : ''}</figcaption></figure>
            ))}
          </div>
        ) : (
          <>
            <div className="quotes">
              {[0, 1, 2].map((i) => (
                <figure key={i} className="quote is-slot" data-reveal style={{ ['--i' as string]: i }}>
                  <blockquote>Your friend&apos;s words go here.</blockquote>
                  <figcaption className="mono">Name / how they know ADRENL</figcaption>
                </figure>
              ))}
            </div>
            <p className="voices-note" data-reveal>These slots are open on purpose. Real comments from friends who have seen the designs go in here, each one added with that person&apos;s okay. We do not write quotes for people.</p>
          </>
        )}
      </div>
    </section>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="faq" id="faq" aria-labelledby="faq-t">
      <div className="wrap faq-wrap">
        <header data-reveal><p className="mono">Good to know</p><h2 id="faq-t">Straight answers.</h2></header>
        <div className="faq-list">
          {FAQ.map((f, i) => (
            <div key={f.q} className={`faq-item ${open === i ? 'open' : ''}`}>
              <h3><button aria-expanded={open === i} aria-controls={`faq-${i}`} id={`faq-b-${i}`} onClick={() => setOpen(open === i ? null : i)}><span>{f.q}</span><i aria-hidden="true" /></button></h3>
              <div className="faq-a" id={`faq-${i}`} role="region" aria-labelledby={`faq-b-${i}`}><div><p>{f.a}</p></div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="foot">
      <Contours seed={11} rings={12} className="foot-contours" />
      <div className="wrap">
        <p className="mono" data-reveal>Batch 01 / {SITE.dropLabel}</p>
        <h2 className="foot-title" data-reveal>Still here?<br />Take the long way.</h2>
        <a className="btn btn-big magnet" href="#shop" data-cursor="Go">Pick your route <span aria-hidden="true">&uarr;</span></a>
        <div className="foot-brand"><Mark className="foot-mark" /><span className="foot-word">ADRENL</span></div>
        <div className="foot-row mono"><span>&copy; 2026 ADRENL</span><span>Made in India</span><a href="#top">Back to top &uarr;</a></div>
      </div>
    </footer>
  );
}
