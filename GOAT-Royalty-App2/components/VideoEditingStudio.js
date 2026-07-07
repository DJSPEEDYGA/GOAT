import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Video, Film, Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Maximize, Settings, Scissors,
  Layers, Type, Music, Image, Sparkles, Wand2,
  Sun, Moon, Contrast, Droplet, Palette, Circle,
  Square, Triangle, Star, Heart, Zap, Flame,
  RotateCcw, RotateCw, FlipHorizontal, FlipVertical,
  ZoomIn, ZoomOut, Move, Eye, EyeOff, Trash2,
  Copy, Download, Upload, Share2, Save, Undo, Redo
} from 'lucide-react';

// ============================================================
// GOAT VIDEO EDITING STUDIO
// Professional 3D Effects, AI Enhancement, Timeline Editor
// ============================================================

// Effect Categories
const EFFECT_CATEGORIES = {
  TRANSITIONS: {
    id: 'transitions',
    name: 'Transitions',
    icon: Layers,
    effects: [
      { id: 'fade', name: 'Fade', icon: Sun, duration: '1s' },
      { id: 'dissolve', name: 'Dissolve', icon: Moon, duration: '1.5s' },
      { id: 'wipe', name: 'Wipe', icon: Square, duration: '0.8s' },
      { id: 'slide', name: 'Slide', icon: Move, duration: '1s' },
      { id: 'zoom', name: 'Zoom', icon: ZoomIn, duration: '1.2s' },
      { id: 'spin', name: 'Spin', icon: RotateCw, duration: '1.5s' },
    ]
  },
  FILTERS: {
    id: 'filters',
    name: 'Filters',
    icon: Palette,
    effects: [
      { id: 'vintage', name: 'Vintage', icon: Sun, type: 'color' },
      { id: 'noir', name: 'Noir', icon: Moon, type: 'bw' },
      { id: 'vivid', name: 'Vivid', icon: Sparkles, type: 'color' },
      { id: 'cool', name: 'Cool Tone', icon: Droplet, type: 'color' },
      { id: 'warm', name: 'Warm Tone', icon: Flame, type: 'color' },
      { id: 'cinematic', name: 'Cinematic', icon: Film, type: 'color' },
    ]
  },
  _3D_EFFECTS: {
    id: '3d_effects',
    name: '3D Effects',
    icon: Triangle,
    effects: [
      { id: '3d_rotate', name: '3D Rotate', icon: RotateCw, type: '3d' },
      { id: '3d_flip', name: '3D Flip', icon: FlipHorizontal, type: '3d' },
      { id: 'parallax', name: 'Parallax', icon: Layers, type: '3d' },
      { id: 'depth_blur', name: 'Depth Blur', icon: Circle, type: '3d' },
      { id: '3d_zoom', name: '3D Zoom', icon: ZoomIn, type: '3d' },
      { id: 'perspective', name: 'Perspective', icon: Triangle, type: '3d' },
    ]
  },
  OVERLAYS: {
    id: 'overlays',
    name: 'Overlays',
    icon: Sparkles,
    effects: [
      { id: 'particles', name: 'Particles', icon: Star, type: 'overlay' },
      { id: 'light_leak', name: 'Light Leak', icon: Sun, type: 'overlay' },
      { id: 'glitch', name: 'Glitch', icon: Zap, type: 'overlay' },
      { id: 'bokeh', name: 'Bokeh', icon: Circle, type: 'overlay' },
      { id: 'film_grain', name: 'Film Grain', icon: Film, type: 'overlay' },
      { id: 'vhs', name: 'VHS Effect', icon: Video, type: 'overlay' },
    ]
  },
  TEXT_EFFECTS: {
    id: 'text_effects',
    name: 'Text Effects',
    icon: Type,
    effects: [
      { id: 'typewriter', name: 'Typewriter', icon: Type, type: 'text' },
      { id: 'glow_text', name: 'Glow Text', icon: Sparkles, type: 'text' },
      { id: '3d_text', name: '3D Text', icon: Triangle, type: 'text' },
      { id: 'outline', name: 'Outline', icon: Square, type: 'text' },
      { id: 'shadow', name: 'Drop Shadow', icon: Moon, type: 'text' },
      { id: 'kinetic', name: 'Kinetic Type', icon: Zap, type: 'text' },
    ]
  }
};

// Timeline Track Type
const TRACK_TYPES = {
  VIDEO: { id: 'video', name: 'Video', color: '#3B82F6', icon: Video },
  AUDIO: { id: 'audio', name: 'Audio', color: '#10B981', icon: Music },
  TEXT: { id: 'text', name: 'Text', color: '#F59E0B', icon: Type },
  EFFECT: { id: 'effect', name: 'Effect', color: '#8B5CF6', icon: Sparkles },
  IMAGE: { id: 'image', name: 'Image', color: '#EC4899', icon: Image }
};

const VideoEditingStudio = () => {
  // State Management
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 3 minutes
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [activeCategory, setActiveCategory] = useState('transitions');
  const [tracks, setTracks] = useState([
    { id: 1, type: 'video', name: 'Main Video', clips: [
      { id: 1, start: 0, duration: 60, name: 'Clip 1', color: '#3B82F6' },
      { id: 2, start: 65, duration: 45, name: 'Clip 2', color: '#2563EB' },
      { id: 3, start: 115, duration: 65, name: 'Clip 3', color: '#1D4ED8' },
    ]},
    { id: 2, type: 'audio', name: 'Music Track', clips: [
      { id: 4, start: 0, duration: 180, name: 'Background Music', color: '#10B981' },
    ]},
    { id: 3, type: 'text', name: 'Text Overlays', clips: [
      { id: 5, start: 10, duration: 20, name: 'Title', color: '#F59E0B' },
      { id: 6, start: 90, duration: 15, name: 'Subtitle', color: '#D97706' },
    ]},
    { id: 4, type: 'effect', name: 'Effects', clips: [
      { id: 7, start: 55, duration: 10, name: 'Transition', color: '#8B5CF6' },
    ]},
  ]);
  const [selectedClip, setSelectedClip] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showPreview, setShowPreview] = useState(true);
  const [aiEnhancing, setAiEnhancing] = useState(false);
  
  const timelineRef = useRef(null);
  const videoRef = useRef(null);

  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Playback simulation
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  // Toggle playback
  const togglePlayback = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Seek to position
  const seekTo = useCallback((time) => {
    setCurrentTime(Math.max(0, Math.min(time, duration)));
  }, [duration]);

  // Add effect to clip
  const addEffect = useCallback((effect) => {
    if (selectedClip) {
      setSelectedEffect(effect);
      // Add effect to selected clip logic
    }
  }, [selectedClip]);

  // AI Enhancement simulation
  const enhanceWithAI = useCallback(() => {
    setAiEnhancing(true);
    setTimeout(() => {
      setAiEnhancing(false);
    }, 3000);
  }, []);

  // Export video
  const exportVideo = useCallback(() => {
    // Export logic
  }, []);

  // Render timeline clips
  const renderTimelineClip = (clip, track) => {
    const leftPercent = (clip.start / duration) * 100;
    const widthPercent = (clip.duration / duration) * 100;
    
    return (
      <div
        key={clip.id}
        className={`absolute top-1 h-8 rounded cursor-pointer transition-all ${
          selectedClip?.id === clip.id ? 'ring-2 ring-white' : ''
        }`}
        style={{
          left: `${leftPercent}%`,
          width: `${widthPercent}%`,
          backgroundColor: clip.color
        }}
        onClick={() => setSelectedClip(clip)}
      >
        <span className="text-xs text-white p-1 truncate block">{clip.name}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-full mx-auto space-y-4">
        
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
          <CardHeader className="py-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xl text-purple-400">
                <Film className="w-6 h-6" />
                GOAT Video Editing Studio
                <span className="text-sm bg-pink-600 px-2 py-1 rounded">Pro v2.0</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-gray-300">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" className="text-gray-300">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button size="sm" className="bg-pink-600 hover:bg-pink-700">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-12 gap-4">
          {/* Left Sidebar - Tools */}
          <div className="col-span-2">
            <Card className="bg-gray-800/50 border-gray-700 h-full">
              <CardHeader className="py-3">
                <CardTitle className="text-white text-sm">Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { id: 'select', icon: Move, label: 'Select' },
                  { id: 'cut', icon: Scissors, label: 'Cut' },
                  { id: 'trim', icon: Scissors, label: 'Trim' },
                  { id: 'text', icon: Type, label: 'Text' },
                  { id: 'audio', icon: Music, label: 'Audio' },
                  { id: 'image', icon: Image, label: 'Image' },
                ].map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      selectedTool === tool.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    <tool.icon className="w-4 h-4" />
                    <span className="text-sm">{tool.label}</span>
                  </button>
                ))}
                
                <div className="pt-4 border-t border-gray-700 mt-4">
                  <Button
                    onClick={enhanceWithAI}
                    disabled={aiEnhancing}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                  >
                    {aiEnhancing ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        AI Enhance
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Preview & Timeline */}
          <div className="col-span-7 space-y-4">
            {/* Video Preview */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                  {/* Preview placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500">Video Preview</p>
                      <p className="text-gray-600 text-sm mt-2">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Play button overlay */}
                  <button
                    onClick={togglePlayback}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
                  >
                    {isPlaying ? (
                      <Pause className="w-16 h-16 text-white" />
                    ) : (
                      <Play className="w-16 h-16 text-white" />
                    )}
                  </button>
                  
                  {/* Time indicator */}
                  <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-2 py-1 rounded">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>
                
                {/* Controls */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => seekTo(0)}>
                      <SkipBack className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={togglePlayback}>
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => seekTo(duration)}>
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value))}
                      className="w-20"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-gray-400 text-sm">{zoom}%</span>
                    <Button variant="outline" size="sm">
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm">Timeline</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-gray-300">
                      <Undo className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-gray-300">
                      <Redo className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Time ruler */}
                <div className="relative h-6 bg-gray-900 rounded mb-2">
                  {[0, 30, 60, 90, 120, 150, 180].map(time => (
                    <div
                      key={time}
                      className="absolute text-xs text-gray-500"
                      style={{ left: `${(time / duration) * 100}%` }}
                    >
                      {formatTime(time)}
                    </div>
                  ))}
                  {/* Playhead */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                
                {/* Tracks */}
                <div className="space-y-2" ref={timelineRef}>
                  {tracks.map(track => (
                    <div key={track.id} className="flex items-center gap-2">
                      {/* Track label */}
                      <div className="w-24 flex-shrink-0 p-2 bg-gray-700/50 rounded">
                        <div className="flex items-center gap-1">
                          {track.type === 'video' ? <Video className="w-3 h-3 text-blue-400" /> :
                           track.type === 'audio' ? <Music className="w-3 h-3 text-green-400" /> :
                           track.type === 'text' ? <Type className="w-3 h-3 text-yellow-400" /> :
                           track.type === 'effect' ? <Sparkles className="w-3 h-3 text-purple-400" /> :
                           <Image className="w-3 h-3 text-pink-400" />}
                          <span className="text-xs text-gray-300 truncate">{track.name}</span>
                        </div>
                      </div>
                      
                      {/* Track content */}
                      <div className="flex-1 relative h-10 bg-gray-900/50 rounded">
                        {track.clips.map(clip => renderTimelineClip(clip, track))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Add track button */}
                <Button variant="outline" size="sm" className="mt-2 w-full text-gray-400">
                  + Add Track
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Effects */}
          <div className="col-span-3 space-y-4">
            {/* Effect Categories */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="py-3">
                <CardTitle className="text-white text-sm">Effects Library</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Category tabs */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {Object.values(EFFECT_CATEGORIES).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-2 py-1 rounded text-xs transition-all ${
                        activeCategory === cat.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
                
                {/* Effects grid */}
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(EFFECT_CATEGORIES)
                    .find(cat => cat.id === activeCategory)
                    ?.effects.map(effect => (
                      <button
                        key={effect.id}
                        onClick={() => addEffect(effect)}
                        className={`p-3 rounded-lg text-left transition-all ${
                          selectedEffect?.id === effect.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                        }`}
                      >
                        <effect.icon className="w-5 h-5 mb-1" />
                        <div className="text-xs">{effect.name}</div>
                        {effect.duration && (
                          <div className="text-xs text-gray-500">{effect.duration}</div>
                        )}
                      </button>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Properties Panel */}
            {selectedClip && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="py-3">
                  <CardTitle className="text-white text-sm">Clip Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-xs">Name</label>
                    <input
                      type="text"
                      value={selectedClip.name}
                      className="w-full mt-1 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                      readOnly
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-gray-400 text-xs">Start</label>
                      <input
                        type="text"
                        value={formatTime(selectedClip.start)}
                        className="w-full mt-1 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs">Duration</label>
                      <input
                        type="text"
                        value={formatTime(selectedClip.duration)}
                        className="w-full mt-1 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-red-400">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Features */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardHeader className="py-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-pink-400" />
                  AI Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { name: 'Auto Color Grade', icon: Palette },
                  { name: 'Smart Cut Detection', icon: Scissors },
                  { name: 'Audio Denoise', icon: Volume2 },
                  { name: 'Motion Tracking', icon: Move },
                  { name: 'Background Removal', icon: EyeOff },
                  { name: 'Auto Captions', icon: Type },
                ].map(feature => (
                  <button
                    key={feature.name}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-gray-700/30 rounded text-sm text-gray-300 hover:bg-gray-600/30 transition-all"
                  >
                    <feature.icon className="w-4 h-4 text-pink-400" />
                    {feature.name}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="py-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-400">
                  Project: <span className="text-white">Untitled Project</span>
                </span>
                <span className="text-gray-400">
                  Resolution: <span className="text-white">1920x1080</span>
                </span>
                <span className="text-gray-400">
                  FPS: <span className="text-white">30</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <Sparkles className="w-4 h-4" />
                <span>AI Ready</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideoEditingStudio;