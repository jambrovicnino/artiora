import { Link, useLocation } from 'react-router-dom';
import './ConfirmationPage.css';

export default function ConfirmationPage() {
  const { state } = useLocation();
  const ref = state?.ref || 'ET-XXXXXX';
  const customerEmail = state?.customerEmail;
  const printFileUrls = state?.printFileUrls || [];
  const imageUrls = state?.imageUrls || [];
  const emailSent = state?.emailSent || false;

  const isDemo = ref.startsWith('DEMO-');

  return (
    <div className="confirmation-page container">
      <div className="confirmation-card">
        <div className="confirmation-icon">&#10003;</div>
        <h1>Naročilo Potrjeno!</h1>
        <p className="confirmation-ref">Referenca: <strong>{ref}</strong></p>

        {isDemo && (
          <div className="confirmation-demo-badge">DEMO NAROČILO</div>
        )}

        <p>
          {isDemo
            ? 'Demo naročilo je bilo uspešno obdelano.'
            : 'Hvala za vaše naročilo. Začeli bomo z delom na vaši umetnini.'
          }
          {emailSent && customerEmail
            ? <> Potrditev smo poslali na <strong>{customerEmail}</strong>.</>
            : emailSent
            ? ' Email obvestilo poslano.'
            : ''
          }
        </p>

        {/* Download links za print datoteke */}
        {(printFileUrls.length > 0 || imageUrls.length > 0) && (
          <div className="confirmation-downloads">
            <h3>Datoteke za prenos</h3>
            {printFileUrls.map((url, i) => (
              <a
                key={`print-${i}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-download btn-download-print"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Print-ready datoteka {printFileUrls.length > 1 ? i + 1 : ''}
              </a>
            ))}
            {imageUrls.map((url, i) => (
              <a
                key={`img-${i}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-download"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Originalna slika {imageUrls.length > 1 ? i + 1 : ''}
              </a>
            ))}
          </div>
        )}

        <Link to="/" className="btn-gold">NAZAJ NA ZAČETEK</Link>
      </div>
    </div>
  );
}
