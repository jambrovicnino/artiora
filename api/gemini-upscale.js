import Replicate from 'replicate';
import fetch from 'node-fetch';

// Replicate model configurations for different styles
// Using known working models with simplified config
const STYLE_MODELS = {
  'bw-preserve': {
    model: 'nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa',
    description: 'Real-ESRGAN for B&W upscaling and enhancement',
    input: (imageUrl) => ({
      image: imageUrl,
      scale: 2,  // Reduced from 4 for faster processing
      face_enhance: false
    })
  },
  'colorize': {
    model: 'nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa',
    description: 'Real-ESRGAN upscaling (colorize using same model for now)',
    input: (imageUrl) => ({
      image: imageUrl,
      scale: 2,
      face_enhance: false
    })
  },
  'random': {
    model: 'nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa',
    description: 'Real-ESRGAN with creative enhancement',
    input: (imageUrl) => ({
      image: imageUrl,
      scale: 2,
      face_enhance: false
    })
  }
};

// Maximum file size: 10MB (in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { imageBase64, style, originalFilename } = req.body;

    // Validate request
    if (!imageBase64 || !style) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: imageBase64 and style'
      });
    }

    if (!STYLE_MODELS[style]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid style. Must be one of: bw-preserve, colorize, random'
      });
    }

    // Extract base64 data (remove data:image/...;base64, prefix if present)
    let base64Data = imageBase64;
    let mimeType = 'image/jpeg';

    if (imageBase64.includes(',')) {
      const parts = imageBase64.split(',');
      base64Data = parts[1];
      // Extract mime type from data URI
      const mimeMatch = parts[0].match(/data:(image\/[^;]+)/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
      }
    }

    // Check file size
    const sizeInBytes = (base64Data.length * 3) / 4;
    if (sizeInBytes > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        error: `Image too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
      });
    }

    // Initialize Replicate
    const apiKey = process.env.REPLICATE_API_TOKEN;
    if (!apiKey) {
      console.error('REPLICATE_API_TOKEN is not configured');
      return res.status(500).json({
        success: false,
        error: 'Service temporarily unavailable. Please try again later.'
      });
    }

    const replicate = new Replicate({
      auth: apiKey,
    });

    // Convert base64 to data URI for Replicate
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    // Get model configuration
    const modelConfig = STYLE_MODELS[style];

    console.log(`Processing image with style: ${style}`);
    console.log(`Using model: ${modelConfig.model}`);

    // Run the model
    const output = await replicate.run(
      modelConfig.model,
      {
        input: modelConfig.input(dataUri)
      }
    );

    console.log('Replicate output received');

    // Replicate returns a URL to the processed image
    // We need to fetch it and convert to base64
    let processedImageUrl = output;

    // Handle different output formats
    if (Array.isArray(output)) {
      processedImageUrl = output[0];
    } else if (typeof output === 'object' && output.output) {
      processedImageUrl = output.output;
    }

    console.log('Processed image URL:', processedImageUrl);

    // Validate the URL
    if (!processedImageUrl || typeof processedImageUrl !== 'string') {
      throw new Error('Invalid output from Replicate model');
    }

    // Fetch the processed image
    const imageResponse = await fetch(processedImageUrl);

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch processed image: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.buffer();
    const processedBase64 = imageBuffer.toString('base64');
    const processedDataUri = `data:image/png;base64,${processedBase64}`;

    return res.status(200).json({
      success: true,
      processedImage: processedDataUri,
      metadata: {
        style,
        originalFilename,
        processedAt: new Date().toISOString(),
        model: modelConfig.model.split(':')[0],
        description: modelConfig.description
      }
    });

  } catch (error) {
    console.error('Error processing image:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);

    // Handle specific error types
    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        error: 'Service is busy. Please wait a moment and try again.'
      });
    }

    if (error.message?.includes('timeout')) {
      return res.status(408).json({
        success: false,
        error: 'Enhancement is taking too long. Please check your connection and try again.'
      });
    }

    return res.status(500).json({
      success: false,
      error: `Server error: ${error.message}`,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
