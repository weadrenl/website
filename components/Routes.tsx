'use client';
import { useEffect, useRef, useState } from 'react';
import { img } from '@/lib/assets';
import { COPY, DESIGNS } from '@/lib/data';

/**
 * The three routes, told once. Desktop: the copy scrolls, the models stay put and change with it.
 * Phone: each route is a block with a swipeable strip of the models. Cut-outs stand on the page and fade out at the
 * bottom, no boxes, nothing faked.
 */
export function Routes({ onChoose }: { onChoose: (i: number) => void }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const blocks = Array.from(root.current!.querySelectorAll<HTMLElement>('.rt-block'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i)); });
    }, { rootMargin: '-48% 0px -48% 0px' });
    blocks.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, []);

  const d = DESIGNS[active];
  return (
    <section ref={root} className="routes" id="routes" aria-labelledby="routes-t"
      style={{ ['--paper' as string]: d.paper, ['--tint' as string]: d.tint }}>
      <div className="wrap">
        <header className="sh">
          <p className="eyebrow">{COPY.routes.eyebrow}</p>
          <h2 id="routes-t">{COPY.routes.title}</h2>
        </header>
        <div className="rt-grid">
          <div className="rt-blocks">
            {DESIGNS.map((x, i) => (
              <article key={x.id} className={`rt-block ${active === i ? 'on' : ''}`} data-i={i}>
                <p className="eyebrow">{x.roman} <i className="sep">·</i> {x.field}</p>
                <h3 className="rt-name">{x.name}</h3>
                <p className="rt-line">{x.line}</p>
                <div className="rt-strip" aria-label={`${x.name} on a model`}>
                  {x.shots.map((s) => (
                    <figure key={s.key}>
                      <img className="cut" src={img(s.cut)} width={512} height={1024} alt={`${x.name} tee, ${s.label.toLowerCase()}, on a model`} loading="lazy" decoding="async" />
                      <figcaption>{s.label}</figcaption>
                    </figure>
                  ))}
                </div>
                <p className="rt-story">{x.story}</p>
                <figure className="rt-plate">
                  <img src={img(x.art.ink)} width={x.art.w} height={x.art.h} alt={`${x.name} back graphic: ${x.print}`} loading="lazy" decoding="async" />
                  <figcaption><span>{x.print}</span> <span>{x.coords}</span> <span>{x.alt}</span></figcaption>
                </figure>
                <button className="btn" onClick={() => onChoose(i)}>{COPY.routes.cta}</button>
              </article>
            ))}
          </div>
          <div className="rt-media" aria-hidden="true">
            {DESIGNS.map((x, i) => (
              <div key={x.id} className={`rt-set ${active === i ? 'on' : ''}`}>
                <figure className="rt-fig rt-front"><img className="cut" src={img(x.shots[1].cut)} width={512} height={1024} alt="" loading="lazy" decoding="async" /><figcaption>Front</figcaption></figure>
                <figure className="rt-fig rt-back"><img className="cut" src={img(x.shots[0].cut)} width={512} height={1024} alt="" loading="lazy" decoding="async" /><figcaption>Back</figcaption></figure>
              </div>
            ))}
            <i className="rt-floor" />
            <ol className="rt-count">
              {DESIGNS.map((x, i) => <li key={x.id} className={active === i ? 'on' : ''}>{x.roman}</li>)}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
