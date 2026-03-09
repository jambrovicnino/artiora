// ═══════════════════════════════════════════════
// ETERNA Artisan — AI Image Generation (Vercel Serverless)
//
// Primarno: Hugging Face Inference API + FLUX.1-schnell
// Fallback 1: Together AI FLUX.1-schnell-Free
// Fallback 2: Pollinations.ai (brezplačno, brez API ključa)
//
// Generira na maksimalni možni resoluciji (1536×1536)
// ═══════════════════════════════════════════════

import fetch from 'node-fetch';

// Ciljna velikost generacije — čim večja
const GEN_WIDTH = 1536;
const GEN_HEIGHT = 1536;

/**
 * Sestavi umetniški prompt iz ključnih besed.
 */
function buildPrompt(keywords) {
  return [
    'A beautiful, gallery-worthy fine art painting.',
    `Theme and elements: ${keywords.join(', ')}.`,
    'Vibrant colors, high detail, artistic brushwork, museum quality.',
    'Professional artwork ready to be printed on canvas and framed.',
    'Ultra high resolution, sharp details, no blur.',
    'No text, no watermarks, no signatures.',
  ].join(' ');
}

/**
 * Generiraj sliko z Hugging Face Inference API (FLUX.1-schnell).
 * Poskusi večjo resolucijo (1536), fallback na 1024.
 */
async function generateWithHuggingFace(prompt, token) {
  const url = 'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell';

  // Poskusi najprej z večjo resolucijo
  for (const size of [GEN_WIDTH, 1024]) {
    try {
      console.log(`[ETERNA] HF: trying ${size}×${size}...`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            width: size,
            height: size,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        // Če je napaka zaradi velikosti, poskusi manjšo
        if (size > 1024 && (errText.includes('size') || errText.includes('dimension') || errText.includes('resolution') || response.status === 422)) {
          console.warn(`[ETERNA] HF ${size}×${size} ni podprto, fallback na manjše...`);
          continue;
        }
        throw new Error(`HuggingFace HTTP ${response.status}: ${errText.slice(0, 200)}`);
      }

      const buffer = await response.buffer();
      const base64 = buffer.toString('base64');
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      console.log(`[ETERNA] HF success: ${size}×${size}, ${buffer.length} bytes`);

      return {
        imageDataUrl: `data:${contentType};base64,${base64}`,
        description: `AI umetnina (${size}×${size}px)`,
        model: 'FLUX.1-schnell',
        width: size,
        height: size,
      };
    } catch (err) {
      if (size > 1024) {
        console.warn(`[ETERNA] HF ${size}×${size} failed:`, err.message);
        continue;
      }
      throw err;
    }
  }

  throw new Error('Vse HF velikosti so spodletele');
}

/**
 * Fallback: Together AI FLUX.1-schnell-Free.
 * Together podpira do 1440×1440 za brezplačni tier.
 */
async function generateWithTogether(prompt, apiKey) {
  const url = 'https://api.together.xyz/v1/images/generations';

  for (const size of [1440, 1024]) {
    try {
      console.log(`[ETERNA] Together: trying ${size}×${size}...`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'black-forest-labs/FLUX.1-schnell-Free',
          prompt,
          steps: 4,
          n: 1,
          response_format: 'b64_json',
          width: size,
          height: size,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error?.message || `HTTP ${response.status}`;
        if (size > 1024) {
          console.warn(`[ETERNA] Together ${size} failed:`, errMsg);
          continue;
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      if (!data.data?.[0]?.b64_json) throw new Error('Together ni vrnil slike');

      console.log(`[ETERNA] Together success: ${size}×${size}`);

      return {
        imageDataUrl: `data:image/png;base64,${data.data[0].b64_json}`,
        description: `AI umetnina (${size}×${size}px)`,
        model: 'FLUX.1-schnell',
        width: size,
        height: size,
      };
    } catch (err) {
      if (size > 1024) continue;
      throw err;
    }
  }

  throw new Error('Vse Together velikosti so spodletele');
}

/**
 * Fallback 2: Pollinations.ai — brezplačno, brez API ključa.
 * Vedno na voljo kot varnostna mreža.
 *
 * Vrne DIREKTNI URL — brskalnik naloži sliko sam.
 * Brez fetch-a = brez timeout problema na Vercel.
 */
function generateWithPollinations(prompt) {
  const size = 1024;
  const seed = Math.floor(Math.random() * 999999);
  const encoded = encodeURIComponent(prompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${size}&height=${size}&nologo=true&seed=${seed}`;

  console.log(`[ETERNA] Pollinations: returning direct URL (seed=${seed})`);

  return {
    imageDataUrl: imageUrl,
    description: `AI umetnina (${size}×${size}px)`,
    model: 'Pollinations-FLUX',
    width: size,
    height: size,
  };
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
    const { keywords } = req.body;

    if (!keywords || !Array.isArray(keywords)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: keywords (array)',
      });
    }

    const filtered = keywords.filter((k) => typeof k === 'string' && k.trim().length > 0);
    if (filtered.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Vnesite vsaj eno ključno besedo.',
      });
    }

    const prompt = buildPrompt(filtered);
    const errors = [];

    // ─── 1. Hugging Face (primarni) ───
    const hfToken = process.env.HF_API_TOKEN?.trim();
    if (hfToken) {
      try {
        console.log('[ETERNA] Trying HuggingFace FLUX.1-schnell...');
        const result = await generateWithHuggingFace(prompt, hfToken);
        return res.status(200).json({ success: true, ...result });
      } catch (err) {
        console.warn('[ETERNA] HuggingFace failed:', err.message);
        errors.push(`HF: ${err.message}`);
      }
    }

    // ─── 2. Together AI (fallback) ───
    const togetherKey = process.env.TOGETHER_API_KEY?.trim();
    if (togetherKey) {
      try {
        console.log('[ETERNA] Trying Together AI fallback...');
        const result = await generateWithTogether(prompt, togetherKey);
        return res.status(200).json({ success: true, ...result });
      } catch (err) {
        console.warn('[ETERNA] Together AI failed:', err.message);
        errors.push(`Together: ${err.message}`);
      }
    }

    // ─── 3. Pollinations.ai (brezplačno, brez API ključa — vedno na voljo) ───
    try {
      console.log('[ETERNA] Trying Pollinations.ai (free, no API key)...');
      const result = generateWithPollinations(prompt);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      console.warn('[ETERNA] Pollinations.ai failed:', err.message);
      errors.push(`Pollinations: ${err.message}`);
    }

    // ─── Vsi ponudniki so spodleteli ───
    return res.status(500).json({
      success: false,
      error: errors.length > 0
        ? errors.join(' | ')
        : 'Vsi AI ponudniki so nedosegljivi. Poskusite znova čez nekaj minut.',
    });
  } catch (error) {
    console.error('[ETERNA] Server error:', error);
    return res.status(500).json({
      success: false,
      error: `Napaka strežnika: ${error.message}`,
    });
  }
}
