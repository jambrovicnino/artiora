// ═══════════════════════════════════════════════
// ETERNA Artisan — Image Compression for Cart
//
// Stisne base64 slike pred shranjevanjem v localStorage.
// localStorage ima limit ~5MB, zato ne moremo shraniti
// 6144×6144 PNG (~50MB base64).
//
// Thumbnail: 400px (za prikaz v košarici)
// Order image: 2000px (za obdelavo naročila — strežnik
//   ponastavi na print dimenzije)
// ═══════════════════════════════════════════════

/**
 * Stisne sliko na podano max dimenzijo in vrne JPEG base64.
 *
 * @param {string} dataUrl - Base64 data URL (PNG ali JPEG)
 * @param {number} maxSize - Max px za daljšo stranico
 * @param {number} quality - JPEG kvaliteta (0-1), privzeto 0.85
 * @returns {Promise<string>} - Stisnjen base64 data URL (JPEG)
 */
export function compressImage(dataUrl, maxSize = 400, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!dataUrl || !dataUrl.startsWith('data:')) {
      resolve(dataUrl); // Ni base64, vrni kot je
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let { width, height } = img;

      // Če je slika manjša od maxSize, ne kompresiramo
      if (width <= maxSize && height <= maxSize) {
        // Še vedno pretvorimo v JPEG za konsistentnost
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', quality));
        return;
      }

      // Izračunaj nove dimenzije (ohrani razmerje stranic)
      if (width > height) {
        height = Math.round((height / width) * maxSize);
        width = maxSize;
      } else {
        width = Math.round((width / height) * maxSize);
        height = maxSize;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Uporabi boljšo interpolacijo
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => reject(new Error('Napaka pri nalaganju slike za kompresijo'));
    img.src = dataUrl;
  });
}

/**
 * Stisne sliko za prikaz v košarici (majhen thumbnail).
 */
export function createCartThumbnail(dataUrl) {
  return compressImage(dataUrl, 400, 0.8);
}

/**
 * Stisne sliko za pošiljanje v naročilu.
 * 2000px je dovolj za strežniško obdelavo —
 * strežnik bo sam resizal na print dimenzije.
 */
export function createOrderImage(dataUrl) {
  return compressImage(dataUrl, 2000, 0.9);
}
