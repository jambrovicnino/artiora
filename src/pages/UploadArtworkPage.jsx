import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { ARTWORK_CATEGORIES, ARTWORK_MEDIUMS, EDITION_TYPES } from '../data/tierSystem';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import './UploadArtworkPage.css';

const initialForm = {
  title: '',
  description: '',
  category: '',
  medium: '',
  dimensions: '',
  price: '',
  editionType: 'unikat',
  editionSize: '',
  isAiGenerated: false,
  aiPrompt: '',
  tags: '',
};

export default function UploadArtworkPage() {
  const { user } = useAuth();
  const { addArtwork } = useMarketplace();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  }

  function handleEditionType(typeId) {
    setForm((prev) => ({
      ...prev,
      editionType: typeId,
      editionSize: typeId === 'limitirana' ? prev.editionSize : '',
    }));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Naslov je obvezen';
    if (!form.description.trim()) errs.description = 'Opis je obvezen';
    if (!form.category) errs.category = 'Izberite kategorijo';
    if (!form.medium) errs.medium = 'Izberite medij';
    if (!form.dimensions.trim()) errs.dimensions = 'Vpiste dimenzije';
    if (!form.price || Number(form.price) <= 0) errs.price = 'Vpiste veljavno ceno';
    if (form.editionType === 'limitirana') {
      if (!form.editionSize || Number(form.editionSize) < 2 || Number(form.editionSize) > 50) {
        errs.editionSize = 'Velikost serije mora biti med 2 in 50';
      }
    }
    if (form.isAiGenerated && !form.aiPrompt.trim()) {
      errs.aiPrompt = 'Vpiste AI prompt, ki ste ga uporabili';
    }
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const artworkData = {
      artistId: user?.artistId,
      title: form.title.trim(),
      description: form.description.trim(),
      image: '/gallery/placeholder-artwork.jpg',
      thumbnail: '/gallery/placeholder-artwork.jpg',
      category: form.category,
      medium: ARTWORK_MEDIUMS.find((m) => m.id === form.medium)?.label || form.medium,
      dimensions: form.dimensions.trim(),
      price: Number(form.price),
      currency: 'EUR',
      editionType: form.editionType,
      editionSize: form.editionType === 'limitirana' ? Number(form.editionSize) : form.editionType === 'unikat' ? 1 : null,
      editionsSold: 0,
      soldOut: false,
      status: 'v_pregledu',
      submittedDate: new Date().toISOString(),
      approvedDate: null,
      certificateId: null,
      isAiGenerated: form.isAiGenerated,
      aiPrompt: form.isAiGenerated ? form.aiPrompt.trim() : null,
      tags,
      viewCount: 0,
      favoriteCount: 0,
    };

    addArtwork(artworkData);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="dashboard-layout">
        <DashboardSidebar />
        <div className="dashboard-main">
          <div className="upload-success">
            <div className="upload-success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="upload-success-title">Umetnina uspesno nalozena!</h2>
            <p className="upload-success-text">
              Vasa umetnina je bila poslana v pregled. Ko bo odobrena, bo vidna v galeriji.
            </p>
            <div className="upload-success-actions">
              <Link to="/nadzorna-plosca/umetnine" className="btn-upload-primary">
                Moje Umetnine
              </Link>
              <button
                onClick={() => {
                  setForm(initialForm);
                  setSubmitted(false);
                  setErrors({});
                }}
                className="btn-upload-secondary"
              >
                Nalozi se eno
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-main">
        <div className="upload-header">
          <h1 className="upload-title">Nalozi Umetnino</h1>
          <p className="upload-subtitle">
            Izpolnite podatke o umetnini. Po oddaji bo umetnina pregledana s strani ekipe ARTIORA.
          </p>
        </div>

        <form className="upload-form" onSubmit={handleSubmit} noValidate>
          {/* Image Upload Zone */}
          <div className="form-section">
            <label className="form-label">Slika umetnine</label>
            <div
              className={`upload-drop-zone ${dragOver ? 'drop-zone-active' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
            >
              <div className="drop-zone-content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="drop-zone-text">
                  Povlecite sliko sem ali kliknite za izbiro
                </span>
                <span className="drop-zone-hint">
                  Demo nacin: Uporabljena bo nadomestna slika
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="form-section">
            <label className="form-label" htmlFor="title">
              Naslov umetnine <span className="form-required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="npr. Modro-Zlati Abstrakt"
              className={`form-input ${errors.title ? 'input-error' : ''}`}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          {/* Description */}
          <div className="form-section">
            <label className="form-label" htmlFor="description">
              Opis <span className="form-required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Opisite vaso umetnino, inspiracijo, tehniko..."
              rows={4}
              className={`form-textarea ${errors.description ? 'input-error' : ''}`}
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          {/* Category & Medium Row */}
          <div className="form-row">
            <div className="form-section">
              <label className="form-label" htmlFor="category">
                Kategorija <span className="form-required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`form-select ${errors.category ? 'input-error' : ''}`}
              >
                <option value="">Izberite kategorijo</option>
                {ARTWORK_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && <span className="form-error">{errors.category}</span>}
            </div>

            <div className="form-section">
              <label className="form-label" htmlFor="medium">
                Medij / Tehnika <span className="form-required">*</span>
              </label>
              <select
                id="medium"
                name="medium"
                value={form.medium}
                onChange={handleChange}
                className={`form-select ${errors.medium ? 'input-error' : ''}`}
              >
                <option value="">Izberite medij</option>
                {ARTWORK_MEDIUMS.map((med) => (
                  <option key={med.id} value={med.id}>
                    {med.label}
                  </option>
                ))}
              </select>
              {errors.medium && <span className="form-error">{errors.medium}</span>}
            </div>
          </div>

          {/* Dimensions & Price Row */}
          <div className="form-row">
            <div className="form-section">
              <label className="form-label" htmlFor="dimensions">
                Dimenzije <span className="form-required">*</span>
              </label>
              <input
                type="text"
                id="dimensions"
                name="dimensions"
                value={form.dimensions}
                onChange={handleChange}
                placeholder="npr. 50x70 cm"
                className={`form-input ${errors.dimensions ? 'input-error' : ''}`}
              />
              {errors.dimensions && <span className="form-error">{errors.dimensions}</span>}
            </div>

            <div className="form-section">
              <label className="form-label" htmlFor="price">
                Cena (EUR) <span className="form-required">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="npr. 189"
                min="1"
                step="1"
                className={`form-input ${errors.price ? 'input-error' : ''}`}
              />
              {errors.price && <span className="form-error">{errors.price}</span>}
            </div>
          </div>

          {/* Edition Type */}
          <div className="form-section">
            <label className="form-label">
              Tip izdaje <span className="form-required">*</span>
            </label>
            <div className="edition-type-grid">
              {EDITION_TYPES.map((et) => (
                <button
                  type="button"
                  key={et.id}
                  className={`edition-type-btn ${form.editionType === et.id ? 'edition-type-active' : ''}`}
                  onClick={() => handleEditionType(et.id)}
                  style={{
                    '--edition-color': et.color,
                  }}
                >
                  <span className="edition-badge" style={{ background: et.color }}>
                    {et.badge}
                  </span>
                  <span className="edition-label">{et.label}</span>
                  <span className="edition-desc">{et.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Edition Size (only for limitirana) */}
          {form.editionType === 'limitirana' && (
            <div className="form-section">
              <label className="form-label" htmlFor="editionSize">
                Velikost serije (2-50) <span className="form-required">*</span>
              </label>
              <input
                type="number"
                id="editionSize"
                name="editionSize"
                value={form.editionSize}
                onChange={handleChange}
                placeholder="npr. 10"
                min="2"
                max="50"
                className={`form-input form-input-short ${errors.editionSize ? 'input-error' : ''}`}
              />
              {errors.editionSize && <span className="form-error">{errors.editionSize}</span>}
            </div>
          )}

          {/* AI Generated Toggle */}
          <div className="form-section">
            <label className="form-label">AI generirano delo</label>
            <div className="toggle-row">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="isAiGenerated"
                  checked={form.isAiGenerated}
                  onChange={handleChange}
                />
                <span className="toggle-slider" />
              </label>
              <span className="toggle-label">
                {form.isAiGenerated ? 'Da, to delo je ustvarjeno s pomocjo AI' : 'Ne, to je rocno ustvarjeno delo'}
              </span>
            </div>
          </div>

          {/* AI Prompt (conditional) */}
          {form.isAiGenerated && (
            <div className="form-section">
              <label className="form-label" htmlFor="aiPrompt">
                AI Prompt <span className="form-required">*</span>
              </label>
              <textarea
                id="aiPrompt"
                name="aiPrompt"
                value={form.aiPrompt}
                onChange={handleChange}
                placeholder="Vpiste prompt, ki ste ga uporabili za generiranje umetnine..."
                rows={3}
                className={`form-textarea ${errors.aiPrompt ? 'input-error' : ''}`}
              />
              {errors.aiPrompt && <span className="form-error">{errors.aiPrompt}</span>}
            </div>
          )}

          {/* Tags */}
          <div className="form-section">
            <label className="form-label" htmlFor="tags">
              Oznake (loceno z vejico)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="npr. abstrakt, modra, zlata, moderna"
              className="form-input"
            />
            <span className="form-hint">Oznake pomagajo kupcem najti vaso umetnino</span>
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button type="submit" className="btn-upload-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Oddaj v pregled
            </button>
            <Link to="/nadzorna-plosca" className="btn-upload-secondary">
              Preklici
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
