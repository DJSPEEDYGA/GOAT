import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Sparkles, Wand2, Film, Download } from 'lucide-react';

const Sora2AIStudio = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [style, setStyle] = useState('cinematic');

  const styles = [
    { id: 'cinematic', name: 'Cinematic', icon: '🎬' },
    { id: 'anime', name: 'Anime', icon: '🎨' },
    { id: 'realistic', name: 'Realistic', icon: '📸' },
    { id: 'abstract', name: 'Abstract', icon: '🌈' }
  ];

  const durations = ['5s', '10s', '15s', '30s'];
  const resolutions = ['720p', '1080p', '4K'];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border-indigo-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-400">
            <Video className="w-5 h-5" />
            Sora 2 AI Studio - AI Video Generation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Video Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the video you want to create... (e.g., 'A music video with neon lights and urban cityscape at night')"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 min-h-[100px]"
              />
            </div>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="bg-indigo-600 hover:bg-indigo-700 w-full"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Video...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Video
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">Style</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {styles.map((s) => (
                <Button
                  key={s.id}
                  variant={style === s.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStyle(s.id)}
                  className={style === s.id ? 'bg-indigo-600' : ''}
                >
                  {s.icon} {s.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {durations.map((duration) => (
                <Button
                  key={duration}
                  variant="outline"
                  size="sm"
                >
                  {duration}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">Resolution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {resolutions.map((res) => (
                <Button
                  key={res}
                  variant="outline"
                  size="sm"
                >
                  {res}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Generated Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center border-2 border-gray-700">
                  <Film className="w-12 h-12 text-gray-600" />
                </div>
                <div className="text-sm text-gray-400">Video {i}</div>
                <Button size="sm" variant="outline" className="w-full">
                  <Download className="w-3 h-3 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">AI Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-gray-400">Creativity</label>
              <input type="range" min="0" max="100" className="w-full" />
            </div>
            <div>
              <label className="text-xs text-gray-400">Motion Intensity</label>
              <input type="range" min="0" max="100" className="w-full" />
            </div>
            <div>
              <label className="text-xs text-gray-400">Detail Level</label>
              <input type="range" min="0" max="100" className="w-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Generation Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Videos Generated:</span>
              <span className="text-white font-medium">47</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Duration:</span>
              <span className="text-white font-medium">8m 45s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Credits Used:</span>
              <span className="text-white font-medium">234 / 1000</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Sora2AIStudio;