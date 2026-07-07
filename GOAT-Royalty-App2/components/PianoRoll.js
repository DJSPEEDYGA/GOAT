/**
 * 🎹 Piano Roll — FL Studio-Inspired MIDI Editor
 * GOAT Royalty App / Sono Production Suite
 * © 2025 Harvey Miller / FASTASSMAN Publishing Inc
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Play, Pause, Square, ZoomIn, ZoomOut, Copy, Trash2, 
  Scissors, MousePointer, Pencil, Eraser, Music, 
  ChevronLeft, ChevronRight, Magnet, Grid, Undo, Redo,
  Volume2, Save, Download
} from 'lucide-react';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVES = [7, 6, 5, 4, 3, 2, 1, 0];
const ALL_NOTES = OCTAVES.flatMap(oct => NOTES.map(note => `${note}${oct}`).reverse());

const NOTE_COLORS = {
  'C': '#ef4444', 'C#': '#f97316', 'D': '#f59e0b', 'D#': '#eab308',
  'E': '#84cc16', 'F': '#22c55e', 'F#': '#10b981', 'G': '#06b6d4',
  'G#': '#3b82f6', 'A': '#6366f1', 'A#': '#8b5cf6', 'B': '#a855f7'
};

const SNAP_VALUES = ['1/1', '1/2', '1/4', '1/8', '1/16', '1/32', 'None'];
const TOOLS = [
  { id: 'select', icon: MousePointer, label: 'Select (V)', key: 'V' },
  { id: 'draw', icon: Pencil, label: 'Draw (B)', key: 'B' },
  { id: 'erase', icon: Eraser, label: 'Erase (D)', key: 'D' },
  { id: 'cut', icon: Scissors, label: 'Slice (C)', key: 'C' },
];

// Generate initial demo notes (GOAT Force melody)
const DEMO_NOTES = [
  { id: 1, note: 'C4', start: 0, duration: 2, velocity: 100, color: '#8b5cf6' },
  { id: 2, note: 'E4', start: 2, duration: 2, velocity: 90, color: '#8b5cf6' },
  { id: 3, note: 'G4', start: 4, duration: 2, velocity: 95, color: '#ec4899' },
  { id: 4, note: 'C5', start: 6, duration: 4, velocity: 100, color: '#ec4899' },
  { id: 5, note: 'B4', start: 10, duration: 2, velocity: 85, color: '#06b6d4' },
  { id: 6, note: 'A4', start: 12, duration: 2, velocity: 80, color: '#06b6d4' },
  { id: 7, note: 'G4', start: 14, duration: 4, velocity: 90, color: '#10b981' },
  { id: 8, note: 'E4', start: 18, duration: 2, velocity: 85, color: '#f59e0b' },
  { id: 9, note: 'D4', start: 20, duration: 2, velocity: 80, color: '#f59e0b' },
  { id: 10, note: 'C4', start: 22, duration: 4, velocity: 100, color: '#ef4444' },
  { id: 11, note: 'G3', start: 26, duration: 2, velocity: 75, color: '#ef4444' },
  { id: 12, note: 'C4', start: 28, duration: 4, velocity: 100, color: '#8b5cf6' },
  // Bass notes
  { id: 13, note: 'C2', start: 0, duration: 4, velocity: 110, color: '#8b5cf6' },
  { id: 14, note: 'C2', start: 4, duration: 4, velocity: 110, color: '#ec4899' },
  { id: 15, note: 'A1', start: 8, duration: 4, velocity: 105, color: '#06b6d4' },
  { id: 16, note: 'G1', start: 12, duration: 4, velocity: 100, color: '#06b6d4' },
  { id: 17, note: 'F1', start: 16, duration: 4, velocity: 105, color: '#10b981' },
  { id: 18, note: 'G1', start: 20, duration: 4, velocity: 100, color: '#f59e0b' },
  { id: 19, note: 'C2', start: 24, duration: 8, velocity: 110, color: '#ef4444' },
];

export default function PianoRoll({ bpm = 140, keySignature = 'C Minor' }) {
  const [notes, setNotes] = useState(DEMO_NOTES);
  const [selectedNotes, setSelectedNotes] = useState(new Set());
  const [activeTool, setActiveTool] = useState('draw');
  const [snapValue, setSnapValue] = useState('1/4');
  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPos, setPlayheadPos] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(ALL_NOTES.indexOf('C5') * 18);
  const [ghostNote, setGhostNote] = useState(null);
  const [nextId, setNextId] = useState(20);
  const gridRef = useRef(null);
  const playIntervalRef = useRef(null);

  const CELL_WIDTH = 24 * zoom;
  const CELL_HEIGHT = 18;
  const PIANO_WIDTH = 60;
  const TOTAL_BARS = 32;
  const BEATS_PER_BAR = 4;
  const TOTAL_BEATS = TOTAL_BARS * BEATS_PER_BAR;

  // Playback simulation
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setPlayheadPos(prev => {
          if (prev >= TOTAL_BEATS) return 0;
          return prev + 0.25;
        });
      }, (60000 / bpm) / 4);
    } else {
      clearInterval(playIntervalRef.current);
    }
    return () => clearInterval(playIntervalRef.current);
  }, [isPlaying, bpm]);

  const getNoteIndex = (noteName) => ALL_NOTES.indexOf(noteName);

  const handleGridClick = useCallback((e) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollX;
    const y = e.clientY - rect.top + scrollY;
    const beat = Math.floor(x / CELL_WIDTH);
    const noteIdx = Math.floor(y / CELL_HEIGHT);
    const noteName = ALL_NOTES[noteIdx];

    if (activeTool === 'draw' && noteName) {
      const existing = notes.find(n => getNoteIndex(n.note) === noteIdx && beat >= n.start && beat < n.start + n.duration);
      if (!existing) {
        const baseName = noteName.replace(/[0-9]/g, '');
        const newNote = {
          id: nextId,
          note: noteName,
          start: beat,
          duration: snapValue === '1/1' ? 4 : snapValue === '1/2' ? 2 : 1,
          velocity: 90 + Math.floor(Math.random() * 20),
          color: NOTE_COLORS[baseName] || '#8b5cf6'
        };
        setNotes(prev => [...prev, newNote]);
        setNextId(prev => prev + 1);
      }
    } else if (activeTool === 'erase') {
      const toRemove = notes.find(n => getNoteIndex(n.note) === noteIdx && beat >= n.start && beat < n.start + n.duration);
      if (toRemove) {
        setNotes(prev => prev.filter(n => n.id !== toRemove.id));
      }
    } else if (activeTool === 'select') {
      const clicked = notes.find(n => getNoteIndex(n.note) === noteIdx && beat >= n.start && beat < n.start + n.duration);
      if (clicked) {
        setSelectedNotes(prev => {
          const next = new Set(prev);
          if (next.has(clicked.id)) next.delete(clicked.id);
          else next.add(clicked.id);
          return next;
        });
      } else {
        setSelectedNotes(new Set());
      }
    }
  }, [activeTool, notes, scrollX, scrollY, zoom, snapValue, nextId]);

  const handleGridMouseMove = useCallback((e) => {
    if (!gridRef.current || activeTool !== 'draw') return;
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollX;
    const y = e.clientY - rect.top + scrollY;
    const beat = Math.floor(x / CELL_WIDTH);
    const noteIdx = Math.floor(y / CELL_HEIGHT);
    if (noteIdx >= 0 && noteIdx < ALL_NOTES.length) {
      setGhostNote({ beat, noteIdx, name: ALL_NOTES[noteIdx] });
    }
  }, [activeTool, scrollX, scrollY, zoom]);

  const deleteSelected = () => {
    setNotes(prev => prev.filter(n => !selectedNotes.has(n.id)));
    setSelectedNotes(new Set());
  };

  const duplicateSelected = () => {
    const newNotes = notes.filter(n => selectedNotes.has(n.id)).map((n, i) => ({
      ...n, id: nextId + i, start: n.start + 4
    }));
    setNotes(prev => [...prev, ...newNotes]);
    setNextId(prev => prev + newNotes.length);
  };

  return (
    <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '16px', border: '1px solid rgba(139,92,246,0.3)', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap' }}>
        {/* Transport */}
        <div style={{ display: 'flex', gap: '4px', marginRight: '8px' }}>
          <button onClick={() => setIsPlaying(!isPlaying)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: isPlaying ? '#ef4444' : '#10b981', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button onClick={() => { setIsPlaying(false); setPlayheadPos(0); }} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Square size={14} />
          </button>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

        {/* Tools */}
        {TOOLS.map(tool => (
          <button key={tool.id} onClick={() => setActiveTool(tool.id)} title={tool.label} style={{
            width: '32px', height: '32px', borderRadius: '8px', border: activeTool === tool.id ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)',
            background: activeTool === tool.id ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.05)', color: activeTool === tool.id ? '#c4b5fd' : '#9ca3af',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <tool.icon size={14} />
          </button>
        ))}

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

        {/* Snap */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Magnet size={12} style={{ color: '#f59e0b' }} />
          <select value={snapValue} onChange={e => setSnapValue(e.target.value)} style={{
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', padding: '4px 8px', fontSize: '11px', outline: 'none'
          }}>
            {SNAP_VALUES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

        {/* Zoom */}
        <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ZoomOut size={12} />
        </button>
        <span style={{ fontSize: '11px', color: '#9ca3af', minWidth: '35px', textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ZoomIn size={12} />
        </button>

        <div style={{ flex: 1 }} />

        {/* Info */}
        <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
          <span style={{ color: '#a78bfa' }}>🎵 {bpm} BPM</span>
          <span style={{ color: '#f472b6' }}>🎼 {keySignature}</span>
          <span style={{ color: '#34d399' }}>📝 {notes.length} notes</span>
          {ghostNote && <span style={{ color: '#fbbf24' }}>🎹 {ghostNote.name}</span>}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
          <button onClick={duplicateSelected} title="Duplicate" style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Copy size={12} />
          </button>
          <button onClick={deleteSelected} title="Delete" style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Piano Roll Grid */}
      <div style={{ display: 'flex', height: '450px' }}>
        {/* Piano Keys */}
        <div style={{ width: `${PIANO_WIDTH}px`, flexShrink: 0, overflowY: 'hidden', background: 'rgba(0,0,0,0.7)', borderRight: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ transform: `translateY(-${scrollY}px)` }}>
            {ALL_NOTES.map((note, i) => {
              const isBlack = note.includes('#');
              const isC = note.startsWith('C') && !note.includes('#');
              return (
                <div key={note} style={{
                  height: `${CELL_HEIGHT}px`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '6px',
                  background: isBlack ? 'rgba(0,0,0,0.8)' : 'rgba(30,30,50,0.6)',
                  borderBottom: isC ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.03)',
                  fontSize: '9px', color: isC ? '#a78bfa' : isBlack ? '#4b5563' : '#6b7280', fontWeight: isC ? '700' : '400'
                }}>
                  {note}
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid Area */}
        <div ref={gridRef} onClick={handleGridClick} onMouseMove={handleGridMouseMove} onMouseLeave={() => setGhostNote(null)}
          style={{ flex: 1, overflow: 'auto', position: 'relative', cursor: activeTool === 'draw' ? 'crosshair' : activeTool === 'erase' ? 'not-allowed' : 'default' }}
          onScroll={e => { setScrollX(e.target.scrollLeft); setScrollY(e.target.scrollTop); }}
        >
          <div style={{ width: `${TOTAL_BEATS * CELL_WIDTH}px`, height: `${ALL_NOTES.length * CELL_HEIGHT}px`, position: 'relative' }}>
            {/* Grid Lines */}
            {ALL_NOTES.map((note, i) => {
              const isBlack = note.includes('#');
              const isC = note.startsWith('C') && !note.includes('#');
              return (
                <div key={`row-${i}`} style={{
                  position: 'absolute', top: `${i * CELL_HEIGHT}px`, left: 0, right: 0, height: `${CELL_HEIGHT}px`,
                  background: isBlack ? 'rgba(0,0,0,0.3)' : 'rgba(20,20,40,0.2)',
                  borderBottom: isC ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(255,255,255,0.02)'
                }} />
              );
            })}

            {/* Beat Lines */}
            {Array.from({ length: TOTAL_BEATS }, (_, i) => (
              <div key={`beat-${i}`} style={{
                position: 'absolute', left: `${i * CELL_WIDTH}px`, top: 0, bottom: 0, width: '1px',
                background: i % 4 === 0 ? 'rgba(139,92,246,0.3)' : i % 2 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'
              }} />
            ))}

            {/* Bar Numbers */}
            {Array.from({ length: TOTAL_BARS }, (_, i) => (
              <div key={`bar-${i}`} style={{
                position: 'absolute', left: `${i * BEATS_PER_BAR * CELL_WIDTH + 4}px`, top: '2px',
                fontSize: '9px', color: 'rgba(139,92,246,0.5)', fontWeight: '700', zIndex: 5
              }}>{i + 1}</div>
            ))}

            {/* Ghost Note */}
            {ghostNote && activeTool === 'draw' && (
              <div style={{
                position: 'absolute',
                left: `${ghostNote.beat * CELL_WIDTH}px`,
                top: `${ghostNote.noteIdx * CELL_HEIGHT}px`,
                width: `${CELL_WIDTH}px`,
                height: `${CELL_HEIGHT - 1}px`,
                background: 'rgba(139,92,246,0.2)',
                border: '1px dashed rgba(139,92,246,0.5)',
                borderRadius: '3px',
                pointerEvents: 'none',
                zIndex: 8
              }} />
            )}

            {/* Notes */}
            {notes.map(note => {
              const noteIdx = getNoteIndex(note.note);
              if (noteIdx === -1) return null;
              const isSelected = selectedNotes.has(note.id);
              return (
                <div key={note.id} style={{
                  position: 'absolute',
                  left: `${note.start * CELL_WIDTH}px`,
                  top: `${noteIdx * CELL_HEIGHT + 1}px`,
                  width: `${note.duration * CELL_WIDTH - 1}px`,
                  height: `${CELL_HEIGHT - 2}px`,
                  background: `linear-gradient(135deg, ${note.color}, ${note.color}cc)`,
                  borderRadius: '3px',
                  border: isSelected ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.2)',
                  boxShadow: isSelected ? '0 0 8px rgba(251,191,36,0.4)' : `0 1px 3px rgba(0,0,0,0.3)`,
                  cursor: 'pointer',
                  zIndex: 10,
                  display: 'flex', alignItems: 'center', paddingLeft: '3px',
                  fontSize: '8px', color: 'rgba(255,255,255,0.8)', fontWeight: '600',
                  overflow: 'hidden', whiteSpace: 'nowrap'
                }}>
                  {note.duration * CELL_WIDTH > 30 && note.note}
                </div>
              );
            })}

            {/* Playhead */}
            <div style={{
              position: 'absolute', left: `${playheadPos * CELL_WIDTH}px`, top: 0, bottom: 0,
              width: '2px', background: '#ef4444', zIndex: 20, boxShadow: '0 0 8px rgba(239,68,68,0.5)'
            }}>
              <div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', position: 'absolute', top: '-5px', left: '-4px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Velocity Editor */}
      <div style={{ height: '80px', background: 'rgba(0,0,0,0.6)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '4px 0', display: 'flex' }}>
        <div style={{ width: `${PIANO_WIDTH}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#6b7280', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
          <Volume2 size={12} style={{ marginRight: '4px' }} /> Vel
        </div>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '1px', padding: '0 2px' }}>
          {notes.slice(0, 40).map(note => (
            <div key={note.id} style={{
              width: `${Math.max(4, note.duration * CELL_WIDTH * 0.3)}px`,
              height: `${(note.velocity / 127) * 65}px`,
              background: `linear-gradient(to top, ${note.color}, ${note.color}88)`,
              borderRadius: '2px 2px 0 0',
              minWidth: '3px',
              flexShrink: 0,
              border: selectedNotes.has(note.id) ? '1px solid #fbbf24' : 'none'
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}