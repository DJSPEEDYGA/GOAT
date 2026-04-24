/**
 * Chat API Routes
 * Provides AI chat endpoints for the GOAT Royalty App
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const ChatService = require('../services/chatService');

// Initialize chat service
const chatService = new ChatService();

/**
 * @route   POST /api/chat
 * @desc    Send a message to AI assistant
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const result = await chatService.chat(message, conversationHistory || []);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process chat message',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/chat/stream
 * @desc    Stream AI response in real-time
 * @access  Private
 */
router.post('/stream', authenticate, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Set headers for SSE (Server-Sent Events)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await chatService.streamChat(message, conversationHistory || []);

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Stream chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stream chat response',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/chat/royalty-context
 * @desc    Chat with royalty data context
 * @access  Private
 */
router.post('/royalty-context', authenticate, async (req, res) => {
  try {
    const { message, royaltyData } = req.body;

    if (!message || !royaltyData) {
      return res.status(400).json({
        success: false,
        error: 'Message and royalty data are required'
      });
    }

    const result = await chatService.chatWithRoyaltyContext(message, royaltyData);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Royalty context chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process chat with royalty context',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/chat/artist-context
 * @desc    Chat with artist data context
 * @access  Private
 */
router.post('/artist-context', authenticate, async (req, res) => {
  try {
    const { message, artistData } = req.body;

    if (!message || !artistData) {
      return res.status(400).json({
        success: false,
        error: 'Message and artist data are required'
      });
    }

    const result = await chatService.chatWithArtistContext(message, artistData);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Artist context chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process chat with artist context',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/chat/payment-suggestions
 * @desc    Get AI suggestions for payment optimization
 * @access  Private
 */
router.post('/payment-suggestions', authenticate, async (req, res) => {
  try {
    const { paymentData } = req.body;

    if (!paymentData) {
      return res.status(400).json({
        success: false,
        error: 'Payment data is required'
      });
    }

    const result = await chatService.getPaymentSuggestions(paymentData);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Payment suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment suggestions',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/chat/analyze-trends
 * @desc    Get AI analysis of royalty trends
 * @access  Private
 */
router.post('/analyze-trends', authenticate, async (req, res) => {
  try {
    const { royaltyData } = req.body;

    if (!royaltyData) {
      return res.status(400).json({
        success: false,
        error: 'Royalty data is required'
      });
    }

    const result = await chatService.analyzeRoyaltyTrends(royaltyData);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Trend analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze trends',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/chat/analyze-contract
 * @desc    Get AI analysis of contract
 * @access  Private
 */
router.post('/analyze-contract', authenticate, async (req, res) => {
  try {
    const { contractText } = req.body;

    if (!contractText) {
      return res.status(400).json({
        success: false,
        error: 'Contract text is required'
      });
    }

    const result = await chatService.analyzeContract(contractText);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Contract analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze contract',
      details: error.message
    });
  }
});

module.exports = router;