/**
 * GOAT Force Branding Component
 * Displays GOAT Force branding with actual logo and various styles
 */

import React from 'react';

const GoatBranding = ({ 
  size = 'medium', 
  variant = 'default', 
  glow = false,
  showText = true 
}) => {
  const sizeConfig = {
    small: { img: 'w-8 h-8', text: 'text-lg', sub: 'text-[8px]', gap: 'gap-2', rounded: 'rounded-md' },
    medium: { img: 'w-12 h-12', text: 'text-2xl', sub: 'text-[9px]', gap: 'gap-3', rounded: 'rounded-lg' },
    large: { img: 'w-20 h-20', text: 'text-4xl', sub: 'text-[10px]', gap: 'gap-4', rounded: 'rounded-xl' }
  };

  const variantConfig = {
    default: {
      gradient: 'from-white to-gray-300',
      glow: 'shadow-white/20',
      sub: 'text-gray-400'
    },
    neon: {
      gradient: 'from-red-500 via-yellow-500 to-red-500',
      glow: 'shadow-red-500/30',
      sub: 'text-red-400/60'
    },
    gold: {
      gradient: 'from-yellow-400 via-amber-500 to-yellow-400',
      glow: 'shadow-yellow-500/30',
      sub: 'text-yellow-400/60'
    },
    red: {
      gradient: 'from-red-500 to-red-700',
      glow: 'shadow-red-500/40',
      sub: 'text-red-400/60'
    }
  };

  const s = sizeConfig[size] || sizeConfig.medium;
  const v = variantConfig[variant] || variantConfig.default;
  const glowClass = glow ? `shadow-lg ${v.glow}` : '';
  
  return (
    <div className={`flex items-center ${s.gap}`}>
      <img 
        src="/images/branding/goat-logo.png" 
        alt="GOAT Force" 
        className={`${s.img} ${s.rounded} ${glowClass} transition-all duration-300 hover:scale-110`}
        style={glow ? { filter: 'drop-shadow(0 0 12px rgba(220, 38, 38, 0.4))' } : {}}
      />
      {showText && (
        <div>
          <span className={`${s.text} font-black bg-gradient-to-r ${v.gradient} bg-clip-text text-transparent tracking-tight`}>
            GOAT FORCE
          </span>
          <div className={`${s.sub} font-mono tracking-[0.3em] ${v.sub} -mt-0.5`}>
            ROYALTY COMMAND CENTER
          </div>
        </div>
      )}
    </div>
  );
};

export default GoatBranding;