/**
 * 🐐⚡ Super GOAT Ninja Launcher - Renderer Logic
 * Complete UI controller for all tools and views
 */

// ============================================================
// GLOBAL STATE
// ============================================================
const state = {
  currentView: 'home',
  serverStatus: 'checking',
  serverUrl: 'http://93.127.214.171:3002',
  localUrl: 'http://localhost:3000',
  terminalHistory: [
    { type: 'sys', text: '🐐⚡ Super GOAT Ninja Terminal v2.0' },
    { type: 'sys', text: 'Type "help" for available commands' },
  ],
  chatMessages: [
    { role: 'assistant', text: '🐐 Welcome to Super GOAT Ninja Launcher! I\'m your AI assistant. Ask me anything about your music catalog, royalties, or tools.' }
  ],
  isProcessing: false,
  aiProvider: 'gemini',
};

// ============================================================
// LAUNCHER API (from preload)
// ============================================================
const launcher = window.goatLauncher || {
  minimize: () => {},
  maximize: () => {},
  close: () => {},
  quit: () => {},
  openExternal: (url) => window.open(url, '_blank'),
  openToolWindow: (opts) => window.open(opts.url, '_blank'),
  checkServer: async () => ({ status: 'unknown' }),
  getConfig: async () => ({}),
  notify: (t, b) => console.log(t, b),
  on: () => {},
};

// ============================================================
// SERVER STATUS
// ============================================================
async function checkServer() {
  updateStatus('checking', 'Checking server...');
  try {
    const result = await launcher.checkServer();
    if (result.status === 'online') {
      updateStatus('online', 'Server Online ✅');
    } else {
      updateStatus('offline', 'Server Offline ❌');
    }
  } catch {
    updateStatus('offline', 'Server Offline ❌');
  }
}

function updateStatus(status, text) {
  state.serverStatus = status;
  const dot = document.getElementById('statusDot');
  const txt = document.getElementById('statusText');
  if (dot) { dot.className = `status-dot ${status}`; }
  if (txt) txt.textContent = text;
}

// ============================================================
// VIEW ROUTER
// ============================================================
const VIEW_TITLES = {
  'home': '🏠 Home — Super GOAT Ninja Launcher',
  'command-center': '⚡ Command Center',
  'tools': '🛠️ All Tools',
  'dashboard': '📊 Music Dashboard',
  'tracks': '🎵 Track Manager',
  'royalties': '💰 Royalty Calculator',
  'analytics': '📈 Streaming Analytics',
  'publishing': '📄 Publishing',
  'ai-chat': '🧠 AI Chat',
  'ms-vanessa': '👩‍💼 Ms. Vanessa AI',
  'automation': '🤖 Browser Automation',
  'terminal': '💻 Terminal',
  'code-editor': '📝 Code Editor',
  'file-manager': '📁 File Manager',
  'nvidia': '🟢 NVIDIA DGX Cloud',
  'cinema': '🎬 Cinema Camera Suite',
  'fashion': '👗 Fashion Forge Studio',
  'sora': '🎭 Sora AI Studio',
  'security': '🔒 Security Vault',
  'settings': '⚙️ Settings',
};

function showView(view) {
  state.currentView = view;

  // Update nav
  document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
  const navEl = document.getElementById(`nav-${view}`);
  if (navEl) navEl.classList.add('active');

  // Update title
  const titleEl = document.getElementById('mainTitle');
  if (titleEl) titleEl.textContent = VIEW_TITLES[view] || view;

  // Render content
  const content = document.getElementById('mainContent');
  if (!content) return;

  content.innerHTML = '';
  content.className = 'main-content animate-fade';

  switch (view) {
    case 'home': content.innerHTML = renderHome(); break;
    case 'command-center': renderIframe(`${state.serverUrl}/super-goat-command`, content); break;
    case 'tools': content.innerHTML = renderTools(); break;
    case 'dashboard': renderIframe(`${state.serverUrl}/dashboard`, content); break;
    case 'tracks': renderIframe(`${state.serverUrl}/tracks`, content); break;
    case 'royalties': content.innerHTML = renderRoyalties(); break;
    case 'analytics': renderIframe(`${state.serverUrl}/analytics`, content); break;
    case 'publishing': renderIframe(`${state.serverUrl}/publishing`, content); break;
    case 'ai-chat': content.innerHTML = renderAIChat(); setupChat(); break;
    case 'ms-vanessa': renderIframe(`${state.serverUrl}/ms-vanessa`, content); break;
    case 'automation': renderIframe(`${state.serverUrl}/super-goat-command`, content); break;
    case 'terminal': content.innerHTML = renderTerminal(); setupTerminal(); break;
    case 'code-editor': content.innerHTML = renderCodeEditor(); break;
    case 'file-manager': content.innerHTML = renderFileManager(); break;
    case 'nvidia': renderIframe(`${state.serverUrl}/nvidia-dgx`, content); break;
    case 'cinema': renderIframe(`${state.serverUrl}/cinema-camera`, content); break;
    case 'fashion': renderIframe(`${state.serverUrl}/fashion-store`, content); break;
    case 'sora': renderIframe(`${state.serverUrl}/sora-ai-studio`, content); break;
    case 'security': renderIframe(`${state.serverUrl}/fingerprint-auth`, content); break;
    case 'settings': content.innerHTML = renderSettings(); break;
    default: content.innerHTML = renderHome();
  }
}

function renderIframe(url, container) {
  container.style.padding = '0';
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:var(--bg2);border-bottom:1px solid var(--border);">
      <span style="font-size:12px;color:var(--muted);">🌐 ${url}</span>
      <div style="display:flex;gap:6px;">
        <button class="btn btn-ghost btn-sm" onclick="openExternal('${url}')">↗ Open in Browser</button>
        <button class="btn btn-ghost btn-sm" onclick="document.querySelector('iframe').src=document.querySelector('iframe').src">🔄 Reload</button>
      </div>
    </div>
    <iframe src="${url}" style="width:100%;height:calc(100vh - 120px);border:none;background:var(--bg);" 
      onerror="this.parentElement.innerHTML='<div style=padding:40px;text-align:center;color:var(--muted)>⚠️ Could not load page. <button class=btn btn-primary onclick=openExternal(\\&quot;${url}\\&quot;)>Open in Browser</button></div>'">
    </iframe>`;
}

function openExternal(url) {
  launcher.openExternal(url);
}

// ============================================================
// HOME VIEW
// ============================================================
function renderHome() {
  return `
    <!-- Hero Banner -->
    <div style="background:linear-gradient(135deg,rgba(108,92,231,0.15),rgba(255,215,0,0.1));border:1px solid rgba(108,92,231,0.3);border-radius:16px;padding:28px;margin-bottom:24px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:-20px;right:-20px;font-size:120px;opacity:0.05;">🐐</div>
      <div style="display:flex;align-items:center;gap:16px;">
        <div style="font-size:56px;" class="animate-float">🐐</div>
        <div>
          <h1 style="font-size:28px;font-weight:900;background:var(--grad-goat);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">SUPER GOAT NINJA LAUNCHER</h1>
          <p style="color:var(--muted);font-size:14px;margin-top:4px;">Your unified command hub for all GOAT Royalty tools</p>
          <div style="display:flex;gap:8px;margin-top:12px;">
            <span class="tag purple">🧠 AI Powered</span>
            <span class="tag gold">💰 $865K+ Royalties</span>
            <span class="tag green">🎵 346 Tracks</span>
            <span class="tag cyan">🤖 5 Bots Active</span>
          </div>
        </div>
        <div style="margin-left:auto;display:flex;flex-direction:column;gap:8px;">
          <button class="btn btn-primary" onclick="showView('command-center')">⚡ Launch Command Center</button>
          <button class="btn btn-gold" onclick="openExternal('${state.serverUrl}')">🌐 Open Web App</button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card purple">
        <div class="stat-label">Total Tracks</div>
        <div class="stat-value purple">346</div>
        <div class="stat-sub up">↑ +23 this quarter</div>
      </div>
      <div class="stat-card gold">
        <div class="stat-label">Total Streams</div>
        <div class="stat-value gold">1.2B+</div>
        <div class="stat-sub up">↑ +12.4% monthly</div>
      </div>
      <div class="stat-card cyan">
        <div class="stat-label">Estimated Royalties</div>
        <div class="stat-value cyan">$865K+</div>
        <div class="stat-sub up">↑ +$42,300 this month</div>
      </div>
      <div class="stat-card green">
        <div class="stat-label">Active Bots</div>
        <div class="stat-value green">5</div>
        <div class="stat-sub up">✅ All operational</div>
      </div>
    </div>

    <!-- Quick Launch Grid -->
    <div class="card mb-6">
      <div class="card-header">
        <div class="card-title">🚀 Quick Launch</div>
      </div>
      <div class="tool-grid">
        ${[
          { icon:'⚡', name:'Command Center', desc:'Unified AI hub', color:'purple', view:'command-center', status:'new' },
          { icon:'🧠', name:'AI Chat', desc:'Multi-LLM assistant', color:'purple', view:'ai-chat', status:'ai' },
          { icon:'📊', name:'Dashboard', desc:'Music analytics', color:'gold', view:'dashboard', status:'live' },
          { icon:'🎵', name:'Tracks', desc:'346 track catalog', color:'cyan', view:'tracks', status:'live' },
          { icon:'💰', name:'Royalties', desc:'$865K+ earnings', color:'gold', view:'royalties', status:'live' },
          { icon:'🤖', name:'Automation', desc:'5 active bots', color:'green', view:'automation', status:'live' },
          { icon:'💻', name:'Terminal', desc:'Command line', color:'red', view:'terminal', status:'live' },
          { icon:'📝', name:'Code Editor', desc:'Edit source code', color:'pink', view:'code-editor', status:'live' },
          { icon:'🟢', name:'NVIDIA DGX', desc:'GPU cloud compute', color:'green', view:'nvidia', status:'live' },
          { icon:'🎬', name:'Cinema Camera', desc:'Video production', color:'red', view:'cinema', status:'live' },
          { icon:'👗', name:'Fashion Store', desc:'FashionForge Studio', color:'pink', view:'fashion', status:'live' },
          { icon:'🎭', name:'Sora AI Studio', desc:'AI video creation', color:'purple', view:'sora', status:'ai' },
        ].map(t => `
          <div class="tool-card ${t.color}" onclick="showView('${t.view}')">
            <span class="tool-status ${t.status}">${t.status.toUpperCase()}</span>
            <span class="tool-icon">${t.icon}</span>
            <div class="tool-name">${t.name}</div>
            <div class="tool-desc">${t.desc}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">⚡ Recent Activity</div>
        <button class="btn btn-ghost btn-sm" onclick="showView('analytics')">View All</button>
      </div>
      ${[
        { icon:'🎵', text:'ROYALTY FLOW hit 52.1M streams', time:'2 min ago', tag:'gold' },
        { icon:'💰', text:'New royalty payment: $23,450 pending', time:'1 hour ago', tag:'green' },
        { icon:'🤖', text:'Spotify Scraper bot completed run', time:'30 min ago', tag:'cyan' },
        { icon:'📈', text:'Monthly growth: +12.4% across all platforms', time:'Today', tag:'purple' },
        { icon:'🔒', text:'Copyright scan: 0 violations found', time:'6 hours ago', tag:'green' },
      ].map(a => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(42,42,58,0.5);">
          <span style="font-size:20px;">${a.icon}</span>
          <span style="flex:1;font-size:13px;">${a.text}</span>
          <span class="tag ${a.tag}" style="font-size:10px;">${a.time}</span>
        </div>
      `).join('')}
    </div>`;
}

// ============================================================
// TOOLS VIEW
// ============================================================
function renderTools() {
  const allTools = [
    { cat: '🎵 Music', tools: [
      { icon:'📊', name:'Dashboard', desc:'Real-time streaming analytics', color:'gold', view:'dashboard' },
      { icon:'🎵', name:'Track Manager', desc:'Manage 346 tracks', color:'cyan', view:'tracks' },
      { icon:'💰', name:'Royalty Calculator', desc:'Earnings across 6 platforms', color:'gold', view:'royalties' },
      { icon:'📈', name:'Streaming Analytics', desc:'Platform breakdown', color:'purple', view:'analytics' },
      { icon:'📄', name:'Publishing', desc:'ASCAP/BMI management', color:'cyan', view:'publishing' },
    ]},
    { cat: '🧠 AI Tools', tools: [
      { icon:'🧠', name:'AI Chat', desc:'GPT-4o, Gemini, Claude', color:'purple', view:'ai-chat' },
      { icon:'👩‍💼', name:'Ms. Vanessa AI', desc:'Personal AI assistant', color:'pink', view:'ms-vanessa' },
      { icon:'🤖', name:'Browser Automation', desc:'Axiom-powered bots', color:'green', view:'automation' },
      { icon:'🎭', name:'Sora AI Studio', desc:'AI video generation', color:'purple', view:'sora' },
    ]},
    { cat: '💻 Dev Tools', tools: [
      { icon:'💻', name:'Terminal', desc:'Command line interface', color:'red', view:'terminal' },
      { icon:'📝', name:'Code Editor', desc:'Multi-file editor', color:'pink', view:'code-editor' },
      { icon:'📁', name:'File Manager', desc:'Browse project files', color:'cyan', view:'file-manager' },
    ]},
    { cat: '🌐 Platform', tools: [
      { icon:'🟢', name:'NVIDIA DGX Cloud', desc:'GPU-accelerated AI', color:'green', view:'nvidia' },
      { icon:'🎬', name:'Cinema Camera', desc:'Video production suite', color:'red', view:'cinema' },
      { icon:'👗', name:'Fashion Forge', desc:'Fashion design studio', color:'pink', view:'fashion' },
      { icon:'🔒', name:'Security Vault', desc:'IP protection & auth', color:'red', view:'security' },
    ]},
  ];

  return allTools.map(cat => `
    <div class="card mb-6">
      <div class="card-header">
        <div class="card-title">${cat.cat}</div>
      </div>
      <div class="tool-grid">
        ${cat.tools.map(t => `
          <div class="tool-card ${t.color}" onclick="showView('${t.view}')">
            <span class="tool-icon">${t.icon}</span>
            <div class="tool-name">${t.name}</div>
            <div class="tool-desc">${t.desc}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// ============================================================
// ROYALTY CALCULATOR
// ============================================================
function renderRoyalties() {
  return `
    <div class="stats-grid mb-6">
      <div class="stat-card gold">
        <div class="stat-label">Total Royalties</div>
        <div class="stat-value gold">$865,420</div>
        <div class="stat-sub up">↑ +$42,300 this month</div>
      </div>
      <div class="stat-card green">
        <div class="stat-label">Pending Payments</div>
        <div class="stat-value green">$23,450</div>
        <div class="stat-sub">Next payout: Mar 1</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-label">Publishing Revenue</div>
        <div class="stat-value purple">$156,800</div>
        <div class="stat-sub up">↑ +8.2%</div>
      </div>
    </div>

    <!-- Calculator -->
    <div class="card mb-6">
      <div class="card-header">
        <div class="card-title">🧮 Royalty Calculator</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
        <div>
          <label style="font-size:12px;color:var(--muted);display:block;margin-bottom:6px;">Platform</label>
          <select id="calcPlatform" style="width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:13px;">
            <option value="spotify">Spotify ($0.006/stream)</option>
            <option value="apple_music">Apple Music ($0.007/stream)</option>
            <option value="youtube_music">YouTube Music ($0.007/stream)</option>
            <option value="amazon_music">Amazon Music ($0.008/stream)</option>
            <option value="tidal">Tidal ($0.012/stream)</option>
            <option value="deezer">Deezer ($0.008/stream)</option>
          </select>
        </div>
        <div>
          <label style="font-size:12px;color:var(--muted);display:block;margin-bottom:6px;">Number of Streams</label>
          <input id="calcStreams" type="number" value="1000000" style="width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:13px;" />
        </div>
      </div>
      <button class="btn btn-primary w-full" onclick="calculateRoyalty()">💰 Calculate Earnings</button>
      <div id="calcResult" style="margin-top:16px;display:none;background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);border-radius:10px;padding:16px;text-align:center;">
        <div style="font-size:32px;font-weight:900;color:var(--gold);" id="calcAmount">$0</div>
        <div style="font-size:13px;color:var(--muted);margin-top:4px;" id="calcDetails"></div>
      </div>
    </div>

    <!-- Platform Breakdown -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">💰 Revenue by Platform</div>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:1px solid var(--border);">
            <th style="text-align:left;padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);">Platform</th>
            <th style="text-align:left;padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);">Rate</th>
            <th style="text-align:left;padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);">Streams</th>
            <th style="text-align:left;padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);">Revenue</th>
          </tr>
        </thead>
        <tbody>
          ${[
            { name:'🟢 Spotify', rate:'$0.0060', streams:'485M', rev:'$291,000', color:'#1db954' },
            { name:'🔴 Apple Music', rate:'$0.0070', streams:'312M', rev:'$218,400', color:'#fc3c44' },
            { name:'🔴 YouTube Music', rate:'$0.0070', streams:'198M', rev:'$138,600', color:'#ff0000' },
            { name:'🔵 Amazon Music', rate:'$0.0080', streams:'112M', rev:'$89,600', color:'#00a8e1' },
            { name:'⚫ Tidal', rate:'$0.0120', streams:'56M', rev:'$67,200', color:'#a0a0a0' },
            { name:'🟣 Deezer', rate:'$0.0080', streams:'37M', rev:'$29,600', color:'#a238ff' },
          ].map(r => `
            <tr style="border-bottom:1px solid rgba(42,42,58,0.5);">
              <td style="padding:10px 12px;font-weight:600;font-size:13px;">${r.name}</td>
              <td style="padding:10px 12px;font-size:13px;color:var(--cyan);">${r.rate}</td>
              <td style="padding:10px 12px;font-size:13px;">${r.streams}</td>
              <td style="padding:10px 12px;font-size:13px;font-weight:700;color:var(--gold);">${r.rev}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

function calculateRoyalty() {
  const platform = document.getElementById('calcPlatform').value;
  const streams = parseInt(document.getElementById('calcStreams').value) || 0;
  const rates = { spotify:0.006, apple_music:0.007, youtube_music:0.007, amazon_music:0.008, tidal:0.012, deezer:0.008 };
  const rate = rates[platform] || 0.006;
  const revenue = (streams * rate).toFixed(2);
  const formatted = parseFloat(revenue).toLocaleString('en-US', { style:'currency', currency:'USD' });

  document.getElementById('calcResult').style.display = 'block';
  document.getElementById('calcAmount').textContent = formatted;
  document.getElementById('calcDetails').textContent = `${streams.toLocaleString()} streams × $${rate}/stream on ${platform.replace('_',' ')}`;
}

// ============================================================
// AI CHAT
// ============================================================
function renderAIChat() {
  return `
    <div style="display:flex;flex-direction:column;height:calc(100vh - 120px);">
      <!-- Provider selector -->
      <div style="display:flex;gap:8px;margin-bottom:12px;">
        ${[
          { id:'gemini', name:'✨ Gemini', color:'#4285f4' },
          { id:'openai', name:'🧠 GPT-4o', color:'#10a37f' },
          { id:'claude', name:'🎭 Claude', color:'#cc785c' },
        ].map(p => `
          <button onclick="state.aiProvider='${p.id}';document.querySelectorAll('.ai-provider-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')"
            class="btn btn-secondary btn-sm ai-provider-btn ${state.aiProvider===p.id?'active':''}"
            style="${state.aiProvider===p.id?`border-color:${p.color};color:${p.color};`:''}">
            ${p.name}
          </button>
        `).join('')}
      </div>

      <!-- Messages -->
      <div id="chatMessages" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:12px;padding:4px 0;">
        ${state.chatMessages.map(m => renderChatMessage(m)).join('')}
      </div>

      <!-- Input -->
      <div style="margin-top:12px;background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:10px 14px;display:flex;align-items:flex-end;gap:8px;">
        <textarea id="chatInput" placeholder="Ask Super GOAT AI anything..." 
          style="flex:1;background:transparent;border:none;color:var(--text);font-size:14px;resize:none;outline:none;min-height:24px;max-height:100px;font-family:inherit;line-height:1.5;"
          rows="1"
          onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChat();}"></textarea>
        <button class="btn btn-primary btn-icon" onclick="sendChat()" id="sendBtn">➤</button>
      </div>
    </div>`;
}

function renderChatMessage(msg) {
  const isUser = msg.role === 'user';
  return `
    <div style="display:flex;gap:10px;max-width:85%;${isUser?'align-self:flex-end;flex-direction:row-reverse;':''}">
      <div style="width:32px;height:32px;border-radius:8px;background:${isUser?'var(--grad-ninja)':'var(--grad-goat)'};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">
        ${isUser?'👤':'🐐'}
      </div>
      <div style="background:${isUser?'rgba(108,92,231,0.15)':'var(--card)'};border:1px solid ${isUser?'rgba(108,92,231,0.3)':'var(--border)'};border-radius:10px;padding:10px 14px;font-size:13px;line-height:1.6;white-space:pre-wrap;">
        ${msg.text}
      </div>
    </div>`;
}

function setupChat() {
  // Scroll to bottom
  setTimeout(() => {
    const msgs = document.getElementById('chatMessages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }, 100);
}

async function sendChat() {
  const input = document.getElementById('chatInput');
  if (!input || !input.value.trim() || state.isProcessing) return;

  const text = input.value.trim();
  input.value = '';
  state.isProcessing = true;

  // Add user message
  state.chatMessages.push({ role: 'user', text });
  const msgs = document.getElementById('chatMessages');
  if (msgs) {
    msgs.innerHTML += renderChatMessage({ role: 'user', text });
    msgs.innerHTML += `<div id="typing" style="display:flex;gap:10px;"><div style="width:32px;height:32px;border-radius:8px;background:var(--grad-goat);display:flex;align-items:center;justify-content:center;">🐐</div><div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px 14px;font-size:13px;color:var(--muted);">✨ Thinking...</div></div>`;
    msgs.scrollTop = msgs.scrollHeight;
  }

  try {
    const res = await fetch(`${state.localUrl}/api/ai-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, provider: state.aiProvider })
    });
    const data = await res.json();
    const reply = data.response || data.message || 'Sorry, I could not process that.';

    state.chatMessages.push({ role: 'assistant', text: reply });
    const typing = document.getElementById('typing');
    if (typing) typing.outerHTML = renderChatMessage({ role: 'assistant', text: reply });
  } catch {
    const fallback = generateFallback(text);
    state.chatMessages.push({ role: 'assistant', text: fallback });
    const typing = document.getElementById('typing');
    if (typing) typing.outerHTML = renderChatMessage({ role: 'assistant', text: fallback });
  }

  state.isProcessing = false;
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
}

function generateFallback(input) {
  const lower = input.toLowerCase();
  if (lower.includes('royalt') || lower.includes('money')) return '💰 Total Royalties: $865,420+\n• Spotify: $291,000\n• Apple Music: $218,400\n• YouTube: $138,600\n• Amazon: $89,600\n• Tidal: $67,200\n• Deezer: $29,600';
  if (lower.includes('track') || lower.includes('song')) return '🎵 You have 346 tracks:\n• FASTASSMAN Publishing: 189 tracks\n• Harvey L Miller Writers: 157 tracks\nTop: ROYALTY FLOW (52.1M streams)';
  if (lower.includes('stream')) return '📊 Total Streams: 1.2B+\nSpotify: 485M | Apple: 312M\nYouTube: 198M | Amazon: 112M';
  return `🐐 I'm your Super GOAT AI assistant. I can help with royalties, tracks, analytics, automation, and more. What would you like to know?`;
}

// ============================================================
// TERMINAL
// ============================================================
function renderTerminal() {
  return `
    <div style="height:calc(100vh - 120px);display:flex;flex-direction:column;">
      <div class="terminal" id="termOutput" style="flex:1;">
        ${state.terminalHistory.map(l => `<div class="terminal-line ${l.type}">${l.text}</div>`).join('')}
      </div>
      <div class="terminal-input-row" style="background:#0d0d0d;padding:8px 16px;border-radius:0 0 10px 10px;">
        <span class="terminal-prompt">super-goat@royalty:~$</span>
        <input class="terminal-input" id="termInput" placeholder="Type a command..." autofocus />
      </div>
    </div>`;
}

function setupTerminal() {
  const input = document.getElementById('termInput');
  if (input) {
    input.focus();
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        if (cmd) { runTerminalCommand(cmd); input.value = ''; }
      }
    });
  }
}

function runTerminalCommand(cmd) {
  const COMMANDS = {
    help: '📋 Commands:\n  tracks    — Catalog summary\n  royalties — Revenue overview\n  streams   — Streaming stats\n  bots      — Automation status\n  server    — Check server\n  open      — Open web app\n  clear     — Clear terminal',
    tracks: '🎵 Catalog: 346 tracks\n  FASTASSMAN: 189 | Harvey: 157\n  Top: ROYALTY FLOW (52.1M streams)',
    royalties: '💰 Total: $865,420+\n  Spotify: $291,000 | Apple: $218,400\n  YouTube: $138,600 | Amazon: $89,600',
    streams: '📊 Total: 1.2B+\n  Spotify: 485M | Apple: 312M\n  YouTube: 198M | Amazon: 112M',
    bots: '🤖 Active Bots: 5\n  ✅ Spotify Scraper\n  ✅ YouTube Analytics\n  ✅ Social Monitor\n  📅 Royalty Reporter\n  ✅ Copyright Scanner',
    server: '🌐 Checking server...\n  http://93.127.214.171:3002 → checking...',
    open: '🌐 Opening web app...',
    clear: 'CLEAR',
  };

  const output = COMMANDS[cmd.toLowerCase()] || `❌ Unknown: ${cmd}\nType "help" for commands.`;

  if (output === 'CLEAR') {
    state.terminalHistory = [{ type: 'sys', text: '🐐 Terminal cleared.' }];
  } else {
    state.terminalHistory.push({ type: 'cmd', text: `$ ${cmd}` });
    state.terminalHistory.push({ type: 'output', text: output });
    if (cmd === 'open') launcher.openExternal(state.serverUrl);
    if (cmd === 'server') checkServer();
  }

  const out = document.getElementById('termOutput');
  if (out) {
    out.innerHTML = state.terminalHistory.map(l => `<div class="terminal-line ${l.type}">${l.text}</div>`).join('');
    out.scrollTop = out.scrollHeight;
  }
}

// ============================================================
// CODE EDITOR
// ============================================================
function renderCodeEditor() {
  return `
    <div style="height:calc(100vh - 120px);display:flex;flex-direction:column;">
      <div style="display:flex;gap:4px;background:var(--bg2);padding:8px 12px;border-radius:10px 10px 0 0;border:1px solid var(--border);border-bottom:none;">
        <div style="padding:4px 12px;background:var(--bg3);border-radius:6px;font-size:12px;color:var(--text);">pages/index.js</div>
        <div style="padding:4px 12px;border-radius:6px;font-size:12px;color:var(--muted);cursor:pointer;" onclick="this.style.background='var(--bg3)';this.style.color='var(--text)'">components/SuperGOAT.js</div>
        <div style="padding:4px 12px;border-radius:6px;font-size:12px;color:var(--muted);cursor:pointer;" onclick="this.style.background='var(--bg3)';this.style.color='var(--text)'">styles/super-goat.css</div>
        <div style="margin-left:auto;display:flex;gap:6px;">
          <button class="btn btn-primary btn-sm">▶ Run</button>
          <button class="btn btn-secondary btn-sm">💾 Save</button>
          <button class="btn btn-ghost btn-sm" onclick="openExternal('https://github.com/DJSPEEDYGA/GOAT-Royalty-App2')">🐙 GitHub</button>
        </div>
      </div>
      <textarea style="flex:1;background:#1e1e2e;border:1px solid var(--border);border-top:none;border-radius:0 0 10px 10px;color:#cdd6f4;font-family:'Consolas','Courier New',monospace;font-size:13px;padding:16px;resize:none;outline:none;line-height:1.6;"
        spellcheck="false"
      >// 🐐⚡ Super GOAT Royalty App - Main Entry
// Harvey Miller (DJ Speedy) | GOAT Royalty © 2025

import React from 'react';
import SuperGOATCommandCenter from '../components/SuperGOATCommandCenter';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Super GOAT Royalty | Command Center</title>
      </Head>
      <SuperGOATCommandCenter />
    </>
  );
}

// Platform Stats:
// 346 Tracks | 1.2B+ Streams | $865K+ Royalties
// Publishers: FASTASSMAN Publishing Inc (ASCAP)
//             Harvey L Miller Writers</textarea>
    </div>`;
}

// ============================================================
// FILE MANAGER
// ============================================================
function renderFileManager() {
  const files = [
    { icon:'📁', name:'components/', type:'Folder', size:'—', modified:'Feb 27, 2026' },
    { icon:'📁', name:'pages/', type:'Folder', size:'—', modified:'Feb 27, 2026' },
    { icon:'📁', name:'styles/', type:'Folder', size:'—', modified:'Feb 27, 2026' },
    { icon:'📁', name:'automation/', type:'Folder', size:'—', modified:'Feb 27, 2026' },
    { icon:'📁', name:'super-ninja-app/', type:'Folder', size:'—', modified:'Feb 27, 2026' },
    { icon:'📁', name:'data/catalogs/', type:'Folder', size:'—', modified:'Feb 27, 2026' },
    { icon:'📁', name:'launcher/', type:'Folder', size:'—', modified:'Feb 27, 2026' },
    { icon:'📄', name:'package.json', type:'JSON', size:'2.8 KB', modified:'Feb 27, 2026' },
    { icon:'📄', name:'README.md', type:'Markdown', size:'8.2 KB', modified:'Feb 27, 2026' },
    { icon:'📊', name:'WorksCatalog HARVEY.csv', type:'CSV', size:'298 KB', modified:'Feb 27, 2026' },
    { icon:'📊', name:'WorksCatalog FASTASSMAN.csv', type:'CSV', size:'286 KB', modified:'Feb 27, 2026' },
    { icon:'🖼️', name:'ULTRA REALISTIC POSTERS.png', type:'Image', size:'2.6 MB', modified:'Feb 27, 2026' },
  ];

  return `
    <div class="card">
      <div class="card-header">
        <div class="card-title">📁 GOAT-Royalty-App2</div>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-secondary btn-sm" onclick="openExternal('https://github.com/DJSPEEDYGA/GOAT-Royalty-App2')">🐙 GitHub</button>
          <button class="btn btn-primary btn-sm" onclick="launcher.openFileDialog()">📤 Upload</button>
        </div>
      </div>
      <div class="search-bar mb-4">
        <span>🔍</span>
        <input placeholder="Search files..." />
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:1px solid var(--border);">
            <th style="text-align:left;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);">Name</th>
            <th style="text-align:left;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);">Type</th>
            <th style="text-align:left;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);">Size</th>
            <th style="text-align:left;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);">Modified</th>
          </tr>
        </thead>
        <tbody>
          ${files.map(f => `
            <tr style="border-bottom:1px solid rgba(42,42,58,0.5);cursor:pointer;" onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background='transparent'">
              <td style="padding:9px 12px;font-size:13px;font-weight:600;">${f.icon} ${f.name}</td>
              <td style="padding:9px 12px;font-size:12px;color:var(--muted);">${f.type}</td>
              <td style="padding:9px 12px;font-size:12px;">${f.size}</td>
              <td style="padding:9px 12px;font-size:12px;color:var(--muted);">${f.modified}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

// ============================================================
// SETTINGS
// ============================================================
function renderSettings() {
  return `
    <div class="card mb-4">
      <div class="card-header"><div class="card-title">🌐 Server Configuration</div></div>
      <div style="display:grid;gap:12px;">
        <div>
          <label style="font-size:12px;color:var(--muted);display:block;margin-bottom:6px;">Production Server URL</label>
          <input id="settServerUrl" value="${state.serverUrl}" style="width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:13px;" />
        </div>
        <div>
          <label style="font-size:12px;color:var(--muted);display:block;margin-bottom:6px;">Local Dev Server URL</label>
          <input id="settLocalUrl" value="${state.localUrl}" style="width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:13px;" />
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-primary" onclick="saveSettings()">💾 Save Settings</button>
          <button class="btn btn-secondary" onclick="checkServer()">🔄 Test Connection</button>
        </div>
      </div>
    </div>

    <div class="card mb-4">
      <div class="card-header"><div class="card-title">🧠 AI Configuration</div></div>
      <div style="display:grid;gap:12px;">
        <div>
          <label style="font-size:12px;color:var(--muted);display:block;margin-bottom:6px;">Google AI API Key (Gemini)</label>
          <input type="password" placeholder="AIza..." style="width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:13px;" />
        </div>
        <div>
          <label style="font-size:12px;color:var(--muted);display:block;margin-bottom:6px;">OpenAI API Key</label>
          <input type="password" placeholder="sk-..." style="width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:13px;" />
        </div>
        <div>
          <label style="font-size:12px;color:var(--muted);display:block;margin-bottom:6px;">Anthropic API Key (Claude)</label>
          <input type="password" placeholder="sk-ant-..." style="width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:13px;" />
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">ℹ️ About</div></div>
      <div style="display:grid;gap:8px;font-size:13px;">
        <div style="display:flex;justify-content:space-between;"><span style="color:var(--muted);">App Name</span><span>Super GOAT Ninja Launcher</span></div>
        <div style="display:flex;justify-content:space-between;"><span style="color:var(--muted);">Version</span><span class="tag purple">v2.0.0</span></div>
        <div style="display:flex;justify-content:space-between;"><span style="color:var(--muted);">Author</span><span>Harvey Miller (DJ Speedy)</span></div>
        <div style="display:flex;justify-content:space-between;"><span style="color:var(--muted);">Repository</span><button class="btn btn-ghost btn-sm" onclick="openExternal('https://github.com/DJSPEEDYGA/GOAT-Royalty-App2')">🐙 GitHub</button></div>
        <div style="display:flex;justify-content:space-between;"><span style="color:var(--muted);">Release</span><button class="btn btn-ghost btn-sm" onclick="openExternal('https://github.com/DJSPEEDYGA/GOAT-Royalty-App2/releases/tag/v2.0.0')">📥 v2.0.0 Downloads</button></div>
        <div style="display:flex;justify-content:space-between;"><span style="color:var(--muted);">Shortcut</span><span class="tag cyan">Ctrl+Shift+G</span></div>
      </div>
    </div>`;
}

function saveSettings() {
  const serverUrl = document.getElementById('settServerUrl')?.value;
  const localUrl = document.getElementById('settLocalUrl')?.value;
  if (serverUrl) state.serverUrl = serverUrl;
  if (localUrl) state.localUrl = localUrl;
  launcher.notify('✅ Settings Saved', 'Server configuration updated successfully');
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  showView('home');
  checkServer();

  // Listen for server status updates
  launcher.on('server-status', (data) => {
    if (data.status === 'online') updateStatus('online', 'Server Online ✅');
    else if (data.status === 'offline') updateStatus('offline', 'Server Offline ❌');
    else if (data.status === 'restarting') updateStatus('checking', 'Restarting...');
  });

  // Auto-check server every 30 seconds
  setInterval(checkServer, 30000);
});