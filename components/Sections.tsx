'use client';
import { useState } from 'react';
import { COPY, FAQ, QUOTES, SITE } from '@/lib/data';
import { Mark } from './Mark';
import { Contours, RoutePath, TeeDrawing } from './Engrave';
import { pad, rupee, useCountdown } from './hooks';

export function Build() {
  return (
    <section className="build" id="build" aria-labelledby="build-t">
      <div className="wrap build-grid">
        <div className="build-copy">
          <header className="sh">
            <p className="eyebrow">{COPY.build.eyebrow}</p>
            <h2 id="build-t">{COPY.build.title}</h2>
            <p className="sub">{COPY.build.sub}</p>
          </header>
          <ul className="facts">
            {COPY.build.facts.map((x, i) => (
              <li key={x.h} data-reveal><span className="fact-n">{pad(i + 1)}</span><b>{x.h}</b><p>{x.p}</p></li>
            ))}
          </ul>
        </div>
        <div className="build-draw" data-draw><TeeDrawing /></div>
      </div>
    </section>
  );
}

function icsHref() {
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ADRENL//Batch 01//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    'UID:batch-01-drop@adrenl.com', `DTSTAMP:${now}`, 'DTSTART;VALUE=DATE:20261031', 'DTEND;VALUE=DATE:20261101',
    'SUMMARY:ADRENL Batch 01 opens', `DESCRIPTION:Preorder opens at ${SITE.url}. First-run price Rs ${SITE.price}.`, `URL:${SITE.url}`,
    'BEGIN:VALARM', 'TRIGGER:-PT12H', 'ACTION:DISPLAY', 'DESCRIPTION:ADRENL Batch 01 opens tomorrow', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  return URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
}

export function Drop() {
  const t = useCountdown(SITE.dropISO);
  const cells: [number | null, string][] = [[t?.d ?? null, 'Days'], [t?.h ?? null, 'Hours'], [t?.m ?? null, 'Minutes'], [t?.s ?? null, 'Seconds']];
  const steps = [
    { t: 'Now', h: 'Design preview', p: 'Three routes drawn. Samples next.' },
    { t: SITE.dropLabel, h: 'Batch 01 opens', p: `${rupee(SITE.price)}, first-run price.` },
    { t: 'After Batch 01', h: 'Next batch', p: `${rupee(SITE.nextPrice)}.` },
  ];
  const addToCalendar = () => {
    const a = document.createElement('a');
    a.href = icsHref(); a.download = 'adrenl-batch-01.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  return (
    <section className="drop" id="drop" aria-labelledby="drop-t">
      <Contours className="drop-topo" seed={11} rings={12} />
      <div className="wrap">
        <header className="sh">
          <p className="eyebrow">{COPY.drop.eyebrow}</p>
          <h2 id="drop-t">{COPY.drop.title} <em>{COPY.drop.titleEm}</em></h2>
        </header>
        {t?.done ? <p className="count-live">Preorder is open.</p> : (
          <div className="count" role="timer" aria-label={`Time until ${SITE.dropLabel}`}>
            {cells.map(([v, l]) => <div key={l}><b>{v === null ? '--' : pad(v)}</b><span>{l}</span></div>)}
          </div>
        )}
        <div className="drop-route" data-route>
          <RoutePath />
          <ol>
            {steps.map((s, i) => <li key={s.h} className={i === 1 ? 'is-hot' : ''}><i /><span>{s.t}</span><b>{s.h}</b><p>{s.p}</p></li>)}
          </ol>
        </div>
        <div className="drop-foot">
          <p>{COPY.drop.note}</p>
          <div className="drop-actions">
            <button className="btn btn-paper" onClick={addToCalendar}>Add to calendar</button>
            <a className="tlink" href="#shop">Pick your route</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Voices() {
  if (QUOTES.length === 0) return null;
  return (
    <section className="voices" id="voices" aria-labelledby="voices-t">
      <div className="wrap">
        <header className="sh"><p className="eyebrow">From the first people to see them</p><h2 id="voices-t">In their words.</h2></header>
        <div className="quotes">
          {QUOTES.map((q, i) => (
            <figure key={i} className="quote" data-reveal><blockquote>{q.text}</blockquote><figcaption>{q.name}{q.context ? ` · ${q.context}` : ''}</figcaption></figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="faq" id="faq" aria-labelledby="faq-t">
      <div className="wrap faq-grid">
        <header className="sh">
          <p className="eyebrow">Good to know</p>
          <h2 id="faq-t">Straight answers.</h2>
          <p className="sub">What we know for sure about Batch 01, and what we are still confirming.</p>
        </header>
        <div className="faq-list">
          {FAQ.map((x, i) => (
            <div key={x.q} className={`faq-item ${open === i ? 'open' : ''}`}>
              <h3><button aria-expanded={open === i} aria-controls={`faq-${i}`} id={`faq-b-${i}`} onClick={() => setOpen(open === i ? null : i)}><span>{x.q}</span><i aria-hidden="true" /></button></h3>
              <div className="faq-a" id={`faq-${i}`} role="region" aria-labelledby={`faq-b-${i}`}><div><p>{x.a}</p></div></div>
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
      <Contours className="foot-topo" seed={9} rings={14} />
      <div className="wrap">
        <div className="foot-top">
          <h2 className="foot-title">{COPY.foot.title}<br /><em>{COPY.foot.titleEm}</em></h2>
          <a className="btn btn-paper" href="#shop">Pick your route</a>
        </div>
        <div className="foot-cols">
          <div><p className="eyebrow">The drop</p><p>Opens {SITE.dropLabel}.<br />{rupee(SITE.price)} first run, {rupee(SITE.nextPrice)} after.</p></div>
          <div><p className="eyebrow">Made</p><p>Designed in India.<br />Made in {SITE.made}.</p></div>
          <div><p className="eyebrow">Explore</p><p className="foot-links"><a href="#story">Story</a><a href="#routes">Routes</a><a href="#build">The tee</a><a href="#faq">FAQ</a></p></div>
        </div>
        <div className="foot-brand" aria-hidden="true"><Mark className="foot-mark" /><span className="foot-word">ADRENL</span></div>
        <div className="foot-row"><span>&copy; 2026 ADRENL</span><span>Adrenaline, worn.</span><a href="#top">Back to top</a></div>
      </div>
    </footer>
  );
}
