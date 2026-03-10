import { Resend } from 'resend';
import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: 'Email je obvezen' });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    const secret = process.env.VERIFICATION_SECRET || 'artiora-default-secret';

    const payload = `${email}:${code}:${expiry}`;
    const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const token = `${expiry}:${hmac}`;

    // Send email via Resend
    const resendKey = process.env.RESEND_API_KEY?.trim();
    if (resendKey) {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: 'ARTIORA <onboarding@resend.dev>',
        to: [email],
        subject: `${code} — Vaša ARTIORA verifikacijska koda`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; color: #f0ece4; padding: 40px 32px; border: 1px solid #2a2520;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 400; letter-spacing: 0.15em; color: #c9a84c; margin: 0;">ARTIORA</h1>
              <p style="font-size: 10px; letter-spacing: 0.3em; color: #5a5248; margin-top: 4px;">CERTIFIED ART PLATFORM</p>
            </div>
            <div style="border-top: 1px solid #2a2520; border-bottom: 1px solid #2a2520; padding: 28px 0; text-align: center;">
              <p style="font-size: 14px; color: #a09888; margin: 0 0 16px;">Pozdravljeni${name ? `, ${name}` : ''}!</p>
              <p style="font-size: 14px; color: #a09888; margin: 0 0 24px;">Vaša verifikacijska koda je:</p>
              <div style="font-size: 36px; font-weight: 700; letter-spacing: 0.4em; color: #c9a84c; padding: 16px 0;">${code}</div>
              <p style="font-size: 12px; color: #5a5248; margin-top: 20px;">Koda velja 10 minut.</p>
            </div>
            <p style="font-size: 11px; color: #3a3530; text-align: center; margin-top: 24px;">Če niste zahtevali te kode, lahko to sporočilo prezrete.</p>
          </div>
        `,
      });
    } else {
      console.log(`[ARTIORA] Verification code for ${email}: ${code} (RESEND_API_KEY not set)`);
    }

    return res.status(200).json({ success: true, token });
  } catch (err) {
    console.error('[ARTIORA] send-verification error:', err);
    return res.status(500).json({ error: 'Napaka pri pošiljanju kode' });
  }
}
