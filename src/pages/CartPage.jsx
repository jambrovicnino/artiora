import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useMarketplace } from '../context/MarketplaceContext';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import './CartPage.css';

export default function CartPage() {
  const { cart, addItem } = useCart();
  const { getArtwork } = useMarketplace();
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle ?add=artworkId — add artwork to cart from ArtworkDetailPage link
  useEffect(() => {
    const artworkId = searchParams.get('add');
    if (!artworkId) return;

    const artwork = getArtwork(artworkId);
    if (artwork && !artwork.soldOut) {
      // Check if already in cart
      const alreadyInCart = cart.some((item) => item.artworkId === artworkId);
      if (!alreadyInCart) {
        addItem({
          artworkId: artwork.id,
          title: artwork.title,
          image: artwork.image || artwork.thumbnail,
          price: artwork.price,
          editionType: artwork.editionType,
        });
      }
    }

    // Clean URL parameter
    setSearchParams({}, { replace: true });
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  if (cart.length === 0) {
    return (
      <div className="cart-page container cart-empty">
        <h2>Vaša košarica je prazna</h2>
        <p>Dodajte izdelke za nadaljevanje.</p>
        <Link to="/" className="btn-gold">NAZAJ NA ZAČETEK</Link>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <h1>Košarica</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
        <CartSummary />
      </div>
    </div>
  );
}
