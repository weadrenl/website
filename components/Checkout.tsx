'use client';
import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react';
import type { Address, Order, SavedAddress, User } from '@/lib/catalog';
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

/**
 * Four boxes, one real input laid over them. The input keeps paste and SMS autofill (one-time-code) working; the
 * boxes show the digits and a caret in the box being typed into, so nothing drifts out of line.
 */
function OtpBoxes({ value, onChange, inputRef }: { value: string; onChange: (v: string) => void; inputRef: RefObject<HTMLInputElement | null> }) {
  const [focus, setFocus] = useState(false);
  const at = Math.min(value.length, 3);
  return (
    <div className="otp">
      <input ref={inputRef} className="otp-in" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={4}
        aria-label="4-digit code" value={value} onChange={(e) => onChange(digits(e.target.value, 4))}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} />
      {[0, 1, 2, 3].map((i) => (
        <span key={i} aria-hidden="true" className={`otp-box ${value[i] ? 'full' : ''} ${focus && i === at ? 'on' : ''}`}>
          {value[i] ?? (focus && i === at ? <i className="caret" /> : null)}
        </span>
      ))}
    </div>
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
  const verify = async (c = code) => {
    if (c.length < 4) return setErr('Enter the 4-digit code.');
    if (isNew && name.trim().length < 2) return setErr('Tell us your name.');
    setBusy(true); setErr('');
    try {
      const r = await api<{ user: User }>('/auth/verify', { phone, code: c, name: name.trim() });
      setUser(r.user); onDone(r.user);
    } catch (x) { setErr((x as Error).message); setCode(''); codeRef.current?.focus(); setBusy(false); }
  };
  // A returning customer is signed in as soon as the fourth digit lands.
  const onCode = (v: string) => { setCode(v); setErr(''); if (v.length === 4 && !isNew && !busy) verify(v); };

  return step === 'phone' ? (
    <form className="form" onSubmit={start} noValidate>
      <h3 className="form-t">Sign in</h3>
      <p className="form-p">{intro || 'Use your mobile number. No password to remember.'}</p>
      <label className={`field ${err ? 'bad' : ''}`}>
        <span className="field-l">Mobile number</span>
        <span className="tel">
          <span className="tel-cc" aria-hidden="true">+91</span>
          <input type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit number" value={phone} aria-label="Mobile number, +91"
            onChange={(e) => { setPhone(digits(e.target.value.replace(/^\+?91(?=\d{10})/, ''), 10)); setErr(''); }} autoFocus />
        </span>
        {err && <span className="field-e" role="alert">{err}</span>}
      </label>
      <button className="btn btn-wide" disabled={busy} aria-busy={busy}>{busy ? 'Sending…' : 'Send code'}</button>
    </form>
  ) : (
    <form className="form" onSubmit={(e) => { e.preventDefault(); verify(); }} noValidate>
      <h3 className="form-t">Enter the code</h3>
      <p className="form-p">Sent to {fmtPhone(phone)} <i className="sep">·</i> <button type="button" className="tlink" onClick={() => { setStep('phone'); setErr(''); }}>Change number</button></p>
      {test && <p className="note">Test mode: the code is <b>1234</b>.</p>}
      <div className="field">
        <span className="field-l">4-digit code</span>
        <OtpBoxes value={code} onChange={onCode} inputRef={codeRef} />
      </div>
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

const EMPTY: Address = { name: '', line1: '', line2: '', city: '', state: '', pin: '' };
type Errs = Partial<Record<keyof Address | 'email', string>>;

/** The address fields, for a first or an extra delivery address. */
function AddressForm({ f, set, errs }: { f: Address; set: (k: keyof Address) => (e: { target: { value: string } }) => void; errs: Errs }) {
  return (
    <div className="addr-form">
      <Field label="Full name" error={errs.name}><input name="name" autoComplete="name" value={f.name} onChange={set('name')} maxLength={80} /></Field>
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
    </div>
  );
}

/**
 * Where it goes and the pay button. Saved addresses are offered first (the last one used is picked); with none
 * saved, the address form opens straight away. A new address is saved when the order is placed.
 */
function Details({ onBack, onPaying, onSignedOut }: { onBack: () => void; onPaying: () => void; onSignedOut: () => void }) {
  const { user, bag, cat } = useStore();
  const saved = user?.addresses ?? [];
  const [sel, setSel] = useState<string>(saved[0]?.id ?? 'new');
  const [f, setF] = useState<Address>({ ...EMPTY, name: user?.name ?? '' });
  const [email, setEmail] = useState(user?.email ?? '');
  const [editEmail, setEditEmail] = useState(!user?.email);
  const [errs, setErrs] = useState<Errs>({});
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof Address) => (e: { target: { value: string } }) => {
    setF((x) => ({ ...x, [k]: k === 'pin' ? digits(e.target.value, 6) : e.target.value }));
    setErrs((x) => ({ ...x, [k]: undefined })); setErr('');
  };
  const pick = (id: string) => { setSel(id); setErrs({}); setErr(''); };
  const subtotal = bag.reduce((s, i) => s + i.price, 0), total = subtotal + cat.shipping;
  const isNew = sel === 'new' || !saved.some((a) => a.id === sel);

  const pay = async (e: FormEvent) => {
    e.preventDefault();
    const v: Errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { v.email = 'Add a valid email. Your receipt goes here.'; setEditEmail(true); }
    if (isNew) {
      if (f.name.trim().length < 2) v.name = 'Add the name for delivery.';
      if (f.line1.trim().length < 5) v.line1 = 'Add the house number and street.';
      if (f.city.trim().length < 2) v.city = 'Add the city.';
      if (!f.state) v.state = 'Pick the state.';
      if (!/^[1-9]\d{5}$/.test(f.pin)) v.pin = 'Add the 6-digit PIN code.';
    }
    setErrs(v);
    if (Object.keys(v).length) {
      setTimeout(() => (document.querySelector(`.form [name="${Object.keys(v).find((k) => k !== 'email') ?? 'email'}"]`) as HTMLElement | null)?.focus(), 0);
      return;
    }
    setBusy(true); setErr('');
    try {
      const r = await api<{ order: string; url: string }>('/checkout', {
        items: bag.map((i) => ({ id: i.id, size: i.size })), email: email.trim(),
        ...(isNew ? { address: f } : { addressId: sel }),
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
      <div className="form-head"><h3 className="form-t">{saved.length ? 'Deliver to' : 'Delivery address'}</h3><button type="button" className="tlink" onClick={onBack}>Back to bag</button></div>
      <p className="form-p">Signed in as {user && fmtPhone(user.phone)}</p>
      {saved.length > 0 && (
        <div className="addrs" role="radiogroup" aria-label="Delivery address">
          {saved.map((a) => (
            <label key={a.id} className={`addr ${sel === a.id ? 'on' : ''}`}>
              <input type="radio" name="addr" checked={sel === a.id} onChange={() => pick(a.id)} />
              <span className="addr-dot" aria-hidden="true" />
              <span className="addr-t"><b>{a.name}</b><span>{a.line1}{a.line2 ? `, ${a.line2}` : ''}</span><span>{a.city}, {a.state} {a.pin}</span></span>
            </label>
          ))}
          <label className={`addr addr-new ${isNew ? 'on' : ''}`}>
            <input type="radio" name="addr" checked={isNew} onChange={() => pick('new')} />
            <span className="addr-dot" aria-hidden="true" />
            <span className="addr-t"><b>Add a new address</b></span>
          </label>
        </div>
      )}
      {isNew && <AddressForm f={f} set={set} errs={errs} />}
      {editEmail ? (
        <Field label="Email" error={errs.email} hint="For the receipt and dispatch updates.">
          <input name="email" type="email" inputMode="email" autoComplete="email" value={email} maxLength={120}
            onChange={(e) => { setEmail(e.target.value); setErrs((x) => ({ ...x, email: undefined })); setErr(''); }} />
        </Field>
      ) : (
        <p className="contact"><span className="field-l">Receipt to</span><span className="contact-v">{email}</span><button type="button" className="tlink" onClick={() => setEditEmail(true)}>Change</button></p>
      )}

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

export const STATUS: Record<Order['status'], string> = { pending: 'Confirming', paid: 'Confirmed', failed: 'Not paid', expired: 'Not completed', amount_mismatch: 'Under review' };
export const statusOf = (o: Order) => (o.status === 'pending' && o.stage === 'awaiting' ? 'Awaiting payment' : STATUS[o.status]);
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
  const remove = async (id: string) => {
    try { const r = await api<{ addresses: SavedAddress[] }>('/addresses/remove', { id }); if (user) setUser({ ...user, addresses: r.addresses }); }
    catch (x) { setErr((x as Error).message); }
  };

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
                      <span className="o-top"><b>{o.id}</b><i className={`badge s-${o.status}`}>{statusOf(o)}</i></span>
                      <span>{o.items.map((i) => `${i.name} ${i.size}`).join(', ')}</span>
                      <span className="o-meta">{date(o.created)} <i className="sep">·</i> {rupee(o.amount)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {user.addresses.length > 0 && (
              <div className="acct-sec">
                <p className="eyebrow">Saved addresses</p>
                <ul className="saved">
                  {user.addresses.map((a) => (
                    <li key={a.id}>
                      <span className="addr-t"><b>{a.name}</b><span>{a.line1}{a.line2 ? `, ${a.line2}` : ''}</span><span>{a.city}, {a.state} {a.pin}</span></span>
                      <button className="tlink" onClick={() => remove(a.id)} aria-label={`Remove address: ${a.line1}`}>Remove</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button className="tlink back" onClick={out}>Sign out</button>
          </div>
        )}
      </div>
    </Modal>
  );
}
