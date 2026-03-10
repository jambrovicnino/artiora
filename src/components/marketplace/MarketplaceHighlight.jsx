import { Link } from 'react-router-dom';
import { useMarketplace } from '../../context/MarketplaceContext';
import ArtworkCard from './ArtworkCard';
import './MarketplaceHighlight.css';

export default function MarketplaceHighlight() {
  const { artworks } = useMarketplace();

  // Get first 4 approved (odobrena) artworks for purchase
  const available = artworks
    .filter((a) => a.status === 'odobrena' && !a.soldOut)
    .slice(0, 4);

  // Fallback: show sold-out portfolio if nothing available
  const featured = available.length > 0
    ? available
    : artworks
        .filter((a) => a.status === 'razprodana' || a.status === 'odobrena')
        .slice(0, 4);

  if (featured.length === 0) return null;

  const isPortfolioMode = available.length === 0;

  return (
    <section className="marketplace-highlight">
      <div className="container">
        <div className="marketplace-highlight__header">
          <h2 className="marketplace-highlight__title">
            {isPortfolioMode ? 'Naš Portfolio' : 'Odkrijte Artmarket'}
          </h2>
          <div className="marketplace-highlight__divider" />
          <p className="marketplace-highlight__subtitle">
            {isPortfolioMode
              ? 'Oglejte si naša dosedanja dela — nova kolekcija kmalu na voljo'
              : 'Izbirajte med edinstvenimi umetniškimi deli naših ustvarjalcev'}
          </p>
        </div>

        <div className="marketplace-highlight__grid">
          {featured.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>

        <div className="marketplace-highlight__cta">
          <Link to="/artmarket" className="marketplace-highlight__link">
            {isPortfolioMode ? 'Celoten portfolio →' : 'Vsi izdelki →'}
          </Link>
        </div>
      </div>
    </section>
  );
}
