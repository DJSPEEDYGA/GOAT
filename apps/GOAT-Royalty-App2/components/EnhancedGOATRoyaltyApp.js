/**
 * GOAT Royalty App - Music Royalty Management Platform
 * Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST. All rights reserved.
 * 
 * Created: December 19, 2024
 * Authors: HARVEY L MILLER JR, JUAQUIN J MALPHURS, KEVIN W HALLINGQUEST
 * Version: 1.0
 * License: All Rights Reserved
 * 
 * Description: Enhanced frontend component with Spotify integration and royalty analytics
 * 
 * This software is the proprietary property of HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST
 * and is protected by copyright laws and international copyright treaties.
 * Unauthorized use, reproduction, or distribution is strictly prohibited.
 * 
 * For licensing inquiries, contact: contact@goatroyaltyapp.com
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Search, 
  Globe, 
  ShieldCheck, 
  Music2, 
  Youtube, 
  BadgeDollarSign, 
  Spotify,
  TrendingUp,
  Users,
  PlayCircle,
  DollarSign,
  Activity,
  Zap,
  Clock,
  Award
} from 'lucide-react';
import EnhancedSpotifyIntegration from './EnhancedSpotifyIntegration';
import SearchInput from './SearchInput';

const EnhancedGOATRoyaltyApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/dashboard/data');
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      setError('Failed to load dashboard data');
    }
    setIsLoading(false);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Music2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">GOAT Royalty App</h1>
                <p className="text-xs text-gray-500">Music Royalty Management Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tracks, artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Legal
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-4">
                Track Your Music Royalties Across All Platforms
              </h2>
              <p className="text-lg mb-6 opacity-90">
                Comprehensive royalty management for artists and rights holders. 
                Monitor earnings from Spotify, Apple Music, YouTube, TikTok, and more.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <BadgeDollarSign className="h-5 w-5" />
                  <span className="font-semibold">$45M Total Claims</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span className="font-semibold">112 Countries</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span className="font-semibold">10K+ Artists</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="spotify" className="flex items-center">
              <Spotify className="mr-2 h-4 w-4" />
              Spotify
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="royalties" className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4" />
              Royalties
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center">
              <PlayCircle className="mr-2 h-4 w-4" />
              Integrations
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {dashboardData?.totalCollected || '$1,285,912'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {dashboardData?.pendingClaims || '$74,193'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    3 claims processing
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unmatched Royalties</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {dashboardData?.unmatchedRoyalties || '$9,417'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requires action
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Coverage</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {dashboardData?.countriesCovered || '112'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Countries covered
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Royalty Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { track: "Summer Vibes", artist: "DJ Speedy", amount: "$2,847", date: "2024-12-18" },
                      { track: "Night Drive", artist: "Juaquin", amount: "$1,923", date: "2024-12-17" },
                      { track: "City Lights", artist: "Kevin Hallingquest", amount: "$3,156", date: "2024-12-16" },
                    ].map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{payment.track}</p>
                          <p className="text-sm text-gray-500">{payment.artist}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{payment.amount}</p>
                          <p className="text-xs text-gray-500">{payment.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { platform: "Spotify", icon: Spotify, streams: "1.2M", revenue: "$12,450", color: "text-green-600" },
                      { platform: "Apple Music", icon: Music2, streams: "847K", revenue: "$8,230", color: "text-blue-600" },
                      { platform: "YouTube", icon: Youtube, streams: "2.1M", revenue: "$15,670", color: "text-red-600" },
                    ].map((platform, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <platform.icon className={`h-5 w-5 ${platform.color}`} />
                          <div>
                            <p className="font-medium">{platform.platform}</p>
                            <p className="text-sm text-gray-500">{platform.streams} streams</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{platform.revenue}</p>
                          <p className="text-xs text-gray-500">Revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Spotify Tab */}
          <TabsContent value="spotify">
            <EnhancedSpotifyIntegration />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center text-gray-500">
                      <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                      <p>Revenue chart visualization</p>
                      <p className="text-sm">Integrated with analytics API</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Genre Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { genre: "Hip-Hop", percentage: 35, revenue: "$45,230" },
                      { genre: "Electronic", percentage: 28, revenue: "$36,180" },
                      { genre: "Pop", percentage: 22, revenue: "$28,420" },
                      { genre: "Rock", percentage: 15, revenue: "$19,380" },
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{item.genre}</span>
                          <span className="text-sm text-gray-500">{item.revenue}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Royalties Tab */}
          <TabsContent value="royalties" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Royalty Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { source: "Spotify Streaming", amount: "$45,230", percentage: 35 },
                      { source: "Apple Music", amount: "$36,180", percentage: 28 },
                      { source: "YouTube Content ID", amount: "$28,420", percentage: 22 },
                      { source: "TikTok", amount: "$19,380", percentage: 15 },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.source}</p>
                          <p className="text-sm text-gray-500">{item.percentage}% of total</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-600">{item.amount}</p>
                          <p className="text-xs text-gray-500">This month</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">Next Payment</span>
                        <Award className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-lg font-bold text-green-900">$12,450</p>
                      <p className="text-xs text-green-600">Due in 5 days</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Upcoming Payments:</p>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>• Jan 1: $8,230 (Apple Music)</p>
                        <p>• Jan 15: $15,670 (YouTube)</p>
                        <p>• Feb 1: $9,840 (TikTok)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Spotify", icon: Spotify, status: "connected", color: "text-green-600" },
                { name: "Apple Music", icon: Music2, status: "available", color: "text-gray-600" },
                { name: "YouTube", icon: Youtube, status: "connected", color: "text-green-600" },
                { name: "TikTok", icon: PlayCircle, status: "available", color: "text-gray-600" },
                { name: "SoundCloud", icon: Music2, status: "available", color: "text-gray-600" },
                { name: "Deezer", icon: Music2, status: "coming-soon", color: "text-orange-600" },
              ].map((platform, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <platform.icon className={`h-12 w-12 mx-auto ${platform.color}`} />
                      <div>
                        <h3 className="font-medium">{platform.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {platform.status.replace('-', ' ')}
                        </p>
                      </div>
                      <Button 
                        variant={platform.status === 'connected' ? 'outline' : 'default'}
                        size="sm"
                        disabled={platform.status === 'coming-soon'}
                      >
                        {platform.status === 'connected' ? 'Manage' : 'Connect'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-gray-500">
              <a href="/terms" className="hover:text-gray-700">Terms of Service</a>
              <a href="/privacy" className="hover:text-gray-700">Privacy Policy</a>
              <a href="/copyright" className="hover:text-gray-700">Copyright</a>
              <a href="/contact" className="hover:text-gray-700">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedGOATRoyaltyApp;