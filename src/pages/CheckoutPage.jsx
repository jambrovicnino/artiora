import { useNavigate } from 'react-router-dom';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useCart } from '../context/CartContext';
import { sendOrderEmail } from '../services/emailService';
import OrderSummary from '../components/checkout/OrderSummary';
import PayPalCheckout from '../components/checkout/PayPalCheckout';
import './CheckoutPage.css';

const PAYPAL_OPTIONS = {
  'client-id': 'test',
  currency: 'EUR',
};

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  const navigate = useNavigate();

  const handleSuccess = async (ref) => {
    // Pošlji obvestilo o naročilu na email
    try {
      const orderData = {
        items: cart.map((item) => ({
          enhancement: item.enhancement || 'Brez izboljšave',
          sizeLabel: item.frameSizeLabel || item.frameSize,
          productType: item.productType || 'print',
          frameLabel: item.productType === 'framed' ? (item.frameLabel || '076') : null,
          withImpasto: item.withImpasto || false,
          price: item.price,
          dedication: item.dedication || '',
          printSpecs: item.printSpecs || null,
          metadata: item.metadata || null,
        })),
        total: cartTotal || cart.reduce((sum, i) => sum + (i.price || 0), 0),
        customerInfo: { name: 'Spletno naročilo' },
        orderId: `ET-${ref || Date.now()}`,
      };
      await sendOrderEmail(orderData);
    } catch (emailErr) {
      console.warn('[ETERNA] Email obvestilo ni uspelo:', emailErr);
    }

    navigate('/confirmation', { state: { ref } });
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page container checkout-empty">
        <h2>Ni izdelkov za plačilo</h2>
        <p>Vaša košarica je prazna.</p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={PAYPAL_OPTIONS}>
      <div className="checkout-page container">
        <h1>Plačilo</h1>
        <div className="checkout-layout">
          <OrderSummary />
          <PayPalCheckout onSuccess={handleSuccess} />
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
