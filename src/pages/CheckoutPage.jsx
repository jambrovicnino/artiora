import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useCart } from '../context/CartContext';
import { processOrder } from '../services/orderService';
import CustomerForm from '../components/checkout/CustomerForm';
import OrderSummary from '../components/checkout/OrderSummary';
import PayPalCheckout from '../components/checkout/PayPalCheckout';
import './CheckoutPage.css';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
const IS_PAYPAL_LIVE = PAYPAL_CLIENT_ID && PAYPAL_CLIENT_ID !== 'test';

const PAYPAL_OPTIONS = {
  'client-id': PAYPAL_CLIENT_ID || 'test',
  currency: 'EUR',
};

function validateCustomer(info) {
  const errors = {};
  if (!info.name?.trim()) errors.name = 'Vnesite ime in priimek';
  if (!info.email?.trim() || !info.email.includes('@')) errors.email = 'Vnesite veljaven email';
  if (!info.phone?.trim()) errors.phone = 'Vnesite telefonsko številko';
  if (!info.address?.trim()) errors.address = 'Vnesite naslov za dostavo';
  return errors;
}

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    note: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  // ─── Skupna logika za obdelavo naročila ───
  const handleOrderProcess = async (ref) => {
    setIsProcessing(true);
    setProcessingStatus('Pošiljanje slik na strežnik...');

    let result = { success: false };
    try {
      setProcessingStatus('Priprava print datoteke + pošiljanje emaila...');
      result = await processOrder({
        customer: customerInfo,
        items: cart,
        total: subtotal,
        orderId: ref,
      });

      if (result.success) {
        console.log('[ARTIORA] Naročilo obdelano:', result);
        setProcessingStatus('Naročilo uspešno obdelano!');
      } else {
        console.warn('[ARTIORA] Naročilo delno obdelano:', result.error);
      }
    } catch (err) {
      console.warn('[ARTIORA] Obdelava naročila ni uspela:', err);
    }

    clearCart();
    setIsProcessing(false);
    navigate('/confirmation', {
      state: {
        ref,
        customerEmail: customerInfo.email,
        printFileUrls: result.printFileUrls || [],
        imageUrls: result.imageUrls || [],
        emailSent: result.emailSent || false,
      },
    });
  };

  // ─── PayPal success ───
  const handlePayPalSuccess = async (ref) => {
    await handleOrderProcess(ref);
  };

  // ─── Demo naročilo (preskoči plačilo) ───
  const handleDemoOrder = async () => {
    const errors = validateCustomer(customerInfo);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const ref = 'DEMO-' + Date.now().toString(36).toUpperCase();
    await handleOrderProcess(ref);
  };

  // Preveri obrazec pred plačilom
  const handlePaymentAttempt = () => {
    const errors = validateCustomer(customerInfo);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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
          <div className="checkout-left">
            <CustomerForm
              customerInfo={customerInfo}
              setCustomerInfo={setCustomerInfo}
              errors={formErrors}
            />
            <OrderSummary />
          </div>
          <div className="checkout-right">
            {isProcessing ? (
              <div className="order-processing">
                <div className="processing-spinner" />
                <p className="processing-status">{processingStatus}</p>
                <p className="processing-note">
                  Slika se obdeluje na strežniku.
                  To lahko traja do 30 sekund...
                </p>
              </div>
            ) : (
              <>
                <PayPalCheckout
                  onSuccess={handlePayPalSuccess}
                  onBeforePayment={handlePaymentAttempt}
                  isProcessing={isProcessing}
                />

                {/* ─── Demo naročilo (skrij ko je PayPal live) ─── */}
                {!IS_PAYPAL_LIVE && (
                <div className="demo-order-section">
                  <div className="demo-divider">
                    <span>ali</span>
                  </div>
                  <button
                    className="btn-demo-order"
                    onClick={handleDemoOrder}
                    disabled={isProcessing}
                  >
                    NAROČI (DEMO)
                  </button>
                  <p className="demo-note">
                    Preskoči plačilo — sproži email + pripravo print datoteke
                  </p>
                </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
