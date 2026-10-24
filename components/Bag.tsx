'use client';
import { useEffect, useRef, useState } from 'react';
import { SITE } from '@/lib/data';
import { img } from '@/lib/assets';
import { track } from '@/lib/track';
import { useStore, MAX_UNITS, type BagItem } from './Store';
import { rupee } from './hooks';
import { Modal } from './Modal';
import { CheckIcon } from './Engrave';
import type { Added } from './Shop';

/** − n + with the limits spelled out to screen readers. */
export function Qty({ it, where }: { it: BagItem; where: 'bag' | 'checkout' }) {
  const { setQty, units } = useStore();
  const change = (q: number) => { setQty(it.key, q); track('qty_change', { id: it.id, size: it.size, qty: q, where }); };
  return (
    <div className="qty" role="group" aria-label={`Quantity of ${it.name} size ${it.size}`}>
      <button type="button" onClick={() => change(it.qty - 1)} disabled={it.qty <= 1} aria-label="One fewer">−</button>
      <output aria-live="polite">{it.qty}</output>
      <button type="button" onClick={() => change(it.qty + 1)} disabled={units >= MAX_UNITS} aria-label="One more">+</button>
    </div>
  );
}

/** The bag's lines: picture, design, size, quantity, line price. Used by the drawer and the checkout summary. */
export function BagLines({ where, compact = false }: { where: 'bag' | 'checkout'; compact?: boolean }) {
  const { bag, product, removeItem } = useStore();
  return (
    <ul className={`lines ${compact ? 'is-compact' : ''}`}>
      {bag.map((it) => {
        const p = product(it.id);
        return (
          <li key={it.key}>
            <span className="line-img">{p && <img src={img(p.shots[0].cut)} alt="" width={64} height={128} />}{compact && it.qty > 1 && <i className="line-n">{it.qty}</i>}</span>
            <span className="line-t">
              <b>{it.name}</b>
              <span>{it.colour} <i className="sep">·</i> Size {it.size}</span>
              {!compact && <Qty it={it} where={where} />}
            </span>
            <span className="line-r">
              <b>{rupee(it.price * it.qty)}</b>
              {it.qty > 1 && <small>{rupee(it.price)} each</small>}
              {!compact && <button className="tlink" onClick={() => { removeItem(it.key); track('remove_from_bag', { id: it.id, size: it.size, where }); }}>Remove</button>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** The mini cart. Checkout itself lives on /checkout. */
export function BagDrawer({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (i: number) => void }) {
  const { bag, cat, units, subtotal, ready } = useStore();
  const missing = cat.products.map((p, i) => ({ p, i })).filter(({ p }) => !bag.some((x) => x.id === p.id));
  useEffect(() => { if (open) track('view_bag', { units, value: subtotal }); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal open={open} onClose={onClose} label="Your bag" side>
      <div className="bag">
        <div className="modal-top"><span className="eyebrow">Your bag{units ? ` · ${units}` : ''}</span><button className="x" onClick={onClose}>Close</button></div>
        {ready && !bag.length ? (
          <div className="bag-empty">
            <h3 className="form-t">Your bag is empty.</h3>
            <p className="form-p">Three routes, one first run. Pick yours.</p>
            <div className="suggest">
              {cat.products.map((p, i) => (
                <button key={p.id} onClick={() => { onClose(); onPick(i); }} data-track="bag_suggest" data-track-props={JSON.stringify({ id: p.id, empty: true })}>
                  <img src={img(p.shots[0].cut)} alt="" width={64} height={128} /><b>{p.name}</b><span>{rupee(p.price)}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bag-body">
            <BagLines where="bag" />
            {missing.length > 0 && (
              <div className="also">
                <p className="eyebrow">Complete the set</p>
                <div className="suggest">
                  {missing.map(({ p, i }) => (
                    <button key={p.id} onClick={() => { onClose(); onPick(i); }} data-track="bag_suggest" data-track-props={JSON.stringify({ id: p.id })}>
                      <img src={img(p.shots[0].cut)} alt="" width={64} height={128} /><b>{p.name}</b><span>{rupee(p.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {bag.length > 0 && (
          <div className="bag-foot">
            <dl className="sum">
              <div><dt>Subtotal</dt><dd>{rupee(subtotal)}</dd></div>
              <div><dt>Shipping</dt><dd>{cat.shipping ? rupee(cat.shipping) : 'Free'}</dd></div>
              <div className="sum-t"><dt>Total</dt><dd>{rupee(subtotal + cat.shipping)}</dd></div>
            </dl>
            {cat.open
              ? <a className="btn btn-wide" href="/checkout" data-track="checkout_click" data-track-props='{"from":"bag"}'>Checkout <i className="sep">·</i> {rupee(subtotal + cat.shipping)}</a>
              : <button className="btn btn-wide" disabled>Checkout opens {SITE.dropShort}</button>}
            <button className="tlink center-link" onClick={onClose}>Keep shopping</button>
            <p className="fine center">{cat.open ? 'Prices include taxes. You pay on the secure Zoho Payments page.' : 'Your bag is saved on this device. Nothing is reserved or charged.'}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

/**
 * Right after "Add to bag": what went in, what the bag holds now, and the two ways on. Sits at the bottom on phones,
 * under the nav on desktop. Leaves by itself after a few seconds unless the pointer or focus is on it.
 */
export function AddedSheet({ added, onClose, onView }: { added: Added | null; onClose: () => void; onView: () => void }) {
  const { product, units, subtotal, cat, bag } = useStore();
  const [hold, setHold] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    clearTimeout(t.current);
    if (added && !hold) t.current = setTimeout(onClose, 6500);
    return () => clearTimeout(t.current);
  }, [added, hold, onClose]);
  const p = added && product(added.id);
  const line = added && bag.find((x) => x.id === added.id && x.size === added.size);
  return (
    <div className={`added ${added ? 'show' : ''}`} role="status" aria-live="polite" aria-hidden={!added}
      onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)}>
      {p && added && (
        <>
          <div className="added-top"><span className="added-ok"><CheckIcon />Added to your bag</span><button className="x" onClick={() => { onClose(); track('added_sheet', { action: 'dismiss' }); }} aria-label="Close">Close</button></div>
          <div className="added-item">
            <img src={img(p.shots[0].cut)} alt="" width={64} height={128} />
            <span><b>{p.name}</b><span>{p.colour} <i className="sep">·</i> Size {added.size}{line && line.qty > 1 ? ` · ×${line.qty}` : ''}</span></span>
            <b>{rupee(p.price)}</b>
          </div>
          <p className="added-sum">Bag: {units} {units === 1 ? 'tee' : 'tees'} <i className="sep">·</i> {rupee(subtotal)}</p>
          <div className="added-actions">
            <button className="btn btn-sm btn-line" onClick={() => { onClose(); onView(); track('added_sheet', { action: 'view_bag' }); }}>View bag</button>
            {cat.open
              ? <a className="btn btn-sm" href="/checkout" data-track="checkout_click" data-track-props='{"from":"added_sheet"}'>Checkout</a>
              : <button className="btn btn-sm" disabled>Opens {SITE.dropShort}</button>}
          </div>
        </>
      )}
    </div>
  );
}
