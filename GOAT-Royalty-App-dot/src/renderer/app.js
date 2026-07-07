// ============================================================
// Super GOAT Royalty 3.1 - Renderer Application Logic
// NVIDIA NIM + Hugging Face + OpenRouter + GOAT Brain
// Built for Harvey Miller (DJ Speedy)
// ============================================================

// ── STATE ────────────────────────────────────────────────────
const state = {
  chats: [], currentChatId: null, messages: [],
  isProcessing: false, attachedFiles: [],
  sidebarOpen: true, toolPanelOpen: false, currentTool: null,
  settings: {}, terminalHistory: [], terminalOutput: '',
  goatBrainEnabled: false, goatBrainMode: 'specialist',
  goatBrainModels: [],
  activeProvider: 'nvidia', activeModel: 'meta/llama-3.3-70b-instruct',
  modelSearchQuery: '', categoryFilter: 'all'
};

// ── NVIDIA NIM MODELS (inline for renderer) ──────────────────
const NVIDIA_MODELS = {
  'meta/llama-3.3-70b-instruct': { name: 'Llama 3.3 70B', provider: 'Meta', params: '70B', category: 'text-generation', context: 131072 },
  'meta/llama-3.1-405b-instruct': { name: 'Llama 3.1 405B', provider: 'Meta', params: '405B', category: 'text-generation', context: 131072 },
  'meta/llama-3.1-70b-instruct': { name: 'Llama 3.1 70B', provider: 'Meta', params: '70B', category: 'text-generation', context: 131072 },
  'meta/llama-3.1-8b-instruct': { name: 'Llama 3.1 8B', provider: 'Meta', params: '8B', category: 'text-generation', context: 131072 },
  'meta/llama-3.2-3b-instruct': { name: 'Llama 3.2 3B', provider: 'Meta', params: '3B', category: 'text-generation', context: 131072 },
  'nvidia/llama-3.1-nemotron-70b-instruct': { name: 'Nemotron 70B', provider: 'NVIDIA', params: '70B', category: 'text-generation', context: 32768 },
  'nvidia/nemotron-4-340b-instruct': { name: 'Nemotron 340B', provider: 'NVIDIA', params: '340B', category: 'text-generation', context: 4096 },
  'deepseek-ai/deepseek-r1': { name: 'DeepSeek R1', provider: 'DeepSeek', params: '671B', category: 'reasoning', context: 131072 },
  'deepseek-ai/deepseek-r1-distill-llama-70b': { name: 'DeepSeek R1 Distill 70B', provider: 'DeepSeek', params: '70B', category: 'reasoning', context: 131072 },
  'qwen/qwen2.5-72b-instruct': { name: 'Qwen 2.5 72B', provider: 'Alibaba', params: '72B', category: 'text-generation', context: 131072 },
  'qwen/qwen2.5-coder-32b-instruct': { name: 'Qwen 2.5 Coder 32B', provider: 'Alibaba', params: '32B', category: 'code', context: 131072 },
  'qwen/qwq-32b': { name: 'QwQ 32B', provider: 'Alibaba', params: '32B', category: 'reasoning', context: 131072 },
  'mistralai/mistral-large-2-instruct': { name: 'Mistral Large 2', provider: 'Mistral AI', params: '123B', category: 'text-generation', context: 131072 },
  'mistralai/mixtral-8x22b-instruct-v0.1': { name: 'Mixtral 8x22B', provider: 'Mistral AI', params: '8x22B', category: 'text-generation', context: 65536 },
  'mistralai/codestral-22b-instruct-v0.1': { name: 'Codestral 22B', provider: 'Mistral AI', params: '22B', category: 'code', context: 32768 },
  'mistralai/pixtral-large-2501': { name: 'Pixtral Large', provider: 'Mistral AI', params: '124B', category: 'vision', context: 131072 },
  'google/gemma-2-27b-it': { name: 'Gemma 2 27B', provider: 'Google', params: '27B', category: 'text-generation', context: 8192 },
  'microsoft/phi-3.5-mini-instruct': { name: 'Phi 3.5 Mini', provider: 'Microsoft', params: '3.8B', category: 'text-generation', context: 131072 },
  'microsoft/phi-3-vision-128k-instruct': { name: 'Phi 3 Vision', provider: 'Microsoft', params: '4.2B', category: 'vision', context: 131072 },
  'ibm/granite-34b-code-instruct': { name: 'Granite 34B Code', provider: 'IBM', params: '34B', category: 'code', context: 8192 },
  'meta/llama-3.2-90b-vision-instruct': { name: 'Llama 3.2 90B Vision', provider: 'Meta', params: '90B', category: 'vision', context: 131072 },
  'meta/codellama-70b': { name: 'Code Llama 70B', provider: 'Meta', params: '70B', category: 'code', context: 16384 },
  'databricks/dbrx-instruct': { name: 'DBRX', provider: 'Databricks', params: '132B', category: 'text-generation', context: 32768 },
  'writer/palmyra-x-004': { name: 'Palmyra X 004', provider: 'Writer', params: 'Unknown', category: 'text-generation', context: 131072 },
  'meta/llama-guard-3-8b': { name: 'Llama Guard 3', provider: 'Meta', params: '8B', category: 'safety', context: 8192 },
  'bigcode/starcoder2-15b': { name: 'StarCoder2 15B', provider: 'BigCode', params: '15B', category: 'code', context: 16384 }
};

const PROVIDER_MODELS = {
  groq: [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Groq)', params: '70B' },
    { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 70B (Groq)', params: '70B' },
    { id: 'qwen-qwq-32b', name: 'QwQ 32B (Groq)', params: '32B' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (Groq)', params: '8x7B' },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B (Groq)', params: '9B' }
  ],
  cerebras: [
    { id: 'llama3.3-70b', name: 'Llama 3.3 70B (Cerebras)', params: '70B' },
    { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 70B (Cerebras)', params: '70B' }
  ],
  sambanova: [
    { id: 'Meta-Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B (SambaNova)', params: '70B' },
    { id: 'DeepSeek-R1', name: 'DeepSeek R1 (SambaNova)', params: '671B' },
    { id: 'Meta-Llama-3.1-405B-Instruct', name: 'Llama 3.1 405B (SambaNova)', params: '405B' }
  ],
  together: [
    { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', name: 'Llama 3.3 70B Turbo', params: '70B' },
    { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1 (Together)', params: '671B' },
    { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Qwen Coder 32B (Together)', params: '32B' }
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', params: 'Unknown' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', params: 'Unknown' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', params: 'Unknown' },
    { id: 'o1-preview', name: 'o1 Preview', params: 'Unknown' }
  ],
  google: [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', params: 'Unknown' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', params: 'Unknown' }
  ],
  anthropic: [
    { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', params: 'Unknown' },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', params: 'Unknown' }
  ],
  openrouter: [
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (OR)', params: 'Unknown' },
    { id: 'openai/gpt-4o', name: 'GPT-4o (OR)', params: 'Unknown' },
    { id: 'google/gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (OR)', params: 'Unknown' },
    { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (OR)', params: '671B' },
    { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B (OR)', params: '70B' }
  ]
};

const PROVIDER_ENDPOINTS = {
  nvidia: 'https://integrate.api.nvidia.com/v1',
  openai: 'https://api.openai.com/v1',
  google: 'https://generativelanguage.googleapis.com',
  anthropic: 'https://api.anthropic.com/v1',
  groq: 'https://api.groq.com/openai/v1',
  cerebras: 'https://api.cerebras.ai/v1',
  sambanova: 'https://api.sambanova.ai/v1',
  together: 'https://api.together.xyz/v1',
  fireworks: 'https://api.fireworks.ai/inference/v1',
  novita: 'https://api.novita.ai/v3/openai',
  hyperbolic: 'https://api.hyperbolic.xyz/v1',
  openrouter: 'https://openrouter.ai/api/v1'
};

// ── TOTAL MODEL COUNT ────────────────────────────────────────
function getTotalModelCount() {
  let count = Object.keys(NVIDIA_MODELS).length;
  for (const models of Object.values(PROVIDER_MODELS)) count += models.length;
  return count;
}


// ── STREAMING RESPONSE SUPPORT ──────────────────────────────────────
async function callNvidiaStreaming(messages, model, apiKey, onChunk) {
  if (!apiKey) throw new Error("NVIDIA API key not configured. Get one free at build.nvidia.com");
  const body = { model, messages: [{ role: "system", content: getSystemPrompt() }, ...messages.map(m => ({ role: m.role, content: m.content }))], max_tokens: 4096, temperature: 0.7, stream: true };
  const resp = await fetch(`${PROVIDER_ENDPOINTS.nvidia}/chat/completions`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` }, body: JSON.stringify(body) });
  if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.detail || e.error?.message || `NVIDIA NIM error: ${resp.status}`); }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
    for (const line of lines) {
      const data = line.slice(6);
      if (data === "[DONE]") continue;
      try { const parsed = JSON.parse(data); const delta = parsed.choices?.[0]?.delta?.content || ""; if (delta) { fullContent += delta; if (onChunk) onChunk(delta, fullContent); } } catch(e) {}
    }
  }
  return { content: fullContent, model, provider: "nvidia" };
}

// ── INITIALIZATION ───────────────────────────────────────────
async function init() {
  state.settings = await window.superNinja.getSettings();
  document.documentElement.setAttribute('data-theme', state.settings.theme || 'dark');
  state.activeProvider = state.settings.activeProvider || 'nvidia';
  state.activeModel = state.settings.activeModel || 'meta/llama-3.3-70b-instruct';
  state.goatBrainEnabled = state.settings.goatBrainEnabled || false;
  state.goatBrainMode = state.settings.goatBrainMode || 'specialist';
  loadChats();
  setupMainProcessListeners();
  loadSettingsUI();
  updateModelIndicator();
  buildModelSelector();
  document.getElementById('message-input').focus();
  console.log('🐐 Super GOAT Royalty 3.1 initialized — ' + getTotalModelCount() + ' models ready');
}

function setupMainProcessListeners() {
  window.superNinja.on('new-chat', () => newChat());
  window.superNinja.on('save-chat', () => saveCurrentChat());
  window.superNinja.on('open-settings', (tab) => openSettings(tab));
  window.superNinja.on('open-tool', (tool) => openTool(tool));
  window.superNinja.on('toggle-sidebar', () => toggleSidebar());
  window.superNinja.on('theme-changed', (theme) => setTheme(theme));
  window.superNinja.on('model-changed', ({provider, model}) => {
    state.activeProvider = provider;
    state.activeModel = model;
    updateModelIndicator();
    buildModelSelector();
  });
  window.superNinja.on('goat-brain-toggled', (enabled) => {
    state.goatBrainEnabled = enabled;
    updateGOATBrainUI();
  });
  window.superNinja.on('files-opened', (filePaths) => {
    filePaths.forEach(fp => addAttachedFile(fp));
  });
}

function loadSettingsUI() {
  const s = state.settings;
  const setVal = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
  setVal('nvidiaKeyInput', s.nvidiaKey);
  setVal('openrouterKeyInput', s.openrouterKey);
  setVal('openaiKeyInput', s.openaiKey);
  setVal('googleKeyInput', s.googleKey);
  setVal('anthropicKeyInput', s.anthropicKey);
  setVal('groqKeyInput', s.groqKey);
  setVal('cerebrasKeyInput', s.cerebrasKey);
  setVal('sambanovaKeyInput', s.sambanovaKey);
  setVal('togetherKeyInput', s.togetherKey);
  setVal('fireworksKeyInput', s.fireworksKey);
  setVal('huggingfaceKeyInput', s.huggingfaceKey);
  setVal('ollamaUrlInput', s.ollamaUrl);
  setVal('themeSelect', s.theme);
  setVal('spotifyIdInput', s.spotifyClientId);
  setVal('supabaseUrlInput', s.supabaseUrl);
}

function updateModelIndicator() {
  const indicator = document.getElementById('modelIndicator');
  if (!indicator) return;
  const model = NVIDIA_MODELS[state.activeModel];
  const displayName = model ? model.name : state.activeModel.split('/').pop();
  const providerLabel = state.activeProvider.toUpperCase();
  const badgeClass = state.activeProvider === 'nvidia' ? 'nvidia' : (state.goatBrainEnabled ? 'goat' : 'openrouter');
  indicator.innerHTML = `
    <span class="model-dot"></span>
    <span class="model-name">${displayName}</span>
    <span class="model-badge ${badgeClass}">${state.goatBrainEnabled ? '🧠 GOAT' : providerLabel}</span>
  `;
}

function buildModelSelector() {
  const sel = document.getElementById('modelSelector');
  if (!sel) return;
  let html = '<optgroup label="🟢 NVIDIA NIM (build.nvidia.com)">';
  for (const [id, m] of Object.entries(NVIDIA_MODELS)) {
    if (m.category === 'safety') continue;
    html += `<option value="nvidia:${id}" ${state.activeProvider==='nvidia'&&state.activeModel===id?'selected':''}>${m.name} (${m.params})</option>`;
  }
  html += '</optgroup>';
  for (const [prov, models] of Object.entries(PROVIDER_MODELS)) {
    const label = prov === 'openrouter' ? '🌐 OpenRouter (653+ Models)' :
                  prov === 'groq' ? '⚡ Groq (Ultra-Fast)' :
                  prov === 'cerebras' ? '🧠 Cerebras (Fastest)' :
                  prov === 'sambanova' ? '🔷 SambaNova' :
                  prov === 'together' ? '🤝 Together AI' :
                  prov === 'openai' ? '🔵 OpenAI' :
                  prov === 'google' ? '🔵 Google' :
                  prov === 'anthropic' ? '🟠 Anthropic' : prov;
    html += `<optgroup label="${label}">`;
    for (const m of models) {
      html += `<option value="${prov}:${m.id}" ${state.activeProvider===prov&&state.activeModel===m.id?'selected':''}>${m.name}</option>`;
    }
    html += '</optgroup>';
  }
  html += '<optgroup label="🖥️ Local (Ollama)">';
  html += '<option value="ollama:llama3">Ollama - Llama 3</option>';
  html += '<option value="ollama:mistral">Ollama - Mistral</option>';
  html += '<option value="ollama:codellama">Ollama - CodeLlama</option>';
  html += '</optgroup>';
  sel.innerHTML = html;
}

function changeModel(value) {
  const [provider, ...modelParts] = value.split(':');
  const model = modelParts.join(':');
  state.activeProvider = provider;
  state.activeModel = model;
  saveSetting('activeProvider', provider);
  saveSetting('activeModel', model);
  updateModelIndicator();
}

// ── CHAT MANAGEMENT ──────────────────────────────────────────
function newChat() {
  const chatId = 'chat_' + Date.now();
  state.chats.unshift({ id: chatId, title: 'New Chat', messages: [], createdAt: new Date().toISOString(), model: state.activeModel });
  state.currentChatId = chatId;
  state.messages = [];
  renderChatHistory(); clearChatArea(); showWelcomeScreen(); saveChats();
  document.getElementById('message-input').focus();
}

function loadChats() { try { const s = localStorage.getItem('goat_chats_v3'); if (s) state.chats = JSON.parse(s); } catch(e) { state.chats = []; } renderChatHistory(); }
function saveChats() { try { localStorage.setItem('goat_chats_v3', JSON.stringify(state.chats)); } catch(e) {} }
function saveCurrentChat() { if (!state.currentChatId) return; const c = state.chats.find(c => c.id === state.currentChatId); if (c) { c.messages = [...state.messages]; saveChats(); } }

function selectChat(chatId) {
  saveCurrentChat();
  state.currentChatId = chatId;
  const chat = state.chats.find(c => c.id === chatId);
  if (chat) { state.messages = chat.messages || []; renderMessages(); renderChatHistory(); }
}

function deleteChat(chatId, event) {
  event.stopPropagation();
  state.chats = state.chats.filter(c => c.id !== chatId);
  if (state.currentChatId === chatId) { state.currentChatId = null; state.messages = []; clearChatArea(); showWelcomeScreen(); }
  renderChatHistory(); saveChats();
}

function renderChatHistory() {
  const container = document.getElementById('chatHistory');
  container.innerHTML = state.chats.map(chat => `
    <div class="chat-item ${chat.id === state.currentChatId ? 'active' : ''}" data-chat-select="${chat.id}">
      <span class="chat-icon">💬</span>
      <div style="flex:1;min-width:0">
        <div class="chat-title">${escapeHtml(chat.title)}</div>
        <div class="chat-date">${formatDate(chat.createdAt)}</div>
      </div>
      <button data-chat-delete="${chat.id}" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:14px;padding:4px" title="Delete">&times;</button>
    </div>
  `).join('');
}

// ── MESSAGE HANDLING ─────────────────────────────────────────
async function sendMessage() {
  const input = document.getElementById('message-input');
  const text = input.value.trim();
  if (!text || state.isProcessing) return;
  hideWelcomeScreen();
  if (!state.currentChatId) { newChat(); hideWelcomeScreen(); }

  const userMessage = { role: 'user', content: text, timestamp: new Date().toISOString(), files: [...state.attachedFiles] };
  state.messages.push(userMessage);
  renderMessage(userMessage);

  const chat = state.chats.find(c => c.id === state.currentChatId);
  if (chat && chat.title === 'New Chat') { chat.title = text.substring(0, 50) + (text.length > 50 ? '...' : ''); renderChatHistory(); }

  input.value = ''; autoResize(input); clearAttachedFiles();
  state.isProcessing = true; updateSendButton(); showTypingIndicator();

  try {
    const result = await getAIResponse(state.messages);
    removeTypingIndicator();

    const assistantMessage = {
      role: 'assistant', content: result.content || result,
      timestamp: new Date().toISOString(),
      model: result.model || state.activeModel,
      provider: result.provider || state.activeProvider,
      goatBrain: result.mode ? result : null
    };
    state.messages.push(assistantMessage);
    renderMessage(assistantMessage);
    await processToolCalls(assistantMessage.content);
  } catch (error) {
    removeTypingIndicator();
    const errorMessage = { role: 'assistant', content: `**Error:** ${error.message}\n\nCheck your API key in Settings and try again.`, timestamp: new Date().toISOString(), isError: true };
    state.messages.push(errorMessage);
    renderMessage(errorMessage);
  }

  state.isProcessing = false; updateSendButton(); saveCurrentChat(); scrollToBottom();
}

function quickAction(text) { document.getElementById('message-input').value = text; sendMessage(); }

// ── AI PROVIDER ROUTING ──────────────────────────────────────
async function getAIResponse(messages) {
  if (state.goatBrainEnabled) return await callGOATBrain(messages);
  const provider = state.activeProvider;
  const model = state.activeModel;
  const s = state.settings;

  switch (provider) {
    case 'nvidia': return await callNvidia(messages, model, s.nvidiaKey);
    case 'openai': return await callOpenAI(messages, model, s.openaiKey);
    case 'google': return await callGemini(messages, model, s.googleKey);
    case 'anthropic': return await callAnthropic(messages, model, s.anthropicKey);
    case 'groq': return await callOpenAICompatible(PROVIDER_ENDPOINTS.groq, messages, model, s.groqKey, 'Groq');
    case 'cerebras': return await callOpenAICompatible(PROVIDER_ENDPOINTS.cerebras, messages, model, s.cerebrasKey, 'Cerebras');
    case 'sambanova': return await callOpenAICompatible(PROVIDER_ENDPOINTS.sambanova, messages, model, s.sambanovaKey, 'SambaNova');
    case 'together': return await callOpenAICompatible(PROVIDER_ENDPOINTS.together, messages, model, s.togetherKey, 'Together AI');
    case 'fireworks': return await callOpenAICompatible(PROVIDER_ENDPOINTS.fireworks, messages, model, s.fireworksKey, 'Fireworks');
    case 'openrouter': return await callOpenRouter(messages, model, s.openrouterKey);
    case 'ollama': return await callOllama(messages, model, s.ollamaUrl || 'http://localhost:11434');
    default: throw new Error('Unknown provider: ' + provider);
  }
}

function getSystemPrompt() {
  return `You are SuperNinja AI (GOAT Royalty Edition v3.0), powered by 1000+ LLMs via NVIDIA NIM, Hugging Face, OpenRouter, and multiple inference providers. Built for Harvey Miller (DJ Speedy).

You are a full-spectrum autonomous assistant: code, terminal, files, web, music production, royalty calculations, data analysis, images, audio, PDF processing, distribution hub (50+ DSPs), beat maker, blockchain crypto royalties, secure vault, and more.

When asked to run a command, format it as: \`\`\`terminal\ncommand\n\`\`\`
When writing code, specify the language. Be concise, helpful, proactive. Use Markdown.`;
}

// ── NVIDIA NIM ───────────────────────────────────────────────
async function callNvidia(messages, model, apiKey) {
  if (!apiKey) throw new Error('NVIDIA API key not configured. Get one free at build.nvidia.com');
  const body = { model, messages: [{ role: 'system', content: getSystemPrompt() }, ...messages.map(m => ({ role: m.role, content: m.content }))], max_tokens: 4096, temperature: 0.7, stream: false };
  const resp = await fetch(`${PROVIDER_ENDPOINTS.nvidia}/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify(body) });
  if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.detail || e.error?.message || `NVIDIA NIM error: ${resp.status}`); }
  const data = await resp.json();
  return { content: data.choices[0].message.content, model, provider: 'nvidia', usage: data.usage };
}

// ── OPENAI ───────────────────────────────────────────────────
async function callOpenAI(messages, model, apiKey) {
  if (!apiKey) throw new Error('OpenAI API key not configured');
  const resp = await fetch(`${PROVIDER_ENDPOINTS.openai}/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify({ model, messages: [{ role: 'system', content: getSystemPrompt() }, ...messages.map(m => ({ role: m.role, content: m.content }))], max_tokens: 4096, temperature: 0.7 }) });
  if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error?.message || `OpenAI error: ${resp.status}`); }
  const data = await resp.json();
  return { content: data.choices[0].message.content, model, provider: 'openai', usage: data.usage };
}

// ── GEMINI ───────────────────────────────────────────────────
async function callGemini(messages, model, apiKey) {
  if (!apiKey) throw new Error('Google AI API key not configured');
  const contents = messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ system_instruction: { parts: [{ text: getSystemPrompt() }] }, contents, generationConfig: { maxOutputTokens: 4096, temperature: 0.7 } }) });
  if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error?.message || `Gemini error: ${resp.status}`); }
  const data = await resp.json();
  return { content: data.candidates[0].content.parts[0].text, model, provider: 'google' };
}

// ── ANTHROPIC ────────────────────────────────────────────────
async function callAnthropic(messages, model, apiKey) {
  if (!apiKey) throw new Error('Anthropic API key not configured');
  const modelMap = { 'claude-3.5-sonnet': 'claude-3-5-sonnet-20241022', 'claude-3-opus': 'claude-3-opus-20240229' };
  const resp = await fetch(`${PROVIDER_ENDPOINTS.anthropic}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body: JSON.stringify({ model: modelMap[model] || model, system: getSystemPrompt(), messages: messages.map(m => ({ role: m.role, content: m.content })), max_tokens: 4096 }) });
  if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error?.message || `Anthropic error: ${resp.status}`); }
  const data = await resp.json();
  return { content: data.content[0].text, model, provider: 'anthropic' };
}

// ── OPENAI-COMPATIBLE (Groq, Cerebras, SambaNova, Together, Fireworks) ──
async function callOpenAICompatible(baseUrl, messages, model, apiKey, providerName) {
  if (!apiKey) throw new Error(`${providerName} API key not configured`);
  const resp = await fetch(`${baseUrl}/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify({ model, messages: [{ role: 'system', content: getSystemPrompt() }, ...messages.map(m => ({ role: m.role, content: m.content }))], max_tokens: 4096, temperature: 0.7, stream: false }) });
  if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error?.message || `${providerName} error: ${resp.status}`); }
  const data = await resp.json();
  return { content: data.choices[0].message.content, model, provider: providerName.toLowerCase(), usage: data.usage };
}

// ── OPENROUTER ───────────────────────────────────────────────
async function callOpenRouter(messages, model, apiKey) {
  if (!apiKey) throw new Error('OpenRouter API key not configured. Get one at openrouter.ai');
  const resp = await fetch(`${PROVIDER_ENDPOINTS.openrouter}/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': 'https://github.com/DJSPEEDYGA/GOAT-Royalty-App.', 'X-Title': 'Super GOAT Royalty 3.1' }, body: JSON.stringify({ model, messages: [{ role: 'system', content: getSystemPrompt() }, ...messages.map(m => ({ role: m.role, content: m.content }))], max_tokens: 4096, temperature: 0.7 }) });
  if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error?.message || `OpenRouter error: ${resp.status}`); }
  const data = await resp.json();
  return { content: data.choices[0].message.content, model: data.model || model, provider: 'openrouter', usage: data.usage };
}

// ── OLLAMA ───────────────────────────────────────────────────
async function callOllama(messages, model, baseUrl) {
  const resp = await fetch(`${baseUrl}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: model.replace('ollama-',''), messages: [{ role: 'system', content: getSystemPrompt() }, ...messages.map(m => ({ role: m.role, content: m.content }))], stream: false }) });
  if (!resp.ok) throw new Error(`Ollama error: ${resp.status}. Make sure Ollama is running.`);
  const data = await resp.json();
  return { content: data.message.content, model, provider: 'ollama' };
}

// ── GOAT BRAIN ORCHESTRATOR ──────────────────────────────────
async function callGOATBrain(messages) {
  const mode = state.goatBrainMode;
  const s = state.settings;

  // Build available model configs from whatever keys are set
  const configs = [];
  if (s.nvidiaKey) configs.push({ provider: 'nvidia', modelId: 'meta/llama-3.3-70b-instruct', key: s.nvidiaKey });
  if (s.nvidiaKey) configs.push({ provider: 'nvidia', modelId: 'deepseek-ai/deepseek-r1', key: s.nvidiaKey });
  if (s.nvidiaKey) configs.push({ provider: 'nvidia', modelId: 'qwen/qwen2.5-72b-instruct', key: s.nvidiaKey });
  if (s.groqKey) configs.push({ provider: 'groq', modelId: 'llama-3.3-70b-versatile', key: s.groqKey });
  if (s.cerebrasKey) configs.push({ provider: 'cerebras', modelId: 'llama3.3-70b', key: s.cerebrasKey });
  if (s.togetherKey) configs.push({ provider: 'together', modelId: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', key: s.togetherKey });
  if (s.openrouterKey) configs.push({ provider: 'openrouter', modelId: 'meta-llama/llama-3.3-70b-instruct', key: s.openrouterKey });
  if (s.openaiKey) configs.push({ provider: 'openai', modelId: 'gpt-4o', key: s.openaiKey });
  if (s.anthropicKey) configs.push({ provider: 'anthropic', modelId: 'claude-3.5-sonnet', key: s.anthropicKey });

  if (configs.length < 2 && mode !== 'specialist') {
    throw new Error(`GOAT Brain ${mode} mode needs at least 2 configured providers. Add more API keys in Settings.`);
  }

  // Helper to call any model
  async function callModel(config) {
    const { provider, modelId, key } = config;
    switch(provider) {
      case 'nvidia': return await callNvidia(messages, modelId, key);
      case 'openai': return await callOpenAI(messages, modelId, key);
      case 'anthropic': return await callAnthropic(messages, modelId, key);
      case 'google': return await callGemini(messages, modelId, key);
      case 'groq': return await callOpenAICompatible(PROVIDER_ENDPOINTS.groq, messages, modelId, key, 'Groq');
      case 'cerebras': return await callOpenAICompatible(PROVIDER_ENDPOINTS.cerebras, messages, modelId, key, 'Cerebras');
      case 'sambanova': return await callOpenAICompatible(PROVIDER_ENDPOINTS.sambanova, messages, modelId, key, 'SambaNova');
      case 'together': return await callOpenAICompatible(PROVIDER_ENDPOINTS.together, messages, modelId, key, 'Together');
      case 'openrouter': return await callOpenRouter(messages, modelId, key);
      default: throw new Error('Unknown provider: ' + provider);
    }
  }

  const startTime = Date.now();

  if (mode === 'specialist' || mode === 'single') {
    const best = configs[0];
    const result = await callModel(best);
    return { ...result, mode: 'specialist', duration: Date.now() - startTime };
  }

  // Query multiple models in parallel
  const selected = configs.slice(0, mode === 'parallel' ? 10 : 5);
  const promises = selected.map(c => callModel(c).then(r => ({ success: true, ...r, config: c })).catch(e => ({ success: false, error: e.message, config: c })));
  const results = await Promise.all(promises);
  const successful = results.filter(r => r.success);

  if (successful.length === 0) throw new Error('All GOAT Brain models failed. Check API keys.');

  if (mode === 'parallel') {
    return {
      content: successful[0].content,
      model: 'GOAT Brain (Parallel)',
      provider: 'goat-brain',
      mode: 'parallel',
      responses: successful.map(r => ({ model: r.config.modelId, provider: r.config.provider, content: r.content })),
      duration: Date.now() - startTime
    };
  }

  // Consensus/Ensemble: synthesize responses
  if (successful.length === 1) return { ...successful[0], mode, duration: Date.now() - startTime };

  const synthesisPrompt = mode === 'consensus'
    ? `You are synthesizing ${successful.length} AI model responses into one consensus answer. Find agreement, resolve conflicts with the strongest reasoning:\n\n`
    : `You are creating the best possible answer by combining insights from ${successful.length} AI models:\n\n`;

  const synthesis = synthesisPrompt + successful.map((r, i) => `**Model ${i+1} (${r.config.modelId}):**\n${r.content}`).join('\n\n---\n\n') + '\n\nProvide a single, definitive, synthesized answer:';

  const judgeMessages = [...messages.slice(0, -1), { role: 'user', content: synthesis }];

  // Use the first successful model as judge
  const judgeConfig = successful[0].config;
  let judgeResult;
  switch(judgeConfig.provider) {
    case 'nvidia': judgeResult = await callNvidia(judgeMessages, judgeConfig.modelId, judgeConfig.key); break;
    case 'groq': judgeResult = await callOpenAICompatible(PROVIDER_ENDPOINTS.groq, judgeMessages, judgeConfig.modelId, judgeConfig.key, 'Groq'); break;
    default: judgeResult = await callNvidia(judgeMessages, judgeConfig.modelId, judgeConfig.key); break;
  }

  return {
    content: judgeResult.content,
    model: `GOAT Brain (${mode})`,
    provider: 'goat-brain',
    mode,
    responses: successful.map(r => ({ model: r.config.modelId, provider: r.config.provider, content: r.content })),
    duration: Date.now() - startTime
  };
}

function updateGOATBrainUI() {
  const toggle = document.getElementById('goatBrainToggle');
  if (toggle) {
    toggle.className = 'goat-brain-toggle' + (state.goatBrainEnabled ? ' active' : '');
    const statusEl = toggle.querySelector('.gb-status');
    if (statusEl) { statusEl.className = 'gb-status ' + (state.goatBrainEnabled ? 'on' : 'off'); statusEl.textContent = state.goatBrainEnabled ? 'ON' : 'OFF'; }
  }
  updateModelIndicator();
}

function toggleGOATBrain() {
  state.goatBrainEnabled = !state.goatBrainEnabled;
  saveSetting('goatBrainEnabled', state.goatBrainEnabled);
  updateGOATBrainUI();
}

function setGOATBrainMode(mode) {
  state.goatBrainMode = mode;
  saveSetting('goatBrainMode', mode);
}

// ── TOOL CALLS ───────────────────────────────────────────────
async function processToolCalls(response) {
  const re = /```terminal\n([\s\S]*?)```/g;
  let match;
  while ((match = re.exec(response)) !== null) {
    const cmd = match[1].trim();
    if (cmd && isSafeCommand(cmd)) await executeTerminalCommand(cmd);
  }
}
function isSafeCommand(cmd) {
  return ['ls','pwd','whoami','date','uptime','df','free','cat','head','tail','wc','echo','node -v','npm -v','python3 --version','git status','git log'].some(s => cmd.startsWith(s));
}

// ── TOOL PANELS ──────────────────────────────────────────────
function openTool(toolName) {
  state.currentTool = toolName;
  const panel = document.getElementById('toolPanel');
  const title = document.getElementById('toolPanelTitle');
  const content = document.getElementById('toolPanelContent');
  const tools = {
    terminal: { title: '⌨ Terminal', render: renderTerminal },
    filemanager: { title: '📁 File Manager', render: renderFileManager },
    codeeditor: { title: '💻 Code Editor', render: renderCodeEditor },
    webbrowser: { title: '🌐 Web Browser', render: renderWebBrowser },
    modelhub: { title: '🟢 Model Hub (1000+ LLMs)', render: renderModelHub },
    goatbrain: { title: '🧠 GOAT Brain Orchestrator', render: renderGOATBrainPanel },
    imagetools: { title: '🎨 Image Tools', render: renderImageTools },
    audiotools: { title: '🎵 Audio Tools', render: renderAudioTools },
    pdftools: { title: '📄 PDF Tools', render: renderPDFTools },
    dataanalysis: { title: '📊 Data Analysis', render: renderDataAnalysis },
    musicprod: { title: '🎵 Music Production', render: renderMusicProd },
    royaltycalc: { title: '💰 Royalty Calculator', render: renderRoyaltyCalc },
    axiom: { title: '🤖 Axiom AI Automation', render: renderAxiomPanel },
    uecopilot: { title: '🎮 Ultimate Engine CoPilot', render: renderUECoPilot },
    goatconnect: { title: '💛 GOAT Connect — Worldwide Artist & Fan Platform', render: renderGOATConnect },
    faceshield: { title: '👁️ GOAT FaceShield™ — Facial Recognition & Identity', render: renderFacialRecognition },
    avatarstudio: { title: '🎭 GOAT Avatar Studio — MetaHuman • DAZ3D • Hollywood • FiveM • C++', render: renderAvatarStudio },
    promptengine: { title: '🧠 GOAT Power Prompting Engine — ReAct • Quantum • Senior Dev • CEO Mode', render: renderPromptEngine },
    worldwide: { title: '🌍 GOAT Worldwide — Live Map • Global Feed • Music DNA • Events • Analytics • Leaderboards', render: renderWorldwidePlatform },
    agentbuilder: { title: '🤖 GOAT AI Agent Builder — Build • Deploy • Orchestrate Custom AI Agents', render: renderAIAgentBuilder },
    ue5scene: { title: '🎮 GOAT UE5 Scene Generator — Text-to-Scene • Lumen • Nanite • MetaHuman • PCG', render: renderUE5SceneGenerator },
    scriptstudio: { title: '🎬 GOAT Script Studio — Hollywood Screenwriting • Final Draft-Level • 24 Legendary Writers • AI Scene Gen', render: renderScriptStudio },
    distribution: { title: '🚀 GOAT Distribution Hub — 50+ DSPs • Release Management • Revenue Calculator', render: renderDistributionHub },
    beatmaker: { title: '🎹 GOAT Beat Maker — 16-Step Sequencer • 6 Drum Kits • Web Audio Synthesis', render: renderBeatMaker },
    crypto: { title: '⛓️ GOAT Crypto Royalty — Blockchain Music Rights • NFTs • Smart Contracts', render: renderCryptoRoyalty },
    vault: { title: '🔐 GOAT Secure Vault — AES-256-GCM Encrypted Storage', render: renderSecureVault },
    datasets: { title: '🤗 HuggingFace Datasets — 41 AI Datasets • No API Key • Download & Go', render: renderHFDatasets }
  };
  const tool = tools[toolName];
  if (tool) { title.innerHTML = tool.title; tool.render(content); panel.classList.add('open'); state.toolPanelOpen = true; }
}
function closeToolPanel() { document.getElementById('toolPanel').classList.remove('open'); state.toolPanelOpen = false; }

// ── MODEL HUB ────────────────────────────────────────────────
function renderModelHub(container) {
  const categories = ['all', 'text-generation', 'code', 'reasoning', 'vision', 'safety'];
  const catIcons = { all: '🌐', 'text-generation': '💬', code: '💻', reasoning: '🧠', vision: '👁️', safety: '🛡️' };
  container.innerHTML = `
    <div class="model-hub-search"><input type="text" id="modelHubSearch" placeholder="Search ${Object.keys(NVIDIA_MODELS).length}+ NVIDIA models..." oninput="filterModelHub(this.value)"></div>
    <div class="category-chips">${categories.map(c => `<span class="category-chip ${c===state.categoryFilter?'active':''}" data-model-category="${c}">${catIcons[c]||''} ${c==='all'?'All':c.replace('-',' ')}</span>`).join('')}</div>
    <div style="font-size:11px;color:var(--text-muted);margin-bottom:12px;display:flex;justify-content:space-between"><span>🟢 NVIDIA NIM — build.nvidia.com</span><span id="modelHubCount">${Object.keys(NVIDIA_MODELS).length} models</span></div>
    <div id="modelHubList">${renderModelCards()}</div>
  `;
}
function renderModelCards(query, category) {
  let entries = Object.entries(NVIDIA_MODELS);
  if (query) { const q = query.toLowerCase(); entries = entries.filter(([id,m]) => id.includes(q)||m.name.toLowerCase().includes(q)||m.provider.toLowerCase().includes(q)||(m.category&&m.category.includes(q))); }
  if (category && category !== 'all') entries = entries.filter(([id,m]) => m.category === category);
  return entries.map(([id,m]) => `
    <div class="model-card ${state.activeModel===id?'active':''}" data-model-select="${id}">
      <div class="mc-header"><span class="mc-provider">${m.provider}</span><span class="mc-name">${m.name}</span><span class="mc-params">${m.params}</span></div>
      <div class="mc-meta"><span>📊 ${m.category||'general'}</span><span>📝 ${(m.context||0).toLocaleString()} ctx</span></div>
    </div>
  `).join('') || '<p style="text-align:center;color:var(--text-muted);padding:20px">No models found</p>';
}
function filterModelHub(query) { state.modelSearchQuery = query; const list = document.getElementById('modelHubList'); if(list) list.innerHTML = renderModelCards(query, state.categoryFilter); const count = document.getElementById('modelHubCount'); if(count) count.textContent = document.querySelectorAll('.model-card').length + ' models'; }
function filterModelHubCategory(cat) { state.categoryFilter = cat; document.querySelectorAll('.category-chip').forEach(c => c.classList.toggle('active', c.textContent.toLowerCase().includes(cat==='all'?'all':cat))); const list = document.getElementById('modelHubList'); if(list) list.innerHTML = renderModelCards(state.modelSearchQuery, cat); }
function selectModelFromHub(modelId) { state.activeProvider = 'nvidia'; state.activeModel = modelId; saveSetting('activeProvider', 'nvidia'); saveSetting('activeModel', modelId); updateModelIndicator(); buildModelSelector(); document.querySelectorAll('.model-card').forEach(c => c.classList.remove('active')); event.currentTarget.classList.add('active'); }

// ── GOAT BRAIN PANEL ─────────────────────────────────────────
function renderGOATBrainPanel(container) {
  const modes = [
    { id: 'specialist', icon: '🎯', name: 'Auto-Specialist', desc: 'Route to best model for the task' },
    { id: 'consensus', icon: '🗳️', name: 'Consensus', desc: 'Query 3-5 models, find agreement' },
    { id: 'ensemble', icon: '🧬', name: 'Ensemble', desc: 'Synthesize multiple model responses' },
    { id: 'parallel', icon: '⚡', name: 'Parallel', desc: 'Query all models, show all responses' },
    { id: 'bestOfN', icon: '🏆', name: 'Best of N', desc: 'Judge picks the best response' },
    { id: 'chain', icon: '🔗', name: 'Chain', desc: 'Draft → Refine → Polish pipeline' },
    { id: 'debate', icon: '⚔️', name: 'Debate', desc: 'Models critique each other' }
  ];
  container.innerHTML = `
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:48px;margin-bottom:8px">🧠</div>
      <h3 style="font-size:18px;background:linear-gradient(135deg,var(--accent),var(--cyan));-webkit-background-clip:text;-webkit-text-fill-color:transparent">GOAT Brain</h3>
      <p style="font-size:12px;color:var(--text-muted);margin-top:4px">Combine 1000+ LLMs into one super intelligence</p>
    </div>
    <div style="margin-bottom:16px">
      <button data-action="toggleGOATBrain" class="axiom-run-btn" style="background:${state.goatBrainEnabled?'linear-gradient(135deg,var(--accent),#6d28d9)':'var(--bg-tertiary)'};color:${state.goatBrainEnabled?'white':'var(--text-secondary)'};border:1px solid ${state.goatBrainEnabled?'var(--accent)':'var(--border)'}">
        ${state.goatBrainEnabled ? '🧠 GOAT Brain ACTIVE' : 'Enable GOAT Brain'}
      </button>
    </div>
    <h4 style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:8px">ORCHESTRATION MODE</h4>
    ${modes.map(m => `
      <div class="goat-mode-card ${state.goatBrainMode===m.id?'active':''}" data-goat-mode="${m.id}">
        <span class="gm-icon">${m.icon}</span>
        <div><div class="gm-name">${m.name}</div><div class="gm-desc">${m.desc}</div></div>
      </div>
    `).join('')}
    <div style="margin-top:16px;padding:12px;background:var(--bg-primary);border-radius:var(--radius-sm);border:1px solid var(--border)">
      <h4 style="font-size:11px;color:var(--text-muted);margin-bottom:8px">CONFIGURED PROVIDERS</h4>
      <div style="display:flex;flex-wrap:wrap;gap:4px" id="goatBrainProviders">${renderConfiguredProviders()}</div>
    </div>
  `;
}
function renderConfiguredProviders() {
  const s = state.settings;
  const providers = [
    { key: 'nvidiaKey', name: 'NVIDIA NIM', icon: '🟢' },
    { key: 'openaiKey', name: 'OpenAI', icon: '🔵' },
    { key: 'anthropicKey', name: 'Anthropic', icon: '🟠' },
    { key: 'googleKey', name: 'Google', icon: '🔵' },
    { key: 'groqKey', name: 'Groq', icon: '⚡' },
    { key: 'cerebrasKey', name: 'Cerebras', icon: '🧠' },
    { key: 'sambanovaKey', name: 'SambaNova', icon: '🔷' },
    { key: 'togetherKey', name: 'Together', icon: '🤝' },
    { key: 'openrouterKey', name: 'OpenRouter', icon: '🌐' },
    { key: 'fireworksKey', name: 'Fireworks', icon: '🎆' }
  ];
  return providers.map(p => {
    const configured = !!s[p.key];
    return `<span style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:600;${configured?'background:rgba(16,185,129,0.12);color:var(--green)':'background:var(--bg-tertiary);color:var(--text-muted)'}">${p.icon} ${p.name} ${configured?'✓':'✗'}</span>`;
  }).join('');
}

// ── TERMINAL ─────────────────────────────────────────────────
function renderTerminal(c){c.innerHTML=`<div class="terminal-output" id="terminalOutput">${state.terminalOutput||'Super GOAT Royalty Terminal Ready...\n$ '}</div><div class="terminal-input-row"><input type="text" class="terminal-input" id="terminalInput" placeholder="Enter command..." onkeydown="if(event.key==='Enter')runTerminalCommand()"><button class="terminal-run-btn" data-action="runTerminalCommand">Run</button></div><div style="margin-top:12px"><h4 style="font-size:12px;color:var(--text-muted);margin-bottom:8px">Quick Commands</h4><div style="display:flex;flex-wrap:wrap;gap:6px">${['ls -la','pwd','df -h','free -h','git status','node -v','npm -v'].map(c=>`<button class="tool-btn" data-quick-terminal="${c}" style="padding:6px 10px;flex-direction:row;gap:4px"><span style="font-size:12px">${c}</span></button>`).join('')}</div></div>`;document.getElementById('terminalInput').focus();}
async function runTerminalCommand(){const i=document.getElementById('terminalInput');const cmd=i.value.trim();if(!cmd)return;i.value='';await executeTerminalCommand(cmd);}
function quickTerminal(cmd){document.getElementById('terminalInput').value=cmd;runTerminalCommand();}
async function executeTerminalCommand(command){const o=document.getElementById('terminalOutput');state.terminalOutput+=`\n$ ${command}\n`;if(o)o.textContent=state.terminalOutput;try{const r=await window.superNinja.executeCommand(command);const t=r.stdout||r.stderr||(r.error?`Error: ${r.error}`:'Done');state.terminalOutput+=t+'\n';if(state.currentChatId){const m={role:'assistant',content:`**Terminal** (\`${command}\`):\n\`\`\`\n${t}\n\`\`\``,timestamp:new Date().toISOString(),isTool:true};state.messages.push(m);renderMessage(m);}}catch(e){state.terminalOutput+=`Error: ${e.message}\n`;}if(o){o.textContent=state.terminalOutput;o.scrollTop=o.scrollHeight;}}

// ── OTHER TOOLS (compact) ────────────────────────────────────
function renderFileManager(c){c.innerHTML=`<div style="margin-bottom:12px"><input type="text" class="terminal-input" id="filePathInput" placeholder="Enter path..." style="width:100%" onkeydown="if(event.key==='Enter')browseDirectory()"></div><button class="terminal-run-btn" data-action="browseDirectory" style="margin-bottom:16px;width:100%">Browse</button><div id="fileList" style="font-family:var(--font-mono);font-size:13px"><p style="color:var(--text-muted)">Enter a path to browse</p></div>`;}
async function browseDirectory(){const p=document.getElementById('filePathInput').value.trim();const f=document.getElementById('fileList');try{const r=await window.superNinja.listDirectory(p);if(r.success){f.innerHTML=r.items.map(i=>`<div style="padding:6px 8px;border-bottom:1px solid var(--border);cursor:pointer" ${i.isDirectory?`data-browse-path="${i.path.replace(/\\/g,'\\\\').replace(/"/g,'"')}"`:''}><span>${i.isDirectory?'\ud83d\udcc1':'\ud83d\udcc4'}</span> <span style="color:${i.isDirectory?'var(--accent)':'var(--text-primary)'}">${i.name}</span></div>`).join('');}else f.innerHTML=`<p style="color:var(--red)">${r.error}</p>`;}catch(e){f.innerHTML=`<p style="color:var(--red)">${e.message}</p>`;}}
function renderCodeEditor(c){c.innerHTML=`<div style="margin-bottom:8px;display:flex;gap:8px"><input type="text" class="terminal-input" id="codeEditorPath" placeholder="File path..." style="flex:1"><button class="terminal-run-btn" data-action="loadFileInEditor">Open</button><button class="terminal-run-btn" data-action="saveFileFromEditor" style="background:var(--accent)">Save</button></div><textarea id="codeEditorArea" style="width:100%;min-height:400px;background:var(--bg-primary);color:var(--text-primary);border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px;font-family:var(--font-mono);font-size:13px;line-height:1.5;resize:vertical;outline:none" spellcheck="false" placeholder="// Write or paste code..."></textarea><div style="margin-top:8px;display:flex;gap:8px"><button class="terminal-run-btn" data-action="runCodeFromEditor" style="background:var(--green)">▶ Run</button><button class="tool-btn" data-action="copyCodeEditor" style="padding:8px 12px;flex-direction:row">Copy</button></div>`;}
async function loadFileInEditor(){const p=document.getElementById('codeEditorPath').value.trim();if(!p)return;const r=await window.superNinja.readFile(p);if(r.success)document.getElementById('codeEditorArea').value=r.content;}
async function saveFileFromEditor(){const p=document.getElementById('codeEditorPath').value.trim();const c=document.getElementById('codeEditorArea').value;if(!p){const r=await window.superNinja.saveDialog({filters:[{name:'All',extensions:['*']}]});if(!r.canceled){document.getElementById('codeEditorPath').value=r.filePath;await window.superNinja.writeFile(r.filePath,c);}return;}await window.superNinja.writeFile(p,c);}
async function runCodeFromEditor(){const p=document.getElementById('codeEditorPath').value.trim();if(p.endsWith('.js'))await executeTerminalCommand(`node "${p}"`);else if(p.endsWith('.py'))await executeTerminalCommand(`python3 "${p}"`);else{await window.superNinja.writeFile('/tmp/goat_run.js',document.getElementById('codeEditorArea').value);await executeTerminalCommand('node /tmp/goat_run.js');}}
function renderWebBrowser(c){c.innerHTML=`<div style="margin-bottom:12px;display:flex;gap:8px"><input type="text" class="terminal-input" id="webSearchInput" placeholder="Search or enter URL..." style="flex:1" onkeydown="if(event.key==='Enter')webSearch()"><button class="terminal-run-btn" data-action="webSearch">Search</button></div><div id="webResults"><p style="color:var(--text-muted)">Enter a query to search</p></div>`;}
function webSearch(){const q=document.getElementById('webSearchInput').value.trim();if(!q)return;document.getElementById('message-input').value=`Search the web for: "${q}"`;closeToolPanel();sendMessage();}
function renderImageTools(c){c.innerHTML=`<h4 style="margin-bottom:12px;color:var(--text-secondary)">Image Generation & Editing</h4><textarea id="imagePrompt" class="terminal-input" style="width:100%;min-height:100px;resize:vertical;margin-bottom:12px" placeholder="Describe the image..."></textarea><button class="terminal-run-btn" data-action="generateImage" style="width:100%;background:linear-gradient(135deg,var(--accent),var(--cyan))">Generate Image</button>`;}
function renderAudioTools(c){c.innerHTML=`<h4 style="margin-bottom:12px">Audio Processing</h4><button class="terminal-run-btn" style="width:100%;margin-bottom:12px" data-action="openAudioFile">Open Audio File</button><button class="terminal-run-btn" style="width:100%;margin-bottom:12px;background:var(--green)" data-action="transcribeAudio">Transcribe</button>`;}
async function openAudioFile(){const r=await window.superNinja.openDialog({filters:[{name:'Audio',extensions:['mp3','wav','flac','aac','m4a']}]});if(!r.canceled)r.filePaths.forEach(f=>addAttachedFile(f));}
function renderPDFTools(c){c.innerHTML=`<h4 style="margin-bottom:12px">PDF Processing</h4><button class="terminal-run-btn" style="width:100%;margin-bottom:12px" data-action="openPDFFile">Open PDF</button><button class="terminal-run-btn" style="width:100%;margin-bottom:12px;background:var(--green)" data-action="extractPDF">Extract Text</button><button class="terminal-run-btn" style="width:100%;background:var(--blue)" data-action="summarizePDF">Summarize</button>`;}
async function openPDFFile(){const r=await window.superNinja.openDialog({filters:[{name:'PDF',extensions:['pdf']}]});if(!r.canceled)r.filePaths.forEach(f=>addAttachedFile(f));}
function renderDataAnalysis(c){c.innerHTML=`<h4 style="margin-bottom:12px">Data Analysis</h4><button class="terminal-run-btn" style="width:100%;margin-bottom:12px" data-action="openDataFile">Open Data File</button><button class="terminal-run-btn" style="width:100%;margin-bottom:12px;background:var(--green)" data-action="analyzeData">Analyze</button><button class="terminal-run-btn" style="width:100%;background:var(--blue)" data-action="visualizeData">Visualize</button>`;}
async function openDataFile(){const r=await window.superNinja.openDialog({filters:[{name:'Data',extensions:['csv','json','xlsx','xml']}]});if(!r.canceled)r.filePaths.forEach(f=>addAttachedFile(f));}
function renderMusicProd(c){c.innerHTML=`<h4 style="margin-bottom:16px">Music Production</h4><div style="display:grid;gap:8px">${[['Catalog Analysis','var(--accent)'],['Beat Ideas','var(--blue)'],['Lyric Writer','var(--green)'],['Industry Trends','var(--orange)'],['Release Marketing','var(--cyan)']].map(([n,bg])=>`<button class="terminal-run-btn" style="background:${bg}" data-music-action="${n}">${n}</button>`).join('')}</div>`;}
function renderRoyaltyCalc(c){c.innerHTML=`<h4 style="margin-bottom:16px">Royalty Calculator</h4><div style="margin-bottom:16px"><label style="font-size:13px;color:var(--text-secondary);display:block;margin-bottom:6px">Total Streams</label><input type="number" class="terminal-input" id="royaltyStreams" value="1000000" style="width:100%"></div><div style="margin-bottom:16px"><label style="font-size:13px;color:var(--text-secondary);display:block;margin-bottom:6px">Platform</label><select class="terminal-input" id="royaltyPlatform" style="width:100%"><option value="all">All Platforms</option><option value="spotify">Spotify ($0.00437)</option><option value="apple">Apple Music ($0.00783)</option><option value="youtube">YouTube ($0.00274)</option><option value="tiktok">TikTok ($0.00069)</option><option value="tidal">Tidal ($0.01284)</option><option value="amazon">Amazon ($0.00402)</option></select></div><button class="terminal-run-btn" data-action="calculateRoyalty" style="width:100%;background:linear-gradient(135deg,var(--green),var(--cyan))">Calculate</button><div id="royaltyResult" style="margin-top:16px"></div>`;}
function calculateRoyalty(){const streams=parseInt(document.getElementById('royaltyStreams').value)||0;const platform=document.getElementById('royaltyPlatform').value;const rates={spotify:0.00437,apple:0.00783,youtube:0.00274,tiktok:0.00069,tidal:0.01284,amazon:0.00402};let html='';if(platform==='all'){html='<div style="background:var(--bg-primary);border-radius:var(--radius-sm);padding:16px;border:1px solid var(--border)">';html+=`<h4 style="margin-bottom:12px;color:var(--accent)">Estimate for ${streams.toLocaleString()} streams</h4>`;let total=0;Object.entries(rates).forEach(([p,r])=>{const rev=streams*r;total+=rev;html+=`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)"><span style="text-transform:capitalize">${p}</span><span style="color:var(--green);font-weight:600">$${rev.toFixed(2)}</span></div>`;});html+=`<div style="display:flex;justify-content:space-between;padding:10px 0;margin-top:8px;font-weight:700;font-size:16px"><span>Average</span><span style="color:var(--green)">$${(total/6).toFixed(2)}</span></div></div>`;}else{const rev=streams*rates[platform];html=`<div style="text-align:center;background:var(--bg-primary);padding:16px;border-radius:var(--radius-sm);border:1px solid var(--border)"><div style="font-size:32px;font-weight:700;color:var(--green)">$${rev.toFixed(2)}</div><div style="font-size:12px;color:var(--text-muted)">${streams.toLocaleString()} × $${rates[platform]}</div></div>`;}document.getElementById('royaltyResult').innerHTML=html;}

// ── UI RENDERING ─────────────────────────────────────────────
function renderMessages(){clearChatArea();if(state.messages.length===0){showWelcomeScreen();return;}hideWelcomeScreen();state.messages.forEach(m=>renderMessage(m));scrollToBottom();}
function renderMessage(message) {
  const chatArea = document.getElementById('chatArea');
  const welcome = document.getElementById('welcomeScreen');
  if (welcome) welcome.style.display = 'none';
  const div = document.createElement('div');
  div.className = `message ${message.role}`;
  const avatar = message.role === 'user' ? '👤' : '⚡';
  const name = message.role === 'user' ? 'You' : 'Super GOAT AI';
  const time = formatTime(message.timestamp);
  const modelTag = message.model ? `<span class="message-model-tag">${message.model.split('/').pop()}</span>` : '';
  let goatMeta = '';
  if (message.goatBrain && message.goatBrain.mode) {
    const gb = message.goatBrain;
    goatMeta = `<div class="goat-brain-meta"><div class="meta-header">🧠 GOAT Brain — ${gb.mode} mode</div>${gb.responses ? `<div class="meta-models">${gb.responses.map(r => `<span class="meta-model-chip">${r.provider}: ${r.model.split('/').pop()}</span>`).join('')}</div>` : ''}<div class="meta-duration">⏱ ${gb.duration ? (gb.duration/1000).toFixed(1)+'s' : 'N/A'} • ${gb.responses ? gb.responses.length + ' models queried' : ''}</div></div>`;
  }
  div.innerHTML = `<div class="message-avatar">${avatar}</div><div class="message-content"><div class="message-header"><span class="message-name">${name}</span><span class="message-time">${time}</span>${modelTag}</div><div class="message-body">${renderMarkdown(message.content)}</div>${goatMeta}${message.files && message.files.length > 0 ? `<div class="file-chips" style="padding:8px 0 0">${message.files.map(f => `<span class="file-chip">📎 ${f.split('/').pop()}</span>`).join('')}</div>` : ''}</div>`;
  chatArea.appendChild(div);
  scrollToBottom();
}

function renderMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/```(\w*)\n([\s\S]*?)```/g, (m, lang, code) => `<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code><button class="copy-code-btn" data-action="copyCodeBlock">Copy</button></pre>`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" data-external="$2">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

function showTypingIndicator(){const c=document.getElementById('chatArea');const d=document.createElement('div');d.className='message assistant';d.id='typingIndicator';d.innerHTML=`<div class="message-avatar">⚡</div><div class="message-content"><div class="message-header"><span class="message-name">Super GOAT AI</span><span class="message-time">${state.goatBrainEnabled?'🧠 querying models...':'thinking...'}</span></div><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;c.appendChild(d);scrollToBottom();}
function removeTypingIndicator(){const i=document.getElementById('typingIndicator');if(i)i.remove();}
function showWelcomeScreen(){const w=document.getElementById('welcomeScreen');if(w)w.style.display='flex';}
function hideWelcomeScreen(){const w=document.getElementById('welcomeScreen');if(w)w.style.display='none';}
function clearChatArea(){const c=document.getElementById('chatArea');const w=document.getElementById('welcomeScreen');c.innerHTML='';if(w)c.appendChild(w);}
function clearChat(){if(state.messages.length===0)return;state.messages=[];clearChatArea();showWelcomeScreen();saveCurrentChat();}

// ── FILE ATTACHMENTS ─────────────────────────────────────────
async function attachFile(){const r=await window.superNinja.openDialog({properties:['openFile','multiSelections'],filters:[{name:'All',extensions:['*']}]});if(!r.canceled)r.filePaths.forEach(fp=>addAttachedFile(fp));}
function addAttachedFile(fp){if(!state.attachedFiles.includes(fp)){state.attachedFiles.push(fp);renderFileChips();}}
function removeAttachedFile(i){state.attachedFiles.splice(i,1);renderFileChips();}
function clearAttachedFiles(){state.attachedFiles=[];renderFileChips();}
function renderFileChips(){const c=document.getElementById('fileChips');c.innerHTML=state.attachedFiles.map((fp,i)=>`<span class="file-chip">📎 ${fp.split('/').pop().split('\\').pop()} <span class="remove-chip" data-remove-file="${i}">&times;</span></span>`).join('');}

// ── HELPERS ──────────────────────────────────────────────────
function toggleSidebar(){document.getElementById('sidebar').classList.toggle('collapsed');state.sidebarOpen=!state.sidebarOpen;}
function openSettings(){document.getElementById('settingsModal').classList.add('open');loadSettingsUI();}
function closeSettings(){document.getElementById('settingsModal').classList.remove('open');}
async function saveSetting(key,value){state.settings[key]=value;await window.superNinja.setSetting(key,value);}
function setTheme(theme){document.documentElement.setAttribute('data-theme',theme);saveSetting('theme',theme);}
function handleKeyDown(event){if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendMessage();}}
function autoResize(ta){ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,200)+'px';}
function updateSendButton(){const b=document.getElementById('sendBtn');b.disabled=state.isProcessing;b.innerHTML=state.isProcessing?'<div class="spinner" style="width:16px;height:16px"></div>':'➤';}
function scrollToBottom(){const c=document.getElementById('chatArea');c.scrollTop=c.scrollHeight;}
function escapeHtml(t){const d=document.createElement('div');d.textContent=t;return d.innerHTML;}
function formatDate(d){if(!d)return'';const dt=new Date(d);const diff=Date.now()-dt;if(diff<86400000)return'Today';if(diff<172800000)return'Yesterday';return dt.toLocaleDateString();}
function formatTime(d){if(!d)return'';return new Date(d).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}


// ── STREAMING RESPONSE SUPPORT ──────────────────────────────────────
async function callNvidiaStreaming(messages, model, apiKey, onChunk) {
  if (!apiKey) throw new Error("NVIDIA API key not configured. Get one free at build.nvidia.com");
  const body = { model, messages: [{ role: "system", content: getSystemPrompt() }, ...messages.map(m => ({ role: m.role, content: m.content }))], max_tokens: 4096, temperature: 0.7, stream: true };
  const resp = await fetch(`${PROVIDER_ENDPOINTS.nvidia}/chat/completions`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` }, body: JSON.stringify(body) });
  if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.detail || e.error?.message || `NVIDIA NIM error: ${resp.status}`); }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
    for (const line of lines) {
      const data = line.slice(6);
      if (data === "[DONE]") continue;
      try { const parsed = JSON.parse(data); const delta = parsed.choices?.[0]?.delta?.content || ""; if (delta) { fullContent += delta; if (onChunk) onChunk(delta, fullContent); } } catch(e) {}
    }
  }
  return { content: fullContent, model, provider: "nvidia" };
}

// ── INIT ─────────────────────────────────────────────────────

// ── ULTIMATE ENGINE COPILOT ───────────────────────────────────────────────────
const ueState = {
  activeTab: 'generate',
  context: '',
  history: [],
  mode: 'blueprint',
  lastOutput: ''
};

const UE_MODES = [
  { id: 'blueprint',  label: '🔵 Blueprint',    desc: 'Visual scripting node graphs' },
  { id: 'cpp',        label: '⚙️ C++ Code',      desc: 'Native Unreal C++ classes' },
  { id: 'scene',      label: '🏗️ Scene Builder', desc: 'Actors, levels, world setup' },
  { id: 'ui',         label: '🎛️ UI / UMG',      desc: 'Widget Blueprints & UMG' },
  { id: 'material',   label: '🎨 Material',      desc: 'Material & shader graphs' },
  { id: 'animation',  label: '🏃 Animation',     desc: 'AnimBP, State Machines, Montages' },
  { id: 'ai',         label: '🤖 AI / Behavior', desc: 'Behavior Trees, AI Controllers' },
  { id: 'refactor',   label: '🔧 Refactor',      desc: 'Analyze & improve existing Blueprints' },
  { id: 'explain',    label: '📖 Explain',       desc: 'Understand any Blueprint or C++ code' },
  { id: 'debug',      label: '🐛 Debug',         desc: 'Find issues in your Blueprint logic' }
];

const UE_QUICK_PROMPTS = {
  blueprint: [
    'Create a health component Blueprint with damage, heal, and death events',
    'Build a third-person character controller with sprint, crouch, and jump',
    'Make a door that opens when the player overlaps a trigger volume',
    'Create an inventory system with add/remove item functions',
    'Build a simple quest tracker with objectives and completion events'
  ],
  cpp: [
    'Create a UActorComponent for stamina with regeneration logic',
    'Write a UGameInstanceSubsystem for persistent player data',
    'Build a custom UObject pool manager for performance optimization',
    'Create an interface for interactable objects',
    'Write a procedural mesh generation component in C++'
  ],
  scene: [
    'Set up a modular dungeon room with spawn points and lighting',
    'Create a dynamic weather system with rain, wind, and fog',
    'Build a destructible environment with debris and sound effects',
    'Set up a day/night cycle with dynamic sky and lighting',
    'Create a streaming level setup for an open world'
  ],
  ui: [
    'Build a HUD with health bar, minimap, and ammo counter',
    'Create an animated main menu with background cinematic',
    'Make a drag-and-drop inventory grid widget',
    'Build a dialogue system widget with typewriter effect',
    'Create a responsive settings menu with sliders and toggles'
  ],
  material: [
    'Create a water surface material with waves and reflection',
    'Build a stylized cel-shading material with outlines',
    'Make a dissolve effect material using noise texture',
    'Create a hologram material with scanlines and flicker',
    'Build a modular rock material with wet/dry blend'
  ],
  animation: [
    'Create a locomotion state machine with idle, walk, run, sprint',
    'Build a hand IK system for weapon holding',
    'Make a hit reaction AnimBP with directional blending',
    'Create a cover system with lean and peek animations',
    'Build a procedural footstep system with surface detection'
  ],
  ai: [
    'Create a patrol AI with waypoints and alert states',
    'Build a stealth detection cone with reaction behavior',
    'Make a squad formation AI with leader-follow logic',
    'Create a turret AI with target acquisition and firing',
    'Build a companion AI that follows and assists the player'
  ],
  refactor: [
    'Review this Blueprint for performance bottlenecks and fix them',
    'Convert this Blueprint spaghetti into clean, modular functions',
    'Identify and remove redundant casting in this Blueprint',
    'Optimize this Blueprint to use interfaces instead of direct references',
    'Restructure this event graph into reusable function libraries'
  ],
  explain: [
    'Explain what each node in this Blueprint does step by step',
    'What does this C++ class do and how does it connect to the engine?',
    'Explain the execution flow of this Blueprint from BeginPlay',
    'What is the purpose of each variable in this component?',
    'How does this Blueprint interact with the game mode?'
  ],
  debug: [
    'Why would this Blueprint cause a crash on destruction?',
    'Find the logic error in this damage calculation Blueprint',
    'Why is this AI not responding to player proximity?',
    'Debug why this animation state machine gets stuck',
    'Why is this UI widget not updating when the variable changes?'
  ]
};

function getUESystemPrompt(mode) {
  const base = `You are the Ultimate Engine CoPilot — the most advanced AI assistant for Unreal Engine 5 development. You are deeply knowledgeable in:
- Unreal Engine 5 Blueprint visual scripting (all node types, execution flow, data types, macros, functions, interfaces, components, events)
- Unreal Engine 5 C++ (UObject hierarchy, UCLASS/UPROPERTY/UFUNCTION macros, GameFramework, subsystems, delegates, async tasks)
- UE5 architecture patterns (Actor-Component model, GameMode/GameState/PlayerController/Pawn hierarchy, subsystems, modules)
- Performance optimization (Blueprint nativization, tick optimization, asset streaming, LODs, occlusion culling)
- The Unreal marketplace ecosystem, FAB, and plugin integration

You were featured on FAB by Epic Games 5th–9th February 2026 — the first true AI CoPilot for Unreal Engine and the fastest-growing, most flexible copilot on the market.

RESPONSE STYLE:
- For Blueprint output: Describe nodes precisely with their category, name, input/output pins, and connections. Format as structured steps a developer can follow in the Blueprint editor.
- For C++ output: Provide complete, compilable code with proper includes, macros, and comments.
- Always explain WHY you chose the approach, not just WHAT to do.
- Flag performance concerns, common pitfalls, and UE5-specific best practices.
- Be conversational and collaborative — this is a partnership, not a command line.`;
  const extras = {
    blueprint: '\n\nFOCUS: Blueprint visual scripting. Use precise node names like "Branch", "Cast To X", "Get Actor Location", "Sequence". Number each step and specify pin connections clearly.',
    cpp:       '\n\nFOCUS: Unreal C++. Include all headers, use correct macros (UCLASS, UPROPERTY, UFUNCTION, GENERATED_BODY), follow UE naming conventions (U/A/F/I prefixes).',
    scene:     '\n\nFOCUS: Scene & level design. Cover Actor placement, component setup, Level Blueprint, data layers, world partition, and performance.',
    ui:        '\n\nFOCUS: UMG Widget Blueprints. Cover widget hierarchy, bindings vs event-driven updates, animation, anchors, DPI scaling.',
    material:  '\n\nFOCUS: Material Editor. Describe material nodes, parameters, functions, instancing. Specify connections and domain settings.',
    animation: '\n\nFOCUS: Animation system. Cover AnimBP, State Machines, Blend Spaces, AnimNotifies, Montages, IK, Control Rig.',
    ai:        '\n\nFOCUS: UE5 AI. Cover Behavior Trees, Blackboards, AI Controllers, Perception, NavMesh, EQS, and debugging.',
    refactor:  '\n\nFOCUS: Code review & refactoring. Identify anti-patterns, redundant casts, performance issues and suggest clean rewrites.',
    explain:   '\n\nFOCUS: Clear educational explanation. Walk through logic step by step, clarify each node/line, highlight clever techniques.',
    debug:     '\n\nFOCUS: Debugging. Identify root cause, explain why it fails in UE5 execution model, provide concrete fix with prevention tips.'
  };
  return base + (extras[mode] || '');
}

function renderUECoPilot(container) {
  const currentMode = UE_MODES.find(m => m.id === ueState.mode) || UE_MODES[0];
  const quickPrompts = UE_QUICK_PROMPTS[ueState.mode] || UE_QUICK_PROMPTS.blueprint;
  container.innerHTML = `
    <div class="ue-panel">
      <div class="ue-banner">
        <div class="ue-banner-left">
          <div class="ue-logo">🎮</div>
          <div>
            <div class="ue-title">Ultimate Engine CoPilot</div>
            <div class="ue-subtitle">Featured on FAB by Epic Games · Feb 5–9, 2026</div>
          </div>
        </div>
        <div class="ue-badges">
          <span class="ue-badge fab">FAB ⭐</span>
          <span class="ue-badge ue5">UE5</span>
          <span class="ue-badge local">Local LLM ✓</span>
        </div>
      </div>
      <div class="ue-tabs">
        <button class="ue-tab ${ueState.activeTab==='generate'?'active':''}" data-ue-tab="generate">⚡ Generate</button>
        <button class="ue-tab ${ueState.activeTab==='context'?'active':''}" data-ue-tab="context">📋 Context</button>
        <button class="ue-tab ${ueState.activeTab==='history'?'active':''}" data-ue-tab="history">🕘 History</button>
        <button class="ue-tab ${ueState.activeTab==='guide'?'active':''}" data-ue-tab="guide">📘 Setup</button>
      </div>
      <div class="ue-tab-content ${ueState.activeTab==='generate'?'active':''}" id="ueTabGenerate">
        <div class="ue-section-label">Mode</div>
        <div class="ue-mode-grid">
          ${UE_MODES.map(m => `<button class="ue-mode-card ${ueState.mode===m.id?'active':''}" data-ue-mode="${m.id}" title="${m.desc}"><span class="ue-mode-icon">${m.label.split(' ')[0]}</span><span class="ue-mode-name">${m.label.split(' ').slice(1).join(' ')}</span></button>`).join('')}
        </div>
        <div class="ue-mode-desc" id="ueModeDesc"><strong>${currentMode.label}</strong> — ${currentMode.desc}</div>
        <div class="ue-section-label" style="margin-top:12px">Your Request</div>
        <textarea id="uePromptInput" class="ue-textarea" placeholder="Describe what you want to build in plain English...&#10;Example: Create a double-jump mechanic that plays an animation and spawns a particle effect on the second jump" rows="4"></textarea>
        <div class="ue-context-badge" id="ueContextBadge" style="display:${ueState.context?'flex':'none'}">
          📋 Blueprint context attached (${ueState.context.length} chars)
          <button data-action="clearUEContext" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:14px;margin-left:6px">×</button>
        </div>
        <div class="ue-actions">
          <button class="ue-btn-primary" data-action="runUECoPilot">⚡ Generate</button>
          <button class="ue-btn-secondary" data-ue-tab="context">📋 Add Context</button>
          <button class="ue-btn-secondary" data-action="runUECoPilotToChat">💬 Ask in Chat</button>
        </div>
        <div class="ue-section-label" style="margin-top:14px">Quick Prompts — ${currentMode.label.split(' ').slice(1).join(' ')}</div>
        <div class="ue-quick-prompts" id="ueQuickPrompts">
          ${quickPrompts.map(p => `<button class="ue-quick-prompt" data-action="useUEQuickPrompt" data-p="${p.replace(/"/g,'"')}">${p}</button>`).join('')}
        </div>
        <div id="ueOutputArea" style="display:${ueState.lastOutput?'block':'none'}">
          <div class="ue-output-header">
            <span class="ue-section-label" style="margin:0">Output</span>
            <div style="display:flex;gap:6px">
              <button class="ue-btn-xs" data-action="copyUEOutput">📋 Copy</button>
              <button class="ue-btn-xs" data-action="sendUEOutputToChat">💬 Continue in Chat</button>
              <button class="ue-btn-xs" data-action="saveUESnippet">⭐ Save Snippet</button>
            </div>
          </div>
          <div class="ue-output" id="ueOutput">${ueState.lastOutput ? renderMarkdown(ueState.lastOutput) : ''}</div>
        </div>
      </div>
      <div class="ue-tab-content ${ueState.activeTab==='context'?'active':''}" id="ueTabContext">
        <div class="ue-section-label">Attach Blueprint / Code Context</div>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:10px">Paste your existing Blueprint, C++ code, error logs, or any Unreal context. The CoPilot will use this for precise, context-aware responses.</p>
        <div class="ue-context-tips">
          <div class="ue-tip">💡 <strong>Export Blueprint:</strong> Right-click graph → Copy → Paste here</div>
          <div class="ue-tip">💡 <strong>C++ files:</strong> Paste .h and .cpp content directly</div>
          <div class="ue-tip">💡 <strong>Error logs:</strong> Paste compile errors or Blueprint warnings</div>
          <div class="ue-tip">💡 <strong>Asset lists:</strong> Paste your project structure or component list</div>
        </div>
        <textarea id="ueContextInput" class="ue-textarea" rows="12" placeholder="Paste your Blueprint JSON, C++ code, error logs, or any project context here..." oninput="updateUEContext()">${ueState.context.replace(/</g,'<').replace(/>/g,'>')}</textarea>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
          <span style="font-size:12px;color:var(--text-muted)" id="ueContextCharCount">${ueState.context.length} chars</span>
          <div style="display:flex;gap:8px">
            <button class="ue-btn-secondary" data-action="clearUEContext">Clear</button>
            <button class="ue-btn-primary" data-ue-tab="generate">✓ Done — Go Generate</button>
          </div>
        </div>
      </div>
      <div class="ue-tab-content ${ueState.activeTab==='history'?'active':''}" id="ueTabHistory">
        <div class="ue-section-label">Saved Snippets & Session History</div>
        <div id="ueHistoryList">${renderUEHistory()}</div>
        ${ueState.history.length > 0 ? '<button class="ue-btn-secondary" style="margin-top:12px;width:100%" data-action="clearUEHistory">🗑️ Clear History</button>' : ''}
      </div>
      <div class="ue-tab-content ${ueState.activeTab==='guide'?'active':''}" id="ueTabGuide">
        <div class="ue-guide">
          <h4 style="color:#e8530a;margin-bottom:12px">🎮 Ultimate Engine CoPilot — Setup Guide</h4>
          <div class="ue-guide-section">
            <div class="ue-guide-title">🔑 Option 1: Cloud AI (Recommended)</div>
            <p>Best models for Unreal Engine development:</p>
            <div class="ue-model-recs">
              <div class="ue-model-rec nvidia"><strong>NVIDIA NIM — Qwen 2.5 Coder 32B</strong><br><span>Best for Blueprint node generation & C++ code</span></div>
              <div class="ue-model-rec openai"><strong>OpenAI GPT-4o</strong><br><span>Best for complex architecture & explanations</span></div>
              <div class="ue-model-rec anthropic"><strong>Anthropic Claude 3.5 Sonnet</strong><br><span>Best for refactoring, debugging & long context</span></div>
              <div class="ue-model-rec groq"><strong>Groq — Llama 3.3 70B</strong><br><span>Fastest responses for rapid iteration</span></div>
              <div class="ue-model-rec deepseek"><strong>DeepSeek R1 (via NVIDIA NIM)</strong><br><span>Best reasoning for complex AI & systems logic</span></div>
            </div>
          </div>
          <div class="ue-guide-section">
            <div class="ue-guide-title">🏠 Option 2: Local LLM (Offline — No API Key)</div>
            <p>Run models 100% locally with Ollama. Free, private, works without internet:</p>
            <div class="ue-code-block"># Install Ollama: https://ollama.com
ollama pull deepseek-coder-v2   # Best for code
ollama pull qwen2.5-coder:32b   # Excellent for UE
ollama pull codellama:70b        # Classic code model
ollama pull llama3.3:70b         # Great all-rounder</div>
            <p style="margin-top:8px;font-size:12px">In Settings, set Ollama URL to <code>http://localhost:11434</code> and select any Ollama model.</p>
          </div>
          <div class="ue-guide-section">
            <div class="ue-guide-title">🔌 Option 3: OpenRouter (653+ Models)</div>
            <p>Get one OpenRouter key for access to Claude 3.5, GPT-4o, Gemini Pro, DeepSeek R1, and 653+ more models.</p>
          </div>
          <div class="ue-guide-section">
            <div class="ue-guide-title">📋 How to Use Blueprint Context</div>
            <ol style="font-size:12px;color:var(--text-secondary);margin-left:16px;line-height:1.8">
              <li>In Unreal Editor, open any Blueprint</li>
              <li>Select nodes you want to discuss</li>
              <li>Right-click → <strong>Copy</strong> (Ctrl+C)</li>
              <li>Switch to the <strong>Context</strong> tab in this panel</li>
              <li>Paste, then go to <strong>Generate</strong> and ask your question</li>
            </ol>
          </div>
          <div class="ue-guide-section">
            <div class="ue-guide-title">🚀 Pro Tips</div>
            <ul style="font-size:12px;color:var(--text-secondary);margin-left:16px;line-height:2">
              <li>Use <strong>Explain</strong> mode for marketplace Blueprints you don't understand</li>
              <li>Use <strong>Refactor</strong> mode to clean up spaghetti graphs</li>
              <li>Use <strong>Debug</strong> mode — paste your error logs as context</li>
              <li>Enable <strong>🧠 GOAT Brain</strong> for consensus answers from multiple models</li>
              <li>Save good outputs as snippets for reuse across projects</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

function setUETab(tab) {
  ueState.activeTab = tab;
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderUECoPilot(panel);
}

function setUEMode(mode) {
  ueState.mode = mode;
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderUECoPilot(panel);
}

function useUEQuickPrompt(text) {
  const input = document.getElementById('uePromptInput');
  if (input) { input.value = text; input.focus(); }
}

function updateUEContext() {
  const el = document.getElementById('ueContextInput');
  if (el) {
    ueState.context = el.value;
    const counter = document.getElementById('ueContextCharCount');
    if (counter) counter.textContent = ueState.context.length + ' chars';
    const badge = document.getElementById('ueContextBadge');
    if (badge) badge.style.display = ueState.context ? 'flex' : 'none';
  }
}

function clearUEContext() {
  ueState.context = '';
  const el = document.getElementById('ueContextInput');
  if (el) el.value = '';
  const badge = document.getElementById('ueContextBadge');
  if (badge) badge.style.display = 'none';
  const counter = document.getElementById('ueContextCharCount');
  if (counter) counter.textContent = '0 chars';
}

async function runUECoPilot() {
  const promptEl = document.getElementById('uePromptInput');
  if (!promptEl) return;
  const userPrompt = promptEl.value.trim();
  if (!userPrompt) { promptEl.focus(); return; }
  const outputArea = document.getElementById('ueOutputArea');
  const outputEl = document.getElementById('ueOutput');
  if (outputArea) outputArea.style.display = 'block';
  if (outputEl) outputEl.innerHTML = '<div class="typing-indicator" style="padding:16px"><span></span><span></span><span></span></div>';
  const systemPrompt = getUESystemPrompt(ueState.mode);
  const messages = [{ role: 'system', content: systemPrompt }];
  if (ueState.context) {
    messages.push({ role: 'user', content: `Here is my existing Blueprint/code context:\n\n\`\`\`\n${ueState.context}\n\`\`\`` });
    messages.push({ role: 'assistant', content: 'I have reviewed your Blueprint/code context. I will use this as reference for your next request.' });
  }
  messages.push({ role: 'user', content: userPrompt });
  try {
    const response = await getAIResponse(messages);
    ueState.lastOutput = response;
    if (outputEl) outputEl.innerHTML = renderMarkdown(response);
    ueState.history.unshift({ id: Date.now(), mode: ueState.mode, prompt: userPrompt, output: response, timestamp: new Date().toISOString(), starred: false });
    if (ueState.history.length > 50) ueState.history.pop();
    try { localStorage.setItem('ue_copilot_history', JSON.stringify(ueState.history)); } catch(e) {}
  } catch (err) {
    if (outputEl) outputEl.innerHTML = `<p style="color:var(--red)">⚠️ Error: ${err.message}<br><br>Make sure you have an API key in Settings, or select a local Ollama model.</p>`;
  }
}

function runUECoPilotToChat() {
  const promptEl = document.getElementById('uePromptInput');
  const prompt = promptEl ? promptEl.value.trim() : '';
  if (!prompt) { if (promptEl) promptEl.focus(); return; }
  const systemNote = `[UE CoPilot — ${ueState.mode.toUpperCase()} Mode]\n`;
  const contextNote = ueState.context ? `\nBlueprint/Code Context:\n\`\`\`\n${ueState.context}\n\`\`\`\n\n` : '';
  document.getElementById('message-input').value = systemNote + contextNote + prompt;
  closeToolPanel();
  sendMessage();
}

function copyUEOutput() {
  if (ueState.lastOutput) {
    navigator.clipboard.writeText(ueState.lastOutput).then(() => {
      const btns = document.querySelectorAll('.ue-btn-xs');
      btns.forEach(b => { if (b.textContent.includes('Copy')) { const o = b.textContent; b.textContent = '✓ Copied!'; setTimeout(() => b.textContent = o, 1500); }});
    });
  }
}

function sendUEOutputToChat() {
  if (!ueState.lastOutput) return;
  document.getElementById('message-input').value = 'Continue from this UE CoPilot output:\n\n' + ueState.lastOutput.slice(0, 500) + (ueState.lastOutput.length > 500 ? '...' : '');
  closeToolPanel();
  document.getElementById('message-input').focus();
}

function saveUESnippet() {
  if (!ueState.lastOutput || !ueState.history.length) return;
  ueState.history[0].starred = true;
  try { localStorage.setItem('ue_copilot_history', JSON.stringify(ueState.history)); } catch(e) {}
  const btns = document.querySelectorAll('.ue-btn-xs');
  btns.forEach(b => { if (b.textContent.includes('Save')) { b.textContent = '⭐ Saved!'; setTimeout(() => b.textContent = '⭐ Save Snippet', 1500); }});
}

function renderUEHistory() {
  if (!ueState.history.length) return '<p style="color:var(--text-muted);font-size:13px;text-align:center;padding:20px">No history yet. Generate something first!</p>';
  return ueState.history.map((item, i) => `
    <div class="ue-snippet-card ${item.starred ? 'starred' : ''}">
      <div class="ue-snippet-header">
        <div style="display:flex;align-items:center;gap:8px">
          ${item.starred ? '<span style="color:#f59e0b">⭐</span>' : ''}
          <span class="ue-snippet-mode">${item.mode}</span>
          <span class="ue-snippet-time">${new Date(item.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
        </div>
        <div style="display:flex;gap:4px">
          <button class="ue-btn-xs" data-ue-load-snippet="${i}">Load</button>
          <button class="ue-btn-xs" data-ue-copy-snippet="${i}">Copy</button>
        </div>
      </div>
      <div class="ue-snippet-prompt">${item.prompt.slice(0,100).replace(/</g,'<').replace(/>/g,'>')}${item.prompt.length > 100 ? '...' : ''}</div>
    </div>
  `).join('');
}

function loadUESnippet(index) {
  const item = ueState.history[index];
  if (!item) return;
  ueState.mode = item.mode;
  ueState.lastOutput = item.output;
  ueState.activeTab = 'generate';
  const panel = document.getElementById('toolPanelContent');
  if (panel) {
    renderUECoPilot(panel);
    const promptEl = document.getElementById('uePromptInput');
    if (promptEl) promptEl.value = item.prompt;
    const outputArea = document.getElementById('ueOutputArea');
    const outputEl = document.getElementById('ueOutput');
    if (outputArea) outputArea.style.display = 'block';
    if (outputEl) outputEl.innerHTML = renderMarkdown(item.output);
  }
}

function copyUESnippetOutput(index) {
  const item = ueState.history[index];
  if (item) navigator.clipboard.writeText(item.output);
}

function clearUEHistory() {
  ueState.history = [];
  ueState.lastOutput = '';
  try { localStorage.removeItem('ue_copilot_history'); } catch(e) {}
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderUECoPilot(panel);
}

(function loadUEHistory() {
  try { const s = localStorage.getItem('ue_copilot_history'); if (s) ueState.history = JSON.parse(s); } catch(e) {}
})();

document.addEventListener('DOMContentLoaded', init);

// ── HUGGINGFACE DATASETS PANEL ──────────────────────────────────
let hfDsAllData = [];
let hfDsFiltered = [];

function renderHFDatasets(container) {
  container.innerHTML = `
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:48px;margin-bottom:8px">\U0001f917</div>
      <h3 style="font-size:18px;background:linear-gradient(135deg,#FFD700,#FFA500);-webkit-background-clip:text;-webkit-text-fill-color:transparent">HuggingFace Datasets</h3>
      <p style="font-size:12px;color:var(--text-muted);margin-top:4px">41 AI Datasets \u2022 No API Key \u2022 Download & Go</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">
      <div style="background:var(--bg-tertiary);border-radius:10px;padding:12px;text-align:center;border:1px solid var(--border)">
        <div style="font-size:22px;font-weight:800;color:#FFD700" id="hfds-stat-total">41</div>
        <div style="font-size:10px;color:var(--text-muted)">Datasets</div>
      </div>
      <div style="background:var(--bg-tertiary);border-radius:10px;padding:12px;text-align:center;border:1px solid var(--border)">
        <div style="font-size:22px;font-weight:800;color:#4CAF50" id="hfds-stat-cats">8</div>
        <div style="font-size:10px;color:var(--text-muted)">Categories</div>
      </div>
      <div style="background:var(--bg-tertiary);border-radius:10px;padding:12px;text-align:center;border:1px solid var(--border)">
        <div style="font-size:22px;font-weight:800;color:#2196F3" id="hfds-stat-local">0</div>
        <div style="font-size:10px;color:var(--text-muted)">Downloaded</div>
      </div>
    </div>
    <input type="text" id="hfds-search" placeholder="\U0001f50d Search datasets..." oninput="hfdsSearch()"
      style="width:100%;padding:10px 14px;background:var(--bg-tertiary);border:1px solid var(--border);border-radius:10px;color:var(--text-primary);font-size:13px;outline:none;box-sizing:border-box;margin-bottom:10px">
    <div style="display:flex;gap:8px;margin-bottom:16px">
      <select id="hfds-sort" onchange="hfdsSort()" style="flex:1;padding:8px;background:var(--bg-tertiary);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);font-size:12px">
        <option value="name">Sort: Name</option>
        <option value="downloads">Sort: Downloads</option>
        <option value="trending">Sort: Trending</option>
      </select>
      <select id="hfds-cat" onchange="hfdsCatFilter()" style="flex:1;padding:8px;background:var(--bg-tertiary);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);font-size:12px">
        <option value="all">All Categories</option>
      </select>
      <button onclick="hfdsLiveSearch()" style="padding:8px 14px;background:linear-gradient(135deg,#FFD700,#FFA500);border:none;border-radius:8px;color:#000;font-weight:700;font-size:12px;cursor:pointer">\U0001f917 Live</button>
    </div>
    <div id="hfds-grid" style="max-height:calc(100vh - 400px);overflow-y:auto">
      <div style="text-align:center;padding:30px;color:var(--text-muted)">Loading datasets...</div>
    </div>
  `;
  hfdsLoadCatalog();
}

async function hfdsLoadCatalog() {
  // Load the built-in catalog via IPC bridge
  try {
    let data;
    if (window.superNinja && window.superNinja.getHFDatasets) {
      data = await window.superNinja.getHFDatasets();
    }
    if (data && (data.datasets || Array.isArray(data))) {
      hfDsAllData = data.datasets || data || [];
    } else {
      // Fallback: use HF API directly
      const resp = await fetch('https://huggingface.co/api/datasets?sort=downloads&direction=-1&limit=41');
      const apiData = await resp.json();
      hfDsAllData = apiData.map(d => ({ id: d.id, name: d.id.split('/').pop(), description: d.description || '', downloads: d.downloads || 0, likes: d.likes || 0, category: (d.tags && d.tags[0]) || 'General' }));
    }
    hfDsFiltered = [...hfDsAllData];
    hfdsRender();
    const cats = [...new Set(hfDsAllData.map(d => d.category).filter(Boolean))];
    const sel = document.getElementById('hfds-cat');
    if (sel) sel.innerHTML = '<option value="all">All Categories</option>' + cats.map(c => '<option value="' + c + '">' + c + '</option>').join('');
    const el = document.getElementById('hfds-stat-total');
    if (el) el.textContent = hfDsAllData.length;
    const catEl = document.getElementById('hfds-stat-cats');
    if (catEl) catEl.textContent = cats.length;
  } catch(e) {
    const grid = document.getElementById('hfds-grid');
    if (grid) grid.innerHTML = '<div style="text-align:center;padding:30px;color:#ff4444">Error loading: ' + e.message + '</div>';
  }
}

function hfdsRender() {
  const grid = document.getElementById('hfds-grid');
  if (!grid) return;
  if (hfDsFiltered.length === 0) {
    grid.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted)">No datasets found</div>';
    return;
  }
  grid.innerHTML = hfDsFiltered.map(d => {
    const name = d.name || d.id.split('/').pop();
    const desc = (d.description || '').substring(0, 80) + ((d.description||'').length > 80 ? '...' : '');
    const dl = d.downloads ? d.downloads.toLocaleString() : 'N/A';
    return `<div style="background:var(--bg-tertiary);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:8px;cursor:pointer" onclick="hfdsDetail('${d.id}')">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--text-primary)">${name}</div>
        <div style="font-size:11px;color:#FFD700;margin-top:2px">${d.id}</div></div>
        <span style="font-size:9px;padding:2px 8px;background:rgba(255,215,0,.15);color:#FFD700;border-radius:6px;font-weight:600">${d.category || 'General'}</span></div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:6px;line-height:1.4">${desc}</div>
      <div style="display:flex;gap:12px;margin-top:8px">
        <span style="font-size:10px;color:var(--text-muted)">\u2b07 ${dl}</span>
        <span style="font-size:10px;color:var(--text-muted)">\u2764 ${d.likes || 'N/A'}</span>
      </div></div>`;
  }).join('');
}

function hfdsSearch() {
  const q = (document.getElementById('hfds-search')?.value || '').toLowerCase();
  hfDsFiltered = hfDsAllData.filter(d =>
    (d.id||'').toLowerCase().includes(q) || (d.name||'').toLowerCase().includes(q) ||
    (d.description||'').toLowerCase().includes(q) || (d.category||'').toLowerCase().includes(q));
  hfdsRender();
}

function hfdsSort() {
  const v = document.getElementById('hfds-sort')?.value || 'name';
  if (v === 'downloads') hfDsFiltered.sort((a,b) => (b.downloads||0) - (a.downloads||0));
  else if (v === 'trending') hfDsFiltered.sort((a,b) => (b.likes||0) - (a.likes||0));
  else hfDsFiltered.sort((a,b) => (a.name||a.id).localeCompare(b.name||b.id));
  hfdsRender();
}

function hfdsCatFilter() {
  const cat = document.getElementById('hfds-cat')?.value || 'all';
  hfDsFiltered = cat === 'all' ? [...hfDsAllData] : hfDsAllData.filter(d => d.category === cat);
  hfdsRender();
}

function hfdsDetail(id) {
  const d = hfDsAllData.find(x => x.id === id);
  if (!d) return;
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
  modal.innerHTML = `
    <div style="background:var(--bg-secondary);border-radius:16px;max-width:500px;width:100%;max-height:80vh;overflow-y:auto;padding:24px;border:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px">
        <div><div style="font-size:18px;font-weight:800;color:var(--text-primary)">${d.name || d.id.split('/').pop()}</div>
        <div style="font-size:12px;color:#FFD700;margin-top:4px">${d.id}</div></div>
        <div onclick="this.closest('div[style*=fixed]').remove()" style="font-size:20px;cursor:pointer;color:var(--text-muted)">&times;</div></div>
      <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:16px">${d.description || 'No description'}</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">
        <div style="background:var(--bg-tertiary);border-radius:10px;padding:10px;text-align:center;border:1px solid var(--border)"><div style="font-size:16px;font-weight:800;color:#FFD700">${d.downloads ? d.downloads.toLocaleString() : 'N/A'}</div><div style="font-size:10px;color:var(--text-muted)">Downloads</div></div>
        <div style="background:var(--bg-tertiary);border-radius:10px;padding:10px;text-align:center;border:1px solid var(--border)"><div style="font-size:16px;font-weight:800;color:#e91e63">${d.likes || 'N/A'}</div><div style="font-size:10px;color:var(--text-muted)">Likes</div></div>
        <div style="background:var(--bg-tertiary);border-radius:10px;padding:10px;text-align:center;border:1px solid var(--border)"><div style="font-size:16px;font-weight:800;color:#4CAF50">${d.category || 'General'}</div><div style="font-size:10px;color:var(--text-muted)">Category</div></div></div>
      <div style="display:flex;gap:8px">
        <a href="https://huggingface.co/datasets/${d.id}" target="_blank" style="flex:1;padding:10px;background:linear-gradient(135deg,#FFD700,#FFA500);border:none;border-radius:10px;color:#000;font-size:12px;font-weight:700;cursor:pointer;text-align:center;text-decoration:none">View on HuggingFace</a>
        <button onclick="hfdsDownloadReadme('${d.id}')" style="flex:1;padding:10px;background:var(--bg-tertiary);border:1px solid var(--border);border-radius:10px;color:var(--text-primary);font-size:12px;font-weight:600;cursor:pointer">Download README</button></div></div>`;
  document.body.appendChild(modal);
}

async function hfdsDownloadReadme(id) {
  try {
    if (window.superNinja && window.superNinja.downloadHFReadme) {
      const r = await window.superNinja.downloadHFReadme(id);
      if (r && r.success) { showNotification('README downloaded for ' + id, 'success'); }
      else { showNotification('Download issue: ' + (r?.error || 'Unknown'), 'warning'); }
    } else {
      window.open('https://huggingface.co/datasets/' + id + '/raw/main/README.md', '_blank');
    }
  } catch(e) { showNotification('Error: ' + e.message, 'error'); }
}

function hfdsLiveSearch() {
  const q = document.getElementById('hfds-search')?.value || '';
  if (q.length < 2) { showNotification('Type at least 2 characters', 'warning'); return; }
  const grid = document.getElementById('hfds-grid');
  if (grid) grid.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted)">Searching HuggingFace Hub...</div>';
  fetch('https://huggingface.co/api/datasets?search=' + encodeURIComponent(q) + '&sort=downloads&direction=-1&limit=20')
    .then(r => r.json())
    .then(data => {
      hfDsFiltered = data.map(d => ({ id: d.id, name: d.id.split('/').pop(), description: d.description || '', downloads: d.downloads || 0, likes: d.likes || 0, category: (d.tags && d.tags[0]) || 'General' }));
      hfdsRender();
      showNotification('Found ' + hfDsFiltered.length + ' datasets', 'success');
    })
    .catch(e => {
      if (grid) grid.innerHTML = '<div style="text-align:center;padding:30px;color:#ff4444">Search failed: ' + e.message + '</div>';
    });
}
