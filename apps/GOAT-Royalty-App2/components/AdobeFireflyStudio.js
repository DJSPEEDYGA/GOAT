/**
 * Adobe Firefly AI Studio - GOAT Royalty App
 * Full-featured AI creative studio inspired by Adobe Firefly
 * Text-to-Image, Generative Fill, Style Transfer, Text Effects & more
 */

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

// ============================================================
// FIREFLY STUDIO MAIN COMPONENT
// ============================================================
const AdobeFireflyStudio = () => {
  const [activeTab, setActiveTab] = useState('text-to-image');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedModel, setSelectedModel] = useState('firefly-3');
  const [showGallery, setShowGallery] = useState(false);
  const [generationHistory, setGenerationHistory] = useState([]);
  const [textEffectText, setTextEffectText] = useState('GOAT ROYALTY');
  const [textEffectStyle, setTextEffectStyle] = useState('fire');
  const [colorTone, setColorTone] = useState('vibrant');
  const [lightingStyle, setLightingStyle] = useState('dramatic');
  const [cameraAngle, setCameraAngle] = useState('eye-level');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [numImages, setNumImages] = useState(4);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const canvasRef = useRef(null);

  // AI Art Styles
  const artStyles = [
    { id: 'photorealistic', name: 'Photo Realistic', icon: '📸', color: '#FF6B35' },
    { id: 'digital-art', name: 'Digital Art', icon: '🎨', color: '#7B2FF7' },
    { id: 'oil-painting', name: 'Oil Painting', icon: '🖼️', color: '#E8A838' },
    { id: 'watercolor', name: 'Watercolor', icon: '💧', color: '#38B6FF' },
    { id: 'anime', name: 'Anime/Manga', icon: '⚡', color: '#FF3864' },
    { id: '3d-render', name: '3D Render', icon: '🔮', color: '#00D4AA' },
    { id: 'cyberpunk', name: 'Cyberpunk', icon: '🌆', color: '#FF00FF' },
    { id: 'album-cover', name: 'Album Cover', icon: '💿', color: '#FFD700' },
    { id: 'music-visual', name: 'Music Visual', icon: '🎵', color: '#FF4500' },
    { id: 'neon-glow', name: 'Neon Glow', icon: '✨', color: '#00FFFF' },
    { id: 'vintage-retro', name: 'Vintage Retro', icon: '📻', color: '#CD853F' },
    { id: 'abstract', name: 'Abstract', icon: '🌀', color: '#9B59B6' },
  ];

  // Music-specific prompt templates
  const musicTemplates = [
    { name: 'Album Cover Art', prompt: 'Epic album cover art for a hip-hop artist, golden crown, dark atmospheric background, luxury aesthetic, professional music artwork' },
    { name: 'Concert Poster', prompt: 'Dynamic concert poster design, neon lights, crowd silhouettes, electric energy, bold typography space, music festival vibes' },
    { name: 'Music Video Scene', prompt: 'Cinematic music video scene, dramatic lighting, urban setting, slow motion rain, professional cinematography look' },
    { name: 'Artist Portrait', prompt: 'Professional artist portrait, studio lighting, confident pose, music producer aesthetic, high-end fashion, editorial style' },
    { name: 'Beat Visualizer', prompt: 'Abstract audio waveform visualization, colorful sound waves, equalizer bars, dark background, glowing neon frequencies' },
    { name: 'Studio Session', prompt: 'Professional recording studio scene, mixing console, warm ambient lighting, vintage microphone, creative atmosphere' },
    { name: 'Vinyl Record Art', prompt: 'Artistic vinyl record design, spinning turntable, colorful grooves, retro music aesthetic, warm analog feel' },
    { name: 'Fashion x Music', prompt: 'High fashion music artist photoshoot, designer clothing, luxury accessories, editorial lighting, magazine cover quality' },
  ];

  // Aspect ratios
  const aspectRatios = [
    { id: '1:1', name: 'Square', desc: '1024×1024', icon: '⬜' },
    { id: '16:9', name: 'Landscape', desc: '1536×1024', icon: '🖥️' },
    { id: '9:16', name: 'Portrait', desc: '1024×1536', icon: '📱' },
    { id: '4:3', name: 'Standard', desc: '1365×1024', icon: '📺' },
    { id: '3:4', name: 'Tall', desc: '1024×1365', icon: '🪟' },
  ];

  // Color tones
  const colorTones = [
    { id: 'vibrant', name: 'Vibrant', color: '#FF6B35' },
    { id: 'muted', name: 'Muted', color: '#8B7D6B' },
    { id: 'warm', name: 'Warm', color: '#FF8C42' },
    { id: 'cool', name: 'Cool', color: '#4A90D9' },
    { id: 'monochrome', name: 'Mono', color: '#666666' },
    { id: 'pastel', name: 'Pastel', color: '#FFB6C1' },
    { id: 'neon', name: 'Neon', color: '#39FF14' },
    { id: 'golden', name: 'Golden', color: '#FFD700' },
  ];

  // Lighting styles
  const lightingStyles = [
    { id: 'dramatic', name: 'Dramatic' },
    { id: 'soft', name: 'Soft' },
    { id: 'studio', name: 'Studio' },
    { id: 'natural', name: 'Natural' },
    { id: 'neon', name: 'Neon' },
    { id: 'golden-hour', name: 'Golden Hour' },
    { id: 'backlit', name: 'Backlit' },
    { id: 'cinematic', name: 'Cinematic' },
  ];

  // Text effect styles
  const textEffectStyles = [
    { id: 'fire', name: 'Fire', emoji: '🔥' },
    { id: 'ice', name: 'Ice', emoji: '❄️' },
    { id: 'gold', name: 'Gold', emoji: '✨' },
    { id: 'neon', name: 'Neon', emoji: '💡' },
    { id: 'galaxy', name: 'Galaxy', emoji: '🌌' },
    { id: 'chrome', name: 'Chrome', emoji: '🪞' },
    { id: 'floral', name: 'Floral', emoji: '🌸' },
    { id: 'electric', name: 'Electric', emoji: '⚡' },
    { id: 'water', name: 'Water', emoji: '🌊' },
    { id: 'diamond', name: 'Diamond', emoji: '💎' },
  ];

  // Simulated AI generation
  const generateImages = async () => {
    if (!prompt.trim() && activeTab !== 'text-effects') return;
    
    setIsGenerating(true);
    setGeneratedImages([]);

    // Build enhanced prompt
    const enhancedPrompt = buildEnhancedPrompt();

    // Simulate generation with progressive loading
    const placeholderImages = [];
    for (let i = 0; i < numImages; i++) {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
      
      const img = {
        id: Date.now() + i,
        prompt: enhancedPrompt,
        style: selectedStyle,
        aspectRatio,
        timestamp: new Date().toISOString(),
        seed: Math.floor(Math.random() * 999999999),
        // Use placeholder images with different themes
        url: getPlaceholderImage(i),
        liked: false,
        downloaded: false,
      };
      placeholderImages.push(img);
      setGeneratedImages([...placeholderImages]);
    }

    // Add to history
    setGenerationHistory(prev => [{
      id: Date.now(),
      prompt: enhancedPrompt,
      images: placeholderImages,
      style: selectedStyle,
      timestamp: new Date().toISOString(),
    }, ...prev]);

    setIsGenerating(false);
  };

  const buildEnhancedPrompt = () => {
    let enhanced = prompt;
    const style = artStyles.find(s => s.id === selectedStyle);
    if (style) enhanced += `, ${style.name} style`;
    enhanced += `, ${colorTone} color tone`;
    enhanced += `, ${lightingStyle} lighting`;
    enhanced += `, ${cameraAngle} camera angle`;
    if (negativePrompt) enhanced += ` | Negative: ${negativePrompt}`;
    return enhanced;
  };

  const getPlaceholderImage = (index) => {
    const themes = [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=800&fit=crop',
    ];
    return themes[index % themes.length];
  };

  // Tab definitions
  const tabs = [
    { id: 'text-to-image', name: 'Text to Image', icon: '🎨', desc: 'Generate images from text' },
    { id: 'generative-fill', name: 'Generative Fill', icon: '🖌️', desc: 'AI-powered inpainting' },
    { id: 'style-transfer', name: 'Style Transfer', icon: '🔄', desc: 'Apply artistic styles' },
    { id: 'text-effects', name: 'Text Effects', icon: '✨', desc: 'Decorative text styles' },
    { id: 'generative-recolor', name: 'Gen Recolor', icon: '🎭', desc: 'AI color variations' },
    { id: 'sketch-to-image', name: 'Sketch to Image', icon: '✏️', desc: 'Convert sketches to art' },
  ];

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.bgAnimation}>
        <div style={styles.bgOrb1}></div>
        <div style={styles.bgOrb2}></div>
        <div style={styles.bgOrb3}></div>
      </div>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <Link href="/">
            <span style={styles.backBtn}>← Back</span>
          </Link>
          <div style={styles.logoArea}>
            <div style={styles.fireflyLogo}>
              <span style={styles.fiText}>Fi</span>
            </div>
            <div>
              <h1 style={styles.title}>Adobe Firefly AI Studio</h1>
              <p style={styles.subtitle}>Powered by GOAT Royalty × Adobe Firefly</p>
            </div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.creditsBox}>
            <span style={styles.creditsIcon}>⚡</span>
            <span style={styles.creditsText}>2,500 Credits</span>
          </div>
          <button 
            style={styles.galleryBtn}
            onClick={() => setShowGallery(!showGallery)}
          >
            🖼️ Gallery ({generationHistory.length})
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav style={styles.tabNav}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            <span style={styles.tabIcon}>{tab.icon}</span>
            <span style={styles.tabName}>{tab.name}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Left Panel - Controls */}
        <div style={styles.leftPanel}>
          {/* Prompt Input */}
          {activeTab !== 'text-effects' ? (
            <div style={styles.promptSection}>
              <label style={styles.label}>Describe your vision</label>
              <textarea
                style={styles.promptInput}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A majestic golden crown floating above a vinyl record, surrounded by musical notes and stardust, cinematic lighting..."
                rows={4}
              />
              <div style={styles.promptActions}>
                <span style={styles.charCount}>{prompt.length}/500</span>
                <button 
                  style={styles.surpriseBtn}
                  onClick={() => {
                    const template = musicTemplates[Math.floor(Math.random() * musicTemplates.length)];
                    setPrompt(template.prompt);
                  }}
                >
                  🎲 Surprise Me
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.promptSection}>
              <label style={styles.label}>Your Text</label>
              <input
                style={styles.textEffectInput}
                value={textEffectText}
                onChange={(e) => setTextEffectText(e.target.value)}
                placeholder="Enter text..."
                maxLength={30}
              />
              <label style={{...styles.label, marginTop: '16px'}}>Effect Style</label>
              <div style={styles.effectGrid}>
                {textEffectStyles.map(effect => (
                  <button
                    key={effect.id}
                    style={{
                      ...styles.effectBtn,
                      ...(textEffectStyle === effect.id ? styles.effectBtnActive : {}),
                    }}
                    onClick={() => setTextEffectStyle(effect.id)}
                  >
                    <span style={{fontSize: '20px'}}>{effect.emoji}</span>
                    <span style={{fontSize: '11px'}}>{effect.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Music Templates */}
          {activeTab === 'text-to-image' && (
            <div style={styles.section}>
              <label style={styles.label}>🎵 Music Templates</label>
              <div style={styles.templateGrid}>
                {musicTemplates.map((template, i) => (
                  <button
                    key={i}
                    style={{
                      ...styles.templateBtn,
                      ...(prompt === template.prompt ? styles.templateBtnActive : {}),
                    }}
                    onClick={() => setPrompt(template.prompt)}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Art Style Selection */}
          <div style={styles.section}>
            <label style={styles.label}>Art Style</label>
            <div style={styles.styleGrid}>
              {artStyles.map(style => (
                <button
                  key={style.id}
                  style={{
                    ...styles.styleBtn,
                    borderColor: selectedStyle === style.id ? style.color : 'rgba(255,255,255,0.1)',
                    background: selectedStyle === style.id ? `${style.color}20` : 'rgba(255,255,255,0.05)',
                  }}
                  onClick={() => setSelectedStyle(style.id)}
                >
                  <span style={{fontSize: '18px'}}>{style.icon}</span>
                  <span style={{fontSize: '11px', color: selectedStyle === style.id ? style.color : '#aaa'}}>{style.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div style={styles.section}>
            <label style={styles.label}>Aspect Ratio</label>
            <div style={styles.ratioGrid}>
              {aspectRatios.map(ratio => (
                <button
                  key={ratio.id}
                  style={{
                    ...styles.ratioBtn,
                    ...(aspectRatio === ratio.id ? styles.ratioBtnActive : {}),
                  }}
                  onClick={() => setAspectRatio(ratio.id)}
                >
                  <span>{ratio.icon}</span>
                  <span style={{fontWeight: 'bold', fontSize: '13px'}}>{ratio.name}</span>
                  <span style={{fontSize: '10px', opacity: 0.6}}>{ratio.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Tone */}
          <div style={styles.section}>
            <label style={styles.label}>Color Tone</label>
            <div style={styles.colorGrid}>
              {colorTones.map(tone => (
                <button
                  key={tone.id}
                  style={{
                    ...styles.colorBtn,
                    borderColor: colorTone === tone.id ? tone.color : 'transparent',
                  }}
                  onClick={() => setColorTone(tone.id)}
                >
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: tone.color,
                  }}></div>
                  <span style={{fontSize: '11px'}}>{tone.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <button 
            style={styles.advancedToggle}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            ⚙️ Advanced Settings {showAdvanced ? '▲' : '▼'}
          </button>

          {showAdvanced && (
            <div style={styles.advancedSection}>
              {/* Lighting */}
              <div style={styles.miniSection}>
                <label style={styles.miniLabel}>Lighting</label>
                <select 
                  style={styles.select}
                  value={lightingStyle}
                  onChange={(e) => setLightingStyle(e.target.value)}
                >
                  {lightingStyles.map(ls => (
                    <option key={ls.id} value={ls.id}>{ls.name}</option>
                  ))}
                </select>
              </div>

              {/* Camera Angle */}
              <div style={styles.miniSection}>
                <label style={styles.miniLabel}>Camera Angle</label>
                <select 
                  style={styles.select}
                  value={cameraAngle}
                  onChange={(e) => setCameraAngle(e.target.value)}
                >
                  <option value="eye-level">Eye Level</option>
                  <option value="low-angle">Low Angle</option>
                  <option value="high-angle">High Angle</option>
                  <option value="birds-eye">Bird's Eye</option>
                  <option value="dutch-angle">Dutch Angle</option>
                  <option value="close-up">Close Up</option>
                  <option value="wide-shot">Wide Shot</option>
                </select>
              </div>

              {/* Guidance Scale */}
              <div style={styles.miniSection}>
                <label style={styles.miniLabel}>Guidance Scale: {guidanceScale}</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={guidanceScale}
                  onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                  style={styles.slider}
                />
              </div>

              {/* Number of Images */}
              <div style={styles.miniSection}>
                <label style={styles.miniLabel}>Number of Images: {numImages}</label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={numImages}
                  onChange={(e) => setNumImages(parseInt(e.target.value))}
                  style={styles.slider}
                />
              </div>

              {/* Negative Prompt */}
              <div style={styles.miniSection}>
                <label style={styles.miniLabel}>Negative Prompt</label>
                <input
                  style={styles.negativeInput}
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="blurry, low quality, distorted..."
                />
              </div>

              {/* Model Selection */}
              <div style={styles.miniSection}>
                <label style={styles.miniLabel}>AI Model</label>
                <select 
                  style={styles.select}
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  <option value="firefly-3">Firefly Image 3 (Latest)</option>
                  <option value="firefly-2">Firefly Image 2</option>
                  <option value="firefly-vector">Firefly Vector</option>
                  <option value="firefly-design">Firefly Design</option>
                </select>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            style={{
              ...styles.generateBtn,
              opacity: isGenerating ? 0.7 : 1,
            }}
            onClick={generateImages}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span style={styles.spinner}></span>
                Generating...
              </>
            ) : (
              <>
                <span style={{fontSize: '20px'}}>✨</span>
                Generate with Firefly AI
              </>
            )}
          </button>
        </div>

        {/* Right Panel - Results */}
        <div style={styles.rightPanel}>
          {showGallery ? (
            /* Gallery View */
            <div style={styles.galleryView}>
              <div style={styles.galleryHeader}>
                <h2 style={styles.galleryTitle}>🖼️ Generation Gallery</h2>
                <button style={styles.closeGallery} onClick={() => setShowGallery(false)}>✕</button>
              </div>
              {generationHistory.length === 0 ? (
                <div style={styles.emptyGallery}>
                  <span style={{fontSize: '48px'}}>🎨</span>
                  <p>Your generated images will appear here</p>
                </div>
              ) : (
                <div style={styles.galleryGrid}>
                  {generationHistory.map(entry => (
                    <div key={entry.id} style={styles.galleryEntry}>
                      <p style={styles.galleryPrompt}>{entry.prompt.substring(0, 80)}...</p>
                      <div style={styles.galleryImages}>
                        {entry.images.map(img => (
                          <img
                            key={img.id}
                            src={img.url}
                            alt="Generated"
                            style={styles.galleryThumb}
                            onClick={() => setSelectedImage(img)}
                          />
                        ))}
                      </div>
                      <span style={styles.galleryTime}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : selectedImage ? (
            /* Full Image View */
            <div style={styles.fullImageView}>
              <div style={styles.fullImageHeader}>
                <button style={styles.backToResults} onClick={() => setSelectedImage(null)}>
                  ← Back to Results
                </button>
                <div style={styles.imageActions}>
                  <button style={styles.actionBtn}>💾 Download</button>
                  <button style={styles.actionBtn}>🔄 Variations</button>
                  <button style={styles.actionBtn}>✏️ Edit</button>
                  <button style={styles.actionBtn}>📤 Share</button>
                </div>
              </div>
              <div style={styles.fullImageContainer}>
                <img src={selectedImage.url} alt="Generated" style={styles.fullImage} />
              </div>
              <div style={styles.imageInfo}>
                <p style={styles.imagePrompt}>{selectedImage.prompt}</p>
                <div style={styles.imageMeta}>
                  <span>Style: {selectedImage.style}</span>
                  <span>Ratio: {selectedImage.aspectRatio}</span>
                  <span>Seed: {selectedImage.seed}</span>
                </div>
              </div>
            </div>
          ) : generatedImages.length > 0 ? (
            /* Generated Results */
            <div style={styles.resultsArea}>
              <div style={styles.resultsHeader}>
                <h2 style={styles.resultsTitle}>Generated Results</h2>
                <span style={styles.resultCount}>{generatedImages.length} images</span>
              </div>
              <div style={styles.resultsGrid}>
                {generatedImages.map((img, index) => (
                  <div 
                    key={img.id} 
                    style={styles.resultCard}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img src={img.url} alt={`Generated ${index + 1}`} style={styles.resultImage} />
                    <div style={styles.resultOverlay}>
                      <div style={styles.resultActions}>
                        <button style={styles.resultActionBtn} onClick={(e) => { e.stopPropagation(); }}>❤️</button>
                        <button style={styles.resultActionBtn} onClick={(e) => { e.stopPropagation(); }}>💾</button>
                        <button style={styles.resultActionBtn} onClick={(e) => { e.stopPropagation(); }}>🔄</button>
                      </div>
                    </div>
                    <div style={styles.resultInfo}>
                      <span style={styles.resultSeed}>Seed: {img.seed}</span>
                    </div>
                  </div>
                ))}
              </div>
              {isGenerating && (
                <div style={styles.loadingMore}>
                  <div style={styles.loadingPulse}></div>
                  <span>Generating more images...</span>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div style={styles.emptyState}>
              <div style={styles.emptyContent}>
                <div style={styles.fireflyLogoLarge}>
                  <span style={styles.fiTextLarge}>Fi</span>
                </div>
                <h2 style={styles.emptyTitle}>Adobe Firefly AI Studio</h2>
                <p style={styles.emptyDesc}>
                  Create stunning visuals for your music with AI-powered image generation.
                  Album covers, concert posters, music videos, and more.
                </p>
                <div style={styles.featureCards}>
                  <div style={styles.featureCard}>
                    <span style={{fontSize: '32px'}}>🎨</span>
                    <h3 style={styles.featureTitle}>Text to Image</h3>
                    <p style={styles.featureDesc}>Describe your vision and watch it come to life</p>
                  </div>
                  <div style={styles.featureCard}>
                    <span style={{fontSize: '32px'}}>🖌️</span>
                    <h3 style={styles.featureTitle}>Generative Fill</h3>
                    <p style={styles.featureDesc}>Remove or add elements with AI precision</p>
                  </div>
                  <div style={styles.featureCard}>
                    <span style={{fontSize: '32px'}}>✨</span>
                    <h3 style={styles.featureTitle}>Text Effects</h3>
                    <p style={styles.featureDesc}>Transform text into stunning visual art</p>
                  </div>
                  <div style={styles.featureCard}>
                    <span style={{fontSize: '32px'}}>🔄</span>
                    <h3 style={styles.featureTitle}>Style Transfer</h3>
                    <p style={styles.featureDesc}>Apply any artistic style to your images</p>
                  </div>
                </div>
                <div style={styles.quickStart}>
                  <p style={styles.quickStartLabel}>Quick Start — Try a template:</p>
                  <div style={styles.quickStartBtns}>
                    {musicTemplates.slice(0, 4).map((t, i) => (
                      <button
                        key={i}
                        style={styles.quickStartBtn}
                        onClick={() => { setPrompt(t.prompt); setActiveTab('text-to-image'); }}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <footer style={styles.footer}>
        <div style={styles.footerStat}>
          <span style={styles.footerStatValue}>{generationHistory.reduce((acc, h) => acc + h.images.length, 0)}</span>
          <span style={styles.footerStatLabel}>Images Generated</span>
        </div>
        <div style={styles.footerStat}>
          <span style={styles.footerStatValue}>{generationHistory.length}</span>
          <span style={styles.footerStatLabel}>Sessions</span>
        </div>
        <div style={styles.footerStat}>
          <span style={styles.footerStatValue}>2,500</span>
          <span style={styles.footerStatLabel}>Credits Remaining</span>
        </div>
        <div style={styles.footerStat}>
          <span style={styles.footerStatValue}>Firefly 3</span>
          <span style={styles.footerStatLabel}>AI Model</span>
        </div>
      </footer>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fireflyOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(100px, -50px) scale(1.2); }
          50% { transform: translate(-50px, 100px) scale(0.8); }
          75% { transform: translate(80px, 60px) scale(1.1); }
        }
        @keyframes fireflyOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-80px, 80px) scale(1.3); }
          66% { transform: translate(60px, -40px) scale(0.9); }
        }
        @keyframes fireflyOrb3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(120px, -80px) scale(1.1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

// ============================================================
// STYLES
// ============================================================
const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0a0f',
    color: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    overflow: 'hidden',
  },
  bgAnimation: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 0,
    pointerEvents: 'none',
  },
  bgOrb1: {
    position: 'absolute',
    width: '400px', height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)',
    top: '10%', left: '20%',
    animation: 'fireflyOrb1 20s ease-in-out infinite',
  },
  bgOrb2: {
    position: 'absolute',
    width: '500px', height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(123,47,247,0.12) 0%, transparent 70%)',
    top: '50%', right: '10%',
    animation: 'fireflyOrb2 25s ease-in-out infinite',
  },
  bgOrb3: {
    position: 'absolute',
    width: '350px', height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)',
    bottom: '10%', left: '40%',
    animation: 'fireflyOrb3 18s ease-in-out infinite',
  },

  // Header
  header: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid rgba(255,107,53,0.2)',
    background: 'rgba(10,10,15,0.9)',
    backdropFilter: 'blur(20px)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  backBtn: {
    color: '#aaa',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '8px 12px',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  fireflyLogo: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #FF6B35, #E8451A)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(255,107,53,0.4)',
  },
  fiText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: '20px',
    fontStyle: 'italic',
  },
  title: {
    fontSize: '20px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #FF6B35, #FFD700)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    color: '#888',
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  creditsBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '20px',
    background: 'rgba(255,107,53,0.15)',
    border: '1px solid rgba(255,107,53,0.3)',
  },
  creditsIcon: { fontSize: '14px' },
  creditsText: { fontSize: '13px', color: '#FF6B35', fontWeight: '600' },
  galleryBtn: {
    padding: '8px 16px',
    borderRadius: '20px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s',
  },

  // Tabs
  tabNav: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    gap: '4px',
    padding: '12px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(10,10,15,0.8)',
    overflowX: 'auto',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '10px',
    background: 'transparent',
    border: '1px solid transparent',
    color: '#888',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  tabActive: {
    background: 'rgba(255,107,53,0.15)',
    border: '1px solid rgba(255,107,53,0.4)',
    color: '#FF6B35',
  },
  tabIcon: { fontSize: '16px' },
  tabName: {},

  // Main Content
  mainContent: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    gap: '0',
    minHeight: 'calc(100vh - 180px)',
  },

  // Left Panel
  leftPanel: {
    width: '380px',
    minWidth: '380px',
    padding: '20px',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 180px)',
    background: 'rgba(15,15,20,0.5)',
  },

  // Prompt Section
  promptSection: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#ccc',
    marginBottom: '8px',
  },
  promptInput: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '14px',
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: '1.5',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  textEffectInput: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '24px',
    fontWeight: '800',
    textAlign: 'center',
    outline: 'none',
    boxSizing: 'border-box',
  },
  promptActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
  },
  charCount: {
    fontSize: '11px',
    color: '#666',
  },
  surpriseBtn: {
    padding: '6px 12px',
    borderRadius: '8px',
    background: 'rgba(255,215,0,0.1)',
    border: '1px solid rgba(255,215,0,0.3)',
    color: '#FFD700',
    cursor: 'pointer',
    fontSize: '12px',
  },

  // Sections
  section: {
    marginBottom: '20px',
  },
  miniSection: {
    marginBottom: '14px',
  },
  miniLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#999',
    marginBottom: '6px',
  },

  // Template Grid
  templateGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  templateBtn: {
    padding: '6px 12px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#aaa',
    cursor: 'pointer',
    fontSize: '11px',
    transition: 'all 0.2s',
  },
  templateBtnActive: {
    background: 'rgba(255,107,53,0.15)',
    borderColor: 'rgba(255,107,53,0.4)',
    color: '#FF6B35',
  },

  // Style Grid
  styleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '6px',
  },
  styleBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '10px 6px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // Aspect Ratio
  ratioGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '6px',
  },
  ratioBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '8px 4px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#aaa',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s',
  },
  ratioBtnActive: {
    background: 'rgba(255,107,53,0.15)',
    borderColor: 'rgba(255,107,53,0.4)',
    color: '#FF6B35',
  },

  // Color Grid
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '6px',
  },
  colorBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '8px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '2px solid transparent',
    color: '#aaa',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // Effect Grid
  effectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '6px',
  },
  effectBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '10px 4px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#aaa',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  effectBtnActive: {
    background: 'rgba(255,107,53,0.15)',
    borderColor: 'rgba(255,107,53,0.4)',
    color: '#FF6B35',
  },

  // Advanced
  advancedToggle: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#888',
    cursor: 'pointer',
    fontSize: '13px',
    marginBottom: '12px',
  },
  advancedSection: {
    padding: '16px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    marginBottom: '16px',
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '13px',
    outline: 'none',
  },
  slider: {
    width: '100%',
    accentColor: '#FF6B35',
  },
  negativeInput: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '12px',
    outline: 'none',
    boxSizing: 'border-box',
  },

  // Generate Button
  generateBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #FF6B35, #E8451A, #FF8C42)',
    border: 'none',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 4px 20px rgba(255,107,53,0.4)',
    transition: 'all 0.3s',
    marginTop: '8px',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  },

  // Right Panel
  rightPanel: {
    flex: 1,
    overflow: 'auto',
    maxHeight: 'calc(100vh - 180px)',
  },

  // Empty State
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
    padding: '40px',
  },
  emptyContent: {
    textAlign: 'center',
    maxWidth: '700px',
  },
  fireflyLogoLarge: {
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #FF6B35, #E8451A)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    boxShadow: '0 8px 30px rgba(255,107,53,0.4)',
  },
  fiTextLarge: {
    color: '#fff',
    fontWeight: '800',
    fontSize: '36px',
    fontStyle: 'italic',
  },
  emptyTitle: {
    fontSize: '28px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #FF6B35, #FFD700)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '12px',
  },
  emptyDesc: {
    fontSize: '15px',
    color: '#888',
    lineHeight: '1.6',
    marginBottom: '32px',
  },
  featureCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '32px',
  },
  featureCard: {
    padding: '20px',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    textAlign: 'center',
  },
  featureTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#fff',
    margin: '8px 0 4px',
  },
  featureDesc: {
    fontSize: '12px',
    color: '#888',
    margin: 0,
  },
  quickStart: {
    padding: '20px',
    borderRadius: '16px',
    background: 'rgba(255,107,53,0.05)',
    border: '1px solid rgba(255,107,53,0.15)',
  },
  quickStartLabel: {
    fontSize: '13px',
    color: '#FF6B35',
    fontWeight: '600',
    marginBottom: '12px',
  },
  quickStartBtns: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
  },
  quickStartBtn: {
    padding: '8px 16px',
    borderRadius: '20px',
    background: 'rgba(255,107,53,0.15)',
    border: '1px solid rgba(255,107,53,0.3)',
    color: '#FF6B35',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },

  // Results
  resultsArea: {
    padding: '20px',
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  resultsTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
  },
  resultCount: {
    fontSize: '13px',
    color: '#888',
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  resultCard: {
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.08)',
    transition: 'all 0.3s',
    aspectRatio: '1',
  },
  resultImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  resultOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(transparent 60%, rgba(0,0,0,0.8))',
    opacity: 0,
    transition: 'opacity 0.3s',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '16px',
  },
  resultActions: {
    display: 'flex',
    gap: '8px',
  },
  resultActionBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  resultInfo: {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
  },
  resultSeed: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.5)',
    background: 'rgba(0,0,0,0.5)',
    padding: '2px 8px',
    borderRadius: '4px',
  },

  // Loading
  loadingMore: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '24px',
    color: '#888',
    fontSize: '14px',
  },
  loadingPulse: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#FF6B35',
    animation: 'pulse 1.5s ease-in-out infinite',
  },

  // Full Image View
  fullImageView: {
    padding: '20px',
  },
  fullImageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  backToResults: {
    padding: '8px 16px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
  },
  imageActions: {
    display: 'flex',
    gap: '8px',
  },
  actionBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    background: 'rgba(255,107,53,0.15)',
    border: '1px solid rgba(255,107,53,0.3)',
    color: '#FF6B35',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
  fullImageContainer: {
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
    marginBottom: '16px',
  },
  fullImage: {
    width: '100%',
    display: 'block',
  },
  imageInfo: {
    padding: '16px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  imagePrompt: {
    fontSize: '14px',
    color: '#ccc',
    lineHeight: '1.5',
    marginBottom: '12px',
  },
  imageMeta: {
    display: 'flex',
    gap: '16px',
    fontSize: '12px',
    color: '#888',
  },

  // Gallery
  galleryView: {
    padding: '20px',
  },
  galleryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  galleryTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
  },
  closeGallery: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyGallery: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
  },
  galleryGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  galleryEntry: {
    padding: '16px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  galleryPrompt: {
    fontSize: '13px',
    color: '#aaa',
    marginBottom: '12px',
  },
  galleryImages: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
  },
  galleryThumb: {
    width: '80px',
    height: '80px',
    borderRadius: '8px',
    objectFit: 'cover',
    cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  galleryTime: {
    fontSize: '11px',
    color: '#666',
    marginTop: '8px',
    display: 'block',
  },

  // Footer
  footer: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'center',
    gap: '40px',
    padding: '16px 24px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(10,10,15,0.9)',
  },
  footerStat: {
    textAlign: 'center',
  },
  footerStatValue: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '700',
    color: '#FF6B35',
  },
  footerStatLabel: {
    fontSize: '11px',
    color: '#666',
  },
};

export default AdobeFireflyStudio;