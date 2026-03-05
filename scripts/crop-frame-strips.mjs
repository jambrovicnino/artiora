/**
 * Crop individual frame profile strips from Vidal catalog pages.
 * Each page (1785×2525 @ 3x) contains multiple frame variants.
 * We pick the correct .1170 or .0532 variant for each of our 10 frames.
 *
 * Output: clean strip PNGs in public/frames/strips/
 */
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const CATALOG_DIR = 'C:/Users/Uporabnik/Desktop/ETERNA/frame-catalog-pages';
const OUTPUT_DIR  = 'C:/Users/Uporabnik/Desktop/ETERNA/public/frames/strips';

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

// ──────────────────────────────────────────────────────
// Refined crop regions — focused on texture strips only,
// excluding Vidal logos, cross-sections, and whitespace.
// Pages are 1785×2525.
// ──────────────────────────────────────────────────────
const CROPS = [
  {
    id: 'classic-184',
    page: 'page-24-184-classic-odprodaja.png',
    // 184.1170 = gold ornate – 2nd strip, top row (pure gold variant)
    left: 595, top: 110, width: 350, height: 680,
    note: 'Classic gold ornate (ODPRODAJA)',
  },
  {
    id: 'ozki-gladek-048',
    page: 'page-25-048-ozki-gladek.png',
    // 048 – 2nd row, brown/gold variant (skip blue-grey, take warm brown)
    left: 480, top: 870, width: 350, height: 560,
    note: 'Narrow smooth brown/gold',
  },
  {
    id: 'modern-076',
    page: 'page-36-076-modern.png',
    // 076 – bottom row, 1st strip (gold ornamental)
    left: 100, top: 1300, width: 350, height: 600,
    note: 'Modern gold ornamental',
  },
  {
    id: 'tanka-370',
    page: 'page-37-370-tanka-elegant.png',
    // 370 – top-left, gold elegant (crop below Vidal logo)
    left: 100, top: 130, width: 650, height: 850,
    note: 'Thin elegant gold',
  },
  {
    id: 'siroki-ornament-231',
    page: 'page-04-231-siroki-ornament-a.png',
    // 231 – bottom row, 2nd strip (copper/gold metallic)
    left: 460, top: 1620, width: 320, height: 550,
    note: 'Wide ornament copper/gold',
  },
  {
    id: 'ozki-ornament-1717',
    page: 'page-03-1717-ozki-ornament.png',
    // 1717 – 2nd row, dark grey/black variant
    left: 840, top: 1350, width: 250, height: 420,
    note: 'Narrow ornament grey',
  },
  {
    id: 'sirok-gladek-1335',
    page: 'page-10-1335-sirok-gladek.png',
    // 1335 – 1st row, 2nd strip (black wide smooth)
    left: 500, top: 110, width: 350, height: 560,
    note: 'Wide smooth black',
  },
  {
    id: 'cassetta-3507',
    page: 'page-08-3507-cassetta-a.png',
    // 3507 – 2nd row, black cassetta
    left: 1140, top: 920, width: 340, height: 560,
    note: 'Cassetta black',
  },
  {
    id: 'siena-rustic',
    page: 'page-13-siena-rustic.png',
    // Siena – 2nd row, 1st strip (gold metallic round profile)
    left: 90, top: 1200, width: 380, height: 560,
    note: 'Siena rustic gold',
  },
  {
    id: 'alu-srebrn',
    page: 'page-52-AL-srebrn.png',
    // AL – 1st row, 1st strip (light wood/natural)
    // Actually, let's pick the silver metallic in bottom row
    left: 90, top: 1750, width: 350, height: 400,
    note: 'Aluminum silver',
  },
];

async function main() {
  console.log(`Cropping ${CROPS.length} frame strips...\n`);

  for (const crop of CROPS) {
    const inputPath  = join(CATALOG_DIR, crop.page);
    const outputPath = join(OUTPUT_DIR, `${crop.id}.png`);

    try {
      const meta = await sharp(inputPath).metadata();
      const safeLeft   = Math.min(crop.left, meta.width - 10);
      const safeTop    = Math.min(crop.top, meta.height - 10);
      const safeWidth  = Math.min(crop.width, meta.width - safeLeft);
      const safeHeight = Math.min(crop.height, meta.height - safeTop);

      await sharp(inputPath)
        .extract({ left: safeLeft, top: safeTop, width: safeWidth, height: safeHeight })
        .toFile(outputPath);

      const outMeta = await sharp(outputPath).metadata();
      console.log(`  ✓ ${crop.id}: ${outMeta.width}×${outMeta.height}  (${crop.note})`);
    } catch (err) {
      console.error(`  ✗ ${crop.id}: ${err.message}`);
    }
  }

  console.log(`\nDone! Strips saved to: ${OUTPUT_DIR}`);
}

main();
