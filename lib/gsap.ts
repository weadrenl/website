'use client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let done = false;
export function setupGsap() {
  if (!done && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    done = true;
  }
  return { gsap, ScrollTrigger };
}
export { gsap, ScrollTrigger };
