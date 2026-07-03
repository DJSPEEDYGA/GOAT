import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Video, Settings, Film, Play, Square } from 'lucide-react';

const CinemaCamera = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [resolution, setResolution] = useState('4K');
  const [fps, setFps] = useState('30');

  const resolutions = ['8K', '6K', '4K', '2K', '1080p'];
  const frameRates = ['24', '30', '60', '120'];
  const colorProfiles = ['Standard', 'Cinematic', 'Vivid', 'Flat'];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <Camera className="w-5 h-5" />
            Cinema Camera System - Professional Recording
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsRecording(!isRecording)}
              className={isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline">
              <Film className="w-4 h-4 mr-2" />
              Gallery
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Camera Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center border-2 border-gray-700">
              <div className="text-center">
                <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <div className="text-gray-400">Camera Preview</div>
                {isRecording && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400 font-medium">Recording...</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Resolution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {resolutions.map((res) => (
                  <Button
                    key={res}
                    variant={resolution === res ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setResolution(res)}
                    className={resolution === res ? 'bg-red-600' : ''}
                  >
                    {res}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Frame Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {frameRates.map((rate) => (
                  <Button
                    key={rate}
                    variant={fps === rate ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFps(rate)}
                    className={fps === rate ? 'bg-red-600' : ''}
                  >
                    {rate} fps
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Color Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {colorProfiles.map((profile) => (
                  <Button
                    key={profile}
                    variant="outline"
                    size="sm"
                  >
                    {profile}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">Current Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Resolution:</span>
              <span className="text-white font-medium">{resolution}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Frame Rate:</span>
              <span className="text-white font-medium">{fps} fps</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className={isRecording ? 'text-red-400' : 'text-green-400'}>
                {isRecording ? 'Recording' : 'Ready'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">Storage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Available:</span>
              <span className="text-white font-medium">256 GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Used:</span>
              <span className="text-white font-medium">89 GB</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-red-500 h-2 rounded-full" style={{width: '35%'}}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">Recent Recordings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="text-gray-300">Music Video - 4K 30fps</div>
            <div className="text-gray-300">Behind Scenes - 1080p 60fps</div>
            <div className="text-gray-300">Interview - 4K 24fps</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CinemaCamera;