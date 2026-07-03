/**
 * 🎮 Unreal Engine Hub — Epic Games Integration
 * GOAT Royalty App / GOAT Force Entertainment
 * Virtual Production, MetaHuman, MetaSounds, ICVFX, Fab Marketplace
 * © 2025 Harvey Miller / DJ Speedy / Life Imitates Art Inc
 */

import React, { useState } from 'react';
import {
  Monitor, Cpu, Globe, Zap, Download, ExternalLink, Star, Search,
  Play, Layers, Box, Camera, Music, Film, Sparkles, Settings,
  Shield, Eye, Grid, Code, Terminal, Package, Palette, Volume2,
  Users, Crown, Target, Activity, BarChart3, Wand2, RefreshCw
} from 'lucide-react';

// ═══ UNREAL ENGINE TOOLS ═══
const UE_TOOLS = [
  { id: 'ue5', name: 'Unreal Engine 5.7', version: '5.7', type: 'Game Engine', desc: 'Next-gen real-time 3D creation — Nanite, Lumen, Virtual Shadow Maps, World Partition, PCG, MegaLights, Substrate', icon: '🎮', color: '#0e1128', features: ['Nanite Virtualized Geometry', 'Lumen Global Illumination', 'MegaLights', 'World Partition', 'Chaos Physics', 'Niagara VFX', 'PCG Framework', 'Substrate Materials'], category: 'engine', free: true },
  { id: 'metahuman', name: 'MetaHuman Creator', version: '2025', type: 'Character Creation', desc: 'Create photorealistic digital humans in minutes — facial animation, body motion, hair grooms, clothing, Mesh to MetaHuman', icon: '👤', color: '#00bfff', features: ['Photorealistic Faces', 'Body Customization', 'Facial Animation', 'Hair Grooms', 'Mesh to MetaHuman', 'Motion Capture Ready', 'Live Link Face'], category: 'creation', free: true },
  { id: 'metasounds', name: 'MetaSounds', version: '5.7', type: 'Audio Engine', desc: 'Next-gen programmable audio system — node-based DSP, procedural audio, real-time synthesis, spatial audio, Ambisonics', icon: '🔊', color: '#ff6b35', features: ['Node-Based DSP', 'Procedural Audio', 'Real-Time Synthesis', 'Spatial Audio', 'Ambisonics', 'Audio Analysis', 'MIDI Support', 'Granular Synthesis'], category: 'audio', free: true },
  { id: 'icvfx', name: 'In-Camera VFX (ICVFX)', version: '5.7', type: 'Virtual Production', desc: 'LED wall virtual production — nDisplay, multi-GPU rendering, color calibration, camera tracking, real-time compositing', icon: '🎬', color: '#e91e63', features: ['nDisplay Multi-Screen', 'LED Wall Rendering', 'Camera Tracking', 'Color Calibration', 'Light Cards', 'Frustum Rendering', 'Stage Operator'], category: 'vp', free: true },
  { id: 'fab', name: 'Fab Marketplace', version: '2025', type: 'Asset Store', desc: 'Epic Games unified marketplace — Quixel Megascans, 3D assets, plugins, environments, characters, VFX, audio', icon: '🏪', color: '#7c3aed', features: ['Quixel Megascans', '3D Models', 'Environments', 'Characters', 'VFX Assets', 'Audio Packs', 'Plugins', 'Materials'], category: 'marketplace', free: false },
  { id: 'megascans', name: 'Quixel Megascans', version: '2025', type: '3D Scan Library', desc: 'World\'s largest photogrammetry library — 16K+ scanned assets, surfaces, 3D plants, imperfections, all FREE in UE', icon: '🌍', color: '#00c853', features: ['16K+ Assets', 'Photogrammetry Scans', 'PBR Materials', 'Surfaces', '3D Plants', 'Imperfections', 'Decals', 'Free in UE'], category: 'marketplace', free: true },
  { id: 'pixel-streaming', name: 'Pixel Streaming', version: '5.7', type: 'Cloud Rendering', desc: 'Stream UE applications to any device via browser — WebRTC, low latency, cloud GPU rendering, interactive experiences', icon: '☁️', color: '#2196f3', features: ['WebRTC Streaming', 'Cloud GPU', 'Browser Access', 'Low Latency', 'Interactive', 'Multi-User', 'Scalable'], category: 'streaming', free: true },
  { id: 'chaos', name: 'Chaos Physics & Destruction', version: '5.7', type: 'Physics Engine', desc: 'Real-time physics simulation — rigid body, soft body, cloth, fluid, destruction, vehicles, ragdoll', icon: '💥', color: '#ff5722', features: ['Rigid Body', 'Soft Body', 'Cloth Sim', 'Fluid Sim', 'Destruction', 'Vehicles', 'Ragdoll'], category: 'engine', free: true },
];

// ═══ UE PLUGINS FOR ENTERTAINMENT ═══
const UE_PLUGINS = [
  { id: 'dmx', name: 'DMX Plugin', type: 'Lighting Control', desc: 'Control real-world DMX lighting fixtures from Unreal — Art-Net, sACN, GDTF, MVR, fixture patches', icon: '💡', color: '#ffc107', category: 'live' },
  { id: 'live-link', name: 'Live Link', type: 'Motion Capture', desc: 'Real-time data streaming — facial mocap, body tracking, iPhone Face ID, OptiTrack, Vicon, Xsens', icon: '🏃', color: '#4caf50', category: 'mocap' },
  { id: 'ndisplay', name: 'nDisplay', type: 'Multi-Display', desc: 'Render across multiple displays/projectors — LED walls, CAVEs, domes, synchronized cluster rendering', icon: '🖥️', color: '#9c27b0', category: 'vp' },
  { id: 'composure', name: 'Composure', type: 'Compositing', desc: 'Real-time compositing — green screen keying, CG/live action merge, multi-layer compositing', icon: '🎭', color: '#00bcd4', category: 'vp' },
  { id: 'media-framework', name: 'Media Framework', type: 'Video Playback', desc: 'Professional video playback — NDI, Blackmagic, AJA, SDI capture, ProRes, HAP, real-time video walls', icon: '📺', color: '#ff9800', category: 'media' },
  { id: 'sequencer', name: 'Sequencer', type: 'Cinematic Editor', desc: 'Non-linear animation editor — keyframe animation, camera cuts, audio sync, render movie, FBX export', icon: '🎞️', color: '#e91e63', category: 'creation' },
  { id: 'niagara', name: 'Niagara VFX', type: 'Particle System', desc: 'GPU-accelerated VFX — particles, fluids, destruction, ribbons, mesh emitters, audio-reactive, millions of particles', icon: '✨', color: '#ff4081', category: 'vfx' },
  { id: 'water', name: 'Water System', type: 'Water Simulation', desc: 'Procedural water — oceans, rivers, lakes, waterfalls, buoyancy, fluid interaction, Gerstner waves', icon: '🌊', color: '#03a9f4', category: 'environment' },
  { id: 'pcg', name: 'PCG Framework', type: 'Procedural Generation', desc: 'Procedural Content Generation — scatter, rules, biomes, cities, landscapes, infinite worlds', icon: '🏗️', color: '#8bc34a', category: 'environment' },
  { id: 'oss-audio', name: 'Audio Modulation', type: 'Audio Plugin', desc: 'Dynamic audio control — parameter modulation, ADSR, LFO, random, audio buses, submixes, attenuation', icon: '🎵', color: '#ff6b35', category: 'audio' },
  { id: 'concert-viz', name: 'Concert Visualizer Kit', type: 'Entertainment', desc: 'Real-time concert visualization — audio-reactive environments, LED programming, stage design, crowd simulation', icon: '🎤', color: '#e040fb', category: 'live' },
  { id: 'electra', name: 'Electra UX', type: 'UI Framework', desc: 'Advanced UI toolkit — HUD, menus, data visualization, touch interfaces, responsive layouts for live events', icon: '📱', color: '#00e5ff', category: 'ui' },
];

// ═══ VIRTUAL PRODUCTION WORKFLOWS ═══
const VP_WORKFLOWS = [
  { id: 'music-video', name: 'Music Video Production', desc: 'Shoot music videos with virtual backgrounds on LED walls — infinite locations, real-time lighting, no travel needed', icon: '🎬', color: '#e91e63', steps: ['Stage Setup', 'LED Wall Calibration', 'Scene Design in UE5', 'Camera Tracking', 'Real-Time Rendering', 'Final Composite'] },
  { id: 'concert-stage', name: 'Concert Stage Design', desc: 'Design and preview concert stages in real-time — lighting, LED screens, pyro, crowd simulation, walkthrough', icon: '🎤', color: '#ff6b35', steps: ['Venue Scan', '3D Stage Model', 'Lighting Design', 'LED Content', 'Pyro Placement', 'Virtual Walkthrough'] },
  { id: 'album-art', name: 'Album Art & Visuals', desc: 'Create photorealistic album covers and promotional visuals — MetaHuman avatars, cinematic scenes, 8K renders', icon: '🖼️', color: '#7c3aed', steps: ['Concept Design', 'MetaHuman Setup', 'Scene Composition', 'Lighting & FX', '8K Render', 'Post-Process'] },
  { id: 'live-visuals', name: 'Live Concert Visuals', desc: 'Real-time audio-reactive visuals for live performances — Niagara particles, MetaSounds analysis, DMX sync', icon: '⚡', color: '#00bcd4', steps: ['Audio Input Setup', 'MetaSounds Analysis', 'Niagara VFX Design', 'DMX Mapping', 'nDisplay Config', 'Live Performance'] },
  { id: 'vr-experience', name: 'VR Fan Experience', desc: 'Create immersive VR concert experiences — 360° capture, spatial audio, interactive environments, Pixel Streaming', icon: '🥽', color: '#4caf50', steps: ['360° Capture', 'Spatial Audio Mix', 'Environment Design', 'Interaction Design', 'Pixel Streaming', 'Distribution'] },
  { id: 'metaverse-show', name: 'Metaverse Concert', desc: 'Host virtual concerts in the metaverse — MetaHuman performers, massive multiplayer, real-time interaction', icon: '🌐', color: '#2196f3', steps: ['MetaHuman Artist', 'Virtual Venue', 'Multiplayer Setup', 'Performance Capture', 'Live Stream', 'Monetization'] },
];

export default function UnrealEngineHub() {
  const [activeSection, setActiveSection] = useState('overview');
  const [pluginFilter, setPluginFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    { id: 'overview', label: 'Overview', icon: Monitor },
    { id: 'tools', label: 'UE5 Tools', icon: Box },
    { id: 'plugins', label: 'Plugins', icon: Package },
    { id: 'vp', label: 'Virtual Production', icon: Camera },
    { id: 'workflows', label: 'Workflows', icon: Layers },
  ];

  const filteredPlugins = UE_PLUGINS.filter(p => {
    const matchFilter = pluginFilter === 'all' || p.category === pluginFilter;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const S = {
    panel: { background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '20px', marginBottom: '16px' },
    glow: (c) => ({ background: `linear-gradient(135deg, ${c}15, ${c}08)`, border: `1px solid ${c}33`, borderRadius: '14px', padding: '20px', marginBottom: '16px' }),
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0e1128 0%, #1a0a2e 30%, #0a1a2e 60%, #0e1128 100%)', color: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(14,17,40,0.8)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #0e1128, #2196f3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🎮</div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>
              <span style={{ color: '#2196f3' }}>Unreal Engine</span> <span style={{ color: '#00bfff' }}>Hub</span>
            </h1>
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>Epic Games • UE 5.7 • MetaHuman • MetaSounds • ICVFX • Fab • Virtual Production • Life Imitates Art Inc</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a href="https://dev.epicgames.com/portal/en-US/life-imitates-art-inc" target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(33,150,243,0.2)', border: '1px solid rgba(33,150,243,0.4)', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', color: '#2196f3', textDecoration: 'none', fontWeight: 'bold' }}>🔗 Epic Dev Portal</a>
          <a href="/" style={{ background: 'rgba(234,179,8,0.2)', border: '1px solid rgba(234,179,8,0.4)', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', color: '#fbbf24', textDecoration: 'none', fontWeight: 'bold' }}>👑 GOAT Home</a>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', padding: '12px 24px', background: 'rgba(0,0,0,0.3)', overflowX: 'auto' }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap',
            background: activeSection === s.id ? 'linear-gradient(135deg, #2196f3, #00bfff)' : 'rgba(255,255,255,0.05)',
            color: activeSection === s.id ? 'white' : '#9ca3af',
          }}>
            <s.icon size={15} /> {s.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px' }}>
        {/* ═══ OVERVIEW ═══ */}
        {activeSection === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'UE5 Tools', value: UE_TOOLS.length, color: '#2196f3', icon: '🎮' },
                { label: 'Plugins', value: UE_PLUGINS.length, color: '#e91e63', icon: '🔌' },
                { label: 'VP Workflows', value: VP_WORKFLOWS.length, color: '#00bcd4', icon: '🎬' },
                { label: 'Megascans Assets', value: '16K+', color: '#00c853', icon: '🌍' },
                { label: 'Fab Marketplace', value: '100K+', color: '#7c3aed', icon: '🏪' },
                { label: 'Engine Version', value: '5.7', color: '#ff6b35', icon: '⚡' },
              ].map((stat, i) => (
                <div key={i} style={S.panel}>
                  <div style={{ fontSize: '22px', marginBottom: '2px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={S.glow('#2196f3')}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>🎮 Why Unreal Engine for GOAT Force Entertainment</h2>
              <p style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                Unreal Engine 5.7 transforms GOAT Force into a complete entertainment powerhouse. From virtual concert production with LED walls and ICVFX, to MetaHuman digital avatars of DJ Speedy and Waka Flocka, to MetaSounds audio-reactive visuals, to Pixel Streaming fan experiences — UE5 is the backbone of next-gen entertainment.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {[
                  { title: 'Virtual Concert Production', desc: 'LED wall stages, real-time backgrounds, ICVFX for music videos', icon: '🎤', color: '#e91e63' },
                  { title: 'MetaHuman Avatars', desc: 'Photorealistic digital DJ Speedy & Waka Flocka for metaverse shows', icon: '👤', color: '#00bfff' },
                  { title: 'Audio-Reactive Visuals', desc: 'MetaSounds + Niagara for live concert VFX synced to music', icon: '🔊', color: '#ff6b35' },
                  { title: 'Stage Design & Preview', desc: '3D stage design with lighting, pyro, LED screens, crowd sim', icon: '🏗️', color: '#4caf50' },
                  { title: 'Fan VR Experiences', desc: 'Immersive 360° concert experiences via Pixel Streaming', icon: '🥽', color: '#7c3aed' },
                  { title: 'Album Art & Cinematics', desc: '8K photorealistic renders for album covers and promo content', icon: '🖼️', color: '#ffc107' },
                ].map((f, i) => (
                  <div key={i} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>{f.icon}</div>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: f.color }}>{f.title}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ UE5 TOOLS ═══ */}
        {activeSection === 'tools' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {UE_TOOLS.map(tool => (
              <div key={tool.id} style={{ ...S.panel, marginBottom: 0, borderColor: `${tool.color}33`, position: 'relative' }}>
                {tool.free && <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#10b981', color: 'white', fontSize: '9px', fontWeight: '700', padding: '2px 7px', borderRadius: '4px' }}>FREE</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '32px' }}>{tool.icon}</span>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '17px', color: tool.color }}>{tool.name}</div>
                    <div style={{ fontSize: '10px', color: '#a78bfa' }}>v{tool.version} • {tool.type}</div>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: '#d1d5db', marginBottom: '10px', lineHeight: '1.5' }}>{tool.desc}</p>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {tool.features.map(f => <span key={f} style={{ background: `${tool.color}15`, color: tool.color, fontSize: '8px', padding: '2px 6px', borderRadius: '3px', fontWeight: '600' }}>{f}</span>)}
                </div>
                <button style={{ width: '100%', padding: '9px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg, ${tool.color}, ${tool.color}cc)`, color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>Launch {tool.name}</button>
              </div>
            ))}
          </div>
        )}

        {/* ═══ PLUGINS ═══ */}
        {activeSection === 'plugins' && (
          <div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {[{ id: 'all', label: 'All' }, { id: 'live', label: '🎤 Live Events' }, { id: 'vp', label: '🎬 Virtual Prod' }, { id: 'mocap', label: '🏃 MoCap' }, { id: 'audio', label: '🔊 Audio' }, { id: 'vfx', label: '✨ VFX' }, { id: 'media', label: '📺 Media' }, { id: 'environment', label: '🌍 Environment' }, { id: 'creation', label: '🎞️ Creation' }, { id: 'ui', label: '📱 UI' }].map(f => (
                <button key={f.id} onClick={() => setPluginFilter(f.id)} style={{
                  padding: '6px 12px', borderRadius: '8px', border: pluginFilter === f.id ? '2px solid #2196f3' : '1px solid rgba(255,255,255,0.1)',
                  background: pluginFilter === f.id ? 'rgba(33,150,243,0.2)' : 'rgba(255,255,255,0.05)', color: pluginFilter === f.id ? '#90caf9' : '#9ca3af',
                  cursor: 'pointer', fontWeight: '600', fontSize: '11px'
                }}>{f.label}</button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
              {filteredPlugins.map(p => (
                <div key={p.id} style={{ ...S.panel, marginBottom: 0, borderColor: `${p.color}33` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '24px' }}>{p.icon}</span>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: p.color }}>{p.name}</div>
                      <div style={{ fontSize: '9px', color: '#a78bfa' }}>{p.type} • {p.category}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '11px', color: '#d1d5db', lineHeight: '1.4', marginBottom: '8px' }}>{p.desc}</p>
                  <button style={{ width: '100%', padding: '7px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg, ${p.color}, ${p.color}aa)`, color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}>Enable Plugin</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ VIRTUAL PRODUCTION ═══ */}
        {activeSection === 'vp' && (
          <div>
            <div style={S.glow('#e91e63')}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}><Camera size={22} style={{ color: '#e91e63' }} /> Virtual Production Stage</h2>
              <p style={{ color: '#d1d5db', fontSize: '13px', marginBottom: '16px' }}>GOAT Force Virtual Production — LED wall stages powered by Unreal Engine ICVFX. Shoot music videos, design concert stages, and create immersive content without leaving the studio.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {[
                  { name: 'nDisplay LED Wall', desc: '180° curved LED wall, 4K per panel, real-time UE5 rendering', status: 'Ready', color: '#4caf50' },
                  { name: 'Camera Tracking', desc: 'OptiTrack / Vicon / HTC Vive Tracker, sub-mm precision', status: 'Ready', color: '#2196f3' },
                  { name: 'Live Link MoCap', desc: 'Full body + facial capture, iPhone Face ID, real-time retarget', status: 'Ready', color: '#ff6b35' },
                  { name: 'DMX Lighting', desc: 'Art-Net / sACN, 512 channels, fixture library, real-time sync', status: 'Ready', color: '#ffc107' },
                  { name: 'MetaSounds Audio', desc: 'Real-time audio analysis, frequency bands, beat detection', status: 'Ready', color: '#e91e63' },
                  { name: 'Pixel Streaming', desc: 'Stream to any device, WebRTC, cloud GPU, interactive', status: 'Ready', color: '#7c3aed' },
                ].map((sys, i) => (
                  <div key={i} style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '10px', padding: '14px', border: `1px solid ${sys.color}33` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: sys.color }}>{sys.name}</div>
                      <span style={{ background: `${sys.color}22`, color: sys.color, fontSize: '8px', padding: '2px 6px', borderRadius: '3px', fontWeight: '700' }}>● {sys.status}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>{sys.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ WORKFLOWS ═══ */}
        {activeSection === 'workflows' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
            {VP_WORKFLOWS.map(wf => (
              <div key={wf.id} style={{ ...S.panel, marginBottom: 0, borderColor: `${wf.color}33` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '28px' }}>{wf.icon}</span>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '16px', color: wf.color }}>{wf.name}</div>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: '#d1d5db', marginBottom: '12px', lineHeight: '1.5' }}>{wf.desc}</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {wf.steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: wf.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '900', color: 'white' }}>{i + 1}</div>
                      <span style={{ fontSize: '10px', color: '#d1d5db' }}>{step}</span>
                      {i < wf.steps.length - 1 && <span style={{ color: '#4b5563', fontSize: '10px' }}>→</span>}
                    </div>
                  ))}
                </div>
                <button style={{ width: '100%', padding: '9px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg, ${wf.color}, ${wf.color}cc)`, color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>Start Workflow</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#6b7280', flexWrap: 'wrap', gap: '8px' }}>
        <span>🎮 Unreal Engine Hub v1.0 • Epic Games Integration • GOAT Royalty</span>
        <span>© 2025 Life Imitates Art Inc / Harvey Miller / GOAT Force Entertainment</span>
        <span style={{ color: '#2196f3' }}>● UE 5.7 Connected</span>
      </div>
    </div>
  );
}