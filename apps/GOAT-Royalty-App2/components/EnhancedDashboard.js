import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Alert } from './ui/Alert';
import { 
  TrendingUp, DollarSign, Users, Music, Video, Camera, Film,
  Play, Download, Upload, BarChart3, PieChart, Activity,
  Globe, Clock, AlertCircle, CheckCircle, ArrowUp, ArrowDown
} from 'lucide-react';

const EnhancedDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/dashboard/data?timeRange=${timeRange}`);
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4" />;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">GOAT Royalty Dashboard</h1>
          <p className="text-gray-600">Comprehensive overview of your royalty earnings and content performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
          <Button onClick={loadDashboardData} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(dashboardData?.totalRevenue || 0)}</p>
                <div className="flex items-center mt-2">
                  {getChangeIcon(dashboardData?.revenueChange)}
                  <span className={`text-sm ${getChangeColor(dashboardData?.revenueChange)}`}>
                    {Math.abs(dashboardData?.revenueChange || 0).toFixed(1)}% from last period
                  </span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Streams</p>
                <p className="text-2xl font-bold">{formatNumber(dashboardData?.totalStreams || 0)}</p>
                <div className="flex items-center mt-2">
                  {getChangeIcon(dashboardData?.streamsChange)}
                  <span className={`text-sm ${getChangeColor(dashboardData?.streamsChange)}`}>
                    {Math.abs(dashboardData?.streamsChange || 0).toFixed(1)}% from last period
                  </span>
                </div>
              </div>
              <Play className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Content</p>
                <p className="text-2xl font-bold">{formatNumber(dashboardData?.activeContent || 0)}</p>
                <div className="flex items-center mt-2">
                  {getChangeIcon(dashboardData?.contentChange)}
                  <span className={`text-sm ${getChangeColor(dashboardData?.contentChange)}`}>
                    {Math.abs(dashboardData?.contentChange || 0).toFixed(1)}% from last period
                  </span>
                </div>
              </div>
              <Video className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Audience Reach</p>
                <p className="text-2xl font-bold">{formatNumber(dashboardData?.audienceReach || 0)}</p>
                <div className="flex items-center mt-2">
                  {getChangeIcon(dashboardData?.audienceChange)}
                  <span className={`text-sm ${getChangeColor(dashboardData?.audienceChange)}`}>
                    {Math.abs(dashboardData?.audienceChange || 0).toFixed(1)}% from last period
                  </span>
                </div>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Platform Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.platformPerformance?.map((platform, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    {platform.icon}
                    <div className="ml-3">
                      <p className="font-medium">{platform.name}</p>
                      <p className="text-sm text-gray-600">{platform.contentCount} pieces of content</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(platform.revenue)}</p>
                    <p className="text-sm text-gray-600">{formatNumber(platform.views)} views</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Revenue Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.revenueBreakdown?.map((source, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{source.category}</span>
                    <span className="text-sm font-semibold">{formatCurrency(source.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData?.recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-center p-3 border rounded-lg">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  activity.type === 'revenue' ? 'bg-green-500' :
                  activity.type === 'content' ? 'bg-blue-500' :
                  activity.type === 'alert' ? 'bg-red-500' : 'bg-gray-500'
                }`}></div>
                <div className="flex-1">
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleDateString()}</p>
                  {activity.amount && (
                    <p className="text-sm font-semibold text-green-600">{formatCurrency(activity.amount)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Top Performing Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData?.topContent?.map((content, index) => (
              <div key={index} className="border rounded-lg p-4">
                <img 
                  src={content.thumbnailUrl} 
                  alt={content.title}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold truncate">{content.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{content.platform}</p>
                <div className="flex items-center justify-between text-sm">
                  <span>{formatNumber(content.views)} views</span>
                  <span className="font-semibold text-green-600">{formatCurrency(content.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDashboard;