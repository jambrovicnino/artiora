import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './AdjustmentPage.css';

const API_BASE =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'https://artiora.vercel.app'
    : '';

export default function AdjustmentPage() {
  const [searchParams] = useSearchParams();

  // Predizpolnjeni podatki iz URL parametrov (iz customer emaila)
  const orderRef = searchParams.get('narocilo') || '';
  const email = searchParams.get('email') || '';
  const name = searchParams.get('ime') || '';
  const imageUrl = searchParams.get('img') || '';

  // Form state
  const [formEmail, setFormEmail] = useState(email);
  const [formName, setFormName] = useState(name);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState(null); // { type: 'success' | 'error', text: '' }

  // Posodobi form email iz URL parametra
  useEffect(() => {
    if (email) setFormEmail(email);
    if (name) setFormName(name);
  }, [email, name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formEmail || !message.trim()) return;

    setIsSending(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/adjustment-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderRef,
          customerEmail: formEmail,
          customerName: formName,
          message: message.trim(),
          imageUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          type: 'success',
          text: 'Vaša zahteva je bila uspešno poslana! Odgovorili vam bomo v najkrajšem možnem času.',
        });
        setMessage('');
      } else {
        throw new Error(data.error || 'Napaka pri pošiljanju');
      }
    } catch (error) {
      setResult({
        type: 'error',
        text: `Napaka: ${error.message}. Prosimo, poskusite znova ali nam pišite na psn.nino4@gmail.com`,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="adjustment-page">
      <div className="adjustment-card">
        {/* Header */}
        <div className="adjustment-header">
          <h1>PRILAGODITEV</h1>
          <span>BREZPLAČNA STORITEV</span>
        </div>

        {/* Image preview */}
        {imageUrl && (
          <div className="adjustment-preview">
            <img
              src={imageUrl}
              alt="Vaša umetnina"
              className="adjustment-preview-img"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <p className="adjustment-preview-label">
              Trenutna postavitev vaše umetnine
            </p>
          </div>
        )}

        <div className="adjustment-body">
          {orderRef && (
            <div className="adjustment-order-ref">
              Naročilo: <strong>{orderRef}</strong>
            </div>
          )}

          <p className="adjustment-intro">
            Opišite želeno spremembo — npr. premik slike, centriranje,
            obrezovanje ali karkoli drugega. Prilagoditve so vedno brezplačne.
          </p>

          {/* Form */}
          <form className="adjustment-form" onSubmit={handleSubmit}>
            <div className="adjustment-field">
              <label htmlFor="adj-name">Vaše ime</label>
              <input
                id="adj-name"
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ime in priimek"
              />
            </div>

            <div className="adjustment-field">
              <label htmlFor="adj-email">Email za odgovor *</label>
              <input
                id="adj-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="vas@email.com"
                required
              />
            </div>

            <div className="adjustment-field">
              <label htmlFor="adj-message">Opišite želeno spremembo *</label>
              <textarea
                id="adj-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Npr.: Prosim, premaknite sliko bolj v desno, da je obraz na sredini. Spodnji rob naj bo malo odrezan..."
                required
                rows={5}
              />
            </div>

            <button
              type="submit"
              className="btn-gold-large adjustment-submit"
              disabled={isSending || !formEmail || !message.trim()}
            >
              {isSending ? (
                <>
                  <span className="upscale-spinner" />
                  Pošiljam...
                </>
              ) : (
                'POŠLJI ZAHTEVO'
              )}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div className={`adjustment-result adjustment-result--${result.type}`}>
              {result.type === 'success' ? '✓ ' : '✕ '}
              {result.text}
            </div>
          )}

          <p className="adjustment-footer">
            Lahko nas tudi kontaktirate direktno na{' '}
            <a href="mailto:psn.nino4@gmail.com">psn.nino4@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
