import type { MetadataRoute } from 'next';
import { POLICIES, SITE } from '@/lib/data';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE.url}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE.url}/try`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    ...POLICIES.map(([h]) => ({ url: `${SITE.url}${h}`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 })),
  ];
}
