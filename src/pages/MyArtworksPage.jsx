import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import './MyArtworksPage.css';

const STATUS_CONFIG = {
  odobrena: { label: 'Odobrena', color: '#4a7c59', bg: 'rgba(74, 124, 89, 0.15)' },
  v_pregledu: { label: 'V pregledu', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)' },
  zavrnjena: { label: 'Zavrnjena', color: '#c94444', bg: 'rgba(201, 68, 68, 0.15)' },
  razprodana: { label: 'Razprodana', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
};

const FILTER_TABS = [
  { id: 'vse', label: 'Vse' },
  { id: 'odobrena', label: 'Odobrene' },
  { id: 'v_pregledu', label: 'V pregledu' },
  { id: 'zavrnjena', label: 'Zavrnjene' },
  { id: 'razprodana', label: 'Razprodane' },
];

const EDITION_LABELS = {
  unikat: 'Unikat (1/1)',
  limitirana: 'Limitirana',
  odprta: 'Odprta serija',
};

export default function MyArtworksPage() {
  const { user } = useAuth();
  const { artworks } = useMarketplace();
  const [activeFilter, setActiveFilter] = useState('vse');

  const myArtworks = useMemo(
    () => artworks.filter((a) => a.artistId === user?.artistId),
    [artworks, user?.artistId]
  );

  const filteredArtworks = useMemo(() => {
    if (activeFilter === 'vse') return myArtworks;
    return myArtworks.filter((a) => a.status === activeFilter);
  }, [myArtworks, activeFilter]);

  // Sort by creation date, newest first
  const sortedArtworks = useMemo(
    () =>
      [...filteredArtworks].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      ),
    [filteredArtworks]
  );

  function formatDate(dateStr) {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    return d.toLocaleDateString('sl-SI', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function getEditionDisplay(artwork) {
    if (artwork.editionType === 'unikat') return 'Unikat (1/1)';
    if (artwork.editionType === 'limitirana') {
      return `${artwork.editionsSold || 0}/${artwork.editionSize || '?'} prodanih`;
    }
    return `${artwork.editionsSold || 0} prodanih`;
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-main">
        {/* Header */}
        <div className="my-artworks-header">
          <div>
            <h1 className="my-artworks-title">Moje Umetnine</h1>
            <p className="my-artworks-subtitle">
              {myArtworks.length} {myArtworks.length === 1 ? 'umetnina' : myArtworks.length < 5 ? 'umetnine' : 'umetnin'}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="artworks-filter-tabs">
          {FILTER_TABS.map((tab) => {
            const count =
              tab.id === 'vse'
                ? myArtworks.length
                : myArtworks.filter((a) => a.status === tab.id).length;
            return (
              <button
                key={tab.id}
                className={`filter-tab ${activeFilter === tab.id ? 'filter-tab-active' : ''}`}
                onClick={() => setActiveFilter(tab.id)}
              >
                {tab.label}
                <span className="filter-tab-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Artworks List */}
        {sortedArtworks.length === 0 ? (
          <div className="artworks-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p>
              {activeFilter === 'vse'
                ? 'Se nimate nalozenih umetnin.'
                : `Ni umetnin s statusom "${FILTER_TABS.find((t) => t.id === activeFilter)?.label}".`}
            </p>
          </div>
        ) : (
          <div className="artworks-table-wrapper">
            <table className="artworks-table">
              <thead>
                <tr>
                  <th className="th-image"></th>
                  <th>Naslov</th>
                  <th>Status</th>
                  <th>Izdaja</th>
                  <th>Cena</th>
                  <th>Datum</th>
                </tr>
              </thead>
              <tbody>
                {sortedArtworks.map((artwork) => {
                  const statusCfg = STATUS_CONFIG[artwork.status] || {
                    label: artwork.status,
                    color: '#a09888',
                    bg: 'rgba(160, 152, 136, 0.15)',
                  };
                  return (
                    <tr key={artwork.id} className="artwork-row">
                      <td className="td-image">
                        <div className="artwork-thumb">
                          <img
                            src={artwork.thumbnail || artwork.image}
                            alt={artwork.title}
                            onError={(e) => {
                              e.target.src = '/gallery/placeholder-artwork.jpg';
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="artwork-title-cell">
                          <span className="artwork-name">{artwork.title}</span>
                          <span className="artwork-category">{artwork.category}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            color: statusCfg.color,
                            background: statusCfg.bg,
                          }}
                        >
                          {statusCfg.label}
                        </span>
                        {artwork.status === 'zavrnjena' && artwork.rejectionReason && (
                          <span className="rejection-reason" title={artwork.rejectionReason}>
                            {artwork.rejectionReason}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="edition-info">
                          {getEditionDisplay(artwork)}
                        </span>
                      </td>
                      <td>
                        <span className="artwork-price">
                          {artwork.price ? `${artwork.price} EUR` : '---'}
                        </span>
                      </td>
                      <td>
                        <span className="artwork-date">
                          {formatDate(artwork.createdAt || artwork.submittedDate)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
