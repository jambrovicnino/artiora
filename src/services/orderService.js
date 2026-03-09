// ═══════════════════════════════════════════════
// ETERNA Artisan — Order Service (client-side)
// Pošlje naročilo na /api/create-order
// ═══════════════════════════════════════════════

const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'https://eterna-artisan.vercel.app'
  : '';

/**
 * Pošlje naročilo na strežnik za obdelavo.
 * Strežnik shrani slike + pošlje email.
 *
 * @param {object} params
 * @param {object} params.customer - { name, email, phone, address, note }
 * @param {Array}  params.items    - Izdelki iz košarice
 * @param {number} params.total    - Skupna cena
 * @param {string} params.orderId  - ID naročila
 * @returns {Promise<{ success, orderId, imageUrls, emailSent }>}
 */
export async function processOrder({ customer, items, total, orderId }) {
  const url = `${API_BASE}/api/create-order`;

  // Pripravi Blob URL-je (polna resolucija, že naložena v Vercel Blob)
  const fullResUrls = items
    .map((item) => item.fullResUrl || null)
    .filter(Boolean);

  // Fallback za stare košarice (base64 format)
  const legacyImages = fullResUrls.length === 0
    ? items.map((item) => item.originalImage || item.processedImage || item.thumbnail).filter(Boolean)
    : [];

  // Pripravi podatke izdelkov (brez velikih base64 stringov)
  const cleanItems = items.map((item) => ({
    enhancement: item.enhancement || 'Brez',
    sizeLabel: (item.frameSizeLabel || item.frameSize || 'N/A').replace(/×/g, 'x'),
    size: item.frameSize,
    productType: item.productType || 'stretched',
    frameLabel: item.frameLabel || null,
    withImpasto: item.withImpasto || false,
    dedication: item.dedication || '',
    hangingIncluded: item.hangingIncluded || null,
    costBreakdown: item.costBreakdown || null,
    price: item.price,
    printSpecs: item.printSpecs || null,
    qualityWarning: item.qualityWarning || null,
  }));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer,
        items: cleanItems,
        total,
        orderId,
        imageUrls: fullResUrls,       // Blob URL-ji (polna resolucija)
        images: legacyImages,          // Fallback za stare košarice
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[ETERNA] processOrder failed:', error);

    // Fallback: logiraj v konzolo, ne ustavi celotnega naročila
    console.log('[ETERNA] Fallback — naročilo:', {
      customer,
      items: cleanItems,
      total,
      orderId,
    });

    return {
      success: false,
      orderId,
      error: error.message,
      emailSent: false,
    };
  }
}
