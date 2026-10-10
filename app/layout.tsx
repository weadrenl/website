import type { Metadata, Viewport } from 'next';
import './globals.css';
import { DESIGNS, FAQ, SITE } from '@/lib/data';

const title = 'ADRENL | Graphic tees for the long way. Batch 01 from Rs 799';
const description = 'ADRENL Batch 01: three heavyweight graphic tees - RIDGE, GARUD and MARCOS - made for people who take the long route. Batch 01 price Rs 799, drops 31 October 2026.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title,
  description,
  alternates: { canonical: '/' },
  keywords: ['ADRENL', 'graphic t-shirts India', 'heavyweight t-shirt', 'oversized tee', 'travel t-shirt', 'RIDGE tee', 'GARUD tee', 'MARCOS tee'],
  openGraph: { type: 'website', url: SITE.url, siteName: 'ADRENL', title, description, locale: 'en_IN', images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'ADRENL Batch 01: RIDGE, GARUD and MARCOS tees' }] },
  twitter: { card: 'summary_large_image', title, description, images: ['/og.jpg'] },
  robots: { index: true, follow: true },
  icons: { icon: '/logo.svg' },
};
export const viewport: Viewport = { themeColor: '#0d0e10', width: 'device-width', initialScale: 1 };

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': `${SITE.url}/#org`, name: 'ADRENL', url: SITE.url, logo: `${SITE.url}/logo.svg` },
    { '@type': 'WebSite', '@id': `${SITE.url}/#site`, url: SITE.url, name: 'ADRENL', publisher: { '@id': `${SITE.url}/#org` }, inLanguage: 'en-IN' },
    ...DESIGNS.map((d) => ({
      '@type': 'Product',
      name: `ADRENL ${d.name} graphic tee`,
      description: `${d.story} ${d.print}.`,
      brand: { '@type': 'Brand', name: 'ADRENL' },
      color: d.colour,
      category: 'T-shirts',
      image: d.shots.map((v) => `${SITE.url}/img/${v.png}`),
      url: `${SITE.url}/#${d.id}`,
      offers: {
        '@type': 'Offer', price: String(SITE.price), priceCurrency: SITE.currency,
        availability: 'https://schema.org/PreOrder', itemCondition: 'https://schema.org/NewCondition',
        url: `${SITE.url}/#select`, seller: { '@id': `${SITE.url}/#org` },
      },
    })),
    { '@type': 'FAQPage', mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('intro')" }} />
        <link rel="preload" href="/fonts/fraunces.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/schibsted.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
