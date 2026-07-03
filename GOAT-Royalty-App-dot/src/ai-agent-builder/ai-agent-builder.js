// ═══════════════════════════════════════════════════════════════════════════════
// GOAT AI Agent Builder — Custom AI Agent Creator & Multi-Agent Orchestrator
// Build, deploy, and chain intelligent agents powered by any LLM
// ═══════════════════════════════════════════════════════════════════════════════

const agentState = {
  activeTab: 'builder',
  agents: [],
  selectedAgent: null,
  runLog: [],
  orchestrationMode: 'sequential',
  marketplaceFilter: 'all'
};

// ── Agent Templates ──────────────────────────────────────────────────────────
const AGENT_TEMPLATES = [
  {
    id: 'music_scout',
    name: 'Music Scout Agent',
    icon: '🎵',
    category: 'music',
    description: 'Scans streaming platforms, identifies trending artists, analyzes music DNA patterns, and surfaces new talent matching your taste profile.',
    model: 'gpt-4o',
    tools: ['web_search', 'spotify_api', 'music_dna', 'trend_analysis'],
    systemPrompt: `You are a music scout AI specialized in discovering emerging talent. Your tasks:
1. Monitor Spotify, Apple Music, SoundCloud for breakout artists
2. Analyze audio fingerprints and Music DNA compatibility
3. Cross-reference social media growth rates
4. Generate weekly talent reports with match scores
5. Alert when an artist's streams spike >200% week-over-week

Always return structured JSON with: artist_name, genre, dna_match_score, growth_rate, recommendation.`,
    triggers: ['daily_scan', 'manual', 'webhook'],
    outputFormat: 'json',
    color: '#f59e0b'
  },
  {
    id: 'royalty_tracker',
    name: 'Royalty Tracker Agent',
    icon: '💰',
    category: 'finance',
    description: 'Monitors all revenue streams, calculates royalties in real-time, flags discrepancies, and generates financial reports across all DSPs.',
    model: 'claude-3-5-sonnet',
    tools: ['distrokid_api', 'tunecore_api', 'bmi_api', 'ascap_api', 'excel_export'],
    systemPrompt: `You are a royalty accounting AI for music artists. Your responsibilities:
1. Pull revenue data from all DSPs (Spotify, Apple, YouTube, TikTok, etc.)
2. Calculate mechanical, performance, sync, and master royalties
3. Flag any payments that deviate >5% from projections
4. Generate monthly P&L statements
5. Identify un-recouped advances and estimate recoupment timelines

Output format: Structured financial report with charts and anomaly alerts.`,
    triggers: ['monthly', 'on_payment', 'manual'],
    outputFormat: 'report',
    color: '#22c55e'
  },
  {
    id: 'content_creator',
    name: 'Content Creator Agent',
    icon: '🎨',
    category: 'creative',
    description: 'Auto-generates social media posts, press releases, bio updates, and promotional copy for releases, events, and milestones.',
    model: 'gpt-4o',
    tools: ['image_gen', 'copywriting', 'social_scheduler', 'trend_hooks'],
    systemPrompt: `You are a music industry content creator AI. You produce:
1. Instagram/TikTok captions with viral hooks and relevant hashtags
2. Press releases for new releases, tours, and milestones
3. Artist bio updates when career milestones are reached
4. Email newsletters to fan clubs
5. YouTube video descriptions optimized for SEO

Tone: Authentic, hype, culturally relevant. Match the artist's established voice.`,
    triggers: ['release_event', 'milestone', 'scheduled', 'manual'],
    outputFormat: 'content_pack',
    color: '#8b5cf6'
  },
  {
    id: 'fan_engagement',
    name: 'Fan Engagement Agent',
    icon: '💎',
    category: 'community',
    description: 'Monitors fan activity, personalizes outreach, manages fan club tiers, identifies superfans, and automates VIP experiences.',
    model: 'gpt-4o-mini',
    tools: ['goat_connect_api', 'email_api', 'sms_api', 'fanbase_crm'],
    systemPrompt: `You are a fan relationship AI that builds authentic connections. You:
1. Monitor fan club activity and identify top contributors
2. Send personalized birthday/anniversary messages
3. Reward fans who consistently engage (early access, merch drops, meet & greets)
4. Flag toxic behavior for moderation review
5. Generate monthly fan health reports (growth, churn, lifetime value)

Always prioritize genuine connection over automated spam.`,
    triggers: ['real_time', 'daily', 'event_based'],
    outputFormat: 'crm_actions',
    color: '#ec4899'
  },
  {
    id: 'security_agent',
    name: 'GOAT Security Agent',
    icon: '🛡️',
    category: 'security',
    description: 'Monitors for impersonators, fake profiles, leaked content, copyright violations, and cyber threats targeting the artist.',
    model: 'gpt-4o',
    tools: ['faceshield_api', 'dmca_scanner', 'social_monitor', 'dark_web_scan', 'ip_tracker'],
    systemPrompt: `You are a cybersecurity AI protecting music artists. Your mandate:
1. Scan social platforms for fake artist accounts and impersonators
2. Monitor for leaked unreleased music using audio fingerprinting
3. File DMCA takedowns automatically for copyright violations
4. Alert on dark web mentions of the artist's personal info
5. Track IP addresses of repeat copyright infringers

Severity levels: CRITICAL (immediate action), HIGH (24h), MEDIUM (weekly report).`,
    triggers: ['continuous', 'hourly', 'on_threat'],
    outputFormat: 'security_report',
    color: '#ef4444'
  },
  {
    id: 'tour_planner',
    name: 'Tour Planner Agent',
    icon: '🚌',
    category: 'logistics',
    description: 'Analyzes fan geographic data, venue capacity, ticket pricing, routing efficiency, and generates optimal tour schedules.',
    model: 'claude-3-5-sonnet',
    tools: ['maps_api', 'ticketmaster_api', 'venue_db', 'fanbase_geo', 'routing_optimizer'],
    systemPrompt: `You are a tour logistics AI that maximizes profitability and fan reach. You:
1. Analyze where fans are concentrated geographically
2. Source venues matching artist's current draw capacity
3. Optimize routing to minimize travel costs and downtime
4. Estimate ticket revenue, merch sales, and guarantees
5. Generate tour budget projections with 3 scenarios (conservative/base/optimistic)

Output: Full tour proposal with dates, venues, routing map, and financial model.`,
    triggers: ['manual', 'pre_tour', 'on_demand'],
    outputFormat: 'tour_package',
    color: '#0ea5e9'
  },
  {
    id: 'brand_deal_scout',
    name: 'Brand Deal Scout',
    icon: '🤝',
    category: 'business',
    description: 'Identifies brand partnership opportunities, analyzes deal structures, compares industry rates, and drafts initial outreach.',
    model: 'gpt-4o',
    tools: ['brand_db', 'influencer_rates', 'contract_analyzer', 'email_outreach'],
    systemPrompt: `You are a brand partnerships AI for music artists. You:
1. Identify brands whose audience demographics align with the artist's fanbase
2. Research brand budgets and typical influencer/artist deal structures
3. Analyze competitor artist brand deals for rate benchmarking
4. Draft personalized outreach emails with unique value propositions
5. Red-flag unfavorable contract terms (exclusivity, IP ownership, non-competes)

Target: Premium brand deals that enhance, not dilute, the artist's brand equity.`,
    triggers: ['weekly_scan', 'manual', 'on_inquiry'],
    outputFormat: 'deal_memo',
    color: '#f59e0b'
  },
  {
    id: 'release_coordinator',
    name: 'Release Coordinator',
    icon: '🚀',
    category: 'strategy',
    description: 'Orchestrates entire release campaigns — from pre-save to post-release analytics — coordinating all other agents in sequence.',
    model: 'gpt-4o',
    tools: ['all_agents', 'distro_api', 'pr_outreach', 'playlist_pitch', 'ads_api'],
    systemPrompt: `You are a release campaign orchestrator AI. For each new release:

WEEK -8: Analyze market timing, identify ideal release date, brief Content Creator
WEEK -4: Launch pre-save campaign, pitch playlists, distribute to DSPs
WEEK -2: Social media countdown, exclusive snippet drops, press outreach  
WEEK -1: Final promo push, influencer seeding, radio servicing
RELEASE DAY: Monitor real-time streams, fan reactions, playlist adds
WEEK +1: Analyze performance vs projections, trigger re-promotion if underperforming
WEEK +4: Full release autopsy report with learnings for next campaign

Coordinate all specialist agents. Report daily during release week.`,
    triggers: ['release_scheduled', 'manual'],
    outputFormat: 'campaign_dashboard',
    color: '#6366f1',
    isOrchestrator: true
  }
];

// ── Marketplace Agents ────────────────────────────────────────────────────────
const MARKETPLACE_AGENTS = [
  { id: 'mp_1', name: 'Viral Hook Generator', icon: '🔥', author: 'GOAT Labs', rating: 4.9, installs: 2847, category: 'creative', price: 'free', desc: 'Generates viral TikTok/Reels hooks based on trending audio patterns' },
  { id: 'mp_2', name: 'Sample Clearance Bot', icon: '⚖️', author: 'Legal Eagle AI', rating: 4.7, installs: 1203, category: 'legal', price: '$29/mo', desc: 'Identifies samples, estimates clearance costs, drafts licensing requests' },
  { id: 'mp_3', name: 'Playlist Pitcher Pro', icon: '📋', author: 'StreamBoost', rating: 4.8, installs: 3156, category: 'marketing', price: 'free', desc: 'AI pitches your tracks to 500+ editorial and algorithmic playlists' },
  { id: 'mp_4', name: 'Sync Licensing Scout', icon: '🎬', author: 'FilmScout AI', rating: 4.6, installs: 891, category: 'licensing', price: '$49/mo', desc: 'Matches your catalog to TV, film, and ad opportunities in real-time' },
  { id: 'mp_5', name: 'NFT Drop Planner', icon: '💎', author: 'Web3Music', rating: 4.5, installs: 654, category: 'web3', price: '$19/mo', desc: 'Plans NFT drops, sets rarity tiers, handles smart contract deployment' },
  { id: 'mp_6', name: 'Interview Prep Coach', icon: '🎤', author: 'MediaPro AI', rating: 4.8, installs: 1567, category: 'pr', price: 'free', desc: 'Preps artists for interviews with likely questions and talking points' }
];

// ── Multi-Agent Pipelines ─────────────────────────────────────────────────────
const ORCHESTRATION_PIPELINES = [
  {
    id: 'release_machine',
    name: '🚀 Full Release Machine',
    description: 'Complete automated release campaign from upload to chart tracking',
    agents: ['release_coordinator', 'content_creator', 'fan_engagement', 'royalty_tracker'],
    mode: 'orchestrated',
    estimatedTime: '8 weeks auto-pilot'
  },
  {
    id: 'artist_protection',
    name: '🛡️ Artist Protection Suite',
    description: 'Continuous 360° monitoring for impersonation, leaks, and threats',
    agents: ['security_agent', 'royalty_tracker', 'brand_deal_scout'],
    mode: 'parallel',
    estimatedTime: 'Continuous 24/7'
  },
  {
    id: 'fan_ecosystem',
    name: '💎 Fan Ecosystem Builder',
    description: 'Grow and monetize your fanbase with AI-powered community management',
    agents: ['fan_engagement', 'content_creator', 'music_scout'],
    mode: 'parallel',
    estimatedTime: 'Ongoing daily tasks'
  },
  {
    id: 'tour_ready',
    name: '🚌 Tour Ready Pipeline',
    description: 'Plan, promote, and execute a full tour with coordinated agents',
    agents: ['tour_planner', 'content_creator', 'fan_engagement'],
    mode: 'sequential',
    estimatedTime: '12 weeks pre-tour'
  }
];

// ── Render ────────────────────────────────────────────────────────────────────
function renderAIAgentBuilder(container) {
  container.innerHTML = `
    <div class="aab-container">
      <div class="aab-header">
        <div class="aab-header-left">
          <div class="aab-header-icon">🤖</div>
          <div>
            <div class="aab-header-title">GOAT AI Agent Builder</div>
            <div class="aab-header-sub">Build • Deploy • Orchestrate • Automate</div>
          </div>
        </div>
        <div class="aab-header-actions">
          <button class="aab-btn primary" onclick="openNewAgentModal()">+ New Agent</button>
          <button class="aab-btn secondary" onclick="openPipelineModal()">⚡ New Pipeline</button>
        </div>
      </div>

      <div class="aab-tabs">
        ${['builder','marketplace','pipelines','logs'].map(t => `
          <button class="aab-tab ${agentState.activeTab === t ? 'active' : ''}" onclick="switchAABTab('${t}')">
            ${{ builder:'🔧 Builder', marketplace:'🛒 Marketplace', pipelines:'⚡ Pipelines', logs:'📋 Run Logs' }[t]}
          </button>
        `).join('')}
      </div>

      <div class="aab-body" id="aabBody">
        ${renderAABTab()}
      </div>
    </div>
  `;
}

function renderAABTab() {
  switch (agentState.activeTab) {
    case 'builder': return renderAABBuilder();
    case 'marketplace': return renderAABMarketplace();
    case 'pipelines': return renderAABPipelines();
    case 'logs': return renderAABLogs();
    default: return renderAABBuilder();
  }
}

function renderAABBuilder() {
  return `
    <div class="aab-builder-wrap">
      <div class="aab-templates-header">
        <div class="aab-section-title">🎯 Agent Templates</div>
        <div class="aab-section-sub">Pre-built agents for every music industry need — customize and deploy in seconds</div>
      </div>
      <div class="aab-templates-grid">
        ${AGENT_TEMPLATES.map(t => `
          <div class="aab-template-card" onclick="selectAgentTemplate('${t.id}')" style="border-color:${t.color}20">
            <div class="aab-template-header" style="background:linear-gradient(135deg,${t.color}20,${t.color}08)">
              <div class="aab-template-icon">${t.icon}</div>
              <div class="aab-template-meta">
                <div class="aab-template-name">${t.name}</div>
                <div class="aab-template-category" style="color:${t.color}">${t.category.toUpperCase()}</div>
              </div>
              ${t.isOrchestrator ? `<span class="aab-orchestrator-badge">ORCHESTRATOR</span>` : ''}
            </div>
            <div class="aab-template-desc">${t.description}</div>
            <div class="aab-template-footer">
              <div class="aab-template-model">🤖 ${t.model}</div>
              <div class="aab-template-tools">${t.tools.length} tools</div>
            </div>
            <div class="aab-template-triggers">
              ${t.triggers.map(tr => `<span class="aab-trigger-chip">${tr}</span>`).join('')}
            </div>
            <button class="aab-deploy-btn" style="background:linear-gradient(135deg,${t.color},${t.color}cc)" onclick="event.stopPropagation();deployAgent('${t.id}')">
              Deploy Agent
            </button>
          </div>
        `).join('')}
      </div>

      <div class="aab-custom-section">
        <div class="aab-section-title">⚙️ Custom Agent Creator</div>
        <div class="aab-custom-form">
          <div class="aab-form-row">
            <div class="aab-form-group">
              <label class="aab-label">Agent Name</label>
              <input class="aab-input" id="agentName" placeholder="My Custom Agent" />
            </div>
            <div class="aab-form-group">
              <label class="aab-label">AI Model</label>
              <select class="aab-select" id="agentModel">
                <option value="gpt-4o">GPT-4o (Best Reasoning)</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Best Writing)</option>
                <option value="gpt-4o-mini">GPT-4o Mini (Fast & Cheap)</option>
                <option value="gemini-pro">Gemini Pro (Multimodal)</option>
                <option value="llama-3-70b">Llama 3 70B (Open Source)</option>
                <option value="mistral-large">Mistral Large (EU Privacy)</option>
                <option value="qwen-72b">Qwen 72B (Multilingual)</option>
                <option value="deepseek-r1">DeepSeek R1 (Math/Code)</option>
              </select>
            </div>
            <div class="aab-form-group">
              <label class="aab-label">Trigger</label>
              <select class="aab-select" id="agentTrigger">
                <option value="manual">Manual Only</option>
                <option value="scheduled">Scheduled (CRON)</option>
                <option value="webhook">Webhook</option>
                <option value="event">Event-Driven</option>
                <option value="continuous">Continuous Loop</option>
              </select>
            </div>
          </div>
          <div class="aab-form-group full">
            <label class="aab-label">System Prompt</label>
            <textarea class="aab-textarea" id="agentPrompt" rows="6" placeholder="You are an AI agent that specializes in... Your tasks are:
1. 
2. 
3. 

Always output in format: ..."></textarea>
          </div>
          <div class="aab-form-group full">
            <label class="aab-label">Tools & Integrations</label>
            <div class="aab-tools-grid">
              ${['web_search','file_read','file_write','code_exec','email_send','webhook_call','spotify_api','goat_connect','image_gen','data_analysis','calendar','slack'].map(tool => `
                <label class="aab-tool-checkbox">
                  <input type="checkbox" value="${tool}" onchange="toggleAgentTool('${tool}')">
                  <span>${tool.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</span>
                </label>
              `).join('')}
            </div>
          </div>
          <div class="aab-form-actions">
            <button class="aab-btn primary large" onclick="createCustomAgent()">🚀 Create & Deploy Agent</button>
            <button class="aab-btn secondary" onclick="testAgentPrompt()">🧪 Test Prompt</button>
            <button class="aab-btn secondary" onclick="saveAgentDraft()">💾 Save Draft</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAABMarketplace() {
  const filters = ['all', 'free', 'music', 'marketing', 'legal', 'finance', 'creative'];
  return `
    <div class="aab-marketplace-wrap">
      <div class="aab-mp-header">
        <div class="aab-section-title">🛒 Agent Marketplace</div>
        <div class="aab-section-sub">Community-built agents — install in one click</div>
        <div class="aab-mp-filters">
          ${filters.map(f => `
            <button class="aab-filter-btn ${agentState.marketplaceFilter === f ? 'active' : ''}" onclick="setMPFilter('${f}')">${f.charAt(0).toUpperCase()+f.slice(1)}</button>
          `).join('')}
        </div>
      </div>
      <div class="aab-mp-grid">
        ${MARKETPLACE_AGENTS.map(a => `
          <div class="aab-mp-card">
            <div class="aab-mp-icon">${a.icon}</div>
            <div class="aab-mp-name">${a.name}</div>
            <div class="aab-mp-author">by ${a.author}</div>
            <div class="aab-mp-desc">${a.desc}</div>
            <div class="aab-mp-stats">
              <span class="aab-mp-rating">⭐ ${a.rating}</span>
              <span class="aab-mp-installs">📥 ${a.installs.toLocaleString()}</span>
              <span class="aab-mp-price ${a.price === 'free' ? 'free' : 'paid'}">${a.price}</span>
            </div>
            <button class="aab-mp-install-btn" onclick="installMarketplaceAgent('${a.id}')">
              ${a.price === 'free' ? '⚡ Install Free' : '🛒 ' + a.price}
            </button>
          </div>
        `).join('')}
      </div>
      <div class="aab-mp-submit">
        <div class="aab-section-title">💡 Submit Your Agent</div>
        <p style="color:var(--text-muted);font-size:13px;margin-bottom:12px">Built a useful agent? Share it with the GOAT community and earn revenue from installs.</p>
        <button class="aab-btn primary" onclick="submitToMarketplace()">📤 Submit Agent to Marketplace</button>
      </div>
    </div>
  `;
}

function renderAABPipelines() {
  return `
    <div class="aab-pipelines-wrap">
      <div class="aab-section-title">⚡ Multi-Agent Pipelines</div>
      <div class="aab-section-sub">Orchestrate multiple agents working together — sequential, parallel, or hierarchical</div>

      <div class="aab-mode-selector">
        <div class="aab-mode-title">Orchestration Mode:</div>
        ${['sequential','parallel','hierarchical'].map(m => `
          <button class="aab-mode-btn ${agentState.orchestrationMode === m ? 'active' : ''}" onclick="setOrchMode('${m}')">
            ${{ sequential:'▶▶ Sequential', parallel:'⬛⬛ Parallel', hierarchical:'🔺 Hierarchical' }[m]}
          </button>
        `).join('')}
      </div>

      <div class="aab-pipeline-grid">
        ${ORCHESTRATION_PIPELINES.map(p => `
          <div class="aab-pipeline-card">
            <div class="aab-pipeline-name">${p.name}</div>
            <div class="aab-pipeline-desc">${p.description}</div>
            <div class="aab-pipeline-flow">
              ${p.agents.map((agId, i) => {
                const ag = AGENT_TEMPLATES.find(a => a.id === agId);
                return ag ? `
                  <div class="aab-pipeline-step">
                    <div class="aab-pipeline-step-icon" style="background:${ag.color}30;border:1px solid ${ag.color}50">${ag.icon}</div>
                    <div class="aab-pipeline-step-name">${ag.name.replace(' Agent','').replace(' Scout','').replace(' Creator','').replace(' Planner','').replace(' Coordinator','')}</div>
                  </div>
                  ${i < p.agents.length - 1 ? `<div class="aab-pipeline-arrow">${p.mode === 'parallel' ? '⬡' : '→'}</div>` : ''}
                ` : '';
              }).join('')}
            </div>
            <div class="aab-pipeline-meta">
              <span class="aab-pipeline-mode ${p.mode}">${p.mode}</span>
              <span class="aab-pipeline-time">⏱ ${p.estimatedTime}</span>
            </div>
            <div class="aab-pipeline-actions">
              <button class="aab-btn primary" onclick="launchPipeline('${p.id}')">🚀 Launch Pipeline</button>
              <button class="aab-btn secondary" onclick="editPipeline('${p.id}')">✏️ Customize</button>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="aab-custom-pipeline">
        <div class="aab-section-title">🔧 Custom Pipeline Builder</div>
        <div class="aab-pipeline-builder-ui">
          <div class="aab-pb-left">
            <div class="aab-pb-label">Available Agents</div>
            <div class="aab-pb-available">
              ${AGENT_TEMPLATES.map(t => `
                <div class="aab-pb-agent" draggable="true" ondragstart="dragAgent('${t.id}')" style="border-left:3px solid ${t.color}">
                  <span>${t.icon}</span>
                  <span style="font-size:12px">${t.name}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="aab-pb-right">
            <div class="aab-pb-label">Pipeline Canvas (drag agents here)</div>
            <div class="aab-pb-canvas" id="pipelineCanvas" ondrop="dropAgent(event)" ondragover="event.preventDefault()">
              <div class="aab-pb-drop-hint">Drag agents here to build your pipeline →</div>
            </div>
            <div class="aab-pb-canvas-actions">
              <button class="aab-btn primary" onclick="savePipeline()">💾 Save Pipeline</button>
              <button class="aab-btn secondary" onclick="clearCanvas()">🗑 Clear</button>
              <button class="aab-btn primary" onclick="launchCustomPipeline()">🚀 Launch</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAABLogs() {
  const demoLogs = [
    { time: '2 min ago', agent: 'Music Scout Agent', status: 'success', message: 'Discovered 3 new artists matching DNA profile. Top match: Nova Reign (94% match, 340% weekly growth)', duration: '12s' },
    { time: '1 hr ago', agent: 'Royalty Tracker Agent', status: 'success', message: 'Monthly royalty report generated. Total earnings: $47,230. Flagged 2 DSP discrepancies for review.', duration: '8s' },
    { time: '3 hr ago', agent: 'Content Creator Agent', status: 'success', message: 'Generated 7-day social media content pack for new single "Velocity". 3 IG posts, 2 TikTok scripts, 1 press release.', duration: '22s' },
    { time: '6 hr ago', agent: 'GOAT Security Agent', status: 'warning', message: 'WARNING: 2 fake Instagram accounts detected using artist name. Auto-reported to Meta. Dark web scan: clear.', duration: '45s' },
    { time: '1 day ago', agent: 'Fan Engagement Agent', status: 'success', message: 'Identified 47 superfans this week. Sent 12 VIP upgrade offers. Fan club grew 8.3% (1,204 new members).', duration: '18s' },
    { time: '2 days ago', agent: 'Brand Deal Scout', status: 'success', message: 'Found 5 brand deal opportunities. Best match: Beats by Dre ($85K, 30-day campaign). Draft outreach sent.', duration: '34s' },
    { time: '3 days ago', agent: 'Tour Planner Agent', status: 'success', message: 'Generated Q3 2025 tour proposal: 18 cities, $2.3M projected revenue. Routing efficiency score: 94%.', duration: '67s' }
  ];

  return `
    <div class="aab-logs-wrap">
      <div class="aab-logs-header">
        <div class="aab-section-title">📋 Agent Run Logs</div>
        <button class="aab-btn secondary small" onclick="clearAABLogs()">🗑 Clear Logs</button>
      </div>
      <div class="aab-logs-list">
        ${demoLogs.map(log => `
          <div class="aab-log-row ${log.status}">
            <div class="aab-log-status ${log.status}">
              ${{ success:'✅', warning:'⚠️', error:'❌', running:'🔄' }[log.status]}
            </div>
            <div class="aab-log-content">
              <div class="aab-log-agent">${log.agent} <span class="aab-log-duration">⏱ ${log.duration}</span></div>
              <div class="aab-log-message">${log.message}</div>
            </div>
            <div class="aab-log-time">${log.time}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ── Actions ───────────────────────────────────────────────────────────────────
function switchAABTab(tab) {
  agentState.activeTab = tab;
  const body = document.getElementById('aabBody');
  if (body) body.innerHTML = renderAABTab();
  document.querySelectorAll('.aab-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.aab-tab').forEach(t => {
    if (t.textContent.toLowerCase().includes(tab.toLowerCase().slice(0,4))) t.classList.add('active');
  });
}

function selectAgentTemplate(id) {
  const template = AGENT_TEMPLATES.find(t => t.id === id);
  if (!template) return;
  agentState.selectedAgent = template;
  // Pre-fill custom form
  const nameEl = document.getElementById('agentName');
  const promptEl = document.getElementById('agentPrompt');
  const modelEl = document.getElementById('agentModel');
  if (nameEl) nameEl.value = template.name + ' (Custom)';
  if (promptEl) promptEl.value = template.systemPrompt;
  if (modelEl) modelEl.value = template.model;
  showAABNotif(`✅ Template "${template.name}" loaded into custom builder!`, 'success');
}

function deployAgent(id) {
  const template = AGENT_TEMPLATES.find(t => t.id === id);
  if (!template) return;
  agentState.agents.push({ ...template, deployedAt: new Date().toISOString(), status: 'active' });
  showAABNotif(`🚀 "${template.name}" deployed successfully! Check Run Logs for activity.`, 'success');
}

function createCustomAgent() {
  const name = document.getElementById('agentName')?.value?.trim();
  const model = document.getElementById('agentModel')?.value;
  const prompt = document.getElementById('agentPrompt')?.value?.trim();
  const trigger = document.getElementById('agentTrigger')?.value;
  if (!name || !prompt) { showAABNotif('⚠️ Please fill in Agent Name and System Prompt', 'warning'); return; }
  const agent = { id: 'custom_' + Date.now(), name, model, systemPrompt: prompt, trigger, icon: '🤖', category: 'custom', color: '#0ea5e9', deployedAt: new Date().toISOString(), status: 'active' };
  agentState.agents.push(agent);
  showAABNotif(`🚀 Custom agent "${name}" created and deployed!`, 'success');
  document.getElementById('message-input').value = `My new AI agent "${name}" is ready. It uses ${model} with this mission:\n\n${prompt.slice(0,200)}...\n\nWhat should I have it do first?`;
  closeToolPanel();
}

function testAgentPrompt() {
  const prompt = document.getElementById('agentPrompt')?.value?.trim();
  if (!prompt) { showAABNotif('⚠️ Enter a system prompt first', 'warning'); return; }
  document.getElementById('message-input').value = `Test this AI agent system prompt and give me feedback on how to improve it:\n\n${prompt}`;
  closeToolPanel();
}

function saveAgentDraft() {
  try {
    const draft = { name: document.getElementById('agentName')?.value, model: document.getElementById('agentModel')?.value, prompt: document.getElementById('agentPrompt')?.value, trigger: document.getElementById('agentTrigger')?.value, savedAt: new Date().toISOString() };
    localStorage.setItem('aab_draft_agent', JSON.stringify(draft));
    showAABNotif('💾 Agent draft saved to local storage!', 'success');
  } catch(e) { showAABNotif('⚠️ Could not save draft', 'warning'); }
}

function setMPFilter(filter) {
  agentState.marketplaceFilter = filter;
  const body = document.getElementById('aabBody');
  if (body) body.innerHTML = renderAABMarketplace();
}

function installMarketplaceAgent(id) {
  const agent = MARKETPLACE_AGENTS.find(a => a.id === id);
  if (!agent) return;
  showAABNotif(`✅ "${agent.name}" installed! Go to Builder tab to configure and deploy.`, 'success');
}

function submitToMarketplace() {
  showAABNotif('🌐 Opening marketplace submission portal...', 'info');
  document.getElementById('message-input').value = 'I want to submit an AI agent to the GOAT Marketplace. Help me write a great description and documentation for it.';
  closeToolPanel();
}

function setOrchMode(mode) {
  agentState.orchestrationMode = mode;
  const body = document.getElementById('aabBody');
  if (body) body.innerHTML = renderAABPipelines();
}

function launchPipeline(id) {
  const pipeline = ORCHESTRATION_PIPELINES.find(p => p.id === id);
  if (!pipeline) return;
  showAABNotif(`⚡ Pipeline "${pipeline.name}" launched! Agents are coordinating...`, 'success');
  agentState.runLog.push({ time: new Date(), pipeline: pipeline.name, status: 'running' });
}

function editPipeline(id) {
  const pipeline = ORCHESTRATION_PIPELINES.find(p => p.id === id);
  if (!pipeline) return;
  document.getElementById('message-input').value = `Help me customize the "${pipeline.name}" multi-agent pipeline. Current agents: ${pipeline.agents.join(', ')}. I want to modify the workflow.`;
  closeToolPanel();
}

function openNewAgentModal() {
  agentState.activeTab = 'builder';
  const body = document.getElementById('aabBody');
  if (body) body.innerHTML = renderAABBuilder();
  setTimeout(() => { const el = document.getElementById('agentName'); if (el) el.focus(); }, 100);
}

function openPipelineModal() {
  agentState.activeTab = 'pipelines';
  const body = document.getElementById('aabBody');
  if (body) body.innerHTML = renderAABPipelines();
}

function dragAgent(id) { agentState._dragAgent = id; }
function dropAgent(event) {
  event.preventDefault();
  const canvas = document.getElementById('pipelineCanvas');
  const agent = AGENT_TEMPLATES.find(a => a.id === agentState._dragAgent);
  if (!agent || !canvas) return;
  const hint = canvas.querySelector('.aab-pb-drop-hint');
  if (hint) hint.remove();
  const step = document.createElement('div');
  step.className = 'aab-pb-dropped-agent';
  step.style.cssText = `border-left:3px solid ${agent.color}`;
  step.innerHTML = `<span>${agent.icon}</span><span style="font-size:12px;flex:1">${agent.name}</span><button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--text-muted);cursor:pointer">✕</button>`;
  canvas.appendChild(step);
}
function savePipeline() { showAABNotif('💾 Custom pipeline saved!', 'success'); }
function clearCanvas() { const c = document.getElementById('pipelineCanvas'); if (c) c.innerHTML = '<div class="aab-pb-drop-hint">Drag agents here to build your pipeline →</div>'; }
function launchCustomPipeline() { showAABNotif('🚀 Custom pipeline launching...', 'success'); }
function clearAABLogs() { agentState.runLog = []; const body = document.getElementById('aabBody'); if (body) body.innerHTML = renderAABLogs(); }
function toggleAgentTool(tool) { /* track selected tools */ }

function showAABNotif(msg, type) {
  const existing = document.querySelector('.aab-notif');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'aab-notif';
  el.style.cssText = `position:fixed;top:20px;right:20px;z-index:99999;padding:12px 18px;border-radius:10px;font-size:13px;font-weight:600;max-width:360px;box-shadow:0 4px 20px rgba(0,0,0,0.4);background:${type==='success'?'rgba(34,197,94,0.15)':type==='warning'?'rgba(245,158,11,0.15)':'rgba(14,165,233,0.15)'};border:1px solid ${type==='success'?'#22c55e':type==='warning'?'#f59e0b':'#0ea5e9'};color:var(--text-primary);`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// ── CSS for Agent Builder ────────────────────────────────────────────────────
(function injectAABStyles() {
  if (document.getElementById('aab-styles')) return;
  const style = document.createElement('style');
  style.id = 'aab-styles';
  style.textContent = `
    .aab-container{display:flex;flex-direction:column;height:100%;background:var(--bg-primary);color:var(--text-primary);font-family:'Inter',sans-serif}
    .aab-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.08));border-bottom:1px solid rgba(99,102,241,0.2);flex-shrink:0}
    .aab-header-left{display:flex;align-items:center;gap:12px}
    .aab-header-icon{font-size:32px}
    .aab-header-title{font-size:20px;font-weight:700;color:#6366f1}
    .aab-header-sub{font-size:12px;color:var(--text-muted);margin-top:2px}
    .aab-header-actions{display:flex;gap:8px}
    .aab-tabs{display:flex;gap:4px;padding:12px 20px 0;background:var(--bg-secondary);border-bottom:1px solid var(--border);flex-shrink:0}
    .aab-tab{padding:8px 16px;border:none;background:transparent;color:var(--text-muted);font-size:13px;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;border-radius:6px 6px 0 0}
    .aab-tab:hover{color:var(--text-primary);background:rgba(99,102,241,0.08)}
    .aab-tab.active{color:#6366f1;border-bottom-color:#6366f1;background:rgba(99,102,241,0.1)}
    .aab-body{flex:1;overflow-y:auto;padding:20px}
    .aab-btn{padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .2s}
    .aab-btn.primary{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff}
    .aab-btn.secondary{background:var(--bg-secondary);border:1px solid var(--border);color:var(--text-muted)}
    .aab-btn.large{padding:12px 24px;font-size:14px}
    .aab-btn.small{padding:5px 10px;font-size:11px}
    .aab-btn:hover{transform:translateY(-1px);box-shadow:0 3px 12px rgba(0,0,0,0.2)}
    .aab-section-title{font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:6px}
    .aab-section-sub{font-size:13px;color:var(--text-muted);margin-bottom:16px}
    .aab-templates-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;margin-bottom:28px}
    .aab-template-card{background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;padding:0;overflow:hidden;cursor:pointer;transition:all .2s}
    .aab-template-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.3)}
    .aab-template-header{display:flex;align-items:center;gap:10px;padding:14px}
    .aab-template-icon{font-size:28px;flex-shrink:0}
    .aab-template-name{font-size:14px;font-weight:600;color:var(--text-primary)}
    .aab-template-category{font-size:10px;font-weight:700;letter-spacing:.5px}
    .aab-orchestrator-badge{padding:3px 7px;background:rgba(245,158,11,0.2);color:#f59e0b;border-radius:6px;font-size:10px;font-weight:700;margin-left:auto}
    .aab-template-desc{padding:0 14px;font-size:12px;color:var(--text-muted);line-height:1.5;margin-bottom:10px}
    .aab-template-footer{display:flex;justify-content:space-between;padding:0 14px;margin-bottom:8px}
    .aab-template-model{font-size:11px;color:var(--text-muted)}
    .aab-template-tools{font-size:11px;color:var(--text-muted)}
    .aab-template-triggers{display:flex;gap:4px;flex-wrap:wrap;padding:0 14px 10px}
    .aab-trigger-chip{padding:2px 7px;background:var(--bg-primary);border:1px solid var(--border);border-radius:8px;font-size:10px;color:var(--text-muted)}
    .aab-deploy-btn{width:100%;padding:10px;border:none;color:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s}
    .aab-deploy-btn:hover{opacity:.85}
    .aab-custom-section{background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;padding:20px;margin-top:8px}
    .aab-custom-form{display:flex;flex-direction:column;gap:14px}
    .aab-form-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
    .aab-form-group{display:flex;flex-direction:column;gap:6px}
    .aab-form-group.full{grid-column:1/-1}
    .aab-label{font-size:12px;font-weight:600;color:var(--text-muted)}
    .aab-input,.aab-select,.aab-textarea{padding:9px 12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);font-size:13px;outline:none;font-family:'Inter',sans-serif}
    .aab-input:focus,.aab-select:focus,.aab-textarea:focus{border-color:#6366f1}
    .aab-textarea{resize:vertical;min-height:120px}
    .aab-tools-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px}
    .aab-tool-checkbox{display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:12px;color:var(--text-muted);transition:all .2s}
    .aab-tool-checkbox:hover{border-color:#6366f1;color:var(--text-primary)}
    .aab-tool-checkbox input{accent-color:#6366f1}
    .aab-form-actions{display:flex;gap:10px;align-items:center}
    .aab-marketplace-wrap,.aab-pipelines-wrap,.aab-logs-wrap{display:flex;flex-direction:column;gap:16px}
    .aab-mp-filters{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
    .aab-filter-btn{padding:5px 12px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-muted);border-radius:16px;font-size:12px;cursor:pointer;transition:all .2s}
    .aab-filter-btn.active{border-color:#6366f1;color:#6366f1;background:rgba(99,102,241,0.1)}
    .aab-mp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
    .aab-mp-card{background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:8px}
    .aab-mp-icon{font-size:32px}
    .aab-mp-name{font-size:14px;font-weight:700;color:var(--text-primary)}
    .aab-mp-author{font-size:11px;color:var(--text-muted)}
    .aab-mp-desc{font-size:12px;color:var(--text-secondary);line-height:1.5;flex:1}
    .aab-mp-stats{display:flex;gap:10px;align-items:center}
    .aab-mp-rating{font-size:12px;color:#f59e0b}
    .aab-mp-installs{font-size:12px;color:var(--text-muted)}
    .aab-mp-price{font-size:12px;font-weight:700}
    .aab-mp-price.free{color:#22c55e}
    .aab-mp-price.paid{color:#f59e0b}
    .aab-mp-install-btn{padding:9px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s}
    .aab-mp-install-btn:hover{transform:translateY(-1px);box-shadow:0 3px 12px rgba(99,102,241,0.4)}
    .aab-mp-submit{background:var(--bg-secondary);border:1px solid rgba(99,102,241,0.3);border-radius:12px;padding:20px;text-align:center}
    .aab-mode-selector{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    .aab-mode-title{font-size:13px;color:var(--text-muted)}
    .aab-mode-btn{padding:7px 14px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-muted);border-radius:8px;font-size:12px;cursor:pointer;transition:all .2s}
    .aab-mode-btn.active{border-color:#6366f1;color:#6366f1;background:rgba(99,102,241,0.1)}
    .aab-pipeline-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
    .aab-pipeline-card{background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:10px}
    .aab-pipeline-name{font-size:15px;font-weight:700;color:var(--text-primary)}
    .aab-pipeline-desc{font-size:12px;color:var(--text-muted);line-height:1.5}
    .aab-pipeline-flow{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
    .aab-pipeline-step{display:flex;flex-direction:column;align-items:center;gap:4px}
    .aab-pipeline-step-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px}
    .aab-pipeline-step-name{font-size:10px;color:var(--text-muted);text-align:center;max-width:60px}
    .aab-pipeline-arrow{font-size:18px;color:var(--text-muted)}
    .aab-pipeline-meta{display:flex;align-items:center;gap:10px}
    .aab-pipeline-mode{padding:3px 8px;border-radius:8px;font-size:11px;font-weight:600}
    .aab-pipeline-mode.sequential{background:rgba(99,102,241,0.2);color:#6366f1}
    .aab-pipeline-mode.parallel{background:rgba(34,197,94,0.2);color:#22c55e}
    .aab-pipeline-mode.orchestrated{background:rgba(245,158,11,0.2);color:#f59e0b}
    .aab-pipeline-time{font-size:12px;color:var(--text-muted)}
    .aab-pipeline-actions{display:flex;gap:8px}
    .aab-custom-pipeline{background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;padding:20px}
    .aab-pipeline-builder-ui{display:grid;grid-template-columns:200px 1fr;gap:16px;margin-top:12px}
    .aab-pb-label{font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:8px}
    .aab-pb-available{display:flex;flex-direction:column;gap:6px;max-height:300px;overflow-y:auto}
    .aab-pb-agent{display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:8px;cursor:grab;font-size:12px;color:var(--text-muted);transition:all .2s}
    .aab-pb-agent:hover{color:var(--text-primary);transform:translateX(2px)}
    .aab-pb-canvas{min-height:200px;background:var(--bg-primary);border:2px dashed var(--border);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px}
    .aab-pb-drop-hint{font-size:13px;color:var(--text-muted);text-align:center;padding:20px;opacity:.6}
    .aab-pb-dropped-agent{display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;font-size:12px;color:var(--text-primary)}
    .aab-pb-canvas-actions{display:flex;gap:8px;margin-top:10px}
    .aab-logs-header{display:flex;justify-content:space-between;align-items:center}
    .aab-logs-list{display:flex;flex-direction:column;gap:10px}
    .aab-log-row{display:flex;align-items:flex-start;gap:12px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px;padding:12px 14px}
    .aab-log-row.warning{border-left:3px solid #f59e0b}
    .aab-log-row.success{border-left:3px solid #22c55e}
    .aab-log-row.error{border-left:3px solid #ef4444}
    .aab-log-status{font-size:18px;flex-shrink:0}
    .aab-log-content{flex:1}
    .aab-log-agent{font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:4px}
    .aab-log-duration{font-size:11px;color:var(--text-muted);font-weight:400}
    .aab-log-message{font-size:12px;color:var(--text-muted);line-height:1.5}
    .aab-log-time{font-size:11px;color:var(--text-muted);white-space:nowrap;flex-shrink:0}
  `;
  document.head.appendChild(style);
})();

// Export
window.renderAIAgentBuilder = renderAIAgentBuilder;
window.switchAABTab = switchAABTab;
window.selectAgentTemplate = selectAgentTemplate;
window.deployAgent = deployAgent;
window.createCustomAgent = createCustomAgent;
window.testAgentPrompt = testAgentPrompt;
window.saveAgentDraft = saveAgentDraft;
window.setMPFilter = setMPFilter;
window.installMarketplaceAgent = installMarketplaceAgent;
window.submitToMarketplace = submitToMarketplace;
window.setOrchMode = setOrchMode;
window.launchPipeline = launchPipeline;
window.editPipeline = editPipeline;
window.openNewAgentModal = openNewAgentModal;
window.openPipelineModal = openPipelineModal;
window.dragAgent = dragAgent;
window.dropAgent = dropAgent;
window.savePipeline = savePipeline;
window.clearCanvas = clearCanvas;
window.launchCustomPipeline = launchCustomPipeline;
window.clearAABLogs = clearAABLogs;
window.toggleAgentTool = toggleAgentTool;