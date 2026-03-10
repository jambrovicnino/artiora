import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCommissions } from '../context/CommissionContext';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import CommissionStatusBadge from '../components/commission/CommissionStatusBadge';
import './MyCommissionsPage.css';

const STATUS_FILTERS = [
  { id: 'vse', label: 'Vse' },
  { id: 'zahteva', label: 'Zahteva' },
  { id: 'ponudba', label: 'Ponudba' },
  { id: 'sprejeto', label: 'Sprejeto' },
  { id: 'v_delu', label: 'V delu' },
  { id: 'dostavljeno', label: 'Dostavljeno' },
  { id: 'zakljuceno', label: 'Zakljuceno' },
  { id: 'preklicano', label: 'Preklicano' },
];

// Map English to Slovenian canonical
const STATUS_NORMALIZE = {
  pending: 'zahteva',
  quoted: 'ponudba',
  accepted: 'sprejeto',
  in_progress: 'v_delu',
  delivered: 'dostavljeno',
  completed: 'zakljuceno',
  cancelled: 'preklicano',
};

function normalizeStatus(s) {
  return STATUS_NORMALIZE[s] || s;
}

export default function MyCommissionsPage() {
  const { user } = useAuth();
  const { commissions } = useCommissions();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('artist'); // 'artist' | 'buyer'
  const [statusFilter, setStatusFilter] = useState('vse');

  // Filter commissions based on role tab
  const artistCommissions = useMemo(
    () =>
      commissions.filter(
        (c) => c.artistId === user?.id || c.artistId === user?.artistId
      ),
    [commissions, user]
  );

  const buyerCommissions = useMemo(
    () =>
      commissions.filter(
        (c) => c.clientId === user?.id || c.buyerId === user?.id
      ),
    [commissions, user]
  );

  const currentList = activeTab === 'artist' ? artistCommissions : buyerCommissions;

  // Apply status filter
  const filteredList = useMemo(() => {
    let list = currentList;
    if (statusFilter !== 'vse') {
      list = list.filter((c) => normalizeStatus(c.status) === statusFilter);
    }
    // Sort by most recent update
    return [...list].sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0)
    );
  }, [currentList, statusFilter]);

  function formatDate(dateStr) {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleDateString('sl-SI', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function formatPrice(min, max) {
    if (!min && !max) return null;
    if (min && max) return `${min} - ${max} EUR`;
    if (min) return `od ${min} EUR`;
    return `do ${max} EUR`;
  }

  function getLastMessage(commission) {
    const msgs = commission.messages || [];
    if (msgs.length === 0) return null;
    return msgs[msgs.length - 1];
  }

  function handleCardClick(commId) {
    navigate(`/naroci-delo/pogovor/${commId}`);
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-main">
        {/* Header */}
        <div className="commissions-header">
          <h1 className="commissions-title">Moja narocila</h1>
          <p className="commissions-subtitle">
            Upravljajte narocila po meri in komunicirajte z umetniki ali kupci.
          </p>
        </div>

        {/* Tabs */}
        <div className="commissions-tabs">
          <button
            className={`commissions-tab ${activeTab === 'artist' ? 'commissions-tab-active' : ''}`}
            onClick={() => {
              setActiveTab('artist');
              setStatusFilter('vse');
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="M2 2l7.586 7.586" />
              <circle cx="11" cy="11" r="2" />
            </svg>
            Kot Umetnik
            {artistCommissions.length > 0 && (
              <span className="commissions-tab-count">{artistCommissions.length}</span>
            )}
          </button>
          <button
            className={`commissions-tab ${activeTab === 'buyer' ? 'commissions-tab-active' : ''}`}
            onClick={() => {
              setActiveTab('buyer');
              setStatusFilter('vse');
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg>
            Kot Kupec
            {buyerCommissions.length > 0 && (
              <span className="commissions-tab-count">{buyerCommissions.length}</span>
            )}
          </button>
        </div>

        {/* Status Filters */}
        <div className="commissions-filters">
          {STATUS_FILTERS.map((sf) => (
            <button
              key={sf.id}
              className={`commissions-filter-btn ${statusFilter === sf.id ? 'commissions-filter-active' : ''}`}
              onClick={() => setStatusFilter(sf.id)}
            >
              {sf.label}
            </button>
          ))}
        </div>

        {/* Commission List */}
        {filteredList.length === 0 ? (
          <div className="commissions-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <h3>Ni narocil</h3>
            <p>
              {activeTab === 'artist'
                ? 'Se nimate prejetih narocil kot umetnik.'
                : 'Se niste oddali nobenega narocila kot kupec.'}
            </p>
          </div>
        ) : (
          <div className="commissions-list">
            {filteredList.map((comm) => {
              const lastMsg = getLastMessage(comm);
              const otherName =
                activeTab === 'artist' ? comm.clientName : comm.artistName;

              return (
                <div
                  key={comm.id}
                  className="commission-card"
                  onClick={() => handleCardClick(comm.id)}
                >
                  <div className="commission-card-top">
                    <div className="commission-card-info">
                      <h3 className="commission-card-title">{comm.title}</h3>
                      <span className="commission-card-party">
                        {activeTab === 'artist' ? 'Kupec' : 'Umetnik'}:{' '}
                        <strong>{otherName}</strong>
                      </span>
                    </div>
                    <CommissionStatusBadge status={comm.status} />
                  </div>

                  <div className="commission-card-details">
                    {formatPrice(comm.budgetMin, comm.budgetMax) && (
                      <span className="commission-card-budget">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="1" x2="12" y2="23" />
                          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                        </svg>
                        {formatPrice(comm.budgetMin, comm.budgetMax)}
                      </span>
                    )}
                    {(comm.quotedPrice || comm.quote) && (
                      <span className="commission-card-quoted">
                        Ponudba: {comm.quotedPrice || comm.quote} EUR
                      </span>
                    )}
                  </div>

                  {lastMsg && (
                    <div className="commission-card-preview">
                      <span className="commission-card-preview-sender">
                        {lastMsg.senderName}:
                      </span>{' '}
                      <span className="commission-card-preview-text">
                        {lastMsg.text?.length > 80
                          ? lastMsg.text.slice(0, 80) + '...'
                          : lastMsg.text}
                      </span>
                    </div>
                  )}

                  <div className="commission-card-footer">
                    <span className="commission-card-date">
                      {formatDate(comm.updatedAt || comm.createdAt)}
                    </span>
                    <span className="commission-card-arrow">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
