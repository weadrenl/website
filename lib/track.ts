import { API } from './catalog';

/**
 * First-party, anonymous measurement. What people do on the site goes in small batches to our own backend
 * (pay.adrenl.com/ux), never to a third party. A random visitor id lives in this browser; a visit ends after 30 idle
 * minutes. Never send names, phone numbers, emails or addresses as props.
 */
type Props = Record<string, string | number | boolean | null | undefined>;
type Ev = { n: string; p?: Props; t: number; path: string };

const VID = 'adrenl-vid', SID = 'adrenl-sid', IDLE = 30 * 60e3;
const queue: Ev[] = [];
let timer: ReturnType<typeof setTimeout> | undefined;
let started = false, errors = 0;
let mem: { vid: string; sid: string; last: number } | null = null; // when storage is blocked

const rid = () => Array.from(crypto.getRandomValues(new Uint8Array(14)), (b) => (b % 36).toString(36)).join('');
const ok = (v: unknown): v is string => typeof v === 'string' && /^[a-z0-9]{8,40}$/.test(v);

function session(): { vid: string; sid: string; fresh: boolean } {
  const now = Date.now();
  let vid = mem?.vid, sid = mem?.sid, last = mem?.last ?? 0;
  try {
    vid = localStorage.getItem(VID) ?? vid;
    const s = JSON.parse(localStorage.getItem(SID) || 'null');
    if (s) { sid = s.sid; last = s.last; }
  } catch { /* private mode: fall back to memory */ }
  if (!ok(vid)) vid = rid();
  const fresh = !ok(sid) || now - last > IDLE;
  if (fresh) sid = rid();
  mem = { vid, sid: sid!, last: now };
  try { localStorage.setItem(VID, vid); localStorage.setItem(SID, JSON.stringify({ sid, last: now })); } catch { /* ignore */ }
  return { vid, sid: sid!, fresh };
}

/** The ids the checkout sends along, so the server can join payments to this visit. */
export function visitIds() {
  if (typeof window === 'undefined') return {};
  const { vid, sid } = session();
  return { vid, sid };
}

function entryProps(): Props {
  const q = new URLSearchParams(location.search);
  let ref = '';
  try { const r = document.referrer && new URL(document.referrer); if (r && r.hostname !== location.hostname) ref = r.hostname.replace(/^www\./, ''); } catch { /* ignore */ }
  return { landing: location.pathname, ref, utm_source: q.get('utm_source') ?? undefined, utm_medium: q.get('utm_medium') ?? undefined, utm_campaign: q.get('utm_campaign') ?? undefined };
}

export function track(n: string, p?: Props) {
  if (typeof window === 'undefined') return;
  const { fresh } = session();
  const t = Date.now(), path = location.pathname;
  if (fresh) queue.push({ n: 'session_start', p: entryProps(), t, path });
  queue.push({ n, p, t, path });
  clearTimeout(timer);
  if (queue.length >= 20) flush(); else timer = setTimeout(flush, 1500);
}

function flush() {
  clearTimeout(timer);
  if (!queue.length || !mem) return;
  const body = JSON.stringify({ vid: mem.vid, sid: mem.sid, w: window.innerWidth, now: Date.now(), ev: queue.splice(0, 60) });
  // text/plain keeps it a simple request (no preflight); sendBeacon survives the tab closing.
  const sent = navigator.sendBeacon?.(`${API}/ux`, new Blob([body], { type: 'text/plain' }));
  if (!sent) fetch(`${API}/ux`, { method: 'POST', body, keepalive: true, credentials: 'include', headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
  if (queue.length) timer = setTimeout(flush, 500);
}

/** Once per page: page view, flush on leave, JS errors, and clicks on anything marked data-track="name". */
export function startTracking() {
  if (started || typeof window === 'undefined') return;
  started = true;
  track('page_view');
  addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  const err = (msg: unknown) => { if (errors++ < 5) track('js_error', { msg: String(msg).slice(0, 160) }); };
  addEventListener('error', (e) => err(e.message));
  addEventListener('unhandledrejection', (e) => err((e.reason as Error)?.message ?? e.reason));
  document.addEventListener('click', (e) => {
    const el = (e.target as Element | null)?.closest?.('[data-track]') as HTMLElement | null;
    if (!el) return;
    let p: Props | undefined;
    try { p = el.dataset.trackProps ? JSON.parse(el.dataset.trackProps) : undefined; } catch { /* ignore */ }
    track(el.dataset.track!, p);
  }, { capture: true });
}
