/**
 * AI Agent API Endpoint
 * Routes messages to specialized AI agents with unique personalities and system prompts
 * Multi-provider fallback: Gemini → OpenAI → Claude
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { message, agentId, agentName, systemPrompt, history = [] } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  // Build conversation history
  const conversationHistory = [
    { role: 'system', content: systemPrompt || 'You are a helpful AI assistant for the GOAT Royalty platform.' },
    ...history,
    { role: 'user', content: message }
  ];

  // Try providers in fallback order
  const providers = [
    { name: 'Gemini', fn: getGeminiResponse },
    { name: 'OpenAI', fn: getOpenAIResponse },
    { name: 'Anthropic', fn: getAnthropicResponse }
  ];

  for (const provider of providers) {
    try {
      const response = await provider.fn(conversationHistory, systemPrompt);
      if (response) {
        return res.status(200).json({
          success: true,
          response,
          provider: provider.name,
          agent: agentName || 'AI Assistant'
        });
      }
    } catch (error) {
      console.log(`${provider.name} failed:`, error.message);
      continue;
    }
  }

  // All providers failed — return a helpful fallback
  return res.status(200).json({
    success: true,
    response: `I'm ${agentName || 'your AI assistant'} and I'm currently operating in offline mode. To enable full AI capabilities, please configure at least one API key in your .env.local file:\n\n• GOOGLE_AI_API_KEY (Gemini)\n• OPENAI_API_KEY (GPT-4)\n• ANTHROPIC_API_KEY (Claude)\n\nIn the meantime, I can still help you navigate the GOAT Royalty platform! What would you like to explore?`,
    provider: 'fallback',
    agent: agentName
  });
}

// ============================================
// GOOGLE GEMINI
// ============================================
async function getGeminiResponse(history, systemPrompt) {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) return null;

  const contents = history
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          maxOutputTokens: 2048
        }
      })
    }
  );

  if (!response.ok) throw new Error(`Gemini ${response.status}`);
  
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

// ============================================
// OPENAI
// ============================================
async function getOpenAIResponse(history, systemPrompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const messages = history.map(m => ({
    role: m.role,
    content: m.content
  }));

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.8,
      max_tokens: 2048
    })
  });

  if (!response.ok) throw new Error(`OpenAI ${response.status}`);

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

// ============================================
// ANTHROPIC CLAUDE
// ============================================
async function getAnthropicResponse(history, systemPrompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const messages = history
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role,
      content: m.content
    }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      system: systemPrompt,
      messages
    })
  });

  if (!response.ok) throw new Error(`Anthropic ${response.status}`);

  const data = await response.json();
  return data.content?.[0]?.text;
}