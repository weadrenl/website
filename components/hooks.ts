'use client';
import { useEffect, useLayoutEffect, useState } from 'react';

export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setR(m.matches);
    const f = () => setR(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return r;
}

export function useCountdown(iso: string) {
  const [left, setLeft] = useState<null | { d: number; h: number; m: number; s: number; done: boolean }>(null);
  useEffect(() => {
    const t = new Date(iso).getTime();
    const tick = () => {
      const ms = t - Date.now();
      if (ms <= 0) return setLeft({ d: 0, h: 0, m: 0, s: 0, done: true });
      setLeft({ d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60, done: false });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [iso]);
  return left;
}

export const pad = (n: number, l = 2) => String(n).padStart(l, '0');
export const rupee = (n: number) => '\u20B9' + n.toLocaleString('en-IN');
