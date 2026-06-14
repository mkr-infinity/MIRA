#!/usr/bin/env node
/**
 * Writes a base64-encoded 1024x1024 PNG icon to src-tauri/icons/icon.png
 * (a glowing cyan orb on dark background) without external dependencies.
 * After this, `npx tauri icon icon.png` can generate all platform formats.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.resolve(__dirname, "../src-tauri/icons");
fs.mkdirSync(iconsDir, { recursive: true });

// Build a 1024x1024 PNG with a radial cyan glow on dark background.
// We use a hand-rolled PNG encoder (no native deps) so it works in any CI.
const SIZE = 1024;
const bg = [10, 14, 26, 255]; // #0A0E1A
const pixels = Buffer.alloc(SIZE * SIZE * 4);

function setPx(x, y, r, g, b, a) {
  const i = ((y | 0) * SIZE + (x | 0)) * 4;
  if (i < 0 || i >= pixels.length) return;
  pixels[i] = r;
  pixels[i + 1] = g;
  pixels[i + 2] = b;
  pixels[i + 3] = a;
}

const cx = SIZE / 2,
  cy = SIZE / 2;
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const dx = x - cx,
      dy = y - cy;
    const d = Math.sqrt(dx * dx + dy * dy);
    const maxR = SIZE * 0.5;
    let r = bg[0],
      g = bg[1],
      b = bg[2],
      a = 255;
    // outer radial glow
    if (d < maxR) {
      const t = 1 - d / maxR;
      const glow = Math.pow(t, 2) * 0.9;
      r = Math.round(bg[0] + (0 - bg[0]) * glow);
      g = Math.round(bg[1] + (212 - bg[1]) * glow);
      b = Math.round(bg[2] + (255 - bg[2]) * glow);
    }
    // arc reactor ring
    const ringR = SIZE * 0.32;
    if (Math.abs(d - ringR) < 4) {
      r = 0;
      g = 212;
      b = 255;
      a = 230;
    }
    const ringR2 = SIZE * 0.22;
    if (Math.abs(d - ringR2) < 3) {
      r = 0;
      g = 212;
      b = 255;
      a = 200;
    }
    // core
    const coreR = SIZE * 0.16;
    if (d < coreR) {
      const t = 1 - d / coreR;
      r = Math.round(0 + 255 * t * 0.4);
      g = Math.round(212 + 43 * t * 0.4);
      b = 255;
    }
    // center bright spot
    if (d < SIZE * 0.05) {
      r = 220;
      g = 245;
      b = 255;
    }
    setPx(x, y, r, g, b, a);
  }
}

// PNG encode
function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++)
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // RGBA
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

// add filter byte (0) at start of every scanline
const raw = Buffer.alloc(SIZE * (1 + SIZE * 4));
for (let y = 0; y < SIZE; y++) {
  raw[y * (1 + SIZE * 4)] = 0;
  pixels.copy(raw, y * (1 + SIZE * 4) + 1, y * SIZE * 4, (y + 1) * SIZE * 4);
}
const compressed = zlib.deflateSync(raw, { level: 9 });

const png = Buffer.concat([
  sig,
  chunk("IHDR", ihdr),
  chunk("IDAT", compressed),
  chunk("IEND", Buffer.alloc(0)),
]);

const outPath = path.join(iconsDir, "icon.png");
fs.writeFileSync(outPath, png);
console.log("Wrote", outPath, "(" + (png.length / 1024).toFixed(1) + " KB)");

// Also write a smaller variant for the icon source
fs.writeFileSync(path.join(iconsDir, "icon@2x.png"), png);
