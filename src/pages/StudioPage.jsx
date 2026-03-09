import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { applyArtStyle } from '../services/artStyleService';
import { getPrice, getSizeLabel, getPrintSpecs, getFrameLabel, calculateCostBreakdown, PRODUCT_TYPES, canvasSizes, HANGING_INCLUDED } from '../data/frameOptions';
import { calculateImageQuality, getImageDimensions } from '../services/imageQualityService';
import { upscaleImage } from '../services/upscaleService';
import { createCartThumbnail, createOrderImage } from '../services/imageCompressService';
import { uploadFullResImage } from '../services/imageUploadService';
import StepIndicator from '../components/studio/StepIndicator';
import EnhancementStep from '../components/studio/EnhancementStep';
import CreateStep from '../components/studio/CreateStep';
import FramingStep from '../components/studio/FramingStep';
import './StudioPage.css';

export default function StudioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem } = useCart();

  // Mode: 'upload' (image enhancement) or 'create' (AI generation)
  const mode = location.state?.mode || 'upload';

  // Image from Hero upload (via router state) — only for upload mode
  const initialImage = location.state?.image || null;
  const fileName = location.state?.fileName || 'fotografija.jpg';

  // If upload mode but no image, redirect home
  if (mode === 'upload' && !initialImage) {
    return (
      <div className="studio-empty">
        <p>Najprej naložite fotografijo.</p>
        <button className="btn-gold" onClick={() => navigate('/')}>
          NAZAJ NA ZAČETEK
        </button>
      </div>
    );
  }

  // Step management: 0 = USTVARI, 1 = OKVIR
  const [currentStep, setCurrentStep] = useState(0);

  // Enhancement state (upload mode)
  const [selectedEnhancement, setSelectedEnhancement] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);

  // AI generation state (create mode)
  const [generatedImage, setGeneratedImage] = useState(null);

  // Product configuration state
  const [selectedSize, setSelectedSize] = useState('40x50');
  const [productType, setProductType] = useState(PRODUCT_TYPES.STRETCHED);
  const [selectedFrame, setSelectedFrame] = useState('ne-vivid-violet');
  const [withImpasto, setWithImpasto] = useState(false);
  const [dedication, setDedication] = useState('');

  // Image quality per size (calculated when image changes)
  const [imageQuality, setImageQuality] = useState(null);

  // Upscale state
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [upscaleInfo, setUpscaleInfo] = useState(null); // { model, method, factor }

  // Add-to-cart upload state
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Izračunaj kvaliteto slike za vse velikosti
  useEffect(() => {
    const finalImage = mode === 'create' ? generatedImage : (processedImage || initialImage);
    if (!finalImage) return;

    getImageDimensions(finalImage).then((dims) => {
      const qualityMap = {};
      for (const size of canvasSizes) {
        qualityMap[size.id] = calculateImageQuality(dims.width, dims.height, size.id);
      }
      setImageQuality(qualityMap);
    }).catch(() => setImageQuality(null));
  }, [mode, generatedImage, processedImage, initialImage]);

  // ─── Art style handler (upload mode) ───
  const handleEnhance = async (styleId) => {
    setSelectedEnhancement(styleId);
    setIsProcessing(true);
    setProcessedImage(null);

    try {
      const result = await applyArtStyle(initialImage, styleId);
      setProcessedImage(result.processedImage);
      console.log(`[ETERNA] Art style "${result.styleName}" uspešno apliciran`);
    } catch (error) {
      console.error('Napaka pri umetniški preobrazbi:', error);
      alert('Preobrazba ni uspela. Prosimo, poskusite znova.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── AI generation handler (create mode) ───
  const handleImageGenerated = (imageDataUrl) => {
    setGeneratedImage(imageDataUrl);
  };

  // ─── Continue to framing ───
  const handleContinueToFraming = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── AI upscale handler ───
  const handleUpscale = async () => {
    const currentImage = getFinalImage();
    if (!currentImage || isUpscaling) return;

    setIsUpscaling(true);
    setUpscaleInfo(null);

    try {
      console.log(`[ETERNA] Upscale začetek — image type: ${typeof currentImage}, length: ${currentImage?.length || 0}, starts: ${currentImage?.substring(0, 30)}`);
      const result = await upscaleImage(currentImage, 3);

      // Shrani upscaled sliko v ustrezno stanje
      if (mode === 'create') {
        setGeneratedImage(result.imageDataUrl);
      } else {
        setProcessedImage(result.imageDataUrl);
      }

      setUpscaleInfo({
        model: result.model,
        method: result.method,
        factor: result.factor,
        dimensions: result.dimensions,
        warning: result.warning || null,
      });

      console.log(`[ETERNA] Upscale uspešen: ${result.model} (${result.method}), ${result.dimensions?.width}×${result.dimensions?.height}`);
    } catch (error) {
      console.error('[ETERNA] Upscale napaka:', error.message, error);
      alert(`Povečava resolucije ni uspela: ${error.message}. Poskusite znova ali izberite manjšo velikost.`);
    } finally {
      setIsUpscaling(false);
    }
  };

  // ─── Get the final image for framing ───
  const getFinalImage = () => {
    if (mode === 'create') return generatedImage;
    return processedImage || initialImage;
  };

  // ─── Add to cart ───
  const handleAddToCart = async () => {
    const frameId = productType === PRODUCT_TYPES.FRAMED ? selectedFrame : null;
    const price = getPrice(selectedSize, productType, frameId, withImpasto);

    const sizeLabel = getSizeLabel(selectedSize);
    const finalImage = getFinalImage();

    const quality = imageQuality?.[selectedSize];
    const qualityWarning = quality?.rating === 'poor'
      ? `Nizka resolucija (${quality.dpi} DPI) za ${sizeLabel}`
      : quality?.rating === 'acceptable'
      ? `Mejna resolucija (${quality.dpi} DPI) za ${sizeLabel}`
      : null;

    setIsAddingToCart(true);

    try {
      // 1. Ustvari majhen thumbnail za prikaz v košarici (400px, gre v localStorage)
      setUploadProgress('Priprava slike...');
      const thumb = await createCartThumbnail(finalImage);

      // 2. Poskusi naložiti sliko v Vercel Blob → dobi URL
      //    Če upload odpove, uporabi fallback (stisnjena slika v localStorage)
      let fullResUrl = null;
      let fallbackImage = null;

      try {
        setUploadProgress('Nalagam sliko v oblak...');
        fullResUrl = await uploadFullResImage(
          finalImage,
          mode === 'create' ? 'ai-umetnina.jpg' : fileName
        );
        console.log('[ETERNA] Upload uspešen:', fullResUrl);
      } catch (uploadError) {
        console.warn('[ETERNA] Upload ni uspel, uporabim fallback:', uploadError.message);
        setUploadProgress('Pripravljam sliko...');
        // Fallback: shrani stisnjeno sliko (2000px JPEG) v localStorage
        fallbackImage = await createOrderImage(finalImage);
        console.log('[ETERNA] Fallback slika pripravljena:', Math.round(fallbackImage.length / 1024), 'KB');
      }

      // 3. Dodaj v košarico
      addItem({
        thumbnail: thumb,
        ...(fullResUrl
          ? { fullResUrl } // Blob URL (polna resolucija v oblaku)
          : { originalImage: fallbackImage }), // Fallback: stisnjena v localStorage
        fileName: mode === 'create' ? 'ai-umetnina.png' : fileName,
        enhancement: mode === 'create' ? 'ai-generation' : selectedEnhancement,
        productType,
        frameStyle: frameId,
        frameLabel: frameId ? getFrameLabel(selectedFrame) : null,
        frameSize: selectedSize,
        frameSizeLabel: sizeLabel,
        withImpasto,
        dedication,
        // Interno za admina
        hangingIncluded: HANGING_INCLUDED[selectedSize]?.name || null,
        costBreakdown: calculateCostBreakdown(selectedSize, productType, frameId, withImpasto),
        price,
        printSpecs: getPrintSpecs(selectedSize),
        qualityWarning,
      });

      navigate('/cart');
    } catch (error) {
      console.error('[ETERNA] Add to cart failed:', error);
      alert('Napaka pri dodajanju v košarico. Prosimo, poskusite znova.');
    } finally {
      setIsAddingToCart(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="studio-page">
      <div className="container">
        {/* Step indicator */}
        <StepIndicator currentStep={currentStep} />

        {/* Step content */}
        <div className="studio-content">
          {currentStep === 0 && mode === 'upload' && (
            <EnhancementStep
              originalImage={initialImage}
              processedImage={processedImage}
              isProcessing={isProcessing}
              selectedEnhancement={selectedEnhancement}
              onEnhance={handleEnhance}
              onContinue={handleContinueToFraming}
            />
          )}

          {currentStep === 0 && mode === 'create' && (
            <CreateStep
              generatedImage={generatedImage}
              onImageGenerated={handleImageGenerated}
              onContinue={handleContinueToFraming}
            />
          )}

          {currentStep === 1 && (
            <FramingStep
              image={getFinalImage()}
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
              isAddingToCart={isAddingToCart}
              uploadProgress={uploadProgress}
              imageQuality={imageQuality}
              onUpscale={handleUpscale}
              isUpscaling={isUpscaling}
              upscaleInfo={upscaleInfo}
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
            ← Nazaj na ustvarjanje
          </button>
        )}
      </div>
    </div>
  );
}
