import { useState } from 'react';
import { generateImageFromKeywords } from '../../services/geminiImageService';
import './CreateStep.css';

const KEYWORD_PLACEHOLDERS = [
  'npr. sončni zahod',
  'npr. gore',
  'npr. jezero',
  'npr. jesenske barve',
  'npr. mirnost',
  'npr. odsev v vodi',
  'npr. megleno jutro',
  'npr. zelen gozd',
  'npr. topla svetloba',
  'npr. impresionizem',
];

export default function CreateStep({ generatedImage, onImageGenerated, onContinue }) {
  const [keywords, setKeywords] = useState(Array(10).fill(''));
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState(null);

  const filledCount = keywords.filter((k) => k.trim().length > 0).length;
  const showLoading = isGenerating || imageLoading;

  const handleKeywordChange = (index, value) => {
    setKeywords((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleGenerate = async () => {
    const filled = keywords.filter((k) => k.trim().length > 0);
    if (filled.length === 0) {
      setError('Vnesite vsaj eno ključno besedo.');
      return;
    }

    setIsGenerating(true);
    setImageLoading(false);
    setError(null);

    try {
      const result = await generateImageFromKeywords(filled);
      const imageUrl = result.imageDataUrl;

      // Če je direktni URL (Pollinations), začni nalaganje v brskalniku
      if (result.isDirectUrl) {
        setIsGenerating(false);
        setImageLoading(true);
      }

      onImageGenerated(imageUrl);
    } catch (err) {
      console.error('[ETERNA] Gemini napaka:', err);
      setError(
        err.message || 'Generiranje slike ni uspelo. Poskusite znova ali spremenite ključne besede.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="create-step">
      {/* Left — Image preview */}
      <div className="create-preview">
        {showLoading && (
          <div className="create-loading">
            <div className="create-loading-spinner" />
            <p className="create-loading-text">
              {imageLoading ? 'Nalagam sliko...' : 'AI ustvarja vašo umetnino...'}
            </p>
            <p className="create-loading-subtext">To lahko traja do 60 sekund</p>
          </div>
        )}

        {generatedImage && (
          <img
            src={generatedImage}
            alt="AI generirana umetnina"
            className="create-preview-image"
            style={imageLoading ? { display: 'none' } : undefined}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setError('Nalaganje slike ni uspelo. Poskusite znova.');
              onImageGenerated(null);
            }}
          />
        )}

        {!generatedImage && !showLoading && (
          <div className="create-preview-placeholder">
            <div className="create-placeholder-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <p className="create-placeholder-text">
              Vnesite ključne besede in AI bo ustvaril unikatno umetnino po vaši viziji
            </p>
          </div>
        )}
      </div>

      {/* Right — Controls */}
      <div className="create-controls">
        <h2 className="create-heading">Ustvari z AI</h2>
        <p className="create-description">
          &ldquo;Opišite svojo vizijo z ključnimi besedami — AI bo ustvaril edinstveno umetnino,
          ki jo lahko takoj okvirite in natisnete.&rdquo;
        </p>

        {/* Keywords input */}
        <span className="create-keywords-label">Ključne besede</span>
        <div className="create-keywords-grid">
          {keywords.map((keyword, i) => (
            <input
              key={i}
              type="text"
              className={`create-keyword-input ${keyword.trim() ? 'has-value' : ''}`}
              placeholder={KEYWORD_PLACEHOLDERS[i]}
              value={keyword}
              onChange={(e) => handleKeywordChange(i, e.target.value)}
              disabled={showLoading}
              maxLength={40}
            />
          ))}
        </div>

        <p className="create-keyword-count">
          <strong>{filledCount}</strong> / 10 ključnih besed
        </p>

        {/* Error */}
        {error && <div className="create-error">{error}</div>}

        {/* Generate button */}
        <button
          className="btn-gold-large create-generate-btn"
          onClick={handleGenerate}
          disabled={showLoading || filledCount === 0}
        >
          {showLoading ? 'USTVARJAM...' : 'USTVARI UMETNINO'}
        </button>

        {/* Regenerate */}
        {generatedImage && !showLoading && (
          <button
            className="btn-outline create-regenerate-btn"
            onClick={handleGenerate}
          >
            USTVARI ZNOVA
          </button>
        )}

        {/* Continue to framing */}
        <button
          className="btn-gold-large create-continue-btn"
          onClick={onContinue}
          disabled={!generatedImage || showLoading}
        >
          NADALJUJ Z OKVIRJANJEM
          <span className="continue-arrow">›</span>
        </button>
      </div>
    </div>
  );
}
