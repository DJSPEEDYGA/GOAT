/**
 * GOAT Force - Unified AI Chat API
 * ==================================
 * Smart agent routing with real catalog data context.
 * Tries Gemini → NVIDIA NIM → Smart Local Fallback
 * 
 * POST /api/goat-force/chat
 * Body: { message, agent?, history? }
 */

import { getGOATForceEngine, autoRouteAgent, GOAT_FORCE_CONFIG } from '../../../lib/goatForceEngine';

// Agent-specific system prompts
const AGENT_PROMPTS = {
  moneypenny: `You are Ms. Moneypenny 💰, the Financial Intelligence AI Agent of the GOAT Royalty App.
You are an expert in music royalty calculations, revenue analysis, publishing splits, and financial optimization.

Key facts about the catalog:
- Owner: HARVEY L MILLER JR (DJ Speedy) - Writer IPI: 00348202968
- Publisher: FASTASSMAN PUBLISHING INC - IPI: 00348585814, MLC #P0041X
- Partners: JUAQUIN J MALPHURS (Waka Flocka Flame), KEVIN W HALLINGQUEST
- 423 ASCAP-registered works under FASTASSMAN
- 414 ASCAP-registered works under HARVEY L MILLER
- Master tracks with ISRCs: USUM72301134 through USUM72301152+
- Album: FIVE DEUCES (I through IV)

Streaming rates (per stream):
- Spotify: $0.004 | Apple Music: $0.008 | YouTube: $0.002
- Tidal: $0.012 | Amazon: $0.004 | Deezer: $0.003
- TikTok: $0.00015 | SoundCloud: $0.003

Always provide specific numbers, calculations, and actionable financial insights.`,

  codex: `You are Codex-008 🤖, the Technical Operations AI Agent of the GOAT Royalty App.
You are an expert in software development, deployment, automation, and system architecture.

The GOAT Royalty App tech stack:
- Framework: Next.js 14 (Pages Router) with React 18
- Desktop: Electron with electron-builder (Win NSIS/Portable, Mac DMG, Linux AppImage)
- Database: Supabase (PostgreSQL + Auth + Storage)
- AI: Google Gemini, NVIDIA NIM, OpenAI, Anthropic Claude
- Styling: Tailwind CSS + Lucide React icons
- CI/CD: GitHub Actions for automated builds
- VPS: Ubuntu 24.04 at 93.127.214.171
- Process Manager: PM2

Provide technical solutions with code examples when appropriate.`,

  vanessa: `You are Ms. Vanessa 🛡️, the Security & IP Protection AI Agent of the GOAT Royalty App.
You are an expert in audio fingerprinting, copyright protection, DMCA management, and digital security.

Protected catalog:
- 423 ASCAP-registered works with ISWC numbers
- Master recordings with registered ISRCs (USUM72301134+)
- Publisher: FASTASSMAN PUBLISHING INC (ASCAP member)
- All works have registration dates and acceptance status
- IP owned by HARVEY L MILLER JR, JUAQUIN J MALPHURS, KEVIN W HALLINGQUEST

Provide security assessments, protection strategies, and IP management advice.`,

  superninja: `You are SuperNinja AI 🥷, the Autonomous Task Execution Agent of the GOAT Royalty App.
You handle web automation, data scraping, task orchestration, and workflow automation.
You can monitor streaming platforms, track royalty payments, and automate distribution tasks.
Provide step-by-step automation plans and workflow suggestions.`,

  gemini: `You are the Gemini AI Copilot ✨ of the GOAT Royalty App.
You are a creative assistant helping with content creation, marketing, lyrics, social media, and creative direction.
The app belongs to DJ Speedy (HARVEY L MILLER JR) and features music from FASTASSMAN PUBLISHING INC.
Help with creative tasks, content strategy, and artistic direction.`,

  nvidia: `You are NVIDIA NIM 🔥, the Deep Research & High-Performance AI Agent of the GOAT Royalty App.
You handle complex analysis, industry research, market predictions, and data-intensive tasks.
Provide detailed, research-backed insights with data analysis and industry comparisons.`
};

// Generate context from real catalog data
function getCatalogContext(engine) {
  try {
    const stats = engine.catalog.getStats();
    return `
REAL CATALOG DATA:
- ASCAP Works: ${stats.ascapWorks} registered works under FASTASSMAN
- Writer Works: ${stats.harveyWorks} registered works under HARVEY L MILLER
- Master Tracks: ${stats.masterTracks} with ISRCs
- Publisher: ${stats.publisher.name} (IPI: ${stats.publisher.ipi})
- Writer: ${stats.writer.name} (IPI: ${stats.writer.ipi})
- Albums: ${stats.masterAlbums.join(', ') || 'FIVE DEUCES I-IV'}
- ISRC Range: ${stats.isrcRange}
- Sample Titles: ${stats.sampleTitles.slice(0, 5).join(', ')}
`;
  } catch {
    return '';
  }
}

// Smart local fallback responses using real data
function getSmartFallback(message, agent, engine) {
  const lower = message.toLowerCase();
  const agentInfo = GOAT_FORCE_CONFIG.agents[agent];
  const emoji = agentInfo?.emoji || '🐐';
  const name = agentInfo?.name || 'GOAT Force AI';

  // Catalog queries
  if (lower.includes('catalog') || lower.includes('track') || lower.includes('song') || lower.includes('work') || lower.includes('music')) {
    const stats = engine.catalog.getStats();
    return `${emoji} **${name} - Catalog Report**\n\n` +
      `📊 **GOAT Royalty Catalog Overview:**\n` +
      `- **${stats.ascapWorks}** ASCAP-registered works (FASTASSMAN Publishing)\n` +
      `- **${stats.harveyWorks}** ASCAP-registered works (Harvey L Miller)\n` +
      `- **${stats.masterTracks}** Master recordings with ISRCs\n\n` +
      `📝 **Publisher:** ${stats.publisher.name}\n` +
      `- IPI: ${stats.publisher.ipi}\n` +
      `- MLC#: ${stats.publisher.mlcNumber}\n\n` +
      `✍️ **Writer:** ${stats.writer.name}\n` +
      `- IPI: ${stats.writer.ipi}\n\n` +
      `💿 **Albums:** ${stats.masterAlbums.join(', ') || 'FIVE DEUCES I-IV'}\n` +
      `🔖 **ISRC Range:** ${stats.isrcRange}\n\n` +
      `${stats.sampleTitles.length > 0 ? `**Sample Titles:** ${stats.sampleTitles.join(', ')}` : ''}\n\n` +
      `Use the Catalog Search to browse all works: \`/api/catalog/search?q=your+query\``;
  }

  // Royalty queries
  if (lower.includes('royalt') || lower.includes('money') || lower.includes('revenue') || lower.includes('earn') || lower.includes('payment')) {
    const platforms = GOAT_FORCE_CONFIG.platforms;
    let platformList = Object.values(platforms)
      .map(p => `- **${p.name}:** $${p.rate}/stream`)
      .join('\n');
    
    return `${emoji} **${name} - Royalty Intelligence**\n\n` +
      `💰 **Streaming Rate Card:**\n${platformList}\n\n` +
      `📊 **Quick Calculations (per 1M streams):**\n` +
      `- Spotify: **$4,000**\n` +
      `- Apple Music: **$8,000**\n` +
      `- YouTube: **$2,000**\n` +
      `- Tidal: **$12,000**\n` +
      `- TikTok: **$150**\n\n` +
      `📝 **Publishing Splits:**\n` +
      `- Ruthless: 75% | FASTASSMAN: 25%\n` +
      `- Writer: Harvey Miller 100%\n\n` +
      `Want me to calculate royalties for specific stream counts or analyze platform performance?`;
  }

  // Streaming queries
  if (lower.includes('stream') || lower.includes('spotify') || lower.includes('apple') || lower.includes('youtube') || lower.includes('tidal') || lower.includes('tiktok')) {
    return `${emoji} **${name} - Streaming Analytics**\n\n` +
      `🎵 **Supported Platforms:**\n` +
      Object.values(GOAT_FORCE_CONFIG.platforms).map(p => `- ${p.name} ($${p.rate}/stream)`).join('\n') +
      `\n\n📈 **Optimization Tips:**\n` +
      `1. Tidal pays highest per stream ($0.012) - push for playlist placement\n` +
      `2. Apple Music ($0.008) is 2x Spotify - prioritize Apple playlists\n` +
      `3. TikTok has lowest per-stream rate but highest viral potential\n` +
      `4. YouTube Content ID can capture additional revenue from UGC\n\n` +
      `Want me to create a streaming strategy for a specific track or the full catalog?`;
  }

  // Security queries
  if (lower.includes('secur') || lower.includes('protect') || lower.includes('copyright') || lower.includes('fingerprint') || lower.includes('dmca')) {
    return `${emoji} **${name} - Security & IP Protection**\n\n` +
      `🛡️ **IP Protection Status:**\n` +
      `- ✅ ${GOAT_FORCE_CONFIG.catalog.totalASCAPWorks} works ASCAP-registered\n` +
      `- ✅ ISRCs assigned: USUM72301134+\n` +
      `- ✅ ISWC numbers assigned to registered works\n` +
      `- ✅ Publisher IPI: ${GOAT_FORCE_CONFIG.catalog.publisher.ipi}\n` +
      `- ✅ Writer IPI: ${GOAT_FORCE_CONFIG.catalog.writer.ipi}\n\n` +
      `🔒 **Recommended Actions:**\n` +
      `1. Enable audio fingerprinting via Ms. Vanessa AI\n` +
      `2. Set up automated DMCA monitoring across platforms\n` +
      `3. Register remaining works with Copyright Office\n` +
      `4. Enable Content ID on YouTube for all master recordings\n\n` +
      `Need a specific security audit or copyright protection plan?`;
  }

  // Deploy/technical queries
  if (lower.includes('deploy') || lower.includes('build') || lower.includes('server') || lower.includes('code') || lower.includes('install')) {
    return `${emoji} **${name} - Technical Operations**\n\n` +
      `🚀 **GOAT Royalty App Stack:**\n` +
      `- Next.js 14 + React 18 + Tailwind CSS\n` +
      `- Supabase (Auth + Database + Storage)\n` +
      `- Electron (Desktop: Win/Mac/Linux)\n` +
      `- GitHub Actions CI/CD\n` +
      `- VPS: Ubuntu 24.04 @ 93.127.214.171\n\n` +
      `📦 **Build Commands:**\n` +
      `\`\`\`bash\n` +
      `npm run build          # Next.js production build\n` +
      `npm run build:win      # Windows installer (NSIS)\n` +
      `npm run build:portable # Windows portable EXE\n` +
      `npm run electron:build:mac   # macOS DMG\n` +
      `npm run electron:build:linux # Linux AppImage\n` +
      `\`\`\`\n\n` +
      `What would you like to deploy or build?`;
  }

  // GOAT Force / agents query
  if (lower.includes('agent') || lower.includes('goat force') || lower.includes('team') || lower.includes('who are')) {
    const agents = GOAT_FORCE_CONFIG.agents;
    let agentList = Object.values(agents)
      .map(a => `- ${a.emoji} **${a.name}** — ${a.role}`)
      .join('\n');
    
    return `${emoji} **GOAT Force AI Agent Team**\n\n` +
      `${agentList}\n\n` +
      `👑 **Leadership:**\n` +
      GOAT_FORCE_CONFIG.catalog.owners.map(o => `- **${o.name}** ${o.alias ? `(${o.alias})` : ''} — ${o.role}`).join('\n') +
      `\n\nAll agents work together through the GOAT Force Engine to manage your music empire. Which agent would you like to engage?`;
  }

  // Generic greeting / help
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('help') || lower.length < 10) {
    return `${emoji} **${name} reporting for duty!**\n\n` +
      `Welcome to the GOAT Royalty Command Center, Harvey! 🐐\n\n` +
      `I can help you with:\n` +
      `- 💰 **Royalty calculations** — revenue across all platforms\n` +
      `- 🎵 **Catalog management** — search ${GOAT_FORCE_CONFIG.catalog.totalASCAPWorks}+ registered works\n` +
      `- 📊 **Streaming analytics** — performance across Spotify, Apple, YouTube, etc.\n` +
      `- 🛡️ **IP protection** — copyright, DMCA, fingerprinting\n` +
      `- 🚀 **Deployment** — build & ship to all platforms\n` +
      `- 🤖 **AI tools** — creative, research, automation\n\n` +
      `What would you like to work on?`;
  }

  // Default
  return `${emoji} **${name}**\n\n` +
    `I understand you're asking about: "${message}"\n\n` +
    `Let me help with that. The GOAT Royalty ecosystem includes:\n` +
    `- 📚 **${GOAT_FORCE_CONFIG.catalog.totalASCAPWorks}+ registered works** across ASCAP\n` +
    `- 🎵 **Master tracks** with ISRCs on FIVE DEUCES albums\n` +
    `- 💰 **8 streaming platforms** tracked\n` +
    `- 🤖 **6 AI agents** at your service\n\n` +
    `Could you be more specific? I work best with targeted questions about royalties, catalog, streaming, security, or technical operations.`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, agent: requestedAgent, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Initialize engine
    const engine = getGOATForceEngine();

    // Route to best agent
    const agent = requestedAgent || autoRouteAgent(message);
    const agentConfig = GOAT_FORCE_CONFIG.agents[agent];
    const systemPrompt = AGENT_PROMPTS[agent] || AGENT_PROMPTS.gemini;
    const catalogContext = getCatalogContext(engine);

    // Build conversation context from history
    const historyContext = history.length > 0
      ? '\nRecent conversation:\n' + history.slice(-5).map(h => `${h.role}: ${h.content}`).join('\n')
      : '';

    const fullContext = catalogContext + historyContext;

    // Try Gemini first
    let response = await engine.gemini.chat(message, systemPrompt, fullContext);
    let provider = 'gemini';

    // Try NVIDIA NIM as fallback
    if (!response) {
      response = await engine.nvidia.chat(message, systemPrompt);
      provider = 'nvidia';
    }

    // Smart local fallback with real data
    if (!response) {
      response = getSmartFallback(message, agent, engine);
      provider = 'local';
    }

    return res.status(200).json({
      success: true,
      response,
      agent: {
        id: agent,
        name: agentConfig?.name || 'GOAT Force AI',
        emoji: agentConfig?.emoji || '🐐',
        role: agentConfig?.role || 'General Assistant'
      },
      provider,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[GOAT Force Chat] Error:', error);
    return res.status(200).json({
      success: true,
      response: `🐐 I encountered a temporary issue, but I'm still here! Try asking about royalties, catalog, streaming, or security.`,
      agent: { id: 'system', name: 'GOAT Force', emoji: '🐐', role: 'System' },
      provider: 'error-fallback',
      timestamp: new Date().toISOString()
    });
  }
}