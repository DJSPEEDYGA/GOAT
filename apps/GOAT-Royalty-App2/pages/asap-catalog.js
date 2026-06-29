/**
 * GOAT Royalty App - ASCAP Catalog Management Page
 * Displays Harvey Miller's comprehensive ASCAP publishing catalog
 */

import React, { useState, useEffect } from 'react';
import { 
  Music, 
  Search, 
  Filter, 
  Users, 
  Building, 
  Calendar,
  TrendingUp,
  FileText,
  Download,
  BarChart3,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ASAPCatalogPage = () => {
  const [catalogData, setCatalogData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState({ catalogType: '', minParties: '' });
  const [sortBy, setSortBy] = useState('title');
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    loadCatalogData();
  }, []);

  const loadCatalogData = async () => {
    try {
      const response = await fetch('/api/asap-catalog');
      const data = await response.json();

      if (response.ok) {
        setCatalogData(data.catalog);
        setSummary(data.summary);
      } else {
        setError(data.error || 'Failed to load ASAP catalog');
      }
    } catch (err) {
      setError('Network error loading ASAP catalog');
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
      const response = await fetch('/api/asap-catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerm, filterBy, sortBy }),
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const displayWorks = showSearchResults ? searchResults : (catalogData?.works || []);

  if (isLoading && !catalogData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading ASAP catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            ASCAP Publishing Catalog
          </h1>
          <p className="text-gray-400">
            Harvey Miller's comprehensive ASCAP works catalog with publisher information
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <Music className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">{summary.total_unique_works}</span>
              </div>
              <p className="text-gray-400">Total Works</p>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">{summary.total_interested_parties}</span>
              </div>
              <p className="text-gray-400">Interested Parties</p>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold text-green-400">
                  {formatCurrency(summary.estimated_total_royalties)}
                </span>
              </div>
              <p className="text-gray-400">Est. Royalties</p>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="w-8 h-8 text-yellow-400" />
                <span className="text-2xl font-bold text-white">
                  {summary.average_parties_per_work.toFixed(1)}
                </span>
              </div>
              <p className="text-gray-400">Avg Parties/Work</p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Search className="w-5 h-5 text-purple-400" />
            <span>Search Catalog</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search by work title, ASCAP ID, or ISWC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <select
              value={filterBy.catalogType}
              onChange={(e) => setFilterBy({ ...filterBy, catalogType: e.target.value })}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Catalogs</option>
              <option value="harvey-writers">Harvey Miller Writers</option>
              <option value="fastassman-publisher">FASTASSMAN Publisher</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="title">Sort by Title</option>
              <option value="date">Sort by Date</option>
              <option value="parties">Sort by Parties</option>
            </select>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleSearch}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            
            {showSearchResults && (
              <button
                onClick={() => {
                  setShowSearchResults(false);
                  setSearchTerm('');
                  setFilterBy({ catalogType: '', minParties: '' });
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
              >
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Catalog Results */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <span>
                  {showSearchResults ? `Search Results (${displayWorks.length})` : `Complete Catalog (${displayWorks.length})`}
                </span>
              </h2>
              <div className="flex space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Work Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ASCAP Work ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ISWC Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Interested Parties
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ownership %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {displayWorks.slice(0, 50).map((work, index) => (
                  <tr key={index} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Music className="w-4 h-4 text-purple-400 mr-2" />
                        <span className="text-white font-medium">{work.work_title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {work.ascap_work_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {work.iswc_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {formatDate(work.registration_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-blue-400 mr-1" />
                        <span className="text-white">{work.interested_parties.length}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-400 font-medium">
                      {work.total_ownership}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {work.registration_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {displayWorks.length > 50 && (
            <div className="p-4 text-center text-gray-400">
              Showing first 50 results of {displayWorks.length} total works
            </div>
          )}

          {displayWorks.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">
                {showSearchResults ? 'No results found' : 'No catalog data available'}
              </h3>
              <p className="text-gray-500">
                {showSearchResults ? 'Try adjusting your search terms' : 'Please process the ASCAP catalog files'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ASAPCatalogPage;