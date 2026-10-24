'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useReportWebVitals } from 'next/web-vitals';
import { API, parseCatalog, type Catalog, type Product, type User } from '@/lib/catalog';
import { api } from '@/lib/api';
import { startTracking, track } from '@/lib/track';

/** One line per design and size. */
export type BagItem = { key: string; id: string; name: string; colour: string; size: string; price: number; qty: number };
export const MAX_UNITS = 10; // per order, same limit as the backend

type Store = {
  cat: Catalog;
  product: (id: string) => Product | undefined;
  /** undefined while we are still asking the backend, null when signed out. */
  user: User | null | undefined;
  setUser: (u: User | null) => void;
  /** False until the saved bag has been read from this browser (avoids flashing an empty bag). */
  ready: boolean;
  bag: BagItem[];
  units: number;
  subtotal: number;
  /** Adds qty of a design in a size; returns how many actually went in (the bag holds MAX_UNITS). */
  addItem: (p: Product, size: string, qty?: number) => number;
  setQty: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  clearBag: () => void;
};

const Ctx = createContext<Store | null>(null);
const BAG_KEY = 'adrenl-bag';
const keyOf = (id: string, size: string) => `${id}:${size}`;
const count = (b: BagItem[]) => b.reduce((n, i) => n + i.qty, 0);

// Older pages kept one entry per tee and no qty: fold those into lines.
function normalise(raw: unknown): BagItem[] {
  const lines = new Map<string, BagItem>();
  for (const it of Array.isArray(raw) ? raw : []) {
    if (!it || typeof it.id !== 'string' || typeof it.size !== 'string') continue;
    const key = keyOf(it.id, it.size), qty = Math.max(1, Math.floor(Number(it.qty) || 1));
    const prev = lines.get(key);
    lines.set(key, { key, id: it.id, size: it.size, name: String(it.name ?? ''), colour: String(it.colour ?? ''), price: Number(it.price) || 0, qty: (prev?.qty ?? 0) + qty });
  }
  return [...lines.values()];
}
function loadBag(): BagItem[] { try { return normalise(JSON.parse(localStorage.getItem(BAG_KEY) || '[]')); } catch { return []; } }
/** The saved copy, or null when this browser blocks storage. */
function savedBag(): BagItem[] | null { try { return normalise(JSON.parse(localStorage.getItem(BAG_KEY) || '[]')); } catch { return null; } }
function saveBag(b: BagItem[]) { try { localStorage.setItem(BAG_KEY, JSON.stringify(b)); } catch { /* private mode: the bag just lives in this tab */ } }

/** Real-user speed: LCP, CLS, INP, FCP, TTFB, as the visitor experienced them. */
function Vitals() {
  useReportWebVitals((m) => track('web_vital', { metric: m.name, value: m.name === 'CLS' ? Number(m.value.toFixed(4)) : Math.round(m.value), rating: m.rating }));
  return null;
}

/**
 * Catalogue, signed-in customer and bag for the whole page. The catalogue arrives with the HTML (server render),
 * then is re-checked once in the browser so the checkout switch takes effect straight away.
 */
export function StoreProvider({ initial, children }: { initial: Catalog; children: ReactNode }) {
  const [cat, setCat] = useState(initial);
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [bag, setBag] = useState<BagItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    startTracking();
    fetch(`${API}/catalog`, { cache: 'no-store' }).then((r) => r.json()).then((j) => { const c = parseCatalog(j); if (c) setCat(c); }).catch(() => {});
    api<{ user: User | null }>('/me').then((r) => setUser(r.user)).catch(() => setUser(null));
    setBag(loadBag()); setReady(true);
    // Another tab changed the bag: follow it.
    const sync = (e: StorageEvent) => { if (e.key === BAG_KEY) setBag(loadBag()); };
    addEventListener('storage', sync);
    return () => removeEventListener('storage', sync);
  }, []);

  // Keep the bag honest: drop what is no longer sold and use today's price.
  useEffect(() => {
    setBag((b) => {
      const next = b.flatMap((it) => {
        const p = cat.products.find((x) => x.id === it.id);
        return p && p.sizes.includes(it.size) ? [{ ...it, name: p.name, colour: p.colour, price: p.price }] : [];
      });
      return JSON.stringify(next) === JSON.stringify(b) ? b : next;
    });
  }, [cat]);

  const update = useCallback((f: (b: BagItem[]) => BagItem[]) => setBag((b) => { const n = f(b); saveBag(n); return n; }), []);

  const addItem = useCallback((p: Product, size: string, qty = 1) => {
    // A rapid double tap can run before the bag state updates; the saved copy is already current.
    const inBag = Math.max(count(bag), count(savedBag() ?? []));
    const room = Math.max(0, Math.min(qty, MAX_UNITS - inBag));
    if (!room) return 0;
    update((b) => {
      const key = keyOf(p.id, size), at = b.find((x) => x.key === key);
      return at ? b.map((x) => (x.key === key ? { ...x, qty: x.qty + room } : x))
        : [...b, { key, id: p.id, name: p.name, colour: p.colour, size, price: p.price, qty: room }];
    });
    return room;
  }, [bag, update]);

  const setQty = useCallback((key: string, qty: number) => update((b) => {
    const others = count(b.filter((x) => x.key !== key));
    const q = Math.max(0, Math.min(Math.floor(qty), MAX_UNITS - others));
    return q ? b.map((x) => (x.key === key ? { ...x, qty: q } : x)) : b.filter((x) => x.key !== key);
  }), [update]);

  const value = useMemo<Store>(() => ({
    cat, user, setUser, ready, bag,
    units: count(bag), subtotal: bag.reduce((s, i) => s + i.price * i.qty, 0),
    product: (id) => cat.products.find((p) => p.id === id),
    addItem, setQty,
    removeItem: (key) => update((b) => b.filter((x) => x.key !== key)),
    clearBag: () => update(() => []),
  }), [cat, user, ready, bag, addItem, setQty, update]);

  return <Ctx.Provider value={value}><Vitals />{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
}
