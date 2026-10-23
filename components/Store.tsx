'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { API, parseCatalog, type Catalog, type Product, type User } from '@/lib/catalog';
import { api } from '@/lib/api';

export type BagItem = { key: string; id: string; name: string; colour: string; size: string; price: number };

type Store = {
  cat: Catalog;
  product: (id: string) => Product | undefined;
  /** undefined while we are still asking the backend, null when signed out. */
  user: User | null | undefined;
  setUser: (u: User | null) => void;
  bag: BagItem[];
  addItem: (b: BagItem) => void;
  removeItem: (key: string) => void;
  clearBag: () => void;
};

const Ctx = createContext<Store | null>(null);
const BAG_KEY = 'adrenl-bag';

function loadBag(): BagItem[] {
  try { const v = JSON.parse(localStorage.getItem(BAG_KEY) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}
function saveBag(b: BagItem[]) { try { localStorage.setItem(BAG_KEY, JSON.stringify(b)); } catch { /* private mode: the bag just lives in this tab */ } }

/**
 * Catalogue, signed-in customer and bag for the whole page. The catalogue arrives with the HTML (server render),
 * then is re-checked once in the browser so the checkout switch takes effect straight away.
 */
export function StoreProvider({ initial, children }: { initial: Catalog; children: ReactNode }) {
  const [cat, setCat] = useState(initial);
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [bag, setBag] = useState<BagItem[]>([]);

  useEffect(() => {
    fetch(`${API}/catalog`, { cache: 'no-store' }).then((r) => r.json()).then((j) => { const c = parseCatalog(j); if (c) setCat(c); }).catch(() => {});
    api<{ user: User | null }>('/me').then((r) => setUser(r.user)).catch(() => setUser(null));
    setBag(loadBag());
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
  const value = useMemo<Store>(() => ({
    cat, user, setUser, bag,
    product: (id) => cat.products.find((p) => p.id === id),
    addItem: (it) => update((b) => [...b, it]),
    removeItem: (key) => update((b) => b.filter((x) => x.key !== key)),
    clearBag: () => update(() => []),
  }), [cat, user, bag, update]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
}
