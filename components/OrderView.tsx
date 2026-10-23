'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Order } from '@/lib/catalog';
import { BUSINESS } from '@/lib/data';
import { api, ApiError } from '@/lib/api';
import { useStore } from './Store';
import { Login, STATUS } from './Checkout';

const time = (s: string) => new Date(s).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
import { rupee } from './hooks';

const POLL_MS = 2500, PATIENCE_MS = 90000;

/**
 * Where Zoho sends the customer after paying (via pay.adrenl.com/return). The backend has already asked Zoho; if the
 * bank is still deciding, this page keeps asking for a while and says so plainly, then shows the outcome.
 */
export function OrderView() {
  const { user, clearBag } = useStore();
  const [id, setId] = useState<string | null | undefined>(undefined);
  const [order, setOrder] = useState<Order | null>(null);
  const [err, setErr] = useState('');
  const [slow, setSlow] = useState(false);
  const started = useRef(0);

  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get('id');
    setId(v && /^AD-[A-Z0-9]{6}$/.test(v) ? v : null);
  }, []);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const r = await api<{ order: Order }>(`/orders/${id}`);
      setOrder(r.order); setErr('');
      if (r.order.status === 'paid') clearBag();
    } catch (x) {
      setErr(x instanceof ApiError && x.status === 401 ? 'signin' : (x as Error).message);
    }
  }, [id, clearBag]);

  useEffect(() => { if (id && user) { started.current = Date.now(); load(); } }, [id, user, load]);

  // Still pending: keep asking, calmly (slower while nobody has tried to pay yet).
  useEffect(() => {
    if (order?.status !== 'pending') return;
    const t = setTimeout(() => {
      if (order.stage === 'confirming' && Date.now() - started.current > PATIENCE_MS) setSlow(true);
      load();
    }, order.stage === 'awaiting' ? POLL_MS * 4 : slow ? POLL_MS * 4 : POLL_MS);
    return () => clearTimeout(t);
  }, [order, slow, load]);

  let body: ReactNode;
  if (id === null) {
    body = <Msg t="We could not find that order." p="If you just paid, open Your orders from the menu, or contact us with your payment details." cta={['/', 'Back to ADRENL']} />;
  } else if (user === null || err === 'signin') {
    body = <div className="ord-login"><Login onDone={() => setErr('')} intro="Sign in with the number you ordered with to see this order." /></div>;
  } else if (err && !order) {
    body = <Msg t="We could not load your order." p={err} retry={load} />;
  } else if (order?.status === 'pending' && order.stage === 'awaiting') {
    body = (
      <div className="ord-done">
        <p className="eyebrow">Order {order.id} <i className="sep">·</i> Awaiting payment</p>
        <h1>This order is not paid yet.</h1>
        <p className="ord-lead">Nothing has been charged. You can finish paying on the secure Zoho page{order.expires ? ` until ${time(order.expires)}` : ''}; after that the link closes and the order is dropped.</p>
        <Summary o={order} />
        <div className="ord-actions">
          {order.payUrl && <a className="btn" href={order.payUrl}>Continue to payment</a>}
          <a className="tlink" href="/?bag=open">Back to bag</a>
        </div>
      </div>
    );
  } else if (!order || order.status === 'pending') {
    body = (
      <div className="ord-wait" role="status" aria-live="polite">
        <span className="spin big" aria-hidden="true" />
        <h1>{slow ? 'Still waiting for your bank.' : 'Confirming your payment…'}</h1>
        <p>{slow
          ? 'Some banks take a few minutes. You can keep this page open or close it: the order updates by itself, and you will find it under Your orders.'
          : 'This usually takes a few seconds. Please keep this page open.'}</p>
        {id && <p className="fine">Order {id}</p>}
      </div>
    );
  } else if (order.status === 'paid') {
    body = (
      <div className="ord-done">
        <p className="eyebrow">Order {order.id} <i className="sep">·</i> {STATUS.paid}</p>
        <h1>You&apos;re on the route, <em>{order.name.split(' ')[0]}.</em></h1>
        <p className="ord-lead">Payment received: {rupee(order.amount)}. Updates go to {order.email}.</p>
        <Summary o={order} />
        <div className="ord-next">
          <h2>What happens next</h2>
          <ol>
            <li><b>Made for you.</b> Batch 01 is cut, sewn and printed in Tiruppur after the drop.</li>
            <li><b>Dispatch.</b> Tracking comes to your phone and email once it ships.</li>
            <li><b>Wrong size?</b> One free exchange within 7 days of delivery.</li>
          </ol>
        </div>
        <a className="btn" href="/">Back to ADRENL</a>
      </div>
    );
  } else {
    const review = order.status === 'amount_mismatch', never = order.status === 'expired';
    body = (
      <div className="ord-done">
        <p className="eyebrow">Order {order.id} <i className="sep">·</i> {STATUS[order.status]}</p>
        <h1>{review ? 'We need to check this payment.' : never ? 'This payment was not completed.' : 'The payment did not go through.'}</h1>
        <p className="ord-lead">{review
          ? `Something about this payment does not match the order. We will call you on ${order.phone} to sort it out.`
          : never
            ? 'The payment page was opened but nothing was paid, so no order was placed and nothing was charged. Your bag is still saved.'
            : 'No order was placed and your bag is still saved. If money left your account, your bank returns it automatically; if it does not, call us with this order number.'}</p>
        <Summary o={order} />
        <div className="ord-actions">
          {!review && <a className="btn" href="/?bag=open">Try again</a>}
          <a className="tlink" href={`tel:${BUSINESS.tel}`}>Call {BUSINESS.phone}</a>
        </div>
      </div>
    );
  }

  return <main id="main" className="wrap ord">{body}</main>;
}

function Summary({ o }: { o: Order }) {
  const a = o.address;
  return (
    <div className="ord-sum">
      <ul>{o.items.map((i, n) => <li key={n}><span><b>{i.name}</b> {i.colour}, size {i.size}</span><span>{rupee(i.price)}</span></li>)}</ul>
      <dl>
        <div><dt>Shipping</dt><dd>{o.shipping ? rupee(o.shipping) : 'Free'}</dd></div>
        <div className="sum-t"><dt>Total</dt><dd>{rupee(o.amount)}</dd></div>
      </dl>
      <p className="ord-addr"><span className="eyebrow">Delivering to</span>{o.name}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />{a.city}, {a.state} {a.pin}</p>
    </div>
  );
}

function Msg({ t, p, cta, retry }: { t: string; p: string; cta?: [string, string]; retry?: () => void }) {
  return (
    <div className="ord-done">
      <h1>{t}</h1>
      <p className="ord-lead">{p}</p>
      <div className="ord-actions">
        {retry && <button className="btn" onClick={retry}>Try again</button>}
        {cta && <a className="btn" href={cta[0]}>{cta[1]}</a>}
      </div>
    </div>
  );
}
