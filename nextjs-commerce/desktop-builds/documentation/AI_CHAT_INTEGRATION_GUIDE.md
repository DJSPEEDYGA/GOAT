# 🤖 AI Chat Integration Guide

## Overview

The GOAT Royalty App now includes a powerful AI chat assistant powered by OpenAI's GPT-4o. This assistant can help users with royalty calculations, payment processing, artist management, and general platform support.

---

## 🌟 Features

### 1. **General Chat Assistant**
- Answer questions about the platform
- Provide guidance on features
- Help with navigation
- General support queries

### 2. **Context-Aware Chat**
- **Royalty Context** - Chat with specific royalty data
- **Artist Context** - Chat with artist information
- **Payment Context** - Get payment optimization suggestions

### 3. **Specialized Analysis**
- **Trend Analysis** - Analyze royalty trends
- **Contract Analysis** - Review contract terms
- **Payment Suggestions** - Optimize payment schedules

### 4. **Real-Time Streaming**
- Stream responses in real-time
- Better user experience
- Faster perceived response time

---

## 🔧 Setup

### 1. **OpenAI API Key**

You have three API keys available:
- `KEYS FOR WORKSTATION` - For workstation use
- `KEYS FOR STATIONS` - For desktop stations
- `GOATROYALTYAPP` - **Recommended for production**

Add to your `.env` file:
```bash
OPENAI_API_KEY=sk-proj-...wxcA
```

### 2. **Backend Configuration**

The chat service is already integrated:
- Service: `src/services/chatService.js`
- Routes: `src/routes/chat.js`
- Registered in: `src/server.js`

### 3. **Frontend Component**

Use the `AIChat` component:
```tsx
import AIChat from '@/components/AIChat';

// General chat
<AIChat />

// Chat with royalty context
<AIChat context="royalty" contextData={royaltyData} />

// Chat with artist context
<AIChat context="artist" contextData={artistData} />

// Chat with payment context
<AIChat context="payment" contextData={paymentData} />
```

---

## 📡 API Endpoints

### 1. **General Chat**
```http
POST /api/chat
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "message": "How do I calculate royalties?",
  "conversationHistory": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "reply": "AI response here...",
  "usage": {
    "promptTokens": 150,
    "completionTokens": 200,
    "totalTokens": 350
  }
}
```

### 2. **Stream Chat (Real-time)**
```http
POST /api/chat/stream
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "message": "Explain payment processing",
  "conversationHistory": []
}
```

**Response:** Server-Sent Events (SSE)
```
data: {"content":"Payment"}
data: {"content":" processing"}
data: {"content":" involves..."}
data: [DONE]
```

### 3. **Chat with Royalty Context**
```http
POST /api/chat/royalty-context
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "message": "What's the trend for this artist?",
  "royaltyData": {
    "artistId": "123",
    "totalEarnings": 50000,
    "monthlyData": [...]
  }
}
```

### 4. **Chat with Artist Context**
```http
POST /api/chat/artist-context
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "message": "How is this artist performing?",
  "artistData": {
    "name": "Artist Name",
    "totalRoyalties": 100000,
    "activeContracts": 5
  }
}
```

### 5. **Payment Suggestions**
```http
POST /api/chat/payment-suggestions
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "paymentData": {
    "pendingPayments": 10,
    "totalAmount": 25000,
    "artists": [...]
  }
}
```

### 6. **Analyze Trends**
```http
POST /api/chat/analyze-trends
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "royaltyData": {
    "monthly": [...],
    "yearly": [...],
    "platforms": [...]
  }
}
```

### 7. **Analyze Contract**
```http
POST /api/chat/analyze-contract
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "contractText": "Full contract text here..."
}
```

---

## 💡 Usage Examples

### Example 1: General Questions
```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: 'How do I add a new artist?',
    conversationHistory: []
  })
});

const data = await response.json();
console.log(data.reply);
```

### Example 2: Royalty Analysis
```javascript
const response = await fetch('/api/chat/royalty-context', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: 'What insights can you provide about these royalties?',
    royaltyData: {
      artistId: '123',
      monthlyEarnings: [5000, 6000, 7500, 8000],
      platforms: ['Spotify', 'Apple Music', 'YouTube']
    }
  })
});

const data = await response.json();
console.log(data.reply);
```

### Example 3: Contract Analysis
```javascript
const contractText = `
  This agreement is made between...
  [Full contract text]
`;

const response = await fetch('/api/chat/analyze-contract', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    contractText
  })
});

const data = await response.json();
console.log(data.reply);
```

### Example 4: Real-time Streaming
```javascript
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: 'Explain the payment process in detail',
    conversationHistory: []
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') break;
      
      const parsed = JSON.parse(data);
      console.log(parsed.content); // Stream content
    }
  }
}
```

---

## 🎨 React Component Usage

### Basic Chat
```tsx
import AIChat from '@/components/AIChat';

export default function SupportPage() {
  return (
    <div className="h-screen p-4">
      <AIChat />
    </div>
  );
}
```

### Chat with Context
```tsx
import AIChat from '@/components/AIChat';
import { useRoyalty } from '@/hooks/useRoyalty';

export default function RoyaltyDetailsPage({ royaltyId }) {
  const { royalty } = useRoyalty(royaltyId);
  
  return (
    <div className="grid grid-cols-2 gap-4 h-screen p-4">
      <div>
        {/* Royalty details */}
      </div>
      <div>
        <AIChat 
          context="royalty" 
          contextData={royalty}
        />
      </div>
    </div>
  );
}
```

---

## 🔒 Security

### Authentication
All chat endpoints require JWT authentication:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Rate Limiting
- Standard rate limits apply (100 requests per 15 minutes)
- Streaming endpoints have separate limits
- Monitor usage on OpenAI dashboard

### Data Privacy
- Conversation history is not stored by default
- Implement conversation storage if needed
- Be mindful of sensitive data in context

---

## 💰 Cost Management

### Token Usage
- Each request returns token usage statistics
- Monitor costs on OpenAI dashboard
- Implement usage limits if needed

### Optimization Tips
1. **Limit Conversation History**
   - Only send last 5-10 messages
   - Reduces token usage

2. **Use Context Wisely**
   - Only include relevant data
   - Summarize large datasets

3. **Set Max Tokens**
   - Default: 1000 tokens
   - Adjust based on needs

4. **Cache Common Responses**
   - Cache FAQ responses
   - Reduce API calls

---

## 🧪 Testing

### Test General Chat
```bash
curl -X POST http://localhost:5001/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "How do I calculate royalties?",
    "conversationHistory": []
  }'
```

### Test with Context
```bash
curl -X POST http://localhost:5001/api/chat/royalty-context \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Analyze this data",
    "royaltyData": {
      "artistId": "123",
      "totalEarnings": 50000
    }
  }'
```

---

## 📊 Monitoring

### Track Usage
```javascript
// Log token usage
console.log('Tokens used:', data.usage.totalTokens);

// Track costs (approximate)
const costPer1kTokens = 0.03; // GPT-4o pricing
const cost = (data.usage.totalTokens / 1000) * costPer1kTokens;
console.log('Estimated cost:', cost);
```

### Error Handling
```javascript
try {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message, conversationHistory })
  });

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error);
  }
  
  return data.reply;
} catch (error) {
  console.error('Chat error:', error);
  // Handle error appropriately
}
```

---

## 🎯 Best Practices

1. **Clear System Prompts**
   - Customize system prompt for your use case
   - Be specific about capabilities

2. **Conversation Management**
   - Limit history to recent messages
   - Clear old conversations

3. **Error Handling**
   - Implement retry logic
   - Provide fallback responses

4. **User Experience**
   - Show loading states
   - Stream responses when possible
   - Provide typing indicators

5. **Cost Optimization**
   - Monitor token usage
   - Cache common responses
   - Use appropriate models

---

## 🚀 Advanced Features

### Custom System Prompts
```javascript
// In chatService.js
this.systemPrompt = `You are a specialized AI assistant for...`;
```

### Function Calling
```javascript
// Add function calling for structured outputs
const response = await this.client.chat.completions.create({
  model: 'gpt-4o',
  messages: messages,
  functions: [
    {
      name: 'calculate_royalty',
      description: 'Calculate royalty amount',
      parameters: {
        type: 'object',
        properties: {
          streams: { type: 'number' },
          rate: { type: 'number' }
        }
      }
    }
  ]
});
```

### Embeddings for Search
```javascript
// Use embeddings for semantic search
const embedding = await this.client.embeddings.create({
  model: 'text-embedding-ada-002',
  input: 'Search query'
});
```

---

## 📚 Resources

- **OpenAI API Docs:** https://platform.openai.com/docs
- **GPT-4o Model:** https://platform.openai.com/docs/models/gpt-4o
- **Pricing:** https://openai.com/pricing
- **Best Practices:** https://platform.openai.com/docs/guides/production-best-practices

---

## 🆘 Troubleshooting

### Issue: "Invalid API Key"
**Solution:** Verify API key in `.env` file

### Issue: "Rate Limit Exceeded"
**Solution:** Implement exponential backoff, reduce request frequency

### Issue: "Context Length Exceeded"
**Solution:** Reduce conversation history, summarize context data

### Issue: "Slow Responses"
**Solution:** Use streaming endpoint, optimize context size

---

**Status:** Production Ready ✅  
**Model:** GPT-4o  
**Last Updated:** December 2, 2024  

**© 2024 GOAT Royalty App - All Rights Reserved**