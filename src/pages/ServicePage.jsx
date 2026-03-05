import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import services from '../data/services';
import { frameSizes, frameColors } from '../data/frameOptions';
import { useCart } from '../context/CartContext';
import PhotoUploader from '../components/service/PhotoUploader';
import FrameSizeSelector from '../components/service/FrameSizeSelector';
import FrameColorSelector from '../components/service/FrameColorSelector';
import PriceSummary from '../components/service/PriceSummary';
import StyleSelector from '../components/service/StyleSelector';
import { upscaleImage } from '../services/geminiService';
import './ServicePage.css';

export default function ServicePage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const service = services.find((s) => s.id === serviceId);

  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [selectedSize, setSelectedSize] = useState('8x10');
  const [selectedColor, setSelectedColor] = useState('black');
  const [added, setAdded] = useState(false);

  // AI Enhancement state
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);

  const price = useMemo(() => {
    if (!service) return 0;
    const size = frameSizes.find((s) => s.id === selectedSize);
    return Math.round(service.basePrice * (size?.multiplier ?? 1));
  }, [service, selectedSize]);

  if (!service) {
    return (
      <div className="service-page container">
        <h2>Service not found</h2>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  const handleFileSelect = (dataUrl, name) => {
    setPreview(dataUrl);
    setFileName(name || '');
    // Reset AI enhancement state when new file is selected
    setSelectedStyle(null);
    setOriginalImage(null);
    setProcessedImage(null);
  };

  const handleStyleSelect = async (style) => {
    if (!preview) return;

    setSelectedStyle(style);

    // Store original image on first enhancement
    if (!originalImage) {
      setOriginalImage(preview);
    }

    setIsProcessing(true);

    try {
      const result = await upscaleImage(preview, style);

      if (result.success && result.processedImage) {
        setPreview(result.processedImage);
        setProcessedImage(result.processedImage);
      } else {
        throw new Error(result.error || 'Enhancement failed');
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
      alert(error.message || 'Failed to enhance photo. Please try again.');
      // Reset style selection on error
      setSelectedStyle(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddToCart = () => {
    if (!preview) {
      alert('Please upload a photo first.');
      return;
    }
    const sizeObj = frameSizes.find((s) => s.id === selectedSize);
    const colorObj = frameColors.find((c) => c.id === selectedColor);

    addItem({
      serviceId: service.id,
      serviceName: service.name,
      thumbnail: preview,
      fileName,
      frameSize: selectedSize,
      frameSizeLabel: sizeObj.label,
      frameColor: selectedColor,
      frameColorLabel: colorObj.label,
      price,
      // AI Enhancement metadata
      originalImage: originalImage || null,
      aiStyle: selectedStyle || null,
      aiProcessed: !!processedImage,
      aiProcessedAt: processedImage ? new Date().toISOString() : null,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="service-page">
      <div className="container">
        <div className="service-page-header">
          <span className="service-page-icon">{service.icon}</span>
          <div>
            <h1>{service.name}</h1>
            <p>{service.description}</p>
          </div>
        </div>

        <div className="service-page-grid">
          <div className="service-page-left">
            <PhotoUploader
              preview={preview}
              onFileSelect={handleFileSelect}
              isProcessing={isProcessing}
              originalImage={originalImage}
              processedImage={processedImage}
            />
          </div>

          <div className="service-page-right">
            {/* AI Enhancement Style Selection */}
            <StyleSelector
              selectedStyle={selectedStyle}
              onSelect={handleStyleSelect}
              disabled={!preview || isProcessing}
            />

            {/* Processing Status Indicator */}
            {isProcessing && (
              <div className="processing-status">
                ✨ Enhancing your photo...
              </div>
            )}

            {/* Frame Options */}
            <FrameSizeSelector
              basePrice={service.basePrice}
              selectedSize={selectedSize}
              onSelect={setSelectedSize}
            />
            <FrameColorSelector
              selectedColor={selectedColor}
              onSelect={setSelectedColor}
            />
            <PriceSummary price={price} />
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={!preview || isProcessing}
            >
              {added ? 'Added!' : 'Add to Cart'}
            </button>
            {added && (
              <div className="added-actions">
                <button className="btn-secondary" onClick={() => { setPreview(null); setFileName(''); setAdded(false); }}>
                  Add Another
                </button>
                <button className="btn-primary" onClick={() => navigate('/cart')}>
                  Go to Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
