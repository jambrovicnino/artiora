// ═══════════════════════════════════════════════
// ETERNA — Cenovna Struktura (v3)
// Vse maloprodajne cene vključujejo DDV (22%)
//
// 3 plasti izdelka:
//   1. Samo tisk na platno (canvas print)
//   2. Tisk + podokvirjanje + napenjanje (stretched)
//   3. Umetnina z okvirjem (framed artwork)
//
// Formula: veleprodajna × markup × DDV + AI flat fee
// Extras (delo, impasto) samo pri okvirjeni umetnini
//
// ─── Veleprodajne cene (brez DDV) ───
// Samo tisk:
//   30×40 = 15€ | 40×50 = 20€ | 45×60 = 25€
//   50×70 = 30€ | 60×90 = 40€ | 76×102 = 50€
//
// Tisk + podokvir + napenjanje:
//   30×40 = 32,05€ | 40×50 = 41,92€ | 45×60 = 50,58€
//   50×70 = 59,23€ | 60×90 = 76,54€ | 76×102 = 93,36€
//
// ─── Faktorji ───
// Markup: 2.5×
// DDV: 22% (skupni faktor: 2.5 × 1.22 = 3.05)
// AI obdelava: 1,00 € flat fee (maloprodajna)
// Ročno delo: 25,00 € (samo pri okvirjanju)
// Impasto gel: 5,00 € (opcijsko, samo pri okvirjanju)
// ═══════════════════════════════════════════════

// DDV stopnja (Slovenija)
export const DDV_RATE = 0.22;

// Markup faktor
export const MARKUP = 2.5;

// Skupni faktor: markup × DDV
const FACTOR = MARKUP * (1 + DDV_RATE); // = 3.05

// Dodatni stroški (EUR, brez DDV)
export const LABOR_COST = 25.00;        // Ročno delo — samo pri okvirjanju
export const IMPASTO_GEL_COST = 5.00;   // Impasto gel — opcijsko pri okvirjanju
export const AI_FEE = 1.00;             // AI obdelava — flat maloprodajna cena

// ═══════════════════════════════════════════════
// TIPI IZDELKOV
// ═══════════════════════════════════════════════
export const PRODUCT_TYPES = {
  PRINT: 'print',           // Samo tisk na platno
  STRETCHED: 'stretched',   // Tisk + podokvir + napenjanje
  FRAMED: 'framed',         // Umetnina z okvirjem
};

// ═══════════════════════════════════════════════
// 6 VELIKOSTI — od 30×40 do 76×102
// ═══════════════════════════════════════════════
export const canvasSizes = [
  {
    id: '30x40',
    label: '30 × 40 cm',
    displayName: 'Kabinet',
    dimensions: '30cm × 40cm',
    wholesale: {
      canvasPrint: 15.00,      // Samo tisk
      canvasStretched: 32.05,  // Tisk + podokvir + napenjanje
    },
    printSpecs: {
      dpi: 300, colorSpace: 'CMYK', bleed: '3mm', format: 'TIFF',
      widthPx: 3543, heightPx: 4724,
    },
  },
  {
    id: '40x50',
    label: '40 × 50 cm',
    displayName: 'Imperial',
    dimensions: '40cm × 50cm',
    wholesale: {
      canvasPrint: 20.00,
      canvasStretched: 41.92,
    },
    printSpecs: {
      dpi: 300, colorSpace: 'CMYK', bleed: '3mm', format: 'TIFF',
      widthPx: 4724, heightPx: 5906,
    },
  },
  {
    id: '45x60',
    label: '45 × 60 cm',
    displayName: 'Salon',
    dimensions: '45cm × 60cm',
    wholesale: {
      canvasPrint: 25.00,
      canvasStretched: 50.58,
    },
    printSpecs: {
      dpi: 300, colorSpace: 'CMYK', bleed: '3mm', format: 'TIFF',
      widthPx: 5315, heightPx: 7087,
    },
  },
  {
    id: '50x70',
    label: '50 × 70 cm',
    displayName: 'Razstava',
    dimensions: '50cm × 70cm',
    wholesale: {
      canvasPrint: 30.00,
      canvasStretched: 59.23,
    },
    printSpecs: {
      dpi: 300, colorSpace: 'CMYK', bleed: '3mm', format: 'TIFF',
      widthPx: 5906, heightPx: 8268,
    },
  },
  {
    id: '60x90',
    label: '60 × 90 cm',
    displayName: 'Panorama',
    dimensions: '60cm × 90cm',
    wholesale: {
      canvasPrint: 40.00,
      canvasStretched: 76.54,
    },
    printSpecs: {
      dpi: 300, colorSpace: 'CMYK', bleed: '3mm', format: 'TIFF',
      widthPx: 7087, heightPx: 10630,
    },
  },
  {
    id: '76x102',
    label: '76 × 102 cm',
    displayName: 'Galerija',
    dimensions: '76cm × 102cm',
    wholesale: {
      canvasPrint: 50.00,
      canvasStretched: 93.36,
    },
    printSpecs: {
      dpi: 300, colorSpace: 'CMYK', bleed: '3mm', format: 'TIFF',
      widthPx: 8976, heightPx: 12047,
    },
  },
];

// Velikosti za prikaz v studiu
export const displaySizes = canvasSizes;

// ═══════════════════════════════════════════════
// OKVIRI — 16 stilov iz Vidal cenika + kataloga
// Cene: veleprodajna €/tm obsega (brez DDV)
// Vir: Vidal d.o.o., Pod jelšami 8, 1290 Grosuplje
// Katalog Letvic 2026 + Cenik okvirjanje 2022
// ═══════════════════════════════════════════════
export const frameStyles = [
  // ─── Ozki leseni profili ───
  {
    id: 'k112-les',
    label: 'K112',
    profile: 'K112',
    description: 'Profil K112.07.2, 15 × 17 mm',
    profileDimensions: '15 × 17 mm',
    pricePerTm: 11.16,
    stripImage: '/frames/strips/K112-07-2.png',
    borderWidth: 7,
    cssStyle: {
      borderWidth: '7px',
      borderStyle: 'solid',
      borderImage: 'linear-gradient(135deg, #6b5040 0%, #8a6a55 30%, #7b644f 50%, #6b5040 70%, #5a4030 100%) 1',
      boxShadow: 'inset 0 0 4px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.3)',
    },
  },
  {
    id: 'k110-les',
    label: 'K110',
    profile: 'K110',
    description: 'Profil K110/07/2, 35 × 15 mm',
    profileDimensions: '35 × 15 mm',
    pricePerTm: 12.49,
    stripImage: '/frames/strips/K110-07-2.png',
    borderWidth: 14,
    cssStyle: {
      borderWidth: '14px',
      borderStyle: 'solid',
      borderImage: 'linear-gradient(135deg, #8a6040 0%, #a07850 25%, #996f52 50%, #8a6040 75%, #704830 100%) 1',
      boxShadow: 'inset 0 0 6px rgba(0,0,0,0.3), 0 3px 10px rgba(0,0,0,0.35)',
    },
  },
  // ─── Srednji leseni profili ───
  {
    id: 'k115-ornament',
    label: 'K115',
    profile: 'K115',
    description: 'Profil K115.072, 43 × 22 mm',
    profileDimensions: '43 × 22 mm',
    pricePerTm: 21.20,
    stripImage: '/frames/strips/K115-072.png',
    borderWidth: 19,
    cssStyle: {
      borderWidth: '19px',
      borderStyle: 'solid',
      borderImage: 'linear-gradient(135deg, #5a4030 0%, #705744 25%, #8a6850 50%, #705744 75%, #5a4030 100%) 1',
      boxShadow: 'inset 0 0 8px rgba(0,0,0,0.35), 0 3px 14px rgba(0,0,0,0.4)',
    },
  },
  {
    id: '127-klasik',
    label: '127/AF',
    profile: '127',
    description: 'Profil 127/AF, 45 × 32 mm',
    profileDimensions: '45 × 32 mm',
    pricePerTm: 21.80,
    stripImage: '/frames/strips/127-AF.png',
    borderWidth: 20,
    cssStyle: {
      borderWidth: '20px',
      borderStyle: 'solid',
      borderImage: 'linear-gradient(135deg, #a08a68 0%, #c4b090 25%, #b6a488 50%, #c4b090 75%, #a08a68 100%) 1',
      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.4)',
    },
  },
  // ─── Klasični zlati/srebrni ───
  {
    id: '175-zlat',
    label: '175/A',
    profile: '175',
    description: 'Profil 175/A, 35 × 30 mm',
    profileDimensions: '35 × 30 mm',
    pricePerTm: 23.41,
    stripImage: '/frames/strips/175-A.png',
    borderWidth: 16,
    cssStyle: {
      borderWidth: '16px',
      borderStyle: 'solid',
      borderImage: 'linear-gradient(135deg, #b8860b 0%, #d4a843 25%, #c9a068 50%, #d4a843 75%, #b8860b 100%) 1',
      boxShadow: 'inset 0 0 8px rgba(0,0,0,0.3), inset 0 0 3px rgba(255,215,0,0.1), 0 3px 14px rgba(0,0,0,0.4)',
    },
  },
  {
    id: '175-srebrn',
    label: '175/B',
    profile: '175',
    description: 'Profil 175/B, 35 × 30 mm',
    profileDimensions: '35 × 30 mm',
    pricePerTm: 23.41,
    stripImage: '/frames/strips/175-B.png',
    borderWidth: 16,
    cssStyle: {
      borderWidth: '16px',
      borderStyle: 'solid',
      borderImage: 'linear-gradient(135deg, #b0a898 0%, #c7bba9 25%, #d0c8b8 50%, #c7bba9 75%, #b0a898 100%) 1',
      boxShadow: 'inset 0 0 8px rgba(0,0,0,0.25), 0 3px 14px rgba(0,0,0,0.35)',
    },
  },
  {
    id: '184-vintage',
    label: '184.1170',
    profile: '184',
    description: 'Profil 184.1170, 46 × 26 mm — ODPRODAJA',
    profileDimensions: '46 × 26 mm',
    pricePerTm: 29.23,
    odprodaja: true,
    stripImage: '/frames/strips/184-1170.png',
    borderWidth: 21,
    cssStyle: {
      borderWidth: '21px',
      borderStyle: 'solid',
      borderImage: 'linear-gradient(135deg, #7a7a6e 0%, #98988a 25%, #88887b 50%, #98988a 75%, #7a7a6e 100%) 1',
      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.35), 0 4px 18px rgba(0,0,0,0.45)',
    },
  },
  // ─── Ornamentni dekorativni ───
  {
    id: 'aba-modra',
    label: 'ABA.111',
    profile: 'ABA',
    description: 'Profil ABA.111 modra, 46 × 36 mm — ODPRODAJA',
    profileDimensions: '46 × 36 mm',
    pricePerTm: 31.30,
    odprodaja: true,
    stripImage: '/frames/strips/ABA-111-modra.png',
    borderWidth: 21,
    cssStyle: {
      borderWidth: '21px',
      borderStyle: 'solid',
      borderImage: 'linear-gradient(135deg, #4a6858 0%, #6a8870 25%, #85816a 50%, #a09878 75%, #6a7858 100%) 1',
      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.35), 0 4px 18px rgba(0,0,0,0.45)',
    },
  },
  {
    id: '171-ornament',
    label: '171/ON',
    profile: '171',
    description: 'Profil 171/ON, 40 × 37 mm',
    profileDimensions: '40 × 37 mm',
    pricePerTm: 31.84,
    stripImage: '/frames/strips/171-ON.png',
    borderWidth: 18,
    cssStyle: {
      borderWidth: '18px',
      borderStyle: 'solid',
      borderImage: 'linear-gradient(135deg, #3a2820 0%, #60504a 25%, #80756d 50%, #60504a 75%, #3a2820 100%) 1',
      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.4), 0 4px 18px rgba(0,0,0,0.5)',
    },
  },
  // ─── Široki luksuzni ───
  {
    id: '290-barok',
    label: '290/A',
    profile: '290',
    description: 'Profil 290/A, 75 × 40 mm',
    profileDimensions: '75 × 40 mm',
    pricePerTm: 43.88,
    stripImage: '/frames/strips/290-A.png',
    borderWidth: 33,
    cssStyle: {
      borderWidth: '33px',
      borderStyle: 'solid',
      borderImage: 'linear-gradient(135deg, #c0b098 0%, #d7c8af 20%, #e0d8c8 40%, #d7c8af 60%, #c0b098 80%, #b0a088 100%) 1',
      boxShadow: 'inset 0 0 14px rgba(0,0,0,0.3), 0 5px 22px rgba(0,0,0,0.45)',
    },
  },
  // ─── 3000 serija — široki ornamentni (85 × 45 mm) ───
  {
    id: '3000-rdece-zlat',
    label: '3000.0050',
    profile: '3000',
    description: 'Profil 3000.0050, 85 × 45 mm — ODPRODAJA',
    profileDimensions: '85 × 45 mm',
    pricePerTm: 47.64,
    odprodaja: true,
    stripImage: '/frames/strips/3000-0050.png',
    borderWidth: 34,
    cssStyle: {
      borderWidth: '34px',
      borderStyle: 'solid',
      borderImage: 'linear-gradient(135deg, #8a5020 0%, #b07830 20%, #9a6a3b 40%, #c09040 60%, #9a6a3b 80%, #8a5020 100%) 1',
      boxShadow: 'inset 0 0 14px rgba(0,0,0,0.4), 0 5px 24px rgba(0,0,0,0.5)',
    },
  },
  {
    id: '3000-modro-siv',
    label: '3000.0070',
    profile: '3000',
    description: 'Profil 3000.0070, 85 × 45 mm — ODPRODAJA',
    profileDimensions: '85 × 45 mm',
    pricePerTm: 47.64,
    odprodaja: true,
    stripImage: '/frames/strips/3000-0070.png',
    borderWidth: 34,
    cssStyle: {
      borderWidth: '34px',
      borderStyle: 'solid',
      borderImage: 'linear-gradient(135deg, #6a6858 0%, #888870 25%, #82765a 50%, #a09060 75%, #6a6858 100%) 1',
      boxShadow: 'inset 0 0 14px rgba(0,0,0,0.4), 0 5px 24px rgba(0,0,0,0.5)',
    },
  },
  {
    id: '3000-crn',
    label: '3000 Nero',
    profile: '3000',
    description: 'Profil 3000 nero, 85 × 45 mm — ODPRODAJA — povpraševanje',
    profileDimensions: '85 × 45 mm',
    pricePerTm: 47.64,
    odprodaja: true,
    inquiry: true,
    stripImage: '/frames/strips/3000-nero.png',
    borderWidth: 34,
    cssStyle: {
      borderWidth: '34px',
      borderStyle: 'solid',
      borderImage: 'linear-gradient(135deg, #2a2620 0%, #3a362e 25%, #38342c 50%, #3a362e 75%, #2a2620 100%) 1',
      boxShadow: 'inset 0 0 14px rgba(0,0,0,0.5), 0 5px 24px rgba(0,0,0,0.55)',
    },
  },
  {
    id: '3000-srebrno-zelen',
    label: '3000.1170',
    profile: '3000',
    description: 'Profil 3000.1170, 85 × 45 mm — ODPRODAJA — povpraševanje',
    profileDimensions: '85 × 45 mm',
    pricePerTm: 47.64,
    odprodaja: true,
    inquiry: true,
    stripImage: '/frames/strips/3000-1170.png',
    borderWidth: 34,
    cssStyle: {
      borderWidth: '34px',
      borderStyle: 'solid',
      borderImage: 'linear-gradient(135deg, #808068 0%, #a0986a 25%, #958a6d 50%, #a0986a 75%, #808068 100%) 1',
      boxShadow: 'inset 0 0 14px rgba(0,0,0,0.4), 0 5px 24px rgba(0,0,0,0.5)',
    },
  },
  {
    id: '210-mahagonij',
    label: '210.006',
    profile: '210',
    description: 'Profil 210.006, 85 × 34 mm — ODPRODAJA',
    profileDimensions: '85 × 34 mm',
    pricePerTm: 55.30,
    odprodaja: true,
    stripImage: '/frames/strips/210-006.png',
    borderWidth: 34,
    cssStyle: {
      borderWidth: '34px',
      borderStyle: 'solid',
      borderImage: 'linear-gradient(135deg, #3a2818 0%, #5d4333 20%, #4a3525 40%, #6a5040 60%, #5d4333 80%, #3a2818 100%) 1',
      boxShadow: 'inset 0 0 14px rgba(0,0,0,0.45), 0 5px 24px rgba(0,0,0,0.55)',
    },
  },
  {
    id: '3000-premium',
    label: '3000.014',
    profile: '3000',
    description: 'Profil 3000.014, 85 × 45 mm — ODPRODAJA',
    profileDimensions: '85 × 45 mm',
    pricePerTm: 82.79,
    odprodaja: true,
    stripImage: '/frames/strips/3000-014.png',
    borderWidth: 34,
    cssStyle: {
      borderWidth: '34px',
      borderStyle: 'solid',
      borderImage: 'linear-gradient(135deg, #907860 0%, #b0a088 25%, #998469 50%, #b0a088 75%, #907860 100%) 1',
      boxShadow: 'inset 0 0 14px rgba(0,0,0,0.35), 0 5px 24px rgba(0,0,0,0.45)',
    },
  },
];

// ═══════════════════════════════════════════════
// IZRAČUN OBSEGA
// ═══════════════════════════════════════════════
export function getPerimeter(sizeId) {
  const parts = sizeId.split('x').map(Number);
  if (parts.length !== 2) return 0;
  return 2 * (parts[0] + parts[1]) / 100; // cm → m
}

// ═══════════════════════════════════════════════
// CENOVNA FUNKCIJA — 3 plasti + opcijski impasto
//
// productType: 'print' | 'stretched' | 'framed'
// frameId: ID okvirja (samo pri 'framed')
// withImpasto: boolean (opcijsko, samo pri 'framed')
// ═══════════════════════════════════════════════
export function getPrice(sizeId, productType = 'print', frameId = null, withImpasto = false) {
  const size = canvasSizes.find((s) => s.id === sizeId);
  if (!size) return 0;

  let wholesale = 0;

  if (productType === PRODUCT_TYPES.PRINT) {
    // Plast 1: samo tisk
    wholesale = size.wholesale.canvasPrint;
  } else if (productType === PRODUCT_TYPES.STRETCHED) {
    // Plast 2: tisk + podokvir + napenjanje
    wholesale = size.wholesale.canvasStretched;
  } else if (productType === PRODUCT_TYPES.FRAMED) {
    // Plast 3: tisk + podokvir + okvir + delo
    const frame = frameStyles.find((f) => f.id === frameId);
    if (!frame) return 0;
    const perimeter = getPerimeter(sizeId);
    const frameCost = frame.pricePerTm * perimeter;
    wholesale = size.wholesale.canvasStretched + frameCost + LABOR_COST;

    // Opcijski impasto gel
    if (withImpasto) {
      wholesale += IMPASTO_GEL_COST;
    }
  }

  // Maloprodajna: veleprodajna × markup × DDV + AI fee
  const retail = wholesale * FACTOR + AI_FEE;
  return Math.round(retail);
}

// ═══════════════════════════════════════════════
// POMOŽNE FUNKCIJE
// ═══════════════════════════════════════════════
export function getSizeLabel(sizeId) {
  const size = canvasSizes.find((s) => s.id === sizeId);
  if (!size) return '';
  return size.displayName
    ? `${size.displayName} (${size.dimensions})`
    : size.dimensions;
}

export function getFrameLabel(frameId) {
  const frame = frameStyles.find((f) => f.id === frameId);
  return frame?.label || null;
}

export function getPrintSpecs(sizeId) {
  const size = canvasSizes.find((s) => s.id === sizeId);
  return size?.printSpecs || null;
}
