import { useCart } from '../../context/CartContext';
import './OrderSummary.css';

export default function OrderSummary() {
  const { cart, subtotal } = useCart();

  return (
    <div className="order-summary">
      <h3>Vaše Naročilo</h3>
      <div className="order-items">
        {cart.map((item) => {
          const label = item.enhancement === 'restoration'
            ? 'Restavracija'
            : item.enhancement === 'colorize'
            ? 'Barvanje'
            : 'Tisk na platno';

          return (
            <div className="order-item" key={item.id}>
              <div className="order-item-info">
                <span className="order-item-name">{label}</span>
                <span className="order-item-meta">
                  {item.frameSizeLabel}
                  {item.productType === 'framed' ? ' · Z okvirjem' : item.productType === 'stretched' ? ' · S podokvirjem' : ''}
                </span>
              </div>
              <span className="order-item-qty">x{item.quantity}</span>
              <span className="order-item-price">{(item.price * item.quantity).toFixed(2)} €</span>
            </div>
          );
        })}
      </div>
      <hr />
      <div className="order-total">
        <span>Skupaj</span>
        <span>{subtotal.toFixed(2)} €</span>
      </div>
    </div>
  );
}
