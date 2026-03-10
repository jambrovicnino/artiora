import { Link } from 'react-router-dom';
import { useArtists } from '../../context/ArtistContext';
import TierBadge from './TierBadge';
import './FeaturedArtists.css';

export default function FeaturedArtists() {
  const { artists } = useArtists();

  const featured = artists.filter((a) => a.featured === true);

  if (featured.length === 0) return null;

  return (
    <section className="featured-artists">
      <div className="container">
        <div className="featured-artists__header">
          <h2 className="featured-artists__title">
            Na&scaron;i umetniki
          </h2>
          <div className="featured-artists__divider" />
          <p className="featured-artists__subtitle">
            Spoznajte ustvarjalce, ki oblikujejo platformo ARTIORA
          </p>
        </div>

        <div className="featured-artists__grid">
          {featured.map((artist) => (
            <Link
              key={artist.id}
              to={`/umetnik/${artist.slug}`}
              className="featured-artist-card"
            >
              <img
                className="featured-artist-card__avatar"
                src={artist.avatar}
                alt={artist.name}
                loading="lazy"
              />

              <h3 className="featured-artist-card__name">{artist.name}</h3>

              <TierBadge tier={artist.tier} />

              {artist.location && (
                <span className="featured-artist-card__location">
                  {artist.location}
                </span>
              )}

              {artist.specialties && artist.specialties.length > 0 && (
                <div className="featured-artist-card__specialties">
                  {artist.specialties.map((spec) => (
                    <span key={spec} className="featured-artist-card__specialty">
                      {spec}
                    </span>
                  ))}
                </div>
              )}

              <div className="featured-artist-card__stats">
                <div className="featured-artist-card__stat">
                  <span className="featured-artist-card__stat-value">
                    {artist.totalSales}
                  </span>
                  <span className="featured-artist-card__stat-label">Prodaj</span>
                </div>
                <div className="featured-artist-card__stat">
                  <span className="featured-artist-card__stat-value">
                    {artist.rating}
                  </span>
                  <span className="featured-artist-card__stat-label">Ocena</span>
                </div>
                <div className="featured-artist-card__stat">
                  <span className="featured-artist-card__stat-value">
                    {artist.reviewCount}
                  </span>
                  <span className="featured-artist-card__stat-label">Mnenj</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
