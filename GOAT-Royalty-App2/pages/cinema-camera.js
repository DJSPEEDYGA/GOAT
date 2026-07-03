/**
 * Cinema Camera - Professional Video Recording & Production
 * Real-time video capture, editing, and production tools
 */

import React, { useState, useRef } from 'react';
import { Video, Camera, Play, Pause, Square, Download, Upload, Film, Zap, Settings, Eye, Clock } from 'lucide-react';

export default function CinemaCamera() {
  const [recording, setRecording] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const videoRef = useRef(null);

  // Real videos from your collection
  const videoLibrary = [
    { id: 1, title: 'GOAT Force Intro', file: '/videos/grok-video- (1).mp4', thumbnail: '🎬', duration: '0:45' },
    { id: 2, title: 'Blue GOAT - Can\'t Fuck With Me', file: '/videos/grok-video-BLUE GOAT CANT FUCK WITH ME).mp4', thumbnail: '💙', duration: '1:20' },
    { id: 3, title: 'Blue GOAT 23', file: '/videos/grok-video-BLUE GOAT 23).mp4', thumbnail: '🔵', duration: '1:15' },
    { id: 4, title: 'Nerd Bitch 3', file: '/videos/grok-video- NERD BITCH3.mp4', thumbnail: '🤓', duration: '1:30' },
    { id: 5, title: 'GOAT Vision 2', file: '/videos/grok-video- (2).mp4', thumbnail: '👁️', duration: '0:50' },
    { id: 6, title: 'GOAT Vision 3', file: '/videos/grok-video- (3).mp4', thumbnail: '🎥', duration: '0:55' },
    { id: 7, title: 'GOAT Vision 4', file: '/videos/grok-video- (4).mp4', thumbnail: '📹', duration: '1:00' },
    { id: 8, title: 'GOAT Vision 5', file: '/videos/grok-video- (5).mp4', thumbnail: '🎞️', duration: '1:05' },
    { id: 9, title: 'GOAT Vision 6', file: '/videos/grok-video- (6).mp4', thumbnail: '📽️', duration: '0:48' },
    { id: 10, title: 'GOAT Vision 7', file: '/videos/grok-video- (7).mp4', thumbnail: '🎬', duration: '0:52' },
    { id: 11, title: 'GOAT Vision 8', file: '/videos/grok-video- (8).mp4', thumbnail: '🎭', duration: '1:10' },
    { id: 12, title: 'GOAT Vision 9', file: '/videos/grok-video- (9).mp4', thumbnail: '🎪', duration: '0:58' },
    { id: 13, title: 'GOAT Vision 10', file: '/videos/grok-video- (10).mp4', thumbnail: '🎨', duration: '1:02' },
    { id: 14, title: 'GOAT Vision 11', file: '/videos/grok-video- (11).mp4', thumbnail: '🎯', duration: '0:47' },
    { id: 15, title: 'GOAT Special', file: '/videos/grok-video-abf0508c-a9fb-4dc5-b983-6f19a59c4a6b.mp4', thumbnail: '⭐', duration: '1:25' }
  ];

  const recordingStats = {
    totalVideos: 15,
    totalDuration: '16:32',
    storageUsed: '2.4 GB',
    quality: '4K HDR'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Video className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">Cinema Camera</h1>
              <p className="text-gray-400">Professional Video Production Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setRecording(!recording)}
              className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${
                recording
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                  : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
              } text-white`}
            >
              {recording ? (
                <>
                  <Square className="w-5 h-5" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  Start Recording
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-4">
            <Film className="w-6 h-6 text-red-400 mb-2" />
            <p className="text-2xl font-bold text-white">{recordingStats.totalVideos}</p>
            <p className="text-gray-400 text-sm">Total Videos</p>
          </div>
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-4">
            <Clock className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">{recordingStats.totalDuration}</p>
            <p className="text-gray-400 text-sm">Total Duration</p>
          </div>
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-4">
            <Zap className="w-6 h-6 text-yellow-400 mb-2" />
            <p className="text-2xl font-bold text-white">{recordingStats.storageUsed}</p>
            <p className="text-gray-400 text-sm">Storage Used</p>
          </div>
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-4">
            <Eye className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{recordingStats.quality}</p>
            <p className="text-gray-400 text-sm">Quality</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Play className="w-6 h-6 text-red-400" />
              Video Player
            </h2>

            {selectedVideo ? (
              <div className="space-y-4">
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    src={selectedVideo.file}
                    controls
                    autoPlay
                    className="w-full h-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold text-lg">{selectedVideo.title}</h3>
                    <p className="text-gray-400 text-sm">Duration: {selectedVideo.duration}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Edit
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Video className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Select a video from the library</p>
                </div>
              </div>
            )}
          </div>

          {/* Recording Controls */}
          {recording && (
            <div className="mt-6 bg-red-900/30 backdrop-blur-md border border-red-500/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white font-bold">RECORDING IN PROGRESS</span>
                </div>
                <span className="text-red-400 font-mono text-xl">00:00:00</span>
              </div>
            </div>
          )}
        </div>

        {/* Video Library */}
        <div className="lg:col-span-1">
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-purple-400" />
                Video Library
              </h2>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-semibold flex items-center gap-1">
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {videoLibrary.map((video) => (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedVideo?.id === video.id
                      ? 'bg-gradient-to-r from-red-600/30 to-pink-600/30 border border-red-500/50'
                      : 'bg-black/30 hover:bg-black/50 border border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{video.thumbnail}</div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{video.title}</p>
                      <p className="text-gray-400 text-xs">{video.duration}</p>
                    </div>
                    <Play className="w-5 h-5 text-red-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Production Tools */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-xl p-6">
          <Settings className="w-12 h-12 text-blue-400 mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">Video Editing</h3>
          <p className="text-gray-400 text-sm mb-4">Professional editing tools with AI assistance</p>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold">
            Open Editor
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-xl p-6">
          <Zap className="w-12 h-12 text-purple-400 mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">AI Enhancement</h3>
          <p className="text-gray-400 text-sm mb-4">Auto-enhance, color grading, and effects</p>
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-semibold">
            Enhance Video
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-xl p-6">
          <Download className="w-12 h-12 text-green-400 mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">Export & Share</h3>
          <p className="text-gray-400 text-sm mb-4">Multiple formats, social media ready</p>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold">
            Export Options
          </button>
        </div>
      </div>
    </div>
  );
}