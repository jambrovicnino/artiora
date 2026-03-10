import { Link } from 'react-router-dom';
import { useMarketplace } from '../../context/MarketplaceContext';
import ArtworkCard from './ArtworkCard';
import './MarketplaceHighlight.css';

export default function MarketplaceHighlight() {
  const { artworks } = useMarketplace();

  // Get first 4 approved (odobrena) artworks
  const featured = artworks
    .filter((a) => a.status === 'odobrena')
    .slice(0, 4);

  if (featured.length === 0) return null;

  return (
    <section className="marketplace-highlight">
      <div className="container">
        <div className="marketplace-highlight__header">
          <h2 className="marketplace-highlight__title">
            Odkrijte tr&zcaron;nico
          </h2>
          <div className="marketplace-highlight__divider" />
          <p className="marketplace-highlight__subtitle">
            Izbirajte med edinstvenimi umetni&scaron;kimi deli na&scaron;ih ustvarjalcev
          </p>
        </div>

        <div className="marketplace-highlight__grid">
          {featured.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>

        <div className="marketplace-highlight__cta">
          <Link to="/tr&#382;nica" className="marketplace-highlight__link">
            Vsi izdelki &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
