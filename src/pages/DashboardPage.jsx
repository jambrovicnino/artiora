import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { useCommissions } from '../context/CommissionContext';
import { useArtists } from '../context/ArtistContext';
import { useWishlist } from '../context/WishlistContext';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardStats from '../components/dashboard/DashboardStats';
import './DashboardPage.css';

const STATUS_LABELS = {
  odobrena: 'Odobrena',
  v_pregledu: 'V pregledu',
  zavrnjena: 'Zavrnjena',
  razprodana: 'Razprodana',
};

const STATUS_COLORS = {
  odobrena: '#4a7c59',
  v_pregledu: '#eab308',
  zavrnjena: '#c94444',
  razprodana: '#8b5cf6',
};

const COMMISSION_LABELS = {
  pending: 'Cakanje',
  quoted: 'Ponudba',
  in_progress: 'V delu',
  delivered: 'Dostavljeno',
  completed: 'Zakljuceno',
  cancelled: 'Preklicano',
};

/* ─── Customer stat card config ─────────────── */
const CUSTOMER_STAT_CONFIG = [
  {
    key: 'wishlist',
    label: 'Priljubljene',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
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
    key: 'completed',
    label: 'Zakljucena',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    format: (v) => String(v ?? 0),
  },
  {
    key: 'totalSpent',
    label: 'Skupna poraba',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    format: (v) => (v ? `€${v}` : '€0'),
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { artworks } = useMarketplace();
  const { commissions } = useCommissions();
  const { getArtist } = useArtists();
  const { wishlistCount } = useWishlist();

  const artistId = user?.artistId;
  const isArtist = !!artistId;
  const artist = artistId ? getArtist(artistId) : null;

  // Filter artworks and commissions for this artist
  const myArtworks = useMemo(
    () => (isArtist ? artworks.filter((a) => a.artistId === artistId) : []),
    [artworks, artistId, isArtist]
  );

  // Artist sees commissions received; customer sees commissions placed
  const myCommissions = useMemo(
    () =>
      isArtist
        ? commissions.filter((c) => c.artistId === artistId)
        : commissions.filter((c) => c.clientId === user?.id),
    [commissions, artistId, isArtist, user?.id]
  );

  // ─── Artist stats ───
  const artistStats = useMemo(() => {
    if (!isArtist) return null;
    const totalSales = myArtworks.reduce(
      (sum, a) => sum + (a.editionsSold || 0),
      0
    );
    const activeCommissions = myCommissions.filter(
      (c) => c.status !== 'completed' && c.status !== 'cancelled'
    ).length;

    return {
      sales: artist?.totalSales ?? totalSales,
      artworks: myArtworks.length,
      commissions: activeCommissions,
      rating: artist?.rating ?? null,
    };
  }, [myArtworks, myCommissions, artist, isArtist]);

  // ─── Customer stats ───
  const customerStats = useMemo(() => {
    if (isArtist) return null;
    const completedCount = myCommissions.filter(
      (c) => c.status === 'completed'
    ).length;
    const totalSpent = myCommissions
      .filter((c) => c.status === 'completed' && c.agreedPrice)
      .reduce((sum, c) => sum + c.agreedPrice, 0);

    return {
      wishlist: wishlistCount,
      commissions: myCommissions.length,
      completed: completedCount,
      totalSpent,
    };
  }, [myCommissions, wishlistCount, isArtist]);

  // Recent activity: combine artworks and commissions, sort by date
  const recentActivity = useMemo(() => {
    const activities = [];

    if (isArtist) {
      // Recent artworks
      myArtworks.slice().sort((a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      ).slice(0, 5).forEach((aw) => {
        activities.push({
          id: aw.id,
          type: 'artwork',
          title: aw.title,
          status: aw.status,
          statusLabel: STATUS_LABELS[aw.status] || aw.status,
          statusColor: STATUS_COLORS[aw.status] || '#a09888',
          date: aw.createdAt || aw.submittedDate,
          link: `/nadzorna-plosca/umetnine`,
        });
      });
    }

    // Commissions (both roles)
    myCommissions.slice().sort((a, b) =>
      new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
    ).slice(0, 5).forEach((c) => {
      activities.push({
        id: c.id,
        type: 'commission',
        title: c.title || `Narocilo #${c.id.slice(-5)}`,
        status: c.status,
        statusLabel: COMMISSION_LABELS[c.status] || c.status,
        statusColor: '#3b82f6',
        date: c.updatedAt || c.createdAt,
        link: `/nadzorna-plosca/narocila`,
      });
    });

    // Sort combined by date, take top 8
    activities.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return activities.slice(0, 8);
  }, [myArtworks, myCommissions, isArtist]);

  function formatDate(dateStr) {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    return d.toLocaleDateString('sl-SI', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              Dobrodosli, {user?.name || 'Uporabnik'}
            </h1>
            <p className="dashboard-subtitle">
              {isArtist
                ? 'Pregled vase umetniške dejavnosti'
                : 'Pregled vasega racuna'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <DashboardStats
          stats={isArtist ? artistStats : customerStats}
          config={isArtist ? undefined : CUSTOMER_STAT_CONFIG}
        />

        {/* Content Grid */}
        <div className="dashboard-content-grid">
          {/* Recent Activity */}
          <div className="dashboard-card dashboard-activity">
            <h2 className="dashboard-card-title">
              {isArtist ? 'Nedavna Aktivnost' : 'Moja Narocila'}
            </h2>
            {recentActivity.length === 0 ? (
              <p className="dashboard-empty">
                {isArtist
                  ? 'Se ni aktivnosti. Zacnite z nalaganjem umetnine!'
                  : 'Se nimate narocil. Raziščite Artmarket!'}
              </p>
            ) : (
              <div className="activity-list">
                {recentActivity.map((item) => (
                  <Link
                    key={item.id}
                    to={item.link}
                    className="activity-item"
                  >
                    <div className="activity-type-badge" data-type={item.type}>
                      {item.type === 'artwork' ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      )}
                    </div>
                    <div className="activity-info">
                      <span className="activity-title">{item.title}</span>
                      <span className="activity-date">{formatDate(item.date)}</span>
                    </div>
                    <span
                      className="activity-status"
                      style={{ color: item.statusColor }}
                    >
                      {item.statusLabel}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="dashboard-card dashboard-quick-links">
            <h2 className="dashboard-card-title">Hitre Povezave</h2>
            <div className="quick-links-grid">
              {isArtist ? (
                <>
                  <Link to="/nadzorna-plosca/nalozi" className="quick-link-item">
                    <div className="quick-link-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <span className="quick-link-label">Nalozi umetnino</span>
                  </Link>

                  <Link to="/artmarket" className="quick-link-item">
                    <div className="quick-link-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <span className="quick-link-label">Oglej si Artmarket</span>
                  </Link>

                  <Link to={`/umetnik/${artistId}`} className="quick-link-item">
                    <div className="quick-link-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="quick-link-label">Moj profil</span>
                  </Link>

                  <Link to="/nadzorna-plosca/umetnine" className="quick-link-item">
                    <div className="quick-link-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <span className="quick-link-label">Moje umetnine</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/artmarket" className="quick-link-item">
                    <div className="quick-link-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <span className="quick-link-label">Artmarket</span>
                  </Link>

                  <Link to="/umetniki" className="quick-link-item">
                    <div className="quick-link-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87" />
                        <path d="M16 3.13a4 4 0 010 7.75" />
                      </svg>
                    </div>
                    <span className="quick-link-label">Umetniki</span>
                  </Link>

                  <Link to="/priljubljene" className="quick-link-item">
                    <div className="quick-link-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>
                    </div>
                    <span className="quick-link-label">Priljubljene</span>
                  </Link>

                  <Link to="/nadzorna-plosca/narocila" className="quick-link-item">
                    <div className="quick-link-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    </div>
                    <span className="quick-link-label">Moja narocila</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Pending artworks notice (artist only) */}
        {isArtist && myArtworks.some((a) => a.status === 'v_pregledu') && (
          <div className="dashboard-notice">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>
              Imate {myArtworks.filter((a) => a.status === 'v_pregledu').length} umetnin, ki cakajo na pregled.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
