# 🎭 GOAT AI Agent System — Integration Guide

## Overview
The GOAT AI Agent System provides 17 specialized AI assistants, each with unique personalities, expertise, and capabilities. The system is integrated globally via `_app.js` and appears as a floating widget on every page.

## Architecture

### Files Added/Modified
| File | Type | Purpose |
|------|------|---------|
| `components/AIAgentSystem.js` | **NEW** | Floating UI widget with 17 agents + chat interface |
| `components/ModelRegistry.js` | **NEW** | 100+ model catalog, 27+ inference providers, explorer UI |
| `pages/api/ai-assistant.js` | **NEW** | Backend API — routes to Gemini → OpenAI → Claude fallback |
| `pages/api/hf-inference.js` | **NEW** | Universal inference API for 11+ providers |
| `pages/model-registry.js` | **NEW** | Full-page model browser |
| `pages/_app.js` | **MODIFIED** | Added AIAgentSystem globally + /model-registry route |
| `.env.example` | **MODIFIED** | Added 14 new provider API keys |

### AI Agents (17 Specialists)
| # | Icon | Name | Title | Domain |
|---|------|------|-------|--------|
| 1 | 🌟 | **Nova** | AI Studio Architect | Prompt engineering, model selection |
| 2 | 🎨 | **Chroma** | Visual Arts Director | DALL-E, SD, Flux, art direction |
| 3 | 💻 | **Cipher** | Code Architect | Full-stack dev, debugging |
| 4 | ✍️ | **Quill** | Content Maestro | Copywriting, content creation |
| 5 | 🔬 | **Sage** | Research Intelligence | Deep research, data analysis |
| 6 | 🛡️ | **Viper** | Cyber Security Sentinel | Red teaming, security |
| 7 | 🎵 | **Echo** | Music Production Maestro | Beats, mixing, mastering |
| 8 | 🎬 | **Luna** | Video Production Director | Sora, cinematography |
| 9 | 📊 | **Matrix** | Analytics & Insights Engine | Data viz, business intel |
| 10 | 💰 | **Fortuna** | Royalty & Revenue Oracle | Music royalties, publishing |
| 11 | 🚀 | **Atlas** | Infrastructure Commander | DevOps, VPS, deployment |
| 12 | 🐙 | **Nexus** | Open Source Integrator | APIs, packages, tools |
| 13 | 🎤 | **Aria** | Voice & Audio Synthesis | TTS, voice cloning |
| 14 | 🌈 | **Prism** | Animation & 3D Director | Motion graphics, Unreal |
| 15 | 🎪 | **Tempo** | Events & Booking Manager | Concerts, tours |
| 16 | 🥷 | **Shadow** | Super Ninja Ops | Sysadmin, advanced ops |
| 17 | 📝 | **Docu** | Document Intelligence | Contracts, templates |

### Inference Providers (27+)
- **Tier 1 — Cloud Primary:** Google Gemini, OpenAI, Anthropic Claude
- **Tier 2 — Fast Inference:** Groq, Cerebras, SambaNova
- **Tier 3 — Open Models:** Together AI, Fireworks, HuggingFace, Cohere
- **Tier 4 — Specialized:** Replicate, Novita, fal.ai, Nscale, Hyperbolic, Featherless
- **Tier 5 — Local:** Ollama, llama.cpp, LM Studio, Jan, vLLM, MLX, SGLang, Docker Model Runner

### Model Catalog (100+ Models)
- **Text (50+):** Gemini 2.5 Pro, GPT-4.1, Claude 4, Llama 4, Qwen 3, DeepSeek V3, Mistral, Phi-4
- **Code (6):** Codestral, DeepSeek Coder, Qwen Coder, StarCoder2, CodeLlama, CodeGemma
- **Image (8):** DALL-E 3, SDXL, Flux Pro, SD3, Imagen 3, Kandinsky, Playground
- **Video (4):** Sora, Runway Gen-3, Kling 1.6, Pika 1.5
- **Audio (5):** MusicGen, Bark, AudioCraft, XTTS v2, Stable Audio
- **Vision (3):** GPT-4V, Gemini Pro Vision, LLaVA
- **Embeddings (4):** text-embedding-3, Cohere Embed, BGE, Nomic
- **Safety (2):** Llama Guard 3, ShieldGemma
- **GOAT Custom (3):** GOAT Royalty Agent, Code Ninja, Creative Director

## Environment Variables
```env
GOOGLE_AI_API_KEY=         # Gemini
OPENAI_API_KEY=            # GPT-4, DALL-E, Whisper
ANTHROPIC_API_KEY=         # Claude
GROQ_API_KEY=              # Groq LPU
CEREBRAS_API_KEY=          # Cerebras
SAMBANOVA_API_KEY=         # SambaNova
TOGETHER_API_KEY=          # Together AI
FIREWORKS_API_KEY=         # Fireworks
HUGGINGFACE_API_KEY=       # HuggingFace Hub
COHERE_API_KEY=            # Cohere
REPLICATE_API_KEY=         # Replicate
NOVITA_API_KEY=            # Novita AI
FAL_API_KEY=               # fal.ai
OLLAMA_BASE_URL=           # Ollama (local)
```