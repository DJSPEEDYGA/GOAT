// 🐐 GOAT Branding Demo Page
// Showcase all GOAT branding components and features

import React, { useState } from 'react';
import GoatBranding, { 
  GoatHero, 
  GoatHeader, 
  GoatSidebarLogo, 
  GoatLoadingScreen,
  GoatBackgroundPattern 
} from '../components/GoatBranding';
import EnhancedVideoBackground from '../components/EnhancedVideoBackground';

const GoatBrandingDemo = () => {
  const [selectedVariant, setSelectedVariant] = useState('default');
  const [showBackground, setShowBackground] = useState(true);

  const variants = ['default', 'premium', 'stealth', 'neon'];
  const sizes = ['small', 'medium', 'large', 'xlarge'];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* 🎬 Enhanced Video Background */}
      {showBackground && (
        <EnhancedVideoBackground
          showGoatLogo={true}
          logoPosition="center"
          autoPlay={true}
          muted={true}
          loop={true}
        />
      )}

      {/* 📱 Content */}
      <div className="relative z-10">
        {/* 🐐 Header */}
        <GoatHeader className="p-6" />

        {/* 🎯 Main Content */}
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-4xl font-black text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400">
            GOAT Branding Showcase
          </h1>

          {/* 🎛️ Controls */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-12 border border-white/20">
            <h2 className="text-2xl font-bold mb-6">Branding Controls</h2>
            
            {/* Variant Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Variant:</label>
              <div className="flex flex-wrap gap-2">
                {variants.map(variant => (
                  <button
                    key={variant}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      selectedVariant === variant
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {variant.charAt(0).toUpperCase() + variant.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Toggle */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={showBackground}
                  onChange={(e) => setShowBackground(e.target.checked)}
                  className="w-5 h-5 rounded text-purple-600"
                />
                <span>Show Video Background</span>
              </label>
            </div>
          </div>

          {/* 🎨 Branding Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Size Variations */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4">Size Variations</h3>
              <div className="space-y-6">
                {sizes.map(size => (
                  <div key={size} className="flex justify-center">
                    <GoatBranding 
                      size={size} 
                      variant={selectedVariant}
                      className="transform hover:scale-110 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Variant Showcase */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4">All Variants</h3>
              <div className="grid grid-cols-2 gap-4">
                {variants.map(variant => (
                  <div key={variant} className="text-center">
                    <GoatBranding 
                      size="small" 
                      variant={variant}
                      className="mb-2"
                    />
                    <p className="text-xs text-white/60">{variant}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Components */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4">Special Components</h3>
              <div className="space-y-6">
                <div className="text-center">
                  <GoatBranding 
                    size="medium" 
                    variant="logo-only"
                    className="transform hover:scale-110 transition-transform"
                  />
                  <p className="text-xs text-white/60 mt-2">Logo Only</p>
                </div>
                
                <div className="text-center">
                  <GoatSidebarLogo />
                  <p className="text-xs text-white/60 mt-2">Sidebar Logo</p>
                </div>
              </div>
            </div>
          </div>

          {/* 🌟 Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Features */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold mb-6">🐐 GOAT Features</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Ultra-realistic poster designs</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Dynamic video backgrounds</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span>Animated particle effects</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Glow and animation effects</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Multiple branding variants</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span>Responsive design</span>
                </li>
              </ul>
            </div>

            {/* Usage Examples */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold mb-6">📱 Usage Examples</h3>
              <div className="space-y-4">
                <div className="bg-black/30 rounded-lg p-4">
                  <code className="text-sm text-green-400">
                    {'<GoatBranding size="large" variant="neon" />'}
                  </code>
                  <p className="text-xs text-white/60 mt-2">Large neon variant</p>
                </div>
                
                <div className="bg-black/30 rounded-lg p-4">
                  <code className="text-sm text-green-400">
                    {'<EnhancedVideoBackground showGoatLogo />'}
                  </code>
                  <p className="text-xs text-white/60 mt-2">Video with GOAT logo</p>
                </div>
                
                <div className="bg-black/30 rounded-lg p-4">
                  <code className="text-sm text-green-400">
                    {'<GoatHeader />'}
                  </code>
                  <p className="text-xs text-white/60 mt-2">Complete header</p>
                </div>
              </div>
            </div>
          </div>

          {/* 🎯 Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-8 border border-purple-500/30">
              <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-400">
                GOAT Royalty Platform
              </h2>
              <p className="text-xl text-white/80 mb-6">
                Greatest Of All Time Music Publishing Experience
              </p>
              <div className="flex justify-center space-x-4">
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
                  Launch Dashboard
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white font-bold rounded-full border border-white/20 hover:bg-white/20 transition-all">
                  View Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoatBrandingDemo;