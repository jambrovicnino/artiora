const STATUS_CONFIG = {
  zahteva:     { label: 'Zahteva',      color: '#6B7280' },
  ponudba:     { label: 'Ponudba',      color: '#F59E0B' },
  sprejeto:    { label: 'Sprejeto',     color: '#3B82F6' },
  v_delu:      { label: 'V delu',       color: '#8B5CF6' },
  dostavljeno: { label: 'Dostavljeno',  color: '#F97316' },
  zakljuceno:  { label: 'Zakljuceno',   color: '#10B981' },
  preklicano:  { label: 'Preklicano',   color: '#EF4444' },
  // fallbacks for English statuses from context reducer
  pending:     { label: 'Zahteva',      color: '#6B7280' },
  quoted:      { label: 'Ponudba',      color: '#F59E0B' },
  accepted:    { label: 'Sprejeto',     color: '#3B82F6' },
  in_progress: { label: 'V delu',       color: '#8B5CF6' },
  delivered:   { label: 'Dostavljeno',  color: '#F97316' },
  completed:   { label: 'Zakljuceno',   color: '#10B981' },
  cancelled:   { label: 'Preklicano',   color: '#EF4444' },
};

export default function CommissionStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, color: '#6B7280' };

  return (
    <span
      className="commission-status-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        fontSize: '0.72rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        color: config.color,
        background: `${config.color}18`,
        border: `1px solid ${config.color}40`,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: config.color,
          flexShrink: 0,
        }}
      />
      {config.label}
    </span>
  );
}
