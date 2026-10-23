import type { Metadata } from 'next';
import { FALLBACK } from '@/lib/catalog';
import { Mark } from '@/components/Mark';
import { StoreProvider } from '@/components/Store';
import { OrderView } from '@/components/OrderView';

// A private, per-customer page: never indexed, never in the sitemap.
export const metadata: Metadata = { title: 'Your order | ADRENL', robots: { index: false, follow: false } };

export default function Page() {
  return (
    <StoreProvider initial={FALLBACK}>
      <header className="lg-nav">
        <a href="/" className="brand" aria-label="ADRENL home"><Mark className="brand-mark" title="" /><span>ADRENL</span></a>
        <a className="tlink" href="/">Back to the shop</a>
      </header>
      <OrderView />
    </StoreProvider>
  );
}
