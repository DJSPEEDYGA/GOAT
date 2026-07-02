/**
 * GOAT Royalty App - Analytics Dashboard Page
 * Displays streaming analytics and performance metrics
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Music, 
  Play, 
  Search,
  Download,
  Calendar,
  Filter,
  Eye,
  Activity
} from 'lucide-react';

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [detailedData, setDetailedData] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('streams');
  const [limit, setLimit] = useState('10');
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json();

      if (response.ok) {
        setAnalyticsData(data.dashboard);
        setDetailedData(data.detailed_data);
      } else {
        setError(data.error || 'Failed to load analytics data');
      }
    } catch (err) {
      setError('Network error loading analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setShowSearchResults(false);
      setSearchResults(null);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerm, sortBy, limit }),
      });

      const data = await response.json();

      if (response.ok) {
        setSearchResults(data.results);
        setShowSearchResults(true);
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (err) {
      setError('Network error during search');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const displayTracks = showSearchResults ? searchResults : (analyticsData?.top_performing_tracks || []);

  if (isLoading && !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500-400 to-purple-500 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-gray-400">
            Real-time streaming analytics and performance metrics
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-xl flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Overview Cards */}
        {analyticsData?.overview && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <Music className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">{analyticsData.overview.total_tracks}</span>
              </div>
              <p className="text-gray-400">Total Tracks</p>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold text-green-400">
                  {formatNumber(analyticsData.overview.total_streams)}
                </span>
              </div>
              <p className="text-gray-400">Total Streams</p>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">
                  {formatNumber(analyticsData.overview.total_listeners)}
                </span>
              </div>
              <p className="text-gray-400">Total Listeners</p>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <Play className="w-8 h-8 text-yellow-400" />
                <span className="text-2xl font-bold text-white">
                  {formatNumber(analyticsData.overview.average_streams_per_track)}
                </span>
              </div>
              <p className="text-gray-400">Avg Streams/Track</p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Search className="w-5 h-5 text-blue-400" />
            <span>Search Tracks</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search by track title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="streams">Sort by Streams</option>
              <option value="listeners">Sort by Listeners</option>
              <option value="saves">Sort by Saves</option>
              <option value="date">Sort by Date</option>
            </select>
            
            <select
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">Top 10</option>
              <option value="25">Top 25</option>
              <option value="50">Top 50</option>
              <option value="100">Top 100</option>
            </select>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleSearch}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            
            {showSearchResults && (
              <button
                onClick={() => {
                  setShowSearchResults(false);
                  setSearchTerm('');
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-xl transition-colors"
              >
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Top Performing Tracks */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span>
                  {showSearchResults ? `Search Results (${displayTracks.length})` : `Top Performing Tracks`}
                </span>
              </h2>
              <div className="flex space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Export Data</span>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Track Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Streams
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Listeners
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Saves
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Release Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {displayTracks.map((track, index) => (
                  <tr key={index} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Music className="w-4 h-4 text-blue-400 mr-2" />
                        <span className="text-white font-medium">{track.song || track.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                        <span className="text-green-400 font-medium">{formatNumber(track.streams)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-blue-400 font-medium">
                      {formatNumber(track.listeners)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-purple-400 font-medium">
                      {formatNumber(track.saves)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {formatDate(track.release_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-yellow-400" />
                        <div className="w-24 bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${Math.min((track.streams / 100000000) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {displayTracks.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">
                {showSearchResults ? 'No results found' : 'No analytics data available'}
              </h3>
              <p className="text-gray-500">
                {showSearchResults ? 'Try adjusting your search terms' : 'Please process analytics data first'}
              </p>
            </div>
          )}
        </div>

        {/* Top Playlists */}
        {analyticsData?.top_playlists && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <Play className="w-5 h-5 text-purple-400" />
                <span>Top Playlists</span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Playlist Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Listeners
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Streams
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {analyticsData.top_playlists.slice(0, 10).map((playlist, index) => (
                    <tr key={index} className="hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Play className="w-4 h-4 text-purple-400 mr-2" />
                          <span className="text-white font-medium">{playlist.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {playlist.author}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-blue-400 font-medium">
                        {formatNumber(playlist.listeners)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-400 font-medium">
                        {formatNumber(playlist.streams)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;