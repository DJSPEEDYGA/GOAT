import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Alert } from './ui/Alert';
import { Loader2, Music, Play, TrendingUp, Users, DollarSign, Headphones, Radio } from 'lucide-react';

const SpotifyIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [royaltyData, setRoyaltyData] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    try {
      const response = await fetch('/api/spotify/check-connection');
      const data = await response.json();
      
      if (data.connected) {
        setIsConnected(true);
        setUserData(data.user);
        loadSpotifyData();
      }
    } catch (err) {
      console.error('Error checking Spotify connection:', err);
    }
  };

  const loadSpotifyData = async () => {
    setIsLoading(true);
    try {
      // Load user's tracks
      const tracksResponse = await fetch('/api/spotify/tracks');
      const tracksData = await tracksResponse.json();
      setTracks(tracksData.tracks || []);

      // Load analytics
      const analyticsResponse = await fetch('/api/spotify/analytics');
      const analyticsData = await analyticsResponse.json();
      setAnalytics(analyticsData);

      // Load royalty data
      const royaltyResponse = await fetch('/api/spotify/royalties');
      const royaltyData = await royaltyResponse.json();
      setRoyaltyData(royaltyData);

      // Load playlists
      const playlistsResponse = await fetch('/api/spotify/playlists');
      const playlistsData = await playlistsResponse.json();
      setPlaylists(playlistsData.playlists || []);

    } catch (err) {
      setError('Failed to load Spotify data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpotifyConnect = () => {
    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('user-read-private user-read-email user-top-read user-read-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative')}&` +
      `state=${Math.random().toString(36).substring(7)}`;
    
    window.location.href = authUrl;
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/spotify/disconnect', {
        method: 'POST'
      });
      
      if (response.ok) {
        setIsConnected(false);
        setUserData(null);
        setTracks([]);
        setAnalytics(null);
        setRoyaltyData(null);
        setPlaylists([]);
        setSuccess('Successfully disconnected from Spotify');
      }
    } catch (err) {
      setError('Failed to disconnect from Spotify');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStreamingRoyalties = (streams) => {
    // Average streaming royalty rates vary by platform and country
    // Using an average of $0.003 per stream
    const averageRate = 0.003;
    return (streams * averageRate).toFixed(2);
  };

  const getTotalStreams = () => {
    return tracks.reduce((total, track) => total + (track.streamCount || 0), 0);
  };

  const getTotalEstimatedRoyalties = () => {
    return tracks.reduce((total, track) => 
      total + parseFloat(calculateStreamingRoyalties(track.streamCount || 0)), 0
    ).toFixed(2);
  };

  const getAveragePopularity = () => {
    if (tracks.length === 0) return 0;
    const totalPopularity = tracks.reduce((total, track) => total + (track.popularity || 0), 0);
    return Math.round(totalPopularity / tracks.length);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Headphones className="w-8 h-8 mr-2 text-green-600" />
          <h1 className="text-3xl font-bold">Spotify Integration</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Connect your Spotify account to track streaming performance, calculate royalties, and analyze music distribution across playlists and radio.
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
                  <img 
                    src={userData?.images?.[0]?.url} 
                    alt={userData?.display_name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <p className="font-semibold">{userData?.display_name || 'Spotify User'}</p>
                    <p className="text-sm text-gray-600">{userData?.followers?.total?.toLocaleString() || 0} followers</p>
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
                <Headphones className="w-8 h-8 text-gray-400" />
              </div>
              <p className="mb-4">Connect your Spotify account to start tracking royalties and analytics</p>
              <Button onClick={handleSpotifyConnect} className="bg-green-600 hover:bg-green-700">
                Connect Spotify Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Streaming Analytics */}
      {isConnected && analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Streaming Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Music className="w-8 h-8 text-green-500" />
                  <span className="text-2xl font-bold">{tracks.length}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Total Tracks</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Play className="w-8 h-8 text-blue-500" />
                  <span className="text-2xl font-bold">{getTotalStreams().toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Total Streams</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Radio className="w-8 h-8 text-purple-500" />
                  <span className="text-2xl font-bold">{playlists.length}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Playlist Placements</p>
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

      {/* Royalty Breakdown */}
      {isConnected && royaltyData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Royalty Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Streaming Revenue</h4>
                  <p className="text-2xl font-bold text-indigo-600">${royaltyData.streamingRevenue || '0.00'}</p>
                  <p className="text-sm text-gray-600">From all streaming platforms</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Mechanical Royalties</h4>
                  <p className="text-2xl font-bold text-green-600">${royaltyData.mechanicalRoyalties || '0.00'}</p>
                  <p className="text-sm text-gray-600">From sales and downloads</p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Performance Royalties</h4>
                  <p className="text-2xl font-bold text-purple-600">${royaltyData.performanceRoyalties || '0.00'}</p>
                  <p className="text-sm text-gray-600">From radio and public performance</p>
                </div>
              </div>
              
              {royaltyData.monthlyBreakdown && royaltyData.monthlyBreakdown.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Monthly Breakdown</h4>
                  <div className="space-y-2">
                    {royaltyData.monthlyBreakdown.slice(0, 3).map((month, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{month.month}</p>
                          <p className="text-sm font-semibold text-green-600">${month.revenue || '0.00'}</p>
                        </div>
                        <p className="text-sm text-gray-600">
                          {month.streams?.toLocaleString() || 0} streams • {month.listeners?.toLocaleString() || 0} listeners
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

      {/* Top Tracks */}
      {isConnected && tracks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Tracks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tracks.slice(0, 5).map((track) => (
                <div key={track.id} className="flex items-center p-4 border rounded-lg">
                  <img 
                    src={track.album?.images?.[0]?.url} 
                    alt={track.name}
                    className="w-16 h-16 rounded-lg object-cover mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{track.name}</h3>
                    <p className="text-sm text-gray-600">{track.artists?.map(a => a.name).join(', ')}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span className="mr-4">{track.streamCount?.toLocaleString() || 0} streams</span>
                      <span className="mr-4">${calculateStreamingRoyalties(track.streamCount || 0)} est. royalties</span>
                      <span className="mr-4">Popularity: {track.popularity || 0}/100</span>
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

      {/* Playlist Placements */}
      {isConnected && playlists.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Playlist Placements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {playlists.slice(0, 5).map((playlist) => (
                <div key={playlist.id} className="flex items-center p-4 border rounded-lg">
                  <img 
                    src={playlist.images?.[0]?.url} 
                    alt={playlist.name}
                    className="w-16 h-16 rounded-lg object-cover mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{playlist.name}</h3>
                    <p className="text-sm text-gray-600">{playlist.tracks?.total || 0} tracks • {playlist.followers?.total?.toLocaleString() || 0} followers</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span className="mr-4">{playlist.tracks?.items?.filter(item => item.added_by?.id === userData?.id).length} your tracks</span>
                      <span>{playlist.public ? 'Public' : 'Private'}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Playlist
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
                  Spotify API Key
                </label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Spotify API key"
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

export default SpotifyIntegration;