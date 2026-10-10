// Renders public/og.jpg (1200 x 630) from a small HTML page using the locally installed Chrome.
// Usage: node scripts/build-og.mjs
import { chromium } from 'playwright-core';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';

const root = path.resolve('.');
const u = (p) => pathToFileURL(path.join(root, 'public', p)).href;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:F;src:url(${u('fonts/fraunces.woff2')}) format('woff2-variations');font-weight:100 900}
@font-face{font-family:F;src:url(${u('fonts/fraunces-italic.woff2')}) format('woff2-variations');font-weight:100 900;font-style:italic}
@font-face{font-family:H;src:url(${u('fonts/schibsted.woff2')}) format('woff2-variations');font-weight:400 900}@font-face{font-family:H;src:url(${u('fonts/schibsted-ext.woff2')}) format('woff2-variations');font-weight:400 900;unicode-range:U+20A0-20C0}
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#f2eee6;color:#15130f;font-family:H,Helvetica,Arial,sans-serif}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(21,19,15,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(21,19,15,.12) 1px,transparent 1px);background-size:150px 150px;background-position:75px 15px}
.copy{position:absolute;left:72px;top:64px;width:600px}
.brand{display:flex;align-items:center;gap:12px;font-weight:600;font-size:18px;letter-spacing:.22em}
.brand svg{width:26px;height:auto}
h1{font-family:F;font-weight:300;font-variation-settings:'opsz' 144,'SOFT' 0,'WONK' 0;font-size:124px;line-height:.9;letter-spacing:-.035em;margin:48px 0 30px}
h1 em{font-style:italic;font-weight:850;letter-spacing:-.04em;font-variation-settings:'opsz' 144,'SOFT' 0,'WONK' 1}
p{font-size:22px;line-height:1.4;color:#514c44;margin:0;max-width:520px}
.meta{position:absolute;left:72px;bottom:56px;font-size:15px;letter-spacing:.08em;text-transform:uppercase;color:#514c44;font-weight:500}
.meta b{color:#15130f;font-size:22px;font-weight:700;letter-spacing:0;text-transform:none;margin-right:6px}
.stage{position:absolute;right:40px;top:0;width:520px;height:630px}
.stage img{position:absolute;bottom:-40px;height:600px;width:auto;-webkit-mask-image:linear-gradient(#000 78%,transparent 98%)}
.a{left:0;z-index:2}.b{left:150px;height:560px!important;bottom:-30px!important;z-index:1;opacity:.95}.c{left:300px;z-index:3}
.rule{position:absolute;right:40px;left:720px;bottom:70px;height:1px;background:rgba(21,19,15,.35)}
.roman{position:absolute;right:56px;top:30px;font-family:F;font-size:220px;line-height:1;opacity:.06;font-variation-settings:'opsz' 144}
</style></head><body>
<div class="grid"></div>
<div class="roman">I·II·III</div>
<div class="copy">
  <div class="brand"><svg viewBox="72 30 640 560" fill="#15130f"><path opacity=".42" d="M389.5 95.5 L524.5 434.5 L693 576.5 L455 483 L525.5 437.5 L390.5 315.5 L253.5 437 L325.5 483.5 L86 576.5 L253.5 435.5 Z"/><path d="M389 42 L694.5 577.5 L525 434.5 L390 95 L253 435.5 L83.5 576.5 Z"/><path d="M387.5 317 L326.5 482.5 L254 439.5 Z"/><path d="M391 317 L525 438 L452 480.5 Z"/></svg>ADRENL</div>
  <h1>Take the<br><em>long way.</em></h1>
  <p>Tees for the ride before sunrise, the climb after the turn and the detour you never planned.</p>
</div>
<div class="meta"><b>₹799</b> First-run price &nbsp;·&nbsp; Batch 01 opens 31 October 2026</div>
<div class="stage">
  <img class="b" src="${u('img/garud-back-model.png')}">
  <img class="a" src="${u('img/ridge-front-model.png')}">
  <img class="c" src="${u('img/marcos-side-model.png')}">
</div>
</body></html>`;

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--disable-gpu'] });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
// Load from a file:// origin so the page may read the local fonts and images.
const dir = mkdtempSync(path.join(os.tmpdir(), 'adrenl-og-'));
const file = path.join(dir, 'og.html');
writeFileSync(file, html);
await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
await page.screenshot({ path: 'public/og.jpg', type: 'jpeg', quality: 88 });
await browser.close();
console.log('wrote public/og.jpg');
