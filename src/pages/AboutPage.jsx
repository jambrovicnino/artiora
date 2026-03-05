import AboutSection from '../components/home/AboutSection';
import CTASection from '../components/home/CTASection';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="page-hero">
        <div className="container">
          <span className="page-hero-label">ETERNA</span>
          <h1 className="page-hero-heading">O Nas</h1>
          <p className="page-hero-subtitle">Spoznajte zgodbo za oživljanjem vaših spominov</p>
        </div>
      </div>
      <AboutSection />
      {/* Extended content - team, values, mission */}
      <section className="about-extended">
        <div className="container">
          <div className="about-mission">
            <h2 className="section-heading">Naše Poslanstvo</h2>
            <p className="about-text">Vsak spomin je dragocenost. Pri Eterna združujemo najnovejšo tehnologijo umetne inteligence z ročnim mojstrstvom, da vaše najljubše fotografije pretvorimo v umetniška dela, ki bodo krasila vaš dom za generacije.</p>
            <p className="about-text">Naš postopek je preprost — vi naložite fotografijo, mi pa poskrbimo za vse ostalo. Od digitalne restavracije in barvanja do premium tiska na muzejsko kakovostno platno z Impasto gel medijem.</p>
          </div>
          <div className="about-values-grid">
            <div className="about-value-card">
              <div className="about-value-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3>Zaupanje</h3>
              <p>Vaše fotografije so varne pri nas. Vsak spomin obravnavamo z največjo skrbnostjo.</p>
            </div>
            <div className="about-value-card">
              <div className="about-value-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              </div>
              <h3>Zadovoljstvo</h3>
              <p>Če niste zadovoljni z rezultatom, vam ponudimo brezplačno popravilo ali vračilo.</p>
            </div>
            <div className="about-value-card">
              <div className="about-value-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <h3>Kakovost</h3>
              <p>Uporabljamo le premium materiale — muzejsko platno, UV-odporne barve in ročno nanese gel medij.</p>
            </div>
          </div>
        </div>
      </section>
      <CTASection />
    </div>
  );
}
