// ═══════════════════════════════════════════════
// ARTIORA — Demo uporabniki
//
// 2 testna racuna za razvoj in prikaz.
// Gesla so namenjena samo za demo!
// ═══════════════════════════════════════════════

export const mockUsers = [
  {
    id: 'user-001',
    email: 'psn.nino4@gmail.com',
    password: 'demo123',
    name: 'Nino P.',
    role: 'admin', // owner is admin + artist
    artistId: 'artist-001',
    avatar: '/artists/nino-avatar.jpg',
  },
  {
    id: 'user-002',
    email: 'jambrovic.nino@gmail.com',
    password: 'demo123',
    name: 'Nino J.',
    role: 'customer',
    artistId: null,
    avatar: null,
  },
];

export default mockUsers;
