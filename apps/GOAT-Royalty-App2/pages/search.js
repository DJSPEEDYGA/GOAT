/**
 * GOAT Royalty App - Search Page
 * Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST. All rights reserved.
 */

import React, { useState, useEffect } from 'react';
import { Search, Music, DollarSign, TrendingUp } from 'lucide-react';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.results);
      } else {
        setError(data.error || 'Search failed');
        setResults([]);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  // Auto-populate with Harvey's catalog on mount
  useEffect(() => {
    // Show Harvey Miller's catalog by default
    setSearchQuery('Harvey Miller DJ Speedy');
    handleSearch('Harvey Miller DJ Speedy');
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Search Your Music Catalog
          </h1>
          <p className="text-gray-400">
            Find your songs, tracks, and royalty information instantly
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by song title, artist name, or ISRC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 text-lg"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-md font-medium transition-colors"
            >
              {isLoading ? '...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>Total Revenue: ${results.reduce((sum, track) => sum + track.revenue, 0).toLocaleString()}</span>
                <span>Total Streams: {results.reduce((sum, track) => sum + track.streams, 0).toLocaleString()}</span>
              </div>
            </div>

            {results.map((track) => (
              <div key={track.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-green-600 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Music className="w-5 h-5 text-green-400" />
                      <h3 className="text-lg font-semibold text-white">{track.title}</h3>
                    </div>
                    <p className="text-gray-400 mb-3">{track.artist}</p>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="px-2 py-1 bg-gray-700 rounded text-gray-300">
                        ISRC: {track.isrc}
                      </span>
                      <span className="px-2 py-1 bg-gray-700 rounded text-gray-300">
                        {track.duration}
                      </span>
                      <span className="px-2 py-1 bg-gray-700 rounded text-gray-300">
                        {track.genre}
                      </span>
                      <span className="px-2 py-1 bg-gray-700 rounded text-gray-300">
                        Released: {track.releaseDate}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center space-x-2 text-sm text-gray-400">
                      <span>Platforms:</span>
                      {track.platforms.map((platform, idx) => (
                        <span key={idx} className="text-green-400">
                          {platform}{idx < track.platforms.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right ml-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-2xl font-bold text-green-400">
                        ${track.revenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400 mb-3">
                      <TrendingUp className="w-4 h-4" />
                      <span>{track.streams.toLocaleString()} streams</span>
                    </div>
                    <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                      track.royaltyStatus === 'Collected' 
                        ? 'bg-green-900 text-green-200'
                        : track.royaltyStatus === 'Pending'
                        ? 'bg-yellow-900 text-yellow-200'
                        : 'bg-blue-900 text-blue-200'
                    }`}>
                      {track.royaltyStatus}
                    </span>
                    {track.lastClaim && (
                      <p className="text-xs text-gray-500 mt-2">
                        Last claim: {track.lastClaim}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {searchQuery && !isLoading && results.length === 0 && !error && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">
              No results found for "{searchQuery}"
            </h3>
            <p className="text-gray-500">
              Try searching by song title, artist name, or ISRC code
            </p>
          </div>
        )}

        {/* Instructions */}
        {!searchQuery && !isLoading && (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-4">
              Start searching your music catalog
            </h3>
            <div className="max-w-md mx-auto text-gray-400 space-y-2">
              <p>🔍 Try searching for: "Harvey Miller DJ Speedy"</p>
              <p>🎵 Or specific songs: "GOAT Anthem", "Royalty Flow"</p>
              <p>📊 Your catalog contains {results.length} tracks with ${results.reduce((sum, track) => sum + track.revenue, 0).toLocaleString()} in royalties</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;