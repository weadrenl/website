'use client';
import { useCallback, useEffect, useState } from 'react';
import { API } from '@/lib/catalog';
import { Mark } from './Mark';
import { rupee } from './hooks';

type Step = { key: string; label: string; reached: number; stopped: number };
type Row = Record<string, string | number | null>;
type Journey = { sid: string; started: string; last: string; device: string | null; step: number; stoppedAt: string; source: string; events: { at: string; name: string; props: Row | null }[] };
type Stats = {
  range: string; from: string; to: string;
  totals: { visits: number; visitors: number; orders: number; revenue: number; units: number; conversion: number };
  funnel: Step[];
  daily: { day: string; visits: number; adds: number; checkouts: number; orders: number; revenue: number }[];
  devices: Row[]; sources: Row[]; products: Row[]; frictions: Row[]; sections: Row[];
  vitals: { metric: string; device: string; n: number; p75: number }[];
  checkoutSeconds: number | null; checkoutsTimed: number;
  journeys: Journey[];
};

const KEY = 'adrenl-admin';
const RANGES = [['today', 'Today'], ['7d', '7 days'], ['30d', '30 days'], ['90d', '90 days']] as const;
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 1000) / 10}%` : '–');
const time = (s: string) => new Date(s).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
const LABEL: Record<string, string> = {
  form_error: 'Form field rejected', login_error: 'Sign-in failed', pay_error: 'Pay button failed', api_error: 'Server call failed',
  size_warn: 'Tried to add without a size', remove_from_bag: 'Removed from bag', payment_failed: 'Payment failed',
  payment_expired: 'Payment page left unpaid', payment_mismatch: 'Paid amount did not match', js_error: 'Page error', bag_full: 'Bag full',
};
const SECTIONS = ['top', 'story', 'routes', 'shop', 'build', 'drop', 'faq', 'footer'];
// Google's "good" thresholds (p75): LCP 2.5 s, INP 200 ms, CLS 0.1, FCP 1.8 s, TTFB 0.8 s.
const GOOD: Record<string, number> = { LCP: 2500, INP: 200, CLS: 0.1, FCP: 1800, TTFB: 800 };

function describe(e: Journey['events'][number]) {
  const p = e.props ?? {};
  const bits = [p.id, p.size, p.qty && Number(p.qty) > 1 ? `×${p.qty}` : null, p.section, p.step, p.field, p.cta, p.to, p.from, p.status, p.metric ? `${p.metric} ${p.value}` : null, p.msg, p.value && !p.metric ? rupee(Number(p.value)) : null]
    .filter((x) => x !== null && x !== undefined && x !== '');
  return `${e.name.replace(/_/g, ' ')}${bits.length ? ` · ${bits.join(' ')}` : ''}`;
}

/** /insights: where people stop, what trips them up, and how the shop performs. Reads /admin/stats with the admin key. */
export function Insights() {
  const [key, setKey] = useState('');
  const [draft, setDraft] = useState('');
  const [range, setRange] = useState('7d');
  const [data, setData] = useState<Stats | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => { try { setKey(localStorage.getItem(KEY) ?? ''); } catch { /* ignore */ } }, []);

  const load = useCallback(async (k: string, r: string) => {
    if (!k) return;
    setBusy(true); setErr('');
    try {
      const res = await fetch(`${API}/admin/stats?range=${r}`, { headers: { Authorization: `Bearer ${k}` }, cache: 'no-store' });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Could not load the numbers.');
      setData(j);
    } catch (x) {
      setErr((x as Error).message);
      if (/admin key/.test((x as Error).message)) { setKey(''); try { localStorage.removeItem(KEY); } catch { /* ignore */ } }
    } finally { setBusy(false); }
  }, []);
  useEffect(() => { load(key, range); }, [key, range, load]);

  if (!key) {
    return (
      <main id="main" className="wrap ins-login">
        <form className="form" onSubmit={(e) => { e.preventDefault(); const k = draft.trim(); try { localStorage.setItem(KEY, k); } catch { /* ignore */ } setKey(k); }}>
          <h1 className="form-t">Shop insights</h1>
          <p className="form-p">Enter the admin key (ADMIN_TOKEN in the backend&apos;s .env). It stays in this browser only.</p>
          <label className={`field ${err ? 'bad' : ''}`}>
            <span className="field-l">Admin key</span>
            <input type="password" autoComplete="current-password" value={draft} onChange={(e) => setDraft(e.target.value)} />
            {err && <span className="field-e">{err}</span>}
          </label>
          <button className="btn btn-wide">Open insights</button>
        </form>
      </main>
    );
  }

  const t = data?.totals, f = data?.funnel ?? [], top = f[0]?.reached || 0;
  const worst = f.slice(0, -1).map((s, i) => ({ s, next: f[i + 1], lost: s.reached - f[i + 1].reached })).sort((a, b) => b.lost - a.lost)[0];
  const maxDay = Math.max(1, ...(data?.daily ?? []).map((d) => d.visits));
  const sec = Object.fromEntries((data?.sections ?? []).map((r) => [r.section, Number(r.visits)]));

  return (
    <main id="main" className="wrap ins">
      <div className="ins-head">
        <div><p className="eyebrow">ADRENL · Shop insights</p><h1>Where people stop.</h1></div>
        <div className="ins-ctl">
          <div className="seg" role="radiogroup" aria-label="Time range">
            {RANGES.map(([k, l]) => <button key={k} role="radio" aria-checked={range === k} className={range === k ? 'on' : ''} onClick={() => setRange(k)}>{l}</button>)}
          </div>
          <button className="tlink" onClick={() => load(key, range)} disabled={busy}>{busy ? 'Loading…' : 'Refresh'}</button>
          <button className="tlink" onClick={() => { setKey(''); setData(null); try { localStorage.removeItem(KEY); } catch { /* ignore */ } }}>Lock</button>
        </div>
      </div>
      {err && <p className="note">{err}</p>}
      {!data ? <div className="state"><span className="spin" aria-hidden="true" /></div> : (
        <>
          <section className="tiles" aria-label="Totals">
            <div><span>Visits</span><b>{t!.visits.toLocaleString('en-IN')}</b><small>{t!.visitors.toLocaleString('en-IN')} people</small></div>
            <div><span>Paid orders</span><b>{t!.orders}</b><small>{t!.units} tees</small></div>
            <div><span>Revenue</span><b>{rupee(t!.revenue)}</b><small>{t!.orders ? `${rupee(Math.round(t!.revenue / t!.orders))} per order` : 'no orders yet'}</small></div>
            <div><span>Visit → order</span><b>{pct(t!.orders, t!.visits)}</b><small>of visits ended in a paid order</small></div>
            <div><span>Checkout time</span><b>{data.checkoutSeconds ? `${Math.round(data.checkoutSeconds)} s` : '–'}</b><small>median, start → pay ({data.checkoutsTimed})</small></div>
          </section>

          <section className="panel">
            <header><h2>Funnel</h2><p>Visits that reached each step. The gap to the next row is where people stopped.</p></header>
            {worst && worst.lost > 0 && <p className="callout">Biggest drop: <b>{worst.lost}</b> of {worst.s.reached} visits ({pct(worst.lost, worst.s.reached)}) stopped after “{worst.s.label}” and never reached “{worst.next.label}”.</p>}
            <ol className="funnel">
              {f.map((s, i) => (
                <li key={s.key} title={`${s.label}: ${s.reached} visits (${pct(s.reached, top)} of all). ${s.stopped} stopped here.`}>
                  <span className="f-l">{s.label}</span>
                  <span className="f-bar"><i style={{ width: `${top ? Math.max(0.5, (s.reached / top) * 100) : 0}%` }} /></span>
                  <span className="f-n"><b>{s.reached}</b> <small>{pct(s.reached, top)}</small></span>
                  <span className="f-d">{i === 0 ? '' : `${pct(s.reached, f[i - 1].reached)} of previous`}</span>
                </li>
              ))}
            </ol>
          </section>

          <div className="grid2">
            <section className="panel">
              <header><h2>Friction</h2><p>What went wrong, most frequent first.</p></header>
              {data.frictions.length === 0 ? <p className="empty">Nothing recorded in this range.</p> : (
                <table><thead><tr><th>What</th><th>Detail</th><th className="n">Times</th><th className="n">Visits</th></tr></thead>
                  <tbody>{data.frictions.map((r, i) => <tr key={i}><td>{LABEL[String(r.name)] ?? r.name}</td><td>{r.detail || '–'}</td><td className="n">{r.n}</td><td className="n">{r.visits}</td></tr>)}</tbody></table>
              )}
            </section>
            <section className="panel">
              <header><h2>How far down the page</h2><p>Share of visits that scrolled to each section.</p></header>
              <ol className="funnel thin">
                {SECTIONS.map((k) => (
                  <li key={k} title={`${k}: ${sec[k] ?? 0} visits`}>
                    <span className="f-l">{k === 'top' ? 'Hero' : k[0].toUpperCase() + k.slice(1)}</span>
                    <span className="f-bar"><i style={{ width: `${t!.visits ? Math.min(100, ((sec[k] ?? 0) / t!.visits) * 100) : 0}%` }} /></span>
                    <span className="f-n"><b>{pct(sec[k] ?? 0, t!.visits)}</b></span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <section className="panel">
            <header><h2>By day</h2><p>Visits per day (IST); adds, checkouts and paid orders beside each.</p></header>
            {data.daily.length === 0 ? <p className="empty">No visits in this range.</p> : (
              <div className="days" role="table" aria-label="Visits by day">
                {data.daily.map((d) => (
                  <div key={d.day} className="day" role="row" title={`${d.day}: ${d.visits} visits, ${d.adds} added to bag, ${d.checkouts} started checkout, ${d.orders} paid (${rupee(d.revenue)})`}>
                    <span className="day-bar" role="cell"><i style={{ height: `${(d.visits / maxDay) * 100}%` }} /></span>
                    <span className="day-v" role="cell">{d.visits}</span>
                    <span className="day-l" role="cell">{new Date(d.day).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    <span className="day-s" role="cell">{d.adds} add · {d.checkouts} co · {d.orders} paid</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="grid2">
            <section className="panel">
              <header><h2>Products</h2><p>Chosen in the shop, added to bag, and sold.</p></header>
              <table><thead><tr><th>Design</th><th className="n">Chosen</th><th className="n">Adds</th><th className="n">Sold</th><th className="n">Revenue</th></tr></thead>
                <tbody>{data.products.map((r) => <tr key={String(r.id)}><td>{r.name}</td><td className="n">{r.views}</td><td className="n">{r.adds}</td><td className="n">{r.units}</td><td className="n">{rupee(Number(r.revenue))}</td></tr>)}</tbody></table>
            </section>
            <section className="panel">
              <header><h2>Devices and sources</h2><p>Where visits came from and what they used.</p></header>
              <table><thead><tr><th>Device</th><th className="n">Visits</th><th className="n">Added</th><th className="n">Paid</th></tr></thead>
                <tbody>{data.devices.map((r) => <tr key={String(r.device)}><td>{r.device}</td><td className="n">{r.visits}</td><td className="n">{pct(Number(r.adds), Number(r.visits))}</td><td className="n">{r.paid}</td></tr>)}</tbody></table>
              <table><thead><tr><th>Source</th><th className="n">Visits</th><th className="n">Added</th><th className="n">Paid</th></tr></thead>
                <tbody>{data.sources.map((r) => <tr key={String(r.source)}><td>{r.source}</td><td className="n">{r.visits}</td><td className="n">{pct(Number(r.adds), Number(r.visits))}</td><td className="n">{r.paid}</td></tr>)}</tbody></table>
            </section>
          </div>

          <section className="panel">
            <header><h2>Page speed, as visitors felt it</h2><p>75th percentile. Under Google&apos;s “good” line is marked ✓.</p></header>
            {data.vitals.length === 0 ? <p className="empty">No measurements yet.</p> : (
              <table><thead><tr><th>Measure</th><th>Device</th><th className="n">p75</th><th className="n">Samples</th><th>Verdict</th></tr></thead>
                <tbody>{data.vitals.sort((a, b) => a.metric.localeCompare(b.metric)).map((v) => {
                  const good = GOOD[v.metric] !== undefined && v.p75 <= GOOD[v.metric];
                  return <tr key={v.metric + v.device}><td>{v.metric}</td><td>{v.device}</td><td className="n">{v.metric === 'CLS' ? v.p75.toFixed(3) : `${Math.round(v.p75)} ms`}</td><td className="n">{v.n}</td><td>{GOOD[v.metric] === undefined ? '–' : good ? '✓ Good' : '✗ Needs work'}</td></tr>;
                })}</tbody></table>
            )}
          </section>

          <section className="panel">
            <header><h2>Recent visits</h2><p>The latest 30 visits with more than one action, newest first. Open one to see every step.</p></header>
            <ul className="jrn">
              {data.journeys.map((j) => (
                <li key={j.sid} className={open === j.sid ? 'open' : ''}>
                  <button onClick={() => setOpen(open === j.sid ? null : j.sid)} aria-expanded={open === j.sid}>
                    <span className="jrn-t">{time(j.last)}</span>
                    <span>{j.device ?? '–'} · {j.source}</span>
                    <span className={`jrn-s s${j.step}`}>Stopped at: {j.stoppedAt}</span>
                    <span className="jrn-n">{j.events.length} steps</span>
                  </button>
                  {open === j.sid && (
                    <ol className="jrn-ev">
                      {j.events.map((e, i) => <li key={i}><time>{new Date(e.at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}</time><span>{describe(e)}</span></li>)}
                    </ol>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}

export function InsightsShell() {
  return (
    <>
      <header className="lg-nav">
        <a href="/" className="brand" aria-label="ADRENL home"><Mark className="brand-mark" title="" /><span>ADRENL</span></a>
        <span className="eyebrow">Internal</span>
      </header>
      <Insights />
    </>
  );
}
