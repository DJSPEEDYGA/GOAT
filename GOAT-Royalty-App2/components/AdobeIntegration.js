import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Alert } from './ui/Alert';
import { Loader2, Film, Music, Video, DollarSign, TrendingUp, Clock, Users } from 'lucide-react';

const AdobeIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [royaltyData, setRoyaltyData] = useState(null);
  const [activeProjects, setActiveProjects] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    try {
      const response = await fetch('/api/adobe/check-connection');
      const data = await response.json();
      
      if (data.connected) {
        setIsConnected(true);
        setUserData(data.user);
        loadAdobeData();
      }
    } catch (err) {
      console.error('Error checking Adobe connection:', err);
    }
  };

  const loadAdobeData = async () => {
    setIsLoading(true);
    try {
      // Load Adobe projects
      const projectsResponse = await fetch('/api/adobe/projects');
      const projectsData = await projectsResponse.json();
      setProjects(projectsData.projects || []);
      setActiveProjects(projectsData.activeProjects || []);

      // Load analytics
      const analyticsResponse = await fetch('/api/adobe/analytics');
      const analyticsData = await analyticsResponse.json();
      setAnalytics(analyticsData);

      // Load royalty data
      const royaltyResponse = await fetch('/api/adobe/royalties');
      const royaltyData = await royaltyResponse.json();
      setRoyaltyData(royaltyData);

    } catch (err) {
      setError('Failed to load Adobe data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdobeConnect = () => {
    const authUrl = `https://ims-na1.adobelogin.com/ims/authorize/v2?` +
      `client_id=${process.env.NEXT_PUBLIC_ADOBE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_ADOBE_REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('creative_sdk,openid,read_organizations,additional_info.projectedProductContext')}&` +
      `state=${Math.random().toString(36).substring(7)}`;
    
    window.location.href = authUrl;
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/adobe/disconnect', {
        method: 'POST'
      });
      
      if (response.ok) {
        setIsConnected(false);
        setUserData(null);
        setProjects([]);
        setActiveProjects([]);
        setAnalytics(null);
        setRoyaltyData(null);
        setSuccess('Successfully disconnected from Adobe Creative Cloud');
      }
    } catch (err) {
      setError('Failed to disconnect from Adobe');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProjectRoyalties = (project) => {
    // Estimate royalties based on project type and duration
    const baseRates = {
      'premiere-pro': 0.015, // $0.015 per minute of video
      'after-effects': 0.020, // $0.020 per minute of motion graphics
      'audition': 0.010, // $0.010 per minute of audio
      'illustrator': 0.005, // $0.005 per asset
      'photoshop': 0.003, // $0.003 per asset
    };

    const rate = baseRates[project.type] || 0.010;
    const duration = project.duration || 0;
    const assetCount = project.assetCount || 1;
    
    const multiplier = project.type === 'premiere-pro' || project.type === 'after-effects' ? duration : assetCount;
    return (rate * multiplier).toFixed(2);
  };

  const getTotalProjects = () => {
    return projects.length;
  };

  const getTotalEstimatedRoyalties = () => {
    return projects.reduce((total, project) => 
      total + parseFloat(calculateProjectRoyalties(project)), 0
    ).toFixed(2);
  };

  const getProjectIcon = (projectType) => {
    const icons = {
      'premiere-pro': <Film className="w-5 h-5" />,
      'after-effects': <Video className="w-5 h-5" />,
      'audition': <Music className="w-5 h-5" />,
      'illustrator': <Film className="w-5 h-5" />,
      'photoshop': <Film className="w-5 h-5" />,
    };
    return icons[projectType] || <Film className="w-5 h-5" />;
  };

  const getProjectTypeName = (projectType) => {
    const names = {
      'premiere-pro': 'Premiere Pro',
      'after-effects': 'After Effects',
      'audition': 'Audition',
      'illustrator': 'Illustrator',
      'photoshop': 'Photoshop',
    };
    return names[projectType] || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Film className="w-8 h-8 mr-2 text-red-600" />
          <h1 className="text-3xl font-bold">Adobe Creative Cloud Integration</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Connect your Adobe Creative Cloud account to track project usage, calculate royalties from creative work, and analyze production workflows.
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
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {userData?.email?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <p className="font-semibold">{userData?.email || 'Adobe User'}</p>
                    <p className="text-sm text-gray-600">{userData?.organizations?.length || 0} organizations</p>
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
                <Film className="w-8 h-8 text-gray-400" />
              </div>
              <p className="mb-4">Connect your Adobe Creative Cloud account to start tracking royalties and analytics</p>
              <Button onClick={handleAdobeConnect} className="bg-red-600 hover:bg-red-700">
                Connect Adobe Creative Cloud
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Analytics */}
      {isConnected && analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Project Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Film className="w-8 h-8 text-red-500" />
                  <span className="text-2xl font-bold">{getTotalProjects()}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Total Projects</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Clock className="w-8 h-8 text-blue-500" />
                  <span className="text-2xl font-bold">{activeProjects.length}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Active Projects</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Users className="w-8 h-8 text-green-500" />
                  <span className="text-2xl font-bold">{userData?.organizations?.length || 0}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Teams</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <DollarSign className="w-8 h-8 text-purple-500" />
                  <span className="text-2xl font-bold">${getTotalEstimatedRoyalties()}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Est. Royalties</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Creative Tools Usage */}
      {isConnected && analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="w-5 h-5 mr-2" />
              Creative Tools Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analytics.toolUsage?.map((tool, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    {getProjectIcon(tool.tool)}
                    <span className="text-lg font-bold">{tool.projectCount}</span>
                  </div>
                  <h4 className="font-semibold">{getProjectTypeName(tool.tool)}</h4>
                  <p className="text-sm text-gray-600">{tool.totalHours || 0} hours used</p>
                  <p className="text-sm font-medium text-green-600">${tool.estimatedRoyalties || '0.00'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Projects */}
      {isConnected && projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => (
                <div key={project.id} className="flex items-center p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                    {getProjectIcon(project.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="text-sm text-gray-600">{getProjectTypeName(project.type)}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span className="mr-4">{project.duration || 0} minutes</span>
                      <span className="mr-4">{project.assetCount || 0} assets</span>
                      <span className="mr-4">{new Date(project.modifiedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      ${calculateProjectRoyalties(project)}
                    </p>
                    <p className="text-xs text-gray-500">Est. Royalties</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Royalty Breakdown by Tool */}
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
              {royaltyData.byTool?.map((tool, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {getProjectIcon(tool.tool)}
                      <h4 className="font-semibold ml-2">{getProjectTypeName(tool.tool)}</h4>
                    </div>
                    <p className="text-lg font-bold text-green-600">${tool.totalRoyalties || '0.00'}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Projects</p>
                      <p className="font-medium">{tool.projectCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Hours</p>
                      <p className="font-medium">{tool.totalHours || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Avg. per Project</p>
                      <p className="font-medium">${tool.avgPerProject || '0.00'}</p>
                    </div>
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
                  Adobe API Key
                </label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Adobe API key"
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

export default AdobeIntegration;