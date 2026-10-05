// Bundles the site into a single JS + CSS pair for a static preview host.
// Usage: node scripts/build-preview.mjs <outdir>
import { build } from 'esbuild';
import path from 'path';
const root = path.resolve('.');
const out = process.argv[2] || 'preview-dist';
await build({
  entryPoints: ['preview/entry.tsx'], bundle: true, format: 'esm', minify: true, outfile: `${out}/site.js`,
  jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' },
  alias: { '@': root },
  plugins: [{ name: 'fonts', setup(b) { b.onResolve({ filter: /^\/fonts\// }, (a) => ({ path: '.' + a.path, external: true })); } }],
});
