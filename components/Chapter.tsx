'use client';
import { useEffect, useRef } from 'react';
import { setupGsap } from '@/lib/gsap';
import { img } from '@/lib/assets';
import { type Design } from '@/lib/data';
import { Chars } from './Split';
import { Contours } from './Contours';

export function Chapter({ d, index, onChoose }: { d: Design; index: number; onChoose: (i: number) => void }) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const { gsap } = setupGsap();
    const el = root.current!;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add({ wide: '(min-width: 861px)', narrow: '(max-width: 860px)' }, (c) => {
        const wide = c.conditions?.wide;
        const imgs = gsap.utils.toArray<HTMLElement>('.ch-img', el);
        const label = el.querySelector<HTMLElement>('.ch-angle-now');
        const dots = gsap.utils.toArray<HTMLElement>('.ch-dot', el);
        const alt = el.querySelector<HTMLElement>('.ch-alt-num');
        const targetAlt = parseInt(d.alt.replace(/[^0-9]/g, ''), 10) || 0;
        const counter = { v: 0 };
        gsap.set(imgs.slice(1), { opacity: 0 });
        gsap.set(el.querySelector('.ch-why'), { opacity: 0, y: 24 });
        const names = ['Front', 'Back', 'Side'];
        let last = -1;
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: el, start: 'top top', end: wide ? '+=260%' : '+=220%', pin: true, scrub: 0.5, anticipatePin: 1,
            onUpdate: (s) => {
              const i = s.progress < 0.34 ? 0 : s.progress < 0.67 ? 1 : 2;
              if (i !== last) {
                last = i;
                if (label) label.textContent = names[i];
                dots.forEach((dd, k) => dd.classList.toggle('on', k === i));
              }
            },
          },
        });
        tl.fromTo(el.querySelector('.ch-giant'), { xPercent: wide ? 6 : 4 }, { xPercent: wide ? -26 : -40, duration: 1 }, 0)
          .to(counter, { v: targetAlt, duration: 1, onUpdate: () => { if (alt) alt.textContent = Math.round(counter.v).toLocaleString('en-IN'); } }, 0)
          .fromTo(el.querySelector('.ch-rail-fill'), { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0)
          .to(imgs[0], { opacity: 0, scale: 1.05, xPercent: -4, duration: 0.1 }, 0.28)
          .fromTo(imgs[1], { opacity: 0, scale: 0.96, xPercent: 4 }, { opacity: 1, scale: 1, xPercent: 0, duration: 0.1 }, 0.28)
          .to(imgs[1], { opacity: 0, scale: 1.05, xPercent: -4, duration: 0.1 }, 0.62)
          .fromTo(imgs[2], { opacity: 0, scale: 0.96, xPercent: 4 }, { opacity: 1, scale: 1, xPercent: 0, duration: 0.1 }, 0.62)
          .to(el.querySelector('.ch-story'), { opacity: 0, y: -24, duration: 0.08 }, 0.4)
          .to(el.querySelector('.ch-why'), { opacity: 1, y: 0, duration: 0.08 }, 0.46);
        gsap.fromTo(el.querySelector('.ch-stage'), { yPercent: 6 }, { yPercent: -4, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top top', scrub: true } });
      });
    }, root);
    return () => ctx.revert();
  }, [d]);

  return (
    <section ref={root} className="chapter" id={d.id} style={{ ['--bg' as string]: d.bg, ['--ac' as string]: d.accent }} aria-labelledby={`${d.id}-t`}>
      <Contours seed={index + 2} className="ch-contours" />
      <div className="ch-giant" aria-hidden="true">{d.name}</div>
      <div className="ch-inner">
        <div className="ch-copy">
          <p className="mono ch-eyebrow">Route {d.n} / {d.field}</p>
          <h2 id={`${d.id}-t`} className="ch-title"><Chars text={d.line} /></h2>
          <div className="ch-texts">
            <p className="ch-story">{d.story}</p>
            <p className="ch-why"><span className="mono">Why it is in Batch 01</span>{d.why}</p>
          </div>
          <div className="ch-actions">
            <button className="btn" data-cursor="Open" onClick={() => onChoose(index)}>Choose {d.name} <span aria-hidden="true">&rarr;</span></button>
            <span className="mono ch-print">{d.print}</span>
          </div>
        </div>
        <div className="ch-stage">
          <div className="ch-frame">
            {d.views.map((vw, k) => (
              <img key={vw.key} className="ch-img" src={img(vw.file)} width={512} height={1024} loading="lazy" decoding="async"
                alt={`AI design preview of the ${d.name} tee, ${vw.label.toLowerCase()} view, on a fictional model`} />
            ))}
            <span className="ai-tag mono">AI design preview</span>
          </div>
        </div>
        <aside className="ch-hud mono" aria-hidden="true">
          <div className="ch-rail"><i className="ch-rail-fill" /></div>
          <div className="ch-hud-body">
            <div><small>Route marker</small><b>{d.coords}</b></div>
            <div><small>Reference altitude</small><b><span className="ch-alt-num">0</span> M</b></div>
            <div><small>Angle</small><b className="ch-angle-now">Front</b></div>
            <div className="ch-dots"><i className="ch-dot on" /><i className="ch-dot" /><i className="ch-dot" /></div>
          </div>
        </aside>
      </div>
    </section>
  );
}
