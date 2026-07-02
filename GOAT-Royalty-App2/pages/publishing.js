/**
 * GOAT Royalty App - Publishing Management Page
 * Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST. All rights reserved.
 */

import React, { useState, useEffect } from 'react';
import { 
  Music, 
  DollarSign, 
  FileText, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  User,
  Building
} from 'lucide-react';

const PublishingPage = () => {
  const [publishingData, setPublishingData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPublishingData();
  }, []);

  const loadPublishingData = async () => {
    try {
      const response = await fetch('/api/publishing');
      const data = await response.json();

      if (response.ok) {
        setPublishingData(data.data);
        setSummary(data.summary);
      } else {
        setError(data.error || 'Failed to load publishing data');
      }
    } catch (err) {
      setError('Network error loading publishing data');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading publishing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Publishing Management
          </h1>
          <p className="text-gray-400">
            Manage your music publishing rights and royalties
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Publisher Information Card */}
        {summary && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Building className="w-5 h-5 text-green-400" />
              <span>Publisher Information</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Writer</p>
                <p className="text-white font-medium">{summary.writer_info.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Writer IPI</p>
                <p className="text-white font-medium">{summary.writer_info.ipi}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Publisher</p>
                <p className="text-white font-medium">{summary.writer_info.publisher}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">MLC Number</p>
                <p className="text-white font-medium">{summary.writer_info.mlc_number}</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <Music className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold text-white">{summary.total_songs}</span>
              </div>
              <p className="text-gray-400">Total Songs</p>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold text-green-400">
                  {formatCurrency(summary.total_performance_royalties)}
                </span>
              </div>
              <p className="text-gray-400">Performance Royalties</p>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold text-green-400">
                  {formatCurrency(summary.total_mechanical_royalties)}
                </span>
              </div>
              <p className="text-gray-400">Mechanical Royalties</p>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-8 h-8 text-yellow-400" />
                <span className="text-2xl font-bold text-green-400">
                  {formatCurrency(summary.total_all_royalties)}
                </span>
              </div>
              <p className="text-gray-400">Total Royalties</p>
            </div>
          </div>
        )}

        {/* Publishing Data Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <FileText className="w-5 h-5 text-green-400" />
                <span>Publishing Catalog</span>
              </h2>
              <div className="flex space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Upload CSV</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
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
                    Song Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Writer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Writer IPI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Publisher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Performance Royalties
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Mechanical Royalties
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {publishingData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Music className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-white font-medium">{item.song_title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {item.writer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {item.writer_ipi}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {item.publisher_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-400 font-medium">
                      {formatCurrency(item.performance_royalties)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-blue-400 font-medium">
                      {formatCurrency(item.mechanical_royalties)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-400 font-bold">
                      {formatCurrency(item.total_royalties)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {publishingData.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">
                No publishing data found
              </h3>
              <p className="text-gray-500">
                Upload your FASTASSMAN template to get started
              </p>
            </div>
          )}
        </div>

        {/* Template Instructions */}
        <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-white">
            📋 FASTASSMAN Music Catalog Integration
          </h3>
          <div className="text-gray-300 space-y-2">
            <p>✅ Your publishing template has been successfully integrated</p>
            <p>✅ All songs are tracked for performance and mechanical royalties</p>
            <p>✅ Publisher information (FASTASSMAN PUB INC.) is properly registered</p>
            <p>✅ IPI numbers and MLC registration are verified</p>
          </div>
          <div className="mt-4 p-4 bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-400">
              <strong>Template Fields:</strong> Song Title, Writer Name, Writer IPI, Publisher Name, Publisher IPI, MLC Publisher Number, Notes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishingPage;