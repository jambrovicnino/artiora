import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useArtists } from '../context/ArtistContext';
import { useCommissions } from '../context/CommissionContext';
import './CommissionRequestPage.css';

const CATEGORIES = [
  { id: 'portreti', label: 'Portreti' },
  { id: 'pokrajine', label: 'Pokrajine' },
  { id: 'abstrakt', label: 'Abstrakt' },
  { id: 'moderna', label: 'Moderna umetnost' },
  { id: 'digitalna', label: 'Digitalna umetnost' },
  { id: 'ilustracija', label: 'Ilustracija' },
  { id: 'drugo', label: 'Drugo' },
];

const initialForm = {
  title: '',
  description: '',
  category: '',
  budgetMin: '',
  budgetMax: '',
  dimensions: '',
  deadline: '',
};

export default function CommissionRequestPage() {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { getArtist } = useArtists();
  const { createCommission } = useCommissions();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const artist = getArtist(artistId);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="commission-request-page">
        <div className="commission-request-container">
          <div className="commission-auth-notice">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <h2>Prijava je obvezna</h2>
            <p>Za oddajo narocila se morate najprej prijaviti.</p>
            <Link to="/prijava" className="btn-commission-primary">
              Prijava
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="commission-request-page">
        <div className="commission-request-container">
          <div className="commission-auth-notice">
            <h2>Umetnik ni najden</h2>
            <p>Umetnik s tem ID-jem ne obstaja.</p>
            <Link to="/umetniki" className="btn-commission-primary">
              Nazaj na umetnike
            </Link>
          </div>
        </div>
      </div>
    );
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Naslov je obvezen';
    if (!form.description.trim()) errs.description = 'Opis je obvezen';
    if (!form.category) errs.category = 'Izberite kategorijo';
    if (!form.budgetMin || Number(form.budgetMin) <= 0) errs.budgetMin = 'Vnesite minimalni proracun';
    if (!form.budgetMax || Number(form.budgetMax) <= 0) errs.budgetMax = 'Vnesite maksimalni proracun';
    if (form.budgetMin && form.budgetMax && Number(form.budgetMin) > Number(form.budgetMax)) {
      errs.budgetMax = 'Maksimalni proracun mora biti vecji od minimalnega';
    }
    if (!form.deadline) errs.deadline = 'Izberite rok';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const commissionData = {
      clientId: user.id,
      clientName: user.name,
      artistId: artist.id,
      artistName: artist.name,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      budgetMin: Number(form.budgetMin),
      budgetMax: Number(form.budgetMax),
      currency: 'EUR',
      dimensions: form.dimensions.trim() || null,
      deadline: new Date(form.deadline).toISOString(),
      referenceImages: [],
      status: 'zahteva',
    };

    createCommission(commissionData);

    // Navigate to commissions list (the new commission will be at the top)
    navigate('/nadzorna-plosca/narocila');
  }

  return (
    <div className="commission-request-page">
      <div className="commission-request-container">
        {/* Artist Header */}
        <div className="commission-artist-header">
          <div className="commission-artist-avatar">
            {artist.avatar ? (
              <img src={artist.avatar} alt={artist.name} />
            ) : (
              <div className="commission-artist-initials">
                {artist.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="commission-artist-info">
            <span className="commission-artist-label">Narocilo za umetnika</span>
            <h2 className="commission-artist-name">{artist.name}</h2>
            {artist.specialty && (
              <span className="commission-artist-specialty">{artist.specialty}</span>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="commission-form-header">
          <h1 className="commission-form-title">Naroci delo po meri</h1>
          <p className="commission-form-subtitle">
            Opisite zeleno umetnino in vase preference. Umetnik vam bo poslal ponudbo.
          </p>
        </div>

        <form className="commission-form" onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="form-section">
            <label className="form-label" htmlFor="comm-title">
              Naslov narocila <span className="form-required">*</span>
            </label>
            <input
              type="text"
              id="comm-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="npr. Portret v oljnih barvah"
              className={`form-input ${errors.title ? 'input-error' : ''}`}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          {/* Description */}
          <div className="form-section">
            <label className="form-label" htmlFor="comm-desc">
              Opis zelenega dela <span className="form-required">*</span>
            </label>
            <textarea
              id="comm-desc"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Podrobno opisite, kaksen tip umetnine si zelite, slog, barve, razpolozenje..."
              rows={5}
              className={`form-textarea ${errors.description ? 'input-error' : ''}`}
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          {/* Category */}
          <div className="form-section">
            <label className="form-label" htmlFor="comm-category">
              Kategorija <span className="form-required">*</span>
            </label>
            <select
              id="comm-category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`form-select ${errors.category ? 'input-error' : ''}`}
            >
              <option value="">Izberite kategorijo</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && <span className="form-error">{errors.category}</span>}
          </div>

          {/* Budget Range */}
          <div className="form-row">
            <div className="form-section">
              <label className="form-label" htmlFor="comm-budget-min">
                Minimalni proracun (EUR) <span className="form-required">*</span>
              </label>
              <input
                type="number"
                id="comm-budget-min"
                name="budgetMin"
                value={form.budgetMin}
                onChange={handleChange}
                placeholder="npr. 100"
                min="1"
                className={`form-input ${errors.budgetMin ? 'input-error' : ''}`}
              />
              {errors.budgetMin && <span className="form-error">{errors.budgetMin}</span>}
            </div>

            <div className="form-section">
              <label className="form-label" htmlFor="comm-budget-max">
                Maksimalni proracun (EUR) <span className="form-required">*</span>
              </label>
              <input
                type="number"
                id="comm-budget-max"
                name="budgetMax"
                value={form.budgetMax}
                onChange={handleChange}
                placeholder="npr. 300"
                min="1"
                className={`form-input ${errors.budgetMax ? 'input-error' : ''}`}
              />
              {errors.budgetMax && <span className="form-error">{errors.budgetMax}</span>}
            </div>
          </div>

          {/* Dimensions & Deadline */}
          <div className="form-row">
            <div className="form-section">
              <label className="form-label" htmlFor="comm-dimensions">
                Zelene dimenzije
              </label>
              <input
                type="text"
                id="comm-dimensions"
                name="dimensions"
                value={form.dimensions}
                onChange={handleChange}
                placeholder="npr. 50x70 cm"
                className="form-input"
              />
              <span className="form-hint">Neobvezno. Umetnik vam lahko predlaga dimenzije.</span>
            </div>

            <div className="form-section">
              <label className="form-label" htmlFor="comm-deadline">
                Zeleni rok <span className="form-required">*</span>
              </label>
              <input
                type="date"
                id="comm-deadline"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`form-input ${errors.deadline ? 'input-error' : ''}`}
              />
              {errors.deadline && <span className="form-error">{errors.deadline}</span>}
            </div>
          </div>

          {/* Reference Images Placeholder */}
          <div className="form-section">
            <label className="form-label">Referencne slike</label>
            <div className="commission-ref-upload">
              <div className="commission-ref-placeholder">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="commission-ref-text">
                  Povlecite slike sem ali kliknite za izbiro
                </span>
                <span className="commission-ref-hint">
                  Demo nacin: nalaganje slik ni aktivno
                </span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button type="submit" className="btn-commission-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Posli zahtevo
            </button>
            <Link to={`/umetnik/${artistId}`} className="btn-commission-secondary">
              Preklici
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
