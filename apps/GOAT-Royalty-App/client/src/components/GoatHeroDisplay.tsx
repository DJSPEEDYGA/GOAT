'use client';

import React, { useState, useEffect } from 'react';

interface GoatHeroDisplayProps {
  heroImage?: string;
  title?: string;
  subtitle?: string;
}

const GoatHeroDisplay: React.FC<GoatHeroDisplayProps> = ({ 
  heroImage = "/goat-assets/images/DALL·E 2025-04-27 13.55.47 - Create a highly realistic Marvel superhero-style logo for the GOAT Royalty App by DJ Speedy. The design should feature a powerful superhero goat chara(1).webp",
  title = "THE GOAT",
  subtitle = "SUPREME COMMANDER"
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const heroImages = [
    "/goat-assets/images/DALL·E 2025-04-27 13.55.47 - Create a highly realistic Marvel superhero-style logo for the GOAT Royalty App by DJ Speedy. The design should feature a powerful superhero goat chara(1).webp",
    "/goat-assets/images/DALL·E 2025-04-27 13.51.17 - Create a highly realistic Marvel-style cartoon movie logo for the GOAT Royalty App by DJ Speedy. The logo should feature a powerful superhero goat cha (1).webp",
    "/goat-assets/images/THE GOAT.webp",
    "/goat-assets/images/THE GOAT 2.webp",
    "/goat-assets/images/REALIST GOAT EVER.png"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="military-panel">
      <div className="panel-header">
        <div className="panel-status"></div>
        HERO STATUS
      </div>
      
      <div className="goat-hero">
        <img 
          src={heroImages[currentImageIndex]} 
          alt={title}
          className="transition-opacity duration-1000"
        />
        
        {/* Animated Overlay */}
        <div className="goat-hero-overlay">
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">{title}</div>
            <div className="text-sm opacity-80">{subtitle}</div>
            <div className="mt-2 text-xs">
              STATUS: <span className="text-green-400">OPERATIONAL</span>
            </div>
          </div>
        </div>
        
        {/* Scanning Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/10 to-transparent animate-pulse"></div>
        </div>
      </div>
      
      {/* Hero Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="status-display online">
          <div className="text-xs mb-1">POWER LEVEL</div>
          <div className="text-lg font-bold">100%</div>
        </div>
        <div className="status-display online">
          <div className="text-xs mb-1">MISSION STATUS</div>
          <div className="text-lg font-bold">ACTIVE</div>
        </div>
      </div>
      
      {/* Image Navigation */}
      <div className="mt-4 flex gap-2 justify-center">
        {heroImages.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentImageIndex 
                ? 'bg-green-500 w-6' 
                : 'bg-green-500/30 hover:bg-green-500/50'
            }`}
            onClick={() => setCurrentImageIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default GoatHeroDisplay;