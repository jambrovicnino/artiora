import { useRef, useEffect, useCallback } from 'react';
import { frameStyles } from '../../data/frameOptions';
import './FramePreview.css';

// ═══════════════════════════════════════════════
// ETERNA — Canvas-Based Frame Preview
//
// Renderira realistične okvirje z dejanskimi
// strip teksturami iz Vidal kataloga.
// Koti so pravilni 45° miter stiki (trapezoidni
// clipping pathi na Canvas elementu).
//
// ADAPTIVNA KOTNA KOREKCIJA:
// Strip slike imajo na vrhu svetel prerez (backing).
// Namesto agresivne zamenjave (ki uniči teksturo)
// uporabimo adaptiven pristop — količina korekcije
// je odvisna od kontrasta med backing-om in obrazom.
// ═══════════════════════════════════════════════

const CANVAS_HEIGHT = 900;
const PREVIEW_SCALE = 2.2;
const SEAM_OVERLAP = 1.5;

function getAspectRatio(sizeId) {
  if (!sizeId) return 4 / 5;
  const parts = sizeId.split('x').map(Number);
  if (parts.length !== 2 || !parts[0] || !parts[1]) return 4 / 5;
  return parts[0] / parts[1];
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

/**
 * Vzorči povprečno barvo ene vrstice strip slike.
 * Vrne { r, g, b }.
 */
function sampleRow(sctx, w, h, pct) {
  const row = Math.round(h * pct);
  const data = sctx.getImageData(0, Math.min(row, h - 1), w, 1).data;
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
  }
  return { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) };
}

/** Evklidska razdalja med dvema barvama (0–441) */
function colorDist(a, b) {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

/**
 * ADAPTIVNA priprava strip slike.
 *
 * Namesto agresivne zamenjave 20% vrha (ki uniči ornamente),
 * najprej IZMERI kontrast med backing-om (vrh) in obrazom (sredina).
 *
 *  Visok kontrast (npr. črn okvir z bež backing-om):
 *    → zamenjaj vrhnjih 10% z barvo obraza (backing je res moteč)
 *
 *  Nizek kontrast (npr. zlat ornament z zlato-bež backing-om):
 *    → zamenjaj le 3% (samo rob, ohrani ornamente)
 *
 * Rezultat: bogata tekstura JE ohranjena, kotni artefakti pa minimizirani.
 */
function prepareCleanStrip(stripImg) {
  const w = stripImg.width;
  const h = stripImg.height;
  const sc = document.createElement('canvas');
  sc.width = w;
  sc.height = h;
  const sctx = sc.getContext('2d');
  sctx.drawImage(stripImg, 0, 0);

  // ─── Vzorčenje barv ───
  const topColor = sampleRow(sctx, w, h, 0.03);   // zelo vrh (backing)
  const faceColor = sampleRow(sctx, w, h, 0.55);   // sredina obraza
  const face2 = sampleRow(sctx, w, h, 0.65);        // potrditev
  // Robustno povprečje obraza
  const fR = Math.round((faceColor.r + face2.r) / 2);
  const fG = Math.round((faceColor.g + face2.g) / 2);
  const fB = Math.round((faceColor.b + face2.b) / 2);
  const faceCSS = `rgb(${fR},${fG},${fB})`;

  // ─── Kontrast med backing-om in obrazom ───
  const contrast = colorDist(topColor, { r: fR, g: fG, b: fB });

  // ─── Adaptivna korekcija ───
  // Visok kontrast (>120): backing je zelo drugačen od obraza → zamenjaj 10%
  // Srednji kontrast (60-120): zmerna razlika → zamenjaj 5%
  // Nizek kontrast (<60): backing je podoben obrazu → zamenjaj le 2%
  let replaceTop, blendH;
  if (contrast > 120) {
    // Visok kontrast (npr. moderni-crni: črn okvir z bež backing-om)
    replaceTop = Math.round(h * 0.10);
    blendH = Math.round(h * 0.04);
  } else if (contrast > 60) {
    // Srednji kontrast
    replaceTop = Math.round(h * 0.05);
    blendH = Math.round(h * 0.03);
  } else {
    // Nizek kontrast (npr. 290-A: zlat ornament z zlato-bež vrh)
    replaceTop = Math.round(h * 0.02);
    blendH = Math.round(h * 0.02);
  }

  // Zamenjaj le vrh z barvo obraza
  sctx.fillStyle = faceCSS;
  sctx.fillRect(0, 0, w, replaceTop);

  // Gladek prehod
  if (blendH > 0) {
    const grad = sctx.createLinearGradient(0, replaceTop, 0, replaceTop + blendH);
    grad.addColorStop(0, faceCSS);
    grad.addColorStop(1, `rgba(${fR},${fG},${fB},0)`);
    sctx.fillStyle = grad;
    sctx.fillRect(0, replaceTop, w, blendH);
  }

  // Spodnji rob: minimalna korekcija (samo 2%)
  const btmReplace = Math.round(h * 0.02);
  sctx.fillStyle = faceCSS;
  sctx.fillRect(0, h - btmReplace, w, btmReplace);

  return { canvas: sc, faceR: fR, faceG: fG, faceB: fB, contrast };
}

/**
 * Izriši okvir z dejansko strip teksturo.
 */
function drawFrame(ctx, photoImg, stripImg, cW, cH, fW, tintColor) {
  ctx.clearRect(0, 0, cW, cH);

  const photoX = fW;
  const photoY = fW;
  const photoW = cW - 2 * fW;
  const photoH = cH - 2 * fW;

  // ─── 1. Ozadje ───
  ctx.fillStyle = '#0a0908';
  ctx.fillRect(0, 0, cW, cH);

  // ─── 2. Fotografija (s prekrivanjem za anti-aliasing) ───
  const imgRatio = photoImg.width / photoImg.height;
  const photoOverlap = 2;
  const boxRatio = photoW / photoH;
  let sx = 0, sy = 0, sw = photoImg.width, sh = photoImg.height;
  if (imgRatio > boxRatio) {
    sw = photoImg.height * boxRatio;
    sx = (photoImg.width - sw) / 2;
  } else {
    sh = photoImg.width / boxRatio;
    sy = (photoImg.height - sh) / 2;
  }
  ctx.drawImage(photoImg, sx, sy, sw, sh,
    photoX - photoOverlap, photoY - photoOverlap,
    photoW + photoOverlap * 2, photoH + photoOverlap * 2);

  // ─── 3. Priprava strip tekstur ───
  const { canvas: cleanStrip, faceR, faceG, faceB, contrast } = prepareCleanStrip(stripImg);

  // Rotirana verzija za horizontalni stranici
  const hStrip = document.createElement('canvas');
  hStrip.width = cleanStrip.height;
  hStrip.height = cleanStrip.width;
  const hCtx = hStrip.getContext('2d');
  hCtx.translate(0, cleanStrip.width);
  hCtx.rotate(-Math.PI / 2);
  hCtx.drawImage(cleanStrip, 0, 0);

  const o = SEAM_OVERLAP;

  // ─── 4. LEVA STRANICA ───
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-o, -o);
  ctx.lineTo(fW + o, fW - o);
  ctx.lineTo(fW + o, cH - fW + o);
  ctx.lineTo(-o, cH + o);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(cleanStrip, 0, 0, cleanStrip.width, cleanStrip.height, 0, 0, fW, cH);
  ctx.restore();

  // ─── 5. DESNA STRANICA (zrcaljeno) ───
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cW + o, -o);
  ctx.lineTo(cW - fW - o, fW - o);
  ctx.lineTo(cW - fW - o, cH - fW + o);
  ctx.lineTo(cW + o, cH + o);
  ctx.closePath();
  ctx.clip();
  ctx.translate(cW, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(cleanStrip, 0, 0, cleanStrip.width, cleanStrip.height, 0, 0, fW, cH);
  ctx.restore();

  // ─── 6. ZGORNJA STRANICA ───
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-o, -o);
  ctx.lineTo(cW + o, -o);
  ctx.lineTo(cW - fW + o, fW + o);
  ctx.lineTo(fW - o, fW + o);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(hStrip, 0, 0, hStrip.width, hStrip.height, 0, 0, cW, fW);
  ctx.restore();

  // ─── 7. SPODNJA STRANICA ───
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-o, cH + o);
  ctx.lineTo(cW + o, cH + o);
  ctx.lineTo(cW - fW + o, cH - fW - o);
  ctx.lineTo(fW - o, cH - fW - o);
  ctx.closePath();
  ctx.clip();
  ctx.translate(0, cH);
  ctx.scale(1, -1);
  ctx.drawImage(hStrip, 0, 0, hStrip.width, hStrip.height, 0, 0, cW, fW);
  ctx.restore();

  // ─── 8. Barvno tintanje (New Era) ───
  if (tintColor) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, cW, cH);
    ctx.moveTo(photoX, photoY);
    ctx.lineTo(photoX, photoY + photoH);
    ctx.lineTo(photoX + photoW, photoY + photoH);
    ctx.lineTo(photoX + photoW, photoY);
    ctx.closePath();
    ctx.clip('evenodd');

    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = tintColor;
    ctx.fillRect(0, 0, cW, cH);

    ctx.globalCompositeOperation = 'color';
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = tintColor;
    ctx.fillRect(0, 0, cW, cH);

    ctx.restore();
  }

  // ─── 9. Kotna korekcija (samo za visoko-kontrastne okvirje) ───
  // Za okvirje z velikim kontrastom (moderni črni ipd.) dodamo
  // majhen barvni trikotnik na vsakem kotu, da prekrije
  // preostale backing artefakte, ki jih prepareCleanStrip ni odstranil.
  if (contrast > 80) {
    const faceCSS = tintColor || `rgb(${faceR},${faceG},${faceB})`;
    const patchAlpha = contrast > 120 ? 0.6 : 0.35;
    const cornerPad = Math.max(3, fW * 0.12);

    const corners = [
      { ox: 0, oy: 0, mx: fW, my: fW },
      { ox: cW, oy: 0, mx: cW - fW, my: fW },
      { ox: 0, oy: cH, mx: fW, my: cH - fW },
      { ox: cW, oy: cH, mx: cW - fW, my: cH - fW },
    ];

    corners.forEach(({ ox, oy, mx, my }) => {
      ctx.save();
      ctx.fillStyle = faceCSS;
      ctx.globalAlpha = patchAlpha;
      const dx = mx - ox, dy = my - oy;
      const len = Math.sqrt(dx * dx + dy * dy);
      const px = -dy / len * cornerPad;
      const py = dx / len * cornerPad;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(mx + px, my + py);
      ctx.lineTo(mx - px, my - py);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  // ─── 10. Miter črte ───
  const darkR = Math.round(faceR * 0.3);
  const darkG = Math.round(faceG * 0.3);
  const darkB = Math.round(faceB * 0.3);

  ctx.save();
  ctx.strokeStyle = `rgb(${darkR},${darkG},${darkB})`;
  ctx.lineWidth = Math.max(1.5, fW * 0.03);
  ctx.globalAlpha = 0.4;
  [
    [0, 0, fW, fW],
    [cW, 0, cW - fW, fW],
    [0, cH, fW, cH - fW],
    [cW, cH, cW - fW, cH - fW],
  ].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });
  ctx.restore();

  // ─── 11. Rabbet trak ───
  const rabbetW = Math.max(2, fW * 0.06);
  ctx.fillStyle = '#0a0908';
  ctx.fillRect(photoX - 1, photoY - 1, photoW + 2, rabbetW + 1);
  ctx.fillRect(photoX - 1, photoY + photoH - rabbetW, photoW + 2, rabbetW + 1);
  ctx.fillRect(photoX - 1, photoY - 1, rabbetW + 1, photoH + 2);
  ctx.fillRect(photoX + photoW - rabbetW, photoY - 1, rabbetW + 1, photoH + 2);

  // ─── 12. Notranji rob ───
  const innerBevel = Math.max(2, fW * 0.05);
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = innerBevel;
  ctx.strokeRect(
    photoX + innerBevel / 2, photoY + innerBevel / 2,
    photoW - innerBevel, photoH - innerBevel
  );
  ctx.restore();

  // ─── 13. Notranja senca ───
  const shadowSize = Math.max(8, fW * 0.22);

  const topShadow = ctx.createLinearGradient(photoX, photoY, photoX, photoY + shadowSize);
  topShadow.addColorStop(0, 'rgba(0,0,0,0.7)');
  topShadow.addColorStop(0.3, 'rgba(0,0,0,0.3)');
  topShadow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = topShadow;
  ctx.fillRect(photoX, photoY, photoW, shadowSize);

  const leftShadow = ctx.createLinearGradient(photoX, photoY, photoX + shadowSize, photoY);
  leftShadow.addColorStop(0, 'rgba(0,0,0,0.6)');
  leftShadow.addColorStop(0.3, 'rgba(0,0,0,0.25)');
  leftShadow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = leftShadow;
  ctx.fillRect(photoX, photoY, shadowSize, photoH);

  const cRad = shadowSize * 0.7;
  const cShadow = ctx.createRadialGradient(photoX, photoY, 0, photoX, photoY, cRad);
  cShadow.addColorStop(0, 'rgba(0,0,0,0.35)');
  cShadow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = cShadow;
  ctx.fillRect(photoX, photoY, cRad, cRad);

  // ─── 14. Zunanji rob ───
  ctx.strokeStyle = tintColor ? `${tintColor}88` : 'rgba(0,0,0,0.55)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0.5, 0.5, cW - 1, cH - 1);
}

/**
 * Izriši napeto platno na podokvir — subtilen 3D efekt.
 */
function drawStretched(ctx, photoImg, cW, cH) {
  ctx.clearRect(0, 0, cW, cH);

  const depth = Math.round(Math.min(cW, cH) * 0.028);
  const photoW = cW - depth;
  const photoH = cH - depth;

  const imgRatio = photoImg.width / photoImg.height;
  const boxRatio = photoW / photoH;
  let sx = 0, sy = 0, sw = photoImg.width, sh = photoImg.height;
  if (imgRatio > boxRatio) {
    sw = photoImg.height * boxRatio;
    sx = (photoImg.width - sw) / 2;
  } else {
    sh = photoImg.width / boxRatio;
    sy = (photoImg.height - sh) / 2;
  }

  // Desna stranica
  ctx.fillStyle = '#e0dcd6';
  ctx.beginPath();
  ctx.moveTo(photoW, 0);
  ctx.lineTo(cW, depth);
  ctx.lineTo(cW, cH);
  ctx.lineTo(photoW, photoH);
  ctx.closePath();
  ctx.fill();
  const rGrad = ctx.createLinearGradient(photoW, 0, cW, 0);
  rGrad.addColorStop(0, 'rgba(0,0,0,0.0)');
  rGrad.addColorStop(1, 'rgba(0,0,0,0.12)');
  ctx.fillStyle = rGrad;
  ctx.fill();

  // Spodnja stranica
  ctx.fillStyle = '#e8e4de';
  ctx.beginPath();
  ctx.moveTo(0, photoH);
  ctx.lineTo(photoW, photoH);
  ctx.lineTo(cW, cH);
  ctx.lineTo(depth, cH);
  ctx.closePath();
  ctx.fill();
  const bGrad = ctx.createLinearGradient(0, photoH, 0, cH);
  bGrad.addColorStop(0, 'rgba(0,0,0,0.0)');
  bGrad.addColorStop(1, 'rgba(0,0,0,0.08)');
  ctx.fillStyle = bGrad;
  ctx.fill();

  // Glavna slika
  ctx.drawImage(photoImg, sx, sy, sw, sh, 0, 0, photoW, photoH);

  // Robne črte
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, photoH);
  ctx.lineTo(photoW, photoH);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(photoW, 0);
  ctx.lineTo(photoW, photoH);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(photoW, photoH);
  ctx.lineTo(cW, cH);
  ctx.stroke();
}

// ═══════════════════════════════════════════════
// KOMPONENTA
// ═══════════════════════════════════════════════
export default function FramePreview({
  image,
  selectedFrame,
  selectedSize,
  sizeId,
  withFrame,
  productType,
}) {
  const canvasRef = useRef(null);
  const frame = frameStyles.find((f) => f.id === selectedFrame);
  const aspectRatio = getAspectRatio(sizeId);
  const isStretched = productType === 'stretched';

  const canvasH = CANVAS_HEIGHT;
  const canvasW = Math.round(canvasH * aspectRatio);
  const frameW = withFrame && frame
    ? Math.round((frame.borderWidth || 16) * PREVIEW_SCALE)
    : 0;

  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');

    try {
      if (withFrame && frame) {
        const [photoImg, stripImg] = await Promise.all([
          loadImage(image),
          loadImage(frame.stripImage),
        ]);
        drawFrame(ctx, photoImg, stripImg, canvasW, canvasH, frameW, frame.tint || null);
      } else {
        const photoImg = await loadImage(image);
        drawStretched(ctx, photoImg, canvasW, canvasH);
      }
    } catch (err) {
      console.warn('FramePreview render error:', err);
      try {
        const photoImg = await loadImage(image);
        drawStretched(ctx, photoImg, canvasW, canvasH);
      } catch (_) {
        // Cannot render at all
      }
    }
  }, [image, withFrame, isStretched, frame, canvasW, canvasH, frameW]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <div className="frame-preview-wrap">
      <div className={`frame-preview-outer ${withFrame || isStretched ? 'has-frame' : ''}`}>
        <canvas
          ref={canvasRef}
          width={canvasW}
          height={canvasH}
          className="frame-preview-canvas-el"
        />
      </div>

      {selectedSize && (
        <p className="frame-preview-size">
          PREDOGLED VELIKOSTI: {selectedSize}
        </p>
      )}
    </div>
  );
}
