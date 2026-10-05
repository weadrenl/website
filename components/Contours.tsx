'use client';
import { useMemo } from 'react';

// Procedural topographic lines. Pure SVG, no image, no randomness at render time (seeded).
function rng(seed: number) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

export function Contours({ seed = 7, rings = 14, className = '' }: { seed?: number; rings?: number; className?: string }) {
  const paths = useMemo(() => {
    const r = rng(seed * 9301 + 49297);
    const phases = Array.from({ length: 5 }, () => r() * Math.PI * 2);
    const out: string[] = [];
    for (let i = 1; i <= rings; i++) {
      const base = 28 + i * 21;
      const pts: string[] = [];
      const steps = 72;
      for (let s = 0; s <= steps; s++) {
        const a = (s / steps) * Math.PI * 2;
        const wob = Math.sin(a * 2 + phases[0]) * 0.1 + Math.sin(a * 3 + phases[1] + i * 0.15) * 0.07 + Math.sin(a * 5 + phases[2]) * 0.035;
        const rad = base * (1 + wob * (1 + i / rings));
        const x = 500 + Math.cos(a) * rad * 1.25;
        const y = 400 + Math.sin(a) * rad * 0.9;
        pts.push(`${s ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
      }
      out.push(pts.join(' ') + 'Z');
    }
    return out;
  }, [seed, rings]);
  return (
    <svg className={`contours ${className}`} viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {paths.map((d, i) => <path key={i} d={d} vectorEffect="non-scaling-stroke" style={{ opacity: 0.25 + (i / paths.length) * 0.5 }} />)}
    </svg>
  );
}
