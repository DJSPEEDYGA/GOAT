/**
 * GOAT Royalty App — Gemini Function Calling API
 * Endpoint for AI-powered tool use with 6 GOAT-specific tools:
 * - calculate_royalties
 * - lookup_track
 * - get_streaming_analytics
 * - copyright_check
 * - distribution_status
 * - generate_report
 */

import { getGeminiService } from '../../lib/gemini-llm-service';
import { withAISecurity } from '../../lib/api-security';

export const config = {
  api: {
    bodyParser: { sizeLimit: '5mb' },
  },
};

const ALLOWED_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.5-flash-preview-05-20',
  'gemini-2.5-pro-preview-05-06',
  'gemini-1.5-pro',
];

async function handler(req, res) {

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GOOGLE_AI_API_KEY not configured' });
  }

  try {
    const { prompt, model: modelId, persona, settings } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt string is required' });
    }

    const selectedModel = modelId || 'gemini-2.0-flash';
    if (!ALLOWED_MODELS.includes(selectedModel)) {
      return res.status(400).json({
        error: `Invalid model for function calling: "${selectedModel}". Allowed: ${ALLOWED_MODELS.join(', ')}`,
      });
    }

    const service = getGeminiService(apiKey);

    const options = {
      persona: persona || 'default',
      temperature: settings?.temperature ?? 0.3,
      topP: settings?.topP ?? 0.95,
      maxTokens: settings?.maxTokens ?? 8192,
    };

    const result = await service.callWithTools(selectedModel, prompt, options);

    return res.status(200).json({
      success: true,
      response: result.text,
      toolCalls: result.toolCalls,
      toolResults: result.toolResults,
      usage: result.usage,
      model: selectedModel,
    });

  } catch (error) {
    console.error('Gemini Tools API error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

export default withAISecurity(handler, { rateLimit: 20 });