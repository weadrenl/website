import type { Metadata } from 'next';
import { getCatalog } from '@/lib/catalog';
import { StoreProvider } from '@/components/Store';
import { CheckoutPage } from '@/components/CheckoutPage';

// Per-customer and transactional: never indexed.
export const metadata: Metadata = { title: 'Checkout | ADRENL', robots: { index: false, follow: false } };

export default async function Page() {
  return (
    <StoreProvider initial={await getCatalog()}>
      <CheckoutPage />
    </StoreProvider>
  );
}
