/**
 * GOAT Registry App — Assistant Chat API
 * Routes assistant requests to correct AI with context
 * 
 * Features:
- Routes to correct assistant based on ID
- Uses assistant-specific system instructions
- Returns assistant metadata
- Streams responses via Gemini
 */

import { ASSISTANTS, getAssistantById } from '../../../lib/ai-assistants';
import { withAISecurity } from '../../../lib/api-security';

export const config = {
  api: {
    bodyParser: { sizeLimit: '10mb' },
  },
};

async function handler(req, res) {
  
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GOOGLE_AI_API_KEY not configured' });
  }
  
  try {
    const { assistantId, messages, settings } = req.body;
    
    // Get assistant
    const assistant = getAssistantById(assistantId);
    if (!assistant) {
      return res.status(400).json({ error: `Assistant not found: ${assistantId}` });
    }
    
    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }
    
    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    
    // Send assistant metadata first
    res.write(`data: ${JSON.stringify({
      type: 'assistant_info',
      assistant: {
        id: assistant.id,
        name: assistant.displayName,
        avatar: assistant.avatar,
        role: assistant.role,
        tagline: assistant.tagline,
      },
    })}\n\n`);
    
    // Track client disconnect
    let clientDisconnected = false;
    req.on('close', () => { clientDisconnected = true; });
    res.on('close', () => { clientDisconnected = true; });
    
    // Build messages with assistant personality
    const messagesWithPersonality = [
      {
        role: 'system',
        parts: [{ text: assistant.personality }],
      },
      ...messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content || msg.text || '' }],
      })),
    ];
    
    // Call Gemini API
    const modelId = assistant.model;
    const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:streamGenerateContent?key=${apiKey}`;
    
    const requestBody = {
      contents: messagesWithPersonality,
      generationConfig: {
        temperature: settings?.temperature ?? 0.7,
        topP: settings?.topP ?? 0.95,
        topK: settings?.topK ?? 40,
        maxOutputTokens: settings?.maxTokens ?? 8192,
      },
    };
    
    const response = await fetch(streamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      res.write(`data: ${JSON.stringify({ type: 'error', error: errorText })}\n\n`);
      res.end();
      return;
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      if (clientDisconnected) break;
      
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        try {
          const data = JSON.parse(line);
          
          if (data.candidates && data.candidates[0]) {
            const candidate = data.candidates[0];
            
            if (candidate.content && candidate.content.parts) {
              for (const part of candidate.content.parts) {
                if (part.text) {
                  res.write(`data: ${JSON.stringify({ type: 'text', content: part.text })}\n\n`);
                }
              }
            }
          }
          
          if (data.usageMetadata) {
            res.write(`data: ${JSON.stringify({
              type: 'done',
              usage: data.usageMetadata,
            })}\n\n`);
          }
        } catch (e) {
          if (e instanceof SyntaxError) continue;
          console.error('Parse error:', e);
        }
      }
    }
    
    if (!clientDisconnected) {
      res.write('data: [DONE]\n\n');
    }
    res.end();
    
  } catch (error) {
    console.error('Assistant API error:', error);
    
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}

export default withAISecurity(handler, { rateLimit: 30 });