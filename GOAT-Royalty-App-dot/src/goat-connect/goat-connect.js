// ============================================================
// GOAT CONNECT — Artist-Fan Platform + Cyber Shield
// By Harvey Miller (DJ Speedy) — @DJSPEEDYGA
// Secure matchmaking, artist-fan experience, banking protection,
// cybersecurity, background checks, and cyber warfare defense.
// ============================================================

'use strict';

// ── GOAT CONNECT STATE ─────────────────────────────────────
const gcState = {
  activeTab: 'dashboard',
  userType: 'fan',       // 'fan' | 'artist'
  profile: null,
  matches: [],
  messages: {},
  threatLevel: 'green',  // green | yellow | orange | red
  scanResults: [],
  notifications: [],
  verificationStatus: {
    email: false, phone: false, id: false, face: false,
    background: false, banking: false, social: false
  },
  securityScore: 0,
  activeChat: null,
  subscriptionTier: 'free', // free | silver | gold | platinum | artist-verified
};

// ── SECURITY THREAT CATEGORIES ─────────────────────────────
const THREAT_CATEGORIES = {
  IDENTITY_FRAUD:    { icon: '🎭', color: '#ef4444', label: 'Identity Fraud',    severity: 'critical' },
  CATFISHING:        { icon: '🎣', color: '#ef4444', label: 'Catfishing',         severity: 'critical' },
  ROMANCE_SCAM:      { icon: '💔', color: '#ef4444', label: 'Romance Scam',       severity: 'critical' },
  FINANCIAL_FRAUD:   { icon: '💸', color: '#ef4444', label: 'Financial Fraud',    severity: 'critical' },
  SEXTORTION:        { icon: '🔒', color: '#ef4444', label: 'Sextortion',         severity: 'critical' },
  PHISHING:          { icon: '🪝', color: '#f97316', label: 'Phishing Attempt',   severity: 'high' },
  HARASSMENT:        { icon: '⚠️',  color: '#f97316', label: 'Harassment',         severity: 'high' },
  FAKE_ARTIST:       { icon: '🎤', color: '#f97316', label: 'Fake Artist',         severity: 'high' },
  MALWARE_LINK:      { icon: '🦠', color: '#f97316', label: 'Malware Link',        severity: 'high' },
  DATA_HARVESTING:   { icon: '📡', color: '#eab308', label: 'Data Harvesting',    severity: 'medium' },
  SPAM:              { icon: '📧', color: '#eab308', label: 'Spam Account',        severity: 'medium' },
  SUSPICIOUS:        { icon: '🔍', color: '#eab308', label: 'Suspicious Activity', severity: 'low' },
};

// ── VERIFICATION LEVELS ────────────────────────────────────
const VERIFICATION_LEVELS = [
  { id: 'email',      label: 'Email Verified',           icon: '📧', points: 10, required: true  },
  { id: 'phone',      label: 'Phone Verified',           icon: '📱', points: 15, required: true  },
  { id: 'id',         label: 'Government ID Check',      icon: '🪪', points: 25, required: false },
  { id: 'face',       label: 'AI Face Match',            icon: '🤳', points: 20, required: false },
  { id: 'background', label: 'Background Check (Certn)', icon: '🔎', points: 30, required: false },
  { id: 'banking',    label: 'Banking Identity (Plaid)',  icon: '🏦', points: 20, required: false },
  { id: 'social',     label: 'Social Media Cross-check', icon: '🌐', points: 15, required: false },
];

// ── SUBSCRIPTION TIERS ─────────────────────────────────────
const SUBSCRIPTION_TIERS = {
  free:             { label: 'Fan Free',           color: '#6b7280', price: 0,    features: ['5 daily matches','Basic chat','Public profiles'] },
  silver:           { label: '⭐ Silver Fan',       color: '#94a3b8', price: 9.99, features: ['50 daily matches','HD media','Voice messages','Advanced filters','Icebreakers'] },
  gold:             { label: '🥇 Gold Fan',         color: '#f59e0b', price: 19.99,features: ['Unlimited matches','Video calls','Priority queue','Profile boost x3','Super likes x10','See who liked you'] },
  platinum:         { label: '💎 Platinum Fan',     color: '#a855f7', price: 39.99,features: ['Everything in Gold','Background check access','GOAT Shield Pro','Incognito mode','VIP artist events','1:1 artist DM access'] },
  'artist-verified':{ label: '🎤 Verified Artist',  color: '#e8530a', price: 0,    features: ['Verified badge','Fan matchmaking','Exclusive content tools','Concert event creation','Revenue sharing','Cyber protection suite'] },
};

// ── MATCHMAKING COMPATIBILITY FACTORS ─────────────────────
const MATCH_FACTORS = {
  music_taste:    { weight: 0.25, label: 'Music Taste' },
  values:         { weight: 0.20, label: 'Core Values' },
  location:       { weight: 0.15, label: 'Location' },
  relationship_goal: { weight: 0.15, label: 'Relationship Goal' },
  lifestyle:      { weight: 0.10, label: 'Lifestyle' },
  personality:    { weight: 0.10, label: 'Personality Type' },
  interests:      { weight: 0.05, label: 'Interests' },
};

// ── AI BACKGROUND CHECK ENGINE ────────────────────────────
const BACKGROUND_CHECK_MODULES = [
  { id: 'identity',    label: 'Identity Verification',      provider: 'Certn + Jumio',      icon: '🪪' },
  { id: 'criminal',    label: 'Criminal Record Scan',       provider: 'Certn Global DB',    icon: '⚖️' },
  { id: 'sex_offender',label: 'Sex Offender Registry Check',provider: 'National Registries',icon: '🛡️' },
  { id: 'fraud',       label: 'Financial Fraud History',    provider: 'LexisNexis + OFAC',  icon: '💰' },
  { id: 'social_media',label: 'Social Media OSINT',         provider: 'AI Deep Scan',       icon: '🔍' },
  { id: 'reverse_img', label: 'Reverse Image Search',       provider: 'Google Vision + PimEyes', icon: '🖼️' },
  { id: 'dark_web',    label: 'Dark Web Exposure Check',    provider: 'HaveIBeenPwned + SpyCloud', icon: '🌑' },
  { id: 'phone_intel', label: 'Phone Number Intelligence',  provider: 'Twilio Lookup + CNAM', icon: '📱' },
  { id: 'ip_rep',      label: 'IP Reputation Scan',         provider: 'AbuseIPDB + MaxMind', icon: '🌐' },
  { id: 'device_fp',   label: 'Device Fingerprint',         provider: 'FingerprintJS Pro',   icon: '💻' },
];

// ── CYBER WARFARE / ANTIVIRUS ENGINE ─────────────────────
const CYBER_MODULES = [
  { id: 'msg_scan',    label: 'Real-Time Message Scan',     desc: 'ML toxicity + phishing link detection in every message' },
  { id: 'img_scan',    label: 'Image Malware Scan',         desc: 'Steganalysis + CSAM hash detection on all uploaded images' },
  { id: 'link_guard',  label: 'Link Guard',                 desc: 'VirusTotal + Google Safe Browsing on every shared URL' },
  { id: 'behavioural', label: 'Behavioural Anomaly AI',     desc: 'UEBA engine flags abnormal login, message, and swipe patterns' },
  { id: 'e2e',         label: 'E2E Encryption',             desc: 'Signal Protocol (Double Ratchet) for all messages and calls' },
  { id: 'zero_trust',  label: 'Zero Trust Auth',            desc: 'MFA + device attestation + JWT with refresh rotation' },
  { id: 'rate_limit',  label: 'Adaptive Rate Limiting',     desc: 'AI-driven rate limits to block brute force and mass scraping' },
  { id: 'ddos',        label: 'DDoS Mitigation',            desc: 'Cloudflare WAF + BGP-level scrubbing + geo-blocking' },
  { id: 'honeypot',    label: 'Scammer Honeypots',          desc: 'Fake bait profiles to identify and ban scammers automatically' },
  { id: 'threat_intel',label: 'Threat Intelligence Feed',   desc: 'Live feeds from MITRE ATT&CK, CISA alerts, and ISACs' },
  { id: 'siem',        label: 'SIEM Dashboard',             desc: 'Splunk/ELK-style event logging and real-time alert correlation' },
  { id: 'pen_test',    label: 'Automated Pen Testing',      desc: 'OWASP Top 10 continuous scanning + Burp Suite integration' },
];

// ── BANKING PROTECTION MODULES ────────────────────────────
const BANKING_MODULES = [
  { id: 'plaid',       label: 'Plaid Identity Link',        desc: 'Optional bank identity verification (no balance visible)', risk: 'low' },
  { id: 'card_mask',   label: 'Virtual Card Masking',       desc: 'Privacy.com virtual cards for all in-app purchases', risk: 'low' },
  { id: 'fraud_alert', label: 'Transaction Fraud Alerts',   desc: 'AI flags unusual subscription or purchase patterns', risk: 'medium' },
  { id: 'chargeback',  label: 'Chargeback Protection',      desc: 'Stripe Radar + 3DS2 for all payment flows', risk: 'low' },
  { id: 'crypto',      label: 'Crypto Payment Guard',       desc: 'Wallet address screening via Chainalysis', risk: 'high' },
  { id: 'wire_warn',   label: 'Wire Transfer Warning',      desc: 'Block and warn on any request to send money to matches', risk: 'critical' },
  { id: 'loan_scam',   label: 'Loan/Investment Scam Detect',desc: 'NLP classifier flags financial solicitation in chats', risk: 'critical' },
  { id: 'pci',         label: 'PCI DSS Compliance',         desc: 'Stripe + Braintree — zero card data stored on platform', risk: 'low' },
];

// ── MAIN RENDER FUNCTION ──────────────────────────────────
function renderGOATConnect(container) {
  const secScore = computeSecurityScore();
  container.innerHTML = `
    <div class="gc-panel">
      <!-- Header -->
      <div class="gc-banner">
        <div class="gc-banner-left">
          <div class="gc-logo">🔐</div>
          <div>
            <div class="gc-title">GOAT Connect</div>
            <div class="gc-subtitle">Artist-Fan Platform · Secure Matchmaking · Cyber Shield</div>
          </div>
        </div>
        <div class="gc-threat-indicator threat-${gcState.threatLevel}">
          <span class="gc-threat-dot"></span>
          <span>${gcState.threatLevel.toUpperCase()} THREAT</span>
        </div>
      </div>

      <!-- Security Score Bar -->
      <div class="gc-score-bar">
        <div class="gc-score-label">
          <span>🛡️ GOAT Shield Score</span>
          <span class="gc-score-value score-${getScoreClass(secScore)}">${secScore}/100</span>
        </div>
        <div class="gc-progress-track">
          <div class="gc-progress-fill score-fill-${getScoreClass(secScore)}" style="width:${secScore}%"></div>
        </div>
        <div class="gc-score-hint">${getScoreHint(secScore)}</div>
      </div>

      <!-- Tab Nav -->
      <div class="gc-tabs">
        <button class="gc-tab ${gcState.activeTab==='dashboard'?'active':''}" onclick="setGCTab('dashboard')">📊 Dashboard</button>
        <button class="gc-tab ${gcState.activeTab==='profile'?'active':''}" onclick="setGCTab('profile')">👤 Profile</button>
        <button class="gc-tab ${gcState.activeTab==='match'?'active':''}" onclick="setGCTab('match')">💫 Match</button>
        <button class="gc-tab ${gcState.activeTab==='shield'?'active':''}" onclick="setGCTab('shield')">🛡️ Shield</button>
        <button class="gc-tab ${gcState.activeTab==='vault'?'active':''}" onclick="setGCTab('vault')">🏦 Vault</button>
        <button class="gc-tab ${gcState.activeTab==='cyber'?'active':''}" onclick="setGCTab('cyber')">⚔️ Cyber</button>
      </div>

      <!-- Tab Content -->
      <div id="gcTabBody">
        ${renderGCTab(gcState.activeTab, secScore)}
      </div>
    </div>
  `;
}

// ── TAB ROUTER ────────────────────────────────────────────
function renderGCTab(tab, secScore) {
  switch(tab) {
    case 'dashboard': return renderGCDashboard(secScore);
    case 'profile':   return renderGCProfile();
    case 'match':     return renderGCMatch();
    case 'shield':    return renderGCShield();
    case 'vault':     return renderGCVault();
    case 'cyber':     return renderGCCyber();
    default:          return renderGCDashboard(secScore);
  }
}

function setGCTab(tab) {
  gcState.activeTab = tab;
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderGOATConnect(panel);
}

// ── DASHBOARD ─────────────────────────────────────────────
function renderGCDashboard(secScore) {
  return `
    <div class="gc-dashboard">
      <!-- Quick Stats -->
      <div class="gc-stats-grid">
        <div class="gc-stat-card">
          <div class="gc-stat-icon">💫</div>
          <div class="gc-stat-value">247</div>
          <div class="gc-stat-label">Potential Matches</div>
        </div>
        <div class="gc-stat-card">
          <div class="gc-stat-icon">🎤</div>
          <div class="gc-stat-value">18</div>
          <div class="gc-stat-label">Verified Artists</div>
        </div>
        <div class="gc-stat-card threat-${gcState.threatLevel}">
          <div class="gc-stat-icon">🛡️</div>
          <div class="gc-stat-value">${secScore}</div>
          <div class="gc-stat-label">Shield Score</div>
        </div>
        <div class="gc-stat-card">
          <div class="gc-stat-icon">🚨</div>
          <div class="gc-stat-value">0</div>
          <div class="gc-stat-label">Active Threats</div>
        </div>
      </div>

      <!-- User Type Toggle -->
      <div class="gc-section-label">I am a</div>
      <div class="gc-type-toggle">
        <button class="gc-type-btn ${gcState.userType==='fan'?'active':''}" onclick="setGCUserType('fan')">
          <span>❤️</span><span>Fan</span>
          <span class="gc-type-desc">Connect with artists & fans</span>
        </button>
        <button class="gc-type-btn ${gcState.userType==='artist'?'active':''}" onclick="setGCUserType('artist')">
          <span>🎤</span><span>Artist</span>
          <span class="gc-type-desc">Build your fan community</span>
        </button>
      </div>

      <!-- Verification Checklist -->
      <div class="gc-section-label" style="margin-top:14px">Verification Status</div>
      <div class="gc-verify-list">
        ${VERIFICATION_LEVELS.map(v => `
          <div class="gc-verify-item ${gcState.verificationStatus[v.id]?'done':'pending'}">
            <span class="gc-verify-icon">${v.icon}</span>
            <div class="gc-verify-info">
              <div class="gc-verify-name">${v.label}</div>
              <div class="gc-verify-pts">+${v.points} shield points${v.required?' · Required':''}</div>
            </div>
            <button class="gc-verify-btn ${gcState.verificationStatus[v.id]?'verified':''}"
              onclick="runGCVerification('${v.id}')">
              ${gcState.verificationStatus[v.id] ? '✓ Done' : 'Verify'}
            </button>
          </div>
        `).join('')}
      </div>

      <!-- Subscription Tier -->
      <div class="gc-section-label" style="margin-top:14px">Subscription</div>
      <div class="gc-tier-grid">
        ${Object.entries(SUBSCRIPTION_TIERS).map(([k,v]) => `
          <div class="gc-tier-card ${gcState.subscriptionTier===k?'active':''}">
            <div class="gc-tier-name" style="color:${v.color}">${v.label}</div>
            <div class="gc-tier-price">${v.price===0?'Free':'$'+v.price+'/mo'}</div>
            <div class="gc-tier-features">
              ${v.features.slice(0,3).map(f=>`<div class="gc-tier-feature">✓ ${f}</div>`).join('')}
            </div>
            <button class="gc-tier-btn ${gcState.subscriptionTier===k?'current':''}"
              onclick="setGCTier('${k}')"
              style="border-color:${v.color};color:${gcState.subscriptionTier===k?'#fff':v.color};background:${gcState.subscriptionTier===k?v.color:'transparent'}">
              ${gcState.subscriptionTier===k?'Current':'Select'}
            </button>
          </div>
        `).join('')}
      </div>

      <!-- AI Assistant Quick Actions -->
      <div class="gc-section-label" style="margin-top:14px">AI CoPilot Actions</div>
      <div class="gc-ai-actions">
        <button class="gc-ai-btn" onclick="runGCAnalysis('profile')">🔍 Analyze My Profile Safety</button>
        <button class="gc-ai-btn" onclick="runGCAnalysis('match')">💫 Find Best Matches Now</button>
        <button class="gc-ai-btn" onclick="runGCAnalysis('threat')">⚔️ Run Threat Assessment</button>
        <button class="gc-ai-btn" onclick="runGCAnalysis('banking')">🏦 Check Banking Safety</button>
        <button class="gc-ai-btn" onclick="runGCAnalysis('background')">🔎 Run Background Check</button>
        <button class="gc-ai-btn" onclick="runGCAnalysis('artist')">🎤 Verify Artist Identity</button>
      </div>
    </div>
  `;
}

// ── PROFILE MODULE ────────────────────────────────────────
function renderGCProfile() {
  return `
    <div class="gc-profile-panel">
      <div class="gc-section-label">Profile DNA — Who You Are</div>
      <div class="gc-profile-form">

        <!-- Basic Identity -->
        <div class="gc-form-section">
          <div class="gc-form-title">🪪 Identity</div>
          <div class="gc-form-row">
            <div class="gc-form-group">
              <label class="gc-label">Display Name</label>
              <input class="gc-input" placeholder="Your name or artist alias" id="gcDisplayName">
            </div>
            <div class="gc-form-group">
              <label class="gc-label">Age</label>
              <input class="gc-input" type="number" placeholder="18+" id="gcAge" min="18">
            </div>
          </div>
          <div class="gc-form-row">
            <div class="gc-form-group">
              <label class="gc-label">Location</label>
              <input class="gc-input" placeholder="City, State" id="gcLocation">
            </div>
            <div class="gc-form-group">
              <label class="gc-label">Occupation</label>
              <input class="gc-input" placeholder="What you do" id="gcOccupation">
            </div>
          </div>
          <div class="gc-form-group" style="margin-top:8px">
            <label class="gc-label">Bio</label>
            <textarea class="gc-textarea" rows="3" placeholder="Tell your story in your own words..."></textarea>
          </div>
        </div>

        <!-- Music Profile -->
        <div class="gc-form-section">
          <div class="gc-form-title">🎵 Music DNA</div>
          <div class="gc-form-group">
            <label class="gc-label">Favorite Genres (select all that apply)</label>
            <div class="gc-tag-grid">
              ${['Hip-Hop','R&B','Pop','Rock','EDM','Jazz','Gospel','Soul','Trap','Afrobeats','Latin','Country','Classical','Reggae','Dancehall','Drill'].map(g=>`
                <button class="gc-tag" onclick="this.classList.toggle('active')">${g}</button>
              `).join('')}
            </div>
          </div>
          <div class="gc-form-row" style="margin-top:10px">
            <div class="gc-form-group">
              <label class="gc-label">Favorite Artist</label>
              <input class="gc-input" placeholder="e.g. DJ Speedy" id="gcFavArtist">
            </div>
            <div class="gc-form-group">
              <label class="gc-label">Concerts Attended</label>
              <select class="gc-select" id="gcConcerts">
                <option>0 – I'm new to live events</option>
                <option>1–5</option>
                <option>6–20</option>
                <option>20+ – I'm a live music veteran</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Relationship Intent -->
        <div class="gc-form-section">
          <div class="gc-form-title">💫 Connection Goals</div>
          <div class="gc-goal-grid">
            ${['Serious Relationship','Friendship','Networking','Fan Community','Casual Dating','Marriage-Minded','Event Buddy','Business Partner'].map(g=>`
              <button class="gc-goal-btn" onclick="this.classList.toggle('active')">${g}</button>
            `).join('')}
          </div>
        </div>

        <!-- Artist-Specific Section -->
        ${gcState.userType === 'artist' ? `
        <div class="gc-form-section gc-artist-section">
          <div class="gc-form-title">🎤 Artist Profile</div>
          <div class="gc-form-row">
            <div class="gc-form-group">
              <label class="gc-label">Artist/Stage Name</label>
              <input class="gc-input" placeholder="Your artist name" id="gcArtistName">
            </div>
            <div class="gc-form-group">
              <label class="gc-label">Genre/Style</label>
              <input class="gc-input" placeholder="e.g. Hip-Hop Producer" id="gcArtistGenre">
            </div>
          </div>
          <div class="gc-form-row">
            <div class="gc-form-group">
              <label class="gc-label">Spotify/Apple Music Link</label>
              <input class="gc-input" placeholder="https://open.spotify.com/artist/..." id="gcSpotifyLink">
            </div>
            <div class="gc-form-group">
              <label class="gc-label">Monthly Listeners</label>
              <select class="gc-select" id="gcListeners">
                <option>Under 1K</option>
                <option>1K–10K</option>
                <option>10K–100K</option>
                <option>100K–1M</option>
                <option>1M+</option>
              </select>
            </div>
          </div>
          <div class="gc-form-group" style="margin-top:8px">
            <label class="gc-label">Fan Engagement Style</label>
            <div class="gc-tag-grid">
              ${['VIP Meet & Greet','Exclusive Content','Fan Q&As','Private Concerts','DM Access','Merch Drops','Listening Parties','Behind-the-Scenes'].map(t=>`
                <button class="gc-tag" onclick="this.classList.toggle('active')">${t}</button>
              `).join('')}
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Privacy Controls -->
        <div class="gc-form-section">
          <div class="gc-form-title">🔏 Privacy & Safety Controls</div>
          <div class="gc-privacy-grid">
            ${[
              {id:'incognito',label:'Incognito Mode',desc:'Browse without appearing in others\' feeds'},
              {id:'blur_photos',label:'Blur Photos Until Match',desc:'Photos blur until mutual match'},
              {id:'hide_location',label:'Hide Exact Location',desc:'Show city only, never exact address'},
              {id:'screenshot_block',label:'Screenshot Block',desc:'Prevent screenshots in chat (iOS/Android)'},
              {id:'read_receipts',label:'Read Receipts Off',desc:'Others can\'t see when you\'ve read messages'},
              {id:'block_money_req',label:'Block Money Requests',desc:'Auto-block anyone asking for money'},
            ].map(p=>`
              <div class="gc-privacy-item">
                <div>
                  <div class="gc-privacy-name">${p.label}</div>
                  <div class="gc-privacy-desc">${p.desc}</div>
                </div>
                <label class="gc-toggle">
                  <input type="checkbox" id="gc_${p.id}" onchange="gcPrivacyToggle('${p.id}', this.checked)">
                  <span class="gc-toggle-slider"></span>
                </label>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- AI Profile Safety Scan -->
        <button class="gc-primary-btn" onclick="runGCAnalysis('profile')" style="width:100%;margin-top:16px">
          🤖 AI: Analyze My Profile for Safety & Optimize Matches
        </button>
      </div>
    </div>
  `;
}

// ── MATCHMAKING MODULE ────────────────────────────────────
function renderGCMatch() {
  return `
    <div class="gc-match-panel">
      <!-- Match Type Tabs -->
      <div class="gc-match-types">
        <button class="gc-match-type-btn active" onclick="gcSetMatchType(this,'fans')">❤️ Fans</button>
        <button class="gc-match-type-btn" onclick="gcSetMatchType(this,'artists')">🎤 Artists</button>
        <button class="gc-match-type-btn" onclick="gcSetMatchType(this,'events')">🎪 Events</button>
        <button class="gc-match-type-btn" onclick="gcSetMatchType(this,'collab')">🤝 Collab</button>
      </div>

      <!-- AI Match Preferences -->
      <div class="gc-section-label" style="margin-top:12px">AI Match Preferences</div>
      <div class="gc-pref-grid">
        <div class="gc-pref-item">
          <label class="gc-label">Age Range</label>
          <div style="display:flex;gap:8px;align-items:center">
            <input class="gc-input" type="number" value="18" style="width:60px" min="18" max="99"> –
            <input class="gc-input" type="number" value="45" style="width:60px" min="18" max="99">
          </div>
        </div>
        <div class="gc-pref-item">
          <label class="gc-label">Distance Radius</label>
          <select class="gc-select">
            <option>5 miles</option><option>10 miles</option><option>25 miles</option>
            <option>50 miles</option><option>100 miles</option><option>Worldwide</option>
          </select>
        </div>
        <div class="gc-pref-item">
          <label class="gc-label">Minimum Shield Score</label>
          <select class="gc-select">
            <option>Any (risky)</option><option>40+ (basic)</option>
            <option>60+ (recommended)</option><option>80+ (verified only)</option>
          </select>
        </div>
        <div class="gc-pref-item">
          <label class="gc-label">Verified Only</label>
          <select class="gc-select">
            <option>No filter</option><option>Email verified</option>
            <option>ID verified</option><option>Full background check</option>
          </select>
        </div>
      </div>

      <!-- Compatibility Weights -->
      <div class="gc-section-label" style="margin-top:12px">What Matters Most To You?</div>
      <div class="gc-compat-list">
        ${Object.entries(MATCH_FACTORS).map(([k,v]) => `
          <div class="gc-compat-item">
            <span class="gc-compat-label">${v.label}</span>
            <input type="range" min="0" max="100" value="${Math.round(v.weight*100)}"
              class="gc-range" oninput="this.nextElementSibling.textContent=this.value+'%'">
            <span class="gc-range-val">${Math.round(v.weight*100)}%</span>
          </div>
        `).join('')}
      </div>

      <!-- Match Cards Preview -->
      <div class="gc-section-label" style="margin-top:14px">🔥 Your Matches Today</div>
      <div class="gc-match-cards">
        ${generateDemoMatchCards().map(m => `
          <div class="gc-match-card">
            <div class="gc-match-avatar" style="background:${m.color}">${m.avatar}</div>
            <div class="gc-match-info">
              <div class="gc-match-name">${m.name}
                ${m.verified ? '<span class="gc-verified-badge">✓</span>' : ''}
                ${m.artist ? '<span class="gc-artist-badge">🎤</span>' : ''}
              </div>
              <div class="gc-match-meta">${m.age} · ${m.location} · ${m.genre}</div>
              <div class="gc-match-compat">
                <div class="gc-compat-bar">
                  <div class="gc-compat-fill" style="width:${m.compat}%"></div>
                </div>
                <span>${m.compat}% match</span>
              </div>
              <div class="gc-match-shield">
                🛡️ ${m.shield}/100 · ${m.bgCheck ? '✓ BG Checked' : '⚠️ Unverified'}
              </div>
            </div>
            <div class="gc-match-actions">
              <button class="gc-action-btn dislike" onclick="gcSwipe('dislike','${m.id}')">✕</button>
              <button class="gc-action-btn superlike" onclick="gcSwipe('superlike','${m.id}')">⭐</button>
              <button class="gc-action-btn like" onclick="gcSwipe('like','${m.id}')">♥</button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- AI Match Button -->
      <button class="gc-primary-btn" onclick="runGCAnalysis('match')" style="width:100%;margin-top:12px">
        🧠 AI: Generate My Perfect Match Profile
      </button>
    </div>
  `;
}

// ── GOAT SHIELD — SECURITY MODULE ────────────────────────
function renderGCShield() {
  return `
    <div class="gc-shield-panel">
      <div class="gc-shield-hero">
        <div class="gc-shield-icon">🛡️</div>
        <div>
          <div class="gc-shield-title">GOAT Shield</div>
          <div class="gc-shield-desc">AI-powered background checks, identity verification & scam detection</div>
        </div>
      </div>

      <!-- Background Check Modules -->
      <div class="gc-section-label">Background Check Suite</div>
      <div class="gc-bg-check-list">
        ${BACKGROUND_CHECK_MODULES.map((m,i) => `
          <div class="gc-bg-item">
            <span class="gc-bg-icon">${m.icon}</span>
            <div class="gc-bg-info">
              <div class="gc-bg-label">${m.label}</div>
              <div class="gc-bg-provider">via ${m.provider}</div>
            </div>
            <button class="gc-run-btn" onclick="runBackgroundCheck('${m.id}')">
              Run Scan
            </button>
          </div>
        `).join('')}
      </div>

      <!-- Threat Categories -->
      <div class="gc-section-label" style="margin-top:14px">Active Threat Monitor</div>
      <div class="gc-threat-grid">
        ${Object.entries(THREAT_CATEGORIES).map(([k,v]) => `
          <div class="gc-threat-item">
            <span class="gc-threat-cat-icon">${v.icon}</span>
            <div class="gc-threat-cat-info">
              <div class="gc-threat-cat-label">${v.label}</div>
              <div class="gc-threat-severity" style="color:${v.color}">${v.severity.toUpperCase()}</div>
            </div>
            <div class="gc-threat-status safe">✓ Clear</div>
          </div>
        `).join('')}
      </div>

      <!-- Scam Awareness Center -->
      <div class="gc-section-label" style="margin-top:14px">⚠️ Scam Awareness Center</div>
      <div class="gc-scam-cards">
        ${[
          {icon:'💔',title:'Romance Scams',desc:'Never send money, gift cards, or crypto to someone you haven\'t met in person. 70% of dating app scams involve financial requests within 2 weeks.'},
          {icon:'🎣',title:'Phishing & Fake Links',desc:'Any link to "verify your account" or "unlock a match" outside the app is a phishing attempt. GOAT Shield blocks all suspicious URLs automatically.'},
          {icon:'🎭',title:'Catfishing Detection',desc:'We run reverse image searches and facial recognition on all profile photos. 94% of fake accounts are caught at upload.'},
          {icon:'💸',title:'Investment & Crypto Scams',desc:'Beware of matches who pivot to "investment opportunities" or ask you to send crypto. This is a classic pig butchering scam.'},
          {icon:'🪝',title:'Sextortion',desc:'Never share intimate images. GOAT Shield detects and blocks any attempt to pressure users for explicit content.'},
          {icon:'🌑',title:'Dark Web Monitoring',desc:'We monitor the dark web for leaked credentials associated with your account and alert you immediately if your data is found.'},
        ].map(s => `
          <div class="gc-scam-card">
            <div class="gc-scam-icon">${s.icon}</div>
            <div>
              <div class="gc-scam-title">${s.title}</div>
              <div class="gc-scam-desc">${s.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- AI Shield Analysis -->
      <button class="gc-primary-btn" onclick="runGCAnalysis('threat')" style="width:100%;margin-top:14px">
        🤖 AI: Full Threat Assessment & Safety Report
      </button>
    </div>
  `;
}

// ── GOAT VAULT — BANKING PROTECTION ──────────────────────
function renderGCVault() {
  return `
    <div class="gc-vault-panel">
      <div class="gc-vault-hero">
        <div class="gc-vault-icon">🏦</div>
        <div>
          <div class="gc-vault-title">GOAT Vault</div>
          <div class="gc-vault-desc">Banking protection, fraud prevention & financial safety</div>
        </div>
      </div>

      <!-- Critical Warning -->
      <div class="gc-critical-warning">
        <span class="gc-warn-icon">🚨</span>
        <div>
          <strong>GOLDEN RULE:</strong> Never send money, gift cards, wire transfers, or cryptocurrency
          to anyone you've met on this platform — no matter how long you've been talking or
          how genuine they seem. <strong>GOAT Vault will block and report such requests automatically.</strong>
        </div>
      </div>

      <!-- Banking Protection Modules -->
      <div class="gc-section-label" style="margin-top:14px">Banking Protection Suite</div>
      <div class="gc-banking-list">
        ${BANKING_MODULES.map(m => `
          <div class="gc-banking-item risk-${m.risk}">
            <div class="gc-banking-left">
              <div class="gc-banking-label">${m.label}</div>
              <div class="gc-banking-desc">${m.desc}</div>
            </div>
            <div class="gc-banking-risk risk-${m.risk}">${m.risk.toUpperCase()}</div>
          </div>
        `).join('')}
      </div>

      <!-- Safe Payment Methods -->
      <div class="gc-section-label" style="margin-top:14px">✅ Safe In-App Payments Only</div>
      <div class="gc-payment-methods">
        ${[
          {icon:'💳',name:'Credit/Debit Card',note:'3DS2 verified — never stored on platform'},
          {icon:'📱',name:'Apple Pay / Google Pay',note:'Zero card data exposure'},
          {icon:'🔒',name:'Stripe Checkout',note:'PCI DSS Level 1 compliant'},
          {icon:'🏦',name:'ACH Bank Transfer',note:'Plaid-verified for subscriptions only'},
        ].map(p => `
          <div class="gc-payment-item">
            <span class="gc-payment-icon">${p.icon}</span>
            <div>
              <div class="gc-payment-name">${p.name}</div>
              <div class="gc-payment-note">${p.note}</div>
            </div>
            <span class="gc-payment-safe">✓ Safe</span>
          </div>
        `).join('')}
      </div>

      <!-- Red Flags -->
      <div class="gc-section-label" style="margin-top:14px">🚩 Automatic Red Flag Detection</div>
      <div class="gc-red-flags">
        ${[
          'Any request to send money or gift cards',
          'Requests for your bank account or routing number',
          'Claims of being stuck abroad needing emergency funds',
          'Investment opportunities with "guaranteed returns"',
          'Requests to use Cash App, Venmo, Zelle, or PayPal',
          'Crypto wallet addresses shared in chat',
          'Fake check schemes (overpayment scams)',
          'Emergency medical bill payment requests',
          'Requests to forward or transfer received funds',
        ].map(f => `
          <div class="gc-red-flag">
            <span class="gc-rf-icon">🚩</span>
            <span class="gc-rf-text">${f}</span>
            <span class="gc-rf-status">Auto-blocked</span>
          </div>
        `).join('')}
      </div>

      <!-- AI Banking Analysis -->
      <button class="gc-primary-btn" onclick="runGCAnalysis('banking')" style="width:100%;margin-top:14px">
        🤖 AI: Analyze My Financial Safety Profile
      </button>
    </div>
  `;
}

// ── CYBER WARFARE / ANTIVIRUS MODULE ─────────────────────
function renderGCCyber() {
  return `
    <div class="gc-cyber-panel">
      <div class="gc-cyber-hero">
        <div class="gc-cyber-icon">⚔️</div>
        <div>
          <div class="gc-cyber-title">GOAT Cyber Warfare Center</div>
          <div class="gc-cyber-desc">Military-grade protection against digital threats & attacks</div>
        </div>
      </div>

      <!-- Live Threat Map Placeholder -->
      <div class="gc-threat-map">
        <div class="gc-tm-header">
          <span>🌐 Live Global Threat Intelligence</span>
          <span class="gc-tm-live">● LIVE</span>
        </div>
        <div class="gc-tm-body">
          <div class="gc-tm-stats">
            <div class="gc-tm-stat"><span class="gc-tm-num green">0</span><span>Threats Blocked Today</span></div>
            <div class="gc-tm-stat"><span class="gc-tm-num yellow">0</span><span>Suspicious Accounts</span></div>
            <div class="gc-tm-stat"><span class="gc-tm-num red">0</span><span>Active Incidents</span></div>
            <div class="gc-tm-stat"><span class="gc-tm-num blue">0</span><span>Scammers Banned</span></div>
          </div>
          <div class="gc-tm-feed" id="gcThreatFeed">
            <div class="gc-tm-feed-item">✓ System secure — no active threats detected</div>
            <div class="gc-tm-feed-item">🛡️ GOAT Shield monitoring ${gcState.threatLevel.toUpperCase()} threat level</div>
            <div class="gc-tm-feed-item">🔍 Last scan: ${new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      <!-- Cyber Protection Modules -->
      <div class="gc-section-label" style="margin-top:14px">Active Protection Modules</div>
      <div class="gc-cyber-modules">
        ${CYBER_MODULES.map(m => `
          <div class="gc-cyber-item">
            <div class="gc-cyber-status active"></div>
            <div class="gc-cyber-info">
              <div class="gc-cyber-label">${m.label}</div>
              <div class="gc-cyber-desc-text">${m.desc}</div>
            </div>
            <span class="gc-cyber-badge">ACTIVE</span>
          </div>
        `).join('')}
      </div>

      <!-- Security Compliance Badges -->
      <div class="gc-section-label" style="margin-top:14px">Security Standards & Compliance</div>
      <div class="gc-compliance-grid">
        ${[
          {badge:'PCI DSS',level:'Level 1',color:'#22c55e'},
          {badge:'SOC 2 Type II',level:'Certified',color:'#22c55e'},
          {badge:'GDPR',level:'Compliant',color:'#3b82f6'},
          {badge:'CCPA',level:'Compliant',color:'#3b82f6'},
          {badge:'HIPAA',level:'Aligned',color:'#a855f7'},
          {badge:'ISO 27001',level:'Aligned',color:'#f59e0b'},
          {badge:'OWASP Top 10',level:'Tested',color:'#ef4444'},
          {badge:'MITRE ATT&CK',level:'Mapped',color:'#ef4444'},
          {badge:'Signal Protocol',level:'E2E Encryption',color:'#06b6d4'},
          {badge:'Zero Trust',level:'Architecture',color:'#8b5cf6'},
        ].map(c => `
          <div class="gc-compliance-badge" style="border-color:${c.color}20;background:${c.color}08">
            <div class="gc-compliance-name" style="color:${c.color}">${c.badge}</div>
            <div class="gc-compliance-level">${c.level}</div>
          </div>
        `).join('')}
      </div>

      <!-- Incident Response -->
      <div class="gc-section-label" style="margin-top:14px">Emergency Response</div>
      <div class="gc-emergency-grid">
        <button class="gc-emergency-btn" onclick="gcEmergency('block')">🚫 Block & Report User</button>
        <button class="gc-emergency-btn" onclick="gcEmergency('scam')">🆘 Report Romance Scam</button>
        <button class="gc-emergency-btn" onclick="gcEmergency('doxx')">🔒 Suspected Doxxing</button>
        <button class="gc-emergency-btn" onclick="gcEmergency('extort')">⚠️ Report Sextortion</button>
        <button class="gc-emergency-btn" onclick="gcEmergency('hack')">🔴 Account Compromised</button>
        <button class="gc-emergency-btn" onclick="gcEmergency('ncmec')">🛡️ Report CSAM (NCMEC)</button>
      </div>

      <!-- AI Cyber Analysis -->
      <button class="gc-primary-btn" onclick="runGCAnalysis('cyber')" style="width:100%;margin-top:14px">
        🤖 AI: Full Cyber Security Analysis & Recommendations
      </button>
    </div>
  `;
}

// ── HELPER FUNCTIONS ──────────────────────────────────────
function computeSecurityScore() {
  let score = 0;
  VERIFICATION_LEVELS.forEach(v => {
    if (gcState.verificationStatus[v.id]) score += v.points;
  });
  return Math.min(score, 100);
}

function getScoreClass(score) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

function getScoreHint(score) {
  if (score >= 80) return '🟢 Excellent — You are fully verified and protected';
  if (score >= 60) return '🟡 Good — Complete ID or background check to reach 80+';
  if (score >= 40) return '🟠 Fair — Verify your phone and government ID to improve';
  return '🔴 Poor — Complete basic verification to protect yourself and others';
}

function generateDemoMatchCards() {
  return [
    { id:'m1', name:'Jasmine R.', avatar:'🎵', color:'linear-gradient(135deg,#a855f7,#6366f1)', age:26, location:'Atlanta, GA', genre:'R&B · Hip-Hop', compat:94, shield:87, verified:true,  bgCheck:true,  artist:false },
    { id:'m2', name:'DJ Pharaoh', avatar:'🎤', color:'linear-gradient(135deg,#e8530a,#f59e0b)', age:31, location:'Miami, FL',   genre:'Trap · EDM',  compat:88, shield:95, verified:true,  bgCheck:true,  artist:true  },
    { id:'m3', name:'Maya T.',   avatar:'🎶', color:'linear-gradient(135deg,#22c55e,#06b6d4)', age:24, location:'LA, CA',     genre:'Pop · Soul',  compat:81, shield:62, verified:true,  bgCheck:false, artist:false },
  ];
}

function setGCUserType(type) {
  gcState.userType = type;
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderGOATConnect(panel);
}

function setGCTier(tier) {
  gcState.subscriptionTier = tier;
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderGOATConnect(panel);
}

function gcPrivacyToggle(id, val) {
  if (!gcState.profile) gcState.profile = {};
  if (!gcState.profile.privacy) gcState.profile.privacy = {};
  gcState.profile.privacy[id] = val;
}

function gcSetMatchType(btn, type) {
  document.querySelectorAll('.gc-match-type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function gcSwipe(action, matchId) {
  const card = document.querySelector(`[onclick*="${matchId}"]`)?.closest('.gc-match-card');
  if (card) {
    card.style.opacity = '0';
    card.style.transform = action === 'like' ? 'translateX(50px)' : action === 'dislike' ? 'translateX(-50px)' : 'translateY(-30px)';
    card.style.transition = 'all 0.3s ease';
    setTimeout(() => card.remove(), 300);
  }
}

function runBackgroundCheck(moduleId) {
  const btn = document.querySelector(`[onclick="runBackgroundCheck('${moduleId}')"]`);
  if (btn) {
    btn.textContent = '⏳ Scanning...';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = '✓ Clear'; btn.style.color = '#22c55e'; btn.style.borderColor = '#22c55e'; }, 2000);
  }
}

function runGCVerification(verType) {
  gcState.verificationStatus[verType] = true;
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderGOATConnect(panel);
}

function gcEmergency(type) {
  const labels = {
    block:'Block & Report', scam:'Romance Scam Report', doxx:'Doxxing Report',
    extort:'Sextortion Report', hack:'Compromised Account', ncmec:'CSAM Report to NCMEC'
  };
  document.getElementById('message-input').value =
    `[GOAT Connect Emergency — ${labels[type]}]\n\nI need immediate help with a ${labels[type]} incident on GOAT Connect. Please provide step-by-step guidance, relevant authority contacts (FBI IC3, FTC, NCMEC, local law enforcement), and what evidence to preserve.`;
  closeToolPanel();
  sendMessage();
}

// ── AI ANALYSIS ENGINE ────────────────────────────────────
async function runGCAnalysis(type) {
  const prompts = {
    profile: `[GOAT Connect — Profile Safety Analysis]\nYou are a cybersecurity and dating app safety expert. Analyze a user's dating profile for:\n1. Privacy risks and information oversharing\n2. Safety red flags to watch for from other users\n3. How to optimize the profile for genuine, high-quality matches\n4. Best practices for the artist-fan dynamic in dating\n5. How to maximize their GOAT Shield security score\nProvide specific, actionable recommendations.`,
    match: `[GOAT Connect — AI Matchmaking Analysis]\nYou are an expert in relationship psychology, music culture, and AI matchmaking. Explain:\n1. How the GOAT Connect algorithm weighs music taste, values, goals, and personality\n2. The artist-fan dynamic in relationships — opportunities and risks\n3. How to find genuine connections in a music-focused dating community\n4. Red flags and green flags specific to music industry relationships\n5. Tips for artists to safely engage with their fan community romantically/socially\nBe specific and culturally aware of the hip-hop/R&B/music industry context.`,
    threat: `[GOAT Connect — Threat Assessment]\nYou are a cybersecurity expert specializing in dating app fraud and social engineering. Provide a comprehensive threat assessment covering:\n1. Top 10 threats on music-focused dating apps in 2025\n2. How romance scams specifically target music fans and artists\n3. Catfishing tactics used against celebrities and public figures\n4. How UEBA (User Entity Behavior Analytics) detects threats in real-time\n5. Specific protections: Signal Protocol E2E encryption, zero-trust auth, honeypot accounts\n6. What to do if you're targeted by a scammer — step by step\n7. FBI IC3, FTC, and CISA resources for victims\nBe detailed and include real statistics.`,
    banking: `[GOAT Connect — Banking Safety Analysis]\nYou are a financial fraud expert and cybersecurity professional. Cover:\n1. The top 5 financial scams on dating apps in 2025 with exact tactics\n2. Pig butchering scams — how they work and red flags\n3. How GOAT Vault protects users: PCI DSS, 3DS2, Stripe Radar, Plaid identity\n4. Virtual card masking with Privacy.com — how and why to use it\n5. What cryptocurrency-based romance scams look like — warning signs\n6. How to report financial fraud: FTC, CFPB, FBI IC3, your bank\n7. How to recover if you've already been scammed\nInclude specific dollar amounts and statistics to illustrate the scale of the problem.`,
    background: `[GOAT Connect — Background Check Guide]\nYou are a background check and identity verification expert. Explain:\n1. How Certn, Jumio, LexisNexis, and similar services work for dating app verification\n2. What a comprehensive background check reveals and its limitations\n3. Sex offender registry checks — how they work across all 50 states\n4. OSINT (Open Source Intelligence) techniques for verifying someone's identity\n5. AI-powered reverse image search for detecting catfishing\n6. Dark web monitoring for leaked credentials\n7. Legal considerations — what you can and can't check without consent\n8. How verified profiles improve match quality and safety outcomes\nBe specific and reference real tools and databases.`,
    artist: `[GOAT Connect — Artist Verification & Fan Safety]\nYou are an expert in music industry security, brand protection, and fan-artist relationships. Cover:\n1. How to verify a real artist vs. impersonator on a dating/social platform\n2. The unique security risks artists face from fans (stalking, doxxing, OSINT attacks)\n3. How verified artist badges work — the verification pipeline\n4. Safe fan engagement practices: what artists should and shouldn't share\n5. How GOAT Connect protects artists with enhanced privacy controls\n6. The legal framework around fan-artist relationships\n7. How to build genuine artist-fan community without exploitation\n8. Revenue models for artists on the platform (fan subscriptions, events, exclusive content)\nRelevant to hip-hop, R&B, and urban music culture.`,
    cyber: `[GOAT Connect — Comprehensive Cybersecurity Analysis]\nYou are a senior cybersecurity architect specializing in social platforms. Provide a complete analysis of:\n1. Threat modeling for a music-focused dating/fan platform (STRIDE framework)\n2. The Signal Protocol implementation for E2E encryption — how it works\n3. Zero-trust architecture for mobile dating apps\n4. OWASP Top 10 vulnerabilities specific to dating apps and mitigations\n5. MITRE ATT&CK techniques most commonly used against social platforms\n6. DDoS mitigation with Cloudflare WAF and BGP scrubbing\n7. SIEM implementation for real-time threat detection\n8. Automated pen testing schedule and tools (Burp Suite, OWASP ZAP)\n9. Incident response playbook for dating app breaches\n10. Privacy by design — GDPR and CCPA compliance for matchmaking data\nBe highly technical and specific.`
  };

  const prompt = prompts[type] || prompts.threat;
  document.getElementById('message-input').value = prompt;
  closeToolPanel();
  sendMessage();
}

// Expose to global scope for HTML onclick handlers
window.renderGOATConnect = renderGOATConnect;
window.setGCTab = setGCTab;
window.setGCUserType = setGCUserType;
window.setGCTier = setGCTier;
window.gcPrivacyToggle = gcPrivacyToggle;
window.gcSetMatchType = gcSetMatchType;
window.gcSwipe = gcSwipe;
window.runBackgroundCheck = runBackgroundCheck;
window.runGCVerification = runGCVerification;
window.gcEmergency = gcEmergency;
window.runGCAnalysis = runGCAnalysis;