/**
 * GOAT Royalty App — Gemini Streaming API
 * Server-Sent Events (SSE) endpoint for real-time AI responses
 * 
 * Uses the core GeminiLLMService for streaming generation
 * with proper AbortController cleanup and error handling.
 */

import { getGeminiService } from '../../lib/gemini-llm-service';
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
    const { messages, model: modelId, persona, settings } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const selectedModel = modelId || 'gemini-2.0-flash';
    if (!ALLOWED_MODELS.includes(selectedModel)) {
      return res.status(400).json({
        error: `Invalid model: "${selectedModel}". Allowed: ${ALLOWED_MODELS.join(', ')}`,
      });
    }

    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    // Track if client disconnected
    let clientDisconnected = false;
    req.on('close', () => { clientDisconnected = true; });
    res.on('close', () => { clientDisconnected = true; });

    const service = getGeminiService(apiKey);

    const options = {
      persona: persona || 'default',
      temperature: settings?.temperature ?? 0.7,
      topP: settings?.topP ?? 0.95,
      topK: settings?.topK ?? 40,
      maxTokens: settings?.maxTokens ?? 8192,
    };

    // Stream using the service's async generator
    const stream = service.generateStream(selectedModel, messages, options);

    for await (const chunk of stream) {
      if (clientDisconnected) break;

      if (chunk.type === 'text') {
        res.write(`data: ${JSON.stringify({ type: 'text', content: chunk.content })}\n\n`);
      } else if (chunk.type === 'done') {
        res.write(`data: ${JSON.stringify({
          type: 'done',
          usage: chunk.usage,
          finishReason: chunk.finishReason,
        })}\n\n`);
      }
    }

    if (!clientDisconnected) {
      res.write('data: [DONE]\n\n');
    }
    res.end();

  } catch (error) {
    console.error('Gemini Stream API error:', error);

    // If headers already sent, send error as SSE event
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}

export default withAISecurity(handler, { rateLimit: 30 });