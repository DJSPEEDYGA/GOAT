/**
 * 🎬 Playlist / Arrangement View — FL Studio-Inspired
 * GOAT Royalty App / Sono Production Suite
 * © 2025 Harvey Miller / FASTASSMAN Publishing Inc
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, Square, ZoomIn, ZoomOut, Plus, Trash2, Copy,
  Scissors, MousePointer, Pencil, Music, Layers, Clock,
  SkipBack, SkipForward, Volume2, Lock, Unlock, Eye, EyeOff,
  ChevronDown, ChevronRight, Magnet, Save, Download
} from 'lucide-react';

const INITIAL_TRACKS = [
  { id: 1, name: 'Drums', color: '#ef4444', icon: '🥁', muted: false, locked: false, visible: true, height: 48,
    clips: [
      { id: 'c1', pattern: 'Kick Pattern', start: 0, duration: 8, color: '#ef4444' },
      { id: 'c2', pattern: 'Kick Pattern', start: 8, duration: 8, color: '#ef4444' },
      { id: 'c3', pattern: 'Kick Fill', start: 16, duration: 4, color: '#f97316' },
      { id: 'c4', pattern: 'Kick Pattern', start: 20, duration: 12, color: '#ef4444' },
    ]},
  { id: 2, name: 'Snare/Clap', color: '#f59e0b', icon: '🪘', muted: false, locked: false, visible: true, height: 48,
    clips: [
      { id: 'c5', pattern: 'Snare Loop', start: 0, duration: 16, color: '#f59e0b' },
      { id: 'c6', pattern: 'Snare Build', start: 16, duration: 4, color: '#eab308' },
      { id: 'c7', pattern: 'Snare Loop', start: 20, duration: 12, color: '#f59e0b' },
    ]},
  { id: 3, name: 'Hi-Hats', color: '#84cc16', icon: '🔔', muted: false, locked: false, visible: true, height: 48,
    clips: [
      { id: 'c8', pattern: 'HH Rolling', start: 0, duration: 8, color: '#84cc16' },
      { id: 'c9', pattern: 'HH Triplet', start: 8, duration: 8, color: '#22c55e' },
      { id: 'c10', pattern: 'HH Rolling', start: 16, duration: 16, color: '#84cc16' },
    ]},
  { id: 4, name: '808 Bass', color: '#8b5cf6', icon: '🎸', muted: false, locked: false, visible: true, height: 48,
    clips: [
      { id: 'c11', pattern: '808 Slide A', start: 0, duration: 8, color: '#8b5cf6' },
      { id: 'c12', pattern: '808 Slide B', start: 8, duration: 8, color: '#7c3aed' },
      { id: 'c13', pattern: '808 Drop', start: 16, duration: 4, color: '#6d28d9' },
      { id: 'c14', pattern: '808 Slide A', start: 20, duration: 12, color: '#8b5cf6' },
    ]},
  { id: 5, name: 'Melody', color: '#ec4899', icon: '🎹', muted: false, locked: false, visible: true, height: 48,
    clips: [
      { id: 'c15', pattern: 'Main Melody', start: 0, duration: 16, color: '#ec4899' },
      { id: 'c16', pattern: 'Melody Var', start: 16, duration: 8, color: '#f472b6' },
      { id: 'c17', pattern: 'Main Melody', start: 24, duration: 8, color: '#ec4899' },
    ]},
  { id: 6, name: 'Pad/Atmos', color: '#06b6d4', icon: '🌊', muted: false, locked: false, visible: true, height: 48,
    clips: [
      { id: 'c18', pattern: 'Dark Pad', start: 0, duration: 32, color: '#06b6d4' },
    ]},
  { id: 7, name: 'Vocals', color: '#f472b6', icon: '🎤', muted: false, locked: false, visible: true, height: 48,
    clips: [
      { id: 'c19', pattern: 'Vocal Hook', start: 8, duration: 8, color: '#f472b6' },
      { id: 'c20', pattern: 'Vocal Chop', start: 20, duration: 4, color: '#ec4899' },
      { id: 'c21', pattern: 'Vocal Hook', start: 24, duration: 8, color: '#f472b6' },
    ]},
  { id: 8, name: 'FX/Risers', color: '#10b981', icon: '⚡', muted: false, locked: false, visible: true, height: 48,
    clips: [
      { id: 'c22', pattern: 'Riser', start: 14, duration: 2, color: '#10b981' },
      { id: 'c23', pattern: 'Impact', start: 16, duration: 1, color: '#059669' },
      { id: 'c24', pattern: 'Riser', start: 30, duration: 2, color: '#10b981' },
    ]},
];

const MARKERS = [
  { bar: 0, label: 'INTRO', color: '#8b5cf6' },
  { bar: 8, label: 'VERSE 1', color: '#06b6d4' },
  { bar: 16, label: 'DROP', color: '#ef4444' },
  { bar: 24, label: 'VERSE 2', color: '#10b981' },
];

export default function PlaylistArrangement({ bpm = 140 }) {
  const [tracks, setTracks] = useState(INITIAL_TRACKS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadBar, setPlayheadBar] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selectedClip, setSelectedClip] = useState(null);
  const [markers, setMarkers] = useState(MARKERS);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(32);
  const [loopEnabled, setLoopEnabled] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const playRef = useRef(null);

  const TOTAL_BARS = 64;
  const BAR_WIDTH = 48 * zoom;
  const TRACK_HEADER_WIDTH = 180;

  useEffect(() => {
    if (isPlaying) {
      const barTime = (60000 / bpm) * 4;
      playRef.current = setInterval(() => {
        setPlayheadBar(prev => {
          const next = prev + 0.25;
          if (loopEnabled && next >= loopEnd) return loopStart;
          if (next >= TOTAL_BARS) return 0;
          return next;
        });
      }, barTime / 4);
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [isPlaying, bpm, loopEnabled, loopStart, loopEnd]);

  const toggleMute = (trackId) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
  };

  const toggleLock = (trackId) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, locked: !t.locked } : t));
  };

  const totalTime = (TOTAL_BARS * 4 * 60) / bpm;
  const currentTime = (playheadBar * 4 * 60) / bpm;
  const formatTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '16px', border: '1px solid rgba(139,92,246,0.3)', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap' }}>
        {/* Transport */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => { setIsPlaying(false); setPlayheadBar(0); }} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SkipBack size={14} />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: isPlaying ? '#ef4444' : '#10b981', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button onClick={() => { setIsPlaying(false); setPlayheadBar(0); }} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Square size={14} />
          </button>
        </div>

        {/* Time Display */}
        <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '4px 12px', fontFamily: 'monospace', fontSize: '16px', fontWeight: '900', color: '#10b981', minWidth: '80px', textAlign: 'center' }}>
          {formatTime(currentTime)}
        </div>

        {/* Bar Display */}
        <div style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', padding: '4px 12px', fontSize: '12px' }}>
          <span style={{ color: '#a78bfa' }}>Bar:</span> <span style={{ color: '#c4b5fd', fontWeight: '900', fontFamily: 'monospace' }}>{Math.floor(playheadBar) + 1}</span>
        </div>

        {/* BPM */}
        <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '4px 12px', fontSize: '12px' }}>
          <span style={{ color: '#fca5a5' }}>BPM:</span> <span style={{ color: '#ef4444', fontWeight: '900' }}>{bpm}</span>
        </div>

        {/* Loop */}
        <button onClick={() => setLoopEnabled(!loopEnabled)} style={{
          padding: '4px 12px', borderRadius: '8px', border: loopEnabled ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.1)',
          background: loopEnabled ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)', color: loopEnabled ? '#fbbf24' : '#6b7280',
          cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px'
        }}>
          🔁 Loop {loopEnabled ? `${loopStart + 1}-${loopEnd}` : 'Off'}
        </button>

        {/* Snap */}
        <button onClick={() => setSnapToGrid(!snapToGrid)} style={{
          padding: '4px 12px', borderRadius: '8px', border: 'none',
          background: snapToGrid ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
          color: snapToGrid ? '#a78bfa' : '#6b7280', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px'
        }}>
          <Magnet size={12} /> Snap
        </button>

        <div style={{ flex: 1 }} />

        {/* Zoom */}
        <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ZoomOut size={12} />
        </button>
        <span style={{ fontSize: '11px', color: '#9ca3af' }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ZoomIn size={12} />
        </button>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', maxHeight: '500px' }}>
        {/* Track Headers */}
        <div style={{ width: `${TRACK_HEADER_WIDTH}px`, flexShrink: 0, overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)' }}>
          {/* Marker row header */}
          <div style={{ height: '28px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '10px', color: '#6b7280' }}>
            🏷️ Markers
          </div>
          {tracks.map(track => (
            <div key={track.id} style={{
              height: `${track.height}px`, display: 'flex', alignItems: 'center', gap: '6px', padding: '0 8px',
              borderBottom: '1px solid rgba(255,255,255,0.05)', background: track.muted ? 'rgba(0,0,0,0.3)' : 'transparent'
            }}>
              <div style={{ width: '4px', height: '70%', borderRadius: '2px', background: track.color, flexShrink: 0 }} />
              <span style={{ fontSize: '14px' }}>{track.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: track.muted ? '#6b7280' : 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.name}</div>
                <div style={{ fontSize: '9px', color: '#4b5563' }}>{track.clips.length} clips</div>
              </div>
              <div style={{ display: 'flex', gap: '2px' }}>
                <button onClick={() => toggleMute(track.id)} style={{
                  width: '18px', height: '18px', borderRadius: '3px', border: 'none', fontSize: '7px', fontWeight: '700',
                  background: track.muted ? '#ef4444' : 'rgba(255,255,255,0.1)', color: track.muted ? 'white' : '#6b7280', cursor: 'pointer'
                }}>M</button>
                <button onClick={() => toggleLock(track.id)} style={{
                  width: '18px', height: '18px', borderRadius: '3px', border: 'none',
                  background: track.locked ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)', color: track.locked ? '#fbbf24' : '#6b7280', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{track.locked ? <Lock size={8} /> : <Unlock size={8} />}</button>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline + Clips */}
        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }}>
          <div style={{ width: `${TOTAL_BARS * BAR_WIDTH}px`, position: 'relative' }}>
            {/* Marker Row */}
            <div style={{ height: '28px', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'relative', background: 'rgba(0,0,0,0.2)' }}>
              {/* Bar numbers */}
              {Array.from({ length: TOTAL_BARS }, (_, i) => (
                <div key={i} style={{
                  position: 'absolute', left: `${i * BAR_WIDTH}px`, top: 0, bottom: 0,
                  width: `${BAR_WIDTH}px`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '9px', color: i % 4 === 0 ? '#a78bfa' : '#4b5563', fontWeight: i % 4 === 0 ? '700' : '400',
                  borderLeft: i % 4 === 0 ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.05)'
                }}>{i + 1}</div>
              ))}
              {/* Markers */}
              {markers.map((m, i) => (
                <div key={i} style={{
                  position: 'absolute', left: `${m.bar * BAR_WIDTH}px`, top: '2px',
                  background: `${m.color}33`, border: `1px solid ${m.color}`, borderRadius: '4px',
                  padding: '1px 6px', fontSize: '8px', fontWeight: '700', color: m.color, zIndex: 5, whiteSpace: 'nowrap'
                }}>{m.label}</div>
              ))}
              {/* Loop Region */}
              {loopEnabled && (
                <div style={{
                  position: 'absolute', left: `${loopStart * BAR_WIDTH}px`, top: 0, bottom: 0,
                  width: `${(loopEnd - loopStart) * BAR_WIDTH}px`,
                  background: 'rgba(245,158,11,0.08)', borderLeft: '2px solid #f59e0b', borderRight: '2px solid #f59e0b', zIndex: 3
                }} />
              )}
            </div>

            {/* Track Rows */}
            {tracks.map(track => (
              <div key={track.id} style={{
                height: `${track.height}px`, position: 'relative',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                opacity: track.muted ? 0.35 : 1, transition: 'opacity 0.2s'
              }}>
                {/* Grid lines */}
                {Array.from({ length: TOTAL_BARS }, (_, i) => (
                  <div key={i} style={{
                    position: 'absolute', left: `${i * BAR_WIDTH}px`, top: 0, bottom: 0, width: '1px',
                    background: i % 4 === 0 ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)'
                  }} />
                ))}

                {/* Clips */}
                {track.clips.map(clip => (
                  <div key={clip.id} onClick={() => setSelectedClip(selectedClip === clip.id ? null : clip.id)}
                    style={{
                      position: 'absolute',
                      left: `${clip.start * BAR_WIDTH + 2}px`,
                      top: '4px',
                      width: `${clip.duration * BAR_WIDTH - 4}px`,
                      height: `${track.height - 8}px`,
                      background: `linear-gradient(135deg, ${clip.color}cc, ${clip.color}88)`,
                      borderRadius: '6px',
                      border: selectedClip === clip.id ? '2px solid #fbbf24' : `1px solid ${clip.color}`,
                      boxShadow: selectedClip === clip.id ? '0 0 12px rgba(251,191,36,0.3)' : `0 2px 4px rgba(0,0,0,0.3)`,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', padding: '0 8px',
                      overflow: 'hidden', zIndex: 5
                    }}>
                    {/* Waveform visualization */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1px', opacity: 0.3, padding: '4px' }}>
                      {Array.from({ length: Math.max(10, Math.floor(clip.duration * BAR_WIDTH / 4)) }, (_, j) => (
                        <div key={j} style={{
                          width: '2px', flexShrink: 0,
                          height: `${20 + Math.random() * 60}%`,
                          background: 'white', borderRadius: '1px'
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: 'white', position: 'relative', zIndex: 2, textShadow: '0 1px 2px rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>
                      {clip.pattern}
                    </span>
                  </div>
                ))}
              </div>
            ))}

            {/* Playhead */}
            <div style={{
              position: 'absolute', left: `${playheadBar * BAR_WIDTH}px`, top: 0, bottom: 0,
              width: '2px', background: '#ef4444', zIndex: 20, boxShadow: '0 0 10px rgba(239,68,68,0.5)',
              pointerEvents: 'none'
            }}>
              <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', position: 'absolute', top: '-2px', left: '-5px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: '#6b7280' }}>
        <span>🎬 Playlist v1.0 — Arrangement View</span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span style={{ color: '#a78bfa' }}>🎵 {tracks.length} tracks</span>
          <span style={{ color: '#f472b6' }}>📎 {tracks.reduce((sum, t) => sum + t.clips.length, 0)} clips</span>
          <span style={{ color: '#34d399' }}>⏱️ {formatTime(totalTime)} total</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer', fontSize: '11px' }}>🎵 Export WAV</button>
          <button style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer', fontSize: '11px' }}>📄 Export MIDI</button>
          <button style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', color: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>💾 Save Project</button>
        </div>
      </div>
    </div>
  );
}