// ═══════════════════════════════════════════════
// ETERNA Artisan — Image Upload (Vercel Serverless)
// Shrani sliko v Vercel Blob → vrne URL za prenos
// ═══════════════════════════════════════════════

import { put } from '@vercel/blob';

export const config = {
  maxDuration: 60, // Dovolj časa za upload v Blob (privzeto je le 10s!)
  api: {
    bodyParser: {
      sizeLimit: '6mb', // 2500px JPEG ~1-2MB binary → ~2-3MB base64 → varno pod 4.5MB Vercel limitom
    },
  },
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Content-Type'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { imageBase64, orderId, filename } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'Missing imageBase64' });
    }

    // Preveri ali je Vercel Blob konfiguriran
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.warn('[ETERNA] Vercel Blob ni konfiguriran. Slika ni shranjena.');
      return res.status(200).json({
        success: true,
        url: null,
        message: 'Blob storage ni konfiguriran — slika ni shranjena',
      });
    }

    // Odstrani data URL prefix, pridobi MIME tip
    const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ success: false, error: 'Neveljaven base64 format' });
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const ext = mimeType.split('/')[1] || 'png';
    const blobFilename = filename || `${orderId || 'img'}-${Date.now()}.${ext}`;

    // Naloži v Vercel Blob (fullres/ za polno resolucijo, orders/ za ostalo)
    const prefix = blobFilename.startsWith('fullres-') ? 'fullres' : 'orders';
    const blob = await put(`${prefix}/${blobFilename}`, buffer, {
      access: 'public',
      contentType: mimeType,
    });

    console.log(`[ETERNA] Slika naložena: ${blob.url} (${buffer.length} bytes)`);

    return res.status(200).json({
      success: true,
      url: blob.url,
      size: buffer.length,
    });
  } catch (error) {
    console.error('[ETERNA] Upload error:', error);
    return res.status(500).json({
      success: false,
      error: `Napaka pri nalaganju: ${error.message}`,
    });
  }
}
