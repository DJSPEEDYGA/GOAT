import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, MapPin, TrendingUp, Music, DollarSign, Users } from 'lucide-react';

const CodexEngine = () => {
  const [selectedRegion, setSelectedRegion] = useState('global');

  const regions = [
    { id: 'global', name: 'Global', tracks: 234, earnings: '$125,840' },
    { id: 'north-america', name: 'North America', tracks: 89, earnings: '$52,340' },
    { id: 'europe', name: 'Europe', tracks: 67, earnings: '$38,920' },
    { id: 'asia', name: 'Asia', tracks: 45, earnings: '$21,450' },
    { id: 'latin-america', name: 'Latin America', tracks: 23, earnings: '$8,730' },
    { id: 'africa', name: 'Africa', tracks: 10, earnings: '$4,400' }
  ];

  const platforms = [
    { name: 'Spotify', plays: '2.3M', earnings: '$45,230', growth: '+12%' },
    { name: 'Apple Music', plays: '1.8M', earnings: '$38,920', growth: '+8%' },
    { name: 'YouTube Music', plays: '1.2M', earnings: '$21,450', growth: '+15%' },
    { name: 'Amazon Music', plays: '890K', earnings: '$12,340', growth: '+5%' },
    { name: 'Tidal', plays: '450K', earnings: '$7,900', growth: '+3%' }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-400">
            <Globe className="w-5 h-5" />
            Codex Engine - Global Royalty Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2">
            {regions.map((region) => (
              <Button
                key={region.id}
                variant={selectedRegion === region.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRegion(region.id)}
                className={selectedRegion === region.id ? 'bg-purple-600' : ''}
              >
                {region.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        {regions.find(r => r.id === selectedRegion) && (
          <>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Total Tracks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {regions.find(r => r.id === selectedRegion).tracks}
                </div>
                <div className="text-xs text-green-400 mt-1">+5 this month</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {regions.find(r => r.id === selectedRegion).earnings}
                </div>
                <div className="text-xs text-green-400 mt-1">+12% vs last month</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Active Listeners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">2.3M</div>
                <div className="text-xs text-green-400 mt-1">+8% growth</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Growth Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">+15%</div>
                <div className="text-xs text-gray-400 mt-1">Monthly average</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {platforms.map((platform, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Music className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">{platform.name}</div>
                    <div className="text-sm text-gray-400">{platform.plays} plays</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{platform.earnings}</div>
                  <div className="text-sm text-green-400">{platform.growth}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Top Performing Tracks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['Summer Vibes', 'Midnight Dreams', 'Electric Soul', 'Urban Rhythm', 'Sunset Boulevard'].map((track, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
                  <span className="text-gray-300">{track}</span>
                  <span className="text-green-400">${(Math.random() * 10000 + 5000).toFixed(0)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                New royalty payment received - $2,340
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                Track added to 234 playlists
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                Reached 1M streams milestone
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                Contract renewal reminder
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                Payment processing delayed
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CodexEngine;