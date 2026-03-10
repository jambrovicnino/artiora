// ═══════════════════════════════════════════════
// ARTIORA — AI Image Generation
// Kliče Vercel serverless proxy (/api/generate-image)
// ki posreduje zahtevo Gemini API iz ZDA strežnika
// in tako obide EU geografsko blokado.
// ═══════════════════════════════════════════════

/**
 * Določi bazni URL za API klice.
 * V produkciji (Vercel) = isti origin.
 * V razvoju (localhost) = kliče Vercel production proxy.
 */
function getApiBaseUrl() {
  // V produkciji na Vercelu — uporabi relativni path
  if (window.location.hostname !== 'localhost') {
    return '';
  }
  // V razvoju — kliči Vercel production za proxy
  return 'https://artiora.vercel.app';
}

/**
 * Generiraj umetniško sliko iz ključnih besed z AI.
 *
 * Pošlje ključne besede na Vercel serverless funkcijo,
 * ki pokliče Gemini API iz ZDA (obide EU blokado).
 *
 * @param {string[]} keywords — polje ključnih besed (do 10)
 * @returns {Promise<{ imageDataUrl: string, description: string }>}
 */
export async function generateImageFromKeywords(keywords) {
  const filtered = keywords.filter((k) => k.trim().length > 0);
  if (filtered.length === 0) {
    throw new Error('Vnesite vsaj eno ključno besedo.');
  }

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/generate-image`;

  console.log(`[ARTIORA] Pošiljam ${filtered.length} ključnih besed na ${url}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keywords: filtered }),
  });

  // Preveri ali je odgovor JSON (Vercel timeout vrne HTML)
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Strežnik ni vrnil veljavnega odgovora (HTTP ${response.status}). Poskusite znova.`
    );
  }

  if (!response.ok || !data.success) {
    throw new Error(
      data.error || `Napaka strežnika (HTTP ${response.status})`
    );
  }

  if (!data.imageDataUrl) {
    throw new Error('Strežnik ni vrnil slike.');
  }

  console.log(`[ARTIORA] Uspeh! Model: ${data.model || 'unknown'}`);

  return {
    imageDataUrl: data.imageDataUrl,
    description: data.description || 'AI umetnina',
    // Označi ali je direktni URL (Pollinations) — komponenta mora počakati nalaganje
    isDirectUrl: !data.imageDataUrl.startsWith('data:'),
  };
}

export default { generateImageFromKeywords };
