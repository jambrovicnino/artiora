import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useMarketplace } from '../context/MarketplaceContext';
import ArtworkGrid from '../components/marketplace/ArtworkGrid';
import ScrollReveal from '../components/ScrollReveal';
import './WishlistPage.css';

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const { getArtwork } = useMarketplace();

  const wishlistedArtworks = useMemo(() => {
    return wishlist
      .map((id) => getArtwork(id))
      .filter(Boolean);
  }, [wishlist, getArtwork]);

  return (
    <div className="wishlist-page">
      {/* Hero */}
      <ScrollReveal variant="fade-in">
        <div className="wishlist-page__hero">
          <div className="container">
            <span className="wishlist-page__label">ARTIORA</span>
            <h1 className="wishlist-page__heading">PRILJUBLJENE</h1>
            <div className="gold-divider" />
            <p className="wishlist-page__subtitle">
              Vaša zbirka priljubljenih umetnin
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Content */}
      <section className="wishlist-page__content">
        <div className="container">
          {wishlistedArtworks.length > 0 ? (
            <>
              <div className="wishlist-page__count">
                {wishlistedArtworks.length}{' '}
                {wishlistedArtworks.length === 1
                  ? 'umetnina'
                  : wishlistedArtworks.length < 5
                    ? 'umetnine'
                    : 'umetnin'}
              </div>
              <ArtworkGrid artworks={wishlistedArtworks} />
            </>
          ) : (
            <div className="wishlist-page__empty">
              <div className="wishlist-page__empty-icon">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h2 className="wishlist-page__empty-title">
                Vaša lista priljubljenih je prazna
              </h2>
              <p className="wishlist-page__empty-text">
                Brskajte po Artmarketu in dodajte umetnine med priljubljene s klikom na ikono srca.
              </p>
              <Link to="/artmarket" className="btn-gold">
                Razišči Artmarket
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
