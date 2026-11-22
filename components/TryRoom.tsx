'use client';
import { useEffect, useState } from 'react';
import { BUSINESS, TRYON } from '@/lib/data';
import { img } from '@/lib/assets';
import { track } from '@/lib/track';
import { useStore } from './Store';
import { Mark } from './Mark';
import { Flip } from './Flip';
import { BusinessInfo, PolicyLinks } from './Business';

type Health = { ok: boolean; public?: boolean; busy?: boolean; line?: number };
type State = { k: 'checking' } | { k: 'open'; busy: boolean; line: number } | { k: 'closed' };

/**
 * The trial room's door. The live try-on runs on a GPU server that is on only at set hours, so this page asks it whether
 * it is open (`/live/health`, readable from this site) and sends people in with the tee they picked, or says when it opens.
 * The site never holds the server's key: the server lets people in without one only while it is public.
 */
export function TryRoom() {
  const { cat } = useStore();
  const [sel, setSel] = useState(0);
  const [state, setState] = useState<State>({ k: 'checking' });
  const d = cat.products[sel] ?? cat.products[0];

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('tee');
    const i = cat.products.findIndex((x) => x.id === id);
    if (i >= 0) setSel(i);
  }, [cat.products]);

  useEffect(() => {
    let live = true;
    const ask = async () => {
      let next: State = { k: 'closed' };
      try {
        const r = await fetch(`${TRYON.url}/live/health`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
        const h: Health = await r.json();
        if (h.ok && h.public) next = { k: 'open', busy: !!h.busy, line: h.line ?? 0 };
      } catch { /* off, an old address, or no answer: closed */ }
      if (!live) return;
      setState((was) => { if (was.k !== next.k) track('tryroom_status', { state: next.k }); return next; });
    };
    ask();
    const t = setInterval(ask, 30_000); // it opens and fills while people read
    return () => { live = false; clearInterval(t); };
  }, []);

  const pick = (i: number) => { setSel(i); track('select_design', { id: cat.products[i]?.id, from: 'tryroom' }); };
  // A turn is about 45 s (backend/livevideo/server.py TURN_S): roughly a minute a person, said as "about".
  const ahead = state.k === 'open' ? (state.busy ? 1 : 0) + state.line : 0;
  const wait = ahead === 1 ? 'Someone is trying on now. You go next, in about a minute.'
    : ahead > 1 ? `${ahead} people ahead of you: about ${ahead} minutes in line.` : '';

  return (
    <>
      <header className="lg-nav">
        <a href="/" className="brand" aria-label="ADRENL home"><Mark className="brand-mark" title="" /><span>ADRENL</span></a>
        <a className="tlink" href={`/?tee=${d.id}#shop`}>Back to the shop</a>
      </header>
      <main id="main" className="wrap lg tr">
        <p className="eyebrow">The trial room</p>
        <h1>Try it on, live.</h1>
        <p className="lg-intro">Stand in front of your camera and, a few seconds later, see yourself in {cat.products.map((x) => x.name).join(', ').replace(/, ([^,]*)$/, ' or $1')}, moving as you move. Twenty seconds, then watch it again, try another tee, or keep the video.</p>

        <section className="tr-door" aria-live="polite">
          <p className={`tr-state tr-${state.k}`}>
            <i aria-hidden="true" />
            {state.k === 'checking' ? 'Checking the trial room…' : state.k === 'open' ? 'Open now' : 'Closed right now'}
          </p>
          <div className="picker" role="radiogroup" aria-label="Tee to try">
            {cat.products.map((x, i) => (
              <button key={x.id} role="radio" aria-checked={sel === i} className={sel === i ? 'on' : ''} onClick={() => pick(i)}>
                <Flip src={img(x.shots[0].cut)} other={x.shots[1] && img(x.shots[1].cut)} alt="" />
                <span><b>{x.name}</b><small>{x.colour}</small></span>
              </button>
            ))}
          </div>
          {state.k === 'open' ? (
            <>
              <a className="btn btn-wide" href={`${TRYON.url}/live?tee=${d.id}`} data-track="tryroom_enter" data-track-props={JSON.stringify({ id: d.id, busy: state.busy, line: state.line })}>Try {d.name} on</a>
              {wait && <p className="fine tr-wait">{wait}</p>}
            </>
          ) : state.k === 'closed' ? (
            <>
              <p className="tr-hours">{TRYON.hours ? `It opens ${TRYON.hours}.` : 'It opens at set hours while we test it. Check back here.'}</p>
              <a className="btn btn-wide tr-alt" href={`/?tee=${d.id}#shop`} data-track="tryroom_shop" data-track-props={JSON.stringify({ id: d.id })}>See {d.name} on models in the shop</a>
            </>
          ) : <div className="btn btn-wide tr-wait-btn" aria-hidden="true">&nbsp;</div>}
        </section>

        <section>
          <h2>Before you start</h2>
          <ul className="tr-list">
            <li><b>Wi-Fi works best.</b> Video goes up and comes back the whole time; a weak connection makes it pause.</li>
            <li><b>Turn your phone sideways</b> and step back until your head and hips are in view. The page shows you where.</li>
            <li><b>Short sleeves show the tee best.</b> Long sleeves stay as they are under it.</li>
            <li><b>Opened this from Instagram on Android?</b> Tap ⋯ and choose Open in Chrome: Instagram&apos;s own browser gives pages no camera.</li>
          </ul>
        </section>

        <section>
          <h2>Your video</h2>
          {TRYON.privacy.map((t) => <p key={t}>{t}</p>)}
          <p>To have yours deleted, call or WhatsApp us on <a className="tlink" href={`tel:${BUSINESS.tel}`}>{BUSINESS.phone}</a>.</p>
        </section>
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
