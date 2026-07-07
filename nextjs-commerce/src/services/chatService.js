/**
 * Chat Service - Local Ollama Integration
 * Uses your local LLM models (llama3.1, mistral-nemo, qwen2.5, codellama)
 * NO API KEY REQUIRED - 100% offline capable
 */

const axios = require('axios');

class ChatService {
  constructor() {
    this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.defaultModel = process.env.OLLAMA_MODEL || 'llama3.1:8b';
    this.isConfigured = false;
    
    // Check if Ollama is running
    this.checkOllama().then(available => {
      if (available) {
        this.isConfigured = true;
        console.log('✅ Ollama connected - Using local LLM models');
        console.log(`   Model: ${this.defaultModel}`);
      } else {
        console.log('⚠️ Ollama not running - Start with: ollama serve');
      }
    });
    
    this.systemPrompt = `You are the GOAT AI Assistant, part of the GOAT Royalty Management System for Waka Flocka Flame.

You help users with:
- Music catalog management (511 songs in ASCAP catalog)
- Royalty calculations and revenue tracking
- Sync licensing opportunities (NBA 2K25, Fast & Furious 11, Nike campaigns)
- Crypto mining operations (Bitcoin, Ethereum, Monero)
- Artist network management (142 profiles, 140 connections)
- Video editing and content creation
- DSP distribution and analytics

You have voice capabilities and can respond conversationally.
Be professional, helpful, and energetic. You represent the GOAT brand.

Available voice profiles:
- Waka Flocka: Energetic, motivational, street-smart
- MoneyPenny: Professional, organized assistant
- Codex: Technical, precise, AI-focused
- GOAT: The ultimate AI assistant for creators`;
  }

  /**
   * Check if Ollama is available
   */
  async checkOllama() {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`, { timeout: 2000 });
      if (response.data && response.data.models) {
        console.log(`   Available models: ${response.data.models.map(m => m.name).join(', ')}`);
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }

  /**
   * Check if service is available
   */
  isAvailable() {
    return this.isConfigured;
  }

  /**
   * Set the model to use
   */
  setModel(modelName) {
    this.defaultModel = modelName;
    console.log(`🔄 Switched to model: ${modelName}`);
  }

  /**
   * Get available models
   */
  async getModels() {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`);
      return response.data.models || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Send a chat message and get AI response
   */
  async chat(message, context = {}) {
    if (!this.isConfigured) {
      // Try to reconnect
      const available = await this.checkOllama();
      if (!available) {
        return {
          success: false,
          message: 'AI service is not available. Make sure Ollama is running (ollama serve)',
          fallback: true
        };
      }
      this.isConfigured = true;
    }

    try {
      const model = context.model || this.defaultModel;
      
      const response = await axios.post(`${this.ollamaUrl}/api/chat`, {
        model: model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: message }
        ],
        stream: false
      }, {
        timeout: 60000 // 60 second timeout for large models
      });

      const assistantMessage = response.data.message?.content || 'I apologize, I could not generate a response.';

      return {
        success: true,
        message: assistantMessage,
        model: model
      };
    } catch (error) {
      console.error('Chat error:', error.message);
      return {
        success: false,
        message: 'Error communicating with local AI service',
        error: error.message
      };
    }
  }

  /**
   * Chat with streaming (for real-time responses)
   */
  async chatStream(message, onChunk, context = {}) {
    if (!this.isConfigured) {
      const available = await this.checkOllama();
      if (!available) {
        onChunk('AI service is not available.');
        return { success: false };
      }
      this.isConfigured = true;
    }

    try {
      const model = context.model || this.defaultModel;
      
      const response = await axios.post(`${this.ollamaUrl}/api/chat`, {
        model: model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: message }
        ],
        stream: true
      }, {
        responseType: 'stream',
        timeout: 120000
      });

      return new Promise((resolve, reject) => {
        let fullResponse = '';
        
        response.data.on('data', (chunk) => {
          const lines = chunk.toString().split('\n').filter(line => line.trim());
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.message?.content) {
                fullResponse += parsed.message.content;
                onChunk(parsed.message.content);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        });

        response.data.on('end', () => {
          resolve({ success: true, message: fullResponse, model });
        });

        response.data.on('error', (err) => {
          reject(err);
        });
      });
    } catch (error) {
      onChunk('Error communicating with AI service.');
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate voice response (for voice-to-voice)
   */
  async generateVoiceResponse(message, voiceProfile = 'goat') {
    const profilePrompts = {
      waka: 'Respond like Waka Flocka Flame - energetic, motivational, using slang and hip-hop style.',
      moneypenny: 'Respond like a professional British assistant - polite, efficient, helpful.',
      codex: 'Respond like a technical AI - precise, analytical, using technical terminology.',
      goat: 'Respond as the GOAT AI assistant - helpful, professional, with GOAT brand energy.'
    };

    const profilePrompt = profilePrompts[voiceProfile] || profilePrompts.goat;
    
    return this.chat(`${profilePrompt}\n\nUser message: ${message}`);
  }
}

module.exports = ChatService;
