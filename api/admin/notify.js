// ═══════════════════════════════════════════════
// ETERNA Artisan — Admin Customer Notification
//
// Pošlje stranki obvestilo o končnem izgledu umetnine.
// Admin uporabi to stran po manualni prilagoditvi slike.
//
// Zaščiteno z ADMIN_SECRET environment spremenljivko.
// ═══════════════════════════════════════════════

import { Resend } from 'resend';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

const ADMIN_EMAIL = 'psn.nino4@gmail.com';
const FROM_EMAIL = 'ETERNA Artisan <onboarding@resend.dev>';

/**
 * Oblikuj HTML email za stranko — obvestilo o končnem izgledu.
 */
function buildNotificationEmailHtml({ customerName, orderRef, message, previewImageUrl }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#8b5cf6,#3b82f6);padding:30px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:24px;letter-spacing:2px">ETERNA</h1>
        <p style="color:rgba(255,255,255,0.85);margin:5px 0 0;font-size:13px;letter-spacing:3px">ARTISAN</p>
      </div>
      <div style="border:1px solid #eee;border-top:none;padding:25px;border-radius:0 0 12px 12px">
        <h2 style="font-size:20px;color:#333;margin-top:0;text-align:center">
          Vaša umetnina je pripravljena!
        </h2>
        <p style="color:#666;line-height:1.6">
          Spoštovani ${customerName || 'kupec'},
        </p>

        ${previewImageUrl ? `
        <div style="text-align:center;margin:20px 0">
          <img src="${previewImageUrl}" alt="Predogled umetnine"
               style="max-width:100%;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.15)" />
          <p style="color:#999;font-size:11px;margin-top:8px">Predogled končnega izgleda</p>
        </div>` : ''}

        <div style="background:#f8f5ff;padding:20px;border-radius:10px;margin:20px 0;border:1px solid #e9e0ff">
          <p style="color:#333;line-height:1.8;margin:0;white-space:pre-line">${message}</p>
        </div>

        ${orderRef ? `
        <div style="background:#f8f8f8;padding:12px;border-radius:8px;text-align:center;margin-top:15px">
          <span style="font-size:13px;color:#666">Referenca naročila: </span>
          <strong style="color:#8b5cf6">${orderRef}</strong>
        </div>` : ''}

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
    'X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // ─── Avtentikacija: preveri Bearer token ───
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_SECRET?.trim();

  if (!adminSecret) {
    return res.status(500).json({
      success: false,
      error: 'ADMIN_SECRET ni nastavljen na strežniku',
    });
  }

  if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
    return res.status(401).json({ success: false, error: 'Neveljavno geslo' });
  }

  try {
    const { orderRef, customerEmail, customerName, message, previewImageUrl } = req.body;

    if (!customerEmail || !message) {
      return res.status(400).json({
        success: false,
        error: 'Manjkajo podatki: customerEmail in message sta obvezna',
      });
    }

    const resendKey = process.env.RESEND_API_KEY?.trim();
    if (!resendKey) {
      return res.status(500).json({
        success: false,
        error: 'Resend API key ni nastavljen',
      });
    }

    const resend = new Resend(resendKey);

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [customerEmail],
      subject: `Vaša umetnina je pripravljena — ${orderRef || 'ETERNA Artisan'}`,
      html: buildNotificationEmailHtml({
        customerName,
        orderRef,
        message,
        previewImageUrl,
      }),
    });

    console.log(`[ETERNA] Admin notification poslan na ${customerEmail} (${orderRef})`);

    return res.status(200).json({
      success: true,
      message: `Email poslan na ${customerEmail}`,
    });
  } catch (error) {
    console.error('[ETERNA] Admin notify error:', error);
    return res.status(500).json({
      success: false,
      error: `Napaka pri pošiljanju: ${error.message}`,
    });
  }
}
