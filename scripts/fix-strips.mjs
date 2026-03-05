/**
 * Fix strip images — re-crop from catalog pages with precise coordinates.
 * Two-pass approach:
 * 1. Generous initial crop from catalog page
 * 2. Pixel analysis to find actual dark content bounds
 * 3. Tight crop to content + flatten on dark background
 *
 * Reference: modern-076.png has 0.2% white — that's our target quality.
 */
import sharp from 'sharp';
import { join } from 'path';
import { copyFileSync } from 'fs';

const STRIPS_DIR = 'C:/Users/Uporabnik/Desktop/ETERNA/public/frames/strips';
const CATALOG_DIR = 'C:/Users/Uporabnik/Desktop/ETERNA/frame-catalog-pages';

// Pages are 1785×2525 (3x viewport scale)
const RECROP = [
  {
    id: 'ozki-ornament-1717',
    page: 'page-03-1717-ozki-ornament.png',
    // GREEN strip is at x:1490-1610 (col 6), NOT col 5!
    // Probed at y=1000: x:1490 R=58,G=71,B=53 = dark green
    // Crop just the colored face, not beige cross-section
    left: 1480, top: 895, width: 150, height: 210,
    note: '1717 dark green face (col 6)',
  },
  {
    id: 'cassetta-3507',
    page: 'page-08-3507-cassetta-a.png',
    // Black cassetta — row 2, col 3 (4 cols, col3 starts ~890)
    // Face only, not the beige bottom
    left: 890, top: 1240, width: 250, height: 320,
    note: '3507 black cassetta face',
  },
  {
    id: 'alu-srebrn',
    page: 'page-52-AL-srebrn.png',
    // Silver/grey AL — row 3, col 1 (L-shape, face is left portion)
    left: 65, top: 1780, width: 160, height: 320,
    note: 'AL silver face',
  },
  {
    id: 'classic-184',
    page: 'page-24-184-classic-odprodaja.png',
    // Gold ornate — row 1, col 2
    // Probed: WHITE gap at x:580-720, gold starts at x:720
    // y scan at x=750: white until y:190, grey y:200-210, gold from y:220+
    // Tight crop on gold texture only
    left: 720, top: 225, width: 260, height: 360,
    note: '184 gold ornate face (precise)',
  },
  {
    id: 'tanka-370',
    page: 'page-37-370-tanka-elegant.png',
    // Bright gold — row 1, left strip
    // Must skip Vidal logo at very top (~60px), and the beige cross-section at bottom
    // Gold face texture runs from roughly y:240 to y:550
    left: 75, top: 250, width: 530, height: 320,
    note: '370 bright gold face (below Vidal logo)',
  },
];

/**
 * Find tight bounding box of non-white content in an image buffer.
 * Returns { left, top, width, height } of the darkest rectangular region.
 */
async function findContentBounds(buffer, whiteThreshold = 230) {
  const { data, info } = await sharp(buffer)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, ch = info.channels;

  let minX = w, maxX = 0, minY = h, maxY = 0;
  let found = false;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * ch;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      // Not white if any channel is below threshold
      if (r < whiteThreshold && g < whiteThreshold && b < whiteThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }

  if (!found) return null;

  // Add 2px safety padding
  minX = Math.max(0, minX - 2);
  minY = Math.max(0, minY - 2);
  maxX = Math.min(w - 1, maxX + 2);
  maxY = Math.min(h - 1, maxY + 2);

  return {
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

async function fixStrip(crop) {
  const inputPath = join(CATALOG_DIR, crop.page);
  const outputPath = join(STRIPS_DIR, `${crop.id}.png`);

  // Backup original
  try {
    copyFileSync(outputPath, outputPath.replace('.png', '_backup.png'));
  } catch (_) {}

  try {
    const pageMeta = await sharp(inputPath).metadata();

    // Step 1: Initial generous crop from catalog page
    const left = Math.min(crop.left, pageMeta.width - 20);
    const top = Math.min(crop.top, pageMeta.height - 20);
    const width = Math.min(crop.width, pageMeta.width - left);
    const height = Math.min(crop.height, pageMeta.height - top);

    const initialCrop = await sharp(inputPath)
      .extract({ left, top, width, height })
      .toBuffer();

    const initialMeta = await sharp(initialCrop).metadata();
    console.log(`  [1] Initial crop: ${initialMeta.width}×${initialMeta.height}`);

    // Step 2: Find actual content bounds (non-white region)
    const bounds = await findContentBounds(initialCrop, 225);

    let contentCrop;
    if (bounds && bounds.width > 20 && bounds.height > 20) {
      contentCrop = await sharp(initialCrop)
        .extract(bounds)
        .toBuffer();
      const contentMeta = await sharp(contentCrop).metadata();
      console.log(`  [2] Content bounds: x:${bounds.left} y:${bounds.top} ${bounds.width}×${bounds.height}`);
    } else {
      // Fallback: use initial crop with standard trim
      contentCrop = await sharp(initialCrop)
        .trim({ threshold: 60 })
        .toBuffer();
      console.log(`  [2] Using trim fallback`);
    }

    // Step 3: Additional trim pass for safety
    const trimmed = await sharp(contentCrop)
      .trim({ threshold: 45 })
      .toBuffer();

    const trimMeta = await sharp(trimmed).metadata();
    console.log(`  [3] After trim: ${trimMeta.width}×${trimMeta.height}`);

    // Step 4: Flatten onto dark background (matches 076's dark bg)
    await sharp(trimmed)
      .flatten({ background: { r: 20, g: 18, b: 15 } })
      .toFile(outputPath);

    const outMeta = await sharp(outputPath).metadata();

    // Step 5: Verify white pixel percentage
    const { data: outData, info: outInfo } = await sharp(outputPath)
      .raw()
      .toBuffer({ resolveWithObject: true });
    let whiteCount = 0;
    for (let i = 0; i < outData.length; i += outInfo.channels) {
      if (outData[i] > 200 && outData[i + 1] > 200 && outData[i + 2] > 200) whiteCount++;
    }
    const pct = ((whiteCount / (outInfo.width * outInfo.height)) * 100).toFixed(1);

    const status = parseFloat(pct) < 5 ? '✓' : '⚠';
    console.log(`  ${status} ${crop.id}: ${outMeta.width}×${outMeta.height} — ${pct}% white (${crop.note})\n`);

  } catch (err) {
    console.error(`  ✗ ${crop.id}: ${err.message}\n`);
  }
}

async function main() {
  console.log('Fixing problematic strip images...\n');
  console.log('Target: <5% white pixels (076 reference has 0.2%)\n');

  for (const crop of RECROP) {
    await fixStrip(crop);
  }

  console.log('Done! Run dev server to verify visually.');
}

main();
