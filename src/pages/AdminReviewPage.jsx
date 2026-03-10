import { useState, useMemo } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useArtists } from '../context/ArtistContext';
import { useCertificates } from '../context/CertificateContext';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import './AdminReviewPage.css';

export default function AdminReviewPage() {
  const { artworks, approveArtwork, rejectArtwork } = useMarketplace();
  const { getArtist } = useArtists();
  const { generateCertificate } = useCertificates();

  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionFeedback, setActionFeedback] = useState(null);

  // Get pending artworks (v_pregledu)
  const pendingArtworks = useMemo(
    () =>
      artworks
        .filter((a) => a.status === 'v_pregledu')
        .sort(
          (a, b) =>
            new Date(a.submittedDate || a.createdAt || 0) -
            new Date(b.submittedDate || b.createdAt || 0)
        ),
    [artworks]
  );

  function handleApprove(artwork) {
    const artist = getArtist(artwork.artistId);

    // Generate certificate
    const certData = {
      artworkId: artwork.id,
      artworkTitle: artwork.title,
      artistId: artwork.artistId,
      artistName: artist?.name || 'Neznan umetnik',
      editionNumber: 1,
      totalEditions: artwork.editionSize || 1,
      editionType: artwork.editionType,
      medium: artwork.medium,
      dimensions: artwork.dimensions,
    };

    generateCertificate(certData);

    const certId = `cert-${artwork.id}-001`;
    approveArtwork(artwork.id, certId);

    setActionFeedback({
      type: 'approve',
      title: artwork.title,
    });

    // Clear feedback after 3 seconds
    setTimeout(() => setActionFeedback(null), 3000);
  }

  function handleRejectStart(artworkId) {
    setRejectingId(artworkId);
    setRejectReason('');
  }

  function handleRejectCancel() {
    setRejectingId(null);
    setRejectReason('');
  }

  function handleRejectConfirm(artwork) {
    if (!rejectReason.trim()) return;

    rejectArtwork(artwork.id, rejectReason.trim());

    setRejectingId(null);
    setRejectReason('');

    setActionFeedback({
      type: 'reject',
      title: artwork.title,
    });

    setTimeout(() => setActionFeedback(null), 3000);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    return d.toLocaleDateString('sl-SI', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const EDITION_LABELS = {
    unikat: 'Unikat (1/1)',
    limitirana: 'Limitirana serija',
    odprta: 'Odprta serija',
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-main">
        {/* Header */}
        <div className="review-header">
          <h1 className="review-title">Pregled Umetnin</h1>
          <p className="review-subtitle">
            {pendingArtworks.length > 0
              ? `${pendingArtworks.length} ${pendingArtworks.length === 1 ? 'umetnina caka' : pendingArtworks.length < 5 ? 'umetnine cakajo' : 'umetnin caka'} na pregled`
              : 'Ni umetnin za pregled'}
          </p>
        </div>

        {/* Feedback Banner */}
        {actionFeedback && (
          <div className={`review-feedback review-feedback-${actionFeedback.type}`}>
            {actionFeedback.type === 'approve' ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Umetnina &quot;{actionFeedback.title}&quot; je bila odobrena in certifikat je bil generiran.</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>Umetnina &quot;{actionFeedback.title}&quot; je bila zavrnjena.</span>
              </>
            )}
          </div>
        )}

        {/* Empty State */}
        {pendingArtworks.length === 0 && !actionFeedback && (
          <div className="review-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            <h3>Ni umetnin za pregled</h3>
            <p>Vse oddane umetnine so bile pregledane. Vrnite se pozneje.</p>
          </div>
        )}

        {/* Review Queue */}
        <div className="review-queue">
          {pendingArtworks.map((artwork) => {
            const artist = getArtist(artwork.artistId);
            const isRejecting = rejectingId === artwork.id;

            return (
              <div key={artwork.id} className="review-card">
                {/* Artwork Image */}
                <div className="review-card-image">
                  <img
                    src={artwork.image || artwork.thumbnail}
                    alt={artwork.title}
                    onError={(e) => {
                      e.target.src = '/gallery/placeholder-artwork.jpg';
                    }}
                  />
                  {artwork.isAiGenerated && (
                    <span className="review-ai-badge">AI</span>
                  )}
                </div>

                {/* Artwork Details */}
                <div className="review-card-details">
                  <h3 className="review-card-title">{artwork.title}</h3>

                  <div className="review-card-meta">
                    <div className="review-meta-row">
                      <span className="review-meta-label">Umetnik:</span>
                      <span className="review-meta-value">{artist?.name || 'Neznan'}</span>
                    </div>
                    <div className="review-meta-row">
                      <span className="review-meta-label">Kategorija:</span>
                      <span className="review-meta-value" style={{ textTransform: 'capitalize' }}>
                        {artwork.category}
                      </span>
                    </div>
                    <div className="review-meta-row">
                      <span className="review-meta-label">Medij:</span>
                      <span className="review-meta-value">{artwork.medium}</span>
                    </div>
                    <div className="review-meta-row">
                      <span className="review-meta-label">Dimenzije:</span>
                      <span className="review-meta-value">{artwork.dimensions}</span>
                    </div>
                    <div className="review-meta-row">
                      <span className="review-meta-label">Izdaja:</span>
                      <span className="review-meta-value">
                        {EDITION_LABELS[artwork.editionType] || artwork.editionType}
                        {artwork.editionType === 'limitirana' && artwork.editionSize && (
                          <> ({artwork.editionSize} kosov)</>
                        )}
                      </span>
                    </div>
                    <div className="review-meta-row">
                      <span className="review-meta-label">Cena:</span>
                      <span className="review-meta-value review-price">
                        {artwork.price} EUR
                      </span>
                    </div>
                    <div className="review-meta-row">
                      <span className="review-meta-label">Oddano:</span>
                      <span className="review-meta-value">
                        {formatDate(artwork.submittedDate || artwork.createdAt)}
                      </span>
                    </div>
                  </div>

                  {artwork.description && (
                    <p className="review-card-desc">{artwork.description}</p>
                  )}

                  {artwork.isAiGenerated && artwork.aiPrompt && (
                    <div className="review-ai-prompt">
                      <span className="review-ai-prompt-label">AI Prompt:</span>
                      <span className="review-ai-prompt-text">{artwork.aiPrompt}</span>
                    </div>
                  )}

                  {artwork.tags && artwork.tags.length > 0 && (
                    <div className="review-tags">
                      {artwork.tags.map((tag, i) => (
                        <span key={i} className="review-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="review-card-actions">
                  {isRejecting ? (
                    <div className="reject-form">
                      <label className="reject-label">Razlog za zavrnitev:</label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Vpiste razlog za zavrnitev umetnine..."
                        rows={3}
                        className="reject-textarea"
                        autoFocus
                      />
                      <div className="reject-form-actions">
                        <button
                          className="btn-reject-confirm"
                          onClick={() => handleRejectConfirm(artwork)}
                          disabled={!rejectReason.trim()}
                        >
                          Potrdi zavrnitev
                        </button>
                        <button
                          className="btn-reject-cancel"
                          onClick={handleRejectCancel}
                        >
                          Preklici
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="action-buttons">
                      <button
                        className="btn-approve"
                        onClick={() => handleApprove(artwork)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Odobri
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleRejectStart(artwork.id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        Zavrni
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
