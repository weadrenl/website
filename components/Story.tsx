'use client';
import { useEffect, useRef } from 'react';
import { setupGsap } from '@/lib/gsap';
import { COPY } from '@/lib/data';
import { CompassRose } from './Engrave';

/** Why ADRENL: three short lines, a paragraph, a sign-off. */
export function Story() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const { gsap } = setupGsap();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.sl > span').forEach((el) => {
        gsap.from(el, { yPercent: 105, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
      });
      gsap.from('.story-foot > *', { y: 20, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.story-foot', start: 'top 90%', once: true } });
      gsap.fromTo('.rose', { rotate: -50 }, { rotate: 20, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } });
    }, root);
    return () => ctx.revert();
  }, []);

  const s = COPY.story;
  return (
    <section ref={root} className="story" id="story" aria-labelledby="story-t">
      <div className="wrap story-grid">
        <div className="story-side">
          <p className="eyebrow">{s.eyebrow}</p>
          <CompassRose />
        </div>
        <div>
          <h2 id="story-t" className="story-lines" aria-label={s.lines.join(' ')}>
            {s.lines.map((l, i) => <span key={l} className={`sl sl-${i}`} aria-hidden="true"><span>{i === 2 ? <em>{l}</em> : l}</span></span>)}
          </h2>
          <div className="story-foot">
            <p className="story-body">{s.body}</p>
            <p className="story-sign">{s.sign}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
