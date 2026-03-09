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
  // Rahlo razširjena za 2px čez rob okvirja → zapolni anti-aliasing vrzeli
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

  // ─── 8. Kotne zapolnitve — vzorči barvo obraza letvice ───
  // Strip slike imajo prerez profila (svetlo ozadje) na vrhu.
  // Na 45° miter stiku to ozadje postane vidno. Rešitev: vzorčimo
  // barvo iz SPODNJE polovice strip slike (obraz letvice) in
  // prebarvamo kotne trikotnike.
  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = 1;
  sampleCanvas.height = 1;
  const sampleCtx = sampleCanvas.getContext('2d');
  // Vzorčimo iz centra spodnje polovice (zanesljivo obraz letvice)
  const sX = Math.round(stripImg.width * 0.5);
  const sY = Math.round(stripImg.height * 0.7);
  sampleCtx.drawImage(stripImg, sX, sY, 1, 1, 0, 0, 1, 1);
  const px = sampleCtx.getImageData(0, 0, 1, 1).data;
  const faceColor = tintColor || `rgb(${px[0]},${px[1]},${px[2]})`;
  // Temnejša verzija za globlje sence
  const darkFace = `rgb(${Math.round(px[0]*0.4)},${Math.round(px[1]*0.4)},${Math.round(px[2]*0.4)})`;

  // Narišemo zapolnjene kotne trikotnike čez miter stike
  const cornerPad = Math.max(4, fW * 0.18); // širina zapolnitve
  const corners = [
    // [zunanji kot, miter točka, offset smeri]
    { ox: 0, oy: 0, mx: fW, my: fW },           // zgornji levi
    { ox: cW, oy: 0, mx: cW - fW, my: fW },     // zgornji desni
    { ox: 0, oy: cH, mx: fW, my: cH - fW },     // spodnji levi
    { ox: cW, oy: cH, mx: cW - fW, my: cH - fW }, // spodnji desni
  ];

  corners.forEach(({ ox, oy, mx, my }) => {
    ctx.save();
    ctx.fillStyle = faceColor;
    ctx.globalAlpha = 0.85;
    // Trikotnik ki pokrije miter stik: od zunanjega kota do obeh stranic
    const dx = mx - ox;
    const dy = my - oy;
    const len = Math.sqrt(dx * dx + dy * dy);
    const perpX = -dy / len * cornerPad;
    const perpY = dx / len * cornerPad;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(mx + perpX, my + perpY);
    ctx.lineTo(mx - perpX, my - perpY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  // ─── 9. Miter črte — debele, povsem prekrijejo stik ───
  ctx.save();
  ctx.strokeStyle = darkFace;
  ctx.lineWidth = Math.max(3, fW * 0.08);
  ctx.globalAlpha = 0.8;
  corners.forEach(({ ox, oy, mx, my }) => {
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(mx, my);
    ctx.stroke();
  });
  ctx.restore();

  // ─── 10. Temen rabbet trak — zapolni vrzel med okvirjem in sliko ───
  const rabbetW = Math.max(2, fW * 0.06);
  ctx.fillStyle = '#0a0908';
  ctx.fillRect(photoX - 1, photoY - 1, photoW + 2, rabbetW + 1);
  ctx.fillRect(photoX - 1, photoY + photoH - rabbetW, photoW + 2, rabbetW + 1);
  ctx.fillRect(photoX - 1, photoY - 1, rabbetW + 1, photoH + 2);
  ctx.fillRect(photoX + photoW - rabbetW, photoY - 1, rabbetW + 1, photoH + 2);

  // ─── 11. Notranji rob — temna senca za globino ───
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

  // ─── 12. Notranja senca (globina okvirja) ───
  const shadowSize = Math.max(8, fW * 0.22);

  const topGrad = ctx.createLinearGradient(photoX, photoY, photoX, photoY + shadowSize);
  topGrad.addColorStop(0, 'rgba(0,0,0,0.7)');
  topGrad.addColorStop(0.3, 'rgba(0,0,0,0.3)');
  topGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(photoX, photoY, photoW, shadowSize);

  const leftGrad = ctx.createLinearGradient(photoX, photoY, photoX + shadowSize, photoY);
  leftGrad.addColorStop(0, 'rgba(0,0,0,0.6)');
  leftGrad.addColorStop(0.3, 'rgba(0,0,0,0.25)');
  leftGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = leftGrad;
  ctx.fillRect(photoX, photoY, shadowSize, photoH);

  const cornerSize = shadowSize * 0.7;
  const cornerGrad = ctx.createRadialGradient(photoX, photoY, 0, photoX, photoY, cornerSize);
  cornerGrad.addColorStop(0, 'rgba(0,0,0,0.35)');
  cornerGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = cornerGrad;
  ctx.fillRect(photoX, photoY, cornerSize, cornerSize);

  // ─── 13. Zunanji rob ───
  ctx.strokeStyle = tintColor ? `${tintColor}88` : 'rgba(0,0,0,0.55)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0.5, 0.5, cW - 1, cH - 1);
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
