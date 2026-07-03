/**
 * GOAT Royalty App — FiveM Gaming Integration
 * GTA V multiplayer gaming server management and integration
 */

import React, { useState } from 'react';
import Head from 'next/head';
import MainNavigation from '../components/MainNavigation';
import {
  Gamepad2, Server, Users, Shield, Zap, Settings,
  Play, Pause, RefreshCw, Terminal, Globe, Wifi,
  Activity, Cpu, HardDrive, Monitor, Download,
  CheckCircle, AlertTriangle, Clock, Star, Crown,
  Music, Mic, Radio, ExternalLink, Code, Package
} from 'lucide-react';

const SERVER_STATS = {
  name: 'GOAT Force RP',
  status: 'online',
  players: { current: 47, max: 128 },
  uptime: '99.7%',
  ip: 'play.goatforce.gg',
  version: 'FXServer 7847',
  framework: 'QBCore',
  resources: 234,
  playerPeak: 112,
};

const RESOURCES = [
  { name: 'qb-core', type: 'Framework', status: 'running', version: '1.3.0', author: 'QBCore' },
  { name: 'qb-inventory', type: 'Inventory', status: 'running', version: '2.1.0', author: 'QBCore' },
  { name: 'goat-music-system', type: 'Custom', status: 'running', version: '1.0.0', author: 'DJ Speedy' },
  { name: 'goat-radio-station', type: 'Custom', status: 'running', version: '1.0.0', author: 'DJ Speedy' },
  { name: 'goat-recording-studio', type: 'Custom', status: 'running', version: '1.0.0', author: 'DJ Speedy' },
  { name: 'goat-nightclub', type: 'Custom', status: 'running', version: '1.0.0', author: 'DJ Speedy' },
  { name: 'qb-vehicleshop', type: 'Vehicle', status: 'running', version: '1.5.0', author: 'QBCore' },
  { name: 'qb-housing', type: 'Housing', status: 'running', version: '1.2.0', author: 'QBCore' },
];

const GOAT_FEATURES = [
  { name: 'In-Game Radio', desc: 'Stream your music catalog directly in GTA', icon: '📻', color: '#ef4444' },
  { name: 'Recording Studio', desc: 'Virtual recording studio locations in-game', icon: '🎙️', color: '#7c3aed' },
  { name: 'Nightclub System', desc: 'Own and operate nightclubs with live DJ sets', icon: '🎵', color: '#0ea5e9' },
  { name: 'Music Label RP', desc: 'Run a music label, sign artists, collect royalties', icon: '🏢', color: '#10b981' },
  { name: 'Concert Events', desc: 'Host live virtual concerts for server players', icon: '🎤', color: '#f59e0b' },
  { name: 'Merch System', desc: 'Sell branded merchandise in-game', icon: '👕', color: '#ec4899' },
];

export default function FiveMGamingPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <>
      <Head>
        <title>FiveM Gaming | GOAT Royalty App</title>
        <meta name="description" content="FiveM GTA V server management with GOAT Force music integration" />
      </Head>
      <MainNavigation />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 text-white">
          <div className="relative max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Gamepad2 size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight">FiveM Gaming</h1>
                <p className="text-emerald-200 mt-1">GTA V multiplayer server with GOAT Force music integration</p>
              </div>
            </div>

            {/* Server Status */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-200">Server Status</span>
                </div>
                <p className="text-2xl font-black capitalize">{SERVER_STATS.status}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-xs text-emerald-200 mb-1">Players Online</p>
                <p className="text-2xl font-black">{SERVER_STATS.players.current}/{SERVER_STATS.players.max}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-xs text-emerald-200 mb-1">Resources</p>
                <p className="text-2xl font-black">{SERVER_STATS.resources}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-xs text-emerald-200 mb-1">Uptime</p>
                <p className="text-2xl font-black">{SERVER_STATS.uptime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'overview', label: 'Overview', icon: <Monitor size={16} /> },
              { id: 'resources', label: 'Resources', icon: <Package size={16} /> },
              { id: 'music', label: 'Music Integration', icon: <Music size={16} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Server Info */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-bold text-lg mb-4">🖥️ Server Configuration</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div><span className="text-gray-500">Server Name</span><p className="font-bold">{SERVER_STATS.name}</p></div>
                  <div><span className="text-gray-500">Connect IP</span><p className="font-mono font-bold">{SERVER_STATS.ip}</p></div>
                  <div><span className="text-gray-500">Version</span><p className="font-mono">{SERVER_STATS.version}</p></div>
                  <div><span className="text-gray-500">Framework</span><p className="font-bold">{SERVER_STATS.framework}</p></div>
                  <div><span className="text-gray-500">Peak Players</span><p className="font-bold">{SERVER_STATS.playerPeak}</p></div>
                  <div><span className="text-gray-500">Max Slots</span><p className="font-bold">{SERVER_STATS.players.max}</p></div>
                </div>
              </div>

              {/* GOAT Music Features */}
              <h3 className="text-xl font-bold">🐐 GOAT Force Custom Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {GOAT_FEATURES.map((feat, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-xl transition-all" style={{ borderTop: `3px solid ${feat.color}` }}>
                    <span className="text-3xl">{feat.icon}</span>
                    <h4 className="font-bold mt-2">{feat.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Server Resources ({RESOURCES.length})</h3>
              {RESOURCES.map((res, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${res.status === 'running' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="font-mono font-bold text-sm">{res.name}</p>
                      <p className="text-xs text-gray-500">{res.author} • v{res.version}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">{res.type}</span>
                    <span className="text-xs text-green-500 font-semibold capitalize">{res.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'music' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">🎵 Music Integration</h3>
              <div className="bg-gray-900 rounded-2xl p-6 text-gray-300 font-mono text-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-green-400">goat-music-system/server.lua</span>
                  <span className="text-xs text-gray-500">QBCore Resource</span>
                </div>
                <pre className="whitespace-pre leading-relaxed">{`-- GOAT Force Music System for FiveM
-- Integrates GOAT Royalty catalog into GTA V

local QBCore = exports['qb-core']:GetCoreObject()

-- Radio Station: GOAT FM
RegisterNetEvent('goat:radio:play')
AddEventHandler('goat:radio:play', function(trackId)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    -- Fetch track from GOAT catalog API
    local track = exports['goat-music-system']:GetTrack(trackId)
    
    if track then
        TriggerClientEvent('goat:radio:stream', src, {
            url = track.streamUrl,
            title = track.title,
            artist = track.artist,
            artwork = track.artwork
        })
        
        -- Track royalty play event
        exports['goat-music-system']:RecordPlay(trackId, src)
    end
end)

-- Nightclub DJ System
RegisterNetEvent('goat:nightclub:setPlaylist')
AddEventHandler('goat:nightclub:setPlaylist', function(clubId, playlist)
    local src = source
    
    -- Broadcast to all players in club zone
    TriggerClientEvent('goat:nightclub:updatePlaylist', -1, clubId, playlist)
end)`}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}