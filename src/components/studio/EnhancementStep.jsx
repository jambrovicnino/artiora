import { ART_STYLES } from '../../services/artStyleService';
import BeforeAfterSlider from './BeforeAfterSlider';
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
        <h2 className="enhancement-heading">Umetniška preobrazba</h2>
        <p className="enhancement-description">
          Preobrazite svojo fotografijo v unikatno umetniško delo.
          Izberite slog in AI bo ustvaril umetnino.
        </p>

        {/* Artistic style grid */}
        <div className="art-style-grid">
          {ART_STYLES.map((style) => (
            <button
              key={style.id}
              className={`art-style-card ${selectedEnhancement === style.id ? 'selected' : ''} ${isProcessing && selectedEnhancement === style.id ? 'processing' : ''}`}
              onClick={() => onEnhance(style.id)}
              disabled={isProcessing}
            >
              <div
                className="art-style-preview"
                style={{ background: style.previewGradient }}
              >
                <span className="art-style-emoji">{style.emoji}</span>
                {isProcessing && selectedEnhancement === style.id && (
                  <div className="art-style-spinner" />
                )}
              </div>
              <div className="art-style-info">
                <h3 className="art-style-label">{style.label}</h3>
                <p className="art-style-desc">{style.description}</p>
              </div>
              {selectedEnhancement === style.id && !isProcessing && (
                <span className="art-style-check">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Hint */}
        {!selectedEnhancement && !isProcessing && (
          <p className="art-style-hint">
            Izberite umetniški slog za predogled preobrazbe
          </p>
        )}

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
