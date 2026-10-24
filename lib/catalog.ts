import { DESIGNS, SITE, SIZES, type Design } from './data';

/** A product as the shop backend (pay.adrenl.com, Postgres) serves it. Same shape as a Design, plus price and sizes. */
export type Product = Omit<Design, 'id'> & { id: string; price: number; nextPrice: number | null; sizes: string[] };
export type Catalog = {
  /** Checkout switch: CHECKOUT_OPEN in the backend's .env. */
  open: boolean;
  /** Login accepts the fixed test code (OTP_BYPASS). */
  testMode: boolean;
  shipping: number;
  products: Product[];
};
export type Address = { name: string; line1: string; line2: string; city: string; state: string; pin: string };
export type SavedAddress = Address & { id: string };
export type User = { name: string; phone: string; email: string | null; addresses: SavedAddress[] };
export type OrderItem = { id: string; name: string; colour: string; size: string; price: number; qty: number };
export type Order = {
  id: string; status: 'pending' | 'paid' | 'failed' | 'expired' | 'amount_mismatch'; amount: number; shipping: number; items: OrderItem[];
  name: string; phone: string; email: string; address: Address; created: string; paid: string | null;
  /** Pending only: 'awaiting' = not paid yet and the payment link still works (payUrl, until expires); 'confirming' = with the bank. */
  stage?: 'awaiting' | 'confirming'; payUrl?: string; expires?: string;
};

export const API = process.env.NEXT_PUBLIC_API_URL || 'https://pay.adrenl.com';

/** What the site shows if the backend cannot be reached: the built-in Batch 01 data, checkout closed. */
export const FALLBACK: Catalog = {
  open: false, testMode: false, shipping: 0,
  products: DESIGNS.map((d) => ({ ...d, price: SITE.price, nextPrice: SITE.nextPrice, sizes: SIZES })),
};

export function parseCatalog(j: unknown): Catalog | null {
  const c = j as Partial<Catalog> | null;
  if (!c || !Array.isArray(c.products) || c.products.length === 0) return null;
  return { open: c.open === true, testMode: c.testMode === true, shipping: Number(c.shipping) || 0, products: c.products };
}

/**
 * Server side (page render): the products go into the HTML, so search engines and AI crawlers read the real catalogue.
 * Re-checked at most once a minute; a slow or failed backend never breaks the page.
 */
export async function getCatalog(): Promise<Catalog> {
  try {
    const r = await fetch(`${API}/catalog`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(4000) });
    return (r.ok && parseCatalog(await r.json())) || FALLBACK;
  } catch {
    return FALLBACK;
  }
}

export const fromPrice = (c: Catalog) => Math.min(...c.products.map((p) => p.price));
export const nextPrice = (c: Catalog) => c.products.find((p) => p.nextPrice)?.nextPrice ?? null;
