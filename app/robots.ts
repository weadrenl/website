import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/data';
export default function robots(): MetadataRoute.Robots {
  // Checkout, orders and the insights page are per-person or internal; they also carry noindex.
  return { rules: { userAgent: '*', allow: '/', disallow: ['/checkout', '/order', '/insights'] }, sitemap: `${SITE.url}/sitemap.xml` };
}
