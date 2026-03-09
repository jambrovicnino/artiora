// ═══════════════════════════════════════════════
// ETERNA Artisan — Image Upload Service (client-side)
//
// Naloži sliko v Vercel Blob pred shranjevanjem
// v košarico. V localStorage se shrani samo URL
// (string), ne base64.
//
// Flow:
//   1. Stisne sliko v JPEG (max 4096px, 0.90 kvaliteta)
//      → tipična velikost: 2-4 MB binary
//      → dovolj za print do 50×70 cm pri 200+ DPI
//   2. Pretvori v binary Blob (brez base64 overheada!)
//   3. Pošlje na /api/upload-blob kot raw binary PUT
//      → brez 33% base64 overheada → varno pod 4.5 MB
//   4. Vrne Blob URL
// ═══════════════════════════════════════════════

const API_BASE =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'https://eterna-artisan.vercel.app'
    : '';

/**
 * Stisne sliko v JPEG za upload (visoka resolucija).
 * Max 4096px pri kvaliteti 0.90 → tipično 2-4 MB binary.
 * Ker pošiljamo binary (ne base64 JSON), je 4 MB varno pod Vercel 4.5 MB limitom.
 *
 * @param {string} dataUrl - Base64 data URL
 * @param {number} maxSize - Max px za daljšo stranico (default: 4096)
 * @param {number} quality - JPEG kvaliteta (default: 0.90)
 * @returns {Promise<string>} - JPEG base64 data URL
 */
function compressForUpload(dataUrl, maxSize = 4096, quality = 0.90) {
  return new Promise((resolve, reject) => {
    if (!dataUrl || !dataUrl.startsWith('data:')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let { width, height } = img;

      // Samo zmanjšaj če je večja od maxSize
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height / width) * maxSize);
          width = maxSize;
        } else {
          width = Math.round((width / height) * maxSize);
          height = maxSize;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => reject(new Error('Napaka pri nalaganju slike za upload'));
    img.src = dataUrl;
  });
}

/**
 * Pretvori base64 data URL v binary Blob.
 * Eliminira 33% base64 overhead pri pošiljanju.
 *
 * @param {string} dataUrl - Base64 data URL
 * @returns {Blob} - Binary blob
 */
function dataUrlToBlob(dataUrl) {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const binary = atob(parts[1]);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

/**
 * Naloži visoko resolucijo slike v Vercel Blob.
 * Pošlje kot raw binary (brez base64 overheada) za boljšo kvaliteto.
 *
 * @param {string} dataUrl - Base64 data URL (PNG ali JPEG)
 * @param {string} filename - Ime datoteke
 * @returns {Promise<string>} - Blob URL za prenos
 */
export async function uploadFullResImage(dataUrl, filename = 'image.jpg') {
  // Stisni v JPEG 0.90 pri max 4096px (visoka kvaliteta za print)
  const compressed = await compressForUpload(dataUrl, 4096, 0.90);

  // Pretvori v binary blob (brez 33% base64 overheada)
  const binaryBlob = dataUrlToBlob(compressed);
  console.log(`[ETERNA] Upload binary: ${Math.round(binaryBlob.size / 1024)} KB (${binaryBlob.type})`);

  const safeName = `fullres-${Date.now()}-${filename.replace(/\s+/g, '-')}`;

  // Pošlji kot raw binary PUT (ne JSON!) → /api/upload-blob
  const response = await fetch(
    `${API_BASE}/api/upload-blob?filename=${encodeURIComponent(safeName)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': binaryBlob.type },
      body: binaryBlob,
    }
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    let errMsg;
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson.error;
    } catch {
      errMsg = errText.slice(0, 200);
    }
    throw new Error(errMsg || `Upload ni uspel: HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!data.success || !data.url) {
    throw new Error('Upload je uspel, ampak URL ni bil vrnjen');
  }

  console.log(`[ETERNA] Full-res upload: ${data.url} (${data.size} bytes)`);
  return data.url;
}
