/**
 * GOAT Royalty App - Music Royalty Management Platform
 * Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST. All rights reserved.
 * 
 * Created: December 19, 2024
 * Authors: HARVEY L MILLER JR, JUAQUIN J MALPHURS, KEVIN W HALLINGQUEST
 * Version: 1.0
 * License: All Rights Reserved
 * 
 * Description: Enhanced Spotify integration component with royalty analytics
 * 
 * This software is the proprietary property of HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST
 * and is protected by copyright laws and international copyright treaties.
 * Unauthorized use, reproduction, or distribution is strictly prohibited.
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Music, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Play, 
  Users, 
  Globe,
  Zap,
  Clock,
  Award,
  PieChart,
  Activity
} from 'lucide-react';

const EnhancedSpotifyIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [royalties, setRoyalties] = useState(null);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('medium_term');

  // Check for existing Spotify connection
  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = () => {
    const spotifyToken = localStorage.getItem('spotify_access_token');
    if (spotifyToken) {
      setIsConnected(true);
      fetchUserProfile(spotifyToken);
    }
  };

  // Connect to Spotify
  const connectSpotify = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Get authorization URL
      const response = await axios.get('/api/spotify/auth');
      if (response.data.success) {
        const { authURL, state } = response.data.data;
        
        // Store state for validation
        sessionStorage.setItem('spotify_state', state);
        
        // Open Spotify authorization popup
        const popup = window.open(authURL, 'spotify_auth', 'width=500,height=600,scrollbars=yes');
        
        // Listen for popup close
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            setIsLoading(false);
          }
        }, 1000);

        // Listen for message from popup
        window.addEventListener('message', handleAuthCallback);
      }
    } catch (error) {
      setError('Failed to connect to Spotify');
      setIsLoading(false);
    }
  };

  // Handle authentication callback
  const handleAuthCallback = async (event) => {
    if (event.origin !== window.location.origin) return;
    
    const { code, state } = event.data;
    const storedState = sessionStorage.getItem('spotify_state');

    if (state !== storedState) {
      setError('Authentication failed: Invalid state');
      return;
    }

    try {
      // Exchange code for token
      const response = await axios.post('/api/spotify/auth', { code, state });
      
      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        
        // Store tokens
        localStorage.setItem('spotify_access_token', accessToken);
        localStorage.setItem('spotify_refresh_token', refreshToken);
        
        setIsConnected(true);
        setUserProfile(user);
        
        // Fetch analytics
        await fetchAnalytics(accessToken);
      }
    } catch (error) {
      setError('Authentication failed');
    }
    
    setIsLoading(false);
    window.removeEventListener('message', handleAuthCallback);
  };

  // Fetch user profile
  const fetchUserProfile = async (token) => {
    try {
      // Use cached profile or fetch new one
      const cachedProfile = localStorage.getItem('spotify_user_profile');
      if (cachedProfile) {
        setUserProfile(JSON.parse(cachedProfile));
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async (token = null) => {
    const accessToken = token || localStorage.getItem('spotify_access_token');
    if (!accessToken) return;

    setIsLoading(true);
    try {
      const response = await axios.post('/api/spotify/analytics', {
        accessToken,
        timeRange,
        userCountry: 'US' // Could be dynamic based on user location
      });

      if (response.data.success) {
        setAnalytics(response.data.data);
        setRoyalties(response.data.data.detailedRoyalties);
      }
    } catch (error) {
      setError('Failed to fetch analytics');
    }
    setIsLoading(false);
  };

  // Disconnect from Spotify
  const disconnectSpotify = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_user_profile');
    setIsConnected(false);
    setUserProfile(null);
    setAnalytics(null);
    setRoyalties(null);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Music className="h-5 w-5" style={{ color: '#1DB954' }} />
              <span>Enhanced Spotify Integration</span>
            </div>
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Connect your Spotify account to track royalties and analyze your music performance
              </p>
              <Button 
                onClick={connectSpotify}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600"
              >
                {isLoading ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Music className="mr-2 h-4 w-4" />
                    Connect Spotify
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {userProfile?.images?.[0]?.url && (
                    <img 
                      src={userProfile.images[0].url} 
                      alt="Profile" 
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{userProfile?.displayName}</p>
                    <p className="text-sm text-gray-600">
                      {userProfile?.followers?.toLocaleString()} followers
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={disconnectSpotify}>
                  Disconnect
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Analytics Display */}
      {isConnected && analytics && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="royalties">Royalties</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="tracks">Top Tracks</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Streams</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(royalties?.streamingBreakdown?.totalStreams || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Estimated from top tracks
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Est. Royalties</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(royalties?.totalRoyalties || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current period earnings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Projection</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(royalties?.projections?.monthly || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on current trends
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {analytics.summary.totalTracks}
                    </div>
                    <p className="text-sm text-gray-600">Total Tracks</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">
                      {Math.round(analytics.summary.averagePopularity)}
                    </div>
                    <p className="text-sm text-gray-600">Avg Popularity</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {analytics.summary.audioAnalysis?.moodClassification || 'N/A'}
                    </div>
                    <p className="text-sm text-gray-600">Music Mood</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {Math.round(analytics.summary.audioAnalysis?.tempo?.average || 0)} BPM
                    </div>
                    <p className="text-sm text-gray-600">Avg Tempo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Royalties Tab */}
          <TabsContent value="royalties" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Streaming Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Free Tier Streams</span>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatNumber(royalties?.streamingBreakdown?.freeStreams || 0)}
                      </div>
                      <div className="text-sm text-green-600">
                        {formatCurrency(royalties?.streamingBreakdown?.freeRoyalties || 0)}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Premium Streams</span>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatNumber(royalties?.streamingBreakdown?.premiumStreams || 0)}
                      </div>
                      <div className="text-sm text-green-600">
                        {formatCurrency(royalties?.streamingBreakdown?.premiumRoyalties || 0)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average per Stream</span>
                    <span className="font-semibold">
                      {formatCurrency(royalties?.performanceMetrics?.royaltyPerStream || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Stream Value</span>
                    <span className="font-semibold">
                      {formatCurrency(royalties?.performanceMetrics?.averageStreamValue || 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Projections */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue Projections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(royalties?.projections?.monthly || 0)}
                    </div>
                    <p className="text-sm text-gray-600">Monthly Projection</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(royalties?.projections?.yearly || 0)}
                    </div>
                    <p className="text-sm text-gray-600">Yearly Projection</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(((royalties?.projections?.yearly || 0) * 12) / 1000)}K
                    </div>
                    <p className="text-sm text-gray-600">5-Year Estimate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Genre Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <PieChart className="mr-2 h-5 w-5" />
                    Genre Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(analytics.summary.genres || {}).map(([genre, percentage]) => (
                      <div key={genre} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{genre}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Audio Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Audio Characteristics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.summary.audioAnalysis && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Danceability</span>
                          <span className="text-sm font-medium">
                            {Math.round(analytics.summary.audioAnalysis.danceability.average * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${analytics.summary.audioAnalysis.danceability.average * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Energy</span>
                          <span className="text-sm font-medium">
                            {Math.round(analytics.summary.audioAnalysis.energy.average * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full" 
                            style={{ width: `${analytics.summary.audioAnalysis.energy.average * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Valence (Positivity)</span>
                          <span className="text-sm font-medium">
                            {Math.round(analytics.summary.audioAnalysis.valence.average * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${analytics.summary.audioAnalysis.valence.average * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Top Tracks Tab */}
          <TabsContent value="tracks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="mr-2 h-5 w-5" />
                    Your Top Tracks
                  </div>
                  <select 
                    value={timeRange} 
                    onChange={(e) => {
                      setTimeRange(e.target.value);
                      fetchAnalytics();
                    }}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="short_term">Last 4 weeks</option>
                    <option value="medium_term">Last 6 months</option>
                    <option value="long_term">All time</option>
                  </select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.tracks?.slice(0, 10).map((track, index) => (
                    <div key={track.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-shrink-0 w-8 text-center font-bold text-lg text-gray-500">
                        {index + 1}
                      </div>
                      {track.images?.[0]?.url && (
                        <img 
                          src={track.images[0].url} 
                          alt={track.name} 
                          className="w-12 h-12 rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{track.name}</h4>
                        <p className="text-sm text-gray-500 truncate">
                          {track.artists.join(', ')}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(track.popularity * 0.01)} {/* Estimated royalty */}
                        </div>
                        <div className="text-xs text-gray-500">
                          Popularity: {track.popularity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default EnhancedSpotifyIntegration;