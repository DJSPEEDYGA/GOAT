import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Alert } from './ui/Alert';
import { Loader2, Music, Video, TrendingUp, Users, DollarSign } from 'lucide-react';

const TikTokIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userVideos, setUserVideos] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // TikTok API configuration
  const TIKTOK_CONFIG = {
    clientId: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_ID,
    redirectUri: process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI,
    scope: 'user.info.basic,video.list',
    baseUrl: 'https://open.tiktokapis.com'
  };

  useEffect(() => {
    // Check if user has existing TikTok connection
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    try {
      const response = await fetch('/api/tiktok/check-connection');
      const data = await response.json();
      
      if (data.connected) {
        setIsConnected(true);
        setUserProfile(data.profile);
        loadUserData();
      }
    } catch (err) {
      console.error('Error checking TikTok connection:', err);
    }
  };

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // Load user videos
      const videosResponse = await fetch('/api/tiktok/videos');
      const videosData = await videosResponse.json();
      setUserVideos(videosData.videos || []);

      // Load analytics
      const analyticsResponse = await fetch('/api/tiktok/analytics');
      const analyticsData = await analyticsResponse.json();
      setAnalytics(analyticsData);

    } catch (err) {
      setError('Failed to load TikTok data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTikTokConnect = () => {
    const authUrl = `${TIKTOK_CONFIG.baseUrl}/v2/auth/authorize/` +
      `?client_key=${TIKTOK_CONFIG.clientId}` +
      `&scope=${encodeURIComponent(TIKTOK_CONFIG.scope)}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(TIKTOK_CONFIG.redirectUri)}` +
      `&state=${Math.random().toString(36).substring(7)}`;
    
    window.location.href = authUrl;
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tiktok/disconnect', {
        method: 'POST'
      });
      
      if (response.ok) {
        setIsConnected(false);
        setUserProfile(null);
        setUserVideos([]);
        setAnalytics(null);
        setSuccess('Successfully disconnected from TikTok');
      }
    } catch (err) {
      setError('Failed to disconnect from TikTok');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeySave = async () => {
    if (!apiKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/tiktok/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey })
      });

      if (response.ok) {
        setSuccess('API key configured successfully');
        setApiKey('');
      } else {
        setError('Failed to configure API key');
      }
    } catch (err) {
      setError('Failed to configure API key');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEstimatedRoyalties = (views) => {
    // Rough estimation: $0.0005 per view for TikTok creator fund
    return (views * 0.0005).toFixed(2);
  };

  const getTotalViews = () => {
    return userVideos.reduce((total, video) => total + (video.views_count || 0), 0);
  };

  const getTotalEstimatedRoyalties = () => {
    return userVideos.reduce((total, video) => 
      total + parseFloat(calculateEstimatedRoyalties(video.views_count || 0)), 0
    ).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Video className="w-8 h-8 mr-2" />
          <h1 className="text-3xl font-bold">TikTok Integration</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Connect your TikTok account to track royalties, manage content, and analyze performance across your music catalog.
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Account Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    {userProfile?.display_name?.[0] || 'T'}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold">{userProfile?.display_name || 'TikTok User'}</p>
                    <p className="text-sm text-gray-600">@{userProfile?.open_id || 'connected'}</p>
                  </div>
                </div>
                <Button 
                  onClick={handleDisconnect} 
                  disabled={isLoading}
                  variant="outline"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Disconnect'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-gray-400" />
              </div>
              <p className="mb-4">Connect your TikTok account to start tracking royalties and managing content</p>
              <Button onClick={handleTikTokConnect} className="bg-black hover:bg-gray-800">
                Connect TikTok Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Configuration */}
      {!isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  TikTok API Key
                </label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your TikTok API key"
                />
              </div>
              <Button onClick={handleApiKeySave} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Save API Key'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Dashboard */}
      {isConnected && analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Performance Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Video className="w-8 h-8 text-blue-500" />
                  <span className="text-2xl font-bold">{userVideos.length}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Total Videos</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Users className="w-8 h-8 text-green-500" />
                  <span className="text-2xl font-bold">{getTotalViews().toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Total Views</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Music className="w-8 h-8 text-purple-500" />
                  <span className="text-2xl font-bold">
                    {userVideos.filter(v => v.music_used).length}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Music Videos</p>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <DollarSign className="w-8 h-8 text-yellow-500" />
                  <span className="text-2xl font-bold">${getTotalEstimatedRoyalties()}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Est. Royalties</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Videos */}
      {isConnected && userVideos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userVideos.slice(0, 5).map((video) => (
                <div key={video.id} className="flex items-center p-4 border rounded-lg">
                  <img 
                    src={video.cover_image_url} 
                    alt={video.title}
                    className="w-16 h-16 rounded-lg object-cover mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{video.title}</h3>
                    <p className="text-sm text-gray-600">{video.video_description}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span className="mr-4">{video.views_count?.toLocaleString() || 0} views</span>
                      <span className="mr-4">${calculateEstimatedRoyalties(video.views_count || 0)} est. royalties</span>
                      <span>{new Date(video.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          {success}
        </Alert>
      )}
    </div>
  );
};

export default TikTokIntegration;