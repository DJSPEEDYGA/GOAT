/**
 * GOAT Royalty App — Film Production Hub
 * Hollywood camera systems, Final Draft screenwriting, Dolby Atmos scoring,
 * and complete film/video production pipeline
 */

import React, { useState } from 'react';
import {
  Film, Camera, Music, FileText, Monitor, Volume2,
  Video, Clapperboard, Mic, Headphones, Settings, Star,
  Play, Pause, Download, Upload, Eye, Layers, Zap,
  Award, Globe, CheckCircle, ExternalLink, ArrowRight,
  Package, Sliders, Radio, Tv, Sparkles, Crown
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════
// CAMERA SYSTEMS
// ═══════════════════════════════════════════════════════════════════

const CAMERA_SYSTEMS = [
  {
    id: 'red', name: 'RED Digital Cinema', icon: '🔴', color: '#ef4444',
    models: ['V-RAPTOR XL 8K', 'V-RAPTOR 8K S35', 'KOMODO 6K', 'DSMC2 MONSTRO 8K'],
    sensor: 'VV / S35', resolution: 'Up to 8K', codec: 'REDCODE RAW',
    features: ['8K RAW', 'Global Shutter', 'IPP2 Color', 'REDCODE HQ/MQ/LQ'],
  },
  {
    id: 'arri', name: 'ARRI', icon: '🎬', color: '#f59e0b',
    models: ['ALEXA 65', 'ALEXA Mini LF', 'ALEXA Mini', 'AMIRA'],
    sensor: 'ALEV III / LF Open Gate', resolution: 'Up to 6.5K', codec: 'ARRIRAW / ProRes',
    features: ['ALEXA Color Science', 'HDR', 'ARRIRAW', 'S35/LF Options'],
  },
  {
    id: 'sony', name: 'Sony Venice', icon: '📷', color: '#0ea5e9',
    models: ['VENICE 2 8K', 'VENICE 2 6K', 'FX9', 'FX6'],
    sensor: 'Full Frame', resolution: 'Up to 8.6K', codec: 'X-OCN / XAVC',
    features: ['Dual Base ISO', 'X-OCN', '16-bit RAW', 'Anamorphic'],
  },
  {
    id: 'blackmagic', name: 'Blackmagic Design', icon: '🖥️', color: '#7c3aed',
    models: ['URSA Mini Pro 12K', 'URSA Mini Pro G2', 'Pocket Cinema 6K Pro', 'Pocket Cinema 4K'],
    sensor: 'S35 / M4/3', resolution: 'Up to 12K', codec: 'Blackmagic RAW / ProRes',
    features: ['12K Sensor', 'BRAW', 'DaVinci Resolve', 'Affordable Cinema'],
  },
];

// ═══════════════════════════════════════════════════════════════════
// POST-PRODUCTION TOOLS
// ═══════════════════════════════════════════════════════════════════

const POST_PRODUCTION = {
  editing: [
    { name: 'DaVinci Resolve', icon: '🎨', desc: 'Color grading & editing powerhouse', color: '#ef4444' },
    { name: 'Adobe Premiere Pro', icon: '🎬', desc: 'Industry-standard NLE', color: '#9333ea' },
    { name: 'Final Cut Pro', icon: '🍎', desc: 'Apple\'s professional editor', color: '#3b82f6' },
    { name: 'Avid Media Composer', icon: '🎞️', desc: 'Hollywood\'s choice for decades', color: '#6366f1' },
    { name: 'Filmora', icon: '📹', desc: 'Accessible video editing', color: '#10b981' },
  ],
  screenwriting: [
    { name: 'Final Draft', icon: '📝', desc: 'Industry-standard screenwriting', color: '#1e40af', features: ['Script formatting', 'Collaboration', 'Beat Board', 'Revision tracking'] },
    { name: 'WriterSolo', icon: '✍️', desc: 'AI-assisted screenwriting', color: '#7c3aed', features: ['AI suggestions', 'Story structure', 'Character arcs', 'Dialogue polish'] },
  ],
  audio: [
    { name: 'Dolby Atmos', icon: '🔊', desc: 'Immersive spatial audio for film', color: '#1e293b', features: ['Object-based audio', 'Spatial mixing', '7.1.4 surround', 'Binaural rendering'] },
    { name: 'Pro Tools | Ultimate', icon: '🎚️', desc: 'Film scoring & post-production', color: '#7c3aed', features: ['Dolby Atmos renderer', '384 voices', 'HDX DSP', 'VCA Spill'] },
    { name: 'Logic Pro', icon: '🎹', desc: 'Film scoring with Spatial Audio', color: '#6366f1', features: ['Dolby Atmos mixing', 'Spatial Audio', 'Score editor', 'Surround panner'] },
  ],
  vfx: [
    { name: 'Nuke', icon: '💥', desc: 'Node-based compositing', color: '#f59e0b' },
    { name: 'After Effects', icon: '✨', desc: 'Motion graphics & VFX', color: '#9333ea' },
    { name: 'Houdini', icon: '🌊', desc: 'Procedural VFX & simulation', color: '#ef4444' },
    { name: 'Unreal Engine 5', icon: '🎮', desc: 'Real-time VFX & virtual production', color: '#3b82f6' },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function FilmProductionHub() {
  const [activeTab, setActiveTab] = useState('cameras');
  const [expandedCamera, setExpandedCamera] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white">
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Film size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">Film Production Hub</h1>
              <p className="text-gray-300 mt-1">Hollywood cameras, screenwriting, Dolby Atmos & post-production</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-black">{CAMERA_SYSTEMS.length}</p>
              <p className="text-xs text-gray-300">Camera Systems</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-black">{POST_PRODUCTION.editing.length}</p>
              <p className="text-xs text-gray-300">Editing Suites</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-black">{POST_PRODUCTION.screenwriting.length}</p>
              <p className="text-xs text-gray-300">Writing Tools</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-black">{POST_PRODUCTION.vfx.length}</p>
              <p className="text-xs text-gray-300">VFX Engines</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { id: 'cameras', label: 'Camera Systems', icon: <Camera size={16} /> },
            { id: 'editing', label: 'Editing & Post', icon: <Clapperboard size={16} /> },
            { id: 'screenwriting', label: 'Screenwriting', icon: <FileText size={16} /> },
            { id: 'audio', label: 'Audio & Scoring', icon: <Music size={16} /> },
            { id: 'vfx', label: 'VFX Pipeline', icon: <Sparkles size={16} /> },
            { id: 'pipeline', label: 'Full Pipeline', icon: <Layers size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Camera Systems */}
        {activeTab === 'cameras' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">🎥 Hollywood Camera Systems</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CAMERA_SYSTEMS.map(cam => (
                <div key={cam.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all">
                  <div className="p-6" style={{ borderLeft: `4px solid ${cam.color}` }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{cam.icon}</span>
                        <div>
                          <h3 className="font-bold text-lg">{cam.name}</h3>
                          <p className="text-xs text-gray-500">{cam.resolution} • {cam.sensor}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">{cam.codec}</span>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Models</h4>
                      <div className="flex flex-wrap gap-2">
                        {cam.models.map((model, i) => (
                          <span key={i} className="text-xs px-3 py-1 rounded-full" style={{ background: `${cam.color}15`, color: cam.color }}>
                            {model}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {cam.features.map((f, i) => (
                          <span key={i} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                            <CheckCircle size={10} className="text-green-500" /> {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="mt-4 w-full py-2 rounded-lg text-sm font-bold text-white" style={{ background: cam.color }}>
                      <Camera size={14} className="inline mr-1" /> View Camera Specs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editing & Post */}
        {activeTab === 'editing' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">✂️ Editing & Post-Production</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {POST_PRODUCTION.editing.map((tool, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all" style={{ borderTop: `3px solid ${tool.color}` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{tool.icon}</span>
                    <h3 className="font-bold">{tool.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{tool.desc}</p>
                  <button className="w-full py-2 rounded-lg text-sm font-bold border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <ExternalLink size={14} className="inline mr-1" /> Open Integration
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Screenwriting */}
        {activeTab === 'screenwriting' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">📝 Screenwriting Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {POST_PRODUCTION.screenwriting.map((tool, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6" style={{ borderLeft: `4px solid ${tool.color}` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{tool.icon}</span>
                    <div>
                      <h3 className="font-bold text-lg">{tool.name}</h3>
                      <p className="text-sm text-gray-500">{tool.desc}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {tool.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <CheckCircle size={14} className="text-green-500" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full py-3 rounded-xl text-sm font-bold text-white" style={{ background: tool.color }}>
                    <FileText size={14} className="inline mr-1" /> Open {tool.name}
                  </button>
                </div>
              ))}
            </div>

            {/* Script Template */}
            <div className="bg-gray-900 rounded-2xl p-6 text-gray-300 font-mono text-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-green-400">screenplay_template.fountain</span>
                <span className="text-xs text-gray-500">Final Draft Format</span>
              </div>
              <pre className="whitespace-pre leading-relaxed">{`FADE IN:

INT. RECORDING STUDIO - NIGHT

HARVEY (DJ SPEEDY) sits at the mixing console,
headphones around his neck, golden light from
the monitors reflecting off his face.

                    HARVEY
          This is it. The one that changes 
          everything.

He hits PLAY. The speakers fill the room with
a bass-heavy beat that shakes the walls.

MONEY PENNY (V.O.)
          Harvey, your royalty report just came 
          in. You're going to want to see this.

Harvey smiles, pulls up the GOAT Royalty App
on his tablet.

                    HARVEY
          Show me the numbers, Penny.

                                    CUT TO:`}</pre>
            </div>
          </div>
        )}

        {/* Audio & Scoring */}
        {activeTab === 'audio' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">🎵 Audio & Film Scoring</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {POST_PRODUCTION.audio.map((tool, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6" style={{ borderTop: `3px solid ${tool.color}` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{tool.icon}</span>
                    <div>
                      <h3 className="font-bold">{tool.name}</h3>
                      <p className="text-xs text-gray-500">{tool.desc}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    {tool.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <CheckCircle size={12} className="text-green-500" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full py-2 rounded-lg text-sm font-bold text-white" style={{ background: tool.color }}>
                    Open {tool.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VFX Pipeline */}
        {activeTab === 'vfx' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">✨ VFX Pipeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {POST_PRODUCTION.vfx.map((tool, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all" style={{ borderLeft: `4px solid ${tool.color}` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{tool.icon}</span>
                    <div>
                      <h3 className="font-bold text-lg">{tool.name}</h3>
                      <p className="text-sm text-gray-500">{tool.desc}</p>
                    </div>
                  </div>
                  <button className="mt-3 w-full py-2 rounded-lg text-sm font-bold text-white" style={{ background: tool.color }}>
                    Launch {tool.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Pipeline */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">🎬 Complete Production Pipeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {[
                { step: 1, title: 'Script', desc: 'Final Draft', icon: '📝', color: '#1e40af' },
                { step: 2, title: 'Pre-Prod', desc: 'Storyboard & Plan', icon: '📋', color: '#7c3aed' },
                { step: 3, title: 'Shoot', desc: 'Camera Systems', icon: '🎥', color: '#ef4444' },
                { step: 4, title: 'Edit', desc: 'DaVinci / Premiere', icon: '✂️', color: '#f59e0b' },
                { step: 5, title: 'VFX', desc: 'Nuke / After Effects', icon: '✨', color: '#ec4899' },
                { step: 6, title: 'Deliver', desc: 'Dolby Atmos Master', icon: '🔊', color: '#10b981' },
              ].map((step, idx) => (
                <div key={step.step} className="relative">
                  <div className="text-center p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <div className="text-3xl mb-2">{step.icon}</div>
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: step.color }}>Step {step.step}</div>
                    <h3 className="font-bold">{step.title}</h3>
                    <p className="text-xs text-gray-500">{step.desc}</p>
                  </div>
                  {idx < 5 && (
                    <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ArrowRight size={16} className="text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}