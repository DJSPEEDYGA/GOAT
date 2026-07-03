/**
 * 🧠 Universal Inference API — Multi-Provider AI Endpoint
 * Supports 11+ providers: HuggingFace, Groq, Together, Fireworks, Cerebras,
 * SambaNova, Cohere, Replicate, Novita, fal.ai, Ollama
 * 
 * © 2025 GOAT Royalty / FASTASSMAN Publishing Inc
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { provider, model, messages, prompt, options = {} } = req.body;

  if (!provider || !model) {
    return res.status(400).json({ success: false, error: 'Provider and model are required' });
  }

  try {
    let result;

    switch (provider) {
      case 'huggingface':
        result = await callHuggingFace(model, messages, prompt, options);
        break;
      case 'groq':
        result = await callGroq(model, messages, options);
        break;
      case 'together':
        result = await callTogether(model, messages, options);
        break;
      case 'fireworks':
        result = await callFireworks(model, messages, options);
        break;
      case 'cerebras':
        result = await callCerebras(model, messages, options);
        break;
      case 'sambanova':
        result = await callSambaNova(model, messages, options);
        break;
      case 'cohere':
        result = await callCohere(model, messages, prompt, options);
        break;
      case 'replicate':
        result = await callReplicate(model, prompt, options);
        break;
      case 'novita':
        result = await callNovita(model, messages, prompt, options);
        break;
      case 'fal':
        result = await callFal(model, prompt, options);
        break;
      case 'ollama':
        result = await callOllama(model, messages, options);
        break;
      default:
        return res.status(400).json({ success: false, error: `Unknown provider: ${provider}` });
    }

    return res.status(200).json({
      success: true,
      provider,
      model,
      ...result
    });

  } catch (error) {
    console.error(`[${provider}/${model}] Error:`, error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      provider,
      model
    });
  }
}

// ═══════════════════════════════════════════════════════════
// HUGGINGFACE INFERENCE
// ═══════════════════════════════════════════════════════════

async function callHuggingFace(model, messages, prompt, options) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) throw new Error('HUGGINGFACE_API_KEY not configured');

  const modelMap = {
    'meta-llama/Llama-3.3-70B-Instruct': 'meta-llama/Llama-3.3-70B-Instruct',
    'mistralai/Mixtral-8x7B-Instruct-v0.1': 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    'microsoft/phi-4': 'microsoft/phi-4',
    'bigcode/starcoder2-15b': 'bigcode/starcoder2-15b',
    'stabilityai/stable-diffusion-xl-base-1.0': 'stabilityai/stable-diffusion-xl-base-1.0',
    'facebook/musicgen-large': 'facebook/musicgen-large',
  };

  const modelId = modelMap[model] || model;
  const isTextGen = !model.includes('stable-diffusion') && !model.includes('musicgen');

  if (isTextGen) {
    const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: messages ? messages.map(m => `${m.role}: ${m.content}`).join('\n') : prompt,
        parameters: {
          max_new_tokens: options.maxTokens || 1024,
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.95,
          return_full_text: false,
        }
      })
    });

    if (!response.ok) throw new Error(`HuggingFace API error: ${response.status} ${response.statusText}`);
    const data = await response.json();

    return {
      result: Array.isArray(data) ? data[0]?.generated_text : data.generated_text || JSON.stringify(data),
      usage: {}
    };
  } else {
    // Image / Audio generation
    const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt || 'Generate something creative' })
    });

    if (!response.ok) throw new Error(`HuggingFace API error: ${response.status}`);
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('image') || contentType?.includes('audio')) {
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return {
        result: `data:${contentType};base64,${base64}`,
        type: contentType?.includes('image') ? 'image' : 'audio'
      };
    }

    const data = await response.json();
    return { result: JSON.stringify(data), type: 'json' };
  }
}

// ═══════════════════════════════════════════════════════════
// GROQ — Ultra-Fast LPU Inference
// ═══════════════════════════════════════════════════════════

async function callGroq(model, messages, options) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const modelMap = {
    'llama-4-maverick': 'meta-llama/llama-4-maverick-17b-128e-instruct',
    'llama-3.3-70b': 'llama-3.3-70b-versatile',
    'llama-3.1-8b': 'llama-3.1-8b-instant',
    'mixtral-8x7b': 'mixtral-8x7b-32768',
    'gemma2-9b': 'gemma2-9b-it',
    'deepseek-r1-distill-70b': 'deepseek-r1-distill-llama-70b',
    'qwq-32b': 'qwen-qwq-32b',
  };

  const modelId = modelMap[model] || model;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: messages || [{ role: 'user', content: 'Hello' }],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2048,
      top_p: options.topP || 0.95,
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return {
    result: data.choices?.[0]?.message?.content || '',
    usage: data.usage || {},
    modelId
  };
}

// ═══════════════════════════════════════════════════════════
// TOGETHER AI — Open Source Models
// ═══════════════════════════════════════════════════════════

async function callTogether(model, messages, options) {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) throw new Error('TOGETHER_API_KEY not configured');

  const modelMap = {
    'llama-4-maverick': 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
    'llama-4-scout': 'meta-llama/Llama-4-Scout-17B-16E-Instruct',
    'llama-3.3-70b': 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    'llama-3.1-405b': 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
    'qwen-3-235b-a22b': 'Qwen/Qwen3-235B-A22B',
    'qwen-2.5-72b': 'Qwen/Qwen2.5-72B-Instruct-Turbo',
    'deepseek-v3': 'deepseek-ai/DeepSeek-V3',
    'mixtral-8x22b': 'mistralai/Mixtral-8x22B-Instruct-v0.1',
    'codellama-70b': 'meta-llama/CodeLlama-70b-Instruct-hf',
    'llava-v1.6-34b': 'liuhaotian/llava-v1.6-34b',
    'llama-guard-3': 'meta-llama/Llama-Guard-3-8B',
  };

  const modelId = modelMap[model] || model;

  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: messages || [{ role: 'user', content: 'Hello' }],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2048,
      top_p: options.topP || 0.95,
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Together API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return {
    result: data.choices?.[0]?.message?.content || '',
    usage: data.usage || {},
    modelId
  };
}

// ═══════════════════════════════════════════════════════════
// FIREWORKS AI — Blazing Fast
// ═══════════════════════════════════════════════════════════

async function callFireworks(model, messages, options) {
  const apiKey = process.env.FIREWORKS_API_KEY;
  if (!apiKey) throw new Error('FIREWORKS_API_KEY not configured');

  const modelMap = {
    'llama-3.3-70b': 'accounts/fireworks/models/llama-v3p3-70b-instruct',
    'mixtral-moe': 'accounts/fireworks/models/mixtral-8x22b-instruct',
    'firefunction-v2': 'accounts/fireworks/models/firefunction-v2',
    'mistral-large': 'accounts/fireworks/models/mistral-large-2407',
    'mistral-nemo': 'accounts/fireworks/models/mistral-nemo-instruct-2407',
    'codestral': 'accounts/fireworks/models/codestral-2405',
  };

  const modelId = modelMap[model] || model;

  const response = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: messages || [{ role: 'user', content: 'Hello' }],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2048,
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Fireworks API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return {
    result: data.choices?.[0]?.message?.content || '',
    usage: data.usage || {},
    modelId
  };
}

// ═══════════════════════════════════════════════════════════
// CEREBRAS — Wafer-Scale Inference
// ═══════════════════════════════════════════════════════════

async function callCerebras(model, messages, options) {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) throw new Error('CEREBRAS_API_KEY not configured');

  const modelMap = {
    'llama-3.3-70b': 'llama-3.3-70b',
    'llama-3.1-8b': 'llama-3.1-8b',
    'qwen-2.5-32b': 'qwen-2.5-32b',
  };

  const modelId = modelMap[model] || model;

  const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: messages || [{ role: 'user', content: 'Hello' }],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2048,
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Cerebras API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return {
    result: data.choices?.[0]?.message?.content || '',
    usage: data.usage || {},
    modelId
  };
}

// ═══════════════════════════════════════════════════════════
// SAMBANOVA — High-Throughput Inference
// ═══════════════════════════════════════════════════════════

async function callSambaNova(model, messages, options) {
  const apiKey = process.env.SAMBANOVA_API_KEY;
  if (!apiKey) throw new Error('SAMBANOVA_API_KEY not configured');

  const modelMap = {
    'llama-3.3-70b': 'Meta-Llama-3.3-70B-Instruct',
    'llama-3.1-405b': 'Meta-Llama-3.1-405B-Instruct',
    'deepseek-r1': 'DeepSeek-R1',
  };

  const modelId = modelMap[model] || model;

  const response = await fetch('https://api.sambanova.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: messages || [{ role: 'user', content: 'Hello' }],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2048,
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`SambaNova API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return {
    result: data.choices?.[0]?.message?.content || '',
    usage: data.usage || {},
    modelId
  };
}

// ═══════════════════════════════════════════════════════════
// COHERE — Enterprise NLP & RAG
// ═══════════════════════════════════════════════════════════

async function callCohere(model, messages, prompt, options) {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) throw new Error('COHERE_API_KEY not configured');

  const modelMap = {
    'command-r-plus': 'command-r-plus',
    'command-r': 'command-r',
    'embed-english-v3': 'embed-english-v3.0',
    'rerank-english-v3': 'rerank-english-v3.0',
  };

  const modelId = modelMap[model] || model;

  // Handle embeddings
  if (model.includes('embed')) {
    const response = await fetch('https://api.cohere.ai/v1/embed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        texts: [prompt || messages?.[messages.length - 1]?.content || 'Hello'],
        input_type: 'search_document',
      })
    });

    if (!response.ok) throw new Error(`Cohere Embed error: ${response.status}`);
    const data = await response.json();
    return { result: JSON.stringify(data.embeddings?.[0]?.slice(0, 10)), type: 'embedding', dimensions: data.embeddings?.[0]?.length };
  }

  // Handle reranking
  if (model.includes('rerank')) {
    return { result: 'Reranking requires documents and query parameters', type: 'rerank' };
  }

  // Chat completion
  const chatHistory = messages?.slice(0, -1)
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'CHATBOT' : 'USER',
      message: m.content,
    })) || [];

  const lastMessage = messages?.[messages.length - 1]?.content || prompt || 'Hello';

  const response = await fetch('https://api.cohere.ai/v1/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      message: lastMessage,
      chat_history: chatHistory,
      temperature: options.temperature || 0.7,
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Cohere API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return {
    result: data.text || '',
    usage: data.meta?.tokens || {},
    modelId
  };
}

// ═══════════════════════════════════════════════════════════
// REPLICATE — Run Any ML Model
// ═══════════════════════════════════════════════════════════

async function callReplicate(model, prompt, options) {
  const apiKey = process.env.REPLICATE_API_KEY;
  if (!apiKey) throw new Error('REPLICATE_API_KEY not configured');

  const modelMap = {
    'sdxl': 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
    'flux': 'black-forest-labs/flux-schnell',
    'musicgen': 'meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedbb',
    'stable-diffusion-3': 'stability-ai/stable-diffusion-3',
    'bark': 'suno-ai/bark:b76242b40d67c76ab6742e987628a2a9ac019e11d56ab96c4e91ce03b79b2787',
    'whisper': 'openai/whisper:4d50797290df275329f202e48c76360b3f22b08d28c65f8f7b8c5a6d04e5f3d',
  };

  const modelId = modelMap[model] || model;

  // Create prediction
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: modelId.includes(':') ? modelId.split(':')[1] : undefined,
      model: modelId.includes(':') ? undefined : modelId,
      input: {
        prompt: prompt || 'A beautiful sunset over mountains',
        ...options.input
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Replicate API error: ${response.status} - ${errText}`);
  }

  const prediction = await response.json();

  // Poll for result (max 60 seconds)
  let result = prediction;
  let attempts = 0;
  while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < 30) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const pollRes = await fetch(result.urls.get, {
      headers: { 'Authorization': `Token ${apiKey}` }
    });
    result = await pollRes.json();
    attempts++;
  }

  if (result.status === 'failed') throw new Error(`Replicate prediction failed: ${result.error}`);

  return {
    result: result.output,
    status: result.status,
    modelId
  };
}

// ═══════════════════════════════════════════════════════════
// NOVITA AI — Image & Video Generation
// ═══════════════════════════════════════════════════════════

async function callNovita(model, messages, prompt, options) {
  const apiKey = process.env.NOVITA_API_KEY;
  if (!apiKey) throw new Error('NOVITA_API_KEY not configured');

  // Text generation (OpenAI-compatible)
  if (messages) {
    const response = await fetch('https://api.novita.ai/v3/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2048,
      })
    });

    if (!response.ok) throw new Error(`Novita API error: ${response.status}`);
    const data = await response.json();
    return {
      result: data.choices?.[0]?.message?.content || '',
      usage: data.usage || {},
      modelId: model
    };
  }

  // Image generation
  const response = await fetch('https://api.novita.ai/v3/async/txt2img', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model_name: model || 'sd_xl_base_1.0.safetensors',
      prompt: prompt || 'A beautiful landscape',
      negative_prompt: options.negativePrompt || '',
      width: options.width || 1024,
      height: options.height || 1024,
      steps: options.steps || 25,
    })
  });

  if (!response.ok) throw new Error(`Novita Image API error: ${response.status}`);
  const data = await response.json();
  return { result: data, type: 'image', modelId: model };
}

// ═══════════════════════════════════════════════════════════
// FAL.AI — Real-Time Media Generation
// ═══════════════════════════════════════════════════════════

async function callFal(model, prompt, options) {
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) throw new Error('FAL_API_KEY not configured');

  const modelMap = {
    'flux-pro': 'fal-ai/flux-pro',
    'flux-1-schnell': 'fal-ai/flux/schnell',
    'fast-sdxl': 'fal-ai/fast-sdxl',
    'aura-flow': 'fal-ai/aura-flow',
    'stable-audio': 'fal-ai/stable-audio',
  };

  const modelId = modelMap[model] || model;

  const response = await fetch(`https://fal.run/${modelId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt || 'A stunning digital artwork',
      image_size: options.imageSize || 'landscape_16_9',
      num_images: options.numImages || 1,
      ...options.extra
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`fal.ai API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return {
    result: data.images || data.audio || data,
    type: data.images ? 'image' : data.audio ? 'audio' : 'json',
    modelId
  };
}

// ═══════════════════════════════════════════════════════════
// OLLAMA — Local LLM Inference
// ═══════════════════════════════════════════════════════════

async function callOllama(model, messages, options) {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

  const modelMap = {
    'llama3': 'llama3',
    'mistral-7b': 'mistral',
    'codellama': 'codellama',
    'gemma': 'gemma2',
    'phi-3.5-mini': 'phi3',
    'codegemma-7b': 'codegemma',
    'nomic-embed-text': 'nomic-embed-text',
  };

  const modelId = modelMap[model] || model;

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelId,
      messages: messages || [{ role: 'user', content: 'Hello' }],
      stream: false,
      options: {
        temperature: options.temperature || 0.7,
        num_predict: options.maxTokens || 2048,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} - Is Ollama running at ${baseUrl}?`);
  }

  const data = await response.json();
  return {
    result: data.message?.content || '',
    usage: { total_duration: data.total_duration },
    modelId
  };
}