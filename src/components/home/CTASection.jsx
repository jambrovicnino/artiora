import { useNavigate, useLocation } from 'react-router-dom';
import './CTASection.css';

export default function CTASection() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (location.pathname === '/') {
      // Already on homepage — scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // On subpage — navigate to homepage
      navigate('/');
      window.scrollTo({ top: 0 });
    }
  };

  return (
    <section id="cta" className="cta">
      <div className="container">
        <div className="cta-content">
          {/* Corner decorations */}
          <div className="cta-corner cta-corner-tl" />
          <div className="cta-corner cta-corner-tr" />
          <div className="cta-corner cta-corner-bl" />
          <div className="cta-corner cta-corner-br" />

          <span className="cta-label">ZAČNITE DANES</span>
          <h2 className="cta-heading">Ustvarite Svojo Umetnino</h2>
          <div className="cta-divider" />
          <p className="cta-text">
            Opišite svojo vizijo ali naložite referenco — v nekaj minutah
            ustvarite unikatno umetnino za vaš dom.
          </p>
          <button
            type="button"
            className="btn-gold-large cta-button"
            onClick={handleClick}
          >
            ZAČNITE USTVARJATI
          </button>
          <p className="cta-secondary">
            Brezplačen predogled · Brez obveznosti · Dostava po vsej
            Sloveniji
          </p>
        </div>
      </div>
    </section>
  );
}
