/**
 * Chat Service Integration for GOAT Royalty App
 * 
 * This module provides a drop-in replacement/enhancement for the existing
 * chatService.js that leverages the Super LLM system.
 */

const SuperLLM = require('../core/SuperLLM');
const GOATIntegration = require('./GOATIntegration');

class ChatServiceIntegration {
  constructor(config = {}) {
    this.superLLM = new GOATIntegration({
      apiKey: config.apiKey || process.env.NVIDIA_BUILD_API_KEY,
      defaultModel: config.defaultModel || 'auto',
      ...config
    });
    
    // Conversation memory
    this.conversations = new Map();
    
    // User preferences
    this.userPreferences = new Map();
    
    // Rate limiting
    this.rateLimits = new Map();
    this.rateLimitConfig = {
      windowMs: 60000,    // 1 minute
      maxRequests: 60     // 60 requests per minute
    };
  }
  
  /**
   * Send a chat message and get AI response
   */
  async sendMessage(userId, message, options = {}) {
    // Check rate limit
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded. Please wait before sending more messages.');
    }
    
    // Get or create conversation
    const conversationId = options.conversationId || `conv_${userId}`;
    const conversation = this.getConversation(conversationId);
    
    // Add user message to history
    conversation.history.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });
    
    // Determine intent and route accordingly
    const intent = await this.detectIntent(message);
    
    try {
      let response;
      
      // Route based on intent
      switch (intent.type) {
        case 'royalty_analysis':
          response = await this.handleRoyaltyAnalysis(message, conversation, intent, options);
          break;
          
        case 'contract_query':
          response = await this.handleContractQuery(message, conversation, intent, options);
          break;
          
        case 'payment_request':
          response = await this.handlePaymentRequest(message, conversation, intent, options);
          break;
          
        case 'report_request':
          response = await this.handleReportRequest(message, conversation, intent, options);
          break;
          
        case 'artist_info':
          response = await this.handleArtistInfo(message, conversation, intent, options);
          break;
          
        case 'general':
        default:
          response = await this.handleGeneralQuery(message, conversation, options);
      }
      
      // Add assistant response to history
      conversation.history.push({
        role: 'assistant',
        content: response.content,
        model: response.model,
        timestamp: new Date().toISOString()
      });
      
      // Trim history if needed
      if (conversation.history.length > 50) {
        conversation.history = conversation.history.slice(-50);
      }
      
      return {
        success: true,
        response: response.content,
        model: response.model,
        conversationId,
        intent: intent.type
      };
      
    } catch (error) {
      // Add error to history
      conversation.history.push({
        role: 'system',
        content: `Error: ${error.message}`,
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }
  
  /**
   * Detect user intent from message
   */
  async detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    // Intent patterns
    const patterns = {
      royalty_analysis: [
        /analyze.*royalt/i,
        /royalty.*report/i,
        /show.*earnings/i,
        /how much.*made/i,
        /revenue.*breakdown/i,
        /stream.*count/i,
        /payment.*history/i
      ],
      contract_query: [
        /contract/i,
        /agreement/i,
        /terms/i,
        /legal/i,
        /clause/i,
        /obligation/i,
        /royalty.*rate/i
      ],
      payment_request: [
        /process.*payment/i,
        /send.*payment/i,
        /pay.*artist/i,
        /wire.*transfer/i,
        /payment.*method/i
      ],
      report_request: [
        /generate.*report/i,
        /create.*report/i,
        /export.*statement/i,
        /summary.*report/i,
        /monthly.*report/i,
        /quarterly.*report/i
      ],
      artist_info: [
        /artist.*info/i,
        /who.*is/i,
        /artist.*details/i,
        /contact.*artist/i,
        /artist.*statement/i
      ]
    };
    
    for (const [type, typePatterns] of Object.entries(patterns)) {
      for (const pattern of typePatterns) {
        if (pattern.test(lowerMessage)) {
          return {
            type,
            confidence: 0.8,
            entities: this.extractEntities(message, type)
          };
        }
      }
    }
    
    return {
      type: 'general',
      confidence: 0.5,
      entities: {}
    };
  }
  
  /**
   * Extract entities from message
   */
  extractEntities(message, intentType) {
    const entities = {};
    
    // Extract dates
    const datePatterns = [
      /(\d{4}-\d{2}-\d{2})/g,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/gi,
      /(last\s+(?:month|quarter|year))/gi,
      /(this\s+(?:month|quarter|year))/gi
    ];
    
    for (const pattern of datePatterns) {
      const matches = message.match(pattern);
      if (matches) {
        entities.dates = matches;
      }
    }
    
    // Extract amounts
    const amountPattern = /\$[\d,]+(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:dollars?|usd)/gi;
    const amountMatches = message.match(amountPattern);
    if (amountMatches) {
      entities.amounts = amountMatches;
    }
    
    // Extract artist names (capitalized words)
    if (intentType === 'artist_info') {
      const namePattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g;
      const nameMatches = message.match(namePattern);
      if (nameMatches) {
        entities.artistNames = nameMatches;
      }
    }
    
    return entities;
  }
  
  /**
   * Handle royalty analysis queries
   */
  async handleRoyaltyAnalysis(message, conversation, intent, options) {
    const prompt = `User Query: ${message}
    
Extracted Entities: ${JSON.stringify(intent.entities)}

Please provide:
1. Analysis of the requested royalty data
2. Key insights and trends
3. Relevant recommendations
4. Any additional context that might be helpful`;

    return await this.superLLM.query(prompt, {
      plugin: 'royalty',
      history: conversation.history.slice(-10),
      model: options.model || 'auto'
    });
  }
  
  /**
   * Handle contract queries
   */
  async handleContractQuery(message, conversation, intent, options) {
    const prompt = `Contract Query: ${message}

Please provide:
1. Interpretation of the contract terms in question
2. Relevant clauses and their implications
3. Potential risks or concerns
4. Recommendations for the user`;

    return await this.superLLM.query(prompt, {
      plugin: 'contracts',
      history: conversation.history.slice(-10),
      model: options.model || 'auto'
    });
  }
  
  /**
   * Handle payment requests
   */
  async handlePaymentRequest(message, conversation, intent, options) {
    const prompt = `Payment Request: ${message}

Extracted Entities: ${JSON.stringify(intent.entities)}

Please:
1. Parse and validate the payment request
2. Extract all relevant payment details
3. Identify any missing information
4. Provide next steps for processing`;

    return await this.superLLM.query(prompt, {
      plugin: 'payments',
      history: conversation.history.slice(-10),
      model: options.model || 'auto'
    });
  }
  
  /**
   * Handle report requests
   */
  async handleReportRequest(message, conversation, intent, options) {
    const prompt = `Report Request: ${message}

Extracted Entities: ${JSON.stringify(intent.entities)}

Please provide:
1. Report structure and format
2. Data points to include
3. Analysis and insights
4. Visualization recommendations`;

    return await this.superLLM.query(prompt, {
      plugin: 'analytics',
      history: conversation.history.slice(-10),
      model: options.model || 'auto'
    });
  }
  
  /**
   * Handle artist information queries
   */
  async handleArtistInfo(message, conversation, intent, options) {
    const prompt = `Artist Information Request: ${message}

Extracted Entities: ${JSON.stringify(intent.entities)}

Please provide:
1. Artist profile information
2. Performance metrics
3. Recent activity
4. Relationship notes`;

    return await this.superLLM.query(prompt, {
      plugin: 'artist',
      history: conversation.history.slice(-10),
      model: options.model || 'auto'
    });
  }
  
  /**
   * Handle general queries
   */
  async handleGeneralQuery(message, conversation, options) {
    return await this.superLLM.query(message, {
      plugin: 'royalty',
      history: conversation.history.slice(-10),
      model: options.model || 'auto'
    });
  }
  
  /**
   * Get or create conversation
   */
  getConversation(conversationId) {
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, {
        id: conversationId,
        history: [],
        context: {},
        createdAt: new Date().toISOString()
      });
    }
    return this.conversations.get(conversationId);
  }
  
  /**
   * Clear conversation history
   */
  clearConversation(conversationId) {
    this.conversations.delete(conversationId);
  }
  
  /**
   * Check rate limit
   */
  checkRateLimit(userId) {
    const now = Date.now();
    const userLimits = this.rateLimits.get(userId) || { count: 0, resetAt: now + this.rateLimitConfig.windowMs };
    
    if (now > userLimits.resetAt) {
      userLimits.count = 0;
      userLimits.resetAt = now + this.rateLimitConfig.windowMs;
    }
    
    if (userLimits.count >= this.rateLimitConfig.maxRequests) {
      return false;
    }
    
    userLimits.count++;
    this.rateLimits.set(userId, userLimits);
    return true;
  }
  
  /**
   * Stream response for real-time output
   */
  async *streamMessage(userId, message, options = {}) {
    const conversationId = options.conversationId || `conv_${userId}`;
    const conversation = this.getConversation(conversationId);
    
    // Add user message
    conversation.history.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });
    
    // Stream from Super LLM
    const intent = await this.detectIntent(message);
    const plugin = this.intentToPlugin(intent.type);
    
    let fullContent = '';
    for await (const chunk of this.superLLM.streamQuery(message, {
      plugin,
      history: conversation.history.slice(-10)
    })) {
      fullContent += chunk.content;
      yield chunk;
    }
    
    // Add complete response to history
    conversation.history.push({
      role: 'assistant',
      content: fullContent,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Map intent to plugin
   */
  intentToPlugin(intentType) {
    const mapping = {
      royalty_analysis: 'royalty',
      contract_query: 'contracts',
      payment_request: 'payments',
      report_request: 'analytics',
      artist_info: 'artist',
      general: 'royalty'
    };
    return mapping[intentType] || 'royalty';
  }
  
  /**
   * Get conversation history
   */
  getHistory(conversationId) {
    const conversation = this.conversations.get(conversationId);
    return conversation ? conversation.history : [];
  }
  
  /**
   * Set user preferences
   */
  setUserPreferences(userId, preferences) {
    this.userPreferences.set(userId, {
      ...this.userPreferences.get(userId),
      ...preferences
    });
  }
  
  /**
   * Get user preferences
   */
  getUserPreferences(userId) {
    return this.userPreferences.get(userId) || {
      defaultModel: 'auto',
      outputFormat: 'text',
      enableNotifications: true
    };
  }
  
  /**
   * Get statistics
   */
  getStats() {
    return {
      conversations: this.conversations.size,
      superLLM: this.superLLM.getStats()
    };
  }
}

module.exports = ChatServiceIntegration;