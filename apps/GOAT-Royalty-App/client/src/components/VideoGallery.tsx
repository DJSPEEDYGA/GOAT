'use client';

import React, { useState } from 'react';
import { Play, Pause, Maximize2, Download } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  filename: string;
  size: string;
  duration?: string;
  thumbnail?: string;
}

const videos: Video[] = [
  { id: '1', title: 'Main GOAT Video - Marvel Cap', filename: 'main-goat-video-marvel-cap1.mp4', size: '2.3 MB' },
  { id: '2', title: 'Main GOAT Video 2', filename: 'main-goat-video-2.mp4', size: '36 MB' },
  { id: '3', title: 'Main GOAT Video 3', filename: 'main-goat-video-3.mp4', size: '30 MB' },
  { id: '4', title: 'Main GOAT Video 4', filename: 'main-goat-video-4.mp4', size: '36 MB' },
  { id: '5', title: 'Animated Flying GOAT', filename: 'animate-flying-goat-.mp4', size: '13 MB' },
  { id: '6', title: 'Animated Flying GOAT 2', filename: 'animate-flying-goat--(2).mp4', size: '36 MB' },
  { id: '7', title: 'Animated Flying GOAT 3', filename: 'animate-flying-goat--(3).mp4', size: '30 MB' },
  { id: '8', title: 'Animated Flying GOAT 4', filename: 'animate-flying-goat--(4).mp4', size: '36 MB' },
  { id: '9', title: 'Animated Flying GOAT 14', filename: 'animate-flying-goat--(14).mp4', size: '5.9 MB' },
  { id: '10', title: 'Animated Flying GOAT 15', filename: 'animate-flying-goat--(15).mp4', size: '5.9 MB' },
  { id: '11', title: 'Animated Flying GOAT 16', filename: 'animate-flying-goat--(16).mp4', size: '5.9 MB' },
  { id: '12', title: 'Animated Flying GOAT 17', filename: 'animate-flying-goat--(17).mp4', size: '5.3 MB' },
  { id: '13', title: 'Animated Flying GOAT 18', filename: 'animate-flying-goat--(18).mp4', size: '5.3 MB' },
  { id: '14', title: 'Animated Flying GOAT 21', filename: 'animate-flying-goat--(21).mp4', size: '2.5 MB' },
  { id: '15', title: 'Animated Flying GOAT 22', filename: 'animate-flying-goat--(22).mp4', size: '2.3 MB' },
];

export default function VideoGallery() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set());

  const togglePlay = (videoId: string, videoElement: HTMLVideoElement) => {
    if (playingVideos.has(videoId)) {
      videoElement.pause();
      setPlayingVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    } else {
      videoElement.play();
      setPlayingVideos(prev => new Set(prev).add(videoId));
    }
  };

  const openFullscreen = (video: Video) => {
    setSelectedVideo(video);
  };

  const closeFullscreen = () => {
    setSelectedVideo(null);
  };

  const downloadVideo = (filename: string, title: string) => {
    const link = document.createElement('a');
    link.href = `/videos/branding/${filename}`;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            GOAT Brand Videos
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {videos.length} promotional videos • 249 MB total
          </p>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Video Player */}
            <div className="relative aspect-video bg-gray-900">
              <video
                id={`video-${video.id}`}
                className="w-full h-full object-cover"
                src={`/videos/branding/${video.filename}`}
                preload="metadata"
                onPlay={(e) => {
                  const videoElement = e.target as HTMLVideoElement;
                  setPlayingVideos(prev => new Set(prev).add(video.id));
                }}
                onPause={(e) => {
                  const videoElement = e.target as HTMLVideoElement;
                  setPlayingVideos(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(video.id);
                    return newSet;
                  });
                }}
              />
              
              {/* Play/Pause Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    const videoElement = document.getElementById(`video-${video.id}`) as HTMLVideoElement;
                    togglePlay(video.id, videoElement);
                  }}
                  className="p-4 bg-white/90 rounded-full hover:bg-white transition-colors"
                >
                  {playingVideos.has(video.id) ? (
                    <Pause className="w-8 h-8 text-gray-900" />
                  ) : (
                    <Play className="w-8 h-8 text-gray-900" />
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => openFullscreen(video)}
                  className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => downloadVideo(video.filename, video.title)}
                  className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Video Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {video.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {video.size}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeFullscreen}
        >
          <div className="relative w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeFullscreen}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-xl font-bold"
            >
              ✕ Close
            </button>
            <video
              className="w-full rounded-lg"
              src={`/videos/branding/${selectedVideo.filename}`}
              controls
              autoPlay
            />
            <div className="mt-4 text-white">
              <h3 className="text-xl font-bold">{selectedVideo.title}</h3>
              <p className="text-gray-400">{selectedVideo.size}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}