/**
 * 🎬 GOAT Animation & 3D Character Studio
 * Full-Spectrum Animation Production Hub — 2D, 3D, AI-Powered
 * Blender • Maya • ZBrush • Toon Boom • RunwayML • Krikey • Meshy
 * CEO: DJ Speedy (Harvey Miller) | President: Waka Flocka Flame
 * © 2025 GOAT Force Entertainment / Life Imitates Art Inc
 */

import React, { useState, useCallback } from 'react';
import {
  Monitor, Cpu, Globe, Zap, Download, ExternalLink, Star, Search,
  Play, Layers, Box, Camera, Music, Film, Sparkles, Settings,
  Shield, Eye, Grid, Code, Terminal, Package, Palette, Volume2,
  Users, Crown, Target, Activity, BarChart3, Wand2, RefreshCw,
  Clapperboard, Pen, Scissors, Move, RotateCw, Maximize,
  Image, Video, Tv, Brush, PenTool, Shapes, Triangle,
  Square, Circle, Hexagon, Diamond, Heart, Flame, Wind,
  Sun, Moon, CloudLightning, Waves, Mountain, TreePine
} from 'lucide-react';

// ═══ 3D MODELING & ANIMATION SOFTWARE ═══
const SOFTWARE_3D = [
  {
    id: 'blender',
    name: 'Blender 4.3',
    version: '4.3 LTS',
    type: '3D Creation Suite',
    desc: 'Free & open-source 3D creation — modeling, sculpting, animation, VFX, rendering, compositing, motion tracking, video editing. Grease Pencil 3.0 for 2D-in-3D animation.',
    icon: '🟠',
    color: '#E87D0D',
    category: '3d',
    free: true,
    features: ['Cycles/EEVEE Rendering', 'Grease Pencil 3.0', 'Geometry Nodes', 'Sculpt Mode', 'Cloth/Fluid Sim', 'Motion Tracking', 'Video Editor', 'Python Scripting', 'Asset Browser', 'USD/glTF Support'],
    useCase: 'Full 3D pipeline — GOAT Force character modeling, rigging, animation, and rendering. Grease Pencil for 2D cartoon overlays.',
    goatUse: 'Model and animate The GOAT, Baby GOAT, DJ Speedy, and Waka Flocka characters in full 3D with cartoon shading'
  },
  {
    id: 'maya',
    name: 'Autodesk Maya 2025',
    version: '2025.3',
    type: 'Professional 3D Animation',
    desc: 'Industry-standard 3D animation and VFX — Bifrost procedural effects, Arnold renderer, advanced rigging, MASH motion graphics, USD workflows.',
    icon: '🔵',
    color: '#0696D7',
    category: '3d',
    free: false,
    features: ['Bifrost VFX', 'Arnold Renderer', 'Advanced Rigging', 'MASH Motion Graphics', 'Cached Playback', 'USD Workflows', 'Blue Pencil', 'Retopology Tools', 'Sweep Mesh', 'Proximity Wrap'],
    useCase: 'Studio-grade character animation, facial rigging, and cinematic sequences for GOAT Force productions.',
    goatUse: 'Professional-grade character animation for GOAT Force cartoon series and music video VFX'
  },
  {
    id: 'zbrush',
    name: 'ZBrush 2025',
    version: '2025.1',
    type: 'Digital Sculpting',
    desc: 'Premier digital sculpting — 100M+ polygon sculpting, DynaMesh, ZRemesher, new Retopo Brush, photogrammetry tools, Fibermesh for hair/fur.',
    icon: '🔴',
    color: '#E8432E',
    category: '3d',
    free: false,
    features: ['100M+ Poly Sculpting', 'DynaMesh', 'ZRemesher Auto-Retopo', 'New Retopo Brush', 'Photogrammetry Import', 'Fibermesh Hair/Fur', 'Polypaint', 'UV Master', 'Decimation Master', 'GoZ Bridge'],
    useCase: 'Hyper-detailed character sculpting for GOAT Force heroes — skin pores, clothing wrinkles, accessories.',
    goatUse: 'Sculpt ultra-detailed GOAT Force character busts and full-body models with realistic or stylized detail'
  },
  {
    id: 'houdini',
    name: 'SideFX Houdini 20',
    version: '20.5',
    type: 'Procedural VFX',
    desc: 'Node-based procedural generation — Karma XPU renderer, Vellum cloth/hair, FLIP fluids, pyro FX, KineFX rigging, Solaris USD.',
    icon: '🟣',
    color: '#FF4713',
    category: '3d',
    free: false,
    features: ['Karma XPU Renderer', 'Vellum Cloth/Hair', 'FLIP Fluids', 'Pyro FX', 'KineFX Rigging', 'Solaris USD', 'PDG/TOPs Pipeline', 'Procedural Modeling', 'Terrain Generation', 'Crowd Simulation'],
    useCase: 'Procedural VFX for concert visuals, music video effects, and GOAT Force action sequences.',
    goatUse: 'Create explosive VFX, fire, smoke, and destruction effects for GOAT Force action scenes'
  },
  {
    id: 'cinema4d',
    name: 'Cinema 4D 2025',
    version: '2025.1',
    type: 'Motion Graphics & 3D',
    desc: 'Intuitive 3D motion graphics — MoGraph, Redshift GPU rendering, character animation, simulation, procedural modeling.',
    icon: '🔷',
    color: '#011A6A',
    category: '3d',
    free: false,
    features: ['MoGraph Toolset', 'Redshift GPU Render', 'Character Animation', 'Pyro Simulation', 'Unified Simulation', 'Scene Nodes', 'UV Unwrapping', 'Volumes', 'Fields System', 'Team Render'],
    useCase: 'Motion graphics for GOAT Force branding, logo animations, and broadcast-quality intros.',
    goatUse: 'Create stunning 3D motion graphics for GOAT Force brand identity and music video intros'
  },
];

// ═══ 2D ANIMATION SOFTWARE ═══
const SOFTWARE_2D = [
  {
    id: 'toonboom',
    name: 'Toon Boom Harmony 25',
    version: '25.1',
    type: '2D Animation Pipeline',
    desc: 'Industry-leading 2D animation — cut-out, traditional frame-by-frame, rigged puppet animation, compositing, FX. Used by Disney, Cartoon Network, Netflix.',
    icon: '🎨',
    color: '#00B4D8',
    category: '2d',
    free: false,
    features: ['Cut-Out Animation', 'Frame-by-Frame Drawing', 'Deformation Rigging', 'Node-Based Compositing', 'Master Controllers', 'Auto-Lip Sync', 'Camera Moves', 'Particle Effects', 'Color Palettes', 'Batch Rendering'],
    useCase: 'Full 2D cartoon production for GOAT Force animated series — character design, animation, compositing.',
    goatUse: 'Produce the GOAT Force cartoon series with professional 2D animation, lip sync, and compositing'
  },
  {
    id: 'storyboardpro',
    name: 'Storyboard Pro 25',
    version: '25',
    type: 'Storyboarding',
    desc: 'Professional storyboarding — drawing tools, camera moves, timing, animatic creation, 3D integration, audio sync.',
    icon: '📋',
    color: '#FF6B35',
    category: '2d',
    free: false,
    features: ['Drawing Tools', 'Camera Moves', 'Timing/Animatic', '3D Integration', 'Audio Sync', 'PDF/Movie Export', 'Layer System', 'Panel Transitions', 'Collaboration', 'Script Import'],
    useCase: 'Pre-production storyboarding for GOAT Force episodes, music videos, and promotional content.',
    goatUse: 'Storyboard every GOAT Force episode and music video before production begins'
  },
  {
    id: 'aftereffects',
    name: 'Adobe After Effects 2025',
    version: '25.2',
    type: 'Motion Graphics & Compositing',
    desc: 'Motion graphics, visual effects, compositing — Roto Brush AI, 3D workspace, expressions, plugins ecosystem, Lottie export.',
    icon: '💜',
    color: '#9999FF',
    category: '2d',
    free: false,
    features: ['Roto Brush AI', '3D Design Space', 'Expressions Engine', 'Shape Layers', 'Puppet Tool', 'Motion Tracking', 'Color Grading', 'Plugin Ecosystem', 'Lottie Export', 'Multi-Frame Rendering'],
    useCase: 'Post-production compositing, motion graphics overlays, and VFX for all GOAT Force content.',
    goatUse: 'Add motion graphics, titles, VFX overlays, and compositing to GOAT Force videos'
  },
  {
    id: 'spine',
    name: 'Spine 2D',
    version: '4.2',
    type: '2D Skeletal Animation',
    desc: 'Dedicated 2D skeletal animation — mesh deformation, IK constraints, path constraints, skins, blend modes, runtime engines.',
    icon: '🦴',
    color: '#FF4444',
    category: '2d',
    free: false,
    features: ['Skeletal Animation', 'Mesh Deformation', 'IK Constraints', 'Path Constraints', 'Skins System', 'Blend Modes', 'Clipping Masks', 'Physics', 'Runtime SDKs', 'Texture Packing'],
    useCase: '2D character animation for GOAT Force game characters, interactive content, and web animations.',
    goatUse: 'Animate GOAT Force characters for games, interactive web content, and app animations'
  },
  {
    id: 'live2d',
    name: 'Live2D Cubism',
    version: '5.1',
    type: '2D Live Animation',
    desc: 'Bring 2D illustrations to life — facial tracking, physics simulation, motion capture, VTuber creation, real-time animation.',
    icon: '👁️',
    color: '#E91E63',
    category: '2d',
    free: false,
    features: ['2D-to-Live Animation', 'Facial Tracking', 'Physics Simulation', 'Motion Capture', 'VTuber Ready', 'Real-Time Rendering', 'Mesh Deformation', 'Parameter Control', 'SDK Integration', 'Lip Sync'],
    useCase: 'Create live-animated GOAT Force avatars for streaming, VTubing, and interactive fan experiences.',
    goatUse: 'Create live DJ Speedy and Waka Flocka VTuber avatars for streaming and fan interaction'
  },
];

// ═══ AI-POWERED ANIMATION TOOLS ═══
const AI_TOOLS = [
  {
    id: 'runwayml',
    name: 'RunwayML Gen-4',
    version: 'Gen-4',
    type: 'AI Video Generation',
    desc: 'Next-gen AI video — consistent characters across shots, motion brush, style transfer, lip sync, camera control, multi-shot storytelling.',
    icon: '🎬',
    color: '#6366F1',
    category: 'ai',
    free: false,
    features: ['Gen-4 Video Model', 'Character Consistency', 'Motion Brush', 'Style Transfer', 'Lip Sync', 'Camera Control', 'Multi-Shot Stories', 'Image-to-Video', 'Text-to-Video', 'Inpainting/Outpainting'],
    useCase: 'AI-generated music video sequences, concept visualization, and rapid prototyping for GOAT Force content.',
    goatUse: 'Generate AI music video scenes, concept art animations, and rapid visual prototypes for GOAT Force'
  },
  {
    id: 'krikey',
    name: 'Krikey AI',
    version: '2025',
    type: 'AI Animation Generator',
    desc: 'AI-powered animation maker — text-to-animation, custom avatars, cartoon character creation, motion capture from video, SDK for developers.',
    icon: '🤖',
    color: '#00BCD4',
    category: 'ai',
    free: true,
    features: ['Text-to-Animation', 'Custom Avatars', 'Cartoon Maker', 'Video Motion Capture', 'Face Animation', 'Body Animation', 'SDK/API Access', 'Export to Unity/UE', 'Multiplayer Scenes', 'AR Integration'],
    useCase: 'Rapid AI-generated character animations, avatar creation, and cartoon content for GOAT Force social media.',
    goatUse: 'Create quick AI-animated GOAT Force cartoon clips for social media, TikTok, and Instagram'
  },
  {
    id: 'meshy',
    name: 'Meshy AI',
    version: '4.0',
    type: 'AI 3D Model Generator',
    desc: '#1 AI 3D model generator — text-to-3D, image-to-3D, AI texturing, AI rigging & animation, PBR materials, export to all formats.',
    icon: '🧊',
    color: '#7C3AED',
    category: 'ai',
    free: false,
    features: ['Text-to-3D Models', 'Image-to-3D', 'AI Texturing', 'AI Rigging', 'AI Animation', 'PBR Materials', 'FBX/OBJ/glTF Export', 'Batch Generation', 'Style Control', 'API Access'],
    useCase: 'Rapid 3D asset generation for GOAT Force — characters, props, environments from text or image prompts.',
    goatUse: 'Generate 3D GOAT Force characters, props, and environments from text descriptions or concept art'
  },
  {
    id: 'wonder-studio',
    name: 'Wonder Studio',
    version: '2025',
    type: 'AI VFX & Character',
    desc: 'AI-powered VFX — automatically animate, light, and composite CG characters into live-action scenes. No mocap suit needed.',
    icon: '✨',
    color: '#FF9800',
    category: 'ai',
    free: false,
    features: ['Auto CG Compositing', 'No Mocap Needed', 'Character Detection', 'Auto Lighting', 'Multi-Character', 'Scene Understanding', 'Export to Maya/Blender', 'Body Tracking', 'Facial Animation', 'Background Separation'],
    useCase: 'Composite GOAT Force 3D characters into real-world music video footage without expensive mocap.',
    goatUse: 'Put animated GOAT Force characters into real music videos and live footage automatically'
  },
  {
    id: 'cascadeur',
    name: 'Cascadeur',
    version: '2025.1',
    type: 'AI-Assisted Animation',
    desc: 'Physics-based character animation — AI-assisted posing, AutoPhysics, AutoPosing, trajectory editing, secondary motion.',
    icon: '🏃',
    color: '#4CAF50',
    category: 'ai',
    free: true,
    features: ['AutoPhysics', 'AutoPosing AI', 'Trajectory Editor', 'Secondary Motion', 'Fulcrum Points', 'Ghost Mode', 'IK/FK Blending', 'FBX/DAE Export', 'Rigging Tools', 'Graph Editor'],
    useCase: 'Create physically-accurate character animations for GOAT Force action sequences and dance moves.',
    goatUse: 'Animate realistic fight scenes, dance moves, and action sequences for GOAT Force characters'
  },
  {
    id: 'deepmotion',
    name: 'DeepMotion',
    version: '2025',
    type: 'AI Motion Capture',
    desc: 'Markerless AI motion capture — video-to-3D animation, real-time body tracking, facial capture, hand tracking, cloud processing.',
    icon: '📹',
    color: '#2196F3',
    category: 'ai',
    free: false,
    features: ['Video-to-3D Mocap', 'Real-Time Tracking', 'Facial Capture', 'Hand Tracking', 'Cloud Processing', 'BVH/FBX Export', 'Multi-Person', 'Retargeting', 'API Access', 'Unity/UE Plugin'],
    useCase: 'Capture DJ Speedy and Waka Flocka performances on video and convert to 3D character animation.',
    goatUse: 'Record real performances and convert them to 3D animation for GOAT Force characters'
  },
];

// ═══ GOAT FORCE CHARACTER PROFILES ═══
const GOAT_CHARACTERS = [
  {
    id: 'the-goat',
    name: 'The GOAT',
    role: 'Enigmatic Leader / Mascot',
    desc: 'The badass, enigmatic leader of the GOAT Royalty Force. Mysterious, powerful, and commands respect from all.',
    style: 'Ultra-realistic with cartoon edge — muscular anthropomorphic goat in tactical gear, glowing eyes, gold crown',
    colors: ['#FFD700', '#1A1A2E', '#E94560'],
    personality: 'Stoic, powerful, mysterious',
    animationStyle: 'Slow, deliberate movements with explosive action bursts',
    icon: '👑',
    color: '#FFD700'
  },
  {
    id: 'baby-goat',
    name: 'Baby GOAT',
    role: 'The Future of the Force',
    desc: 'Young, energetic, and full of potential. The next generation of GOAT Force power.',
    style: 'Cute but fierce — small anthropomorphic goat with oversized headphones, streetwear, mischievous grin',
    colors: ['#00E5FF', '#7C3AED', '#FF6B35'],
    personality: 'Energetic, curious, fearless',
    animationStyle: 'Quick, bouncy movements with exaggerated expressions',
    icon: '🐐',
    color: '#00E5FF'
  },
  {
    id: 'dj-speedy',
    name: 'DJ Speedy',
    role: 'CEO / The Gangsta Nerd',
    desc: 'Harvey L. Miller Jr. — CEO of GOAT Force, visionary strategist, technical architect, Minister of Music. The charismatic leader who built the empire.',
    style: 'Stylized realistic — sharp suit or streetwear, DJ equipment, holographic displays, tech gadgets, confident stance',
    colors: ['#6366F1', '#E91E63', '#FFD700'],
    personality: 'Charismatic, brilliant, unstoppable',
    animationStyle: 'Smooth, confident movements with DJ performance energy',
    icon: '🎧',
    color: '#6366F1'
  },
  {
    id: 'waka-flocka',
    name: 'Waka Flocka Flame',
    role: 'President / The Royalty Enforcer',
    desc: 'Juaquin James Malphurs — President of GOAT Force. When digital actions need real-world impact, Waka steps in.',
    style: 'Powerful realistic — imposing figure, signature dreads, BrickSquad chain, fire effects, commanding presence',
    colors: ['#FF4444', '#FF9800', '#1A1A2E'],
    personality: 'Intense, loyal, explosive',
    animationStyle: 'Powerful, explosive movements with hard-hitting presence',
    icon: '🔥',
    color: '#FF4444'
  },
  {
    id: 'ms-moneypenny',
    name: 'Ms. Moneypenny',
    role: 'The AI Powerhouse',
    desc: 'Omnipresent digital intelligence, primary architect of the GOAT Royalty App, chief collector of all recovered royalties.',
    style: 'Holographic AI entity — sleek feminine form made of data streams, glowing circuits, floating UI panels',
    colors: ['#00BCD4', '#7C3AED', '#00E5FF'],
    personality: 'Precise, omniscient, elegant',
    animationStyle: 'Fluid, data-stream movements with holographic transitions',
    icon: '💎',
    color: '#00BCD4'
  },
  {
    id: 'codex',
    name: 'Codex',
    role: 'The Sentinel AI',
    desc: 'Waka Flocka\'s personal AI assistant, Chief Coder for GOAT Force, manages finances and holds the Master API Key.',
    style: 'Cybernetic sentinel — armored AI entity with code-matrix visor, shield projections, terminal displays',
    colors: ['#00C853', '#1A1A2E', '#4CAF50'],
    personality: 'Vigilant, analytical, protective',
    animationStyle: 'Precise, mechanical movements with digital glitch effects',
    icon: '🛡️',
    color: '#00C853'
  },
];

// ═══ PRODUCTION PIPELINE STAGES ═══
const PIPELINE_STAGES = [
  { id: 'concept', name: 'Concept & Script', icon: '📝', color: '#FF6B35', desc: 'Story development, character design sheets, world-building, script writing', tools: ['Storyboard Pro', 'Photoshop', 'Procreate'], progress: 85 },
  { id: 'storyboard', name: 'Storyboarding', icon: '📋', color: '#2196F3', desc: 'Visual storytelling, shot composition, timing, animatic creation', tools: ['Storyboard Pro 25', 'After Effects'], progress: 70 },
  { id: 'modeling', name: '3D Modeling', icon: '🧊', color: '#7C3AED', desc: 'Character modeling, environment creation, prop design, UV mapping', tools: ['Blender', 'Maya', 'ZBrush', 'Meshy AI'], progress: 60 },
  { id: 'rigging', name: 'Rigging & Setup', icon: '🦴', color: '#E91E63', desc: 'Skeletal rigging, facial rig, blend shapes, control systems', tools: ['Maya', 'Blender', 'Cascadeur'], progress: 45 },
  { id: 'animation', name: 'Animation', icon: '🎬', color: '#FF9800', desc: 'Keyframe animation, motion capture, lip sync, secondary motion', tools: ['Maya', 'Blender', 'Toon Boom', 'DeepMotion'], progress: 35 },
  { id: 'texturing', name: 'Texturing & Shading', icon: '🎨', color: '#4CAF50', desc: 'PBR texturing, shader development, material creation, look development', tools: ['Substance Painter', 'ZBrush', 'Blender'], progress: 50 },
  { id: 'lighting', name: 'Lighting & FX', icon: '💡', color: '#FFC107', desc: 'Scene lighting, VFX, particles, simulations, atmosphere', tools: ['Houdini', 'Blender', 'After Effects'], progress: 30 },
  { id: 'rendering', name: 'Rendering', icon: '🖥️', color: '#9C27B0', desc: 'Final render, render farm, denoising, multi-pass output', tools: ['Cycles', 'Arnold', 'Redshift', 'Karma'], progress: 25 },
  { id: 'compositing', name: 'Compositing', icon: '🎞️', color: '#00BCD4', desc: 'Multi-layer compositing, color grading, final output, delivery', tools: ['After Effects', 'Nuke', 'DaVinci Resolve'], progress: 20 },
];

// ═══ ANIMATION PRESETS ═══
const ANIMATION_PRESETS = [
  { id: 'cartoon-series', name: 'GOAT Force Cartoon Series', style: '2D Animated Series', resolution: '1920x1080', fps: 24, format: 'TV Series', tools: ['Toon Boom Harmony', 'Storyboard Pro', 'After Effects'], color: '#FF6B35' },
  { id: 'music-video-3d', name: '3D Music Video', style: '3D CGI + Live Action', resolution: '3840x2160', fps: 30, format: 'Music Video', tools: ['Blender', 'After Effects', 'RunwayML'], color: '#6366F1' },
  { id: 'social-clips', name: 'Social Media Clips', style: 'AI-Generated Animation', resolution: '1080x1920', fps: 30, format: 'Short-Form', tools: ['Krikey AI', 'RunwayML', 'After Effects'], color: '#E91E63' },
  { id: 'game-assets', name: 'Game Character Assets', style: '3D Real-Time', resolution: 'Adaptive', fps: 60, format: 'Game Assets', tools: ['ZBrush', 'Maya', 'Substance Painter'], color: '#4CAF50' },
  { id: 'nft-art', name: 'NFT / Digital Art', style: 'Stylized 3D', resolution: '4096x4096', fps: 30, format: 'Digital Collectible', tools: ['Blender', 'ZBrush', 'Meshy AI'], color: '#7C3AED' },
  { id: 'vtuber-avatar', name: 'VTuber / Live Avatar', style: 'Live2D / 3D Real-Time', resolution: '1920x1080', fps: 60, format: 'Live Streaming', tools: ['Live2D', 'Blender', 'DeepMotion'], color: '#00BCD4' },
  { id: 'concert-visuals', name: 'Concert Visuals', style: 'Real-Time 3D', resolution: '3840x2160', fps: 60, format: 'Live Performance', tools: ['Unreal Engine', 'Houdini', 'Cinema 4D'], color: '#FF9800' },
  { id: 'album-cover', name: 'Album Cover Art', style: 'Hyper-Detailed 3D', resolution: '4096x4096', fps: 'Static', format: 'Print + Digital', tools: ['ZBrush', 'Blender', 'Photoshop'], color: '#FFD700' },
];

// ═══ TABS ═══
const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: '3d-tools', label: '3D Software', icon: Box },
  { id: '2d-tools', label: '2D Animation', icon: PenTool },
  { id: 'ai-tools', label: 'AI Animation', icon: Sparkles },
  { id: 'characters', label: 'GOAT Characters', icon: Users },
  { id: 'pipeline', label: 'Production Pipeline', icon: Layers },
  { id: 'presets', label: 'Project Presets', icon: Grid },
  { id: 'ai-generate', label: 'AI Generate', icon: Wand2 },
];

// ═══ STATS ═══
const STUDIO_STATS = {
  totalTools: 16,
  aiModels: 6,
  characters: 6,
  pipelineStages: 9,
  projectPresets: 8,
  renderHours: 2847,
  assetsCreated: 1250,
  animationMinutes: 342,
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function GOATAnimationStudio() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState('cartoon');
  const [aiTool, setAiTool] = useState('meshy');
  const [generating, setGenerating] = useState(false);
  const [generationLog, setGenerationLog] = useState([]);
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const allTools = [...SOFTWARE_3D, ...SOFTWARE_2D, ...AI_TOOLS];

  const handleAIGenerate = () => {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    setGenerationLog([]);
    const steps = [
      `🚀 Initializing ${aiTool === 'meshy' ? 'Meshy AI' : aiTool === 'krikey' ? 'Krikey AI' : aiTool === 'runway' ? 'RunwayML Gen-4' : aiTool === 'wonder' ? 'Wonder Studio' : 'Cascadeur'} engine...`,
      `📝 Processing prompt: "${aiPrompt.substring(0, 60)}..."`,
      `🎨 Applying ${aiStyle} style parameters...`,
      `🧠 AI model analyzing composition and structure...`,
      `🔧 Generating mesh topology / animation keyframes...`,
      `🎨 Applying textures and materials...`,
      `✨ Adding detail refinement pass...`,
      `📦 Packaging output (FBX/glTF/MP4)...`,
      `✅ Generation complete! Asset ready for download.`,
    ];
    steps.forEach((step, i) => {
      setTimeout(() => {
        setGenerationLog(prev => [...prev, { time: new Date().toLocaleTimeString(), message: step }]);
        if (i === steps.length - 1) {
          setGenerating(false);
          showNotification('AI generation complete! Asset ready.');
        }
      }, (i + 1) * 800);
    });
  };

  // ═══ DASHBOARD TAB ═══
  const renderDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 20, padding: 32, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 300, height: 300, background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 14, color: '#FFD700', fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>🎬 GOAT FORCE ENTERTAINMENT</div>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>Animation & 3D Character Studio</h2>
          <p style={{ color: '#999', fontSize: 14, maxWidth: 600, lineHeight: 1.6, marginBottom: 20 }}>
            Full-spectrum animation production hub — 16 professional tools, 6 AI engines, complete character pipeline.
            From concept art to final render, create the GOAT Force universe across 2D, 3D, and AI-powered animation.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => setActiveTab('ai-generate')} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #FFD700, #FF9800)', color: '#000', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wand2 size={16} /> AI Generate Now
            </button>
            <button onClick={() => setActiveTab('characters')} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={16} /> View Characters
            </button>
            <button onClick={() => setActiveTab('pipeline')} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={16} /> Production Pipeline
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Tools', value: STUDIO_STATS.totalTools, icon: Package, color: '#6366F1', sub: '3D + 2D + AI' },
          { label: 'AI Models', value: STUDIO_STATS.aiModels, icon: Sparkles, color: '#FF9800', sub: 'Gen-4, Meshy, Krikey+' },
          { label: 'Characters', value: STUDIO_STATS.characters, icon: Users, color: '#E91E63', sub: 'GOAT Force Team' },
          { label: 'Pipeline Stages', value: STUDIO_STATS.pipelineStages, icon: Layers, color: '#4CAF50', sub: 'Concept → Delivery' },
          { label: 'Assets Created', value: STUDIO_STATS.assetsCreated.toLocaleString(), icon: Box, color: '#7C3AED', sub: 'Models, rigs, textures' },
          { label: 'Render Hours', value: STUDIO_STATS.renderHours.toLocaleString(), icon: Cpu, color: '#2196F3', sub: 'GPU compute time' },
          { label: 'Animation Minutes', value: STUDIO_STATS.animationMinutes, icon: Film, color: '#FF6B35', sub: 'Completed footage' },
          { label: 'Project Presets', value: STUDIO_STATS.projectPresets, icon: Grid, color: '#00BCD4', sub: 'Ready templates' },
        ].map((kpi, i) => (
          <div key={i} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 18, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: 8, background: `${kpi.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <kpi.icon size={18} color={kpi.color} />
            </div>
            <div style={{ fontSize: 11, color: '#999', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{kpi.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{kpi.value}</div>
            <div style={{ fontSize: 10, color: kpi.color }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Tool Categories Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {[
          { title: '3D Modeling & Animation', count: SOFTWARE_3D.length, tools: SOFTWARE_3D.slice(0, 3).map(t => t.name), color: '#6366F1', icon: '🧊', tab: '3d-tools' },
          { title: '2D Animation & Motion', count: SOFTWARE_2D.length, tools: SOFTWARE_2D.slice(0, 3).map(t => t.name), color: '#FF6B35', icon: '🎨', tab: '2d-tools' },
          { title: 'AI-Powered Animation', count: AI_TOOLS.length, tools: AI_TOOLS.slice(0, 3).map(t => t.name), color: '#7C3AED', icon: '🤖', tab: 'ai-tools' },
        ].map((cat, i) => (
          <div key={i} onClick={() => setActiveTab(cat.tab)} style={{ background: `linear-gradient(135deg, ${cat.color}15, ${cat.color}05)`, border: `1px solid ${cat.color}33`, borderRadius: 16, padding: 20, cursor: 'pointer', transition: 'all 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 32 }}>{cat.icon}</span>
              <div>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 800, margin: 0 }}>{cat.title}</h3>
                <div style={{ color: cat.color, fontSize: 12, fontWeight: 600 }}>{cat.count} tools available</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {cat.tools.map((tool, j) => (
                <span key={j} style={{ background: `${cat.color}22`, color: cat.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{tool}</span>
              ))}
              <span style={{ color: '#999', fontSize: 11, padding: '3px 10px' }}>+{cat.count - 3} more</span>
            </div>
          </div>
        ))}
      </div>

      {/* GOAT Force Characters Preview */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Crown size={18} color="#FFD700" /> GOAT Force Character Roster
          </h3>
          <button onClick={() => setActiveTab('characters')} style={{ background: 'rgba(255,215,0,0.15)', color: '#FFD700', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            View All →
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {GOAT_CHARACTERS.map((char) => (
            <div key={char.id} onClick={() => { setSelectedCharacter(char); setActiveTab('characters'); }} style={{ background: `${char.color}11`, border: `1px solid ${char.color}33`, borderRadius: 12, padding: 14, textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }}>
              <div style={{ fontSize: 36, marginBottom: 6 }}>{char.icon}</div>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{char.name}</div>
              <div style={{ color: '#999', fontSize: 10, marginTop: 2 }}>{char.role}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ═══ TOOL GRID RENDERER ═══
  const renderToolGrid = (tools, title, emoji) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>{emoji} {title}</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Search size={14} color="#999" />
            <input type="text" placeholder="Search tools..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 13, outline: 'none', width: 150 }} />
          </div>
        </div>
      </div>

      {tools.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase())).map((tool) => (
        <div key={tool.id} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: `1px solid ${selectedTool?.id === tool.id ? tool.color + '66' : 'rgba(255,255,255,0.1)'}`, borderRadius: 16, padding: 24, cursor: 'pointer', transition: 'all 0.3s ease' }}
          onClick={() => setSelectedTool(selectedTool?.id === tool.id ? null : tool)}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, background: `${tool.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>
              {tool.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                <h4 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: 0 }}>{tool.name}</h4>
                <span style={{ background: `${tool.color}22`, color: tool.color, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{tool.type}</span>
                {tool.free && <span style={{ background: 'rgba(0,200,83,0.15)', color: '#00c853', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>FREE</span>}
                <span style={{ color: '#666', fontSize: 11 }}>v{tool.version}</span>
              </div>
              <p style={{ color: '#999', fontSize: 13, lineHeight: 1.6, marginBottom: 8, margin: 0 }}>{tool.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {tool.features.slice(0, 5).map((feat, i) => (
                  <span key={i} style={{ background: 'rgba(255,255,255,0.06)', color: '#ccc', padding: '3px 8px', borderRadius: 12, fontSize: 10, fontWeight: 500 }}>{feat}</span>
                ))}
                {tool.features.length > 5 && <span style={{ color: '#666', fontSize: 10, padding: '3px 8px' }}>+{tool.features.length - 5} more</span>}
              </div>
            </div>
          </div>

          {selectedTool?.id === tool.id && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                {/* All Features */}
                <div style={{ background: `${tool.color}11`, borderRadius: 12, padding: 16 }}>
                  <h5 style={{ color: tool.color, fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Zap size={14} /> All Features
                  </h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {tool.features.map((feat, i) => (
                      <span key={i} style={{ background: `${tool.color}22`, color: tool.color, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{feat}</span>
                    ))}
                  </div>
                </div>

                {/* GOAT Force Use Case */}
                <div style={{ background: 'rgba(255,215,0,0.08)', borderRadius: 12, padding: 16 }}>
                  <h5 style={{ color: '#FFD700', fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Crown size={14} /> GOAT Force Use Case
                  </h5>
                  <p style={{ color: '#ccc', fontSize: 12, lineHeight: 1.6, margin: 0 }}>{tool.useCase}</p>
                  <div style={{ marginTop: 12, padding: 10, background: 'rgba(255,215,0,0.1)', borderRadius: 8, borderLeft: '3px solid #FFD700' }}>
                    <p style={{ color: '#FFD700', fontSize: 12, fontWeight: 600, margin: 0 }}>🎯 {tool.goatUse}</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16 }}>
                  <h5 style={{ color: '#fff', fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Settings size={14} /> Quick Actions
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button style={{ padding: '8px 14px', background: `linear-gradient(135deg, ${tool.color}, ${tool.color}cc)`, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Play size={12} /> Launch Studio
                    </button>
                    <button style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Download size={12} /> Download / Install
                    </button>
                    <button style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ExternalLink size={12} /> Documentation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // ═══ CHARACTERS TAB ═══
  const renderCharacters = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>👑 GOAT Force Character Design Bible</h3>
        <div style={{ color: '#FFD700', fontSize: 13, fontWeight: 600 }}>{GOAT_CHARACTERS.length} Characters</div>
      </div>

      {GOAT_CHARACTERS.map((char) => (
        <div key={char.id} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: `1px solid ${selectedCharacter?.id === char.id ? char.color + '66' : 'rgba(255,255,255,0.1)'}`, borderRadius: 16, padding: 24, cursor: 'pointer', transition: 'all 0.3s ease' }}
          onClick={() => setSelectedCharacter(selectedCharacter?.id === char.id ? null : char)}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <div style={{ width: 80, height: 80, borderRadius: 16, background: `linear-gradient(135deg, ${char.colors[0]}44, ${char.colors[1]}44)`, border: `2px solid ${char.color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, flexShrink: 0 }}>
              {char.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h4 style={{ color: '#fff', fontSize: 22, fontWeight: 900, margin: 0 }}>{char.name}</h4>
                <span style={{ background: `${char.color}22`, color: char.color, padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{char.role}</span>
              </div>
              <p style={{ color: '#999', fontSize: 13, lineHeight: 1.6, margin: '8px 0' }}>{char.desc}</p>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {char.colors.map((c, i) => (
                  <div key={i} style={{ width: 24, height: 24, borderRadius: 6, background: c, border: '2px solid rgba(255,255,255,0.2)' }} title={c} />
                ))}
                <span style={{ color: '#666', fontSize: 11, padding: '4px 8px' }}>Color Palette</span>
              </div>
            </div>
          </div>

          {selectedCharacter?.id === char.id && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                {/* Visual Style */}
                <div style={{ background: `${char.color}11`, borderRadius: 12, padding: 16 }}>
                  <h5 style={{ color: char.color, fontSize: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Palette size={14} /> Visual Style Guide
                  </h5>
                  <p style={{ color: '#ccc', fontSize: 12, lineHeight: 1.6, margin: 0 }}>{char.style}</p>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ color: '#999', fontSize: 11, marginBottom: 4 }}>Color Palette</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {char.colors.map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 20, height: 20, borderRadius: 4, background: c }} />
                          <span style={{ color: '#999', fontSize: 10 }}>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Personality & Animation */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16 }}>
                  <h5 style={{ color: '#fff', fontSize: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Activity size={14} /> Personality & Motion
                  </h5>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ color: '#999', fontSize: 11, marginBottom: 4 }}>Personality</div>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{char.personality}</div>
                  </div>
                  <div>
                    <div style={{ color: '#999', fontSize: 11, marginBottom: 4 }}>Animation Style</div>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{char.animationStyle}</div>
                  </div>
                </div>

                {/* Generate Actions */}
                <div style={{ background: 'rgba(255,215,0,0.08)', borderRadius: 12, padding: 16 }}>
                  <h5 style={{ color: '#FFD700', fontSize: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Wand2 size={14} /> AI Generation
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button onClick={(e) => { e.stopPropagation(); setAiPrompt(`${char.name} character - ${char.style}`); setActiveTab('ai-generate'); }}
                      style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #FFD700, #FF9800)', color: '#000', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={12} /> Generate 3D Model
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setAiPrompt(`Animate ${char.name} - ${char.animationStyle}`); setAiTool('krikey'); setActiveTab('ai-generate'); }}
                      style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Play size={12} /> Generate Animation
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setAiPrompt(`${char.name} in action scene - ${char.style}`); setAiTool('runway'); setActiveTab('ai-generate'); }}
                      style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Video size={12} /> Generate Video Clip
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // ═══ PIPELINE TAB ═══
  const renderPipeline = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>🔄 Production Pipeline — GOAT Force Animation</h3>

      {/* Pipeline Overview */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto', paddingBottom: 8 }}>
          {PIPELINE_STAGES.map((stage, i) => (
            <div key={stage.id} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ background: `${stage.color}22`, border: `1px solid ${stage.color}44`, borderRadius: 10, padding: '8px 14px', textAlign: 'center', minWidth: 100 }}>
                <div style={{ fontSize: 20, marginBottom: 2 }}>{stage.icon}</div>
                <div style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{stage.name}</div>
                <div style={{ color: stage.color, fontSize: 10, fontWeight: 800, marginTop: 2 }}>{stage.progress}%</div>
              </div>
              {i < PIPELINE_STAGES.length - 1 && (
                <div style={{ color: '#444', margin: '0 2px', fontSize: 16 }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Pipeline Stages */}
      {PIPELINE_STAGES.map((stage, i) => (
        <div key={stage.id} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: `1px solid ${stage.color}33`, borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{ width: 50, height: 50, borderRadius: 12, background: `${stage.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
              {stage.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h4 style={{ color: '#fff', fontSize: 16, fontWeight: 800, margin: 0 }}>Stage {i + 1}: {stage.name}</h4>
                <span style={{ color: stage.color, fontSize: 12, fontWeight: 700 }}>{stage.progress}%</span>
              </div>
              <p style={{ color: '#999', fontSize: 12, margin: '4px 0 0 0' }}>{stage.desc}</p>
            </div>
          </div>
          {/* Progress Bar */}
          <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: 12 }}>
            <div style={{ height: '100%', width: `${stage.progress}%`, background: `linear-gradient(90deg, ${stage.color}, ${stage.color}88)`, borderRadius: 3, transition: 'width 0.5s ease' }} />
          </div>
          {/* Tools Used */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ color: '#666', fontSize: 11, padding: '3px 0' }}>Tools:</span>
            {stage.tools.map((tool, j) => (
              <span key={j} style={{ background: `${stage.color}22`, color: stage.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{tool}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // ═══ PRESETS TAB ═══
  const renderPresets = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>📐 Project Presets — Ready-to-Use Templates</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {ANIMATION_PRESETS.map((preset) => (
          <div key={preset.id} style={{ background: `linear-gradient(135deg, ${preset.color}15, ${preset.color}05)`, border: `1px solid ${preset.color}33`, borderRadius: 16, padding: 20, transition: 'all 0.3s ease' }}>
            <h4 style={{ color: '#fff', fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{preset.name}</h4>
            <div style={{ color: preset.color, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>{preset.style}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 8 }}>
                <div style={{ color: '#999', fontSize: 10 }}>Resolution</div>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{preset.resolution}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 8 }}>
                <div style={{ color: '#999', fontSize: 10 }}>Frame Rate</div>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{preset.fps} {typeof preset.fps === 'number' ? 'fps' : ''}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 8 }}>
                <div style={{ color: '#999', fontSize: 10 }}>Format</div>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{preset.format}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 8 }}>
                <div style={{ color: '#999', fontSize: 10 }}>Tools</div>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{preset.tools.length} tools</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {preset.tools.map((tool, i) => (
                <span key={i} style={{ background: `${preset.color}22`, color: preset.color, padding: '3px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600 }}>{tool}</span>
              ))}
            </div>
            <button style={{ width: '100%', padding: '10px 16px', background: `linear-gradient(135deg, ${preset.color}, ${preset.color}cc)`, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Play size={14} /> Start Project
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // ═══ AI GENERATE TAB ═══
  const renderAIGenerate = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>✨ AI Animation Generator — GOAT Force Studio</h3>

      {/* AI Tool Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {[
          { id: 'meshy', name: 'Meshy AI', desc: 'Text/Image → 3D Model', icon: '🧊', color: '#7C3AED' },
          { id: 'krikey', name: 'Krikey AI', desc: 'Text → Animation', icon: '🤖', color: '#00BCD4' },
          { id: 'runway', name: 'RunwayML Gen-4', desc: 'Text → Video', icon: '🎬', color: '#6366F1' },
          { id: 'wonder', name: 'Wonder Studio', desc: 'CG → Live Action', icon: '✨', color: '#FF9800' },
          { id: 'cascadeur', name: 'Cascadeur', desc: 'Physics Animation', icon: '🏃', color: '#4CAF50' },
          { id: 'deepmotion', name: 'DeepMotion', desc: 'Video → Mocap', icon: '📹', color: '#2196F3' },
        ].map((tool) => (
          <div key={tool.id} onClick={() => setAiTool(tool.id)}
            style={{ background: aiTool === tool.id ? `${tool.color}22` : 'rgba(255,255,255,0.03)', border: `1px solid ${aiTool === tool.id ? tool.color : 'rgba(255,255,255,0.1)'}`, borderRadius: 12, padding: 14, cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s ease' }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{tool.icon}</div>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{tool.name}</div>
            <div style={{ color: '#999', fontSize: 10 }}>{tool.desc}</div>
          </div>
        ))}
      </div>

      {/* Style Selector */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20 }}>
        <h4 style={{ color: '#fff', fontSize: 14, marginBottom: 12 }}>🎨 Style</h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['cartoon', 'realistic', 'anime', 'stylized', 'pixel-art', 'low-poly', 'cyberpunk', 'fantasy'].map(style => (
            <button key={style} onClick={() => setAiStyle(style)}
              style={{ padding: '6px 14px', borderRadius: 20, border: aiStyle === style ? 'none' : '1px solid rgba(255,255,255,0.15)', background: aiStyle === style ? 'linear-gradient(135deg, #FFD700, #FF9800)' : 'transparent', color: aiStyle === style ? '#000' : '#ccc', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20 }}>
        <h4 style={{ color: '#fff', fontSize: 14, marginBottom: 12 }}>📝 Prompt</h4>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Describe what you want to generate... e.g., 'The GOAT character in tactical gear, standing on a rooftop overlooking Atlanta skyline at sunset, dramatic lighting, ultra-detailed'"
          style={{ width: '100%', minHeight: 100, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: 14, color: '#fff', fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button onClick={handleAIGenerate} disabled={generating || !aiPrompt.trim()}
            style={{ padding: '10px 24px', background: generating ? '#666' : 'linear-gradient(135deg, #FFD700, #FF9800)', color: generating ? '#999' : '#000', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: generating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            {generating ? <RefreshCw size={16} className="animate-spin" /> : <Wand2 size={16} />}
            {generating ? 'Generating...' : 'Generate'}
          </button>
          {/* Quick Prompts */}
          {GOAT_CHARACTERS.slice(0, 4).map(char => (
            <button key={char.id} onClick={() => setAiPrompt(`${char.name} - ${char.style}`)}
              style={{ padding: '8px 14px', background: `${char.color}22`, color: char.color, border: `1px solid ${char.color}44`, borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
              {char.icon} {char.name}
            </button>
          ))}
        </div>
      </div>

      {/* Generation Log */}
      {generationLog.length > 0 && (
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, fontFamily: 'monospace' }}>
          <h4 style={{ color: '#00c853', fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Terminal size={14} /> Generation Log
          </h4>
          {generationLog.map((log, i) => (
            <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#666', fontSize: 11 }}>[{log.time}]</span>{' '}
              <span style={{ color: log.message.includes('✅') ? '#00c853' : log.message.includes('❌') ? '#f44336' : '#ccc', fontSize: 12 }}>{log.message}</span>
            </div>
          ))}
          {!generating && generationLog.length > 0 && (
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #6366F1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Download size={12} /> Download Asset
              </button>
              <button style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Eye size={12} /> Preview
              </button>
              <button onClick={() => { setGenerationLog([]); setAiPrompt(''); }} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw size={12} /> New Generation
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ═══ RENDER ACTIVE TAB ═══
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case '3d-tools': return renderToolGrid(SOFTWARE_3D, '3D Modeling & Animation Software', '🧊');
      case '2d-tools': return renderToolGrid(SOFTWARE_2D, '2D Animation & Motion Graphics', '🎨');
      case 'ai-tools': return renderToolGrid(AI_TOOLS, 'AI-Powered Animation Tools', '🤖');
      case 'characters': return renderCharacters();
      case 'pipeline': return renderPipeline();
      case 'presets': return renderPresets();
      case 'ai-generate': return renderAIGenerate();
      default: return renderDashboard();
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      {/* Notification */}
      {notification && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000, padding: '12px 20px', borderRadius: 10, background: notification.type === 'success' ? 'linear-gradient(135deg, #00c853, #009624)' : 'linear-gradient(135deg, #f44336, #c62828)', color: '#fff', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {notification.type === 'success' ? '✅' : '❌'} {notification.message}
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderBottom: '1px solid rgba(255,215,0,0.2)', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #FFD700, #FF9800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🎬</div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>GOAT Animation Studio</h1>
              <p style={{ fontSize: 11, color: '#999', margin: 0 }}>3D • 2D • AI-Powered • Full Production Pipeline</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: 'rgba(0,200,83,0.15)', color: '#00c853', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>● {allTools.length} Tools Active</span>
            <span style={{ background: 'rgba(255,215,0,0.15)', color: '#FFD700', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>GOAT Force</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 24px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 2, maxWidth: 1400, margin: '0 auto' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedTool(null); setSelectedCharacter(null); }}
              style={{ padding: '12px 16px', background: activeTab === tab.id ? 'rgba(255,215,0,0.1)' : 'transparent', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #FFD700' : '2px solid transparent', color: activeTab === tab.id ? '#FFD700' : '#999', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', transition: 'all 0.2s ease' }}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
        {renderContent()}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px', textAlign: 'center' }}>
        <p style={{ color: '#666', fontSize: 11, margin: 0 }}>
          © 2025 GOAT Force Entertainment / Life Imitates Art Inc — Animation & 3D Character Studio
          <br />CEO: DJ Speedy (Harvey Miller) | President: Waka Flocka Flame | Powered by Blender • Maya • ZBrush • Toon Boom • RunwayML • Krikey • Meshy
        </p>
      </div>
    </div>
  );
}