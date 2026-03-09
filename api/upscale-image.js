// ═══════════════════════════════════════════════
// ETERNA Artisan — AI Image Upscaling (Vercel Serverless)
//
// Poveča resolucijo slike 4× z AI super-resolution.
// 1024×1024 → 4096×4096 (dovolj za 30×40cm pri 260 DPI)
//
// Primarno: HuggingFace swin2SR (4× super-resolution)
// Fallback: Sharp lanczos3 (2× interpolacija)
// ═══════════════════════════════════════════════

import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  maxDuration: 60, // Upscaling traja dlje
};

// HuggingFace super-resolution modeli (po prioriteti)
const UPSCALE_MODELS = [
  {
    id: 'stabilityai/stable-diffusion-x4-upscaler',
    name: 'SD x4 Upscaler',
    factor: 4,
    type: 'image-to-image', // Rabimo prompt
  },
  {
    id: 'caidas/swin2SR-realworld-sr-x4-64-bsrgan-psnr',
    name: 'Swin2SR 4×',
    factor: 4,
    type: 'super-resolution', // Pošljemo samo sliko
  },
];

/**
 * Upscale s HuggingFace super-resolution modelom.
 * Tip 'super-resolution': pošljemo binarno sliko.
 */
async function upscaleWithSuperRes(imageBuffer, model, token) {
  const url = `https://api-inference.huggingface.co/models/${model.id}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: imageBuffer,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`${model.name} HTTP ${response.status}: ${errText.slice(0, 200)}`);
  }

  return await response.buffer();
}

/**
 * Upscale s HuggingFace image-to-image modelom (SD upscaler).
 * Rabimo prompt za vodenje upscalinga.
 */
async function upscaleWithImg2Img(imageBuffer, model, token) {
  const url = `https://api-inference.huggingface.co/models/${model.id}`;

  // SD upscaler rabi multipart ali base64
  const base64 = imageBuffer.toString('base64');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {
        image: base64,
        prompt: 'high resolution, sharp details, masterpiece artwork, museum quality canvas print',
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`${model.name} HTTP ${response.status}: ${errText.slice(0, 200)}`);
  }

  return await response.buffer();
}

/**
 * Fallback: Sharp lanczos3 upscale (2× ali 4×).
 * Ni AI ampak je bolje kot nič.
 */
async function upscaleWithSharp(imageBuffer, factor) {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    throw new Error('Sharp ni na voljo');
  }

  const metadata = await sharp(imageBuffer).metadata();
  const newWidth = metadata.width * factor;
  const newHeight = metadata.height * factor;

  return await sharp(imageBuffer)
    .resize(newWidth, newHeight, {
      kernel: 'lanczos3',
      fit: 'fill',
    })
    .sharpen({ sigma: 0.8 }) // Malo izostri po upscalingu
    .png({ compressionLevel: 6 })
    .toBuffer();
}

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
    const { imageBase64, factor } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'Missing imageBase64' });
    }

    // Parse base64
    const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ success: false, error: 'Neveljaven base64 format' });
    }

    const imageBuffer = Buffer.from(match[2], 'base64');
    const upscaleFactor = factor || 4;
    const hfToken = process.env.HF_API_TOKEN?.trim();
    const errors = [];

    console.log(`[ETERNA] Upscale zahteva: ${imageBuffer.length} bytes, ${upscaleFactor}×`);

    // ─── 1. Poskusi HuggingFace AI modele ───
    if (hfToken) {
      for (const model of UPSCALE_MODELS) {
        try {
          console.log(`[ETERNA] Trying ${model.name}...`);

          let resultBuffer;
          if (model.type === 'super-resolution') {
            resultBuffer = await upscaleWithSuperRes(imageBuffer, model, hfToken);
          } else {
            resultBuffer = await upscaleWithImg2Img(imageBuffer, model, hfToken);
          }

          const contentType = 'image/png';
          const base64Result = `data:${contentType};base64,${resultBuffer.toString('base64')}`;

          // Pridobi dimenzije rezultata
          let dimensions = null;
          try {
            const sharp = (await import('sharp')).default;
            const meta = await sharp(resultBuffer).metadata();
            dimensions = { width: meta.width, height: meta.height };
          } catch {}

          console.log(`[ETERNA] ${model.name} success! ${resultBuffer.length} bytes${dimensions ? ` (${dimensions.width}×${dimensions.height})` : ''}`);

          return res.status(200).json({
            success: true,
            imageDataUrl: base64Result,
            model: model.name,
            factor: model.factor,
            method: 'ai',
            dimensions,
          });
        } catch (err) {
          console.warn(`[ETERNA] ${model.name} failed:`, err.message);
          errors.push(`${model.name}: ${err.message}`);
        }
      }
    }

    // ─── 2. Fallback: Sharp interpolation ───
    try {
      console.log(`[ETERNA] Fallback: Sharp ${upscaleFactor}× lanczos3...`);
      const sharpResult = await upscaleWithSharp(imageBuffer, Math.min(upscaleFactor, 4));
      const base64Result = `data:image/png;base64,${sharpResult.toString('base64')}`;

      let dimensions = null;
      try {
        const sharp = (await import('sharp')).default;
        const meta = await sharp(sharpResult).metadata();
        dimensions = { width: meta.width, height: meta.height };
      } catch {}

      console.log(`[ETERNA] Sharp success! ${sharpResult.length} bytes${dimensions ? ` (${dimensions.width}×${dimensions.height})` : ''}`);

      return res.status(200).json({
        success: true,
        imageDataUrl: base64Result,
        model: 'Sharp lanczos3',
        factor: upscaleFactor,
        method: 'interpolation',
        dimensions,
        warning: 'Uporabjena je klasična interpolacija (ni AI). Kvaliteta je nižja od AI upscalinga.',
      });
    } catch (err) {
      errors.push(`Sharp: ${err.message}`);
    }

    return res.status(500).json({
      success: false,
      error: `Upscaling ni uspel: ${errors.join(' | ')}`,
    });
  } catch (error) {
    console.error('[ETERNA] Upscale error:', error);
    return res.status(500).json({
      success: false,
      error: `Napaka: ${error.message}`,
    });
  }
}
