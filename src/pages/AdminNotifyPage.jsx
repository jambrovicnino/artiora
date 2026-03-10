import { useState } from 'react';
import './AdminNotifyPage.css';

const API_BASE =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'https://artiora.vercel.app'
    : '';

export default function AdminNotifyPage() {
  // ─── Auth state ───
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // ─── Form state ───
  const [orderRef, setOrderRef] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [message, setMessage] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  // ─── Image upload state ───
  const [isUploading, setIsUploading] = useState(false);

  // ─── Send state ───
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState(null);

  // ─── Login ───
  const handleLogin = (e) => {
    e.preventDefault();
    if (password.trim()) {
      setIsAuthenticated(true);
      setAuthError('');
    }
  };

  // ─── Upload preview image ───
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch(`${API_BASE}/api/upload-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dataUrl,
          filename: `admin-preview-${Date.now()}.${file.name.split('.').pop()}`,
        }),
      });

      const data = await response.json();
      if (data.success && data.url) {
        setPreviewImageUrl(data.url);
      } else {
        alert('Upload ni uspel: ' + (data.error || 'neznana napaka'));
      }
    } catch (err) {
      alert('Upload napaka: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Send notification ───
  const handleSend = async () => {
    if (!customerEmail || !message) {
      setResult({ success: false, message: 'Izpolnite email stranke in sporočilo.' });
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/admin/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({
          orderRef: orderRef || undefined,
          customerEmail,
          customerName: customerName || undefined,
          message,
          previewImageUrl: previewImageUrl || undefined,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        setIsAuthenticated(false);
        setAuthError('Neveljavno geslo. Poskusite znova.');
        return;
      }

      setResult({
        success: data.success,
        message: data.success
          ? `Email uspešno poslan na ${customerEmail}`
          : `Napaka: ${data.error}`,
      });

      // Počisti formo pri uspehu
      if (data.success) {
        setOrderRef('');
        setCustomerEmail('');
        setCustomerName('');
        setMessage('');
        setPreviewImageUrl('');
      }
    } catch (err) {
      setResult({ success: false, message: `Napaka: ${err.message}` });
    } finally {
      setIsSending(false);
    }
  };

  // ─── Login screen ───
  if (!isAuthenticated) {
    return (
      <div className="admin-notify-page container">
        <div className="admin-login-card">
          <div className="admin-header">
            <h1>ARTIORA</h1>
            <span>ARTISAN — ADMIN</span>
          </div>
          <form onSubmit={handleLogin} className="admin-login-form">
            <label>Admin geslo</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Vnesite geslo..."
              autoFocus
            />
            {authError && <p className="admin-error">{authError}</p>}
            <button type="submit" className="btn-gold">PRIJAVA</button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Notification form ───
  return (
    <div className="admin-notify-page container">
      <div className="admin-notify-card">
        <div className="admin-header">
          <h1>ARTIORA</h1>
          <span>OBVESTILO STRANKI</span>
        </div>

        <p className="admin-subtitle">
          Pošljite stranki predogled končnega izgleda umetnine.
        </p>

        <div className="admin-form">
          {/* Referenca naročila */}
          <div className="admin-field">
            <label>Referenca naročila</label>
            <input
              type="text"
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              placeholder="ET-... ali DEMO-..."
            />
          </div>

          {/* Email stranke */}
          <div className="admin-field">
            <label>Email stranke *</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="stranka@email.com"
              required
            />
          </div>

          {/* Ime stranke */}
          <div className="admin-field">
            <label>Ime stranke</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ime in priimek"
            />
          </div>

          {/* Sporočilo */}
          <div className="admin-field">
            <label>Sporočilo *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Npr: Vaša umetnina je pripravljena za tisk. Prilagodili smo postavitev slike za optimalen izgled na platnu 40×50 cm. Prosimo, preglejte predogled in nas obvestite, če želite kakšne spremembe."
              rows={5}
              required
            />
          </div>

          {/* Predogled slike */}
          <div className="admin-field">
            <label>Predogled slike (opcijsko)</label>
            <div className="admin-image-upload">
              {previewImageUrl ? (
                <div className="admin-preview-wrap">
                  <img src={previewImageUrl} alt="Preview" className="admin-preview-img" />
                  <button
                    className="admin-preview-remove"
                    onClick={() => setPreviewImageUrl('')}
                  >
                    Odstrani
                  </button>
                </div>
              ) : (
                <div className="admin-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    id="admin-image-input"
                    className="admin-file-input"
                  />
                  <label htmlFor="admin-image-input" className="admin-upload-label">
                    {isUploading ? (
                      <>
                        <span className="upscale-spinner" />
                        Nalagam...
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        Naloži sliko predogleda
                      </>
                    )}
                  </label>
                </div>
              )}
              <div className="admin-url-input">
                <span>ali vnesite URL:</span>
                <input
                  type="url"
                  value={previewImageUrl}
                  onChange={(e) => setPreviewImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Pošlji gumb */}
          <button
            className="btn-gold-large admin-send-btn"
            onClick={handleSend}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <span className="upscale-spinner" />
                Pošiljam...
              </>
            ) : (
              'POŠLJI OBVESTILO'
            )}
          </button>

          {/* Rezultat */}
          {result && (
            <div className={`admin-result ${result.success ? 'admin-result--success' : 'admin-result--error'}`}>
              {result.success ? '✓' : '✗'} {result.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
