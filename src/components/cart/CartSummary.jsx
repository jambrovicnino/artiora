import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './CartSummary.css';

export default function CartSummary() {
  const { subtotal } = useCart();

  return (
    <div className="cart-summary">
      <h3>Povzetek Naročila</h3>
      <div className="summary-row">
        <span>Vmesni znesek</span>
        <span className="summary-price">{subtotal.toFixed(2)} €</span>
      </div>
      <div className="summary-row">
        <span>Dostava</span>
        <span className="summary-free">BREZPLAČNO</span>
      </div>
      <hr />
      <div className="summary-row total">
        <span>Skupaj</span>
        <span className="summary-price">{subtotal.toFixed(2)} €</span>
      </div>
      <Link to="/checkout" className="btn-gold-large checkout-btn">
        NADALJUJ NA PLAČILO
      </Link>
    </div>
  );
}
