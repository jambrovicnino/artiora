/**
 * Clean frame strip images:
 * 1. Auto-trim white/light borders
 * 2. Add dark padding to prevent white corner artifacts
 */
import sharp from 'sharp';
import { readdirSync } from 'fs';
import { join } from 'path';

const STRIPS_DIR = 'C:/Users/Uporabnik/Desktop/ETERNA/public/frames/strips';

async function cleanStrip(filePath) {
  const name = filePath.split(/[/\\]/).pop();

  // Read original
  const img = sharp(filePath);
  const meta = await img.metadata();

  // Trim whitespace, then flatten onto dark background
  const trimmed = await sharp(filePath)
    .trim({ threshold: 40 })  // Remove near-white borders
    .toBuffer();

  const trimMeta = await sharp(trimmed).metadata();

  // Flatten onto dark background (eliminates any remaining white)
  await sharp(trimmed)
    .flatten({ background: { r: 20, g: 18, b: 15 } })  // Dark warm background
    .toFile(filePath.replace('.png', '_clean.png'));

  // Replace original
  await sharp(filePath.replace('.png', '_clean.png'))
    .toFile(filePath.replace('.png', '_tmp.png'));

  const fs = await import('fs');
  fs.copyFileSync(filePath.replace('.png', '_tmp.png'), filePath);
  fs.unlinkSync(filePath.replace('.png', '_clean.png'));
  fs.unlinkSync(filePath.replace('.png', '_tmp.png'));

  console.log(`  ✓ ${name}: ${meta.width}×${meta.height} → ${trimMeta.width}×${trimMeta.height} (trimmed + dark bg)`);
}

async function main() {
  // Only process our 10 active strip files
  const activeStrips = [
    'classic-184.png',
    'ozki-gladek-048.png',
    'modern-076.png',
    'tanka-370.png',
    'siroki-ornament-231.png',
    'ozki-ornament-1717.png',
    'sirok-gladek-1335.png',
    'cassetta-3507.png',
    'siena-rustic.png',
    'alu-srebrn.png',
  ];

  console.log('Cleaning strip images...\n');

  for (const name of activeStrips) {
    const path = join(STRIPS_DIR, name);
    try {
      await cleanStrip(path);
    } catch (err) {
      console.error(`  ✗ ${name}: ${err.message}`);
    }
  }

  console.log('\nDone!');
}

main();
