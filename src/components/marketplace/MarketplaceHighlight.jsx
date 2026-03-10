import { Link } from 'react-router-dom';
import { useMarketplace } from '../../context/MarketplaceContext';
import ArtworkCard from './ArtworkCard';
import './MarketplaceHighlight.css';

export default function MarketplaceHighlight() {
  const { artworks } = useMarketplace();

  // Get artworks to display (approved or sold)
  const featured = artworks
    .filter((a) => a.status === 'odobrena' || a.status === 'razprodana')
    .slice(0, 4);

  // Empty state — show coming soon CTA
  if (featured.length === 0) {
    return (
      <section className="marketplace-highlight">
        <div className="container">
          <div className="marketplace-highlight__header">
            <h2 className="marketplace-highlight__title">
              Artmarket
            </h2>
            <div className="marketplace-highlight__divider" />
            <p className="marketplace-highlight__subtitle">
              Kmalu na voljo — prva kolekcija je v pripravi
            </p>
          </div>

          <div className="marketplace-highlight__cta">
            <Link to="/artmarket" className="marketplace-highlight__link">
              Obiščite Artmarket →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="marketplace-highlight">
      <div className="container">
        <div className="marketplace-highlight__header">
          <h2 className="marketplace-highlight__title">
            Odkrijte Artmarket
          </h2>
          <div className="marketplace-highlight__divider" />
          <p className="marketplace-highlight__subtitle">
            Izbirajte med edinstvenimi umetniškimi deli naših ustvarjalcev
          </p>
        </div>

        <div className="marketplace-highlight__grid">
          {featured.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>

        <div className="marketplace-highlight__cta">
          <Link to="/artmarket" className="marketplace-highlight__link">
            Vsi izdelki →
          </Link>
        </div>
      </div>
    </section>
  );
}
