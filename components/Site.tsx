'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { setupGsap } from '@/lib/gsap';
import { COPY, SITE } from '@/lib/data';
import { fromPrice, type Catalog } from '@/lib/catalog';
import { Mark } from './Mark';
import { Hero } from './Hero';
import { Story } from './Story';
import { Routes } from './Routes';
import { Shop, type Added } from './Shop';
import { Account } from './Checkout';
import { AddedSheet, BagDrawer } from './Bag';
import { StoreProvider, useStore } from './Store';
import { track } from '@/lib/track';
import { Build, Drop, Voices, Faq, Footer } from './Sections';
import { rupee } from './hooks';

const LINKS: [string, string][] = [['#story', 'Story'], ['#routes', 'Routes'], ['#build', 'The tee'], ['#faq', 'FAQ']];

export default function Site({ catalog }: { catalog: Catalog }) {
  return <StoreProvider initial={catalog}><Page /></StoreProvider>;
}

function Page() {
  const root = useRef<HTMLDivElement>(null);
  const { cat, units, subtotal, user } = useStore();
  const [sel, setSel] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [account, setAccount] = useState(false);
  const [added, setAdded] = useState<Added | null>(null);
  const [bump, setBump] = useState(false);
  const [menu, setMenu] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const l = window.__lenis as unknown as { scrollTo?: (t: Element, o?: object) => void } | undefined;
    if (l?.scrollTo) l.scrollTo(el, { duration: 1.4 }); else el.scrollIntoView({ behavior: 'smooth' });
  }, []);
  const choose = useCallback((i: number) => { setSel(i); scrollTo('shop'); }, [scrollTo]);
  const chooseRoute = useCallback((i: number) => { choose(i); track('select_design', { id: cat.products[i]?.id, from: 'routes' }); }, [choose, cat.products]);

  const onAdded = useCallback((a: Added) => {
    setAdded(a); setBump(true);
    setTimeout(() => setBump(false), 600);
  }, []);
  const closeAdded = useCallback(() => setAdded(null), []);
  const openBag = useCallback(() => { setAdded(null); setDrawer(true); }, []);
  // From the bag's suggestions: show that design in the shop.
  const pickFromBag = useCallback((i: number) => { setSel(i); track('select_design', { id: cat.products[i]?.id, from: 'bag' }); setTimeout(() => scrollTo('shop'), 350); }, [cat.products, scrollTo]);

  // How far down the page each visit gets (once per section).
  useEffect(() => {
    const seen = new Set<string>();
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      const id = (e.target as HTMLElement).id || 'footer';
      if (e.isIntersecting && !seen.has(id)) { seen.add(id); track('section_view', { section: id }); }
    }), { threshold: 0.35 });
    document.querySelectorAll('main section[id], footer.foot').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // "Try again" from the order page lands on /?bag=open: open the bag (still saved) and tidy the address bar.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('bag') !== 'open') return;
    setDrawer(true);
    history.replaceState(null, '', window.location.pathname + window.location.hash);
  }, []);

  // Nav and phone buy bar react to where the reader is: light over the hero, solid after, bar hidden in the shop.
  useEffect(() => {
    const nav = document.querySelector('.nav'), bar = document.querySelector('.buybar');
    const hero = document.getElementById('top'), shop = document.getElementById('shop');
    const update = () => {
      const y = window.scrollY, h = hero?.offsetHeight ?? 0;
      nav?.classList.toggle('on-dark', y < h - 70);
      nav?.classList.toggle('is-scrolled', y >= h - 70);
      const s = shop?.getBoundingClientRect();
      const inShop = s ? s.top < window.innerHeight * 0.6 && s.bottom > window.innerHeight * 0.4 : false;
      bar?.classList.toggle('show', y > h * 0.75 && !inShop);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);

  useEffect(() => {
    const { gsap, ScrollTrigger } = setupGsap();
    const html = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { html.dataset.motion = 'off'; html.classList.remove('intro'); setLoaded(true); return; }
    html.dataset.motion = 'on';

    const sc = (window as unknown as { __SCROLLER?: HTMLElement }).__SCROLLER;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95, ...(sc ? { wrapper: sc, content: sc.firstElementChild as HTMLElement } : {}) });
    (window as unknown as { __lenis: unknown }).__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute('href')!.slice(1);
      const t = id ? document.getElementById(id) : document.body;
      if (t) { e.preventDefault(); setMenu(false); lenis.scrollTo(id === 'top' ? 0 : t, { duration: 1.5 }); }
    };
    document.addEventListener('click', onClick);
    // Re-measure scroll positions when the page height changes (late images, fonts).
    let lastH = 0, rt: ReturnType<typeof setTimeout> | undefined;
    const ro = new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastH) < 2) return;
      lastH = h; clearTimeout(rt); rt = setTimeout(() => ScrollTrigger.refresh(), 180);
    });
    ro.observe(document.body);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    const ctx = gsap.context(() => {
      // The page arrives with the hero text held back by the `intro` class (set in <head> before first paint).
      // Take over that starting state, drop the class, then let the text rise in. No loading screen.
      gsap.set('.hero-title .ci', { y: 0, yPercent: 110 }); // y: 0 clears the px offset GSAP reads from the CSS hold
      gsap.set('[data-hero]', { y: 18, opacity: 0 });
      gsap.set('[data-rise]', { y: 18 }); // the lead is the page's main content: it paints at once and only slides
      html.classList.remove('intro');
      const intro = gsap.timeline({ onComplete: () => { setLoaded(true); ScrollTrigger.refresh(); } });
      intro
        .from('.hero-media', { scale: 1.05, duration: 2, ease: 'expo.out' }, 0)
        .to('.hero-title .ci', { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.022 }, 0.05)
        .to('[data-hero]', { y: 0, opacity: 1, duration: 0.8, stagger: 0.07, ease: 'power3.out' }, 0.35)
        .to('[data-rise]', { y: 0, duration: 0.9, ease: 'power3.out' }, 0.3);

      gsap.to('.hero-inner', { yPercent: -10, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true } });
      gsap.to('.hero-media', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el, i) => {
        gsap.fromTo(el, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: (i % 4) * 0.06, scrollTrigger: { trigger: el, start: 'top 96%', once: true } });
      });
      gsap.utils.toArray<HTMLElement>('.sh').forEach((el) => {
        gsap.from(el.children, { y: 22, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 94%', once: true } });
      });
      gsap.utils.toArray<HTMLElement>('[data-draw]').forEach((el) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 80%', once: true } });
        tl.fromTo(el.querySelectorAll('path[pathLength]'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut', stagger: 0.05 })
          .fromTo(el.querySelectorAll('text, rect, .td-mark'), { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.04 }, '-=0.9');
      });
      const route = document.querySelector('[data-route]');
      if (route) {
        const lis = route.querySelectorAll('li');
        gsap.fromTo(route.querySelector('.route-line'), { strokeDashoffset: 1 }, {
          strokeDashoffset: 0, ease: 'none',
          scrollTrigger: { trigger: route, start: 'top 85%', end: 'bottom 55%', scrub: 0.4, onUpdate: (s) => lis.forEach((li, i) => li.classList.toggle('on', s.progress >= [0.02, 0.5, 0.95][i])) },
        });
      }
    }, root);

    return () => {
      ctx.revert();
      ro.disconnect(); clearTimeout(rt);
      document.removeEventListener('click', onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete (window as unknown as { __lenis?: unknown }).__lenis;
    };
  }, []);

  return (
    <div ref={root} className={`site ${loaded ? 'is-loaded' : ''}`}>
      <header className={`nav on-dark ${menu ? 'is-open' : ''}`}>
        <a href="#top" className="brand" aria-label="ADRENL, back to top"><Mark className="brand-mark" title="" /><span>ADRENL</span></a>
        <nav className="nav-links" aria-label="Main">{LINKS.map(([h, t]) => <a key={h} href={h} data-track="nav_click" data-track-props={JSON.stringify({ to: h })}>{t}</a>)}</nav>
        <div className="nav-right">
          <a className="btn btn-sm nav-cta" href="#shop" data-track="cta_click" data-track-props='{"cta":"nav_preorder"}'>Preorder</a>
          <button className="acct-btn" onClick={() => setAccount(true)} data-track="account_open">{user ? 'Orders' : 'Sign in'}</button>
          <button className={`bag-btn ${bump ? 'bump' : ''}`} onClick={openBag} aria-label={`Bag, ${units} ${units === 1 ? 'tee' : 'tees'}`}>
            Bag{units > 0 && <span className="bag-n" aria-hidden="true">{units}</span>}
          </button>
          <button className="menu-btn" aria-expanded={menu} aria-controls="menu" onClick={() => setMenu((m) => !m)}>{menu ? 'Close' : 'Menu'}</button>
        </div>
      </header>
      <div id="menu" className={`menu ${menu ? 'is-open' : ''}`} aria-hidden={!menu}>
        <nav aria-label="Main, mobile">
          {LINKS.map(([h, t]) => <a key={h} href={h} tabIndex={menu ? 0 : -1}>{t}</a>)}
          <a href="#shop" tabIndex={menu ? 0 : -1}><em>Preorder</em></a>
          <button tabIndex={menu ? 0 : -1} onClick={() => { setMenu(false); setAccount(true); }}>{user ? 'Your orders' : 'Sign in'}</button>
        </nav>
        <p className="eyebrow">Batch 01 <i className="sep">·</i> {cat.open ? COPY.live.badge : `Opens ${SITE.dropLabel}`}</p>
      </div>

      <main id="main">
        <Hero />
        <Story />
        <Routes onChoose={chooseRoute} />
        <Shop sel={sel} setSel={setSel} onAdded={onAdded} onOpenBag={openBag} />
        <Build />
        <Drop />
        <Voices />
        <Faq />
      </main>
      <Footer />

      <div className={`buybar ${added ? 'is-hidden' : ''}`} aria-hidden="false">
        {units > 0 ? (
          <>
            <button className="buybar-bag" onClick={openBag}><b>{rupee(subtotal)}</b><span>{units} {units === 1 ? 'tee' : 'tees'} in your bag <i className="sep">·</i> View</span></button>
            {cat.open
              ? <a className="btn btn-sm" href="/checkout" data-track="checkout_click" data-track-props='{"from":"buybar"}'>Checkout</a>
              : <button className="btn btn-sm" onClick={openBag}>View bag</button>}
          </>
        ) : (
          <>
            <p><b>{rupee(fromPrice(cat))}</b><span>Batch 01 <i className="sep">·</i> {cat.open ? COPY.live.badge : `Opens ${SITE.dropShort}`}</span></p>
            <a className="btn btn-sm" href="#shop" data-track="cta_click" data-track-props='{"cta":"buybar_preorder"}'>Preorder</a>
          </>
        )}
      </div>
      <AddedSheet added={added} onClose={closeAdded} onView={openBag} />
      <BagDrawer open={drawer} onClose={() => setDrawer(false)} onPick={pickFromBag} />
      <Account open={account} onClose={() => setAccount(false)} />
    </div>
  );
}
