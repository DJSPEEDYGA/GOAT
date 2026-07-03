/**
 * GOAT Royalty App — Gemini Enhanced Chat API
 * Multi-persona chat endpoint with advanced features
 * 
 * Personas:
 * - default: General GOAT AI assistant
 * - royalty_expert: Music royalty specialist
 * - legal_advisor: Music legal guidance
 * - producer: Production consultant
 * - marketing: Music marketing strategist
 * - analyst: Music analytics expert
 * 
 * Features:
 * - Persona-based system instructions
 * - Conversation history support
 * - Configurable generation parameters
 * - Token usage tracking
 */

import { getGeminiService, PERSONAS } from '../../lib/gemini-llm-service';
import { withAISecurity } from '../../lib/api-security';

export const config = {
  api: {
    bodyParser: { sizeLimit: '10mb' },
  },
};

const ALLOWED_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash-preview-05-20',
  'gemini-2.5-pro-preview-05-06',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
];

async function handler(req, res) {

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GOOGLE_AI_API_KEY not configured' });
  }

  try {
    const { messages, model: modelId, persona, settings, returnPersonas } = req.body;

    // If client requests persona list
    if (returnPersonas) {
      const personaList = Object.keys(PERSONAS).map((key) => ({
        id: key,
        name: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        description: getPersonaDescription(key),
      }));
      return res.status(200).json({ success: true, personas: personaList });
    }

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const selectedModel = modelId || 'gemini-2.0-flash';
    if (!ALLOWED_MODELS.includes(selectedModel)) {
      return res.status(400).json({
        error: `Invalid model: "${selectedModel}". Allowed: ${ALLOWED_MODELS.join(', ')}`,
      });
    }

    const selectedPersona = persona || 'default';
    if (!PERSONAS[selectedPersona]) {
      return res.status(400).json({
        error: `Invalid persona: "${selectedPersona}". Allowed: ${Object.keys(PERSONAS).join(', ')}`,
      });
    }

    const service = getGeminiService(apiKey);

    const options = {
      persona: selectedPersona,
      temperature: settings?.temperature ?? 0.7,
      topP: settings?.topP ?? 0.95,
      topK: settings?.topK ?? 40,
      maxTokens: settings?.maxTokens ?? 8192,
    };

    const result = await service.chat(selectedModel, messages, options);

    return res.status(200).json({
      success: true,
      response: result.text,
      usage: result.usage,
      finishReason: result.finishReason,
      model: selectedModel,
      persona: selectedPersona,
    });

  } catch (error) {
    console.error('Gemini Enhanced Chat API error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

function getPersonaDescription(personaId) {
  const descriptions = {
    default: 'General GOAT AI assistant for music industry guidance',
    royalty_expert: 'Specialist in royalty calculations, collection, and optimization',
    legal_advisor: 'Music copyright, contracts, and legal compliance advisor',
    producer: 'Music production, engineering, and creative workflow consultant',
    marketing: 'Music marketing, promotion, and audience growth strategist',
    analyst: 'Streaming analytics, revenue forecasting, and data insights expert',
  };
  return descriptions[personaId] || 'AI assistant';
}

export default withAISecurity(handler, { rateLimit: 30 });