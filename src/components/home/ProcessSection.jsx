import './ProcessSection.css';

const STEPS = [
  {
    number: 1,
    title: 'NALOŽITE',
    description: 'Izberite fotografijo iz galerije ali odprite fotoaparat',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    number: 2,
    title: 'IZBERITE',
    description: 'Restavracija, barvanje ali oboje — vi odločate',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
      </svg>
    ),
  },
  {
    number: 3,
    title: 'OKVIRJTE',
    description: 'Izberite velikost platna in zlati okvir po meri',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" />
        <rect x="6" y="6" width="12" height="12" />
      </svg>
    ),
  },
  {
    number: 4,
    title: 'PREJMITE',
    description: 'Premium tisk dostavljen na vaša vrata',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
];

export default function ProcessSection() {
  return (
    <section id="process" className="process">
      <div className="container">
        <div className="process-header">
          <p className="process-label">POSTOPEK</p>
          <h2 className="process-heading">Kako Deluje</h2>
          <p className="process-subtitle">
            Od vaše fotografije do umetnine v štirih korakih
          </p>
        </div>

        <div className="process-timeline">
          {STEPS.map((step, index) => (
            <div className="process-step" key={step.number}>
              {/* Connecting line between circles */}
              {index < STEPS.length - 1 && (
                <div className="process-connector" />
              )}

              <div className="process-circle">
                <span className="process-number">{step.number}</span>
              </div>

              <div className="process-step-body">
                <div className="process-icon">{step.icon}</div>
                <h3 className="process-step-title">{step.title}</h3>
                <p className="process-step-desc">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
