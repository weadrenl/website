import type { Metadata } from 'next';
import { InsightsShell } from '@/components/Insights';

// Internal: gated by the admin key, never indexed.
export const metadata: Metadata = { title: 'Insights | ADRENL', robots: { index: false, follow: false } };

export default function Page() {
  return <InsightsShell />;
}
