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
// Strip slike imajo na vrhu svetel prerez profila (backing).
// prepareCleanStrip() ta del zamenja z barvo obraza letvice,
// kar odpravi artefakte na kotih pri VSEH okvirjih.
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
 * Pripravi "čisto" strip teksturo brez svetlega ozadja (backing).
 *
 * Strip slike iz Vidal kataloga imajo tipično strukturo:
 *   TOP  (0–18%):  svetel prerez profila / backing (les/bež)
 *   FACE (18–88%): obraz letvice — to želimo prikazati
 *   BTM  (88–100%): senca / podrez
 *
 * Pri 45° miter stiku na canvas-u se prikaže le zgornjih ~5%
 * strip slike v kotnem trikotniku → svetel backing postane viden.
 *
 * Rešitev: vzorčimo PRAVO barvo obraza (povprečje treh vrstic
 * na 50%, 60%, 70% višine) in z njo zapolnimo zgornjih 20%
 * + spodnjih 12%, z gladkim prehodom v originalno teksturo.
 *
 * Rezultat: strip slike, ki na VSAKEM mestu kaže barvo obraza,
 * brez vidnih kotnih artefaktov.
 */
function prepareCleanStrip(stripImg) {
  const w = stripImg.width;
  const h = stripImg.height;
  const sc = document.createElement('canvas');
  sc.width = w;
  sc.height = h;
  const sctx = sc.getContext('2d');

  // Narišemo originalno strip sliko
  sctx.drawImage(stripImg, 0, 0);

  // ─── Vzorčenje barve obraza (robustno povprečje) ───
  // Vzamemo 3 celotne horizontalne vrstice iz srca obraza
  // in povprečimo VSE piksle → zanesljiva barva obraza
  let totalR = 0, totalG = 0, totalB = 0, count = 0;
  for (const pct of [0.50, 0.60, 0.70]) {
    const row = Math.round(h * pct);
    const rowData = sctx.getImageData(0, row, w, 1).data;
    for (let i = 0; i < rowData.length; i += 4) {
      totalR += rowData[i];
      totalG += rowData[i + 1];
      totalB += rowData[i + 2];
      count++;
    }
  }
  const fR = Math.round(totalR / count);
  const fG = Math.round(totalG / count);
  const fB = Math.round(totalB / count);
  const faceCSS = `rgb(${fR},${fG},${fB})`;

  // ─── Zamenjava zgornjega backing-a (0–20%) ───
  const backingEnd = Math.round(h * 0.20);
  const blendH = Math.round(h * 0.08);

  // Solidna barva obraza čez backing
  sctx.fillStyle = faceCSS;
  sctx.fillRect(0, 0, w, backingEnd);

  // Gladek prehod v originalno teksturo
  const topGrad = sctx.createLinearGradient(0, backingEnd, 0, backingEnd + blendH);
  topGrad.addColorStop(0, faceCSS);
  topGrad.addColorStop(1, `rgba(${fR},${fG},${fB},0)`);
  sctx.fillStyle = topGrad;
  sctx.fillRect(0, backingEnd, w, blendH);

  // ─── Zamenjava spodnje sence/podreza (88–100%) ───
  const bottomStart = Math.round(h * 0.88);
  const bBlendH = Math.round(h * 0.06);

  sctx.fillStyle = faceCSS;
  sctx.fillRect(0, bottomStart, w, h - bottomStart);

  const btmGrad = sctx.createLinearGradient(0, bottomStart - bBlendH, 0, bottomStart);
  btmGrad.addColorStop(0, `rgba(${fR},${fG},${fB},0)`);
  btmGrad.addColorStop(1, faceCSS);
  sctx.fillStyle = btmGrad;
  sctx.fillRect(0, bottomStart - bBlendH, w, bBlendH);

  return { canvas: sc, faceR: fR, faceG: fG, faceB: fB };
}

/**
 * Izriši okvir z dejansko strip teksturo.
 *
 * Uporablja prepareCleanStrip() za čiste strip slike brez backing-a,
 * nato izriše 4 stranice s trapezoidnimi clip pathi in 45° miter stiki.
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
  // Crop-to-fill + rahla razširitev čez rob (anti-aliasing fix)
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

  // ─── 3. Priprava čistih strip tekstur ───
  const { canvas: cleanStrip, faceR, faceG, faceB } = prepareCleanStrip(stripImg);

  // Rotirana verzija za horizontalni stranici (top/bottom)
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

  // ─── 6. ZGORNJA STRANICA (rotirana tekstura) ───
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
  ctx.drawImage(hStrip, 0, 0, hStrip.width, hStrip.height, 0, 0, cW, fW);
  ctx.restore();

  // ─── 8. Barvno tintanje za New Era okvirje ───
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

  // ─── 9. Subtilne miter črte ───
  // Tanke, temne črte na 45° stiku za realistično videz kota
  const darkR = Math.round(faceR * 0.25);
  const darkG = Math.round(faceG * 0.25);
  const darkB = Math.round(faceB * 0.25);
  const miterColor = `rgb(${darkR},${darkG},${darkB})`;

  ctx.save();
  ctx.strokeStyle = miterColor;
  ctx.lineWidth = Math.max(1.5, fW * 0.035);
  ctx.globalAlpha = 0.5;
  const miterCorners = [
    [0, 0, fW, fW],
    [cW, 0, cW - fW, fW],
    [0, cH, fW, cH - fW],
    [cW, cH, cW - fW, cH - fW],
  ];
  miterCorners.forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });
  ctx.restore();

  // ─── 10. Temen rabbet trak ───
  // Zapolni vrzel med okvirjem in sliko (temna notranja letvica)
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

  // Radial corner shadow (zgornji levi kot slike)
  const cRad = shadowSize * 0.7;
  const cShadow = ctx.createRadialGradient(photoX, photoY, 0, photoX, photoY, cRad);
  cShadow.addColorStop(0, 'rgba(0,0,0,0.35)');
  cShadow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = cShadow;
  ctx.fillRect(photoX, photoY, cRad, cRad);

  // ─── 13. Zunanji rob ───
  ctx.strokeStyle = tintColor ? `${tintColor}88` : 'rgba(0,0,0,0.55)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0.5, 0.5, cW - 1, cH - 1);

  // ─── 14. 3D zunanji bevel (subtilen) ───
  // Svetla črta na zgornjem + levem robu, temna na spodnjem + desnem
  ctx.save();
  ctx.lineWidth = 1;
  // Svetla stran (zgoraj + levo)
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.beginPath();
  ctx.moveTo(1, cH - 1);
  ctx.lineTo(1, 1);
  ctx.lineTo(cW - 1, 1);
  ctx.stroke();
  // Temna stran (spodaj + desno)
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.moveTo(cW - 1, 1);
  ctx.lineTo(cW - 1, cH - 1);
  ctx.lineTo(1, cH - 1);
  ctx.stroke();
  ctx.restore();
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
