import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand column */}
          <div className="footer-brand-col">
            <div className="footer-logo logo-group">
              <span className="logo-wrap">
                <span className="logo-glass-block" />
                <span className="logo-diamond">
                  <span className="diamond-frame" />
                  <span className="diamond-inner">E</span>
                </span>
              </span>
              <div className="logo-text">
                <span className="logo-brand">ARTIORA</span>
                <span className="logo-tagline">ARTISAN</span>
              </div>
            </div>
            <p className="footer-brand-desc">
              Ustvarjamo unikatne umetnine s tehnologijo in mojstrstvom.
            </p>
            {/* Social icons */}
            <div className="footer-social">
              <a href="#" className="footer-social-link" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="#" className="footer-social-link" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links column */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Povezave</h4>
            <nav className="footer-nav">
              <Link to="/" className="footer-link">Domov</Link>
              <Link to="/o-nas" className="footer-link">O nas</Link>
              <Link to="/kako-deluje" className="footer-link">Kako deluje</Link>
              <Link to="/galerija" className="footer-link">Galerija</Link>
              <Link to="/mnenja" className="footer-link">Mnenja</Link>
            </nav>
          </div>

          {/* Contact column */}
          <div className="footer-contact-col">
            <h4 className="footer-col-title">Kontakt</h4>
            <div className="footer-contact-items">
              <p className="footer-contact-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                info@artiora.si
              </p>
              <p className="footer-contact-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Ljubljana, Slovenija
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} Artiora. Vse pravice pridržane.
          </p>
        </div>
      </div>
    </footer>
  );
}
