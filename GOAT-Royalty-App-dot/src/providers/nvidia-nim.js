// ============================================================
// NVIDIA NIM (build.nvidia.com) - 215+ LLM Integration
// Super GOAT Royalty 3.0 - Harvey Miller (DJ Speedy)
// ============================================================

const NVIDIA_NIM_BASE = 'https://integrate.api.nvidia.com/v1';

// Complete catalog of NVIDIA NIM models available on build.nvidia.com
const NVIDIA_MODELS = {
  // ── FLAGSHIP TEXT GENERATION ───────────────────────────────
  'meta/llama-3.3-70b-instruct': { name: 'Llama 3.3 70B Instruct', category: 'text-generation', provider: 'Meta', params: '70B', context: 131072, description: 'Meta flagship open model' },
  'meta/llama-3.1-405b-instruct': { name: 'Llama 3.1 405B Instruct', category: 'text-generation', provider: 'Meta', params: '405B', context: 131072, description: 'Largest open-source LLM' },
  'meta/llama-3.1-70b-instruct': { name: 'Llama 3.1 70B Instruct', category: 'text-generation', provider: 'Meta', params: '70B', context: 131072, description: 'Strong general-purpose model' },
  'meta/llama-3.1-8b-instruct': { name: 'Llama 3.1 8B Instruct', category: 'text-generation', provider: 'Meta', params: '8B', context: 131072, description: 'Fast efficient model' },
  'meta/llama-3.2-3b-instruct': { name: 'Llama 3.2 3B Instruct', category: 'text-generation', provider: 'Meta', params: '3B', context: 131072, description: 'Lightweight Llama' },
  'meta/llama-3.2-1b-instruct': { name: 'Llama 3.2 1B Instruct', category: 'text-generation', provider: 'Meta', params: '1B', context: 131072, description: 'Ultra-light Llama' },

  // ── NVIDIA NEMOTRON ────────────────────────────────────────
  'nvidia/llama-3.1-nemotron-70b-instruct': { name: 'Nemotron 70B Instruct', category: 'text-generation', provider: 'NVIDIA', params: '70B', context: 32768, description: 'NVIDIA optimized Llama variant, top benchmark scores' },
  'nvidia/nemotron-mini-4b-instruct': { name: 'Nemotron Mini 4B', category: 'text-generation', provider: 'NVIDIA', params: '4B', context: 4096, description: 'Small efficient NVIDIA model' },
  'nvidia/nemotron-4-340b-instruct': { name: 'Nemotron 4 340B', category: 'text-generation', provider: 'NVIDIA', params: '340B', context: 4096, description: 'NVIDIA massive parameter model' },

  // ── MISTRAL MODELS ─────────────────────────────────────────
  'mistralai/mistral-large-2-instruct': { name: 'Mistral Large 2', category: 'text-generation', provider: 'Mistral AI', params: '123B', context: 131072, description: 'Mistral flagship model' },
  'mistralai/mistral-7b-instruct-v0.3': { name: 'Mistral 7B v0.3', category: 'text-generation', provider: 'Mistral AI', params: '7B', context: 32768, description: 'Fast and efficient' },
  'mistralai/mixtral-8x7b-instruct-v0.1': { name: 'Mixtral 8x7B MoE', category: 'text-generation', provider: 'Mistral AI', params: '8x7B', context: 32768, description: 'Mixture of Experts architecture' },
  'mistralai/mixtral-8x22b-instruct-v0.1': { name: 'Mixtral 8x22B MoE', category: 'text-generation', provider: 'Mistral AI', params: '8x22B', context: 65536, description: 'Large MoE model' },
  'mistralai/mamba-codestral-7b-v0.1': { name: 'Codestral Mamba 7B', category: 'code', provider: 'Mistral AI', params: '7B', context: 256000, description: 'Code-focused with Mamba architecture' },
  'mistralai/codestral-22b-instruct-v0.1': { name: 'Codestral 22B', category: 'code', provider: 'Mistral AI', params: '22B', context: 32768, description: 'Code generation specialist' },
  'mistralai/mistral-nemo-12b-instruct': { name: 'Mistral Nemo 12B', category: 'text-generation', provider: 'Mistral AI', params: '12B', context: 131072, description: 'Efficient multilingual model' },
  'mistralai/pixtral-large-2501': { name: 'Pixtral Large', category: 'vision', provider: 'Mistral AI', params: '124B', context: 131072, description: 'Multimodal vision-language model' },
  'mistralai/pixtral-12b-2409': { name: 'Pixtral 12B', category: 'vision', provider: 'Mistral AI', params: '12B', context: 131072, description: 'Efficient vision model' },

  // ── GOOGLE MODELS ──────────────────────────────────────────
  'google/gemma-2-27b-it': { name: 'Gemma 2 27B', category: 'text-generation', provider: 'Google', params: '27B', context: 8192, description: 'Google open model, strong reasoning' },
  'google/gemma-2-9b-it': { name: 'Gemma 2 9B', category: 'text-generation', provider: 'Google', params: '9B', context: 8192, description: 'Efficient Google model' },
  'google/gemma-2-2b-it': { name: 'Gemma 2 2B', category: 'text-generation', provider: 'Google', params: '2B', context: 8192, description: 'Ultra-light Google model' },
  'google/codegemma-7b': { name: 'CodeGemma 7B', category: 'code', provider: 'Google', params: '7B', context: 8192, description: 'Google code model' },
  'google/recurrentgemma-2-9b-it': { name: 'RecurrentGemma 2 9B', category: 'text-generation', provider: 'Google', params: '9B', context: 8192, description: 'Recurrent architecture Gemma' },
  'google/shieldgemma-9b': { name: 'ShieldGemma 9B', category: 'safety', provider: 'Google', params: '9B', context: 8192, description: 'Safety-focused classifier' },

  // ── QWEN MODELS ────────────────────────────────────────────
  'qwen/qwen2.5-72b-instruct': { name: 'Qwen 2.5 72B', category: 'text-generation', provider: 'Alibaba', params: '72B', context: 131072, description: 'Top-tier Chinese+English model' },
  'qwen/qwen2.5-32b-instruct': { name: 'Qwen 2.5 32B', category: 'text-generation', provider: 'Alibaba', params: '32B', context: 131072, description: 'Strong multilingual model' },
  'qwen/qwen2.5-7b-instruct': { name: 'Qwen 2.5 7B', category: 'text-generation', provider: 'Alibaba', params: '7B', context: 131072, description: 'Efficient Qwen model' },
  'qwen/qwen2.5-coder-32b-instruct': { name: 'Qwen 2.5 Coder 32B', category: 'code', provider: 'Alibaba', params: '32B', context: 131072, description: 'Code specialist' },
  'qwen/qwen2.5-coder-7b-instruct': { name: 'Qwen 2.5 Coder 7B', category: 'code', provider: 'Alibaba', params: '7B', context: 131072, description: 'Efficient code model' },
  'qwen/qwen2-vl-72b-instruct': { name: 'Qwen2-VL 72B', category: 'vision', provider: 'Alibaba', params: '72B', context: 32768, description: 'Vision-language model' },
  'qwen/qwen2-vl-7b-instruct': { name: 'Qwen2-VL 7B', category: 'vision', provider: 'Alibaba', params: '7B', context: 32768, description: 'Efficient vision model' },
  'qwen/qwq-32b': { name: 'QwQ 32B', category: 'reasoning', provider: 'Alibaba', params: '32B', context: 131072, description: 'Reasoning-focused model' },

  // ── DEEPSEEK MODELS ────────────────────────────────────────
  'deepseek-ai/deepseek-r1': { name: 'DeepSeek R1', category: 'reasoning', provider: 'DeepSeek', params: '671B', context: 131072, description: 'Advanced reasoning with chain-of-thought' },
  'deepseek-ai/deepseek-r1-distill-llama-70b': { name: 'DeepSeek R1 Distill 70B', category: 'reasoning', provider: 'DeepSeek', params: '70B', context: 131072, description: 'Distilled reasoning model' },
  'deepseek-ai/deepseek-r1-distill-qwen-32b': { name: 'DeepSeek R1 Distill Qwen 32B', category: 'reasoning', provider: 'DeepSeek', params: '32B', context: 131072, description: 'Distilled onto Qwen base' },
  'deepseek-ai/deepseek-r1-distill-llama-8b': { name: 'DeepSeek R1 Distill 8B', category: 'reasoning', provider: 'DeepSeek', params: '8B', context: 131072, description: 'Small distilled reasoner' },

  // ── MICROSOFT PHI MODELS ───────────────────────────────────
  'microsoft/phi-3.5-mini-instruct': { name: 'Phi 3.5 Mini', category: 'text-generation', provider: 'Microsoft', params: '3.8B', context: 131072, description: 'Best-in-class small model' },
  'microsoft/phi-3.5-moe-instruct': { name: 'Phi 3.5 MoE', category: 'text-generation', provider: 'Microsoft', params: '42B', context: 131072, description: 'MoE architecture Phi' },
  'microsoft/phi-3-medium-128k-instruct': { name: 'Phi 3 Medium 128K', category: 'text-generation', provider: 'Microsoft', params: '14B', context: 131072, description: 'Medium Phi with long context' },
  'microsoft/phi-3-mini-128k-instruct': { name: 'Phi 3 Mini 128K', category: 'text-generation', provider: 'Microsoft', params: '3.8B', context: 131072, description: 'Mini Phi long context' },
  'microsoft/phi-3-small-128k-instruct': { name: 'Phi 3 Small 128K', category: 'text-generation', provider: 'Microsoft', params: '7B', context: 131072, description: 'Small Phi long context' },
  'microsoft/phi-3-vision-128k-instruct': { name: 'Phi 3 Vision 128K', category: 'vision', provider: 'Microsoft', params: '4.2B', context: 131072, description: 'Vision-capable Phi' },

  // ── COHERE MODELS ──────────────────────────────────────────
  'writer/palmyra-x-004': { name: 'Palmyra X 004', category: 'text-generation', provider: 'Writer', params: 'Unknown', context: 131072, description: 'Enterprise-grade model' },
  'writer/palmyra-fin-70b-32k': { name: 'Palmyra Fin 70B', category: 'text-generation', provider: 'Writer', params: '70B', context: 32768, description: 'Finance-focused model' },

  // ── IBM GRANITE MODELS ─────────────────────────────────────
  'ibm/granite-34b-code-instruct': { name: 'Granite 34B Code', category: 'code', provider: 'IBM', params: '34B', context: 8192, description: 'IBM code model' },
  'ibm/granite-8b-code-instruct': { name: 'Granite 8B Code', category: 'code', provider: 'IBM', params: '8B', context: 4096, description: 'Small IBM code model' },
  'ibm/granite-3.0-8b-instruct': { name: 'Granite 3.0 8B', category: 'text-generation', provider: 'IBM', params: '8B', context: 4096, description: 'IBM general model' },
  'ibm/granite-3.0-2b-instruct': { name: 'Granite 3.0 2B', category: 'text-generation', provider: 'IBM', params: '2B', context: 4096, description: 'Lightweight IBM model' },
  'ibm/granite-guardian-3.0-8b': { name: 'Granite Guardian 8B', category: 'safety', provider: 'IBM', params: '8B', context: 4096, description: 'Safety and guardrails' },

  // ── DATABRICKS DBRX ────────────────────────────────────────
  'databricks/dbrx-instruct': { name: 'DBRX Instruct', category: 'text-generation', provider: 'Databricks', params: '132B', context: 32768, description: 'MoE model from Databricks' },

  // ── SNOWFLAKE ARCTIC ───────────────────────────────────────
  'snowflake/arctic': { name: 'Arctic', category: 'text-generation', provider: 'Snowflake', params: '480B', context: 4096, description: 'Enterprise MoE model' },

  // ── TOGETHER / COMMUNITY MODELS ────────────────────────────
  'upstage/solar-10.7b-instruct': { name: 'Solar 10.7B', category: 'text-generation', provider: 'Upstage', params: '10.7B', context: 4096, description: 'Depth upscaled model' },
  '01-ai/yi-large': { name: 'Yi Large', category: 'text-generation', provider: '01.AI', params: 'Unknown', context: 32768, description: 'Yi series flagship' },
  'abacusai/dracarys-llama-3.1-70b-instruct': { name: 'Dracarys 70B', category: 'text-generation', provider: 'AbacusAI', params: '70B', context: 131072, description: 'Fine-tuned Llama variant' },
  'aisingapore/sea-lion-7b-instruct': { name: 'SEA-LION 7B', category: 'text-generation', provider: 'AI Singapore', params: '7B', context: 4096, description: 'Southeast Asian language model' },
  'rakuten/rakutenai-7b-instruct': { name: 'RakutenAI 7B', category: 'text-generation', provider: 'Rakuten', params: '7B', context: 4096, description: 'Japanese-English model' },
  'mediatek/breeze-7b-instruct': { name: 'Breeze 7B', category: 'text-generation', provider: 'MediaTek', params: '7B', context: 32768, description: 'Traditional Chinese model' },

  // ── VISION / MULTIMODAL ────────────────────────────────────
  'meta/llama-3.2-11b-vision-instruct': { name: 'Llama 3.2 11B Vision', category: 'vision', provider: 'Meta', params: '11B', context: 131072, description: 'Vision-language Llama' },
  'meta/llama-3.2-90b-vision-instruct': { name: 'Llama 3.2 90B Vision', category: 'vision', provider: 'Meta', params: '90B', context: 131072, description: 'Large vision Llama' },
  'nvidia/vila': { name: 'VILA', category: 'vision', provider: 'NVIDIA', params: 'Unknown', context: 4096, description: 'Visual language model' },
  'microsoft/kosmos-2': { name: 'Kosmos 2', category: 'vision', provider: 'Microsoft', params: 'Unknown', context: 4096, description: 'Grounding multimodal model' },
  'google/deplot': { name: 'DePlot', category: 'vision', provider: 'Google', params: 'Unknown', context: 4096, description: 'Chart/plot understanding' },
  'google/paligemma': { name: 'PaLiGemma', category: 'vision', provider: 'Google', params: '3B', context: 4096, description: 'Vision-language model' },
  'nvidia/neva-22b': { name: 'NeVA 22B', category: 'vision', provider: 'NVIDIA', params: '22B', context: 4096, description: 'NVIDIA vision assistant' },
  'adept/fuyu-8b': { name: 'Fuyu 8B', category: 'vision', provider: 'Adept', params: '8B', context: 4096, description: 'Multimodal understanding' },

  // ── EMBEDDING MODELS ───────────────────────────────────────
  'nvidia/nv-embedqa-e5-v5': { name: 'NV-EmbedQA E5 v5', category: 'embedding', provider: 'NVIDIA', params: 'Unknown', context: 512, description: 'QA-focused embeddings' },
  'nvidia/nv-embedqa-mistral-7b-v2': { name: 'NV-EmbedQA Mistral 7B', category: 'embedding', provider: 'NVIDIA', params: '7B', context: 32768, description: 'Mistral-based embeddings' },
  'nvidia/nv-embed-v1': { name: 'NV-Embed v1', category: 'embedding', provider: 'NVIDIA', params: 'Unknown', context: 512, description: 'General embeddings' },
  'nvidia/nv-embed-v2': { name: 'NV-Embed v2', category: 'embedding', provider: 'NVIDIA', params: 'Unknown', context: 32768, description: 'Improved embeddings' },
  'snowflake/arctic-embed-l': { name: 'Arctic Embed L', category: 'embedding', provider: 'Snowflake', params: 'Unknown', context: 512, description: 'Snowflake embeddings' },
  'baai/bge-m3': { name: 'BGE-M3', category: 'embedding', provider: 'BAAI', params: 'Unknown', context: 8192, description: 'Multi-lingual embeddings' },

  // ── RERANKING MODELS ───────────────────────────────────────
  'nvidia/nv-rerankqa-mistral-4b-v3': { name: 'NV-RerankQA 4B v3', category: 'reranking', provider: 'NVIDIA', params: '4B', context: 4096, description: 'QA reranking model' },
  'nv-rerank-qa-mistral-4b-v2': { name: 'NV-Rerank QA 4B v2', category: 'reranking', provider: 'NVIDIA', params: '4B', context: 4096, description: 'Reranking v2' },

  // ── CODE GENERATION ────────────────────────────────────────
  'meta/codellama-70b': { name: 'Code Llama 70B', category: 'code', provider: 'Meta', params: '70B', context: 16384, description: 'Large code model' },
  'meta/llama-3.1-nemotron-70b-instruct': { name: 'Llama 3.1 Nemotron Code', category: 'code', provider: 'NVIDIA', params: '70B', context: 32768, description: 'Code-optimized Nemotron' },
  'bigcode/starcoder2-15b': { name: 'StarCoder2 15B', category: 'code', provider: 'BigCode', params: '15B', context: 16384, description: 'Open-source code model' },
  'bigcode/starcoder2-7b': { name: 'StarCoder2 7B', category: 'code', provider: 'BigCode', params: '7B', context: 16384, description: 'Efficient code model' },

  // ── AUDIO / SPEECH ─────────────────────────────────────────
  'nvidia/canary-1b': { name: 'Canary 1B ASR', category: 'audio', provider: 'NVIDIA', params: '1B', context: 0, description: 'Speech recognition model' },
  'nvidia/parakeet-ctc-1.1b': { name: 'Parakeet CTC 1.1B', category: 'audio', provider: 'NVIDIA', params: '1.1B', context: 0, description: 'CTC-based ASR' },
  'nvidia/parakeet-tdt-1.1b': { name: 'Parakeet TDT 1.1B', category: 'audio', provider: 'NVIDIA', params: '1.1B', context: 0, description: 'Token-and-duration ASR' },
  'nvidia/fastpitch-hifigan-tts': { name: 'FastPitch HiFi-GAN TTS', category: 'audio', provider: 'NVIDIA', params: 'Unknown', context: 0, description: 'Text-to-speech' },

  // ── IMAGE GENERATION ───────────────────────────────────────
  'stabilityai/stable-diffusion-xl': { name: 'SDXL', category: 'image-generation', provider: 'Stability AI', params: 'Unknown', context: 0, description: 'Image generation' },
  'stabilityai/sdxl-turbo': { name: 'SDXL Turbo', category: 'image-generation', provider: 'Stability AI', params: 'Unknown', context: 0, description: 'Fast image generation' },
  'stabilityai/stable-diffusion-3-medium': { name: 'SD3 Medium', category: 'image-generation', provider: 'Stability AI', params: 'Unknown', context: 0, description: 'Latest Stable Diffusion' },

  // ── BIOLOGY / SCIENCE ──────────────────────────────────────
  'nvidia/molmim-generate': { name: 'MolMIM Generate', category: 'biology', provider: 'NVIDIA', params: 'Unknown', context: 0, description: 'Molecule generation' },
  'nvidia/esm2nv-650m': { name: 'ESM2nv 650M', category: 'biology', provider: 'NVIDIA', params: '650M', context: 0, description: 'Protein language model' },

  // ── GUARDRAILS / SAFETY ────────────────────────────────────
  'nvidia/nemo-guardrails': { name: 'NeMo Guardrails', category: 'safety', provider: 'NVIDIA', params: 'Unknown', context: 0, description: 'LLM safety guardrails' },
  'meta/llama-guard-3-8b': { name: 'Llama Guard 3 8B', category: 'safety', provider: 'Meta', params: '8B', context: 8192, description: 'Content safety classifier' },
  'meta/prompt-guard-86m': { name: 'Prompt Guard 86M', category: 'safety', provider: 'Meta', params: '86M', context: 512, description: 'Prompt injection detector' },

  // ── RETRIEVAL / RAG ────────────────────────────────────────
  'nvidia/nv-retriever-qa': { name: 'NV-RetrieverQA', category: 'retrieval', provider: 'NVIDIA', params: 'Unknown', context: 0, description: 'RAG retriever model' }
};

// Categories for UI grouping
const MODEL_CATEGORIES = {
  'text-generation': { label: 'Text Generation', icon: '💬', color: '#7c3aed' },
  'code': { label: 'Code Generation', icon: '💻', color: '#3b82f6' },
  'vision': { label: 'Vision / Multimodal', icon: '👁️', color: '#06b6d4' },
  'reasoning': { label: 'Reasoning', icon: '🧠', color: '#f59e0b' },
  'embedding': { label: 'Embeddings', icon: '📊', color: '#10b981' },
  'reranking': { label: 'Reranking', icon: '📈', color: '#8b5cf6' },
  'audio': { label: 'Audio / Speech', icon: '🎙️', color: '#ef4444' },
  'image-generation': { label: 'Image Generation', icon: '🎨', color: '#ec4899' },
  'biology': { label: 'Biology / Science', icon: '🧬', color: '#14b8a6' },
  'safety': { label: 'Safety / Guardrails', icon: '🛡️', color: '#6366f1' },
  'retrieval': { label: 'Retrieval / RAG', icon: '🔍', color: '#84cc16' }
};

// Provider metadata
const NVIDIA_PROVIDERS = {
  'Meta': { color: '#1877F2', icon: '🦙' },
  'NVIDIA': { color: '#76B900', icon: '🟢' },
  'Mistral AI': { color: '#FF7000', icon: '🌪️' },
  'Google': { color: '#4285F4', icon: '🔵' },
  'Alibaba': { color: '#FF6A00', icon: '☁️' },
  'DeepSeek': { color: '#4A6CF7', icon: '🔬' },
  'Microsoft': { color: '#00A4EF', icon: '🔷' },
  'IBM': { color: '#052FAD', icon: '🔹' },
  'Databricks': { color: '#FF3621', icon: '🧱' },
  'Snowflake': { color: '#29B5E8', icon: '❄️' },
  'Writer': { color: '#5B3AFF', icon: '✍️' },
  'Upstage': { color: '#FF4081', icon: '☀️' },
  '01.AI': { color: '#000000', icon: '🤖' },
  'AbacusAI': { color: '#FF6B35', icon: '🐉' },
  'AI Singapore': { color: '#E31937', icon: '🇸🇬' },
  'Rakuten': { color: '#BF0000', icon: '🇯🇵' },
  'MediaTek': { color: '#FFE100', icon: '🇹🇼' },
  'Stability AI': { color: '#5B3AFF', icon: '🎨' },
  'BigCode': { color: '#4B8BBE', icon: '⭐' },
  'Adept': { color: '#FF6B6B', icon: '🦊' },
  'BAAI': { color: '#1B5E20', icon: '🇨🇳' }
};

/**
 * Call NVIDIA NIM chat completion API
 */
async function callNvidiaNIM(messages, modelId, apiKey, options = {}) {
  if (!apiKey) throw new Error('NVIDIA API key not configured. Get one free at build.nvidia.com');

  const model = NVIDIA_MODELS[modelId];
  if (!model) throw new Error(`Unknown NVIDIA model: ${modelId}`);

  // Build system prompt
  const systemPrompt = options.systemPrompt || getDefaultSystemPrompt();
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

  if (options.stop) body.stop = options.stop;
  if (options.frequencyPenalty) body.frequency_penalty = options.frequencyPenalty;
  if (options.presencePenalty) body.presence_penalty = options.presencePenalty;

  const response = await fetch(`${NVIDIA_NIM_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.error?.message || `NVIDIA NIM API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: modelId,
    usage: data.usage,
    finishReason: data.choices[0].finish_reason
  };
}

/**
 * Call NVIDIA NIM embedding API
 */
async function callNvidiaEmbedding(texts, modelId, apiKey) {
  if (!apiKey) throw new Error('NVIDIA API key not configured');

  const body = {
    model: modelId,
    input: Array.isArray(texts) ? texts : [texts],
    input_type: 'query',
    encoding_format: 'float'
  };

  const response = await fetch(`${NVIDIA_NIM_BASE}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `NVIDIA Embedding error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Call NVIDIA NIM reranking API
 */
async function callNvidiaRerank(query, documents, modelId, apiKey) {
  if (!apiKey) throw new Error('NVIDIA API key not configured');

  const body = {
    model: modelId,
    query: { text: query },
    passages: documents.map(d => ({ text: d }))
  };

  const response = await fetch(`${NVIDIA_NIM_BASE}/ranking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `NVIDIA Rerank error: ${response.status}`);
  }

  return await response.json();
}

function getDefaultSystemPrompt() {
  return `You are SuperNinja AI (GOAT Royalty Edition v3.0), an autonomous AI desktop assistant built for Harvey Miller (DJ Speedy) and the GOAT Royalty App ecosystem.

You are powered by NVIDIA NIM with access to 215+ state-of-the-art language models. You are a full-spectrum assistant capable of:
- Writing and debugging code in any language
- Executing terminal commands
- Analyzing files (PDF, CSV, JSON, images, audio)
- Web research and data extraction
- Music production assistance and royalty calculations
- Data analysis with visualizations
- Image generation and editing guidance
- System administration
- Multi-model AI orchestration (querying multiple LLMs simultaneously)

When the user asks you to run a command, format it as:
\`\`\`terminal
command here
\`\`\`

When writing code, always specify the language.
Be concise, helpful, and proactive. Suggest next steps when appropriate.
Format responses with Markdown for readability.
You have access to the local file system and terminal through the desktop app tools.`;
}

/**
 * Get all models grouped by category
 */
function getModelsByCategory() {
  const grouped = {};
  for (const [id, model] of Object.entries(NVIDIA_MODELS)) {
    const cat = model.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({ id, ...model });
  }
  return grouped;
}

/**
 * Get all models grouped by provider
 */
function getModelsByProvider() {
  const grouped = {};
  for (const [id, model] of Object.entries(NVIDIA_MODELS)) {
    const prov = model.provider || 'Unknown';
    if (!grouped[prov]) grouped[prov] = [];
    grouped[prov].push({ id, ...model });
  }
  return grouped;
}

/**
 * Search models by query
 */
function searchModels(query) {
  const q = query.toLowerCase();
  return Object.entries(NVIDIA_MODELS)
    .filter(([id, m]) =>
      id.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.provider.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      (m.description && m.description.toLowerCase().includes(q))
    )
    .map(([id, m]) => ({ id, ...m }));
}

/**
 * Get recommended models for a task type
 */
function getRecommendedModels(taskType) {
  const recommendations = {
    'chat': ['meta/llama-3.3-70b-instruct', 'nvidia/llama-3.1-nemotron-70b-instruct', 'qwen/qwen2.5-72b-instruct', 'mistralai/mistral-large-2-instruct'],
    'code': ['qwen/qwen2.5-coder-32b-instruct', 'mistralai/codestral-22b-instruct-v0.1', 'meta/codellama-70b', 'ibm/granite-34b-code-instruct'],
    'reasoning': ['deepseek-ai/deepseek-r1', 'qwen/qwq-32b', 'deepseek-ai/deepseek-r1-distill-llama-70b', 'meta/llama-3.1-405b-instruct'],
    'vision': ['meta/llama-3.2-90b-vision-instruct', 'qwen/qwen2-vl-72b-instruct', 'mistralai/pixtral-large-2501', 'microsoft/phi-3-vision-128k-instruct'],
    'fast': ['meta/llama-3.2-3b-instruct', 'meta/llama-3.1-8b-instruct', 'microsoft/phi-3.5-mini-instruct', 'google/gemma-2-2b-it'],
    'music': ['meta/llama-3.3-70b-instruct', 'nvidia/llama-3.1-nemotron-70b-instruct', 'qwen/qwen2.5-72b-instruct'],
    'analysis': ['deepseek-ai/deepseek-r1', 'meta/llama-3.1-405b-instruct', 'qwen/qwen2.5-72b-instruct']
  };
  return (recommendations[taskType] || recommendations['chat']).map(id => ({ id, ...NVIDIA_MODELS[id] })).filter(m => m.name);
}

// Export everything
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NVIDIA_MODELS, MODEL_CATEGORIES, NVIDIA_PROVIDERS, NVIDIA_NIM_BASE,
    callNvidiaNIM, callNvidiaEmbedding, callNvidiaRerank,
    getModelsByCategory, getModelsByProvider, searchModels, getRecommendedModels,
    getDefaultSystemPrompt
  };
}