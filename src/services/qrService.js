// ═══════════════════════════════════════════════
// ARTIORA — QR Code Generator Service
//
// Canvas-based QR-like visual generator.
// No npm dependencies — pure Canvas API.
// Deterministic: same input text → same pattern.
// ═══════════════════════════════════════════════

/**
 * Simple deterministic hash function.
 * Converts any string into a stable positive integer.
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Seeded pseudo-random number generator (Mulberry32).
 * Returns a function that yields deterministic floats in [0, 1).
 */
function seededRandom(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Draw a position marker (the big square-in-square pattern found
 * in the three corners of a real QR code).
 *
 * @param {boolean[][]} grid — mutable NxN grid
 * @param {number} startRow
 * @param {number} startCol
 */
function drawPositionMarker(grid, startRow, startCol) {
  const size = 7;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Outer border ring
      const isOuterBorder =
        r === 0 || r === size - 1 || c === 0 || c === size - 1;
      // Inner solid 3x3 block
      const isInnerBlock = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      // Middle ring (row/col == 1 or 5) is empty
      grid[startRow + r][startCol + c] = isOuterBorder || isInnerBlock;
    }
  }
}

/**
 * Draw alignment pattern (smaller marker, 5x5).
 */
function drawAlignmentPattern(grid, centerRow, centerCol) {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const row = centerRow + r;
      const col = centerCol + c;
      if (row < 0 || col < 0 || row >= grid.length || col >= grid[0].length) continue;
      const isOuter = Math.abs(r) === 2 || Math.abs(c) === 2;
      const isCenter = r === 0 && c === 0;
      grid[row][col] = isOuter || isCenter;
    }
  }
}

/**
 * Build the NxN boolean grid that represents the QR-like pattern.
 *
 * @param {string} text — input text to encode visually
 * @param {number} n — grid dimension (default 25, like QR Version 2)
 * @returns {boolean[][]}
 */
function buildGrid(text, n = 25) {
  const grid = Array.from({ length: n }, () => Array(n).fill(false));
  const reserved = Array.from({ length: n }, () => Array(n).fill(false));

  // ── Position markers (3 corners) ──────────────────────
  drawPositionMarker(grid, 0, 0);           // top-left
  drawPositionMarker(grid, 0, n - 7);       // top-right
  drawPositionMarker(grid, n - 7, 0);       // bottom-left

  // Mark position marker zones + separators as reserved
  const markerZones = [
    [0, 0],
    [0, n - 8],
    [n - 8, 0],
  ];
  for (const [sr, sc] of markerZones) {
    for (let r = sr; r < sr + 8 && r < n; r++) {
      for (let c = sc; c < sc + 8 && c < n; c++) {
        reserved[r][c] = true;
      }
    }
  }

  // ── Timing patterns (horizontal + vertical lines) ─────
  for (let i = 8; i < n - 8; i++) {
    const val = i % 2 === 0;
    grid[6][i] = val;
    reserved[6][i] = true;
    grid[i][6] = val;
    reserved[i][6] = true;
  }

  // ── Alignment pattern ─────────────────────────────────
  if (n >= 25) {
    drawAlignmentPattern(grid, n - 9, n - 9);
    for (let r = n - 11; r <= n - 7; r++) {
      for (let c = n - 11; c <= n - 7; c++) {
        if (r >= 0 && c >= 0 && r < n && c < n) reserved[r][c] = true;
      }
    }
  }

  // ── Data area: fill with deterministic pseudo-random ──
  const hash = simpleHash(text);
  const rand = seededRandom(hash);

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!reserved[r][c]) {
        // Skip cells already set by position markers
        if (
          (r < 7 && c < 7) ||
          (r < 7 && c >= n - 7) ||
          (r >= n - 7 && c < 7)
        ) continue;

        grid[r][c] = rand() > 0.5;
      }
    }
  }

  return grid;
}

/**
 * Generate a stylized QR-like visual using the Canvas API.
 *
 * @param {string} text — the text to encode (typically a URL or certificate ID)
 * @param {number} size — output image size in pixels (default 200)
 * @returns {Promise<string>} — a data URL (base64 PNG)
 */
export async function generateQRCode(text, size = 200) {
  const n = 25; // grid dimension
  const grid = buildGrid(text, n);

  const canvas = document.createElement('canvas');
  const padding = Math.round(size * 0.08);
  const brandHeight = Math.round(size * 0.1);
  const qrArea = size - padding * 2;
  const totalHeight = size + brandHeight;

  canvas.width = size;
  canvas.height = totalHeight;

  const ctx = canvas.getContext('2d');

  // ── Background ────────────────────────────────────────
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, size, totalHeight);

  // ── Draw QR modules ───────────────────────────────────
  const cellSize = qrArea / n;
  const darkColor = '#c9a84c'; // gold
  const lightColor = '#0a0a0a'; // match bg

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const x = padding + c * cellSize;
      const y = padding + r * cellSize;

      if (grid[r][c]) {
        ctx.fillStyle = darkColor;
        // Slightly rounded modules for premium feel
        const inset = cellSize * 0.05;
        ctx.beginPath();
        ctx.roundRect(x + inset, y + inset, cellSize - inset * 2, cellSize - inset * 2, cellSize * 0.15);
        ctx.fill();
      } else {
        ctx.fillStyle = lightColor;
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
  }

  // ── Subtle gold border around QR area ─────────────────
  ctx.strokeStyle = 'rgba(201, 168, 76, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(padding - 2, padding - 2, qrArea + 4, qrArea + 4);

  // ── Brand text: "ARTIORA" ─────────────────────────────
  const fontSize = Math.round(size * 0.055);
  ctx.fillStyle = '#c9a84c';
  ctx.font = `600 ${fontSize}px "Inter", "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = `${fontSize * 0.3}px`;
  ctx.fillText('ARTIORA', size / 2, size + brandHeight / 2);

  return canvas.toDataURL('image/png');
}

export default { generateQRCode };
