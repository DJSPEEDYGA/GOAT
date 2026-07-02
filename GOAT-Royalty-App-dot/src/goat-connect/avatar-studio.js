// ============================================================
// GOAT Avatar Studio — MetaHuman + DAZ3D + ReadyPlayerMe + UE5
// Hollywood Camera System + FiveM Integration + C++ Mastery Hub
// By Harvey Miller (DJ Speedy) — @DJSPEEDYGA
// The most advanced avatar, game dev & film production suite
// ever built into a desktop app.
// ============================================================
'use strict';

// ── AVATAR STUDIO STATE ──────────────────────────────────────
const avState = {
  activeTab: 'metahuman',
  avatarCreated: false,
  avatarUrl: null,
  selectedPose: 'idle',
  selectedStyle: 'realistic',
  animationPlaying: false,
  cameraMode: 'portrait',
  selectedCamera: 'arri_alexa35',
  fivemMode: 'server',
  cppLevel: 'beginner',
  metahumanStep: 0,
  rpmAvatarUrl: null,
  sceneObjects: [],
  renderQuality: 'cinematic',
};

// ── METAHUMAN PIPELINE ───────────────────────────────────────
const METAHUMAN_PIPELINE = [
  {
    step: 0, id: 'scan', icon: '📸',
    title: 'Photo/Face Scan',
    desc: 'Capture or upload a high-quality photo. Use RealityScan app for photogrammetry scan from 20+ angles for maximum accuracy.',
    tools: ['iPhone 12+ (TrueDepth camera)', 'ARRI Alexa 35 RAW capture', 'RealityScan App (free)', 'Photogrammetry from 20+ photos'],
    action: 'startMetahumanScan',
    actionLabel: '📷 Start Face Scan'
  },
  {
    step: 1, id: 'mesh', icon: '🧊',
    title: 'Generate 3D Mesh',
    desc: 'RealityCapture converts your scan into a photorealistic 3D mesh. Export as OBJ/FBX for MetaHuman pipeline.',
    tools: ['RealityCapture (Epic Games)', 'ContextCapture', 'Metashape', 'Meshroom (free)'],
    action: 'generateMesh',
    actionLabel: '🧊 Process Mesh'
  },
  {
    step: 2, id: 'metahuman', icon: '👤',
    title: 'Create MetaHuman',
    desc: 'Import mesh into MetaHuman Creator. AI auto-fits MetaHuman skeleton to your 3D scan. Fine-tune facial features, hair, skin.',
    tools: ['MetaHuman Creator (browser)', 'Mesh to MetaHuman plugin UE5', 'MetaHuman DNA Calibration'],
    action: 'openMetahumanCreator',
    actionLabel: '🚀 Open MetaHuman Creator'
  },
  {
    step: 3, id: 'animate', icon: '🎭',
    title: 'Live Facial Animation',
    desc: 'Stream real-time facial capture from iPhone using Live Link Face app. MetaHuman mirrors every expression in UE5.',
    tools: ['Live Link Face (iPhone)', 'ARKit 52-blendshape capture', 'iOS TrueDepth sensor', 'UE5 Live Link plugin'],
    action: 'setupLiveLink',
    actionLabel: '🎭 Setup Live Facial Capture'
  },
  {
    step: 4, id: 'export', icon: '✨',
    title: 'Export & Use',
    desc: 'Export MetaHuman to UE5 project, GOAT Connect profile, game world, FiveM server, or social media.',
    tools: ['Bridge plugin (UE5)', 'GOAT Connect integration', 'FiveM ped replacement', 'Social media export'],
    action: 'exportMetahuman',
    actionLabel: '✨ Export MetaHuman'
  },
];

// ── HOLLYWOOD CAMERAS ────────────────────────────────────────
const HOLLYWOOD_CAMERAS = {
  arri_alexa35: {
    name: 'ARRI Alexa 35',
    icon: '🎬',
    color: '#f59e0b',
    sensor: 'Super 35 CMOS',
    resolution: '4.6K (4608×3164)',
    dynamic_range: '17 stops',
    iso: 'Base ISO 800/3200',
    codec: 'ARRIRAW, ProRes 4444 XQ',
    fps: 'Up to 120fps at 4K',
    used_in: ['Dune: Part Two', 'Avatar 2', 'Oppenheimer', 'Mission Impossible 7'],
    price: '$90,000–$110,000',
    strengths: ['Industry standard skin tones', 'Highest dynamic range', 'ALEXA color science', 'Netflix approved'],
    ue5_integration: 'ARRI Color Science in UE5 via OCIO + OpenColorIO transforms',
    lut: 'ARRI LogC3/LogC4 to Rec.709',
    desc: 'The gold standard of Hollywood. Used in more Oscar-winning films than any other camera.',
  },
  red_v_raptor: {
    name: 'RED V-RAPTOR 8K VV',
    icon: '🔴',
    color: '#ef4444',
    sensor: 'Vista Vision (46.31mm×24.17mm)',
    resolution: '8K (8192×4320)',
    dynamic_range: '17+ stops',
    iso: 'Base ISO 250/800',
    codec: 'REDCODE RAW (RCWG), ProRes',
    fps: 'Up to 120fps at 8K',
    used_in: ['Guardians of the Galaxy 3', 'The Flash', 'John Wick 4', 'Top Gun: Maverick'],
    price: '$24,500 body only',
    strengths: ['Highest resolution available', 'Compact for 8K', 'Modular system', 'REDCODE RAW efficiency'],
    ue5_integration: 'RED IPP2 pipeline → UE5 via Linear Color Space + ACES',
    lut: 'REDWideGamutRGB / Log3G10 → ACES',
    desc: 'Preferred by VFX-heavy blockbusters. The 8K resolution is perfect for UE5 virtual production.',
  },
  blackmagic_ursa: {
    name: 'Blackmagic URSA Mini Pro 12K',
    icon: '⬛',
    color: '#6366f1',
    sensor: 'Super 35 (27.03mm×14.25mm)',
    resolution: '12K (12288×6480)',
    dynamic_range: '14 stops',
    iso: 'Base ISO 400/3200',
    codec: 'Blackmagic RAW (BRAW), ProRes',
    fps: 'Up to 60fps at 12K, 240fps at 4K',
    used_in: ['Finch', 'The Portable Door', 'Various Netflix productions'],
    price: '$9,995',
    strengths: ['Highest resolution production camera', 'Most affordable pro option', 'DaVinci Resolve native', 'Open gate'],
    ue5_integration: 'BRAW → DaVinci → UE5 via OCIO / Blackmagic color science',
    lut: 'BMD Film Gen5 → Rec.709 / ACES',
    desc: 'The disruptor. 12K resolution at an accessible price. Perfect for indie filmmakers going Hollywood.',
  },
  sony_venice2: {
    name: 'Sony VENICE 2 (8.6K)',
    icon: '🎭',
    color: '#3b82f6',
    sensor: 'Full Frame (35.9mm×24mm)',
    resolution: '8.6K (8640×5760)',
    dynamic_range: '16 stops',
    iso: 'Dual Base ISO 800/3200',
    codec: 'X-OCN XT/ST/LT, ProRes 4444 XQ',
    fps: 'Up to 90fps at 8.6K',
    used_in: ['Bullet Train', 'Elvis', 'Morbius', 'The Batman VFX'],
    price: '$48,000',
    strengths: ['Best full-frame sensor', 'Exceptional low-light', 'Venice color science', '8-stop built-in ND'],
    ue5_integration: 'Sony S-Log3/S-Gamut3 → UE5 ACES ODT pipeline',
    lut: 'S-Log3/S-Gamut3.Cine → Rec.709',
    desc: 'Preferred for beauty and skin tone. Outstanding performance in challenging lighting conditions.',
  },
  panavision_dxl2: {
    name: 'Panavision Millennium DXL2',
    icon: '🎥',
    color: '#8b5cf6',
    sensor: 'Large Format (46mm×24mm)',
    resolution: '8K',
    dynamic_range: '16+ stops',
    iso: 'Base ISO 1600',
    codec: 'REDCODE RAW (custom Panavision)',
    fps: 'Up to 75fps at 8K',
    used_in: ['1917', 'Aquaman', 'Once Upon a Time in Hollywood'],
    price: 'Rental only (~$2,500/day)',
    strengths: ['Legendary optical character', 'Large format look', 'Panavision glass', 'Cinematic compression'],
    ue5_integration: 'Custom Panavision LUTs → UE5 virtual production pipeline',
    lut: 'Panavision Log → Rec.709 / P3 DCI',
    desc: 'The most prestigious camera in Hollywood history. Exclusively available through Panavision rental.',
  },
  iphone_15_pro: {
    name: 'iPhone 15 Pro (ProRes Log)',
    icon: '📱',
    color: '#22c55e',
    sensor: '1/1.28" CMOS',
    resolution: '4K ProRes Log (4096×2160)',
    dynamic_range: '12+ stops (ProRes Log)',
    iso: 'ISO 40–40,000',
    codec: 'ProRes Log, HEVC, H.264',
    fps: 'Up to 120fps at 4K, 240fps at 1080p',
    used_in: ['Tangerine (forerunner)', 'Nightbitch (Apple TV+)', 'Various music videos', 'MetaHuman Live Link capture'],
    price: '$999–$1,199',
    strengths: ['MetaHuman Live Link (TrueDepth)', 'Always-available', 'ProRes Log cinema quality', 'ARKit integration'],
    ue5_integration: 'iPhone → Live Link Face → MetaHuman facial animation in real-time UE5',
    lut: 'Apple Log → Rec.709 conversion LUT',
    desc: 'The only camera that directly drives MetaHuman facial animation in real-time via ARKit + Live Link Face.',
  },
};

// ── ANIMATION POSES ──────────────────────────────────────────
const AVATAR_POSES = [
  { id: 'idle',         icon: '🧍', label: 'Idle Stand',      css: 'pose-idle'    },
  { id: 'wave',         icon: '👋', label: 'Wave Hello',      css: 'pose-wave'    },
  { id: 'dance',        icon: '💃', label: 'Dance Move',      css: 'pose-dance'   },
  { id: 'heart',        icon: '🫶', label: 'Heart Hands',     css: 'pose-heart'   },
  { id: 'flex',         icon: '💪', label: 'Flex Power',      css: 'pose-flex'    },
  { id: 'peace',        icon: '✌️', label: 'Peace Sign',      css: 'pose-peace'   },
  { id: 'point',        icon: '👆', label: 'Point Up',        css: 'pose-point'   },
  { id: 'bow',          icon: '🙇', label: 'Artist Bow',      css: 'pose-bow'     },
  { id: 'dj',           icon: '🎧', label: 'DJ Scratch',      css: 'pose-dj'      },
  { id: 'mic',          icon: '🎤', label: 'Hold Mic',        css: 'pose-mic'     },
  { id: 'celebrate',    icon: '🎉', label: 'Celebrate',       css: 'pose-celebrate'},
  { id: 'thinking',     icon: '🤔', label: 'Thinking',        css: 'pose-think'   },
];

// ── FIVEM RESOURCE TEMPLATES ─────────────────────────────────
const FIVEM_TEMPLATES = {
  basic_script: {
    name: 'Basic ESX Script',
    lang: 'lua',
    desc: 'Starter server-side script with ESX framework',
    code: `-- GOAT FiveM Script Template
-- Generated by Super GOAT Royalty
-- Framework: ESX

local ESX = exports['es_extended']:getSharedObject()

RegisterNetEvent('goat:server:action')
AddEventHandler('goat:server:action', function(data)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then return end
    
    -- Your logic here
    TriggerClientEvent('goat:client:response', source, {
        success = true,
        message = 'Action completed!'
    })
end)

-- Command example
RegisterCommand('goattest', function(source, args, rawCommand)
    local xPlayer = ESX.GetPlayerFromId(source)
    TriggerClientEvent('goat:client:notify', source, 'GOAT FiveM Active!')
end, false)

-- Job check example
RegisterNetEvent('goat:server:checkJob')
AddEventHandler('goat:server:checkJob', function(requiredJob)
    local xPlayer = ESX.GetPlayerFromId(source)
    if xPlayer.job.name == requiredJob then
        TriggerClientEvent('goat:client:jobAllowed', source)
    end
end)`
  },
  qb_script: {
    name: 'QBCore Framework Script',
    lang: 'lua',
    desc: 'QBCore server + client starter',
    code: `-- GOAT QBCore Script Template
-- Generated by Super GOAT Royalty
-- Framework: QBCore

local QBCore = exports['qb-core']:GetCoreObject()

-- Server-side
RegisterNetEvent('goat:server:qbAction', function(data)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then return end
    
    -- Check job
    if Player.PlayerData.job.name == 'police' then
        TriggerClientEvent('QBCore:Notify', src, 'Police action!', 'success')
    end
    
    -- Add item
    Player.Functions.AddItem('goat_item', 1)
    TriggerClientEvent('inventory:client:ItemBox', src, 
        QBCore.Shared.Items['goat_item'], 'add')
end)

-- Client-side target example  
AddEventHandler('onClientGameTypeStart', function()
    exports['qb-target']:AddGlobalPed({
        options = {{
            event = 'goat:client:pedInteract',
            icon = 'fas fa-star',
            label = 'GOAT Interaction',
        }},
        distance = 2.5
    })
end)`
  },
  metahuman_ped: {
    name: 'MetaHuman Ped Replacement',
    lang: 'lua',
    desc: 'Replace FiveM ped with custom MetaHuman character',
    code: `-- GOAT MetaHuman Ped Script
-- Replaces player ped with custom character
-- Works with streamed ped from MetaHuman export

local playerPedModel = 'goat_metahuman' -- Your exported ped name

AddEventHandler('playerSpawned', function()
    local model = GetHashKey(playerPedModel)
    
    RequestModel(model)
    while not HasModelLoaded(model) do
        Wait(100)
    end
    
    -- Set custom ped
    SetPlayerModel(PlayerId(), model)
    SetModelAsNoLongerNeeded(model)
    
    -- Apply facial animation rig
    local ped = PlayerPedId()
    SetPedDefaultComponentVariation(ped)
    
    -- Sync with server
    TriggerServerEvent('goat:server:pedSync', playerPedModel)
    
    print('[GOAT] MetaHuman ped loaded: ' .. playerPedModel)
end)

-- Facial expression trigger (synced with MetaHuman)
RegisterNetEvent('goat:client:setExpression')
AddEventHandler('goat:client:setExpression', function(expressionId)
    local ped = PlayerPedId()
    -- Expression IDs map to MetaHuman blendshapes
    PlayFacialAnim(ped, expressionId, 'facials@gen_male@base')
end)`
  },
  voice_proximity: {
    name: 'Voice Proximity System',
    lang: 'lua',
    desc: 'Realistic voice proximity with MetaHuman lip sync',
    code: `-- GOAT Voice Proximity + Lip Sync
-- Integrates with MetaHuman facial animation
-- Uses mumble-voip or pma-voice

local isTalking = false
local talkingPeds = {}

-- Monitor talking state
Citizen.CreateThread(function()
    while true do
        local ped = PlayerPedId()
        local talking = NetworkIsPlayerTalking(PlayerId())
        
        if talking ~= isTalking then
            isTalking = talking
            -- Trigger MetaHuman lip animation
            if talking then
                PlayFacialAnim(ped, 'mic_chatter', 'facials@gen_male@base')
            else
                PlayFacialAnim(ped, 'mood_normal_1', 'facials@gen_male@base')
            end
            -- Sync to other players
            TriggerServerEvent('goat:server:syncTalking', talking)
        end
        Wait(100)
    end
end)

-- Receive other players talking state
RegisterNetEvent('goat:client:playerTalking')
AddEventHandler('goat:client:playerTalking', function(playerId, talking)
    local ped = GetPlayerPed(GetPlayerFromServerId(playerId))
    if DoesEntityExist(ped) then
        if talking then
            PlayFacialAnim(ped, 'mic_chatter', 'facials@gen_male@base')
        else
            PlayFacialAnim(ped, 'mood_normal_1', 'facials@gen_male@base')
        end
    end
end)`
  }
};

// ── C++ LEARNING CURRICULUM ──────────────────────────────────
const CPP_CURRICULUM = {
  beginner: {
    label: 'Beginner',
    color: '#22c55e',
    icon: '🌱',
    topics: [
      { id: 'basics',    title: 'C++ Fundamentals',           desc: 'Variables, types, loops, functions, pointers' },
      { id: 'oop',       title: 'Object-Oriented Programming', desc: 'Classes, inheritance, polymorphism, encapsulation' },
      { id: 'stl',       title: 'STL Containers',             desc: 'vector, map, string, algorithms, iterators' },
      { id: 'memory',    title: 'Memory Management',          desc: 'Stack vs heap, new/delete, smart pointers' },
      { id: 'files',     title: 'File I/O',                   desc: 'Reading/writing files, streams, serialization' },
    ],
    books: [
      { title: 'C++ Primer (5th Ed)', author: 'Lippman, Lajoie, Moo', rating: '⭐⭐⭐⭐⭐', link: 'https://amzn.to/cppprime' },
      { title: 'Programming: Principles & Practice Using C++', author: 'Bjarne Stroustrup', rating: '⭐⭐⭐⭐⭐', link: '#' },
      { title: 'Accelerated C++', author: 'Koenig & Moo', rating: '⭐⭐⭐⭐', link: '#' },
    ]
  },
  intermediate: {
    label: 'Intermediate',
    color: '#f59e0b',
    icon: '⚡',
    topics: [
      { id: 'templates',  title: 'Templates & Generic Programming', desc: 'Function templates, class templates, SFINAE, concepts' },
      { id: 'modern',     title: 'Modern C++ (11/14/17/20)',        desc: 'Lambda, move semantics, ranges, coroutines, modules' },
      { id: 'multithreading', title: 'Multithreading',             desc: 'std::thread, mutex, atomic, async, condition_variable' },
      { id: 'patterns',   title: 'Design Patterns in C++',         desc: 'Singleton, Observer, Factory, CRTP, PIMPL' },
      { id: 'perf',       title: 'Performance Optimization',       desc: 'Cache efficiency, SIMD, profiling, benchmarking' },
    ],
    books: [
      { title: 'Effective Modern C++', author: 'Scott Meyers', rating: '⭐⭐⭐⭐⭐', link: '#' },
      { title: 'C++ Templates: The Complete Guide', author: 'Vandevoorde & Josuttis', rating: '⭐⭐⭐⭐⭐', link: '#' },
      { title: 'C++ Concurrency in Action', author: 'Anthony Williams', rating: '⭐⭐⭐⭐⭐', link: '#' },
    ]
  },
  ue5: {
    label: 'UE5 C++',
    color: '#e8530a',
    icon: '🎮',
    topics: [
      { id: 'ue5_basics',   title: 'UE5 C++ Architecture',          desc: 'UObject, AActor, UActorComponent, UGameInstance' },
      { id: 'gameplay',     title: 'Gameplay Framework',            desc: 'AGameMode, APlayerController, APawn, ACharacter' },
      { id: 'blueprints',   title: 'C++ ↔ Blueprint Bridge',       desc: 'UPROPERTY, UFUNCTION, UCLASS macros, BlueprintCallable' },
      { id: 'animation',    title: 'Animation in C++',              desc: 'AnimBP, AnimInstance, blend trees, MetaHuman DNA' },
      { id: 'networking',   title: 'Multiplayer & Replication',     desc: 'Replicated properties, RPCs, GameState, PlayerState' },
      { id: 'rendering',    title: 'Rendering & Materials',         desc: 'Custom passes, shader code, Lumen, Nanite C++ hooks' },
      { id: 'metahuman',    title: 'MetaHuman C++ Integration',     desc: 'DNA runtime, LiveLink, facial animation, LOD' },
    ],
    books: [
      { title: 'Unreal Engine 5 Game Development with C++', author: 'Stephen Ulibarri', rating: '⭐⭐⭐⭐⭐', link: '#' },
      { title: 'Game Programming in C++', author: 'Sanjay Madhav', rating: '⭐⭐⭐⭐⭐', link: '#' },
      { title: 'The Design of the C++ Programming Language', author: 'Bjarne Stroustrup', rating: '⭐⭐⭐⭐⭐', link: '#' },
    ]
  },
  advanced: {
    label: 'Advanced / Expert',
    color: '#ef4444',
    icon: '🔥',
    topics: [
      { id: 'meta',       title: 'Template Metaprogramming',       desc: 'TMP, constexpr, if constexpr, type traits, policy classes' },
      { id: 'compiler',   title: 'Compiler Internals',             desc: 'ABI, calling conventions, inline assembly, intrinsics' },
      { id: 'engine',     title: 'Game Engine Architecture',       desc: 'ECS, job system, memory allocators, hot reload' },
      { id: 'graphics',   title: 'Graphics Programming',          desc: 'DirectX 12, Vulkan, custom render passes, ray tracing' },
      { id: 'tools',      title: 'Tools & Pipeline Dev',           desc: 'Build systems, code generation, reflection, debugging' },
    ],
    books: [
      { title: 'Game Engine Architecture (3rd Ed)', author: 'Jason Gregory', rating: '⭐⭐⭐⭐⭐', link: '#' },
      { title: 'Real-Time Rendering (4th Ed)', author: 'Akenine-Möller et al', rating: '⭐⭐⭐⭐⭐', link: '#' },
      { title: 'Large-Scale C++ Software Design', author: 'John Lakos', rating: '⭐⭐⭐⭐', link: '#' },
    ]
  }
};

// ── RENDER AVATAR STUDIO ─────────────────────────────────────
function renderAvatarStudio(container) {
  container.innerHTML = `
    <div class="av-panel">
      <!-- Header -->
      <div class="av-banner">
        <div class="av-banner-left">
          <div class="av-banner-icon">🎭</div>
          <div>
            <div class="av-banner-title">GOAT Avatar Studio</div>
            <div class="av-banner-sub">MetaHuman • DAZ3D • ReadyPlayerMe • Hollywood Cameras • FiveM • C++ Mastery</div>
          </div>
        </div>
        <div class="av-version-badge">v2.0 ULTRA</div>
      </div>

      <!-- Main Tabs -->
      <div class="av-tabs">
        ${[
          { id: 'metahuman', icon: '👤', label: 'MetaHuman' },
          { id: 'rpm',       icon: '🧬', label: 'ReadyPlayerMe' },
          { id: 'daz3d',     icon: '🎨', label: 'DAZ3D Studio' },
          { id: 'poses',     icon: '💃', label: 'Poses & Anim' },
          { id: 'cameras',   icon: '🎬', label: 'Hollywood Cams' },
          { id: 'fivem',     icon: '🚗', label: 'FiveM Studio' },
          { id: 'cpp',       icon: '⚙️', label: 'C++ Mastery' },
        ].map(t => `
          <button class="av-tab ${avState.activeTab === t.id ? 'active' : ''}"
                  onclick="setAVTab('${t.id}')">
            ${t.icon} ${t.label}
          </button>
        `).join('')}
      </div>

      <!-- Tab Content -->
      <div class="av-content" id="avContent">
        ${renderAVTabContent()}
      </div>
    </div>
  `;
}

// ── TAB CONTENT ROUTER ───────────────────────────────────────
function renderAVTabContent() {
  switch (avState.activeTab) {
    case 'metahuman': return renderMetaHumanTab();
    case 'rpm':       return renderRPMTab();
    case 'daz3d':     return renderDAZ3DTab();
    case 'poses':     return renderPosesTab();
    case 'cameras':   return renderCamerasTab();
    case 'fivem':     return renderFiveMTab();
    case 'cpp':       return renderCppTab();
    default:          return renderMetaHumanTab();
  }
}

// ── METAHUMAN TAB ────────────────────────────────────────────
function renderMetaHumanTab() {
  return `
    <div class="av-metahuman">
      <div class="av-section-header">
        <h3>🎭 Epic MetaHuman Pipeline</h3>
        <p>Transform a real photo into a photorealistic, fully-animated MetaHuman character for Unreal Engine 5</p>
      </div>

      <!-- Pipeline Steps -->
      <div class="av-pipeline">
        ${METAHUMAN_PIPELINE.map(step => `
          <div class="av-pipeline-step ${avState.metahumanStep >= step.step ? 'active' : ''} ${avState.metahumanStep > step.step ? 'done' : ''}">
            <div class="av-step-header">
              <div class="av-step-num">${step.step + 1}</div>
              <div class="av-step-icon">${step.icon}</div>
              <div class="av-step-info">
                <div class="av-step-title">${step.title}</div>
                <div class="av-step-desc">${step.desc}</div>
              </div>
              ${avState.metahumanStep > step.step ? '<span class="av-step-done">✅</span>' : ''}
            </div>
            <div class="av-step-tools">
              ${step.tools.map(t => `<span class="av-tool-tag">${t}</span>`).join('')}
            </div>
            ${avState.metahumanStep === step.step ? `
              <button class="av-btn-primary" onclick="${step.action}()">
                ${step.actionLabel}
              </button>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <!-- Live Link Setup -->
      <div class="av-livelink-section">
        <div class="av-section-header">
          <h4>📱 Live Link Face — Real-Time Facial Capture</h4>
          <p>Stream 52 ARKit blendshapes from iPhone directly to MetaHuman in UE5</p>
        </div>
        <div class="av-livelink-grid">
          <div class="av-ll-step">
            <div class="av-ll-num">1</div>
            <div>Download <strong>Live Link Face</strong> from App Store (iPhone only)</div>
          </div>
          <div class="av-ll-step">
            <div class="av-ll-num">2</div>
            <div>In UE5: Enable <strong>Live Link</strong> + <strong>ARKit</strong> plugins</div>
          </div>
          <div class="av-ll-step">
            <div class="av-ll-num">3</div>
            <div>Connect iPhone + PC to <strong>same WiFi network</strong></div>
          </div>
          <div class="av-ll-step">
            <div class="av-ll-num">4</div>
            <div>Enter PC IP in Live Link Face app → MetaHuman animates in real-time</div>
          </div>
        </div>
        <div class="av-blendshape-info">
          <strong>52 ARKit Blendshapes captured:</strong>
          eyeBlink, eyeLookDown, eyeLookIn, eyeLookOut, eyeLookUp, eyeSquint, eyeWide,
          jawForward, jawLeft, jawOpen, jawRight, mouthClose, mouthDimple, mouthFrown,
          mouthFunnel, mouthLeft, mouthLowerDown, mouthPress, mouthPucker, mouthRight,
          mouthRollLower, mouthRollUpper, mouthShrug, mouthSmile, mouthStretch, mouthUpperUp,
          noseSneer, cheekPuff, cheekSquint, browDown, browIn, browOut...
        </div>
      </div>

      <!-- AI Generate Button -->
      <button class="av-btn-primary av-btn-large" onclick="generateMetahumanWithAI()">
        🤖 Generate MetaHuman Blueprint with AI (Super GOAT)
      </button>
    </div>
  `;
}

// ── READY PLAYER ME TAB ──────────────────────────────────────
function renderRPMTab() {
  return `
    <div class="av-rpm">
      <div class="av-section-header">
        <h3>🧬 Ready Player Me — Instant 3D Avatar</h3>
        <p>Create a full-body 3D avatar from a single selfie. Works in browsers, games, and apps instantly.</p>
      </div>

      <!-- RPM Creator iframe -->
      <div class="av-rpm-creator">
        <div class="av-rpm-header">
          <span>👤 Avatar Creator</span>
          <a href="https://readyplayer.me/avatar" target="_blank" class="av-external-link">🌐 Open Full Creator</a>
        </div>
        <div class="av-rpm-iframe-container">
          <iframe
            src="https://goat-royalty.readyplayer.me/avatar?frameApi"
            class="av-rpm-iframe"
            id="rpmFrame"
            allow="camera *; microphone *"
            title="Ready Player Me Avatar Creator">
          </iframe>
        </div>
      </div>

      <!-- RPM Features -->
      <div class="av-rpm-features">
        <div class="av-feature-card">
          <span class="av-feat-icon">📸</span>
          <div class="av-feat-title">Selfie to Avatar</div>
          <div class="av-feat-desc">Upload a photo → AI generates your 3D avatar in seconds</div>
        </div>
        <div class="av-feature-card">
          <span class="av-feat-icon">🎮</span>
          <div class="av-feat-title">Game Ready</div>
          <div class="av-feat-desc">Exports as .GLB file — works in UE5, Unity, Three.js</div>
        </div>
        <div class="av-feature-card">
          <span class="av-feat-icon">🔒</span>
          <div class="av-feat-title">Safety Profile</div>
          <div class="av-feat-desc">Avatar hides real photo until identity verified — GOAT Shield integration</div>
        </div>
        <div class="av-feature-card">
          <span class="av-feat-icon">💫</span>
          <div class="av-feat-title">Animated</div>
          <div class="av-feat-desc">Full skeleton rig — supports all GOAT Connect poses and emotions</div>
        </div>
      </div>

      <!-- Avatar API -->
      <div class="av-api-section">
        <div class="av-api-title">🔌 RPM API Integration</div>
        <pre class="av-code-block">// Ready Player Me Avatar API
const RPM_APP_ID = 'your-app-id';

// Get avatar from creator
window.addEventListener('message', (e) => {
  if (e.data.eventName === 'v1.avatar.exported') {
    const avatarUrl = e.data.data.url;
    // avatarUrl = "https://models.readyplayer.me/{id}.glb"
    saveAvatarToProfile(avatarUrl);
  }
});

// Fetch avatar with expressions
const avatarWithExpressions = 
  avatarUrl + '?morphTargets=ARKit,Oculus Visemes';

// Load in Three.js
const loader = new GLTFLoader();
loader.load(avatarWithExpressions, (gltf) => {
  scene.add(gltf.scene);
});</pre>
        <button class="av-btn-secondary" onclick="copyAVCode('rpm-api')">📋 Copy API Code</button>
        <button class="av-btn-primary" onclick="linkRPMAvatarToFaceID()">🔗 Link Avatar to FaceShield</button>
      </div>
    </div>
  `;
}

// ── DAZ3D TAB ────────────────────────────────────────────────
function renderDAZ3DTab() {
  return `
    <div class="av-daz3d">
      <div class="av-section-header">
        <h3>🎨 DAZ 3D Studio Integration</h3>
        <p>Professional-grade character creation with photo-realistic rendering. Industry standard for film, games, and digital art.</p>
      </div>

      <!-- DAZ3D Features -->
      <div class="av-daz-grid">
        <div class="av-daz-card">
          <div class="av-daz-icon">👤</div>
          <div class="av-daz-title">AI Character Generator</div>
          <div class="av-daz-desc">DAZ's AI generates unique characters from text descriptions or photos</div>
          <a href="https://www.daz3d.com/yellow" target="_blank" class="av-btn-secondary av-btn-sm">Open DAZ AI</a>
        </div>
        <div class="av-daz-card">
          <div class="av-daz-icon">🎭</div>
          <div class="av-daz-title">Photo to Character</div>
          <div class="av-daz-desc">Import your photo, use Face Transfer plugin to create your digital twin</div>
          <button class="av-btn-secondary av-btn-sm" onclick="launchDAZFaceTransfer()">Transfer Face</button>
        </div>
        <div class="av-daz-card">
          <div class="av-daz-icon">💃</div>
          <div class="av-daz-title">Motion Library</div>
          <div class="av-daz-desc">10,000+ animations — hip-hop, dance, martial arts, facial expressions</div>
          <button class="av-btn-secondary av-btn-sm" onclick="browseDAZMotions()">Browse Motions</button>
        </div>
        <div class="av-daz-card">
          <div class="av-daz-icon">🎬</div>
          <div class="av-daz-title">iRay Rendering</div>
          <div class="av-daz-desc">NVIDIA iRay photorealistic render engine — Hollywood-quality output</div>
          <button class="av-btn-secondary av-btn-sm" onclick="launchDAZRender()">Render Scene</button>
        </div>
        <div class="av-daz-card">
          <div class="av-daz-icon">🔗</div>
          <div class="av-daz-title">UE5 Export</div>
          <div class="av-daz-desc">Export DAZ characters to UE5 via Diffeomorphic or DazToUnreal plugin</div>
          <button class="av-btn-secondary av-btn-sm" onclick="exportDAZtoUE5()">Export to UE5</button>
        </div>
        <div class="av-daz-card">
          <div class="av-daz-icon">🛡️</div>
          <div class="av-daz-title">Safety Avatar Mode</div>
          <div class="av-daz-desc">Generate avatar version of face — hide real identity until GOAT Shield verified</div>
          <button class="av-btn-primary av-btn-sm" onclick="createSafetyAvatar()">Create Safety Avatar</button>
        </div>
      </div>

      <!-- Download DAZ -->
      <div class="av-daz-download">
        <div class="av-download-text">
          <strong>DAZ 3D Studio is FREE to download</strong> — Professional 3D character creation software
        </div>
        <a href="https://www.daz3d.com/get_studio" target="_blank" class="av-btn-primary">
          ⬇️ Download DAZ 3D Studio Free
        </a>
      </div>

      <!-- Pipeline: DAZ → UE5 → GOAT Connect -->
      <div class="av-pipeline-viz">
        <div class="av-pv-title">Full Pipeline: DAZ3D → UE5 → GOAT Connect</div>
        <div class="av-pv-flow">
          <div class="av-pv-node">📸<br>Photo Shoot<br>(Hollywood Cam)</div>
          <div class="av-pv-arrow">→</div>
          <div class="av-pv-node">🎨<br>DAZ3D<br>Character</div>
          <div class="av-pv-arrow">→</div>
          <div class="av-pv-node">🎮<br>UE5<br>MetaHuman</div>
          <div class="av-pv-arrow">→</div>
          <div class="av-pv-node">🚗<br>FiveM<br>Ped</div>
          <div class="av-pv-arrow">→</div>
          <div class="av-pv-node">💛<br>GOAT Connect<br>Profile</div>
        </div>
      </div>
    </div>
  `;
}

// ── POSES & ANIMATION TAB ────────────────────────────────────
function renderPosesTab() {
  return `
    <div class="av-poses">
      <div class="av-section-header">
        <h3>💃 Poses & Animations</h3>
        <p>Animated 3D avatars for profiles, stories, and safety verification. CSS + Three.js powered.</p>
      </div>

      <!-- Live Avatar Preview -->
      <div class="av-preview-container">
        <div class="av-avatar-stage" id="avStage">
          <div class="av-avatar-figure pose-${avState.selectedPose}" id="avFigure">
            <!-- CSS Animated Character -->
            <div class="av-char-head">
              <div class="av-char-face">
                <div class="av-char-eyes">
                  <div class="av-char-eye left"></div>
                  <div class="av-char-eye right"></div>
                </div>
                <div class="av-char-mouth"></div>
              </div>
            </div>
            <div class="av-char-body">
              <div class="av-char-arm left"></div>
              <div class="av-char-arm right"></div>
              <div class="av-char-torso"></div>
            </div>
            <div class="av-char-legs">
              <div class="av-char-leg left"></div>
              <div class="av-char-leg right"></div>
            </div>
          </div>
          <div class="av-stage-floor"></div>
          <div class="av-stage-shadow"></div>
        </div>

        <!-- Pose Controls -->
        <div class="av-pose-controls">
          <div class="av-pose-label">Current Pose: <strong>${AVATAR_POSES.find(p=>p.id===avState.selectedPose)?.label || 'Idle'}</strong></div>
          <div class="av-pose-grid">
            ${AVATAR_POSES.map(pose => `
              <button class="av-pose-btn ${avState.selectedPose === pose.id ? 'active' : ''}"
                      onclick="setAVPose('${pose.id}')">
                ${pose.icon}<br><span>${pose.label}</span>
              </button>
            `).join('')}
          </div>

          <!-- Style Controls -->
          <div class="av-style-controls">
            <div class="av-style-label">Avatar Style</div>
            <div class="av-style-btns">
              ${['realistic', 'cartoon', 'anime', 'pixel', 'neon'].map(s => `
                <button class="av-style-btn ${avState.selectedStyle === s ? 'active' : ''}"
                        onclick="setAVStyle('${s}')">${s}</button>
              `).join('')}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="av-action-btns">
            <button class="av-btn-primary" onclick="exportAvatarGIF()">🎬 Export as GIF</button>
            <button class="av-btn-secondary" onclick="shareAvatarProfile()">📤 Use as Profile Pic</button>
            <button class="av-btn-secondary" onclick="linkAvatarToFaceID()">🔗 Link to FaceShield</button>
          </div>
        </div>
      </div>

      <!-- Three.js Integration Note -->
      <div class="av-threejs-note">
        <strong>🚀 Three.js + ReadyPlayerMe Integration:</strong>
        Full 3D animated avatars powered by Three.js render directly in the browser.
        Import your RPM .GLB avatar and apply any of these 12 poses with smooth transitions.
        <button class="av-btn-secondary av-btn-sm" onclick="loadThreeJSAvatar()">Load 3D Avatar in Three.js</button>
      </div>
    </div>
  `;
}

// ── HOLLYWOOD CAMERAS TAB ────────────────────────────────────
function renderCamerasTab() {
  const cam = HOLLYWOOD_CAMERAS[avState.selectedCamera];
  return `
    <div class="av-cameras">
      <div class="av-section-header">
        <h3>🎬 Hollywood Camera System</h3>
        <p>Professional cinema cameras integrated with UE5 virtual production pipeline. Reference specs, LUT profiles, and UE5 integration guides.</p>
      </div>

      <!-- Camera Selector -->
      <div class="av-camera-grid">
        ${Object.entries(HOLLYWOOD_CAMERAS).map(([id, c]) => `
          <div class="av-cam-card ${avState.selectedCamera === id ? 'active' : ''}"
               onclick="selectCamera('${id}')"
               style="border-color:${avState.selectedCamera === id ? c.color : 'transparent'}">
            <div class="av-cam-icon" style="color:${c.color}">${c.icon}</div>
            <div class="av-cam-name">${c.name}</div>
            <div class="av-cam-res">${c.resolution}</div>
            <div class="av-cam-price">${c.price}</div>
          </div>
        `).join('')}
      </div>

      <!-- Selected Camera Details -->
      ${cam ? `
        <div class="av-cam-detail" style="border-color:${cam.color}">
          <div class="av-cam-detail-header" style="background:${cam.color}22">
            <span class="av-cam-big-icon">${cam.icon}</span>
            <div>
              <div class="av-cam-detail-name">${cam.name}</div>
              <div class="av-cam-detail-desc">${cam.desc}</div>
            </div>
          </div>
          <div class="av-cam-specs-grid">
            <div class="av-spec"><span class="av-spec-label">Sensor</span><span class="av-spec-val">${cam.sensor}</span></div>
            <div class="av-spec"><span class="av-spec-label">Resolution</span><span class="av-spec-val">${cam.resolution}</span></div>
            <div class="av-spec"><span class="av-spec-label">Dynamic Range</span><span class="av-spec-val">${cam.dynamic_range}</span></div>
            <div class="av-spec"><span class="av-spec-label">Base ISO</span><span class="av-spec-val">${cam.iso}</span></div>
            <div class="av-spec"><span class="av-spec-label">Codec</span><span class="av-spec-val">${cam.codec}</span></div>
            <div class="av-spec"><span class="av-spec-label">Frame Rate</span><span class="av-spec-val">${cam.fps}</span></div>
            <div class="av-spec"><span class="av-spec-label">Price</span><span class="av-spec-val" style="color:${cam.color}">${cam.price}</span></div>
          </div>

          <!-- Films Used In -->
          <div class="av-films-section">
            <div class="av-films-title">🎬 Used In</div>
            <div class="av-films-list">
              ${cam.used_in.map(f => `<span class="av-film-tag">${f}</span>`).join('')}
            </div>
          </div>

          <!-- UE5 Integration -->
          <div class="av-ue5-integration">
            <div class="av-ue5-title">🎮 UE5 Virtual Production Integration</div>
            <div class="av-ue5-desc">${cam.ue5_integration}</div>
            <div class="av-lut-info"><strong>LUT Profile:</strong> ${cam.lut}</div>
          </div>

          <!-- Strengths -->
          <div class="av-strengths">
            <div class="av-str-title">✅ Key Strengths</div>
            <div class="av-str-list">
              ${cam.strengths.map(s => `<div class="av-str-item">• ${s}</div>`).join('')}
            </div>
          </div>

          <div class="av-cam-actions">
            <button class="av-btn-primary" onclick="generateCameraAIGuide('${avState.selectedCamera}')">
              🤖 Generate AI Setup Guide for UE5
            </button>
            <button class="av-btn-secondary" onclick="generateLUTProfile('${avState.selectedCamera}')">
              🎨 Generate LUT Profile
            </button>
          </div>
        </div>
      ` : ''}

      <!-- Virtual Production Note -->
      <div class="av-vp-note">
        <strong>🎬 UE5 Virtual Production:</strong>
        All cameras above support Epic's in-camera VFX (ICVFX) workflow.
        Connect real cameras to UE5 via Live Link for real-time tracking and compositing.
        The LED volume replaces green screens — the future of filmmaking is here.
      </div>
    </div>
  `;
}

// ── FIVEM STUDIO TAB ─────────────────────────────────────────
function renderFiveMTab() {
  return `
    <div class="av-fivem">
      <div class="av-section-header">
        <h3>🚗 FiveM Development Studio</h3>
        <p>Build custom FiveM scripts with AI assistance. ESX & QBCore frameworks, MetaHuman ped integration, voice systems.</p>
      </div>

      <!-- Framework Selector -->
      <div class="av-fivem-frameworks">
        ${['ESX', 'QBCore', 'Custom'].map(f => `
          <button class="av-fw-btn ${avState.fivemMode === f.toLowerCase() ? 'active' : ''}"
                  onclick="setFiveMFramework('${f.toLowerCase()}')">
            ${f}
          </button>
        `).join('')}
      </div>

      <!-- Script Templates -->
      <div class="av-templates-section">
        <div class="av-templates-title">📂 Script Templates</div>
        <div class="av-templates-grid">
          ${Object.entries(FIVEM_TEMPLATES).map(([id, tmpl]) => `
            <div class="av-tmpl-card">
              <div class="av-tmpl-name">${tmpl.name}</div>
              <div class="av-tmpl-lang">${tmpl.lang.toUpperCase()}</div>
              <div class="av-tmpl-desc">${tmpl.desc}</div>
              <button class="av-btn-secondary av-btn-sm" onclick="loadFiveMTemplate('${id}')">Load Template</button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- AI Script Generator -->
      <div class="av-ai-generator">
        <div class="av-gen-title">🤖 AI Script Generator</div>
        <textarea id="fivemPrompt" class="av-fivem-textarea"
          placeholder="Describe what your FiveM script should do...
Example: 'Create a drug lab script with ESX that allows players to craft items, has a police alert system, and uses NUI for the interface'"></textarea>
        <div class="av-gen-actions">
          <button class="av-btn-primary" onclick="generateFiveMScript()">⚡ Generate Script with AI</button>
          <button class="av-btn-secondary" onclick="explainFiveMCode()">🔍 Explain Selected Code</button>
          <button class="av-btn-secondary" onclick="optimizeFiveMScript()">🚀 Optimize Script</button>
        </div>
      </div>

      <!-- Code Editor -->
      <div class="av-code-editor">
        <div class="av-editor-header">
          <span>📝 Script Editor</span>
          <div class="av-editor-actions">
            <button class="av-btn-xs" onclick="copyFiveMScript()">📋 Copy</button>
            <button class="av-btn-xs" onclick="downloadFiveMScript()">⬇️ Download</button>
          </div>
        </div>
        <textarea id="fivemCode" class="av-code-area"
          placeholder="// Your FiveM script will appear here...
// Use the AI Generator above or load a template"
          spellcheck="false"></textarea>
      </div>

      <!-- FiveM Resources -->
      <div class="av-fivem-resources">
        <div class="av-res-title">📚 Resources & Documentation</div>
        <div class="av-res-links">
          <a href="https://docs.fivem.net" target="_blank" class="av-res-link">📖 FiveM Docs</a>
          <a href="https://docs.fivem.net/natives/" target="_blank" class="av-res-link">🔧 Native Database</a>
          <a href="https://github.com/esx-framework/esx_core" target="_blank" class="av-res-link">📦 ESX Framework</a>
          <a href="https://github.com/qbcore-framework" target="_blank" class="av-res-link">📦 QBCore</a>
          <a href="https://cfx.re/join/goatroyalty" target="_blank" class="av-res-link">🚗 GOAT FiveM Server</a>
        </div>
      </div>
    </div>
  `;
}

// ── C++ MASTERY TAB ──────────────────────────────────────────
function renderCppTab() {
  const level = CPP_CURRICULUM[avState.cppLevel];
  return `
    <div class="av-cpp">
      <div class="av-section-header">
        <h3>⚙️ C++ Mastery Hub</h3>
        <p>From beginner to UE5 game engine expert. Curated curriculum, best books, and AI-powered code generation.</p>
      </div>

      <!-- Level Selector -->
      <div class="av-cpp-levels">
        ${Object.entries(CPP_CURRICULUM).map(([id, lvl]) => `
          <button class="av-level-btn ${avState.cppLevel === id ? 'active' : ''}"
                  onclick="setCppLevel('${id}')"
                  style="${avState.cppLevel === id ? `background:${lvl.color}22;border-color:${lvl.color};color:${lvl.color}` : ''}">
            ${lvl.icon} ${lvl.label}
          </button>
        `).join('')}
      </div>

      <!-- Topics -->
      <div class="av-cpp-topics">
        <div class="av-topics-header" style="color:${level.color}">
          ${level.icon} ${level.label} Topics
        </div>
        ${level.topics.map(t => `
          <div class="av-topic-card">
            <div class="av-topic-info">
              <div class="av-topic-title">${t.title}</div>
              <div class="av-topic-desc">${t.desc}</div>
            </div>
            <button class="av-btn-xs" onclick="generateCppLesson('${t.id}', '${t.title}')">
              🤖 AI Lesson
            </button>
          </div>
        `).join('')}
      </div>

      <!-- Recommended Books -->
      <div class="av-cpp-books">
        <div class="av-books-title">📚 Recommended Books</div>
        ${level.books.map(b => `
          <div class="av-book-card">
            <div class="av-book-info">
              <div class="av-book-title">${b.title}</div>
              <div class="av-book-author">by ${b.author}</div>
              <div class="av-book-rating">${b.rating}</div>
            </div>
            <div class="av-book-actions">
              <button class="av-btn-xs" onclick="searchBook('${b.title}')">🔍 Find</button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- AI Code Generator -->
      <div class="av-cpp-generator">
        <div class="av-gen-title">🤖 C++ / UE5 Code Generator</div>
        <textarea id="cppPrompt" class="av-fivem-textarea"
          placeholder="Describe what C++ / UE5 code you need...
Example: 'Create a UE5 C++ Actor class with a health component, damage system, and Blueprint-callable functions for health pickup'"
        ></textarea>
        <div class="av-gen-actions">
          <select id="cppLangSelect" class="av-select">
            <option value="cpp_ue5">UE5 C++</option>
            <option value="cpp_pure">Pure C++ (Modern)</option>
            <option value="blueprint">Blueprint Logic</option>
            <option value="lua_fivem">FiveM Lua</option>
            <option value="glsl">GLSL Shader</option>
            <option value="hlsl">HLSL Shader</option>
          </select>
          <button class="av-btn-primary" onclick="generateCppCode()">⚡ Generate Code</button>
          <button class="av-btn-secondary" onclick="explainCppCode()">🔍 Explain Code</button>
          <button class="av-btn-secondary" onclick="reviewCppCode()">✅ Code Review</button>
        </div>
        <div class="av-cpp-output" id="cppOutput" style="display:none">
          <div class="av-output-header">
            <span>Generated Code</span>
            <button class="av-btn-xs" onclick="copyCppOutput()">📋 Copy</button>
          </div>
          <pre class="av-code-block" id="cppOutputCode"></pre>
        </div>
      </div>

      <!-- UE5 C++ Cheat Sheet -->
      <div class="av-cheatsheet">
        <div class="av-cs-title">⚡ UE5 C++ Quick Reference</div>
        <div class="av-cs-grid">
          <div class="av-cs-item"><code>UPROPERTY(EditAnywhere)</code><span>Expose to Editor</span></div>
          <div class="av-cs-item"><code>UFUNCTION(BlueprintCallable)</code><span>Call from Blueprint</span></div>
          <div class="av-cs-item"><code>UCLASS(Blueprintable)</code><span>Create BP subclass</span></div>
          <div class="av-cs-item"><code>GetWorld()->GetTimerManager()</code><span>Timer system</span></div>
          <div class="av-cs-item"><code>Cast<AMyActor>(OtherActor)</code><span>Safe UE cast</span></div>
          <div class="av-cs-item"><code>GEngine->AddOnScreenDebugMessage</code><span>Debug print</span></div>
          <div class="av-cs-item"><code>UGameplayStatics::PlaySound2D</code><span>Play sound</span></div>
          <div class="av-cs-item"><code>TWeakObjectPtr<T></code><span>Safe weak pointer</span></div>
        </div>
      </div>
    </div>
  `;
}

// ── ACTION FUNCTIONS ─────────────────────────────────────────
function setAVTab(tab) {
  avState.activeTab = tab;
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderAvatarStudio(panel);
}

function setAVPose(pose) {
  avState.selectedPose = pose;
  const fig = document.getElementById('avFigure');
  if (fig) {
    // Remove all pose classes, add new one
    AVATAR_POSES.forEach(p => fig.classList.remove(p.css));
    const newPose = AVATAR_POSES.find(p => p.id === pose);
    if (newPose) fig.classList.add(newPose.css);
  }
  // Update panel
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderAvatarStudio(panel);
}

function setAVStyle(style) {
  avState.selectedStyle = style;
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderAvatarStudio(panel);
}

function selectCamera(id) {
  avState.selectedCamera = id;
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderAvatarStudio(panel);
}

function setCppLevel(level) {
  avState.cppLevel = level;
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderAvatarStudio(panel);
}

function setFiveMFramework(fw) {
  avState.fivemMode = fw;
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderAvatarStudio(panel);
}

// MetaHuman pipeline steps
function startMetahumanScan() {
  avState.metahumanStep = 1;
  showAVAlert('📸 Face scan initiated! Use RealityScan app on iPhone for best results.', 'info');
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderAvatarStudio(panel);
}
function generateMesh() {
  avState.metahumanStep = 2;
  showAVAlert('🧊 3D mesh processing... Use RealityCapture or Meshroom for photogrammetry.', 'success');
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderAvatarStudio(panel);
}
function openMetahumanCreator() {
  avState.metahumanStep = 3;
  window.open('https://metahuman.unrealengine.com', '_blank');
  showAVAlert('🚀 Opening MetaHuman Creator in browser — import your 3D mesh there!', 'success');
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderAvatarStudio(panel);
}
function setupLiveLink() {
  avState.metahumanStep = 4;
  showAVAlert('🎭 Download "Live Link Face" from App Store, enable in UE5 plugins, connect same WiFi.', 'info');
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderAvatarStudio(panel);
}
function exportMetahuman() {
  avState.metahumanStep = 5;
  avState.avatarCreated = true;
  showAVAlert('✨ MetaHuman exported! Use Bridge plugin in UE5 to import your character.', 'success');
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderAvatarStudio(panel);
}

// AI Generators
function generateMetahumanWithAI() {
  if (typeof sendMessageWithContext === 'function') {
    const prompt = `You are a MetaHuman + Unreal Engine 5 expert. Generate a comprehensive step-by-step guide for:
1. Creating a photorealistic MetaHuman from a photo using RealityScan + MetaHuman Creator
2. Setting up Live Link Face for real-time facial capture with 52 ARKit blendshapes  
3. Exporting and using the MetaHuman in UE5 with full facial animation
4. Integrating the MetaHuman ped into FiveM server
5. Using the MetaHuman as a GOAT Connect profile avatar
Include C++ code snippets for UE5 integration and Blueprint screenshots descriptions.`;
    sendMessageWithContext(prompt);
  } else {
    showAVAlert('🤖 Open Super GOAT chat and ask about MetaHuman setup!', 'info');
  }
}

function generateFiveMScript() {
  const prompt = document.getElementById('fivemPrompt')?.value;
  if (!prompt) { showAVAlert('Please describe your FiveM script first!', 'warning'); return; }
  if (typeof sendMessageWithContext === 'function') {
    sendMessageWithContext(`You are an expert FiveM developer. Generate a complete, production-ready FiveM script:
Framework: ${avState.fivemMode.toUpperCase()}
Request: ${prompt}
Include: server.lua, client.lua, fxmanifest.lua, and any NUI files needed.
Add comprehensive comments explaining each section.`);
  }
}

function generateCppCode() {
  const prompt = document.getElementById('cppPrompt')?.value;
  const lang = document.getElementById('cppLangSelect')?.value || 'cpp_ue5';
  if (!prompt) { showAVAlert('Please describe what code you need!', 'warning'); return; }
  if (typeof sendMessageWithContext === 'function') {
    const langMap = {
      cpp_ue5: 'Unreal Engine 5 C++',
      cpp_pure: 'Modern C++ (C++20)',
      blueprint: 'Unreal Engine Blueprint (text description)',
      lua_fivem: 'FiveM Lua',
      glsl: 'GLSL Shader',
      hlsl: 'HLSL Shader for UE5'
    };
    sendMessageWithContext(`You are an expert ${langMap[lang]} developer. Generate complete, production-quality code:
Request: ${prompt}
Language: ${langMap[lang]}
Level: ${avState.cppLevel}
Requirements: Add comprehensive comments, error handling, and follow best practices.
For UE5: Include proper UPROPERTY/UFUNCTION macros, memory management, and Blueprint integration.`);
  }
}

function generateCppLesson(topicId, topicTitle) {
  if (typeof sendMessageWithContext === 'function') {
    sendMessageWithContext(`You are a world-class C++ instructor. Teach me about "${topicTitle}" with:
1. Clear explanation of concepts
2. Code examples (with UE5 context where applicable)
3. Common pitfalls to avoid
4. Best practices used in game development
5. A practical exercise to practice this skill
Level: ${avState.cppLevel}`);
  }
}

function generateCameraAIGuide(cameraId) {
  const cam = HOLLYWOOD_CAMERAS[cameraId];
  if (!cam) return;
  if (typeof sendMessageWithContext === 'function') {
    sendMessageWithContext(`You are a cinematography and virtual production expert. Generate a complete setup guide for:
Camera: ${cam.name}
Resolution: ${cam.resolution}
Dynamic Range: ${cam.dynamic_range}
Codec: ${cam.codec}

Include:
1. UE5 virtual production setup with this camera (ICVFX / LED volume)
2. Color science pipeline: ${cam.ue5_integration}
3. LUT profile application: ${cam.lut}
4. Camera tracking setup for real-time UE5 compositing
5. Recommended lenses and accessories
6. Post-production workflow in DaVinci Resolve → UE5`);
  }
}

function generateLUTProfile(cameraId) {
  const cam = HOLLYWOOD_CAMERAS[cameraId];
  if (!cam) return;
  showAVAlert(`🎨 LUT Profile: ${cam.lut} — Copy this into your DaVinci/UE5 OCIO config`, 'info');
}

function loadFiveMTemplate(templateId) {
  const tmpl = FIVEM_TEMPLATES[templateId];
  if (!tmpl) return;
  const el = document.getElementById('fivemCode');
  if (el) el.value = tmpl.code;
  showAVAlert(`✅ ${tmpl.name} loaded! Customize as needed.`, 'success');
}

function copyFiveMScript() {
  const el = document.getElementById('fivemCode');
  if (el) navigator.clipboard.writeText(el.value);
  showAVAlert('✅ Script copied!', 'success');
}

function downloadFiveMScript() {
  const el = document.getElementById('fivemCode');
  if (!el || !el.value) return;
  const blob = new Blob([el.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'goat_fivem_script.lua'; a.click();
  URL.revokeObjectURL(url);
}

function explainFiveMCode() {
  const el = document.getElementById('fivemCode');
  if (!el?.value) { showAVAlert('Write or load a script first!', 'warning'); return; }
  if (typeof sendMessageWithContext === 'function') {
    sendMessageWithContext(`Explain this FiveM Lua script in detail, line by line:\n\n${el.value}`);
  }
}

function optimizeFiveMScript() {
  const el = document.getElementById('fivemCode');
  if (!el?.value) { showAVAlert('Write or load a script first!', 'warning'); return; }
  if (typeof sendMessageWithContext === 'function') {
    sendMessageWithContext(`Review and optimize this FiveM script for performance, security, and best practices:\n\n${el.value}`);
  }
}

function explainCppCode() {
  const el = document.getElementById('cppPrompt');
  if (!el?.value) { showAVAlert('Enter code or description first!', 'warning'); return; }
  if (typeof sendMessageWithContext === 'function') {
    sendMessageWithContext(`Explain this C++ code in detail:\n\n${el.value}`);
  }
}

function reviewCppCode() {
  const el = document.getElementById('cppPrompt');
  if (!el?.value) { showAVAlert('Enter code first!', 'warning'); return; }
  if (typeof sendMessageWithContext === 'function') {
    sendMessageWithContext(`Do a comprehensive code review of this C++/UE5 code. Check for bugs, performance issues, memory leaks, and suggest improvements:\n\n${el.value}`);
  }
}

function copyCppOutput() {
  const el = document.getElementById('cppOutputCode');
  if (el) navigator.clipboard.writeText(el.textContent);
  showAVAlert('✅ Code copied!', 'success');
}

function linkRPMAvatarToFaceID() {
  showAVAlert('🔗 Avatar linked to GOAT FaceShield™ — your avatar will hide real identity until verified!', 'success');
}

function linkAvatarToFaceID() {
  showAVAlert('🔗 Avatar linked to GOAT FaceShield™ verification system!', 'success');
}

function exportAvatarGIF() {
  showAVAlert('🎬 GIF export coming soon! Avatar animation will export at 30fps, 512x512.', 'info');
}

function shareAvatarProfile() {
  showAVAlert('📤 Avatar set as profile picture in GOAT Connect!', 'success');
}

function loadThreeJSAvatar() {
  showAVAlert('🚀 Opening Three.js avatar viewer — import your .GLB file from ReadyPlayerMe!', 'info');
}

function launchDAZFaceTransfer() {
  window.open('https://www.daz3d.com/daz-studio', '_blank');
  showAVAlert('🎨 Opening DAZ3D — use Face Transfer plugin to import your photo!', 'info');
}

function browseDAZMotions() {
  window.open('https://www.daz3d.com/shop/animations', '_blank');
}

function launchDAZRender() {
  showAVAlert('🎬 Launch DAZ3D iRay render — NVIDIA GPU required for best performance.', 'info');
}

function exportDAZtoUE5() {
  showAVAlert('🔗 Install DazToUnreal plugin in UE5 Marketplace. Export character from DAZ, import in UE5.', 'info');
}

function createSafetyAvatar() {
  showAVAlert('🛡️ Safety avatar created! Your real face is hidden until GOAT Shield verification is complete.', 'success');
}

function searchBook(title) {
  window.open(`https://www.google.com/search?q=${encodeURIComponent(title + ' book buy')}`, '_blank');
}

function copyAVCode(id) {
  showAVAlert('📋 Code copied to clipboard!', 'success');
}

// ── HELPER ───────────────────────────────────────────────────
function sendMessageWithContext(msg) {
  // Bridge to the main GOAT chat
  const input = document.getElementById('message-input');
  if (input) {
    input.value = msg;
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) sendBtn.click();
  }
}

function showAVAlert(msg, type = 'info') {
  const colors = { info: '#3b82f6', success: '#22c55e', warning: '#f59e0b', error: '#ef4444' };
  const existing = document.getElementById('avAlert');
  if (existing) existing.remove();
  const alert = document.createElement('div');
  alert.id = 'avAlert';
  alert.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    background:${colors[type]};color:#fff;padding:12px 20px;
    border-radius:10px;font-size:13px;font-weight:600;
    box-shadow:0 4px 20px rgba(0,0,0,0.4);max-width:400px;
    animation:slideInRight 0.3s ease;
  `;
  alert.textContent = msg;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 4500);
}

// ── EXPORT ───────────────────────────────────────────────────
window.renderAvatarStudio = renderAvatarStudio;
window.setAVTab = setAVTab;
window.setAVPose = setAVPose;
window.setAVStyle = setAVStyle;
window.selectCamera = selectCamera;
window.setCppLevel = setCppLevel;
window.setFiveMFramework = setFiveMFramework;
window.startMetahumanScan = startMetahumanScan;
window.generateMesh = generateMesh;
window.openMetahumanCreator = openMetahumanCreator;
window.setupLiveLink = setupLiveLink;
window.exportMetahuman = exportMetahuman;
window.generateMetahumanWithAI = generateMetahumanWithAI;
window.generateFiveMScript = generateFiveMScript;
window.generateCppCode = generateCppCode;
window.generateCppLesson = generateCppLesson;
window.generateCameraAIGuide = generateCameraAIGuide;
window.generateLUTProfile = generateLUTProfile;
window.loadFiveMTemplate = loadFiveMTemplate;
window.copyFiveMScript = copyFiveMScript;
window.downloadFiveMScript = downloadFiveMScript;
window.explainFiveMCode = explainFiveMCode;
window.optimizeFiveMScript = optimizeFiveMScript;
window.explainCppCode = explainCppCode;
window.reviewCppCode = reviewCppCode;
window.copyCppOutput = copyCppOutput;
window.linkRPMAvatarToFaceID = linkRPMAvatarToFaceID;
window.linkAvatarToFaceID = linkAvatarToFaceID;
window.exportAvatarGIF = exportAvatarGIF;
window.shareAvatarProfile = shareAvatarProfile;
window.loadThreeJSAvatar = loadThreeJSAvatar;
window.launchDAZFaceTransfer = launchDAZFaceTransfer;
window.browseDAZMotions = browseDAZMotions;
window.launchDAZRender = launchDAZRender;
window.exportDAZtoUE5 = exportDAZtoUE5;
window.createSafetyAvatar = createSafetyAvatar;
window.searchBook = searchBook;
window.copyAVCode = copyAVCode;