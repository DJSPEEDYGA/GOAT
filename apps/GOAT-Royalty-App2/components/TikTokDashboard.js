/**
 * 🐐 GOAT Royalty App — TikTok Dashboard (tikapi + Full Analytics)
 * Complete TikTok management hub with profile lookup, video analytics,
 * trending sounds, royalty tracking, search, and hashtag research
 * © 2025 Harvey Miller / FASTASSMAN Publishing Inc / GOAT Force Entertainment
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Music, Video, TrendingUp, Users, DollarSign, Search, Hash,
  Heart, MessageCircle, Share2, Eye, Play, ExternalLink,
  RefreshCw, CheckCircle, AlertCircle, Loader2, BarChart3,
  ArrowUp, ArrowDown, Crown, Zap, Globe, Clock, BookOpen,
  ChevronRight, Star, Award, Flame, Target
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// HELPER: Format large numbers
// ═══════════════════════════════════════════════════════════
function formatNumber(num) {
  if (!num) return '0';
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

function formatCurrency(num) {
  return '$' + parseFloat(num || 0).toFixed(2);
}

function timeAgo(timestamp) {
  const seconds = Math.floor(Date.now() / 1000) - (typeof timestamp === 'number' ? timestamp : Math.floor(new Date(timestamp).getTime() / 1000));
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
  if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
  return Math.floor(seconds / 604800) + 'w ago';
}

// ═══════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════
const TABS = [
  { id: 'profile', label: 'Profile Lookup', icon: Users },
  { id: 'videos', label: 'My Videos', icon: Video },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'royalties', label: 'Royalties', icon: DollarSign },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'hashtags', label: 'Hashtags', icon: Hash },
];

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const TikTokDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoMode, setDemoMode] = useState(true);

  // Profile state
  const [profileUsername, setProfileUsername] = useState('djspeedy');
  const [profileData, setProfileData] = useState(null);

  // Videos state
  const [videosData, setVideosData] = useState(null);

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState(null);

  // Trending state
  const [trendingData, setTrendingData] = useState(null);

  // Royalties state
  const [royaltiesData, setRoyaltiesData] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('users');
  const [searchResults, setSearchResults] = useState(null);

  // Hashtag state
  const [hashtagQuery, setHashtagQuery] = useState('goatforce');
  const [hashtagData, setHashtagData] = useState(null);

  // Auto-load profile on mount
  useEffect(() => {
    fetchProfile('djspeedy');
  }, []);

  // ─── API CALLS ───────────────────────────────────────────
  const fetchProfile = useCallback(async (username) => {
    if (!username) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/tiktok/profile?action=profile&username=${encodeURIComponent(username)}`);
      const data = await res.json();
      if (data.success) {
        setProfileData(data);
        setDemoMode(data.demo_mode || false);
      } else {
        setError(data.error || 'Failed to fetch profile');
      }
    } catch (err) {
      setError('Network error fetching profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Try tikapi first (using secUid from profile), fall back to existing endpoint
      if (profileData?.user?.secUid && !profileData?.demo_mode) {
        const res = await fetch(`/api/tiktok/profile?action=videos&secUid=${encodeURIComponent(profileData.user.secUid)}`);
        const data = await res.json();
        if (data.success) { setVideosData(data); setLoading(false); return; }
      }
      // Fallback to existing videos endpoint
      const res = await fetch('/api/tiktok/videos');
      const data = await res.json();
      if (data.success) {
        setVideosData({
          ...data,
          videos: (data.videos || []).map(v => ({
            id: v.id,
            desc: v.title,
            createTime: v.posted_at ? Math.floor(new Date(v.posted_at).getTime() / 1000) : 0,
            duration: v.duration || 0,
            stats: {
              playCount: v.views || 0,
              diggCount: v.likes || 0,
              commentCount: v.comments || 0,
              shareCount: v.shares || 0,
            },
            music: { title: '', authorName: '' },
            hashtags: [],
            estimatedRoyalty: v.estimated_royalty || '0.00',
            engagementRate: v.engagement_rate || '0.00',
          }))
        });
      }
    } catch (err) {
      setError('Failed to load videos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [profileData]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tiktok/creator-marketplace?action=analytics&musicId=demo');
      const data = await res.json();
      if (data.success) {
        setAnalyticsData(data);
      }
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrending = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tiktok/profile?action=trending');
      const data = await res.json();
      if (data.success) {
        setTrendingData(data);
      }
    } catch (err) {
      setError('Failed to load trending');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoyalties = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tiktok/royalties');
      const data = await res.json();
      if (data.success) {
        setRoyaltiesData(data);
      }
    } catch (err) {
      setError('Failed to load royalties');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery) return;
    setLoading(true);
    setError('');
    try {
      const action = searchType === 'users' ? 'search-users' : 'search-videos';
      const res = await fetch(`/api/tiktok/profile?action=${action}&query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data);
      }
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchType]);

  const fetchHashtag = useCallback(async (tag) => {
    if (!tag) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/tiktok/profile?action=hashtag&hashtag=${encodeURIComponent(tag)}`);
      const data = await res.json();
      if (data.success) {
        setHashtagData(data);
      }
    } catch (err) {
      setError('Failed to fetch hashtag data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data when switching tabs
  useEffect(() => {
    if (activeTab === 'videos' && !videosData) fetchVideos();
    if (activeTab === 'analytics' && !analyticsData) fetchAnalytics();
    if (activeTab === 'trending' && !trendingData) fetchTrending();
    if (activeTab === 'royalties' && !royaltiesData) fetchRoyalties();
    if (activeTab === 'hashtags' && !hashtagData) fetchHashtag('goatforce');
  }, [activeTab]);

  // ─── RENDER HELPERS ──────────────────────────────────────
  const StatCard = ({ icon: Icon, label, value, sub, color = 'text-white' }) => (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 hover:border-yellow-500/30 transition-all">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );

  const DemoBanner = () => demoMode ? (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-4 flex items-center gap-3">
      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
      <div>
        <span className="text-yellow-300 text-sm font-medium">Demo Mode</span>
        <span className="text-yellow-200/70 text-sm ml-2">
          TikAPI key not configured — showing sample data. Add <code className="bg-black/30 px-1 rounded text-xs">TIKAPI_KEY</code> to .env.local for live data.
          Get your key at <a href="https://tikapi.io" target="_blank" rel="noopener noreferrer" className="underline text-yellow-400 hover:text-yellow-300">tikapi.io</a>
        </span>
      </div>
    </div>
  ) : null;

  // ═══════════════════════════════════════════════════════════
  // TAB: PROFILE LOOKUP
  // ═══════════════════════════════════════════════════════════
  const renderProfile = () => (
    <div>
      <DemoBanner />
      {/* Search Bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={profileUsername}
            onChange={(e) => setProfileUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchProfile(profileUsername)}
            placeholder="Enter TikTok username (e.g. djspeedy)"
            className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none transition-all"
          />
        </div>
        <button
          onClick={() => fetchProfile(profileUsername)}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Lookup
        </button>
      </div>

      {/* Quick Presets */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['djspeedy', 'goatforce', 'wakaflocka'].map(name => (
          <button
            key={name}
            onClick={() => { setProfileUsername(name); fetchProfile(name); }}
            className="px-3 py-1.5 bg-gray-800/60 border border-gray-700/50 rounded-lg text-sm text-gray-300 hover:border-yellow-500/50 hover:text-yellow-400 transition-all"
          >
            @{name}
          </button>
        ))}
      </div>

      {/* Profile Card */}
      {profileData?.user && (
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 rounded-2xl overflow-hidden">
          {/* Header Banner */}
          <div className="h-24 bg-gradient-to-r from-pink-600/30 via-purple-600/30 to-blue-600/30 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-30" />
            <div className="absolute top-3 right-3 flex gap-2">
              {profileData.user.verified && (
                <span className="bg-blue-500/20 border border-blue-500/50 text-blue-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              )}
              {profileData.user.commerceUser && (
                <span className="bg-green-500/20 border border-green-500/50 text-green-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Commerce
                </span>
              )}
            </div>
          </div>

          {/* Avatar & Info */}
          <div className="px-6 -mt-12 pb-6">
            <div className="flex items-end gap-4 mb-4">
              <div className="w-24 h-24 rounded-full border-4 border-gray-900 bg-gray-700 overflow-hidden flex-shrink-0">
                {profileData.user.avatarLarger ? (
                  <img
                    src={profileData.user.avatarLarger}
                    alt={profileData.user.nickname}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-500 to-orange-500">
                    <span className="text-3xl font-bold text-black">
                      {(profileData.user.nickname || '?')[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="pb-1">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  {profileData.user.nickname}
                  {profileData.user.verified && <CheckCircle className="w-4 h-4 text-blue-400" />}
                </h3>
                <p className="text-gray-400 text-sm">@{profileData.user.uniqueId}</p>
              </div>
            </div>

            {/* Bio */}
            {profileData.user.signature && (
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">{profileData.user.signature}</p>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={Users} label="Followers" value={formatNumber(profileData.stats?.followerCount)} color="text-blue-400" />
              <StatCard icon={Heart} label="Total Likes" value={formatNumber(profileData.stats?.heartCount)} color="text-pink-400" />
              <StatCard icon={Video} label="Videos" value={formatNumber(profileData.stats?.videoCount)} color="text-purple-400" />
              <StatCard icon={Users} label="Following" value={formatNumber(profileData.stats?.followingCount)} color="text-green-400" />
            </div>

            {/* Additional Info */}
            <div className="mt-4 flex flex-wrap gap-3">
              {profileData.user.region && (
                <span className="text-xs bg-gray-700/50 text-gray-400 px-3 py-1.5 rounded-full flex items-center gap-1">
                  <Globe className="w-3 h-3" /> {profileData.user.region}
                </span>
              )}
              {profileData.user.language && (
                <span className="text-xs bg-gray-700/50 text-gray-400 px-3 py-1.5 rounded-full flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> {profileData.user.language.toUpperCase()}
                </span>
              )}
              <span className="text-xs bg-gray-700/50 text-gray-400 px-3 py-1.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" /> Fetched {new Date(profileData.fetchedAt).toLocaleTimeString()}
              </span>
              <a
                href={`https://tiktok.com/@${profileData.user.uniqueId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-pink-500/20 text-pink-300 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-pink-500/30 transition-all"
              >
                <ExternalLink className="w-3 h-3" /> View on TikTok
              </a>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mt-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-300 text-sm">{error}</span>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // TAB: MY VIDEOS
  // ═══════════════════════════════════════════════════════════
  const renderVideos = () => (
    <div>
      <DemoBanner />
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Video className="w-5 h-5 text-purple-400" /> Video Performance
        </h3>
        <button
          onClick={fetchVideos}
          disabled={loading}
          className="px-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-sm text-gray-300 hover:border-purple-500/50 transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {videosData?.videos?.length > 0 ? (
        <div className="space-y-3">
          {videosData.videos.map((video, idx) => (
            <div
              key={video.id || idx}
              className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-300">#{idx + 1}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{video.desc || 'Untitled Video'}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(video.hashtags || []).slice(0, 4).map((tag, i) => (
                      <span key={i} className="text-xs text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                        #{tag.title}
                      </span>
                    ))}
                  </div>
                  {video.music?.title && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Music className="w-3 h-3" /> {video.music.title} — {video.music.authorName}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-lg font-bold text-green-400">{formatCurrency(video.estimatedRoyalty)}</div>
                  <div className="text-xs text-gray-500">est. royalty</div>
                </div>
              </div>

              {/* Metrics Bar */}
              <div className="flex gap-4 mt-3 pt-3 border-t border-gray-700/30">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Play className="w-3.5 h-3.5 text-blue-400" />
                  <span>{formatNumber(video.stats?.playCount)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Heart className="w-3.5 h-3.5 text-pink-400" />
                  <span>{formatNumber(video.stats?.diggCount)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <MessageCircle className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{formatNumber(video.stats?.commentCount)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Share2 className="w-3.5 h-3.5 text-green-400" />
                  <span>{formatNumber(video.stats?.shareCount)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 ml-auto">
                  <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                  <span>{video.engagementRate}% eng.</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{timeAgo(video.createTime)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800/40 rounded-xl p-12 text-center">
          <Video className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No videos loaded yet</p>
          <button onClick={fetchVideos} className="mt-3 text-sm text-purple-400 hover:text-purple-300">
            Load Videos →
          </button>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // TAB: ANALYTICS
  // ═══════════════════════════════════════════════════════════
  const renderAnalytics = () => {
    const analytics = analyticsData?.analytics || analyticsData?.data?.analytics || {};
    const topVideos = analyticsData?.topVideos || analyticsData?.data?.topVideos || [];

    return (
      <div>
        <DemoBanner />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" /> Music Performance Analytics
          </h3>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="px-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-sm text-gray-300 hover:border-cyan-500/50 transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard icon={Video} label="Total Videos" value={formatNumber(analytics.totalVideos || 347)} color="text-purple-400" />
          <StatCard icon={Eye} label="Total Views" value={formatNumber(analytics.totalViews || 8036000)} color="text-blue-400" />
          <StatCard icon={Heart} label="Total Likes" value={formatNumber(analytics.totalLikes || 517800)} color="text-pink-400" />
          <StatCard icon={TrendingUp} label="Engagement" value={`${analytics.engagementRate || 6.44}%`} color="text-green-400" />
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <StatCard icon={MessageCircle} label="Comments" value={formatNumber(analytics.totalComments || 23200)} color="text-yellow-400" />
          <StatCard icon={Share2} label="Shares" value={formatNumber(analytics.totalShares || 15400)} color="text-orange-400" />
          <StatCard
            icon={DollarSign}
            label="Est. Total Royalty"
            value={formatCurrency(analytics.estimatedRoyalty || 401.80)}
            color="text-green-400"
            sub="Based on view + engagement rates"
          />
        </div>

        {/* Creator Demographics */}
        {analytics.creatorDemographics && (
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 mb-4">
            <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" /> Creator Demographics
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xl font-bold text-white">{formatNumber(analytics.creatorDemographics.totalCreators || 245)}</div>
                <div className="text-xs text-gray-500">Total Creators</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">{formatNumber(analytics.creatorDemographics.avgFollowerCount || 125000)}</div>
                <div className="text-xs text-gray-500">Avg Follower Count</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">{analytics.creatorDemographics.topCategory || 'Music'}</div>
                <div className="text-xs text-gray-500">Top Category</div>
              </div>
            </div>
          </div>
        )}

        {/* Top Regions */}
        {analytics.topRegions?.length > 0 && (
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
            <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" /> Top Regions
            </h4>
            <div className="flex flex-wrap gap-2">
              {analytics.topRegions.map((region, i) => (
                <span key={i} className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-sm text-cyan-300">
                  {region}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════
  // TAB: TRENDING
  // ═══════════════════════════════════════════════════════════
  const renderTrending = () => (
    <div>
      <DemoBanner />
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" /> Trending on TikTok
        </h3>
        <button
          onClick={fetchTrending}
          disabled={loading}
          className="px-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-sm text-gray-300 hover:border-orange-500/50 transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {trendingData?.trending?.length > 0 ? (
        <div className="space-y-3">
          {trendingData.trending.map((item, idx) => (
            <div
              key={item.id || idx}
              className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 hover:border-orange-500/30 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                  idx === 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-black' :
                  idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-black' :
                  idx === 2 ? 'bg-gradient-to-br from-orange-700 to-orange-800 text-white' :
                  'bg-gray-700/50 text-gray-400'
                }`}>
                  {idx < 3 ? <Crown className="w-5 h-5" /> : <span className="text-sm font-bold">#{idx + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{item.desc}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">@{item.author?.uniqueId}</span>
                    {item.author?.verified && <CheckCircle className="w-3 h-3 text-blue-400" />}
                    {item.music?.title && (
                      <span className="text-xs text-pink-400 flex items-center gap-1">
                        <Music className="w-3 h-3" /> {item.music.title}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-3 pt-2 border-t border-gray-700/30">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Play className="w-3.5 h-3.5 text-blue-400" /> {formatNumber(item.stats?.playCount)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Heart className="w-3.5 h-3.5 text-pink-400" /> {formatNumber(item.stats?.diggCount)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <MessageCircle className="w-3.5 h-3.5 text-yellow-400" /> {formatNumber(item.stats?.commentCount)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Share2 className="w-3.5 h-3.5 text-green-400" /> {formatNumber(item.stats?.shareCount)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800/40 rounded-xl p-12 text-center">
          <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Loading trending content...</p>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // TAB: ROYALTIES
  // ═══════════════════════════════════════════════════════════
  const renderRoyalties = () => {
    const summary = royaltiesData?.summary || {};
    const monthly = royaltiesData?.monthly_breakdown || [];
    const topVideos = royaltiesData?.top_performing_videos || [];

    return (
      <div>
        <DemoBanner />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" /> TikTok Royalty Tracker
          </h3>
          <button
            onClick={fetchRoyalties}
            disabled={loading}
            className="px-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-sm text-gray-300 hover:border-green-500/50 transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard icon={DollarSign} label="Total Royalties" value={formatCurrency(summary.total_estimated_royalty)} color="text-green-400" />
          <StatCard icon={Eye} label="Total Views" value={formatNumber(summary.total_views)} color="text-blue-400" />
          <StatCard icon={Video} label="Eligible Videos" value={summary.eligible_videos || 0} color="text-purple-400" />
          <StatCard icon={TrendingUp} label="Avg Engagement" value={`${summary.average_engagement_rate || 0}%`} color="text-orange-400" />
        </div>

        {/* Royalty Rate Info */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-green-400" />
            <span className="text-sm font-bold text-green-300">Royalty Calculation</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Rate per view:</span>
              <span className="text-green-300 ml-2 font-mono">${summary.royalty_rate_per_view || 0.00005}</span>
            </div>
            <div>
              <span className="text-gray-400">Min views threshold:</span>
              <span className="text-yellow-300 ml-2 font-mono">{formatNumber(summary.minimum_views_threshold || 1000)}</span>
            </div>
            <div>
              <span className="text-gray-400">Content videos:</span>
              <span className="text-blue-300 ml-2 font-mono">{summary.total_content_videos || 0}</span>
            </div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        {monthly.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-400" /> Monthly Breakdown
            </h4>
            <div className="space-y-2">
              {monthly.map((m, i) => (
                <div key={i} className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{m.month}</div>
                      <div className="text-xs text-gray-500">{m.video_count} videos • {formatNumber(m.total_views)} views</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">{formatCurrency(m.total_royalty)}</div>
                    <div className="text-xs text-gray-500">{m.avg_engagement_rate}% engagement</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Performing Videos */}
        {topVideos.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" /> Top Performing Videos
            </h4>
            <div className="space-y-2">
              {topVideos.map((v, i) => (
                <div key={i} className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-3 flex items-center justify-between hover:border-yellow-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : 'text-orange-600'}`}>
                      #{i + 1}
                    </span>
                    <div>
                      <p className="text-white text-sm font-medium">{v.title}</p>
                      <p className="text-xs text-gray-500">{formatNumber(v.views)} views • {v.engagement_rate}% eng.</p>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-green-400">{formatCurrency(v.estimated_royalty)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════
  // TAB: SEARCH
  // ═══════════════════════════════════════════════════════════
  const renderSearch = () => (
    <div>
      <DemoBanner />
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={`Search TikTok ${searchType}...`}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none"
          />
        </div>
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-gray-300 focus:border-yellow-500/50 focus:outline-none"
        >
          <option value="users">Users</option>
          <option value="videos">Videos</option>
        </select>
        <button
          onClick={handleSearch}
          disabled={loading || !searchQuery}
          className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50 transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </button>
      </div>

      {/* User Results */}
      {searchResults?.users?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-gray-400 mb-2">Users ({searchResults.total})</h4>
          {searchResults.users.map((user, i) => (
            <div
              key={user.id || i}
              onClick={() => { setProfileUsername(user.uniqueId); setActiveTab('profile'); fetchProfile(user.uniqueId); }}
              className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-yellow-500/30 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <span className="text-lg font-bold text-white">{(user.nickname || '?')[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium flex items-center gap-2">
                  {user.nickname}
                  {user.verified && <CheckCircle className="w-3.5 h-3.5 text-blue-400" />}
                </p>
                <p className="text-gray-500 text-sm">@{user.uniqueId}</p>
                {user.signature && <p className="text-gray-400 text-xs truncate mt-0.5">{user.signature}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-white font-bold">{formatNumber(user.followerCount)}</div>
                <div className="text-xs text-gray-500">followers</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </div>
          ))}
        </div>
      )}

      {/* Video Results */}
      {searchResults?.videos?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-gray-400 mb-2">Videos ({searchResults.total})</h4>
          {searchResults.videos.map((v, i) => (
            <div key={v.id || i} className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 hover:border-pink-500/30 transition-all">
              <p className="text-white text-sm font-medium">{v.desc}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">@{v.author?.uniqueId}</span>
                {v.music?.title && <span className="text-xs text-pink-400">♫ {v.music.title}</span>}
              </div>
              <div className="flex gap-4 mt-2">
                <span className="text-xs text-gray-400"><Play className="w-3 h-3 inline" /> {formatNumber(v.stats?.playCount)}</span>
                <span className="text-xs text-gray-400"><Heart className="w-3 h-3 inline" /> {formatNumber(v.stats?.diggCount)}</span>
                <span className="text-xs text-gray-400"><MessageCircle className="w-3 h-3 inline" /> {formatNumber(v.stats?.commentCount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!searchResults && (
        <div className="bg-gray-800/40 rounded-xl p-12 text-center">
          <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Search for TikTok users or videos</p>
          <p className="text-gray-600 text-sm mt-1">Try "DJ Speedy" or "GOAT Force"</p>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // TAB: HASHTAGS
  // ═══════════════════════════════════════════════════════════
  const renderHashtags = () => (
    <div>
      <DemoBanner />
      {/* Search */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={hashtagQuery}
            onChange={(e) => setHashtagQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchHashtag(hashtagQuery)}
            placeholder="Enter hashtag (e.g. goatforce)"
            className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none"
          />
        </div>
        <button
          onClick={() => fetchHashtag(hashtagQuery)}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50 transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lookup'}
        </button>
      </div>

      {/* Quick Tags */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['goatforce', 'djspeedy', 'atlanta', 'trap', 'bricksquad', 'musicproducer', 'newmusic', 'beatmaking'].map(tag => (
          <button
            key={tag}
            onClick={() => { setHashtagQuery(tag); fetchHashtag(tag); }}
            className="px-3 py-1.5 bg-gray-800/60 border border-gray-700/50 rounded-lg text-sm text-gray-300 hover:border-yellow-500/50 hover:text-yellow-400 transition-all"
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Hashtag Result */}
      {hashtagData?.hashtag && (
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
              <Hash className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">#{hashtagData.hashtag.title}</h3>
              {hashtagData.hashtag.desc && (
                <p className="text-gray-400 text-sm mt-1">{hashtagData.hashtag.desc}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Eye} label="Total Views" value={formatNumber(hashtagData.hashtag.viewCount)} color="text-blue-400" />
            <StatCard icon={Video} label="Total Videos" value={formatNumber(hashtagData.hashtag.videoCount)} color="text-purple-400" />
          </div>

          {/* Engagement Estimate */}
          <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-sm font-bold text-green-300">Estimated Hashtag Royalty Potential</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency((hashtagData.hashtag.viewCount || 0) * 0.00002)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Based on {formatNumber(hashtagData.hashtag.viewCount)} views × $0.00002/view rate
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 via-red-500 to-purple-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-pink-400 via-red-400 to-purple-400 bg-clip-text text-transparent">
                TikTok Dashboard
              </h1>
              <p className="text-gray-400 text-sm">
                Powered by TikAPI — Profile Analytics, Video Performance, Royalty Tracking
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/40 text-pink-300 shadow-lg shadow-pink-500/10'
                    : 'bg-gray-800/40 border border-gray-700/30 text-gray-400 hover:text-white hover:border-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="flex items-center gap-3 mb-4 text-yellow-300 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Fetching TikTok data...</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6">
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'videos' && renderVideos()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'trending' && renderTrending()}
          {activeTab === 'royalties' && renderRoyalties()}
          {activeTab === 'search' && renderSearch()}
          {activeTab === 'hashtags' && renderHashtags()}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-600">
          <p>🐐 GOAT Royalty App × TikAPI Integration</p>
          <p>© 2025 FASTASSMAN Publishing Inc / GOAT Force Entertainment</p>
        </div>
      </div>
    </div>
  );
};

export default TikTokDashboard;