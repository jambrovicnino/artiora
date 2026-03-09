import './ProcessSection.css';

const JOURNEY = [
  {
    number: 1,
    title: 'USTVARITE',
    subtitle: 'Vaša vizija, vaša umetnina',
    description:
      'Naložite svojo fotografijo in izberite med šestimi umetniškimi slogi — oljno slikarstvo, akvarel, pop art in več. Ali pa uporabite AI generator in opišite svojo vizijo z desetimi ključnimi besedami. V obeh primerih dobite unikatno umetnino, ki obstaja samo enkrat.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
      </svg>
    ),
    accent: 'var(--primary)',
  },
  {
    number: 2,
    title: 'OKVIRITE',
    subtitle: 'Izberite platno in okvir',
    description:
      'Izberite velikost platna — od intimnega Kabineta (30×40 cm) do veličastne Galerije (76×102 cm). Dodajte okvir iz naše kolekcije: živahni New Era barvni okvirji ali klasični leseni profili iz Vidal kataloga. Vsak okvir je ročno sestavljen po meri vaše slike.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" />
        <rect x="6" y="6" width="12" height="12" />
      </svg>
    ),
    accent: '#3b82f6',
  },
  {
    number: 3,
    title: 'IZDELAMO',
    subtitle: 'Ročna obdelava v naši delavnici',
    description:
      'Vašo sliko natisnemo na premium umetniško platno s pigmentnimi barvili za galerijski nivo barv. Platno ročno napnemo na leseni podokvir, po želji nanesemo impasto gel za teksturo in vse zaščitimo s profesionalnim lakom.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    accent: '#eab308',
  },
  {
    number: 4,
    title: 'DOSTAVIMO',
    subtitle: 'Varno pakiranje in dostava',
    description:
      'Vsaka umetnina je zaščitena z archival peno, vogalniki in trdim kartonom. Paket je oblikovan za popoln unboxing — ko ga odprete, je vaša umetnina pripravljena za obešanje. Dostava po celotni Sloveniji v 5–7 delovnih dneh.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    accent: '#10b981',
  },
  {
    number: 5,
    title: 'OBESITE',
    subtitle: 'Sistem za obešanje je vključen',
    description:
      'Vsaka umetnina prispe s pravilnim sistemom za obešanje, ki je že nameščen na zadnji strani. Manjše slike imajo nazobčani obešalnik, srednje D-obroča z jekleno žico, velike pa profesionalni Z-bar. Dodate žebelj ali Fischer vložek — in vaša umetnina visi na steni.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    accent: '#8b5cf6',
  },
];

export default function ProcessSection() {
  return (
    <section id="process" className="process">
      <div className="container">
        <div className="process-header">
          <p className="process-label">POSTOPEK</p>
          <h2 className="process-heading">Od Ideje do Stene</h2>
          <p className="process-subtitle">
            Pet korakov do umetnine, ki jo boste ponosno razkazovali
          </p>
        </div>

        <div className="journey-grid">
          {JOURNEY.map((step, index) => (
            <div className="journey-card" key={step.number}>
              {/* Number line */}
              <div className="journey-number-col">
                <div
                  className="journey-circle"
                  style={{ borderColor: step.accent }}
                >
                  <span className="journey-num" style={{ color: step.accent }}>
                    {step.number}
                  </span>
                </div>
                {index < JOURNEY.length - 1 && (
                  <div className="journey-line" />
                )}
              </div>

              {/* Content */}
              <div className="journey-content">
                <div className="journey-icon" style={{ color: step.accent }}>
                  {step.icon}
                </div>
                <h3 className="journey-title">{step.title}</h3>
                <p className="journey-subtitle">{step.subtitle}</p>
                <p className="journey-desc">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
