import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/data';
export default function robots(): MetadataRoute.Robots {
  // Checkout, orders, the insights page, the design lab and the pitch deck are per-person or internal; they also carry noindex.
  return { rules: { userAgent: '*', allow: '/', disallow: ['/checkout', '/order', '/insights', '/lab', '/pitch'] }, sitemap: `${SITE.url}/sitemap.xml` };
}
