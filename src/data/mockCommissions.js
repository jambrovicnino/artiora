// ═══════════════════════════════════════════════
// ARTIORA — Naročila po meri (Commissions)
//
// 2 testni narocili:
//   zakljuceno   — delo koncano in predano
//   v_delu       — umetnik dela na narocilu
//
// Sporocila so v slovenscini za demo prikaz.
// ═══════════════════════════════════════════════

export const COMMISSION_STATUSES = {
  zahteva: { label: 'Zahteva', color: '#6B7280' },
  ponudba: { label: 'Ponudba poslana', color: '#F59E0B' },
  sprejeto: { label: 'Sprejeto', color: '#3B82F6' },
  v_delu: { label: 'V delu', color: '#8B5CF6' },
  pregled: { label: 'V pregledu', color: '#EC4899' },
  zakljuceno: { label: 'Zaključeno', color: '#10B981' },
  preklicano: { label: 'Preklicano', color: '#EF4444' },
};

export const mockCommissions = [
  // ─── 1. ZAKLJUČENO — Nino J. → Nino P. ───
  {
    id: 'comm-001',
    status: 'zakljuceno',
    clientId: 'user-002',
    clientName: 'Nino J.',
    artistId: 'artist-001',
    artistName: 'Nino P.',
    title: 'AI portret psa v slogu Van Gogha',
    description: 'Želim AI-generiran portret mojega psa (labrador) v slogu Van Goghove "Zvezdne noči". Velikost za steno v dnevni sobi.',
    category: 'portreti',
    budgetMin: 80,
    budgetMax: 150,
    currency: 'EUR',
    quotedPrice: 95,
    finalPrice: 95,
    dimensions: '50x70 cm',
    deadline: '2025-06-15T00:00:00.000Z',
    referenceImages: ['/commissions/ref-dog-photo.jpg'],
    deliveredImage: '/commissions/delivered-dog-vangogh.jpg',
    createdAt: '2025-05-10T14:30:00.000Z',
    updatedAt: '2025-06-12T16:00:00.000Z',
    completedAt: '2025-06-12T16:00:00.000Z',
    messages: [
      {
        id: 'msg-001-1',
        senderId: 'user-002',
        senderName: 'Nino J.',
        text: 'Pozdravljeni! Zanima me AI portret mojega psa v Van Goghovem slogu. Prilagam fotografijo. Rad bi imel velikost 50x70 cm za v dnevno sobo.',
        timestamp: '2025-05-10T14:30:00.000Z',
        attachments: ['/commissions/ref-dog-photo.jpg'],
      },
      {
        id: 'msg-001-2',
        senderId: 'user-001',
        senderName: 'Nino P.',
        text: 'Hvala za povpraševanje! Fotografija je odlična za delo. Predlagam portret v slogu "Zvezdne noči" z barvami, ki se ujemajo z vašo dnevno sobo. Cena bi bila 95 EUR, vključno s tiskom na platno in certifikatom.',
        timestamp: '2025-05-10T18:45:00.000Z',
        attachments: [],
      },
      {
        id: 'msg-001-3',
        senderId: 'user-002',
        senderName: 'Nino J.',
        text: 'Odlično, cena mi ustreza! Prosim, začnite z delom. Edina želja je, da so zvezdice v ozadju v modro-vijolični barvi.',
        timestamp: '2025-05-11T09:15:00.000Z',
        attachments: [],
      },
      {
        id: 'msg-001-4',
        senderId: 'user-001',
        senderName: 'Nino P.',
        text: 'Tukaj je prvi osnutek. Poglejte, če vam smer ustreza — barve lahko še prilagodim.',
        timestamp: '2025-05-25T20:00:00.000Z',
        attachments: ['/commissions/draft-dog-vangogh-v1.jpg'],
      },
      {
        id: 'msg-001-5',
        senderId: 'user-002',
        senderName: 'Nino J.',
        text: 'To je fantastično! Morda le malo bolj intenzivna modra v ozadju? Sicer pa sem navdušen!',
        timestamp: '2025-05-26T10:30:00.000Z',
        attachments: [],
      },
      {
        id: 'msg-001-6',
        senderId: 'user-001',
        senderName: 'Nino P.',
        text: 'Končna verzija je pripravljena! Popravil sem intenzivnost modre. Tisk bo pripravljen v 3 delovnih dneh. Hvala za zaupanje!',
        timestamp: '2025-06-10T14:00:00.000Z',
        attachments: ['/commissions/delivered-dog-vangogh.jpg'],
      },
    ],
  },

  // ─── 2. V DELU — Nino J. → Nino P. ───
  {
    id: 'comm-002',
    status: 'v_delu',
    clientId: 'user-002',
    clientName: 'Nino J.',
    artistId: 'artist-001',
    artistName: 'Nino P.',
    title: 'Moderna digitalna umetnina za pisarno',
    description: 'Iščem moderno digitalno delo za steno v pisarni. Velikost približno 80x120 cm, v živahnih barvah, ki dajo prostorom energijo.',
    category: 'moderna',
    budgetMin: 100,
    budgetMax: 200,
    currency: 'EUR',
    quotedPrice: 160,
    finalPrice: null,
    dimensions: '80x120 cm',
    deadline: '2026-06-01T00:00:00.000Z',
    referenceImages: [],
    deliveredImage: null,
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-02-20T14:00:00.000Z',
    completedAt: null,
    messages: [
      {
        id: 'msg-002-1',
        senderId: 'user-002',
        senderName: 'Nino J.',
        text: 'Pozdravljeni! Iščem veliko digitalno umetnino za pisarno — velikost približno 80x120 cm. Rad bi živahne barve, ki dajo prostoru energijo. Proračun imam med 100 in 200 EUR.',
        timestamp: '2026-01-15T10:00:00.000Z',
        attachments: [],
      },
      {
        id: 'msg-002-2',
        senderId: 'user-001',
        senderName: 'Nino P.',
        text: 'Hvala za sporočilo! Za to velikost predlagam AI-generirano abstrakcijo v živahnih barvah. Cena bi bila 160 EUR, vključno s tiskom na platno. Vam to ustreza?',
        timestamp: '2026-01-16T09:20:00.000Z',
        attachments: [],
      },
      {
        id: 'msg-002-3',
        senderId: 'user-002',
        senderName: 'Nino J.',
        text: 'Super, sprejemam! Pisarna ima bele stene in moderno pohištvo v sivih tonih — to bi bilo koristno za barvno paleto.',
        timestamp: '2026-01-17T12:10:00.000Z',
        attachments: [],
      },
    ],
  },
];

export default mockCommissions;
