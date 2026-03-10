import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMarketplace } from '../context/MarketplaceContext';
import { useArtists } from '../context/ArtistContext';
import TierBadge from '../components/marketplace/TierBadge';
import EditionBadge from '../components/marketplace/EditionBadge';
import PriceDisplay from '../components/marketplace/PriceDisplay';
import WishlistButton from '../components/marketplace/WishlistButton';
import ArtworkCard from '../components/marketplace/ArtworkCard';
import ScrollReveal from '../components/ScrollReveal';
import './ArtworkDetailPage.css';

export default function ArtworkDetailPage() {
  const { artworkId } = useParams();
  const { artworks, getArtwork } = useMarketplace();
  const { getArtist } = useArtists();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const artwork = getArtwork(artworkId);
  const artist = artwork ? getArtist(artwork.artistId) : null;

  // Related artworks from the same artist
  const relatedArtworks = useMemo(() => {
    if (!artwork) return [];
    return artworks
      .filter(
        (a) =>
          a.artistId === artwork.artistId &&
          a.id !== artwork.id &&
          (a.status === 'odobrena' || a.status === 'razprodana')
      )
      .slice(0, 4);
  }, [artworks, artwork]);

  // Keyboard handler for lightbox
  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape' && lightboxOpen) setLightboxOpen(false);
    },
    [lightboxOpen]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // Lock body scroll in lightbox
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  // Scroll to top on artwork change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [artworkId]);

  if (!artwork) {
    return (
      <div className="artwork-detail-page">
        <div className="artwork-detail-page__not-found">
          <div className="container">
            <h1>Umetnina ni najdena</h1>
            <p>Žal te umetnine ne najdemo. Morda je bila odstranjena.</p>
            <Link to="/artmarket" className="btn-outline">
              Nazaj na Artmarket
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="artwork-detail-page">
      <ScrollReveal variant="fade-in">
        <section className="artwork-detail-page__main">
          <div className="container">
            <div className="artwork-detail-page__layout">
              {/* Left: Image */}
              <div className="artwork-detail-page__image-col">
                <div
                  className="artwork-detail-page__image-frame corner-brackets"
                  onClick={() => setLightboxOpen(true)}
                >
                  <img
                    className="artwork-detail-page__image"
                    src={artwork.image || artwork.thumbnail}
                    alt={artwork.title}
                  />
                  <div className="artwork-detail-page__zoom-hint">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="11" y1="8" x2="11" y2="14" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Right: Info */}
              <div className="artwork-detail-page__info-col">
                <div className="artwork-detail-page__info-panel">
                  {/* Title */}
                  <h1 className="artwork-detail-page__title">{artwork.title}</h1>

                  {/* Artist */}
                  {artist && (
                    <div className="artwork-detail-page__artist-row">
                      <Link
                        to={`/umetnik/${artist.slug}`}
                        className="artwork-detail-page__artist-link"
                      >
                        {artist.name}
                      </Link>
                      <TierBadge tier={artist.tier} />
                    </div>
                  )}

                  {/* Gold divider */}
                  <div className="artwork-detail-page__divider" />

                  {/* Edition + Price */}
                  <div className="artwork-detail-page__badges">
                    <EditionBadge
                      editionType={artwork.editionType}
                      editionSize={artwork.editionSize}
                      editionsSold={artwork.editionsSold}
                    />
                  </div>

                  <div className="artwork-detail-page__price">
                    <PriceDisplay
                      price={artwork.price}
                      soldOut={artwork.soldOut}
                      editionType={artwork.editionType}
                    />
                  </div>

                  {/* Description */}
                  <p className="artwork-detail-page__description">{artwork.description}</p>

                  {/* Details */}
                  <div className="artwork-detail-page__details">
                    {artwork.medium && (
                      <div className="artwork-detail-page__detail-row">
                        <span className="artwork-detail-page__detail-label">Medij</span>
                        <span className="artwork-detail-page__detail-value">{artwork.medium}</span>
                      </div>
                    )}
                    {artwork.dimensions && (
                      <div className="artwork-detail-page__detail-row">
                        <span className="artwork-detail-page__detail-label">Dimenzije</span>
                        <span className="artwork-detail-page__detail-value">{artwork.dimensions}</span>
                      </div>
                    )}
                    {artwork.style && (
                      <div className="artwork-detail-page__detail-row">
                        <span className="artwork-detail-page__detail-label">Slog</span>
                        <span className="artwork-detail-page__detail-value">{artwork.style}</span>
                      </div>
                    )}
                    {artwork.tags?.length > 0 && (
                      <div className="artwork-detail-page__detail-row">
                        <span className="artwork-detail-page__detail-label">Oznake</span>
                        <span className="artwork-detail-page__detail-value artwork-detail-page__tags">
                          {artwork.tags.map((tag) => (
                            <span key={tag} className="artwork-detail-page__tag">{tag}</span>
                          ))}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* AI badge */}
                  {artwork.isAiGenerated && (
                    <div className="artwork-detail-page__ai-section">
                      <div className="artwork-detail-page__ai-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M12 2L2 7l10 5 10-5-10-5z" />
                          <path d="M2 17l10 5 10-5" />
                          <path d="M2 12l10 5 10-5" />
                        </svg>
                        AI GENERIRANO DELO
                      </div>
                      {artwork.aiPrompt && (
                        <p className="artwork-detail-page__ai-prompt">
                          <strong>Prompt:</strong> {artwork.aiPrompt}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="artwork-detail-page__actions">
                    {!artwork.soldOut && (
                      <Link
                        to={`/cart?add=${artwork.id}`}
                        className="btn-gold-large"
                      >
                        Dodaj v Košarico
                      </Link>
                    )}

                    {artist?.commissionOpen && (
                      <Link
                        to={`/naroci-delo/${artist.id}`}
                        className="btn-outline artwork-detail-page__commission-btn"
                      >
                        Naroči Podobno
                      </Link>
                    )}

                    <div className="artwork-detail-page__wishlist-row">
                      <WishlistButton artworkId={artwork.id} />
                      <span className="artwork-detail-page__wishlist-label">Dodaj med priljubljene</span>
                    </div>
                  </div>

                  {/* Certificate */}
                  {artwork.certificateId && (
                    <div className="artwork-detail-page__certificate">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span>Certifikat avtentičnosti: <strong>{artwork.certificateId}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Related artworks */}
      {relatedArtworks.length > 0 && (
        <ScrollReveal variant="fade-up">
          <section className="artwork-detail-page__related">
            <div className="container">
              <h2 className="artwork-detail-page__related-title">Več od tega umetnika</h2>
              <div className="gold-divider" style={{ marginBottom: '2rem' }} />
              <div className="artwork-detail-page__related-grid">
                {relatedArtworks.map((a) => (
                  <ArtworkCard key={a.id} artwork={a} />
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="artwork-detail-page__lightbox"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="artwork-detail-page__lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Zapri"
          >
            &times;
          </button>
          <img
            className="artwork-detail-page__lightbox-img"
            src={artwork.image || artwork.thumbnail}
            alt={artwork.title}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
