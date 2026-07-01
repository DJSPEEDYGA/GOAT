# 🚀 AI Integration - Quick Start Guide

## Setup in 5 Minutes

### Step 1: Add API Keys (1 minute)

Create or update `.env.local` in your project root:

```bash
# NVIDIA API Key
NVIDIA_API_KEY=your_nvidia_api_key_here

# Google AI Studio API Key
GOOGLE_AI_KEY=your_google_ai_key_here
```

**Where to get keys:**
- **NVIDIA**: https://developer.nvidia.com/ → API Keys
- **Google AI**: https://aistudio.google.com/ → API Keys

### Step 2: Start the App (1 minute)

```bash
cd /workspace/GOAT-Royalty-App2
npm run dev
```

The app will start on `http://localhost:3000`

### Step 3: Access AI Command Center (1 minute)

Navigate to: `http://localhost:3000/ai-command-center`

You'll see the AI Command Center dashboard with:
- 🎯 NVIDIA LLMs status
- 🤖 GOAT Force LLM status
- 🎵 Music Industry AI features

### Step 4: Test AI Features (2 minutes)

#### Test 1: Initialize AI Systems
Click any tab in the AI Command Center - it auto-initializes!

#### Test 2: Use NVIDIA LLMs
1. Go to "🎯 NVIDIA LLMs" tab
2. Click "Load Available Models"
3. Select a model from the list
4. See model details and capabilities

#### Test 3: Use Music AI Features
1. Go to "🎵 Music AI" tab
2. Click any of the feature buttons:
   - 💰 Analyze Royalties
   - 📄 Analyze Contract
   - 📈 Predict Trends
   - 🌟 Get Guidance

#### Test 4: Execute Autonomous Task
1. Go to "🤖 Autonomous" tab
2. Enter a task like: "Analyze my catalog revenue"
3. Click "🚀 Execute Autonomous Task"
4. Watch AI process and provide results

## Testing Without API Keys

You can test the UI without API keys:

```javascript
// Test API endpoint structure
curl -X POST http://localhost:3000/api/ai/goat-force \
  -H "Content-Type: application/json" \
  -d '{"action":"initialize"}'
```

Response will show capabilities even without keys:
```json
{
  "success": true,
  "capabilities": {
    "nvidiaModels": 215,
    "googleAITools": 350,
    "autonomousAgents": true,
    "musicIndustryAI": true
  }
}
```

## Common Issues & Solutions

### Issue: "API key not found"
**Solution**: Add API keys to `.env.local` and restart the app

### Issue: "Failed to initialize AI"
**Solution**: 
- Check API keys are correct
- Verify network connection
- Check server logs

### Issue: "Models not loading"
**Solution**: 
- Ensure NVIDIA API key is valid
- Check API rate limits
- Try again after a few seconds

## API Testing with curl

### Test NVIDIA LLM
```bash
curl -X POST http://localhost:3000/api/ai/nvidia-llm \
  -H "Content-Type: application/json" \
  -d '{
    "action": "selectBestModel",
    "task": "Generate music royalty report"
  }'
```

### Test GOAT Force LLM
```bash
curl -X POST http://localhost:3000/api/ai/goat-force \
  -H "Content-Type: application/json" \
  -d '{
    "action": "executeAutonomousTask",
    "task": "Analyze catalog performance",
    "context": {"artistId": "test"}
  }'
```

### Test Music AI - Royalty Optimization
```bash
curl -X POST http://localhost:3000/api/ai/goat-force \
  -H "Content-Type: application/json" \
  -d '{
    "action": "optimizeRoyalties",
    "context": {
      "artistId": "demo",
      "catalogData": {}
    }
  }'
```

### Test Music AI - Contract Analysis
```bash
curl -X POST http://localhost:3000/api/ai/goat-force \
  -H "Content-Type: application/json" \
  -d '{
    "action": "analyzeContract",
    "context": {
      "contractText": "Sample contract terms..."
    }
  }'
```

## Verify Installation

Check these files exist:

```bash
# AI System Files
ls -l lib/NVIDIA_LLM_INTEGRATION_SYSTEM.js
ls -l lib/GOAT_FORCE_LLM_COMPLETE.js

# API Routes
ls -l pages/api/ai/nvidia-llm.js
ls -l pages/api/ai/goat-force.js

# UI Components
ls -l components/AICommandCenter.js
ls -l components/AINavigation.js

# Pages
ls -l pages/ai-command-center.js
```

## Next Steps

After testing locally:

1. **Add Real API Keys**: Get actual NVIDIA and Google AI keys
2. **Test All Features**: Try each AI feature
3. **Deploy to Server**: Push to production server
4. **Monitor Performance**: Track AI usage and metrics
5. **Provide Feedback**: Help improve the AI systems

## Production Deployment

Before deploying to production:

1. ✅ Add real API keys to server environment
2. ✅ Test all API endpoints
3. ✅ Verify CORS configuration
4. ✅ Set up rate limiting
5. ✅ Enable error logging
6. ✅ Configure monitoring

## Need Help?

- 📖 Read: `SUPER_GOAT_AI_INTEGRATION_COMPLETE.md`
- 📋 Check: `todo.md` for progress
- 🔧 Review: Server logs for errors
- 💬 Contact: Development team

---

**You're ready to GOAT!** 🎮🚀

Start the app and visit the AI Command Center to begin!