import BeforeAfterSlider from './BeforeAfterSlider';
import { ENHANCEMENT_METADATA } from '../../services/eternaService';
import './EnhancementStep.css';

export default function EnhancementStep({
  originalImage,
  processedImage,
  isProcessing,
  selectedEnhancement,
  onEnhance,
  onContinue,
}) {
  return (
    <div className="enhancement-step">
      {/* Left — Image preview */}
      <div className="enhancement-preview">
        {originalImage ? (
          <BeforeAfterSlider
            originalImage={originalImage}
            processedImage={processedImage}
          />
        ) : (
          <div className="enhancement-placeholder">
            <p>Naložite fotografijo za predogled</p>
          </div>
        )}
      </div>

      {/* Right — Controls */}
      <div className="enhancement-controls">
        <h2 className="enhancement-heading">Izboljšava Slike</h2>
        <p className="enhancement-description">
          &ldquo;Z umetno inteligenco razkrivamo skrite podrobnosti vaših
          najdragocenejših spominov.&rdquo;
        </p>

        {/* Enhancement options */}
        <div className="enhancement-options">
          {ENHANCEMENT_METADATA.map((option) => (
            <div
              key={option.id}
              className={`enhancement-option ${selectedEnhancement === option.id ? 'selected' : ''}`}
            >
              <div className="option-header">
                <h3 className="option-title">{option.label}</h3>
                {selectedEnhancement === option.id && (
                  <span className="option-check">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="option-description">{option.description}</p>
              <button
                className="btn-outline option-btn"
                onClick={() => onEnhance(option.id)}
                disabled={isProcessing}
              >
                {isProcessing && selectedEnhancement === option.id
                  ? 'OBDELAVA...'
                  : option.buttonLabel}
              </button>
            </div>
          ))}
        </div>

        {/* Continue button */}
        <button
          className="btn-gold-large continue-btn"
          onClick={onContinue}
          disabled={!originalImage}
        >
          NADALJUJ Z OKVIRJANJEM
          <span className="continue-arrow">›</span>
        </button>
      </div>
    </div>
  );
}
