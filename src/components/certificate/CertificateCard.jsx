// ═══════════════════════════════════════════════
// ARTIORA — Certificate Card Component
//
// Full certificate display with official document
// feel. Includes ARTIORA header, artwork details,
// QR code, provenance timeline, and verification.
// ═══════════════════════════════════════════════

import QRCode from './QRCode';
import ProvenanceTimeline from './ProvenanceTimeline';
import './CertificateCard.css';

function formatDate(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('sl-SI', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return isoString || '—';
  }
}

function editionTypeLabel(type) {
  const map = {
    unikat: 'Unikat (1/1)',
    limitirana: 'Limitirana serija',
    odprta: 'Odprta serija',
    limited: 'Limitirana serija',
    open: 'Odprta serija',
    unique: 'Unikat (1/1)',
  };
  return map[type] || type || '—';
}

export default function CertificateCard({ certificate }) {
  if (!certificate) return null;

  const {
    id,
    artworkTitle,
    artistName,
    editionNumber,
    totalEditions,
    editionType,
    medium,
    dimensions,
    certifiedDate,
    verificationUrl,
    status,
    ownerHistory,
  } = certificate;

  // Build QR text from verification URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const qrText = `${origin}${verificationUrl}`;

  const editionStr =
    editionType === 'unikat' || editionType === 'unique'
      ? '1 / 1'
      : `${editionNumber || 1} / ${totalEditions || '?'}`;

  return (
    <div className="cert-card">
      <div className="cert-card__inner">
        {/* ── Header ──────────────────────────────── */}
        <div className="cert-card__header">
          <div className="cert-card__logo-text">ARTIORA</div>
          <div className="cert-card__heading">Certifikat Pristnosti</div>
        </div>

        <div className="cert-card__divider" />

        {/* ── Artwork Title & Artist ──────────────── */}
        <h2 className="cert-card__title">{artworkTitle}</h2>
        <p className="cert-card__artist">{artistName}</p>

        <div className="cert-card__divider" />

        {/* ── Details Grid ────────────────────────── */}
        <div className="cert-card__details">
          <div className="cert-card__detail">
            <span className="cert-card__detail-label">Edicija</span>
            <span className="cert-card__detail-value">{editionStr}</span>
          </div>

          <div className="cert-card__detail">
            <span className="cert-card__detail-label">Tip</span>
            <span className="cert-card__detail-value">{editionTypeLabel(editionType)}</span>
          </div>

          {medium && (
            <div className="cert-card__detail">
              <span className="cert-card__detail-label">Medij</span>
              <span className="cert-card__detail-value">{medium}</span>
            </div>
          )}

          {dimensions && (
            <div className="cert-card__detail">
              <span className="cert-card__detail-label">Dimenzije</span>
              <span className="cert-card__detail-value">{dimensions}</span>
            </div>
          )}

          <div className="cert-card__detail">
            <span className="cert-card__detail-label">Datum certificiranja</span>
            <span className="cert-card__detail-value">{formatDate(certifiedDate)}</span>
          </div>

          <div className="cert-card__detail">
            <span className="cert-card__detail-label">Status</span>
            <span
              className={`cert-card__status cert-card__status--${status === 'active' ? 'active' : 'revoked'}`}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {status === 'active' ? (
                  <path d="M20 6L9 17l-5-5" />
                ) : (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                )}
              </svg>
              {status === 'active' ? 'Aktiven' : 'Preklican'}
            </span>
          </div>
        </div>

        {/* ── Certificate Number ──────────────────── */}
        <div className="cert-card__number">{id}</div>

        <div className="cert-card__divider" />

        {/* ── QR Code ─────────────────────────────── */}
        <div className="cert-card__qr-section">
          <span className="cert-card__qr-label">Koda za preverjanje</span>
          <QRCode text={qrText} size={160} />
        </div>

        <div className="cert-card__divider" />

        {/* ── Provenance Timeline ─────────────────── */}
        {ownerHistory && ownerHistory.length > 0 && (
          <div className="cert-card__provenance-section">
            <div className="cert-card__provenance-heading">Zgodovina lastništva</div>
            <ProvenanceTimeline ownerHistory={ownerHistory} />
          </div>
        )}

        {/* ── Verification URL ────────────────────── */}
        {verificationUrl && (
          <>
            <div className="cert-card__divider" />
            <div className="cert-card__verification">
              <div className="cert-card__verification-label">URL za preverjanje</div>
              <div className="cert-card__verification-url">
                {origin}{verificationUrl}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
