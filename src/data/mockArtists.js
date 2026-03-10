// ═══════════════════════════════════════════════
// ARTIORA — Umetniki
//
// 1 umetniski profil za demo prikaz.
//
// Tier sistem:
//   mojster      — najvišji nivo, ustanovitelj
//   priporocen   — priporočen, izkušen umetnik
//   potrjen      — potrjen umetnik
//   nov          — nov na platformi
// ═══════════════════════════════════════════════

export const mockArtists = [
  {
    id: 'artist-001',
    userId: 'user-001',
    name: 'Nino P.',
    slug: 'nino-p',
    bio: 'Ustanovitelj platforme ARTIORA in digitalni umetnik, ki ustvarja edinstvena dela s pomočjo AI promptinga in lastne umetniške vizije. Specializiran za abstrakt, generativno umetnost in eksperimentalne digitalne kompozicije. Vsako delo nastane skozi skrbno oblikovane AI napotke, ki jih nato ročno dodelam in prilagodim do končne podobe.',
    avatar: '/artists/nino-avatar.jpg',
    coverImage: '/artists/nino-cover.jpg',
    location: 'Ljubljana, Slovenija',
    tier: 'mojster',
    specialties: ['AI Art', 'Digitalna umetnost', 'Abstrakt'],
    rating: 4.9,
    reviewCount: 42,
    totalSales: 156,
    joinedDate: '2024-01-15T00:00:00.000Z',
    commissionOpen: true,
    commissionMinBudget: 50,
    socialLinks: {
      website: 'https://artiora.si',
      instagram: '@artiora.si',
      twitter: null,
    },
    featured: true,
    isOwner: true,
  },
];

export default mockArtists;
