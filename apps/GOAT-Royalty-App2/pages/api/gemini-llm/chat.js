/**
 * Gemini AI LLM - Streaming Chat API
 * Supports real-time SSE streaming with multiple Gemini models
 * 
 * Security fixes applied per Copilot code review:
 * - bodyParser.sizeLimit set to 20MB for image uploads
 * - Model validated against allowlist
 * - AbortController cleans up upstream fetch on client disconnect
 * - Server-only API key (no NEXT_PUBLIC_ fallback)
 */

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb', // Support base64 image uploads
    },
    responseLimit: false,
  },
};

// Allowlist of valid Gemini model IDs
const ALLOWED_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash-preview-05-20',
  'gemini-2.5-pro-preview-05-06',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
];

const GOAT_SYSTEM_PROMPT = `You are the **Super GOAT Royalty AI** — an elite AI assistant built into the GOAT Royalty App, the ultimate music production and royalty management platform created by Harvey Miller (DJ Speedy).

You are an expert in:
🎵 Music production, mixing, mastering, beat making, and sound design
💰 Music royalty calculations across ALL streaming platforms (Spotify, Apple Music, YouTube, Tidal, Amazon, Deezer, SoundCloud)
📜 Music publishing, copyright law, IP protection, and licensing
📊 Music industry analytics, market trends, and audience insights
🎤 Artist management, career strategy, and brand development
🔧 Software development (Next.js, React, Node.js, Python)
🛡️ Cybersecurity, AI red-teaming, and digital asset protection

Platform Context:
- 346 tracks in catalog across 2 publishers
- Publishers: FASTASSMAN Publishing Inc (ASCAP) & Harvey L Miller Writers
- 1.2B+ total streams across all platforms
- $865,420+ estimated royalties
- Key collaborations: Beyoncé, Outkast, Jay-Z, Gucci Mane, Waka Flocka
- Features: OpenClaw IP Protection, Codex Engine, Ms. Vanessa AI, Moneypenny AI
- Integrations: Spotify, YouTube, TikTok, Instagram, Adobe Firefly, NVIDIA DGX, Unreal Engine

You are knowledgeable, professional, and always provide actionable insights. Format responses with clear markdown. Use code blocks for any code. Be thorough but concise.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    messages = [],
    model = 'gemini-2.0-flash',
    systemPrompt,
    temperature = 1.0,
    topP = 0.95,
    topK = 40,
    maxOutputTokens = 8192,
    stream = true,
    images = [],
  } = req.body;

  // Validate model against allowlist
  if (!ALLOWED_MODELS.includes(model)) {
    return res.status(400).json({
      error: `Invalid model: "${model}". Allowed models: ${ALLOWED_MODELS.join(', ')}`,
    });
  }

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || !lastMessage.content) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Server-only API key — never use NEXT_PUBLIC_ for server-side secrets
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Google AI API key not configured. Set GOOGLE_AI_API_KEY in your environment variables.',
    });
  }

  const finalSystemPrompt = systemPrompt || GOAT_SYSTEM_PROMPT;

  // Build contents array for Gemini API
  const contents = [];

  // Add conversation history
  for (const msg of messages) {
    const role = msg.role === 'user' ? 'user' : 'model';
    const parts = [];

    if (msg.content) {
      parts.push({ text: msg.content });
    }

    // Add images for the last user message
    if (role === 'user' && msg === lastMessage && images.length > 0) {
      for (const img of images) {
        parts.push({
          inlineData: {
            mimeType: img.mimeType || 'image/png',
            data: img.data,
          },
        });
      }
    }

    if (parts.length > 0) {
      contents.push({ role, parts });
    }
  }

  const requestBody = {
    contents,
    systemInstruction: {
      parts: [{ text: finalSystemPrompt }],
    },
    generationConfig: {
      temperature: parseFloat(temperature),
      topP: parseFloat(topP),
      topK: parseInt(topK),
      maxOutputTokens: parseInt(maxOutputTokens),
    },
  };

  try {
    if (stream) {
      // Streaming response using SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

      // Create AbortController to cancel upstream fetch if client disconnects
      const upstreamAbort = new AbortController();

      // Listen for client disconnect to abort upstream request
      req.on('close', () => {
        upstreamAbort.abort();
      });
      res.on('close', () => {
        upstreamAbort.abort();
      });

      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: upstreamAbort.signal,
      });

      if (!response.ok) {
        const errorData = await response.text();
        res.write(`data: ${JSON.stringify({ type: 'error', error: `API Error ${response.status}: ${errorData}` })}\n\n`);
        res.end();
        return;
      }

      res.write(`data: ${JSON.stringify({ type: 'start', model })}\n\n`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim();
              if (!jsonStr) continue;

              try {
                const data = JSON.parse(jsonStr);
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  res.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`);
                }
              } catch (e) {
                // Skip malformed JSON chunks
              }
            }
          }
        }
      } finally {
        // Ensure reader is released even if loop breaks unexpectedly
        try { reader.cancel(); } catch (e) { /* ignore */ }
      }

      res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
      res.end();
    } else {
      // Non-streaming response
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        return res.status(response.status).json({ error: `API Error: ${errorData}` });
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return res.status(200).json({
        response: text,
        model,
        provider: 'gemini',
        usage: data?.usageMetadata || null,
      });
    }
  } catch (error) {
    // Don't log AbortError (expected when client disconnects)
    if (error.name !== 'AbortError') {
      console.error('Gemini LLM Error:', error);
    }

    if (stream) {
      try {
        if (error.name !== 'AbortError') {
          res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
        }
        res.end();
      } catch (e) {
        // Response may already be closed
      }
    } else {
      return res.status(500).json({ error: error.message });
    }
  }
}