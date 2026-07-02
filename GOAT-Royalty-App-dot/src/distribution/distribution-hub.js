// ============================================================
// GOAT Distribution Hub — DSP Database & Release Management
// 50+ Digital Service Providers · Release Tracker · Analytics
// Built for Harvey Miller (DJ Speedy)
// ============================================================

const GOATDistributionHub = (() => {
  // ─── DSP DATABASE (50+ Platforms) ─────────────────────────
  const DSP_DATABASE = [
    // Tier 1 — Major Streaming
    { id: 'spotify', name: 'Spotify', category: 'streaming', payRate: 0.00437, payModel: 'per-stream', icon: '🟢', reach: '600M+ users', territories: 'Global (184 markets)', submitUrl: 'https://artists.spotify.com', features: ['Spotify for Artists', 'Canvas', 'Marquee', 'Discovery Mode', 'Clips'], formatReq: 'WAV/FLAC 16-bit 44.1kHz+', deliveryTime: '5-7 days', tier: 1 },
    { id: 'apple_music', name: 'Apple Music', category: 'streaming', payRate: 0.00783, payModel: 'per-stream', icon: '🍎', reach: '100M+ subscribers', territories: 'Global (175 countries)', submitUrl: 'https://artists.apple.com', features: ['Apple Music for Artists', 'Spatial Audio', 'Lossless', 'MusicKit', 'Shazam'], formatReq: 'WAV/FLAC 24-bit 96kHz recommended', deliveryTime: '3-5 days', tier: 1 },
    { id: 'youtube_music', name: 'YouTube Music', category: 'streaming', payRate: 0.00274, payModel: 'per-stream', icon: '🔴', reach: '80M+ subscribers', territories: 'Global (100+ countries)', submitUrl: 'https://artists.youtube.com', features: ['YouTube Studio', 'Content ID', 'Shorts', 'Community', 'Premieres'], formatReq: 'WAV/FLAC 16-bit 44.1kHz+', deliveryTime: '3-5 days', tier: 1 },
    { id: 'amazon_music', name: 'Amazon Music', category: 'streaming', payRate: 0.00402, payModel: 'per-stream', icon: '📦', reach: '100M+ users', territories: 'Global (50+ countries)', submitUrl: 'https://artists.amazonmusic.com', features: ['Amazon Music for Artists', 'HD Audio', 'Alexa Integration', 'Twitch'], formatReq: 'WAV/FLAC 16-bit 44.1kHz+', deliveryTime: '5-7 days', tier: 1 },
    { id: 'tidal', name: 'Tidal', category: 'streaming', payRate: 0.01284, payModel: 'per-stream', icon: '🌊', reach: '5M+ subscribers', territories: 'Global (60+ countries)', submitUrl: 'https://artists.tidal.com', features: ['Tidal for Artists', 'HiFi Plus', 'Dolby Atmos', 'Direct Artist Payouts'], formatReq: 'WAV/FLAC 24-bit 96kHz+ (MQA)', deliveryTime: '5-7 days', tier: 1 },
    { id: 'deezer', name: 'Deezer', category: 'streaming', payRate: 0.00436, payModel: 'per-stream', icon: '🎵', reach: '16M+ subscribers', territories: 'Global (180+ countries)', submitUrl: 'https://artists.deezer.com', features: ['Deezer for Creators', 'Flow', 'HiFi', 'SongCatcher'], formatReq: 'WAV/FLAC 16-bit 44.1kHz+', deliveryTime: '5-7 days', tier: 1 },

    // Tier 2 — Growing Platforms
    { id: 'tiktok', name: 'TikTok / Resso', category: 'social', payRate: 0.00069, payModel: 'per-creation', icon: '🎶', reach: '1B+ users', territories: 'Global', submitUrl: 'https://www.tiktok.com/creators', features: ['Sound Library', 'Promote', 'Creator Fund', 'LIVE', 'Series'], formatReq: 'WAV/FLAC 16-bit 44.1kHz', deliveryTime: '3-5 days', tier: 2 },
    { id: 'instagram_reels', name: 'Instagram / Reels', category: 'social', payRate: 0.00055, payModel: 'per-use', icon: '📸', reach: '2B+ users', territories: 'Global', submitUrl: 'https://www.instagram.com/accounts/professional', features: ['Reels Audio', 'Stories Music', 'IG Live'], formatReq: 'Via distributor', deliveryTime: '3-5 days', tier: 2 },
    { id: 'facebook', name: 'Facebook / Meta', category: 'social', payRate: 0.00055, payModel: 'per-use', icon: '📘', reach: '3B+ users', territories: 'Global', submitUrl: 'https://www.facebook.com/creators', features: ['Music in Stories', 'Reels Audio', 'Lip Sync Live'], formatReq: 'Via distributor', deliveryTime: '3-5 days', tier: 2 },
    { id: 'soundcloud', name: 'SoundCloud', category: 'streaming', payRate: 0.00350, payModel: 'fan-powered', icon: '☁️', reach: '300M+ listeners', territories: 'Global', submitUrl: 'https://artists.soundcloud.com', features: ['SoundCloud for Artists', 'Fan-Powered Royalties', 'Repost', 'Go+', 'Next Pro'], formatReq: 'WAV/FLAC/MP3 320kbps', deliveryTime: 'Instant (direct)', tier: 2 },
    { id: 'pandora', name: 'Pandora', category: 'streaming', payRate: 0.00133, payModel: 'per-stream', icon: '📻', reach: '50M+ listeners', territories: 'US, AUS, NZ', submitUrl: 'https://amp.pandora.com', features: ['AMP Platform', 'Artist Audio Messages', 'Stories'], formatReq: 'WAV/FLAC', deliveryTime: '5-7 days', tier: 2 },
    { id: 'audiomack', name: 'Audiomack', category: 'streaming', payRate: 0.00210, payModel: 'per-stream', icon: '🎧', reach: '20M+ monthly users', territories: 'Global (focus Africa, US)', submitUrl: 'https://audiomack.com/upload', features: ['Audiomack for Artists', 'Trending', 'Monetization'], formatReq: 'MP3/WAV/FLAC', deliveryTime: 'Instant (direct)', tier: 2 },
    { id: 'bandcamp', name: 'Bandcamp', category: 'direct-sales', payRate: null, payModel: 'direct-sale (85%)', icon: '💿', reach: '10M+ fans', territories: 'Global', submitUrl: 'https://bandcamp.com/artists', features: ['Direct Fan Sales', 'Bandcamp Fridays', 'Merch', 'Vinyl', 'Subscriptions'], formatReq: 'WAV/FLAC/AIFF', deliveryTime: 'Instant (direct)', tier: 2 },

    // Tier 3 — Regional & Niche
    { id: 'qq_music', name: 'QQ Music (Tencent)', category: 'streaming', payRate: 0.00100, payModel: 'per-stream', icon: '🇨🇳', reach: '800M+ users', territories: 'China', submitUrl: 'https://y.qq.com', features: ['China #1 Music Platform', 'Karaoke', 'Fan Community'], formatReq: 'WAV/FLAC', deliveryTime: '7-14 days', tier: 3 },
    { id: 'netease', name: 'NetEase Cloud Music', category: 'streaming', payRate: 0.00090, payModel: 'per-stream', icon: '🇨🇳', reach: '200M+ users', territories: 'China', submitUrl: 'https://music.163.com', features: ['Social Features', 'Lyrics Community', 'Mlog'], formatReq: 'WAV/FLAC', deliveryTime: '7-14 days', tier: 3 },
    { id: 'jiosaavn', name: 'JioSaavn', category: 'streaming', payRate: 0.00150, payModel: 'per-stream', icon: '🇮🇳', reach: '100M+ users', territories: 'India, South Asia', submitUrl: 'https://www.jiosaavn.com/corporate/artists', features: ['JioSaavn for Artists', 'Podcasts', 'Original Series'], formatReq: 'WAV/FLAC', deliveryTime: '5-7 days', tier: 3 },
    { id: 'gaana', name: 'Gaana', category: 'streaming', payRate: 0.00120, payModel: 'per-stream', icon: '🇮🇳', reach: '185M+ users', territories: 'India', submitUrl: 'https://gaana.com', features: ['Gaana Hotshots', 'Sufi', 'Devotional'], formatReq: 'WAV/FLAC', deliveryTime: '5-7 days', tier: 3 },
    { id: 'anghami', name: 'Anghami', category: 'streaming', payRate: 0.00300, payModel: 'per-stream', icon: '🇱🇧', reach: '70M+ users', territories: 'MENA Region', submitUrl: 'https://artists.anghami.com', features: ['MENA Leader', 'Podcasts', 'Videos'], formatReq: 'WAV/FLAC', deliveryTime: '5-7 days', tier: 3 },
    { id: 'boomplay', name: 'Boomplay', category: 'streaming', payRate: 0.00150, payModel: 'per-stream', icon: '🌍', reach: '80M+ users', territories: 'Africa', submitUrl: 'https://www.boomplay.com/artists', features: ['Africa #1 Platform', 'Boomplay for Artists'], formatReq: 'MP3/WAV', deliveryTime: '5-7 days', tier: 3 },
    { id: 'yandex_music', name: 'Yandex Music', category: 'streaming', payRate: 0.00200, payModel: 'per-stream', icon: '🇷🇺', reach: '25M+ subscribers', territories: 'Russia, CIS', submitUrl: 'https://music.yandex.ru', features: ['Russia Leader', 'Alice Integration', 'Podcasts'], formatReq: 'WAV/FLAC', deliveryTime: '5-7 days', tier: 3 },
    { id: 'melon', name: 'Melon', category: 'streaming', payRate: 0.00300, payModel: 'per-stream', icon: '🇰🇷', reach: '28M+ users', territories: 'South Korea', submitUrl: 'https://www.melon.com', features: ['Korea #1 Chart', 'K-Pop Hub', 'Lyrics'], formatReq: 'WAV/FLAC', deliveryTime: '7 days', tier: 3 },
    { id: 'line_music', name: 'LINE Music', category: 'streaming', payRate: 0.00250, payModel: 'per-stream', icon: '🇯🇵', reach: '10M+ subscribers', territories: 'Japan', submitUrl: 'https://music.line.me', features: ['Japan Top Platform', 'LINE Integration', 'Karaoke'], formatReq: 'WAV/FLAC', deliveryTime: '7 days', tier: 3 },
    { id: 'awa', name: 'AWA', category: 'streaming', payRate: 0.00220, payModel: 'per-stream', icon: '🇯🇵', reach: '5M+ users', territories: 'Japan', submitUrl: 'https://awa.fm', features: ['Japan Streaming', 'Lounge', 'AI Radio'], formatReq: 'WAV/FLAC', deliveryTime: '7 days', tier: 3 },

    // Tier 4 — Distribution Aggregators
    { id: 'distrokid', name: 'DistroKid', category: 'distributor', payRate: null, payModel: 'Annual fee ($22.99/yr)', icon: '🚀', reach: 'Distributes to 150+ stores', territories: 'Global', submitUrl: 'https://distrokid.com', features: ['Unlimited Uploads', 'HyperFollow', 'Teams', 'Splits', 'Lyrics'], formatReq: 'WAV 16-bit 44.1kHz+', deliveryTime: '1-5 days', tier: 4 },
    { id: 'tunecore', name: 'TuneCore', category: 'distributor', payRate: null, payModel: 'Per-release fee', icon: '📀', reach: 'Distributes to 150+ stores', territories: 'Global', submitUrl: 'https://www.tunecore.com', features: ['Publishing Admin', 'Social Distribution', 'Splits', 'YouTube Monetization'], formatReq: 'WAV 16-bit 44.1kHz+', deliveryTime: '3-7 days', tier: 4 },
    { id: 'cdbaby', name: 'CD Baby', category: 'distributor', payRate: null, payModel: 'One-time fee ($9.95-$29)', icon: '💿', reach: 'Distributes to 150+ stores', territories: 'Global', submitUrl: 'https://cdbaby.com', features: ['Physical Distribution', 'Publishing', 'Sync Licensing', 'Pro Publishing'], formatReq: 'WAV 16-bit 44.1kHz+', deliveryTime: '5-14 days', tier: 4 },
    { id: 'unitedmasters', name: 'UnitedMasters', category: 'distributor', payRate: null, payModel: 'Free tier + Select ($5/mo)', icon: '🔥', reach: 'Distributes to 100+ stores', territories: 'Global', submitUrl: 'https://unitedmasters.com', features: ['Brand Partnerships', 'NBA/NFL Sync', 'Select Program', 'Marketing Tools'], formatReq: 'WAV 16-bit 44.1kHz+', deliveryTime: '3-7 days', tier: 4 },
    { id: 'amuse', name: 'Amuse', category: 'distributor', payRate: null, payModel: 'Free tier + Pro ($24.99/yr)', icon: '🎯', reach: 'Distributes to 100+ stores', territories: 'Global', submitUrl: 'https://amuse.io', features: ['Free Distribution', 'A&R Scouting', 'Fast Friday', 'Pro Analytics'], formatReq: 'WAV/FLAC', deliveryTime: '2-7 days', tier: 4 },
    { id: 'landr', name: 'LANDR', category: 'distributor', payRate: null, payModel: 'Plans from $12.49/yr', icon: '🎚️', reach: 'Distributes to 150+ stores', territories: 'Global', submitUrl: 'https://www.landr.com/distribution', features: ['AI Mastering', 'Distribution', 'Samples', 'Plugins', 'Collaboration'], formatReq: 'WAV 16-bit 44.1kHz+', deliveryTime: '3-7 days', tier: 4 },
    { id: 'ditto', name: 'Ditto Music', category: 'distributor', payRate: null, payModel: 'Annual plans from $19/yr', icon: '📡', reach: 'Distributes to 150+ stores', territories: 'Global', submitUrl: 'https://www.dittomusic.com', features: ['Record Label Services', 'Ditto Analytics', 'Playlist Pitching', 'Sync'], formatReq: 'WAV 16-bit 44.1kHz+', deliveryTime: '3-7 days', tier: 4 },
    { id: 'symphonic', name: 'Symphonic Distribution', category: 'distributor', payRate: null, payModel: 'Selective (apply)', icon: '🎻', reach: 'Distributes to 100+ stores', territories: 'Global', submitUrl: 'https://symphonic.com', features: ['Label Services', 'Sync Licensing', 'Marketing', 'Analytics'], formatReq: 'WAV 16-bit 44.1kHz+', deliveryTime: '5-10 days', tier: 4 },
    { id: 'stem', name: 'Stem', category: 'distributor', payRate: null, payModel: 'Free (takes 0%)', icon: '🌱', reach: 'Distributes to major DSPs', territories: 'Global', submitUrl: 'https://stem.is', features: ['Transparent Splits', 'Banking Integration', 'Analytics', 'Advances'], formatReq: 'WAV', deliveryTime: '3-7 days', tier: 4 },
    { id: 'indiefy', name: 'Indiefy', category: 'distributor', payRate: null, payModel: 'Free tier available', icon: '🎸', reach: 'Distributes to 100+ stores', territories: 'Global', submitUrl: 'https://www.indiefy.com', features: ['Free Uploads', 'Playlist Pitching', 'Pre-Save Pages'], formatReq: 'WAV/MP3', deliveryTime: '3-7 days', tier: 4 },

    // Tier 5 — Specialty & Sync
    { id: 'beatport', name: 'Beatport', category: 'specialty', payRate: null, payModel: 'Per-sale commission', icon: '🔊', reach: '40M+ visitors', territories: 'Global', submitUrl: 'https://www.beatport.com', features: ['DJ/Electronic Focus', 'Charts', 'DJ Tools', 'LINK'], formatReq: 'WAV/AIFF', deliveryTime: '7-14 days', tier: 5 },
    { id: 'traxsource', name: 'Traxsource', category: 'specialty', payRate: null, payModel: 'Per-sale commission', icon: '🎛️', reach: 'House/Dance community', territories: 'Global', submitUrl: 'https://www.traxsource.com', features: ['House/Dance Focus', 'Charts', 'DJ Promos'], formatReq: 'WAV/AIFF', deliveryTime: '7-14 days', tier: 5 },
    { id: 'juno', name: 'Juno Download', category: 'specialty', payRate: null, payModel: 'Per-sale commission', icon: '🎧', reach: 'Electronic music community', territories: 'Global', submitUrl: 'https://www.junodownload.com', features: ['Electronic Focus', 'DJ Charts', 'Pre-orders'], formatReq: 'WAV/AIFF/MP3', deliveryTime: '7 days', tier: 5 },
    { id: 'artlist', name: 'Artlist', category: 'sync', payRate: null, payModel: 'Sync license fees', icon: '🎬', reach: 'Filmmakers/Creators', territories: 'Global', submitUrl: 'https://artlist.io/artists', features: ['Sync Licensing', 'Music for Video', 'SFX', 'Footage'], formatReq: 'WAV 24-bit', deliveryTime: 'Review process', tier: 5 },
    { id: 'epidemic_sound', name: 'Epidemic Sound', category: 'sync', payRate: null, payModel: 'Sync license + royalty', icon: '🔈', reach: 'Content Creators', territories: 'Global', submitUrl: 'https://www.epidemicsound.com/music/artists', features: ['Royalty-Free Licensing', 'YouTube Safe', 'Stem Downloads'], formatReq: 'WAV 24-bit 48kHz', deliveryTime: 'Review process', tier: 5 },
    { id: 'musicbed', name: 'Musicbed', category: 'sync', payRate: null, payModel: 'Sync license fees', icon: '🎞️', reach: 'Filmmakers/Agencies', territories: 'Global', submitUrl: 'https://www.musicbed.com/artists', features: ['Premium Sync', 'Film/Commercial Focus', 'Curated'], formatReq: 'WAV 24-bit 48kHz+', deliveryTime: 'Curated selection', tier: 5 },
    { id: 'songtradr', name: 'Songtradr', category: 'sync', payRate: null, payModel: 'Sync license fees', icon: '🎼', reach: 'Brands/Media', territories: 'Global', submitUrl: 'https://www.songtradr.com', features: ['AI Matching', 'B2B Sync', 'Bandcamp Integration'], formatReq: 'WAV/FLAC', deliveryTime: 'Review process', tier: 5 },

    // Tier 6 — Additional Platforms
    { id: 'napster', name: 'Napster', category: 'streaming', payRate: 0.01900, payModel: 'per-stream', icon: '🎵', reach: '5M+ users', territories: 'Global (33 countries)', submitUrl: 'https://www.napster.com', features: ['Highest Per-Stream Rate', 'HiFi Audio'], formatReq: 'WAV/FLAC', deliveryTime: '5-7 days', tier: 6 },
    { id: 'iheart', name: 'iHeartRadio', category: 'radio', payRate: 0.00120, payModel: 'per-stream', icon: '📻', reach: '30M+ monthly', territories: 'US, CAN, AUS, NZ', submitUrl: 'https://www.iheart.com', features: ['Radio Airplay', 'Podcasts', 'Events'], formatReq: 'Via distributor', deliveryTime: '5-7 days', tier: 6 },
    { id: 'tencent', name: 'Tencent Music (TME)', category: 'streaming', payRate: 0.00100, payModel: 'per-stream', icon: '🇨🇳', reach: '800M+ users (combined)', territories: 'China', submitUrl: 'https://www.tencentmusic.com', features: ['QQ Music + Kugou + Kuwo', 'China Gateway'], formatReq: 'WAV/FLAC', deliveryTime: '7-14 days', tier: 6 },
    { id: 'snap', name: 'Snapchat Sounds', category: 'social', payRate: 0.00030, payModel: 'per-use', icon: '👻', reach: '750M+ users', territories: 'Global', submitUrl: 'https://www.snapchat.com/sounds', features: ['Spotlight', 'Stories Music', 'Lens Studio'], formatReq: 'Via distributor', deliveryTime: '3-5 days', tier: 6 },
    { id: 'peloton', name: 'Peloton', category: 'fitness', payRate: 0.00800, payModel: 'per-stream', icon: '🚴', reach: '7M+ members', territories: 'US, UK, CAN, DE, AUS', submitUrl: 'https://www.onepeloton.com', features: ['Fitness Sync', 'High Pay Rate', 'Instructor Features'], formatReq: 'Via distributor/sync', deliveryTime: 'Varies', tier: 6 },
    { id: 'trebel', name: 'Trebel', category: 'streaming', payRate: 0.00200, payModel: 'ad-supported', icon: '📲', reach: '15M+ users', territories: 'Latin America, US', submitUrl: 'https://www.trebel.io', features: ['Free Downloads', 'Offline Listening', 'Latin Focus'], formatReq: 'Via distributor', deliveryTime: '5-7 days', tier: 6 },
    { id: 'kkbox', name: 'KKBOX', category: 'streaming', payRate: 0.00300, payModel: 'per-stream', icon: '🇹🇼', reach: '10M+ users', territories: 'Taiwan, HK, Japan, SE Asia', submitUrl: 'https://www.kkbox.com', features: ['Asia Pacific Leader', 'KKBOX Music Awards', 'Lyrics'], formatReq: 'WAV/FLAC', deliveryTime: '7 days', tier: 6 },
    { id: 'shazam', name: 'Shazam', category: 'discovery', payRate: null, payModel: 'Discovery/funnel', icon: '🔍', reach: '200M+ monthly users', territories: 'Global', submitUrl: 'https://artists.apple.com', features: ['Music ID', 'Pre-Save', 'Discovery Charts', 'Apple Music Link'], formatReq: 'Auto via Apple Music', deliveryTime: 'Automatic', tier: 6 },
    { id: 'genius', name: 'Genius', category: 'lyrics', payRate: null, payModel: 'Promotional', icon: '📝', reach: '100M+ monthly', territories: 'Global', submitUrl: 'https://genius.com/artists', features: ['Lyrics Database', 'Annotations', 'Verified Artists', 'Behind the Lyrics'], formatReq: 'Text/metadata', deliveryTime: 'Instant (direct)', tier: 6 },
  ];

  // ─── RELEASE TEMPLATES ────────────────────────────────────
  const RELEASE_TYPES = [
    { id: 'single', name: 'Single', tracks: '1-3', icon: '🎵', description: 'Standard single release, 1-3 tracks' },
    { id: 'ep', name: 'EP', tracks: '4-6', icon: '💿', description: 'Extended play, 4-6 tracks' },
    { id: 'album', name: 'Album', tracks: '7-25', icon: '📀', description: 'Full album release, 7-25 tracks' },
    { id: 'deluxe', name: 'Deluxe Album', tracks: '15-35', icon: '🌟', description: 'Deluxe edition with bonus tracks' },
    { id: 'compilation', name: 'Compilation', tracks: '10-50', icon: '📚', description: 'Best-of or compilation album' },
    { id: 'mixtape', name: 'Mixtape', tracks: '8-20', icon: '📼', description: 'Mixtape / free release' },
  ];

  // ─── GENRE CODES (DDEX standard) ─────────────────────────
  const GENRE_CODES = [
    'Hip-Hop/Rap', 'R&B/Soul', 'Pop', 'Rock', 'Electronic/Dance', 'Country',
    'Jazz', 'Classical', 'Latin', 'Reggae/Dancehall', 'Gospel/Christian',
    'Alternative', 'Indie', 'Metal', 'Punk', 'Blues', 'Folk', 'World',
    'Afrobeats', 'K-Pop', 'J-Pop', 'Trap', 'Drill', 'Lo-Fi', 'Ambient',
    'House', 'Techno', 'Drum & Bass', 'Dubstep', 'Phonk', 'Reggaeton',
    'Bachata', 'Salsa', 'Cumbia', 'Soca', 'Zouk', 'Amapiano',
    'Grime', 'UK Garage', 'Jungle', 'Breakbeat', 'Synthwave', 'Vaporwave',
    'Neo-Soul', 'Funk', 'Disco', 'Spoken Word', 'Soundtrack', 'Children'
  ];

  // ─── RELEASE CHECKLIST ────────────────────────────────────
  const RELEASE_CHECKLIST = [
    { id: 'master', label: 'Final masters ready (WAV/FLAC 24-bit)', category: 'Audio' },
    { id: 'metadata', label: 'Complete metadata (ISRC, UPC, credits)', category: 'Metadata' },
    { id: 'artwork', label: 'Cover art (3000x3000px, RGB, JPG/PNG)', category: 'Artwork' },
    { id: 'lyrics', label: 'Lyrics submitted (clean + explicit flags)', category: 'Metadata' },
    { id: 'splits', label: 'Songwriter splits agreed & documented', category: 'Legal' },
    { id: 'publishing', label: 'Publishing registered (BMI/ASCAP/SESAC)', category: 'Legal' },
    { id: 'distributor', label: 'Distributor selected & account set up', category: 'Distribution' },
    { id: 'release_date', label: 'Release date set (4+ weeks out)', category: 'Planning' },
    { id: 'presave', label: 'Pre-save link created', category: 'Marketing' },
    { id: 'playlist_pitch', label: 'Editorial playlist pitch submitted', category: 'Marketing' },
    { id: 'social_content', label: 'Social media content ready (30 posts)', category: 'Marketing' },
    { id: 'press_kit', label: 'Press kit / EPK prepared', category: 'Marketing' },
    { id: 'music_video', label: 'Music video planned/shot', category: 'Visual' },
    { id: 'merch', label: 'Merchandise designed for release', category: 'Merch' },
  ];

  // ─── RENDER ───────────────────────────────────────────────
  function render(container) {
    container.innerHTML = `
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:42px;margin-bottom:6px">🚀</div>
        <h3 style="font-size:18px;background:linear-gradient(135deg,#76B900,var(--cyan));-webkit-background-clip:text;-webkit-text-fill-color:transparent">GOAT Distribution Hub</h3>
        <p style="font-size:12px;color:var(--text-muted)">50+ DSPs · Release Management · Global Distribution</p>
      </div>

      <!-- Tabs -->
      <div style="display:flex;gap:4px;margin-bottom:16px;background:var(--bg-primary);border-radius:var(--radius-sm);padding:4px">
        <button class="dist-tab active" data-dist-tab="platforms" style="flex:1;padding:8px;border:none;border-radius:var(--radius-sm);background:var(--accent);color:white;cursor:pointer;font-size:12px;font-weight:600">🌐 Platforms</button>
        <button class="dist-tab" data-dist-tab="release" style="flex:1;padding:8px;border:none;border-radius:var(--radius-sm);background:transparent;color:var(--text-secondary);cursor:pointer;font-size:12px;font-weight:600">📦 New Release</button>
        <button class="dist-tab" data-dist-tab="calculator" style="flex:1;padding:8px;border:none;border-radius:var(--radius-sm);background:transparent;color:var(--text-secondary);cursor:pointer;font-size:12px;font-weight:600">💰 Calculator</button>
        <button class="dist-tab" data-dist-tab="checklist" style="flex:1;padding:8px;border:none;border-radius:var(--radius-sm);background:transparent;color:var(--text-secondary);cursor:pointer;font-size:12px;font-weight:600">✅ Checklist</button>
      </div>

      <!-- Content -->
      <div id="distContent">${renderPlatformsTab()}</div>
    `;

    // Tab switching
    container.querySelectorAll('.dist-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.dist-tab').forEach(t => { t.style.background = 'transparent'; t.style.color = 'var(--text-secondary)'; t.classList.remove('active'); });
        tab.style.background = 'var(--accent)'; tab.style.color = 'white'; tab.classList.add('active');
        const target = tab.getAttribute('data-dist-tab');
        const content = document.getElementById('distContent');
        if (target === 'platforms') content.innerHTML = renderPlatformsTab();
        else if (target === 'release') content.innerHTML = renderReleaseTab();
        else if (target === 'calculator') content.innerHTML = renderCalculatorTab();
        else if (target === 'checklist') content.innerHTML = renderChecklistTab();
      });
    });
  }

  function renderPlatformsTab() {
    const tiers = [
      { id: 1, name: '🏆 Tier 1 — Major Streaming', color: '#76B900' },
      { id: 2, name: '📈 Tier 2 — Growing Platforms', color: 'var(--cyan)' },
      { id: 3, name: '🌏 Tier 3 — Regional & Niche', color: 'var(--orange)' },
      { id: 4, name: '🚀 Tier 4 — Distributors', color: 'var(--accent)' },
      { id: 5, name: '🎬 Tier 5 — Specialty & Sync', color: '#dc2626' },
      { id: 6, name: '📡 Tier 6 — Additional Platforms', color: 'var(--blue)' },
    ];

    let html = `<input type="text" class="terminal-input" placeholder="Search ${DSP_DATABASE.length} platforms..." style="width:100%;margin-bottom:12px" oninput="window._distSearch(this.value)">
      <div style="font-size:11px;color:var(--text-muted);margin-bottom:12px">${DSP_DATABASE.length} platforms indexed · Click any platform for details</div>
      <div id="distPlatformList">`;

    tiers.forEach(tier => {
      const platforms = DSP_DATABASE.filter(p => p.tier === tier.id);
      html += `<div style="margin-bottom:16px">
        <h4 style="font-size:12px;color:${tier.color};margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">${tier.name}</h4>
        <div style="display:grid;gap:6px">`;
      platforms.forEach(p => {
        html += `<div class="dist-platform-card" style="padding:10px 12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;transition:all 0.2s" onmouseenter="this.style.borderColor='var(--accent)'" onmouseleave="this.style.borderColor='var(--border)'" onclick="window._distShowPlatform('${p.id}')">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:18px">${p.icon}</span>
              <div>
                <div style="font-weight:600;font-size:13px;color:var(--text-primary)">${p.name}</div>
                <div style="font-size:11px;color:var(--text-muted)">${p.reach}</div>
              </div>
            </div>
            <div style="text-align:right">
              ${p.payRate ? `<div style="font-weight:700;color:var(--green);font-size:13px">$${p.payRate.toFixed(5)}</div>
              <div style="font-size:10px;color:var(--text-muted)">${p.payModel}</div>` : `<div style="font-size:11px;color:var(--text-muted)">${p.payModel}</div>`}
            </div>
          </div>
        </div>`;
      });
      html += '</div></div>';
    });
    html += '</div>';
    return html;
  }

  function renderReleaseTab() {
    return `
      <h4 style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">📦 Create New Release</h4>
      <div style="display:grid;gap:10px">
        <div><label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Release Title</label><input type="text" class="terminal-input" id="distReleaseTitle" placeholder="Enter release title..." style="width:100%"></div>
        <div><label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Artist Name</label><input type="text" class="terminal-input" id="distArtistName" placeholder="DJ Speedy" value="DJ Speedy" style="width:100%"></div>
        <div><label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Release Type</label><select class="terminal-input" id="distReleaseType" style="width:100%">${RELEASE_TYPES.map(r => `<option value="${r.id}">${r.icon} ${r.name} (${r.tracks} tracks)</option>`).join('')}</select></div>
        <div><label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Primary Genre</label><select class="terminal-input" id="distGenre" style="width:100%">${GENRE_CODES.map(g => `<option value="${g}">${g}</option>`).join('')}</select></div>
        <div><label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Release Date</label><input type="date" class="terminal-input" id="distReleaseDate" style="width:100%"></div>
        <div><label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">UPC / EAN (optional)</label><input type="text" class="terminal-input" id="distUPC" placeholder="Auto-generated by distributor" style="width:100%"></div>
        <div><label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">ISRC (optional)</label><input type="text" class="terminal-input" id="distISRC" placeholder="US-XX1-23-00001" style="width:100%"></div>
        <button class="terminal-run-btn" style="width:100%;background:linear-gradient(135deg,var(--accent),var(--cyan));margin-top:8px" onclick="window._distCreateRelease()">🚀 Create Release Plan</button>
      </div>
      <div id="distReleasePlan" style="margin-top:16px"></div>`;
  }

  function renderCalculatorTab() {
    return `
      <h4 style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">💰 Multi-Platform Revenue Calculator</h4>
      <div style="margin-bottom:12px"><label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Total Monthly Streams</label><input type="number" class="terminal-input" id="distCalcStreams" value="1000000" style="width:100%"></div>
      <div style="margin-bottom:12px"><label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Distribution Split (%)</label><input type="range" id="distCalcSplit" min="50" max="100" value="85" style="width:100%" oninput="document.getElementById('distSplitVal').textContent=this.value+'%'"><span id="distSplitVal" style="font-size:12px;color:var(--accent);font-weight:600">85%</span></div>
      <button class="terminal-run-btn" style="width:100%;background:linear-gradient(135deg,var(--green),var(--cyan))" onclick="window._distCalculate()">Calculate Revenue</button>
      <div id="distCalcResults" style="margin-top:16px"></div>`;
  }

  function renderChecklistTab() {
    const categories = [...new Set(RELEASE_CHECKLIST.map(c => c.category))];
    let html = '<h4 style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">✅ Release Checklist</h4>';
    categories.forEach(cat => {
      html += `<div style="margin-bottom:14px"><h5 style="font-size:11px;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">${cat}</h5>`;
      RELEASE_CHECKLIST.filter(c => c.category === cat).forEach(item => {
        html += `<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:4px;cursor:pointer;font-size:13px;color:var(--text-primary)"><input type="checkbox" style="accent-color:var(--accent)"> ${item.label}</label>`;
      });
      html += '</div>';
    });
    return html;
  }

  // ─── GLOBAL HANDLERS ──────────────────────────────────────
  window._distSearch = function(query) {
    const list = document.getElementById('distPlatformList');
    if (!list) return;
    if (!query) { list.innerHTML = ''; document.querySelector('[data-dist-tab="platforms"]')?.click(); return; }
    const q = query.toLowerCase();
    const matches = DSP_DATABASE.filter(p => p.name.toLowerCase().includes(q) || p.category.includes(q) || p.territories.toLowerCase().includes(q));
    let html = '';
    matches.forEach(p => {
      html += `<div style="padding:10px 12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:6px;cursor:pointer" onclick="window._distShowPlatform('${p.id}')"><div style="display:flex;justify-content:space-between;align-items:center"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:18px">${p.icon}</span><div><div style="font-weight:600;font-size:13px">${p.name}</div><div style="font-size:11px;color:var(--text-muted)">${p.reach} · ${p.territories}</div></div></div>${p.payRate ? `<span style="color:var(--green);font-weight:700">$${p.payRate.toFixed(5)}</span>` : ''}</div></div>`;
    });
    list.innerHTML = html || '<p style="text-align:center;color:var(--text-muted);padding:20px">No platforms found</p>';
  };

  window._distShowPlatform = function(id) {
    const p = DSP_DATABASE.find(d => d.id === id);
    if (!p) return;
    const content = document.getElementById('distContent');
    content.innerHTML = `
      <button style="background:none;border:none;color:var(--accent);cursor:pointer;font-size:13px;margin-bottom:12px" onclick="document.querySelector('[data-dist-tab=platforms]').click()">← Back to Platforms</button>
      <div style="text-align:center;margin-bottom:16px"><span style="font-size:48px">${p.icon}</span><h3 style="font-size:18px;margin-top:8px">${p.name}</h3><div style="font-size:12px;color:var(--text-muted)">${p.category} · ${p.territories}</div></div>
      <div style="display:grid;gap:8px">
        <div style="padding:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm)"><div style="font-size:11px;color:var(--text-muted)">Reach</div><div style="font-weight:600;color:var(--text-primary)">${p.reach}</div></div>
        ${p.payRate ? `<div style="padding:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm)"><div style="font-size:11px;color:var(--text-muted)">Pay Rate</div><div style="font-weight:700;color:var(--green);font-size:18px">$${p.payRate.toFixed(5)}</div><div style="font-size:11px;color:var(--text-muted)">${p.payModel}</div></div>` : `<div style="padding:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm)"><div style="font-size:11px;color:var(--text-muted)">Payment</div><div style="font-weight:600">${p.payModel}</div></div>`}
        <div style="padding:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm)"><div style="font-size:11px;color:var(--text-muted)">Format Requirements</div><div style="font-weight:600">${p.formatReq}</div></div>
        <div style="padding:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm)"><div style="font-size:11px;color:var(--text-muted)">Delivery Time</div><div style="font-weight:600">${p.deliveryTime}</div></div>
        <div style="padding:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm)"><div style="font-size:11px;color:var(--text-muted)">Features</div><div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">${p.features.map(f => `<span style="padding:3px 8px;background:rgba(118,185,0,0.12);color:var(--green);border-radius:8px;font-size:11px;font-weight:600">${f}</span>`).join('')}</div></div>
        <a href="${p.submitUrl}" style="display:block;text-align:center;padding:12px;background:linear-gradient(135deg,var(--accent),var(--cyan));color:white;border-radius:var(--radius-sm);text-decoration:none;font-weight:600;font-size:14px" target="_blank" rel="noopener">Visit ${p.name} →</a>
      </div>`;
  };

  window._distCreateRelease = function() {
    const title = document.getElementById('distReleaseTitle')?.value || 'Untitled';
    const artist = document.getElementById('distArtistName')?.value || 'DJ Speedy';
    const type = document.getElementById('distReleaseType')?.value || 'single';
    const genre = document.getElementById('distGenre')?.value || 'Hip-Hop/Rap';
    const date = document.getElementById('distReleaseDate')?.value || 'TBD';
    const releaseType = RELEASE_TYPES.find(r => r.id === type);
    const plan = document.getElementById('distReleasePlan');
    plan.innerHTML = `
      <div style="padding:16px;background:var(--bg-primary);border:1px solid var(--accent);border-radius:var(--radius-sm)">
        <h4 style="color:var(--accent);margin-bottom:12px">${releaseType.icon} Release Plan: "${title}"</h4>
        <div style="display:grid;gap:6px;font-size:13px">
          <div>🎤 <strong>Artist:</strong> ${artist}</div>
          <div>📦 <strong>Type:</strong> ${releaseType.name} (${releaseType.tracks} tracks)</div>
          <div>🎵 <strong>Genre:</strong> ${genre}</div>
          <div>📅 <strong>Release Date:</strong> ${date || 'TBD'}</div>
        </div>
        <h5 style="margin-top:14px;margin-bottom:8px;color:var(--text-secondary);font-size:12px">📋 RECOMMENDED TIMELINE</h5>
        <div style="font-size:12px;color:var(--text-muted);display:grid;gap:4px">
          <div>🗓️ Week 8: Finalize masters & metadata</div>
          <div>🗓️ Week 6: Submit to distributor, create pre-save links</div>
          <div>🗓️ Week 4: Pitch to editorial playlists (Spotify, Apple, etc.)</div>
          <div>🗓️ Week 3: Begin social media teasers, announce release</div>
          <div>🗓️ Week 2: Release snippets, behind-the-scenes content</div>
          <div>🗓️ Week 1: Music video premiere, press outreach</div>
          <div>🎉 Release Day: Launch across ${DSP_DATABASE.filter(p=>p.tier<=2).length}+ major platforms!</div>
          <div>🗓️ Week +1: Engage fans, track analytics, pitch to more playlists</div>
          <div>🗓️ Week +4: Remix / acoustic version release</div>
        </div>
        <h5 style="margin-top:14px;margin-bottom:8px;color:var(--text-secondary);font-size:12px">🌐 PLATFORM TARGETS</h5>
        <div style="display:flex;flex-wrap:wrap;gap:4px">${DSP_DATABASE.filter(p => p.tier <= 2).map(p => `<span style="padding:3px 8px;background:rgba(118,185,0,0.1);color:var(--green);border-radius:8px;font-size:10px;font-weight:600">${p.icon} ${p.name}</span>`).join('')}</div>
      </div>`;
  };

  window._distCalculate = function() {
    const streams = parseInt(document.getElementById('distCalcStreams')?.value) || 0;
    const split = parseInt(document.getElementById('distCalcSplit')?.value) || 85;
    const results = document.getElementById('distCalcResults');
    const payingDSPs = DSP_DATABASE.filter(p => p.payRate);
    let html = '<div style="display:grid;gap:6px">';
    let totalRev = 0;
    payingDSPs.sort((a, b) => (b.payRate || 0) - (a.payRate || 0)).forEach(p => {
      const gross = streams * p.payRate;
      const net = gross * (split / 100);
      totalRev += net;
      html += `<div style="display:flex;justify-content:space-between;padding:8px 10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm)">
        <span style="font-size:12px">${p.icon} ${p.name}</span>
        <div style="text-align:right"><div style="color:var(--green);font-weight:700;font-size:13px">$${net.toFixed(2)}</div><div style="font-size:10px;color:var(--text-muted)">$${p.payRate.toFixed(5)}/stream</div></div>
      </div>`;
    });
    html += `<div style="padding:14px;background:linear-gradient(135deg,rgba(118,185,0,0.15),rgba(0,188,212,0.1));border:1px solid var(--green);border-radius:var(--radius-sm);text-align:center;margin-top:8px">
      <div style="font-size:11px;color:var(--text-muted)">ESTIMATED TOTAL (${split}% split)</div>
      <div style="font-size:28px;font-weight:700;color:var(--green)">$${totalRev.toFixed(2)}</div>
      <div style="font-size:11px;color:var(--text-muted)">${streams.toLocaleString()} streams × ${payingDSPs.length} platforms</div>
    </div></div>`;
    results.innerHTML = html;
  };

  return { render, DSP_DATABASE, RELEASE_TYPES, GENRE_CODES, RELEASE_CHECKLIST };
})();

// Export for renderer
if (typeof window !== 'undefined') {
  window.GOATDistributionHub = GOATDistributionHub;
  window.renderDistributionHub = function(container) { GOATDistributionHub.render(container); };
}