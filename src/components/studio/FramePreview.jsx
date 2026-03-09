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
// NEW: Podpora za barvno tintanje (New Era okvirji)
// ═══════════════════════════════════════════════

// Višina canvas elementa (piksli) — višja = bolj ostro
const CANVAS_HEIGHT = 700;

// Faktor za boljšo vidnost okvirja v predogledu
const PREVIEW_SCALE = 2.0;

// Razširitev clipping patha za preprečevanje vrzeli (anti-aliasing fix)
const SEAM_OVERLAP = 1;

/** Razmerje stranic iz sizeId (npr. "40x50" → 0.8) */
function getAspectRatio(sizeId) {
  if (!sizeId) return 4 / 5;
  const parts = sizeId.split('x').map(Number);
  if (parts.length !== 2 || !parts[0] || !parts[1]) return 4 / 5;
  return parts[0] / parts[1];
}

/** Naloži sliko kot Promise */
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
 * Izriši okvir z dejansko strip teksturo.
 * Vsako stranico okvirja izriše s pravilno orientirano
 * teksturo, kote pa oreže s 45° trapezoidnim clipping pathom.
 *
 * SEAM_OVERLAP: Vsak clip path se razširi za 1px čez miter šiv,
 * kar prepreči vrzeli med stranmi okvirja zaradi anti-aliasinga.
 *
 * tintColor: Opcijski HEX za barvno tintanje (New Era okvirji).
 */
function drawFrame(ctx, photoImg, stripImg, cW, cH, fW, tintColor) {
  ctx.clearRect(0, 0, cW, cH);

  const photoX = fW;
  const photoY = fW;
  const photoW = cW - 2 * fW;
  const photoH = cH - 2 * fW;

  // ─── 1. Ozadje (črno za robove) ───
  ctx.fillStyle = '#0a0908';
  ctx.fillRect(0, 0, cW, cH);

  // ─── 2. Fotografija v sredini ───
  // Crop-to-fill (object-fit: cover ekvivalent)
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
  ctx.drawImage(photoImg, sx, sy, sw, sh, photoX, photoY, photoW, photoH);

  // ─── 3. Priprava horizontalne strip teksture ───
  // Originalna strip je vertikalna; ustvarimo rotirano verzijo za top/bottom
  const hCanvas = document.createElement('canvas');
  hCanvas.width = stripImg.height;
  hCanvas.height = stripImg.width;
  const hCtx = hCanvas.getContext('2d');
  hCtx.translate(0, stripImg.width);
  hCtx.rotate(-Math.PI / 2);
  hCtx.drawImage(stripImg, 0, 0);

  // Overlap (o) prepreči vrzeli na miter šivih
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
  ctx.drawImage(stripImg, 0, 0, stripImg.width, stripImg.height, 0, 0, fW, cH);
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
  ctx.drawImage(stripImg, 0, 0, stripImg.width, stripImg.height, 0, 0, fW, cH);
  ctx.restore();

  // ─── 6. ZGORNJA STRANICA (rotirana tekstura) ───
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-o, -o);
  ctx.lineTo(cW + o, -o);
  ctx.lineTo(cW - fW + o, fW + o);
  ctx.lineTo(fW - o, fW + o);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(hCanvas, 0, 0, hCanvas.width, hCanvas.height, 0, 0, cW, fW);
  ctx.restore();

  // ─── 7. SPODNJA STRANICA (rotirana + zrcaljena) ───
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
  ctx.drawImage(hCanvas, 0, 0, hCanvas.width, hCanvas.height, 0, 0, cW, fW);
  ctx.restore();

  // ─── 7b. Barvno tintanje za New Era okvirje ───
  if (tintColor) {
    // Shrani fotografijo (brez okvirja)
    ctx.save();

    // Ustvari masko ki izloči fotografijo (samo okvir)
    ctx.beginPath();
    ctx.rect(0, 0, cW, cH);
    // Izreži notranjost (fotografijo)
    ctx.moveTo(photoX, photoY);
    ctx.lineTo(photoX, photoY + photoH);
    ctx.lineTo(photoX + photoW, photoY + photoH);
    ctx.lineTo(photoX + photoW, photoY);
    ctx.closePath();
    ctx.clip('evenodd');

    // Overlay pass — ohranja teksturo, dodaja barvo
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = tintColor;
    ctx.fillRect(0, 0, cW, cH);

    // Color pass — nastavlja hue bolj agresivno
    ctx.globalCompositeOperation = 'color';
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = tintColor;
    ctx.fillRect(0, 0, cW, cH);

    ctx.restore();
  }

  // ─── 8. Miter šivi — izriši tanke črte za zapolnitev vrzeli ───
  ctx.save();
  ctx.strokeStyle = tintColor || '#2a2218';
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.5;

  // Zgornji levi šiv
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(fW, fW);
  ctx.stroke();

  // Zgornji desni šiv
  ctx.beginPath();
  ctx.moveTo(cW, 0);
  ctx.lineTo(cW - fW, fW);
  ctx.stroke();

  // Spodnji levi šiv
  ctx.beginPath();
  ctx.moveTo(0, cH);
  ctx.lineTo(fW, cH - fW);
  ctx.stroke();

  // Spodnji desni šiv
  ctx.beginPath();
  ctx.moveTo(cW, cH);
  ctx.lineTo(cW - fW, cH - fW);
  ctx.stroke();

  ctx.restore();

  // ─── 9. Notranja senca (globina okvirja) ───
  const shadowSize = Math.max(6, fW * 0.15);

  // Zgornja notranja senca
  const topGrad = ctx.createLinearGradient(photoX, photoY, photoX, photoY + shadowSize);
  topGrad.addColorStop(0, 'rgba(0,0,0,0.55)');
  topGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(photoX, photoY, photoW, shadowSize);

  // Leva notranja senca
  const leftGrad = ctx.createLinearGradient(photoX, photoY, photoX + shadowSize, photoY);
  leftGrad.addColorStop(0, 'rgba(0,0,0,0.45)');
  leftGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = leftGrad;
  ctx.fillRect(photoX, photoY, shadowSize, photoH);

  // Desna svetloba (svetlejši rob)
  const rightGrad = ctx.createLinearGradient(
    photoX + photoW, photoY,
    photoX + photoW - shadowSize * 0.5, photoY
  );
  rightGrad.addColorStop(0, 'rgba(255,255,255,0.08)');
  rightGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = rightGrad;
  ctx.fillRect(photoX + photoW - shadowSize * 0.5, photoY, shadowSize * 0.5, photoH);

  // Spodnja svetloba
  const bottomGrad = ctx.createLinearGradient(
    photoX, photoY + photoH,
    photoX, photoY + photoH - shadowSize * 0.5
  );
  bottomGrad.addColorStop(0, 'rgba(255,255,255,0.06)');
  bottomGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(photoX, photoY + photoH - shadowSize * 0.5, photoW, shadowSize * 0.5);

  // ─── 10. Zunanji rob okvirja (subtilen temen rob) ───
  ctx.strokeStyle = tintColor ? `${tintColor}88` : 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, cW - 2, cH - 2);
}

/**
 * Izriši napeto platno na podokvir — subtilen 3D efekt.
 * Slika ostane vodoravna, vidna le tanka bela stranica
 * platna na dnu in desni (izometrična projekcija).
 */
function drawStretched(ctx, photoImg, cW, cH) {
  ctx.clearRect(0, 0, cW, cH);

  // Subtilna debelina — samo občutek globine (~2.5%)
  const depth = Math.round(Math.min(cW, cH) * 0.028);

  // Glavna slika zavzame prostor brez robov
  const photoW = cW - depth;
  const photoH = cH - depth;

  // ─── 1. Crop-to-fill parametri ───
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

  // ─── 2. Desna stranica (belo platno) ───
  ctx.fillStyle = '#e0dcd6';
  ctx.beginPath();
  ctx.moveTo(photoW, 0);
  ctx.lineTo(cW, depth);
  ctx.lineTo(cW, cH);
  ctx.lineTo(photoW, photoH);
  ctx.closePath();
  ctx.fill();
  // Gradient za globino — temnejše proti zadaj
  const rGrad = ctx.createLinearGradient(photoW, 0, cW, 0);
  rGrad.addColorStop(0, 'rgba(0,0,0,0.0)');
  rGrad.addColorStop(1, 'rgba(0,0,0,0.12)');
  ctx.fillStyle = rGrad;
  ctx.fill();

  // ─── 3. Spodnja stranica (belo platno, svetlejša) ───
  ctx.fillStyle = '#e8e4de';
  ctx.beginPath();
  ctx.moveTo(0, photoH);
  ctx.lineTo(photoW, photoH);
  ctx.lineTo(cW, cH);
  ctx.lineTo(depth, cH);
  ctx.closePath();
  ctx.fill();
  // Gradient za globino
  const bGrad = ctx.createLinearGradient(0, photoH, 0, cH);
  bGrad.addColorStop(0, 'rgba(0,0,0,0.0)');
  bGrad.addColorStop(1, 'rgba(0,0,0,0.08)');
  ctx.fillStyle = bGrad;
  ctx.fill();

  // ─── 4. Glavna slika (sprednja stran) ───
  ctx.drawImage(photoImg, sx, sy, sw, sh, 0, 0, photoW, photoH);

  // ─── 5. Tanka robna črta med sliko in stranicami ───
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 0.8;
  // Spodnji rob slike
  ctx.beginPath();
  ctx.moveTo(0, photoH);
  ctx.lineTo(photoW, photoH);
  ctx.stroke();
  // Desni rob slike
  ctx.beginPath();
  ctx.moveTo(photoW, 0);
  ctx.lineTo(photoW, photoH);
  ctx.stroke();
  // Diagonala v kotu (desni spodnji)
  ctx.beginPath();
  ctx.moveTo(photoW, photoH);
  ctx.lineTo(cW, cH);
  ctx.stroke();
}

/**
 * Izriši samo fotografijo brez okvirja.
 */
function drawPhotoOnly(ctx, photoImg, cW, cH) {
  ctx.clearRect(0, 0, cW, cH);

  const imgRatio = photoImg.width / photoImg.height;
  const boxRatio = cW / cH;
  let sx = 0, sy = 0, sw = photoImg.width, sh = photoImg.height;
  if (imgRatio > boxRatio) {
    sw = photoImg.height * boxRatio;
    sx = (photoImg.width - sw) / 2;
  } else {
    sh = photoImg.width / boxRatio;
    sy = (photoImg.height - sh) / 2;
  }
  ctx.drawImage(photoImg, sx, sy, sw, sh, 0, 0, cW, cH);
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
  productType, // 'print' | 'stretched' | 'framed'
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
        // Z dekorativnim okvirjem
        const [photoImg, stripImg] = await Promise.all([
          loadImage(image),
          loadImage(frame.stripImage),
        ]);
        drawFrame(ctx, photoImg, stripImg, canvasW, canvasH, frameW, frame.tint || null);
      } else if (isStretched) {
        // Napeto platno na podokvirju (gallery wrap 3D)
        const photoImg = await loadImage(image);
        drawStretched(ctx, photoImg, canvasW, canvasH);
      } else {
        // Samo tisk — ravna slika
        const photoImg = await loadImage(image);
        drawPhotoOnly(ctx, photoImg, canvasW, canvasH);
      }
    } catch (err) {
      console.warn('FramePreview render error:', err);
      try {
        const photoImg = await loadImage(image);
        drawPhotoOnly(ctx, photoImg, canvasW, canvasH);
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
