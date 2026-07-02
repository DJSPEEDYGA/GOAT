// ============================================================
// OpenRouter Integration - 653+ Models from All Providers
// Super GOAT Royalty 3.0 - Harvey Miller (DJ Speedy)
// ============================================================

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

// OpenRouter gives access to 653+ models from every major provider
// through a single API key and unified endpoint
const OPENROUTER_FEATURED_MODELS = {
  // ── ANTHROPIC ──────────────────────────────────────────────
  'anthropic/claude-3.5-sonnet': { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', context: 200000, pricing: '$3/$15', description: 'Best overall quality' },
  'anthropic/claude-3-opus': { name: 'Claude 3 Opus', provider: 'Anthropic', context: 200000, pricing: '$15/$75', description: 'Most capable Claude' },
  'anthropic/claude-3-haiku': { name: 'Claude 3 Haiku', provider: 'Anthropic', context: 200000, pricing: '$0.25/$1.25', description: 'Fastest Claude' },
  'anthropic/claude-2.0': { name: 'Claude 2.0', provider: 'Anthropic', context: 100000, pricing: '$8/$24', description: 'Flagship v2 model' },

  // ── OPENAI ─────────────────────────────────────────────────
  'openai/gpt-4o': { name: 'GPT-4o', provider: 'OpenAI', context: 128000, pricing: '$2.50/$10', description: 'OpenAI flagship multimodal' },
  'openai/gpt-4o-mini': { name: 'GPT-4o Mini', provider: 'OpenAI', context: 128000, pricing: '$0.15/$0.60', description: 'Fast and affordable' },
  'openai/gpt-4-turbo': { name: 'GPT-4 Turbo', provider: 'OpenAI', context: 128000, pricing: '$10/$30', description: 'GPT-4 with vision' },
  'openai/o1-preview': { name: 'o1 Preview', provider: 'OpenAI', context: 128000, pricing: '$15/$60', description: 'Advanced reasoning' },
  'openai/o1-mini': { name: 'o1 Mini', provider: 'OpenAI', context: 128000, pricing: '$3/$12', description: 'Fast reasoning' },
  'openai/gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', provider: 'OpenAI', context: 16000, pricing: '$0.50/$1.50', description: 'Fast general purpose' },

  // ── GOOGLE ─────────────────────────────────────────────────
  'google/gemini-2.0-flash-exp': { name: 'Gemini 2.0 Flash', provider: 'Google', context: 1048576, pricing: 'Free', description: '1M context window' },
  'google/gemini-pro-1.5': { name: 'Gemini 1.5 Pro', provider: 'Google', context: 2800000, pricing: '$1.25/$5', description: '2.8M context window' },
  'google/gemma-2-27b-it': { name: 'Gemma 2 27B', provider: 'Google', context: 8192, pricing: '$0.27/$0.27', description: 'Open model from Google' },
  'google/palm-2-chat-bison': { name: 'PaLM 2 Chat', provider: 'Google', context: 9000, pricing: '$0.25/$0.50', description: 'PaLM 2 chat model' },

  // ── META LLAMA ─────────────────────────────────────────────
  'meta-llama/llama-3.3-70b-instruct': { name: 'Llama 3.3 70B', provider: 'Meta', context: 131072, pricing: '$0.10/$0.10', description: 'Best open-source model' },
  'meta-llama/llama-3.1-405b-instruct': { name: 'Llama 3.1 405B', provider: 'Meta', context: 131072, pricing: '$0.80/$0.80', description: 'Largest open model' },
  'meta-llama/llama-3.1-70b-instruct': { name: 'Llama 3.1 70B', provider: 'Meta', context: 131072, pricing: '$0.10/$0.10', description: 'Strong general model' },
  'meta-llama/llama-3.1-8b-instruct': { name: 'Llama 3.1 8B', provider: 'Meta', context: 131072, pricing: '$0.02/$0.02', description: 'Fast efficient model' },
  'meta-llama/llama-3.2-90b-vision-instruct': { name: 'Llama 3.2 90B Vision', provider: 'Meta', context: 131072, pricing: '$0.12/$0.12', description: 'Vision model' },

  // ── MISTRAL ────────────────────────────────────────────────
  'mistralai/mistral-large-2411': { name: 'Mistral Large', provider: 'Mistral AI', context: 131072, pricing: '$2/$6', description: 'Mistral flagship' },
  'mistralai/mistral-medium': { name: 'Mistral Medium', provider: 'Mistral AI', context: 32768, pricing: '$2.70/$8.10', description: 'Medium tier' },
  'mistralai/mixtral-8x22b-instruct': { name: 'Mixtral 8x22B', provider: 'Mistral AI', context: 65536, pricing: '$0.65/$0.65', description: 'Large MoE' },
  'mistralai/mixtral-8x7b-instruct': { name: 'Mixtral 8x7B', provider: 'Mistral AI', context: 32768, pricing: '$0.24/$0.24', description: 'Efficient MoE' },
  'mistralai/codestral-2501': { name: 'Codestral', provider: 'Mistral AI', context: 256000, pricing: '$0.30/$0.90', description: 'Code specialist' },
  'mistralai/pixtral-large-2411': { name: 'Pixtral Large', provider: 'Mistral AI', context: 131072, pricing: '$2/$6', description: 'Vision model' },

  // ── DEEPSEEK ───────────────────────────────────────────────
  'deepseek/deepseek-r1': { name: 'DeepSeek R1', provider: 'DeepSeek', context: 131072, pricing: '$0.55/$2.19', description: 'Chain-of-thought reasoning' },
  'deepseek/deepseek-chat': { name: 'DeepSeek V3', provider: 'DeepSeek', context: 131072, pricing: '$0.14/$0.28', description: 'General chat' },
  'deepseek/deepseek-r1-distill-llama-70b': { name: 'DeepSeek R1 Distill 70B', provider: 'DeepSeek', context: 131072, pricing: '$0.23/$0.69', description: 'Distilled reasoning' },

  // ── QWEN ───────────────────────────────────────────────────
  'qwen/qwen-2.5-72b-instruct': { name: 'Qwen 2.5 72B', provider: 'Alibaba', context: 131072, pricing: '$0.12/$0.12', description: 'Chinese+English flagship' },
  'qwen/qwen-2.5-coder-32b-instruct': { name: 'Qwen 2.5 Coder 32B', provider: 'Alibaba', context: 131072, pricing: '$0.07/$0.07', description: 'Code specialist' },
  'qwen/qwq-32b-preview': { name: 'QwQ 32B', provider: 'Alibaba', context: 131072, pricing: '$0.12/$0.18', description: 'Reasoning model' },

  // ── MICROSOFT ──────────────────────────────────────────────
  'microsoft/phi-3.5-mini-128k-instruct': { name: 'Phi 3.5 Mini', provider: 'Microsoft', context: 131072, pricing: '$0.10/$0.10', description: 'Best small model' },
  'microsoft/wizardlm-2-8x22b': { name: 'WizardLM 2 8x22B', provider: 'Microsoft', context: 65536, pricing: '$0.63/$0.63', description: 'Large instruction model' },

  // ── NVIDIA ─────────────────────────────────────────────────
  'nvidia/llama-3.1-nemotron-70b-instruct': { name: 'Nemotron 70B', provider: 'NVIDIA', context: 32768, pricing: '$0.10/$0.10', description: 'Top benchmark scores' },

  // ── COMMUNITY / FINE-TUNES ─────────────────────────────────
  'nousresearch/hermes-3-llama-3.1-405b': { name: 'Hermes 3 405B', provider: 'Nous Research', context: 131072, pricing: '$0.80/$0.80', description: 'Advanced instruction following' },
  'databricks/dbrx-instruct': { name: 'DBRX', provider: 'Databricks', context: 32768, pricing: '$0.60/$0.60', description: 'Enterprise MoE' },
  'cohere/command-r-plus': { name: 'Command R+', provider: 'Cohere', context: 128000, pricing: '$2.50/$10', description: 'RAG optimized' },
  'cohere/command-r': { name: 'Command R', provider: 'Cohere', context: 128000, pricing: '$0.15/$0.60', description: 'Affordable RAG' },
  'perplexity/llama-3.1-sonar-huge-128k-online': { name: 'Sonar Huge Online', provider: 'Perplexity', context: 127072, pricing: '$5/$5', description: 'Web-connected' },
  'perplexity/llama-3.1-sonar-large-128k-online': { name: 'Sonar Large Online', provider: 'Perplexity', context: 127072, pricing: '$1/$1', description: 'Web search model' }
};

/**
 * Call OpenRouter API (OpenAI-compatible)
 */
async function callOpenRouter(messages, modelId, apiKey, options = {}) {
  if (!apiKey) throw new Error('OpenRouter API key not configured. Get one at openrouter.ai');

  const systemPrompt = options.systemPrompt || getOpenRouterSystemPrompt();
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

  if (options.transforms) body.transforms = options.transforms;
  if (options.route) body.route = options.route;

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://github.com/DJSPEEDYGA/GOAT-Royalty-App.',
      'X-Title': 'Super GOAT Royalty 3.0'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenRouter error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: data.model || modelId,
    provider: 'openrouter',
    usage: data.usage,
    finishReason: data.choices[0].finish_reason
  };
}

/**
 * Fetch live model list from OpenRouter API
 */
async function fetchOpenRouterModels(apiKey) {
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const response = await fetch(`${OPENROUTER_BASE}/models`, { headers });
  if (!response.ok) throw new Error(`Failed to fetch models: ${response.status}`);

  const data = await response.json();
  return data.data || [];
}

/**
 * Get account credits and usage from OpenRouter
 */
async function getOpenRouterCredits(apiKey) {
  if (!apiKey) return null;
  const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  if (!response.ok) return null;
  return await response.json();
}

function getOpenRouterSystemPrompt() {
  return `You are SuperNinja AI (GOAT Royalty Edition v3.0), an autonomous AI desktop assistant built for Harvey Miller (DJ Speedy). You are powered by 653+ AI models via OpenRouter + NVIDIA NIM + Hugging Face. Be concise, helpful, proactive. Format responses with Markdown.`;
}

/**
 * Get models grouped by provider
 */
function getOpenRouterModelsByProvider() {
  const grouped = {};
  for (const [id, model] of Object.entries(OPENROUTER_FEATURED_MODELS)) {
    const provider = model.provider || 'Unknown';
    if (!grouped[provider]) grouped[provider] = [];
    grouped[provider].push({ id, ...model });
  }
  return grouped;
}

/**
 * Search OpenRouter models
 */
function searchOpenRouterModels(query) {
  const q = query.toLowerCase();
  return Object.entries(OPENROUTER_FEATURED_MODELS)
    .filter(([id, m]) =>
      id.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.provider.toLowerCase().includes(q) ||
      (m.description && m.description.toLowerCase().includes(q))
    )
    .map(([id, m]) => ({ id, ...m }));
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    OPENROUTER_BASE,
    OPENROUTER_FEATURED_MODELS,
    callOpenRouter,
    fetchOpenRouterModels,
    getOpenRouterCredits,
    getOpenRouterModelsByProvider,
    searchOpenRouterModels,
    getOpenRouterSystemPrompt
  };
}