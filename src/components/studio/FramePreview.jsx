import { useRef, useEffect, useCallback } from 'react';
import { frameStyles } from '../../data/frameOptions';
import './FramePreview.css';

// ═══════════════════════════════════════════════
// ARTIORA — Canvas-Based Frame Preview
//
// Renderira realistične okvirje z dejanskimi
// strip teksturami iz Vidal kataloga.
// Koti so pravilni 45° miter stiki (trapezoidni
// clipping pathi na Canvas elementu).
//
// KOTNA KOREKCIJA: Strip slike imajo na vrhu
// svetlejši "backing" (MDF presek). Pri visoko-
// kontrastnih okvirjih se backing vidi na kotih.
// Rešitev: drawImage source-crop preskoči backing
// zono — tekstura ohranjena, samo izvor zamaknjen.
// Za ornamentne okvirje (nizek kontrast): BREZ
// kakršnekoli modifikacije — polna originalna
// tekstura.
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
 * Analizira strip sliko in vrne:
 *   - barvo obraza (faceR/G/B)
 *   - kontrast med backing-om in obrazom
 *   - faceStartPct: adaptivno zaznano mesto, kjer se backing konča
 *
 * Za visoko-kontrastne okvirje (contrast > 80) skenira vrstice
 * od vrha navzdol in poišče prehod backing → obraz. Za nizko-
 * kontrastne (ornamentne) okvirje vrne faceStartPct = 0 (brez cropa).
 *
 * NE modificira slike — samo vzorči barve.
 */
function analyzeStrip(stripImg) {
  const sc = document.createElement('canvas');
  sc.width = stripImg.width;
  sc.height = stripImg.height;
  const sctx = sc.getContext('2d');
  sctx.drawImage(stripImg, 0, 0);

  const w = stripImg.width, h = stripImg.height;

  function sampleRow(yPx) {
    const y = Math.max(0, Math.min(Math.round(yPx), h - 1));
    const data = sctx.getImageData(0, y, w, 1).data;
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
    }
    return { r: r / n, g: g / n, b: b / n };
  }

  function colorDist(a, b) {
    return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
  }

  // Barva obraza iz stabilne sredine strip-a
  const face1 = sampleRow(h * 0.50);
  const face2 = sampleRow(h * 0.65);
  const face = {
    r: (face1.r + face2.r) / 2,
    g: (face1.g + face2.g) / 2,
    b: (face1.b + face2.b) / 2,
  };
  const fR = Math.round(face.r);
  const fG = Math.round(face.g);
  const fB = Math.round(face.b);

  // Barva backing-a (vrh strip-a)
  const topColor = sampleRow(h * 0.03);
  const contrast = colorDist(topColor, face);

  // ─── Adaptivno zaznavanje konca backing zone ───
  // Skeniramo vrstice od vrha (5%) do 45% in iščemo prvo,
  // ki je dovolj blizu barvi obraza.
  let faceStartPct = 0;
  if (contrast > 80) {
    const threshold = Math.max(25, contrast * 0.25);
    const step = Math.max(1, Math.round(h * 0.01));
    for (let y = Math.round(h * 0.05); y < Math.round(h * 0.45); y += step) {
      const row = sampleRow(y);
      if (colorDist(row, face) < threshold) {
        faceStartPct = y / h;
        break;
      }
    }
    // Varnostna rezerva + minimalni crop
    faceStartPct = Math.max(faceStartPct + 0.03, 0.05);
    faceStartPct = Math.min(faceStartPct, 0.40); // Max 40% crop
  }

  return { faceR: fR, faceG: fG, faceB: fB, contrast, faceStartPct };
}

/**
 * Izriši okvir z dejansko strip teksturo.
 *
 * KLJUČNA TEHNIKA — SOURCE-CROP CORNER FIX:
 * Strip slike imajo na vrhu ~18% svetlejši backing (MDF presek).
 * Pri 45° miter stikih se ta backing vidi na kotih okvirja.
 *
 * Za visoko-kontrastne okvirje (budget, contrast > 80):
 *   drawImage() preskoči backing zono — source rect se začne
 *   pri adaptivno zaznanem mestu (15–37% odvisno od stripa).
 *   Vsak strip dobi natanko pravi crop avtomatsko.
 *   Tekstura se minimalno raztegne, kar je na ravnih/
 *   enostavnih budget teksturah popolnoma neopazno.
 *
 * Za nizko-kontrastne okvirje (ornamentni, contrast ≤ 80):
 *   BREZ kakršnekoli modifikacije — polna originalna tekstura.
 *   Backing je pri teh okvirjih podobne barve kot obraz,
 *   zato koti izgledajo naravno brez popravkov.
 */
function drawFrame(ctx, photoImg, stripImg, cW, cH, fW, tintColor) {
  ctx.clearRect(0, 0, cW, cH);

  const photoX = fW;
  const photoY = fW;
  const photoW = cW - 2 * fW;
  const photoH = cH - 2 * fW;

  // ─── 0. Analiza strip za adaptivno kotno korekcijo ───
  const { faceR, faceG, faceB, contrast, faceStartPct } = analyzeStrip(stripImg);

  // Visok kontrast → adaptivni source-crop preskoči backing zono
  // Nizek kontrast → polna originalna tekstura (0% crop)
  // faceStartPct je adaptivno zaznan iz dejanskega strip-a
  const needsCrop = contrast > 80;
  const sW = stripImg.width;
  const sH = stripImg.height;
  const skipTopPx = needsCrop ? Math.round(sH * faceStartPct) : 0;
  const skipBotPx = needsCrop ? Math.round(sH * 0.02) : 0;
  const srcH = sH - skipTopPx - skipBotPx;

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

  // ─── 3. Priprava horizontalne strip teksture ───
  // Originalna strip je vertikalna; ustvarimo rotirano verzijo za top/bottom
  const hCanvas = document.createElement('canvas');
  hCanvas.width = stripImg.height;
  hCanvas.height = stripImg.width;
  const hCtx = hCanvas.getContext('2d');
  hCtx.translate(0, stripImg.width);
  hCtx.rotate(-Math.PI / 2);
  hCtx.drawImage(stripImg, 0, 0);

  // Horizontalni crop parametri (rotacija zamenja osi):
  // strip Y-os (vrh=backing) → hCanvas X-os (levo=backing)
  const hW = hCanvas.width;
  const hH = hCanvas.height;
  const hSkipLeft = skipTopPx;   // strip vrh → hCanvas levo
  const hSkipRight = skipBotPx;  // strip dno → hCanvas desno
  const hSrcW = hW - hSkipLeft - hSkipRight;

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
  ctx.drawImage(stripImg, 0, skipTopPx, sW, srcH, 0, 0, fW, cH);
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
  ctx.drawImage(stripImg, 0, skipTopPx, sW, srcH, 0, 0, fW, cH);
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
  ctx.drawImage(hCanvas, hSkipLeft, 0, hSrcW, hH, 0, 0, cW, fW);
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
  ctx.drawImage(hCanvas, hSkipLeft, 0, hSrcW, hH, 0, 0, cW, fW);
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
  const darkR = Math.round(faceR * 0.3);
  const darkG = Math.round(faceG * 0.3);
  const darkB = Math.round(faceB * 0.3);

  ctx.save();
  ctx.strokeStyle = `rgb(${darkR},${darkG},${darkB})`;
  ctx.lineWidth = Math.max(1, fW * 0.025);
  ctx.globalAlpha = 0.35;
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

  // ─── 10. Rabbet trak ───
  const rabbetW = Math.max(2, fW * 0.06);
  ctx.fillStyle = '#0a0908';
  ctx.fillRect(photoX - 1, photoY - 1, photoW + 2, rabbetW + 1);
  ctx.fillRect(photoX - 1, photoY + photoH - rabbetW, photoW + 2, rabbetW + 1);
  ctx.fillRect(photoX - 1, photoY - 1, rabbetW + 1, photoH + 2);
  ctx.fillRect(photoX + photoW - rabbetW, photoY - 1, rabbetW + 1, photoH + 2);

  // ─── 11. Notranji rob ───
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

  // ─── 12. Notranja senca ───
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

  // ─── 13. Zunanji rob ───
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
