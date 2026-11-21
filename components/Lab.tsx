import { LAB, LAB_COPY, LAB_STATUS, type LabDesign } from '@/lib/lab';
import { img } from '@/lib/assets';
import { Mark } from './Mark';

/** The design lab (/lab): each design on a person, back, front and side, with its flat lay and print. No script needed. */
export function Lab() {
  const list = LAB.filter((d) => d.show);
  const count = (s: LabDesign['status']) => list.filter((d) => d.status === s).length;

  return (
    <>
      <header className="lg-nav">
        <a href="/" className="brand" aria-label="ADRENL home"><Mark className="brand-mark" title="" /><span>ADRENL</span></a>
        <a className="tlink" href="/#shop">Back to the shop</a>
      </header>
      <main id="main" className="wrap lab">
        <section className="lab-top">
          <p className="eyebrow">{LAB_COPY.eyebrow}</p>
          <h1>{LAB_COPY.title}<em>{LAB_COPY.motto}</em></h1>
          <p className="lab-intro">{LAB_COPY.intro}</p>
          <p className="lab-count">
            {list.length} {list.length === 1 ? 'design' : 'designs'} · {count('site')} on the site · {count('test')} in test
            {count('idea') > 0 && ` · ${count('idea')} ideas`}
          </p>
          <nav className="lab-jump" aria-label="Designs">
            {list.map((d) => (
              <a key={d.id} href={`#${d.id}`}><i style={{ background: d.swatch }} aria-hidden="true" />{d.name}</a>
            ))}
          </nav>
        </section>

        {list.map((d, i) => (
          <article key={d.id} id={d.id} className="lab-d">
            <header className="lab-head">
              <span className="lab-n">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h2>{d.name}</h2>
                <p className="lab-meta"><i style={{ background: d.swatch }} aria-hidden="true" />{d.colour} · {d.field}</p>
              </div>
              <span className={`lab-st lab-${d.status}`}>{LAB_STATUS[d.status]}</span>
            </header>
            <div className="lab-body">
              <div className="lab-shots">
                {d.shots.map((s) => (
                  <figure key={s.label}>
                    <img className="cut" src={img(s.src)} width={512} height={1024} alt={`${d.name}, ${s.label.toLowerCase()}, on a person`} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
                    <figcaption>{s.label}</figcaption>
                  </figure>
                ))}
              </div>
              <div className="lab-text">
                <p className="lab-line">{d.line}</p>
                <p>{d.story}</p>
                {d.note && <p className="lab-note"><b>What we are testing:</b> {d.note}</p>}
                <div className="lab-refs">
                  {d.flat && (
                    <figure>
                      <img src={img(d.flat)} width={1100} height={1375} alt={`${d.name}, flat lay`} loading="lazy" decoding="async" />
                      <figcaption>Flat lay</figcaption>
                    </figure>
                  )}
                  {d.art && (
                    <figure className="lab-art">
                      <img src={img(d.art.src)} width={d.art.w} height={d.art.h} alt={`${d.name} back print: ${d.print}`} loading="lazy" decoding="async" />
                      <figcaption>{d.print}</figcaption>
                    </figure>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </main>
      <footer className="wrap"><div className="lab-foot"><span>&copy; 2026 NINETY4 VENTURES</span><span>Adrenaline, worn.</span></div></footer>
    </>
  );
}
