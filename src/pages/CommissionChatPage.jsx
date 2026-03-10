import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCommissions } from '../context/CommissionContext';
import CommissionStatusBadge from '../components/commission/CommissionStatusBadge';
import QuoteCard from '../components/commission/QuoteCard';
import './CommissionChatPage.css';

// Map all possible statuses to Slovenian canonical
const STATUS_MAP = {
  pending: 'zahteva',
  quoted: 'ponudba',
  accepted: 'sprejeto',
  in_progress: 'v_delu',
  delivered: 'dostavljeno',
  completed: 'zakljuceno',
  cancelled: 'preklicano',
  zahteva: 'zahteva',
  ponudba: 'ponudba',
  sprejeto: 'sprejeto',
  v_delu: 'v_delu',
  dostavljeno: 'dostavljeno',
  zakljuceno: 'zakljuceno',
  preklicano: 'preklicano',
};

function normalizeStatus(s) {
  return STATUS_MAP[s] || s;
}

export default function CommissionChatPage() {
  const { commissionId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    getCommission,
    addMessage,
    sendQuote,
    acceptQuote,
    deliver,
    complete,
    cancel,
  } = useCommissions();

  const [messageText, setMessageText] = useState('');
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteNote, setQuoteNote] = useState('');
  const messagesEndRef = useRef(null);

  const commission = getCommission(commissionId);
  const status = commission ? normalizeStatus(commission.status) : null;

  const isArtist = useMemo(
    () => user && commission && (user.id === commission.artistId || user.artistId === commission.artistId),
    [user, commission]
  );

  const isBuyer = useMemo(
    () => user && commission && (user.id === commission.clientId || user.id === commission.buyerId),
    [user, commission]
  );

  const otherPartyName = useMemo(() => {
    if (!commission) return '';
    return isArtist ? commission.clientName : commission.artistName;
  }, [commission, isArtist]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commission?.messages?.length]);

  if (!isAuthenticated) {
    return (
      <div className="chat-page">
        <div className="chat-auth-notice">
          <h2>Prijava je obvezna</h2>
          <p>Za ogled pogovora se morate prijaviti.</p>
          <Link to="/prijava" className="btn-chat-gold">Prijava</Link>
        </div>
      </div>
    );
  }

  if (!commission) {
    return (
      <div className="chat-page">
        <div className="chat-auth-notice">
          <h2>Narocilo ni najdeno</h2>
          <p>Narocilo s tem ID-jem ne obstaja ali nimate dostopa.</p>
          <Link to="/nadzorna-plosca/narocila" className="btn-chat-gold">
            Moja narocila
          </Link>
        </div>
      </div>
    );
  }

  function formatTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleString('sl-SI', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function handleSendMessage(e) {
    e.preventDefault();
    if (!messageText.trim()) return;
    addMessage(commissionId, {
      senderId: user.id,
      senderName: user.name,
      text: messageText.trim(),
      attachments: [],
    });
    setMessageText('');
  }

  function handleSendQuote(e) {
    e.preventDefault();
    if (!quotePrice || Number(quotePrice) <= 0) return;
    sendQuote(commissionId, Number(quotePrice), quoteNote.trim());
    // Also add a system-like message about the quote
    addMessage(commissionId, {
      senderId: 'system',
      senderName: 'Sistem',
      text: `Umetnik ${commission.artistName} je poslal ponudbo: ${Number(quotePrice).toFixed(2)} EUR`,
      attachments: [],
    });
    setShowQuoteForm(false);
    setQuotePrice('');
    setQuoteNote('');
  }

  function handleAcceptQuote() {
    acceptQuote(commissionId);
    addMessage(commissionId, {
      senderId: 'system',
      senderName: 'Sistem',
      text: `${commission.clientName} je sprejel/a ponudbo. Delo se lahko zacne!`,
      attachments: [],
    });
  }

  function handleDeclineQuote() {
    cancel(commissionId);
    addMessage(commissionId, {
      senderId: 'system',
      senderName: 'Sistem',
      text: `${commission.clientName} je zavrnil/a ponudbo. Narocilo je preklicano.`,
      attachments: [],
    });
  }

  function handleDeliver() {
    deliver(commissionId, null);
    addMessage(commissionId, {
      senderId: 'system',
      senderName: 'Sistem',
      text: `${commission.artistName} je dostavil/a delo. Caka na potrditev kupca.`,
      attachments: [],
    });
  }

  function handleComplete() {
    complete(commissionId);
    addMessage(commissionId, {
      senderId: 'system',
      senderName: 'Sistem',
      text: 'Narocilo je zakljuceno. Hvala za zaupanje!',
      attachments: [],
    });
  }

  function handleCancel() {
    if (!window.confirm('Ali ste prepricani, da zelite preklicati narocilo?')) return;
    cancel(commissionId);
    addMessage(commissionId, {
      senderId: 'system',
      senderName: 'Sistem',
      text: `${user.name} je preklical/a narocilo.`,
      attachments: [],
    });
  }

  const isClosed = status === 'zakljuceno' || status === 'preklicano';
  const hasQuote = status === 'ponudba' || (commission.quotedPrice || commission.quote);
  const showQuoteInline = hasQuote && status !== 'zahteva';

  return (
    <div className="chat-page">
      {/* Top Bar */}
      <div className="chat-topbar">
        <Link to="/nadzorna-plosca/narocila" className="chat-back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div className="chat-topbar-info">
          <h1 className="chat-topbar-title">{commission.title}</h1>
          <div className="chat-topbar-meta">
            <span className="chat-topbar-party">
              {isArtist ? 'Kupec' : 'Umetnik'}: <strong>{otherPartyName}</strong>
            </span>
            <CommissionStatusBadge status={commission.status} />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {/* Commission Info Card at top */}
        <div className="chat-system-card">
          <div className="chat-system-card-title">Podrobnosti narocila</div>
          <div className="chat-system-card-grid">
            {commission.category && (
              <div>
                <span className="chat-detail-label">Kategorija</span>
                <span className="chat-detail-value">{commission.category}</span>
              </div>
            )}
            {(commission.budgetMin || commission.budgetMax) && (
              <div>
                <span className="chat-detail-label">Proracun</span>
                <span className="chat-detail-value">
                  {commission.budgetMin} - {commission.budgetMax} EUR
                </span>
              </div>
            )}
            {commission.dimensions && (
              <div>
                <span className="chat-detail-label">Dimenzije</span>
                <span className="chat-detail-value">{commission.dimensions}</span>
              </div>
            )}
            {commission.deadline && (
              <div>
                <span className="chat-detail-label">Rok</span>
                <span className="chat-detail-value">
                  {new Date(commission.deadline).toLocaleDateString('sl-SI', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
          {commission.description && (
            <div className="chat-system-card-desc">
              {commission.description}
            </div>
          )}
        </div>

        {/* Message Thread */}
        {(commission.messages || []).map((msg) => {
          const isOwn = msg.senderId === user.id || msg.senderId === user.artistId;
          const isSystem = msg.senderId === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="chat-msg-system">
                <span>{msg.text}</span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`chat-msg ${isOwn ? 'chat-msg-own' : 'chat-msg-other'}`}
            >
              <div className="chat-msg-bubble">
                <span className="chat-msg-sender">{msg.senderName}</span>
                <p className="chat-msg-text">{msg.text}</p>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="chat-msg-attachments">
                    {msg.attachments.map((att, i) => (
                      <div key={i} className="chat-msg-attachment">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                        </svg>
                        <span>Priloga {i + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
                <span className="chat-msg-time">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          );
        })}

        {/* Inline Quote Card */}
        {showQuoteInline && (
          <div className="chat-quote-inline">
            <QuoteCard
              commission={commission}
              isArtist={isArtist}
              onAccept={handleAcceptQuote}
              onDecline={handleDeclineQuote}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Action Buttons Area */}
      {!isClosed && (
        <div className="chat-actions-bar">
          {/* Artist: Send Quote */}
          {isArtist && (status === 'zahteva' || status === 'pending') && !showQuoteForm && (
            <button
              className="btn-chat-action btn-chat-action-gold"
              onClick={() => setShowQuoteForm(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Posli ponudbo
            </button>
          )}

          {/* Artist: Deliver */}
          {isArtist && (status === 'v_delu' || status === 'sprejeto' || status === 'in_progress' || status === 'accepted') && (
            <button className="btn-chat-action btn-chat-action-gold" onClick={handleDeliver}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Oznaci kot dostavljeno
            </button>
          )}

          {/* Buyer: Accept/Decline Quote */}
          {isBuyer && (status === 'ponudba' || status === 'quoted') && (
            <>
              <button className="btn-chat-action btn-chat-action-gold" onClick={handleAcceptQuote}>
                Sprejmi ponudbo
              </button>
              <button className="btn-chat-action btn-chat-action-outline" onClick={handleDeclineQuote}>
                Zavrni ponudbo
              </button>
            </>
          )}

          {/* Buyer: Mark Complete */}
          {isBuyer && (status === 'dostavljeno' || status === 'delivered') && (
            <button className="btn-chat-action btn-chat-action-gold" onClick={handleComplete}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Potrdi zakljucek
            </button>
          )}

          {/* Cancel (both parties) */}
          {!isClosed && (
            <button className="btn-chat-action btn-chat-action-danger" onClick={handleCancel}>
              Preklici narocilo
            </button>
          )}
        </div>
      )}

      {/* Quote Form Modal */}
      {showQuoteForm && (
        <div className="chat-quote-overlay" onClick={() => setShowQuoteForm(false)}>
          <form
            className="chat-quote-form"
            onSubmit={handleSendQuote}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="chat-quote-form-title">Posli ponudbo</h3>

            <div className="chat-quote-field">
              <label className="form-label">Cena (EUR) *</label>
              <input
                type="number"
                value={quotePrice}
                onChange={(e) => setQuotePrice(e.target.value)}
                placeholder="npr. 150"
                min="1"
                className="form-input"
                autoFocus
              />
            </div>

            <div className="chat-quote-field">
              <label className="form-label">Opomba (neobvezno)</label>
              <textarea
                value={quoteNote}
                onChange={(e) => setQuoteNote(e.target.value)}
                placeholder="Dodajte pojasnilo o ponudbi..."
                rows={3}
                className="form-textarea"
              />
            </div>

            <div className="chat-quote-form-actions">
              <button type="submit" className="btn-chat-gold">
                Posli ponudbo
              </button>
              <button
                type="button"
                className="btn-chat-outline"
                onClick={() => setShowQuoteForm(false)}
              >
                Preklici
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Message Input */}
      {!isClosed && (
        <form className="chat-input-bar" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Vnesite sporocilo..."
            className="chat-input"
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!messageText.trim()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      )}

      {/* Closed Notice */}
      {isClosed && (
        <div className="chat-closed-notice">
          <span>
            {status === 'zakljuceno'
              ? 'To narocilo je zakljuceno.'
              : 'To narocilo je bilo preklicano.'}
          </span>
        </div>
      )}
    </div>
  );
}
