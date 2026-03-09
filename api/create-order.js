// ═══════════════════════════════════════════════
// ETERNA Artisan — Order Processing (Vercel Serverless)
//
// 1. Shrani originalno sliko v Vercel Blob
// 2. Pripravi print-ready datoteko (Sharp resize + bleed)
// 3. Pošlje admin email z Resend (z download linki)
// 4. Pošlje potrditev stranki z Resend
// Fallback: če servisi niso konfigurirani, logira v konzolo
// ═══════════════════════════════════════════════

import { Resend } from 'resend';
import { put } from '@vercel/blob';

// Sharp: dinamičen import ker ni vedno na voljo
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.warn('[ETERNA] Sharp ni na voljo — print prep preskočen');
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '12mb',
    },
  },
  maxDuration: 60, // 60s za fetch slik iz Blob + Sharp processing
};

const ADMIN_EMAIL = 'psn.nino4@gmail.com';
const FROM_EMAIL = 'ETERNA Artisan <onboarding@resend.dev>';

// ─── Print dimensions (px pri 300 DPI + 3mm bleed) ───
const PRINT_SIZES = {
  '30x40': { w: 3543, h: 4724 },
  '40x50': { w: 4724, h: 5906 },
  '45x60': { w: 5315, h: 7087 },
  '50x70': { w: 5906, h: 8268 },
  '60x90': { w: 7087, h: 10630 },
  '76x102': { w: 8976, h: 12047 },
};
const BLEED_PX = 35; // 3mm pri 300 DPI

/**
 * Pripravi print-ready datoteko:
 * - Resize na točne dimenzije za 300 DPI
 * - Dodaj 3mm bleed (razširitev robov)
 * - Pretvori v CMYK barvni prostor
 * - Output: TIFF 300 DPI (LZW kompresija)
 *
 * CMYK je industrijski standard za tisk na platno.
 * Če Sharp ne podpira CMYK, fallback na RGB TIFF.
 */
async function preparePrintFile(imageBuffer, sizeId) {
  if (!sharp) return null;

  const target = PRINT_SIZES[sizeId];
  if (!target) return null;

  const finalW = target.w + BLEED_PX * 2;
  const finalH = target.h + BLEED_PX * 2;

  // Resize sliko na ciljne dimenzije (brez bleeda)
  const resized = await sharp(imageBuffer)
    .resize(target.w, target.h, {
      fit: 'cover',
      position: 'centre',
      kernel: 'lanczos3', // Najboljši algoritem za upscaling
    })
    .png({ quality: 100 })
    .toBuffer();

  // Dodaj bleed: razširi robove slike
  const withBleed = await sharp(resized)
    .extend({
      top: BLEED_PX,
      bottom: BLEED_PX,
      left: BLEED_PX,
      right: BLEED_PX,
      extendWith: 'mirror', // Zrcali robove za naravni bleed
    });

  // Pretvori v CMYK TIFF za profesionalni tisk
  let printBuffer;
  let colorSpace = 'cmyk';
  try {
    printBuffer = await withBleed
      .toColourspace('cmyk')
      .withMetadata({ density: 300 })
      .tiff({ compression: 'lzw', quality: 100 })
      .toBuffer();
    console.log(`[ETERNA] CMYK TIFF: ${(printBuffer.length / 1024 / 1024).toFixed(1)} MB`);
  } catch (cmykErr) {
    // Fallback: RGB TIFF če CMYK ni podprt
    console.warn('[ETERNA] CMYK ni podprt, fallback na RGB TIFF:', cmykErr.message);
    colorSpace = 'srgb';
    printBuffer = await withBleed
      .withMetadata({ density: 300 })
      .tiff({ compression: 'lzw', quality: 100 })
      .toBuffer();
  }

  return {
    buffer: printBuffer,
    width: finalW,
    height: finalH,
    sizeLabel: sizeId,
    format: 'tiff',
    colorSpace,
  };
}

/**
 * Oblikuj HTML email za admina z vsemi podatki naročila.
 */
function buildAdminEmailHtml(order) {
  const itemRows = order.items.map((item, i) => {
    const hangingNote = item.hangingIncluded
      ? `<br><span style="color:#10b981;font-size:12px">Obešanje: ${item.hangingIncluded}</span>`
      : '';

    return `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${i + 1}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${item.enhancement || 'Brez'}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${item.sizeLabel || item.size}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">
        ${item.productType === 'framed' ? `Z okvirjem (${item.frameLabel})` : item.productType === 'stretched' ? 'S podokvirjem' : 'Samo tisk'}
        ${item.withImpasto ? ' + Impasto' : ''}
        ${hangingNote}
      </td>
      <td style="padding:8px;border-bottom:1px solid #eee">${item.dedication || '—'}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">${item.price} €</td>
    </tr>`;
  }).join('');

  // Inline image previews for admin
  const imagePreviewBlocks = order.items
    .filter((item) => item.imageUrl)
    .map((item, i) => `
      <div style="text-align:center;margin:15px 0">
        <img src="${item.imageUrl}" alt="Originalna slika ${i + 1}"
             style="max-width:100%;max-height:500px;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.12);border:1px solid #eee" />
        <p style="color:#888;font-size:12px;margin:6px 0 0">
          ${item.sizeLabel || item.size} — originalna slika (polna resolucija)
        </p>
      </div>
    `).join('');

  // File download links
  const downloadLinks = [];
  order.items.forEach((item, i) => {
    if (item.imageUrl) {
      downloadLinks.push(`<a href="${item.imageUrl}" style="color:#8b5cf6;text-decoration:none;display:inline-block;padding:6px 14px;border:1px solid #8b5cf6;border-radius:6px;margin:4px">Originalna slika ${i + 1}</a>`);
    }
    if (item.printFileUrl) {
      downloadLinks.push(`<a href="${item.printFileUrl}" style="color:white;background:#8b5cf6;text-decoration:none;display:inline-block;padding:6px 14px;border-radius:6px;margin:4px;font-weight:600">PRINT-READY TIFF ${i + 1} (${item.printDims})</a>`);
    }
  });

  const printSpecsRow = order.items[0]?.printSpecs
    ? `<p style="color:#666;font-size:13px">
        Zahteve tiska: ${order.items[0].printSpecs.dpi} DPI, ${order.items[0].printSpecs.colorSpace},
        ${order.items[0].printSpecs.widthPx}×${order.items[0].printSpecs.heightPx}px,
        odmik ${order.items[0].printSpecs.bleed}
       </p>`
    : '';

  return `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#8b5cf6,#ec4899);padding:20px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:22px">ETERNA Artisan — Novo Naročilo</h1>
        <p style="color:rgba(255,255,255,0.85);margin:5px 0 0;font-size:14px">${order.orderId} • ${order.date}</p>
      </div>

      <div style="border:1px solid #eee;border-top:none;padding:20px;border-radius:0 0 12px 12px">
        <h2 style="font-size:16px;color:#333;margin-top:0">Stranka</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <tr><td style="padding:4px 8px;color:#666;width:120px">Ime:</td><td style="padding:4px 8px;font-weight:500">${order.customer.name}</td></tr>
          <tr><td style="padding:4px 8px;color:#666">Email:</td><td style="padding:4px 8px"><a href="mailto:${order.customer.email}">${order.customer.email}</a></td></tr>
          <tr><td style="padding:4px 8px;color:#666">Telefon:</td><td style="padding:4px 8px">${order.customer.phone}</td></tr>
          <tr><td style="padding:4px 8px;color:#666">Naslov:</td><td style="padding:4px 8px">${order.customer.address}</td></tr>
          ${order.customer.note ? `<tr><td style="padding:4px 8px;color:#666">Opomba:</td><td style="padding:4px 8px;font-style:italic">${order.customer.note}</td></tr>` : ''}
        </table>

        <h2 style="font-size:16px;color:#333">Izdelki</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:15px;font-size:14px">
          <thead>
            <tr style="background:#f8f8f8">
              <th style="padding:8px;text-align:left">#</th>
              <th style="padding:8px;text-align:left">Tip</th>
              <th style="padding:8px;text-align:left">Velikost</th>
              <th style="padding:8px;text-align:left">Izdelek</th>
              <th style="padding:8px;text-align:left">Posvetilo</th>
              <th style="padding:8px;text-align:left">Cena</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        ${printSpecsRow}

        ${imagePreviewBlocks ? `
        <div style="background:#f8f5ff;padding:20px;border-radius:10px;margin-top:15px;border:1px solid #e9e0ff">
          <h3 style="margin:0 0 10px;font-size:14px;color:#5b21b6;text-align:center">Predogled originalne slike</h3>
          ${imagePreviewBlocks}
        </div>` : ''}

        ${downloadLinks.length > 0 ? `
        <div style="background:#f0e7ff;padding:15px;border-radius:8px;margin-top:15px">
          <h3 style="margin:0 0 10px;font-size:14px;color:#5b21b6">Datoteke za prenos</h3>
          ${downloadLinks.join('\n')}
        </div>` : ''}

        <div style="background:#f8f8f8;padding:15px;border-radius:8px;text-align:right;margin-top:15px">
          <span style="font-size:18px;font-weight:700;color:#333">Skupaj: ${order.total} €</span>
          <span style="font-size:12px;color:#666;display:block">z DDV</span>
        </div>

        ${order.qualityNotes ? `
        <div style="background:#fef3c7;padding:12px;border-radius:8px;margin-top:15px;font-size:13px">
          <strong>Opozorilo o kvaliteti:</strong> ${order.qualityNotes}
        </div>` : ''}

        ${(() => {
          const costRows = order.items
            .map((item, i) => item.costBreakdown ? { idx: i + 1, cb: item.costBreakdown, item } : null)
            .filter(Boolean);
          if (costRows.length === 0) return '';
          return `
          <div style="background:#fef9e7;border:2px dashed #d4a017;padding:20px;border-radius:10px;margin-top:20px">
            <h3 style="margin:0 0 4px;font-size:14px;color:#92400e">🔒 INTERNI PODATKI — Stroški izdelave</h3>
            <p style="color:#a16207;font-size:11px;margin:0 0 15px;font-style:italic">Vidno samo adminu, stranka tega ne vidi.</p>
            ${costRows.map(({ idx, cb, item }) => `
              <div style="background:white;padding:14px;border-radius:8px;margin-bottom:12px;border:1px solid #fde68a">
                <h4 style="margin:0 0 10px;font-size:13px;color:#333">Izdelek ${idx}: ${item.sizeLabel || item.size}</h4>
                <table style="width:100%;border-collapse:collapse;font-size:12px;color:#555">
                  <tr><td style="padding:3px 6px">Platno (25€/m², marža 60%):</td><td style="padding:3px 6px;text-align:right;font-weight:600">${cb.wholesaleCanvas.toFixed(2)} €</td></tr>
                  ${cb.wholesaleStretcher > 0 ? `<tr><td style="padding:3px 6px">Podokvir+napenjanje (marža ${cb.stretcherMarkup ? Math.round((cb.stretcherMarkup - 1) * 100) : 30}%):</td><td style="padding:3px 6px;text-align:right;font-weight:600">${cb.wholesaleStretcher.toFixed(2)} €</td></tr>` : ''}
                  ${cb.wholesaleFrame > 0 ? `
                  <tr><td style="padding:3px 6px">Okvir: ${cb.frameLabel || '—'}</td><td style="padding:3px 6px;text-align:right;font-weight:600">${cb.wholesaleFrame.toFixed(2)} €</td></tr>
                  <tr><td style="padding:3px 6px;color:#888;font-size:11px">&nbsp;&nbsp;(${cb.framePricePerTm.toFixed(2)} €/tm × ${cb.framePerimeterM.toFixed(2)} m)</td><td></td></tr>` : ''}
                  ${cb.laborCost > 0 ? `<tr><td style="padding:3px 6px">Delo (okvirjanje):</td><td style="padding:3px 6px;text-align:right;font-weight:600">${cb.laborCost.toFixed(2)} €</td></tr>` : ''}
                  <tr style="border-top:1px solid #e5e7eb"><td style="padding:6px 6px 3px;font-weight:700;color:#333">Nabava skupaj:</td><td style="padding:6px 6px 3px;text-align:right;font-weight:700;color:#333">${cb.totalWholesale.toFixed(2)} €</td></tr>
                  <tr><td style="padding:3px 6px;color:#888">Marža (×${cb.markupFactor}):</td><td style="padding:3px 6px;text-align:right;color:#888">${(cb.totalWholesale * cb.markupFactor).toFixed(2)} €</td></tr>
                  <tr><td style="padding:3px 6px;color:#888">DDV (${(cb.ddvRate * 100).toFixed(0)}%):</td><td style="padding:3px 6px;text-align:right;color:#888">${cb.ddvAmount.toFixed(2)} €</td></tr>
                  ${cb.impastoCost > 0 ? `<tr><td style="padding:3px 6px;color:#888">Impasto gel (flat):</td><td style="padding:3px 6px;text-align:right;color:#888">+${cb.impastoCost} €</td></tr>` : ''}
                  <tr style="border-top:2px solid #d4a017"><td style="padding:8px 6px;font-weight:700;color:#92400e;font-size:13px">MPC (z DDV):</td><td style="padding:8px 6px;text-align:right;font-weight:700;color:#92400e;font-size:13px">${cb.retailPrice} €</td></tr>
                  <tr><td style="padding:3px 6px;font-weight:600;color:#16a34a">Profit:</td><td style="padding:3px 6px;text-align:right;font-weight:700;color:#16a34a;font-size:13px">${cb.profit.toFixed(2)} €</td></tr>
                </table>
              </div>
            `).join('')}
          </div>`;
        })()}
      </div>
    </div>
  `;
}

/**
 * Oblikuj potrditveni email za stranko.
 */
function buildCustomerEmailHtml(order) {
  const itemList = order.items.map((item) => `
    <li style="padding:8px 0;border-bottom:1px solid #f0f0f0">
      <strong>${item.sizeLabel}</strong> —
      ${item.productType === 'framed' ? `Z okvirjem (${item.frameLabel})` : item.productType === 'stretched' ? 'S podokvirjem' : 'Tisk na platno'}
      ${item.withImpasto ? ' + Impasto gel' : ''}
      ${item.dedication ? ` — "${item.dedication}"` : ''}
      <br><span style="color:#8b5cf6;font-weight:600">${item.price} €</span>
    </li>
  `).join('');

  // Download links za stranko
  const downloadLinks = [];
  order.items.forEach((item, i) => {
    if (item.printFileUrl) {
      downloadLinks.push(`
        <a href="${item.printFileUrl}" style="display:block;background:#8b5cf6;color:white;text-decoration:none;padding:12px 20px;border-radius:8px;margin:6px 0;text-align:center;font-weight:600;font-size:14px">
          ⬇ Print-ready datoteka${order.items.length > 1 ? ` ${i + 1}` : ''} (${item.printDims || 'visoka ločljivost'})
        </a>
      `);
    }
    if (item.imageUrl) {
      downloadLinks.push(`
        <a href="${item.imageUrl}" style="display:block;color:#8b5cf6;text-decoration:none;padding:10px 20px;border:1px solid #8b5cf6;border-radius:8px;margin:6px 0;text-align:center;font-size:14px">
          🖼 Originalna slika${order.items.length > 1 ? ` ${i + 1}` : ''}
        </a>
      `);
    }
  });

  // Predogled postavitve na platnu (avtomatsko iz print-ready datoteke)
  const previewBlocks = order.items
    .filter((item) => item.printFileUrl)
    .map((item, i) => `
      <div style="text-align:center;margin:15px 0">
        <img src="${item.printFileUrl}" alt="Predogled umetnine"
             style="max-width:100%;max-height:400px;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.12);border:1px solid #eee" />
        <p style="color:#888;font-size:12px;margin:6px 0 0">
          ${item.sizeLabel} — predogled postavitve na platnu
        </p>
      </div>
    `).join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#8b5cf6,#3b82f6);padding:30px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:24px;letter-spacing:2px">ETERNA</h1>
        <p style="color:rgba(255,255,255,0.85);margin:5px 0 0;font-size:13px;letter-spacing:3px">ARTISAN</p>
      </div>
      <div style="border:1px solid #eee;border-top:none;padding:25px;border-radius:0 0 12px 12px">
        <h2 style="font-size:18px;color:#333;margin-top:0">Hvala za vaše naročilo!</h2>
        <p style="color:#666;line-height:1.6">
          Prejeli smo vaše naročilo <strong>${order.orderId}</strong>.
          Vaša umetnina bo pripravljena in poslana v najkrajšem možnem času.
        </p>
        <ul style="list-style:none;padding:0;margin:20px 0">${itemList}</ul>

        ${previewBlocks ? `
        <div style="background:#f8f5ff;padding:20px;border-radius:12px;margin-top:20px;border:1px solid #e9e0ff">
          <h3 style="margin:0 0 5px;font-size:15px;color:#5b21b6;text-align:center">Predogled vaše umetnine</h3>
          <p style="color:#888;font-size:12px;margin:0 0 15px;text-align:center">
            Tako bo vaša slika postavljena na platno
          </p>
          ${previewBlocks}
          <div style="background:white;padding:16px;border-radius:8px;margin-top:15px;border:1px solid #e9e0ff;text-align:center">
            <p style="color:#555;font-size:13px;margin:0 0 12px;line-height:1.6">
              Želite spremembo pri postavitvi ali centriranju slike?<br>
              Prilagoditve so <strong>brezplačne</strong>.
            </p>
            <a href="https://eterna-artisan.vercel.app/prilagoditev?narocilo=${encodeURIComponent(order.orderId)}&email=${encodeURIComponent(order.customer.email)}&ime=${encodeURIComponent(order.customer.name)}&img=${encodeURIComponent(order.items[0]?.printFileUrl || order.items[0]?.imageUrl || '')}"
               style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#3b82f6);color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;letter-spacing:0.5px">
              ZAHTEVAJ PRILAGODITEV
            </a>
            <p style="color:#999;font-size:11px;margin:10px 0 0">
              ali nam pišite na <a href="mailto:${ADMIN_EMAIL}" style="color:#8b5cf6">${ADMIN_EMAIL}</a>
            </p>
          </div>
        </div>` : ''}

        ${downloadLinks.length > 0 ? `
        <div style="background:#f8f5ff;padding:20px;border-radius:10px;margin-top:20px;border:1px solid #e9e0ff">
          <h3 style="margin:0 0 12px;font-size:15px;color:#5b21b6;text-align:center">Vaše datoteke za prenos</h3>
          ${downloadLinks.join('\n')}
          <p style="color:#999;font-size:11px;margin-top:10px;text-align:center">
            Povezave so aktivne 30 dni. Shranite datoteke na vaš računalnik.
          </p>
        </div>` : ''}

        <div style="background:#f8f8f8;padding:15px;border-radius:8px;text-align:center;margin-top:15px">
          <span style="font-size:20px;font-weight:700;color:#333">Skupaj: ${order.total} €</span>
        </div>
        <p style="color:#999;font-size:12px;margin-top:25px;text-align:center">
          Za vprašanja nas kontaktirajte na ${ADMIN_EMAIL}
        </p>
      </div>
    </div>
  `;
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
    const { customer, items, total, orderId, imageUrls: clientImageUrls, images } = req.body;

    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Manjkajo podatki naročila (customer, items)',
      });
    }

    const orderRef = orderId || `ET-${Date.now().toString(36).toUpperCase()}`;
    const orderDate = new Date().toLocaleString('sl-SI', { timeZone: 'Europe/Ljubljana' });
    const errors = [];
    const hasBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

    // ─── 1. Obdelaj slike: shrani original + pripravi print file ───
    const imageUrls = [];
    const printFileUrls = [];
    const printDims = [];

    // NOVA POT: Blob URL-ji (polna resolucija, že naložena v Blob)
    if (clientImageUrls && Array.isArray(clientImageUrls) && clientImageUrls.length > 0) {
      for (let i = 0; i < clientImageUrls.length; i++) {
        try {
          const imgUrl = clientImageUrls[i];
          if (!imgUrl) continue;

          const sizeId = items[i]?.size || '40x50';

          // Original URL je že v Blob — uporabi ga direktno
          imageUrls.push(imgUrl);
          console.log(`[ETERNA] Original ${i + 1}: ${imgUrl} (pre-uploaded full-res)`);

          // Prenesi sliko za print-ready obdelavo
          const imgResponse = await fetch(imgUrl);
          if (!imgResponse.ok) {
            errors.push(`Fetch image ${i + 1}: HTTP ${imgResponse.status}`);
            continue;
          }
          const buffer = Buffer.from(await imgResponse.arrayBuffer());
          console.log(`[ETERNA] Fetched ${i + 1}: ${buffer.length} bytes za print prep`);

          // Pripravi print-ready file iz polne resolucije
          const printFile = await preparePrintFile(buffer, sizeId);
          if (printFile && hasBlob) {
            try {
              const printBlob = await put(
                `orders/${orderRef}-print-${sizeId}-${i + 1}.tiff`,
                printFile.buffer,
                { access: 'public', contentType: 'image/tiff' }
              );
              printFileUrls.push(printBlob.url);
              printDims.push(`${printFile.width}×${printFile.height}px (${printFile.colorSpace.toUpperCase()})`);
              console.log(`[ETERNA] Print file ${i + 1}: ${printBlob.url} (${(printFile.buffer.length / 1024 / 1024).toFixed(1)} MB, ${printFile.width}×${printFile.height}, ${printFile.colorSpace})`);
            } catch (err) {
              errors.push(`Print upload ${i + 1}: ${err.message}`);
            }
          }
        } catch (err) {
          console.warn(`[ETERNA] Image (URL) processing ${i + 1} ni uspel:`, err.message);
          errors.push(`Image ${i + 1}: ${err.message}`);
        }
      }
    }
    // STARA POT (fallback): base64 slike iz starega formata košarice
    else if (images && Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        try {
          const imgData = images[i];
          const match = imgData.match(/^data:(image\/\w+);base64,(.+)$/);
          if (!match) continue;

          const mimeType = match[1];
          const buffer = Buffer.from(match[2], 'base64');
          const ext = mimeType.split('/')[1] || 'png';
          const sizeId = items[i]?.size || '40x50';

          // Shrani original
          if (hasBlob) {
            try {
              const origBlob = await put(`orders/${orderRef}-original-${i + 1}.${ext}`, buffer, {
                access: 'public',
                contentType: mimeType,
              });
              imageUrls.push(origBlob.url);
              console.log(`[ETERNA] Original ${i + 1} (legacy): ${origBlob.url} (${buffer.length} bytes)`);
            } catch (err) {
              errors.push(`Original upload ${i + 1}: ${err.message}`);
            }
          }

          // Pripravi print-ready file
          const printFile = await preparePrintFile(buffer, sizeId);
          if (printFile && hasBlob) {
            try {
              const printBlob = await put(
                `orders/${orderRef}-print-${sizeId}-${i + 1}.tiff`,
                printFile.buffer,
                { access: 'public', contentType: 'image/tiff' }
              );
              printFileUrls.push(printBlob.url);
              printDims.push(`${printFile.width}×${printFile.height}px (${printFile.colorSpace.toUpperCase()})`);
              console.log(`[ETERNA] Print file ${i + 1}: ${printBlob.url} (${(printFile.buffer.length / 1024 / 1024).toFixed(1)} MB, ${printFile.width}×${printFile.height}, ${printFile.colorSpace})`);
            } catch (err) {
              errors.push(`Print upload ${i + 1}: ${err.message}`);
            }
          }
        } catch (err) {
          console.warn(`[ETERNA] Image (legacy) processing ${i + 1} ni uspel:`, err.message);
          errors.push(`Image ${i + 1}: ${err.message}`);
        }
      }
    }

    // ─── 2. Sestavi podatke naročila ───
    const enrichedItems = items.map((item, i) => ({
      ...item,
      imageUrl: imageUrls[i] || null,
      printFileUrl: printFileUrls[i] || null,
      printDims: printDims[i] || null,
    }));

    const orderData = {
      orderId: orderRef,
      date: orderDate,
      customer,
      items: enrichedItems,
      total,
      qualityNotes: items.some((i) => i.qualityWarning)
        ? items.filter((i) => i.qualityWarning).map((i) => i.qualityWarning).join('; ')
        : null,
    };

    // ─── 3. Pošlji email z Resend ───
    const resendKey = process.env.RESEND_API_KEY?.trim();
    let emailSent = false;

    if (resendKey) {
      const resend = new Resend(resendKey);

      // Admin email
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: [ADMIN_EMAIL],
          subject: `Novo naročilo ${orderRef} — ${total} €`,
          html: buildAdminEmailHtml(orderData),
        });
        emailSent = true;
        console.log(`[ETERNA] Admin email poslan za ${orderRef}`);
      } catch (err) {
        console.warn('[ETERNA] Admin email ni uspel:', err.message);
        errors.push(`Admin email: ${err.message}`);
      }

      // Customer email (samo če domena verificirana)
      if (customer.email && customer.email.includes('@')) {
        try {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: [customer.email],
            subject: `Potrditev naročila ${orderRef} — ETERNA Artisan`,
            html: buildCustomerEmailHtml(orderData),
          });
          console.log(`[ETERNA] Customer email poslan na ${customer.email}`);
        } catch (err) {
          console.warn('[ETERNA] Customer email ni uspel:', err.message);
          errors.push(`Customer email: ${err.message}`);
        }
      }
    } else {
      console.warn('[ETERNA] Resend ni konfiguriran.');
      console.log('[ETERNA] Naročilo:', JSON.stringify({
        orderId: orderRef, customer, items: enrichedItems, total
      }, null, 2));
    }

    return res.status(200).json({
      success: true,
      orderId: orderRef,
      imageUrls,
      printFileUrls,
      emailSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('[ETERNA] Order error:', error);
    return res.status(500).json({
      success: false,
      error: `Napaka pri obdelavi naročila: ${error.message}`,
    });
  }
}
