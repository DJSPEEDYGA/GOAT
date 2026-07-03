import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Alert } from './ui/Alert';
import { Loader2, Camera, Heart, MessageCircle, Share2, TrendingUp, Users, DollarSign } from 'lucide-react';

const InstagramIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
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
      const response = await fetch('/api/instagram/check-connection');
      const data = await response.json();
      
      if (data.connected) {
        setIsConnected(true);
        setProfileData(data.profile);
        loadInstagramData();
      }
    } catch (err) {
      console.error('Error checking Instagram connection:', err);
    }
  };

  const loadInstagramData = async () => {
    setIsLoading(true);
    try {
      // Load user posts
      const postsResponse = await fetch('/api/instagram/posts');
      const postsData = await postsResponse.json();
      setPosts(postsData.posts || []);

      // Load analytics
      const analyticsResponse = await fetch('/api/instagram/analytics');
      const analyticsData = await analyticsResponse.json();
      setAnalytics(analyticsData);

      // Load royalty data
      const royaltyResponse = await fetch('/api/instagram/royalties');
      const royaltyData = await royaltyResponse.json();
      setRoyaltyData(royaltyData);

    } catch (err) {
      setError('Failed to load Instagram data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstagramConnect = () => {
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${process.env.NEXT_PUBLIC_META_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_META_REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('instagram_basic,instagram_content_publish,instagram_read_insights,pages_read_engagement')}&` +
      `state=${Math.random().toString(36).substring(7)}`;
    
    window.location.href = authUrl;
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/instagram/disconnect', {
        method: 'POST'
      });
      
      if (response.ok) {
        setIsConnected(false);
        setProfileData(null);
        setPosts([]);
        setAnalytics(null);
        setRoyaltyData(null);
        setSuccess('Successfully disconnected from Instagram');
      }
    } catch (err) {
      setError('Failed to disconnect from Instagram');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEngagementRate = (likes, comments, followers) => {
    if (!followers || followers === 0) return 0;
    const totalEngagement = (likes || 0) + (comments || 0);
    return ((totalEngagement / followers) * 100).toFixed(2);
  };

  const calculateEstimatedValue = (engagementRate, followers) => {
    // Rough estimation: $0.01 per follower per 1% engagement rate
    const baseValue = followers * 0.01;
    const engagementMultiplier = engagementRate / 100;
    return (baseValue * engagementMultiplier).toFixed(2);
  };

  const getTotalLikes = () => {
    return posts.reduce((total, post) => total + (post.likeCount || 0), 0);
  };

  const getTotalComments = () => {
    return posts.reduce((total, post) => total + (post.commentCount || 0), 0);
  };

  const getAverageEngagementRate = () => {
    if (posts.length === 0 || !profileData?.followers) return 0;
    const totalEngagementRate = posts.reduce((total, post) => 
      total + parseFloat(calculateEngagementRate(post.likeCount, post.commentCount, profileData.followers)), 0
    );
    return (totalEngagementRate / posts.length).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Camera className="w-8 h-8 mr-2 text-pink-600" />
          <h1 className="text-3xl font-bold">Instagram Integration</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Connect your Instagram account to track content performance, calculate royalties from branded content, and analyze engagement metrics.
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
              <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
                <div className="flex items-center">
                  <img 
                    src={profileData?.profilePictureUrl} 
                    alt={profileData?.username}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <p className="font-semibold">@{profileData?.username || 'instagram_user'}</p>
                    <p className="text-sm text-gray-600">{profileData?.followers?.toLocaleString() || 0} followers</p>
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
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
              <p className="mb-4">Connect your Instagram account to start tracking royalties and analytics</p>
              <Button onClick={handleInstagramConnect} className="bg-pink-600 hover:bg-pink-700">
                Connect Instagram Account
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
              Performance Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-pink-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Camera className="w-8 h-8 text-pink-500" />
                  <span className="text-2xl font-bold">{posts.length}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Total Posts</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Users className="w-8 h-8 text-blue-500" />
                  <span className="text-2xl font-bold">{profileData?.followers?.toLocaleString() || 0}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Followers</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Heart className="w-8 h-8 text-green-500" />
                  <span className="text-2xl font-bold">{getTotalLikes().toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Total Likes</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                  <span className="text-2xl font-bold">{getAverageEngagementRate()}%</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Avg. Engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Branded Content & Royalties */}
      {isConnected && royaltyData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Branded Content & Royalties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Branded Posts</h4>
                  <p className="text-2xl font-bold text-yellow-600">{royaltyData.brandedPosts || 0}</p>
                  <p className="text-sm text-gray-600">Posts with branded content</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Estimated Earnings</h4>
                  <p className="text-2xl font-bold text-green-600">${royaltyData.estimatedEarnings || '0.00'}</p>
                  <p className="text-sm text-gray-600">Monthly branded content revenue</p>
                </div>
                
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Avg. Post Value</h4>
                  <p className="text-2xl font-bold text-indigo-600">${royaltyData.avgPostValue || '0.00'}</p>
                  <p className="text-sm text-gray-600">Estimated value per branded post</p>
                </div>
              </div>
              
              {royaltyData.recentBrandedPosts && royaltyData.recentBrandedPosts.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recent Branded Content</h4>
                  <div className="space-y-2">
                    {royaltyData.recentBrandedPosts.slice(0, 3).map((post, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{post.brand}</p>
                          <p className="text-sm font-semibold text-green-600">${post.estimatedValue || '0.00'}</p>
                        </div>
                        <p className="text-sm text-gray-600">
                          {post.likes?.toLocaleString() || 0} likes • {post.engagementRate || 0}% engagement
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

      {/* Recent Posts */}
      {isConnected && posts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {posts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center p-4 border rounded-lg">
                  <img 
                    src={post.mediaUrl} 
                    alt={post.caption}
                    className="w-16 h-16 rounded-lg object-cover mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold truncate">{post.caption || 'Instagram Post'}</h3>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span className="flex items-center mr-4">
                        <Heart className="w-4 h-4 mr-1" />
                        {post.likeCount?.toLocaleString() || 0}
                      </span>
                      <span className="flex items-center mr-4">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {post.commentCount?.toLocaleString() || 0}
                      </span>
                      <span className="flex items-center mr-4">
                        <Share2 className="w-4 h-4 mr-1" />
                        {post.shareCount?.toLocaleString() || 0}
                      </span>
                      <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      ${calculateEstimatedValue(
                        calculateEngagementRate(post.likeCount, post.commentCount, profileData?.followers),
                        profileData?.followers
                      )}
                    </p>
                    <p className="text-xs text-gray-500">Est. Value</p>
                  </div>
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
                  Meta API Key
                </label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Meta API key"
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

export default InstagramIntegration;