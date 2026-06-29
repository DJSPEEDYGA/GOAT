/**
 * Main Navigation Component
 * Complete navigation for all GOAT Force pages
 */

import React from 'react';
import Link from 'next/link';
import { 
  Crown, Home, BarChart3, Music, DollarSign, Globe, Shield, 
  Video, Sparkles, Cpu, Shirt, Zap, Users, FileText, Camera,
  Headphones, TrendingUp, Package, Calendar, Monitor, Mic, Target,
  Film, Clapperboard
} from 'lucide-react';

const MainNavigation = () => {
  const navSections = [
    {
      title: 'Main',
      items: [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
        { name: 'Complete Platform', href: '/complete-platform', icon: Crown },
        { name: 'Investor Demo', href: '/investor-demo', icon: TrendingUp }
      ]
    },
    {
      title: 'AI & Intelligence',
      items: [
        { name: '✦ Gemini AI LLM', href: '/gemini-ai', icon: Sparkles },
        { name: '🔥 AI Studio', href: '/ai-studio', icon: Sparkles },
        { name: '🛠️ AI Tools Suite', href: '/ai-tools', icon: Zap },
        { name: '🎨 AI Image Studio', href: '/ai-image-studio', icon: Camera },
        { name: '💻 AI Code Generator', href: '/ai-code', icon: Cpu },
        { name: '✍️ AI Writer', href: '/ai-writer', icon: FileText },
        { name: '🔍 AI Research Agent', href: '/ai-research', icon: Globe },
        { name: '🧠 Deep Research', href: '/deep-research', icon: Target },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Interactive AI', href: '/interactive', icon: Zap },
        { name: 'Search', href: '/search', icon: Globe }
      ]
    },
    {
      title: 'Content Creation',
      items: [
        { name: 'Animation Studio', href: '/animation-studio', icon: Film },
        { name: 'Adobe Firefly AI', href: '/adobe-firefly', icon: Sparkles },
        { name: 'Cinema Camera', href: '/cinema-camera', icon: Video },
        { name: 'Sora AI Studio', href: '/sora-ai-studio', icon: Sparkles },
        { name: 'Media Gallery', href: '/media-gallery', icon: Camera },
        { name: 'Artwork', href: '/artwork', icon: Package }
      ]
    },
    {
      title: 'Music & Catalog',
      items: [
        { name: 'Tracks', href: '/tracks', icon: Music },
        { name: 'Streaming', href: '/streaming', icon: Headphones },
        { name: 'Publishing', href: '/publishing', icon: FileText },
        { name: 'ASAP Catalog', href: '/asap-catalog', icon: Music }
      ]
    },
    {
      title: 'Business',
      items: [
        { name: 'Copyright', href: '/copyright', icon: Shield },
        { name: 'Documents', href: '/documents', icon: FileText },
        { name: 'Contact', href: '/contact', icon: Users },
        { name: 'GOAT Branding', href: '/goat-branding-demo', icon: Crown }
      ]
    },
    {
      title: 'Production',
      items: [
        { name: '🎹 DAW Studio', href: '/daw-studio', icon: Headphones },
        { name: '🎬 Film Production', href: '/film-production', icon: Film },
        { name: '🎤 Voice Studio', href: '/voice-studio', icon: Mic },
        { name: '🎵 Sono Studio', href: '/sono-studio', icon: Music },
        { name: '🎼 ConChord', href: '/conchord', icon: Music }
      ]
    },
    {
      title: 'Technology',
      items: [
        { name: '⛓️ Blockchain', href: '/blockchain', icon: Shield },
        { name: '🎭 Avatar Studio', href: '/avatar-studio', icon: Users },
        { name: 'NVIDIA DGX', href: '/nvidia-dgx', icon: Cpu },
        { name: 'Unreal Engine', href: '/unreal-engine', icon: Monitor },
        { name: '🎮 FiveM Gaming', href: '/fivem-gaming', icon: Monitor }
      ]
    },
    {
      title: 'Social & Business',
      items: [
        { name: '💝 GOAT Connect', href: '/goat-connect', icon: Users },
        { name: '🎵 TikTok Dashboard', href: '/tiktok-dashboard', icon: Music },
        { name: 'Concert Booking', href: '/concert-booking', icon: Mic },
        { name: 'Fashion Store', href: '/fashion-store', icon: Shirt },
        { name: 'Investor Demo', href: '/investor-demo', icon: TrendingUp }
      ]
    },
    {
      title: 'Security & Agents',
      items: [
        { name: 'AI Red Team', href: '/ai-red-team', icon: Target },
        { name: 'CyberWarrior', href: '/cyber-warrior', icon: Shield },
        { name: '🔐 Agent Codex 008', href: '/codex-008', icon: Cpu },
        { name: 'Super Ninja AI', href: '/super-ninja-dashboard', icon: Zap },
        { name: 'MS Vanessa', href: '/ms-vanessa', icon: Shield }
      ]
    }
  ];

  return (
    <nav className="goat-nav sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <img 
                src="/images/branding/goat-icon-64.png" 
                alt="GOAT Force" 
                className="w-10 h-10 rounded-xl goat-glow shadow-red-500/20 group-hover:shadow-red-500/40 transition-all"
              />
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-clip-text text-transparent">GOAT FORCE</h1>
                <p className="text-gray-500 text-[10px] font-mono tracking-widest">ROYALTY COMMAND CENTER</p>
              </div>
            </div>
          </Link>

          {/* Quick Links */}
          <div className="hidden lg:flex items-center gap-2">
            <Link href="/complete-platform">
              <button className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-4 py-2 rounded-xl font-bold transition-all goat-glow shadow-red-500/20">
                Complete Platform
              </button>
            </Link>
            <Link href="/investor-demo">
              <button className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black px-4 py-2 rounded-xl font-bold transition-all goat-glow shadow-yellow-500/20">
                Investor Demo
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="goat-gradient-card goat-gradient-card goat-card-hover/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-semibold transition-all border border-white/10 hover:border-red-500/30">
                Dashboard
              </button>
            </Link>
          </div>
        </div>

        {/* Full Navigation Menu */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-xl p-3">
              <h3 className="text-yellow-500 font-bold text-xs mb-2 uppercase">{section.title}</h3>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <Link key={itemIndex} href={item.href}>
                      <div className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-white/10 px-2 py-1 rounded transition-colors cursor-pointer">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default MainNavigation;