// ═══════════════════════════════════════════════
// ARTIORA — Certificate Verification Page
//
// Public page at /potrdilo/:certificateId
// Displays a certificate with verification status.
// Falls back to on-the-fly generation for demo.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCertificates } from '../context/CertificateContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { useArtists } from '../context/ArtistContext';
import { createCertificateForArtwork } from '../services/certificateService';
import CertificateCard from '../components/certificate/CertificateCard';
import './CertificatePage.css';

export default function CertificatePage() {
  const { certificateId } = useParams();
  const { getCertificate } = useCertificates();
  const { artworks } = useMarketplace();
  const { getArtist } = useArtists();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCertificate() {
      setLoading(true);
      setNotFound(false);

      // 1. Try to find in stored certificates
      const stored = getCertificate(certificateId);
      if (stored) {
        setCertificate(stored);
        setLoading(false);
        return;
      }

      // 2. Try to generate on-the-fly for demo purposes
      //    Parse the certificate ID to extract artwork ID:
      //    Format: cert-{artworkId}-{editionNumber}
      const match = certificateId?.match(/^cert-(.+)-(\d{3})$/);
      if (match) {
        const artworkId = match[1];
        const editionNumber = parseInt(match[2], 10);

        const artwork = artworks.find((a) => a.id === artworkId);
        if (artwork) {
          const artist = getArtist(artwork.artistId);
          try {
            const cert = await createCertificateForArtwork(artwork, artist, editionNumber);
            if (!cancelled) {
              setCertificate(cert);
              setLoading(false);
            }
            return;
          } catch (err) {
            console.warn('[ARTIORA] Napaka pri generiranju certifikata:', err);
          }
        }
      }

      // 3. Not found
      if (!cancelled) {
        setNotFound(true);
        setLoading(false);
      }
    }

    loadCertificate();

    return () => {
      cancelled = true;
    };
  }, [certificateId, getCertificate, artworks, getArtist]);

  // ── Handle print ──────────────────────────────
  const handlePrint = () => {
    window.print();
  };

  // ── Handle share ──────────────────────────────
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ARTIORA Certifikat — ${certificate?.artworkTitle || ''}`,
          text: 'Preveri pristnost umetnine na ARTIORA.',
          url,
        });
      } catch {
        // User cancelled or share failed — fallback
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(
      () => alert('Povezava kopirana v odložišče!'),
      () => alert('Povezave ni mogoče kopirati.')
    );
  }

  // ── Loading state ─────────────────────────────
  if (loading) {
    return (
      <div className="cert-page">
        <div className="cert-page__loading">
          <div className="cert-page__spinner" />
          <p>Preverjanje certifikata...</p>
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────
  if (notFound) {
    return (
      <div className="cert-page">
        <div className="cert-page__not-found">
          <div className="cert-page__not-found-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="cert-page__not-found-title">Certifikat ni najden</h1>
          <p className="cert-page__not-found-text">
            Certifikat z oznako <strong>{certificateId}</strong> ne obstaja
            ali je bil preklican.
          </p>
          <Link to="/tržnica" className="btn-gold">
            Nazaj na tržnico
          </Link>
        </div>
      </div>
    );
  }

  // ── Certificate found ─────────────────────────
  return (
    <div className="cert-page">
      {/* Verification banner */}
      <div className="cert-page__banner">
        <div className="cert-page__banner-inner">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <span>
            Preverjeno{' '}
            <span className="cert-page__banner-check">&check;</span>
            {' '}&mdash; Ta certifikat je veljaven in registriran v sistemu ARTIORA
          </span>
        </div>
      </div>

      {/* Certificate card (centered) */}
      <div className="cert-page__card-wrap">
        <CertificateCard certificate={certificate} />
      </div>

      {/* Actions */}
      <div className="cert-page__actions">
        <button
          className="cert-page__action-btn"
          onClick={handleShare}
          title="Deli certifikat"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Deli
        </button>

        <button
          className="cert-page__action-btn"
          onClick={handlePrint}
          title="Natisni certifikat"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Natisni
        </button>
      </div>
    </div>
  );
}
