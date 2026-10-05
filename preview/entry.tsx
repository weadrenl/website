// Entry used only for the hosted static preview bundle (not part of the Next.js app).
// The preview host embeds the page in an auto-height frame, so the site is shown inside its own scroll window.
import '../app/globals.css';
import { createRoot } from 'react-dom/client';
import Site from '@/components/Site';
import { setupGsap } from '@/lib/gsap';

export function mount(host: HTMLElement, assets: Record<string, string>) {
  (window as unknown as { __ASSETS: Record<string, string> }).__ASSETS = assets;
  const h = Math.round(Math.max(560, Math.min(920, (window.screen?.height || 800) * 0.82)));
  const scroller = document.createElement('div');
  scroller.style.cssText = `height:${h}px;overflow-y:auto;overflow-x:hidden;position:relative;`;
  scroller.style.setProperty('--svh', `${h / 100}px`);
  const inner = document.createElement('div');
  scroller.appendChild(inner);
  host.appendChild(scroller);
  (window as unknown as { __SCROLLER: HTMLElement }).__SCROLLER = scroller;
  const { ScrollTrigger } = setupGsap();
  ScrollTrigger.defaults({ scroller });
  const root = createRoot(inner);
  root.render(<Site />);
  return () => { root.unmount(); scroller.remove(); };
}
