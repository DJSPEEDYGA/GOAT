/**
 * NINJA MODE UI THEME
 * Dark + Neon cyberpunk theme for GOAT Royalty App
 * Created by SuperNinja - NinjaTech AI
 */

const NinjaTheme = {
  name: 'ninja-dark',
  displayName: 'Ninja Dark',
  version: '1.0.0',
  description: 'Dark cyberpunk theme with neon accents for the ultimate GOAT experience',

  // Color Palette
  colors: {
    // Primary colors
    primary: '#00FF88',       // Neon green
    primaryDark: '#00CC6A',
    primaryLight: '#33FFAA',
    
    // Secondary colors
    secondary: '#FF00FF',     // Neon magenta
    secondaryDark: '#CC00CC',
    secondaryLight: '#FF33FF',
    
    // Accent colors
    accent: '#00FFFF',        // Cyan
    accentDark: '#00CCCC',
    accentLight: '#33FFFF',
    
    // Background colors
    background: {
      primary: '#0A0A0F',     // Very dark blue-black
      secondary: '#12121A',   // Slightly lighter
      tertiary: '#1A1A24',    // Dark gray-blue
      elevated: '#222230'     // Elevated surfaces
    },
    
    // Surface colors
    surface: {
      default: '#1A1A24',
      elevated: '#222230',
      overlay: 'rgba(26, 26, 36, 0.95)',
      backdrop: 'rgba(10, 10, 15, 0.8)'
    },
    
    // Text colors
    text: {
      primary: '#FFFFFF',     // Pure white
      secondary: '#B0B0C0',   // Light gray
      tertiary: '#808090',    // Medium gray
      disabled: '#505060',    // Dark gray
      inverse: '#0A0A0F'      // Background color
    },
    
    // Border colors
    border: {
      default: '#303040',
      focus: '#00FF88',
      error: '#FF4444',
      warning: '#FFAA00',
      success: '#00FF88'
    },
    
    // Status colors
    status: {
      success: '#00FF88',
      warning: '#FFAA00',
      error: '#FF4444',
      info: '#00FFFF',
      neutral: '#808090'
    },
    
    // Gradient colors
    gradients: {
      primary: 'linear-gradient(135deg, #00FF88 0%, #00CC6A 100%)',
      secondary: 'linear-gradient(135deg, #FF00FF 0%, #CC00CC 100%)',
      accent: 'linear-gradient(135deg, #00FFFF 0%, #00CCCC 100%)',
      dark: 'linear-gradient(135deg, #0A0A0F 0%, #12121A 100%)',
      surface: 'linear-gradient(135deg, #1A1A24 0%, #222230 100%)'
    }
  },

  // Typography
  typography: {
    fontFamily: {
      primary: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
      mono: '"Fira Code", "Monaco", "Courier New", monospace',
      display: '"Orbitron", "Segoe UI", sans-serif'
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem'       // 48px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },

  // Spacing
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem'     // 64px
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px'
  },

  // Shadows
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.3)',
    sm: '0 2px 4px rgba(0, 0, 0, 0.4)',
    md: '0 4px 8px rgba(0, 0, 0, 0.5)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.6)',
    xl: '0 16px 32px rgba(0, 0, 0, 0.7)',
    '2xl': '0 24px 48px rgba(0, 0, 0, 0.8)',
    neon: '0 0 10px rgba(0, 255, 136, 0.5), 0 0 20px rgba(0, 255, 136, 0.3)',
    neonAccent: '0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.3)'
  },

  // Animations
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  },

  // Component styles
  components: {
    button: {
      primary: {
        background: 'linear-gradient(135deg, #00FF88 0%, #00CC6A 100%)',
        color: '#0A0A0F',
        hover: {
          background: 'linear-gradient(135deg, #33FFAA 0%, #00FF88 100%)',
          boxShadow: '0 0 20px rgba(0, 255, 136, 0.5)'
        }
      },
      secondary: {
        background: 'linear-gradient(135deg, #FF00FF 0%, #CC00CC 100%)',
        color: '#FFFFFF',
        hover: {
          background: 'linear-gradient(135deg, #FF33FF 0%, #FF00FF 100%)',
          boxShadow: '0 0 20px rgba(255, 0, 255, 0.5)'
        }
      },
      ghost: {
        background: 'transparent',
        color: '#00FF88',
        border: '1px solid #00FF88',
        hover: {
          background: 'rgba(0, 255, 136, 0.1)',
          boxShadow: '0 0 10px rgba(0, 255, 136, 0.3)'
        }
      }
    },
    card: {
      background: 'linear-gradient(135deg, #1A1A24 0%, #222230 100%)',
      border: '1px solid #303040',
      hover: {
        border: '1px solid #00FF88',
        boxShadow: '0 0 15px rgba(0, 255, 136, 0.2)'
      }
    },
    input: {
      background: '#0A0A0F',
      border: '1px solid #303040',
      color: '#FFFFFF',
      focus: {
        border: '1px solid #00FF88',
        boxShadow: '0 0 10px rgba(0, 255, 136, 0.3)'
      }
    },
    scrollbar: {
      width: '8px',
      track: '#1A1A24',
      thumb: '#303040',
      hover: {
        thumb: '#00FF88'
      }
    }
  },

  // Effects
  effects: {
    glassmorphism: {
      background: 'rgba(26, 26, 36, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    neonGlow: {
      primary: '0 0 10px rgba(0, 255, 136, 0.5), 0 0 20px rgba(0, 255, 136, 0.3)',
      secondary: '0 0 10px rgba(255, 0, 255, 0.5), 0 0 20px rgba(255, 0, 255, 0.3)',
      accent: '0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.3)'
    }
  },

  // CSS Variables for easy integration
  cssVariables: {
    '--ninja-primary': '#00FF88',
    '--ninja-primary-dark': '#00CC6A',
    '--ninja-primary-light': '#33FFAA',
    '--ninja-secondary': '#FF00FF',
    '--ninja-secondary-dark': '#CC00CC',
    '--ninja-secondary-light': '#FF33FF',
    '--ninja-accent': '#00FFFF',
    '--ninja-accent-dark': '#00CCCC',
    '--ninja-accent-light': '#33FFFF',
    '--ninja-bg-primary': '#0A0A0F',
    '--ninja-bg-secondary': '#12121A',
    '--ninja-bg-tertiary': '#1A1A24',
    '--ninja-bg-elevated': '#222230',
    '--ninja-text-primary': '#FFFFFF',
    '--ninja-text-secondary': '#B0B0C0',
    '--ninja-text-tertiary': '#808090',
    '--ninja-text-disabled': '#505060',
    '--ninja-border-default': '#303040',
    '--ninja-border-focus': '#00FF88',
    '--ninja-status-success': '#00FF88',
    '--ninja-status-warning': '#FFAA00',
    '--ninja-status-error': '#FF4444',
    '--ninja-status-info': '#00FFFF'
  },

  // Get CSS string
  getCSS() {
    return `
      :root {
        ${Object.entries(this.cssVariables)
          .map(([key, value]) => `${key}: ${value};`)
          .join('\n        ')}
      }
      
      * {
        scrollbar-width: thin;
        scrollbar-color: var(--ninja-border-default) var(--ninja-bg-secondary);
      }
      
      *::-webkit-scrollbar {
        width: 8px;
      }
      
      *::-webkit-scrollbar-track {
        background: var(--ninja-bg-secondary);
      }
      
      *::-webkit-scrollbar-thumb {
        background: var(--ninja-border-default);
        border-radius: 4px;
      }
      
      *::-webkit-scrollbar-thumb:hover {
        background: var(--ninja-primary);
      }
    `;
  },

  // Get JSON config
  toJSON() {
    return {
      name: this.name,
      displayName: this.displayName,
      version: this.version,
      description: this.description,
      colors: this.colors,
      typography: this.typography,
      spacing: this.spacing,
      borderRadius: this.borderRadius,
      shadows: this.shadows,
      animations: this.animations,
      components: this.components,
      effects: this.effects,
      cssVariables: this.cssVariables
    };
  }
};

// Export for use in app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NinjaTheme;
}