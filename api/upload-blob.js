// ═══════════════════════════════════════════════
// ETERNA Artisan — Binary Image Upload (Vercel Serverless)
//
// Sprejme raw binary sliko (ne base64 JSON) → shrani v Vercel Blob.
// Brez base64 overheada: 3 MB JPEG → 3 MB request body
// (namesto 3 MB → 4 MB base64 → 4.2 MB JSON).
//
// Vercel Hobby body limit: 4.5 MB.
// 4096px JPEG pri 0.90 kvaliteti: tipično 2-4 MB → varno.
// ═══════════════════════════════════════════════

import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false, // Raw binary — brez JSON parsiranja
  },
  maxDuration: 60,
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PUT,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Content-Type'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const filename = req.query.filename || `img-${Date.now()}.jpg`;
    const contentType = req.headers['content-type'] || 'image/jpeg';

    // Preberi raw binary body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    if (buffer.length === 0) {
      return res.status(400).json({ success: false, error: 'Empty body' });
    }

    console.log(`[ETERNA] Binary upload: ${filename} (${buffer.length} bytes, ${contentType})`);

    // Preveri ali je Vercel Blob konfiguriran
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.warn('[ETERNA] Vercel Blob ni konfiguriran.');
      return res.status(200).json({
        success: true,
        url: null,
        message: 'Blob storage ni konfiguriran',
      });
    }

    // Izberi mapo glede na ime datoteke
    const prefix = filename.startsWith('fullres-') ? 'fullres' : 'orders';

    const blob = await put(`${prefix}/${filename}`, buffer, {
      access: 'public',
      contentType,
    });

    console.log(`[ETERNA] Blob upload: ${blob.url} (${buffer.length} bytes)`);

    return res.status(200).json({
      success: true,
      url: blob.url,
      size: buffer.length,
    });
  } catch (error) {
    console.error('[ETERNA] Binary upload error:', error);
    return res.status(500).json({
      success: false,
      error: `Napaka pri nalaganju: ${error.message}`,
    });
  }
}
