/**
 * 🐐 GOAT Royalty App — TikAPI Service Layer
 * Integrates tikapi npm package for TikTok data fetching
 * Profile lookups, video analytics, trending sounds, user search
 * © 2025 Harvey Miller / FASTASSMAN Publishing Inc / GOAT Force Entertainment
 */

import TikAPI from 'tikapi';

let apiInstance = null;

/**
 * Initialize TikAPI with API key
 * @param {string} apiKey - TikAPI API key
 * @returns {Object} TikAPI instance
 */
export function initTikAPI(apiKey) {
  if (!apiKey) {
    throw new Error('TikAPI key is required. Get one at https://tikapi.io');
  }
  apiInstance = TikAPI(apiKey);
  return apiInstance;
}

/**
 * Get or create TikAPI instance
 * @param {string} apiKey - Optional API key override
 * @returns {Object} TikAPI instance
 */
export function getTikAPIInstance(apiKey) {
  if (apiKey) {
    return initTikAPI(apiKey);
  }
  if (!apiInstance) {
    const envKey = process.env.TIKAPI_KEY || process.env.NEXT_PUBLIC_TIKAPI_KEY;
    if (envKey) {
      return initTikAPI(envKey);
    }
    return null;
  }
  return apiInstance;
}

/**
 * Get user profile by username or secUid
 * @param {string} username - TikTok username (without @)
 * @param {string} apiKey - Optional API key override
 * @returns {Object} User profile data
 */
export async function getUserProfile(username, apiKey = null) {
  try {
    const api = getTikAPIInstance(apiKey);
    if (!api) {
      return getDemoProfile(username);
    }

    const response = await api.public.check({
      username: username.replace('@', '')
    });

    if (!response?.json) {
      throw new Error('Invalid response from TikAPI');
    }

    const userData = response.json;
    const userInfo = userData?.userInfo?.user || {};
    const userStats = userData?.userInfo?.stats || {};

    return {
      success: true,
      demo_mode: false,
      source: 'tikapi',
      user: {
        id: userInfo.id || '',
        uniqueId: userInfo.uniqueId || username,
        nickname: userInfo.nickname || username,
        avatarLarger: userInfo.avatarLarger || '',
        avatarMedium: userInfo.avatarMedium || '',
        avatarThumb: userInfo.avatarThumb || '',
        signature: userInfo.signature || '',
        verified: userInfo.verified || false,
        secUid: userInfo.secUid || '',
        privateAccount: userInfo.privateAccount || false,
        region: userInfo.region || '',
        language: userInfo.language || '',
        commerceUser: userInfo.commerceUserInfo?.commerceUser || false,
        openFavorite: userInfo.openFavorite || false,
      },
      stats: {
        followerCount: userStats.followerCount || 0,
        followingCount: userStats.followingCount || 0,
        heartCount: userStats.heartCount || 0,
        videoCount: userStats.videoCount || 0,
        diggCount: userStats.diggCount || 0,
        friendCount: userStats.friendCount || 0,
      },
      rawData: userData,
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('TikAPI getUserProfile error:', error.message);
    // Fall back to demo data on error
    return getDemoProfile(username);
  }
}

/**
 * Get user's videos/posts
 * @param {string} secUid - User's secUid (from profile lookup)
 * @param {string} cursor - Pagination cursor
 * @param {string} apiKey - Optional API key override
 * @returns {Object} User videos data
 */
export async function getUserVideos(secUid, cursor = '', apiKey = null) {
  try {
    const api = getTikAPIInstance(apiKey);
    if (!api) {
      return getDemoVideos();
    }

    const params = { secUid };
    if (cursor) params.cursor = cursor;

    const response = await api.public.posts(params);

    if (!response?.json) {
      throw new Error('Invalid response from TikAPI');
    }

    const data = response.json;
    const items = data?.itemList || [];

    return {
      success: true,
      demo_mode: false,
      source: 'tikapi',
      videos: items.map(item => ({
        id: item.id,
        desc: item.desc || '',
        createTime: item.createTime,
        duration: item.video?.duration || 0,
        cover: item.video?.cover || '',
        playAddr: item.video?.playAddr || '',
        downloadAddr: item.video?.downloadAddr || '',
        stats: {
          diggCount: item.stats?.diggCount || 0,
          shareCount: item.stats?.shareCount || 0,
          commentCount: item.stats?.commentCount || 0,
          playCount: item.stats?.playCount || 0,
          collectCount: item.stats?.collectCount || 0,
        },
        music: {
          id: item.music?.id || '',
          title: item.music?.title || '',
          authorName: item.music?.authorName || '',
          duration: item.music?.duration || 0,
          coverLarge: item.music?.coverLarge || '',
          original: item.music?.original || false,
        },
        hashtags: (item.challenges || []).map(c => ({
          id: c.id,
          title: c.title,
          desc: c.desc || '',
        })),
        estimatedRoyalty: ((item.stats?.playCount || 0) * 0.00005).toFixed(2),
        engagementRate: item.stats?.playCount > 0
          ? (((item.stats?.diggCount || 0) + (item.stats?.commentCount || 0) + (item.stats?.shareCount || 0)) / item.stats.playCount * 100).toFixed(2)
          : '0.00',
      })),
      hasMore: data?.hasMore || false,
      cursor: data?.cursor || '',
      total: items.length,
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('TikAPI getUserVideos error:', error.message);
    return getDemoVideos();
  }
}

/**
 * Get trending/discover feed
 * @param {string} apiKey - Optional API key override
 * @returns {Object} Trending videos
 */
export async function getTrending(apiKey = null) {
  try {
    const api = getTikAPIInstance(apiKey);
    if (!api) {
      return getDemoTrending();
    }

    const response = await api.public.explore();

    if (!response?.json) {
      throw new Error('Invalid response from TikAPI');
    }

    const data = response.json;
    const items = data?.itemList || data?.exploreList || [];

    return {
      success: true,
      demo_mode: false,
      source: 'tikapi',
      trending: items.map(item => {
        const video = item.cardItem || item;
        return {
          id: video.id,
          desc: video.desc || '',
          author: {
            uniqueId: video.author?.uniqueId || '',
            nickname: video.author?.nickname || '',
            avatar: video.author?.avatarThumb || '',
            verified: video.author?.verified || false,
          },
          stats: {
            playCount: video.stats?.playCount || 0,
            diggCount: video.stats?.diggCount || 0,
            commentCount: video.stats?.commentCount || 0,
            shareCount: video.stats?.shareCount || 0,
          },
          music: {
            title: video.music?.title || '',
            author: video.music?.authorName || '',
            original: video.music?.original || false,
          },
          cover: video.video?.cover || '',
        };
      }),
      total: items.length,
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('TikAPI getTrending error:', error.message);
    return getDemoTrending();
  }
}

/**
 * Search TikTok users
 * @param {string} query - Search query
 * @param {string} cursor - Pagination cursor
 * @param {string} apiKey - Optional API key override
 * @returns {Object} Search results
 */
export async function searchUsers(query, cursor = '', apiKey = null) {
  try {
    const api = getTikAPIInstance(apiKey);
    if (!api) {
      return getDemoSearchResults(query);
    }

    const params = { query };
    if (cursor) params.cursor = cursor;

    const response = await api.public.search({
      ...params,
      type: 'user'
    });

    if (!response?.json) {
      throw new Error('Invalid response from TikAPI');
    }

    const data = response.json;
    const users = data?.user_list || [];

    return {
      success: true,
      demo_mode: false,
      source: 'tikapi',
      users: users.map(u => ({
        id: u.user_info?.uid || '',
        uniqueId: u.user_info?.unique_id || '',
        nickname: u.user_info?.nickname || '',
        avatar: u.user_info?.avatar_thumb?.url_list?.[0] || '',
        signature: u.user_info?.signature || '',
        followerCount: u.user_info?.follower_count || 0,
        verified: u.user_info?.custom_verify || '',
      })),
      hasMore: data?.has_more || false,
      cursor: data?.cursor || '',
      total: users.length,
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('TikAPI searchUsers error:', error.message);
    return getDemoSearchResults(query);
  }
}

/**
 * Search TikTok videos
 * @param {string} query - Search query
 * @param {string} cursor - Pagination cursor
 * @param {string} apiKey - Optional API key override
 * @returns {Object} Video search results
 */
export async function searchVideos(query, cursor = '', apiKey = null) {
  try {
    const api = getTikAPIInstance(apiKey);
    if (!api) {
      return getDemoVideoSearchResults(query);
    }

    const params = { query };
    if (cursor) params.cursor = cursor;

    const response = await api.public.search({
      ...params,
      type: 'video'
    });

    if (!response?.json) {
      throw new Error('Invalid response from TikAPI');
    }

    const data = response.json;
    const videos = data?.data || [];

    return {
      success: true,
      demo_mode: false,
      source: 'tikapi',
      videos: videos.map(v => ({
        id: v.aweme_id || v.id,
        desc: v.desc || '',
        author: {
          uniqueId: v.author?.unique_id || '',
          nickname: v.author?.nickname || '',
          avatar: v.author?.avatar_thumb?.url_list?.[0] || '',
        },
        stats: {
          playCount: v.statistics?.play_count || 0,
          diggCount: v.statistics?.digg_count || 0,
          commentCount: v.statistics?.comment_count || 0,
          shareCount: v.statistics?.share_count || 0,
        },
        music: {
          title: v.music?.title || '',
          author: v.music?.author || '',
        },
      })),
      hasMore: data?.has_more || false,
      cursor: data?.cursor || '',
      total: videos.length,
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('TikAPI searchVideos error:', error.message);
    return getDemoVideoSearchResults(query);
  }
}

/**
 * Get hashtag/challenge info
 * @param {string} name - Hashtag name (without #)
 * @param {string} apiKey - Optional API key override
 * @returns {Object} Hashtag data
 */
export async function getHashtagInfo(name, apiKey = null) {
  try {
    const api = getTikAPIInstance(apiKey);
    if (!api) {
      return getDemoHashtag(name);
    }

    const response = await api.public.hashtag({
      name: name.replace('#', '')
    });

    if (!response?.json) {
      throw new Error('Invalid response from TikAPI');
    }

    const data = response.json;
    const challengeInfo = data?.challengeInfo || {};

    return {
      success: true,
      demo_mode: false,
      source: 'tikapi',
      hashtag: {
        id: challengeInfo.challenge?.id || '',
        title: challengeInfo.challenge?.title || name,
        desc: challengeInfo.challenge?.desc || '',
        coverLarger: challengeInfo.challenge?.coverLarger || '',
        profileLarger: challengeInfo.challenge?.profileLarger || '',
        viewCount: challengeInfo.stats?.viewCount || 0,
        videoCount: challengeInfo.stats?.videoCount || 0,
      },
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('TikAPI getHashtagInfo error:', error.message);
    return getDemoHashtag(name);
  }
}

// ═══════════════════════════════════════════════════════════
// DEMO DATA FALLBACKS (when API key not configured)
// ═══════════════════════════════════════════════════════════

function getDemoProfile(username) {
  const profiles = {
    'djspeedy': {
      nickname: 'DJ Speedy 🐐',
      signature: '🎧 GOAT Force Entertainment | Producer | DJ | FASTASSMAN Publishing Inc',
      followerCount: 284500,
      followingCount: 412,
      heartCount: 18200000,
      videoCount: 347,
    },
    'goatforce': {
      nickname: 'GOAT Force Entertainment 🐐🔥',
      signature: 'Official GOAT Force | Music | Entertainment | Atlanta',
      followerCount: 520000,
      followingCount: 189,
      heartCount: 42800000,
      videoCount: 892,
    },
    'wakaflocka': {
      nickname: 'Waka Flocka Flame 🔥',
      signature: 'BRICKSQUAD 1017 | Hard In Da Paint | #GOAT',
      followerCount: 3200000,
      followingCount: 842,
      heartCount: 185000000,
      videoCount: 1240,
    }
  };

  const cleanUsername = (username || 'djspeedy').replace('@', '').toLowerCase();
  const profile = profiles[cleanUsername] || {
    nickname: `@${cleanUsername}`,
    signature: 'TikTok Creator',
    followerCount: Math.floor(Math.random() * 100000) + 1000,
    followingCount: Math.floor(Math.random() * 500) + 50,
    heartCount: Math.floor(Math.random() * 5000000) + 10000,
    videoCount: Math.floor(Math.random() * 200) + 10,
  };

  return {
    success: true,
    demo_mode: true,
    source: 'demo',
    message: 'TikAPI key not configured — showing demo data. Get your key at https://tikapi.io',
    user: {
      id: `demo_${cleanUsername}`,
      uniqueId: cleanUsername,
      nickname: profile.nickname,
      avatarLarger: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nickname)}&size=256&background=000&color=FFD700&bold=true`,
      avatarMedium: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nickname)}&size=128&background=000&color=FFD700&bold=true`,
      avatarThumb: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nickname)}&size=64&background=000&color=FFD700&bold=true`,
      signature: profile.signature,
      verified: cleanUsername === 'wakaflocka' || cleanUsername === 'goatforce',
      secUid: `demo_secuid_${cleanUsername}`,
      privateAccount: false,
      region: 'US',
      language: 'en',
      commerceUser: true,
    },
    stats: {
      followerCount: profile.followerCount,
      followingCount: profile.followingCount,
      heartCount: profile.heartCount,
      videoCount: profile.videoCount,
      diggCount: Math.floor(profile.heartCount * 0.3),
      friendCount: Math.floor(profile.followingCount * 0.5),
    },
    fetchedAt: new Date().toISOString()
  };
}

function getDemoVideos() {
  return {
    success: true,
    demo_mode: true,
    source: 'demo',
    message: 'TikAPI key not configured — showing demo data',
    videos: [
      {
        id: 'demo_001', desc: 'Waka Flocka - Flame On 🔥 #goatforce #trap #atlanta',
        createTime: Math.floor(Date.now() / 1000) - 172800, duration: 45,
        cover: '', stats: { diggCount: 184200, shareCount: 42100, commentCount: 8420, playCount: 2840000, collectCount: 12400 },
        music: { id: 'm001', title: 'Flame On', authorName: 'Waka Flocka', duration: 45, original: true },
        hashtags: [{ id: 'h1', title: 'goatforce' }, { id: 'h2', title: 'trap' }, { id: 'h3', title: 'atlanta' }],
        estimatedRoyalty: '142.00', engagementRate: '8.26',
      },
      {
        id: 'demo_002', desc: 'DJ Speedy in the studio 🎧 #djspeedy #goatforce #producer',
        createTime: Math.floor(Date.now() / 1000) - 432000, duration: 30,
        cover: '', stats: { diggCount: 124800, shareCount: 28900, commentCount: 5640, playCount: 1920000, collectCount: 8900 },
        music: { id: 'm002', title: 'Studio Session Beat', authorName: 'DJ Speedy', duration: 30, original: true },
        hashtags: [{ id: 'h4', title: 'djspeedy' }, { id: 'h1', title: 'goatforce' }, { id: 'h5', title: 'producer' }],
        estimatedRoyalty: '96.00', engagementRate: '8.30',
      },
      {
        id: 'demo_003', desc: 'GOAT Force - New Heat 🐐 #bricksquad #atlanta #newmusic',
        createTime: Math.floor(Date.now() / 1000) - 691200, duration: 60,
        cover: '', stats: { diggCount: 98200, shareCount: 21800, commentCount: 4120, playCount: 1540000, collectCount: 6200 },
        music: { id: 'm003', title: 'New Heat', authorName: 'GOAT Force', duration: 60, original: true },
        hashtags: [{ id: 'h6', title: 'bricksquad' }, { id: 'h3', title: 'atlanta' }, { id: 'h7', title: 'newmusic' }],
        estimatedRoyalty: '77.00', engagementRate: '8.06',
      },
      {
        id: 'demo_004', desc: 'Behind the scenes - Sono Studio session 🎹 #studio #beatmaking',
        createTime: Math.floor(Date.now() / 1000) - 1036800, duration: 90,
        cover: '', stats: { diggCount: 62400, shareCount: 14200, commentCount: 2840, playCount: 980000, collectCount: 4100 },
        music: { id: 'm004', title: 'Sono Session', authorName: 'DJ Speedy', duration: 90, original: true },
        hashtags: [{ id: 'h8', title: 'studio' }, { id: 'h9', title: 'beatmaking' }],
        estimatedRoyalty: '49.00', engagementRate: '8.10',
      },
      {
        id: 'demo_005', desc: 'FASTASSMAN Publishing - Royalty Check Day 💰 #royalties #musicbusiness',
        createTime: Math.floor(Date.now() / 1000) - 1296000, duration: 28,
        cover: '', stats: { diggCount: 48200, shareCount: 10800, commentCount: 2180, playCount: 756000, collectCount: 3200 },
        music: { id: 'm005', title: 'Check Day', authorName: 'GOAT Force', duration: 28, original: true },
        hashtags: [{ id: 'h10', title: 'royalties' }, { id: 'h11', title: 'musicbusiness' }],
        estimatedRoyalty: '37.80', engagementRate: '8.09',
      },
    ],
    hasMore: true,
    cursor: 'demo_cursor_next',
    total: 5,
    fetchedAt: new Date().toISOString()
  };
}

function getDemoTrending() {
  return {
    success: true,
    demo_mode: true,
    source: 'demo',
    message: 'TikAPI key not configured — showing demo trending data',
    trending: [
      { id: 't001', desc: 'This beat is insane 🔥', author: { uniqueId: 'viralbeats', nickname: 'Viral Beats', verified: true }, stats: { playCount: 48000000, diggCount: 5200000, commentCount: 284000, shareCount: 920000 }, music: { title: 'Flame On (Remix)', author: 'Waka Flocka', original: false } },
      { id: 't002', desc: 'Atlanta sound different 🐐', author: { uniqueId: 'atlvibes', nickname: 'ATL Vibes', verified: false }, stats: { playCount: 32000000, diggCount: 3800000, commentCount: 198000, shareCount: 680000 }, music: { title: 'GOAT Mode', author: 'DJ Speedy', original: false } },
      { id: 't003', desc: 'New dance challenge 💃', author: { uniqueId: 'dancequeen', nickname: 'Dance Queen', verified: true }, stats: { playCount: 28000000, diggCount: 4100000, commentCount: 312000, shareCount: 1200000 }, music: { title: 'Move It', author: 'GOAT Force', original: false } },
      { id: 't004', desc: 'Studio vibes only 🎵', author: { uniqueId: 'beatmaker101', nickname: 'BeatMaker101', verified: false }, stats: { playCount: 15000000, diggCount: 1800000, commentCount: 92000, shareCount: 340000 }, music: { title: 'Studio Flow', author: 'Unknown', original: true } },
      { id: 't005', desc: 'When the royalties hit 💰', author: { uniqueId: 'musicmoney', nickname: 'Music Money', verified: false }, stats: { playCount: 12000000, diggCount: 1400000, commentCount: 78000, shareCount: 280000 }, music: { title: 'Get Paid', author: 'Cash Flow', original: true } },
    ],
    total: 5,
    fetchedAt: new Date().toISOString()
  };
}

function getDemoSearchResults(query) {
  return {
    success: true,
    demo_mode: true,
    source: 'demo',
    message: `Demo search results for "${query}"`,
    users: [
      { id: 's1', uniqueId: 'djspeedy', nickname: 'DJ Speedy 🐐', signature: 'GOAT Force Entertainment', followerCount: 284500, verified: false },
      { id: 's2', uniqueId: 'goatforce', nickname: 'GOAT Force Entertainment 🐐🔥', signature: 'Official GOAT Force', followerCount: 520000, verified: true },
      { id: 's3', uniqueId: 'fastassman', nickname: 'FASTASSMAN Publishing', signature: 'Music Publishing | ASCAP', followerCount: 45000, verified: false },
    ],
    hasMore: false,
    cursor: '',
    total: 3,
    fetchedAt: new Date().toISOString()
  };
}

function getDemoVideoSearchResults(query) {
  return {
    success: true,
    demo_mode: true,
    source: 'demo',
    message: `Demo video search results for "${query}"`,
    videos: [
      { id: 'vs1', desc: `${query} — top result 🔥`, author: { uniqueId: 'djspeedy', nickname: 'DJ Speedy' }, stats: { playCount: 2840000, diggCount: 184200, commentCount: 8420, shareCount: 42100 }, music: { title: 'Original Sound', author: 'DJ Speedy' } },
      { id: 'vs2', desc: `${query} vibes 🐐`, author: { uniqueId: 'goatforce', nickname: 'GOAT Force' }, stats: { playCount: 1920000, diggCount: 124800, commentCount: 5640, shareCount: 28900 }, music: { title: 'GOAT Beat', author: 'GOAT Force' } },
    ],
    hasMore: false,
    cursor: '',
    total: 2,
    fetchedAt: new Date().toISOString()
  };
}

function getDemoHashtag(name) {
  return {
    success: true,
    demo_mode: true,
    source: 'demo',
    message: `Demo hashtag data for #${name}`,
    hashtag: {
      id: `demo_hash_${name}`,
      title: name,
      desc: `Trending hashtag #${name}`,
      coverLarger: '',
      profileLarger: '',
      viewCount: Math.floor(Math.random() * 500000000) + 10000000,
      videoCount: Math.floor(Math.random() * 100000) + 1000,
    },
    fetchedAt: new Date().toISOString()
  };
}

export default {
  initTikAPI,
  getTikAPIInstance,
  getUserProfile,
  getUserVideos,
  getTrending,
  searchUsers,
  searchVideos,
  getHashtagInfo,
};