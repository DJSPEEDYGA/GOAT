import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Alert } from './ui/Alert';
import { Loader2, Play, TrendingUp, DollarSign, Eye, Users, Music } from 'lucide-react';

const YouTubeIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [channelData, setChannelData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [royaltyData, setRoyaltyData] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    try {
      const response = await fetch('/api/youtube/check-connection');
      const data = await response.json();
      
      if (data.connected) {
        setIsConnected(true);
        setChannelData(data.channel);
        loadYouTubeData();
      }
    } catch (err) {
      console.error('Error checking YouTube connection:', err);
    }
  };

  const loadYouTubeData = async () => {
    setIsLoading(true);
    try {
      // Load channel videos
      const videosResponse = await fetch('/api/youtube/videos');
      const videosData = await videosResponse.json();
      setVideos(videosData.videos || []);

      // Load analytics
      const analyticsResponse = await fetch('/api/youtube/analytics');
      const analyticsData = await analyticsResponse.json();
      setAnalytics(analyticsData);

      // Load royalty data
      const royaltyResponse = await fetch('/api/youtube/royalties');
      const royaltyData = await royaltyResponse.json();
      setRoyaltyData(royaltyData);

    } catch (err) {
      setError('Failed to load YouTube data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleYouTubeConnect = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly')}&` +
      `state=${Math.random().toString(36).substring(7)}`;
    
    window.location.href = authUrl;
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/youtube/disconnect', {
        method: 'POST'
      });
      
      if (response.ok) {
        setIsConnected(false);
        setChannelData(null);
        setVideos([]);
        setAnalytics(null);
        setRoyaltyData(null);
        setSuccess('Successfully disconnected from YouTube');
      }
    } catch (err) {
      setError('Failed to disconnect from YouTube');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEstimatedRevenue = (views) => {
    // Rough estimation: $0.001 to $0.003 per view based on average CPM
    const averageCPM = 2.0; // $2.00 per 1000 views
    return (views * averageCPM / 1000).toFixed(2);
  };

  const getTotalViews = () => {
    return videos.reduce((total, video) => total + (video.viewCount || 0), 0);
  };

  const getTotalEstimatedRevenue = () => {
    return videos.reduce((total, video) => 
      total + parseFloat(calculateEstimatedRevenue(video.viewCount || 0)), 0
    ).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Play className="w-8 h-8 mr-2 text-red-600" />
          <h1 className="text-3xl font-bold">YouTube Integration</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Connect your YouTube channel to track video performance, calculate royalties, and analyze content monetization.
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Channel Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <img 
                    src={channelData?.thumbnailUrl} 
                    alt={channelData?.title}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <p className="font-semibold">{channelData?.title || 'YouTube Channel'}</p>
                    <p className="text-sm text-gray-600">{channelData?.subscribers?.toLocaleString() || 0} subscribers</p>
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
                <Play className="w-8 h-8 text-gray-400" />
              </div>
              <p className="mb-4">Connect your YouTube channel to start tracking royalties and analytics</p>
              <Button onClick={handleYouTubeConnect} className="bg-red-600 hover:bg-red-700">
                Connect YouTube Channel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Dashboard */}
      {isConnected && analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Channel Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Play className="w-8 h-8 text-red-500" />
                  <span className="text-2xl font-bold">{videos.length}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Total Videos</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Eye className="w-8 h-8 text-blue-500" />
                  <span className="text-2xl font-bold">{getTotalViews().toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Total Views</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Users className="w-8 h-8 text-green-500" />
                  <span className="text-2xl font-bold">{channelData?.subscribers?.toLocaleString() || 0}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Subscribers</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <DollarSign className="w-8 h-8 text-purple-500" />
                  <span className="text-2xl font-bold">${getTotalEstimatedRevenue()}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Est. Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Royalty Information */}
      {isConnected && royaltyData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Music className="w-5 h-5 mr-2" />
              Royalty Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Content ID Matches</h4>
                  <p className="text-2xl font-bold text-yellow-600">{royaltyData.contentIdMatches || 0}</p>
                  <p className="text-sm text-gray-600">Videos with claimed content</p>
                </div>
                
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Monthly Royalty Revenue</h4>
                  <p className="text-2xl font-bold text-indigo-600">${royaltyData.monthlyRevenue || '0.00'}</p>
                  <p className="text-sm text-gray-600">Estimated monthly earnings</p>
                </div>
              </div>
              
              {royaltyData.recentClaims && royaltyData.recentClaims.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recent Content Claims</h4>
                  <div className="space-y-2">
                    {royaltyData.recentClaims.slice(0, 3).map((claim, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <p className="font-medium">{claim.videoTitle}</p>
                        <p className="text-sm text-gray-600">
                          {claim.views?.toLocaleString() || 0} views • 
                          ${claim.revenue || '0.00'} revenue
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Videos */}
      {isConnected && videos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {videos.slice(0, 5).map((video) => (
                <div key={video.id} className="flex items-center p-4 border rounded-lg">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-16 h-16 rounded-lg object-cover mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{video.title}</h3>
                    <p className="text-sm text-gray-600">{video.description}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span className="mr-4">{video.viewCount?.toLocaleString() || 0} views</span>
                      <span className="mr-4">${calculateEstimatedRevenue(video.viewCount || 0)} est. revenue</span>
                      <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Analytics
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                  YouTube Data API Key
                </label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your YouTube API key"
                />
              </div>
              <Button onClick={() => {/* Handle API key save */}} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Save API Key'}
              </Button>
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

export default YouTubeIntegration;