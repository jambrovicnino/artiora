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
const CANVAS_HEIGHT = 900;

// Faktor za boljšo vidnost okvirja v predogledu
const PREVIEW_SCALE = 2.2;

// Razširitev clipping patha za preprečevanje vrzeli (anti-aliasing fix)
const SEAM_OVERLAP = 1.5;

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

  // ─── 8. 3D BEVEL — svetloba zgoraj-levo, senca spodaj-desno ───
  const bevelW = Math.max(2, fW * 0.06);

  // Zunanji rob — svetel highlight na vrhu in levi
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = bevelW;
  // Zgornji zunanji rob
  ctx.beginPath();
  ctx.moveTo(bevelW / 2, bevelW / 2);
  ctx.lineTo(cW - bevelW / 2, bevelW / 2);
  ctx.stroke();
  // Levi zunanji rob
  ctx.beginPath();
  ctx.moveTo(bevelW / 2, bevelW / 2);
  ctx.lineTo(bevelW / 2, cH - bevelW / 2);
  ctx.stroke();
  ctx.restore();

  // Zunanji rob — temna senca na dnu in desni
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = bevelW;
  // Spodnji zunanji rob
  ctx.beginPath();
  ctx.moveTo(bevelW / 2, cH - bevelW / 2);
  ctx.lineTo(cW - bevelW / 2, cH - bevelW / 2);
  ctx.stroke();
  // Desni zunanji rob
  ctx.beginPath();
  ctx.moveTo(cW - bevelW / 2, bevelW / 2);
  ctx.lineTo(cW - bevelW / 2, cH - bevelW / 2);
  ctx.stroke();
  ctx.restore();

  // Notranji rob — obratno (senca na vrhu, svetloba na dnu = konkaven rebate)
  const innerBevel = Math.max(1.5, fW * 0.04);
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = innerBevel;
  // Zgornji notranji rob (senca)
  ctx.beginPath();
  ctx.moveTo(photoX, photoY);
  ctx.lineTo(photoX + photoW, photoY);
  ctx.stroke();
  // Levi notranji rob (senca)
  ctx.beginPath();
  ctx.moveTo(photoX, photoY);
  ctx.lineTo(photoX, photoY + photoH);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = innerBevel;
  // Spodnji notranji rob (svetloba)
  ctx.beginPath();
  ctx.moveTo(photoX, photoY + photoH);
  ctx.lineTo(photoX + photoW, photoY + photoH);
  ctx.stroke();
  // Desni notranji rob (svetloba)
  ctx.beginPath();
  ctx.moveTo(photoX + photoW, photoY);
  ctx.lineTo(photoX + photoW, photoY + photoH);
  ctx.stroke();
  ctx.restore();

  // ─── 9. Miter šivi — dvojna črta za realističen stik ───
  ctx.save();
  // Temna miter črta
  ctx.strokeStyle = tintColor || '#1a1610';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.6;

  const miterLines = [
    [0, 0, fW, fW],         // zgornji levi
    [cW, 0, cW - fW, fW],   // zgornji desni
    [0, cH, fW, cH - fW],   // spodnji levi
    [cW, cH, cW - fW, cH - fW], // spodnji desni
  ];

  miterLines.forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });

  // Svetla miter črta (offset za 3D efekt)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.12;

  miterLines.forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1 + 1.5, y1 + 1.5);
    ctx.lineTo(x2 + 1, y2 + 1);
    ctx.stroke();
  });
  ctx.restore();

  // ─── 10. Notranja senca (globina okvirja — rabbet) ───
  const shadowSize = Math.max(8, fW * 0.2);

  // Zgornja notranja senca (najmočnejša)
  const topGrad = ctx.createLinearGradient(photoX, photoY, photoX, photoY + shadowSize);
  topGrad.addColorStop(0, 'rgba(0,0,0,0.65)');
  topGrad.addColorStop(0.4, 'rgba(0,0,0,0.25)');
  topGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(photoX, photoY, photoW, shadowSize);

  // Leva notranja senca
  const leftGrad = ctx.createLinearGradient(photoX, photoY, photoX + shadowSize, photoY);
  leftGrad.addColorStop(0, 'rgba(0,0,0,0.55)');
  leftGrad.addColorStop(0.4, 'rgba(0,0,0,0.2)');
  leftGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = leftGrad;
  ctx.fillRect(photoX, photoY, shadowSize, photoH);

  // Zgornji-levi kot — dodatna senca (najgloblje)
  const cornerSize = shadowSize * 0.7;
  const cornerGrad = ctx.createRadialGradient(
    photoX, photoY, 0,
    photoX, photoY, cornerSize
  );
  cornerGrad.addColorStop(0, 'rgba(0,0,0,0.3)');
  cornerGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = cornerGrad;
  ctx.fillRect(photoX, photoY, cornerSize, cornerSize);

  // Desna svetloba (svetlejši rob — svetloba od desno-spodaj)
  const rightGrad = ctx.createLinearGradient(
    photoX + photoW, photoY,
    photoX + photoW - shadowSize * 0.6, photoY
  );
  rightGrad.addColorStop(0, 'rgba(255,255,255,0.1)');
  rightGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = rightGrad;
  ctx.fillRect(photoX + photoW - shadowSize * 0.6, photoY, shadowSize * 0.6, photoH);

  // Spodnja svetloba
  const bottomGrad = ctx.createLinearGradient(
    photoX, photoY + photoH,
    photoX, photoY + photoH - shadowSize * 0.6
  );
  bottomGrad.addColorStop(0, 'rgba(255,255,255,0.08)');
  bottomGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(photoX, photoY + photoH - shadowSize * 0.6, photoW, shadowSize * 0.6);

  // ─── 11. Zunanji rob (dvojni za 3D občutek) ───
  // Temen zunanji rob
  ctx.strokeStyle = tintColor ? `${tintColor}66` : 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0.5, 0.5, cW - 1, cH - 1);
  // Notranji svetel rob (za bevel)
  ctx.strokeStyle = tintColor ? `${tintColor}22` : 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.strokeRect(2, 2, cW - 4, cH - 4);
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

// ═══════════════════════════════════════════════
// KOMPONENTA
// ═══════════════════════════════════════════════
export default function FramePreview({
  image,
  selectedFrame,
  selectedSize,
  sizeId,
  withFrame,
  productType, // 'stretched' | 'framed'
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
      } else {
        // Napeto platno na podokvirju (gallery wrap 3D)
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
