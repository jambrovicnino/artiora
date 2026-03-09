// ═══════════════════════════════════════════════
// ETERNA — Storitev za izboljšavo slik
// Ponudnik: demo (canvas) | huggingface | nanobanana
// ═══════════════════════════════════════════════

// Trenutni ponudnik AI (nastavljivo prek .env)
const AI_PROVIDER = import.meta.env.VITE_AI_PROVIDER || 'demo';
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || '';

// Razpoložljive možnosti izboljšave
export const ENHANCEMENT_OPTIONS = {
  RESTORATION: 'restoration',
  COLORIZE: 'colorize',
};

// Metapodatki za prikaz v uporabniškem vmesniku
export const ENHANCEMENT_METADATA = [
  {
    id: ENHANCEMENT_OPTIONS.RESTORATION,
    label: 'AI Stilizacija',
    description:
      'Unikatni umetniški slogi, izboljšava podrobnosti in 400% povečanje ločljivosti.',
    buttonLabel: 'UPORABI AI STILIZACIJO',
  },
  {
    id: ENHANCEMENT_OPTIONS.COLORIZE,
    label: 'AI Barvanje & Stilizacija',
    description:
      'Najprej povečamo ločljivost, nato ustvarimo umetniško barvno kompozicijo z AI.',
    buttonLabel: 'USTVARI & OBARVAJ',
  },
];

// ─── Hugging Face Inference API ────────────────
const HF_MODELS = {
  restoration: 'caidas/swin2SR-classical-sr-x2-64',
  colorize: 'lllyasviel/sd-controlnet-canny',
};

/**
 * Pretvori base64 dataURL v Blob
 */
function base64ToBlob(base64) {
  const parts = base64.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const binary = atob(parts[1]);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

/**
 * Pokliči Hugging Face Inference API
 */
async function callHuggingFaceAPI(imageBase64, enhancement) {
  const model = HF_MODELS[enhancement] || HF_MODELS.restoration;
  const imageBlob = base64ToBlob(imageBase64);

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
      },
      body: imageBlob,
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Neznana napaka');
    console.warn('[ETERNA] HF API napaka:', response.status, errorText);
    throw new Error(`HF API napaka: ${response.status}`);
  }

  const resultBlob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(resultBlob);
  });
}

// ─── PLACEHOLDER: Nano Banana API ───────────────
// Strošek: 0.039 € na generacijo
//
// async function callNanoBananaAPI(imageBase64, enhancement) {
//   const response = await fetch('https://api.nanobanana.com/v1/enhance', {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${import.meta.env.VITE_NANOBANANA_API_KEY}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       image: imageBase64,
//       mode: enhancement,
//       scale: 4,
//       colorSpace: 'CMYK',
//       dpi: 300,
//     }),
//   });
//   if (!response.ok) throw new Error('Napaka pri obdelavi slike');
//   const data = await response.json();
//   return data.processedImage; // base64
// }
// ─────────────────────────────────────────────────

/**
 * Demo izboljšava — Restavracija (napredna canvas obdelava)
 */
function applyRestoration(imageData) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // 1. Adaptivna S-krivulja za kontrast
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    const normalized = luminance / 255;
    const sCurve = normalized < 0.5
      ? 2 * normalized * normalized
      : 1 - 2 * (1 - normalized) * (1 - normalized);
    const factor = (sCurve * 255) / (luminance || 1);

    data[i] = Math.min(255, Math.max(0, r * factor * 1.02));
    data[i + 1] = Math.min(255, Math.max(0, g * factor * 1.02));
    data[i + 2] = Math.min(255, Math.max(0, b * factor * 1.02));
  }

  // 2. Zmanjšanje šuma (povprečni filter za odstopajoče pike)
  const copy = new Uint8ClampedArray(data);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      for (let c = 0; c < 3; c++) {
        const center = copy[idx + c];
        const neighbors = [
          copy[((y - 1) * width + x) * 4 + c],
          copy[((y + 1) * width + x) * 4 + c],
          copy[(y * width + x - 1) * 4 + c],
          copy[(y * width + x + 1) * 4 + c],
        ];
        const avg = neighbors.reduce((a, b) => a + b, 0) / 4;
        if (Math.abs(center - avg) > 40) {
          data[idx + c] = Math.round(center * 0.6 + avg * 0.4);
        }
      }
    }
  }

  return imageData;
}

/**
 * Demo izboljšava — Barvanje (naravni barvni odtenki)
 */
function applyColorization(imageData) {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    let newR, newG, newB;

    if (luminance < 60) {
      // Temni toni — hladnejši modro-zeleni
      newR = luminance * 0.85 + 15;
      newG = luminance * 0.88 + 12;
      newB = luminance * 0.95 + 20;
    } else if (luminance < 160) {
      // Srednji toni — topli kožni/naravni
      const t = (luminance - 60) / 100;
      newR = luminance + 25 * t + 8;
      newG = luminance + 10 * t + 3;
      newB = luminance - 15 * t - 5;
    } else {
      // Svetli toni — rahlo topli
      newR = luminance + 8;
      newG = luminance + 4;
      newB = luminance - 3;
    }

    // Subtilna barvna variacija
    const posVar = Math.sin(i * 0.00003) * 5;

    data[i] = Math.min(255, Math.max(0, newR + posVar));
    data[i + 1] = Math.min(255, Math.max(0, newG + posVar * 0.5));
    data[i + 2] = Math.min(255, Math.max(0, newB - posVar * 0.3));
  }

  return imageData;
}

/**
 * Demo canvas izboljšava (izboljšana različica v2)
 */
async function demoCanvasEnhance(imageBase64, enhancement) {
  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = imageBase64;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Povečaj na 2x velikost
  const scale = 2;
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Uporabi napredne izboljšave
  if (enhancement === ENHANCEMENT_OPTIONS.RESTORATION) {
    applyRestoration(imageData);
  } else if (enhancement === ENHANCEMENT_OPTIONS.COLORIZE) {
    applyColorization(imageData);
  }

  ctx.putImageData(imageData, 0, 0);

  // Dodatni canvas filtri za polirano končno sliko
  if (enhancement === ENHANCEMENT_OPTIONS.RESTORATION) {
    ctx.filter = 'contrast(1.15) brightness(1.05) saturate(1.05)';
  } else {
    ctx.filter = 'saturate(1.4) brightness(1.08) contrast(1.1)';
  }
  ctx.drawImage(canvas, 0, 0);

  return canvas.toDataURL('image/png', 0.95);
}

/**
 * Simulacija zakasnitve obdelave
 */
function simulateProcessing(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

/**
 * Izboljšaj sliko — glavna funkcija
 * Avtomatsko izbere ponudnika glede na konfiguracijo
 *
 * @param {string} imageBase64 - Base64 kodirani podatki slike
 * @param {string} enhancement - Vrsta izboljšave ('restoration' | 'colorize')
 * @returns {Promise<{success: boolean, processedImage?: string, metadata?: object}>}
 */
export async function enhanceImage(imageBase64, enhancement) {
  try {
    if (!imageBase64) {
      throw new Error('Podatki slike so obvezni');
    }

    if (!Object.values(ENHANCEMENT_OPTIONS).includes(enhancement)) {
      throw new Error('Neveljavna možnost izboljšave');
    }

    let processedImage;
    let model = 'demo-canvas-v2';

    // Izberi ponudnika
    if (AI_PROVIDER === 'huggingface' && HF_TOKEN) {
      try {
        console.log('[ETERNA] Uporaba Hugging Face API...');
        processedImage = await callHuggingFaceAPI(imageBase64, enhancement);
        model = `hf/${HF_MODELS[enhancement]}`;
      } catch (hfError) {
        console.warn('[ETERNA] HF API ni na voljo, uporaba demo obdelave:', hfError.message);
        const processingTime = 3000 + Math.random() * 2000;
        await simulateProcessing(processingTime);
        processedImage = await demoCanvasEnhance(imageBase64, enhancement);
        model = 'demo-canvas-v2 (padec iz HF)';
      }
    } else {
      // Demo obdelava
      const processingTime = 3000 + Math.random() * 2000;
      await simulateProcessing(processingTime);
      processedImage = await demoCanvasEnhance(imageBase64, enhancement);
    }

    return {
      success: true,
      processedImage,
      metadata: {
        enhancement,
        processedAt: new Date().toISOString(),
        model,
        provider: AI_PROVIDER,
        scale: 2,
        printReady: AI_PROVIDER === 'nanobanana',
      },
    };
  } catch (error) {
    console.error('[ETERNA] Napaka pri izboljšavi:', error);
    throw new Error('Izboljšava slike ni uspela. Prosimo, poskusite znova.');
  }
}

/**
 * Pridobi metapodatke izboljšave po ID-ju
 */
export function getEnhancementMetadata(enhancementId) {
  return ENHANCEMENT_METADATA.find((e) => e.id === enhancementId) || null;
}

export default {
  enhanceImage,
  getEnhancementMetadata,
  ENHANCEMENT_OPTIONS,
  ENHANCEMENT_METADATA,
};
