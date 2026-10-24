'use client';
import { useEffect, useRef, useState } from 'react';
import { SITE } from '@/lib/data';
import { api } from '@/lib/api';
import { track } from '@/lib/track';
import { useStore } from './Store';
import { BagLines } from './Bag';
import { Delivery, Login } from './Checkout';
import { CheckIcon } from './Engrave';
import { Mark } from './Mark';
import { rupee } from './hooks';

const STEPS = [['bag', 'Bag'], ['contact', 'Sign in'], ['delivery', 'Delivery'], ['payment', 'Payment']] as const;
type Step = (typeof STEPS)[number][0];

function Steps({ at }: { at: Step }) {
  const i = STEPS.findIndex(([k]) => k === at);
  return (
    <ol className="co-steps" aria-label="Checkout steps">
      {STEPS.map(([k, label], n) => (
        <li key={k} className={n < i ? 'done' : n === i ? 'on' : ''} aria-current={n === i ? 'step' : undefined}>
          {k === 'bag' ? <a href="/?bag=open"><i>{n < i ? <CheckIcon /> : n + 1}</i><span className="co-l">{label}</span></a> : <span><i>{n < i ? <CheckIcon /> : n + 1}</i><span className="co-l">{label}</span></span>}
        </li>
      ))}
    </ol>
  );
}

const Lock = () => <svg className="ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1" fill="none" stroke="currentColor" strokeWidth="1.3" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>;

/** /checkout: sign in, delivery, then off to Zoho Payments. The order summary stays in view (folded on phones). */
export function CheckoutPage() {
  const { cat, user, setUser, ready, bag, units, subtotal } = useStore();
  const [paying, setPaying] = useState(false);
  const [note, setNote] = useState('');
  const [sumOpen, setSumOpen] = useState(false);
  const began = useRef(false), lastStep = useRef('');
  const total = subtotal + cat.shipping;
  const step: Step = paying ? 'payment' : user ? 'delivery' : 'contact';
  const live = ready && user !== undefined && cat.open && bag.length > 0;

  useEffect(() => { if (live && !began.current) { began.current = true; track('begin_checkout', { units, value: subtotal }); } }, [live, units, subtotal]);
  useEffect(() => { if (live && lastStep.current !== step) { lastStep.current = step; track('checkout_step', { step }); } }, [live, step]);
  // Back from the payment page (browser Back, page restored from cache): show the form again, not the spinner.
  useEffect(() => {
    const f = (e: PageTransitionEvent) => { if (e.persisted) setPaying(false); };
    addEventListener('pageshow', f);
    return () => removeEventListener('pageshow', f);
  }, []);

  const signOut = async () => { await api('/auth/logout', {}).catch(() => {}); setUser(null); track('checkout_sign_out'); };

  let main;
  if (!ready || user === undefined) main = <div className="state"><span className="spin" aria-hidden="true" /></div>;
  else if (!cat.open) main = <div className="co-card co-msg"><h1 className="form-t">Checkout opens {SITE.dropLabel}.</h1><p className="form-p">Your bag is saved on this device until then.</p><a className="btn" href="/">Back to the shop</a></div>;
  else if (!bag.length && !paying) main = <div className="co-card co-msg"><h1 className="form-t">Your bag is empty.</h1><p className="form-p">Pick a route first, then come back here.</p><a className="btn" href="/#shop">Pick your route</a></div>;
  else if (paying) main = (
    <div className="co-card state" role="status" aria-live="polite">
      <span className="spin big" aria-hidden="true" />
      <h1 className="form-t">Opening secure payment</h1>
      <p className="form-p">Taking you to Zoho Payments. Please don&apos;t close this tab.</p>
    </div>
  );
  else if (!user) main = (
    <div className="co-card">
      {note && <p className="note">{note}</p>}
      <Login ctx="checkout" onDone={() => setNote('')} intro="Your mobile number is your account: no password. We also use it for delivery updates." />
    </div>
  );
  else main = (
    <div className="co-card">
      <p className="co-who"><span>Signed in as <b>{user.name}</b> <i className="sep">·</i> +91 {user.phone.slice(0, 5)} {user.phone.slice(5)}</span><button className="tlink" onClick={signOut}>Not you?</button></p>
      <Delivery onPaying={() => setPaying(true)} onSignedOut={() => { setNote('Your sign-in expired. Please sign in again.'); setUser(null); }} />
    </div>
  );

  return (
    <>
      <header className="co-nav">
        <a href="/" className="brand" aria-label="ADRENL home"><Mark className="brand-mark" title="" /><span>ADRENL</span></a>
        <span className="co-secure"><Lock />Secure checkout</span>
        <a className="tlink" href="/?bag=open">Back to bag</a>
      </header>
      <main id="main" className="wrap co">
        <div className="co-main">
          <Steps at={step} />
          {main}
        </div>
        {ready && bag.length > 0 && (
          <aside className="co-sum" aria-label="Order summary">
            <button className="co-sum-toggle" aria-expanded={sumOpen} onClick={() => { setSumOpen((o) => !o); if (!sumOpen) track('summary_open'); }}>
              <span>{sumOpen ? 'Hide' : 'Show'} order summary <i className="sep">·</i> {units} {units === 1 ? 'tee' : 'tees'}</span><b>{rupee(total)}</b>
            </button>
            <div className={`co-sum-body ${sumOpen ? 'open' : ''}`}>
              <h2 className="co-sum-t">Order summary</h2>
              <BagLines where="checkout" />
              <dl className="sum">
                <div><dt>Subtotal</dt><dd>{rupee(subtotal)}</dd></div>
                <div><dt>Shipping</dt><dd>{cat.shipping ? rupee(cat.shipping) : 'Free'}</dd></div>
                <div className="sum-t"><dt>Total</dt><dd>{rupee(total)}</dd></div>
              </dl>
              <ul className="co-trust">
                <li><CheckIcon />Free shipping across India</li>
                <li><CheckIcon />One free size exchange within 7 days</li>
                <li><CheckIcon />UPI, cards and netbanking on Zoho Payments</li>
              </ul>
            </div>
          </aside>
        )}
      </main>
    </>
  );
}
