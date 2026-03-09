import { useCart } from '../../context/CartContext';
import './CartItem.css';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCart();

  const enhancementLabel = item.enhancement === 'restoration'
    ? 'Restavracija'
    : item.enhancement === 'colorize'
    ? 'Barvanje'
    : 'Brez izboljšave';

  return (
    <div className="cart-item">
      {item.thumbnail && (
        <img src={item.thumbnail} alt="Predogled" className="cart-thumb" />
      )}
      <div className="cart-item-details">
        <h4>{enhancementLabel}</h4>
        <p>
          {item.frameSizeLabel}
          {item.productType === 'framed' ? ' · Z okvirjem' : ' · Napeto platno'}
        </p>
        {item.dedication && (
          <p className="cart-item-dedication">&ldquo;{item.dedication}&rdquo;</p>
        )}
        <p className="cart-item-file">{item.fileName}</p>
      </div>
      <div className="cart-item-qty">
        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
        <span>{item.quantity}</span>
        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
      </div>
      <div className="cart-item-price">{(item.price * item.quantity).toFixed(2)} €</div>
      <button className="cart-item-remove" onClick={() => removeItem(item.id)} title="Odstrani">
        &times;
      </button>
    </div>
  );
}
