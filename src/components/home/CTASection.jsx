import './CTASection.css';

function handleScrollToTop() {
  const hero = document.getElementById('hero');
  if (hero) {
    hero.scrollIntoView({ behavior: 'smooth' });
  }
}

export default function CTASection() {
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
          <h2 className="cta-heading">Vaš Spomin Zasluži Večnost</h2>
          <div className="cta-divider" />
          <p className="cta-text">
            Naložite fotografijo in v nekaj minutah ustvarite unikatno
            umetnino za vaš dom.
          </p>
          <button
            type="button"
            className="btn-gold-large cta-button"
            onClick={handleScrollToTop}
          >
            OŽIVITE SVOJ SPOMIN
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
