import { getEditionType } from '../../data/tierSystem';

const badgeStyles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontFamily: 'var(--font-body)',
    borderRadius: 'var(--radius-sm)',
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },
  unikat: {
    background: 'rgba(234, 179, 8, 0.15)',
    color: '#eab308',
    border: '1px solid rgba(234, 179, 8, 0.35)',
  },
  limitirana: {
    background: 'rgba(139, 92, 246, 0.15)',
    color: '#a78bfa',
    border: '1px solid rgba(139, 92, 246, 0.35)',
  },
  odprta: {
    background: 'rgba(59, 130, 246, 0.15)',
    color: '#60a5fa',
    border: '1px solid rgba(59, 130, 246, 0.35)',
  },
};

export default function EditionBadge({ editionType, editionSize, editionsSold }) {
  const edition = getEditionType(editionType);
  const typeStyle = badgeStyles[editionType] || badgeStyles.odprta;

  let badgeText = edition.badge;

  if (editionType === 'unikat') {
    badgeText = '1/1';
  } else if (editionType === 'limitirana' && editionSize) {
    const sold = editionsSold ?? 0;
    const next = sold + 1 > editionSize ? editionSize : sold + 1;
    badgeText = `LS ${next}/${editionSize}`;
  } else if (editionType === 'odprta') {
    badgeText = 'OS';
  }

  return (
    <span
      style={{ ...badgeStyles.base, ...typeStyle }}
      title={edition.label}
    >
      {badgeText}
    </span>
  );
}
