'use client';
import { useEffect, useRef } from 'react';

/**
 * Dawn: the hero's moving backdrop until real footage exists.
 * Layered ridgelines at first light, drifting at different speeds as if seen from a moving vehicle,
 * valley fog, the last stars, and one headlamp working its way along a far ridge road.
 * Each layer is drawn once into a seamless tile and then only blitted, so it runs cheaply on phones.
 */
const TAU = Math.PI * 2;
function rng(seed: number) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

type Layer = { base: number; amp: number; color: [number, number, number]; speed: number; fog: number; rim: number; sharp: number; terms: [number, number, number][] };

const HAZE: [number, number, number] = [150, 128, 101];
const mix = (a: [number, number, number], b: [number, number, number], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t)) as [number, number, number];
const rgb = (c: [number, number, number], a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

function makeLayers(): Layer[] {
  const r = rng(29);
  // Far: a high, jagged range. Middle: foothills. Near: low rolling ground, almost black.
  const spec: [number, number, [number, number, number], number, number, number, number[], number, number][] = [
    // base, amp, colour, speed px/s, fog, rim light, frequencies, decay, peak sharpness
    [0.6, 0.27, [124, 106, 86], 1.6, 0.6, 0.28, [2, 3, 5, 9, 17, 33], 1.25, 1.7],
    [0.63, 0.16, [92, 79, 65], 3.4, 0.55, 0.14, [3, 4, 7, 13, 27], 1.4, 1.4],
    [0.7, 0.12, [62, 54, 45], 6.5, 0.45, 0.07, [2, 4, 6, 11, 23], 1.6, 1.2],
    [0.78, 0.09, [38, 34, 29], 11, 0.32, 0.03, [2, 3, 5, 9], 1.7, 1.0],
    [0.87, 0.07, [22, 20, 17], 18, 0.15, 0, [1, 2, 4, 7], 1.8, 0.9],
  ];
  return spec.map(([base, amp, color, speed, fog, rim, freqs, decay, sharp]) => ({
    base, amp, color, speed, fog, rim, sharp,
    terms: freqs.map((k, j) => [k, Math.pow(1 / (j + 1), decay), r() * TAU] as [number, number, number]),
  }));
}

/** Seamless ridge height in 0..1 for x in tile units 0..1. Ridged sines give sharp peaks and soft valleys. */
function ridge(l: Layer, x: number) {
  let h = 0, norm = 0;
  l.terms.forEach(([k, a, p]) => {
    h += a * Math.pow(1 - Math.abs(Math.sin(Math.PI * k * x + p)), l.sharp);
    norm += a;
  });
  return Math.pow(h / norm, 1.35);
}

export function Dawn({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current!, ctx = c.getContext('2d', { alpha: false })!;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const layers = makeLayers();
    const stars = (() => { const r = rng(5); return Array.from({ length: 70 }, () => ({ x: r(), y: r() * 0.42, s: 0.4 + r() * 1.1, p: r() * TAU, a: 0.25 + r() * 0.55 })); })();
    let W = 0, H = 0, dpr = 1, P = 0;
    let sky: HTMLCanvasElement | null = null, tiles: HTMLCanvasElement[] = [], fog: HTMLCanvasElement | null = null;

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, c.clientWidth); H = Math.max(1, c.clientHeight);
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      P = Math.max(W * 1.5, 1400);
      // Sky: deep blue-black overhead, warm dust at the horizon, a low sun behind the far ridges.
      sky = document.createElement('canvas'); sky.width = c.width; sky.height = c.height;
      const s = sky.getContext('2d')!; s.scale(dpr, dpr);
      const g = s.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0c0e11'); g.addColorStop(0.32, '#1b1c1e'); g.addColorStop(0.5, '#3a342c'); g.addColorStop(0.62, '#7d6a53'); g.addColorStop(0.72, '#a68c6b'); g.addColorStop(1, '#a68c6b');
      s.fillStyle = g; s.fillRect(0, 0, W, H);
      const sx = W * (W < 700 ? 0.62 : 0.7), sy = H * 0.6;
      const sun = s.createRadialGradient(sx, sy, 0, sx, sy, Math.max(W, H) * 0.55);
      sun.addColorStop(0, 'rgba(255,214,160,0.55)'); sun.addColorStop(0.12, 'rgba(240,180,120,0.28)'); sun.addColorStop(0.45, 'rgba(200,140,90,0.08)'); sun.addColorStop(1, 'rgba(200,140,90,0)');
      s.fillStyle = sun; s.fillRect(0, 0, W, H);
      // Ridge tiles, each P wide and seamless.
      tiles = layers.map((l) => {
        const t = document.createElement('canvas'); t.width = Math.round(P * dpr); t.height = c.height;
        const x = t.getContext('2d')!; x.scale(dpr, dpr);
        const top = (u: number) => H * l.base - H * l.amp * ridge(l, u);
        x.beginPath(); x.moveTo(0, H);
        const N = Math.ceil(P / 3);
        for (let i = 0; i <= N; i++) { const u = i / N; x.lineTo(u * P, top(u)); }
        x.lineTo(P, H); x.closePath();
        const minTop = H * (l.base - l.amp);
        const lg = x.createLinearGradient(0, minTop, 0, H);
        lg.addColorStop(0, rgb(l.color)); lg.addColorStop(0.45, rgb(mix(l.color, HAZE, l.fog * 0.6))); lg.addColorStop(1, rgb(mix(l.color, HAZE, l.fog)));
        x.fillStyle = lg; x.fill();
        if (l.rim > 0) {
          x.beginPath();
          for (let i = 0; i <= N; i++) { const u = i / N; const y = top(u); if (i) x.lineTo(u * P, y); else x.moveTo(0, y); }
          x.strokeStyle = `rgba(255,220,175,${l.rim})`; x.lineWidth = 1; x.stroke();
        }
        return t;
      });
      // Fog: soft blobs on a seamless strip.
      fog = document.createElement('canvas'); fog.width = Math.round(P * dpr); fog.height = Math.round(H * 0.22 * dpr);
      const fx = fog.getContext('2d')!; fx.scale(dpr, dpr);
      const fr = rng(17), fh = H * 0.22;
      for (let i = 0; i < 30; i++) {
        const bx = fr() * P, by = fh * (0.4 + fr() * 0.2), rw = 140 + fr() * 260;
        for (const ox of [-P, 0, P]) {
          fx.save(); fx.translate(bx + ox, by); fx.scale(1, 0.28);
          const rg = fx.createRadialGradient(0, 0, 0, 0, 0, rw);
          rg.addColorStop(0, 'rgba(176,156,128,0.2)'); rg.addColorStop(1, 'rgba(176,156,128,0)');
          fx.fillStyle = rg; fx.fillRect(-rw, -rw, rw * 2, rw * 2); fx.restore();
        }
      }
      fx.globalCompositeOperation = 'destination-in';
      const fm = fx.createLinearGradient(0, 0, 0, fh);
      fm.addColorStop(0, 'rgba(0,0,0,0)'); fm.addColorStop(0.35, 'rgba(0,0,0,1)'); fm.addColorStop(0.65, 'rgba(0,0,0,1)'); fm.addColorStop(1, 'rgba(0,0,0,0)');
      fx.fillStyle = fm; fx.fillRect(0, 0, P, fh); fx.globalCompositeOperation = 'source-over';
    };

    // Headlamp along the skyline of layer 3: a vehicle climbing a far road.
    const lampLayer = 2;
    let t0 = performance.now(), raf = 0, visible = true;
    const draw = (now: number) => {
      const t = reduced ? 8 : (now - t0) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (sky) ctx.drawImage(sky, 0, 0, W, H);
      // Stars fade toward the horizon and twinkle slowly.
      for (const st of stars) {
        const a = st.a * (0.7 + 0.3 * Math.sin(t * 0.8 + st.p)) * (1 - st.y / 0.42);
        ctx.fillStyle = `rgba(240,232,215,${a.toFixed(3)})`;
        ctx.fillRect(st.x * W, st.y * H, st.s, st.s);
      }
      layers.forEach((l, i) => {
        const off = (t * l.speed) % P;
        const tile = tiles[i];
        ctx.drawImage(tile, -off, 0, P, H);
        if (P - off < W) ctx.drawImage(tile, P - off, 0, P, H);
        if (i === lampLayer) {
          // Lamp moves along the layer, in tile space, faster than the layer drifts.
          const u = ((t * 9) / P + 0.3) % 1;
          let lx = u * P - off; if (lx < -20) lx += P;
          const ly = H * l.base - H * l.amp * ridge(l, u) + 3;
          if (lx > -20 && lx < W + 20) {
            const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, 12);
            glow.addColorStop(0, 'rgba(255,226,170,0.5)'); glow.addColorStop(1, 'rgba(255,226,170,0)');
            ctx.fillStyle = glow; ctx.fillRect(lx - 12, ly - 12, 24, 24);
            ctx.fillStyle = 'rgba(255,240,210,0.95)'; ctx.beginPath(); ctx.arc(lx, ly, 1.1, 0, TAU); ctx.fill();
          }
        }
        if ((i === 1 || i === 2) && fog) {
          const fo = (t * (l.speed * 1.6)) % P, fy = H * (l.base + 0.02);
          ctx.globalAlpha = 0.85;
          ctx.drawImage(fog, -fo, fy, P, H * 0.22);
          if (P - fo < W) ctx.drawImage(fog, P - fo, fy, P, H * 0.22);
          ctx.globalAlpha = 1;
        }
      });
    };
    const frame = (now: number) => { raf = requestAnimationFrame(frame); if (visible) draw(now); };

    build(); draw(performance.now());
    if (!reduced) raf = requestAnimationFrame(frame);
    let rt: ReturnType<typeof setTimeout> | undefined;
    const ro = new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(() => { build(); draw(performance.now()); }, 120); });
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(c);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); clearTimeout(rt); };
  }, []);

  return <canvas ref={ref} className={`dawn ${className}`} aria-hidden="true" />;
}
