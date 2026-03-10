// ═══════════════════════════════════════════════
// ARTIORA — Demo uporabniki
//
// 5 testnih racunov za razvoj in prikaz.
// Gesla so namenjena samo za demo!
// ═══════════════════════════════════════════════

export const mockUsers = [
  {
    id: 'user-001',
    email: 'nino@artiora.si',
    password: 'demo123',
    name: 'Nino P.',
    role: 'admin', // owner is admin + artist
    artistId: 'artist-001',
    avatar: '/artists/nino-avatar.jpg',
  },
  {
    id: 'user-002',
    email: 'maja@artiora.si',
    password: 'demo123',
    name: 'Maja Kovač',
    role: 'artist',
    artistId: 'artist-002',
    avatar: '/artists/maja-avatar.jpg',
  },
  {
    id: 'user-003',
    email: 'ana@artiora.si',
    password: 'demo123',
    name: 'Ana Vidmar',
    role: 'artist',
    artistId: 'artist-003',
    avatar: '/artists/ana-avatar.jpg',
  },
  {
    id: 'user-004',
    email: 'luka@test.si',
    password: 'demo123',
    name: 'Luka B.',
    role: 'customer',
    artistId: null,
    avatar: null,
  },
  {
    id: 'user-005',
    email: 'petra@artiora.si',
    password: 'demo123',
    name: 'Petra Novak',
    role: 'artist',
    artistId: 'artist-004',
    avatar: '/artists/petra-avatar.jpg',
  },
];

export default mockUsers;
