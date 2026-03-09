// ═══════════════════════════════════════════════
// ETERNA Artisan — Image Quality Validation
// Zagotovi, da ima slika dovolj resolucije za tisk
// ═══════════════════════════════════════════════

import { canvasSizes } from '../data/frameOptions';

/**
 * Minimalni DPI za tisk na platno.
 * 300 DPI = idealno, 200 DPI = sprejemljivo, pod 150 = opozorilo.
 */
const DPI_THRESHOLDS = {
  excellent: 250,  // 250+ = odlična kvaliteta
  good: 180,       // 180-250 = dobra kvaliteta
  acceptable: 120, // 120-180 = sprejemljivo (rahlo mehko)
  // Pod 120 = slaba kvaliteta, odsvetovano
};

/**
 * Izračunaj efektivni DPI slike za dano velikost platna.
 *
 * @param {number} imageWidth  - Širina slike v pikslih
 * @param {number} imageHeight - Višina slike v pikslih
 * @param {string} sizeId      - ID velikosti platna (npr. '30x40')
 * @returns {{ dpi: number, rating: string, label: string, color: string, requiredPx: object }}
 */
export function calculateImageQuality(imageWidth, imageHeight, sizeId) {
  const sizeData = canvasSizes.find((s) => s.id === sizeId);
  if (!sizeData) {
    return { dpi: 0, rating: 'unknown', label: 'Neznana velikost', color: '#888' };
  }

  const { widthPx, heightPx } = sizeData.printSpecs;

  // Efektivni DPI: kako se slika razširi na platno
  // Izračunamo DPI za obe osi in vzamemo nižjo vrednost
  const [cmW, cmH] = sizeId.split('x').map(Number);
  const inchW = cmW / 2.54;
  const inchH = cmH / 2.54;

  // Slika se bo crop-to-fill, torej vzamemo pokritost krajše stranice
  const dpiW = imageWidth / inchW;
  const dpiH = imageHeight / inchH;

  // Uporabimo nižji DPI (najslabša kvaliteta osi)
  const effectiveDpi = Math.round(Math.min(dpiW, dpiH));

  // Določi rating
  let rating, label, color;
  if (effectiveDpi >= DPI_THRESHOLDS.excellent) {
    rating = 'excellent';
    label = 'Odlična kvaliteta';
    color = '#10b981';
  } else if (effectiveDpi >= DPI_THRESHOLDS.good) {
    rating = 'good';
    label = 'Dobra kvaliteta';
    color = '#3b82f6';
  } else if (effectiveDpi >= DPI_THRESHOLDS.acceptable) {
    rating = 'acceptable';
    label = 'Sprejemljiva kvaliteta';
    color = '#f59e0b';
  } else {
    rating = 'poor';
    label = 'Nizka kvaliteta';
    color = '#ef4444';
  }

  return {
    dpi: effectiveDpi,
    rating,
    label,
    color,
    requiredPx: { width: widthPx, height: heightPx },
    imagePx: { width: imageWidth, height: imageHeight },
    coveragePercent: Math.round(Math.min(
      (imageWidth / widthPx) * 100,
      (imageHeight / heightPx) * 100
    )),
  };
}

/**
 * Pridobi dimenzije slike iz base64 data URL-ja.
 *
 * @param {string} dataUrl - Base64 data URL slike
 * @returns {Promise<{ width: number, height: number }>}
 */
export function getImageDimensions(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Slike ni mogoče naložiti'));
    img.src = dataUrl;
  });
}

/**
 * Preveri kvaliteto slike za vse razpoložljive velikosti.
 * Vrne tabelo kvalitet za vsako velikost.
 *
 * @param {string} dataUrl - Base64 data URL slike
 * @returns {Promise<Array<{ sizeId, sizeLabel, quality }>>}
 */
export async function checkQualityForAllSizes(dataUrl) {
  const dims = await getImageDimensions(dataUrl);
  return canvasSizes.map((size) => ({
    sizeId: size.id,
    sizeLabel: size.label,
    quality: calculateImageQuality(dims.width, dims.height, size.id),
  }));
}

/**
 * Vrne opis opozorila za podano kvaliteto.
 */
export function getQualityWarning(quality) {
  if (quality.rating === 'poor') {
    return `Vaša slika (${quality.imagePx.width}×${quality.imagePx.height}px) ima prenizko resolucijo za to velikost. ` +
           `Potrebno: ${quality.requiredPx.width}×${quality.requiredPx.height}px (300 DPI). ` +
           `Efektivni DPI: ${quality.dpi}. Tisk bo vidno pikseliziran.`;
  }
  if (quality.rating === 'acceptable') {
    return `Resolucija je mejna (${quality.dpi} DPI). Za najboljšo kvaliteto priporočamo sliko ` +
           `z resolucijo vsaj ${quality.requiredPx.width}×${quality.requiredPx.height}px.`;
  }
  return null;
}
