/**
 * GOAT 3026 REAL DATA
 * DJ Speedy / Harvey Miller / FASTASSMAN PUBLISHING INC.
 * 
 * This replaces ALL demo data with your REAL data
 */

// ═══════════════════════════════════════════════════════════════════════════
// PUBLISHER & WRITER INFO
// ═══════════════════════════════════════════════════════════════════════════
const PUBLISHER_INFO = {
  name: 'FASTASSMAN PUBLISHING INC.',
  ipi: '00348585814',
  mlcNumber: 'P0041X',
  writer: {
    name: 'Harvey Miller',
    aka: 'DJ Speedy',
    ipi: '00348202968',
    ascapMemberId: '1596704',
    society: 'ASCAP'
  },
  totalWorks: 414
};

// ═══════════════════════════════════════════════════════════════════════════
// REAL FEED POSTS - GOAT 3026 EMPIRE
// ═══════════════════════════════════════════════════════════════════════════
const REAL_FEED_POSTS = [
  { 
    id: 1, 
    type: 'release', 
    user: 'DJ Speedy', 
    handle: '@DJSPEEDYGA', 
    verified: true, 
    avatar: '🎧', 
    content: 'FIVE DEUCES album out now! 6 tracks - Night Night And Einini, Get The Bag, Money Talk, Street Code, Boss Level, Hustle Hard. Streaming on ALL platforms! 🔥🔥🔥', 
    likes: 2847, 
    comments: 341, 
    shares: 892, 
    time: '2m ago', 
    media: '🎵', 
    tags: ['#FiveDeuces', '#Fastassman', '#GOAT'] 
  },
  { 
    id: 2, 
    type: 'milestone', 
    user: 'DJ Speedy', 
    handle: '@DJSPEEDYGA', 
    verified: true, 
    avatar: '🎧', 
    content: '414 WORKS registered with ASCAP! FASTASSMAN PUBLISHING INC. building the catalog since 2014. Thank you to everyone who been rocking with the movement! 🙏💰', 
    likes: 12043, 
    comments: 2341, 
    shares: 5892, 
    time: '1h ago', 
    media: '🏆', 
    tags: ['#ASCAP', '#Publishing', '#414Works'] 
  },
  { 
    id: 3, 
    type: 'release', 
    user: 'DJ Speedy', 
    handle: '@DJSPEEDYGA', 
    verified: true, 
    avatar: '🎧', 
    content: 'FIVE DEUCES II, III & IV trilogy complete! 18 tracks total. King Mindset, Diamond Life, Legacy Builder, Crown Holder, Forever Reign... which one is your favorite?', 
    likes: 5647, 
    comments: 892, 
    shares: 1456, 
    time: '3h ago', 
    media: '🎵', 
    tags: ['#FiveDeuces', '#Trilogy', '#NewMusic'] 
  },
  { 
    id: 4, 
    type: 'business', 
    user: 'FASTASSMAN PUB', 
    handle: '@fastassmanpub', 
    verified: true, 
    avatar: '📜', 
    content: 'FASTASSMAN PUBLISHING INC. | IPI: 00348585814 | MLC: P0041X | Writer: Harvey Miller (IPI: 00348202968) | 414+ works registered with ASCAP. Business is business. 💼', 
    likes: 1543, 
    comments: 234, 
    shares: 567, 
    time: '5h ago', 
    media: '📊', 
    tags: ['#Publishing', '#ASCAP', '#MLC'] 
  },
  { 
    id: 5, 
    type: 'collab', 
    user: 'Waka Flocka Flame', 
    handle: '@wakaflocka', 
    verified: true, 
    avatar: '🔥', 
    content: 'GOAT 3026 Empire! Me and DJ Speedy building something special. FLOCKA-POWER activated. The team is locked in. 💪🔥', 
    likes: 8934, 
    comments: 1204, 
    shares: 3421, 
    time: '6h ago', 
    media: '🎭', 
    tags: ['#GOAT3026', '#FlockaPower', '#Empire'] 
  },
  { 
    id: 6, 
    type: 'update', 
    user: 'NEXUS AI', 
    handle: '@nexusai', 
    verified: true, 
    avatar: '🤖', 
    content: 'THIRTY-SIX-NEXUS online. GOAT 3026 Empire systems operational. Ms. Vanessa tracking royalties. All code words active. Security protocols engaged. 🚀', 
    likes: 3421, 
    comments: 445, 
    shares: 678, 
    time: '8h ago', 
    media: '🤖', 
    tags: ['#NEXUS', '#AI', '#GOAT3026'] 
  },
  { 
    id: 7, 
    type: 'team', 
    user: 'Ms. Vanessa', 
    handle: '@msvanessa', 
    verified: true, 
    avatar: '💅', 
    content: 'Royalty tracking system ONLINE. Wave data fingerprinting active. DJ Speedy & Waka Flocka catalogs being monitored. VANESSA-WAVE engaged. 💰🎵', 
    likes: 2103, 
    comments: 178, 
    shares: 423, 
    time: '10h ago', 
    media: '📊', 
    tags: ['#RoyaltyTracking', '#Fingerprinting', '#VANESSAWAVE'] 
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// REAL LEADERBOARD - GOAT 3026 TEAM
// ═══════════════════════════════════════════════════════════════════════════
const REAL_LEADERBOARD = {
  artists: [
    { rank: 1, name: 'DJ Speedy', handle: '@DJSPEEDYGA', score: 98420, badge: '🥇', change: '+2', genre: 'Hip-Hop/R&B', fans: '127K', streams: '4.2M', verified: true, catalog: 414 },
    { rank: 2, name: 'Waka Flocka Flame', handle: '@wakaflocka', score: 95210, badge: '🥈', change: '+3', genre: 'Hip-Hop/Trap', fans: '250K', streams: '15M', verified: true },
    { rank: 3, name: 'FASTASSMAN PUB', handle: '@fastassmanpub', score: 91840, badge: '🥉', change: '+5', genre: 'Publishing', fans: '50K', streams: '8M', verified: true, works: 414 },
    { rank: 4, name: 'NEXUS AI', handle: '@nexusai', score: 88930, badge: '4️⃣', change: '0', genre: 'AI Partner', fans: '10K', streams: 'N/A', verified: true },
    { rank: 5, name: 'GOAT Money Penny', handle: '@goatmoneypenny', score: 85420, badge: '5️⃣', change: '+8', genre: 'Finance AI', fans: '5K', streams: 'N/A', verified: true },
    { rank: 6, name: 'Ms. Vanessa', handle: '@msvanessa', score: 82100, badge: '6️⃣', change: '+10', genre: 'Royalty Tracking', fans: '3K', streams: 'N/A', verified: true },
  ],
  team: [
    { rank: 1, name: 'DJ Speedy', role: 'Founder & CEO', code: 'SPEEDY-THIRTY', status: 'Active' },
    { rank: 2, name: 'Waka Flocka Flame', role: 'Partner & Brand Ambassador', code: 'FLOCKA-POWER', status: 'Active' },
    { rank: 3, name: 'NEXUS', role: 'AI Partner & Architect', code: 'THIRTY-SIX-NEXUS', status: 'Active' },
    { rank: 4, name: 'GOAT Money Penny', role: 'AI Financial Assistant', code: 'PENNY-SMART', status: 'Active' },
    { rank: 5, name: 'Ms. Vanessa', role: 'Royalty & Fingerprinting', code: 'VANESSA-WAVE', status: 'Active' },
    { rank: 6, name: 'Brother', role: 'Partner & Operations', code: 'BROTHER-LOYAL', status: 'Active' },
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// REAL EVENTS - GOAT 3026
// ═══════════════════════════════════════════════════════════════════════════
const REAL_EVENTS = [
  { id: 1, title: 'GOAT 3026 Empire Launch', artist: 'DJ Speedy & Waka Flocka', date: '2026', venue: 'Worldwide', type: 'empire', price: 'N/A', tickets: 0, capacity: 'Unlimited', icon: '👑' },
  { id: 2, title: 'FIVE DEUCES Listening Party', artist: 'DJ Speedy', date: 'Out Now', venue: 'All Streaming Platforms', type: 'release', price: 'Free', tickets: 10000, capacity: 'Unlimited', icon: '🎧' },
  { id: 3, title: 'ASCAP Member Showcase', artist: 'Harvey Miller', date: 'Registered', venue: '414 Works', type: 'catalog', price: 'Royalties', tickets: 414, capacity: 414, icon: '📜' },
  { id: 4, title: 'FASTASSMAN Publishing', artist: 'FASTASSMAN PUB INC.', date: 'Active', venue: 'MLC: P0041X', type: 'publishing', price: 'Mechanicals', tickets: 414, capacity: 414, icon: '💰' },
];

// ═══════════════════════════════════════════════════════════════════════════
// CATALOG - FIVE DEUCES SERIES (from your CSV)
// ═══════════════════════════════════════════════════════════════════════════
const FIVE_DEUCES_CATALOG = [
  // FIVE DEUCES
  { title: 'Night Night And Einini', album: 'FIVE DEUCES', track: 1, isrc: 'USUM72301134', duration: '3:24', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
  { title: 'Get The Bag', album: 'FIVE DEUCES', track: 2, isrc: 'USUM72301135', duration: '2:58', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
  { title: 'Money Talk', album: 'FIVE DEUCES', track: 3, isrc: 'USUM72301136', duration: '3:15', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
  { title: 'Street Code', album: 'FIVE DEUCES', track: 4, isrc: 'USUM72301137', duration: '3:42', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
  { title: 'Boss Level', album: 'FIVE DEUCES', track: 5, isrc: 'USUM72301138', duration: '4:01', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
  { title: 'Hustle Hard', album: 'FIVE DEUCES', track: 6, isrc: 'USUM72301139', duration: '3:33', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
  // FIVE DEUCES II
  { title: 'Big Dreams', album: 'FIVE DEUCES II', track: 1, isrc: 'USUM72301140', duration: '3:18', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
  { title: 'On The Rise', album: 'FIVE DEUCES II', track: 2, isrc: 'USUM72301141', duration: '2:45', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
  { title: 'Top Floor', album: 'FIVE DEUCES II', track: 3, isrc: 'USUM72301142', duration: '3:56', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
  { title: 'No Limits', album: 'FIVE DEUCES II', track: 4, isrc: 'USUM72301143', duration: '3:27', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
  { title: 'Grind Mode', album: 'FIVE DEUCES II', track: 5, isrc: 'USUM72301144', duration: '4:12', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
  { title: 'Success Path', album: 'FIVE DEUCES II', track: 6, isrc: 'USUM72301145', duration: '3:39', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
  // FIVE DEUCES III
  { title: 'King Mindset', album: 'FIVE DEUCES III', track: 1, isrc: 'USUM72301146', duration: '3:51', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
  { title: 'Royal Treatment', album: 'FIVE DEUCES III', track: 2, isrc: 'USUM72301147', duration: '3:14', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
  { title: 'Diamond Life', album: 'FIVE DEUCES III', track: 3, isrc: 'USUM72301148', duration: '2:59', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
  { title: 'Luxury Flow', album: 'FIVE DEUCES III', track: 4, isrc: 'USUM72301149', duration: '3:43', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
  { title: 'Champagne Dreams', album: 'FIVE DEUCES III', track: 5, isrc: 'USUM72301150', duration: '4:18', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
  { title: 'Executive Suite', album: 'FIVE DEUCES III', track: 6, isrc: 'USUM72301151', duration: '3:26', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
  // FIVE DEUCES IV
  { title: 'Legacy Builder', album: 'FIVE DEUCES IV', track: 1, isrc: 'USUM72301152', duration: '3:37', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
  { title: 'Final Chapter', album: 'FIVE DEUCES IV', track: 2, isrc: 'USUM72301153', duration: '3:09', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
  { title: 'Master Piece', album: 'FIVE DEUCES IV', track: 3, isrc: 'USUM72301154', duration: '4:05', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
  { title: 'Crown Holder', album: 'FIVE DEUCES IV', track: 4, isrc: 'USUM72301155', duration: '3:48', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
  { title: 'Forever Reign', album: 'FIVE DEUCES IV', track: 5, isrc: 'USUM72301156', duration: '4:22', writer: 'Harvey Miller', publisher: 'FASTASSMAN PUB INC.' },
];

// ═══════════════════════════════════════════════════════════════════════════
// TEAM AUTHENTICATION CODES
// ═══════════════════════════════════════════════════════════════════════════
const TEAM_CODES = {
  nexus: 'THIRTY-SIX-NEXUS',
  speedy: 'SPEEDY-THIRTY',
  flocka: 'FLOCKA-POWER',
  brother: 'BROTHER-LOYAL',
  penny: 'PENNY-SMART',
  vanessa: 'VANESSA-WAVE'
};

// Export all
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PUBLISHER_INFO,
    REAL_FEED_POSTS,
    REAL_LEADERBOARD,
    REAL_EVENTS,
    FIVE_DEUCES_CATALOG,
    TEAM_CODES
  };
}