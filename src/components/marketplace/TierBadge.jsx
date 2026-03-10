import { getTier } from '../../data/tierSystem';

const tierStyles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 10px',
    fontSize: '0.65rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontFamily: 'var(--font-body)',
    borderRadius: 'var(--radius-sm)',
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
  },
};

function getTierStyle(tier) {
  const color = tier.color;
  return {
    background: `${color}18`,
    color: color,
    border: `1px solid ${color}40`,
  };
}

export default function TierBadge({ tier }) {
  const tierData = getTier(tier);
  const colorStyle = getTierStyle(tierData);

  return (
    <span
      style={{ ...tierStyles.base, ...colorStyle }}
      title={tierData.requirements}
    >
      <span style={{ fontSize: '0.8rem', lineHeight: 1 }}>{tierData.icon}</span>
      <span>{tierData.label}</span>
    </span>
  );
}
