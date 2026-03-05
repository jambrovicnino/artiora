// Available enhancement styles
export const STYLE_OPTIONS = {
  BW_PRESERVE: 'bw-preserve',
  COLORIZE: 'colorize',
  RANDOM: 'random'
};

// Style metadata for UI display
export const STYLE_METADATA = [
  {
    id: STYLE_OPTIONS.BW_PRESERVE,
    label: 'Black & White',
    icon: '📸',
    description: 'Preserve monochrome aesthetic, enhance clarity and remove noise'
  },
  {
    id: STYLE_OPTIONS.COLORIZE,
    label: 'Colorized',
    icon: '🎨',
    description: 'Add historically accurate colorization and enhance quality'
  },
  {
    id: STYLE_OPTIONS.RANDOM,
    label: 'Surprise Me',
    icon: '🎲',
    description: 'Let AI choose the best creative enhancement'
  }
];

/**
 * Apply image enhancements using canvas (client-side processing)
 * This is a demo/mock version that works without API calls
 */
function applyImageEnhancement(imageData, style) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = imageData.width;
  canvas.height = imageData.height;

  ctx.putImageData(imageData, 0, 0);

  // Get image data for pixel manipulation
  const data = imageData.data;

  switch (style) {
    case STYLE_OPTIONS.BW_PRESERVE:
      // Enhanced B&W: Increase contrast, sharpen
      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale with enhanced contrast
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const enhanced = ((avg - 128) * 1.3) + 128; // Increase contrast
        const clamped = Math.max(0, Math.min(255, enhanced));
        data[i] = data[i + 1] = data[i + 2] = clamped;
      }
      break;

    case STYLE_OPTIONS.COLORIZE:
      // Colorization effect: Add warm sepia tones with color variation
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Sepia formula with enhanced colors
        data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189) + 20);
        data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168) + 10);
        data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));

        // Add slight color variation for more realistic look
        if (r > 120) data[i] = Math.min(255, data[i] + 15);
        if (b < 100) data[i + 2] = Math.max(0, data[i + 2] - 10);
      }
      break;

    case STYLE_OPTIONS.RANDOM:
      // Creative enhancement: Vibrant colors + contrast
      for (let i = 0; i < data.length; i += 4) {
        // Enhance saturation and contrast
        data[i] = Math.min(255, data[i] * 1.2);     // Red boost
        data[i + 1] = Math.min(255, data[i + 1] * 1.15); // Green boost
        data[i + 2] = Math.min(255, data[i + 2] * 1.1);  // Blue boost
      }
      break;
  }

  ctx.putImageData(imageData, 0, 0);

  // Apply additional canvas filters for polish
  ctx.filter = style === STYLE_OPTIONS.BW_PRESERVE
    ? 'contrast(1.2) brightness(1.05)'
    : style === STYLE_OPTIONS.COLORIZE
    ? 'saturate(1.3) brightness(1.1) contrast(1.1)'
    : 'saturate(1.4) contrast(1.15) brightness(1.05)';

  ctx.drawImage(canvas, 0, 0);

  return canvas;
}

/**
 * Simulate processing delay for realistic UX
 */
function simulateProcessing(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

/**
 * Upscale and enhance an image (DEMO VERSION - Client-side processing)
 * @param {string} imageBase64 - Base64 encoded image data (with or without data URI prefix)
 * @param {string} style - Enhancement style (bw-preserve, colorize, or random)
 * @returns {Promise<{success: boolean, processedImage?: string, metadata?: object, error?: string}>}
 */
export async function upscaleImage(imageBase64, style) {
  try {
    // Validate inputs
    if (!imageBase64) {
      throw new Error('Image data is required');
    }

    if (!Object.values(STYLE_OPTIONS).includes(style)) {
      throw new Error('Invalid style option');
    }

    // Load image
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageBase64;
    });

    // Create canvas for processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Upscale to 2x size
    const scale = 2;
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    // Draw scaled image with smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Get image data for pixel manipulation
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Simulate realistic processing time (15-25 seconds)
    const processingTime = 15000 + Math.random() * 10000;
    await simulateProcessing(processingTime);

    // Apply style-specific enhancements
    const enhancedCanvas = applyImageEnhancement(imageData, style);

    // Convert back to base64
    const processedImage = enhancedCanvas.toDataURL('image/png', 0.95);

    return {
      success: true,
      processedImage,
      metadata: {
        style,
        processedAt: new Date().toISOString(),
        model: 'client-side-demo',
        description: 'Demo enhancement using canvas processing',
        scale: 2
      }
    };

  } catch (error) {
    console.error('Enhancement error:', error);
    throw new Error('Failed to enhance photo. Please try again.');
  }
}

/**
 * Get style metadata by ID
 * @param {string} styleId - Style ID
 * @returns {object|null} Style metadata or null if not found
 */
export function getStyleMetadata(styleId) {
  return STYLE_METADATA.find(s => s.id === styleId) || null;
}

export default {
  upscaleImage,
  getStyleMetadata,
  STYLE_OPTIONS,
  STYLE_METADATA
};
