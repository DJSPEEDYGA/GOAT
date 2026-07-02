/**
 * Chat Service - OpenAI Integration
 * Provides AI chat capabilities for the GOAT Royalty App
 */

const OpenAI = require('openai');

class ChatService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.systemPrompt = `You are an AI assistant integrated into the GOAT Royalty Management System. 
You help users with:
- Royalty calculations and analysis
- Payment processing questions
- Artist management
- Report generation
- Contract analysis
- Revenue forecasting
- Hosting management (via Hostinger API)
- General platform navigation and support

You have access to the platform's data and can provide specific, actionable advice.
Be professional, helpful, and concise in your responses.`;
  }

  /**
   * Send a chat message and get AI response
   */
  async chat(message, conversationHistory = []) {
    try {
      // Build messages array with system prompt and conversation history
      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      });

      const aiReply = response.choices[0].message.content;

      return {
        success: true,
        reply: aiReply,
        usage: {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens
        }
      };
    } catch (error) {
      console.error('Chat Service Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Chat with context about royalties
   */
  async chatWithRoyaltyContext(message, royaltyData) {
    const contextMessage = `User question: ${message}\n\nRelevant royalty data:\n${JSON.stringify(royaltyData, null, 2)}`;
    
    return await this.chat(contextMessage);
  }

  /**
   * Chat with context about artists
   */
  async chatWithArtistContext(message, artistData) {
    const contextMessage = `User question: ${message}\n\nRelevant artist data:\n${JSON.stringify(artistData, null, 2)}`;
    
    return await this.chat(contextMessage);
  }

  /**
   * Get AI suggestions for payment optimization
   */
  async getPaymentSuggestions(paymentData) {
    const message = `Analyze this payment data and provide optimization suggestions:\n${JSON.stringify(paymentData, null, 2)}`;
    
    return await this.chat(message);
  }

  /**
   * Get AI analysis of royalty trends
   */
  async analyzeRoyaltyTrends(royaltyData) {
    const message = `Analyze these royalty trends and provide insights:\n${JSON.stringify(royaltyData, null, 2)}`;
    
    return await this.chat(message);
  }

  /**
   * Get AI help with contract analysis
   */
  async analyzeContract(contractText) {
    const message = `Analyze this contract and highlight key terms, potential issues, and recommendations:\n\n${contractText}`;
    
    return await this.chat(message);
  }

  /**
   * Stream chat response (for real-time UI updates)
   */
  async streamChat(message, conversationHistory = []) {
    try {
      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      const stream = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: true
      });

      return stream;
    } catch (error) {
      console.error('Stream Chat Error:', error);
      throw error;
    }
  }
}

module.exports = ChatService;