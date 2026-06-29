// 🎬 Enhanced Video Background Component with GOAT Branding
// Combines dynamic videos with GOAT logo overlays

import { useState, useEffect, useRef } from 'react';
import GoatBranding from './GoatBranding';

const EnhancedVideoBackground = ({ 
  showGoatLogo = true,
  logoPosition = 'center',
  videos = [], 
  autoPlay = true, 
  muted = true, 
  loop = true,
  className = "",
  overlayOpacity = 0.4,
  transitionDuration = 2000
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  // 🎥 Available background videos with GOAT branding
  const defaultVideos = [
    '/videos/backgrounds/grok-video-86c93c9c-4fd8-4256-af66-005c30855691.mp4', // Main background
    '/videos/backgrounds/grok-video-4fca66f9-2b92-4c4a-b9df-b42b33ceb052.mp4', // Alternative 1
    '/videos/backgrounds/grok-video-b71352bf-f82c-46e5-ae08-0cc25fcdc33f.mp4', // Alternative 2
    '/videos/backgrounds/grok-video-210800ab-b662-4a54-b90f-8a37dcd54099.mp4', // Alternative 3
    '/videos/backgrounds/grok-video-4f28cf25-600c-43f4-8108-28cccd06909a.mp4', // Alternative 4
    '/videos/backgrounds/grok-video-e8139ccc-06ad-4117-8b2e-c6121e784330-2.mp4', // Alternative 5
    '/videos/backgrounds/grok-video-0001ca7b-403c-4e4b-9883-801c516b8c2d.mp4', // Alternative 6
    '/videos/backgrounds/grok-video-BLUE GOAT 23).mp4', // GOAT branded
    '/videos/backgrounds/grok-video-BLUE GOAT CANT FUCK WITH ME).mp4', // GOAT branded 2
    '/videos/backgrounds/grok-video- NERD BITCH3.mp4' // Special edition
  ];

  const videoSources = videos.length > 0 ? videos : defaultVideos;

  // 🎬 Video rotation effect
  useEffect(() => {
    if (!autoPlay || videoSources.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videoSources.length);
    }, 12000); // Change video every 12 seconds

    return () => clearInterval(interval);
  }, [autoPlay, videoSources.length]);

  // 🎥 Video load handling
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
      if (autoPlay) {
        video.play().catch(error => {
          console.log('Auto-play prevented:', error);
        });
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (loop && videoSources.length === 1) {
        video.currentTime = 0;
        video.play();
      }
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    // Set video properties
    video.muted = muted;
    video.loop = loop;
    video.playsInline = true;

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [autoPlay, loop, muted, videoSources.length]);

  // 🎯 Manual video control
  const changeVideo = (index) => {
    setCurrentVideoIndex(index);
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    }
  };

  // 📍 Logo positioning
  const getLogoPosition = () => {
    switch (logoPosition) {
      case 'top-left':
        return 'top-8 left-8';
      case 'top-right':
        return 'top-8 right-8';
      case 'bottom-left':
        return 'bottom-8 left-8';
      case 'bottom-right':
        return 'bottom-8 right-8';
      case 'center':
      default:
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* 🎥 Video Background */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          key={currentVideoIndex}
          className="w-full h-full object-cover"
          style={{
            filter: 'brightness(0.6) contrast(1.2) saturate(1.3)',
            transform: 'scale(1.05)',
            transition: `opacity ${transitionDuration}ms ease-in-out`
          }}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline
        >
          <source 
            src={videoSources[currentVideoIndex]} 
            type="video/mp4" 
          />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* 🌟 Overlay for better content visibility */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black/50 to-blue-900/30"
        style={{ opacity: overlayOpacity }}
      />

      {/* ✨ Animated particles overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.6 + 0.2,
                animationDuration: `${Math.random() * 3 + 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* 🐐 GOAT Branding Overlay */}
      {showGoatLogo && (
        <div className={`absolute z-20 ${getLogoPosition()}`}>
          <div className="relative">
            {/* Logo glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full blur-xl opacity-50 animate-pulse" />
            
            {/* GOAT Logo */}
            <div className="relative bg-black/60 backdrop-blur-md rounded-full p-4 border border-purple-500/30">
              <GoatBranding 
                size="small" 
                variant="neon" 
                glow={false}
                className="w-16 h-16"
              />
            </div>

            {/* Floating crown */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <svg className="w-5 h-5 text-yellow-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* 🎮 Video Controls (Optional - for development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 right-4 z-50 flex flex-col gap-2">
          <div className="bg-black/70 backdrop-blur-md rounded-lg p-2">
            <p className="text-white text-xs mb-2">Enhanced Video Controls:</p>
            <button
              onClick={togglePlayPause}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded mb-2 w-full"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <div className="flex flex-wrap gap-1 max-w-xs">
              {videoSources.map((_, index) => (
                <button
                  key={index}
                  onClick={() => changeVideo(index)}
                  className={`text-xs px-2 py-1 rounded ${
                    currentVideoIndex === index 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 📊 Video Status Indicator */}
      <div className="absolute top-4 right-4 z-40">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md ${
          isLoaded 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isLoaded ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
          }`} />
          {isLoaded ? 'GOAT Video Ready' : 'Loading GOAT...'}
        </div>
      </div>

      {/* 🎬 Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-center">
            <div className="relative">
              <GoatBranding size="medium" animated={true} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
            <p className="text-white/90 text-xl font-medium mt-6">Loading GOAT Experience...</p>
            <p className="text-white/60 text-sm mt-2">Greatest Of All Time Royalty Platform</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedVideoBackground;