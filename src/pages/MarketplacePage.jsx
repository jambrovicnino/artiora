import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMarketplace } from '../context/MarketplaceContext';
import { useArtists } from '../context/ArtistContext';
import ArtworkFilters from '../components/marketplace/ArtworkFilters';
import ArtworkSort from '../components/marketplace/ArtworkSort';
import ArtworkGrid from '../components/marketplace/ArtworkGrid';
import ScrollReveal from '../components/ScrollReveal';
import './MarketplacePage.css';

const SORT_OPTIONS_MAP = {
  newest: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  oldest: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
  'price-asc': (a, b) => (a.price || 0) - (b.price || 0),
  'price-desc': (a, b) => (b.price || 0) - (a.price || 0),
  'title-asc': (a, b) => (a.title || '').localeCompare(b.title || '', 'sl'),
  'title-desc': (a, b) => (b.title || '').localeCompare(a.title || '', 'sl'),
};

export default function MarketplacePage() {
  const { artworks } = useMarketplace();
  const { getArtist } = useArtists();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Read filters from URL search params
  const filtersFromUrl = useMemo(() => {
    const f = {};
    const cats = searchParams.get('categories');
    if (cats) f.categories = cats.split(',');
    const meds = searchParams.get('mediums');
    if (meds) f.mediums = meds.split(',');
    const et = searchParams.get('editionType');
    if (et) f.editionType = et;
    const pMin = searchParams.get('priceMin');
    if (pMin) f.priceMin = Number(pMin);
    const pMax = searchParams.get('priceMax');
    if (pMax) f.priceMax = Number(pMax);
    const search = searchParams.get('search');
    if (search) f.search = search;
    return f;
  }, [searchParams]);

  const sortFromUrl = searchParams.get('sort') || 'newest';

  const [filters, setFilters] = useState(filtersFromUrl);
  const [sort, setSort] = useState(sortFromUrl);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.categories?.length) params.set('categories', filters.categories.join(','));
    if (filters.mediums?.length) params.set('mediums', filters.mediums.join(','));
    if (filters.editionType) params.set('editionType', filters.editionType);
    if (filters.priceMin != null) params.set('priceMin', String(filters.priceMin));
    if (filters.priceMax != null) params.set('priceMax', String(filters.priceMax));
    if (filters.search) params.set('search', filters.search);
    if (sort && sort !== 'newest') params.set('sort', sort);
    setSearchParams(params, { replace: true });
  }, [filters, sort, setSearchParams]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleSortChange = useCallback((newSort) => {
    setSort(newSort);
  }, []);

  // Filter and sort artworks
  const displayArtworks = useMemo(() => {
    // Only show approved or sold-out artworks
    let results = artworks.filter(
      (a) => a.status === 'odobrena' || a.status === 'razprodana'
    );

    // Categories filter (array)
    if (filters.categories?.length) {
      results = results.filter((a) => filters.categories.includes(a.category));
    }

    // Mediums filter (array - match on medium field text)
    if (filters.mediums?.length) {
      results = results.filter((a) => {
        const m = (a.medium || '').toLowerCase();
        return filters.mediums.some((mid) => m.includes(mid));
      });
    }

    // Edition type
    if (filters.editionType) {
      results = results.filter((a) => a.editionType === filters.editionType);
    }

    // Price range
    if (filters.priceMin != null) {
      results = results.filter((a) => a.price >= filters.priceMin);
    }
    if (filters.priceMax != null) {
      results = results.filter((a) => a.price <= filters.priceMax);
    }

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter((a) => {
        const artist = getArtist(a.artistId);
        return (
          (a.title && a.title.toLowerCase().includes(q)) ||
          (a.description && a.description.toLowerCase().includes(q)) ||
          (artist?.name && artist.name.toLowerCase().includes(q)) ||
          (a.tags && a.tags.some((tag) => tag.toLowerCase().includes(q)))
        );
      });
    }

    // Sort
    const sortFn = SORT_OPTIONS_MAP[sort];
    if (sortFn) {
      results.sort(sortFn);
    }

    return results;
  }, [artworks, filters, sort, getArtist]);

  return (
    <div className="marketplace-page">
      {/* Hero */}
      <ScrollReveal variant="fade-in">
        <div className="marketplace-page__hero">
          <div className="container">
            <span className="marketplace-page__label">ARTIORA</span>
            <h1 className="marketplace-page__heading">TRŽNICA</h1>
            <div className="gold-divider" />
            <p className="marketplace-page__subtitle">
              Odkrijte edinstvena umetniška dela certificiranih umetnikov
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Mobile filter toggle */}
      <div className="marketplace-page__mobile-toggle">
        <div className="container">
          <button
            className="marketplace-page__filter-btn"
            onClick={() => setMobileFiltersOpen((o) => !o)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="16" y2="12" />
              <line x1="4" y1="18" x2="12" y2="18" />
            </svg>
            <span>{mobileFiltersOpen ? 'SKRIJ FILTRE' : 'PRIKAŽI FILTRE'}</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <section className="marketplace-page__content">
        <div className="container">
          <div className="marketplace-page__layout">
            {/* Sidebar */}
            <div className={`marketplace-page__sidebar ${mobileFiltersOpen ? 'marketplace-page__sidebar--open' : ''}`}>
              <ArtworkFilters
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>

            {/* Results */}
            <div className="marketplace-page__results">
              <ArtworkSort
                sort={sort}
                onSortChange={handleSortChange}
                resultCount={displayArtworks.length}
              />
              <ArtworkGrid artworks={displayArtworks} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
