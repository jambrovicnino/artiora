/**
 * Extract 16 new frame strips from Vidal catalog pages
 * Each strip = face texture of the frame profile (vertical rectangle)
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const CATALOG = 'frame-catalog-pages/';
const OUT = 'public/frames/strips/';

// Strip definitions: approximate crop regions based on visual inspection
const strips = [
  // ═══ 3000 series (85×45mm) - WIDE ornate frames ═══
  // Page 26: 2 rows × 2 cols
  { name: '3000-0050', page: 'page-26-3000-a.png', left: 100, top: 175, width: 580, height: 530 },
  { name: '3000-0070', page: 'page-26-3000-a.png', left: 760, top: 175, width: 560, height: 530 },
  { name: '3000-0040', page: 'page-26-3000-a.png', left: 100, top: 1125, width: 580, height: 530 },
  { name: '3000-014',  page: 'page-26-3000-a.png', left: 760, top: 1125, width: 560, height: 530 },
  // Page 27: row1 (3000.1170, 3000.04), row2 (3000.nero, 94.111)
  { name: '3000-1170', page: 'page-27-3000-b.png', left: 100, top: 175, width: 580, height: 530 },
  { name: '3000-nero', page: 'page-27-3000-b.png', left: 100, top: 1125, width: 580, height: 530 },

  // ═══ 184.1170 (46×26mm) — Row 2, Col 1 on page 24 ═══
  { name: '184-1170', page: 'page-24-184-classic-odprodaja.png', left: 140, top: 1330, width: 430, height: 580 },

  // ═══ ABA.111 modra (46×36mm) — Row 1, Col 3 on page 23 ═══
  { name: 'ABA-111-modra', page: 'page-23-ABA.png', left: 990, top: 130, width: 380, height: 560 },

  // ═══ K series — page 29 ═══
  // Row 1: 3504/21, 3504/23, K112.07.0, K112.07.2
  { name: 'K112-07-2', page: 'page-29-K-profiles.png', left: 1310, top: 130, width: 170, height: 520 },
  // Row 2: K110/07/0, K110/07/2, K115.072
  { name: 'K110-07-2', page: 'page-29-K-profiles.png', left: 540, top: 1100, width: 340, height: 520 },
  { name: 'K115-072',  page: 'page-29-K-profiles.png', left: 1020, top: 1100, width: 440, height: 520 },

  // ═══ 127/AF (45×32mm) — page 35, Row 2, Col 2 ═══
  { name: '127-AF', page: 'page-35-127.png', left: 860, top: 1090, width: 460, height: 560 },

  // ═══ 175/A, 175/B (35×30mm) — page 36, Row 2, Col 3 & 4 ═══
  { name: '175-A', page: 'page-36-076-modern.png', left: 1020, top: 1150, width: 360, height: 560 },
  { name: '175-B', page: 'page-36-076-modern.png', left: 1400, top: 1150, width: 360, height: 560 },

  // ═══ 210.006 (85×34mm) — page 40, Row 2, Col 1 ═══
  { name: '210-006', page: 'page-40-210.png', left: 100, top: 1090, width: 630, height: 560 },

  // ═══ 171/ON (40×37mm) — page 42, Row 1, Col 3 ═══
  { name: '171-ON', page: 'page-42-171.png', left: 960, top: 130, width: 460, height: 560 },

  // ═══ 290/A (75×40mm) — page 45, Row 1, Col 2 ═══
  { name: '290-A', page: 'page-45-290.png', left: 760, top: 130, width: 520, height: 560 },
];

/**
 * Auto-trim: remove white/light borders from all sides
 * Then remove the bottom "profile cutout" area (light wood pine color)
 */
async function trimStrip(buf, name) {
  const img = sharp(buf);
  const { width, height, channels } = await img.metadata();
  const raw = await img.raw().toBuffer();

  const px = (x, y) => {
    const i = (y * width + x) * channels;
    return { r: raw[i], g: raw[i+1], b: raw[i+2] };
  };

  const isBright = (x, y) => {
    const { r, g, b } = px(x, y);
    return (r + g + b) / 3 > 210;
  };

  // Find content bounds (non-white)
  let top = 0, bottom = height - 1, left = 0, right = width - 1;

  // Top
  for (let y = 0; y < height; y++) {
    let darkCount = 0;
    for (let x = 0; x < width; x += 3) { if (!isBright(x, y)) darkCount++; }
    if (darkCount > width / 3 / 5) { top = y; break; }
  }

  // Bottom
  for (let y = height - 1; y > top; y--) {
    let darkCount = 0;
    for (let x = 0; x < width; x += 3) { if (!isBright(x, y)) darkCount++; }
    if (darkCount > width / 3 / 5) { bottom = y; break; }
  }

  // Left
  for (let x = 0; x < width; x++) {
    let darkCount = 0;
    for (let y = top; y < bottom; y += 3) { if (!isBright(x, y)) darkCount++; }
    if (darkCount > (bottom - top) / 3 / 5) { left = x; break; }
  }

  // Right
  for (let x = width - 1; x > left; x--) {
    let darkCount = 0;
    for (let y = top; y < bottom; y += 3) { if (!isBright(x, y)) darkCount++; }
    if (darkCount > (bottom - top) / 3 / 5) { right = x; break; }
  }

  // Now detect and remove the profile cutout from the bottom
  // The cutout area has uniform light wood color (brightness > 180, yellowish/warm)
  // Scan from bottom up to find where the actual frame face starts
  let faceBottom = bottom;
  for (let y = bottom; y > top + 50; y--) {
    let lightWoodCount = 0;
    let total = 0;
    for (let x = left; x <= right; x += 2) {
      total++;
      const { r, g, b } = px(x, y);
      const bright = (r + g + b) / 3;
      // Light wood/pine is warm and bright (>170 brightness, warm tone)
      if (bright > 170 && r > 150 && g > 130) lightWoodCount++;
    }
    // If more than 70% of the row is light wood, this is profile cutout area
    if (lightWoodCount / total < 0.5) {
      faceBottom = y;
      break;
    }
  }

  // Add small padding
  const pad = 2;
  const cropLeft = Math.max(0, left - pad);
  const cropTop = Math.max(0, top - pad);
  const cropRight = Math.min(width - 1, right + pad);
  const cropBottom = Math.min(height - 1, faceBottom + pad);
  const cropWidth = cropRight - cropLeft + 1;
  const cropHeight = cropBottom - cropTop + 1;

  if (cropWidth < 20 || cropHeight < 50) {
    console.log(`  ⚠ ${name}: crop too small ${cropWidth}×${cropHeight}, using full image`);
    return buf;
  }

  console.log(`  ${name}: face ${cropWidth}×${cropHeight} (trimmed from ${width}×${height})`);
  console.log(`    bounds: L=${cropLeft} T=${cropTop} R=${cropRight} B=${cropBottom} (faceB=${faceBottom})`);

  return await sharp(buf)
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .png()
    .toBuffer();
}

async function extractStrip(strip) {
  const pagePath = CATALOG + strip.page;
  const img = sharp(pagePath);
  const meta = await img.metadata();

  // Clamp crop region to page bounds
  const left = Math.max(0, strip.left);
  const top = Math.max(0, strip.top);
  const width = Math.min(strip.width, meta.width - left);
  const height = Math.min(strip.height, meta.height - top);

  // Extract the approximate region
  let buf = await img.extract({ left, top, width, height }).png().toBuffer();

  // Auto-trim and remove profile cutout
  buf = await trimStrip(buf, strip.name);

  // Analyze the result
  const result = sharp(buf);
  const rmeta = await result.metadata();
  const raw = await result.clone().resize(1, 1, { fit: 'cover' }).raw().toBuffer();
  const avgColor = `rgb(${raw[0]},${raw[1]},${raw[2]})`;

  const outPath = OUT + strip.name + '.png';
  writeFileSync(outPath, buf);

  console.log(`  → ${outPath}: ${rmeta.width}×${rmeta.height}, ${(buf.length/1024).toFixed(0)}KB, avg=${avgColor}`);
  return { name: strip.name, width: rmeta.width, height: rmeta.height, size: buf.length, avgColor };
}

// Main
console.log('Extracting 16 new frame strips...\n');
const results = [];
for (const strip of strips) {
  console.log(`\n${strip.name} from ${strip.page}:`);
  try {
    const r = await extractStrip(strip);
    results.push(r);
  } catch (e) {
    console.log(`  ✗ ERROR: ${e.message}`);
  }
}

console.log('\n\n═══ Summary ═══');
for (const r of results) {
  console.log(`${r.name}: ${r.width}×${r.height}, ${(r.size/1024).toFixed(0)}KB, ${r.avgColor}`);
}
