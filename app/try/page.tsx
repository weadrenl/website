import type { Metadata } from 'next';
import { getCatalog } from '@/lib/catalog';
import { StoreProvider } from '@/components/Store';
import { TryRoom } from '@/components/TryRoom';

export const metadata: Metadata = {
  title: 'The trial room: try ADRENL tees on, live | ADRENL',
  description: 'See yourself in RIDGE, GARUD or MARCOS on your own camera, live, a few seconds behind you. Open at set hours.',
  alternates: { canonical: '/try' },
};

export default async function Page() {
  return (
    <StoreProvider initial={await getCatalog()}>
      <TryRoom />
    </StoreProvider>
  );
}
