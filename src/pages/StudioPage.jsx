import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { enhanceImage } from '../services/eternaService';
import { getPrice, getSizeLabel, getPrintSpecs, getFrameLabel, PRODUCT_TYPES } from '../data/frameOptions';
import StepIndicator from '../components/studio/StepIndicator';
import EnhancementStep from '../components/studio/EnhancementStep';
import FramingStep from '../components/studio/FramingStep';
import './StudioPage.css';

export default function StudioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem } = useCart();

  // Image from Hero upload (via router state)
  const initialImage = location.state?.image || null;
  const fileName = location.state?.fileName || 'fotografija.jpg';

  // If no image, redirect home
  if (!initialImage) {
    return (
      <div className="studio-empty">
        <p>Najprej naložite fotografijo.</p>
        <button className="btn-gold" onClick={() => navigate('/')}>
          NAZAJ NA ZAČETEK
        </button>
      </div>
    );
  }

  // Step management: 0 = OBNOVI, 1 = OKVIR
  const [currentStep, setCurrentStep] = useState(0);

  // Enhancement state
  const [selectedEnhancement, setSelectedEnhancement] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);

  // Product configuration state
  const [selectedSize, setSelectedSize] = useState('40x50');
  const [productType, setProductType] = useState(PRODUCT_TYPES.PRINT);
  const [selectedFrame, setSelectedFrame] = useState('siroki-ornament');
  const [withImpasto, setWithImpasto] = useState(false);
  const [dedication, setDedication] = useState('');

  // ─── Enhancement handler ───
  const handleEnhance = async (enhancementId) => {
    setSelectedEnhancement(enhancementId);
    setIsProcessing(true);
    setProcessedImage(null);

    try {
      const result = await enhanceImage(initialImage, enhancementId);
      if (result.success) {
        setProcessedImage(result.processedImage);
      }
    } catch (error) {
      console.error('Napaka pri izboljšavi:', error);
      alert('Izboljšava ni uspela. Prosimo, poskusite znova.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Continue to framing ───
  const handleContinueToFraming = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Add to cart ───
  const handleAddToCart = () => {
    const frameId = productType === PRODUCT_TYPES.FRAMED ? selectedFrame : null;
    const price = getPrice(selectedSize, productType, frameId, withImpasto);
    const sizeLabel = getSizeLabel(selectedSize);

    addItem({
      thumbnail: processedImage || initialImage,
      fileName,
      enhancement: selectedEnhancement,
      productType,
      frameStyle: frameId,
      frameLabel: frameId ? getFrameLabel(selectedFrame) : null,
      frameSize: selectedSize,
      frameSizeLabel: sizeLabel,
      withImpasto,
      dedication,
      price,
      originalImage: initialImage,
      processedImage: processedImage || null,
      printSpecs: getPrintSpecs(selectedSize),
    });

    navigate('/cart');
  };

  return (
    <div className="studio-page">
      <div className="container">
        {/* Step indicator */}
        <StepIndicator currentStep={currentStep} />

        {/* Step content */}
        <div className="studio-content">
          {currentStep === 0 && (
            <EnhancementStep
              originalImage={initialImage}
              processedImage={processedImage}
              isProcessing={isProcessing}
              selectedEnhancement={selectedEnhancement}
              onEnhance={handleEnhance}
              onContinue={handleContinueToFraming}
            />
          )}

          {currentStep === 1 && (
            <FramingStep
              image={processedImage || initialImage}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              productType={productType}
              setProductType={setProductType}
              selectedFrame={selectedFrame}
              setSelectedFrame={setSelectedFrame}
              withImpasto={withImpasto}
              setWithImpasto={setWithImpasto}
              dedication={dedication}
              setDedication={setDedication}
              onAddToCart={handleAddToCart}
            />
          )}
        </div>

        {/* Back button on step 2 */}
        {currentStep === 1 && (
          <button
            className="studio-back"
            onClick={() => {
              setCurrentStep(0);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            ← Nazaj na izboljšavo
          </button>
        )}
      </div>
    </div>
  );
}
