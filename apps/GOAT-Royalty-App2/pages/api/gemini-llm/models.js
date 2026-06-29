/**
 * Gemini AI LLM - Available Models API
 */

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const models = [
    {
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      description: 'Fast and efficient for most tasks',
      category: 'production',
      maxTokens: 8192,
      supportsImages: true,
      supportsStreaming: true,
    },
    {
      id: 'gemini-2.0-flash-lite',
      name: 'Gemini 2.0 Flash Lite',
      description: 'Lightweight — fastest responses',
      category: 'production',
      maxTokens: 8192,
      supportsImages: true,
      supportsStreaming: true,
    },
    {
      id: 'gemini-2.5-flash-preview-05-20',
      name: 'Gemini 2.5 Flash Preview',
      description: 'Latest preview with thinking capabilities',
      category: 'preview',
      maxTokens: 65536,
      supportsImages: true,
      supportsStreaming: true,
    },
    {
      id: 'gemini-2.5-pro-preview-05-06',
      name: 'Gemini 2.5 Pro Preview',
      description: 'Most capable model for complex tasks',
      category: 'preview',
      maxTokens: 65536,
      supportsImages: true,
      supportsStreaming: true,
    },
  ];

  return res.status(200).json({ models });
}