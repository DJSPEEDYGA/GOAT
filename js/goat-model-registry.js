(function () {
  "use strict";

  /* GOAT Model Registry — every agent gets the full roster, plus
     manually-added models per drive / computer (saved locally). */

  const STORAGE_KEY = "goat-custom-models-v1";

  const builtinModels = [
    // Google Gemma line
    { id: "gemma-4-e2b", name: "Gemma 4 E2B", provider: "google", size: "2B", runtime: "ollama" },
    { id: "gemma-4-e4b", name: "Gemma 4 E4B", provider: "google", size: "4B", runtime: "ollama" },
    { id: "gemma-4-26b-a4b", name: "Gemma 4 26B-A4B", provider: "google", size: "26B", runtime: "ollama" },
    { id: "gemma-4-31b", name: "Gemma 4 31B", provider: "google", size: "31B", runtime: "ollama" },
    { id: "gemma-3-270m", name: "Gemma 3 270M", provider: "google", size: "270M", runtime: "ollama" },
    { id: "gemma-3-1b", name: "Gemma 3 1B", provider: "google", size: "1B", runtime: "ollama" },
    { id: "gemma-3-4b", name: "Gemma 3 4B", provider: "google", size: "4B", runtime: "ollama" },
    { id: "gemma-3-12b", name: "Gemma 3 12B", provider: "google", size: "12B", runtime: "ollama" },
    { id: "gemma-3-27b", name: "Gemma 3 27B", provider: "google", size: "27B", runtime: "ollama" },
    { id: "gemma-2-9b", name: "Gemma 2 9B IT", provider: "google", size: "9B", runtime: "nim" },
    { id: "gemma-2-27b", name: "Gemma 2 27B IT", provider: "google", size: "27B", runtime: "nim" },
    { id: "gemma-7b", name: "Gemma 7B", provider: "google", size: "7B", runtime: "ollama" },
    { id: "function-gemma", name: "FunctionGemma", provider: "google", size: "4B", runtime: "ollama" },
    // NVIDIA
    { id: "nemotron3-nano-4b", name: "Nemotron3 Nano 4B", provider: "nvidia", size: "4B", runtime: "nim" },
    { id: "nemotron3-nano-30b", name: "Nemotron3 Nano 30B-A3B", provider: "nvidia", size: "30B", runtime: "nim" },
    { id: "nemotron-nano-9b-v2", name: "Nemotron Nano 9B v2", provider: "nvidia", size: "9B", runtime: "nim" },
    { id: "nemotron-nano-12b-vl", name: "Nemotron Nano 12B VL", provider: "nvidia", size: "12B", runtime: "nim" },
    { id: "nemotron-4-340b", name: "Nemotron-4 340B Instruct", provider: "nvidia", size: "340B", runtime: "nim" },
    { id: "nv-embedqa-e5-v5", name: "NV-EmbedQA E5 v5", provider: "nvidia", size: "0.3B", runtime: "nim" },
    { id: "cosmos-reason-1-7b", name: "Cosmos Reason 1 7B", provider: "nvidia", size: "7B", runtime: "nim" },
    { id: "cosmos-reason-2-2b", name: "Cosmos Reason 2 2B", provider: "nvidia", size: "2B", runtime: "nim" },
    { id: "cosmos-reason-2-8b", name: "Cosmos Reason 2 8B", provider: "nvidia", size: "8B", runtime: "nim" },
    // Alibaba Qwen
    { id: "qwen3.5-35b-moe", name: "Qwen 3.5 35B-A3B (MoE)", provider: "alibaba", size: "35B", runtime: "ollama" },
    { id: "qwen3.5-27b", name: "Qwen 3.5 27B", provider: "alibaba", size: "27B", runtime: "ollama" },
    { id: "qwen3.5-9b", name: "Qwen 3.5 9B", provider: "alibaba", size: "9B", runtime: "ollama" },
    { id: "qwen3.5-4b", name: "Qwen 3.5 4B", provider: "alibaba", size: "4B", runtime: "ollama" },
    { id: "qwen3.5-0.8b", name: "Qwen 3.5 0.8B", provider: "alibaba", size: "0.8B", runtime: "ollama" },
    { id: "qwen3-4b", name: "Qwen 3 4B", provider: "alibaba", size: "4B", runtime: "ollama" },
    { id: "qwen3-8b", name: "Qwen 3 8B", provider: "alibaba", size: "8B", runtime: "ollama" },
    { id: "qwen3-30b-moe", name: "Qwen 3 30B-A3B (MoE)", provider: "alibaba", size: "30B", runtime: "ollama" },
    { id: "qwen3-32b", name: "Qwen 3 32B", provider: "alibaba", size: "32B", runtime: "ollama" },
    { id: "qwen3-vl-4b", name: "Qwen 3 VL 4B", provider: "alibaba", size: "4B", runtime: "ollama" },
    { id: "qwen3-vl-8b", name: "Qwen 3 VL 8B", provider: "alibaba", size: "8B", runtime: "ollama" },
    { id: "qwen2-7b", name: "Qwen 2 7B", provider: "alibaba", size: "7B", runtime: "ollama" },
    // OpenAI OSS
    { id: "gpt-oss-20b", name: "GPT OSS 20B", provider: "openai", size: "20B", runtime: "ollama" },
    { id: "gpt-oss-120b", name: "GPT OSS 120B", provider: "openai", size: "120B", runtime: "ollama" },
    // Mistral
    { id: "ministral-3-3b-instruct", name: "Ministral 3 3B Instruct", provider: "mistral", size: "3B", runtime: "ollama" },
    { id: "ministral-3-8b-instruct", name: "Ministral 3 8B Instruct", provider: "mistral", size: "8B", runtime: "ollama" },
    { id: "ministral-3-14b-instruct", name: "Ministral 3 14B Instruct", provider: "mistral", size: "14B", runtime: "ollama" },
    { id: "ministral-3-3b-reasoning", name: "Ministral 3 3B Reasoning", provider: "mistral", size: "3B", runtime: "ollama" },
    { id: "ministral-3-8b-reasoning", name: "Ministral 3 8B Reasoning", provider: "mistral", size: "8B", runtime: "ollama" },
    { id: "ministral-3-14b-reasoning", name: "Ministral 3 14B Reasoning", provider: "mistral", size: "14B", runtime: "ollama" },
    { id: "mistral-7b", name: "Mistral 7B Instruct", provider: "mistral", size: "7B", runtime: "ollama" },
    { id: "mixtral-8x7b", name: "Mixtral 8x7B Instruct", provider: "mistral", size: "8x7B", runtime: "ollama" },
    { id: "mixtral-8x22b", name: "Mixtral 8x22B Instruct", provider: "mistral", size: "8x22B", runtime: "nim" },
    // Meta Llama
    { id: "llama-3.2-1b", name: "Llama 3.2 1B", provider: "meta", size: "1B", runtime: "ollama" },
    { id: "llama-3.2-3b", name: "Llama 3.2 3B", provider: "meta", size: "3B", runtime: "ollama" },
    { id: "llama-3.1-8b", name: "Llama 3.1 8B", provider: "meta", size: "8B", runtime: "ollama" },
    { id: "llama-3.1-70b", name: "Llama 3.1 70B", provider: "meta", size: "70B", runtime: "ollama" },
    { id: "codellama-13b", name: "Code Llama 13B", provider: "meta", size: "13B", runtime: "ollama" },
    { id: "codellama-34b", name: "Code Llama 34B Instruct", provider: "meta", size: "34B", runtime: "nim" },
    // Microsoft Phi
    { id: "phi-3-mini", name: "Phi-3 Mini 128K", provider: "microsoft", size: "3.8B", runtime: "ollama" },
    { id: "phi-3-medium", name: "Phi-3 Medium 128K", provider: "microsoft", size: "14B", runtime: "nim" },
    // Community / other
    { id: "starcoder2-15b", name: "StarCoder2 15B", provider: "bigcode", size: "15B", runtime: "nim" },
    { id: "neural-chat-7b", name: "Neural Chat 7B", provider: "intel", size: "7B", runtime: "ollama" },
    { id: "solar-10.7b", name: "Solar 10.7B", provider: "upstage", size: "10.7B", runtime: "ollama" },
    { id: "stablelm-zephyr-3b", name: "StableLM Zephyr 3B", provider: "stability", size: "3B", runtime: "ollama" },
    { id: "yi-34b", name: "Yi 34B", provider: "01ai", size: "34B", runtime: "ollama" }
  ];

  const agents = [
    { id: "oscar", name: "Oscar", role: "Master ops brain — studio, chat, and computer control", href: "goat-master-oscar.html", accent: "#f2c766" },
    { id: "agent-007", name: "AGENT-007", role: "Field agent — code, deploys, and mission execution", href: "agents-brain.html", accent: "#7ee0a3" },
    { id: "money-penny", name: "Ms. Money Penny", role: "Store command, royalties, and money engine", href: "money-penny-codex.html", accent: "#f5c542" },
    { id: "commander", name: "Commander", role: "Strategy, planning, and crew coordination", href: "agents-brain.html", accent: "#8ab4ff" },
    { id: "tech-ninja", name: "Tech Ninja", role: "Python, JS, DevOps, debugging, and AI/ML", href: "agents-brain.html", accent: "#c792ea" },
    { id: "data-miner", name: "Data Miner", role: "Catalog intel, analytics, and royalty recovery data", href: "agents-brain.html", accent: "#6fd3d3" },
    { id: "luna", name: "Luna", role: "Creative direction — video, art, and campaign visuals", href: "agents-brain.html", accent: "#ff9ec4" },
    { id: "guardian", name: "Guardian", role: "Security, vault access, and device confidence", href: "goat-security.html", accent: "#ff8a65" }
  ];

  function loadCustom() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function saveCustom(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (err) { /* storage unavailable — session-only */ }
  }

  function allModels() {
    return builtinModels.concat(loadCustom());
  }

  function addCustomModel(model) {
    const entry = {
      id: "custom-" + Date.now().toString(36),
      name: String(model.name || "").trim(),
      provider: String(model.provider || "custom").trim() || "custom",
      size: String(model.size || "?").trim() || "?",
      runtime: String(model.runtime || "local").trim() || "local",
      location: String(model.location || "").trim(),
      custom: true
    };
    if (!entry.name) return null;
    const list = loadCustom();
    list.push(entry);
    saveCustom(list);
    return entry;
  }

  function removeCustomModel(id) {
    saveCustom(loadCustom().filter((m) => m.id !== id));
  }

  window.GoatModelRegistry = {
    agents: agents,
    builtinModels: builtinModels,
    allModels: allModels,
    customModels: loadCustom,
    addCustomModel: addCustomModel,
    removeCustomModel: removeCustomModel
  };
}());
