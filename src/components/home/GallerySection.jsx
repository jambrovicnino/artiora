import { Link } from 'react-router-dom';
import './GallerySection.css';

/* ─── Tri vitrine: pred, končni izdelek, poročna ─── */
const SHOWCASES = [
  {
    id: 'before',
    src: '/gallery/family-original.jpg',
    label: 'PRED OBDELAVO',
    title: 'Originalna Fotografija',
    desc: 'Družinski portret, ~1960 — zbledela in poškodovana',
    position: 'left',
  },
  {
    id: 'product',
    src: '/gallery/family-framed.png',
    label: 'KONČNI IZDELEK',
    title: 'Restavrirana & Uokvirjena',
    desc: 'AI restavracija · barvanje · premium platno · okvir po meri',
    position: 'center',
  },
  {
    id: 'wedding',
    src: '/gallery/wedding-colorized.png',
    label: 'RESTAVRACIJA & BARVANJE',
    title: 'Poročna Fotografija',
    desc: 'Skupinski portret, ~1965 — AI restavracija · barvanje · uokvirjeno',
    position: 'right',
  },
];

export default function GallerySection() {
  return (
    <section id="gallery" className="gallery">
      {/* Subtle radial glow behind the collage */}
      <div className="gallery-glow" />

      <div className="container">
        <div className="gallery-header">
          <span className="gallery-label">GALERIJA</span>
          <h2 className="gallery-heading">Naši Primeri Obnovitev</h2>
          <p className="gallery-subtitle">
            Od pozabljene fotografije do umetnine na steni
          </p>
        </div>

        <div className="gallery-collage">
          {SHOWCASES.map((item) => (
            <div
              className={`collage-item collage-${item.position}`}
              key={item.id}
            >
              <div className="collage-image-wrap" data-cursor="brush">
                <img
                  src={item.src}
                  alt={item.title}
                  className="collage-image"
                  loading="lazy"
                />
                <span className="collage-badge">{item.label}</span>
              </div>
              <div className="collage-caption">
                <h3 className="collage-title">{item.title}</h3>
                <p className="collage-desc">{item.desc}</p>
              </div>
            </div>
          ))}

          {/* Decorative connection arrows / flow indicator */}
          <div className="collage-flow collage-flow-1" aria-hidden="true">
            <span>→</span>
          </div>
          <div className="collage-flow collage-flow-2" aria-hidden="true">
            <span>✦</span>
          </div>
        </div>

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
