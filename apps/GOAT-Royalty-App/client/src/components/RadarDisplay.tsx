'use client';

import React, { useState, useEffect } from 'react';

interface RadarDisplayProps {
  title?: string;
  targets?: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    status: 'active' | 'inactive' | 'warning';
  }>;
}

const RadarDisplay: React.FC<RadarDisplayProps> = ({ 
  title = "ROYALTY RADAR", 
  targets = [] 
}) => {
  const [rotation, setRotation] = useState(0);
  const [activeTargets, setActiveTargets] = useState(targets);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulate dynamic targets
    const defaultTargets = [
      { id: '1', name: 'STREAMING REVENUE', x: 30, y: 40, status: 'active' as const },
      { id: '2', name: 'PUBLISHING', x: 70, y: 60, status: 'active' as const },
      { id: '3', name: 'ROYALTIES', x: 50, y: 30, status: 'warning' as const },
      { id: '4', name: 'TOUR INCOME', x: 20, y: 70, status: 'active' as const },
      { id: '5', name: 'MERCH SALES', x: 80, y: 20, status: 'active' as const },
    ];
    
    setActiveTargets(targets.length > 0 ? targets : defaultTargets);
  }, [targets]);

  const getTargetColor = (status: string) => {
    switch (status) {
      case 'active': return '#00ff41';
      case 'warning': return '#ffb000';
      case 'inactive': return '#ff3131';
      default: return '#00ff41';
    }
  };

  return (
    <div className="military-panel">
      <div className="panel-header">
        <div className="panel-status"></div>
        {title}
      </div>
      
      <div className="radar-display">
        {/* Radar Grid */}
        <div className="radar-grid"></div>
        
        {/* Radar Sweep */}
        <div 
          className="radar-sweep"
          style={{ transform: `rotate(${rotation}deg)` }}
        ></div>
        
        {/* Targets */}
        {activeTargets.map((target) => (
          <div
            key={target.id}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              backgroundColor: getTargetColor(target.status),
              boxShadow: `0 0 10px ${getTargetColor(target.status)}`,
              transform: 'translate(-50%, -50%)',
              animation: target.status === 'active' ? 'pulse 2s infinite' : 'none'
            }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-military text-green-400">
              {target.name}
            </div>
          </div>
        ))}
        
        {/* Center Point */}
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-green-500/50"></div>
      </div>
      
      {/* Target Legend */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-400">ACTIVE</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-yellow-400">WARNING</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-red-400">INACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export default RadarDisplay;