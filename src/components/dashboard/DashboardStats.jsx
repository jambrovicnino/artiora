import './DashboardStats.css';

const statConfig = [
  {
    key: 'sales',
    label: 'Prodaje',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    format: (v) => String(v ?? 0),
  },
  {
    key: 'artworks',
    label: 'Umetnine',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    format: (v) => String(v ?? 0),
  },
  {
    key: 'commissions',
    label: 'Narocila',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    format: (v) => String(v ?? 0),
  },
  {
    key: 'rating',
    label: 'Ocena',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    format: (v) => (v != null ? v.toFixed(1) : '---'),
  },
];

export default function DashboardStats({ stats = {}, config }) {
  const items = config || statConfig;
  return (
    <div className="dashboard-stats">
      {items.map((cfg) => (
        <div key={cfg.key} className="stat-card">
          <div className="stat-icon">{cfg.icon}</div>
          <div className="stat-content">
            <span className="stat-value">{cfg.format(stats[cfg.key])}</span>
            <span className="stat-label">{cfg.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
