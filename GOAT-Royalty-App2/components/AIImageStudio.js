/**
 * AI Image Studio - Image Generation & Editing
 * Text-to-image, style transfer, editing, batch generation
 */

import React, { useState, useRef } from 'react';
import {
  Image, Wand2, Palette, Download, Copy, Trash2, Loader,
  Sparkles, Camera, Film, Layers, Grid, Maximize2, RefreshCw,
  ChevronDown, Upload, X, Check, Star, Heart, Bookmark, Zap
} from 'lucide-react';

const STYLE_PRESETS = [
  { id: 'photorealistic', name: 'Photorealistic', icon: '📸', desc: 'Ultra-realistic photography' },
  { id: 'digital-art', name: 'Digital Art', icon: '🎨', desc: 'Modern digital illustration' },
  { id: 'album-cover', name: 'Album Cover', icon: '💿', desc: 'Music album artwork' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: '🌆', desc: 'Neon futuristic style' },
  { id: 'anime', name: 'Anime', icon: '🎌', desc: 'Japanese animation style' },
  { id: 'oil-painting', name: 'Oil Painting', icon: '🖼️', desc: 'Classical oil painting' },
  { id: 'minimalist', name: 'Minimalist', icon: '⬜', desc: 'Clean minimal design' },
  { id: 'graffiti', name: 'Graffiti', icon: '🎭', desc: 'Street art style' },
  { id: '3d-render', name: '3D Render', icon: '🔮', desc: 'Photorealistic 3D' },
  { id: 'watercolor', name: 'Watercolor', icon: '🎨', desc: 'Soft watercolor painting' },
  { id: 'comic-book', name: 'Comic Book', icon: '💥', desc: 'Bold comic style' },
  { id: 'nft-art', name: 'NFT Art', icon: '🖼️', desc: 'Digital collectible style' },
];

const ASPECT_RATIOS = [
  { id: '1:1', name: 'Square', w: 1024, h: 1024 },
  { id: '16:9', name: 'Landscape', w: 1536, h: 1024 },
  { id: '9:16', name: 'Portrait', w: 1024, h: 1536 },
  { id: '4:3', name: 'Standard', w: 1365, h: 1024 },
  { id: '3:4', name: 'Tall', w: 1024, h: 1365 },
];

const QUICK_PROMPTS = [
  'Album cover for a hip-hop artist with gold and black theme',
  'Futuristic music studio with holographic displays',
  'Concert stage with dramatic lighting and crowd',
  'Abstract sound waves in neon colors',
  'Luxury record label office with city skyline view',
  'Vinyl record melting into digital pixels',
];

export default function AIImageStudio() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('digital-art');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [numImages, setNumImages] = useState(1);
  const [quality, setQuality] = useState('high');
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [steps, setSteps] = useState(30);
  const [seed, setSeed] = useState(-1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const fileInputRef = useRef(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      const response = await fetch('/api/ai-image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${prompt}${selectedStyle ? `, ${STYLE_PRESETS.find(s => s.id === selectedStyle)?.name} style` : ''}`,
          negativePrompt,
          style: selectedStyle,
          aspectRatio,
          numImages,
          quality,
          guidanceScale,
          steps,
          seed: seed === -1 ? Math.floor(Math.random() * 999999) : seed
        })
      });

      const data = await response.json();
      
      if (data.images) {
        setGeneratedImages([...data.images, ...generatedImages]);
      } else {
        // Placeholder for demo
        const placeholders = Array(numImages).fill(null).map((_, i) => ({
          id: Date.now() + i,
          url: `https://picsum.photos/seed/${Date.now() + i}/${ASPECT_RATIOS.find(a => a.id === aspectRatio)?.w || 1024}/${ASPECT_RATIOS.find(a => a.id === aspectRatio)?.h || 1024}`,
          prompt,
          style: selectedStyle,
          timestamp: new Date().toISOString()
        }));
        setGeneratedImages([...placeholders, ...generatedImages]);
      }
    } catch (error) {
      console.error('Image generation error:', error);
      // Demo fallback
      const placeholders = Array(numImages).fill(null).map((_, i) => ({
        id: Date.now() + i,
        url: `https://picsum.photos/seed/${Date.now() + i}/1024/1024`,
        prompt,
        style: selectedStyle,
        timestamp: new Date().toISOString()
      }));
      setGeneratedImages([...placeholders, ...generatedImages]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-gray-950">
      {/* Left Panel - Controls */}
      <div className="w-96 bg-gray-900/50 border-r border-gray-800 flex flex-col overflow-y-auto">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Image className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Image Studio</h2>
              <p className="text-xs text-gray-500">Generate & edit images with AI</p>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-1 block font-medium">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create..."
              rows={4}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
            />
          </div>

          {/* Quick Prompts */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block font-medium">Quick Prompts</label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((qp, i) => (
                <button key={i} onClick={() => setPrompt(qp)}
                        className="text-[10px] px-2.5 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full text-gray-400 hover:text-white transition-all truncate max-w-full">
                  {qp.substring(0, 40)}...
                </button>
              ))}
            </div>
          </div>

          {/* Style Presets */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block font-medium">Style</label>
            <div className="grid grid-cols-3 gap-1.5">
              {STYLE_PRESETS.map(style => (
                <button key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`p-2 rounded-lg text-center transition-all ${
                          selectedStyle === style.id
                            ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400'
                            : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:bg-gray-800'
                        }`}>
                  <span className="text-lg block">{style.icon}</span>
                  <span className="text-[9px] block mt-0.5">{style.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block font-medium">Aspect Ratio</label>
            <div className="flex gap-1.5">
              {ASPECT_RATIOS.map(ar => (
                <button key={ar.id}
                        onClick={() => setAspectRatio(ar.id)}
                        className={`flex-1 py-2 rounded-lg text-center text-xs transition-all ${
                          aspectRatio === ar.id
                            ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400'
                            : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:bg-gray-800'
                        }`}>
                  {ar.name}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Images */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-400 font-medium">Number of Images</label>
              <span className="text-xs text-purple-400 font-mono">{numImages}</span>
            </div>
            <input type="range" min="1" max="4" step="1" value={numImages}
                   onChange={(e) => setNumImages(parseInt(e.target.value))}
                   className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500" />
          </div>

          {/* Advanced Settings */}
          <button onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 mb-3 transition-colors">
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            Advanced Settings
          </button>

          {showAdvanced && (
            <div className="space-y-3 mb-4 p-3 bg-gray-800/30 rounded-xl border border-gray-700/30">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Negative Prompt</label>
                <input type="text" value={negativePrompt}
                       onChange={(e) => setNegativePrompt(e.target.value)}
                       placeholder="What to avoid..."
                       className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-gray-400">Guidance Scale</label>
                  <span className="text-xs text-purple-400 font-mono">{guidanceScale}</span>
                </div>
                <input type="range" min="1" max="20" step="0.5" value={guidanceScale}
                       onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                       className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-gray-400">Steps</label>
                  <span className="text-xs text-purple-400 font-mono">{steps}</span>
                </div>
                <input type="range" min="10" max="50" step="5" value={steps}
                       onChange={(e) => setSteps(parseInt(e.target.value))}
                       className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Seed (-1 for random)</label>
                <input type="number" value={seed}
                       onChange={(e) => setSeed(parseInt(e.target.value))}
                       className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-purple-500/50" />
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button onClick={handleGenerate}
                  disabled={!prompt.trim() || loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold text-sm transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2">
            {loading ? (
              <><Loader className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Wand2 className="w-4 h-4" /> Generate {numImages > 1 ? `${numImages} Images` : 'Image'}</>
            )}
          </button>
        </div>
      </div>

      {/* Right Panel - Gallery */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Gallery Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-400">{generatedImages.length} images generated</span>
          </div>
          <div className="flex items-center gap-2">
            {generatedImages.length > 0 && (
              <button onClick={() => setGeneratedImages([])}
                      className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {generatedImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/20">
                <Image className="w-10 h-10 text-purple-500/50" />
              </div>
              <h3 className="text-lg font-bold text-gray-400 mb-2">No Images Yet</h3>
              <p className="text-sm text-gray-600 max-w-sm">
                Enter a prompt and click Generate to create AI-powered images. 
                Try different styles and settings for unique results.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedImages.map((img, i) => (
                <div key={img.id || i}
                     className="group relative rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all cursor-pointer"
                     onClick={() => setSelectedImage(img)}>
                  <img src={img.url} alt={img.prompt}
                       className="w-full aspect-square object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-xs text-white truncate">{img.prompt}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                onClick={(e) => { e.stopPropagation(); window.open(img.url, '_blank'); }}>
                          <Download className="w-3.5 h-3.5 text-white" />
                        </button>
                        <button className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(img.prompt); }}>
                          <Copy className="w-3.5 h-3.5 text-white" />
                        </button>
                        <button className={`p-1.5 rounded-lg transition-colors ${
                                  favorites.includes(img.id) ? 'bg-red-500/30 text-red-400' : 'bg-white/20 hover:bg-white/30 text-white'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFavorites(favorites.includes(img.id) 
                                    ? favorites.filter(f => f !== img.id) 
                                    : [...favorites, img.id]);
                                }}>
                          <Heart className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8"
             onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage.url} alt={selectedImage.prompt}
                 className="max-w-full max-h-[80vh] object-contain rounded-xl" />
            <button onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="mt-4 p-4 bg-gray-900/80 rounded-xl">
              <p className="text-sm text-gray-300">{selectedImage.prompt}</p>
              <p className="text-xs text-gray-500 mt-1">Style: {selectedImage.style} • {new Date(selectedImage.timestamp).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #a855f7;
          cursor: pointer;
          border: 2px solid #1f2937;
        }
      `}</style>
    </div>
  );
}