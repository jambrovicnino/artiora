import { PayPalButtons } from '@paypal/react-paypal-js';
import { useCart } from '../../context/CartContext';
import './PayPalCheckout.css';

export default function PayPalCheckout({ onSuccess, onBeforePayment, isProcessing }) {
  const { subtotal, cart } = useCart();

  const createOrder = (data, actions) => {
    // Preveri obrazec pred ustvarjanjem PayPal naročila
    if (onBeforePayment && !onBeforePayment()) {
      // Zavrni PayPal popup če obrazec ni izpolnjen
      return Promise.reject(new Error('Izpolnite podatke za dostavo'));
    }

    return actions.order.create({
      purchase_units: [
        {
          description: 'Eterna Artisan Naročilo',
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
      onSuccess(ref);
    });
  };

  if (cart.length === 0) return null;

  return (
    <div className="paypal-checkout">
      <h3>Plačajte s PayPal</h3>
      {isProcessing ? (
        <div className="paypal-processing">
          <div className="paypal-spinner" />
          <p>Obdelava naročila...</p>
        </div>
      ) : (
        <PayPalButtons
          style={{ layout: 'vertical', shape: 'rect', color: 'gold' }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={(err) => {
            // PayPal bo tukaj ujel napako iz createOrder
            console.log('[ETERNA] PayPal prekinjeno — izpolnite obrazec');
          }}
        />
      )}
      <p className="paypal-note">
        Plačilo je varno in zaščiteno. Po plačilu prejmete potrditveni email.
      </p>
    </div>
  );
}
