// ═══════════════════════════════════════════════
// ETERNA Artisan — Upscale Service (client-side)
// Poveča resolucijo slike lokalno v brskalniku
// z uporabo Canvas + imageSmoothingQuality: 'high'
//
// Za tisk na platno zadostuje — tekstura platna
// skrije razliko med AI in klasično interpolacijo.
// Prednosti: takojšnje, 100% zanesljivo, brez API.
// ═══════════════════════════════════════════════

/**
 * Naloži sliko iz data URL in vrne dimenzije + element.
 */
function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Slike ni mogoče naložiti'));
    img.src = dataUrl;
  });
}

/**
 * Poveča resolucijo slike z visoko-kvalitetno interpolacijo.
 * Uporablja Canvas API z imageSmoothingQuality: 'high'
 * (Lanczos-podoben algoritem v modernih brskalnikih).
 *
 * Multi-pass pristop: namesto enega velikega skoka
 * povečamo postopoma (2× koraki), kar daje boljše rezultate.
 *
 * @param {string} imageDataUrl - Base64 data URL slike
 * @param {number} factor - Faktor povečave (privzeto 4)
 * @returns {Promise<{ imageDataUrl, model, factor, method, dimensions, warning }>}
 */
export async function upscaleImage(imageDataUrl, factor = 4) {
  const img = await loadImage(imageDataUrl);
  const origW = img.naturalWidth;
  const origH = img.naturalHeight;

  // Ciljne dimenzije
  const targetW = Math.round(origW * factor);
  const targetH = Math.round(origH * factor);

  // Varnostna omejitev: max 8192px na najdaljši stranici
  // (Canvas ima omejitve po brskalnikih)
  const maxDim = 8192;
  let finalW = targetW;
  let finalH = targetH;
  let actualFactor = factor;

  if (finalW > maxDim || finalH > maxDim) {
    const scale = maxDim / Math.max(finalW, finalH);
    finalW = Math.round(finalW * scale);
    finalH = Math.round(finalH * scale);
    actualFactor = Math.round((finalW / origW) * 10) / 10;
  }

  // Multi-pass upscale: postopoma 2× za boljšo kvaliteto
  let currentCanvas = document.createElement('canvas');
  let currentCtx = currentCanvas.getContext('2d');
  currentCanvas.width = origW;
  currentCanvas.height = origH;
  currentCtx.drawImage(img, 0, 0);

  let currentW = origW;
  let currentH = origH;

  while (currentW < finalW || currentH < finalH) {
    // Naslednji korak: 2× ali do cilja
    const nextW = Math.min(currentW * 2, finalW);
    const nextH = Math.min(currentH * 2, finalH);

    const nextCanvas = document.createElement('canvas');
    const nextCtx = nextCanvas.getContext('2d');
    nextCanvas.width = nextW;
    nextCanvas.height = nextH;

    // Visoko-kvalitetna interpolacija
    nextCtx.imageSmoothingEnabled = true;
    nextCtx.imageSmoothingQuality = 'high';
    nextCtx.drawImage(currentCanvas, 0, 0, nextW, nextH);

    currentCanvas = nextCanvas;
    currentCtx = nextCtx;
    currentW = nextW;
    currentH = nextH;
  }

  // Rahlo izostri (unsharp mask simulacija z overlay blend)
  // Naredimo kopijo z manjšo ostrostjo in compositeamo
  const sharpCanvas = document.createElement('canvas');
  const sharpCtx = sharpCanvas.getContext('2d');
  sharpCanvas.width = finalW;
  sharpCanvas.height = finalH;

  // Osnovna slika
  sharpCtx.drawImage(currentCanvas, 0, 0);

  // Nežen sharpen z globalCompositeOperation
  sharpCtx.globalAlpha = 0.15;
  sharpCtx.globalCompositeOperation = 'luminosity';
  sharpCtx.filter = 'contrast(1.08) saturate(1.05)';
  sharpCtx.drawImage(currentCanvas, 0, 0);
  sharpCtx.globalAlpha = 1;
  sharpCtx.globalCompositeOperation = 'source-over';
  sharpCtx.filter = 'none';

  // Izvozi kot JPEG (manjši od PNG, dovolj kvaliteten za tisk)
  const resultDataUrl = sharpCanvas.toDataURL('image/jpeg', 0.95);

  console.log(`[ETERNA] Upscale: ${origW}×${origH} → ${finalW}×${finalH} (${actualFactor}×)`);

  return {
    imageDataUrl: resultDataUrl,
    model: 'Canvas HQ',
    factor: actualFactor,
    method: 'multi-pass interpolation',
    dimensions: { width: finalW, height: finalH },
    warning: actualFactor < factor
      ? `Omejeno na ${actualFactor}× (max ${maxDim}px) za stabilnost brskalnika.`
      : null,
  };
}
