/**
 * Enhanced Video Background Component
 * GOAT Force branded video background with red/black theme
 * Fallback gradient is vibrant enough to look great without video
 */

import React, { useState, useEffect, useRef } from 'react';

const EnhancedVideoBackground = ({ 
  showGoatLogo = true, 
  logoPosition = 'top-right',
  autoPlay = true,
  muted = true,
  loop = true,
  overlayOpacity = 0.4 
}) => {
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);

  const videos = [
    '/videos/goat-logo-animation.mp4',
    '/videos/grok-video-BLUE GOAT CANT FUCK WITH ME).mp4',
    '/videos/grok-video-BLUE GOAT 23).mp4',
    '/videos/grok-video- NERD BITCH3.mp4',
    '/videos/grok-video- (1).mp4',
    '/videos/grok-video- (2).mp4',
    '/videos/grok-video- (3).mp4'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [currentVideo]);

  return (
    <div className="fixed inset-0 z-0">
      {/* Rich animated gradient background — always visible, looks great without video */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, #1a0000 0%, #2d0a0a 20%, #0A0A0A 45%, #0A0A0A 55%, #1a0505 80%, #2d0a0a 100%)'
      }}>
        {/* Animated red glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(220, 38, 38, 0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[130px] animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)', animationDelay: '2s' }} />
        <div className="absolute top-2/3 left-1/2 w-[400px] h-[400px] rounded-full blur-[120px] animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(220, 38, 38, 0.1) 0%, transparent 70%)', animationDelay: '4s' }} />
      </div>

      {/* Video Background — only shows when loaded */}
      <video
        ref={videoRef}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        onLoadedData={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-30' : 'opacity-0'}`}
        style={{ filter: 'brightness(0.5) saturate(1.4)' }}
      >
        <source src={videos[currentVideo]} type="video/mp4" />
      </video>

      {/* Subtle overlay — NOT heavy black */}
      <div 
        className="absolute inset-0" 
        style={{ 
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.4) 100%)',
          opacity: overlayOpacity 
        }}
      />

      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent"
          style={{ animation: 'goat-scan-line 4s linear infinite' }}
        />
      </div>
      
      {/* GOAT Logo Watermark */}
      {showGoatLogo && (
        <div className={`absolute ${logoPosition === 'top-right' ? 'top-6 right-6' : 'top-6 left-6'} z-10`}>
          <img 
            src="/images/branding/goat-icon-64.png" 
            alt="GOAT Force" 
            className="w-12 h-12 rounded-xl opacity-40 hover:opacity-80 transition-opacity duration-300"
            style={{ filter: 'drop-shadow(0 0 10px rgba(220, 38, 38, 0.5))' }}
          />
        </div>
      )}

      {/* Bottom gradient fade — subtle */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent"></div>
    </div>
  );
};

export default EnhancedVideoBackground;