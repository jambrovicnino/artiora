// ═══════════════════════════════════════════════
// ARTIORA — Certified Badge Component
//
// Small shield badge for artwork cards.
// Shows "CERTIFICIRANO" with gold glow.
// ═══════════════════════════════════════════════

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  padding: '4px 10px',
  fontSize: '0.6rem',
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  fontFamily: 'var(--font-body, Inter, sans-serif)',
  color: '#c9a84c',
  background: 'rgba(201, 168, 76, 0.1)',
  border: '1px solid rgba(201, 168, 76, 0.3)',
  borderRadius: 'var(--radius-sm, 2px)',
  lineHeight: 1,
  whiteSpace: 'nowrap',
  boxShadow: '0 0 8px rgba(201, 168, 76, 0.15)',
  cursor: 'default',
};

export default function CertifiedBadge({ certificateId }) {
  if (!certificateId) return null;

  return (
    <span
      style={badgeStyle}
      title={`Certifikat: ${certificateId}`}
    >
      {/* Shield icon */}
      <svg
        width="12"
        height="12"
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
      CERTIFICIRANO
    </span>
  );
}
