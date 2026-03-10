import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useArtists } from '../context/ArtistContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { mockReviews } from '../data/mockReviews';
import TierBadge from '../components/marketplace/TierBadge';
import ArtworkCard from '../components/marketplace/ArtworkCard';
import ScrollReveal from '../components/ScrollReveal';
import './ArtistProfilePage.css';

function StarRating({ rating, size = 14 }) {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="var(--gold)" stroke="var(--gold)" strokeWidth="1">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    } else if (half && i === full) {
      stars.push(
        <svg key={i} width={size} height={size} viewBox="0 0 24 24">
          <defs>
            <linearGradient id={`profile-half-${i}`}>
              <stop offset="50%" stopColor="var(--gold)" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={`url(#profile-half-${i})`} stroke="var(--gold)" strokeWidth="1" />
        </svg>
      );
    } else {
      stars.push(
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    }
  }

  return <div style={{ display: 'flex', gap: '2px' }}>{stars}</div>;
}

function ReviewCard({ review }) {
  return (
    <div className="artist-profile__review">
      <div className="artist-profile__review-header">
        <span className="artist-profile__review-buyer">{review.buyerName}</span>
        <StarRating rating={review.rating} size={12} />
      </div>
      <p className="artist-profile__review-text">{review.text}</p>
      <span className="artist-profile__review-date">
        {new Date(review.createdAt).toLocaleDateString('sl-SI', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </span>
    </div>
  );
}

export default function ArtistProfilePage() {
  const { artistId } = useParams();
  const { getArtist, getArtistBySlug } = useArtists();
  const { artworks } = useMarketplace();
  const [activeTab, setActiveTab] = useState('artworks');

  // Try slug first, then ID
  const artist = getArtistBySlug(artistId) || getArtist(artistId);

  // Get artist artworks (approved/sold only)
  const artistArtworks = useMemo(() => {
    if (!artist) return [];
    return artworks.filter(
      (a) =>
        a.artistId === artist.id &&
        (a.status === 'odobrena' || a.status === 'razprodana')
    );
  }, [artworks, artist]);

  // Get artist reviews
  const artistReviews = useMemo(() => {
    if (!artist) return [];
    return mockReviews.filter((r) => r.artistId === artist.id);
  }, [artist]);

  if (!artist) {
    return (
      <div className="artist-profile">
        <div className="artist-profile__not-found">
          <div className="container">
            <h1>Umetnik ni najden</h1>
            <p>Žal tega umetnika ne najdemo.</p>
            <Link to="/umetniki" className="btn-outline">
              Nazaj na umetnike
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initials = artist.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const joinedDateStr = new Date(artist.joinedDate).toLocaleDateString('sl-SI', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="artist-profile">
      {/* Cover banner */}
      <div className="artist-profile__banner">
        {artist.coverImage ? (
          <img
            className="artist-profile__banner-img"
            src={artist.coverImage}
            alt=""
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : null}
        <div className="artist-profile__banner-overlay" />
      </div>

      {/* Profile header */}
      <ScrollReveal variant="fade-in">
        <div className="artist-profile__header">
          <div className="container">
            <div className="artist-profile__header-content">
              {/* Avatar */}
              <div className="artist-profile__avatar-wrap">
                {artist.avatar ? (
                  <img
                    className="artist-profile__avatar"
                    src={artist.avatar}
                    alt={artist.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="artist-profile__avatar-fallback"
                  style={{ display: artist.avatar ? 'none' : 'flex' }}
                >
                  {initials}
                </div>
              </div>

              {/* Name + tier + location + rating */}
              <div className="artist-profile__header-info">
                <div className="artist-profile__name-row">
                  <h1 className="artist-profile__name">{artist.name}</h1>
                  <TierBadge tier={artist.tier} />
                </div>

                <div className="artist-profile__meta-row">
                  {artist.location && (
                    <span className="artist-profile__location">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {artist.location}
                    </span>
                  )}

                  <div className="artist-profile__rating-row">
                    <StarRating rating={artist.rating} />
                    <span className="artist-profile__rating-num">{artist.rating.toFixed(1)}</span>
                    <span className="artist-profile__rating-count">({artist.reviewCount} ocen)</span>
                  </div>
                </div>

                <span className="artist-profile__joined">
                  Na platformi od {joinedDateStr}
                </span>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Bio */}
      <ScrollReveal variant="fade-up">
        <section className="artist-profile__bio-section">
          <div className="container">
            <p className="artist-profile__bio">{artist.bio}</p>
          </div>
        </section>
      </ScrollReveal>

      {/* Stats bar */}
      <ScrollReveal variant="fade-up">
        <section className="artist-profile__stats-section">
          <div className="container">
            <div className="artist-profile__stats">
              <div className="artist-profile__stat">
                <span className="artist-profile__stat-value">{artist.totalSales}</span>
                <span className="artist-profile__stat-label">Prodaj</span>
              </div>
              <div className="artist-profile__stat">
                <span className="artist-profile__stat-value">{artist.reviewCount}</span>
                <span className="artist-profile__stat-label">Ocen</span>
              </div>
              <div className="artist-profile__stat">
                <span className="artist-profile__stat-value">{artist.rating.toFixed(1)}</span>
                <span className="artist-profile__stat-label">Ocena</span>
              </div>
              <div className="artist-profile__stat">
                <span className="artist-profile__stat-value">{artistArtworks.length}</span>
                <span className="artist-profile__stat-label">Umetnin</span>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Social links + Commission button */}
      <section className="artist-profile__actions-section">
        <div className="container">
          <div className="artist-profile__actions-row">
            {/* Social links */}
            <div className="artist-profile__social-links">
              {artist.socialLinks?.website && (
                <a
                  href={artist.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="artist-profile__social-link"
                  title="Spletna stran"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </a>
              )}
              {artist.socialLinks?.instagram && (
                <a
                  href={`https://instagram.com/${artist.socialLinks.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="artist-profile__social-link"
                  title="Instagram"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              )}
              {artist.socialLinks?.twitter && (
                <a
                  href={`https://twitter.com/${artist.socialLinks.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="artist-profile__social-link"
                  title="Twitter"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                  </svg>
                </a>
              )}
            </div>

            {/* Commission button */}
            {artist.commissionOpen && (
              <Link
                to={`/naroci-delo/${artist.id}`}
                className="btn-gold"
              >
                Naroči Delo
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="artist-profile__tabs-section">
        <div className="container">
          <div className="artist-profile__tabs">
            <button
              className={`artist-profile__tab ${activeTab === 'artworks' ? 'artist-profile__tab--active' : ''}`}
              onClick={() => setActiveTab('artworks')}
            >
              Umetnine ({artistArtworks.length})
            </button>
            <button
              className={`artist-profile__tab ${activeTab === 'reviews' ? 'artist-profile__tab--active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Mnenja ({artistReviews.length})
            </button>
          </div>

          {/* Tab content */}
          <div className="artist-profile__tab-content">
            {activeTab === 'artworks' && (
              <div className="artist-profile__artworks-grid">
                {artistArtworks.length > 0 ? (
                  artistArtworks.map((artwork) => (
                    <ArtworkCard key={artwork.id} artwork={artwork} />
                  ))
                ) : (
                  <div className="artist-profile__empty">
                    <p>Ta umetnik še nima objavljenih umetnin.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="artist-profile__reviews">
                {artistReviews.length > 0 ? (
                  artistReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))
                ) : (
                  <div className="artist-profile__empty">
                    <p>Ta umetnik še nima ocen.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
