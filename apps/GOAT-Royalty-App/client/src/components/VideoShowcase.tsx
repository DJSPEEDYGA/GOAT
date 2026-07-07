'use client';

import React, { useState, useEffect, useRef } from 'react';

interface VideoShowcaseProps {
  title?: string;
  autoPlay?: boolean;
  showControls?: boolean;
}

const VideoShowcase: React.FC<VideoShowcaseProps> = ({ 
  title = "GOAT VIDEO INTELLIGENCE", 
  autoPlay = true,
  showControls = true 
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videos = [
    {
      src: "/goat-assets/videos/MAIN GOAT VIDEO 2.mp4",
      title: "MAIN GOAT VIDEO",
      description: "Supreme Commander Operations",
      type: "primary"
    },
    {
      src: "/goat-assets/videos/Animate flying goat  (16).mp4", 
      title: "FLYING GOAT ANIMATION",
      description: "Aerial Reconnaissance Mission",
      type: "animation"
    },
    {
      src: "/goat-assets/videos/MS. MONEY PENNY LIVE.mp4",
      title: "MS. MONEY PENNY LIVE",
      description: "Intelligence Officer Briefing",
      type: "intelligence"
    }
  ];

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentVideoIndex]);

  const handleVideoEnd = () => {
    // Auto-play next video
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  };

  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index);
    setIsPlaying(true);
  };

  const currentVideo = videos[currentVideoIndex];

  return (
    <div className="military-panel">
      <div className="panel-header">
        <div className="panel-status"></div>
        {title}
      </div>
      
      {/* Video Player */}
      <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ height: '300px' }}>
        <video
          ref={videoRef}
          key={currentVideoIndex}
          src={currentVideo.src}
          autoPlay={autoPlay}
          muted={true}
          loop={false}
          controls={showControls}
          onEnded={handleVideoEnd}
          className="w-full h-full object-contain"
          style={{ backgroundColor: '#000' }}
        >
          Your browser does not support the video tag.
        </video>
        
        {/* Video Overlay Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="text-green-400 font-military font-bold text-sm">
            {currentVideo.title}
          </div>
          <div className="text-green-400/60 text-xs">
            {currentVideo.description}
          </div>
        </div>
        
        {/* Play/Pause Indicator */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <button
              onClick={() => setIsPlaying(true)}
              className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center hover:bg-green-500/30 transition-colors"
            >
              <div className="w-0 h-0 border-l-8 border-l-green-400 border-y-4 border-y-transparent ml-1"></div>
            </button>
          </div>
        )}
      </div>
      
      {/* Video Selection */}
      <div className="space-y-2">
        <div className="text-xs text-green-400/60 uppercase tracking-wider mb-2">
          Video Intelligence Feed
        </div>
        {videos.map((video, index) => (
          <button
            key={index}
            onClick={() => handleVideoSelect(index)}
            className={`w-full text-left p-3 rounded border transition-all ${
              index === currentVideoIndex
                ? 'bg-green-500/20 border-green-500 text-green-400'
                : 'bg-black/30 border-green-500/30 text-green-400/60 hover:bg-green-500/10 hover:border-green-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-military text-sm font-semibold">
                  {video.title}
                </div>
                <div className="text-xs opacity-70">
                  {video.description}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {index === currentVideoIndex && isPlaying && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
                <div className={`text-xs px-2 py-1 rounded ${
                  video.type === 'primary' ? 'bg-red-500/20 text-red-400' :
                  video.type === 'animation' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {video.type.toUpperCase()}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {/* Video Controls */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="military-btn text-xs flex-1"
        >
          {isPlaying ? 'PAUSE' : 'PLAY'}
        </button>
        <button
          onClick={() => {
            setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);
            setIsPlaying(true);
          }}
          className="military-btn text-xs"
        >
          PREV
        </button>
        <button
          onClick={() => {
            setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
            setIsPlaying(true);
          }}
          className="military-btn text-xs"
        >
          NEXT
        </button>
      </div>
    </div>
  );
};

export default VideoShowcase;