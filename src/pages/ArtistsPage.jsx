import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useArtists } from '../context/ArtistContext';
import TierBadge from '../components/marketplace/TierBadge';
import ScrollReveal from '../components/ScrollReveal';
import './ArtistsPage.css';

const TIER_ORDER = { mojster: 0, priporocen: 1, potrjen: 2, nov: 3 };

const SORT_OPTIONS = [
  { value: 'tier', label: 'Nivo (najvišji)' },
  { value: 'rating', label: 'Ocena' },
  { value: 'name', label: 'Ime' },
];

function StarRating({ rating, reviewCount }) {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(
        <svg key={i} className="artists-page__star artists-page__star--full" width="14" height="14" viewBox="0 0 24 24" fill="var(--gold)" stroke="var(--gold)" strokeWidth="1">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    } else if (half && i === full) {
      stars.push(
        <svg key={i} className="artists-page__star artists-page__star--half" width="14" height="14" viewBox="0 0 24 24">
          <defs>
            <linearGradient id={`half-star-${i}`}>
              <stop offset="50%" stopColor="var(--gold)" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={`url(#half-star-${i})`} stroke="var(--gold)" strokeWidth="1" />
        </svg>
      );
    } else {
      stars.push(
        <svg key={i} className="artists-page__star" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    }
  }

  return (
    <div className="artists-page__rating">
      <div className="artists-page__stars">{stars}</div>
      <span className="artists-page__rating-text">{rating.toFixed(1)}</span>
      <span className="artists-page__review-count">({reviewCount})</span>
    </div>
  );
}

function ArtistCard({ artist }) {
  const initials = artist.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link to={`/umetnik/${artist.slug}`} className="artists-page__card">
      <div className="artists-page__card-inner corner-brackets">
        {/* Avatar */}
        <div className="artists-page__avatar-wrap">
          {artist.avatar ? (
            <img
              className="artists-page__avatar"
              src={artist.avatar}
              alt={artist.name}
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="artists-page__avatar-fallback"
            style={{ display: artist.avatar ? 'none' : 'flex' }}
          >
            {initials}
          </div>
        </div>

        {/* Info */}
        <div className="artists-page__card-info">
          <h3 className="artists-page__card-name">{artist.name}</h3>
          <TierBadge tier={artist.tier} />

          {artist.specialties?.length > 0 && (
            <div className="artists-page__specialties">
              {artist.specialties.slice(0, 3).map((s) => (
                <span key={s} className="artists-page__specialty">{s}</span>
              ))}
            </div>
          )}

          <StarRating rating={artist.rating} reviewCount={artist.reviewCount} />

          {artist.location && (
            <div className="artists-page__location">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {artist.location}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ArtistsPage() {
  const { artists } = useArtists();
  const [sortBy, setSortBy] = useState('tier');

  const sortedArtists = useMemo(() => {
    const list = [...artists];
    switch (sortBy) {
      case 'tier':
        list.sort((a, b) => (TIER_ORDER[a.tier] ?? 99) - (TIER_ORDER[b.tier] ?? 99));
        break;
      case 'rating':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
        list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'sl'));
        break;
      default:
        break;
    }
    return list;
  }, [artists, sortBy]);

  return (
    <div className="artists-page">
      {/* Hero */}
      <ScrollReveal variant="fade-in">
        <div className="artists-page__hero">
          <div className="container">
            <span className="artists-page__label">ARTIORA</span>
            <h1 className="artists-page__heading">UMETNIKI</h1>
            <div className="gold-divider" />
            <p className="artists-page__subtitle">
              Spoznajte certificirane umetnike naše platforme
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Sort bar */}
      <section className="artists-page__content">
        <div className="container">
          <div className="artists-page__sort-bar">
            <span className="artists-page__sort-count">
              {sortedArtists.length} {sortedArtists.length === 1 ? 'umetnik' : sortedArtists.length < 5 ? 'umetniki' : 'umetnikov'}
            </span>
            <div className="artists-page__sort-select-wrap">
              <span className="artists-page__sort-label">Razvrsti:</span>
              <select
                className="artists-page__sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          <ScrollReveal variant="fade-up">
            <div className="artists-page__grid">
              {sortedArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
