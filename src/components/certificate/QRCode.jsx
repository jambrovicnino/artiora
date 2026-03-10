// ═══════════════════════════════════════════════
// ARTIORA — QR Code Display Component
//
// Generates and displays a QR-like visual for
// certificate verification. Gold border, dark bg.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { generateQRCode } from '../../services/qrService';

const spinnerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  color: 'var(--gold, #c9a84c)',
};

const spinnerKeyframes = `
  @keyframes artiora-qr-spin {
    to { transform: rotate(360deg); }
  }
`;

export default function QRCode({ text, size = 180 }) {
  const [dataUrl, setDataUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!text) return;

    let cancelled = false;
    setLoading(true);

    generateQRCode(text, size).then((url) => {
      if (!cancelled) {
        setDataUrl(url);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [text, size]);

  const wrapStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size + Math.round(size * 0.1), // account for brand text area
    border: '2px solid var(--gold, #c9a84c)',
    borderRadius: 'var(--radius-sm, 2px)',
    background: '#0a0a0a',
    overflow: 'hidden',
    boxShadow: '0 0 20px rgba(201, 168, 76, 0.1)',
  };

  if (loading || !dataUrl) {
    return (
      <div style={wrapStyle}>
        <style>{spinnerKeyframes}</style>
        <div style={spinnerStyle}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ animation: 'artiora-qr-spin 1s linear infinite' }}
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <img
        src={dataUrl}
        alt="QR koda za preverjanje certifikata"
        width={size}
        height={size + Math.round(size * 0.1)}
        style={{
          display: 'block',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
}
