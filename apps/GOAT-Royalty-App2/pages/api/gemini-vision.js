/**
 * GOAT Royalty App — Gemini Vision API
 * Multimodal endpoint for image analysis with text prompts
 * 
 * Supports:
 * - Album artwork analysis
 * - Document/contract scanning
 * - Royalty statement image parsing
 * - General image description and Q&A
 */

import { getGeminiService } from '../../lib/gemini-llm-service';
import { withAISecurity } from '../../lib/api-security';

export const config = {
  api: {
    bodyParser: { sizeLimit: '20mb' },
  },
};

const VISION_MODELS = [
  'gemini-2.5-flash-preview-05-20',
  'gemini-2.5-pro-preview-05-06',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
];

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
];

async function handler(req, res) {

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GOOGLE_AI_API_KEY not configured' });
  }

  try {
    const { image, prompt, model: modelId, persona, settings, analysisType } = req.body;

    // Validate image data
    if (!image || !image.data || !image.mimeType) {
      return res.status(400).json({
        error: 'Image data is required. Provide { data: "<base64>", mimeType: "image/jpeg" }',
      });
    }

    if (!ALLOWED_MIME_TYPES.includes(image.mimeType)) {
      return res.status(400).json({
        error: `Unsupported image type: "${image.mimeType}". Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      });
    }

    // Validate base64 data (basic check)
    if (typeof image.data !== 'string' || image.data.length < 100) {
      return res.status(400).json({ error: 'Invalid image data. Provide valid base64-encoded image.' });
    }

    const selectedModel = modelId || 'gemini-2.5-flash-preview-05-20';
    if (!VISION_MODELS.includes(selectedModel)) {
      return res.status(400).json({
        error: `Invalid model for vision: "${selectedModel}". Allowed: ${VISION_MODELS.join(', ')}`,
      });
    }

    // Build analysis prompt based on type
    const analysisPrompts = {
      artwork: 'Analyze this album artwork or music-related image. Describe the visual style, colors, mood, and any text visible. Suggest how it could be improved for marketing.',
      document: 'Analyze this document image. Extract any visible text, numbers, dates, and key information. Summarize the document type and contents.',
      royalty_statement: 'Analyze this royalty statement or financial document. Extract all visible amounts, dates, track names, and payment details. Organize the information clearly.',
      contract: 'Analyze this music contract or legal document. Identify key terms, parties involved, dates, and any notable clauses. Flag any potential concerns.',
      general: 'Describe this image in detail. What do you see?',
    };

    const finalPrompt = prompt || analysisPrompts[analysisType] || analysisPrompts.general;

    const service = getGeminiService(apiKey);

    const options = {
      persona: persona || 'default',
      temperature: settings?.temperature ?? 0.4,
      topP: settings?.topP ?? 0.95,
      maxTokens: settings?.maxTokens ?? 8192,
    };

    const result = await service.analyzeImage(selectedModel, image, finalPrompt, options);

    return res.status(200).json({
      success: true,
      analysis: result.text,
      usage: result.usage,
      finishReason: result.finishReason,
      model: selectedModel,
      analysisType: analysisType || 'general',
    });

  } catch (error) {
    console.error('Gemini Vision API error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

export default withAISecurity(handler, { rateLimit: 20, maxBodySize: 20 * 1024 * 1024 });