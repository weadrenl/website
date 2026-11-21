import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/data';
export default function robots(): MetadataRoute.Robots {
  // Checkout, orders, the insights page and the design lab are per-person or internal; they also carry noindex.
  return { rules: { userAgent: '*', allow: '/', disallow: ['/checkout', '/order', '/insights', '/lab'] }, sitemap: `${SITE.url}/sitemap.xml` };
}
