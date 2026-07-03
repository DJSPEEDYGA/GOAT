/**
 * Sora 2 AI Studio - AI-Powered Video Generation
 * Text-to-video, image-to-video, and AI video creation
 */

import React, { useState } from 'react';
import { Sparkles, Video, Wand2, Image, Type, Zap, Download, Play, RefreshCw } from 'lucide-react';

export default function SoraAIStudio() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState([]);

  const presetPrompts = [
    "A GOAT wearing a crown, standing on top of a mountain of gold coins, cinematic lighting, 4K",
    "Harvey Miller and Waka Flocka Flame in a futuristic recording studio with holographic displays",
    "Money raining down in slow motion with GOAT Force logo appearing",
    "Epic music video scene with dancers and neon lights, hip-hop style",
    "Luxury cars and mansions, success montage, cinematic drone shots"
  ];

  const aiFeatures = [
    {
      icon: Type,
      title: 'Text-to-Video',
      description: 'Generate videos from text descriptions',
      color: 'from-purple-600 to-pink-600'
    },
    {
      icon: Image,
      title: 'Image-to-Video',
      description: 'Animate static images into videos',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: Wand2,
      title: 'Style Transfer',
      description: 'Apply artistic styles to videos',
      color: 'from-green-600 to-emerald-600'
    },
    {
      icon: Zap,
      title: 'AI Enhancement',
      description: 'Upscale and enhance video quality',
      color: 'from-yellow-600 to-orange-600'
    }
  ];

  const generationHistory = [
    {
      id: 1,
      prompt: 'GOAT Force logo animation with gold particles',
      thumbnail: '👑',
      duration: '0:10',
      status: 'completed',
      video: '/videos/grok-video- (1).mp4'
    },
    {
      id: 2,
      prompt: 'Blue GOAT character in cyberpunk city',
      thumbnail: '💙',
      duration: '0:15',
      status: 'completed',
      video: '/videos/grok-video-BLUE GOAT 23).mp4'
    },
    {
      id: 3,
      prompt: 'Money and success visualization',
      thumbnail: '💰',
      duration: '0:12',
      status: 'completed',
      video: '/videos/grok-video- (3).mp4'
    },
    {
      id: 4,
      prompt: 'Epic music video scene',
      thumbnail: '🎬',
      duration: '0:20',
      status: 'processing',
      progress: 75
    }
  ];

  const handleGenerate = () => {
    if (!prompt) return;
    
    setGenerating(true);
    setTimeout(() => {
      setGeneratedVideos([
        {
          id: Date.now(),
          prompt: prompt,
          thumbnail: '✨',
          duration: '0:15',
          status: 'completed',
          video: '/videos/grok-video- (1).mp4'
        },
        ...generatedVideos
      ]);
      setGenerating(false);
      setPrompt('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white">Sora 2 AI Studio</h1>
            <p className="text-gray-400">AI-Powered Video Generation & Creation</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/50 backdrop-blur-md border border-purple-500/30 rounded-xl p-4">
            <Video className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">247</p>
            <p className="text-gray-400 text-sm">Videos Generated</p>
          </div>
          <div className="bg-black/50 backdrop-blur-md border border-blue-500/30 rounded-xl p-4">
            <Zap className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">4K HDR</p>
            <p className="text-gray-400 text-sm">Max Quality</p>
          </div>
          <div className="bg-black/50 backdrop-blur-md border border-green-500/30 rounded-xl p-4">
            <RefreshCw className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">3</p>
            <p className="text-gray-400 text-sm">Processing</p>
          </div>
          <div className="bg-black/50 backdrop-blur-md border border-yellow-500/30 rounded-xl p-4">
            <Sparkles className="w-6 h-6 text-yellow-400 mb-2" />
            <p className="text-2xl font-bold text-white">98%</p>
            <p className="text-gray-400 text-sm">AI Accuracy</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generation Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prompt Input */}
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-purple-400" />
              Generate Video with AI
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-white font-semibold mb-2 block">Video Description</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the video you want to create... (e.g., 'A GOAT wearing a crown, cinematic lighting, 4K')"
                  className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none min-h-[120px]"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={!prompt || generating}
                  className="flex-1 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Video
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Preset Prompts */}
            <div className="mt-6">
              <p className="text-gray-400 text-sm mb-3">Quick Prompts:</p>
              <div className="flex flex-wrap gap-2">
                {presetPrompts.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(preset)}
                    className="goat-gradient-card goat-gradient-card goat-card-hover/10 hover:bg-white/20 text-white px-3 py-1 rounded-xl text-sm transition-colors"
                  >
                    {preset.substring(0, 40)}...
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Features */}
          <div className="grid grid-cols-2 gap-4">
            {aiFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Generation History */}
        <div className="lg:col-span-1">
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-400" />
              Generation History
            </h2>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {generationHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-black/30 rounded-xl p-4 border border-white/10 hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl">{item.thumbnail}</div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm mb-1">{item.prompt}</p>
                      <p className="text-gray-400 text-xs">{item.duration}</p>
                    </div>
                  </div>

                  {item.status === 'completed' ? (
                    <div className="flex items-center gap-2">
                      <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm font-semibold flex items-center justify-center gap-1">
                        <Play className="w-4 h-4" />
                        Play
                      </button>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-semibold">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-yellow-400 text-xs font-semibold">Processing...</span>
                        <span className="text-gray-400 text-xs">{item.progress}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-600 to-pink-600 h-2 rounded-full transition-all"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="mt-6 bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Advanced Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Resolution</label>
            <select className="w-full bg-black/50 border border-white/20 rounded-xl p-2 text-white">
              <option>1080p HD</option>
              <option>4K UHD</option>
              <option>8K</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Duration</label>
            <select className="w-full bg-black/50 border border-white/20 rounded-xl p-2 text-white">
              <option>5 seconds</option>
              <option>10 seconds</option>
              <option>15 seconds</option>
              <option>30 seconds</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Style</label>
            <select className="w-full bg-black/50 border border-white/20 rounded-xl p-2 text-white">
              <option>Cinematic</option>
              <option>Anime</option>
              <option>Realistic</option>
              <option>Abstract</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">FPS</label>
            <select className="w-full bg-black/50 border border-white/20 rounded-xl p-2 text-white">
              <option>24 fps</option>
              <option>30 fps</option>
              <option>60 fps</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}