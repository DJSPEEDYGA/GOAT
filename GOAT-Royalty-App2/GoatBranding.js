// 🐐 GOAT Branding Component - Ultra Realistic Posters & Logos
// Professional branding elements for GOAT Royalty App

import React, { useState, useEffect } from 'react';

const GoatBranding = ({ 
  variant = 'default',
  size = 'medium',
  animated = true,
  glow = true,
  className = ''
}) => {
  const [currentPoster, setCurrentPoster] = useState(0);
  
  // 🎨 Available GOAT branding images
  const goatPosters = [
    '/images/logos/ULTRA REALISTIC POSTERS.png',
    '/images/logos/ULTRA REALISTIC9 POSTERS.png'
  ];

  // 📏 Size configurations
  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-48 h-48',
    large: 'w-64 h-64',
    xlarge: 'w-96 h-96',
    fullscreen: 'w-full h-full'
  };

  const textSizes = {
    small: 'text-xl',
    medium: 'text-3xl',
    large: 'text-5xl',
    xlarge: 'text-7xl',
    fullscreen: 'text-8xl'
  };

  // 🎭 Branding variants
  const variants = {
    default: {
      background: 'bg-gradient-to-br from-purple-900/90 via-black/80 to-blue-900/90',
      border: 'border-2 border-purple-500/50',
      text: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400'
    },
    premium: {
      background: 'bg-gradient-to-br from-gold-900/90 via-black/90 to-platinum-900/90',
      border: 'border-2 border-yellow-500/50',
      text: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-yellow-300'
    },
    stealth: {
      background: 'bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95',
      border: 'border border-gray-700/50',
      text: 'text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-300'
    },
    neon: {
      background: 'bg-gradient-to-br from-pink-900/90 via-purple-900/90 to-blue-900/90',
      border: 'border-2 border-pink-500/50',
      text: 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400'
    }
  };

  const currentVariant = variants[variant] || variants.default;

  // 🎬 Poster rotation effect
  useEffect(() => {
    if (!animated || goatPosters.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentPoster((prev) => (prev + 1) % goatPosters.length);
    }, 5000); // Change poster every 5 seconds

    return () => clearInterval(interval);
  }, [animated]);

  // 🐐 Main branding component
  const BrandingLogo = () => (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* 🌟 Glow effect */}
      {glow && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 blur-xl opacity-50 animate-pulse" />
      )}
      
      {/* 🖼️ Poster background */}
      <div className={`relative rounded-xl ${currentVariant.background} ${currentVariant.border} backdrop-blur-md overflow-hidden shadow-2xl`}>
        {/* 🐐 GOAT Poster Image */}
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <img
            src={goatPosters[currentPoster]}
            alt="GOAT Royalty Branding"
            className="w-full h-full object-contain rounded-lg opacity-90 hover:opacity-100 transition-opacity duration-300"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.3))'
            }}
          />
        </div>

        {/* ✨ Overlay effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        
        {/* 🎭 Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: Math.random() * 0.6 + 0.2,
                animationDuration: `${Math.random() * 2 + 1}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* 🏆 Crown emblem */}
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
        <svg className="w-5 h-5 text-yellow-900" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.86-2h8.28l.96-5.88-2.68 2.68L12 8.5l-2.42 2.3L6.9 8.12L7.86 14z"/>
        </svg>
      </div>
    </div>
  );

  // 📱 Mobile branding variant
  const MobileBranding = () => (
    <div className={`relative ${className}`}>
      <div className={`relative rounded-lg ${currentVariant.background} ${currentVariant.border} backdrop-blur-sm overflow-hidden shadow-xl`}>
        <img
          src={goatPosters[currentPoster]}
          alt="GOAT Royalty Mobile"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
    </div>
  );

  // 🎯 Logo only variant
  const LogoOnly = () => (
    <div className={`relative ${className}`}>
      <div className={`${textSizes[size]} ${currentVariant.text} font-black tracking-wider flex items-center justify-center`}>
        GOAT
        <span className="ml-2 text-2xl">🐐</span>
      </div>
      {glow && (
        <div className="absolute inset-0 blur-xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-30 -z-10" />
      )}
    </div>
  );

  // 🎨 Select appropriate rendering based on context
  if (size === 'fullscreen') {
    return (
      <div className={`relative w-full h-screen flex items-center justify-center ${className}`}>
        <div className="absolute inset-0">
          <img
            src={goatPosters[currentPoster]}
            alt="GOAT Royalty Fullscreen"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-black/70 to-blue-900/80" />
        </div>
        <div className="relative z-10 text-center">
          <h1 className={`text-6xl md:text-9xl font-black ${currentVariant.text} mb-4`}>
            GOAT ROYALTY
          </h1>
          <p className="text-xl md:text-3xl text-white/80 font-light">
            The Future of Music Publishing
          </p>
        </div>
      </div>
    );
  }

  if (size === 'small') {
    return <MobileBranding />;
  }

  if (variant === 'logo-only') {
    return <LogoOnly />;
  }

  return <BrandingLogo />;
};

// 🎯 Specialized branding components
export const GoatHero = () => (
  <div className="relative w-full h-screen overflow-hidden">
    <GoatBranding size="fullscreen" animated={true} glow={true} />
    <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
      <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
        GOAT ROYALTY
      </h1>
      <p className="text-xl text-white/80 mb-8">
        Greatest Of All Time Music Publishing Platform
      </p>
      <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
        Launch Dashboard
      </button>
    </div>
  </div>
);

export const GoatHeader = ({ className = '' }) => (
  <div className={`flex items-center space-x-4 ${className}`}>
    <GoatBranding size="small" variant="neon" />
    <div>
      <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
        GOAT ROYALTY
      </h1>
      <p className="text-sm text-white/60">Music Publishing Platform</p>
    </div>
  </div>
);

export const GoatSidebarLogo = () => (
  <div className="p-4">
    <GoatBranding size="medium" variant="stealth" className="mx-auto" />
    <div className="text-center mt-4">
      <h2 className="text-lg font-bold text-white">GOAT</h2>
      <p className="text-xs text-white/60">Royalty Management</p>
    </div>
  </div>
);

export const GoatLoadingScreen = () => (
  <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
    <GoatBranding size="large" animated={true} />
    <div className="absolute bottom-20 text-center">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-white/80 text-lg">Loading GOAT Royalty...</p>
    </div>
  </div>
);

// 🎯 Background patterns with GOAT branding
export const GoatBackgroundPattern = ({ opacity = 0.1 }) => (
  <div 
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage: `url('/images/logos/ULTRA REALISTIC POSTERS.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity,
      mixBlendMode: 'overlay'
    }}
  />
);

export default GoatBranding;