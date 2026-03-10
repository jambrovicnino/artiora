import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, code, token } = req.body;
    if (!email || !code || !token) {
      return res.status(400).json({ error: 'Manjkajo podatki' });
    }

    const colonIdx = token.indexOf(':');
    if (colonIdx === -1) {
      return res.status(400).json({ error: 'Neveljaven token' });
    }

    const expiry = token.substring(0, colonIdx);
    const hmac = token.substring(colonIdx + 1);

    if (Date.now() > parseInt(expiry, 10)) {
      return res.status(400).json({ error: 'Koda je potekla. Prosimo, zahtevajte novo.' });
    }

    const secret = process.env.VERIFICATION_SECRET || 'artiora-default-secret';
    const payload = `${email}:${code}:${expiry}`;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    if (hmac !== expected) {
      return res.status(400).json({ error: 'Napačna koda. Prosimo, preverite in poskusite znova.' });
    }

    return res.status(200).json({ success: true, verified: true });
  } catch (err) {
    console.error('[ARTIORA] verify-code error:', err);
    return res.status(500).json({ error: 'Napaka pri preverjanju kode' });
  }
}
