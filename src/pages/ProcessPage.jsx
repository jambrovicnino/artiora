import ProcessSection from '../components/home/ProcessSection';
import CTASection from '../components/home/CTASection';
import ScrollReveal from '../components/ScrollReveal';
import './ProcessPage.css';

const STEP_DETAILS = [
  {
    number: 1,
    title: 'Naložite Referenco ali Opišite Vizijo',
    description:
      'Preprosto naložite referenčno sliko ali opišite svojo vizijo prek naše spletne aplikacije. Sprejemamo vse formate — JPEG, PNG, TIFF in tudi skice. Pošljite fotografijo, ilustracijo ali opis želene umetnosti. Naša AI tehnologija se prilagodi vsaki zamisli.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    number: 2,
    title: 'AI Ustvari Umetnost',
    description:
      'Izbirajte med AI stilizacijo (unikatni umetniški slogi), AI barvanjem in stilizacijo ali kombinacijo obojega. Naša umetna inteligenca analizira vaš vnos in ustvari umetniško delo po vaših željah, vi pa imate zadnjo besedo.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
      </svg>
    ),
  },
  {
    number: 3,
    title: 'Izberite Okvir in Velikost',
    description:
      'Ponujamo tri velikosti platna — Kabinet (30x40 cm), Imperial (40x50 cm) in Salon (45x60 cm). Vsako platno je na voljo z zlatim okvirjem ali brez. Naš Impasto gel medij doda teksturo, ki jo lahko občutite — kot prava umetniška slika.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" />
        <rect x="6" y="6" width="12" height="12" />
      </svg>
    ),
  },
  {
    number: 4,
    title: 'Prejmite Umetnino',
    description:
      'Vaša končna umetnina je natisnjena na premium muzejsko platno z UV-odpornimi barvami. Skrbno jo zapakiramo in dostavimo na vaš naslov po vsej Sloveniji. Od naročila do dostave v povprečju 5-7 delovnih dni.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
];

export default function ProcessPage() {
  return (
    <div className="process-page">
      <ScrollReveal variant="fade-in">
        <div className="page-hero">
          <div className="container">
            <span className="page-hero-label">ARTIORA</span>
            <h1 className="page-hero-heading">Kako Deluje</h1>
            <p className="page-hero-subtitle">Od vaše ideje do umetnine v štirih preprostih korakih</p>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal variant="fade-up">
        <ProcessSection />
      </ScrollReveal>

      <section className="process-detailed">
        <div className="container">
          <ScrollReveal variant="fade-up">
            <h2 className="process-detailed-heading">Podrobnosti Vsakega Koraka</h2>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" stagger>
            <div className="process-detail-cards">
              {STEP_DETAILS.map((step) => (
                <div className="process-detail-card" key={step.number}>
                  <div className="process-detail-icon">{step.icon}</div>
                  <div className="process-detail-number">0{step.number}</div>
                  <h3 className="process-detail-title">{step.title}</h3>
                  <p className="process-detail-desc">{step.description}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <ScrollReveal variant="fade-up">
        <section className="process-guarantee">
          <div className="container">
            <div className="guarantee-card">
              <div className="guarantee-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <h2 className="guarantee-heading">100% Garancija Zadovoljstva</h2>
              <p className="guarantee-text">
                Če z rezultatom niste zadovoljni, vam brezplačno predelamo umetnino ali vrnemo denar. Brez vprašanj, brez tveganja.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal variant="fade-up">
        <CTASection />
      </ScrollReveal>
    </div>
  );
}
