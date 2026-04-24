'use client';

import { useState, useEffect } from 'react';
import {
  getUserProfile,
  getUserVideos,
  searchByHashtag,
  formatCount,
  type TikTokProfile,
  type TikTokVideo,
} from '@/services/tiktok';

/**
 * TikTok Integration Component for GOAT Royalty App
 * 
 * Features:
 * - Profile lookup by username
 * - Recent videos display
 * - Hashtag search
 * - Royalty-relevant analytics
 */
export function TikTokIntegration() {
  // Profile state
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState<TikTokProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Videos state
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);

  // Hashtag state
  const [hashtag, setHashtag] = useState('');
  const [hashtagResults, setHashtagResults] = useState<TikTokVideo[]>([]);
  const [hashtagLoading, setHashtagLoading] = useState(false);
  const [hashtagError, setHashtagError] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState<'profile' | 'videos' | 'hashtag'>('profile');

  // API key status
  const [apiKeySet, setApiKeySet] = useState(false);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_TIKAPI_KEY;
    setApiKeySet(!!key);
  }, []);

  const fetchProfile = async () => {
    if (!username.trim()) return;
    setProfileLoading(true);
    setProfileError('');
    setProfile(null);
    setVideos([]);
    try {
      const p = await getUserProfile(username.trim());
      setProfile(p);
      // Also fetch their videos
      setVideosLoading(true);
      try {
        const v = await getUserVideos(username.trim(), 12);
        setVideos(v);
      } catch {
        // Videos fetch failed silently — profile still shows
      } finally {
        setVideosLoading(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch profile';
      setProfileError(message);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchHashtag = async () => {
    if (!hashtag.trim()) return;
    setHashtagLoading(true);
    setHashtagError('');
    setHashtagResults([]);
    try {
      const results = await searchByHashtag(hashtag.trim().replace('#', ''), 12);
      setHashtagResults(results);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to search hashtag';
      setHashtagError(message);
    } finally {
      setHashtagLoading(false);
    }
  };

  const handleProfileKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') fetchProfile();
  };

  const handleHashtagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') fetchHashtag();
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.39a8.28 8.28 0 004.76 1.52V6.46a4.83 4.83 0 01-1-.23z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">TikTok Integration</h2>
              <p className="text-pink-100 text-sm">Track creator analytics & royalty-relevant content</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${apiKeySet ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'}`}>
            {apiKeySet ? '● Connected' : '⚠ API Key Required'}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        {(['profile', 'videos', 'hashtag'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'text-pink-400 border-b-2 border-pink-400 bg-pink-500/5'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab === 'profile' && '👤 Profile Lookup'}
            {tab === 'videos' && '🎬 Videos'}
            {tab === 'hashtag' && '#️⃣ Hashtag Search'}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* API Key Warning */}
        {!apiKeySet && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-yellow-300 text-sm font-semibold mb-1">⚠️ TikAPI Key Not Set</p>
            <p className="text-yellow-200/70 text-xs">
              Add <code className="bg-black/30 px-1.5 py-0.5 rounded text-pink-300">NEXT_PUBLIC_TIKAPI_KEY=your_key</code> to
              your <code className="bg-black/30 px-1.5 py-0.5 rounded text-pink-300">.env.local</code> file.
              Get your key at{' '}
              <a href="https://tikapi.io" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline">
                tikapi.io
              </a>
            </p>
          </div>
        )}

        {/* ===== PROFILE TAB ===== */}
        {activeTab === 'profile' && (
          <div>
            {/* Search Input */}
            <div className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                <input
                  type="text"
                  placeholder="Enter TikTok username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleProfileKeyDown}
                  className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                />
              </div>
              <button
                onClick={fetchProfile}
                disabled={profileLoading || !username.trim()}
                className="px-6 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl transition-all flex items-center gap-2"
              >
                {profileLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Fetch Profile'
                )}
              </button>
            </div>

            {/* Error */}
            {profileError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-400 text-sm">❌ {profileError}</p>
              </div>
            )}

            {/* Profile Card */}
            {profile && (
              <div className="space-y-6 animate-fadeIn">
                {/* User Info */}
                <div className="flex items-center gap-5 bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                  <img
                    src={profile.avatar}
                    alt={profile.nickname}
                    className="w-20 h-20 rounded-full border-3 border-pink-500 shadow-lg shadow-pink-500/20"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black text-white">{profile.nickname}</h3>
                      {profile.verified && (
                        <span className="text-blue-400" title="Verified">✓</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">@{profile.username}</p>
                    {profile.bio && (
                      <p className="text-gray-300 text-sm mt-2 line-clamp-2">{profile.bio}</p>
                    )}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard label="Followers" value={formatCount(profile.followers)} color="pink" />
                  <StatCard label="Following" value={formatCount(profile.following)} color="purple" />
                  <StatCard label="Total Hearts" value={formatCount(profile.hearts)} color="red" />
                  <StatCard label="Videos" value={formatCount(profile.videos)} color="blue" />
                </div>

                {/* Royalty Insights */}
                <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl p-5">
                  <h4 className="text-lg font-bold text-white mb-3">🐐 GOAT Royalty Insights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Est. Engagement Rate</p>
                      <p className="text-xl font-bold text-pink-400">
                        {profile.followers > 0
                          ? ((profile.hearts / Math.max(profile.videos, 1) / profile.followers) * 100).toFixed(2)
                          : '0'}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Avg Hearts per Video</p>
                      <p className="text-xl font-bold text-red-400">
                        {formatCount(profile.videos > 0 ? Math.round(profile.hearts / profile.videos) : 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Creator Tier</p>
                      <p className="text-xl font-bold text-purple-400">
                        {profile.followers >= 10_000_000
                          ? '🌟 Mega'
                          : profile.followers >= 1_000_000
                          ? '⭐ Macro'
                          : profile.followers >= 100_000
                          ? '🔥 Mid-Tier'
                          : profile.followers >= 10_000
                          ? '💪 Micro'
                          : '🌱 Nano'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== VIDEOS TAB ===== */}
        {activeTab === 'videos' && (
          <div>
            {!profile ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-3">🎬</p>
                <p className="font-semibold">Look up a profile first</p>
                <p className="text-sm mt-1">Switch to the Profile tab and search for a user</p>
              </div>
            ) : videosLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-400">Loading videos...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-3">📭</p>
                <p>No videos found for @{profile.username}</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-400 mb-4">
                  Showing {videos.length} recent videos from <span className="text-pink-400">@{profile.username}</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== HASHTAG TAB ===== */}
        {activeTab === 'hashtag' && (
          <div>
            <div className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">#</span>
                <input
                  type="text"
                  placeholder="Search by hashtag (e.g. goatroyalty)"
                  value={hashtag}
                  onChange={(e) => setHashtag(e.target.value)}
                  onKeyDown={handleHashtagKeyDown}
                  className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                />
              </div>
              <button
                onClick={fetchHashtag}
                disabled={hashtagLoading || !hashtag.trim()}
                className="px-6 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl transition-all flex items-center gap-2"
              >
                {hashtagLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </button>
            </div>

            {hashtagError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-400 text-sm">❌ {hashtagError}</p>
              </div>
            )}

            {hashtagResults.length > 0 && (
              <div>
                <p className="text-sm text-gray-400 mb-4">
                  Found {hashtagResults.length} videos for <span className="text-pink-400">#{hashtag.replace('#', '')}</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hashtagResults.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </div>
            )}

            {!hashtagLoading && hashtagResults.length === 0 && !hashtagError && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-3">#️⃣</p>
                <p className="font-semibold">Search for a hashtag</p>
                <p className="text-sm mt-1">Find trending content related to your royalties</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== Sub-Components ===== */

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    pink: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };
  const classes = colorMap[color] || colorMap.pink;

  return (
    <div className={`rounded-xl p-4 border text-center ${classes}`}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-black ${classes.split(' ')[0]}`}>{value}</p>
    </div>
  );
}

function VideoCard({ video }: { video: TikTokVideo }) {
  const date = new Date(video.createTime * 1000);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-pink-500/30 transition-all group">
      {/* Video Cover */}
      <div className="relative h-48 bg-gray-900">
        {video.cover ? (
          <img src={video.cover} alt={video.description} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🎬</div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {video.duration}s
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 text-4xl transition-all">▶</span>
        </div>
      </div>

      {/* Video Info */}
      <div className="p-3">
        <p className="text-sm text-white line-clamp-2 mb-2">
          {video.description || 'No description'}
        </p>
        <p className="text-xs text-gray-500 mb-3">
          🎵 {video.musicTitle} · {formattedDate}
        </p>
        <div className="grid grid-cols-4 gap-1 text-center text-xs">
          <div>
            <p className="text-gray-500">▶</p>
            <p className="text-white font-bold">{formatCount(video.playCount)}</p>
          </div>
          <div>
            <p className="text-gray-500">❤️</p>
            <p className="text-white font-bold">{formatCount(video.diggCount)}</p>
          </div>
          <div>
            <p className="text-gray-500">💬</p>
            <p className="text-white font-bold">{formatCount(video.commentCount)}</p>
          </div>
          <div>
            <p className="text-gray-500">↗</p>
            <p className="text-white font-bold">{formatCount(video.shareCount)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}