// ═══════════════════════════════════════════════════════════════════════════════
// GOAT UE5 Scene Generator — Text-to-Full-Scene Unreal Engine 5 Pipeline
// Lumen • Nanite • MetaHuman • Niagara VFX • World Partition • PCG
// ═══════════════════════════════════════════════════════════════════════════════

const ue5State = {
  activeTab: 'generator',
  sceneType: 'concert',
  quality: 'cinematic',
  generatedScene: null,
  history: [],
  selectedAssets: [],
  livePreviewMode: false
};

// ── Scene Presets ─────────────────────────────────────────────────────────────
const SCENE_PRESETS = [
  {
    id: 'concert_arena',
    name: 'Concert Arena',
    icon: '🎤',
    category: 'music',
    description: 'Full stadium concert with dynamic lighting, crowd simulation, and pyrotechnics',
    thumbnail: '🏟️',
    tags: ['crowd','lighting','pyro','stage','screens'],
    prompt: 'Massive stadium concert arena with 50,000 NPC crowd simulation, dynamic Lumen lighting synced to music beats, pyrotechnic Niagara particle systems, 4K LED stage screens playing music video, fog machine atmospherics, MetaHuman performer on center stage with mocap animations',
    ueFeatures: ['Lumen GI', 'Nanite Crowd', 'Niagara VFX', 'MetaHuman', 'Audio Sync'],
    difficulty: 'advanced',
    estimatedTime: '45 min build'
  },
  {
    id: 'rooftop_sunset',
    name: 'Rooftop Sunset Session',
    icon: '🌇',
    category: 'music',
    description: 'Intimate rooftop performance at golden hour with NYC skyline',
    thumbnail: '🌆',
    tags: ['sunset','rooftop','intimate','atmospheric','city'],
    prompt: 'Rooftop performance venue at golden hour sunset, NYC skyline backdrop with Lumen real-time GI capturing warm orange/purple sky gradients, intimate lounge setup with string lights and candles, World Partition streaming distant city Nanite buildings, atmospheric fog and light rays through clouds, acoustic performance setup',
    ueFeatures: ['Lumen Sky', 'World Partition', 'Nanite Buildings', 'Volumetric Fog'],
    difficulty: 'intermediate',
    estimatedTime: '20 min build'
  },
  {
    id: 'music_video_studio',
    name: 'Music Video Studio',
    icon: '🎬',
    category: 'production',
    description: 'Hollywood-grade virtual production stage with LED volume walls',
    thumbnail: '🎭',
    tags: ['virtual production','LED wall','Hollywood','studio','cameras'],
    prompt: 'Virtual production stage with massive 270-degree curved LED volume backdrop displaying any environment, Hollywood Sequencer camera setup with ARRI/RED lens simulation, cinematic depth of field, motion capture stage markings, full lighting rig with DMX-controlled Niagara light fixtures, professional audio booth visible through glass',
    ueFeatures: ['Cine Camera', 'Sequencer', 'HDRI Backdrop', 'Virtual Production', 'nDisplay'],
    difficulty: 'advanced',
    estimatedTime: '60 min build'
  },
  {
    id: 'underground_club',
    name: 'Underground Club',
    icon: '🎧',
    category: 'nightlife',
    description: 'Dark underground DJ club with reactive laser show and smoke',
    thumbnail: '🌑',
    tags: ['nightclub','DJ','lasers','smoke','dark'],
    prompt: 'Underground nightclub venue, raw concrete walls with graffiti art, massive DJ booth elevated on stage with custom CDJ setup, Niagara laser light show with 16 reactive RGB beams synced to BPM, CO2 cannon smoke effects, LED strip lighting in floor cracks, crowd of 200 NPC dancers with procedural dance animations, subwoofer bass visual shader effect',
    ueFeatures: ['Niagara Lasers', 'Procedural NPC', 'Lumen Emissive', 'Audio Analysis', 'Post Process'],
    difficulty: 'intermediate',
    estimatedTime: '30 min build'
  },
  {
    id: 'music_video_desert',
    name: 'Desert Music Video',
    icon: '🏜️',
    category: 'outdoor',
    description: 'Epic desert landscape for cinematic music video with dunes and mirages',
    thumbnail: '🌵',
    tags: ['desert','cinematic','outdoor','wide shot','epic'],
    prompt: 'Epic desert landscape with PCG-generated sand dunes stretching to horizon, heat mirage post-process effect, massive rock formations as natural stage, cinematic wide-angle shots with lens flare, sparse dramatic lighting from low desert sun, dust particle Niagara systems, distant mountains with World Partition streaming, lone figure performance on rocky plateau',
    ueFeatures: ['PCG', 'World Partition', 'Lumen Sky', 'Nanite Landscape', 'Post Process'],
    difficulty: 'intermediate',
    estimatedTime: '25 min build'
  },
  {
    id: 'cyber_city',
    name: 'Cyberpunk City Stage',
    icon: '🤖',
    category: 'futuristic',
    description: 'Blade Runner-inspired neon cyberpunk cityscape stage',
    thumbnail: '🌃',
    tags: ['cyberpunk','neon','futuristic','rain','city'],
    prompt: 'Blade Runner 2049-style cyberpunk megacity stage, Nanite detailed neon-lit skyscrapers with holographic advertisements, persistent rain Niagara system with puddle reflections via Lumen real-time reflections, flying vehicle traffic AI system, MetaHuman performers in cyberpunk outfits, massive LED billboard backdrops, volumetric neon fog, underground stage riser emerging from street level',
    ueFeatures: ['Nanite City', 'Lumen Reflections', 'Niagara Rain', 'AI Traffic', 'Volumetric Fog'],
    difficulty: 'expert',
    estimatedTime: '90 min build'
  },
  {
    id: 'space_station',
    name: 'Zero-G Space Station',
    icon: '🚀',
    category: 'futuristic',
    description: 'Orbital space station concert hall with Earth visible through windows',
    thumbnail: '🌍',
    tags: ['space','zero-g','sci-fi','earth','orbital'],
    prompt: 'Orbital space station concert hall, massive panoramic windows showing rotating Earth below, zero-gravity floating light orbs as Niagara particles, sleek white metal corridors with Lumen emissive blue accent lighting, floating MetaHuman performer with zero-g mocap animation, star field skybox with Milky Way, holographic crowd holograms, Nanite detailed space station exterior visible through windows',
    ueFeatures: ['Lumen Space', 'Niagara Particles', 'HDRI Stars', 'MetaHuman', 'Niagara Holograms'],
    difficulty: 'expert',
    estimatedTime: '75 min build'
  },
  {
    id: 'forest_festival',
    name: 'Forest Festival',
    icon: '🌲',
    category: 'outdoor',
    description: 'Magical forest festival with bioluminescent trees and fairy lights',
    thumbnail: '✨',
    tags: ['festival','forest','nature','magical','bioluminescent'],
    prompt: 'Enchanted forest festival stage, PCG-generated ancient oak forest with 10,000 Nanite trees, bioluminescent Niagara particle fireflies and glowing mushrooms, fabric stage decorations with string lights, natural wooden stage built into giant tree roots, Lumen capturing moonlight filtering through forest canopy, mist ground fog, flower and leaf particle systems, crowd of festival-goers in bohemian attire',
    ueFeatures: ['PCG Forest', 'Nanite Trees', 'Niagara Fireflies', 'Lumen Moon', 'World Partition'],
    difficulty: 'advanced',
    estimatedTime: '40 min build'
  }
];

// ── Blueprint Templates ───────────────────────────────────────────────────────
const BLUEPRINT_TEMPLATES = {
  audio_reactive_lights: `// ═══ Audio Reactive Light System Blueprint (C++) ═══
#include "AudioReactiveLights.h"
#include "Components/AudioComponent.h"
#include "Sound/SoundWave.h"
#include "Engine/PointLight.h"

AAudioReactiveLights::AAudioReactiveLights()
{
    PrimaryActorTick.bCanEverTick = true;
    AudioComp = CreateDefaultSubobject<UAudioComponent>(TEXT("AudioComp"));
    RootComponent = AudioComp;
    BassFrequency = 80.0f;
    MidFrequency = 1000.0f;
    TrebleFrequency = 8000.0f;
}

void AAudioReactiveLights::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);
    
    // Sample audio spectrum
    TArray<float> FreqData;
    AudioComp->GetWaveData(FreqData, 512);
    
    float Bass = GetFrequencyAverage(FreqData, 0, 50);
    float Mid = GetFrequencyAverage(FreqData, 51, 200);
    float Treble = GetFrequencyAverage(FreqData, 201, 512);
    
    // Drive lights with frequency bands
    for (int32 i = 0; i < LightArray.Num(); i++)
    {
        float FreqValue = (i % 3 == 0) ? Bass : (i % 3 == 1) ? Mid : Treble;
        float Intensity = FMath::Lerp(MinIntensity, MaxIntensity, FreqValue);
        LightArray[i]->SetIntensity(Intensity);
        
        // Color shift based on frequency
        FLinearColor NewColor = FLinearColor::LerpUsingHSV(
            LowFreqColor, HighFreqColor, FreqValue
        );
        LightArray[i]->SetLightColor(NewColor);
    }
}`,

  crowd_simulation: `// ═══ NPC Crowd Simulation System ═══
// Uses Mass Entity framework for 50,000+ concurrent NPCs

UCLASS()
class UCrowdSubsystem : public UWorldSubsystem
{
    GENERATED_BODY()
public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    void SpawnCrowd(FVector Center, int32 Count, float Radius);
    void SetCrowdBehavior(ECrowdBehavior Behavior);
    void SyncToAudioBeat(float BPM);
    
private:
    // Mass Entity handles for crowd
    TArray<FMassEntityHandle> CrowdEntities;
    FMassEntityManager* EntityManager;
    
    // Behavior states
    ECrowdBehavior CurrentBehavior = ECrowdBehavior::Idle;
    float BeatInterval = 0.5f;
    float TimeSinceBeat = 0.0f;
    
    // Movement patterns
    void UpdateDancingBehavior(float DeltaTime);
    void UpdateCheerBehavior(float DeltaTime);
    void UpdateWaveBehavior(float DeltaTime);
    
    // LOD system for performance
    void UpdateCrowdLOD();
    int32 GetActiveLODLevel(FVector ViewerLocation, FVector EntityLocation);
};

void UCrowdSubsystem::SyncToAudioBeat(float BPM)
{
    BeatInterval = 60.0f / BPM;
    // Mass processor will sync crowd animations to this beat
    UE_LOG(LogCrowd, Log, TEXT("Crowd synced to BPM: %.1f"), BPM);
}`,

  niagara_pyro: `// ═══ Niagara Pyrotechnic System — C++ Module Interface ═══
// Controls Niagara FX system for concert pyrotechnics

void APyrotechnicController::TriggerPyro(EPyroType Type, FVector Location)
{
    UNiagaraFunctionLibrary::SpawnSystemAtLocation(
        GetWorld(),
        GetPyroSystem(Type),  // Returns appropriate Niagara asset
        Location,
        FRotator::ZeroRotator,
        FVector::OneVector,
        true,   // bAutoActivate
        true,   // bAutoDestroy  
        ENCPoolMethod::AutoRelease
    );
    
    // Trigger audio
    UGameplayStatics::PlaySoundAtLocation(
        this, GetPyroSound(Type), Location
    );
    
    // Camera shake
    if (Type == EPyroType::BigExplosion)
    {
        APlayerCameraManager* CamMgr = UGameplayStatics::GetPlayerCameraManager(GetWorld(), 0);
        CamMgr->PlayCameraShake(ExplosionCameraShake, 1.0f);
    }
}

// Pyro Types:
// - Fountain  : Classic upward sparks, 5s duration
// - Comet     : Single shot rocket burst, 2s duration  
// - Waterfall : Cascading downward effect, 8s duration
// - CO2       : Cold smoke blast, 3s duration
// - Confetti  : Colorful paper burst, 10s duration
// - BigExplosion: Full send, camera shake, 4s duration`,

  lumen_setup: `// ═══ Lumen Scene Setup — Console Variables for Cinematic Quality ═══
// Add to DefaultEngine.ini or call in Begin Play for cinematic quality

[/Script/Engine.RendererSettings]
r.DynamicGlobalIlluminationMethod=1      ; 1=Lumen GI
r.ReflectionMethod=1                      ; 1=Lumen Reflections
r.Lumen.TraceMeshSDFs=1                   ; Screen-space tracing
r.Lumen.ScreenProbeGather.DownsampleFactor=1  ; Full quality
r.Lumen.Reflections.ScreenTraces=1

// C++ setup for cinematic Lumen in your Level Blueprint:
void ASceneManager::EnableCinematicLumen()
{
    // Post process volume
    PostProcessVolume->Settings.bOverride_DynamicGlobalIlluminationMethod = true;
    PostProcessVolume->Settings.DynamicGlobalIlluminationMethod = 
        EDynamicGlobalIlluminationMethod::Lumen;
    
    PostProcessVolume->Settings.bOverride_ReflectionMethod = true;
    PostProcessVolume->Settings.ReflectionMethod = 
        EReflectionMethod::Lumen;
    
    // Lumen Scene Detail
    PostProcessVolume->Settings.LumenSceneDetail = 2.0f;  // Higher = better quality
    PostProcessVolume->Settings.LumenSceneLightingQuality = 1.0f;
    
    // Ray Lighting Mode: Hit Lighting for best reflections
    PostProcessVolume->Settings.LumenReflectionsMethod = 
        ELumenReflectionsMethod::HitLighting;
    
    UE_LOG(LogScene, Log, TEXT("Cinematic Lumen enabled"));
}`,

  pcg_vegetation: `// ═══ Procedural Content Generation — Dense Forest Setup ═══

UCLASS()
class UForestPCGComponent : public UPCGComponent
{
    GENERATED_BODY()
public:
    UPROPERTY(EditAnywhere, Category="Forest")
    float ForestDensity = 0.8f;
    
    UPROPERTY(EditAnywhere, Category="Forest")
    TArray<TSoftObjectPtr<UStaticMesh>> TreeMeshes;
    
    UPROPERTY(EditAnywhere, Category="Forest")
    UCurveFloat* HeightDistribution;
    
    void GenerateForest(FBox Bounds)
    {
        // PCG Graph execution
        UPCGSubsystem* PCGSubsystem = GetWorld()->GetSubsystem<UPCGSubsystem>();
        
        FPCGContext* Context = PCGSubsystem->GetOrCreateContext();
        
        // Set density based on landscape slope
        Context->InputData.TaggedData.Add(
            MakePCGTaggedData("Density", ForestDensity)
        );
        
        // Generate points on landscape surface  
        // Filter by slope angle (trees don't grow on >45° slopes)
        // Apply height variation curve
        // Scatter tree meshes with random rotation/scale
        // Add undergrowth layer (ferns, mushrooms, rocks)
        
        PCGGraph->Execute(Context);
        
        UE_LOG(LogPCG, Log, TEXT("Generated %d trees in forest area"), 
               Context->OutputData.TaggedData.Num());
    }
}`
};

// ── Render ─────────────────────────────────────────────────────────────────────
function renderUE5SceneGenerator(container) {
  container.innerHTML = `
    <div class="ue5sg-container">
      <div class="ue5sg-header">
        <div class="ue5sg-header-left">
          <div class="ue5sg-header-icon">🎮</div>
          <div>
            <div class="ue5sg-header-title">GOAT UE5 Scene Generator</div>
            <div class="ue5sg-header-sub">Text-to-Scene • Lumen • Nanite • MetaHuman • Niagara • PCG • World Partition</div>
          </div>
        </div>
        <div class="ue5sg-badges">
          <span class="ue5sg-badge lumen">LUMEN</span>
          <span class="ue5sg-badge nanite">NANITE</span>
          <span class="ue5sg-badge pcg">PCG</span>
          <span class="ue5sg-badge ue5">UE 5.4</span>
        </div>
      </div>

      <div class="ue5sg-tabs">
        ${['generator','presets','blueprints','assets','sequencer'].map(t => `
          <button class="ue5sg-tab ${ue5State.activeTab === t ? 'active' : ''}" onclick="switchUE5Tab('${t}')">
            ${{ generator:'⚡ Scene Generator', presets:'🎬 Scene Presets', blueprints:'🔵 Blueprints', assets:'📦 Asset Library', sequencer:'🎬 Sequencer' }[t]}
          </button>
        `).join('')}
      </div>

      <div class="ue5sg-body" id="ue5sgBody">
        ${renderUE5Tab()}
      </div>
    </div>
  `;
}

function renderUE5Tab() {
  switch (ue5State.activeTab) {
    case 'generator': return renderUE5Generator();
    case 'presets': return renderUE5Presets();
    case 'blueprints': return renderUE5Blueprints();
    case 'assets': return renderUE5Assets();
    case 'sequencer': return renderUE5Sequencer();
    default: return renderUE5Generator();
  }
}

function renderUE5Generator() {
  return `
    <div class="ue5sg-gen-wrap">
      <div class="ue5sg-gen-main">
        <div class="ue5sg-gen-input-area">
          <div class="ue5sg-gen-label">🎯 Describe Your Scene</div>
          <textarea class="ue5sg-gen-textarea" id="ue5ScenePrompt" rows="5" 
            placeholder="Describe the scene you want to generate...

Examples:
• Concert arena with 50,000 crowd, pyrotechnics, and LED stage screens synced to music
• Rooftop golden hour performance with NYC skyline and atmospheric fog  
• Cyberpunk underground club with reactive laser show and rain effects
• Forest festival stage with bioluminescent trees and firefly particles"></textarea>

          <div class="ue5sg-gen-options">
            <div class="ue5sg-opt-group">
              <label class="ue5sg-opt-label">Scene Type</label>
              <div class="ue5sg-opt-btns">
                ${['concert','studio','outdoor','club','cinematic','game'].map(t => `
                  <button class="ue5sg-opt-btn ${ue5State.sceneType === t ? 'active' : ''}" onclick="setSceneType('${t}')">${t}</button>
                `).join('')}
              </div>
            </div>
            <div class="ue5sg-opt-group">
              <label class="ue5sg-opt-label">Quality Level</label>
              <div class="ue5sg-opt-btns">
                ${['performance','balanced','cinematic','film'].map(q => `
                  <button class="ue5sg-opt-btn ${ue5State.quality === q ? 'active' : ''}" onclick="setQuality('${q}')">${q}</button>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="ue5sg-gen-features">
            <div class="ue5sg-feat-label">UE5 Features to Include:</div>
            <div class="ue5sg-feat-grid">
              ${[
                {id:'lumen',label:'🌟 Lumen GI',desc:'Real-time global illumination'},
                {id:'nanite',label:'💎 Nanite',desc:'Virtualized geometry'},
                {id:'niagara',label:'✨ Niagara VFX',desc:'Particle systems'},
                {id:'metahuman',label:'👤 MetaHuman',desc:'Photoreal characters'},
                {id:'pcg',label:'🌲 PCG',desc:'Procedural generation'},
                {id:'worldpart',label:'🌍 World Partition',desc:'Streaming open world'},
                {id:'sequencer',label:'🎬 Sequencer',desc:'Cinematics timeline'},
                {id:'chaos',label:'💥 Chaos Physics',desc:'Destruction & cloth'},
                {id:'audio',label:'🎵 MetaSounds',desc:'Audio reactive systems'},
                {id:'crowd',label:'👥 Mass AI',desc:'Large crowd simulation'}
              ].map(f => `
                <label class="ue5sg-feat-check">
                  <input type="checkbox" value="${f.id}" checked>
                  <div>
                    <div class="ue5sg-feat-name">${f.label}</div>
                    <div class="ue5sg-feat-desc">${f.desc}</div>
                  </div>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="ue5sg-gen-actions">
            <button class="ue5sg-gen-btn primary" onclick="generateUE5Scene()">
              ⚡ Generate Full Scene Package
            </button>
            <button class="ue5sg-gen-btn secondary" onclick="generateBlueprintOnly()">
              🔵 Generate Blueprint Only
            </button>
            <button class="ue5sg-gen-btn secondary" onclick="loadRandomPreset()">
              🎲 Random Preset
            </button>
          </div>
        </div>

        <div class="ue5sg-gen-output" id="ue5GenOutput" style="display:none">
          <div class="ue5sg-output-header">
            <div class="ue5sg-output-title">Generated Scene Package</div>
            <div class="ue5sg-output-actions">
              <button class="ue5sg-btn-sm" onclick="copyUE5Output()">📋 Copy</button>
              <button class="ue5sg-btn-sm" onclick="sendUE5ToChat()">💬 Send to Chat</button>
              <button class="ue5sg-btn-sm primary" onclick="exportUE5Package()">📦 Export Package</button>
            </div>
          </div>
          <div class="ue5sg-output-content" id="ue5OutputContent"></div>
        </div>
      </div>

      <div class="ue5sg-quick-presets">
        <div class="ue5sg-qp-title">Quick Load Preset</div>
        ${SCENE_PRESETS.slice(0,4).map(p => `
          <button class="ue5sg-qp-btn" onclick="loadPreset('${p.id}')">
            <span>${p.icon}</span>
            <span>${p.name}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function renderUE5Presets() {
  const categories = ['all', 'music', 'outdoor', 'futuristic', 'nightlife', 'production'];
  return `
    <div class="ue5sg-presets-wrap">
      <div class="ue5sg-presets-header">
        <div class="ue5sg-section-title">🎬 Scene Presets Library</div>
        <div class="ue5sg-presets-filters">
          ${categories.map(c => `
            <button class="ue5sg-filter ${c === 'all' ? 'active' : ''}" onclick="filterUE5Presets('${c}')">${c}</button>
          `).join('')}
        </div>
      </div>
      <div class="ue5sg-presets-grid" id="ue5PresetsGrid">
        ${SCENE_PRESETS.map(p => `
          <div class="ue5sg-preset-card">
            <div class="ue5sg-preset-thumb">${p.thumbnail}</div>
            <div class="ue5sg-preset-body">
              <div class="ue5sg-preset-header">
                <div class="ue5sg-preset-icon">${p.icon}</div>
                <div class="ue5sg-preset-meta">
                  <div class="ue5sg-preset-name">${p.name}</div>
                  <div class="ue5sg-preset-category">${p.category.toUpperCase()}</div>
                </div>
                <span class="ue5sg-preset-diff ${p.difficulty}">${p.difficulty}</span>
              </div>
              <div class="ue5sg-preset-desc">${p.description}</div>
              <div class="ue5sg-preset-features">
                ${p.ueFeatures.map(f => `<span class="ue5sg-feat-tag">${f}</span>`).join('')}
              </div>
              <div class="ue5sg-preset-tags">
                ${p.tags.map(t => `<span class="ue5sg-tag">#${t}</span>`).join('')}
              </div>
              <div class="ue5sg-preset-footer">
                <span class="ue5sg-preset-time">⏱ ${p.estimatedTime}</span>
                <div class="ue5sg-preset-btns">
                  <button class="ue5sg-btn-sm" onclick="previewPreset('${p.id}')">👁 Preview</button>
                  <button class="ue5sg-btn-sm primary" onclick="buildPreset('${p.id}')">⚡ Build This</button>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderUE5Blueprints() {
  const bpKeys = Object.keys(BLUEPRINT_TEMPLATES);
  const bpLabels = { audio_reactive_lights: '🎵 Audio Reactive Lights', crowd_simulation: '👥 Crowd Simulation', niagara_pyro: '🔥 Niagara Pyrotechnics', lumen_setup: '🌟 Lumen Cinematic Setup', pcg_vegetation: '🌲 PCG Forest Generator' };
  return `
    <div class="ue5sg-bp-wrap">
      <div class="ue5sg-section-title">🔵 Blueprint & C++ Templates</div>
      <div class="ue5sg-bp-grid">
        <div class="ue5sg-bp-sidebar">
          ${bpKeys.map(k => `
            <button class="ue5sg-bp-btn ${k === bpKeys[0] ? 'active' : ''}" onclick="loadBPTemplate('${k}', this)">
              ${bpLabels[k]}
            </button>
          `).join('')}
          <div class="ue5sg-bp-divider">Custom Generate</div>
          <button class="ue5sg-bp-btn" onclick="generateCustomBP()">⚡ Generate from Description</button>
          <button class="ue5sg-bp-btn" onclick="generateBPFromScene()">🎬 From Current Scene</button>
        </div>
        <div class="ue5sg-bp-content">
          <div class="ue5sg-bp-toolbar">
            <div class="ue5sg-bp-lang-badge">C++ / UE5</div>
            <button class="ue5sg-btn-sm" onclick="copyBPCode()">📋 Copy Code</button>
            <button class="ue5sg-btn-sm" onclick="sendBPToChat()">💬 Explain & Improve</button>
            <button class="ue5sg-btn-sm primary" onclick="generateBPVariant()">⚡ Generate Variant</button>
          </div>
          <pre class="ue5sg-bp-code" id="ue5BPCode">${BLUEPRINT_TEMPLATES[bpKeys[0]].replace(/</g,'<').replace(/>/g,'>')}</pre>
        </div>
      </div>
    </div>
  `;
}

function renderUE5Assets() {
  const assetCategories = [
    { name: 'Stage & Venues', icon: '🎤', count: 47, assets: ['Concert Stage Pro', 'Underground Club Kit', 'Rooftop Venue', 'Festival Grounds', 'Recording Studio', 'Virtual Stage LED'] },
    { name: 'Lighting Rigs', icon: '💡', count: 83, assets: ['Moving Head Beam', 'PAR Can Array', 'LED Strip System', 'Laser Rig Pro', 'Follow Spot', 'CO2 Cannon'] },
    { name: 'Crowd & Characters', icon: '👥', count: 124, assets: ['Crowd Mass 10K', 'Festival Goers Pack', 'VIP Section NPCs', 'Security Staff', 'DJ Performer', 'Backup Dancers'] },
    { name: 'VFX Particle Systems', icon: '✨', count: 62, assets: ['Pyro Fountain', 'Confetti Burst', 'Stage Fog', 'Sparkle Curtain', 'Fire Torch', 'CO2 Blast'] },
    { name: 'Audio & Music Gear', icon: '🎧', count: 38, assets: ['CDJ 3000 Pair', 'Pioneer DJM-A9', 'Subwoofer Array', 'Monitor Stack', 'Microphone Stand', 'Guitar Rig'] },
    { name: 'Architecture', icon: '🏗️', count: 215, assets: ['LED Truss System', 'Stage Risers', 'Crowd Barriers', 'VIP Boxes', 'Backstage Area', 'Production Village'] }
  ];

  return `
    <div class="ue5sg-assets-wrap">
      <div class="ue5sg-section-title">📦 GOAT UE5 Asset Library</div>
      <div class="ue5sg-assets-search">
        <input class="ue5sg-search-input" placeholder="🔍 Search 570+ assets..." oninput="searchUE5Assets(this.value)">
        <button class="ue5sg-btn-sm primary" onclick="openFABMarketplace()">🛒 Open FAB Marketplace</button>
      </div>
      <div class="ue5sg-asset-categories">
        ${assetCategories.map(cat => `
          <div class="ue5sg-asset-cat">
            <div class="ue5sg-asset-cat-header">
              <span class="ue5sg-asset-cat-icon">${cat.icon}</span>
              <span class="ue5sg-asset-cat-name">${cat.name}</span>
              <span class="ue5sg-asset-cat-count">${cat.count} assets</span>
            </div>
            <div class="ue5sg-asset-list">
              ${cat.assets.map(a => `
                <div class="ue5sg-asset-item" onclick="addAssetToScene('${a}')">
                  <span class="ue5sg-asset-icon">${cat.icon}</span>
                  <span class="ue5sg-asset-name">${a}</span>
                  <button class="ue5sg-asset-add">+</button>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      <div class="ue5sg-selected-assets" id="ue5SelectedAssets">
        <div class="ue5sg-section-title" style="margin-bottom:10px">🎯 Selected Assets for Scene</div>
        <div class="ue5sg-empty-assets">No assets selected. Click assets above to add them to your scene.</div>
      </div>
    </div>
  `;
}

function renderUE5Sequencer() {
  return `
    <div class="ue5sg-seq-wrap">
      <div class="ue5sg-section-title">🎬 Cinematic Sequencer</div>
      <div class="ue5sg-seq-description">Generate full Unreal Engine Sequencer data for your scene — camera cuts, animation keys, light transitions, VFX timing, and audio sync.</div>

      <div class="ue5sg-seq-gen">
        <div class="ue5sg-seq-form">
          <div class="ue5sg-seq-row">
            <div class="ue5sg-seq-group">
              <label class="ue5sg-seq-label">Sequence Duration</label>
              <select class="ue5sg-seq-select" id="seqDuration">
                <option value="30">30 seconds (Trailer)</option>
                <option value="60">60 seconds (Short)</option>
                <option value="180" selected>3 minutes (Full Performance)</option>
                <option value="240">4 minutes (Music Video)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div class="ue5sg-seq-group">
              <label class="ue5sg-seq-label">Frame Rate</label>
              <select class="ue5sg-seq-select" id="seqFPS">
                <option value="24">24 fps (Cinematic)</option>
                <option value="30" selected>30 fps (Standard)</option>
                <option value="60">60 fps (Smooth)</option>
                <option value="120">120 fps (Super Slow Mo)</option>
              </select>
            </div>
            <div class="ue5sg-seq-group">
              <label class="ue5sg-seq-label">Camera Style</label>
              <select class="ue5sg-seq-select" id="seqCamStyle">
                <option value="concert">Concert Coverage</option>
                <option value="music_video">Music Video</option>
                <option value="cinematic">Cinematic Film</option>
                <option value="sports">Sports Broadcast</option>
                <option value="documentary">Documentary</option>
              </select>
            </div>
          </div>

          <div class="ue5sg-seq-shots">
            <div class="ue5sg-seq-shots-title">Camera Shots to Include:</div>
            <div class="ue5sg-shots-grid">
              ${['Wide Establishing', 'Close-Up Performer', 'Crowd Aerial', 'Tracking Shot', 'Dutch Angle', 'Crane Up', 'Dolly Push', 'Handheld Energy', 'Slow Motion Drop', 'Behind Stage POV'].map(shot => `
                <label class="ue5sg-shot-check">
                  <input type="checkbox" checked>
                  <span>${shot}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <button class="ue5sg-gen-btn primary" onclick="generateSequence()">
            🎬 Generate Sequencer Data + Camera Cuts
          </button>
        </div>

        <div class="ue5sg-seq-output" id="ue5SeqOutput" style="display:none">
          <div class="ue5sg-seq-timeline">
            <div class="ue5sg-timeline-header">
              <span class="ue5sg-tl-title">📽️ Generated Sequence Timeline</span>
              <button class="ue5sg-btn-sm primary" onclick="exportSequencerXML()">Export XML</button>
            </div>
            <div class="ue5sg-timeline" id="ue5Timeline"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── Actions ───────────────────────────────────────────────────────────────────
function switchUE5Tab(tab) {
  ue5State.activeTab = tab;
  const body = document.getElementById('ue5sgBody');
  if (body) body.innerHTML = renderUE5Tab();
}

function setSceneType(type) {
  ue5State.sceneType = type;
  document.querySelectorAll('.ue5sg-opt-btn').forEach(b => {
    if (b.textContent === type) b.classList.add('active');
    else if (['concert','studio','outdoor','club','cinematic','game'].includes(b.textContent)) b.classList.remove('active');
  });
}

function setQuality(quality) {
  ue5State.quality = quality;
  document.querySelectorAll('.ue5sg-opt-btn').forEach(b => {
    if (b.textContent === quality) b.classList.add('active');
    else if (['performance','balanced','cinematic','film'].includes(b.textContent)) b.classList.remove('active');
  });
}

function loadPreset(id) {
  const preset = SCENE_PRESETS.find(p => p.id === id);
  if (!preset) return;
  const el = document.getElementById('ue5ScenePrompt');
  if (el) el.value = preset.prompt;
  ue5State.sceneType = preset.category === 'music' ? 'concert' : preset.category === 'nightlife' ? 'club' : preset.category === 'futuristic' ? 'cinematic' : 'outdoor';
  showUE5Notif(`✅ "${preset.name}" preset loaded!`, 'success');
}

function loadRandomPreset() {
  const preset = SCENE_PRESETS[Math.floor(Math.random() * SCENE_PRESETS.length)];
  loadPreset(preset.id);
}

function generateUE5Scene() {
  const prompt = document.getElementById('ue5ScenePrompt')?.value?.trim();
  if (!prompt) { showUE5Notif('⚠️ Please describe your scene first', 'warning'); return; }
  const quality = ue5State.quality;
  const sceneType = ue5State.sceneType;
  const fullPrompt = `Generate a complete Unreal Engine 5 scene package for:

SCENE: ${prompt}
TYPE: ${sceneType} | QUALITY: ${quality}

Please provide:
1. **World Settings** — Level settings, skybox, time of day, atmosphere
2. **Lumen Configuration** — GI quality, reflection quality, ray tracing settings
3. **Nanite Setup** — Which meshes to use Nanite on, LOD settings
4. **Lighting Plan** — Key light, fill light, rim light, practical lights, emissives
5. **Niagara VFX List** — All particle systems needed with parameters
6. **MetaHuman Characters** — Character descriptions and animation states
7. **Audio Setup** — MetaSounds graph, audio reactive system if applicable
8. **Blueprint Architecture** — Key Blueprint classes and their responsibilities
9. **Performance Notes** — Optimization tips for target hardware
10. **Asset List** — All static meshes, materials, and textures needed

Format as structured documentation ready for a UE5 developer to implement.`;

  document.getElementById('message-input').value = fullPrompt;
  // Show output placeholder
  const outputDiv = document.getElementById('ue5GenOutput');
  const outputContent = document.getElementById('ue5OutputContent');
  if (outputDiv) outputDiv.style.display = 'block';
  if (outputContent) outputContent.innerHTML = '<div style="color:var(--text-muted);font-size:13px;padding:20px;text-align:center">⚡ Generating scene package... Check the chat window for your complete UE5 scene documentation!</div>';
  closeToolPanel();
}

function generateBlueprintOnly() {
  const prompt = document.getElementById('ue5ScenePrompt')?.value?.trim();
  if (!prompt) { showUE5Notif('⚠️ Describe your scene to generate Blueprints', 'warning'); return; }
  document.getElementById('message-input').value = `Generate complete Unreal Engine 5 C++ and Blueprint code for: ${prompt}\n\nInclude:\n- Actor classes with full tick/begin play logic\n- Component setup\n- Key Blueprint nodes as C++ equivalents\n- Header (.h) and source (.cpp) files\n- Comments explaining each section`;
  closeToolPanel();
}

function buildPreset(id) {
  const preset = SCENE_PRESETS.find(p => p.id === id);
  if (!preset) return;
  document.getElementById('message-input').value = `Build me a complete UE5 "${preset.name}" scene:\n\n${preset.prompt}\n\nRequired UE5 features: ${preset.ueFeatures.join(', ')}\nQuality: Cinematic\n\nProvide: World settings, Blueprint code, asset list, Niagara VFX parameters, lighting setup, and step-by-step build guide.`;
  closeToolPanel();
}

function previewPreset(id) {
  const preset = SCENE_PRESETS.find(p => p.id === id);
  if (!preset) return;
  document.getElementById('message-input').value = `Describe in detail what the UE5 "${preset.name}" scene would look like visually — colors, lighting mood, camera perspectives, and the most impressive visual moments. Also suggest what music genre would work best for this scene.`;
  closeToolPanel();
}

function filterUE5Presets(category) {
  const grid = document.getElementById('ue5PresetsGrid');
  if (!grid) return;
  document.querySelectorAll('.ue5sg-filter').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  const filtered = category === 'all' ? SCENE_PRESETS : SCENE_PRESETS.filter(p => p.category === category);
  grid.innerHTML = filtered.map(p => `
    <div class="ue5sg-preset-card">
      <div class="ue5sg-preset-thumb">${p.thumbnail}</div>
      <div class="ue5sg-preset-body">
        <div class="ue5sg-preset-header">
          <div class="ue5sg-preset-icon">${p.icon}</div>
          <div class="ue5sg-preset-meta">
            <div class="ue5sg-preset-name">${p.name}</div>
            <div class="ue5sg-preset-category">${p.category.toUpperCase()}</div>
          </div>
          <span class="ue5sg-preset-diff ${p.difficulty}">${p.difficulty}</span>
        </div>
        <div class="ue5sg-preset-desc">${p.description}</div>
        <div class="ue5sg-preset-features">
          ${p.ueFeatures.map(f => `<span class="ue5sg-feat-tag">${f}</span>`).join('')}
        </div>
        <div class="ue5sg-preset-footer">
          <span class="ue5sg-preset-time">⏱ ${p.estimatedTime}</span>
          <div class="ue5sg-preset-btns">
            <button class="ue5sg-btn-sm" onclick="previewPreset('${p.id}')">👁 Preview</button>
            <button class="ue5sg-btn-sm primary" onclick="buildPreset('${p.id}')">⚡ Build This</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function loadBPTemplate(key, btn) {
  const code = document.getElementById('ue5BPCode');
  if (code) code.innerHTML = BLUEPRINT_TEMPLATES[key].replace(/</g,'<').replace(/>/g,'>');
  document.querySelectorAll('.ue5sg-bp-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function copyBPCode() {
  const code = document.getElementById('ue5BPCode');
  if (code) navigator.clipboard.writeText(code.textContent);
  showUE5Notif('📋 Blueprint code copied!', 'success');
}

function sendBPToChat() {
  const code = document.getElementById('ue5BPCode');
  if (!code) return;
  document.getElementById('message-input').value = `Review this UE5 C++ Blueprint code and suggest improvements, optimizations, and any missing functionality:\n\n${code.textContent.slice(0,1000)}...`;
  closeToolPanel();
}

function generateBPVariant() {
  const code = document.getElementById('ue5BPCode');
  if (!code) return;
  document.getElementById('message-input').value = `Generate an improved variant of this UE5 Blueprint/C++ code with additional features, better performance optimization, and more advanced Unreal Engine 5 patterns:\n\n${code.textContent.slice(0,800)}`;
  closeToolPanel();
}

function generateCustomBP() {
  document.getElementById('message-input').value = 'Generate UE5 Blueprint C++ code for: ';
  closeToolPanel();
}

function generateBPFromScene() {
  const prompt = document.getElementById('ue5ScenePrompt')?.value;
  if (prompt) {
    document.getElementById('message-input').value = `Generate UE5 Blueprint C++ architecture for this scene:\n\n${prompt}`;
    closeToolPanel();
  } else {
    switchUE5Tab('generator');
    showUE5Notif('⚠️ Describe your scene first in the Generator tab', 'warning');
  }
}

function addAssetToScene(assetName) {
  if (!ue5State.selectedAssets.includes(assetName)) {
    ue5State.selectedAssets.push(assetName);
    updateSelectedAssetsUI();
    showUE5Notif(`✅ "${assetName}" added to scene`, 'success');
  }
}

function updateSelectedAssetsUI() {
  const el = document.getElementById('ue5SelectedAssets');
  if (!el) return;
  if (ue5State.selectedAssets.length === 0) {
    el.innerHTML = '<div class="ue5sg-section-title" style="margin-bottom:10px">🎯 Selected Assets for Scene</div><div class="ue5sg-empty-assets">No assets selected. Click assets above to add them to your scene.</div>';
    return;
  }
  el.innerHTML = `
    <div class="ue5sg-section-title" style="margin-bottom:10px">🎯 Selected Assets (${ue5State.selectedAssets.length})</div>
    <div class="ue5sg-selected-list">
      ${ue5State.selectedAssets.map((a,i) => `
        <div class="ue5sg-selected-item">
          <span>${a}</span>
          <button onclick="removeAsset(${i})" style="background:none;border:none;color:var(--text-muted);cursor:pointer">✕</button>
        </div>
      `).join('')}
    </div>
    <button class="ue5sg-gen-btn primary" style="margin-top:12px" onclick="generateSceneWithAssets()">⚡ Generate Scene With These Assets</button>
  `;
}

function removeAsset(index) {
  ue5State.selectedAssets.splice(index, 1);
  updateSelectedAssetsUI();
}

function generateSceneWithAssets() {
  document.getElementById('message-input').value = `Generate a complete UE5 scene using these specific assets: ${ue5State.selectedAssets.join(', ')}.\n\nProvide placement instructions, Blueprint integration code, material setup, and lighting plan.`;
  closeToolPanel();
}

function generateSequence() {
  const duration = document.getElementById('seqDuration')?.value;
  const fps = document.getElementById('seqFPS')?.value;
  const camStyle = document.getElementById('seqCamStyle')?.value;
  document.getElementById('message-input').value = `Generate a complete UE5 Sequencer camera cut list for a ${duration}-second ${camStyle} sequence at ${fps}fps.\n\nFor each cut provide: start time, end time, camera type, shot name, description, focal length, aperture, and transition type.\nAlso provide: light intensity keyframes, Niagara VFX trigger timestamps, MetaHuman animation states timeline.\nFormat as both a human-readable shot list AND as XML data that can be imported into Unreal Engine Sequencer.`;
  const seqOutput = document.getElementById('ue5SeqOutput');
  if (seqOutput) seqOutput.style.display = 'block';
  closeToolPanel();
}

function exportSequencerXML() {
  showUE5Notif('📦 Generating Sequencer XML export...', 'info');
  document.getElementById('message-input').value = 'Generate the complete Unreal Engine Sequencer XML format for the sequence we discussed, ready to import into UE5.';
  closeToolPanel();
}

function searchUE5Assets(query) {
  // Filter asset items visually
  document.querySelectorAll('.ue5sg-asset-item').forEach(item => {
    const name = item.querySelector('.ue5sg-asset-name')?.textContent?.toLowerCase();
    item.style.display = (!query || name?.includes(query.toLowerCase())) ? 'flex' : 'none';
  });
}

function openFABMarketplace() {
  showUE5Notif('🛒 Opening Unreal FAB Marketplace...', 'info');
}

function copyUE5Output() {
  const el = document.getElementById('ue5OutputContent');
  if (el) navigator.clipboard.writeText(el.textContent);
  showUE5Notif('📋 Scene package copied!', 'success');
}

function sendUE5ToChat() {
  const el = document.getElementById('ue5OutputContent');
  if (el) { document.getElementById('message-input').value = 'Continue building on this UE5 scene: ' + el.textContent.slice(0,400); closeToolPanel(); }
}

function exportUE5Package() {
  showUE5Notif('📦 Packaging UE5 scene files...', 'info');
  document.getElementById('message-input').value = 'Package this UE5 scene into a complete project structure with folder organization, .uproject setup, and all required plugin dependencies listed.';
  closeToolPanel();
}

function showUE5Notif(msg, type) {
  const existing = document.querySelector('.ue5sg-notif');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'ue5sg-notif';
  el.style.cssText = `position:fixed;top:20px;right:20px;z-index:99999;padding:12px 18px;border-radius:10px;font-size:13px;font-weight:600;max-width:360px;box-shadow:0 4px 20px rgba(0,0,0,0.4);background:${type==='success'?'rgba(34,197,94,0.15)':type==='warning'?'rgba(245,158,11,0.15)':'rgba(232,83,10,0.15)'};border:1px solid ${type==='success'?'#22c55e':type==='warning'?'#f59e0b':'#e8530a'};color:var(--text-primary);`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ── CSS ───────────────────────────────────────────────────────────────────────
(function injectUE5SGStyles() {
  if (document.getElementById('ue5sg-styles')) return;
  const style = document.createElement('style');
  style.id = 'ue5sg-styles';
  style.textContent = `
    .ue5sg-container{display:flex;flex-direction:column;height:100%;background:var(--bg-primary);color:var(--text-primary);font-family:'Inter',sans-serif}
    .ue5sg-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:linear-gradient(135deg,rgba(232,83,10,0.15),rgba(245,158,11,0.08));border-bottom:1px solid rgba(232,83,10,0.2);flex-shrink:0}
    .ue5sg-header-left{display:flex;align-items:center;gap:12px}
    .ue5sg-header-icon{font-size:32px}
    .ue5sg-header-title{font-size:20px;font-weight:700;color:#e8530a}
    .ue5sg-header-sub{font-size:12px;color:var(--text-muted);margin-top:2px}
    .ue5sg-badges{display:flex;gap:6px}
    .ue5sg-badge{padding:4px 9px;border-radius:8px;font-size:11px;font-weight:700;letter-spacing:.5px}
    .ue5sg-badge.lumen{background:rgba(14,165,233,0.2);color:#0ea5e9;border:1px solid rgba(14,165,233,0.3)}
    .ue5sg-badge.nanite{background:rgba(139,92,246,0.2);color:#8b5cf6;border:1px solid rgba(139,92,246,0.3)}
    .ue5sg-badge.pcg{background:rgba(34,197,94,0.2);color:#22c55e;border:1px solid rgba(34,197,94,0.3)}
    .ue5sg-badge.ue5{background:rgba(232,83,10,0.2);color:#e8530a;border:1px solid rgba(232,83,10,0.3)}
    .ue5sg-tabs{display:flex;gap:4px;padding:12px 20px 0;background:var(--bg-secondary);border-bottom:1px solid var(--border);flex-shrink:0;overflow-x:auto}
    .ue5sg-tab{padding:8px 14px;border:none;background:transparent;color:var(--text-muted);font-size:12px;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap;border-radius:6px 6px 0 0}
    .ue5sg-tab:hover{color:var(--text-primary);background:rgba(232,83,10,0.08)}
    .ue5sg-tab.active{color:#e8530a;border-bottom-color:#e8530a;background:rgba(232,83,10,0.1)}
    .ue5sg-body{flex:1;overflow-y:auto;padding:20px}
    .ue5sg-gen-wrap{display:grid;grid-template-columns:1fr 180px;gap:16px}
    .ue5sg-gen-input-area{display:flex;flex-direction:column;gap:14px}
    .ue5sg-gen-label{font-size:14px;font-weight:700;color:var(--text-primary)}
    .ue5sg-gen-textarea{padding:12px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px;color:var(--text-primary);font-size:13px;resize:vertical;min-height:120px;outline:none;font-family:'Inter',sans-serif;line-height:1.6}
    .ue5sg-gen-textarea:focus{border-color:#e8530a}
    .ue5sg-gen-options{display:flex;flex-direction:column;gap:12px}
    .ue5sg-opt-group{display:flex;flex-direction:column;gap:6px}
    .ue5sg-opt-label{font-size:12px;font-weight:600;color:var(--text-muted)}
    .ue5sg-opt-btns{display:flex;gap:6px;flex-wrap:wrap}
    .ue5sg-opt-btn{padding:5px 12px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-muted);border-radius:16px;font-size:12px;cursor:pointer;transition:all .2s}
    .ue5sg-opt-btn.active{border-color:#e8530a;color:#e8530a;background:rgba(232,83,10,0.1)}
    .ue5sg-gen-features{background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px;padding:14px}
    .ue5sg-feat-label{font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:10px}
    .ue5sg-feat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px}
    .ue5sg-feat-check{display:flex;align-items:flex-start;gap:8px;padding:8px;background:var(--bg-primary);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:12px;transition:all .2s}
    .ue5sg-feat-check:hover{border-color:#e8530a}
    .ue5sg-feat-check input{accent-color:#e8530a;margin-top:2px;flex-shrink:0}
    .ue5sg-feat-name{font-size:12px;color:var(--text-primary);font-weight:500}
    .ue5sg-feat-desc{font-size:11px;color:var(--text-muted)}
    .ue5sg-gen-actions{display:flex;gap:10px;flex-wrap:wrap}
    .ue5sg-gen-btn{padding:11px 20px;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .2s}
    .ue5sg-gen-btn.primary{background:linear-gradient(135deg,#e8530a,#f59e0b);color:#fff}
    .ue5sg-gen-btn.secondary{background:var(--bg-secondary);border:1px solid var(--border);color:var(--text-muted)}
    .ue5sg-gen-btn:hover{transform:translateY(-2px);box-shadow:0 4px 14px rgba(0,0,0,0.25)}
    .ue5sg-gen-output{background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-top:4px}
    .ue5sg-output-header{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border)}
    .ue5sg-output-title{font-size:14px;font-weight:600;color:var(--text-primary)}
    .ue5sg-output-actions{display:flex;gap:6px}
    .ue5sg-output-content{padding:16px;font-size:13px;color:var(--text-secondary);line-height:1.6;max-height:300px;overflow-y:auto}
    .ue5sg-btn-sm{padding:5px 10px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-muted);border-radius:6px;font-size:11px;cursor:pointer;transition:all .2s}
    .ue5sg-btn-sm.primary{background:linear-gradient(135deg,#e8530a,#f59e0b);color:#fff;border:none}
    .ue5sg-btn-sm:hover{transform:translateY(-1px)}
    .ue5sg-quick-presets{display:flex;flex-direction:column;gap:8px}
    .ue5sg-qp-title{font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:4px}
    .ue5sg-qp-btn{display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;color:var(--text-muted);font-size:12px;cursor:pointer;transition:all .2s;text-align:left}
    .ue5sg-qp-btn:hover{border-color:#e8530a;color:var(--text-primary)}
    .ue5sg-section-title{font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:6px}
    .ue5sg-presets-wrap{display:flex;flex-direction:column;gap:16px}
    .ue5sg-presets-filters{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
    .ue5sg-filter{padding:5px 12px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-muted);border-radius:16px;font-size:12px;cursor:pointer;transition:all .2s}
    .ue5sg-filter.active{border-color:#e8530a;color:#e8530a;background:rgba(232,83,10,0.1)}
    .ue5sg-presets-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}
    .ue5sg-preset-card{background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;overflow:hidden;transition:all .2s}
    .ue5sg-preset-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.3)}
    .ue5sg-preset-thumb{font-size:48px;text-align:center;padding:20px;background:linear-gradient(135deg,var(--bg-tertiary),var(--bg-primary))}
    .ue5sg-preset-body{padding:14px}
    .ue5sg-preset-header{display:flex;align-items:center;gap:8px;margin-bottom:8px}
    .ue5sg-preset-icon{font-size:20px}
    .ue5sg-preset-name{font-size:14px;font-weight:600;color:var(--text-primary)}
    .ue5sg-preset-category{font-size:10px;color:var(--text-muted)}
    .ue5sg-preset-diff{padding:3px 7px;border-radius:6px;font-size:10px;font-weight:700;margin-left:auto}
    .ue5sg-preset-diff.intermediate{background:rgba(14,165,233,0.2);color:#0ea5e9}
    .ue5sg-preset-diff.advanced{background:rgba(245,158,11,0.2);color:#f59e0b}
    .ue5sg-preset-diff.expert{background:rgba(239,68,68,0.2);color:#ef4444}
    .ue5sg-preset-desc{font-size:12px;color:var(--text-muted);margin-bottom:10px;line-height:1.5}
    .ue5sg-preset-features{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px}
    .ue5sg-feat-tag{padding:2px 7px;background:rgba(232,83,10,0.1);color:#e8530a;border-radius:6px;font-size:10px;font-weight:600}
    .ue5sg-preset-tags{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px}
    .ue5sg-tag{font-size:11px;color:var(--text-muted)}
    .ue5sg-preset-footer{display:flex;justify-content:space-between;align-items:center}
    .ue5sg-preset-time{font-size:11px;color:var(--text-muted)}
    .ue5sg-preset-btns{display:flex;gap:6px}
    .ue5sg-bp-wrap{display:flex;flex-direction:column;gap:16px}
    .ue5sg-bp-grid{display:grid;grid-template-columns:220px 1fr;gap:16px}
    .ue5sg-bp-sidebar{display:flex;flex-direction:column;gap:6px}
    .ue5sg-bp-btn{padding:9px 12px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;color:var(--text-muted);font-size:12px;cursor:pointer;transition:all .2s;text-align:left}
    .ue5sg-bp-btn:hover{border-color:#e8530a;color:var(--text-primary)}
    .ue5sg-bp-btn.active{border-color:#e8530a;color:#e8530a;background:rgba(232,83,10,0.1)}
    .ue5sg-bp-divider{font-size:11px;color:var(--text-muted);padding:8px 4px 4px;border-top:1px solid var(--border);margin-top:4px}
    .ue5sg-bp-content{display:flex;flex-direction:column;gap:10px}
    .ue5sg-bp-toolbar{display:flex;align-items:center;gap:8px}
    .ue5sg-bp-lang-badge{padding:4px 10px;background:rgba(232,83,10,0.2);color:#e8530a;border-radius:6px;font-size:11px;font-weight:700;margin-right:auto}
    .ue5sg-bp-code{background:var(--bg-tertiary,#0a0f1a);border:1px solid var(--border);border-radius:10px;padding:16px;font-size:12px;color:#a8b4c8;line-height:1.6;overflow-x:auto;white-space:pre;font-family:'Fira Code','Courier New',monospace;max-height:400px;overflow-y:auto}
    .ue5sg-assets-wrap,.ue5sg-seq-wrap{display:flex;flex-direction:column;gap:16px}
    .ue5sg-assets-search{display:flex;gap:10px;align-items:center}
    .ue5sg-search-input{flex:1;padding:9px 14px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);font-size:13px;outline:none}
    .ue5sg-search-input:focus{border-color:#e8530a}
    .ue5sg-asset-categories{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
    .ue5sg-asset-cat{background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px;overflow:hidden}
    .ue5sg-asset-cat-header{display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--bg-tertiary,#0d1117);border-bottom:1px solid var(--border)}
    .ue5sg-asset-cat-icon{font-size:18px}
    .ue5sg-asset-cat-name{font-size:13px;font-weight:600;color:var(--text-primary);flex:1}
    .ue5sg-asset-cat-count{font-size:11px;color:var(--text-muted)}
    .ue5sg-asset-list{display:flex;flex-direction:column}
    .ue5sg-asset-item{display:flex;align-items:center;gap:8px;padding:8px 12px;cursor:pointer;transition:all .2s;border-bottom:1px solid rgba(255,255,255,0.03)}
    .ue5sg-asset-item:hover{background:rgba(232,83,10,0.08)}
    .ue5sg-asset-icon{font-size:14px;flex-shrink:0}
    .ue5sg-asset-name{font-size:12px;color:var(--text-muted);flex:1}
    .ue5sg-asset-add{background:none;border:1px solid var(--border);color:var(--text-muted);border-radius:4px;cursor:pointer;padding:1px 5px;font-size:14px;transition:all .2s}
    .ue5sg-asset-add:hover{border-color:#e8530a;color:#e8530a}
    .ue5sg-selected-assets{background:var(--bg-secondary);border:1px solid rgba(232,83,10,0.2);border-radius:10px;padding:14px}
    .ue5sg-empty-assets{font-size:13px;color:var(--text-muted);text-align:center;padding:20px}
    .ue5sg-selected-list{display:flex;flex-direction:column;gap:6px}
    .ue5sg-selected-item{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:8px;font-size:13px;color:var(--text-primary)}
    .ue5sg-seq-description{font-size:13px;color:var(--text-muted);line-height:1.6;margin-bottom:16px}
    .ue5sg-seq-form{display:flex;flex-direction:column;gap:16px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;padding:20px}
    .ue5sg-seq-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
    .ue5sg-seq-group{display:flex;flex-direction:column;gap:6px}
    .ue5sg-seq-label{font-size:12px;font-weight:600;color:var(--text-muted)}
    .ue5sg-seq-select{padding:8px 12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);font-size:13px;outline:none}
    .ue5sg-seq-shots{background:var(--bg-primary);border:1px solid var(--border);border-radius:10px;padding:14px}
    .ue5sg-seq-shots-title{font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:10px}
    .ue5sg-shots-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px}
    .ue5sg-shot-check{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-muted);cursor:pointer;padding:6px 8px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:6px}
    .ue5sg-shot-check input{accent-color:#e8530a}
    .ue5sg-seq-output{margin-top:16px}
    .ue5sg-seq-timeline{background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;padding:16px}
    .ue5sg-timeline-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
    .ue5sg-tl-title{font-size:14px;font-weight:600;color:var(--text-primary)}
    .ue5sg-timeline{min-height:100px;background:var(--bg-primary);border-radius:8px;padding:12px;font-size:13px;color:var(--text-muted);text-align:center;line-height:2}
  `;
  document.head.appendChild(style);
})();

// Export
window.renderUE5SceneGenerator = renderUE5SceneGenerator;
window.switchUE5Tab = switchUE5Tab;
window.setSceneType = setSceneType;
window.setQuality = setQuality;
window.loadPreset = loadPreset;
window.loadRandomPreset = loadRandomPreset;
window.generateUE5Scene = generateUE5Scene;
window.generateBlueprintOnly = generateBlueprintOnly;
window.buildPreset = buildPreset;
window.previewPreset = previewPreset;
window.filterUE5Presets = filterUE5Presets;
window.loadBPTemplate = loadBPTemplate;
window.copyBPCode = copyBPCode;
window.sendBPToChat = sendBPToChat;
window.generateBPVariant = generateBPVariant;
window.generateCustomBP = generateCustomBP;
window.generateBPFromScene = generateBPFromScene;
window.addAssetToScene = addAssetToScene;
window.removeAsset = removeAsset;
window.generateSceneWithAssets = generateSceneWithAssets;
window.generateSequence = generateSequence;
window.exportSequencerXML = exportSequencerXML;
window.searchUE5Assets = searchUE5Assets;
window.openFABMarketplace = openFABMarketplace;
window.copyUE5Output = copyUE5Output;
window.sendUE5ToChat = sendUE5ToChat;
window.exportUE5Package = exportUE5Package;