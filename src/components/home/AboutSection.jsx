import './AboutSection.css';

const VALUE_PILLARS = [
  { title: 'USTVARJALNOST', description: 'Individualna umetnost' },
  { title: 'TEHNOLOGIJA', description: 'AI umetniško ustvarjanje' },
  { title: 'KAKOVOST', description: 'Premium materiali' },
];

export default function AboutSection() {
  return (
    <section id="about" className="about">
      <div className="container">
        <div className="about-grid">
          {/* Left column — decorative quote */}
          <div className="about-quote-panel">
            <div className="about-quote-inner">
              <div className="about-corner about-corner-tl" />
              <div className="about-corner about-corner-tr" />
              <div className="about-corner about-corner-bl" />
              <div className="about-corner about-corner-br" />

              <span className="about-quote-mark">&ldquo;</span>
              <blockquote className="about-quote-text">
                Vsaka vizija si zasluži umetnino.
              </blockquote>
              <p className="about-quote-established">&#9670; ETERNA ARTISAN</p>
            </div>
          </div>

          {/* Right column — content */}
          <div className="about-content">
            <p className="about-label">O NAS</p>
            <h2 className="about-heading">Naša Zgodba</h2>

            <p className="about-paragraph">
              Pri Eterna verjamemo, da je ustvarjalnost univerzalna. Naše
              poslanstvo je preprosto — dati vsakomur moč, da ustvari, razstavi
              in okvirji unikatno umetnino.
            </p>

            <p className="about-paragraph">
              Z najnovejšo tehnologijo umetne inteligence in ročnim mojstrstvom
              pomagamo umetnikom in ustvarjalcem realizirati njihove vizije.
              Vsak tisk je unikaten — natisnjen na premium platno z Impasto gel
              medijem za teksturo, ki jo lahko občutite.
            </p>

            <p className="about-paragraph">Verjamemo v tri stebre:</p>

            <div className="about-pillars">
              {VALUE_PILLARS.map((pillar) => (
                <div className="about-pillar" key={pillar.title}>
                  <span className="about-pillar-bar" />
                  <h3 className="about-pillar-title">{pillar.title}</h3>
                  <p className="about-pillar-desc">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
