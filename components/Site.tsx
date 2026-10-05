'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { setupGsap } from '@/lib/gsap';
import { DESIGNS } from '@/lib/data';
import { Mark } from './Mark';
import { Chapter } from './Chapter';
import { Shop, BagDrawer, type BagItem } from './Shop';
import { Hero, Marquee, Manifesto, Specs, Batch, Voices, Faq, Footer } from './Sections';

export default function Site() {
  const root = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState(0);
  const [bag, setBag] = useState<BagItem[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [toast, setToast] = useState('');
  const [loaded, setLoaded] = useState(false);
  const toastT = useRef<ReturnType<typeof setTimeout>>(undefined);

  const choose = useCallback((i: number) => {
    setSel(i);
    const el = document.getElementById('shop');
    if (el) (window.__lenis as unknown as { scrollTo?: (t: Element, o?: object) => void })?.scrollTo?.(el, { offset: 0, duration: 1.4 }) ?? el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const add = useCallback((b: BagItem) => {
    setBag((x) => [...x, b]);
    setToast(`${b.name} / ${b.size} added to your bag`);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(''), 2600);
  }, []);

  useEffect(() => {
    const { gsap, ScrollTrigger } = setupGsap();
    const html = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { html.dataset.motion = 'off'; setLoaded(true); return; }
    html.dataset.motion = 'on';

    const sc = (window as unknown as { __SCROLLER?: HTMLElement }).__SCROLLER;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95, ...(sc ? { wrapper: sc, content: sc.firstElementChild as HTMLElement } : {}) });
    (window as unknown as { __lenis: unknown }).__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    // In-page anchors use Lenis so pinned sections do not jump.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute('href')!.slice(1);
      const t = id ? document.getElementById(id) : document.body;
      if (t) { e.preventDefault(); lenis.scrollTo(id ? t : 0, { duration: 1.6 }); }
    };
    document.addEventListener('click', onClick);

    const ctx = gsap.context(() => {
      // Intro
      const intro = gsap.timeline({ delay: 0.15, onComplete: () => { setLoaded(true); ScrollTrigger.refresh(); } });
      const count = { v: 0 };
      intro
        .fromTo('.ld-mark', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 0.9, ease: 'power3.out' })
        .to(count, { v: 100, duration: 0.9, ease: 'power2.inOut', onUpdate: () => { const n = document.querySelector('.ld-num'); if (n) n.textContent = String(Math.round(count.v)).padStart(3, '0'); } }, 0)
        .to('.loader', { yPercent: -100, duration: 0.8, ease: 'expo.inOut' }, '+=0.15')
        .set('.loader', { display: 'none' })
        .from('.hero-title .ci', { yPercent: 120, duration: 1, ease: 'expo.out', stagger: 0.03 }, '-=0.35')
        .from('[data-hero]', { y: 24, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, '-=0.7')
        .from('.hcard', { yPercent: 14, opacity: 0, rotate: 3, duration: 1.1, stagger: 0.12, ease: 'expo.out' }, '-=1')
        .from('.hero-contours path', { opacity: 0, duration: 1.2, stagger: 0.03 }, '-=1.2');

      // Hero parallax
      gsap.utils.toArray<HTMLElement>('.hcard').forEach((c, i) => {
        gsap.to(c, { yPercent: [-14, -26, -8][i], ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      });
      gsap.to('.hero-contours', { yPercent: 18, scale: 1.1, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero-copy', { yPercent: -8, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: '55% top', end: 'bottom top', scrub: true } });

      // Marquee reacts to scroll speed
      const mq = gsap.to('.mq-track', { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
      ScrollTrigger.create({ onUpdate: (s) => { const v = Math.min(Math.abs(s.getVelocity()) / 400, 6); gsap.to(mq, { timeScale: 1 + v, duration: 0.2, overwrite: true }); gsap.to(mq, { timeScale: 1, duration: 0.8, delay: 0.2, overwrite: 'auto' }); } });

      // Manifesto words
      gsap.fromTo('.manifesto .wd', { opacity: 0.14 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: '.manifesto .words', start: 'top 80%', end: 'bottom 45%', scrub: true } });

      // Generic reveals
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.fromTo(el, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: Number(el.style.getPropertyValue('--i') || 0) * 0.1, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      });
      gsap.utils.toArray<HTMLElement>('.ch-title').forEach((el) => {
        gsap.from(el.querySelectorAll('.ci'), { yPercent: 120, duration: 0.9, ease: 'expo.out', stagger: 0.018, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
      });
      gsap.utils.toArray<HTMLElement>('.shop h2, .specs h2, .batch h2, .voices h2, .faq h2').forEach((el) => {
        gsap.fromTo(el, { letterSpacing: '0.06em', opacity: 0 }, { letterSpacing: '0em', opacity: 1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      });

      // Foot title + big brand
      gsap.fromTo('.foot-brand', { yPercent: 30 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });

      // Top progress line
      gsap.to('.progress i', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.2 } });
      // Nav hides on scroll down, returns on scroll up
      ScrollTrigger.create({ start: 120, end: 'max', onUpdate: (s) => document.querySelector('.nav')?.classList.toggle('hide', s.direction === 1 && s.scroll() > 400) });
    }, root);

    // Cursor and magnetic buttons (fine pointers only)
    let cleanupPointer = () => {};
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const cur = document.querySelector<HTMLElement>('.cursor')!;
      const lab = cur.querySelector('span')!;
      const xTo = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' });
      const yTo = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });
      const move = (e: PointerEvent) => {
        cur.classList.add('on');
        xTo(e.clientX); yTo(e.clientY);
        const t = (e.target as HTMLElement).closest('[data-cursor]') as HTMLElement | null;
        cur.classList.toggle('big', !!t);
        lab.textContent = t?.dataset.cursor ?? '';
        const m = (e.target as HTMLElement).closest('.magnet') as HTMLElement | null;
        document.querySelectorAll<HTMLElement>('.magnet').forEach((b) => { if (b !== m) gsap.to(b, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' }); });
        if (m) { const r = m.getBoundingClientRect(); gsap.to(m, { x: (e.clientX - (r.left + r.width / 2)) * 0.25, y: (e.clientY - (r.top + r.height / 2)) * 0.35, duration: 0.3 }); }
      };
      const leave = () => cur.classList.remove('on');
      window.addEventListener('pointermove', move);
      document.addEventListener('pointerleave', leave);
      cleanupPointer = () => { window.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', leave); };
    }

    return () => {
      cleanupPointer();
      ctx.revert();
      document.removeEventListener('click', onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete (window as unknown as { __lenis?: unknown }).__lenis;
    };
  }, []);

  return (
    <div ref={root} className={`site ${loaded ? 'is-loaded' : ''}`}>
      <div className="loader" aria-hidden="true"><Mark className="ld-mark" /><span className="ld-num mono">000</span></div>
      <div className="progress" aria-hidden="true"><i /></div>
      <div className="cursor" aria-hidden="true"><span className="mono" /></div>
      <header className="nav">
        <a href="#top" className="brand" aria-label="ADRENL home"><Mark className="brand-mark" title="" /><span>ADRENL</span></a>
        <nav aria-label="Main">
          <a href="#ridge">Routes</a><a href="#build">The build</a><a href="#voices">Voices</a><a href="#faq">FAQ</a>
        </nav>
        <button className="bag-btn" onClick={() => setDrawer(true)} aria-label={`Open bag, ${bag.length} items`}>Bag <b>{bag.length}</b></button>
      </header>
      <main id="main">
        <Hero />
        <Marquee text="Take the long way / Ridge / Garud / Marcos / Batch 01 / " />
        <Manifesto />
        {DESIGNS.map((d, i) => <Chapter key={d.id} d={d} index={i} onChoose={choose} />)}
        <Shop sel={sel} setSel={setSel} onAdd={add} />
        <Specs />
        <Batch />
        <Voices />
        <Faq />
      </main>
      <Footer />
      <BagDrawer open={drawer} onClose={() => setDrawer(false)} items={bag} remove={(id) => setBag((x) => x.filter((i) => i.id !== id))} />
      <div className={`toast mono ${toast ? 'show' : ''}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}
