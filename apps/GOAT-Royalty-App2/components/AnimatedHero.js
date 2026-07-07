/**
 * GOAT Force — Animated Hero Section
 * Red/Black/Gold branded hero with GOAT logo and particle effects
 */

import React, { useState, useEffect } from 'react';
import { Play, Sparkles, TrendingUp, Music, DollarSign } from 'lucide-react';

const AnimatedHero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = [...Array(40)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.4 + 0.1
    }));
    setParticles(newParticles);

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(26,0,0,0.85) 0%, rgba(10,10,10,0.7) 40%, rgba(10,10,10,0.7) 60%, rgba(26,5,5,0.85) 100%)' }}>
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(220,38,38,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.08) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          transform: `perspective(1000px) rotateX(${mousePosition.y * 0.01}deg) rotateY(${mousePosition.x * 0.01}deg)`
        }} />
      </div>

      {/* Red ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-yellow-600/3 rounded-full blur-[100px]" />
      </div>

      {/* Floating Particles — Red/Gold */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              background: particle.id % 3 === 0 ? '#DC2626' : particle.id % 3 === 1 ? '#F59E0B' : '#EF4444',
              animation: `float ${particle.speed * 3}s ease-in-out infinite`,
              boxShadow: particle.id % 2 === 0 ? '0 0 8px rgba(220, 38, 38, 0.4)' : '0 0 8px rgba(245, 158, 11, 0.3)'
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        {/* GOAT Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-3xl blur-2xl animate-pulse" />
            <img 
              src="/images/branding/goat-logo.png" 
              alt="GOAT Force" 
              className="relative w-28 h-28 rounded-2xl goat-logo-img"
            />
          </div>
        </div>

        {/* Glowing Title */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-black mb-4" style={{ fontFamily: "var(--font-display)" }}>
            <span className="bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-clip-text text-transparent animate-gradient">
              GOAT FORCE
            </span>
          </h1>
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" />
            <p className="text-2xl md:text-3xl text-white/90 font-light" style={{ fontFamily: "var(--font-heading)", letterSpacing: '0.05em' }}>
              The Future of Music Publishing
            </p>
            <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" />
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
          Track royalties, manage catalogs, and maximize your music publishing revenue with AI-powered analytics and real-time insights.
        </p>

        {/* Stats Cards — Red/Gold themed */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-red-500/5 backdrop-blur-md rounded-xl p-6 border border-red-500/20 transform hover:scale-105 transition-all duration-300 hover:border-red-500/40">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-red-500/20 rounded-full">
                <Music className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>346</div>
            <div className="text-white/70" style={{ fontFamily: "var(--font-heading)", letterSpacing: '0.05em' }}>Works Cataloged</div>
          </div>

          <div className="bg-yellow-500/5 backdrop-blur-md rounded-xl p-6 border border-yellow-500/20 transform hover:scale-105 transition-all duration-300 hover:border-yellow-500/40">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-full">
                <DollarSign className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>$865K+</div>
            <div className="text-white/70" style={{ fontFamily: "var(--font-heading)", letterSpacing: '0.05em' }}>Est. Royalties</div>
          </div>

          <div className="bg-red-500/5 backdrop-blur-md rounded-xl p-6 border border-red-500/20 transform hover:scale-105 transition-all duration-300 hover:border-red-500/40">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-red-500/20 rounded-full">
                <TrendingUp className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>1.2B+</div>
            <div className="text-white/70" style={{ fontFamily: "var(--font-heading)", letterSpacing: '0.05em' }}>Total Streams</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
          <button className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-yellow-600 text-white font-bold rounded-full overflow-hidden transform hover:scale-105 transition-all duration-300 goat-glow shadow-red-500/25">
            <span className="relative z-10 flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span style={{ fontFamily: "var(--font-heading)", letterSpacing: '0.08em' }}>Launch Dashboard</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          <button className="px-8 py-4 bg-white/5 backdrop-blur-md text-white font-semibold rounded-full border border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40 transition-all duration-300 transform hover:scale-105">
            View Demo
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-red-500/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-red-500/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default AnimatedHero;