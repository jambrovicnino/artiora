/* ═══════════════════════════════════════════════
   ARTIORA — Artist Tier & Edition System
   ═══════════════════════════════════════════════ */

export const ARTIST_TIERS = [
  {
    id: 'nov',
    label: 'Nov Umetnik',
    labelEn: 'New Artist',
    icon: '🌱',
    color: '#10b981',
    requirements: 'Registracija in prva umetnina',
    requirementsEn: 'Registration and first artwork',
    benefits: ['Osnoven profil', 'Do 10 umetnin', 'QR certifikati'],
    benefitsEn: ['Basic profile', 'Up to 10 artworks', 'QR certificates'],
    maxListings: 10,
    commissionRate: 0.20,
  },
  {
    id: 'potrjen',
    label: 'Potrjen Umetnik',
    labelEn: 'Verified Artist',
    icon: '✓',
    color: '#3b82f6',
    requirements: '10+ prodaj, 4.0+ ocena',
    requirementsEn: '10+ sales, 4.0+ rating',
    benefits: ['Priporočen v iskanju', 'Do 50 umetnin', 'Naročila strank'],
    benefitsEn: ['Recommended in search', 'Up to 50 artworks', 'Customer commissions'],
    maxListings: 50,
    commissionRate: 0.15,
  },
  {
    id: 'priporocen',
    label: 'Priporočen Umetnik',
    labelEn: 'Recommended Artist',
    icon: '★',
    color: '#8b5cf6',
    requirements: '50+ prodaj, 4.5+ ocena, 6+ mesecev',
    requirementsEn: '50+ sales, 4.5+ rating, 6+ months',
    benefits: ['Izpostavljen na domači', 'Neomejeno umetnin', 'Znižana provizija'],
    benefitsEn: ['Featured on homepage', 'Unlimited artworks', 'Reduced commission'],
    maxListings: Infinity,
    commissionRate: 0.12,
  },
  {
    id: 'mojster',
    label: 'Mojster Umetnik',
    labelEn: 'Master Artist',
    icon: '♛',
    color: '#eab308',
    requirements: 'Povabilo platforme ali 200+ prodaj',
    requirementsEn: 'Platform invitation or 200+ sales',
    benefits: ['Posebna sekcija na domači', 'Promocijski paket', 'Najnižja provizija'],
    benefitsEn: ['Special homepage section', 'Promotional package', 'Lowest commission'],
    maxListings: Infinity,
    commissionRate: 0.08,
  },
];

export const EDITION_TYPES = [
  {
    id: 'unikat',
    label: 'UNIKAT',
    labelEn: 'Unique (1/1)',
    description: 'Edina kopija — nikoli ponovljena',
    descriptionEn: 'One of a kind — never reproduced',
    badge: '1/1',
    color: '#eab308',
  },
  {
    id: 'limitirana',
    label: 'LIMITIRANA SERIJA',
    labelEn: 'Limited Edition',
    description: 'Omejena na 2–50 kopij. Vsaka oštevilčena.',
    descriptionEn: 'Limited to 2–50 copies. Each numbered.',
    badge: 'LS',
    color: '#8b5cf6',
  },
  {
    id: 'odprta',
    label: 'ODPRTA SERIJA',
    labelEn: 'Open Edition',
    description: 'Brez omejitev. Vedno na voljo.',
    descriptionEn: 'No limits. Always available.',
    badge: 'OS',
    color: '#3b82f6',
  },
];

export const ARTWORK_CATEGORIES = [
  { id: 'abstrakt', label: 'Abstrakt', labelEn: 'Abstract' },
  { id: 'pokrajine', label: 'Pokrajine', labelEn: 'Landscapes' },
  { id: 'portreti', label: 'Portreti', labelEn: 'Portraits' },
  { id: 'moderna', label: 'Moderna', labelEn: 'Modern' },
  { id: 'pop-art', label: 'Pop Art', labelEn: 'Pop Art' },
  { id: 'impresionizem', label: 'Impresionizem', labelEn: 'Impressionism' },
  { id: 'digitalna', label: 'Digitalna umetnost', labelEn: 'Digital Art' },
  { id: 'fotografija', label: 'Fotografija', labelEn: 'Photography' },
  { id: 'ulicna', label: 'Ulična umetnost', labelEn: 'Street Art' },
  { id: 'minimalizem', label: 'Minimalizem', labelEn: 'Minimalism' },
];

export const ARTWORK_MEDIUMS = [
  { id: 'ai-digitalna', label: 'AI Digitalna umetnost', labelEn: 'AI Digital Art' },
  { id: 'digitalna', label: 'Digitalna umetnost', labelEn: 'Digital Art' },
  { id: 'oljno', label: 'Oljno slikarstvo', labelEn: 'Oil Painting' },
  { id: 'akvarel', label: 'Akvarel', labelEn: 'Watercolor' },
  { id: 'akril', label: 'Akril', labelEn: 'Acrylic' },
  { id: 'mesana', label: 'Mešana tehnika', labelEn: 'Mixed Media' },
  { id: 'fotografija', label: 'Fotografija', labelEn: 'Photography' },
  { id: 'grafika', label: 'Grafika', labelEn: 'Print/Graphics' },
];

export const COMMISSION_STATUSES = [
  { id: 'zahteva', label: 'Zahteva', labelEn: 'Request', color: '#3b82f6' },
  { id: 'ponudba', label: 'Ponudba', labelEn: 'Quote Sent', color: '#8b5cf6' },
  { id: 'sprejeto', label: 'Sprejeto', labelEn: 'Accepted', color: '#10b981' },
  { id: 'v_delu', label: 'V delu', labelEn: 'In Progress', color: '#eab308' },
  { id: 'dostavljeno', label: 'Dostavljeno', labelEn: 'Delivered', color: '#f97316' },
  { id: 'zakljuceno', label: 'Zaključeno', labelEn: 'Completed', color: '#4a7c59' },
  { id: 'preklicano', label: 'Preklicano', labelEn: 'Cancelled', color: '#c94444' },
];

export function getTier(tierId) {
  return ARTIST_TIERS.find(t => t.id === tierId) || ARTIST_TIERS[0];
}

export function getEditionType(typeId) {
  return EDITION_TYPES.find(t => t.id === typeId) || EDITION_TYPES[2];
}
