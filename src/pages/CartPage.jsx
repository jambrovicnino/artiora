import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import './CartPage.css';

export default function CartPage() {
  const { cart } = useCart();

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
