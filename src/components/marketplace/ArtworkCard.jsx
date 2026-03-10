import { useNavigate, Link } from 'react-router-dom';
import { useArtists } from '../../context/ArtistContext';
import { useWishlist } from '../../context/WishlistContext';
import EditionBadge from './EditionBadge';
import WishlistButton from './WishlistButton';
import PriceDisplay from './PriceDisplay';
import './ArtworkCard.css';

export default function ArtworkCard({ artwork }) {
  const navigate = useNavigate();
  const { getArtist } = useArtists();
  const { isWishlisted } = useWishlist();

  if (!artwork) return null;

  const artist = getArtist(artwork.artistId);
  const active = isWishlisted(artwork.id);

  const handleCardClick = () => {
    navigate(`/tr\u017Enica/${artwork.id}`);
  };

  const handleArtistClick = (e) => {
    e.stopPropagation();
  };

  return (
    <article className="artwork-card" onClick={handleCardClick}>
      {/* Image area */}
      <div className="artwork-card__image-wrap">
        <img
          className="artwork-card__image"
          src={artwork.image || artwork.thumbnail}
          alt={artwork.title}
          loading="lazy"
        />

        {/* Gold gradient hover overlay */}
        <div className="artwork-card__hover-overlay" />

        {/* Corner bracket decorations */}
        <div className="artwork-card__corners" />

        {/* Wishlist button (top-right) */}
        <div
          className={`artwork-card__wishlist${active ? ' artwork-card__wishlist--active' : ''}`}
        >
          <WishlistButton artworkId={artwork.id} />
        </div>

        {/* Edition badge (bottom-left) */}
        <div className="artwork-card__edition-overlay">
          <EditionBadge
            editionType={artwork.editionType}
            editionSize={artwork.editionSize}
            editionsSold={artwork.editionsSold}
          />
        </div>

        {/* Sold out overlay */}
        {artwork.soldOut && (
          <div className="artwork-card__soldout-overlay">
            <span className="artwork-card__soldout-text">RAZPRODANO</span>
          </div>
        )}
      </div>

      {/* Info below image */}
      <div className="artwork-card__info">
        <h3 className="artwork-card__title">{artwork.title}</h3>

        {artist && (
          <Link
            to={`/umetnik/${artist.slug}`}
            className="artwork-card__artist-link"
            onClick={handleArtistClick}
          >
            {artist.name}
          </Link>
        )}

        <div className="artwork-card__price-row">
          <PriceDisplay
            price={artwork.price}
            soldOut={artwork.soldOut}
            editionType={artwork.editionType}
          />
        </div>
      </div>
    </article>
  );
}
