/**
 * GOAT Royalty App - Search Input Component
 * Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST. All rights reserved.
 */

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Input from './ui/Input';
import Button from './ui/Button';

const SearchInput = ({ onResultsFound, placeholder = "Search your music catalog..." }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setResults([]);
      if (onResultsFound) onResultsFound([]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.results);
        if (onResultsFound) onResultsFound(data);
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

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Auto-search after 500ms of no typing
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Demo: Auto-populate Harvey's catalog on mount
  useEffect(() => {
    const demoSearch = async () => {
      try {
        const response = await fetch('/api/search?q=Harvey%20Miller');
        const data = await response.json();
        if (response.ok && data.results.length > 0) {
          console.log('🎵 Found Harvey Miller catalog:', data.results);
        }
      } catch (err) {
        console.log('Demo search failed:', err);
      }
    };
    
    demoSearch();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleInputChange}
            className="pl-10 pr-12 py-3 text-lg"
            error={error}
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            disabled={isLoading}
          >
            {isLoading ? '...' : 'Search'}
          </Button>
        </div>
      </form>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="mt-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-4">
            <h3 className="text-white font-semibold mb-3">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </h3>
            <div className="space-y-3">
              {results.map((track) => (
                <div key={track.id} className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{track.title}</h4>
                      <p className="text-gray-400 text-sm">{track.artist}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>ISRC: {track.isrc}</span>
                        <span>{track.duration}</span>
                        <span>{track.genre}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-semibold">
                        ${track.revenue.toLocaleString()}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {track.streams.toLocaleString()} streams
                      </p>
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                        track.royaltyStatus === 'Collected' 
                          ? 'bg-green-900 text-green-200'
                          : track.royaltyStatus === 'Pending'
                          ? 'bg-yellow-900 text-yellow-200'
                          : 'bg-blue-900 text-blue-200'
                      }`}>
                        {track.royaltyStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {searchQuery && !isLoading && results.length === 0 && !error && (
        <div className="mt-4 text-center text-gray-400">
          <p>No results found for "{searchQuery}"</p>
          <p className="text-sm mt-1">Try searching by song title, artist name, or ISRC</p>
        </div>
      )}
    </div>
  );
};

export default SearchInput;