/**
 * 🥁 Step Sequencer / Channel Rack — FL Studio-Inspired
 * GOAT Royalty App / Sono Production Suite
 * © 2025 Harvey Miller / FASTASSMAN Publishing Inc
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Play, Pause, Square, Volume2, VolumeX, ChevronDown, ChevronRight,
  Plus, Trash2, Copy, Settings, Zap, Music, Drum, Radio,
  SkipBack, SkipForward, Repeat, Save, Download, Upload
} from 'lucide-react';

const DEFAULT_CHANNELS = [
  { id: 1, name: 'Kick 808', type: 'drum', color: '#ef4444', volume: 85, pan: 0, muted: false, solo: false, icon: '🥁',
    pattern: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0, 1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0] },
  { id: 2, name: 'Snare', type: 'drum', color: '#f59e0b', volume: 78, pan: 0, muted: false, solo: false, icon: '🪘',
    pattern: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0, 0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1] },
  { id: 3, name: 'Clap', type: 'drum', color: '#eab308', volume: 72, pan: 5, muted: false, solo: false, icon: '👏',
    pattern: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0, 0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0] },
  { id: 4, name: 'Hi-Hat Closed', type: 'drum', color: '#84cc16', volume: 60, pan: -10, muted: false, solo: false, icon: '🔔',
    pattern: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0, 1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0] },
  { id: 5, name: 'Hi-Hat Open', type: 'drum', color: '#22c55e', volume: 55, pan: -10, muted: false, solo: false, icon: '🔕',
    pattern: [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1, 0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0] },
  { id: 6, name: 'Perc Rim', type: 'drum', color: '#06b6d4', volume: 50, pan: 15, muted: false, solo: false, icon: '🎯',
    pattern: [0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0, 0,0,0,1,0,0,1,0,0,1,0,0,0,0,1,0] },
  { id: 7, name: '808 Sub Bass', type: 'synth', color: '#8b5cf6', volume: 90, pan: 0, muted: false, solo: false, icon: '🎸',
    pattern: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0, 1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0] },
  { id: 8, name: 'Melody Lead', type: 'synth', color: '#ec4899', volume: 65, pan: 0, muted: false, solo: false, icon: '🎹',
    pattern: [1,0,0,1,0,0,1,0,0,1,0,0,0,1,0,0, 1,0,0,1,0,0,1,0,0,0,1,0,1,0,0,0] },
  { id: 9, name: 'Pad Atmosphere', type: 'synth', color: '#a855f7', volume: 45, pan: 0, muted: false, solo: false, icon: '🌊',
    pattern: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { id: 10, name: 'Vocal Chop', type: 'vocal', color: '#f472b6', volume: 55, pan: 8, muted: false, solo: false, icon: '🎤',
    pattern: [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0] },
];

const STEPS = 32;
const SWING_OPTIONS = ['Off', '25%', '50%', '75%', '100%'];

export default function StepSequencer({ bpm = 140 }) {
  const [channels, setChannels] = useState(DEFAULT_CHANNELS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [swing, setSwing] = useState('Off');
  const [patternLength, setPatternLength] = useState(32);
  const [patternName, setPatternName] = useState('Pattern 1 — GOAT Force');
  const [nextId, setNextId] = useState(11);
  const playRef = useRef(null);

  // Playback
  useEffect(() => {
    if (isPlaying) {
      const stepTime = (60000 / bpm) / 4; // 16th note timing
      playRef.current = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % patternLength);
      }, stepTime);
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [isPlaying, bpm, patternLength]);

  const toggleStep = useCallback((channelId, step) => {
    setChannels(prev => prev.map(ch => {
      if (ch.id !== channelId) return ch;
      const newPattern = [...ch.pattern];
      newPattern[step] = newPattern[step] ? 0 : 1;
      return { ...ch, pattern: newPattern };
    }));
  }, []);

  const toggleMute = (channelId) => {
    setChannels(prev => prev.map(ch => ch.id === channelId ? { ...ch, muted: !ch.muted } : ch));
  };

  const toggleSolo = (channelId) => {
    setChannels(prev => prev.map(ch => ch.id === channelId ? { ...ch, solo: !ch.solo } : ch));
  };

  const setVolume = (channelId, vol) => {
    setChannels(prev => prev.map(ch => ch.id === channelId ? { ...ch, volume: vol } : ch));
  };

  const clearChannel = (channelId) => {
    setChannels(prev => prev.map(ch => ch.id === channelId ? { ...ch, pattern: new Array(STEPS).fill(0) } : ch));
  };

  const duplicateChannel = (channelId) => {
    const source = channels.find(ch => ch.id === channelId);
    if (source) {
      setChannels(prev => [...prev, { ...source, id: nextId, name: `${source.name} (Copy)` }]);
      setNextId(prev => prev + 1);
    }
  };

  const removeChannel = (channelId) => {
    setChannels(prev => prev.filter(ch => ch.id !== channelId));
  };

  const addChannel = () => {
    const colors = ['#ef4444', '#f59e0b', '#84cc16', '#06b6d4', '#8b5cf6', '#ec4899'];
    setChannels(prev => [...prev, {
      id: nextId, name: `Channel ${nextId}`, type: 'drum', color: colors[nextId % colors.length],
      volume: 75, pan: 0, muted: false, solo: false, icon: '🔊',
      pattern: new Array(STEPS).fill(0)
    }]);
    setNextId(prev => prev + 1);
  };

  const randomizeChannel = (channelId) => {
    setChannels(prev => prev.map(ch => {
      if (ch.id !== channelId) return ch;
      const density = ch.type === 'drum' ? 0.3 : 0.15;
      return { ...ch, pattern: Array.from({ length: STEPS }, () => Math.random() < density ? 1 : 0) };
    }));
  };

  const hasSolo = channels.some(ch => ch.solo);

  return (
    <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '16px', border: '1px solid rgba(139,92,246,0.3)', overflow: 'hidden' }}>
      {/* Header / Transport */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap' }}>
        {/* Transport */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => { setIsPlaying(false); setCurrentStep(-1); }} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SkipBack size={14} />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: isPlaying ? '#ef4444' : '#10b981', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button onClick={() => { setIsPlaying(false); setCurrentStep(-1); }} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Square size={14} />
          </button>
        </div>

        {/* Pattern Name */}
        <input value={patternName} onChange={e => setPatternName(e.target.value)} style={{
          background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px',
          color: '#c4b5fd', padding: '6px 12px', fontSize: '13px', fontWeight: '700', outline: 'none', width: '220px'
        }} />

        {/* BPM Display */}
        <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '6px 12px', fontSize: '13px' }}>
          <span style={{ color: '#fca5a5' }}>BPM:</span> <span style={{ color: '#ef4444', fontWeight: '900' }}>{bpm}</span>
        </div>

        {/* Swing */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>Swing:</span>
          <select value={swing} onChange={e => setSwing(e.target.value)} style={{
            background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px',
            color: 'white', padding: '4px 8px', fontSize: '11px', outline: 'none'
          }}>
            {SWING_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ flex: 1 }} />

        {/* Stats */}
        <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
          <span style={{ color: '#a78bfa' }}>🥁 {channels.filter(c => c.type === 'drum').length} Drums</span>
          <span style={{ color: '#f472b6' }}>🎹 {channels.filter(c => c.type === 'synth').length} Synths</span>
          <span style={{ color: '#34d399' }}>📊 {channels.length} Channels</span>
          <span style={{ color: '#fbbf24' }}>Step: {currentStep + 1}/{patternLength}</span>
        </div>

        {/* Add Channel */}
        <button onClick={addChannel} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Step Grid */}
      <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '500px' }}>
        <div style={{ minWidth: '900px' }}>
          {/* Beat Numbers Header */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)' }}>
            <div style={{ width: '200px', flexShrink: 0, padding: '4px 8px', fontSize: '10px', color: '#6b7280' }}>Channel</div>
            <div style={{ display: 'flex', flex: 1 }}>
              {Array.from({ length: patternLength }, (_, i) => (
                <div key={i} style={{
                  width: '24px', height: '20px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '8px', fontWeight: i % 4 === 0 ? '700' : '400',
                  color: i % 4 === 0 ? '#a78bfa' : '#4b5563',
                  borderLeft: i % 4 === 0 ? '1px solid rgba(139,92,246,0.3)' : i % 2 === 0 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                }}>
                  {i % 4 === 0 ? Math.floor(i / 4) + 1 : ''}
                </div>
              ))}
            </div>
            <div style={{ width: '80px', flexShrink: 0 }} />
          </div>

          {/* Channel Rows */}
          {channels.map(channel => {
            const isActive = !channel.muted && (!hasSolo || channel.solo);
            return (
              <div key={channel.id} style={{
                display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: selectedChannel === channel.id ? 'rgba(139,92,246,0.08)' : 'transparent',
                opacity: isActive ? 1 : 0.4, transition: 'opacity 0.2s'
              }}>
                {/* Channel Info */}
                <div onClick={() => setSelectedChannel(channel.id === selectedChannel ? null : channel.id)}
                  style={{ width: '200px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', cursor: 'pointer' }}>
                  <div style={{ width: '4px', height: '28px', borderRadius: '2px', background: channel.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '16px' }}>{channel.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{channel.name}</div>
                    <div style={{ fontSize: '9px', color: '#6b7280' }}>{channel.type} • Vol: {channel.volume}%</div>
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <button onClick={e => { e.stopPropagation(); toggleMute(channel.id); }} style={{
                      width: '20px', height: '20px', borderRadius: '4px', border: 'none', fontSize: '8px', fontWeight: '700',
                      background: channel.muted ? '#ef4444' : 'rgba(255,255,255,0.1)', color: channel.muted ? 'white' : '#6b7280', cursor: 'pointer'
                    }}>M</button>
                    <button onClick={e => { e.stopPropagation(); toggleSolo(channel.id); }} style={{
                      width: '20px', height: '20px', borderRadius: '4px', border: 'none', fontSize: '8px', fontWeight: '700',
                      background: channel.solo ? '#f59e0b' : 'rgba(255,255,255,0.1)', color: channel.solo ? 'black' : '#6b7280', cursor: 'pointer'
                    }}>S</button>
                  </div>
                </div>

                {/* Steps */}
                <div style={{ display: 'flex', flex: 1 }}>
                  {channel.pattern.slice(0, patternLength).map((step, i) => (
                    <div key={i} onClick={() => toggleStep(channel.id, i)} style={{
                      width: '24px', height: '28px', flexShrink: 0, cursor: 'pointer', padding: '2px',
                      borderLeft: i % 4 === 0 ? '1px solid rgba(139,92,246,0.2)' : i % 2 === 0 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                      background: currentStep === i ? 'rgba(255,255,255,0.08)' : 'transparent'
                    }}>
                      <div style={{
                        width: '100%', height: '100%', borderRadius: '4px', transition: 'all 0.1s',
                        background: step ? `linear-gradient(135deg, ${channel.color}, ${channel.color}aa)` : i % 8 < 4 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                        border: step ? `1px solid ${channel.color}` : '1px solid rgba(255,255,255,0.05)',
                        boxShadow: step && currentStep === i ? `0 0 8px ${channel.color}66` : 'none',
                        transform: step && currentStep === i ? 'scale(1.1)' : 'scale(1)'
                      }} />
                    </div>
                  ))}
                </div>

                {/* Channel Actions */}
                <div style={{ width: '80px', flexShrink: 0, display: 'flex', gap: '2px', justifyContent: 'center' }}>
                  <button onClick={() => randomizeChannel(channel.id)} title="Randomize" style={{ width: '22px', height: '22px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>🎲</button>
                  <button onClick={() => duplicateChannel(channel.id)} title="Duplicate" style={{ width: '22px', height: '22px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Copy size={10} /></button>
                  <button onClick={() => clearChannel(channel.id)} title="Clear" style={{ width: '22px', height: '22px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={10} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Channel Detail Panel */}
      {selectedChannel && (() => {
        const ch = channels.find(c => c.id === selectedChannel);
        if (!ch) return null;
        return (
          <div style={{ borderTop: '1px solid rgba(139,92,246,0.3)', background: 'rgba(0,0,0,0.4)', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px' }}>Channel Name</div>
              <input value={ch.name} onChange={e => setChannels(prev => prev.map(c => c.id === ch.id ? { ...c, name: e.target.value } : c))} style={{
                width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', padding: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
              }} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px' }}>Volume: {ch.volume}%</div>
              <input type="range" min="0" max="100" value={ch.volume} onChange={e => setVolume(ch.id, parseInt(e.target.value))} style={{ width: '100%', accentColor: ch.color }} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px' }}>Pan: {ch.pan > 0 ? `R${ch.pan}` : ch.pan < 0 ? `L${Math.abs(ch.pan)}` : 'Center'}</div>
              <input type="range" min="-100" max="100" value={ch.pan} onChange={e => setChannels(prev => prev.map(c => c.id === ch.id ? { ...c, pan: parseInt(e.target.value) } : c))} style={{ width: '100%', accentColor: ch.color }} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px' }}>Type</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['drum', 'synth', 'vocal', 'fx'].map(t => (
                  <button key={t} onClick={() => setChannels(prev => prev.map(c => c.id === ch.id ? { ...c, type: t } : c))} style={{
                    padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                    background: ch.type === t ? ch.color : 'rgba(255,255,255,0.05)', color: ch.type === t ? 'white' : '#9ca3af'
                  }}>{t}</button>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: '#6b7280' }}>
        <span>🥁 Channel Rack v1.0 — FL Studio Style</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer', fontSize: '11px' }}>📋 Copy Pattern</button>
          <button style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer', fontSize: '11px' }}>📥 Export MIDI</button>
          <button style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', color: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>💾 Save Pattern</button>
        </div>
      </div>
    </div>
  );
}