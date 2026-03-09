import FramePreview from './FramePreview';
import { displaySizes, frameStyles, getPrice, getSizeLabel, getImpastoCost, PRODUCT_TYPES } from '../../data/frameOptions';
import './FramingStep.css';

export default function FramingStep({
  image,
  selectedSize,
  setSelectedSize,
  productType,
  setProductType,
  selectedFrame,
  setSelectedFrame,
  withImpasto,
  setWithImpasto,
  dedication,
  setDedication,
  onAddToCart,
  isAddingToCart,
  uploadProgress,
  imageQuality, // { dpi, rating, label, color } ali null
  onUpscale,
  isUpscaling,
  upscaleInfo,
}) {
  const isFramed = productType === PRODUCT_TYPES.FRAMED;
  const frameId = isFramed ? selectedFrame : null;
  const currentPrice = getPrice(selectedSize, productType, frameId, withImpasto);
  const sizeLabel = getSizeLabel(selectedSize);

  return (
    <div className="framing-step">
      {/* Left — Frame preview */}
      <div className="framing-preview">
        <FramePreview
          image={image}
          selectedFrame={isFramed ? selectedFrame : null}
          selectedSize={sizeLabel}
          sizeId={selectedSize}
          withFrame={isFramed}
          productType={productType}
        />
      </div>

      {/* Right — Step-by-step configurator */}
      <div className="framing-controls">

        {/* ① VELIKOST */}
        <div className="framing-section">
          <label className="framing-label">
            <span className="step-number">1</span>
            VELIKOST
          </label>
          <div className="size-grid">
            {displaySizes.map((size) => {
              const printPrice = getPrice(size.id, PRODUCT_TYPES.PRINT);
              const q = imageQuality?.[size.id];
              return (
                <button
                  key={size.id}
                  className={`size-card ${selectedSize === size.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(size.id)}
                >
                  <span className="size-card-dims">{size.label}</span>
                  <span className="size-card-name">{size.displayName}</span>
                  <span className="size-card-price">{printPrice} €</span>
                  {q && (
                    <span
                      className={`size-card-quality quality-${q.rating}`}
                      style={{ color: q.color }}
                    >
                      {q.dpi} DPI
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {imageQuality?.[selectedSize]?.rating === 'poor' && (
            <div className="quality-warning">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div className="quality-warning-content">
                <span>
                  Resolucija slike je prenizka za to velikost ({imageQuality[selectedSize].dpi} DPI).
                  Za boljšo kvaliteto izberite manjšo velikost ali povečajte resolucijo.
                </span>
                {onUpscale && (
                  <button
                    className="btn-upscale"
                    onClick={onUpscale}
                    disabled={isUpscaling}
                  >
                    {isUpscaling ? (
                      <>
                        <span className="upscale-spinner" />
                        Povečujem resolucijo...
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 3 21 3 21 9" />
                          <polyline points="9 21 3 21 3 15" />
                          <line x1="21" y1="3" x2="14" y2="10" />
                          <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                        IZBOLJŠAJ RESOLUCIJO (AI 4×)
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
          {imageQuality?.[selectedSize]?.rating === 'acceptable' && (
            <div className="quality-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div className="quality-warning-content">
                <span>
                  Resolucija je mejna ({imageQuality[selectedSize].dpi} DPI). Tisk bo sprejemljiv, a ne optimalen.
                </span>
                {onUpscale && !upscaleInfo && (
                  <button
                    className="btn-upscale btn-upscale--subtle"
                    onClick={onUpscale}
                    disabled={isUpscaling}
                  >
                    {isUpscaling ? (
                      <>
                        <span className="upscale-spinner" />
                        Povečujem resolucijo...
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 3 21 3 21 9" />
                          <polyline points="9 21 3 21 3 15" />
                          <line x1="21" y1="3" x2="14" y2="10" />
                          <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                        IZBOLJŠAJ RESOLUCIJO (AI 4×)
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
          {upscaleInfo && (
            <div className="quality-upscale-info">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>
                Resolucija povečana {upscaleInfo.factor}× z {upscaleInfo.method === 'ai' ? 'AI' : 'interpolacijo'}
                {upscaleInfo.dimensions && ` (${upscaleInfo.dimensions.width}×${upscaleInfo.dimensions.height})`}
              </span>
            </div>
          )}
        </div>

        {/* ② IZDELEK */}
        <div className="framing-section">
          <label className="framing-label">
            <span className="step-number">2</span>
            IZDELEK
          </label>
          <div className="product-options">
            {/* Samo tisk */}
            <button
              className={`product-option ${productType === PRODUCT_TYPES.PRINT ? 'selected' : ''}`}
              onClick={() => {
                setProductType(PRODUCT_TYPES.PRINT);
                setWithImpasto(false);
              }}
            >
              <div className="product-option-info">
                <span className="product-option-name">Tisk na platno</span>
                <span className="product-option-desc">Canvas print, zvit v rolo</span>
              </div>
              <span className="product-option-price">
                {getPrice(selectedSize, PRODUCT_TYPES.PRINT)} €
              </span>
            </button>

            {/* Tisk + podokvir */}
            <button
              className={`product-option ${productType === PRODUCT_TYPES.STRETCHED ? 'selected' : ''}`}
              onClick={() => {
                setProductType(PRODUCT_TYPES.STRETCHED);
                setWithImpasto(false);
              }}
            >
              <div className="product-option-info">
                <span className="product-option-name">Tisk + podokvir</span>
                <span className="product-option-desc">Napeto na leseni podokvir, pripravljeno za obešanje</span>
              </div>
              <span className="product-option-price">
                {getPrice(selectedSize, PRODUCT_TYPES.STRETCHED)} €
              </span>
            </button>

            {/* Umetnina z okvirjem */}
            <button
              className={`product-option ${productType === PRODUCT_TYPES.FRAMED ? 'selected' : ''}`}
              onClick={() => setProductType(PRODUCT_TYPES.FRAMED)}
            >
              <div className="product-option-info">
                <span className="product-option-name">Umetnina z okvirjem</span>
                <span className="product-option-desc">Ročno delo, okvir po izbiri, pripravljena umetnina</span>
              </div>
              <span className="product-option-price">
                od {getPrice(selectedSize, PRODUCT_TYPES.FRAMED, frameStyles[0].id, false)} €
              </span>
            </button>
          </div>
        </div>

        {/* ③ OKVIR — samo pri "z okvirjem" */}
        {isFramed && (
          <div className="framing-section">
            <label className="framing-label">
              <span className="step-number">3</span>
              OKVIR
            </label>

            {/* NEW ERA okvirji */}
            <div className="frame-category">
              <span className="frame-category-label frame-category-new-era">NEW ERA</span>
            </div>
            <div className="frame-options">
              {frameStyles.filter((f) => f.category === 'new-era').map((frame) => {
                const framePrice = getPrice(selectedSize, PRODUCT_TYPES.FRAMED, frame.id, withImpasto);
                return (
                  <button
                    key={frame.id}
                    className={`frame-option frame-option--new-era ${selectedFrame === frame.id ? 'selected' : ''}`}
                    onClick={() => setSelectedFrame(frame.id)}
                    title={`${frame.label} — ${frame.profileDimensions}`}
                  >
                    <div className="frame-thumb" style={{ position: 'relative', overflow: 'hidden' }}>
                      <img
                        src={frame.stripImage}
                        alt={frame.label}
                        className="frame-thumb-img"
                        loading="lazy"
                      />
                      {frame.tint && (
                        <div
                          className="frame-thumb-tint"
                          style={{ backgroundColor: frame.tint }}
                        />
                      )}
                    </div>
                    <span className="frame-option-label">{frame.label}</span>
                    <span className="frame-option-price">{framePrice} €</span>
                    <span className="frame-option-dims">{frame.profileDimensions}</span>
                  </button>
                );
              })}
            </div>

            {/* KLASIČNI okvirji */}
            <div className="frame-category">
              <span className="frame-category-label">KLASIČNI</span>
            </div>
            <div className="frame-options">
              {frameStyles.filter((f) => f.category === 'klasicni').map((frame) => {
                const framePrice = getPrice(selectedSize, PRODUCT_TYPES.FRAMED, frame.id, withImpasto);
                return (
                  <button
                    key={frame.id}
                    className={`frame-option ${selectedFrame === frame.id ? 'selected' : ''}`}
                    onClick={() => setSelectedFrame(frame.id)}
                    title={`${frame.label} — ${frame.profileDimensions}`}
                  >
                    <div className="frame-thumb">
                      <img
                        src={frame.stripImage}
                        alt={frame.label}
                        className="frame-thumb-img"
                        loading="lazy"
                      />
                    </div>
                    <span className="frame-option-label">{frame.label}</span>
                    <span className="frame-option-price">{framePrice} €</span>
                    <span className="frame-option-dims">{frame.profileDimensions}</span>
                    {frame.odprodaja && (
                      <span className="frame-option-odprodaja">OMEJENE ZALOGE</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Impasto opcija */}
            <label className="impasto-toggle">
              <input
                type="checkbox"
                checked={withImpasto}
                onChange={(e) => setWithImpasto(e.target.checked)}
              />
              <span className="impasto-check" />
              <div className="impasto-info">
                <span className="impasto-name">Impasto gel zaključek</span>
                <span className="impasto-desc">Ročno nanesen gel za umetniško teksturo</span>
              </div>
              <span className="impasto-price">+{getImpastoCost(selectedSize)} €</span>
            </label>
          </div>
        )}

        {/* ④ POSVETILO */}
        <div className="framing-section">
          <label className="framing-label">
            <span className="step-number">{isFramed ? '4' : '3'}</span>
            POSVETILO
          </label>
          <div className="dedication-input-wrap">
            <input
              type="text"
              className="dedication-input"
              placeholder="Zapišite svoje posvetilo..."
              value={dedication}
              onChange={(e) => setDedication(e.target.value)}
            />
            <span className="dedication-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" />
                <circle cx="11" cy="11" r="2" />
              </svg>
            </span>
          </div>
        </div>

        {/* SKUPAJ */}
        <div className="framing-section framing-total">
          <label className="framing-label">SKUPAJ</label>
          <div className="framing-price">
            <span className="price-amount">{currentPrice} €</span>
            <span className="price-note">z DDV</span>
          </div>
        </div>

        {/* Dodaj v košarico */}
        <button
          className="btn-gold-large"
          onClick={onAddToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <>
              <span className="upscale-spinner" />
              {uploadProgress || 'Nalagam...'}
            </>
          ) : (
            'DODAJ V KOŠARICO'
          )}
        </button>
      </div>
    </div>
  );
}
