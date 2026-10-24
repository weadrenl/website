'use client';
import { useEffect, useRef, useState } from 'react';
import { COPY, DETAILS, SITE } from '@/lib/data';
import { img } from '@/lib/assets';
import { rupee } from './hooks';
import { Modal } from './Modal';
import { ArrowIcon, CheckIcon } from './Engrave';
import { useStore, MAX_UNITS } from './Store';
import { track } from '@/lib/track';

/** Photographs plus a close-up of the print. Swipe on phones, two-up with arrows on desktop. */
function Gallery({ sel }: { sel: number }) {
  const d = useStore().cat.products[sel];
  const track = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const frames = [...d.shots.map((s) => ({ key: s.key, label: s.label })), { key: 'print', label: 'Print' }];

  useEffect(() => { track.current?.scrollTo({ left: 0 }); setAt(0); }, [sel]);
  const onScroll = () => {
    const t = track.current; if (!t) return;
    const w = (t.firstElementChild as HTMLElement | null)?.offsetWidth || t.clientWidth;
    setAt(Math.round(t.scrollLeft / (w + 10)));
  };
  const go = (i: number) => {
    const t = track.current; if (!t) return;
    const el = t.children[Math.max(0, Math.min(frames.length - 1, i))] as HTMLElement;
    t.scrollTo({ left: el.offsetLeft - t.offsetLeft, behavior: 'smooth' });
  };

  return (
    <div className="gallery">
      <div className="gal-track" ref={track} onScroll={onScroll} aria-label={`${d.name} photographs`}>
        {d.shots.map((s) => (
          <figure key={`${d.id}-${s.key}`} className="gal-frame">
            <img className="cut" src={img(s.cut)} width={512} height={1024} alt={`${d.name} tee, ${s.label.toLowerCase()}, on a model`} decoding="async" />
            <figcaption>{s.label}</figcaption>
          </figure>
        ))}
        <figure className="gal-frame gal-print" style={{ background: d.swatch }}>
          <img src={img(d.art.file)} width={d.art.w} height={d.art.h} alt={`${d.name} back print close-up: ${d.print}`} loading="lazy" decoding="async" />
          <figcaption>Print</figcaption>
        </figure>
      </div>
      <div className="gal-bar">
        <div className="gal-thumbs" role="group" aria-label="Choose a photo">
          {frames.map((f, i) => (
            <button key={f.key} className={at === i ? 'on' : ''} aria-pressed={at === i} onClick={() => go(i)}>{f.label}</button>
          ))}
        </div>
        <div className="gal-arrows">
          <button aria-label="Previous photo" onClick={() => go(at - 1)} disabled={at === 0}><ArrowIcon dir="left" /></button>
          <button aria-label="Next photo" onClick={() => go(at + 1)} disabled={at >= frames.length - 1}><ArrowIcon /></button>
        </div>
      </div>
    </div>
  );
}

export type Added = { id: string; size: string; at: number };

export function Shop({ sel, setSel, onAdded, onOpenBag }: { sel: number; setSel: (i: number) => void; onAdded: (a: Added) => void; onOpenBag: () => void }) {
  const { cat, bag, addItem } = useStore();
  const d = cat.products[sel] ?? cat.products[0];
  const [size, setSize] = useState<string | null>(null);
  const [warn, setWarn] = useState('');
  const [guide, setGuide] = useState(false);
  const [done, setDone] = useState(false);
  const doneT = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inBag = bag.filter((x) => x.id === d.id);

  const add = () => {
    if (!size) { setWarn('Pick a size first.'); track('size_warn', { id: d.id }); return; }
    const n = addItem(d, size, 1);
    if (!n) { setWarn(`Your bag is full: one order holds up to ${MAX_UNITS} tees.`); track('bag_full', { id: d.id }); return; }
    setWarn('');
    track('add_to_bag', { id: d.id, size, qty: n, price: d.price });
    onAdded({ id: d.id, size, at: Date.now() });
    setDone(true); clearTimeout(doneT.current);
    doneT.current = setTimeout(() => setDone(false), 1800);
  };
  const pick = (i: number) => { setSel(i); track('select_design', { id: cat.products[i]?.id, from: 'picker' }); };
  const pickSize = (s: string) => { setSize(s); setWarn(''); track('select_size', { id: d.id, size: s }); };
  // A size picked for one design may not exist for the next.
  useEffect(() => { if (size && !d.sizes.includes(size)) setSize(null); }, [d, size]);

  return (
    <section className="shop" id="shop" aria-labelledby="shop-t">
      <div className="wrap shop-grid">
        <Gallery sel={sel} />
        <div className="shop-panel">
          <p className="eyebrow">{cat.open ? COPY.live.shop : COPY.shop.eyebrow}</p>
          <h2 id="shop-t">{COPY.shop.title}</h2>

          <div className="picker" role="radiogroup" aria-label="Design">
            {cat.products.map((x, i) => (
              <button key={x.id} role="radio" aria-checked={sel === i} className={sel === i ? 'on' : ''} onClick={() => pick(i)}>
                <img src={img(x.shots[0].cut)} width={512} height={1024} alt="" loading="lazy" decoding="async" />
                <span><b>{x.name}</b><small>{x.colour}</small></span>
              </button>
            ))}
          </div>
          <p className="pick-line">{d.line}</p>

          <div className="price-row">
            <b>{rupee(d.price)}</b>
            <span>First-run price.{d.nextPrice ? ` ${rupee(d.nextPrice)} from the next batch.` : ''}</span>
          </div>

          <div className="size-top"><span className="eyebrow">Size{size ? ` · ${size}` : ''}</span><button className="tlink" onClick={() => setGuide(true)} data-track="fit_guide">Fit guide</button></div>
          <div className="sizes" role="radiogroup" aria-label="Size">
            {d.sizes.map((s) => (
              <button key={s} role="radio" aria-checked={size === s} className={size === s ? 'on' : ''} onClick={() => pickSize(s)}>{s}</button>
            ))}
          </div>
          <p className={`warn ${warn ? 'show' : ''}`} role="alert">{warn}</p>
          <button className={`btn btn-wide add-btn ${done ? 'is-done' : ''}`} onClick={add} aria-live="polite">
            {done ? <><CheckIcon />Added to bag</> : <>Add to bag <i className="sep">·</i> {rupee(d.price)}</>}
          </button>
          {inBag.length > 0 && (
            <p className="in-bag">
              <span><CheckIcon />In your bag: {inBag.map((x) => `${x.size}${x.qty > 1 ? ` ×${x.qty}` : ''}`).join(', ')}</span>
              <button className="tlink" onClick={onOpenBag} data-track="view_bag_link" data-track-props='{"from":"shop"}'>View bag</button>
            </p>
          )}

          <ul className="trust">
            <li><CheckIcon />{cat.open ? COPY.live.trust : `Checkout opens ${SITE.dropShort}`}</li>
            <li><CheckIcon />Free size exchange</li>
            <li><CheckIcon />Made in India</li>
          </ul>

          <details className="details">
            <summary>Details<i aria-hidden="true" /></summary>
            <dl>{DETAILS.map((x) => <div key={x.k}><dt>{x.k}</dt><dd>{x.v}</dd></div>)}</dl>
          </details>
          <p className="fine">{cat.open ? COPY.live.fine : 'This is a preview. Nothing is charged and no order is placed until the drop opens.'}</p>
        </div>
      </div>

      <Modal open={guide} onClose={() => setGuide(false)} label="Fit guide">
        <div className="guide">
          <div className="modal-top"><span className="eyebrow">Fit guide</span><button className="x" onClick={() => setGuide(false)}>Close</button></div>
          <h3>Relaxed, boxy, dropped shoulder.</h3>
          <p>The measured size chart goes up once the final sample is measured. We would rather wait than guess. Until then:</p>
          <ol>
            <li>Lay your favourite tee flat.</li>
            <li>Measure across the chest, armpit to armpit.</li>
            <li>Measure from the top of the shoulder to the hem.</li>
            <li>Between sizes? Go up for a looser fit, down for a closer one.</li>
          </ol>
          <p className="fine">Wrong size? One free exchange within 7 days of delivery.</p>
        </div>
      </Modal>
    </section>
  );
}
