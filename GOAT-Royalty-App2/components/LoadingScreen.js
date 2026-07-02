/**
 * GOAT Force — Loading Screen
 * Red/Black branded loading animation with GOAT logo
 */

import React, { useState, useEffect } from 'react';

const LoadingScreen = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusText, setStatusText] = useState('Initializing GOAT Systems...');

  const statusMessages = [
    'Initializing GOAT Systems...',
    'Loading Royalty Engine...',
    'Connecting to Streaming Platforms...',
    'Activating Agent Codex 008...',
    'Scanning Catalog Database...',
    'Engaging Neural Core...',
    'Systems Online — Welcome, Commander.'
  ];

  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 18;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => setIsLoading(false), 600);
      }
      setLoadingProgress(Math.min(progress, 100));
      
      // Update status text based on progress
      const msgIndex = Math.min(Math.floor(progress / 16), statusMessages.length - 1);
      setStatusText(statusMessages[msgIndex]);
    }, 250);

    return () => clearInterval(interval);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-15"
        style={{ filter: 'brightness(0.4) saturate(1.5)' }}
      >
        <source src="/videos/goat-logo-animation.mp4" type="video/mp4" />
      </video>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90" />

      {/* Red ambient glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-particle ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* GOAT Logo */}
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 rounded-3xl blur-xl animate-pulse" />
          <img 
            src="/images/branding/goat-logo.png" 
            alt="GOAT Force" 
            className="relative w-36 h-36 rounded-2xl shadow-2xl shadow-red-500/30"
            style={{ 
              animation: 'logo-breathe 2s ease-in-out infinite',
              border: '2px solid rgba(220, 38, 38, 0.3)'
            }}
          />
        </div>

        {/* Title */}
        <h1 className="mt-6 text-4xl font-black bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-clip-text text-transparent tracking-tight">
          GOAT FORCE
        </h1>
        <p className="text-gray-500 text-[10px] font-mono tracking-[0.4em] mt-1">
          ROYALTY COMMAND CENTER
        </p>

        {/* Progress bar */}
        <div className="mt-8 w-64">
          <div className="w-full h-1.5 bg-gray-800/80 rounded-full overflow-hidden border border-gray-700/50">
            <div 
              className="h-full bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-gray-400 font-mono">{statusText}</span>
            <span className="text-[10px] text-red-500 font-mono font-bold">{Math.round(loadingProgress)}%</span>
          </div>
        </div>

        {/* System indicators */}
        <div className="mt-6 flex items-center gap-4">
          {['NEURAL', 'CODEX', 'SHIELD', 'RADAR'].map((sys, i) => (
            <div key={sys} className="flex items-center gap-1.5">
              <div 
                className={`w-1.5 h-1.5 rounded-full ${loadingProgress > (i + 1) * 20 ? 'bg-green-400 animate-pulse' : 'bg-gray-700'}`}
              />
              <span className={`text-[9px] font-mono ${loadingProgress > (i + 1) * 20 ? 'text-green-400' : 'text-gray-300'}`}>
                {sys}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes logo-breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(220, 38, 38, 0.3); }
          50% { transform: scale(1.03); box-shadow: 0 0 50px rgba(220, 38, 38, 0.5); }
        }
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;