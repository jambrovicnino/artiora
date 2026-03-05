import FramePreview from './FramePreview';
import { displaySizes, frameStyles, getPrice, getSizeLabel, PRODUCT_TYPES, IMPASTO_GEL_COST, MARKUP, DDV_RATE } from '../../data/frameOptions';
import './FramingStep.css';

// Maloprodajna cena impasta (za prikaz)
const IMPASTO_RETAIL = Math.round(IMPASTO_GEL_COST * MARKUP * (1 + DDV_RATE));

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
              return (
                <button
                  key={size.id}
                  className={`size-card ${selectedSize === size.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(size.id)}
                >
                  <span className="size-card-dims">{size.label}</span>
                  <span className="size-card-name">{size.displayName}</span>
                  <span className="size-card-price">{printPrice} €</span>
                </button>
              );
            })}
          </div>
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
            <div className="frame-options">
              {frameStyles.map((frame) => {
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
              <span className="impasto-price">+{IMPASTO_RETAIL} €</span>
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
        <button className="btn-gold-large" onClick={onAddToCart}>
          DODAJ V KOŠARICO
        </button>
      </div>
    </div>
  );
}
