import { useState, useEffect, useCallback } from 'react';
import { galleryItems, CATEGORIES } from '../data/galleryItems';
import { frameStyles } from '../data/frameOptions';
import CTASection from '../components/home/CTASection';
import ScrollReveal from '../components/ScrollReveal';
import './GalleryPage.css';

/** Lookup: frame ID → human-readable label */
function getFrameName(frameId) {
  if (!frameId) return null;
  const frame = frameStyles.find((f) => f.id === frameId);
  return frame?.label || null;
}

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('vse');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filteredItems =
    activeCategory === 'vse'
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  const lightboxOpen = lightboxIndex !== null && filteredItems[lightboxIndex];

  // Keyboard navigation
  const handleKey = useCallback(
    (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight')
        setLightboxIndex((i) => (i + 1) % filteredItems.length);
      if (e.key === 'ArrowLeft')
        setLightboxIndex((i) => (i - 1 + filteredItems.length) % filteredItems.length);
    },
    [lightboxOpen, filteredItems.length],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // Lock body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  const currentItem = lightboxOpen ? filteredItems[lightboxIndex] : null;

  return (
    <div className="gallery-page">
      {/* Page Hero */}
      <ScrollReveal variant="fade-in">
        <div className="page-hero">
          <div className="container">
            <span className="page-hero-label">ARTIORA</span>
            <h1 className="page-hero-heading">Galerija Umetnin</h1>
            <p className="page-hero-subtitle">
              Unikatna umetniška dela na premium platnu
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Category Filter */}
      <ScrollReveal variant="fade-up">
        <section className="gallery-filter-section">
          <div className="container">
            <div className="gallery-filter-bar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`gallery-filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Gallery Grid */}
      <ScrollReveal variant="fade-up">
        <section className="gallery-grid-section">
          <div className="container">
            {filteredItems.length > 0 ? (
              <div className="gallery-page-grid">
                {filteredItems.map((item, index) => (
                  <div
                    className="gallery-page-card"
                    key={item.id}
                    onClick={() => setLightboxIndex(index)}
                    style={{ cursor: 'zoom-in' }}
                  >
                    <div className="gallery-page-image-container">
                      <img
                        className="gallery-page-image gallery-page-image--real"
                        src={item.src}
                        alt={item.title}
                        loading="lazy"
                      />
                      <div className="gallery-page-overlay">
                        <span className="gallery-page-overlay-title">{item.title}</span>
                        <span className="gallery-page-overlay-size">{item.style} · {item.size}</span>
                        {item.frame && (
                          <span className="gallery-page-overlay-frame">
                            Okvir: {getFrameName(item.frame)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* ─── Empty state ─── */
              <div className="gallery-empty">
                <div className="gallery-empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.25">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <h3 className="gallery-empty-title">Umetnine prihajajo kmalu</h3>
                <p className="gallery-empty-desc">
                  Naša galerija se polni z novimi unikatnimi deli.
                  Vrnite se kmalu ali pa ustvarite svojo umetnino.
                </p>
              </div>
            )}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal variant="fade-up">
        <CTASection />
      </ScrollReveal>

      {/* ─── Lightbox Modal ─── */}
      {lightboxOpen && currentItem && (
        <div
          className="gallery-lightbox-overlay"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="gallery-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="gallery-lightbox-close"
              onClick={() => setLightboxIndex(null)}
              aria-label="Zapri"
            >
              &times;
            </button>

            {/* Prev */}
            <button
              className="gallery-lightbox-nav gallery-lightbox-prev"
              onClick={() =>
                setLightboxIndex(
                  (lightboxIndex - 1 + filteredItems.length) % filteredItems.length,
                )
              }
              aria-label="Prejšnja"
            >
              ‹
            </button>

            <img
              className="gallery-lightbox-image"
              src={currentItem.src}
              alt={currentItem.title}
            />

            {/* Next */}
            <button
              className="gallery-lightbox-nav gallery-lightbox-next"
              onClick={() =>
                setLightboxIndex((lightboxIndex + 1) % filteredItems.length)
              }
              aria-label="Naslednja"
            >
              ›
            </button>

            <div className="gallery-lightbox-caption">
              <div className="gallery-lightbox-title">{currentItem.title}</div>
              <div className="gallery-lightbox-meta">
                {currentItem.style} · {currentItem.size}
              </div>
              {currentItem.frame && (
                <div className="gallery-lightbox-frame">
                  Okvir: {getFrameName(currentItem.frame)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
