# SUPER GOAT ROYALTY APP - API INTEGRATION GUIDE
**Version**: 3.0.0

---

## CONFIGURING AI PROVIDERS

### NVIDIA NIM (build.nvidia.com)
**Required**: NVIDIA API Key

**Steps**:
1. Visit build.nvidia.com
2. Create an account or sign in
3. Navigate to API Keys section
4. Generate a new API key (starts with `nvapi-`)
5. In the app: Settings → NVIDIA NIM → Enter API Key

**Models Available**: 80+ models including Llama 3.1, Nemotron, Mixtral, DeepSeek, Gemma, Phi, Qwen, Mistral

**Endpoint**: https://integrate.api.nvidia.com/v1

---

### OpenRouter (openrouter.ai)
**Required**: OpenRouter API Key

**Steps**:
1. Visit openrouter.ai
2. Create an account
3. Navigate to Keys section
4. Generate new key (starts with `sk-or-`)
5. In the app: Settings → OpenRouter → Enter API Key

**Models Available**: 653+ models from all major providers

**Endpoint**: https://openrouter.ai/api/v1

---

### OpenAI
**Required**: OpenAI API Key

**Steps**:
1. Visit platform.openai.com
2. Create an account or sign in
3. Navigate to API Keys section
4. Create new secret key (starts with `sk-`)
5. In the app: Settings → OpenAI → Enter API Key

**Models Available**: GPT-4o, GPT-4 Turbo, o1 Preview, o1 Mini

**Endpoint**: https://api.openai.com/v1

---

### Google AI (Gemini)
**Required**: Google AI API Key

**Steps**:
1. Visit ai.google.dev
2. Create a project in Google Cloud Console
3. Enable Generative Language API
4. Create API key (starts with `AI...`)
5. In the app: Settings → Google AI → Enter API Key

**Models Available**: Gemini 2.0 Flash, Gemini 1.5 Pro, Gemini 1.5 Flash

**Endpoint**: https://generativelanguage.googleapis.com

---

### Anthropic (Claude)
**Required**: Anthropic API Key

**Steps**:
1. Visit console.anthropic.com
2. Create an account
3. Navigate to API Keys section
4. Create new key (starts with `sk-ant-`)
5. In the app: Settings → Anthropic → Enter API Key

**Models Available**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku

**Endpoint**: https://api.anthropic.com

---

## SPEED PROVIDERS

### Groq
**Required**: Groq API Key

**Steps**:
1. Visit console.groq.com
2. Create an account
3. Generate API key (starts with `gsk_`)
4. In the app: Settings → Groq → Enter API Key

**Special Features**: LPU™ Technology for ultra-fast inference

---

### Cerebras
**Required**: Cerebras API Key

**Steps**:
1. Visit cerebras.ai
2. Create an account
3. Generate API key (starts with `csk-`)
4. In the app: Settings → Cerebras → Enter API Key

**Special Features**: Wafer-Scale AI for fastest inference

---

### SambaNova
**Required**: SambaNova API Key

**Steps**:
1. Visit sambanova.ai
2. Create an account
3. Generate API key
4. In the app: Settings → SambaNova → Enter API Key

**Special Features**: RDU Technology for high-speed inference

---

## LOCAL MODELS

### Ollama
**Required**: Ollama installed locally

**Steps**:
1. Visit ollama.ai
2. Download and install Ollama
3. Pull desired models (e.g., `ollama pull llama3`)
4. In the app: Settings → Ollama → Enter URL (default: http://localhost:11434)

**Models Available**: Llama 3, Mistral, CodeLlama, DeepSeek Coder, Phi-3, Gemma 2, Qwen2

**Endpoint**: http://localhost:11434

---

## CONFIGURING GOAT BRAIN

### Orchestration Modes

**Specialist**: Automatically routes queries to the best model
- Best for: General use, unknown query types

**Consensus**: Queries multiple models, finds agreement through voting
- Best for: Critical decisions, fact-checking

**Best of N**: Queries N models, selects best response
- Best for: Creative tasks, content generation

**Chain**: Pipelines responses through sequential models
- Best for: Complex problem-solving, multi-step tasks

**Ensemble**: Merges perspectives from multiple models
- Best for: Comprehensive analysis, research

**Debate**: Models critique each other's responses
- Best for: Critical thinking, argument analysis

**Parallel**: Queries all models simultaneously, returns all
- Best for: Speed-critical tasks, comparison

### Configuration Steps
1. Open Settings
2. Navigate to GOAT Brain Configuration
3. Select Default Mode
4. Set Max Models per Query (3-15)
5. Enable/Disable GOAT Brain toggle

---

## API KEY SECURITY

### Best Practices
1. Never share your API keys
2. Rotate keys regularly
3. Monitor usage in provider dashboards
4. Use separate keys for development and production
5. Set usage limits where possible

### Key Storage
- API keys are stored locally in settings.json
- Encrypted at rest (where supported)
- Never transmitted except to respective APIs

---

## TROUBLESHOOTING

### Connection Issues
1. Verify internet connectivity
2. Check API key validity
3. Verify account status with provider
4. Check API rate limits
5. Review provider service status

### Model Access Issues
1. Verify model is available in your tier
2. Check provider documentation
3. Ensure proper API key permissions
4. Review rate limits

### Performance Issues
1. Try speed providers (Groq, Cerebras)
2. Use smaller models for faster response
3. Enable GOAT Brain in parallel mode
4. Check network latency

---

*API Integration Guide v3.0.0 - March 20, 2025*
