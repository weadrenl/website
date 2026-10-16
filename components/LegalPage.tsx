import type { Policy } from '@/lib/legal';
import { UPDATED } from '@/lib/legal';
import { Mark } from './Mark';
import { BusinessInfo, PolicyLinks } from './Business';

/** A policy page: plain paper, the brand at the top, the business details at the bottom. No motion. */
export function LegalPage({ p }: { p: Policy }) {
  return (
    <>
      <header className="lg-nav">
        <a href="/" className="brand" aria-label="ADRENL home"><Mark className="brand-mark" title="" /><span>ADRENL</span></a>
        <a className="tlink" href="/">Back to the shop</a>
      </header>
      <main id="main" className="wrap lg">
        <p className="eyebrow">Last updated {UPDATED}</p>
        <h1>{p.title}</h1>
        <p className="lg-intro">{p.intro}</p>
        {p.sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.p.map((t) => <p key={t}>{t}</p>)}
          </section>
        ))}
      </main>
      <footer className="foot lg-foot">
        <div className="wrap">
          <div className="foot-cols">
            <div><p className="eyebrow">Shop</p><p className="foot-links"><a href="/">adrenl.com</a><a href="/#shop">Preorder</a><a href="/#faq">FAQ</a></p></div>
            <div><p className="eyebrow">Policies</p><PolicyLinks /></div>
            <div><p className="eyebrow">Contact</p><BusinessInfo /></div>
          </div>
          <div className="foot-row"><span>&copy; 2026 NINETY4 VENTURES</span><span>Adrenaline, worn.</span></div>
        </div>
      </footer>
    </>
  );
}
