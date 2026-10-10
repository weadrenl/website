'use client';
import { useEffect, useRef, type ReactNode } from 'react';

declare global { interface Window { __lenis?: { stop: () => void; start: () => void } } }

export function Modal({ open, onClose, label, side = false, wide = false, children }: { open: boolean; onClose: () => void; label: string; side?: boolean; wide?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    window.__lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    const focusables = () => Array.from(ref.current?.querySelectorAll<HTMLElement>('button,a[href],input,select,[tabindex]:not([tabindex="-1"])') ?? []);
    focusables()[0]?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const f = focusables();
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('keydown', key);
      document.documentElement.style.overflow = '';
      window.__lenis?.start();
      prev?.focus();
    };
  }, [open, onClose]);
  return (
    <div className={`modal ${side ? 'is-side' : ''} ${wide ? 'is-wide' : ''} ${open ? 'is-open' : ''}`} aria-hidden={!open} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label={label} ref={ref}>
        {open && children}
      </div>
    </div>
  );
}
