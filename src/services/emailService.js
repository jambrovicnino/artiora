// ═══════════════════════════════════════════════
// ETERNA — Email storitev za obvestila o naročilih
// Uporablja EmailJS (brezplačni nivo: 200 mailov/mesec)
// Kasnejša nadgradnja: Resend za transakcijske maile
// ═══════════════════════════════════════════════

// EmailJS konfiguracija (nastavi v .env)
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

// Privzeti prejemnik za obvestila o naročilih
const ORDER_EMAIL = 'psn.nino4@gmail.com';

/**
 * Inicializiraj EmailJS (pokliči enkrat ob zagonu)
 */
let emailjsLoaded = false;

async function loadEmailJS() {
  if (emailjsLoaded) return window.emailjs;

  // Dinamično naloži EmailJS SDK
  if (!window.emailjs) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.async = true;

    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  if (window.emailjs && EMAILJS_PUBLIC_KEY) {
    window.emailjs.init(EMAILJS_PUBLIC_KEY);
    emailjsLoaded = true;
  }

  return window.emailjs;
}

/**
 * Oblikuj podrobnosti naročila za email
 */
function formatOrderDetails(orderData) {
  const { items, total, customerInfo, orderId } = orderData;

  const itemLines = items.map((item, i) => {
    const parts = [
      `${i + 1}. ${item.enhancement || 'Brez izboljšave'}`,
      `   Velikost: ${item.sizeLabel || item.size || 'N/A'}`,
      `   Izdelek: ${item.productType === 'framed' ? 'Z okvirjem (' + (item.frameLabel || '076') + ')' : item.productType === 'stretched' ? 'S podokvirjem' : 'Samo tisk'}`,
      `   Cena: ${item.price} €`,
    ];
    if (item.dedication) {
      parts.push(`   Posvetilo: "${item.dedication}"`);
    }
    if (item.printSpecs) {
      parts.push(`   Tisk: ${item.printSpecs.dpi}dpi, ${item.printSpecs.colorSpace}, ${item.printSpecs.format}`);
    }
    return parts.join('\n');
  });

  return {
    to_email: ORDER_EMAIL,
    order_id: orderId || `ET-${Date.now()}`,
    order_date: new Date().toLocaleString('sl-SI'),
    items_text: itemLines.join('\n\n'),
    items_count: items.length,
    total_price: `${total} €`,
    customer_name: customerInfo?.name || 'Ni podano',
    customer_email: customerInfo?.email || 'Ni podano',
    customer_phone: customerInfo?.phone || 'Ni podano',
    customer_address: customerInfo?.address || 'Ni podano',
    // Metapodatki
    ai_provider: items[0]?.metadata?.provider || 'demo',
    print_ready: items.some((i) => i.printSpecs?.printReady) ? 'Da' : 'Ne (demo)',
  };
}

/**
 * Pošlji obvestilo o naročilu na email
 *
 * @param {object} orderData - Podatki naročila
 * @param {Array} orderData.items - Seznam izdelkov v košarici
 * @param {number} orderData.total - Skupna cena
 * @param {object} orderData.customerInfo - Podatki stranke
 * @param {string} orderData.orderId - ID naročila
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function sendOrderEmail(orderData) {
  // Preveri konfiguracijo
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn('[ETERNA] EmailJS ni konfiguriran. Naročilo zabeleženo samo v konzoli.');
    console.log('[ETERNA] Podrobnosti naročila:', formatOrderDetails(orderData));

    // V demo načinu: izpiši v konzolo in simuliraj uspeh
    return {
      success: true,
      message: 'Naročilo zabeleženo (demo način — email ni konfiguriran)',
    };
  }

  try {
    const emailjs = await loadEmailJS();

    if (!emailjs) {
      throw new Error('EmailJS SDK ni na voljo');
    }

    const templateParams = formatOrderDetails(orderData);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('[ETERNA] Email poslan:', response.status);

    return {
      success: true,
      message: 'Obvestilo o naročilu uspešno poslano',
    };
  } catch (error) {
    console.error('[ETERNA] Napaka pri pošiljanju emaila:', error);

    // Ne ustavi naročila če email ne uspe
    return {
      success: false,
      message: 'Email obvestila ni bilo mogoče poslati, naročilo je vseeno zabeleženo',
    };
  }
}

/**
 * Pošlji testni email (za preverjanje konfiguracije)
 */
export async function sendTestEmail() {
  return sendOrderEmail({
    items: [
      {
        enhancement: 'Restavracija (TEST)',
        sizeLabel: 'Imperial (40 × 50 cm)',
        productType: 'framed',
        frameLabel: '076',
        withImpasto: false,
        price: 381,
        dedication: 'Testno naročilo',
        printSpecs: { dpi: 300, colorSpace: 'CMYK', format: 'TIFF' },
      },
    ],
    total: 289,
    customerInfo: {
      name: 'Test Uporabnik',
      email: 'test@eterna.si',
    },
    orderId: 'TEST-' + Date.now(),
  });
}

export default {
  sendOrderEmail,
  sendTestEmail,
};
