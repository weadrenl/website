// Generates: WebP versions of the model cut-outs and the back graphics as transparent plates
// (colour print and ink engraving) extracted from the flat lays.
// Run: node scripts/prep-images.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const IN = 'public/img';
const OUT = 'public/img';
mkdirSync(OUT, { recursive: true });

const designs = ['ridge', 'garud', 'marcos'];
const views = ['front', 'side', 'back'];

// ---------- 1. WebP for the nine cut-outs ----------
async function webpFor(name) {
  await sharp(`${IN}/${name}-model.png`).webp({ quality: 88, alphaQuality: 92, effort: 5 }).toFile(`${OUT}/${name}-model.webp`);
  console.log('webp', name);
}

// ---------- 1b. Studio photos (with backgrounds), edges trimmed ----------
// Some source photos carry a few bright pixel columns at the left or right edge; trim them off.
async function photoFor(name) {
  const src = `${IN}/${name}.jpg`, m = await sharp(src).metadata();
  await sharp(src).extract({ left: 10, top: 4, width: m.width - 20, height: m.height - 8 })
    .webp({ quality: 90, effort: 5 }).toFile(`${OUT}/${name}-photo.webp`);
  console.log('photo', name);
}

// ---------- 2. Artwork plates from the flat lays ----------
// Crop boxes (x, y, w, h) around the printed graphic on the 1100x1375 flat lays.
const plates = {
  ridge: { left: 250, top: 420, width: 600, height: 230, label: 'Layered contours' },
  garud: { left: 270, top: 330, width: 560, height: 490, label: 'Mythic eagle' },
  marcos: { left: 260, top: 390, width: 580, height: 360, label: 'Waves and compass' },
};
const INK = [26, 23, 19], RUST = [163, 72, 38];

async function plateFor(d) {
  const box = plates[d];
  const { data, info } = await sharp(`${IN}/${d}-flat.jpg`).extract({ left: box.left, top: box.top, width: box.width, height: box.height }).raw().toBuffer({ resolveWithObject: true });
    const { width: W, height: H, channels: C } = info;
  // Fabric colour = median of the border ring.
  const rs = [], gs = [], bs = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (x < 6 || y < 6 || x >= W - 6 || y >= H - 6) { const i = (y * W + x) * C; rs.push(data[i]); gs.push(data[i + 1]); bs.push(data[i + 2]); }
  }
  const med = (a) => { a.sort((p, q) => p - q); return a[a.length >> 1]; };
  const fr = med(rs), fg = med(gs), fb = med(bs);
  // Distance from fabric colour -> artwork alpha.
  const dist = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) {
    const dr = data[i * C] - fr, dg = data[i * C + 1] - fg, db = data[i * C + 2] - fb;
    dist[i] = Math.min(255, Math.sqrt(dr * dr + dg * dg + db * db) * 1.6);
  }
  const soft = await sharp(dist, { raw: { width: W, height: H, channels: 1 } }).blur(0.8).extractChannel(0).raw().toBuffer();
  const lo = 34, hi = 120;
  const col = Buffer.alloc(W * H * 4), ink = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    let a = (soft[i] - lo) / (hi - lo); a = Math.max(0, Math.min(1, a)); a = a * a * (3 - 2 * a);
    const r = data[i * C], g = data[i * C + 1], b = data[i * C + 2];
    col[i * 4] = r; col[i * 4 + 1] = g; col[i * 4 + 2] = b; col[i * 4 + 3] = Math.round(a * 255);
    // Ink plate: warm (orange) strokes become rust, everything else ink.
    const warm = Math.max(0, Math.min(1, ((r - b) - 40) / 70));
    ink[i * 4] = Math.round(INK[0] + (RUST[0] - INK[0]) * warm);
    ink[i * 4 + 1] = Math.round(INK[1] + (RUST[1] - INK[1]) * warm);
    ink[i * 4 + 2] = Math.round(INK[2] + (RUST[2] - INK[2]) * warm);
    ink[i * 4 + 3] = Math.round(a * 255);
  }
  await sharp(col, { raw: { width: W, height: H, channels: 4 } }).png({ compressionLevel: 9 }).toFile(`${OUT}/${d}-art.png`);
  await sharp(ink, { raw: { width: W, height: H, channels: 4 } }).png({ compressionLevel: 9 }).toFile(`${OUT}/${d}-art-ink.png`);
  console.log('plate', d, 'fabric', fr, fg, fb);
}

if (!process.argv.includes('--plates')) for (const d of designs) for (const v of views) { await webpFor(`${d}-${v}`); await photoFor(`${d}-${v}`); }
for (const d of designs) await plateFor(d);
console.log('done');
