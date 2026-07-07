'use client';

import React, { useState, useEffect } from 'react';
import MilitaryHeader from '@/components/MilitaryHeader';
import RadarDisplay from '@/components/RadarDisplay';
import GoatHeroDisplay from '@/components/GoatHeroDisplay';
import MissionLog from '@/components/MissionLog';
import VideoBackground from '@/components/VideoBackground';
import './globals-military.css';

interface SystemStatus {
  intel: boolean;
  ollama: boolean;
  backend: boolean;
  agents: number;
}

export default function MilitaryMissionControl() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    intel: false,
    ollama: false,
    backend: false,
    agents: 0
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);

  // Check system status
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        // Check Intel Server
        const intelResponse = await fetch('http://localhost:5500/health');
        const intelOnline = intelResponse.ok;

        // Check Ollama Server
        const ollamaResponse = await fetch('http://localhost:11434/api/tags');
        const ollamaOnline = ollamaResponse.ok;

        // Check Backend
        const backendResponse = await fetch('http://localhost:5001/health');
        const backendOnline = backendResponse.ok;

        setSystemStatus({
          intel: intelOnline,
          ollama: ollamaOnline,
          backend: backendOnline,
          agents: 28 // From our earlier count
        });
      } catch (error) {
        console.error('System status check failed:', error);
      }
    };

    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  // Update time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Check online status
  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="military-container">
      <VideoBackground />
      
      {/* Scanning Line Effect */}
      <div className="scanning-line"></div>
      
      {/* Military Header */}
      <MilitaryHeader 
        title="GOAT ROYALTY APP" 
        subtitle="MILITARY MISSION CONTROL CENTER"
      />
      
      {/* Main Command Grid */}
      <div className="command-grid">
        {/* Top Row - Status & Overview */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* System Status Panel */}
          <div className="military-panel">
            <div className="panel-header">
              <div className={`panel-status ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              SYSTEM STATUS
            </div>
            <div className="space-y-2">
              <div className={`status-display ${systemStatus.intel ? 'online' : 'offline'}`}>
                INTEL SERVER: {systemStatus.intel ? 'ONLINE' : 'OFFLINE'}
              </div>
              <div className={`status-display ${systemStatus.ollama ? 'online' : 'offline'}`}>
                OLLAMA SERVER: {systemStatus.ollama ? 'ONLINE' : 'OFFLINE'}
              </div>
              <div className={`status-display ${systemStatus.backend ? 'online' : 'offline'}`}>
                BACKEND: {systemStatus.backend ? 'ONLINE' : 'OFFLINE'}
              </div>
              <div className={`status-display ${isOnline ? 'online' : 'offline'}`}>
                NETWORK: {isOnline ? 'CONNECTED' : 'DISCONNECTED'}
              </div>
            </div>
          </div>
          
          {/* Mission Timer */}
          <div className="military-panel">
            <div className="panel-header">
              <div className="panel-status"></div>
              MISSION TIMER
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 font-military">
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </div>
              <div className="text-sm text-green-400/60 mt-2">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="mt-4 text-xs text-yellow-400">
                MISSION DAY: {Math.floor((Date.now() - new Date('2025-01-01').getTime()) / (1000 * 60 * 60 * 24))}
              </div>
            </div>
          </div>
          
          {/* Agent Status */}
          <div className="military-panel">
            <div className="panel-header">
              <div className="panel-status"></div>
              AGENT STATUS
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 font-military">
                {systemStatus.agents}
              </div>
              <div className="text-sm text-green-400/60 mt-2">
                ACTIVE AGENTS
              </div>
              <div className="mt-4 space-y-1">
                <div className="text-xs text-green-400">LEADERSHIP: 6</div>
                <div className="text-xs text-green-400">CORE: 12</div>
                <div className="text-xs text-green-400">SPECIALIZED: 3</div>
                <div className="text-xs text-green-400">UTILITIES: 3</div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="military-panel">
            <div className="panel-header">
              <div className="panel-status"></div>
              QUICK ACTIONS
            </div>
            <div className="space-y-2">
              <button className="military-btn w-full text-sm">
                LAUNCH ALL SYSTEMS
              </button>
              <button className="military-btn warning w-full text-sm">
                SYSTEM DIAGNOSTIC
              </button>
              <button className="military-btn alert w-full text-sm">
                EMERGENCY PROTOCOL
              </button>
            </div>
          </div>
        </div>
        
        {/* Middle Row - Main Displays */}
        <div className="col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Goat Hero Display */}
          <div className="lg:col-span-1">
            <GoatHeroDisplay />
          </div>
          
          {/* Main Radar */}
          <div className="lg:col-span-1">
            <RadarDisplay />
          </div>
          
          {/* Mission Log */}
          <div className="lg:col-span-1">
            <MissionLog />
          </div>
        </div>
        
        {/* Bottom Row - Additional Controls */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Royalty Tracking */}
          <div className="military-panel">
            <div className="panel-header">
              <div className="panel-status"></div>
              ROYALTY TRACKING
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 font-military">$0.00</div>
                <div className="text-xs text-green-400/60">TODAY'S REVENUE</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 font-military">$0.00</div>
                <div className="text-xs text-yellow-400/60">MONTHLY TOTAL</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 font-military">0</div>
                <div className="text-xs text-green-400/60">ACTIVE STREAMS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 font-military">0</div>
                <div className="text-xs text-green-400/60">TRACKS LIVE</div>
              </div>
            </div>
          </div>
          
          {/* Communications */}
          <div className="military-panel">
            <div className="panel-header">
              <div className="panel-status"></div>
              COMMUNICATIONS
            </div>
            <div className="space-y-2">
              <div className="status-display online">
                <div className="text-xs">INTEL SERVER</div>
                <div className="text-xs">ENCRYPTED CHANNEL ACTIVE</div>
              </div>
              <div className="status-display online">
                <div className="text-xs">AGENT COMMS</div>
                <div className="text-xs">ALL UNITS RESPONDING</div>
              </div>
              <div className="status-display warning">
                <div className="text-xs">EXTERNAL LINK</div>
                <div className="text-xs">AWAITING AUTHENTICATION</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}