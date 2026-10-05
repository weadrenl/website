// Image URL resolver. In Next.js, images live in /public/img.
// (The hosted preview injects a map on window.__ASSETS instead.)
declare global { interface Window { __ASSETS?: Record<string, string> } }
export const img = (name: string): string =>
  (typeof window !== 'undefined' && window.__ASSETS?.[name]) || `/img/${name}`;
