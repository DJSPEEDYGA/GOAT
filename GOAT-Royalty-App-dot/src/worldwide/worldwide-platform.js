// ============================================================
// GOAT WORLDWIDE PLATFORM v1.0
// Live Map • Music DNA • Streaming Hub • Analytics • Leaderboards
// Instagram Feed • Fan Clubs • Events • Artist Discovery
// By Harvey Miller (DJ Speedy) — @DJSPEEDYGA
// ============================================================
'use strict';

const wwState = {
  activeTab: 'map',
  mapLoaded: false,
  selectedRegion: 'global',
  feedPosts: [],
  leaderboard: [],
  liveEvents: [],
  analyticsRange: '30d',
  fanClubs: [],
  musicDNA: null,
  streamingStats: null,
  trendingArtists: [],
  notifications: [],
};

// ── WORLDWIDE REGIONS ─────────────────────────────────────────
const REGIONS = [
  { id: 'global',    label: 'Global',          flag: '🌍', users: '2.4M', artists: '18K' },
  { id: 'na',        label: 'North America',   flag: '🇺🇸', users: '680K', artists: '5.2K' },
  { id: 'eu',        label: 'Europe',          flag: '🇪🇺', users: '540K', artists: '4.1K' },
  { id: 'asia',      label: 'Asia Pacific',    flag: '🌏', users: '720K', artists: '6.8K' },
  { id: 'latam',     label: 'Latin America',   flag: '🌎', users: '310K', artists: '2.9K' },
  { id: 'africa',    label: 'Africa',          flag: '🌍', users: '150K', artists: '1.4K' },
  { id: 'me',        label: 'Middle East',     flag: '🕌', users: '95K',  artists: '820' },
];

// ── MUSIC DNA CATEGORIES ──────────────────────────────────────
const MUSIC_DNA = {
  genres: ['Hip-Hop','R&B','Trap','Drill','Pop','EDM','Afrobeats','Reggaeton','Rock','Jazz','Classical','Country','Gospel','Lo-Fi','House','Techno'],
  moods: ['Hype 🔥','Chill 😌','Romantic 💕','Sad 😢','Motivated 💪','Party 🎉','Spiritual 🙏','Angry 😤','Happy 😊','Nostalgic 🌅'],
  eras: ['2020s','2010s','2000s','1990s','1980s','1970s','Classic'],
  activities: ['Workout','Driving','Focus','Sleep','Party','Romance','Meditation','Gaming'],
};

// ── DEMO FEED POSTS ───────────────────────────────────────────
const DEMO_POSTS = [
  { id:1, type:'release', user:'DJ Speedy', handle:'@DJSPEEDYGA', verified:true, avatar:'🎧', content:'New single dropping TOMORROW 🔥🔥🔥 Who\'s ready?? #NewMusic #HipHop', likes:2847, comments:341, shares:892, time:'2m ago', media:'🎵', tags:['#NewMusic','#HipHop','#DJSpeedy'] },
  { id:2, type:'live',    user:'Lil Artist', handle:'@lilartist', verified:false, avatar:'🎤', content:'LIVE NOW on GOAT Connect 🎙️ Come vibe with me! Performing unreleased tracks', likes:1203, comments:892, shares:234, time:'Just now', media:'🔴', tags:['#Live','#Concert','#Unreleased'], isLive:true },
  { id:3, type:'collab',  user:'Producer Mike', handle:'@prodmike', verified:true, avatar:'🎹', content:'Looking for vocalists for my new project 🎹 DM me if interested. Beat preview below 👇', likes:567, comments:234, shares:123, time:'15m ago', media:'🎵', tags:['#Producer','#Collab','#Beat'] },
  { id:4, type:'event',   user:'GOAT Events', handle:'@goatevents', verified:true, avatar:'🎪', content:'🎟️ GOAT Connect Live Festival 2026 — Atlanta, GA! 50+ artists confirmed. Tickets on sale NOW', likes:8934, comments:1204, shares:3421, time:'1h ago', media:'🎪', tags:['#Festival','#Atlanta','#Live'] },
  { id:5, type:'milestone',user:'DJ Speedy', handle:'@DJSPEEDYGA', verified:true, avatar:'🎧', content:'100K GOAT Connect followers!! Can\'t believe it. Thank you ALL 🙏💛 Special live performance coming!', likes:12043, comments:2341, shares:5892, time:'3h ago', media:'🏆', tags:['#Milestone','#Grateful','#100K'] },
  { id:6, type:'release', user:'The Composer', handle:'@thecomposer', verified:true, avatar:'🎼', content:'Score I wrote for the indie film "Neon Dreams" just dropped on all platforms 🎼✨ Link in bio', likes:3421, comments:445, shares:678, time:'5h ago', media:'🎵', tags:['#FilmScore','#Composer','#Classical'] },
];

// ── DEMO LEADERBOARD ──────────────────────────────────────────
const DEMO_LEADERBOARD = {
  artists: [
    { rank:1, name:'DJ Speedy', handle:'@DJSPEEDYGA', score:98420, badge:'🥇', change:'+2', genre:'Hip-Hop/R&B', fans:'127K', streams:'4.2M', verified:true },
    { rank:2, name:'Luna Star',  handle:'@lunastar',   score:94210, badge:'🥈', change:'+5', genre:'Pop/R&B',    fans:'98K',  streams:'3.8M', verified:true },
    { rank:3, name:'Beat King',  handle:'@beatking',   score:91840, badge:'🥉', change:'-1', genre:'Trap',       fans:'87K',  streams:'3.1M', verified:true },
    { rank:4, name:'The Composer',handle:'@thecomp',  score:88930, badge:'4️⃣', change:'0',  genre:'Classical',  fans:'76K',  streams:'2.9M', verified:true },
    { rank:5, name:'Afro Wave',  handle:'@afrowave',   score:85420, badge:'5️⃣', change:'+8', genre:'Afrobeats',  fans:'65K',  streams:'2.7M', verified:false },
    { rank:6, name:'Neo Trap',   handle:'@neotrap',    score:82100, badge:'6️⃣', change:'-2', genre:'Drill',      fans:'54K',  streams:'2.4M', verified:true },
    { rank:7, name:'Jazz Queen', handle:'@jazzqueen',  score:79500, badge:'7️⃣', change:'+3', genre:'Jazz',       fans:'43K',  streams:'2.1M', verified:false },
    { rank:8, name:'EDM Force',  handle:'@edmforce',   score:76300, badge:'8️⃣', change:'+1', genre:'EDM',        fans:'38K',  streams:'1.9M', verified:true },
    { rank:9, name:'Soul Vibes', handle:'@soulvibes',  score:73800, badge:'9️⃣', change:'-3', genre:'Soul',       fans:'32K',  streams:'1.7M', verified:false },
    { rank:10,name:'City Rap',   handle:'@cityrap',    score:71200, badge:'🔟', change:'+4', genre:'Hip-Hop',    fans:'28K',  streams:'1.5M', verified:true },
  ],
  fans: [
    { rank:1, name:'SuperFan01', handle:'@superfan01', score:52100, badge:'🥇', change:'+1', activity:'Daily listener, top tipper', verified:true },
    { rank:2, name:'MusicLover', handle:'@musiclover', score:48900, badge:'🥈', change:'+2', activity:'Concert goer, collector', verified:false },
    { rank:3, name:'BeatNerd',   handle:'@beatnerd',   score:45600, badge:'🥉', change:'0',  activity:'Producer fan, curator', verified:true },
  ],
};

// ── DEMO EVENTS ───────────────────────────────────────────────
const DEMO_EVENTS = [
  { id:1, title:'GOAT Connect Live Festival 2026', artist:'Multiple Artists', date:'Mar 15, 2026', venue:'State Farm Arena, Atlanta GA', type:'festival',   price:'$45–$250', tickets:2840, capacity:20000, icon:'🎪' },
  { id:2, title:'DJ Speedy — Midnight Session',    artist:'DJ Speedy',        date:'Feb 28, 2026', venue:'Live Online — GOAT Stream',    type:'livestream', price:'Free/$5 VIP', tickets:8920, capacity:50000,icon:'🎧' },
  { id:3, title:'Beat King Album Release Party',   artist:'Beat King',        date:'Mar 3, 2026',  venue:'Trap House, Miami FL',          type:'release',    price:'$25',      tickets:340,  capacity:500,  icon:'🎉' },
  { id:4, title:'Classical Meets Hip-Hop Night',   artist:'The Composer',     date:'Mar 10, 2026', venue:'Symphony Hall, NY',             type:'concert',    price:'$35–$120', tickets:890,  capacity:2500, icon:'🎼' },
  { id:5, title:'Afrobeats World Tour — ATL',      artist:'Afro Wave',        date:'Apr 1, 2026',  venue:'Tabernacle, Atlanta GA',        type:'concert',    price:'$40–$85',  tickets:1200, capacity:2500, icon:'🌍' },
];

// ── ANALYTICS DATA ────────────────────────────────────────────
const ANALYTICS_DATA = {
  streams:    { today: 12840, week: 89420, month: 342100, total: 4210000, growth: '+23%' },
  fans:       { today: 234,   week: 1820,  month: 8940,   total: 127000,  growth: '+18%' },
  revenue:    { today: 284,   week: 1924,  month: 8420,   total: 124000,  growth: '+31%' },
  matches:    { today: 89,    week: 623,   month: 2840,   total: 34200,   growth: '+45%' },
  topCities:  [['Atlanta, GA',32],['New York, NY',28],['Los Angeles, CA',21],['Houston, TX',18],['Chicago, IL',15],['Miami, FL',12],['London, UK',10],['Toronto, CA',8]],
  topGenres:  [['Hip-Hop',38],['R&B',24],['Trap',18],['Pop',12],['Afrobeats',8]],
  platforms:  [['Spotify',42],['Apple Music',28],['YouTube',18],['Tidal',7],['Amazon',5]],
  hourlyStreams: [120,85,60,40,35,55,180,340,420,380,290,310,450,520,480,390,410,560,720,840,780,650,480,320],
};

// ── RENDER WORLDWIDE PLATFORM ─────────────────────────────────
function renderWorldwidePlatform(container) {
  container.innerHTML = `
    <div class="ww-panel">
      <!-- Header -->
      <div class="ww-banner">
        <div class="ww-banner-left">
          <div class="ww-banner-icon">🌍</div>
          <div>
            <div class="ww-banner-title">GOAT Worldwide Platform</div>
            <div class="ww-banner-sub">Live Map • Music DNA • Streaming Hub • Analytics • Leaderboards • Feed • Fan Clubs • Events</div>
          </div>
        </div>
        <div class="ww-live-indicator">
          <span class="ww-live-dot"></span> LIVE — ${(2400000 + Math.floor(Math.random()*1000)).toLocaleString()} users online
        </div>
      </div>

      <!-- Tabs -->
      <div class="ww-tabs">
        ${[
          { id:'map',       icon:'🗺️',  label:'Live Map'     },
          { id:'feed',      icon:'📱',  label:'Global Feed'  },
          { id:'dna',       icon:'🎵',  label:'Music DNA'    },
          { id:'events',    icon:'🎪',  label:'Live Events'  },
          { id:'analytics', icon:'📊',  label:'Analytics'    },
          { id:'leaderboard',icon:'🏆', label:'Leaderboards' },
          { id:'fanclubs',  icon:'👥',  label:'Fan Clubs'    },
          { id:'discovery', icon:'🔭',  label:'Discovery'    },
        ].map(t => `
          <button class="ww-tab ${wwState.activeTab===t.id?'active':''}" onclick="setWWTab('${t.id}')">
            ${t.icon} ${t.label}
          </button>
        `).join('')}
      </div>

      <!-- Tab Content -->
      <div class="ww-content" id="wwContent">
        ${renderWWTabContent()}
      </div>
    </div>
  `;
}

function renderWWTabContent() {
  switch(wwState.activeTab) {
    case 'map':        return renderWWMap();
    case 'feed':       return renderWWFeed();
    case 'dna':        return renderWWMusicDNA();
    case 'events':     return renderWWEvents();
    case 'analytics':  return renderWWAnalytics();
    case 'leaderboard':return renderWWLeaderboard();
    case 'fanclubs':   return renderWWFanClubs();
    case 'discovery':  return renderWWDiscovery();
    default:           return renderWWMap();
  }
}

// ── LIVE MAP ──────────────────────────────────────────────────
function renderWWMap() {
  const dots = Array.from({length:80}, () => ({
    x: Math.random()*100, y: Math.random()*80+10,
    type: Math.random()>0.7?'artist':'fan',
    size: Math.random()*8+4,
    pulse: Math.random()>0.8,
  }));
  return `
    <div class="ww-map-section">
      <!-- Region Selector -->
      <div class="ww-region-bar">
        ${REGIONS.map(r => `
          <button class="ww-region-btn ${wwState.selectedRegion===r.id?'active':''}" onclick="setWWRegion('${r.id}')">
            ${r.flag} ${r.label}
            <span class="ww-region-count">${r.users}</span>
          </button>
        `).join('')}
      </div>

      <!-- Map Canvas -->
      <div class="ww-map-canvas" id="wwMapCanvas">
        <!-- World Map SVG Background -->
        <div class="ww-map-bg">
          <div class="ww-continent ww-na">North America</div>
          <div class="ww-continent ww-eu">Europe</div>
          <div class="ww-continent ww-asia">Asia</div>
          <div class="ww-continent ww-latam">Latin America</div>
          <div class="ww-continent ww-africa">Africa</div>
          <div class="ww-continent ww-oceania">Oceania</div>
        </div>

        <!-- Live User Dots -->
        ${dots.map((d,i) => `
          <div class="ww-map-dot ${d.type} ${d.pulse?'pulse':''}"
               style="left:${d.x}%;top:${d.y}%;width:${d.size}px;height:${d.size}px"
               title="${d.type==='artist'?'🎤 Artist':'👤 Fan'}">
          </div>
        `).join('')}

        <!-- Hotspot Labels -->
        <div class="ww-hotspot" style="left:22%;top:30%">🔥 ATL</div>
        <div class="ww-hotspot" style="left:19%;top:25%">🔥 NYC</div>
        <div class="ww-hotspot" style="left:15%;top:28%">🔥 LA</div>
        <div class="ww-hotspot" style="left:47%;top:22%">🔥 London</div>
        <div class="ww-hotspot" style="left:72%;top:28%">🔥 Tokyo</div>
        <div class="ww-hotspot" style="left:50%;top:35%">🔥 Lagos</div>

        <!-- Map Legend -->
        <div class="ww-map-legend">
          <div class="ww-legend-item"><div class="ww-legend-dot artist"></div>Artist</div>
          <div class="ww-legend-item"><div class="ww-legend-dot fan"></div>Fan</div>
          <div class="ww-legend-item"><div class="ww-legend-dot pulse"></div>Live Event</div>
        </div>

        <!-- Live Counter -->
        <div class="ww-map-counter">
          <div class="ww-counter-item"><span>🎤</span> <strong id="artistCount">18,420</strong> Artists</div>
          <div class="ww-counter-item"><span>👥</span> <strong id="fanCount">2.4M</strong> Fans</div>
          <div class="ww-counter-item"><span>🔴</span> <strong>47</strong> Live Now</div>
          <div class="ww-counter-item"><span>💛</span> <strong>1,204</strong> Matches Today</div>
        </div>
      </div>

      <!-- Map Stats Grid -->
      <div class="ww-map-stats">
        ${REGIONS.slice(1).map(r => `
          <div class="ww-map-stat-card">
            <div class="ww-msc-flag">${r.flag}</div>
            <div class="ww-msc-region">${r.label}</div>
            <div class="ww-msc-users">${r.users} fans</div>
            <div class="ww-msc-artists">${r.artists} artists</div>
          </div>
        `).join('')}
      </div>

      <button class="ww-btn-primary" onclick="generateWWAIInsights()">
        🤖 Generate AI Market Insights for ${REGIONS.find(r=>r.id===wwState.selectedRegion)?.label}
      </button>
    </div>
  `;
}

// ── GLOBAL FEED ───────────────────────────────────────────────
function renderWWFeed() {
  return `
    <div class="ww-feed-section">
      <!-- Feed Controls -->
      <div class="ww-feed-controls">
        <div class="ww-feed-filter-btns">
          ${['All','Artists','Releases','Live','Events','Collabs'].map(f => `
            <button class="ww-filter-btn ${f==='All'?'active':''}" onclick="filterWWFeed('${f}')">${f}</button>
          `).join('')}
        </div>
        <button class="ww-btn-secondary" onclick="createWWPost()">✍️ Post</button>
      </div>

      <!-- Stories Bar -->
      <div class="ww-stories-bar">
        <div class="ww-story add-story" onclick="addWWStory()">
          <div class="ww-story-avatar add">+</div>
          <div class="ww-story-name">Add Story</div>
        </div>
        ${['🎧','🎤','🎹','🎼','🎪','🎵','🎸','🎺'].map((icon,i) => `
          <div class="ww-story" onclick="viewWWStory(${i})">
            <div class="ww-story-avatar ${i<3?'has-story':''}">${icon}</div>
            <div class="ww-story-name">Artist ${i+1}</div>
          </div>
        `).join('')}
      </div>

      <!-- Posts Feed -->
      <div class="ww-posts-feed">
        ${DEMO_POSTS.map(post => `
          <div class="ww-post-card ${post.type}">
            <div class="ww-post-header">
              <div class="ww-post-avatar">${post.avatar}</div>
              <div class="ww-post-user-info">
                <div class="ww-post-name">
                  ${post.user}
                  ${post.verified ? '<span class="ww-verified">✓</span>' : ''}
                  ${post.isLive ? '<span class="ww-live-badge">🔴 LIVE</span>' : ''}
                </div>
                <div class="ww-post-handle">${post.handle} · ${post.time}</div>
              </div>
              <button class="ww-post-follow-btn">+ Follow</button>
            </div>
            <div class="ww-post-content">${post.content}</div>
            ${post.media ? `<div class="ww-post-media">${post.media === '🔴' ? renderLiveMediaCard() : renderMediaCard(post.media)}</div>` : ''}
            <div class="ww-post-tags">
              ${post.tags.map(t => `<span class="ww-tag">${t}</span>`).join('')}
            </div>
            <div class="ww-post-actions">
              <button class="ww-post-action" onclick="likePost(${post.id})">❤️ ${(post.likes).toLocaleString()}</button>
              <button class="ww-post-action" onclick="commentPost(${post.id})">💬 ${post.comments}</button>
              <button class="ww-post-action" onclick="sharePost(${post.id})">🔄 ${post.shares}</button>
              <button class="ww-post-action" onclick="tipArtist(${post.id})">💛 Tip</button>
              ${post.type === 'live' || post.isLive ? `<button class="ww-post-action live" onclick="joinLiveStream(${post.id})">🔴 Join Live</button>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderMediaCard(icon) {
  return `<div class="ww-media-card">${icon} <span>Media Preview</span></div>`;
}
function renderLiveMediaCard() {
  return `<div class="ww-media-card live"><span class="ww-live-pulse"></span>🔴 LIVE STREAM — Click to Join</div>`;
}

// ── MUSIC DNA ─────────────────────────────────────────────────
function renderWWMusicDNA() {
  return `
    <div class="ww-dna-section">
      <div class="ww-section-header">
        <h3>🎵 Music DNA Engine</h3>
        <p>Build your sonic fingerprint. AI matches you with artists and fans who share your exact musical soul.</p>
      </div>

      <!-- DNA Builder -->
      <div class="ww-dna-builder">
        <!-- Genres -->
        <div class="ww-dna-category">
          <div class="ww-dna-cat-title">🎸 Genres</div>
          <div class="ww-dna-tags">
            ${MUSIC_DNA.genres.map(g => `
              <button class="ww-dna-tag" onclick="toggleDNATag(this, 'genre', '${g}')">${g}</button>
            `).join('')}
          </div>
        </div>

        <!-- Moods -->
        <div class="ww-dna-category">
          <div class="ww-dna-cat-title">💫 Moods</div>
          <div class="ww-dna-tags">
            ${MUSIC_DNA.moods.map(m => `
              <button class="ww-dna-tag" onclick="toggleDNATag(this, 'mood', '${m}')">${m}</button>
            `).join('')}
          </div>
        </div>

        <!-- Eras -->
        <div class="ww-dna-category">
          <div class="ww-dna-cat-title">📅 Eras</div>
          <div class="ww-dna-tags">
            ${MUSIC_DNA.eras.map(e => `
              <button class="ww-dna-tag" onclick="toggleDNATag(this, 'era', '${e}')">${e}</button>
            `).join('')}
          </div>
        </div>

        <!-- Activities -->
        <div class="ww-dna-category">
          <div class="ww-dna-cat-title">🏃 Activities</div>
          <div class="ww-dna-tags">
            ${MUSIC_DNA.activities.map(a => `
              <button class="ww-dna-tag" onclick="toggleDNATag(this, 'activity', '${a}')">${a}</button>
            `).join('')}
          </div>
        </div>

        <!-- Energy Slider -->
        <div class="ww-dna-category">
          <div class="ww-dna-cat-title">⚡ Energy Level</div>
          <div class="ww-slider-container">
            <span>Chill 😌</span>
            <input type="range" id="energySlider" min="1" max="10" value="7" class="ww-slider" oninput="updateDNAEnergy(this.value)">
            <span>🔥 Hype</span>
            <span class="ww-slider-val" id="energyVal">7/10</span>
          </div>
        </div>

        <!-- BPM Range -->
        <div class="ww-dna-category">
          <div class="ww-dna-cat-title">🥁 BPM Range</div>
          <div class="ww-slider-container">
            <span>60</span>
            <input type="range" id="bpmSlider" min="60" max="200" value="120" class="ww-slider" oninput="updateDNABPM(this.value)">
            <span>200</span>
            <span class="ww-slider-val" id="bpmVal">120 BPM</span>
          </div>
        </div>
      </div>

      <!-- Streaming Platform Integration -->
      <div class="ww-streaming-connect">
        <div class="ww-sc-title">🔗 Connect Streaming Platforms</div>
        <div class="ww-sc-platforms">
          ${[
            { name:'Spotify',     icon:'💚', color:'#1DB954', connected:false },
            { name:'Apple Music', icon:'🍎', color:'#fc3c44', connected:false },
            { name:'Tidal',       icon:'🌊', color:'#00bfff', connected:false },
            { name:'YouTube Music',icon:'▶️', color:'#ff0000', connected:false },
            { name:'SoundCloud',  icon:'🔶', color:'#ff5500', connected:false },
          ].map(p => `
            <div class="ww-sc-platform" style="border-color:${p.color}30">
              <span class="ww-sc-icon">${p.icon}</span>
              <span class="ww-sc-name">${p.name}</span>
              <button class="ww-sc-btn" style="background:${p.color}20;color:${p.color};border-color:${p.color}40"
                      onclick="connectStreamingPlatform('${p.name}')">
                ${p.connected ? '✅ Connected' : 'Connect'}
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- DNA Match Actions -->
      <div class="ww-dna-actions">
        <button class="ww-btn-primary" onclick="generateMusicDNA()">🧬 Generate My Music DNA Profile</button>
        <button class="ww-btn-secondary" onclick="findDNAMatches()">💛 Find My Music Soul Mates</button>
        <button class="ww-btn-secondary" onclick="discoverNewMusic()">🔭 Discover New Music</button>
      </div>

      <!-- DNA Visualization -->
      <div class="ww-dna-viz" id="wwDNAViz">
        <div class="ww-dna-helix">
          ${Array.from({length:12},(_,i)=>`
            <div class="ww-helix-node" style="animation-delay:${i*0.1}s">
              <div class="ww-helix-left" style="background:hsl(${i*30},70%,60%)"></div>
              <div class="ww-helix-right" style="background:hsl(${i*30+180},70%,60%)"></div>
            </div>
          `).join('')}
        </div>
        <div class="ww-dna-viz-label">Your Musical DNA Signature</div>
      </div>
    </div>
  `;
}

// ── EVENTS ────────────────────────────────────────────────────
function renderWWEvents() {
  return `
    <div class="ww-events-section">
      <div class="ww-section-header">
        <h3>🎪 Live Events & Concerts</h3>
        <p>Discover artist events worldwide. Buy tickets, RSVP, or watch live streams — all in one place.</p>
      </div>

      <!-- Event Type Filter -->
      <div class="ww-event-filters">
        ${['All','Concert','Festival','Livestream','Release Party','Meet & Greet'].map(f => `
          <button class="ww-filter-btn ${f==='All'?'active':''}" onclick="filterWWEvents('${f}')">${f}</button>
        `).join('')}
      </div>

      <!-- Featured Event -->
      <div class="ww-featured-event">
        <div class="ww-fe-badge">⭐ FEATURED EVENT</div>
        <div class="ww-fe-title">🎪 GOAT Connect Live Festival 2026</div>
        <div class="ww-fe-details">📍 State Farm Arena, Atlanta GA &nbsp;|&nbsp; 📅 March 15, 2026 &nbsp;|&nbsp; 🎤 50+ Artists</div>
        <div class="ww-fe-progress">
          <div class="ww-fe-progress-bar" style="width:85%"></div>
        </div>
        <div class="ww-fe-tickets">2,840 / 20,000 tickets sold · From $45</div>
        <div class="ww-fe-actions">
          <button class="ww-btn-primary" onclick="buyEventTicket(1)">🎟️ Buy Tickets</button>
          <button class="ww-btn-secondary" onclick="shareEvent(1)">📤 Share</button>
          <button class="ww-btn-secondary" onclick="addEventCalendar(1)">📅 Add to Calendar</button>
        </div>
      </div>

      <!-- Events Grid -->
      <div class="ww-events-grid">
        ${DEMO_EVENTS.slice(1).map(evt => `
          <div class="ww-event-card ${evt.type}">
            <div class="ww-evt-icon">${evt.icon}</div>
            <div class="ww-evt-info">
              <div class="ww-evt-title">${evt.title}</div>
              <div class="ww-evt-artist">${evt.artist}</div>
              <div class="ww-evt-date">📅 ${evt.date}</div>
              <div class="ww-evt-venue">📍 ${evt.venue}</div>
              <div class="ww-evt-price" style="color:#f59e0b">💰 ${evt.price}</div>
              <div class="ww-evt-capacity">
                <div class="ww-evt-cap-bar">
                  <div class="ww-evt-cap-fill" style="width:${Math.round(evt.tickets/evt.capacity*100)}%"></div>
                </div>
                <span>${evt.tickets.toLocaleString()} / ${evt.capacity.toLocaleString()}</span>
              </div>
            </div>
            <div class="ww-evt-actions">
              <button class="ww-btn-primary ww-btn-sm" onclick="buyEventTicket(${evt.id})">
                ${evt.type==='livestream'?'🔴 Watch':'🎟️ Ticket'}
              </button>
              <button class="ww-btn-xs" onclick="addEventCalendar(${evt.id})">📅</button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Create Event (Artists) -->
      <div class="ww-create-event">
        <div class="ww-ce-title">🎤 Host Your Own Event</div>
        <div class="ww-ce-grid">
          ${[
            { icon:'🎙️', label:'Live Stream',     desc:'Go live to all your fans instantly' },
            { icon:'🎪', label:'Create Event',    desc:'Concert, festival, meet & greet' },
            { icon:'🎧', label:'DJ Set',          desc:'Virtual DJ session with tips' },
            { icon:'🎓', label:'Masterclass',     desc:'Teach your craft, earn revenue' },
          ].map(t => `
            <div class="ww-ce-card" onclick="createWWEvent('${t.label}')">
              <div class="ww-ce-icon">${t.icon}</div>
              <div class="ww-ce-label">${t.label}</div>
              <div class="ww-ce-desc">${t.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ── ANALYTICS DASHBOARD ───────────────────────────────────────
function renderWWAnalytics() {
  const d = ANALYTICS_DATA;
  return `
    <div class="ww-analytics-section">
      <div class="ww-section-header">
        <h3>📊 Artist Analytics Dashboard</h3>
        <div class="ww-analytics-range">
          ${['24h','7d','30d','90d','1y','All'].map(r => `
            <button class="ww-range-btn ${wwState.analyticsRange===r?'active':''}" onclick="setAnalyticsRange('${r}')">${r}</button>
          `).join('')}
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="ww-kpi-grid">
        <div class="ww-kpi-card streams">
          <div class="ww-kpi-icon">🎵</div>
          <div class="ww-kpi-val">${d.streams.month.toLocaleString()}</div>
          <div class="ww-kpi-label">Monthly Streams</div>
          <div class="ww-kpi-growth" style="color:#22c55e">${d.streams.growth} ↑</div>
          <div class="ww-kpi-sub">Total: ${(d.streams.total/1000000).toFixed(1)}M</div>
        </div>
        <div class="ww-kpi-card fans">
          <div class="ww-kpi-icon">👥</div>
          <div class="ww-kpi-val">${d.fans.month.toLocaleString()}</div>
          <div class="ww-kpi-label">New Fans/Month</div>
          <div class="ww-kpi-growth" style="color:#22c55e">${d.fans.growth} ↑</div>
          <div class="ww-kpi-sub">Total: ${(d.fans.total/1000).toFixed(0)}K</div>
        </div>
        <div class="ww-kpi-card revenue">
          <div class="ww-kpi-icon">💰</div>
          <div class="ww-kpi-val">$${d.revenue.month.toLocaleString()}</div>
          <div class="ww-kpi-label">Monthly Revenue</div>
          <div class="ww-kpi-growth" style="color:#22c55e">${d.revenue.growth} ↑</div>
          <div class="ww-kpi-sub">Total: $${(d.revenue.total/1000).toFixed(0)}K</div>
        </div>
        <div class="ww-kpi-card matches">
          <div class="ww-kpi-icon">💛</div>
          <div class="ww-kpi-val">${d.matches.month.toLocaleString()}</div>
          <div class="ww-kpi-label">Fan Matches</div>
          <div class="ww-kpi-growth" style="color:#22c55e">${d.matches.growth} ↑</div>
          <div class="ww-kpi-sub">Total: ${(d.matches.total/1000).toFixed(0)}K</div>
        </div>
      </div>

      <!-- Hourly Stream Chart (CSS bars) -->
      <div class="ww-chart-section">
        <div class="ww-chart-title">📈 Hourly Stream Activity (Today)</div>
        <div class="ww-bar-chart">
          ${d.hourlyStreams.map((val,i) => `
            <div class="ww-bar-col">
              <div class="ww-bar" style="height:${Math.round(val/840*100)}%" title="${val} streams"></div>
              <div class="ww-bar-label">${i}h</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Platform & Genre Breakdown -->
      <div class="ww-breakdown-grid">
        <div class="ww-breakdown-card">
          <div class="ww-bd-title">🎵 Top Platforms</div>
          ${d.platforms.map(([name,pct]) => `
            <div class="ww-bd-row">
              <span class="ww-bd-name">${name}</span>
              <div class="ww-bd-bar-wrap">
                <div class="ww-bd-bar" style="width:${pct}%"></div>
              </div>
              <span class="ww-bd-pct">${pct}%</span>
            </div>
          `).join('')}
        </div>
        <div class="ww-breakdown-card">
          <div class="ww-bd-title">🎸 Top Genres (Your Listeners)</div>
          ${d.topGenres.map(([name,pct]) => `
            <div class="ww-bd-row">
              <span class="ww-bd-name">${name}</span>
              <div class="ww-bd-bar-wrap">
                <div class="ww-bd-bar genre" style="width:${pct}%"></div>
              </div>
              <span class="ww-bd-pct">${pct}%</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Top Cities -->
      <div class="ww-cities-section">
        <div class="ww-cities-title">📍 Top Cities</div>
        <div class="ww-cities-grid">
          ${d.topCities.map(([city,pct],i) => `
            <div class="ww-city-card">
              <span class="ww-city-rank">#${i+1}</span>
              <span class="ww-city-name">${city}</span>
              <div class="ww-city-bar-wrap">
                <div class="ww-city-bar" style="width:${pct/32*100}%"></div>
              </div>
              <span class="ww-city-pct">${pct}%</span>
            </div>
          `).join('')}
        </div>
      </div>

      <button class="ww-btn-primary" onclick="generateAnalyticsReport()">
        🤖 Generate Full AI Analytics Report
      </button>
    </div>
  `;
}

// ── LEADERBOARDS ──────────────────────────────────────────────
function renderWWLeaderboard() {
  return `
    <div class="ww-leaderboard-section">
      <div class="ww-section-header">
        <h3>🏆 GOAT Leaderboards</h3>
        <p>Rankings updated every hour. Based on streams, fan engagement, match scores, and platform activity.</p>
      </div>

      <!-- Top 3 Podium -->
      <div class="ww-podium">
        <div class="ww-podium-place second">
          <div class="ww-podium-avatar">${DEMO_LEADERBOARD.artists[1].badge}</div>
          <div class="ww-podium-name">${DEMO_LEADERBOARD.artists[1].name}</div>
          <div class="ww-podium-score">${DEMO_LEADERBOARD.artists[1].score.toLocaleString()}</div>
          <div class="ww-podium-block" style="height:80px;background:rgba(148,163,184,0.3)">🥈</div>
        </div>
        <div class="ww-podium-place first">
          <div class="ww-podium-crown">👑</div>
          <div class="ww-podium-avatar">${DEMO_LEADERBOARD.artists[0].badge}</div>
          <div class="ww-podium-name">${DEMO_LEADERBOARD.artists[0].name}</div>
          <div class="ww-podium-score">${DEMO_LEADERBOARD.artists[0].score.toLocaleString()}</div>
          <div class="ww-podium-block" style="height:110px;background:rgba(245,158,11,0.3)">🥇</div>
        </div>
        <div class="ww-podium-place third">
          <div class="ww-podium-avatar">${DEMO_LEADERBOARD.artists[2].badge}</div>
          <div class="ww-podium-name">${DEMO_LEADERBOARD.artists[2].name}</div>
          <div class="ww-podium-score">${DEMO_LEADERBOARD.artists[2].score.toLocaleString()}</div>
          <div class="ww-podium-block" style="height:60px;background:rgba(205,127,50,0.3)">🥉</div>
        </div>
      </div>

      <!-- Full Rankings Table -->
      <div class="ww-rankings-table">
        <div class="ww-table-header">
          <span>Rank</span><span>Artist</span><span>Genre</span><span>Fans</span><span>Streams</span><span>Score</span><span>Change</span>
        </div>
        ${DEMO_LEADERBOARD.artists.map(a => `
          <div class="ww-table-row ${a.rank<=3?'top3':''}">
            <span class="ww-rank">${a.badge}</span>
            <span class="ww-artist-cell">
              <span class="ww-artist-name">${a.name}</span>
              ${a.verified?'<span class="ww-verified">✓</span>':''}
              <span class="ww-artist-handle">${a.handle}</span>
            </span>
            <span class="ww-genre-tag">${a.genre}</span>
            <span>${a.fans}</span>
            <span>${a.streams}</span>
            <span class="ww-score">${a.score.toLocaleString()}</span>
            <span class="ww-change" style="color:${a.change.startsWith('+')?'#22c55e':a.change==='0'?'#94a3b8':'#ef4444'}">${a.change}</span>
          </div>
        `).join('')}
      </div>

      <!-- Fan Leaderboard -->
      <div class="ww-fan-leaderboard">
        <div class="ww-fl-title">👥 Top Fans This Month</div>
        ${DEMO_LEADERBOARD.fans.map(f => `
          <div class="ww-fan-row">
            <span>${f.badge}</span>
            <span class="ww-fan-name">${f.name}</span>
            <span class="ww-fan-activity">${f.activity}</span>
            <span class="ww-fan-score">${f.score.toLocaleString()} pts</span>
          </div>
        `).join('')}
      </div>

      <button class="ww-btn-primary" onclick="claimLeaderboardSpot()">
        🚀 Boost My Ranking with AI Strategy
      </button>
    </div>
  `;
}

// ── FAN CLUBS ─────────────────────────────────────────────────
function renderWWFanClubs() {
  const clubs = [
    { id:1, artist:'DJ Speedy',    icon:'🎧', members:12400, tier:'Gold',     perks:['Early access','Discord VIP','Monthly 1-on-1','Unreleased tracks','Merch discounts'], price:'$9.99/mo',  color:'#f59e0b' },
    { id:2, artist:'Luna Star',    icon:'⭐', members:8920,  tier:'Silver',   perks:['Early access','Discord VIP','Quarterly 1-on-1','Merch discounts'], price:'$4.99/mo', color:'#94a3b8' },
    { id:3, artist:'Beat King',    icon:'👑', members:7340,  tier:'Platinum', perks:['ALL Gold perks','Studio sessions','Co-writing credits','Revenue share','NFT drops'], price:'$24.99/mo', color:'#8b5cf6' },
    { id:4, artist:'The Composer', icon:'🎼', members:5210,  tier:'Free',     perks:['Newsletter','Public feed access','Event announcements'], price:'Free', color:'#22c55e' },
  ];
  return `
    <div class="ww-fanclubs-section">
      <div class="ww-section-header">
        <h3>👥 Fan Clubs</h3>
        <p>Join exclusive artist fan clubs for behind-the-scenes access, early releases, direct artist contact, and more.</p>
      </div>

      <div class="ww-clubs-grid">
        ${clubs.map(club => `
          <div class="ww-club-card" style="border-color:${club.color}40">
            <div class="ww-club-header" style="background:${club.color}15">
              <div class="ww-club-icon">${club.icon}</div>
              <div>
                <div class="ww-club-artist">${club.artist}</div>
                <div class="ww-club-tier" style="color:${club.color}">${club.tier} Club</div>
              </div>
              <div class="ww-club-price" style="color:${club.color}">${club.price}</div>
            </div>
            <div class="ww-club-members">👥 ${club.members.toLocaleString()} members</div>
            <div class="ww-club-perks">
              ${club.perks.map(p => `<div class="ww-perk">✅ ${p}</div>`).join('')}
            </div>
            <button class="ww-btn-primary ww-btn-sm" style="background:${club.color}"
                    onclick="joinFanClub(${club.id})">
              Join ${club.tier} Club
            </button>
          </div>
        `).join('')}
      </div>

      <!-- Create Fan Club (Artists) -->
      <div class="ww-create-club">
        <div class="ww-cc-title">🎤 Create Your Fan Club</div>
        <div class="ww-cc-tiers">
          ${[
            { tier:'Free',     icon:'🆓', desc:'Unlimited followers, public posts, newsletter' },
            { tier:'Silver',   icon:'🥈', desc:'$2.99–$9.99/mo — Early access, Discord, merch' },
            { tier:'Gold',     icon:'🥇', desc:'$9.99–$19.99/mo — 1-on-1s, unreleased music' },
            { tier:'Platinum', icon:'💎', desc:'$19.99–$49.99/mo — Studio sessions, co-write' },
          ].map(t => `
            <div class="ww-cc-tier-card" onclick="createFanClubTier('${t.tier}')">
              <span class="ww-cc-icon">${t.icon}</span>
              <div class="ww-cc-info">
                <div class="ww-cc-tier">${t.tier}</div>
                <div class="ww-cc-desc">${t.desc}</div>
              </div>
              <button class="ww-btn-xs">Setup →</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ── DISCOVERY ─────────────────────────────────────────────────
function renderWWDiscovery() {
  const artists = [
    { name:'Afro Wave',    genre:'Afrobeats',  fans:'65K', emoji:'🌍', trending:true,  new:false, match:94 },
    { name:'Neo Trap',     genre:'Drill',      fans:'54K', emoji:'🎯', trending:true,  new:false, match:87 },
    { name:'Jazz Queen',   genre:'Jazz/Soul',  fans:'43K', emoji:'🎷', trending:false, new:true,  match:91 },
    { name:'EDM Force',    genre:'EDM/House',  fans:'38K', emoji:'⚡', trending:true,  new:false, match:78 },
    { name:'City Rap',     genre:'Hip-Hop',    fans:'28K', emoji:'🏙️', trending:false, new:true,  match:96 },
    { name:'Soul Vibes',   genre:'Soul/R&B',   fans:'32K', emoji:'💜', trending:false, new:false, match:89 },
    { name:'Indie Bloom',  genre:'Indie Pop',  fans:'21K', emoji:'🌸', trending:false, new:true,  match:82 },
    { name:'Gospel Fire',  genre:'Gospel',     fans:'18K', emoji:'🔥', trending:true,  new:false, match:85 },
  ];
  return `
    <div class="ww-discovery-section">
      <div class="ww-section-header">
        <h3>🔭 Artist Discovery</h3>
        <p>AI-powered discovery engine finds artists that match your music DNA, location, and connection goals.</p>
      </div>

      <!-- Discovery Filters -->
      <div class="ww-discovery-filters">
        <select class="ww-disc-select" onchange="filterDiscovery('genre', this.value)">
          <option value="">All Genres</option>
          ${MUSIC_DNA.genres.map(g=>`<option>${g}</option>`).join('')}
        </select>
        <select class="ww-disc-select" onchange="filterDiscovery('region', this.value)">
          <option value="">All Regions</option>
          ${REGIONS.slice(1).map(r=>`<option value="${r.id}">${r.flag} ${r.label}</option>`).join('')}
        </select>
        <button class="ww-filter-btn active" onclick="filterDiscovery('type','trending')">🔥 Trending</button>
        <button class="ww-filter-btn" onclick="filterDiscovery('type','new')">✨ New</button>
        <button class="ww-filter-btn" onclick="filterDiscovery('type','match')">💛 Top Match</button>
      </div>

      <!-- Artist Cards -->
      <div class="ww-discovery-grid">
        ${artists.map(a => `
          <div class="ww-artist-disc-card">
            <div class="ww-adc-header">
              <div class="ww-adc-avatar">${a.emoji}</div>
              <div>
                ${a.trending ? '<span class="ww-adc-badge trending">🔥 Trending</span>' : ''}
                ${a.new ? '<span class="ww-adc-badge new">✨ New</span>' : ''}
              </div>
            </div>
            <div class="ww-adc-name">${a.name}</div>
            <div class="ww-adc-genre">${a.genre}</div>
            <div class="ww-adc-fans">👥 ${a.fans} fans</div>
            <div class="ww-adc-match">
              <span>💛 DNA Match</span>
              <div class="ww-adc-match-bar">
                <div class="ww-adc-match-fill" style="width:${a.match}%;background:${a.match>=90?'#22c55e':a.match>=80?'#f59e0b':'#3b82f6'}"></div>
              </div>
              <span style="color:${a.match>=90?'#22c55e':a.match>=80?'#f59e0b':'#3b82f6'}">${a.match}%</span>
            </div>
            <div class="ww-adc-actions">
              <button class="ww-btn-primary ww-btn-xs" onclick="connectArtist('${a.name}')">💛 Connect</button>
              <button class="ww-btn-xs" onclick="followArtist('${a.name}')">+ Follow</button>
              <button class="ww-btn-xs" onclick="listenArtist('${a.name}')">▶️ Listen</button>
            </div>
          </div>
        `).join('')}
      </div>

      <button class="ww-btn-primary" onclick="aiDiscoverArtists()">
        🤖 AI — Find My Perfect Artist Matches
      </button>
    </div>
  `;
}

// ── ACTION FUNCTIONS ──────────────────────────────────────────
function setWWTab(tab) {
  wwState.activeTab = tab;
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderWorldwidePlatform(panel);
}
function setWWRegion(region) {
  wwState.selectedRegion = region;
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderWorldwidePlatform(panel);
}
function setAnalyticsRange(range) {
  wwState.analyticsRange = range;
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderWorldwidePlatform(panel);
}
function toggleDNATag(btn, cat, val) {
  btn.classList.toggle('active');
}
function updateDNAEnergy(v) { const el = document.getElementById('energyVal'); if(el) el.textContent = v+'/10'; }
function updateDNABPM(v)    { const el = document.getElementById('bpmVal');    if(el) el.textContent = v+' BPM'; }
function generateMusicDNA() { sendWWToChat('Generate a detailed Music DNA profile and artist/fan matching algorithm based on: Hip-Hop, R&B, Trap, Hype energy, 120-140 BPM, 2020s era, workout and driving activities. Include compatibility scoring and recommended artists.'); }
function findDNAMatches()   { sendWWToChat('Find my top 10 Music DNA soul mate matches. Explain why each match is compatible based on genre, mood, energy, BPM, and listening patterns. Format as a ranked list with match scores.'); }
function discoverNewMusic() { sendWWToChat('Discover 10 new artists I should listen to based on my Music DNA profile (Hip-Hop/R&B/Trap, high energy, 120-140 BPM). Include emerging artists not yet mainstream.'); }
function generateWWAIInsights() { sendWWToChat(`Generate detailed market insights for ${REGIONS.find(r=>r.id===wwState.selectedRegion)?.label} music market: growth trends, top genres, monetization opportunities, and strategic recommendations for independent artists.`); }
function generateAnalyticsReport() { sendWWToChat('Generate a comprehensive analytics report based on: 342K monthly streams (+23%), 8,940 new fans (+18%), $8,420 revenue (+31%), top cities: Atlanta, NYC, LA. Include actionable insights, growth strategies, and 90-day projections.'); }
function claimLeaderboardSpot() { sendWWToChat('Create a 30-day AI-powered strategy to climb the GOAT Leaderboard rankings. Include daily content schedule, engagement tactics, collaboration opportunities, and platform optimization.'); }
function aiDiscoverArtists() { sendWWToChat('Find my top 10 artist connections on GOAT Connect based on Music DNA compatibility (Hip-Hop/R&B/Trap). For each artist, explain the collaboration potential and how to make first contact.'); }
function connectStreamingPlatform(name) { showWWAlert(`🔗 Connecting to ${name}... OAuth flow would open here in production.`, 'info'); }
function likePost(id) { showWWAlert('❤️ Liked!', 'success'); }
function commentPost(id) { showWWAlert('💬 Comment feature — opens reply modal in production.', 'info'); }
function sharePost(id) { showWWAlert('🔄 Post shared to your feed!', 'success'); }
function tipArtist(id) { showWWAlert('💛 Tip sent! The artist will be notified.', 'success'); }
function joinLiveStream(id) { showWWAlert('🔴 Joining live stream... Would open in full-screen video player.', 'info'); }
function createWWPost() { showWWAlert('✍️ Create Post — Opens rich editor with photo/video/audio upload.', 'info'); }
function addWWStory() { showWWAlert('📸 Add Story — Opens camera/upload interface.', 'info'); }
function viewWWStory(i) { showWWAlert(`👁️ Viewing story ${i+1}...`, 'info'); }
function buyEventTicket(id) { showWWAlert(`🎟️ Opening ticket purchase for event #${id}... Stripe checkout in production.`, 'info'); }
function shareEvent(id) { showWWAlert('📤 Event link copied!', 'success'); }
function addEventCalendar(id) { showWWAlert('📅 Added to calendar!', 'success'); }
function createWWEvent(type) { showWWAlert(`🎤 Creating ${type}... Full event creation wizard opens here.`, 'info'); }
function joinFanClub(id) { showWWAlert(`💛 Joining fan club #${id}... Payment flow opens in production.`, 'info'); }
function createFanClubTier(tier) { showWWAlert(`🎤 Setting up ${tier} fan club tier...`, 'info'); }
function connectArtist(name) { showWWAlert(`💛 Connection request sent to ${name}!`, 'success'); }
function followArtist(name) { showWWAlert(`✅ Following ${name}!`, 'success'); }
function listenArtist(name) { showWWAlert(`▶️ Opening ${name}'s music...`, 'info'); }
function filterWWFeed(f) { showWWAlert(`📱 Filtering feed: ${f}`, 'info'); }
function filterWWEvents(f) { showWWAlert(`🎪 Filtering events: ${f}`, 'info'); }
function filterDiscovery(t, v) { showWWAlert(`🔭 Filtering by ${t}: ${v}`, 'info'); }

function sendWWToChat(msg) {
  const input = document.getElementById('message-input');
  if (input) { input.value = msg; input.focus(); showWWAlert('💬 Message loaded — press Send!', 'success'); }
  else { navigator.clipboard.writeText(msg); showWWAlert('📋 Copied to clipboard!', 'info'); }
}
function showWWAlert(msg, type='info') {
  const colors = { info:'#3b82f6', success:'#22c55e', warning:'#f59e0b', error:'#ef4444' };
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;background:${colors[type]};color:#fff;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,0.4);max-width:400px;animation:slideInRight 0.3s ease;`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 4000);
}

// ── EXPORTS ───────────────────────────────────────────────────
window.renderWorldwidePlatform = renderWorldwidePlatform;
window.setWWTab = setWWTab;
window.setWWRegion = setWWRegion;
window.setAnalyticsRange = setAnalyticsRange;
window.toggleDNATag = toggleDNATag;
window.updateDNAEnergy = updateDNAEnergy;
window.updateDNABPM = updateDNABPM;
window.generateMusicDNA = generateMusicDNA;
window.findDNAMatches = findDNAMatches;
window.discoverNewMusic = discoverNewMusic;
window.generateWWAIInsights = generateWWAIInsights;
window.generateAnalyticsReport = generateAnalyticsReport;
window.claimLeaderboardSpot = claimLeaderboardSpot;
window.aiDiscoverArtists = aiDiscoverArtists;
window.connectStreamingPlatform = connectStreamingPlatform;
window.likePost = likePost; window.commentPost = commentPost;
window.sharePost = sharePost; window.tipArtist = tipArtist;
window.joinLiveStream = joinLiveStream; window.createWWPost = createWWPost;
window.addWWStory = addWWStory; window.viewWWStory = viewWWStory;
window.buyEventTicket = buyEventTicket; window.shareEvent = shareEvent;
window.addEventCalendar = addEventCalendar; window.createWWEvent = createWWEvent;
window.joinFanClub = joinFanClub; window.createFanClubTier = createFanClubTier;
window.connectArtist = connectArtist; window.followArtist = followArtist;
window.listenArtist = listenArtist;
window.filterWWFeed = filterWWFeed; window.filterWWEvents = filterWWEvents;
window.filterDiscovery = filterDiscovery;