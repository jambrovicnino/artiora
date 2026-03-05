import { PayPalButtons } from '@paypal/react-paypal-js';
import { useCart } from '../../context/CartContext';
import './PayPalCheckout.css';

export default function PayPalCheckout({ onSuccess }) {
  const { subtotal, cart, clearCart } = useCart();

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          description: 'Eterna Naročilo',
          amount: {
            value: subtotal.toFixed(2),
          },
        },
      ],
    });
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then(() => {
      const ref = 'ET-' + Date.now().toString(36).toUpperCase();
      clearCart();
      onSuccess(ref);
    });
  };

  if (cart.length === 0) return null;

  return (
    <div className="paypal-checkout">
      <h3>Plačajte s PayPal</h3>
      <PayPalButtons
        style={{ layout: 'vertical', shape: 'rect', color: 'gold' }}
        createOrder={createOrder}
        onApprove={onApprove}
      />
    </div>
  );
}
