import type { Metadata } from 'next';
import { LEGAL } from '@/lib/legal';
import { LegalPage } from '@/components/LegalPage';

const p = LEGAL.find((x) => x.slug === 'refunds')!;
export const metadata: Metadata = { title: `${p.title} | ADRENL`, description: p.description, alternates: { canonical: '/refunds' } };
export default function Page() { return <LegalPage p={p} />; }
