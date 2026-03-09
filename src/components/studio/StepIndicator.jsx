import './StepIndicator.css';

const steps = [
  { key: 'ustvari', label: 'USTVARI' },
  { key: 'okvir', label: 'OKVIR' },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="step-indicator">
      {steps.map((step, i) => (
        <div key={step.key} className="step-item-wrap">
          {i > 0 && <div className={`step-line ${currentStep >= i ? 'active' : ''}`} />}
          <div className={`step-item ${currentStep >= i ? 'active' : ''} ${currentStep === i ? 'current' : ''}`}>
            <span className="step-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            <span className="step-label">{step.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
