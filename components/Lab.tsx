import { LAB, LAB_BADGE, LAB_COPY, LAB_RANGES, LAB_STATUS, type LabDesign } from '@/lib/lab';
import { img } from '@/lib/assets';
import { Mark } from './Mark';
import { LabShowroom } from './LabStrip';

/**
 * The design lab (/lab). First every design side by side to compare (LabShowroom: line tabs, swipe on a phone, tap for the
 * full view), then each one written out, grouped by line: on a person from every side, its motto, story and prints.
 */
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
        </section>

        <LabShowroom items={list.map((d) => ({ ...d, badge: LAB_BADGE[d.status] }))} />

        {LAB_RANGES.map((r) => ({ r, ds: list.filter((d) => d.range === r.id) })).filter((g) => g.ds.length > 0).map(({ r, ds }) => (
          <section key={r.id} className="lab-group" aria-labelledby={`line-${r.id}`}>
            <header className="lab-group-h">
              <h2 id={`line-${r.id}`}>{r.name}<span>{ds.length}</span></h2>
              <p>{r.blurb}</p>
            </header>
        {ds.map((d) => { const i = list.indexOf(d); const pair = d.pair && list.find((x) => x.id === d.pair!.id); return (
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
              <div className="lab-shots" style={{ '--n': d.shots.length } as React.CSSProperties}>
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
                {pair && <p className="lab-pair"><b>{d.pair!.label}:</b> <a className="tlink" href={`#${pair.id}`}>compare with {pair.name}</a></p>}
                {d.note && <p className="lab-note"><b>Note:</b> {d.note}</p>}
                <div className="lab-refs">
                  {d.refs.map((r) => (
                    <figure key={r.src} className={r.w > r.h * 1.8 ? 'lab-art' : undefined}>
                      <img src={img(r.src)} width={r.w} height={r.h} alt={`${d.name}: ${r.label}`} loading="lazy" decoding="async" style={r.bg ? { background: r.bg, padding: 10 } : undefined} />
                      <figcaption>{r.label}</figcaption>
                    </figure>
                  ))}
                </div>
                <a className="tlink lab-up" href="#compare">Back to all designs</a>
              </div>
            </div>
          </article>
        ); })}
          </section>
        ))}
      </main>
      <footer className="wrap"><div className="lab-foot"><span>&copy; 2026 NINETY4 VENTURES</span><span>Adrenaline, worn.</span></div></footer>
    </>
  );
}
