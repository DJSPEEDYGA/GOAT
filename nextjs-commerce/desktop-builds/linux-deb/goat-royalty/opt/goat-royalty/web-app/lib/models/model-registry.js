/**
 * SUPER GOAT ROYALTIES - Open Source Model Registry
 * Curated catalog of 40+ popular models from HuggingFace
 * Categories: Text Generation, Code, Vision, Multimodal, Audio, Embedding
 */

class ModelRegistry {
    constructor() {
        this.models = {
            // ==========================================
            // TEXT GENERATION MODELS
            // ==========================================
            'meta-llama/Llama-3.3-70B-Instruct': {
                id: 'meta-llama/Llama-3.3-70B-Instruct',
                name: 'Llama 3.3 70B Instruct',
                family: 'llama',
                author: 'Meta',
                category: 'text-generation',
                params: '70B',
                contextLength: 128000,
                license: 'Llama 3.3 Community',
                description: 'Meta\'s latest and most capable open-weight Llama model with 128K context',
                tags: ['popular', 'instruction-tuned', 'multilingual', 'reasoning'],
                quantizations: ['bf16', 'fp8', 'awq', 'gptq', 'gguf'],
                providers: ['groq', 'cerebras', 'sambanova', 'together', 'fireworks', 'novita', 'hyperbolic', 'featherless', 'nscale', 'scaleway', 'hf-inference', 'ollama'],
                trending: true,
                downloads: '15M+'
            },
            'meta-llama/Llama-3.1-405B-Instruct': {
                id: 'meta-llama/Llama-3.1-405B-Instruct',
                name: 'Llama 3.1 405B Instruct',
                family: 'llama',
                author: 'Meta',
                category: 'text-generation',
                params: '405B',
                contextLength: 128000,
                license: 'Llama 3.1 Community',
                description: 'The largest open-weight model, rivaling closed-source frontier models',
                tags: ['frontier', 'instruction-tuned', 'multilingual'],
                quantizations: ['bf16', 'fp8'],
                providers: ['sambanova', 'together', 'fireworks', 'hyperbolic'],
                trending: true,
                downloads: '8M+'
            },
            'meta-llama/Llama-3.1-8B-Instruct': {
                id: 'meta-llama/Llama-3.1-8B-Instruct',
                name: 'Llama 3.1 8B Instruct',
                family: 'llama',
                author: 'Meta',
                category: 'text-generation',
                params: '8B',
                contextLength: 128000,
                license: 'Llama 3.1 Community',
                description: 'Compact and fast Llama model ideal for edge deployment and quick tasks',
                tags: ['compact', 'fast', 'edge-friendly'],
                quantizations: ['bf16', 'fp8', 'awq', 'gptq', 'gguf'],
                providers: ['groq', 'cerebras', 'together', 'fireworks', 'hf-inference', 'ollama'],
                trending: false,
                downloads: '25M+'
            },
            'meta-llama/Llama-4-Scout-17B-16E-Instruct': {
                id: 'meta-llama/Llama-4-Scout-17B-16E-Instruct',
                name: 'Llama 4 Scout 17B',
                family: 'llama',
                author: 'Meta',
                category: 'text-generation',
                params: '17B (16 Experts MoE)',
                contextLength: 512000,
                license: 'Llama 4 Community',
                description: 'Meta\'s next-gen Llama 4 Scout MoE with massive 512K context window',
                tags: ['next-gen', 'moe', 'massive-context', 'multimodal'],
                quantizations: ['bf16', 'fp8'],
                providers: ['together', 'fireworks', 'sambanova'],
                trending: true,
                downloads: '3M+'
            },
            'Qwen/Qwen3-235B-A22B': {
                id: 'Qwen/Qwen3-235B-A22B',
                name: 'Qwen3 235B-A22B',
                family: 'qwen',
                author: 'Alibaba',
                category: 'text-generation',
                params: '235B (22B active MoE)',
                contextLength: 131072,
                license: 'Apache 2.0',
                description: 'Alibaba\'s flagship MoE model with hybrid thinking modes',
                tags: ['frontier', 'moe', 'reasoning', 'multilingual', 'thinking'],
                quantizations: ['bf16', 'fp8', 'awq', 'gptq'],
                providers: ['sambanova', 'together', 'fireworks'],
                trending: true,
                downloads: '5M+'
            },
            'Qwen/Qwen2.5-72B-Instruct': {
                id: 'Qwen/Qwen2.5-72B-Instruct',
                name: 'Qwen 2.5 72B Instruct',
                family: 'qwen',
                author: 'Alibaba',
                category: 'text-generation',
                params: '72B',
                contextLength: 131072,
                license: 'Apache 2.0',
                description: 'Powerful multilingual model with excellent coding and math capabilities',
                tags: ['powerful', 'multilingual', 'coding', 'math'],
                quantizations: ['bf16', 'fp8', 'awq', 'gptq', 'gguf'],
                providers: ['groq', 'together', 'fireworks', 'novita', 'hyperbolic', 'scaleway', 'nscale', 'hf-inference', 'ollama'],
                trending: true,
                downloads: '12M+'
            },
            'Qwen/Qwen2.5-32B-Instruct': {
                id: 'Qwen/Qwen2.5-32B-Instruct',
                name: 'Qwen 2.5 32B Instruct',
                family: 'qwen',
                author: 'Alibaba',
                category: 'text-generation',
                params: '32B',
                contextLength: 131072,
                license: 'Apache 2.0',
                description: 'Mid-size Qwen model with strong reasoning and coding performance',
                tags: ['balanced', 'coding', 'reasoning'],
                quantizations: ['bf16', 'fp8', 'awq', 'gptq', 'gguf'],
                providers: ['cerebras', 'together', 'fireworks', 'ollama'],
                trending: false,
                downloads: '6M+'
            },
            'Qwen/QwQ-32B': {
                id: 'Qwen/QwQ-32B',
                name: 'QwQ 32B',
                family: 'qwen',
                author: 'Alibaba',
                category: 'text-generation',
                params: '32B',
                contextLength: 131072,
                license: 'Apache 2.0',
                description: 'Qwen\'s dedicated reasoning model with chain-of-thought capabilities',
                tags: ['reasoning', 'chain-of-thought', 'math', 'logic'],
                quantizations: ['bf16', 'fp8', 'awq', 'gguf'],
                providers: ['groq', 'together', 'fireworks', 'ollama'],
                trending: true,
                downloads: '4M+'
            },
            'deepseek-ai/DeepSeek-R1': {
                id: 'deepseek-ai/DeepSeek-R1',
                name: 'DeepSeek R1',
                family: 'deepseek',
                author: 'DeepSeek',
                category: 'text-generation',
                params: '671B MoE',
                contextLength: 128000,
                license: 'MIT',
                description: 'State-of-the-art reasoning model rivaling OpenAI o1, MIT licensed',
                tags: ['reasoning', 'frontier', 'moe', 'open-source', 'math'],
                quantizations: ['bf16', 'fp8'],
                providers: ['together', 'novita', 'hyperbolic'],
                trending: true,
                downloads: '10M+'
            },
            'deepseek-ai/DeepSeek-R1-Distill-Llama-70B': {
                id: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
                name: 'DeepSeek R1 Distill Llama 70B',
                family: 'deepseek',
                author: 'DeepSeek',
                category: 'text-generation',
                params: '70B',
                contextLength: 128000,
                license: 'MIT',
                description: 'DeepSeek R1 reasoning distilled into Llama 70B architecture',
                tags: ['reasoning', 'distilled', 'efficient'],
                quantizations: ['bf16', 'fp8', 'awq', 'gguf'],
                providers: ['groq', 'nscale', 'together', 'fireworks', 'ollama'],
                trending: true,
                downloads: '7M+'
            },
            'deepseek-ai/DeepSeek-V3-0324': {
                id: 'deepseek-ai/DeepSeek-V3-0324',
                name: 'DeepSeek V3 (March 2025)',
                family: 'deepseek',
                author: 'DeepSeek',
                category: 'text-generation',
                params: '671B MoE',
                contextLength: 128000,
                license: 'MIT',
                description: 'Latest DeepSeek V3 general-purpose model, massively capable MoE',
                tags: ['general', 'frontier', 'moe', 'multilingual'],
                quantizations: ['bf16', 'fp8'],
                providers: ['sambanova', 'fireworks', 'together'],
                trending: true,
                downloads: '6M+'
            },
            'google/gemma-3-27b-it': {
                id: 'google/gemma-3-27b-it',
                name: 'Gemma 3 27B',
                family: 'gemma',
                author: 'Google',
                category: 'text-generation',
                params: '27B',
                contextLength: 128000,
                license: 'Gemma',
                description: 'Google\'s latest open model with vision capabilities and 128K context',
                tags: ['google', 'vision', 'instruction-tuned', 'multimodal'],
                quantizations: ['bf16', 'fp8', 'gguf'],
                providers: ['together', 'hf-inference', 'ollama'],
                trending: true,
                downloads: '8M+'
            },
            'google/gemma-2-9b-it': {
                id: 'google/gemma-2-9b-it',
                name: 'Gemma 2 9B',
                family: 'gemma',
                author: 'Google',
                category: 'text-generation',
                params: '9B',
                contextLength: 8192,
                license: 'Gemma',
                description: 'Compact Google model, great for fast inference and edge deployment',
                tags: ['compact', 'fast', 'edge-friendly', 'google'],
                quantizations: ['bf16', 'fp8', 'gguf'],
                providers: ['groq', 'together', 'ollama'],
                trending: false,
                downloads: '15M+'
            },
            'mistralai/Mixtral-8x7B-Instruct-v0.1': {
                id: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
                name: 'Mixtral 8x7B Instruct',
                family: 'mistral',
                author: 'Mistral AI',
                category: 'text-generation',
                params: '46.7B (8x7B MoE)',
                contextLength: 32768,
                license: 'Apache 2.0',
                description: 'Mistral\'s pioneering MoE model, excellent quality-to-cost ratio',
                tags: ['moe', 'efficient', 'popular', 'multilingual'],
                quantizations: ['bf16', 'fp8', 'awq', 'gptq', 'gguf'],
                providers: ['groq', 'together', 'fireworks', 'ollama'],
                trending: false,
                downloads: '20M+'
            },
            'mistralai/Mixtral-8x22B-Instruct-v0.1': {
                id: 'mistralai/Mixtral-8x22B-Instruct-v0.1',
                name: 'Mixtral 8x22B Instruct',
                family: 'mistral',
                author: 'Mistral AI',
                category: 'text-generation',
                params: '141B (8x22B MoE)',
                contextLength: 65536,
                license: 'Apache 2.0',
                description: 'Mistral\'s largest MoE with 64K context, strong multilingual performance',
                tags: ['moe', 'large', 'multilingual', '64k-context'],
                quantizations: ['bf16', 'fp8'],
                providers: ['together'],
                trending: false,
                downloads: '5M+'
            },
            'mistralai/Mistral-Small-3.1-24B-Instruct-2503': {
                id: 'mistralai/Mistral-Small-3.1-24B-Instruct-2503',
                name: 'Mistral Small 3.1 24B',
                family: 'mistral',
                author: 'Mistral AI',
                category: 'text-generation',
                params: '24B',
                contextLength: 131072,
                license: 'Apache 2.0',
                description: 'Latest Mistral Small with 128K context, vision, and function calling',
                tags: ['vision', 'function-calling', '128k-context', 'efficient'],
                quantizations: ['bf16', 'fp8', 'gguf'],
                providers: ['fireworks', 'scaleway', 'featherless', 'hf-inference', 'ollama'],
                trending: true,
                downloads: '4M+'
            },
            'microsoft/phi-4': {
                id: 'microsoft/phi-4',
                name: 'Phi-4 14B',
                family: 'phi',
                author: 'Microsoft',
                category: 'text-generation',
                params: '14B',
                contextLength: 16384,
                license: 'MIT',
                description: 'Microsoft\'s compact powerhouse, punches above its weight class',
                tags: ['compact', 'efficient', 'reasoning', 'microsoft'],
                quantizations: ['bf16', 'fp8', 'gguf'],
                providers: ['novita', 'together', 'hf-inference', 'ollama'],
                trending: true,
                downloads: '6M+'
            },
            'THUDM/GLM-4-32B-0414': {
                id: 'THUDM/GLM-4-32B-0414',
                name: 'GLM-4 32B',
                family: 'glm',
                author: 'Tsinghua/Zhipu',
                category: 'text-generation',
                params: '32B',
                contextLength: 131072,
                license: 'Apache 2.0',
                description: 'Strong bilingual (Chinese-English) model with tool calling and coding',
                tags: ['bilingual', 'tool-calling', 'coding', 'chinese'],
                quantizations: ['bf16', 'fp8', 'gguf'],
                providers: ['together', 'hf-inference', 'ollama'],
                trending: false,
                downloads: '2M+'
            },
            'NousResearch/Hermes-3-Llama-3.1-405B': {
                id: 'NousResearch/Hermes-3-Llama-3.1-405B',
                name: 'Hermes 3 405B',
                family: 'hermes',
                author: 'Nous Research',
                category: 'text-generation',
                params: '405B',
                contextLength: 128000,
                license: 'Llama 3.1 Community',
                description: 'Community fine-tuned 405B with advanced function calling and reasoning',
                tags: ['function-calling', 'agentic', 'community', 'frontier'],
                quantizations: ['bf16', 'fp8'],
                providers: ['together'],
                trending: false,
                downloads: '2M+'
            },
            'NousResearch/Hermes-3-Llama-3.1-70B': {
                id: 'NousResearch/Hermes-3-Llama-3.1-70B',
                name: 'Hermes 3 70B',
                family: 'hermes',
                author: 'Nous Research',
                category: 'text-generation',
                params: '70B',
                contextLength: 128000,
                license: 'Llama 3.1 Community',
                description: 'Advanced community model with structured output and tool use',
                tags: ['function-calling', 'structured-output', 'community'],
                quantizations: ['bf16', 'fp8', 'gguf'],
                providers: ['featherless', 'together', 'ollama'],
                trending: false,
                downloads: '3M+'
            },
            'CohereForAI/c4ai-command-r-plus': {
                id: 'CohereForAI/c4ai-command-r-plus',
                name: 'Command R+',
                family: 'command-r',
                author: 'Cohere',
                category: 'text-generation',
                params: '104B',
                contextLength: 128000,
                license: 'CC-BY-NC',
                description: 'Cohere\'s flagship model, best-in-class for RAG and enterprise NLP',
                tags: ['rag', 'enterprise', 'multilingual', 'tool-use'],
                quantizations: ['bf16'],
                providers: ['cohere'],
                trending: false,
                downloads: '3M+'
            },

            // ==========================================
            // CODE GENERATION MODELS
            // ==========================================
            'Qwen/Qwen2.5-Coder-32B-Instruct': {
                id: 'Qwen/Qwen2.5-Coder-32B-Instruct',
                name: 'Qwen 2.5 Coder 32B',
                family: 'qwen',
                author: 'Alibaba',
                category: 'code',
                params: '32B',
                contextLength: 131072,
                license: 'Apache 2.0',
                description: 'State-of-the-art open-source code model, rivals GPT-4 on coding benchmarks',
                tags: ['coding', 'completion', 'debugging', 'multi-language'],
                quantizations: ['bf16', 'fp8', 'awq', 'gguf'],
                providers: ['together', 'fireworks', 'ollama'],
                trending: true,
                downloads: '5M+'
            },
            'deepseek-ai/DeepSeek-Coder-V2-Instruct': {
                id: 'deepseek-ai/DeepSeek-Coder-V2-Instruct',
                name: 'DeepSeek Coder V2',
                family: 'deepseek',
                author: 'DeepSeek',
                category: 'code',
                params: '236B MoE',
                contextLength: 128000,
                license: 'MIT',
                description: 'Powerful MoE code model with 128K context for full-repo understanding',
                tags: ['coding', 'moe', 'repo-level', 'debugging'],
                quantizations: ['bf16', 'fp8'],
                providers: ['together', 'fireworks'],
                trending: false,
                downloads: '4M+'
            },
            'bigcode/starcoder2-15b': {
                id: 'bigcode/starcoder2-15b',
                name: 'StarCoder2 15B',
                family: 'starcoder',
                author: 'BigCode',
                category: 'code',
                params: '15B',
                contextLength: 16384,
                license: 'BigCode OpenRAIL-M',
                description: 'Trained on The Stack v2, supports 600+ programming languages',
                tags: ['coding', 'multi-language', 'completion', 'infill'],
                quantizations: ['bf16', 'fp8', 'gguf'],
                providers: ['hf-inference', 'together', 'ollama'],
                trending: false,
                downloads: '3M+'
            },
            'codellama/CodeLlama-34b-Instruct-hf': {
                id: 'codellama/CodeLlama-34b-Instruct-hf',
                name: 'Code Llama 34B',
                family: 'llama',
                author: 'Meta',
                category: 'code',
                params: '34B',
                contextLength: 16384,
                license: 'Llama 2 Community',
                description: 'Meta\'s dedicated code model with infilling and instruction following',
                tags: ['coding', 'infilling', 'instruction-tuned'],
                quantizations: ['bf16', 'fp8', 'gptq', 'gguf'],
                providers: ['together', 'fireworks', 'ollama'],
                trending: false,
                downloads: '8M+'
            },

            // ==========================================
            // VISION MODELS
            // ==========================================
            'black-forest-labs/FLUX.1-schnell': {
                id: 'black-forest-labs/FLUX.1-schnell',
                name: 'FLUX.1 Schnell',
                family: 'flux',
                author: 'Black Forest Labs',
                category: 'vision',
                params: '12B',
                contextLength: null,
                license: 'Apache 2.0',
                description: 'Ultra-fast image generation model, 4 steps for high-quality output',
                tags: ['image-generation', 'fast', 'text-to-image'],
                quantizations: ['bf16', 'fp8'],
                providers: ['fal', 'replicate', 'together'],
                trending: true,
                downloads: '12M+'
            },
            'black-forest-labs/FLUX.1-dev': {
                id: 'black-forest-labs/FLUX.1-dev',
                name: 'FLUX.1 Dev',
                family: 'flux',
                author: 'Black Forest Labs',
                category: 'vision',
                params: '12B',
                contextLength: null,
                license: 'FLUX.1-dev Non-Commercial',
                description: 'High-quality image generation with more steps for detailed output',
                tags: ['image-generation', 'high-quality', 'text-to-image'],
                quantizations: ['bf16', 'fp8'],
                providers: ['fal', 'replicate'],
                trending: true,
                downloads: '8M+'
            },
            'stabilityai/stable-diffusion-xl-base-1.0': {
                id: 'stabilityai/stable-diffusion-xl-base-1.0',
                name: 'Stable Diffusion XL',
                family: 'sdxl',
                author: 'Stability AI',
                category: 'vision',
                params: '3.5B',
                contextLength: null,
                license: 'Stability AI Community',
                description: 'Industry-standard text-to-image model with massive ecosystem',
                tags: ['image-generation', 'popular', 'customizable', 'lora'],
                quantizations: ['fp16', 'fp32'],
                providers: ['fal', 'replicate', 'hf-inference'],
                trending: false,
                downloads: '20M+'
            },
            'llava-hf/llava-v1.6-34b-hf': {
                id: 'llava-hf/llava-v1.6-34b-hf',
                name: 'LLaVA 1.6 34B',
                family: 'llava',
                author: 'LLaVA Team',
                category: 'vision',
                params: '34B',
                contextLength: 4096,
                license: 'Apache 2.0',
                description: 'Leading open vision-language model for image understanding',
                tags: ['vision-language', 'image-understanding', 'vqa'],
                quantizations: ['bf16', 'fp8'],
                providers: ['together', 'replicate'],
                trending: false,
                downloads: '3M+'
            },
            'Salesforce/blip2-opt-6.7b': {
                id: 'Salesforce/blip2-opt-6.7b',
                name: 'BLIP-2 6.7B',
                family: 'blip',
                author: 'Salesforce',
                category: 'vision',
                params: '6.7B',
                contextLength: 512,
                license: 'MIT',
                description: 'Efficient vision-language model for image captioning and VQA',
                tags: ['image-captioning', 'vqa', 'efficient'],
                quantizations: ['fp16'],
                providers: ['hf-inference'],
                trending: false,
                downloads: '5M+'
            },

            // ==========================================
            // MULTIMODAL MODELS
            // ==========================================
            'meta-llama/Llama-3.2-11B-Vision-Instruct': {
                id: 'meta-llama/Llama-3.2-11B-Vision-Instruct',
                name: 'Llama 3.2 11B Vision',
                family: 'llama',
                author: 'Meta',
                category: 'multimodal',
                params: '11B',
                contextLength: 128000,
                license: 'Llama 3.2 Community',
                description: 'Meta\'s multimodal Llama with text and image understanding',
                tags: ['multimodal', 'vision', 'text', 'instruction-tuned'],
                quantizations: ['bf16', 'fp8', 'gguf'],
                providers: ['together', 'fireworks', 'ollama'],
                trending: true,
                downloads: '6M+'
            },
            'meta-llama/Llama-3.2-90B-Vision-Instruct': {
                id: 'meta-llama/Llama-3.2-90B-Vision-Instruct',
                name: 'Llama 3.2 90B Vision',
                family: 'llama',
                author: 'Meta',
                category: 'multimodal',
                params: '90B',
                contextLength: 128000,
                license: 'Llama 3.2 Community',
                description: 'Large multimodal Llama with advanced image reasoning capabilities',
                tags: ['multimodal', 'vision', 'reasoning', 'frontier'],
                quantizations: ['bf16', 'fp8'],
                providers: ['together', 'fireworks'],
                trending: true,
                downloads: '4M+'
            },
            'HuggingFaceM4/Idefics3-8B-Llama3': {
                id: 'HuggingFaceM4/Idefics3-8B-Llama3',
                name: 'Idefics3 8B',
                family: 'idefics',
                author: 'HuggingFace',
                category: 'multimodal',
                params: '8B',
                contextLength: 8192,
                license: 'Apache 2.0',
                description: 'HuggingFace\'s open multimodal model for image-text understanding',
                tags: ['multimodal', 'vision', 'document-understanding'],
                quantizations: ['bf16', 'fp8'],
                providers: ['hf-inference'],
                trending: false,
                downloads: '2M+'
            },

            // ==========================================
            // AUDIO MODELS
            // ==========================================
            'openai/whisper-large-v3': {
                id: 'openai/whisper-large-v3',
                name: 'Whisper Large V3',
                family: 'whisper',
                author: 'OpenAI',
                category: 'audio',
                params: '1.5B',
                contextLength: null,
                license: 'Apache 2.0',
                description: 'State-of-the-art speech recognition supporting 100+ languages',
                tags: ['speech-to-text', 'transcription', 'multilingual', 'translation'],
                quantizations: ['fp16', 'fp32', 'ggml'],
                providers: ['hf-inference', 'replicate'],
                trending: true,
                downloads: '30M+'
            },
            'openai/whisper-large-v3-turbo': {
                id: 'openai/whisper-large-v3-turbo',
                name: 'Whisper Large V3 Turbo',
                family: 'whisper',
                author: 'OpenAI',
                category: 'audio',
                params: '809M',
                contextLength: null,
                license: 'Apache 2.0',
                description: 'Faster Whisper variant with 4x speedup and near-identical accuracy',
                tags: ['speech-to-text', 'fast', 'transcription'],
                quantizations: ['fp16', 'fp32'],
                providers: ['hf-inference'],
                trending: true,
                downloads: '10M+'
            },
            'facebook/musicgen-large': {
                id: 'facebook/musicgen-large',
                name: 'MusicGen Large',
                family: 'musicgen',
                author: 'Meta',
                category: 'audio',
                params: '3.3B',
                contextLength: null,
                license: 'CC-BY-NC',
                description: 'Text-to-music generation model, creates high-quality music from prompts',
                tags: ['music-generation', 'text-to-music', 'creative'],
                quantizations: ['fp16'],
                providers: ['hf-inference', 'replicate'],
                trending: true,
                downloads: '5M+'
            },

            // ==========================================
            // EMBEDDING MODELS
            // ==========================================
            'BAAI/bge-large-en-v1.5': {
                id: 'BAAI/bge-large-en-v1.5',
                name: 'BGE Large EN v1.5',
                family: 'bge',
                author: 'BAAI',
                category: 'embedding',
                params: '335M',
                contextLength: 512,
                license: 'MIT',
                description: 'Top-performing English text embedding model for RAG and search',
                tags: ['embedding', 'retrieval', 'rag', 'search'],
                quantizations: ['fp16', 'fp32'],
                providers: ['hf-inference'],
                trending: true,
                downloads: '25M+'
            },
            'sentence-transformers/all-MiniLM-L6-v2': {
                id: 'sentence-transformers/all-MiniLM-L6-v2',
                name: 'All-MiniLM-L6-v2',
                family: 'minilm',
                author: 'Sentence Transformers',
                category: 'embedding',
                params: '22M',
                contextLength: 256,
                license: 'Apache 2.0',
                description: 'Ultra-compact embedding model, perfect for resource-constrained envs',
                tags: ['embedding', 'compact', 'fast', 'semantic-search'],
                quantizations: ['fp16', 'fp32'],
                providers: ['hf-inference'],
                trending: false,
                downloads: '50M+'
            },
            'BAAI/bge-m3': {
                id: 'BAAI/bge-m3',
                name: 'BGE-M3',
                family: 'bge',
                author: 'BAAI',
                category: 'embedding',
                params: '568M',
                contextLength: 8192,
                license: 'MIT',
                description: 'Multi-lingual, multi-granularity embedding model with 8K context',
                tags: ['embedding', 'multilingual', 'long-context', 'retrieval'],
                quantizations: ['fp16', 'fp32'],
                providers: ['hf-inference'],
                trending: true,
                downloads: '15M+'
            },
            'Alibaba-NLP/gte-Qwen2-7B-instruct': {
                id: 'Alibaba-NLP/gte-Qwen2-7B-instruct',
                name: 'GTE-Qwen2 7B',
                family: 'gte',
                author: 'Alibaba',
                category: 'embedding',
                params: '7B',
                contextLength: 32768,
                license: 'Apache 2.0',
                description: 'Instruction-tuned embedding model with 32K context for long documents',
                tags: ['embedding', 'long-context', 'instruction-tuned', 'rag'],
                quantizations: ['bf16', 'fp16'],
                providers: ['hf-inference', 'together'],
                trending: false,
                downloads: '3M+'
            }
        };
    }

    // ==================== QUERY METHODS ====================

    getAllModels() {
        return Object.values(this.models);
    }

    getModel(id) {
        return this.models[id] || null;
    }

    getModelsByCategory(category) {
        return Object.values(this.models).filter(m => m.category === category);
    }

    getModelsByProvider(providerId) {
        return Object.values(this.models).filter(m => m.providers.includes(providerId));
    }

    getModelsByFamily(family) {
        return Object.values(this.models).filter(m => m.family === family.toLowerCase());
    }

    getTrendingModels() {
        return Object.values(this.models).filter(m => m.trending);
    }

    searchModels(query) {
        const q = query.toLowerCase();
        return Object.values(this.models).filter(m =>
            m.name.toLowerCase().includes(q) ||
            m.id.toLowerCase().includes(q) ||
            m.family.toLowerCase().includes(q) ||
            m.author.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q) ||
            m.tags.some(t => t.toLowerCase().includes(q)) ||
            m.category.toLowerCase().includes(q)
        );
    }

    // ==================== STATS ====================

    getStats() {
        const models = Object.values(this.models);
        const byCategory = {};
        const byFamily = {};
        const byAuthor = {};

        for (const m of models) {
            byCategory[m.category] = (byCategory[m.category] || 0) + 1;
            byFamily[m.family] = (byFamily[m.family] || 0) + 1;
            byAuthor[m.author] = (byAuthor[m.author] || 0) + 1;
        }

        return {
            totalModels: models.length,
            categories: Object.keys(byCategory).length,
            trendingCount: models.filter(m => m.trending).length,
            byCategory,
            byFamily,
            byAuthor
        };
    }
}

module.exports = new ModelRegistry();