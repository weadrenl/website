import type { Metadata } from 'next';
import Site from '@/components/Site';
import { fromPrice, getCatalog } from '@/lib/catalog';
import { FAQ, SITE } from '@/lib/data';

// Rendered on the server from the shop database (re-checked every minute), so the HTML always carries the real
// products, prices and availability for search engines and AI crawlers.
export async function generateMetadata(): Promise<Metadata> {
  const c = await getCatalog();
  const p = fromPrice(c), names = c.products.map((x) => x.name);
  const title = `ADRENL | Graphic tees for the long way. Batch 01 from Rs ${p}`;
  const description = `ADRENL Batch 01: ${['one', 'two', 'three', 'four', 'five', 'six'][names.length - 1] ?? names.length} heavyweight graphic tees - ${names.slice(0, -1).join(', ')}${names.length > 1 ? ' and ' : ''}${names.at(-1)} - made for people who take the long route. Batch 01 price Rs ${p}, ${c.open ? 'preorder open now' : `drops ${SITE.dropLabel}`}.`;
  return {
    title, description,
    // Next replaces (does not merge) these objects, so they are complete here.
    openGraph: { type: 'website', url: SITE.url, siteName: 'ADRENL', title, description, locale: 'en_IN', images: [{ url: '/og.jpg', width: 1200, height: 630, alt: `ADRENL Batch 01: ${names.join(', ')} tees` }] },
    twitter: { card: 'summary_large_image', title, description, images: ['/og.jpg'] },
  };
}

export default async function Page() {
  const c = await getCatalog();
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      ...c.products.map((d) => ({
        '@type': 'Product',
        name: `ADRENL ${d.name} graphic tee`,
        description: `${d.story} ${d.print}.`,
        brand: { '@type': 'Brand', name: 'ADRENL' },
        color: d.colour,
        category: 'T-shirts',
        sku: `ADRENL-B01-${d.name}`,
        material: 'Cotton',
        size: d.sizes,
        countryOfOrigin: 'IN',
        image: d.shots.map((v) => `${SITE.url}/img/${v.png}`),
        url: `${SITE.url}/#${d.id}`,
        offers: {
          '@type': 'Offer', price: String(d.price), priceCurrency: SITE.currency,
          availability: 'https://schema.org/PreOrder', ...(c.open ? {} : { availabilityStarts: SITE.dropISO }),
          itemCondition: 'https://schema.org/NewCondition', url: `${SITE.url}/#shop`, seller: { '@id': `${SITE.url}/#org` },
          ...(c.shipping === 0 ? { shippingDetails: { '@type': 'OfferShippingDetails', shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: SITE.currency }, shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IN' } } } : {}),
        },
      })),
      { '@type': 'FAQPage', mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: (c.open && f.aOpen) || f.a } })) },
    ],
  };
  return (
    <>
      <Site catalog={c} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
