import { getEditionType } from '../../data/tierSystem';

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  price: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.35rem',
    fontWeight: 600,
    color: 'var(--gold)',
    letterSpacing: '0.02em',
    lineHeight: 1.2,
  },
  soldOut: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--error)',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    lineHeight: 1.2,
  },
  editionIndicator: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.6rem',
    fontWeight: 500,
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
};

export default function PriceDisplay({ price, soldOut, editionType }) {
  const edition = editionType ? getEditionType(editionType) : null;

  const formattedPrice = new Intl.NumberFormat('sl-SI', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <div style={styles.wrapper}>
      {soldOut ? (
        <span style={styles.soldOut}>RAZPRODANO</span>
      ) : (
        <span style={styles.price}>&euro;{formattedPrice}</span>
      )}
      {edition && (
        <span style={styles.editionIndicator}>
          {edition.label}
        </span>
      )}
    </div>
  );
}
