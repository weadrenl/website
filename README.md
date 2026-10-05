# ADRENL website

Next.js 15 (App Router) + React 19 + TypeScript. Motion: GSAP (ScrollTrigger) and Lenis smooth scroll.
Fonts (self-hosted): Big Shoulders Display, Archivo, IBM Plex Mono.

## Run
    npm install
    npm run dev        # http://localhost:3000
    npm run build && npm start

## Where things live
- `lib/data.ts`        all copy that changes: designs, price (Rs 799 Batch 01 / Rs 999 next batch), drop date, specs, FAQ, quotes
- `components/`        Site (smooth scroll, intro, cursor), Chapter (pinned scroll-driven product story), Shop (gallery, sizes, bag), Sections
- `app/layout.tsx`     SEO: metadata, Open Graph, JSON-LD (Organization, WebSite, Product x3 as PreOrder at INR 799, FAQPage)
- `app/sitemap.ts`, `app/robots.ts`, `public/llms.txt`   crawler and AI-search files
- `public/img`         design-preview model cutouts (transparent PNG) - replace with real photos when samples exist
- `scripts/build-preview.mjs`   bundles a static preview (not needed for deployment)

## Adding real friend quotes
Edit `QUOTES` in `lib/data.ts` (only with the person's permission):
    { text: 'Their words', name: 'First name', context: 'Rider, Pune' }
The empty slots disappear automatically.

## Before real sales (not built yet)
Checkout and payments are intentionally off. Needs: backend for orders/stock, Zoho Payments integration with server-side
price validation and signed webhook verification, Delhivery shipping, size chart from the measured sample, confirmed GSM,
dispatch/exchange policy pages, real product photos, and the exact vector logo for tee artwork.
Keep payment keys in server environment variables, never in the repo.
