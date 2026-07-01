import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Youtube, TrendingUp, Eye, ThumbsUp, Share2, DollarSign } from 'lucide-react';

const TrackingDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const youtubeVideos = [
    { 
      id: 1, 
      title: 'Summer Vibes - Official Music Video',
      views: '2.3M',
      likes: '145K',
      comments: '8.2K',
      shares: '12K',
      earnings: '$18,450',
      cpm: '$8.02'
    },
    { 
      id: 2, 
      title: 'Midnight Dreams - Lyric Video',
      views: '1.8M',
      likes: '98K',
      comments: '5.1K',
      shares: '7.8K',
      earnings: '$14,220',
      cpm: '$7.90'
    },
    { 
      id: 3, 
      title: 'Electric Soul - Behind The Scenes',
      views: '890K',
      likes: '52K',
      comments: '2.9K',
      shares: '4.2K',
      earnings: '$7,120',
      cpm: '$8.00'
    }
  ];

  const platforms = [
    { name: 'YouTube', videos: 45, views: '12.3M', earnings: '$98,450' },
    { name: 'Spotify', tracks: 34, plays: '8.9M', earnings: '$71,200' },
    { name: 'Apple Music', tracks: 34, plays: '6.2M', earnings: '$49,600' },
    { name: 'TikTok', videos: 23, views: '45.6M', earnings: '$36,480' }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border-cyan-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Youtube className="w-5 h-5" />
            Tracking Dashboard - Multi-Platform Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? 'bg-cyan-600' : ''}
              >
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last 90 Days' : 'Last Year'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">73M</div>
            <div className="text-xs text-green-400 mt-1">+18% vs last period</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <ThumbsUp className="w-4 h-4" />
              Engagement Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">8.5%</div>
            <div className="text-xs text-green-400 mt-1">+2.3% vs last period</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Total Shares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">156K</div>
            <div className="text-xs text-green-400 mt-1">+12% vs last period</div>
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
            <div className="text-2xl font-bold text-white">$255,730</div>
            <div className="text-xs text-green-400 mt-1">+15% vs last period</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">YouTube Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {youtubeVideos.map((video) => (
              <div key={video.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <Youtube className="w-8 h-8 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium mb-2">{video.title}</div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Views</div>
                        <div className="text-white font-medium">{video.views}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Likes</div>
                        <div className="text-white font-medium">{video.likes}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Comments</div>
                        <div className="text-white font-medium">{video.comments}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Shares</div>
                        <div className="text-white font-medium">{video.shares}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium text-lg">{video.earnings}</div>
                    <div className="text-sm text-gray-400">CPM: {video.cpm}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Platform Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {platforms.map((platform, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{platform.name}</div>
                      <div className="text-sm text-gray-400">
                        {platform.videos ? `${platform.videos} videos` : `${platform.tracks} tracks`} • 
                        {platform.views ? ` ${platform.views} views` : ` ${platform.plays} plays`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{platform.earnings}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Top Performing Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { title: 'Summer Vibes MV', metric: '2.3M views', change: '+45%' },
                { title: 'Midnight Dreams Lyric', metric: '1.8M views', change: '+32%' },
                { title: 'Electric Soul BTS', metric: '890K views', change: '+28%' },
                { title: 'Urban Rhythm Live', metric: '650K views', change: '+22%' },
                { title: 'Sunset Boulevard Remix', metric: '420K views', change: '+18%' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
                  <div>
                    <div className="text-gray-300 text-sm">{item.title}</div>
                    <div className="text-xs text-gray-400">{item.metric}</div>
                  </div>
                  <span className="text-green-400 text-sm">{item.change}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrackingDashboard;