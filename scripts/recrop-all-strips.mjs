/**
 * ETERNA — Re-crop all frame strips from Vidal catalog pages
 * Extracts warm/brown variants for a cohesive look
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const CATALOG = 'frame-catalog-pages';
const OUTPUT = 'public/frames/strips';

// ─── Helper: find vertical bounds of a strip ───
async function findVertBounds(pagePath, cx, approxTop, approxBottom) {
  const { data, info } = await sharp(pagePath).raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;

  function pixel(x, y) {
    const i = (y * info.width + x) * ch;
    return [data[i], data[i+1], data[i+2]];
  }

  // Scan up from approxTop to find where strip starts (first non-white row)
  let top = approxTop;
  while (top > 0) {
    const [r,g,b] = pixel(cx, top);
    if (r > 242 && g > 242 && b > 242) break;
    top--;
  }
  top += 3;

  // Scan down from approxBottom to find where strip's texture ends
  // Stop when we hit light/beige area (profile cutaway) for >20px
  let bottom = approxBottom;
  let lightCount = 0;
  while (bottom < info.height - 10) {
    const [r,g,b] = pixel(cx, bottom);
    const brightness = (r + g + b) / 3;
    const isLight = brightness > 180 || (r > 210 && g > 190 && b > 150);
    if (isLight) {
      lightCount++;
      if (lightCount > 25) { bottom -= 25; break; }
    } else {
      lightCount = 0;
    }
    bottom++;
  }

  return { top, bottom };
}

// ─── Helper: crop, clean, and save ───
async function cropStrip(pagePath, cropRegion, outputName, label) {
  const { left, top, width, height } = cropRegion;

  // Step 1: Initial crop
  const cropped = await sharp(pagePath)
    .extract({ left, top, width, height })
    .toBuffer();

  // Step 2: Analyze for white background
  const { data, info } = await sharp(cropped).raw().toBuffer({ resolveWithObject: true });
  let whiteCount = 0;
  const total = info.width * info.height;
  for (let i = 0; i < total; i++) {
    const pi = i * info.channels;
    if (data[pi] > 235 && data[pi+1] > 235 && data[pi+2] > 235) whiteCount++;
  }
  const whitePct = (whiteCount / total * 100).toFixed(1);

  // Step 3: Get average color
  let sumR = 0, sumG = 0, sumB = 0, count = 0;
  for (let i = 0; i < total; i++) {
    const pi = i * info.channels;
    if (!(data[pi] > 235 && data[pi+1] > 235 && data[pi+2] > 235)) {
      sumR += data[pi]; sumG += data[pi+1]; sumB += data[pi+2];
      count++;
    }
  }
  const avgR = Math.round(sumR/count), avgG = Math.round(sumG/count), avgB = Math.round(sumB/count);

  // Step 4: If too much white, trim it
  let finalBuffer;
  if (parseFloat(whitePct) > 5) {
    // Trim by finding content bounds
    finalBuffer = await sharp(cropped)
      .trim({ threshold: 30, background: '#ffffff' })
      .flatten({ background: { r: 15, g: 13, b: 11 } })
      .toBuffer();
  } else {
    finalBuffer = cropped;
  }

  // Step 5: Save
  const outputPath = path.join(OUTPUT, outputName);
  await sharp(finalBuffer).png().toFile(outputPath);

  const finalMeta = await sharp(outputPath).metadata();
  const finalStat = fs.statSync(outputPath);

  console.log(`✅ ${label}`);
  console.log(`   ${finalMeta.width}×${finalMeta.height}, ${(finalStat.size/1024).toFixed(1)}KB`);
  console.log(`   avg color: rgb(${avgR},${avgG},${avgB}), white: ${whitePct}%`);
  console.log('');

  return { width: finalMeta.width, height: finalMeta.height, avgR, avgG, avgB };
}

// ═══════════════════════════════════════════════
// CROP DEFINITIONS
// ═══════════════════════════════════════════════

async function main() {
  console.log('🎨 ETERNA Strip Re-crop\n');

  // ─── 1. 3507 — Dark brown walnut (page-09, Row 1 Col 2) ───
  // Horizontal: x=562-846 (width 284)
  // Need to find vertical bounds
  const page09 = path.join(CATALOG, 'page-09-3507-cassetta-b.png');
  const v3507 = await findVertBounds(page09, 700, 200, 600);
  await cropStrip(page09, {
    left: 556, top: v3507.top, width: 290, height: v3507.bottom - v3507.top
  }, 'cassetta-3507.png', '3507 — Dark brown walnut');

  // ─── 2. 1717 — Dark maroon/brown (page-03, Row 2 Col 5) ───
  // Row 2 Col 5: left=1224, width=146
  const page03 = path.join(CATALOG, 'page-03-1717-ozki-ornament.png');
  const v1717 = await findVertBounds(page03, 1297, 900, 1100);
  await cropStrip(page03, {
    left: 1220, top: v1717.top, width: 155, height: v1717.bottom - v1717.top
  }, 'ozki-ornament-1717.png', '1717 — Dark maroon/brown');

  // ─── 3. 1335 — Natural/beige wood (page-10, Row 1 Col 4) ───
  // Row 1 Col 4: left=1343, width=285
  const page10 = path.join(CATALOG, 'page-10-1335-sirok-gladek.png');
  const v1335 = await findVertBounds(page10, 1486, 150, 500);
  await cropStrip(page10, {
    left: 1338, top: v1335.top, width: 295, height: v1335.bottom - v1335.top
  }, 'sirok-gladek-1335.png', '1335 — Natural/beige wood');

  // ─── 4. 048 — Warm brown (page-25, Row 2 Col 2) ───
  // Row 2 Col 2: left=481, width=214
  const page25 = path.join(CATALOG, 'page-25-048-ozki-gladek.png');
  const v048 = await findVertBounds(page25, 588, 900, 1200);
  await cropStrip(page25, {
    left: 476, top: v048.top, width: 224, height: v048.bottom - v048.top
  }, 'ozki-gladek-048.png', '048 — Warm brown');

  // ─── 5. AL — Better quality silver (page-52, Row 3 Col 1) ───
  // Row 3 Col 1: left=170, width=100 — keep silver for variety
  const page52 = path.join(CATALOG, 'page-52-AL-srebrn.png');
  const vAL = await findVertBounds(page52, 220, 1700, 1950);
  await cropStrip(page52, {
    left: 165, top: vAL.top, width: 112, height: vAL.bottom - vAL.top
  }, 'alu-srebrn.png', 'AL — Silver (better quality)');

  console.log('═══════════════════════════════════════');
  console.log('Done! 5 strips re-cropped.');
}

main().catch(err => console.error('Error:', err));
