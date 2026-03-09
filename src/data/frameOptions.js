// ═══════════════════════════════════════════════
// ETERNA — Cenovna Struktura (v5)
// Vse maloprodajne cene vključujejo DDV (22%)
//
// 3 plasti izdelka:
//   1. Samo tisk na platno (canvas print)
//   2. Tisk + podokvirjanje + napenjanje (stretched)
//   3. Umetnina z okvirjem (framed artwork)
//
// ─── Nabavne cene ───
// Platno: 25 €/m² (dobavitelj, brez DDV)
//   Cena za posamezno velikost = površina × 25€/m²
// Podokvirjanje + napenjanje: dejanske cene dobavitelja
//   (razlika med canvas print in stretched ceniki)
// Dekorativni okvir: Vidal cenik (€/tm) × obseg
// Delo (okvirjanje): 15 €
//
// ─── Marže (po komponentah) ───
// Platno: 60% marža (×1.60)
// Podokvirjanje: 30% marža (×1.30)
// Dekorativni okvir: 60% marža (×1.60)
// Delo okvirjanja: 60% marža (×1.60)
// DDV: 22% na vse
//
// ─── Impasto gel ───
// Manjše velikosti (≤ 45×60): +30 € (maloprodajni dodatek)
// Večje velikosti (≥ 50×70): +50 € (maloprodajni dodatek)
// ═══════════════════════════════════════════════

// DDV stopnja (Slovenija)
export const DDV_RATE = 0.22;

// ─── Marže po komponentah ───
const CANVAS_MARKUP = 1.60;        // 60% na platno
const STRETCHING_MARKUP = 1.30;    // 30% na podokvirjanje
const FRAME_MARKUP = 1.60;         // 60% na dekorativni okvir
const LABOR_MARKUP = 1.60;         // 60% na delo

// Za zunanjo rabo (FramingStep ipd.) — še vedno 1.60 kot primarni
export const MARKUP = CANVAS_MARKUP;

// ─── Nabavni stroški (EUR, brez DDV) ───
const CANVAS_COST_PER_M2 = 25.00;     // Platno: 25 €/m²
const FRAMING_LABOR = 15.00;          // Ročno delo — samo pri okvirjanju

// ─── Impasto gel — maloprodajni dodatek (z DDV) ───
const IMPASTO_SMALL = 30;  // ≤ 45×60 cm (30 × 40, 40 × 50, 45 × 60)
const IMPASTO_LARGE = 50;  // ≥ 50×70 cm (50 × 70, 60 × 90, 76 × 102)

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
    stretchingCost: 17.05, // 32.05 - 15.00 (razlika med stretched in print)
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
    stretchingCost: 21.92, // 41.92 - 20.00
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
    stretchingCost: 25.58, // 50.58 - 25.00
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
    stretchingCost: 29.23, // 59.23 - 30.00
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
    stretchingCost: 36.54, // 76.54 - 40.00
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
    stretchingCost: 43.36, // 93.36 - 50.00
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
  // ═══════════════════════════════════════════════
  // NEW ERA — živi barvni okvirji za sodobno umetnost
  // Bazirani na Vidal profilih, barvno predelani
  // ═══════════════════════════════════════════════
  {
    id: 'ne-vivid-violet',
    label: 'Vivid Violet',
    profile: 'K115',
    description: 'NEW ERA • Profil K115, 43 × 22 mm — živa vijolična',
    profileDimensions: '43 × 22 mm',
    pricePerTm: 21.20,
    stripImage: '/frames/strips/K115-072.png',
    borderWidth: 19,
    category: 'new-era',
    tint: '#8b5cf6',
    cssStyle: {
      borderWidth: '19px',
      borderStyle: 'solid',
      borderImage: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 30%, #a78bfa 50%, #8b5cf6 70%, #6d28d9 100%) 1',
      boxShadow: 'inset 0 0 8px rgba(109,40,217,0.3), 0 3px 14px rgba(139,92,246,0.25)',
    },
  },
  {
    id: 'ne-electric-blue',
    label: 'Electric Blue',
    profile: '127',
    description: 'NEW ERA • Profil 127/AF, 45 × 32 mm — električno modra',
    profileDimensions: '45 × 32 mm',
    pricePerTm: 21.80,
    stripImage: '/frames/strips/127-AF.png',
    borderWidth: 20,
    category: 'new-era',
    tint: '#3b82f6',
    cssStyle: {
      borderWidth: '20px',
      borderStyle: 'solid',
      borderImage: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 30%, #60a5fa 50%, #3b82f6 70%, #1d4ed8 100%) 1',
      boxShadow: 'inset 0 0 10px rgba(29,78,216,0.3), 0 4px 16px rgba(59,130,246,0.25)',
    },
  },
  {
    id: 'ne-hot-pink',
    label: 'Hot Pink',
    profile: '175',
    description: 'NEW ERA • Profil 175/A, 35 × 30 mm — vroča rožnata',
    profileDimensions: '35 × 30 mm',
    pricePerTm: 23.41,
    stripImage: '/frames/strips/175-A.png',
    borderWidth: 16,
    category: 'new-era',
    tint: '#ec4899',
    cssStyle: {
      borderWidth: '16px',
      borderStyle: 'solid',
      borderImage: 'linear-gradient(135deg, #be185d 0%, #ec4899 30%, #f472b6 50%, #ec4899 70%, #be185d 100%) 1',
      boxShadow: 'inset 0 0 8px rgba(190,24,93,0.3), 0 3px 14px rgba(236,72,153,0.25)',
    },
  },
  {
    id: 'ne-emerald',
    label: 'Emerald',
    profile: '171',
    description: 'NEW ERA • Profil 171/ON, 40 × 37 mm — smaragdno zelena',
    profileDimensions: '40 × 37 mm',
    pricePerTm: 31.84,
    stripImage: '/frames/strips/171-ON.png',
    borderWidth: 18,
    category: 'new-era',
    tint: '#10b981',
    cssStyle: {
      borderWidth: '18px',
      borderStyle: 'solid',
      borderImage: 'linear-gradient(135deg, #047857 0%, #10b981 30%, #34d399 50%, #10b981 70%, #047857 100%) 1',
      boxShadow: 'inset 0 0 10px rgba(4,120,87,0.3), 0 4px 18px rgba(16,185,129,0.25)',
    },
  },
  {
    id: 'ne-sunset-orange',
    label: 'Sunset Orange',
    profile: '290',
    description: 'NEW ERA • Profil 290/A, 75 × 40 mm — sončni zahod',
    profileDimensions: '75 × 40 mm',
    pricePerTm: 43.88,
    stripImage: '/frames/strips/290-A.png',
    borderWidth: 33,
    category: 'new-era',
    tint: '#f97316',
    cssStyle: {
      borderWidth: '33px',
      borderStyle: 'solid',
      borderImage: 'linear-gradient(135deg, #c2410c 0%, #f97316 30%, #fb923c 50%, #f97316 70%, #c2410c 100%) 1',
      boxShadow: 'inset 0 0 14px rgba(194,65,12,0.3), 0 5px 22px rgba(249,115,22,0.25)',
    },
  },
  {
    id: 'ne-deep-magenta',
    label: 'Deep Magenta',
    profile: '3000',
    description: 'NEW ERA • Profil 3000, 85 × 45 mm — globoka magenta',
    profileDimensions: '85 × 45 mm',
    pricePerTm: 47.64,
    stripImage: '/frames/strips/3000-0050.png',
    borderWidth: 34,
    category: 'new-era',
    tint: '#d946ef',
    cssStyle: {
      borderWidth: '34px',
      borderStyle: 'solid',
      borderImage: 'linear-gradient(135deg, #a21caf 0%, #d946ef 30%, #e879f9 50%, #d946ef 70%, #a21caf 100%) 1',
      boxShadow: 'inset 0 0 14px rgba(162,28,175,0.3), 0 5px 24px rgba(217,70,239,0.25)',
    },
  },
  // ═══════════════════════════════════════════════
  // KLASIČNI — Vidal katalog originalnih okvirjev
  // ═══════════════════════════════════════════════
  // ─── Ozki leseni profili ───
  {
    id: 'k112-les', category: 'klasicni',
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
    id: 'k110-les', category: 'klasicni',
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
    id: 'k115-ornament', category: 'klasicni',
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
    id: '127-klasik', category: 'klasicni',
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
    id: '175-zlat', category: 'klasicni',
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
    id: '175-srebrn', category: 'klasicni',
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
    id: '184-vintage', category: 'klasicni',
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
    id: 'aba-modra', category: 'klasicni',
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
    id: '171-ornament', category: 'klasicni',
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
    id: '290-barok', category: 'klasicni',
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
    id: '3000-rdece-zlat', category: 'klasicni',
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
    id: '3000-modro-siv', category: 'klasicni',
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
    id: '3000-crn', category: 'klasicni',
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
    id: '3000-srebrno-zelen', category: 'klasicni',
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
    id: '210-mahagonij', category: 'klasicni',
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
    id: '3000-premium', category: 'klasicni',
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
// NABAVNE POMOŽNE FUNKCIJE
// ═══════════════════════════════════════════════

/** Nabavna cena platna iz površine (25€/m²) */
export function getCanvasCost(sizeId) {
  const [w, h] = sizeId.split('x').map(Number);
  if (!w || !h) return 0;
  return (w * h / 10000) * CANVAS_COST_PER_M2;
}

/** Nabavna cena podokvirjanja in napenjanja (dejanske cene dobavitelja) */
export function getStretcherCost(sizeId) {
  const size = canvasSizes.find((s) => s.id === sizeId);
  return size?.stretchingCost || 0;
}

/** Impasto gel doplačilo (maloprodajno, vključuje DDV) */
export function getImpastoCost(sizeId) {
  const [w, h] = sizeId.split('x').map(Number);
  if (!w || !h) return IMPASTO_SMALL;
  // Meja: ≤ 2700 cm² (45×60) = manjše, > 2700 cm² = večje
  return (w * h) > 2700 ? IMPASTO_LARGE : IMPASTO_SMALL;
}

// ═══════════════════════════════════════════════
// CENOVNA FUNKCIJA — 3 plasti + opcijski impasto
//
// productType: 'print' | 'stretched' | 'framed'
// frameId: ID okvirja (samo pri 'framed')
// withImpasto: boolean (opcijsko, samo pri 'framed')
//
// Formula: nabavna × 1.60 × 1.22 (+ impasto flat)
// ═══════════════════════════════════════════════
export function getPrice(sizeId, productType = 'print', frameId = null, withImpasto = false) {
  const canvasCost = getCanvasCost(sizeId);
  if (!canvasCost) return 0;

  // Vsaka komponenta ima svojo maržo, DDV se doda na koncu
  let markedUp = 0;

  if (productType === PRODUCT_TYPES.PRINT) {
    // Plast 1: samo tisk na platno (60% marža)
    markedUp = canvasCost * CANVAS_MARKUP;
  } else if (productType === PRODUCT_TYPES.STRETCHED) {
    // Plast 2: platno (60%) + podokvirjanje (30%)
    markedUp = canvasCost * CANVAS_MARKUP
             + getStretcherCost(sizeId) * STRETCHING_MARKUP;
  } else if (productType === PRODUCT_TYPES.FRAMED) {
    // Plast 3: platno (60%) + podokvirjanje (30%) + okvir (60%) + delo (60%)
    const frame = frameStyles.find((f) => f.id === frameId);
    if (!frame) return 0;
    const frameCost = frame.pricePerTm * getPerimeter(sizeId);
    markedUp = canvasCost * CANVAS_MARKUP
             + getStretcherCost(sizeId) * STRETCHING_MARKUP
             + frameCost * FRAME_MARKUP
             + FRAMING_LABOR * LABOR_MARKUP;
  }

  // DDV na celotni znesek po marži
  let retail = Math.round(markedUp * (1 + DDV_RATE));

  // Impasto gel: maloprodajni flat dodatek (samo pri okvirjeni umetnini)
  if (withImpasto && productType === PRODUCT_TYPES.FRAMED) {
    retail += getImpastoCost(sizeId);
  }

  return retail;
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

// ═══════════════════════════════════════════════
// STROŠKOVNA ANALIZA — Interno za admina
//
// Vrne podroben izpis vseh stroškov izdelave
// za prikaz v admin emailu ob naročilu.
// ═══════════════════════════════════════════════
export function calculateCostBreakdown(sizeId, productType = 'print', frameId = null, withImpasto = false) {
  const canvasCost = getCanvasCost(sizeId);
  if (!canvasCost) return null;

  let wholesaleCanvas = canvasCost;
  let wholesaleStretcher = 0;
  let wholesaleFrame = 0;
  let framePricePerTm = 0;
  let framePerimeter = 0;
  let laborCost = 0;
  let impastoCost = 0;
  let frameLabel = null;

  if (productType === PRODUCT_TYPES.STRETCHED || productType === PRODUCT_TYPES.FRAMED) {
    wholesaleStretcher = getStretcherCost(sizeId);
  }

  if (productType === PRODUCT_TYPES.FRAMED) {
    const frame = frameStyles.find((f) => f.id === frameId);
    if (frame) {
      framePerimeter = getPerimeter(sizeId);
      framePricePerTm = frame.pricePerTm;
      wholesaleFrame = framePricePerTm * framePerimeter;
      frameLabel = `${frame.label} (${frame.profileDimensions})`;
    }
    laborCost = FRAMING_LABOR;
    if (withImpasto) impastoCost = getImpastoCost(sizeId);
  }

  const totalWholesale = wholesaleCanvas + wholesaleStretcher + wholesaleFrame + laborCost;

  // Per-component markup
  const markedUp = wholesaleCanvas * CANVAS_MARKUP
    + wholesaleStretcher * STRETCHING_MARKUP
    + wholesaleFrame * FRAME_MARKUP
    + laborCost * LABOR_MARKUP;
  const ddvAmount = markedUp * DDV_RATE;
  let retailPrice = Math.round(markedUp + ddvAmount);
  if (withImpasto && productType === PRODUCT_TYPES.FRAMED) {
    retailPrice += impastoCost;
  }
  const profit = retailPrice - totalWholesale - impastoCost;

  return {
    wholesaleCanvas: Math.round(wholesaleCanvas * 100) / 100,
    wholesaleStretcher: Math.round(wholesaleStretcher * 100) / 100,
    stretcherMarkup: STRETCHING_MARKUP,
    wholesaleFrame: Math.round(wholesaleFrame * 100) / 100,
    framePricePerTm: Math.round(framePricePerTm * 100) / 100,
    framePerimeterM: Math.round(framePerimeter * 100) / 100,
    frameLabel,
    laborCost,
    impastoCost,
    totalWholesale: Math.round(totalWholesale * 100) / 100,
    markupFactor: CANVAS_MARKUP,
    ddvRate: DDV_RATE,
    ddvAmount: Math.round(ddvAmount * 100) / 100,
    retailPrice,
    profit: Math.round(profit * 100) / 100,
  };
}

// ═══════════════════════════════════════════════
// SISTEMI ZA OBEŠANJE & POSTAVITEV
//
// Vsako naročilo vključuje sistem za obešanje
// primeren za izbrano velikost (brez doplačila).
// Premium opcije (galerijski tir, varnostni) so doplačilo.
// Police za naslanjanje so ločen izdelek.
// ═══════════════════════════════════════════════

/**
 * Sistem za obešanje ki je vključen v ceno za vsako velikost.
 */
export const HANGING_INCLUDED = {
  '30x40': {
    system: 'sawtooth',
    name: 'Nazobčani obešalnik',
    icon: '🪝',
    contents: ['1× nazobčani obešalnik (prednastavljen)', '1× zidni žebelj'],
    maxWeight: '5 kg',
  },
  '40x50': {
    system: 'sawtooth',
    name: 'Nazobčani obešalnik',
    icon: '🪝',
    contents: ['1× nazobčani obešalnik (prednastavljen)', '1× zidni žebelj'],
    maxWeight: '5 kg',
  },
  '45x60': {
    system: 'd-rings',
    name: 'D-obroča + jeklena žica',
    icon: '🔗',
    contents: ['2× D-obroč (prednastavljena)', '1× jeklena žica', '1× zidna kljuka', '1× Fischer vložek 6mm'],
    maxWeight: '15 kg',
  },
  '50x70': {
    system: 'd-rings',
    name: 'D-obroča + jeklena žica',
    icon: '🔗',
    contents: ['2× D-obroč (prednastavljena)', '1× jeklena žica', '2× zidna kljuka', '2× Fischer vložek 6mm'],
    maxWeight: '15 kg',
  },
  '60x90': {
    system: 'd-rings-plus',
    name: 'D-obroča + žica + Z-bar opcija',
    icon: '📐',
    contents: ['2× D-obroč (prednastavljena)', '1× jeklena žica', '2× zidna kljuka', '2× Fischer vložek 8mm', '1× aluminijasti Z-bar komplet'],
    maxWeight: '25 kg',
  },
  '76x102': {
    system: 'z-bar',
    name: 'Z-bar profesionalni sistem',
    icon: '📐',
    contents: ['1× aluminijasti Z-bar (polna širina)', '2× D-obroč + jeklena žica (rezerva)', '4× Fischer vložek 8mm + vijaki', '1× libela nalepka'],
    maxWeight: '50 kg',
  },
};

/**
 * Premium sistemi za obešanje (doplačilo).
 */
export const HANGING_UPGRADES = [
  {
    id: 'gallery-rail',
    name: 'Galerijski tirni sistem',
    icon: '🏛',
    description: 'STAS Cliprail aluminijast tir (150 cm) + 2 jekleni vrvi + kljuki. Premikanje slik brez novih lukenj.',
    price: 45,
    fits: ['30x40', '40x50', '45x60', '50x70', '60x90', '76x102'],
  },
  {
    id: 'security',
    name: 'Varnostni sistem',
    icon: '🔒',
    description: 'T-vijak z varnostnim ključem. Za pisarne, hotele, restavracije in javne prostore.',
    price: 15,
    fits: ['30x40', '40x50', '45x60', '50x70', '60x90', '76x102'],
  },
  {
    id: 'adhesive-kit',
    name: 'Komplet brez vrtanja',
    icon: '📎',
    description: 'tesa Powerstrips — za najem ali občutljive stene. Brez lukenj, enostavna odstranitev.',
    price: 8,
    fits: ['30x40', '40x50'],
  },
];

/**
 * Police za naslanjanje slik (ločen izdelek).
 */
export const PICTURE_LEDGES = [
  {
    id: 'ledge-60',
    name: 'Polica 60 cm',
    icon: '📏',
    length: 60,
    description: 'Lesena polica za naslanjanje 1–2 slik. Na voljo v beli, črni in naravni hrastovi barvi.',
    price: 29,
    fits: ['30x40', '40x50'],
  },
  {
    id: 'ledge-90',
    name: 'Polica 90 cm',
    icon: '📏',
    length: 90,
    description: 'Lesena polica za naslanjanje 2–3 slik. Na voljo v beli, črni in naravni hrastovi barvi.',
    price: 39,
    fits: ['30x40', '40x50', '45x60', '50x70'],
  },
  {
    id: 'ledge-120',
    name: 'Polica 120 cm',
    icon: '📏',
    length: 120,
    description: 'Lesena polica za naslanjanje 3–4 slik. Na voljo v beli, črni in naravni hrastovi barvi.',
    price: 49,
    fits: ['30x40', '40x50', '45x60', '50x70', '60x90'],
  },
];
