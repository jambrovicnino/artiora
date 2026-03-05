import './AboutSection.css';

const VALUE_PILLARS = [
  { title: 'TRADICIJA', description: 'Spoštovanje izvirnika' },
  { title: 'TEHNOLOGIJA', description: 'AI restavracija 4K' },
  { title: 'KAKOVOST', description: 'Muzejsko platno' },
];

export default function AboutSection() {
  return (
    <section id="about" className="about">
      <div className="container">
        <div className="about-grid">
          {/* Left column — decorative quote */}
          <div className="about-quote-panel">
            <div className="about-quote-inner">
              {/* L-shaped corner brackets */}
              <div className="about-corner about-corner-tl" />
              <div className="about-corner about-corner-tr" />
              <div className="about-corner about-corner-bl" />
              <div className="about-corner about-corner-br" />

              <span className="about-quote-mark">&ldquo;</span>
              <blockquote className="about-quote-text">
                Vsak spomin si zasluži večnost.
              </blockquote>
              <p className="about-quote-established">&#9670; UST. 2024</p>
            </div>
          </div>

          {/* Right column — content */}
          <div className="about-content">
            <p className="about-label">O NAS</p>
            <h2 className="about-heading">Naša Zgodba</h2>

            <p className="about-paragraph">
              Pri Eterna verjamemo, da vsaka fotografija nosi v sebi spomin, ki
              si zasluži večnost. Naše poslanstvo je preprosto — oživiti
              zbledele, poškodovane in pozabljene fotografije ter jim dati novo
              življenje.
            </p>

            <p className="about-paragraph">
              Z najnovejšo tehnologijo umetne inteligence in ročnim mojstrstvom
              pretvarjamo stare posnetke v muzejsko kakovostne umetnine na
              platnu. Vsak tisk je unikaten — natisnjen z Impasto gel medijem
              za teksturo, ki jo lahko občutite.
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
