'use client';
import { useEffect, useRef, useState } from 'react';
import { DESIGNS, SIZES, SITE } from '@/lib/data';
import { img } from '@/lib/assets';
import { rupee } from './hooks';
import { Modal } from './Modal';

export type BagItem = { id: string; name: string; size: string; colour: string };

export function Shop({ sel, setSel, onAdd }: { sel: number; setSel: (i: number) => void; onAdd: (b: BagItem) => void }) {
  const d = DESIGNS[sel];
  const [angle, setAngle] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [zoom, setZoom] = useState(false);
  const [guide, setGuide] = useState(false);
  const [warn, setWarn] = useState(false);
  const main = useRef<HTMLButtonElement>(null);

  useEffect(() => { setAngle(0); }, [sel]);

  const tilt = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'mouse') return;
    const b = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
    e.currentTarget.style.setProperty('--rx', `${(-y * 5).toFixed(2)}deg`);
    e.currentTarget.style.setProperty('--ry', `${(x * 6).toFixed(2)}deg`);
  };
  const untilt = (e: React.PointerEvent<HTMLButtonElement>) => { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg'); };

  const add = () => {
    if (!size) { setWarn(true); return; }
    setWarn(false);
    onAdd({ id: `${d.id}-${size}-${Date.now()}`, name: d.name, size, colour: d.colour });
  };

  return (
    <section className="shop" id="shop" style={{ ['--bg' as string]: d.bg, ['--ac' as string]: d.accent }} aria-labelledby="shop-t">
      <div className="wrap">
        <header className="shop-head" data-reveal>
          <p className="mono">Batch 01 / Drops {SITE.dropLabel}</p>
          <h2 id="shop-t">Pick your route.</h2>
        </header>
        <div className="shop-tabs" role="tablist" aria-label="Choose a design">
          {DESIGNS.map((x, i) => (
            <button key={x.id} role="tab" id={`tab-${x.id}`} aria-selected={sel === i} aria-controls="shop-panel" className={sel === i ? 'on' : ''} onClick={() => setSel(i)} data-cursor={x.name}>
              <span className="mono">{x.n}</span><b>{x.name}</b><small>{x.colour}</small>
            </button>
          ))}
        </div>
        <div className="shop-grid" id="shop-panel" role="tabpanel" aria-labelledby={`tab-${d.id}`}>
          <div className="gal">
            <div className="gal-thumbs" aria-label="Choose an angle">
              {d.views.map((vw, i) => (
                <button key={vw.key} className={angle === i ? 'on' : ''} aria-pressed={angle === i} onClick={() => setAngle(i)}>
                  <img src={img(vw.file)} width={512} height={1024} alt="" loading="lazy" /><span className="mono">{vw.label}</span>
                </button>
              ))}
            </div>
            <button ref={main} className="gal-main" onClick={() => setZoom(true)} onPointerMove={tilt} onPointerLeave={untilt} data-cursor="Zoom"
              onKeyDown={(e) => { if (e.key === 'ArrowRight') setAngle((angle + 1) % 3); if (e.key === 'ArrowLeft') setAngle((angle + 2) % 3); }}
              aria-label={`Enlarge ${d.name}, ${d.views[angle].label.toLowerCase()} view. Use left and right arrows to change angle.`}>
              {d.views.map((vw, i) => (
                <img key={vw.key} className={angle === i ? 'on' : ''} src={img(vw.file)} width={512} height={1024}
                  alt={angle === i ? `AI design preview of the ${d.name} tee, ${vw.label.toLowerCase()} view, on a fictional model` : ''} />
              ))}
              <span className="ai-tag mono">AI design preview</span>
              <span className="gal-hint mono">&larr; &rarr; angles / click to zoom</span>
            </button>
          </div>
          <div className="buy">
            <p className="mono buy-n">Route {d.n} / {d.field}</p>
            <h3 className="buy-name">{d.name}</h3>
            <p className="buy-line">{d.line}</p>
            <div className="price" aria-label={`Batch 01 price ${rupee(SITE.price)}`}>
              <b>{rupee(SITE.price)}</b>
              <span className="chip">Batch 01 price</span>
            </div>
            <p className="next-price">Next batch: <b>{rupee(SITE.nextPrice)}</b>. Batch 01 buyers get the lower price. Taxes and shipping are shown at checkout.</p>
            <div className="size-row">
              <div className="size-top"><span className="mono">Size {size ? `/ ${size}` : ''}</span><button className="link" onClick={() => setGuide(true)}>Fit guide</button></div>
              <div className="sizes" role="radiogroup" aria-label="Size">
                {SIZES.map((s) => (
                  <button key={s} role="radio" aria-checked={size === s} className={size === s ? 'on' : ''} onClick={() => { setSize(s); setWarn(false); }}>{s}</button>
                ))}
              </div>
              <p className={`warn ${warn ? 'show' : ''}`} role="alert">{warn ? 'Pick a size first.' : ''}</p>
            </div>
            <button className="btn btn-big magnet" onClick={add} data-cursor="Add">Add to bag <span aria-hidden="true">+</span></button>
            <ul className="perks mono">
              <li>One free size exchange, 7 days</li>
              <li>Preorder: drops {SITE.dropLabel}</li>
              <li>{d.print}</li>
            </ul>
            <p className="fine">Preview only. Nothing is charged and no order is placed.</p>
          </div>
        </div>
      </div>
      <Modal open={zoom} onClose={() => setZoom(false)} label={`${d.name} enlarged`}>
        <button className="x" onClick={() => setZoom(false)} aria-label="Close">Close &times;</button>
        <div className="zoom">
          <img src={img(d.views[angle].file)} alt={`AI design preview of the ${d.name} tee, ${d.views[angle].label.toLowerCase()} view`} />
          <div className="zoom-nav">
            {d.views.map((vw, i) => <button key={vw.key} className={angle === i ? 'on' : ''} onClick={() => setAngle(i)}>{vw.label}</button>)}
          </div>
          <p className="mono">AI design preview. Not a photograph of a real tee.</p>
        </div>
      </Modal>
      <Modal open={guide} onClose={() => setGuide(false)} label="Fit guide">
        <button className="x" onClick={() => setGuide(false)} aria-label="Close">Close &times;</button>
        <div className="guide">
          <h3>Fit guide</h3>
          <p>The cut is relaxed and boxy with a drop shoulder. The measured size chart is published after the final sample is measured, so we are not putting numbers here that we have not checked.</p>
          <ol>
            <li>Lay your favourite tee flat.</li>
            <li>Measure across the chest, armpit to armpit.</li>
            <li>Measure from the top of the shoulder to the hem.</li>
            <li>Between sizes? Go up for a relaxed fit, down for a closer one.</li>
          </ol>
          <p className="mono">Sized wrong? One free exchange within 7 days of delivery.</p>
        </div>
      </Modal>
    </section>
  );
}

export function BagDrawer({ open, onClose, items, remove }: { open: boolean; onClose: () => void; items: BagItem[]; remove: (id: string) => void }) {
  const total = items.length * SITE.price;
  return (
    <Modal open={open} onClose={onClose} label="Your bag" side>
      <div className="bag">
        <div className="bag-top"><h3>Your bag <span className="mono">({items.length})</span></h3><button className="x" onClick={onClose}>Close &times;</button></div>
        {items.length === 0 ? <p className="bag-empty">Nothing here yet. Pick a route.</p> : (
          <ul className="bag-list">
            {items.map((it) => {
              const dd = DESIGNS.find((x) => x.name === it.name)!;
              return (
                <li key={it.id}>
                  <img src={img(dd.views[0].file)} alt="" width={64} height={128} />
                  <div><b>{it.name}</b><span className="mono">{it.colour} / {it.size}</span><span className="mono">Batch 01 preorder</span></div>
                  <div className="bag-r"><b>{rupee(SITE.price)}</b><button className="link" onClick={() => remove(it.id)}>Remove</button></div>
                </li>
              );
            })}
          </ul>
        )}
        <div className="bag-foot">
          <div className="bag-sum"><span>Subtotal</span><b>{rupee(total)}</b></div>
          <p className="fine">Shipping and taxes are shown at checkout.</p>
          <button className="btn btn-big" disabled>Checkout opens {SITE.dropLabel}</button>
          <p className="fine">This is a preview. Your bag stays in this tab only and nothing is reserved or charged.</p>
        </div>
      </div>
    </Modal>
  );
}
