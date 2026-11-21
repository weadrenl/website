import type { Metadata } from 'next';
import { Lab } from '@/components/Lab';

// Private: the designs we are weighing up. Not linked from the site, never indexed (also disallowed in robots.ts).
export const metadata: Metadata = {
  title: 'Design lab | ADRENL',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Lab />;
}
