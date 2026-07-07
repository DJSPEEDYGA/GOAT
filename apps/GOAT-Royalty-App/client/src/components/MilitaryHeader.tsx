'use client';

import React, { useState, useEffect } from 'react';

interface MilitaryHeaderProps {
  title?: string;
  subtitle?: string;
}

const MilitaryHeader: React.FC<MilitaryHeaderProps> = ({ 
  title = "GOAT ROYALTY APP", 
  subtitle = "MILITARY MISSION CONTROL" 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [missionStatus, setMissionStatus] = useState('OPERATIONAL');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mission-header">
      <div className="scanning-line"></div>
      
      {/* Status Indicators */}
      <div className="absolute top-4 left-4 flex gap-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
          <span className="text-green-400 font-military text-sm">SYSTEMS ONLINE</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse shadow-lg shadow-yellow-500/50"></div>
          <span className="text-yellow-400 font-military text-sm">{missionStatus}</span>
        </div>
      </div>

      {/* Time Display */}
      <div className="absolute top-4 right-4 z-10">
        <div className="text-green-400 font-military text-sm">
          {currentTime.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          })}
        </div>
        <div className="text-green-400 font-military text-xs">
          {currentTime.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </div>
      </div>

      {/* Main Title */}
      <div className="relative z-10 pt-8">
        <h1 className="mission-title">
          {title}
        </h1>
        <p className="mission-subtitle">
          {subtitle}
        </p>
      </div>

      {/* GOAT Hero Logo */}
      <div className="absolute bottom-4 left-4 w-16 h-16 z-10">
        <img 
          src="/goat-assets/images/THE GOAT.webp" 
          alt="GOAT Logo" 
          className="w-full h-full object-contain filter drop-shadow-lg"
        />
      </div>

      {/* Waka Flocka Co-Pilot */}
      <div className="absolute bottom-4 right-4 w-16 h-16 z-10">
        <img 
          src="/goat-assets/images/WAKA FLOCKA FLAME AND A GOAT ESCORT.webp" 
          alt="Waka Flocka" 
          className="w-full h-full object-contain filter drop-shadow-lg"
        />
      </div>

      {/* Military Grid Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(0, 255, 65, 0.05) 25%, rgba(0, 255, 65, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 65, 0.05) 75%, rgba(0, 255, 65, 0.05) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(0, 255, 65, 0.05) 25%, rgba(0, 255, 65, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 65, 0.05) 75%, rgba(0, 255, 65, 0.05) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
    </div>
  );
};

export default MilitaryHeader;