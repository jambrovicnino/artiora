const sortOptions = [
  { value: 'newest', label: 'Najnovejše' },
  { value: 'oldest', label: 'Najstarejše' },
  { value: 'price-asc', label: 'Cena \u2191' },
  { value: 'price-desc', label: 'Cena \u2193' },
  { value: 'title-asc', label: 'Naslov A-Z' },
];

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    marginBottom: '1.5rem',
    borderBottom: '1px solid var(--gold-border)',
    gap: '16px',
    flexWrap: 'wrap',
  },
  count: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    letterSpacing: '0.05em',
  },
  countNumber: {
    color: 'var(--gold)',
    fontWeight: 600,
  },
  selectWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
  },
  select: {
    padding: '6px 12px',
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    outline: 'none',
  },
};

export default function ArtworkSort({ sort = 'newest', onSortChange, resultCount = 0 }) {
  return (
    <div style={styles.bar}>
      <span style={styles.count}>
        <span style={styles.countNumber}>{resultCount}</span>{' '}
        {resultCount === 1 ? 'umetnina' : resultCount < 5 ? 'umetnine' : 'umetnin'}
      </span>

      <div style={styles.selectWrap}>
        <span style={styles.label}>Razvrsti:</span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          style={styles.select}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
