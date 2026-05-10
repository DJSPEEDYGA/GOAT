/**
 * TikTok Integration Service for GOAT Royalty App
 * Uses TikAPI (https://tikapi.io) for TikTok data access
 * 
 * Install: npm install tikapi
 * Env: NEXT_PUBLIC_TIKAPI_KEY=your_api_key
 */

const TIKAPI_BASE_URL = 'https://api.tikapi.io';

const getApiKey = () => {
  const apiKey = process.env.NEXT_PUBLIC_TIKAPI_KEY;
  if (!apiKey) {
    throw new Error('TikAPI not initialized — set NEXT_PUBLIC_TIKAPI_KEY in your .env.local');
  }
  return apiKey;
};

const tikapiGet = async <T>(
  path: string,
  queryParams: Record<string, string | number | undefined> = {}
): Promise<T> => {
  const apiKey = getApiKey();
  const url = new URL(`${TIKAPI_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(queryParams)) {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'X-API-KEY': apiKey },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `TikAPI request failed (${response.status})${body ? `: ${body.slice(0, 200)}` : ''}`
    );
  }

  return (await response.json()) as T;
};

/**
 * TikTok User Profile
 */
export interface TikTokProfile {
  id: string;
  secUid?: string;
  username: string;
  nickname: string;
  followers: number;
  following: number;
  hearts: number;
  videos: number;
  bio: string;
  avatar: string;
  verified: boolean;
}

/**
 * TikTok Video
 */
export interface TikTokVideo {
  id: string;
  description: string;
  createTime: number;
  duration: number;
  cover: string;
  playCount: number;
  diggCount: number;
  commentCount: number;
  shareCount: number;
  musicTitle: string;
  musicAuthor: string;
}

/**
 * Fetch a TikTok user's public profile by username
 */
export const getUserProfile = async (username: string): Promise<TikTokProfile> => {
  try {
    const response = await tikapiGet<any>('/public/check', { username });
    const userInfo = response.userInfo;
    return {
      id: userInfo.user.id,
      secUid: userInfo.user.secUid,
      username: userInfo.user.uniqueId,
      nickname: userInfo.user.nickname,
      followers: userInfo.stats.followerCount,
      following: userInfo.stats.followingCount,
      hearts: userInfo.stats.heartCount,
      videos: userInfo.stats.videoCount,
      bio: userInfo.user.signature,
      avatar: userInfo.user.avatarMedium,
      verified: userInfo.user.verified || false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch TikTok profile';
    console.error('TikTok API error (profile):', message);
    throw new Error(message);
  }
};

/**
 * Fetch a user's recent videos (posts)
 */
export const getUserVideos = async (username: string, count: number = 10): Promise<TikTokVideo[]> => {
  try {
    const profile = await getUserProfile(username);
    if (!profile.secUid) {
      throw new Error('TikAPI profile response missing secUid');
    }
    const response = await tikapiGet<any>('/public/posts', { secUid: profile.secUid, count });
    const items = response.itemList || [];
    return items.map((item: any) => ({
      id: item.id,
      description: item.desc || '',
      createTime: item.createTime,
      duration: item.video?.duration || 0,
      cover: item.video?.cover || '',
      playCount: item.stats?.playCount || 0,
      diggCount: item.stats?.diggCount || 0,
      commentCount: item.stats?.commentCount || 0,
      shareCount: item.stats?.shareCount || 0,
      musicTitle: item.music?.title || 'Original Sound',
      musicAuthor: item.music?.authorName || username,
    }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch TikTok videos';
    console.error('TikTok API error (videos):', message);
    throw new Error(message);
  }
};

/**
 * Search TikTok by hashtag
 */
export const searchByHashtag = async (hashtag: string, count: number = 10): Promise<TikTokVideo[]> => {
  try {
    const discover = await tikapiGet<any>('/public/discover/hashtag', { keyword: hashtag, count: 10 });
    const candidates: any[] =
      discover?.challengeInfoList ||
      discover?.challengeList ||
      discover?.challenges ||
      discover?.challengeListStruct?.challengeInfoList ||
      [];
    const first = Array.isArray(candidates) ? candidates[0] : null;
    const hashtagId =
      first?.challenge?.id ??
      first?.challengeInfo?.challenge?.id ??
      first?.challengeInfo?.challenge?.id ??
      first?.id;

    if (!hashtagId) {
      throw new Error('Hashtag not found');
    }

    const response = await tikapiGet<any>('/public/hashtag', { id: hashtagId, count });
    const items = response?.itemStruct?.itemList || [];
    return items.map((item: any) => ({
      id: item.id,
      description: item.desc || '',
      createTime: item.createTime,
      duration: item.video?.duration || 0,
      cover: item.video?.cover || '',
      playCount: item.stats?.playCount || 0,
      diggCount: item.stats?.diggCount || 0,
      commentCount: item.stats?.commentCount || 0,
      shareCount: item.stats?.shareCount || 0,
      musicTitle: item.music?.title || 'Original Sound',
      musicAuthor: item.music?.authorName || 'Unknown',
    }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to search hashtag';
    console.error('TikTok API error (hashtag):', message);
    throw new Error(message);
  }
};

/**
 * Get trending videos
 */
export const getTrending = async (count: number = 10): Promise<TikTokVideo[]> => {
  try {
    const response = await tikapiGet<any>('/public/explore', { count });
    const items = response.itemList || [];
    return items.map((item: any) => ({
      id: item.id,
      description: item.desc || '',
      createTime: item.createTime,
      duration: item.video?.duration || 0,
      cover: item.video?.cover || '',
      playCount: item.stats?.playCount || 0,
      diggCount: item.stats?.diggCount || 0,
      commentCount: item.stats?.commentCount || 0,
      shareCount: item.stats?.shareCount || 0,
      musicTitle: item.music?.title || 'Original Sound',
      musicAuthor: item.music?.authorName || 'Unknown',
    }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch trending';
    console.error('TikTok API error (trending):', message);
    throw new Error(message);
  }
};

/**
 * Format large numbers for display (e.g., 1500000 → "1.5M")
 */
export const formatCount = (count: number): string => {
  if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}B`;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toLocaleString();
};
