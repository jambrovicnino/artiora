import { useState } from 'react';
import { ARTWORK_CATEGORIES, ARTWORK_MEDIUMS } from '../../data/tierSystem';
import './ArtworkFilters.css';

const EDITION_OPTIONS = [
  { id: '', label: 'Vse' },
  { id: 'unikat', label: 'Unikat' },
  { id: 'limitirana', label: 'Limitirana' },
  { id: 'odprta', label: 'Odprta' },
];

const defaultSections = {
  kategorija: true,
  medij: true,
  edicija: true,
  cena: true,
  isci: true,
};

export default function ArtworkFilters({ filters = {}, onFilterChange }) {
  const [openSections, setOpenSections] = useState(defaultSections);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCategoryChange = (categoryId) => {
    const current = filters.categories || [];
    const updated = current.includes(categoryId)
      ? current.filter((c) => c !== categoryId)
      : [...current, categoryId];
    onFilterChange({ ...filters, categories: updated });
  };

  const handleMediumChange = (mediumId) => {
    const current = filters.mediums || [];
    const updated = current.includes(mediumId)
      ? current.filter((m) => m !== mediumId)
      : [...current, mediumId];
    onFilterChange({ ...filters, mediums: updated });
  };

  const handleEditionChange = (editionId) => {
    onFilterChange({ ...filters, editionType: editionId || '' });
  };

  const handlePriceChange = (field, value) => {
    const num = value === '' ? null : Number(value);
    onFilterChange({ ...filters, [field]: num });
  };

  const handleSearchChange = (value) => {
    onFilterChange({ ...filters, search: value });
  };

  const handleReset = () => {
    onFilterChange({
      categories: [],
      mediums: [],
      editionType: '',
      priceMin: null,
      priceMax: null,
      search: '',
    });
  };

  return (
    <aside className="artwork-filters">
      {/* Kategorija */}
      <div className="artwork-filters__section">
        <div
          className="artwork-filters__header"
          onClick={() => toggleSection('kategorija')}
        >
          <h4 className="artwork-filters__section-title">Kategorija</h4>
          <span
            className={`artwork-filters__chevron${openSections.kategorija ? ' artwork-filters__chevron--open' : ''}`}
          >
            &#9660;
          </span>
        </div>
        <div
          className={`artwork-filters__content${!openSections.kategorija ? ' artwork-filters__content--collapsed' : ''}`}
        >
          {ARTWORK_CATEGORIES.map((cat) => (
            <label key={cat.id} className="artwork-filters__item">
              <input
                type="checkbox"
                checked={(filters.categories || []).includes(cat.id)}
                onChange={() => handleCategoryChange(cat.id)}
              />
              <span className="artwork-filters__label">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Medij */}
      <div className="artwork-filters__section">
        <div
          className="artwork-filters__header"
          onClick={() => toggleSection('medij')}
        >
          <h4 className="artwork-filters__section-title">Medij</h4>
          <span
            className={`artwork-filters__chevron${openSections.medij ? ' artwork-filters__chevron--open' : ''}`}
          >
            &#9660;
          </span>
        </div>
        <div
          className={`artwork-filters__content${!openSections.medij ? ' artwork-filters__content--collapsed' : ''}`}
        >
          {ARTWORK_MEDIUMS.map((med) => (
            <label key={med.id} className="artwork-filters__item">
              <input
                type="checkbox"
                checked={(filters.mediums || []).includes(med.id)}
                onChange={() => handleMediumChange(med.id)}
              />
              <span className="artwork-filters__label">{med.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Edicija */}
      <div className="artwork-filters__section">
        <div
          className="artwork-filters__header"
          onClick={() => toggleSection('edicija')}
        >
          <h4 className="artwork-filters__section-title">Edicija</h4>
          <span
            className={`artwork-filters__chevron${openSections.edicija ? ' artwork-filters__chevron--open' : ''}`}
          >
            &#9660;
          </span>
        </div>
        <div
          className={`artwork-filters__content${!openSections.edicija ? ' artwork-filters__content--collapsed' : ''}`}
        >
          {EDITION_OPTIONS.map((opt) => (
            <label key={opt.id} className="artwork-filters__item">
              <input
                type="radio"
                name="edition-filter"
                checked={(filters.editionType || '') === opt.id}
                onChange={() => handleEditionChange(opt.id)}
              />
              <span className="artwork-filters__label">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Cena */}
      <div className="artwork-filters__section">
        <div
          className="artwork-filters__header"
          onClick={() => toggleSection('cena')}
        >
          <h4 className="artwork-filters__section-title">Cena</h4>
          <span
            className={`artwork-filters__chevron${openSections.cena ? ' artwork-filters__chevron--open' : ''}`}
          >
            &#9660;
          </span>
        </div>
        <div
          className={`artwork-filters__content${!openSections.cena ? ' artwork-filters__content--collapsed' : ''}`}
        >
          <div className="artwork-filters__range-row">
            <input
              type="number"
              className="artwork-filters__range-input"
              placeholder="Min"
              value={filters.priceMin ?? ''}
              onChange={(e) => handlePriceChange('priceMin', e.target.value)}
              min={0}
            />
            <span className="artwork-filters__range-sep">&mdash;</span>
            <input
              type="number"
              className="artwork-filters__range-input"
              placeholder="Max"
              value={filters.priceMax ?? ''}
              onChange={(e) => handlePriceChange('priceMax', e.target.value)}
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Isci */}
      <div className="artwork-filters__section">
        <div
          className="artwork-filters__header"
          onClick={() => toggleSection('isci')}
        >
          <h4 className="artwork-filters__section-title">I&#353;&#269;i</h4>
          <span
            className={`artwork-filters__chevron${openSections.isci ? ' artwork-filters__chevron--open' : ''}`}
          >
            &#9660;
          </span>
        </div>
        <div
          className={`artwork-filters__content${!openSections.isci ? ' artwork-filters__content--collapsed' : ''}`}
        >
          <input
            type="text"
            className="artwork-filters__search-input"
            placeholder="Naslov, umetnik, opis..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Ponastavi */}
      <button className="artwork-filters__reset" onClick={handleReset}>
        Ponastavi
      </button>
    </aside>
  );
}
