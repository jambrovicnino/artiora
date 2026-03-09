// ═══════════════════════════════════════════════
// ETERNA Artisan — Customer Adjustment Request
//
// Stranka zahteva prilagoditev postavitve umetnine.
// Pošlje email adminu z opisom spremembe.
// Ni zaščiteno z geslom — javno dostopno (za stranke).
// ═══════════════════════════════════════════════

import { Resend } from 'resend';

export const config = {
  api: {
    bodyParser: { sizeLimit: '1mb' },
  },
};

const ADMIN_EMAIL = 'psn.nino4@gmail.com';
const FROM_EMAIL = 'ETERNA Artisan <onboarding@resend.dev>';

/**
 * Oblikuj HTML email za admina — zahteva za prilagoditev.
 */
function buildAdjustmentEmailHtml({ customerName, customerEmail, orderRef, message, imageUrl }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#f97316,#ec4899);padding:20px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:20px;letter-spacing:1px">ZAHTEVA ZA PRILAGODITEV</h1>
        <p style="color:rgba(255,255,255,0.85);margin:5px 0 0;font-size:12px">${orderRef || 'Brez reference'}</p>
      </div>
      <div style="border:1px solid #eee;border-top:none;padding:20px;border-radius:0 0 12px 12px">
        <table style="width:100%;border-collapse:collapse;margin-bottom:15px">
          <tr><td style="padding:6px 8px;color:#666;width:100px">Stranka:</td><td style="padding:6px 8px;font-weight:500">${customerName || '—'}</td></tr>
          <tr><td style="padding:6px 8px;color:#666">Email:</td><td style="padding:6px 8px"><a href="mailto:${customerEmail}" style="color:#8b5cf6">${customerEmail}</a></td></tr>
          ${orderRef ? `<tr><td style="padding:6px 8px;color:#666">Naročilo:</td><td style="padding:6px 8px;font-weight:600;color:#8b5cf6">${orderRef}</td></tr>` : ''}
        </table>

        <div style="background:#fff7ed;padding:16px;border-radius:10px;border:1px solid #fed7aa;margin:15px 0">
          <h3 style="margin:0 0 8px;font-size:14px;color:#c2410c">Opis želene spremembe:</h3>
          <p style="color:#333;line-height:1.7;margin:0;white-space:pre-line">${message}</p>
        </div>

        ${imageUrl ? `
        <div style="text-align:center;margin:15px 0">
          <h3 style="font-size:13px;color:#666;margin:0 0 10px">Trenutna postavitev:</h3>
          <img src="${imageUrl}" alt="Trenutna umetnina"
               style="max-width:100%;max-height:400px;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.1);border:1px solid #eee" />
        </div>` : ''}

        <div style="text-align:center;margin-top:20px">
          <a href="mailto:${customerEmail}?subject=Prilagoditev naročila ${orderRef || ''} — ETERNA Artisan&body=Pozdravljeni ${customerName || ''},${encodeURIComponent('\n\n')}Vaša prilagoditev je bila izvedena.${encodeURIComponent('\n\n')}Lep pozdrav,${encodeURIComponent('\n')}ETERNA Artisan"
             style="display:inline-block;background:#8b5cf6;color:white;text-decoration:none;padding:10px 24px;border-radius:8px;font-weight:600;font-size:14px">
            ODGOVORI STRANKI
          </a>
        </div>
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
    const { orderRef, customerEmail, customerName, message, imageUrl } = req.body;

    if (!customerEmail || !message) {
      return res.status(400).json({
        success: false,
        error: 'Manjkajo podatki: email in opis spremembe sta obvezna',
      });
    }

    // Osnovna zaščita proti spam-u (preprost rate limit)
    const contentLength = (message || '').length;
    if (contentLength > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Sporočilo je predolgo (max 2000 znakov)',
      });
    }

    const resendKey = process.env.RESEND_API_KEY?.trim();
    if (!resendKey) {
      console.log('[ETERNA] Adjustment request (Resend ni konfiguriran):', {
        orderRef, customerEmail, customerName, message,
      });
      return res.status(200).json({
        success: true,
        message: 'Zahteva zabeležena (email ni konfiguriran)',
      });
    }

    const resend = new Resend(resendKey);

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      replyTo: customerEmail,
      subject: `Prilagoditev: ${orderRef || 'Brez ref.'} — ${customerName || customerEmail}`,
      html: buildAdjustmentEmailHtml({
        customerName,
        customerEmail,
        orderRef,
        message,
        imageUrl,
      }),
    });

    console.log(`[ETERNA] Adjustment request od ${customerEmail} za ${orderRef}`);

    return res.status(200).json({
      success: true,
      message: 'Zahteva poslana',
    });
  } catch (error) {
    console.error('[ETERNA] Adjustment request error:', error);
    return res.status(500).json({
      success: false,
      error: `Napaka: ${error.message}`,
    });
  }
}
