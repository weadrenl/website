'use client';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import type { Address, Order, User } from '@/lib/catalog';
import { SITE } from '@/lib/data';
import { img } from '@/lib/assets';
import { api, ApiError } from '@/lib/api';
import { useStore } from './Store';
import { rupee } from './hooks';
import { Modal } from './Modal';

const STATES = ['Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

const digits = (s: string, n: number) => s.replace(/\D/g, '').slice(0, n);
const fmtPhone = (p: string) => `+91 ${p.slice(0, 5)} ${p.slice(5)}`;

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className={`field ${error ? 'bad' : ''}`}>
      <span className="field-l">{label}</span>
      {children}
      {error ? <span className="field-e" role="alert">{error}</span> : hint ? <span className="field-h">{hint}</span> : null}
    </label>
  );
}

/** Phone number, then the code. New customers also give a name. */
export function Login({ onDone, intro }: { onDone: (u: User) => void; intro?: string }) {
  const { setUser } = useStore();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [test, setTest] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (step === 'code') codeRef.current?.focus(); }, [step]);

  const start = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) return setErr('Enter your 10-digit mobile number.');
    setBusy(true); setErr('');
    try {
      const r = await api<{ newUser: boolean; testMode: boolean }>('/auth/start', { phone });
      setIsNew(r.newUser); setTest(r.testMode); setStep('code'); setCode('');
    } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  };
  const verify = async (e: FormEvent) => {
    e.preventDefault();
    if (code.length < 4) return setErr('Enter the 4-digit code.');
    if (isNew && name.trim().length < 2) return setErr('Tell us your name.');
    setBusy(true); setErr('');
    try {
      const r = await api<{ user: User }>('/auth/verify', { phone, code, name: name.trim() });
      setUser(r.user); onDone(r.user);
    } catch (x) { setErr((x as Error).message); setBusy(false); }
  };

  return step === 'phone' ? (
    <form className="form" onSubmit={start} noValidate>
      <h3 className="form-t">Sign in</h3>
      <p className="form-p">{intro || 'Use your mobile number. No password to remember.'}</p>
      <Field label="Mobile number" error={err}>
        <span className="field-pre"><i>+91</i>
          <input type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="98765 43210" value={phone}
            onChange={(e) => { setPhone(digits(e.target.value.replace(/^\+?91(?=\d{10})/, ''), 10)); setErr(''); }} autoFocus />
        </span>
      </Field>
      <button className="btn btn-wide" disabled={busy} aria-busy={busy}>{busy ? 'Sending…' : 'Send code'}</button>
    </form>
  ) : (
    <form className="form" onSubmit={verify} noValidate>
      <h3 className="form-t">Enter the code</h3>
      <p className="form-p">Sent to {fmtPhone(phone)}. <button type="button" className="tlink" onClick={() => { setStep('phone'); setErr(''); }}>Change</button></p>
      {test && <p className="note">Test mode: the code is <b>1234</b>.</p>}
      <Field label="4-digit code">
        <input ref={codeRef} className="otp" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={4} placeholder="····" value={code}
          onChange={(e) => { setCode(digits(e.target.value, 4)); setErr(''); }} />
      </Field>
      {isNew && (
        <Field label="Your name">
          <input type="text" autoComplete="name" value={name} onChange={(e) => { setName(e.target.value); setErr(''); }} maxLength={80} />
        </Field>
      )}
      <p className={`warn ${err ? 'show' : ''}`} role="alert">{err}</p>
      <button className="btn btn-wide" disabled={busy} aria-busy={busy}>{busy ? 'Checking…' : isNew ? 'Create account' : 'Sign in'}</button>
    </form>
  );
}

type Form = { name: string; email: string } & Address;

/** Delivery details and the pay button. On success the browser leaves for Zoho's secure payment page. */
function Details({ onBack, onPaying, onSignedOut }: { onBack: () => void; onPaying: () => void; onSignedOut: () => void }) {
  const { user, bag, cat } = useStore();
  const a = user?.address;
  const [f, setF] = useState<Form>({
    name: user?.name ?? '', email: user?.email ?? '',
    line1: a?.line1 ?? '', line2: a?.line2 ?? '', city: a?.city ?? '', state: a?.state ?? '', pin: a?.pin ?? '',
  });
  const [errs, setErrs] = useState<Partial<Record<keyof Form, string>>>({});
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof Form) => (e: { target: { value: string } }) => {
    setF((x) => ({ ...x, [k]: k === 'pin' ? digits(e.target.value, 6) : e.target.value }));
    setErrs((x) => ({ ...x, [k]: undefined })); setErr('');
  };
  const subtotal = bag.reduce((s, i) => s + i.price, 0), total = subtotal + cat.shipping;

  const pay = async (e: FormEvent) => {
    e.preventDefault();
    const v: typeof errs = {};
    if (f.name.trim().length < 2) v.name = 'Add the name for delivery.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) v.email = 'Add a valid email. Your receipt goes here.';
    if (f.line1.trim().length < 5) v.line1 = 'Add the house number and street.';
    if (f.city.trim().length < 2) v.city = 'Add the city.';
    if (!f.state) v.state = 'Pick the state.';
    if (!/^[1-9]\d{5}$/.test(f.pin)) v.pin = 'Add the 6-digit PIN code.';
    setErrs(v);
    if (Object.keys(v).length) {
      (document.querySelector(`.form [name="${Object.keys(v)[0]}"]`) as HTMLElement | null)?.focus();
      return;
    }
    setBusy(true); setErr('');
    try {
      const r = await api<{ order: string; url: string }>('/checkout', {
        items: bag.map((i) => ({ id: i.id, size: i.size })), name: f.name, email: f.email,
        address: { line1: f.line1, line2: f.line2, city: f.city, state: f.state, pin: f.pin },
      });
      onPaying();
      window.location.assign(r.url);
    } catch (x) {
      if (x instanceof ApiError && x.status === 401) return onSignedOut();
      setErr((x as Error).message); setBusy(false);
    }
  };

  return (
    <form className="form" onSubmit={pay} noValidate>
      <div className="form-head"><h3 className="form-t">Delivery</h3><button type="button" className="tlink" onClick={onBack}>Back to bag</button></div>
      <p className="form-p">Signed in as {user && fmtPhone(user.phone)}</p>
      <Field label="Full name" error={errs.name}><input name="name" autoComplete="name" value={f.name} onChange={set('name')} maxLength={80} /></Field>
      <Field label="Email" error={errs.email} hint="For the receipt and dispatch updates."><input name="email" type="email" inputMode="email" autoComplete="email" value={f.email} onChange={set('email')} maxLength={120} /></Field>
      <Field label="House, building, street" error={errs.line1}><input name="line1" autoComplete="address-line1" value={f.line1} onChange={set('line1')} maxLength={160} /></Field>
      <Field label="Area, landmark (optional)"><input name="line2" autoComplete="address-line2" value={f.line2} onChange={set('line2')} maxLength={160} /></Field>
      <div className="field-row">
        <Field label="City" error={errs.city}><input name="city" autoComplete="address-level2" value={f.city} onChange={set('city')} maxLength={60} /></Field>
        <Field label="PIN code" error={errs.pin}><input name="pin" inputMode="numeric" autoComplete="postal-code" value={f.pin} onChange={set('pin')} /></Field>
      </div>
      <Field label="State" error={errs.state}>
        <select name="state" autoComplete="address-level1" value={f.state} onChange={set('state')}>
          <option value="">Choose…</option>
          {STATES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </Field>

      <dl className="sum">
        <div><dt>{bag.length} {bag.length === 1 ? 'tee' : 'tees'}</dt><dd>{rupee(subtotal)}</dd></div>
        <div><dt>Shipping</dt><dd>{cat.shipping ? rupee(cat.shipping) : 'Free'}</dd></div>
        <div className="sum-t"><dt>Total</dt><dd>{rupee(total)}</dd></div>
      </dl>
      <p className={`warn ${err ? 'show' : ''}`} role="alert">{err}</p>
      <button className="btn btn-wide" disabled={busy} aria-busy={busy}>{busy ? 'Creating your order…' : `Pay ${rupee(total)}`}</button>
      <p className="fine center">You pay on Zoho Payments&apos; secure page: UPI, cards and more. Prices include taxes.</p>
    </form>
  );
}

function Paying() {
  return (
    <div className="state" role="status" aria-live="polite">
      <span className="spin" aria-hidden="true" />
      <h3 className="form-t">Opening secure payment</h3>
      <p className="form-p">Taking you to Zoho Payments. Please don&apos;t close this tab.</p>
    </div>
  );
}

type Step = 'bag' | 'login' | 'details' | 'paying';

export function BagDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { bag, removeItem, product, cat, user } = useStore();
  const [step, setStep] = useState<Step>('bag');
  const [note, setNote] = useState('');
  const total = bag.reduce((s, i) => s + i.price, 0);

  useEffect(() => { if (!open) setStep((s) => (s === 'paying' ? s : 'bag')); }, [open]);
  useEffect(() => { if (!bag.length) setStep((s) => (s === 'paying' ? s : 'bag')); }, [bag.length]);
  // Coming back from the payment page with the browser's Back button: show the form again, not the spinner.
  useEffect(() => {
    const f = (e: PageTransitionEvent) => { if (e.persisted) setStep((s) => (s === 'paying' ? 'details' : s)); };
    window.addEventListener('pageshow', f);
    return () => window.removeEventListener('pageshow', f);
  }, []);

  const checkout = () => { setNote(''); setStep(user ? 'details' : 'login'); };
  const title = { bag: `Your bag${bag.length ? ` · ${bag.length}` : ''}`, login: 'Checkout · Sign in', details: 'Checkout · Delivery', paying: 'Checkout · Payment' }[step];

  return (
    <Modal open={open} onClose={step === 'paying' ? () => {} : onClose} label="Your bag" side>
      <div className="bag">
        <div className="modal-top"><span className="eyebrow">{title}</span>{step !== 'paying' && <button className="x" onClick={onClose}>Close</button>}</div>
        {step === 'login' && (
          <div className="bag-step">
            <Login intro={note || 'Sign in with your mobile number to place the order. It also keeps your orders in one place.'} onDone={() => setStep('details')} />
            <button className="tlink back" onClick={() => setStep('bag')}>Back to bag</button>
          </div>
        )}
        {step === 'details' && <div className="bag-step"><Details onBack={() => setStep('bag')} onPaying={() => setStep('paying')} onSignedOut={() => { setNote('Your sign-in expired. Please sign in again.'); setStep('login'); }} /></div>}
        {step === 'paying' && <Paying />}
        {step === 'bag' && (bag.length === 0 ? (
          <div className="bag-empty"><p>Nothing in here yet.</p><a className="tlink" href="#shop" onClick={onClose}>Pick your route</a></div>
        ) : (
          <ul className="bag-list">
            {bag.map((it) => {
              const p = product(it.id);
              return (
                <li key={it.key}>
                  {p ? <img src={img(p.shots[0].cut)} alt="" width={64} height={128} /> : <i />}
                  <div><b>{it.name}</b><span>{it.colour} <i className="sep">·</i> Size {it.size}</span><span>Batch 01 preorder</span></div>
                  <div className="bag-r"><b>{rupee(it.price)}</b><button className="tlink" onClick={() => removeItem(it.key)}>Remove</button></div>
                </li>
              );
            })}
          </ul>
        ))}
        {step === 'bag' && (
          <div className="bag-foot">
            <div className="bag-sum"><span>Subtotal</span><b>{rupee(total)}</b></div>
            <p className="fine">{cat.open ? `Shipping ${cat.shipping ? rupee(cat.shipping) : 'is free'}. Prices include taxes.` : 'Shipping and taxes are shown at checkout.'}</p>
            {cat.open
              ? <button className="btn btn-wide" disabled={!bag.length || user === undefined} onClick={checkout}>Checkout</button>
              : <button className="btn btn-wide" disabled>Checkout opens {SITE.dropShort}</button>}
            <p className="fine">{cat.open ? 'Nothing is charged until you pay on the secure payment page.' : 'Your bag is saved on this device. Nothing is reserved or charged.'}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

export const STATUS: Record<Order['status'], string> = { pending: 'Confirming', paid: 'Confirmed', failed: 'Not paid', amount_mismatch: 'Under review' };
const date = (s: string) => new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/** Sign in, or see your orders and sign out. */
export function Account({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, setUser } = useStore();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open || !user) return;
    setOrders(null); setErr('');
    api<{ orders: Order[] }>('/orders').then((r) => setOrders(r.orders)).catch((x) => {
      if (x instanceof ApiError && x.status === 401) setUser(null); else setErr((x as Error).message);
    });
  }, [open, user, setUser]);

  const out = async () => { await api('/auth/logout', {}).catch(() => {}); setUser(null); };

  return (
    <Modal open={open} onClose={onClose} label="Your account" side>
      <div className="bag">
        <div className="modal-top"><span className="eyebrow">{user ? 'Your orders' : 'Account'}</span><button className="x" onClick={onClose}>Close</button></div>
        {user === undefined && <div className="state"><span className="spin" aria-hidden="true" /></div>}
        {user === null && <div className="bag-step"><Login onDone={() => {}} intro="Sign in with your mobile number to see your orders." /></div>}
        {user && (
          <div className="acct">
            <p className="acct-who"><b>{user.name}</b><span>{fmtPhone(user.phone)}</span></p>
            {err && <p className="warn show">{err}</p>}
            {orders === null && !err && <div className="state"><span className="spin" aria-hidden="true" /></div>}
            {orders?.length === 0 && <p className="form-p">No orders yet. <a className="tlink" href="/#shop" onClick={onClose}>Pick your route</a></p>}
            {orders && orders.length > 0 && (
              <ul className="orders">
                {orders.map((o) => (
                  <li key={o.id}>
                    <a href={`/order?id=${o.id}`}>
                      <span className="o-top"><b>{o.id}</b><i className={`badge s-${o.status}`}>{STATUS[o.status]}</i></span>
                      <span>{o.items.map((i) => `${i.name} ${i.size}`).join(', ')}</span>
                      <span className="o-meta">{date(o.created)} <i className="sep">·</i> {rupee(o.amount)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <button className="tlink back" onClick={out}>Sign out</button>
          </div>
        )}
      </div>
    </Modal>
  );
}
