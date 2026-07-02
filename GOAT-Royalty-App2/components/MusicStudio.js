import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music2, Play, Pause, BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';

const MusicStudio = () => {
  const [playingTrack, setPlayingTrack] = useState(null);

  const tracks = [
    { 
      id: 1, 
      title: 'Summer Vibes', 
      artist: 'DJ Speedy',
      album: 'Sunset Collection',
      plays: '2.3M', 
      earnings: '$45,230',
      duration: '3:45',
      status: 'Active'
    },
    { 
      id: 2, 
      title: 'Midnight Dreams', 
      artist: 'DJ Speedy',
      album: 'Night Sessions',
      plays: '1.8M', 
      earnings: '$38,920',
      duration: '4:12',
      status: 'Active'
    },
    { 
      id: 3, 
      title: 'Electric Soul', 
      artist: 'DJ Speedy',
      album: 'Urban Beats',
      plays: '1.2M', 
      earnings: '$21,450',
      duration: '3:28',
      status: 'Active'
    },
    { 
      id: 4, 
      title: 'Urban Rhythm', 
      artist: 'DJ Speedy',
      album: 'City Lights',
      plays: '890K', 
      earnings: '$12,340',
      duration: '3:55',
      status: 'Active'
    },
    { 
      id: 5, 
      title: 'Sunset Boulevard', 
      artist: 'DJ Speedy',
      album: 'Sunset Collection',
      plays: '450K', 
      earnings: '$7,900',
      duration: '4:30',
      status: 'New'
    }
  ];

  const albums = [
    { name: 'Sunset Collection', tracks: 12, released: '2024-06-15', earnings: '$67,890' },
    { name: 'Night Sessions', tracks: 10, released: '2024-03-20', earnings: '$54,320' },
    { name: 'Urban Beats', tracks: 8, released: '2023-11-10', earnings: '$43,210' }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border-pink-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-400">
            <Music2 className="w-5 h-5" />
            Music Studio - Track Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button className="bg-pink-600 hover:bg-pink-700">
              <Music2 className="w-4 h-4 mr-2" />
              Upload New Track
            </Button>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <Music2 className="w-4 h-4" />
              Total Tracks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{tracks.length}</div>
            <div className="text-xs text-green-400 mt-1">+2 this month</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <Play className="w-4 h-4" />
              Total Plays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">6.6M</div>
            <div className="text-xs text-green-400 mt-1">+15% this month</div>
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
            <div className="text-2xl font-bold text-white">$125,840</div>
            <div className="text-xs text-green-400 mt-1">+12% this month</div>
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
            <div className="text-xs text-green-400 mt-1">+8% this month</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Your Tracks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tracks.map((track) => (
              <div key={track.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPlayingTrack(playingTrack === track.id ? null : track.id)}
                    className="w-10 h-10 p-0"
                  >
                    {playingTrack === track.id ? (
                      <Pause className="w-5 h-5 text-pink-400" />
                    ) : (
                      <Play className="w-5 h-5 text-pink-400" />
                    )}
                  </Button>
                  <div className="flex-1">
                    <div className="text-white font-medium">{track.title}</div>
                    <div className="text-sm text-gray-400">
                      {track.artist} • {track.album} • {track.duration}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{track.plays} plays</div>
                    <div className="text-sm text-green-400">{track.earnings}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    track.status === 'New' 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {track.status}
                  </span>
                  <Button size="sm" variant="outline">Details</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Albums</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {albums.map((album, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <div>
                    <div className="text-white font-medium">{album.name}</div>
                    <div className="text-sm text-gray-400">
                      {album.tracks} tracks • Released {album.released}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{album.earnings}</div>
                    <Button size="sm" variant="ghost" className="text-xs">View</Button>
                  </div>
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
                "Sunset Boulevard" reached 500K plays
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                New playlist addition: "Summer Vibes"
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                Royalty payment processed: $12,450
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                "Midnight Dreams" trending in Europe
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                New follower milestone: 100K
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MusicStudio;