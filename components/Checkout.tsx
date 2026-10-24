'use client';
import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react';
import type { Address, Order, SavedAddress, User } from '@/lib/catalog';
import { api, ApiError } from '@/lib/api';
import { useStore } from './Store';
import { rupee } from './hooks';
import { Modal } from './Modal';
import { track, visitIds } from '@/lib/track';

const STATES = ['Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

const digits = (s: string, n: number) => s.replace(/\D/g, '').slice(0, n);
const fmtPhone = (p: string) => `+91 ${p.slice(0, 5)} ${p.slice(5)}`;
/** What people paste or autofill: '+91 98765 43210', '098765 43210', '9876543210' all become the 10 digits. */
const national = (v: string) => { const d = v.replace(/\D/g, ''); return (d.length > 10 ? d.replace(/^(91|0)/, '') : d).slice(0, 10); };

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
export function Login({ onDone, intro, ctx }: { onDone: (u: User) => void; intro?: string; ctx: 'checkout' | 'account' | 'order' }) {
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
    if (!/^[6-9]\d{9}$/.test(phone)) { track('form_error', { form: 'login', field: 'phone' }); return setErr('Enter your 10-digit mobile number.'); }
    setBusy(true); setErr('');
    try {
      const r = await api<{ newUser: boolean; testMode: boolean }>('/auth/start', { phone });
      setIsNew(r.newUser); setTest(r.testMode); setStep('code'); setCode('');
      track('login_code_sent', { ctx, new: r.newUser });
    } catch (x) { setErr((x as Error).message); track('login_error', { ctx, msg: (x as Error).message }); } finally { setBusy(false); }
  };
  const verify = async (c = code) => {
    if (c.length < 4) return setErr('Enter the 4-digit code.');
    if (isNew && name.trim().length < 2) return setErr('Tell us your name.');
    setBusy(true); setErr('');
    try {
      const r = await api<{ user: User }>('/auth/verify', { phone, code: c, name: name.trim() });
      track('login_done', { ctx, new: isNew });
      setUser(r.user); onDone(r.user);
    } catch (x) { setErr((x as Error).message); track('login_error', { ctx, msg: (x as Error).message }); setCode(''); codeRef.current?.focus(); setBusy(false); }
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
            onChange={(e) => { setPhone(national(e.target.value)); setErr(''); }} autoFocus />
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
export function Delivery({ onPaying, onSignedOut }: { onPaying: () => void; onSignedOut: () => void }) {
  const { user, bag, cat, subtotal, units } = useStore();
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
  const pick = (id: string) => { setSel(id); setErrs({}); setErr(''); track('address_choice', { saved: id !== 'new' }); };
  const total = subtotal + cat.shipping;
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
    Object.keys(v).forEach((field) => track('form_error', { form: 'delivery', field }));
    if (Object.keys(v).length) {
      setTimeout(() => (document.querySelector(`.form [name="${Object.keys(v).find((k) => k !== 'email') ?? 'email'}"]`) as HTMLElement | null)?.focus(), 0);
      return;
    }
    setBusy(true); setErr('');
    track('pay_click', { value: total, units, saved: !isNew });
    try {
      const r = await api<{ order: string; url: string }>('/checkout', {
        items: bag.map((i) => ({ id: i.id, size: i.size, qty: i.qty })), email: email.trim(),
        ...(isNew ? { address: f } : { addressId: sel }), ...visitIds(),
      });
      onPaying();
      window.location.assign(r.url);
    } catch (x) {
      track('pay_error', { msg: (x as Error).message });
      if (x instanceof ApiError && x.status === 401) return onSignedOut();
      setErr((x as Error).message); setBusy(false);
    }
  };

  return (
    <form className="form" onSubmit={pay} noValidate>
      <h2 className="form-t">{saved.length ? 'Deliver to' : 'Delivery address'}</h2>
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

      <div className="pay-box">
        <div className="pay-total"><span>Total <small>{units} {units === 1 ? 'tee' : 'tees'}, shipping {cat.shipping ? rupee(cat.shipping) : 'free'}</small></span><b>{rupee(total)}</b></div>
        <p className={`warn ${err ? 'show' : ''}`} role="alert">{err}</p>
        <button className="btn btn-wide" disabled={busy || !bag.length} aria-busy={busy}>{busy ? 'Creating your order…' : `Pay ${rupee(total)} securely`}</button>
        <p className="fine center">Next: Zoho Payments&apos; secure page. UPI, cards and netbanking. Prices include taxes.</p>
      </div>
    </form>
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
        {user === null && <div className="bag-step"><Login ctx="account" onDone={() => {}} intro="Sign in with your mobile number to see your orders." /></div>}
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
                      <span>{o.items.map((i) => `${i.name} ${i.size}${i.qty > 1 ? ` ×${i.qty}` : ''}`).join(', ')}</span>
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
