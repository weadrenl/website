# ADRENL website

Next.js 15 (App Router) + React 19 + TypeScript. Motion: GSAP (ScrollTrigger) and Lenis.
Fonts (self-hosted in `public/fonts`): Fraunces (display) and Schibsted Grotesk (text, UI, numbers).
Schibsted is used for every price because it has a real ₹ glyph; Fraunces does not in its Latin subset.

## Run
    npm install
    npm run dev        # http://localhost:3000
    npm run build && npm start
    npm run lint       # type-check

## How the page is put together
One story, each design introduced once and chosen once. No 3D, no faked depth on photos.
1. Hero: full-bleed film, a different route's film on each visit (see below).
   The bottom edge is a ridge silhouette in the page colour.
2. Story: Cold starts. Wrong turns. One more hill.
3. Routes: the copy for RIDGE, GARUD and MARCOS scrolls past; the models (cut-outs that fade out at the bottom)
   stay pinned and change with it. Phones get a swipeable strip per route instead.
4. Shop: gallery of the models (back, front, side) and a print close-up, design, size, bag, Details.
5. The tee: four plain benefits and a line drawing. Exact specs live only in Details and the FAQ.
6. The drop: countdown, route to the drop date, Add to calendar (.ics made in the browser).
7. FAQ, footer. Phones also get a sticky Preorder bar between the hero and the shop.

## Hero films
Three films, one per route; each visit plays the next one (remembered in the browser), and a small tag in the
corner names the route and links to it. Phones get a portrait cut, everything else a landscape cut.
All three are free Pexels clips (Pexels licence: free for commercial use, no attribution required; we credit anyway).

| Route  | Source clip | Creator | Cut |
|--------|-------------|---------|-----|
| RIDGE  | https://www.pexels.com/video/scenic-himalayan-river-through-misty-mountains-30152883/ | Vijay Kothare | 4.6-13.9 s (skips a construction site), phone crop at 0.55 |
| GARUD  | https://www.pexels.com/video/scenic-drive-through-zanskar-valley-mountains-39802770/ | Sanjiv Joshi | 0-11 s, phone crop at 0.44 |
| MARCOS | https://www.pexels.com/video/dramatic-drone-view-of-north-sea-cliffs-36505810/ | Mike Art | 0-12 s, phone crop at 0.42, CRF=30 |

To rebuild or add one (needs ffmpeg):
    scripts/prep-film.sh <raw.mp4> garud-16x9 0 11 land
    scripts/prep-film.sh <raw.mp4> garud-9x16 0 11 crop:0.44
Then list it in `HERO_FILMS` in `lib/data.ts`. Empty the list to fall back to the drawn dawn scene.
Best upgrade later: your own footage of the finished tees on the road, shot in 4K landscape so one clip gives both cuts.

## Where things live
- `lib/data.ts`              copy (`COPY`), `HERO_FILMS`, designs, price, drop date, `DETAILS`, FAQ, quotes
- `components/Hero.tsx`      hero, film player; `Dawn.tsx` is the drawn fallback scene (canvas, cheap on phones)
- `components/Story.tsx`, `Routes.tsx`, `Shop.tsx`, `Sections.tsx` (the tee, drop, voices, FAQ, footer)
- `components/Engrave.tsx`   SVG: contours, ridge edge, compass rose, route line, tee drawing, icons
- `components/Site.tsx`      shell: smooth scroll, intro, nav, phone menu, buy bar, global reveals
- `app/layout.tsx`           SEO: metadata, Open Graph, JSON-LD (Organization, WebSite, Product x3 as PreOrder, FAQPage)
- `public/img`               source photos (`*-front.jpg` etc.), cut-outs (`*-model.png`), flat lays, generated files
- `scripts/prep-images.mjs`  trims and converts the photos to WebP, extracts the back prints as plates
- `scripts/prep-film.sh`     prepares hero films (needs ffmpeg)
- `scripts/build-og.mjs`     renders `public/og.jpg` with the local Chrome

## Images
After replacing a photo (keep names and the 512 x 1024 size), run `node scripts/prep-images.mjs`.
Higher-resolution photos of the finished samples are the biggest visual upgrade available.

## Adding real friend quotes
Edit `QUOTES` in `lib/data.ts` (only with the person's permission):
    { text: 'Their words', name: 'First name', context: 'Rider, Pune' }
The section appears automatically once there is at least one quote.

## Before real sales (not built yet)
Checkout and payments are intentionally off. Needs: backend for orders/stock, Zoho Payments integration with server-side
price validation and signed webhook verification, Delhivery shipping, size chart from the measured sample, confirmed GSM,
dispatch/exchange policy pages, real product photos, and the exact vector logo for tee artwork.
Worth adding before the drop: a way to capture interest (email or WhatsApp list) so the launch has people to tell.
Keep payment keys in server environment variables, never in the repo.
