// ═══════════════════════════════════════════════
// ARTIORA — Mock Data Seeder
//
// Seeds localStorage with initial data on first visit.
// Runs once, then skips on subsequent visits.
// ═══════════════════════════════════════════════

import { mockArtists } from '../data/mockArtists';
import { mockArtworks } from '../data/mockArtworks';
import { mockCommissions } from '../data/mockCommissions';
import { mockReviews } from '../data/mockReviews';

const SEED_KEY = 'artiora_seeded';

export function seedMockData() {
  if (localStorage.getItem(SEED_KEY)) return;

  console.log('[ARTIORA] Seeding mock data...');

  // Only seed if keys don't exist yet
  const seeds = {
    artiora_artists: { artists: mockArtists },
    artiora_marketplace: { artworks: mockArtworks, editions: [] },
    artiora_commissions: { commissions: mockCommissions },
    artiora_reviews: mockReviews,
  };

  Object.entries(seeds).forEach(([key, data]) => {
    if (!localStorage.getItem(key)) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.warn(`[ARTIORA] Could not seed ${key}:`, e.message);
      }
    }
  });

  localStorage.setItem(SEED_KEY, new Date().toISOString());
  console.log('[ARTIORA] Mock data seeded successfully');
}

/**
 * Reset all seeded data (useful for development).
 * Removes the seed flag and all seeded localStorage keys.
 */
export function resetMockData() {
  const keys = [
    SEED_KEY,
    'artiora_artists',
    'artiora_marketplace',
    'artiora_commissions',
    'artiora_reviews',
  ];

  keys.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[ARTIORA] Could not remove ${key}:`, e.message);
    }
  });

  console.log('[ARTIORA] Mock data reset. Will re-seed on next call.');
}
