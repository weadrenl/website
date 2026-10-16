import type { Metadata } from 'next';
import { LEGAL } from '@/lib/legal';
import { LegalPage } from '@/components/LegalPage';

const p = LEGAL.find((x) => x.slug === 'terms')!;
export const metadata: Metadata = { title: `${p.title} | ADRENL`, description: p.description, alternates: { canonical: '/terms' } };
export default function Page() { return <LegalPage p={p} />; }
