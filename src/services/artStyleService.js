// ═══════════════════════════════════════════════
// ETERNA Artisan — Artistic Style Transformations
//
// 7 unikatnih umetniških slogov za preobrazbo
// fotografij v umetniška dela. Vse canvas-based
// (hitro, brez API stroškov, dela offline).
//
// Popolnoma drugačno od ETERNA Spomini
// (ki je za restavracijo/ohranjanje fotografij).
// ═══════════════════════════════════════════════

/**
 * Metapodatki umetniških slogov za UI
 */
export const ART_STYLES = [
  {
    id: 'oil-painting',
    label: 'Oljno slikarstvo',
    emoji: '🎨',
    description: 'Debele poteze čopiča, bogata tekstura, klasična tehnika oljnih barv.',
    previewGradient: 'linear-gradient(135deg, #8B4513, #DAA520, #CD853F)',
  },
  {
    id: 'watercolor',
    label: 'Akvarel',
    emoji: '💧',
    description: 'Mehki prehodi barv, mokri robovi, prozračna lahkotnost vodenih barv.',
    previewGradient: 'linear-gradient(135deg, #87CEEB, #DDA0DD, #98FB98)',
  },
  {
    id: 'pop-art',
    label: 'Pop Art',
    emoji: '🔴',
    description: 'Drzne barve, grafični kontrasti, Warhol-ovski energični slog.',
    previewGradient: 'linear-gradient(135deg, #FF1493, #FFD700, #00CED1)',
  },
  {
    id: 'impressionist',
    label: 'Impresionizem',
    emoji: '✨',
    description: 'Plesajoča svetloba, barvne pike, Monet-ovski prikaz trenutka.',
    previewGradient: 'linear-gradient(135deg, #9370DB, #FFB6C1, #87CEFA)',
  },
  {
    id: 'sketch',
    label: 'Umetniška skica',
    emoji: '✏️',
    description: 'Oglje in svinčnik, dramatične sence, ročno risana kakovost.',
    previewGradient: 'linear-gradient(135deg, #2F2F2F, #696969, #A9A9A9)',
  },
  {
    id: 'digital-art',
    label: 'Digitalna umetnost',
    emoji: '🔷',
    description: 'Čiste linije, živahne barve, sodobna ilustracija za moderno dobo.',
    previewGradient: 'linear-gradient(135deg, #8b5cf6, #ec4899, #3b82f6)',
  },
  {
    id: 'cartoon',
    label: 'Cartoon',
    emoji: '🫧',
    description: 'Retro risanka — debele obrobe, žive ploske barve, Cuphead nostalgija.',
    previewGradient: 'linear-gradient(135deg, #FFD93D, #FF6B6B, #1A1A2E)',
  },
];

// ─── Pomožne funkcije ──────────────────────────

/**
 * Naloži sliko iz base64 in vrne canvas + context.
 */
function loadImageToCanvas(dataUrl, scale = 1) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve({ canvas, ctx, width: canvas.width, height: canvas.height });
    };
    img.onerror = () => reject(new Error('Slika se ni naložila'));
    img.src = dataUrl;
  });
}

/**
 * Enostaven box blur za canvas imageData.
 */
function boxBlur(data, width, height, radius) {
  const copy = new Uint8ClampedArray(data);
  const div = (2 * radius + 1) ** 2;

  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          r += copy[idx];
          g += copy[idx + 1];
          b += copy[idx + 2];
        }
      }
      const idx = (y * width + x) * 4;
      data[idx] = r / div;
      data[idx + 1] = g / div;
      data[idx + 2] = b / div;
    }
  }
}

/**
 * Sobel edge detection → vrne edge intenziteto (0-255) za vsak piksel.
 */
function sobelEdges(data, width, height) {
  const edges = new Float32Array(width * height);
  const gray = new Float32Array(width * height);

  // Pretvori v grayscale
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  }

  // Sobel operatorji
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const tl = gray[(y - 1) * width + (x - 1)];
      const tc = gray[(y - 1) * width + x];
      const tr = gray[(y - 1) * width + (x + 1)];
      const ml = gray[y * width + (x - 1)];
      const mr = gray[y * width + (x + 1)];
      const bl = gray[(y + 1) * width + (x - 1)];
      const bc = gray[(y + 1) * width + x];
      const br = gray[(y + 1) * width + (x + 1)];

      const gx = -tl - 2 * ml - bl + tr + 2 * mr + br;
      const gy = -tl - 2 * tc - tr + bl + 2 * bc + br;
      edges[y * width + x] = Math.min(255, Math.sqrt(gx * gx + gy * gy));
    }
  }
  return edges;
}

// ─── SLOG 1: OLJNO SLIKARSTVO ─────────────────

/**
 * Simulira oljno slikarstvo z Kuwahara-podobnim filtrom.
 * Ustvari videz debelih potez čopiča in bogato teksturo.
 */
function applyOilPainting(imageData, width, height) {
  const data = imageData.data;
  const radius = Math.max(3, Math.round(Math.min(width, height) / 200));
  const copy = new Uint8ClampedArray(data);

  // Poenostavljen Kuwahara filter — za vsak piksel preveri 4 kvadrante
  // in izbere tistega z najmanjšo varianco (najpomembnejša regija)
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      const regions = [
        { sx: -radius, ex: 0, sy: -radius, ey: 0 },
        { sx: 0, ex: radius, sy: -radius, ey: 0 },
        { sx: -radius, ex: 0, sy: 0, ey: radius },
        { sx: 0, ex: radius, sy: 0, ey: radius },
      ];

      let bestVar = Infinity;
      let bestR = 0, bestG = 0, bestB = 0;

      for (const reg of regions) {
        let sumR = 0, sumG = 0, sumB = 0, sumSq = 0, count = 0;
        for (let ky = reg.sy; ky <= reg.ey; ky++) {
          for (let kx = reg.sx; kx <= reg.ex; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const r = copy[idx], g = copy[idx + 1], b = copy[idx + 2];
            sumR += r; sumG += g; sumB += b;
            sumSq += r * r + g * g + b * b;
            count++;
          }
        }
        const mean = (sumR + sumG + sumB) / (3 * count);
        const variance = sumSq / count - mean * mean;
        if (variance < bestVar) {
          bestVar = variance;
          bestR = sumR / count;
          bestG = sumG / count;
          bestB = sumB / count;
        }
      }

      const idx = (y * width + x) * 4;
      data[idx] = bestR;
      data[idx + 1] = bestG;
      data[idx + 2] = bestB;
    }
  }

  // Ojačaj kontrast in nasičenost za "olje" videz
  for (let i = 0; i < data.length; i += 4) {
    // Povečaj nasičenost
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    data[i] = Math.min(255, Math.max(0, gray + (r - gray) * 1.4));
    data[i + 1] = Math.min(255, Math.max(0, gray + (g - gray) * 1.4));
    data[i + 2] = Math.min(255, Math.max(0, gray + (b - gray) * 1.4));
  }
}

// ─── SLOG 2: AKVAREL ──────────────────────────

/**
 * Simulira akvarel z mehkimi prehodi, mokri robovi efekt.
 */
function applyWatercolor(imageData, width, height) {
  const data = imageData.data;

  // 1. Mehčanje (močnejši blur za akvarelni videz)
  boxBlur(data, width, height, 3);
  boxBlur(data, width, height, 2);

  // 2. Posterizacija na manj odtenkov (značilnost akvarela)
  const levels = 12;
  const step = 255 / levels;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(data[i] / step) * step;
    data[i + 1] = Math.round(data[i + 1] / step) * step;
    data[i + 2] = Math.round(data[i + 2] / step) * step;
  }

  // 3. Rahlo posvetlitev (akvarel je transparenten, svetlejši)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] + 20 + Math.random() * 10);
    data[i + 1] = Math.min(255, data[i + 1] + 18 + Math.random() * 10);
    data[i + 2] = Math.min(255, data[i + 2] + 22 + Math.random() * 10);
    // Alfa variacija za mokri robovi efekt
    data[i + 3] = Math.max(180, 255 - Math.round(Math.random() * 30));
  }

  // 4. Edge-aware razlivanje barv (mokri robovi)
  const edgeCopy = new Uint8ClampedArray(data);
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      const idx = (y * width + x) * 4;
      // Naključno razlij barvo na robovih
      if (Math.random() < 0.15) {
        const dir = Math.floor(Math.random() * 4);
        const offsets = [
          [-1, 0], [1, 0], [0, -1], [0, 1],
        ];
        const [dx, dy] = offsets[dir];
        const nIdx = ((y + dy) * width + (x + dx)) * 4;
        const blend = 0.3 + Math.random() * 0.3;
        data[idx] = edgeCopy[idx] * (1 - blend) + edgeCopy[nIdx] * blend;
        data[idx + 1] = edgeCopy[idx + 1] * (1 - blend) + edgeCopy[nIdx + 1] * blend;
        data[idx + 2] = edgeCopy[idx + 2] * (1 - blend) + edgeCopy[nIdx + 2] * blend;
      }
    }
  }
}

// ─── SLOG 3: POP ART ──────────────────────────

/**
 * Drzne barve, grafični kontrasti, Warhol slog.
 */
function applyPopArt(imageData, width, height) {
  const data = imageData.data;

  // Pop art barvna paleta (drzne, nasičene barve)
  const palettes = [
    [255, 20, 147],   // Deep pink
    [255, 215, 0],     // Gold
    [0, 206, 209],     // Dark turquoise
    [255, 69, 0],      // Red-orange
    [138, 43, 226],    // Blue-violet
    [50, 205, 50],     // Lime green
    [255, 105, 180],   // Hot pink
    [0, 191, 255],     // Deep sky blue
  ];

  // 1. Močna posterizacija (le 4 nivoji)
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // Izberi barvno paleto glede na luminanco
    let paletteIdx;
    if (lum < 64) paletteIdx = 0;
    else if (lum < 128) paletteIdx = 1;
    else if (lum < 192) paletteIdx = 2;
    else paletteIdx = 3;

    // Dodaj barvni odklon glede na originalne barve
    const maxC = Math.max(r, g, b);
    const colorBias = maxC === r ? 0 : maxC === g ? 2 : 4;
    const finalIdx = (paletteIdx + colorBias) % palettes.length;

    const [pr, pg, pb] = palettes[finalIdx];
    // Mešaj paleto z originalom za realističnost
    const mix = 0.7;
    data[i] = Math.min(255, pr * mix + r * (1 - mix));
    data[i + 1] = Math.min(255, pg * mix + g * (1 - mix));
    data[i + 2] = Math.min(255, pb * mix + b * (1 - mix));
  }

  // 2. Dodaj grafične robove (halftone-like)
  const edges = sobelEdges(data, width, height);
  for (let i = 0; i < width * height; i++) {
    if (edges[i] > 50) {
      const idx = i * 4;
      // Temni obrobni efekt
      data[idx] = Math.max(0, data[idx] - edges[i] * 0.8);
      data[idx + 1] = Math.max(0, data[idx + 1] - edges[i] * 0.8);
      data[idx + 2] = Math.max(0, data[idx + 2] - edges[i] * 0.8);
    }
  }

  // 3. Boost kontrast
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.4 + 128));
    data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.4 + 128));
    data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.4 + 128));
  }
}

// ─── SLOG 4: IMPRESIONIZEM ────────────────────

/**
 * Barvne pike, plesajoča svetloba, Monet slog.
 */
function applyImpressionist(imageData, width, height) {
  const data = imageData.data;
  const copy = new Uint8ClampedArray(data);

  // Velikost "čopičev"
  const brushSize = Math.max(2, Math.round(Math.min(width, height) / 250));

  // 1. Razdelaj sliko v "poteze čopiča"
  for (let y = 0; y < height; y += brushSize) {
    for (let x = 0; x < width; x += brushSize) {
      // Vzorči barvo iz sredine bloka
      const cx = Math.min(x + Math.floor(brushSize / 2), width - 1);
      const cy = Math.min(y + Math.floor(brushSize / 2), height - 1);
      const srcIdx = (cy * width + cx) * 4;

      let r = copy[srcIdx], g = copy[srcIdx + 1], b = copy[srcIdx + 2];

      // Impresionistična barvna variacija
      const shift = 15 + Math.random() * 20;
      const hueShift = (Math.random() - 0.5) * shift;
      r = Math.min(255, Math.max(0, r + hueShift * 1.2));
      g = Math.min(255, Math.max(0, g + hueShift * 0.3));
      b = Math.min(255, Math.max(0, b - hueShift * 0.8));

      // Povečaj nasičenost
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = Math.min(255, gray + (r - gray) * 1.6);
      g = Math.min(255, gray + (g - gray) * 1.6);
      b = Math.min(255, gray + (b - gray) * 1.6);

      // Zapolni blok z rahlim naključnim odmikom (brushstroke)
      for (let by = 0; by < brushSize && y + by < height; by++) {
        for (let bx = 0; bx < brushSize && x + bx < width; bx++) {
          const idx = ((y + by) * width + (x + bx)) * 4;
          const jitter = (Math.random() - 0.5) * 8;
          data[idx] = Math.min(255, Math.max(0, r + jitter));
          data[idx + 1] = Math.min(255, Math.max(0, g + jitter * 0.7));
          data[idx + 2] = Math.min(255, Math.max(0, b + jitter * 0.5));
        }
      }
    }
  }

  // 2. Dodaj svetlobne pike (značilnost impresionizma)
  for (let i = 0; i < width * height * 0.01; i++) {
    const x = Math.floor(Math.random() * (width - 4)) + 2;
    const y = Math.floor(Math.random() * (height - 4)) + 2;
    const idx = (y * width + x) * 4;
    const brightness = 30 + Math.random() * 40;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nIdx = ((y + dy) * width + (x + dx)) * 4;
        data[nIdx] = Math.min(255, data[nIdx] + brightness);
        data[nIdx + 1] = Math.min(255, data[nIdx + 1] + brightness * 0.9);
        data[nIdx + 2] = Math.min(255, data[nIdx + 2] + brightness * 0.7);
      }
    }
  }
}

// ─── SLOG 5: UMETNIŠKA SKICA ──────────────────

/**
 * Oglje/svinčnik risba z dramatičnimi sencami.
 */
function applySketch(imageData, width, height) {
  const data = imageData.data;

  // 1. Pretvori v grayscale
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  // 2. Edge detection (Sobel)
  const edges = sobelEdges(data, width, height);

  // 3. Invertirano mešanje: bela podlaga + temne linije
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    const edgeStrength = edges[i];
    const original = data[idx]; // grayscale

    // Svinčnik efekt: temnejše linije na svetli podlagi
    // Papir je svetel, črtice so temne
    const paperTone = 245 + Math.random() * 10; // Rahla tekstura papirja
    const inkDarkness = Math.min(255, edgeStrength * 2.5);

    // Mešaj: kjer so robovi → temno, drugje → svetel papir z rahlim tonom originala
    const pencilMark = Math.max(0, paperTone - inkDarkness);
    const subtleTone = original * 0.15; // Rahel odtenek originala za volumen

    const final = Math.min(255, pencilMark * 0.7 + subtleTone * 0.3);
    data[idx] = final;
    data[idx + 1] = final;
    data[idx + 2] = final * 0.98; // Rahel topel odtenek

    // Cross-hatching efekt v temnih področjih
    if (original < 80) {
      const x = i % width;
      const y = Math.floor(i / width);
      // Diagonalne črte
      if ((x + y) % 4 === 0 || (x - y + height) % 6 === 0) {
        data[idx] = Math.max(30, data[idx] - 50);
        data[idx + 1] = Math.max(30, data[idx + 1] - 50);
        data[idx + 2] = Math.max(28, data[idx + 2] - 50);
      }
    }
  }
}

// ─── SLOG 6: DIGITALNA UMETNOST ───────────────

/**
 * Čiste linije, živahne barve, sodobna ilustracija.
 */
function applyDigitalArt(imageData, width, height) {
  const data = imageData.data;

  // 1. Gladko posteriziranje (8 nivojev — čiste barvne ploskve)
  const levels = 8;
  const step = 255 / levels;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(data[i] / step) * step;
    data[i + 1] = Math.round(data[i + 1] / step) * step;
    data[i + 2] = Math.round(data[i + 2] / step) * step;
  }

  // 2. Rahlo mehčanje za "vektorski" videz
  boxBlur(data, width, height, 1);

  // 3. Ojačaj nasičenost (živahne digitalne barve)
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    const boost = 1.8;
    data[i] = Math.min(255, Math.max(0, gray + (r - gray) * boost));
    data[i + 1] = Math.min(255, Math.max(0, gray + (g - gray) * boost));
    data[i + 2] = Math.min(255, Math.max(0, gray + (b - gray) * boost));
  }

  // 4. Dodaj čiste obrobe (cel-shading)
  const edges = sobelEdges(data, width, height);
  for (let i = 0; i < width * height; i++) {
    if (edges[i] > 40) {
      const idx = i * 4;
      const strength = Math.min(1, edges[i] / 120);
      // Temna obroba
      data[idx] = Math.round(data[idx] * (1 - strength * 0.7));
      data[idx + 1] = Math.round(data[idx + 1] * (1 - strength * 0.7));
      data[idx + 2] = Math.round(data[idx + 2] * (1 - strength * 0.7));
    }
  }

  // 5. Boost kontrast za čist digitalni videz
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.3 + 128));
    data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.3 + 128));
    data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.3 + 128));
  }
}

// ─── SLOG 7: CARTOON (Cuphead / retro risanka) ─

/**
 * Retro cartoon slog — inspiriran s Cuphead in 1930s
 * Fleischer/Disney animacijo.
 *
 * Algoritem:
 * 1. Bilateral-like smoothing (ohrani robove, zgladi ploskve)
 * 2. Agresivna posterizacija (5 nivojev — ploske barvne ploskve)
 * 3. Nasičenost boost (žive, drzne barve)
 * 4. Topel vintage tint (rumenkast 1930s odtenek)
 * 5. Debele črne obrobe (Sobel + razširitev)
 * 6. Rahel filmski grain za nostalgičen videz
 */
function applyCartoon(imageData, width, height) {
  const data = imageData.data;

  // ─── 1. Smoothing — zgladi barvne ploskve, ohrani robove ───
  // Tri prehodi box blura ustvarijo mehke ploskve
  // (podobno bilateralnemu filtru za cartoon videz)
  boxBlur(data, width, height, 3);
  boxBlur(data, width, height, 2);
  boxBlur(data, width, height, 1);

  // ─── 2. Edge detection PRED posterizacijo (boljši robovi) ───
  // Sobel na zglajenem originalu daje čistejše linije
  const edges = sobelEdges(data, width, height);

  // Razširi robove (dilate) za debelejše obrobe — Cuphead stil
  const thickEdges = new Float32Array(width * height);
  const dilateR = 1; // 1px dilacija = ~3px debele črte
  for (let y = dilateR; y < height - dilateR; y++) {
    for (let x = dilateR; x < width - dilateR; x++) {
      let maxE = 0;
      for (let ky = -dilateR; ky <= dilateR; ky++) {
        for (let kx = -dilateR; kx <= dilateR; kx++) {
          maxE = Math.max(maxE, edges[(y + ky) * width + (x + kx)]);
        }
      }
      thickEdges[y * width + x] = maxE;
    }
  }

  // ─── 3. Agresivna posterizacija (5 nivojev za ploske barve) ───
  const levels = 5;
  const step = 255 / levels;
  for (let i = 0; i < data.length; i += 4) {
    data[i]     = Math.round(data[i] / step) * step;
    data[i + 1] = Math.round(data[i + 1] / step) * step;
    data[i + 2] = Math.round(data[i + 2] / step) * step;
  }

  // ─── 4. Nasičenost boost (živahne cartoon barve) ───
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    const sat = 2.0; // Močan boost
    data[i]     = Math.min(255, Math.max(0, gray + (r - gray) * sat));
    data[i + 1] = Math.min(255, Math.max(0, gray + (g - gray) * sat));
    data[i + 2] = Math.min(255, Math.max(0, gray + (b - gray) * sat));
  }

  // ─── 5. Topel vintage tint (1930s rumenkast odtenek) ───
  for (let i = 0; i < data.length; i += 4) {
    // Rahlo sepia — dvigni R, rahlo G, rahlo znižaj B
    data[i]     = Math.min(255, data[i] + 8);
    data[i + 1] = Math.min(255, data[i + 1] + 3);
    data[i + 2] = Math.max(0, data[i + 2] - 10);
  }

  // ─── 6. Nariši debele črne obrobe čez barve ───
  // To je ključen del Cuphead stila — čiste, debele ink linije
  const edgeThreshold = 30;  // Nižji prag = več linij
  const edgeDarkness = 2.2;  // Intenzivnost obrobnih črt
  for (let i = 0; i < width * height; i++) {
    const e = thickEdges[i];
    if (e > edgeThreshold) {
      const idx = i * 4;
      // Moč obrobe: 0 (šibka) → 1 (polna črna)
      const strength = Math.min(1, (e - edgeThreshold) / (120 / edgeDarkness));
      // Blend proti črni
      data[idx]     = Math.round(data[idx]     * (1 - strength));
      data[idx + 1] = Math.round(data[idx + 1] * (1 - strength));
      data[idx + 2] = Math.round(data[idx + 2] * (1 - strength));
    }
  }

  // ─── 7. Rahel filmski grain (nostalgija) ───
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 12;
    data[i]     = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }

  // ─── 8. Končni kontrast boost za čiste cartoon barve ───
  for (let i = 0; i < data.length; i += 4) {
    data[i]     = Math.min(255, Math.max(0, (data[i] - 128) * 1.2 + 128));
    data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.2 + 128));
    data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.2 + 128));
  }
}

// ─── GLAVNI DISPATCHER ─────────────────────────

const STYLE_FUNCTIONS = {
  'oil-painting': applyOilPainting,
  'watercolor': applyWatercolor,
  'pop-art': applyPopArt,
  'impressionist': applyImpressionist,
  'sketch': applySketch,
  'digital-art': applyDigitalArt,
  'cartoon': applyCartoon,
};

/**
 * Uporabi umetniški slog na fotografijo.
 *
 * @param {string} imageBase64 - Base64 data URL
 * @param {string} styleId - ID sloga (npr. 'oil-painting')
 * @returns {Promise<{ processedImage: string, styleId: string }>}
 */
export async function applyArtStyle(imageBase64, styleId) {
  const styleFn = STYLE_FUNCTIONS[styleId];
  if (!styleFn) {
    throw new Error(`Neznan umetniški slog: ${styleId}`);
  }

  // Naloži sliko (brez scale-upa — ohrani originalno resolucijo)
  const { canvas, ctx, width, height } = await loadImageToCanvas(imageBase64, 1);

  // Pridobi podatke slike
  const imageData = ctx.getImageData(0, 0, width, height);

  // Uporabi transformacijo (sinhrono — vse je canvas manipulacija)
  styleFn(imageData, width, height);

  // Zapiši nazaj
  ctx.putImageData(imageData, 0, 0);

  // Vrni kot visoko kvaliteten JPEG
  return {
    processedImage: canvas.toDataURL('image/png', 0.95),
    styleId,
    styleName: ART_STYLES.find((s) => s.id === styleId)?.label || styleId,
  };
}
