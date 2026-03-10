export default function QuoteCard({ commission, isArtist, onAccept, onDecline }) {
  const isPending = commission.status === 'ponudba' || commission.status === 'quoted';

  function formatDate(dateStr) {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleDateString('sl-SI', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  function formatPrice(price) {
    if (!price && price !== 0) return '---';
    return new Intl.NumberFormat('sl-SI', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }

  return (
    <div
      style={{
        background: 'rgba(201, 168, 76, 0.06)',
        border: '1px solid rgba(201, 168, 76, 0.25)',
        padding: '20px',
        margin: '12px 0',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid rgba(201, 168, 76, 0.15)',
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#c9a84c"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        <span
          style={{
            fontFamily: "var(--font-heading, 'Cormorant Garamond', serif)",
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#c9a84c',
          }}
        >
          Ponudba umetnika
        </span>
      </div>

      {/* Details Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        {/* Quoted Price */}
        <div>
          <div
            style={{
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#a09888',
              marginBottom: '4px',
            }}
          >
            Cena
          </div>
          <div
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: '#c9a84c',
              fontFamily: "var(--font-heading, 'Cormorant Garamond', serif)",
            }}
          >
            {formatPrice(commission.quotedPrice || commission.quote)}
          </div>
        </div>

        {/* Dimensions */}
        {commission.dimensions && (
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#a09888',
                marginBottom: '4px',
              }}
            >
              Dimenzije
            </div>
            <div style={{ color: '#f0ece4', fontSize: '0.9rem' }}>
              {commission.dimensions}
            </div>
          </div>
        )}

        {/* Deadline */}
        {commission.deadline && (
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#a09888',
                marginBottom: '4px',
              }}
            >
              Rok
            </div>
            <div style={{ color: '#f0ece4', fontSize: '0.9rem' }}>
              {formatDate(commission.deadline)}
            </div>
          </div>
        )}
      </div>

      {/* Artist Note */}
      {commission.quoteNote && (
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            padding: '12px 16px',
            marginBottom: '16px',
            borderLeft: '3px solid rgba(201, 168, 76, 0.4)',
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#a09888',
              marginBottom: '6px',
            }}
          >
            Opomba umetnika
          </div>
          <div style={{ color: '#f0ece4', fontSize: '0.88rem', lineHeight: 1.5 }}>
            {commission.quoteNote}
          </div>
        </div>
      )}

      {/* Buyer Actions */}
      {!isArtist && isPending && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            onClick={onAccept}
            style={{
              flex: 1,
              padding: '12px 20px',
              background: '#c9a84c',
              color: '#0a0a0a',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.target.style.background = '#d4b96a')}
            onMouseLeave={(e) => (e.target.style.background = '#c9a84c')}
          >
            Sprejmi ponudbo
          </button>
          <button
            onClick={onDecline}
            style={{
              flex: 1,
              padding: '12px 20px',
              background: 'transparent',
              color: '#a09888',
              border: '1px solid rgba(201, 168, 76, 0.15)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              e.target.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(201, 168, 76, 0.15)';
              e.target.style.color = '#a09888';
            }}
          >
            Zavrni
          </button>
        </div>
      )}
    </div>
  );
}
