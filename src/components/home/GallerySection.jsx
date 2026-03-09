import { Link } from 'react-router-dom';
import { galleryItems, CATEGORIES } from '../../data/galleryItems';
import { frameStyles } from '../../data/frameOptions';
import './GallerySection.css';

/** Lookup: frame ID → human-readable label */
function getFrameName(frameId) {
  if (!frameId) return null;
  const frame = frameStyles.find((f) => f.id === frameId);
  return frame?.label || null;
}

export default function GallerySection() {
  const featuredItems = galleryItems.filter((item) => item.featured);
  const hasArt = featuredItems.length > 0;

  return (
    <section id="gallery" className="gallery">
      {/* Subtle radial glow behind the collage */}
      <div className="gallery-glow" />

      <div className="container">
        <div className="gallery-header">
          <span className="gallery-label">GALERIJA</span>
          <h2 className="gallery-heading">Galerija Umetnin</h2>
          <p className="gallery-subtitle">
            Odkrijte unikatna dela ustvarjena z AI in ročnim mojstrstvom
          </p>
        </div>

        {hasArt ? (
          /* ─── Prikaži featured umetnine ko bodo na voljo ─── */
          <div className="gallery-collage">
            {featuredItems.slice(0, 3).map((item, i) => {
              const positions = ['left', 'center', 'right'];
              const cat = CATEGORIES.find((c) => c.id === item.category);
              return (
                <div
                  className={`collage-item collage-${positions[i] || 'left'}`}
                  key={item.id}
                >
                  <div className="collage-image-wrap" data-cursor="brush">
                    <img
                      src={item.src}
                      alt={item.title}
                      className="collage-image"
                      loading="lazy"
                    />
                    <span className="collage-badge">
                      {cat?.label || item.category}
                    </span>
                  </div>
                  <div className="collage-caption">
                    <h3 className="collage-title">{item.title}</h3>
                    <p className="collage-desc">
                      {item.style} · {item.size}
                      {item.frame && <> · Okvir {getFrameName(item.frame)}</>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ─── Kategorije (placeholder ko še ni slik) ─── */
          <div className="gallery-categories-preview">
            {CATEGORIES.filter((c) => c.id !== 'vse').map((cat) => (
              <div className="gallery-cat-card" key={cat.id}>
                <div className="gallery-cat-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <span className="gallery-cat-label">{cat.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="gallery-more">
          <Link to="/galerija" className="btn-outline gallery-more-link">
            OGLEJ SI VEČ
            <span className="gallery-more-arrow">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
