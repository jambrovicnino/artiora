// ═══════════════════════════════════════════════
// ARTIORA — Ocene in mnenja
//
// 12 ocen razporejenih med 5 umetnikov:
//   Nino     — 4 ocene
//   Maja     — 3 ocene
//   Ana      — 2 oceni
//   Petra    — 1 ocena
//   Marko    — 2 oceni
//
// Vse ocene so pozitivne (4-5 zvezdic).
// Besedila so v slovenscini.
// ═══════════════════════════════════════════════

export const mockReviews = [
  // ─── Nino P. (artist-001) — 4 ocene ───
  {
    id: 'rev-001',
    buyerId: 'user-004',
    buyerName: 'Luka B.',
    artistId: 'artist-001',
    artworkId: 'aw-003',
    rating: 5,
    text: 'Ekspresionistična Energija je presenetila z intenzivnostjo barv in čustev. Nino je mojster AI umetnosti — delo izgleda kot ročno naslikano. Dostava je bila hitra, platno je vrhunske kakovosti.',
    createdAt: '2025-06-20T10:00:00.000Z',
  },
  {
    id: 'rev-002',
    buyerId: 'user-003',
    buyerName: 'Ana Vidmar',
    artistId: 'artist-001',
    artworkId: 'aw-001',
    rating: 5,
    text: 'Modro-Zlati Abstrakt krasi mojo dnevno sobo. Barve so še lepše v živo kot na fotografijah. Odlična komunikacija in hitra izvedba.',
    createdAt: '2025-07-05T14:30:00.000Z',
  },
  {
    id: 'rev-003',
    buyerId: 'user-002',
    buyerName: 'Maja Kovač',
    artistId: 'artist-001',
    artworkId: 'aw-005',
    rating: 4,
    text: 'Minimalistično Drevo je čudovit kos. Všeč mi je preprostost in eleganca. Edina pripomba — okvir bi lahko bil malo bolj robusten, a sama umetnina je brezhibna.',
    createdAt: '2025-08-12T09:15:00.000Z',
  },
  {
    id: 'rev-004',
    buyerId: 'user-004',
    buyerName: 'Luka B.',
    artistId: 'artist-001',
    artworkId: 'comm-001',
    rating: 5,
    text: 'Naročilo po meri — portret psa v Van Goghovem slogu — je presegel vsa pričakovanja! Nino je bil odziven, popravki so bili hitri, končni rezultat pa je fantastičen. Priporočam vsem!',
    createdAt: '2025-06-15T16:00:00.000Z',
  },

  // ─── Maja Kovač (artist-002) — 3 ocene ───
  {
    id: 'rev-005',
    buyerId: 'user-004',
    buyerName: 'Luka B.',
    artistId: 'artist-002',
    artworkId: 'aw-008',
    rating: 5,
    text: 'Bled s Cerkvijo je mojstrovina. Maja je ujela tisto posebno jutranjo svetlobo, ki jo pozna vsak, ki je bil ob jezeru. Slika je zdaj ponos naše dnevne sobe.',
    createdAt: '2024-08-10T11:00:00.000Z',
  },
  {
    id: 'rev-006',
    buyerId: 'user-003',
    buyerName: 'Ana Vidmar',
    artistId: 'artist-002',
    artworkId: 'aw-012',
    rating: 5,
    text: 'Cvetlična Livada diha s poletjem! Impresionistični potezi so polni življenja. Maja slika z dušo — to se čuti v vsakem delu.',
    createdAt: '2025-03-22T13:45:00.000Z',
  },
  {
    id: 'rev-007',
    buyerId: 'user-005',
    buyerName: 'Petra Novak',
    artistId: 'artist-002',
    artworkId: 'aw-009',
    rating: 4,
    text: 'Gorski Sončni Zahod je prečudovit. Barve so bogate in tople. Slika je prišla lepo zapakirano in pravočasno. Priporočam vsakomur, ki ljubi slovensko pokrajino.',
    createdAt: '2025-04-18T17:20:00.000Z',
  },

  // ─── Ana Vidmar (artist-003) — 2 oceni ───
  {
    id: 'rev-008',
    buyerId: 'user-004',
    buyerName: 'Luka B.',
    artistId: 'artist-003',
    artworkId: 'aw-015',
    rating: 5,
    text: 'Portret z Rožami je čudovito darilo za ženo. Ana ima neverjetno sposobnost ujeti čustva z akvarelom. Nežne barve in detajli so osupljivi.',
    createdAt: '2024-12-24T09:00:00.000Z',
  },
  {
    id: 'rev-009',
    buyerId: 'user-002',
    buyerName: 'Maja Kovač',
    artistId: 'artist-003',
    artworkId: 'aw-018',
    rating: 4,
    text: 'Cvetni Minimalizem je lep dodatek k moji zbirki. Anin slog je osvežujoče drugačen — manj je več. Kvaliteta akvarela na papirju je odlična.',
    createdAt: '2025-05-10T15:30:00.000Z',
  },

  // ─── Petra Novak (artist-004) — 1 ocena ───
  {
    id: 'rev-010',
    buyerId: 'user-004',
    buyerName: 'Luka B.',
    artistId: 'artist-004',
    artworkId: 'aw-019',
    rating: 4,
    text: 'Digitalni Valovi je zanimivo delo za moderno pisarno. Petra je nova na sceni, ampak kaže velik potencial. Cena je zelo ugodna za kvaliteto, ki jo dobiš.',
    createdAt: '2025-11-05T12:00:00.000Z',
  },

  // ─── Marko Dolenc (artist-005) — 2 oceni ───
  {
    id: 'rev-011',
    buyerId: 'user-004',
    buyerName: 'Luka B.',
    artistId: 'artist-005',
    artworkId: 'aw-023',
    rating: 5,
    text: 'Urbana Ulica ob Mraku je fotografija, ki govori zgodbe. Markova sposobnost ujeti vzdušje mesta ponoči je izjemna. Tisk na alu-dibond je vrhunske kakovosti.',
    createdAt: '2025-02-14T18:00:00.000Z',
  },
  {
    id: 'rev-012',
    buyerId: 'user-003',
    buyerName: 'Ana Vidmar',
    artistId: 'artist-005',
    artworkId: 'aw-025',
    rating: 4,
    text: 'Abstraktna Refleksija me je presenetila — iz preprostih luž je Marko ustvaril umetniško delo. Fotografija je prelepa za v galerijo ali domačo steno.',
    createdAt: '2025-04-30T11:45:00.000Z',
  },
];

export default mockReviews;
