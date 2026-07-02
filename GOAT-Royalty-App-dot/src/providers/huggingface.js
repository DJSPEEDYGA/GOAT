// ============================================================
// Hugging Face Inference Providers Integration
// Super GOAT Royalty 3.0 - Harvey Miller (DJ Speedy)
// ============================================================

// Hugging Face Inference API + Serverless Providers
const HF_INFERENCE_BASE = 'https://api-inference.huggingface.co';
const HF_ROUTER_BASE = 'https://router.huggingface.co';

// Major HF Inference Providers with their endpoints
const HF_PROVIDERS = {
  'hf-inference': {
    name: 'HF Inference API',
    icon: '🤗',
    color: '#FFD21E',
    baseUrl: HF_INFERENCE_BASE,
    description: 'Hugging Face native serverless inference',
    models: [
      { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B', params: '70B' },
      { id: 'meta-llama/Llama-3.1-8B-Instruct', name: 'Llama 3.1 8B', params: '8B' },
      { id: 'mistralai/Mistral-7B-Instruct-v0.3', name: 'Mistral 7B v0.3', params: '7B' },
      { id: 'microsoft/Phi-3-mini-4k-instruct', name: 'Phi 3 Mini', params: '3.8B' },
      { id: 'google/gemma-2-9b-it', name: 'Gemma 2 9B', params: '9B' },
      { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B', params: '72B' },
      { id: 'HuggingFaceH4/zephyr-7b-beta', name: 'Zephyr 7B', params: '7B' },
      { id: 'tiiuae/falcon-7b-instruct', name: 'Falcon 7B', params: '7B' }
    ]
  },
  'groq': {
    name: 'Groq',
    icon: '⚡',
    color: '#F55036',
    baseUrl: 'https://api.groq.com/openai/v1',
    description: 'Ultra-fast LPU inference',
    keyName: 'groqKey',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', params: '70B' },
      { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B', params: '70B' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', params: '8B' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', params: '8x7B' },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', params: '9B' },
      { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill 70B', params: '70B' },
      { id: 'qwen-qwq-32b', name: 'QwQ 32B', params: '32B' }
    ]
  },
  'cerebras': {
    name: 'Cerebras',
    icon: '🧠',
    color: '#FF6B00',
    baseUrl: 'https://api.cerebras.ai/v1',
    description: 'Wafer-scale engine, fastest inference',
    keyName: 'cerebrasKey',
    models: [
      { id: 'llama3.3-70b', name: 'Llama 3.3 70B', params: '70B' },
      { id: 'llama3.1-8b', name: 'Llama 3.1 8B', params: '8B' },
      { id: 'llama3.1-70b', name: 'Llama 3.1 70B', params: '70B' },
      { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 70B', params: '70B' },
      { id: 'qwen-2.5-32b', name: 'Qwen 2.5 32B', params: '32B' }
    ]
  },
  'sambanova': {
    name: 'SambaNova',
    icon: '🔷',
    color: '#6C5CE7',
    baseUrl: 'https://api.sambanova.ai/v1',
    description: 'RDU-powered, high throughput inference',
    keyName: 'sambanovaKey',
    models: [
      { id: 'Meta-Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B', params: '70B' },
      { id: 'Meta-Llama-3.1-405B-Instruct', name: 'Llama 3.1 405B', params: '405B' },
      { id: 'Meta-Llama-3.1-70B-Instruct', name: 'Llama 3.1 70B', params: '70B' },
      { id: 'Meta-Llama-3.1-8B-Instruct', name: 'Llama 3.1 8B', params: '8B' },
      { id: 'DeepSeek-R1', name: 'DeepSeek R1', params: '671B' },
      { id: 'DeepSeek-R1-Distill-Llama-70B', name: 'DeepSeek R1 Distill 70B', params: '70B' },
      { id: 'Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B', params: '72B' },
      { id: 'QwQ-32B', name: 'QwQ 32B Reasoning', params: '32B' }
    ]
  },
  'together': {
    name: 'Together AI',
    icon: '🤝',
    color: '#0EA5E9',
    baseUrl: 'https://api.together.xyz/v1',
    description: 'Open-source model cloud',
    keyName: 'togetherKey',
    models: [
      { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', name: 'Llama 3.3 70B Turbo', params: '70B' },
      { id: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo', name: 'Llama 3.1 405B Turbo', params: '405B' },
      { id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', name: 'Llama 3.1 70B Turbo', params: '70B' },
      { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1', params: '671B' },
      { id: 'Qwen/Qwen2.5-72B-Instruct-Turbo', name: 'Qwen 2.5 72B Turbo', params: '72B' },
      { id: 'Qwen/QwQ-32B-Preview', name: 'QwQ 32B Preview', params: '32B' },
      { id: 'mistralai/Mixtral-8x22B-Instruct-v0.1', name: 'Mixtral 8x22B', params: '8x22B' },
      { id: 'mistralai/Mistral-7B-Instruct-v0.3', name: 'Mistral 7B v0.3', params: '7B' },
      { id: 'databricks/dbrx-instruct', name: 'DBRX', params: '132B' },
      { id: 'NousResearch/Hermes-3-Llama-3.1-405B-Turbo', name: 'Hermes 3 405B', params: '405B' },
      { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Qwen Coder 32B', params: '32B' }
    ]
  },
  'fireworks': {
    name: 'Fireworks AI',
    icon: '🎆',
    color: '#FF4500',
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    description: 'Optimized model serving',
    keyName: 'fireworksKey',
    models: [
      { id: 'accounts/fireworks/models/llama-v3p3-70b-instruct', name: 'Llama 3.3 70B', params: '70B' },
      { id: 'accounts/fireworks/models/llama-v3p1-405b-instruct', name: 'Llama 3.1 405B', params: '405B' },
      { id: 'accounts/fireworks/models/deepseek-r1', name: 'DeepSeek R1', params: '671B' },
      { id: 'accounts/fireworks/models/qwen2p5-72b-instruct', name: 'Qwen 2.5 72B', params: '72B' },
      { id: 'accounts/fireworks/models/mixtral-8x22b-instruct', name: 'Mixtral 8x22B', params: '8x22B' }
    ]
  },
  'novita': {
    name: 'Novita AI',
    icon: '✨',
    color: '#A855F7',
    baseUrl: 'https://api.novita.ai/v3/openai',
    description: 'Affordable model inference',
    keyName: 'novitaKey',
    models: [
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', params: '70B' },
      { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', params: '671B' },
      { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', params: '72B' }
    ]
  },
  'hyperbolic': {
    name: 'Hyperbolic',
    icon: '🌀',
    color: '#00C2FF',
    baseUrl: 'https://api.hyperbolic.xyz/v1',
    description: 'Decentralized AI inference',
    keyName: 'hyperbolicKey',
    models: [
      { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B', params: '70B' },
      { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1', params: '671B' },
      { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B', params: '72B' },
      { id: 'Qwen/QwQ-32B-Preview', name: 'QwQ 32B', params: '32B' }
    ]
  }
};

/**
 * Call any HF-compatible provider using OpenAI-compatible API
 */
async function callHFProvider(providerKey, modelId, messages, apiKey, options = {}) {
  const provider = HF_PROVIDERS[providerKey];
  if (!provider) throw new Error(`Unknown provider: ${providerKey}`);
  if (!apiKey) throw new Error(`${provider.name} API key not configured`);

  const systemPrompt = options.systemPrompt || getHFSystemPrompt();
  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  const body = {
    model: modelId,
    messages: apiMessages,
    max_tokens: options.maxTokens || 4096,
    temperature: options.temperature ?? 0.7,
    top_p: options.topP ?? 0.95,
    stream: false
  };

  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || error.detail || `${provider.name} error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: modelId,
    provider: providerKey,
    usage: data.usage,
    finishReason: data.choices[0].finish_reason
  };
}

/**
 * Call Hugging Face Inference API directly (for non-chat models)
 */
async function callHFInference(modelId, inputs, apiKey, options = {}) {
  if (!apiKey) throw new Error('Hugging Face API key not configured');

  const response = await fetch(`${HF_INFERENCE_BASE}/models/${modelId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      inputs: inputs,
      parameters: options.parameters || {},
      options: { wait_for_model: true }
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HF Inference error: ${response.status}`);
  }

  return await response.json();
}

function getHFSystemPrompt() {
  return `You are SuperNinja AI (GOAT Royalty Edition v3.0), an autonomous AI desktop assistant built for Harvey Miller (DJ Speedy) and the GOAT Royalty App ecosystem.

You are powered by a network of 215+ AI models across NVIDIA NIM, Hugging Face, and multiple inference providers. Be concise, helpful, and proactive. Format responses with Markdown.`;
}

/**
 * Get total model count across all providers
 */
function getTotalHFModelCount() {
  let count = 0;
  for (const provider of Object.values(HF_PROVIDERS)) {
    count += provider.models.length;
  }
  return count;
}

/**
 * Get all provider models flattened with provider info
 */
function getAllProviderModels() {
  const all = [];
  for (const [key, provider] of Object.entries(HF_PROVIDERS)) {
    for (const model of provider.models) {
      all.push({
        ...model,
        providerKey: key,
        providerName: provider.name,
        providerIcon: provider.icon,
        providerColor: provider.color
      });
    }
  }
  return all;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    HF_PROVIDERS,
    callHFProvider,
    callHFInference,
    getTotalHFModelCount,
    getAllProviderModels,
    getHFSystemPrompt
  };
}