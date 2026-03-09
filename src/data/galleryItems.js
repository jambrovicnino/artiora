// ═══════════════════════════════════════════════
// ETERNA ARTISAN — Galerija umetnin
//
// Kategorije in umetnine. Slike dodaj v public/gallery/
// in posodobi vnose spodaj.
//
// Struktura:
//   id        — unikatni ID
//   src       — pot do slike (public/gallery/...)
//   title     — naslov umetnine
//   category  — kategorija (mora biti v CATEGORIES)
//   style     — umetniški slog (oljno, akvarel, itd.)
//   size      — velikost platna
//   frame     — ID okvirja iz frameOptions.js
//   featured  — ali je prikazana na domači strani
// ═══════════════════════════════════════════════

export const CATEGORIES = [
  { id: 'vse', label: 'Vse' },
  { id: 'pokrajine', label: 'Pokrajine' },
  { id: 'abstrakt', label: 'Abstrakt' },
  { id: 'portreti', label: 'Portreti' },
  { id: 'tihozitja', label: 'Tihožitja' },
  { id: 'moderna', label: 'Moderna' },
];

export const galleryItems = [
  // ─── Pokrajine ───
  {
    id: 'art-001',
    src: '/gallery/bled-cerkvija.png',
    title: 'Bled s Cerkvijo',
    category: 'pokrajine',
    style: 'Oljno slikarstvo',
    size: '50×70 cm',
    frame: '290-barok',
    featured: true,
  },
  {
    id: 'art-002',
    src: '/gallery/gorski-zahod.png',
    title: 'Gorski Sončni Zahod',
    category: 'pokrajine',
    style: 'Impresionizem',
    size: '50×70 cm',
    frame: 'ne-vivid-violet',
    featured: false,
  },
  {
    id: 'art-003',
    src: '/gallery/jesenski-gozd.png',
    title: 'Jesenski Gozd',
    category: 'pokrajine',
    style: 'Oljno slikarstvo',
    size: '50×70 cm',
    frame: 'k115-ornament',
    featured: false,
  },
  {
    id: 'art-004',
    src: '/gallery/megleno-jutro.png',
    title: 'Megleno Jutro ob Jezeru',
    category: 'pokrajine',
    style: 'Akvarel',
    size: '50×70 cm',
    frame: '171-ornament',
    featured: false,
  },
  {
    id: 'art-011',
    src: '/gallery/morski-valovi.png',
    title: 'Morski Valovi',
    category: 'pokrajine',
    style: 'Oljno slikarstvo',
    size: '60×90 cm',
    frame: '3000-premium',
    featured: true,
  },
  {
    id: 'art-012',
    src: '/gallery/cvetlicna-livada.png',
    title: 'Cvetlična Livada',
    category: 'pokrajine',
    style: 'Impresionizem',
    size: '50×70 cm',
    frame: '127-klasik',
    featured: true,
  },
  // ─── Abstrakt ───
  {
    id: 'art-005',
    src: '/gallery/modro-zlati-abstrakt.png',
    title: 'Modro-Zlati Abstrakt',
    category: 'abstrakt',
    style: 'Moderna umetnost',
    size: '50×70 cm',
    frame: '175-zlat',
    featured: true,
  },
  {
    id: 'art-006',
    src: '/gallery/geometrijski-abstrakt.png',
    title: 'Geometrijska Harmonija',
    category: 'abstrakt',
    style: 'Moderna umetnost',
    size: '50×70 cm',
    frame: '3000-rdece-zlat',
    featured: false,
  },
  {
    id: 'art-007',
    src: '/gallery/ekspresionizem.png',
    title: 'Ekspresionistična Energija',
    category: 'abstrakt',
    style: 'Ekspresionizem',
    size: '60×90 cm',
    frame: 'ne-emerald',
    featured: true,
  },
  // ─── Moderna ───
  {
    id: 'art-008',
    src: '/gallery/pop-art-cvetje.png',
    title: 'Pop Art Sončnice',
    category: 'moderna',
    style: 'Pop Art',
    size: '50×70 cm',
    frame: '3000-crn',
    featured: true,
  },
  {
    id: 'art-009',
    src: '/gallery/minimalizem-drevo.png',
    title: 'Minimalistično Drevo',
    category: 'moderna',
    style: 'Minimalizem',
    size: '50×70 cm',
    frame: 'k112-les',
    featured: false,
  },
  {
    id: 'art-010',
    src: '/gallery/urbana-ulica.png',
    title: 'Urbana Ulica ob Mraku',
    category: 'moderna',
    style: 'Impresionizem',
    size: '50×70 cm',
    frame: 'ne-electric-blue',
    featured: false,
  },
];

export default galleryItems;
