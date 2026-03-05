import { Link } from 'react-router-dom';
import './HowItWorks.css';

const steps = [
  { num: 1, title: 'Upload Your Photo', icon: '⬆', text: 'Upload your cherished memories' },
  { num: 2, title: 'Choose Your Magic', icon: '🪄', text: 'Select your restoration style' },
  { num: 3, title: 'Download Your Legacy', icon: '⬇', text: 'Receive your enhanced photo' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="how-it-works">
      <div className="container">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          {steps.map((s) => (
            <div className="step-item" key={s.num}>
              <div className="step-icon-circle">
                <span className="step-icon">{s.icon}</span>
              </div>
              <div className="step-text">
                <span className="step-number">{s.num}.</span> {s.title}
              </div>
            </div>
          ))}
        </div>
        <div className="cta-section">
          <Link to="/service/bw-upscaled" className="cta-button-large">
            Upload Your First Photo
          </Link>
          <p className="cta-subtext">First restoration is on us.</p>
        </div>
      </div>
    </section>
  );
}
