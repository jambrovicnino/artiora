// ═══════════════════════════════════════════════
// ARTIORA — Provenance Timeline Component
//
// Vertical timeline showing ownership history.
// Gold connecting line, diamond-shaped dots.
// Cormorant Garamond for owner names.
// ═══════════════════════════════════════════════

const containerStyle = {
  position: 'relative',
  padding: '0 0 0 28px',
};

const lineStyle = {
  position: 'absolute',
  left: '8px',
  top: '6px',
  bottom: '6px',
  width: '2px',
  background: 'linear-gradient(to bottom, rgba(201, 168, 76, 0.6), rgba(201, 168, 76, 0.15))',
};

const entryStyle = {
  position: 'relative',
  paddingBottom: '20px',
};

const lastEntryStyle = {
  ...entryStyle,
  paddingBottom: 0,
};

const diamondStyle = {
  position: 'absolute',
  left: '-24px',
  top: '4px',
  width: '12px',
  height: '12px',
  background: '#c9a84c',
  transform: 'rotate(45deg)',
  border: '2px solid #0a0a0a',
  boxShadow: '0 0 6px rgba(201, 168, 76, 0.4)',
  zIndex: 1,
};

const diamondTransferStyle = {
  ...diamondStyle,
  background: 'transparent',
  border: '2px solid #c9a84c',
  boxShadow: '0 0 6px rgba(201, 168, 76, 0.2)',
};

const nameStyle = {
  fontFamily: "'Cormorant Garamond', 'Palatino Linotype', Georgia, serif",
  fontSize: '1rem',
  fontWeight: 600,
  color: '#f0ece4',
  lineHeight: 1.3,
};

const dateStyle = {
  fontSize: '0.72rem',
  color: '#a09888',
  fontFamily: "'Inter', sans-serif",
  marginTop: '2px',
  letterSpacing: '0.02em',
};

const typeStyle = {
  fontSize: '0.6rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  fontFamily: "'Inter', sans-serif",
  marginTop: '4px',
  padding: '2px 8px',
  display: 'inline-block',
  borderRadius: '2px',
};

const typeLabelMap = {
  original: {
    label: 'Izvirni lastnik',
    style: {
      ...typeStyle,
      color: '#c9a84c',
      background: 'rgba(201, 168, 76, 0.1)',
      border: '1px solid rgba(201, 168, 76, 0.25)',
    },
  },
  transfer: {
    label: 'Prenos lastništva',
    style: {
      ...typeStyle,
      color: '#a78bfa',
      background: 'rgba(139, 92, 246, 0.1)',
      border: '1px solid rgba(139, 92, 246, 0.25)',
    },
  },
};

function formatDate(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('sl-SI', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export default function ProvenanceTimeline({ ownerHistory }) {
  if (!ownerHistory || ownerHistory.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted, #5a5248)', fontSize: '0.85rem' }}>
        Ni podatkov o lastništvu.
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Vertical connecting line */}
      <div style={lineStyle} />

      {ownerHistory.map((entry, i) => {
        const isLast = i === ownerHistory.length - 1;
        const typeInfo = typeLabelMap[entry.type] || typeLabelMap.transfer;
        const isDiamond = entry.type === 'original' ? diamondStyle : diamondTransferStyle;

        return (
          <div key={i} style={isLast ? lastEntryStyle : entryStyle}>
            {/* Diamond marker */}
            <div style={isDiamond} />

            {/* Owner name */}
            <div style={nameStyle}>{entry.name}</div>

            {/* Date */}
            <div style={dateStyle}>{formatDate(entry.date)}</div>

            {/* Type badge */}
            <div style={typeInfo.style}>{typeInfo.label}</div>
          </div>
        );
      })}
    </div>
  );
}
