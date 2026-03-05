/**
 * Extract specific pages from Vidal Katalog Letvic 2026 PDF
 * as high-resolution PNG images for frame profile reference.
 */
import { pdfToPng } from 'pdf-to-png-converter';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const PDF_PATH = 'C:/Users/Uporabnik/Desktop/Eterna photos/vidal cenik.pdf';
const OUTPUT_DIR = 'C:/Users/Uporabnik/Desktop/ETERNA/frame-catalog-pages';

// Pages containing our 10 frame profiles
const PAGES_TO_EXTRACT = [
  { page: 3,  label: '1717-ozki-ornament' },
  { page: 4,  label: '231-siroki-ornament-a' },
  { page: 5,  label: '231-siroki-ornament-b' },
  { page: 8,  label: '3507-cassetta-a' },
  { page: 9,  label: '3507-cassetta-b' },
  { page: 10, label: '1335-sirok-gladek' },
  { page: 13, label: 'siena-rustic' },
  { page: 24, label: '184-classic-odprodaja' },
  { page: 25, label: '048-ozki-gladek' },
  { page: 36, label: '076-modern' },
  { page: 37, label: '370-tanka-elegant' },
  { page: 52, label: 'AL-srebrn' },
];

async function main() {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`Extracting ${PAGES_TO_EXTRACT.length} pages from Vidal catalog...`);

  for (const { page, label } of PAGES_TO_EXTRACT) {
    console.log(`  Page ${page}: ${label}...`);
    try {
      const pngPages = await pdfToPng(PDF_PATH, {
        disableFontFace: false,
        useSystemFonts: false,
        viewportScale: 3.0,  // High resolution
        pagesToProcess: [page],
        strictPagesToProcess: false,
      });

      if (pngPages.length > 0) {
        const outputPath = join(OUTPUT_DIR, `page-${String(page).padStart(2, '0')}-${label}.png`);
        writeFileSync(outputPath, pngPages[0].content);
        console.log(`    ✓ Saved: ${outputPath}`);
      }
    } catch (err) {
      console.error(`    ✗ Error on page ${page}:`, err.message);
    }
  }

  console.log('\nDone! All pages extracted to:', OUTPUT_DIR);
}

main();
