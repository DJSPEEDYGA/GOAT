// ═══════════════════════════════════════════════════════════════════════════════
// GOAT Script Studio — Hollywood Movie & TV Screenwriting Engine
// Final Draft-Level Formatting • AI Story Engine • Legendary Writer Styles
// Beat Board • Scene Generator • Production Tools • 126 Years of Cinema
// ═══════════════════════════════════════════════════════════════════════════════

const ssState = {
  activeTab: 'writer',
  scriptFormat: 'feature_film',
  currentGenre: 'drama',
  selectedWriter: null,
  currentScript: { title: 'Untitled Script', author: 'DJ Speedy', logline: '', scenes: [], currentScene: 0 },
  beatBoard: [],
  writerStyle: null,
  sprintActive: false,
  sprintTime: 0,
  wordCount: 0,
  pageCount: 0,
  darkMode: true,
  focusMode: false
};

// ── Legendary Writers Database — 126 Years of Cinema (1900–2026) ─────────────
const LEGENDARY_WRITERS = [
  // Golden Age (1900–1960)
  { name: 'Billy Wilder', era: 'golden', years: '1929–1981', icon: '🎩', style: 'Razor-sharp wit, sophisticated dialogue, cynical romanticism, twist endings', masterworks: ['Sunset Boulevard','Some Like It Hot','The Apartment','Double Indemnity','Stalag 17'], oscars: 6, technique: 'Wilder layered dark subtext beneath comedic surfaces. His dialogue crackles with intelligence — every line reveals character while advancing plot. He pioneered the unreliable narrator and meta-storytelling.', color: '#f59e0b' },
  { name: 'Dalton Trumbo', era: 'golden', years: '1936–1973', icon: '✊', style: 'Poetic defiance, humanist prose, political courage, soaring monologues', masterworks: ['Roman Holiday','Spartacus','Exodus','Johnny Got His Gun','Papillon'], oscars: 2, technique: 'Trumbo wrote with moral fury and lyrical beauty. His monologues build like symphonies — quiet beginnings that crescendo into devastating emotional peaks. Blacklisted but unbreakable.', color: '#ef4444' },
  { name: 'Herman J. Mankiewicz', era: 'golden', years: '1926–1953', icon: '🥃', style: 'Baroque structure, newspaper wit, non-linear storytelling, character excavation', masterworks: ['Citizen Kane','Pride of the Yankees','The Wizard of Oz (uncredited)','Dinner at Eight'], oscars: 1, technique: 'Mank pioneered non-linear narrative cinema with Citizen Kane. He used investigative structure — peeling back layers of a life through multiple perspectives. Dialogue was weaponized wit.', color: '#8b5cf6' },
  { name: 'Ben Hecht', era: 'golden', years: '1927–1964', icon: '📰', style: 'Machine-gun dialogue, streetwise cynicism, rapid-fire scenes, genre mastery', masterworks: ['The Front Page','Scarface','Notorious','His Girl Friday','Wuthering Heights'], oscars: 2, technique: 'Hecht was Hollywood\'s highest-paid script doctor. His dialogue is the fastest in classic cinema — overlapping, interrupting, breathless. He could write any genre and make it sing.', color: '#0ea5e9' },

  // New Hollywood (1960–1985)
  { name: 'Paddy Chayefsky', era: 'new_hollywood', years: '1953–1981', icon: '📺', style: 'Prophetic satire, controlled fury, naturalistic dialogue, media criticism', masterworks: ['Network','Marty','The Hospital','Altered States'], oscars: 3, technique: 'Chayefsky predicted the future of media with terrifying accuracy. His dialogue in Network reads like prophecy. He wrote speeches that characters deliver as if possessed — Howard Beale was his mouthpiece for institutional rage.', color: '#ef4444' },
  { name: 'William Goldman', era: 'new_hollywood', years: '1965–2003', icon: '⚔️', style: 'Self-aware wit, adventure storytelling, structural perfection, Hollywood meta-commentary', masterworks: ['Butch Cassidy and the Sundance Kid','All the President\'s Men','The Princess Bride','Marathon Man','Misery'], oscars: 2, technique: 'Goldman\'s cardinal rule: "Nobody knows anything." His scripts are structurally flawless — he knew exactly when to withhold information for maximum suspense. The Princess Bride is a masterclass in layered storytelling.', color: '#22c55e' },
  { name: 'Robert Towne', era: 'new_hollywood', years: '1967–2006', icon: '🔍', style: 'Neo-noir precision, subterranean themes, Los Angeles mythology, moral complexity', masterworks: ['Chinatown','Shampoo','The Last Detail','Mission: Impossible','Personal Best'], oscars: 1, technique: 'Towne wrote the greatest original screenplay in history with Chinatown. His technique: bury the real story beneath the surface investigation. The audience discovers the horror alongside the protagonist. LA is always a character.', color: '#f59e0b' },
  { name: 'Francis Ford Coppola', era: 'new_hollywood', years: '1966–2024', icon: '🎭', style: 'Epic family sagas, operatic structure, Shakespearean scope, immigrant America', masterworks: ['The Godfather','The Godfather Part II','Apocalypse Now','The Conversation','Patton'], oscars: 5, technique: 'Coppola adapted Puzo\'s novel into American Shakespeare. His technique intercuts intimate family moments with brutal violence — the baptism sequence is the most famous parallel editing in cinema history.', color: '#c2773a' },

  // Modern Masters (1985–2010)
  { name: 'Quentin Tarantino', era: 'modern', years: '1992–2024', icon: '🩸', style: 'Non-linear timelines, pop culture dialogue, genre remixing, extended tension scenes', masterworks: ['Pulp Fiction','Reservoir Dogs','Kill Bill','Inglourious Basterds','Django Unchained','Once Upon a Time in Hollywood'], oscars: 2, technique: 'Tarantino writes the most quotable dialogue in cinema. His technique: let characters talk about seemingly mundane topics to build character, then shatter it with explosive violence. Non-linear structure creates dramatic irony.', color: '#ef4444' },
  { name: 'Aaron Sorkin', era: 'modern', years: '1989–2024', icon: '🏛️', style: 'Walk-and-talk velocity, idealistic rhetoric, rapid-fire exchanges, institutional drama', masterworks: ['The Social Network','A Few Good Men','The West Wing','Steve Jobs','Moneyball','The Trial of the Chicago 7'], oscars: 1, technique: 'Sorkin\'s dialogue is a musical instrument — rhythm, cadence, repetition, and crescendo. Characters don\'t just talk, they perform verbal jazz. His walk-and-talk technique creates momentum that never stops.', color: '#0ea5e9' },
  { name: 'Charlie Kaufman', era: 'modern', years: '1999–2020', icon: '🧠', style: 'Meta-narrative, existential anxiety, identity dissolution, fourth-wall destruction', masterworks: ['Being John Malkovich','Eternal Sunshine of the Spotless Mind','Adaptation','Synecdoche, New York','I\'m Thinking of Ending Things'], oscars: 1, technique: 'Kaufman writes scripts that are about the impossibility of writing scripts. His meta-layers fold in on themselves like Escher paintings. He externalizes internal psychological states into literal plot mechanics.', color: '#8b5cf6' },
  { name: 'Joel & Ethan Coen', era: 'modern', years: '1984–2024', icon: '🎰', style: 'Dark absurdism, regional dialects, crime-gone-wrong, philosophical villains', masterworks: ['No Country for Old Men','Fargo','The Big Lebowski','True Grit','Barton Fink','Blood Simple'], oscars: 4, technique: 'The Coens write villains who are philosophical forces of nature (Chigurh, Malvo). Their dialogue captures regional speech patterns with uncanny precision. Humor and horror coexist in every scene.', color: '#22c55e' },
  { name: 'Nora Ephron', era: 'modern', years: '1983–2012', icon: '💕', style: 'Romantic intelligence, food as metaphor, New York love letters, feminist comedy', masterworks: ['When Harry Met Sally','Sleepless in Seattle','You\'ve Got Mail','Silkwood','Julie & Julia'], oscars: 0, technique: 'Ephron wrote romantic comedies that respected women\'s intelligence. Her technique: let characters argue their way into love. Food, books, and New York were her love languages. The orgasm scene in Harry/Sally broke every rule.', color: '#ec4899' },

  // Contemporary Visionaries (2010–2026)
  { name: 'Jordan Peele', era: 'contemporary', years: '2017–2024', icon: '🔮', style: 'Social horror, metaphor-as-monster, Black experience, genre subversion', masterworks: ['Get Out','Us','Nope','Key & Peele'], oscars: 1, technique: 'Peele weaponized horror as social commentary. Get Out\'s "Sunken Place" is a metaphor that became cultural vocabulary. He embeds racial critique inside genre thrills so audiences feel the horror of systemic oppression viscerally.', color: '#6366f1' },
  { name: 'Greta Gerwig', era: 'contemporary', years: '2012–2025', icon: '🎀', style: 'Feminist reclamation, literary adaptation, emotional authenticity, cultural zeitgeist', masterworks: ['Lady Bird','Little Women','Barbie','Frances Ha','Mistress America'], oscars: 0, technique: 'Gerwig writes from lived female experience with zero sentimentality. Her technique: place female protagonists in recognizable emotional situations but subvert expected outcomes. Barbie deconstructed capitalism through a toy.', color: '#ec4899' },
  { name: 'Bong Joon-ho', era: 'contemporary', years: '2000–2025', icon: '🏠', style: 'Class warfare, tonal genre-shifting, spatial storytelling, Korean New Wave', masterworks: ['Parasite','Memories of Murder','Snowpiercer','The Host','Mother','Mickey 17'], oscars: 4, technique: 'Bong uses physical architecture as class metaphor — basements vs penthouses, train cars, underground bunkers. His scripts shift genre mid-scene: comedy becomes horror becomes tragedy. Parasite is the perfect screenplay.', color: '#f59e0b' },
  { name: 'Ryan Coogler', era: 'contemporary', years: '2013–2025', icon: '👑', style: 'Afrofuturism, ancestral legacy, social justice through spectacle, cultural pride', masterworks: ['Black Panther','Fruitvale Station','Creed','Black Panther: Wakanda Forever'], oscars: 0, technique: 'Coogler writes blockbusters with the soul of indie dramas. He grounds superhero spectacle in real grief, real politics, real community. Killmonger\'s final monologue is the most powerful villain speech in the MCU.', color: '#8b5cf6' },
  { name: 'Emerald Fennell', era: 'contemporary', years: '2020–2025', icon: '🔪', style: 'Revenge elegance, toxic privilege, candy-coated violence, feminist rage', masterworks: ['Promising Young Woman','Saltburn','Killing Eve (writer)'], oscars: 1, technique: 'Fennell disguises fury as beauty. Her scripts look gorgeous and feel dangerous — Saltburn is a class-war fairy tale filmed like a perfume ad. She weaponizes audience expectations, making you complicit in the horror.', color: '#ef4444' },

  // Television Titans
  { name: 'Vince Gilligan', era: 'tv_titan', years: '1993–2024', icon: '⚗️', style: 'Slow-burn transformation, moral descent, visual storytelling, desert mythology', masterworks: ['Breaking Bad','Better Call Saul','El Camino','The X-Files'], oscars: 0, technique: 'Gilligan wrote the greatest character arc in TV history — Mr. Chips to Scarface. His technique: ultra-slow moral erosion where each compromise seems reasonable in isolation but devastating in aggregate. Cold opens are mini-movies.', color: '#22c55e' },
  { name: 'Shonda Rhimes', era: 'tv_titan', years: '2005–2025', icon: '💉', style: 'Addictive cliffhangers, diverse ensemble, power fantasies, scandalous reveals', masterworks: ['Grey\'s Anatomy','Scandal','How to Get Away with Murder','Bridgerton','Inventing Anna'], oscars: 0, technique: 'Rhimes invented binge-TV before streaming existed. Her technique: end every act on a gasp, make every character equally capable of heroism and betrayal. She normalized diverse casting by never making it the point.', color: '#ec4899' },
  { name: 'David Chase', era: 'tv_titan', years: '1976–2025', icon: '🎲', style: 'Anti-hero psychology, dream sequences, ambiguous endings, New Jersey realism', masterworks: ['The Sopranos','The Many Saints of Newark','Not Fade Away'], oscars: 0, technique: 'Chase created the modern TV anti-hero with Tony Soprano. His technique: use dream sequences and therapy sessions to externalize unconscious drives. The cut-to-black ending rewired how we think about endings.', color: '#64748b' },
  { name: 'Phoebe Waller-Bridge', era: 'tv_titan', years: '2016–2025', icon: '🎭', style: 'Fourth-wall intimacy, grief comedy, sexual honesty, British razor wit', masterworks: ['Fleabag','Killing Eve','No Time to Die','Indiana Jones and the Dial of Destiny'], oscars: 0, technique: 'Waller-Bridge broke the fourth wall and broke our hearts simultaneously. Her technique: let the character confide in us, then reveal she\'s been lying — to us and to herself. The "kneel" scene in Fleabag S2 is devastating.', color: '#f59e0b' }
];

// ── Script Format Templates ──────────────────────────────────────────────────
const SCRIPT_FORMATS = {
  feature_film: { name: 'Feature Film', icon: '🎬', pages: '90–120 pages', acts: '3-Act Structure', time: '90–150 min', desc: 'Standard Hollywood screenplay format — the gold standard of cinema' },
  tv_pilot: { name: 'TV Pilot (1-Hr Drama)', icon: '📺', pages: '55–65 pages', acts: '5-Act + Teaser', time: '42–58 min', desc: 'Hour-long drama pilot — launch your series with a bang' },
  tv_half_hour: { name: 'TV Pilot (Half-Hour)', icon: '😂', pages: '25–35 pages', acts: '3-Act + Cold Open', time: '22–30 min', desc: 'Comedy/dramedy pilot — sitcom or single-cam format' },
  limited_series: { name: 'Limited Series Bible', icon: '📖', pages: '6–10 episodes', acts: 'Series Arc', time: '6–10 hrs', desc: 'Limited/mini-series format — complete story in one season' },
  short_film: { name: 'Short Film', icon: '🎞️', pages: '5–40 pages', acts: 'Flexible', time: '5–40 min', desc: 'Festival-ready short film — tight, impactful storytelling' },
  web_series: { name: 'Web Series Episode', icon: '💻', pages: '5–15 pages', acts: '2–3 Act', time: '5–15 min', desc: 'YouTube/streaming micro-content — punchy and shareable' },
  stage_play: { name: 'Stage Play', icon: '🎭', pages: '80–120 pages', acts: '1–3 Acts', time: '90–180 min', desc: 'Theater format — Samuel French/Dramatists Play Service style' },
  musical: { name: 'Musical', icon: '🎵', pages: '100–130 pages', acts: '2-Act + Overture', time: '120–180 min', desc: 'Musical theater/film — integrates lyrics, choreography notes, and transitions' },
  documentary: { name: 'Documentary Script', icon: '📹', pages: '30–90 pages', acts: 'Narrative Arc', time: '45–120 min', desc: 'Hybrid narration/interview format — story-driven documentary' },
  music_video: { name: 'Music Video Treatment', icon: '🎤', pages: '3–10 pages', acts: 'Visual Narrative', time: '3–6 min', desc: 'Visual treatment for music videos — performance + narrative concept' },
  video_game: { name: 'Video Game Narrative', icon: '🎮', pages: 'Variable', acts: 'Branching Paths', time: '10–100+ hrs', desc: 'Interactive narrative design — branching dialogue, quest lines, cutscenes' },
  podcast_drama: { name: 'Podcast Drama', icon: '🎧', pages: '20–40 pages', acts: '3-Act Audio', time: '20–45 min', desc: 'Audio-only drama — sound design cues, voice-only storytelling' }
};

// ── Genre Library ─────────────────────────────────────────────────────────────
const GENRES = [
  { id: 'drama', name: 'Drama', icon: '🎭', color: '#6366f1', subgenres: ['Family Drama','Legal Drama','Political Drama','Medical Drama','Period Drama','Social Realism','Character Study'] },
  { id: 'comedy', name: 'Comedy', icon: '😂', color: '#f59e0b', subgenres: ['Romantic Comedy','Dark Comedy','Satire','Slapstick','Buddy Comedy','Mockumentary','Workplace Comedy'] },
  { id: 'thriller', name: 'Thriller', icon: '😰', color: '#ef4444', subgenres: ['Psychological Thriller','Political Thriller','Legal Thriller','Erotic Thriller','Conspiracy Thriller','Survival Thriller'] },
  { id: 'horror', name: 'Horror', icon: '👻', color: '#7c3aed', subgenres: ['Slasher','Supernatural','Psychological Horror','Found Footage','Body Horror','Folk Horror','Social Horror'] },
  { id: 'scifi', name: 'Sci-Fi', icon: '🚀', color: '#0ea5e9', subgenres: ['Space Opera','Cyberpunk','Time Travel','Dystopian','Hard Sci-Fi','First Contact','AI/Robot'] },
  { id: 'action', name: 'Action', icon: '💥', color: '#e8530a', subgenres: ['Heist','Spy','Martial Arts','War','Disaster','Superhero','Chase'] },
  { id: 'crime', name: 'Crime', icon: '🔍', color: '#64748b', subgenres: ['Film Noir','Neo-Noir','True Crime','Gangster','Detective','Caper','Prison'] },
  { id: 'romance', name: 'Romance', icon: '💕', color: '#ec4899', subgenres: ['Period Romance','Contemporary Romance','Forbidden Love','Second Chance','Star-Crossed','LGBTQ+ Romance'] },
  { id: 'animation', name: 'Animation', icon: '🎨', color: '#22c55e', subgenres: ['Pixar-Style','Anime','Stop Motion','Adult Animation','Fantasy','Musical Animation'] },
  { id: 'western', name: 'Western', icon: '🤠', color: '#c2773a', subgenres: ['Classic Western','Revisionist','Spaghetti','Neo-Western','Acid Western','Space Western'] },
  { id: 'fantasy', name: 'Fantasy', icon: '🐉', color: '#8b5cf6', subgenres: ['High Fantasy','Urban Fantasy','Dark Fantasy','Fairy Tale','Mythological','Sword & Sorcery'] },
  { id: 'documentary', name: 'Documentary', icon: '📹', color: '#0d9488', subgenres: ['True Crime','Music Doc','Nature','Political','Sports','Biography','Essay Film'] },
  { id: 'musical', name: 'Musical', icon: '🎵', color: '#d946ef', subgenres: ['Jukebox Musical','Original Musical','Rock Musical','Hip-Hop Musical','Dance Film','Concert Film'] },
  { id: 'biopic', name: 'Biopic', icon: '📜', color: '#78716c', subgenres: ['Music Biopic','Political Biopic','Sports Biopic','Artist Biopic','Historical Figure','Unauthorized'] }
];

// ── Story Structure Templates ─────────────────────────────────────────────────
const STORY_STRUCTURES = [
  { id: 'three_act', name: '3-Act Structure', icon: '📐', desc: 'Setup → Confrontation → Resolution', beats: ['Opening Image','Theme Stated','Setup','Catalyst','Debate','Break Into Two','B Story','Fun & Games','Midpoint','Bad Guys Close In','All Is Lost','Dark Night of Soul','Break Into Three','Finale','Final Image'], source: 'Blake Snyder — Save the Cat!' },
  { id: 'heros_journey', name: "Hero's Journey", icon: '⚔️', desc: 'Mythological 12-stage transformation arc', beats: ['Ordinary World','Call to Adventure','Refusal of the Call','Meeting the Mentor','Crossing the Threshold','Tests, Allies, Enemies','Approach to the Inmost Cave','The Ordeal','Reward','The Road Back','Resurrection','Return with the Elixir'], source: 'Joseph Campbell — The Hero with a Thousand Faces' },
  { id: 'five_act', name: '5-Act Structure', icon: '🎭', desc: 'Exposition → Rising → Climax → Falling → Denouement', beats: ['Exposition','Inciting Incident','Rising Action','First Turning Point','Midpoint Escalation','Second Turning Point','Crisis','Climax','Falling Action','Resolution'], source: 'Gustav Freytag — Freytag\'s Pyramid' },
  { id: 'seven_point', name: '7-Point Structure', icon: '🎯', desc: 'Hook to Resolution in 7 precise beats', beats: ['Hook','Plot Turn 1','Pinch Point 1','Midpoint','Pinch Point 2','Plot Turn 2','Resolution'], source: 'Dan Wells — Story Structure' },
  { id: 'kishotenketsu', name: 'Kishōtenketsu', icon: '🏯', desc: 'Japanese 4-act structure — no conflict required', beats: ['Ki (Introduction)','Shō (Development)','Ten (Twist/Turn)','Ketsu (Conclusion/Reconciliation)'], source: 'East Asian Narrative Tradition' },
  { id: 'nonlinear', name: 'Non-Linear', icon: '🔀', desc: 'Fragmented timeline, multiple perspectives', beats: ['Cold Open (Future)','Jump to Past','First Timeline','Second Timeline','Convergence Point','Revelation Recontextualizes','True Chronology Revealed','Final Convergence'], source: 'Tarantino / Nolan / Iñárritu' },
  { id: 'bottle', name: 'Bottle Episode', icon: '🍾', desc: 'Single location, real-time tension', beats: ['Establish Location','Characters Trapped','Rising Tension','Secrets Revealed','Relationship Shifts','Breaking Point','Aftermath','New Normal'], source: 'The Breakfast Club / 12 Angry Men / Reservoir Dogs' }
];

// ── Script Element Formatting ─────────────────────────────────────────────────
const SCRIPT_ELEMENTS = {
  scene_heading: { label: 'Scene Heading (Slug)', shortcut: 'Ctrl+1', format: 'CAPS, left margin', example: 'INT. RECORDING STUDIO - NIGHT', desc: 'INT./EXT. LOCATION - TIME OF DAY' },
  action: { label: 'Action / Description', shortcut: 'Ctrl+2', format: 'Present tense, left margin', example: 'The bass drops. Three thousand fans SURGE forward, a wave of humanity crashing against the barricade.', desc: 'What we see and hear — present tense, active voice' },
  character: { label: 'Character Name', shortcut: 'Ctrl+3', format: 'CAPS, centered', example: 'DJ SPEEDY', desc: 'Character name before dialogue, always CAPS' },
  dialogue: { label: 'Dialogue', shortcut: 'Ctrl+4', format: 'Centered, 2.5" margins', example: "You think the music stops when the lights go out? Nah. That's when it really starts.", desc: 'What the character says' },
  parenthetical: { label: 'Parenthetical', shortcut: 'Ctrl+5', format: '(in parens), under character', example: '(leaning into the mic, eyes closed)', desc: 'Brief acting direction before dialogue' },
  transition: { label: 'Transition', shortcut: 'Ctrl+6', format: 'CAPS, right-aligned', example: 'SMASH CUT TO:', desc: 'CUT TO / DISSOLVE TO / SMASH CUT TO' },
  montage: { label: 'Montage', shortcut: 'Ctrl+7', format: 'MONTAGE header, lettered', example: 'MONTAGE — BUILDING THE BRAND\nA) Speedy in the studio, headphones on.\nB) Flyers being posted on telephone poles.', desc: 'Series of quick scenes showing passage of time' },
  vo_os: { label: 'V.O. / O.S.', shortcut: 'Ctrl+8', format: 'After character name', example: 'DJ SPEEDY (V.O.)\nEvery legend has a first night.', desc: 'Voice Over or Off Screen dialogue' }
};

// ── Beat Board Presets ────────────────────────────────────────────────────────
const BEAT_BOARD_COLORS = [
  '#ef4444','#f59e0b','#22c55e','#0ea5e9','#6366f1','#8b5cf6','#ec4899','#64748b','#14b8a6','#e8530a'
];

// ── AI Scene Generators ───────────────────────────────────────────────────────
const SCENE_GENERATORS = [
  { id: 'opening', name: 'Opening Scene', icon: '🎬', prompt: 'Write a compelling opening scene that hooks the audience in the first 30 seconds' },
  { id: 'dialogue_duel', name: 'Dialogue Duel', icon: '⚔️', prompt: 'Write a scene where two characters verbally spar — subtext-heavy, each line has double meaning' },
  { id: 'reveal', name: 'Plot Twist Reveal', icon: '🔮', prompt: 'Write a scene where a devastating secret is revealed — build tension then drop the bomb' },
  { id: 'action_set', name: 'Action Set Piece', icon: '💥', prompt: 'Write a visually spectacular action sequence with clear geography and rising stakes' },
  { id: 'love_scene', name: 'Love/Connection', icon: '💕', prompt: 'Write an emotionally intimate scene between two characters — no clichés, real vulnerability' },
  { id: 'cold_open', name: 'Cold Open', icon: '❄️', prompt: 'Write a TV-style cold open that creates an immediate mystery or shock the viewer must solve' },
  { id: 'monologue', name: 'Power Monologue', icon: '🎤', prompt: 'Write a character-defining monologue — the kind that wins Oscars and becomes iconic' },
  { id: 'climax', name: 'Climax Scene', icon: '🏔️', prompt: 'Write the climactic confrontation where all storylines converge and stakes are at maximum' },
  { id: 'music_scene', name: 'Musical Performance', icon: '🎵', prompt: 'Write a scene where music is the narrative — a performance that changes everything for the character' },
  { id: 'ending', name: 'Final Scene', icon: '🌅', prompt: 'Write a final scene/image that resonates emotionally and ties back to the opening thematically' }
];

// ── Render ─────────────────────────────────────────────────────────────────────
function renderScriptStudio(container) {
  container.innerHTML = `
    <div class="ss-container">
      <div class="ss-header">
        <div class="ss-header-left">
          <div class="ss-header-icon">🎬</div>
          <div>
            <div class="ss-header-title">GOAT Script Studio</div>
            <div class="ss-header-sub">Hollywood Screenwriting Engine — Final Draft-Level Formatting • AI Story Engine • 24 Legendary Writers</div>
          </div>
        </div>
        <div class="ss-header-right">
          <div class="ss-stat"><div class="ss-stat-val" id="ssPageCount">0</div><div class="ss-stat-lbl">PAGES</div></div>
          <div class="ss-stat"><div class="ss-stat-val" id="ssWordCount">0</div><div class="ss-stat-lbl">WORDS</div></div>
          <button class="ss-btn-icon" onclick="toggleFocusMode()" title="Focus Mode">🎯</button>
          <button class="ss-btn-icon" onclick="startWriterSprint()" title="Writer Sprint" id="ssSprintBtn">⏱️</button>
        </div>
      </div>

      <div class="ss-tabs">
        ${['writer','format','beats','generators','legends','structure','production'].map(t => `
          <button class="ss-tab ${ssState.activeTab === t ? 'active' : ''}" onclick="switchSSTab('${t}')">
            ${{ writer:'✍️ Script Writer', format:'📄 Format Lab', beats:'📋 Beat Board', generators:'⚡ AI Scene Gen', legends:'🏆 Legend Mode', structure:'📐 Story Structure', production:'🎥 Production' }[t]}
          </button>
        `).join('')}
      </div>

      <div class="ss-body" id="ssBody">
        ${renderSSTab()}
      </div>
    </div>
  `;
}

function renderSSTab() {
  switch (ssState.activeTab) {
    case 'writer': return renderSSWriter();
    case 'format': return renderSSFormat();
    case 'beats': return renderSSBeats();
    case 'generators': return renderSSGenerators();
    case 'legends': return renderSSLegends();
    case 'structure': return renderSSStructure();
    case 'production': return renderSSProduction();
    default: return renderSSWriter();
  }
}

// ── Tab: Script Writer ────────────────────────────────────────────────────────
function renderSSWriter() {
  return `
    <div class="ss-writer-wrap">
      <div class="ss-writer-sidebar">
        <div class="ss-sidebar-section">
          <div class="ss-sidebar-title">📄 Script Info</div>
          <input class="ss-input" id="ssTitle" value="${ssState.currentScript.title}" placeholder="Script Title" onchange="ssState.currentScript.title=this.value">
          <input class="ss-input" id="ssAuthor" value="${ssState.currentScript.author}" placeholder="Written By" onchange="ssState.currentScript.author=this.value">
          <textarea class="ss-input" id="ssLogline" rows="3" placeholder="Logline — One sentence that sells your story" onchange="ssState.currentScript.logline=this.value">${ssState.currentScript.logline}</textarea>
        </div>
        <div class="ss-sidebar-section">
          <div class="ss-sidebar-title">🎬 Format</div>
          <select class="ss-select" id="ssFormat" onchange="ssState.scriptFormat=this.value">
            ${Object.entries(SCRIPT_FORMATS).map(([k,v]) => `<option value="${k}" ${ssState.scriptFormat===k?'selected':''}>${v.icon} ${v.name}</option>`).join('')}
          </select>
        </div>
        <div class="ss-sidebar-section">
          <div class="ss-sidebar-title">🎭 Genre</div>
          <div class="ss-genre-chips">
            ${GENRES.map(g => `
              <button class="ss-genre-chip ${ssState.currentGenre===g.id?'active':''}" style="--gc:${g.color}" onclick="setSSGenre('${g.id}')">${g.icon} ${g.name}</button>
            `).join('')}
          </div>
        </div>
        <div class="ss-sidebar-section">
          <div class="ss-sidebar-title">📝 Script Elements</div>
          <div class="ss-elements-list">
            ${Object.entries(SCRIPT_ELEMENTS).map(([k,v]) => `
              <button class="ss-element-btn" onclick="insertScriptElement('${k}')" title="${v.desc}\n${v.shortcut}">
                <span class="ss-el-label">${v.label}</span>
                <span class="ss-el-shortcut">${v.shortcut.replace('Ctrl+','⌘')}</span>
              </button>
            `).join('')}
          </div>
        </div>
        <div class="ss-sidebar-actions">
          <button class="ss-btn primary full" onclick="sendScriptToAI()">🤖 AI Write Next Scene</button>
          <button class="ss-btn secondary full" onclick="analyzeScript()">📊 Analyze Script</button>
          <button class="ss-btn secondary full" onclick="exportScript()">📤 Export .FDX / PDF</button>
        </div>
      </div>
      <div class="ss-writer-main">
        <div class="ss-page" id="ssPage">
          <div class="ss-page-header">
            <div class="ss-page-title" id="ssTitleDisplay">${ssState.currentScript.title.toUpperCase()}</div>
            <div class="ss-page-subtitle">Written by ${ssState.currentScript.author}</div>
          </div>
          <textarea class="ss-screenplay-area" id="ssScreenplayArea" 
            placeholder="FADE IN:

INT. RECORDING STUDIO - NIGHT

The mixing board glows like a cockpit. BASS TREMBLES through the walls. We PAN across gold records, framed magazine covers, and a half-empty bottle of Hennessy.

DJ SPEEDY (40s, eyes that have seen both sides of fame) leans back in his chair, headphones around his neck.

DJ SPEEDY
(to himself)
One more track. One more chance to make them feel something.

He hits PLAY. The beat drops. We feel it in our chest.

SMASH CUT TO:" spellcheck="false" oninput="updateSSWordCount(this)"></textarea>
        </div>
      </div>
    </div>
  `;
}

// ── Tab: Format Lab ───────────────────────────────────────────────────────────
function renderSSFormat() {
  return `
    <div class="ss-format-wrap">
      <div class="ss-section-title">📄 Script Format Reference — Industry Standard Formatting</div>
      <div class="ss-section-sub">Master the same formatting used by every major studio. GOAT Script Studio auto-formats as you type.</div>

      <div class="ss-format-grid">
        ${Object.entries(SCRIPT_FORMATS).map(([k,v]) => `
          <div class="ss-format-card ${ssState.scriptFormat===k?'active':''}" onclick="selectSSFormat('${k}')">
            <div class="ss-format-icon">${v.icon}</div>
            <div class="ss-format-name">${v.name}</div>
            <div class="ss-format-details">
              <span>📄 ${v.pages}</span>
              <span>📐 ${v.acts}</span>
              <span>⏱ ${v.time}</span>
            </div>
            <div class="ss-format-desc">${v.desc}</div>
          </div>
        `).join('')}
      </div>

      <div class="ss-elements-ref">
        <div class="ss-section-title" style="margin-top:20px">📝 Script Elements Reference</div>
        <div class="ss-elements-grid">
          ${Object.entries(SCRIPT_ELEMENTS).map(([k,v]) => `
            <div class="ss-element-ref-card">
              <div class="ss-el-ref-header">
                <span class="ss-el-ref-label">${v.label}</span>
                <span class="ss-el-ref-shortcut">${v.shortcut}</span>
              </div>
              <div class="ss-el-ref-format">${v.format}</div>
              <pre class="ss-el-ref-example">${v.example}</pre>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ── Tab: Beat Board ───────────────────────────────────────────────────────────
function renderSSBeats() {
  const structure = STORY_STRUCTURES.find(s => s.id === 'three_act') || STORY_STRUCTURES[0];
  return `
    <div class="ss-beats-wrap">
      <div class="ss-beats-header">
        <div class="ss-section-title">📋 Beat Board — Visual Story Architecture</div>
        <div class="ss-beats-actions">
          <select class="ss-select small" onchange="loadStructureBeats(this.value)">
            ${STORY_STRUCTURES.map(s => `<option value="${s.id}">${s.icon} ${s.name}</option>`).join('')}
          </select>
          <button class="ss-btn secondary small" onclick="addBeat()">+ Add Beat</button>
          <button class="ss-btn secondary small" onclick="clearBeats()">🗑 Clear</button>
          <button class="ss-btn primary small" onclick="beatsToScript()">📄 Beats → Script</button>
        </div>
      </div>
      <div class="ss-beats-board" id="ssBeatBoard">
        ${structure.beats.map((beat, i) => `
          <div class="ss-beat-card" style="border-top:3px solid ${BEAT_BOARD_COLORS[i % BEAT_BOARD_COLORS.length]}" draggable="true">
            <div class="ss-beat-number">${i + 1}</div>
            <div class="ss-beat-name" contenteditable="true">${beat}</div>
            <textarea class="ss-beat-notes" placeholder="Notes, details, key moments..." rows="3"></textarea>
            <div class="ss-beat-footer">
              <select class="ss-beat-color" onchange="this.closest('.ss-beat-card').style.borderTopColor=this.value">
                ${BEAT_BOARD_COLORS.map(c => `<option value="${c}" style="background:${c}">${c === BEAT_BOARD_COLORS[i % BEAT_BOARD_COLORS.length] ? '● ' : ''}▉</option>`).join('')}
              </select>
              <button class="ss-beat-delete" onclick="this.closest('.ss-beat-card').remove()">✕</button>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="ss-beats-ai">
        <button class="ss-btn primary" onclick="aiExpandBeats()">🤖 AI: Expand All Beats into Detailed Outlines</button>
        <button class="ss-btn secondary" onclick="aiBeatSuggestions()">💡 AI: Suggest Missing Beats</button>
        <button class="ss-btn secondary" onclick="aiPaceAnalysis()">📊 AI: Pacing Analysis</button>
      </div>
    </div>
  `;
}

// ── Tab: AI Scene Generators ──────────────────────────────────────────────────
function renderSSGenerators() {
  return `
    <div class="ss-gen-wrap">
      <div class="ss-section-title">⚡ AI Scene Generator — 10 Scene Types + Writer Style Mode</div>
      <div class="ss-section-sub">Generate perfectly formatted screenplay scenes. Choose a scene type, optionally write in a legendary writer's style.</div>

      <div class="ss-gen-options">
        <div class="ss-gen-row">
          <div class="ss-gen-group">
            <label class="ss-gen-label">Scene Context</label>
            <textarea class="ss-gen-textarea" id="ssSceneContext" rows="3" placeholder="Describe what's happening in the story at this point. Who are the characters? What's at stake?"></textarea>
          </div>
        </div>
        <div class="ss-gen-row two">
          <div class="ss-gen-group">
            <label class="ss-gen-label">Write in the Style of:</label>
            <select class="ss-select" id="ssWriterStyle">
              <option value="">My Own Voice (No Style Match)</option>
              ${LEGENDARY_WRITERS.map(w => `<option value="${w.name}">${w.icon} ${w.name} — ${w.style.split(',')[0]}</option>`).join('')}
            </select>
          </div>
          <div class="ss-gen-group">
            <label class="ss-gen-label">Genre</label>
            <select class="ss-select" id="ssGenGenre">
              ${GENRES.map(g => `<option value="${g.id}" ${ssState.currentGenre===g.id?'selected':''}>${g.icon} ${g.name}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>

      <div class="ss-gen-types">
        ${SCENE_GENERATORS.map(g => `
          <button class="ss-gen-type-btn" onclick="generateScene('${g.id}')">
            <div class="ss-gen-type-icon">${g.icon}</div>
            <div class="ss-gen-type-info">
              <div class="ss-gen-type-name">${g.name}</div>
              <div class="ss-gen-type-desc">${g.prompt}</div>
            </div>
          </button>
        `).join('')}
      </div>

      <div class="ss-gen-custom">
        <div class="ss-gen-label">🎯 Custom Scene Prompt</div>
        <textarea class="ss-gen-textarea" id="ssCustomPrompt" rows="3" placeholder="Describe the exact scene you want generated in screenplay format..."></textarea>
        <button class="ss-btn primary" onclick="generateCustomScene()">⚡ Generate Custom Scene</button>
      </div>
    </div>
  `;
}

// ── Tab: Legend Mode ──────────────────────────────────────────────────────────
function renderSSLegends() {
  const eras = [
    { id: 'all', name: 'All Eras' },
    { id: 'golden', name: '🎩 Golden Age (1900–1960)' },
    { id: 'new_hollywood', name: '🎬 New Hollywood (1960–1985)' },
    { id: 'modern', name: '📽️ Modern Masters (1985–2010)' },
    { id: 'contemporary', name: '🌟 Contemporary (2010–2026)' },
    { id: 'tv_titan', name: '📺 Television Titans' }
  ];
  return `
    <div class="ss-legends-wrap">
      <div class="ss-section-title">🏆 Legend Mode — Write Like the Masters (126 Years of Cinema)</div>
      <div class="ss-section-sub">Study their techniques. Channel their voices. 24 legendary writers from 1900 to 2026. ${LEGENDARY_WRITERS.reduce((a,w)=>a+w.oscars,0)} combined Oscars.</div>
      <div class="ss-era-filters">
        ${eras.map(e => `
          <button class="ss-era-btn ${e.id === 'all' ? 'active' : ''}" onclick="filterSSEra('${e.id}', this)">${e.name}</button>
        `).join('')}
      </div>
      <div class="ss-legends-grid" id="ssLegendsGrid">
        ${LEGENDARY_WRITERS.map(w => `
          <div class="ss-legend-card" style="border-left:4px solid ${w.color}" data-era="${w.era}">
            <div class="ss-legend-header">
              <div class="ss-legend-icon">${w.icon}</div>
              <div class="ss-legend-meta">
                <div class="ss-legend-name">${w.name}</div>
                <div class="ss-legend-years">${w.years}</div>
              </div>
              ${w.oscars > 0 ? `<div class="ss-legend-oscars">${'🏆'.repeat(Math.min(w.oscars,3))} ${w.oscars > 3 ? '+' + (w.oscars-3) : ''}</div>` : ''}
            </div>
            <div class="ss-legend-style">${w.style}</div>
            <div class="ss-legend-works">
              ${w.masterworks.slice(0,3).map(m => `<span class="ss-legend-work">${m}</span>`).join('')}
              ${w.masterworks.length > 3 ? `<span class="ss-legend-more">+${w.masterworks.length - 3} more</span>` : ''}
            </div>
            <div class="ss-legend-technique">${w.technique.slice(0,150)}${w.technique.length > 150 ? '...' : ''}</div>
            <div class="ss-legend-actions">
              <button class="ss-btn primary small" onclick="writeAsLegend('${w.name}')">✍️ Write in This Style</button>
              <button class="ss-btn secondary small" onclick="studyLegend('${w.name}')">📚 Deep Study</button>
              <button class="ss-btn secondary small" onclick="legendPrompt('${w.name}')">💬 Ask AI</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ── Tab: Story Structure ──────────────────────────────────────────────────────
function renderSSStructure() {
  return `
    <div class="ss-struct-wrap">
      <div class="ss-section-title">📐 Story Structure Templates — 7 Proven Frameworks</div>
      <div class="ss-section-sub">From Blake Snyder to Joseph Campbell to Japanese Kishōtenketsu — master every narrative architecture.</div>
      <div class="ss-struct-grid">
        ${STORY_STRUCTURES.map(s => `
          <div class="ss-struct-card">
            <div class="ss-struct-header">
              <div class="ss-struct-icon">${s.icon}</div>
              <div>
                <div class="ss-struct-name">${s.name}</div>
                <div class="ss-struct-desc">${s.desc}</div>
              </div>
            </div>
            <div class="ss-struct-source">${s.source}</div>
            <div class="ss-struct-beats">
              ${s.beats.map((b, i) => `
                <div class="ss-struct-beat">
                  <span class="ss-struct-beat-num">${i + 1}</span>
                  <span class="ss-struct-beat-name">${b}</span>
                </div>
              `).join('')}
            </div>
            <div class="ss-struct-actions">
              <button class="ss-btn primary small" onclick="loadStructureToBeatBoard('${s.id}')">📋 Load to Beat Board</button>
              <button class="ss-btn secondary small" onclick="aiStructureGuide('${s.id}')">🤖 AI Structure Guide</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ── Tab: Production ───────────────────────────────────────────────────────────
function renderSSProduction() {
  return `
    <div class="ss-prod-wrap">
      <div class="ss-section-title">🎥 Production Tools — From Page to Screen</div>
      <div class="ss-section-sub">Script breakdown, scheduling, budgeting analysis, and production-ready exports.</div>
      <div class="ss-prod-grid">
        <div class="ss-prod-card">
          <div class="ss-prod-icon">📊</div>
          <div class="ss-prod-name">Script Breakdown</div>
          <div class="ss-prod-desc">AI analyzes your script and identifies all production elements: cast, locations, props, wardrobe, VFX, stunts, vehicles, and special equipment.</div>
          <button class="ss-btn primary full" onclick="aiScriptBreakdown()">Generate Breakdown</button>
        </div>
        <div class="ss-prod-card">
          <div class="ss-prod-icon">📅</div>
          <div class="ss-prod-name">Shooting Schedule</div>
          <div class="ss-prod-desc">Generate an optimized shooting schedule based on locations, cast availability, day/night scenes, and weather dependencies.</div>
          <button class="ss-btn primary full" onclick="aiShootingSchedule()">Generate Schedule</button>
        </div>
        <div class="ss-prod-card">
          <div class="ss-prod-icon">💰</div>
          <div class="ss-prod-name">Budget Estimator</div>
          <div class="ss-prod-desc">Estimate production costs based on script elements: Above-the-line, below-the-line, post-production, and contingency.</div>
          <button class="ss-btn primary full" onclick="aiBudgetEstimate()">Estimate Budget</button>
        </div>
        <div class="ss-prod-card">
          <div class="ss-prod-icon">🎭</div>
          <div class="ss-prod-name">Character Bible</div>
          <div class="ss-prod-desc">Auto-generate detailed character bibles from your script: physical description, arc, relationships, key scenes, and casting suggestions.</div>
          <button class="ss-btn primary full" onclick="aiCharacterBible()">Generate Bible</button>
        </div>
        <div class="ss-prod-card">
          <div class="ss-prod-icon">📍</div>
          <div class="ss-prod-name">Location Report</div>
          <div class="ss-prod-desc">Extract all unique locations from your script with scene counts, day/night breakdown, and location scouting requirements.</div>
          <button class="ss-btn primary full" onclick="aiLocationReport()">Generate Report</button>
        </div>
        <div class="ss-prod-card">
          <div class="ss-prod-icon">📤</div>
          <div class="ss-prod-name">Export Suite</div>
          <div class="ss-prod-desc">Export your script in industry-standard formats: Final Draft (.fdx), PDF, Fountain (.fountain), HTML, and plain text.</div>
          <button class="ss-btn primary full" onclick="showExportOptions()">Export Script</button>
        </div>
        <div class="ss-prod-card">
          <div class="ss-prod-icon">🎬</div>
          <div class="ss-prod-name">Pitch Deck Builder</div>
          <div class="ss-prod-desc">Generate a professional pitch deck from your script: logline, synopsis, character breakdowns, comparable titles, target audience, and market analysis.</div>
          <button class="ss-btn primary full" onclick="aiPitchDeck()">Build Pitch Deck</button>
        </div>
        <div class="ss-prod-card">
          <div class="ss-prod-icon">📝</div>
          <div class="ss-prod-name">Coverage Report</div>
          <div class="ss-prod-name">AI Script Coverage</div>
          <div class="ss-prod-desc">Get professional reader coverage: synopsis, character analysis, dialogue quality, structure assessment, marketability, and PASS/CONSIDER/RECOMMEND.</div>
          <button class="ss-btn primary full" onclick="aiCoverageReport()">Generate Coverage</button>
        </div>
      </div>
    </div>
  `;
}

// ── Actions ───────────────────────────────────────────────────────────────────
function switchSSTab(tab) {
  ssState.activeTab = tab;
  const body = document.getElementById('ssBody');
  if (body) body.innerHTML = renderSSTab();
  document.querySelectorAll('.ss-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.ss-tab').forEach(t => {
    const tabMap = { writer:'Script Writer', format:'Format Lab', beats:'Beat Board', generators:'AI Scene', legends:'Legend Mode', structure:'Story Structure', production:'Production' };
    if (t.textContent.includes(tabMap[tab]?.split(' ')[0] || '???')) t.classList.add('active');
  });
}

function setSSGenre(genre) {
  ssState.currentGenre = genre;
  document.querySelectorAll('.ss-genre-chip').forEach(c => c.classList.remove('active'));
  event.target.classList.add('active');
}

function selectSSFormat(format) {
  ssState.scriptFormat = format;
  const body = document.getElementById('ssBody');
  if (body) body.innerHTML = renderSSFormat();
}

function insertScriptElement(type) {
  const el = SCRIPT_ELEMENTS[type];
  const area = document.getElementById('ssScreenplayArea');
  if (!area || !el) return;
  const insert = { scene_heading: '\nINT. LOCATION - TIME\n\n', action: '\nAction description here.\n\n', character: '\n            CHARACTER NAME\n', dialogue: '      Dialogue goes here.\n\n', parenthetical: '      (direction)\n', transition: '\n                                    CUT TO:\n\n', montage: '\nMONTAGE — SEQUENCE NAME\n\nA) First moment.\nB) Second moment.\nC) Third moment.\n\n', vo_os: '\n            CHARACTER (V.O.)\n      Voice over dialogue here.\n\n' };
  const pos = area.selectionStart;
  area.value = area.value.substring(0, pos) + (insert[type] || '\n') + area.value.substring(pos);
  area.focus();
  area.selectionStart = area.selectionEnd = pos + (insert[type] || '\n').length;
  updateSSWordCount(area);
}

function updateSSWordCount(el) {
  const text = el.value;
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const pages = Math.max(1, Math.round(words / 250));
  ssState.wordCount = words;
  ssState.pageCount = pages;
  const wc = document.getElementById('ssWordCount');
  const pc = document.getElementById('ssPageCount');
  if (wc) wc.textContent = words.toLocaleString();
  if (pc) pc.textContent = pages;
}

function sendScriptToAI() {
  const area = document.getElementById('ssScreenplayArea');
  const format = SCRIPT_FORMATS[ssState.scriptFormat];
  const genre = GENRES.find(g => g.id === ssState.currentGenre);
  const scriptText = area?.value?.trim() || '';
  const title = ssState.currentScript.title;
  const logline = ssState.currentScript.logline;
  document.getElementById('message-input').value = `Continue writing the next scene for my ${format?.name || 'screenplay'} "${title}" in the ${genre?.name || 'Drama'} genre.${logline ? `\n\nLogline: ${logline}` : ''}\n\nHere's what I have so far:\n\n${scriptText.slice(-1500)}\n\nPlease write the NEXT SCENE in proper screenplay format (scene heading, action, dialogue with character names). Make it compelling, with strong subtext and visual storytelling. Output in standard screenplay formatting.`;
  closeToolPanel();
}

function analyzeScript() {
  const area = document.getElementById('ssScreenplayArea');
  document.getElementById('message-input').value = `Provide a professional script coverage/analysis of this screenplay:\n\n${area?.value?.slice(0,3000) || '[No script content]'}\n\nAnalyze:\n1. Structure (act breaks, pacing, midpoint)\n2. Character Development (arcs, voice distinction)\n3. Dialogue Quality (naturalistic? subtext?)\n4. Visual Storytelling (show don't tell)\n5. Marketability (comparable titles, target audience)\n6. Overall Assessment: PASS / CONSIDER / RECOMMEND\n\nBe honest but constructive. Provide specific line-level feedback.`;
  closeToolPanel();
}

function exportScript() {
  const area = document.getElementById('ssScreenplayArea');
  const content = area?.value || '';
  const title = ssState.currentScript.title;
  document.getElementById('message-input').value = `Format this screenplay into a clean, properly formatted PDF-ready document with correct margins and spacing:\n\nTitle: ${title}\nWritten by: ${ssState.currentScript.author}\nFormat: ${SCRIPT_FORMATS[ssState.scriptFormat]?.name}\n\n${content}\n\nPlease output in Fountain markup format (.fountain) that I can import into Final Draft, Highland, or any screenwriting app.`;
  closeToolPanel();
}

function generateScene(typeId) {
  const gen = SCENE_GENERATORS.find(g => g.id === typeId);
  if (!gen) return;
  const context = document.getElementById('ssSceneContext')?.value || '';
  const writerStyle = document.getElementById('ssWriterStyle')?.value || '';
  const genre = document.getElementById('ssGenGenre')?.value || ssState.currentGenre;
  const genreName = GENRES.find(g => g.id === genre)?.name || 'Drama';
  const writer = writerStyle ? LEGENDARY_WRITERS.find(w => w.name === writerStyle) : null;
  let prompt = `Write a screenplay scene — ${gen.name}: ${gen.prompt}\n\nGenre: ${genreName}\nFormat: Standard Hollywood screenplay format\n`;
  if (context) prompt += `\nScene Context: ${context}\n`;
  if (writer) prompt += `\nWrite in the STYLE of ${writer.name}: ${writer.technique}\nChannel their voice: ${writer.style}\n`;
  prompt += `\nOutput in proper screenplay format with:\n- Scene heading (INT./EXT. LOCATION - TIME)\n- Action lines (present tense, visual)\n- Character names (CAPS, centered)\n- Dialogue with parentheticals where needed\n- Transitions if appropriate\n\nMake it EXCEPTIONAL — this should read like it belongs in an Oscar-winning film.`;
  document.getElementById('message-input').value = prompt;
  closeToolPanel();
}

function generateCustomScene() {
  const prompt = document.getElementById('ssCustomPrompt')?.value?.trim();
  if (!prompt) { showSSNotif('⚠️ Describe the scene you want generated', 'warning'); return; }
  const writerStyle = document.getElementById('ssWriterStyle')?.value || '';
  const writer = writerStyle ? LEGENDARY_WRITERS.find(w => w.name === writerStyle) : null;
  let fullPrompt = `Write this as a screenplay scene in proper Hollywood format:\n\n${prompt}\n`;
  if (writer) fullPrompt += `\nChannel the style of ${writer.name}: ${writer.technique}\n`;
  fullPrompt += `\nOutput proper screenplay format — scene heading, action, character names, dialogue, transitions.`;
  document.getElementById('message-input').value = fullPrompt;
  closeToolPanel();
}

function writeAsLegend(name) {
  const writer = LEGENDARY_WRITERS.find(w => w.name === name);
  if (!writer) return;
  ssState.activeTab = 'generators';
  const body = document.getElementById('ssBody');
  if (body) body.innerHTML = renderSSGenerators();
  setTimeout(() => { const sel = document.getElementById('ssWriterStyle'); if (sel) sel.value = name; }, 50);
  showSSNotif(`✍️ Now writing in the style of ${writer.icon} ${writer.name}`, 'success');
}

function studyLegend(name) {
  const writer = LEGENDARY_WRITERS.find(w => w.name === name);
  if (!writer) return;
  document.getElementById('message-input').value = `Give me a deep masterclass on ${writer.name}'s screenwriting technique.\n\nCover:\n1. Their unique voice and style hallmarks\n2. Structural techniques they pioneered\n3. How they write dialogue differently from everyone else\n4. Scene construction — how they build tension\n5. Analysis of specific scenes from: ${writer.masterworks.join(', ')}\n6. What modern writers can learn from them\n7. Writing exercises to practice their techniques\n\nInclude specific script excerpts where possible.`;
  closeToolPanel();
}

function legendPrompt(name) {
  const writer = LEGENDARY_WRITERS.find(w => w.name === name);
  if (!writer) return;
  document.getElementById('message-input').value = `Pretend you are ${writer.name}. In their authentic voice and perspective, answer: "What is the single most important thing a screenwriter must understand about storytelling?" Then write a 1-page sample scene that demonstrates your technique.`;
  closeToolPanel();
}

function filterSSEra(era, btn) {
  document.querySelectorAll('.ss-era-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.ss-legend-card').forEach(card => {
    card.style.display = (era === 'all' || card.dataset.era === era) ? '' : 'none';
  });
}

function loadStructureToBeatBoard(structId) {
  const struct = STORY_STRUCTURES.find(s => s.id === structId);
  if (!struct) return;
  ssState.activeTab = 'beats';
  const body = document.getElementById('ssBody');
  if (body) body.innerHTML = renderSSBeats();
  showSSNotif(`📋 "${struct.name}" loaded to Beat Board!`, 'success');
}

function loadStructureBeats(structId) { loadStructureToBeatBoard(structId); }

function addBeat() {
  const board = document.getElementById('ssBeatBoard');
  if (!board) return;
  const count = board.querySelectorAll('.ss-beat-card').length;
  const color = BEAT_BOARD_COLORS[count % BEAT_BOARD_COLORS.length];
  const card = document.createElement('div');
  card.className = 'ss-beat-card';
  card.style.borderTop = `3px solid ${color}`;
  card.draggable = true;
  card.innerHTML = `<div class="ss-beat-number">${count + 1}</div><div class="ss-beat-name" contenteditable="true">New Beat</div><textarea class="ss-beat-notes" placeholder="Notes..." rows="3"></textarea><div class="ss-beat-footer"><select class="ss-beat-color" onchange="this.closest('.ss-beat-card').style.borderTopColor=this.value">${BEAT_BOARD_COLORS.map(c=>`<option value="${c}">▉</option>`).join('')}</select><button class="ss-beat-delete" onclick="this.closest('.ss-beat-card').remove()">✕</button></div>`;
  board.appendChild(card);
}

function clearBeats() { const board = document.getElementById('ssBeatBoard'); if (board) board.innerHTML = ''; }

function beatsToScript() {
  const beats = [];
  document.querySelectorAll('.ss-beat-card').forEach(card => {
    const name = card.querySelector('.ss-beat-name')?.textContent;
    const notes = card.querySelector('.ss-beat-notes')?.value;
    if (name) beats.push({ name, notes: notes || '' });
  });
  if (!beats.length) { showSSNotif('⚠️ Add some beats first!', 'warning'); return; }
  const genre = GENRES.find(g => g.id === ssState.currentGenre)?.name || 'Drama';
  document.getElementById('message-input').value = `Convert these story beats into a full screenplay outline for a ${SCRIPT_FORMATS[ssState.scriptFormat]?.name || 'feature film'} in the ${genre} genre:\n\n${beats.map((b,i) => `BEAT ${i+1}: ${b.name}${b.notes ? '\n  Notes: ' + b.notes : ''}`).join('\n\n')}\n\nFor each beat, write:\n1. Scene heading\n2. 2-3 sentence scene description\n3. Key dialogue snippets\n4. Emotional tone\n\nThen provide the complete screenplay for the first 3 scenes.`;
  closeToolPanel();
}

function aiExpandBeats() {
  const beats = [];
  document.querySelectorAll('.ss-beat-card .ss-beat-name').forEach(el => { if (el.textContent) beats.push(el.textContent); });
  document.getElementById('message-input').value = `Expand each of these story beats into detailed scene-by-scene outlines:\n\n${beats.map((b,i) => `${i+1}. ${b}`).join('\n')}\n\nFor each beat provide: detailed scene description, character motivations, key dialogue hints, visual metaphors, and how it connects to the next beat.`;
  closeToolPanel();
}

function aiBeatSuggestions() {
  const beats = [];
  document.querySelectorAll('.ss-beat-card .ss-beat-name').forEach(el => { if (el.textContent) beats.push(el.textContent); });
  document.getElementById('message-input').value = `Analyze these story beats and suggest what's MISSING:\n\n${beats.map((b,i)=>`${i+1}. ${b}`).join('\n')}\n\nIdentify gaps in: character development, rising tension, subplots, thematic resonance, midpoint twist, and emotional payoff. Suggest specific new beats to add.`;
  closeToolPanel();
}

function aiPaceAnalysis() {
  document.getElementById('message-input').value = 'Analyze the pacing of my beat board and provide a visual pacing chart showing tension levels across the story.';
  closeToolPanel();
}

function aiStructureGuide(structId) {
  const struct = STORY_STRUCTURES.find(s => s.id === structId);
  if (!struct) return;
  document.getElementById('message-input').value = `Give me a complete masterclass on the "${struct.name}" story structure (${struct.source}).\n\nCover each beat:\n${struct.beats.map((b,i) => `${i+1}. ${b}`).join('\n')}\n\nFor each: explain its purpose, give 3 film examples, common mistakes, and how to write it brilliantly. Include timing/page count guidelines.`;
  closeToolPanel();
}

function aiScriptBreakdown() { sendProdPrompt('Generate a complete script breakdown from my current screenplay. List all: cast members, locations (INT/EXT), props, wardrobe, VFX shots, stunts, vehicles, special equipment, animals, and music cues. Format as a production-ready breakdown sheet.'); }
function aiShootingSchedule() { sendProdPrompt('Generate an optimized shooting schedule for my screenplay. Group by location, consider day/night requirements, cast availability, and weather dependencies. Include estimated shoot days and daily scene count.'); }
function aiBudgetEstimate() { sendProdPrompt('Estimate a production budget for my screenplay. Break down into: Above-the-line (writer, director, cast), Below-the-line (crew, equipment, locations), Post-production (editing, VFX, sound, music), and 10% contingency. Provide Low/Medium/High budget scenarios.'); }
function aiCharacterBible() { sendProdPrompt('Generate detailed character bibles for all characters in my screenplay. For each: full name, age, physical description, psychological profile, character arc, key relationships, speech patterns, and casting suggestions (real actors).'); }
function aiLocationReport() { sendProdPrompt('Extract and analyze all locations from my screenplay. For each: INT/EXT, time of day, scene count, page count, special requirements, and suggested real-world filming locations.'); }
function aiPitchDeck() { sendProdPrompt('Generate a professional Hollywood pitch deck for my screenplay. Include: logline, 3-paragraph synopsis, character breakdowns, target audience, comparable titles (with box office data), unique selling points, and director/cast wish list.'); }
function aiCoverageReport() { sendProdPrompt('Write professional script coverage for my screenplay as if you are a studio reader. Include: logline, synopsis (1 page), character analysis, dialogue assessment, structure evaluation, marketability, and final verdict: PASS / CONSIDER / RECOMMEND. Be brutally honest.'); }
function showExportOptions() { sendProdPrompt('Format my screenplay for export. Provide it in:\n1. Fountain markup (.fountain) for Final Draft/Highland import\n2. Clean formatted text\n3. HTML with proper screenplay CSS styling\n\nInclude title page with writer credit.'); }

function sendProdPrompt(prompt) {
  const area = document.getElementById('ssScreenplayArea');
  const script = area?.value || ssState.currentScript.logline || '';
  document.getElementById('message-input').value = prompt + (script ? `\n\nScript content:\n${script.slice(0,2000)}` : '\n\n[Using my current script in progress]');
  closeToolPanel();
}

function startWriterSprint() {
  if (ssState.sprintActive) { ssState.sprintActive = false; showSSNotif('⏱️ Sprint ended!', 'info'); return; }
  ssState.sprintActive = true;
  ssState.sprintTime = 25 * 60;
  showSSNotif('⏱️ 25-minute Writer Sprint started! WRITE!', 'success');
  const timer = setInterval(() => {
    if (!ssState.sprintActive || ssState.sprintTime <= 0) { clearInterval(timer); ssState.sprintActive = false; showSSNotif('🎉 Sprint complete! Great writing session!', 'success'); return; }
    ssState.sprintTime--;
    const btn = document.getElementById('ssSprintBtn');
    if (btn) { const m = Math.floor(ssState.sprintTime/60); const s = ssState.sprintTime%60; btn.textContent = `${m}:${s.toString().padStart(2,'0')}`; }
  }, 1000);
}

function toggleFocusMode() {
  ssState.focusMode = !ssState.focusMode;
  showSSNotif(ssState.focusMode ? '🎯 Focus Mode ON — distractions minimized' : '🎯 Focus Mode OFF', 'info');
}

function showSSNotif(msg, type) {
  const existing = document.querySelector('.ss-notif');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'ss-notif';
  el.style.cssText = `position:fixed;top:20px;right:20px;z-index:99999;padding:12px 18px;border-radius:10px;font-size:13px;font-weight:600;max-width:380px;box-shadow:0 4px 20px rgba(0,0,0,0.4);background:${type==='success'?'rgba(34,197,94,0.15)':type==='warning'?'rgba(245,158,11,0.15)':'rgba(220,38,38,0.15)'};border:1px solid ${type==='success'?'#22c55e':type==='warning'?'#f59e0b':'#dc2626'};color:var(--text-primary);`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ── Inject CSS ────────────────────────────────────────────────────────────────
(function injectSSStyles() {
  if (document.getElementById('ss-styles')) return;
  const style = document.createElement('style');
  style.id = 'ss-styles';
  style.textContent = `
    .ss-container{display:flex;flex-direction:column;height:100%;background:var(--bg-primary);color:var(--text-primary);font-family:'Inter',sans-serif}
    .ss-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:linear-gradient(135deg,rgba(220,38,38,0.12),rgba(245,158,11,0.08));border-bottom:1px solid rgba(220,38,38,0.2);flex-shrink:0}
    .ss-header-left{display:flex;align-items:center;gap:12px}
    .ss-header-icon{font-size:32px}
    .ss-header-title{font-size:20px;font-weight:700;color:#dc2626}
    .ss-header-sub{font-size:11px;color:var(--text-muted);margin-top:2px}
    .ss-header-right{display:flex;align-items:center;gap:14px}
    .ss-stat{text-align:center}
    .ss-stat-val{font-size:18px;font-weight:700;color:#dc2626}
    .ss-stat-lbl{font-size:9px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px}
    .ss-btn-icon{background:none;border:1px solid var(--border);color:var(--text-muted);width:32px;height:32px;border-radius:8px;cursor:pointer;font-size:14px;transition:all .2s}
    .ss-btn-icon:hover{border-color:#dc2626;color:#dc2626}
    .ss-tabs{display:flex;gap:3px;padding:10px 20px 0;background:var(--bg-secondary);border-bottom:1px solid var(--border);flex-shrink:0;overflow-x:auto}
    .ss-tab{padding:8px 13px;border:none;background:transparent;color:var(--text-muted);font-size:12px;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap;border-radius:6px 6px 0 0}
    .ss-tab:hover{color:var(--text-primary);background:rgba(220,38,38,0.08)}
    .ss-tab.active{color:#dc2626;border-bottom-color:#dc2626;background:rgba(220,38,38,0.1)}
    .ss-body{flex:1;overflow-y:auto;padding:0}
    .ss-btn{padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .2s}
    .ss-btn.primary{background:linear-gradient(135deg,#dc2626,#f59e0b);color:#fff}
    .ss-btn.secondary{background:var(--bg-secondary);border:1px solid var(--border);color:var(--text-muted)}
    .ss-btn.small{padding:5px 10px;font-size:11px}
    .ss-btn.full{width:100%}
    .ss-btn:hover{transform:translateY(-1px);box-shadow:0 3px 12px rgba(0,0,0,0.2)}
    .ss-input,.ss-select{padding:8px 11px;background:var(--bg-primary);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);font-size:12px;outline:none;width:100%;box-sizing:border-box;font-family:'Inter',sans-serif}
    .ss-input:focus,.ss-select:focus{border-color:#dc2626}
    .ss-select.small{padding:5px 8px;font-size:11px;width:auto}
    .ss-section-title{font-size:16px;font-weight:700;color:var(--text-primary)}
    .ss-section-sub{font-size:13px;color:var(--text-muted);margin-bottom:16px}
    /* Writer */
    .ss-writer-wrap{display:grid;grid-template-columns:240px 1fr;height:100%;overflow:hidden}
    .ss-writer-sidebar{padding:14px;border-right:1px solid var(--border);overflow-y:auto;display:flex;flex-direction:column;gap:14px;background:var(--bg-secondary)}
    .ss-sidebar-section{display:flex;flex-direction:column;gap:8px}
    .ss-sidebar-title{font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px}
    .ss-genre-chips{display:flex;flex-wrap:wrap;gap:4px}
    .ss-genre-chip{padding:3px 8px;border:1px solid var(--border);background:var(--bg-primary);color:var(--text-muted);border-radius:12px;font-size:10px;cursor:pointer;transition:all .2s}
    .ss-genre-chip.active{border-color:var(--gc,#dc2626);color:var(--gc,#dc2626);background:color-mix(in srgb,var(--gc,#dc2626) 15%,transparent)}
    .ss-elements-list{display:flex;flex-direction:column;gap:3px}
    .ss-element-btn{display:flex;justify-content:space-between;align-items:center;padding:6px 8px;background:var(--bg-primary);border:1px solid var(--border);border-radius:6px;cursor:pointer;transition:all .2s}
    .ss-element-btn:hover{border-color:#dc2626}
    .ss-el-label{font-size:11px;color:var(--text-primary)}
    .ss-el-shortcut{font-size:10px;color:var(--text-muted);font-family:monospace}
    .ss-sidebar-actions{display:flex;flex-direction:column;gap:6px;margin-top:auto}
    .ss-writer-main{display:flex;justify-content:center;padding:20px;overflow-y:auto;background:var(--bg-tertiary,#0a0f1a)}
    .ss-page{width:100%;max-width:650px;min-height:800px;background:#fff;color:#000;border-radius:4px;box-shadow:0 4px 24px rgba(0,0,0,0.5);padding:60px 50px;font-family:'Courier Prime','Courier New',monospace;font-size:12px}
    .ss-page-header{text-align:center;margin-bottom:40px}
    .ss-page-title{font-size:16px;font-weight:700;text-transform:uppercase;letter-spacing:1px}
    .ss-page-subtitle{font-size:12px;margin-top:8px;color:#555}
    .ss-screenplay-area{width:100%;min-height:600px;background:transparent;border:none;color:#000;font-family:'Courier Prime','Courier New',monospace;font-size:12px;line-height:1.8;resize:none;outline:none;white-space:pre-wrap}
    /* Format */
    .ss-format-wrap{padding:20px;display:flex;flex-direction:column;gap:16px}
    .ss-format-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}
    .ss-format-card{background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px;padding:14px;cursor:pointer;transition:all .2s}
    .ss-format-card.active{border-color:#dc2626;box-shadow:0 0 0 1px #dc2626}
    .ss-format-card:hover{transform:translateY(-2px)}
    .ss-format-icon{font-size:28px;margin-bottom:6px}
    .ss-format-name{font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:4px}
    .ss-format-details{display:flex;gap:8px;font-size:11px;color:var(--text-muted);margin-bottom:6px;flex-wrap:wrap}
    .ss-format-desc{font-size:12px;color:var(--text-muted);line-height:1.5}
    .ss-elements-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px}
    .ss-element-ref-card{background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px;padding:14px}
    .ss-el-ref-header{display:flex;justify-content:space-between;margin-bottom:6px}
    .ss-el-ref-label{font-size:13px;font-weight:600;color:var(--text-primary)}
    .ss-el-ref-shortcut{font-size:11px;color:#dc2626;font-family:monospace}
    .ss-el-ref-format{font-size:11px;color:var(--text-muted);margin-bottom:8px}
    .ss-el-ref-example{background:var(--bg-primary);border:1px solid var(--border);border-radius:6px;padding:10px;font-size:11px;color:var(--text-secondary);font-family:'Courier Prime','Courier New',monospace;white-space:pre-wrap;margin:0}
    /* Beats */
    .ss-beats-wrap{padding:20px;display:flex;flex-direction:column;gap:14px}
    .ss-beats-header{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px}
    .ss-beats-actions{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
    .ss-beats-board{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}
    .ss-beat-card{background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:6px;cursor:grab}
    .ss-beat-number{font-size:10px;color:var(--text-muted);font-weight:700}
    .ss-beat-name{font-size:13px;font-weight:600;color:var(--text-primary);outline:none;min-height:18px}
    .ss-beat-notes{background:var(--bg-primary);border:1px solid var(--border);border-radius:6px;padding:6px;font-size:11px;color:var(--text-secondary);resize:none;outline:none;font-family:'Inter',sans-serif}
    .ss-beat-footer{display:flex;justify-content:space-between;align-items:center}
    .ss-beat-color{background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;cursor:pointer;font-size:12px}
    .ss-beat-delete{background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:14px}
    .ss-beats-ai{display:flex;gap:8px;flex-wrap:wrap}
    /* Generators */
    .ss-gen-wrap{padding:20px;display:flex;flex-direction:column;gap:16px}
    .ss-gen-options{display:flex;flex-direction:column;gap:12px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;padding:16px}
    .ss-gen-row{display:flex;gap:12px}
    .ss-gen-row.two{display:grid;grid-template-columns:1fr 1fr}
    .ss-gen-group{display:flex;flex-direction:column;gap:6px;flex:1}
    .ss-gen-label{font-size:12px;font-weight:600;color:var(--text-muted)}
    .ss-gen-textarea{padding:10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);font-size:13px;resize:vertical;outline:none;font-family:'Inter',sans-serif}
    .ss-gen-textarea:focus{border-color:#dc2626}
    .ss-gen-types{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px}
    .ss-gen-type-btn{display:flex;align-items:flex-start;gap:12px;padding:14px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px;cursor:pointer;transition:all .2s;text-align:left}
    .ss-gen-type-btn:hover{border-color:#dc2626;transform:translateY(-2px)}
    .ss-gen-type-icon{font-size:24px;flex-shrink:0;margin-top:2px}
    .ss-gen-type-name{font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:3px}
    .ss-gen-type-desc{font-size:11px;color:var(--text-muted);line-height:1.4}
    .ss-gen-custom{background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:10px}
    /* Legends */
    .ss-legends-wrap{padding:20px;display:flex;flex-direction:column;gap:16px}
    .ss-era-filters{display:flex;gap:6px;flex-wrap:wrap}
    .ss-era-btn{padding:6px 12px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-muted);border-radius:16px;font-size:12px;cursor:pointer;transition:all .2s}
    .ss-era-btn.active{border-color:#dc2626;color:#dc2626;background:rgba(220,38,38,0.1)}
    .ss-legends-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}
    .ss-legend-card{background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:8px;transition:all .2s}
    .ss-legend-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.3)}
    .ss-legend-header{display:flex;align-items:center;gap:10px}
    .ss-legend-icon{font-size:28px;flex-shrink:0}
    .ss-legend-name{font-size:15px;font-weight:700;color:var(--text-primary)}
    .ss-legend-years{font-size:11px;color:var(--text-muted)}
    .ss-legend-oscars{margin-left:auto;font-size:14px}
    .ss-legend-style{font-size:12px;color:#dc2626;font-style:italic}
    .ss-legend-works{display:flex;gap:4px;flex-wrap:wrap}
    .ss-legend-work{padding:2px 7px;background:rgba(220,38,38,0.1);color:var(--text-muted);border-radius:6px;font-size:10px}
    .ss-legend-more{font-size:10px;color:var(--text-muted);padding:2px 4px}
    .ss-legend-technique{font-size:12px;color:var(--text-secondary);line-height:1.5}
    .ss-legend-actions{display:flex;gap:6px}
    /* Structure */
    .ss-struct-wrap{padding:20px;display:flex;flex-direction:column;gap:16px}
    .ss-struct-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
    .ss-struct-card{background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:10px}
    .ss-struct-header{display:flex;align-items:center;gap:10px}
    .ss-struct-icon{font-size:24px;flex-shrink:0}
    .ss-struct-name{font-size:15px;font-weight:700;color:var(--text-primary)}
    .ss-struct-desc{font-size:12px;color:var(--text-muted)}
    .ss-struct-source{font-size:11px;color:var(--text-muted);font-style:italic;padding-left:34px}
    .ss-struct-beats{display:flex;flex-wrap:wrap;gap:4px}
    .ss-struct-beat{display:flex;align-items:center;gap:4px;padding:3px 8px;background:var(--bg-primary);border:1px solid var(--border);border-radius:6px;font-size:11px}
    .ss-struct-beat-num{font-weight:700;color:#dc2626;font-size:10px}
    .ss-struct-beat-name{color:var(--text-muted)}
    .ss-struct-actions{display:flex;gap:6px}
    /* Production */
    .ss-prod-wrap{padding:20px;display:flex;flex-direction:column;gap:16px}
    .ss-prod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
    .ss-prod-card{background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:8px}
    .ss-prod-icon{font-size:32px}
    .ss-prod-name{font-size:14px;font-weight:600;color:var(--text-primary)}
    .ss-prod-desc{font-size:12px;color:var(--text-muted);line-height:1.5;flex:1}
  `;
  document.head.appendChild(style);
})();

// ── Export ─────────────────────────────────────────────────────────────────────
window.renderScriptStudio = renderScriptStudio;
window.switchSSTab = switchSSTab;
window.setSSGenre = setSSGenre;
window.selectSSFormat = selectSSFormat;
window.insertScriptElement = insertScriptElement;
window.updateSSWordCount = updateSSWordCount;
window.sendScriptToAI = sendScriptToAI;
window.analyzeScript = analyzeScript;
window.exportScript = exportScript;
window.generateScene = generateScene;
window.generateCustomScene = generateCustomScene;
window.writeAsLegend = writeAsLegend;
window.studyLegend = studyLegend;
window.legendPrompt = legendPrompt;
window.filterSSEra = filterSSEra;
window.loadStructureToBeatBoard = loadStructureToBeatBoard;
window.loadStructureBeats = loadStructureBeats;
window.addBeat = addBeat;
window.clearBeats = clearBeats;
window.beatsToScript = beatsToScript;
window.aiExpandBeats = aiExpandBeats;
window.aiBeatSuggestions = aiBeatSuggestions;
window.aiPaceAnalysis = aiPaceAnalysis;
window.aiStructureGuide = aiStructureGuide;
window.aiScriptBreakdown = aiScriptBreakdown;
window.aiShootingSchedule = aiShootingSchedule;
window.aiBudgetEstimate = aiBudgetEstimate;
window.aiCharacterBible = aiCharacterBible;
window.aiLocationReport = aiLocationReport;
window.aiPitchDeck = aiPitchDeck;
window.aiCoverageReport = aiCoverageReport;
window.showExportOptions = showExportOptions;
window.startWriterSprint = startWriterSprint;
window.toggleFocusMode = toggleFocusMode;