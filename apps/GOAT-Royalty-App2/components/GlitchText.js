/**
 * GOAT Royalty App - Glitch Text Effect
 * Eye-catching text animation for headings
 */

import React, { useState, useEffect } from 'react';

const GlitchText = ({ text, className = "" }) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative inline-block ${className}`}>
      <span
        className={`
          relative z-10 text-white
          ${isGlitching ? 'animate-pulse' : ''}
        `}
      >
        {text}
      </span>
      
      {isGlitching && (
        <>
          <span
            className="absolute top-0 left-0 text-purple-500 z-0"
            style={{
              transform: 'translate(-2px, -2px)',
              animation: 'glitch-1 0.3s infinite'
            }}
          >
            {text}
          </span>
          <span
            className="absolute top-0 left-0 text-pink-500 z-0"
            style={{
              transform: 'translate(2px, 2px)',
              animation: 'glitch-2 0.3s infinite'
            }}
          >
            {text}
          </span>
        </>
      )}
      
      <style jsx>{`
        @keyframes glitch-1 {
          0%, 100% {
            clip-path: inset(0 0 0 0);
            transform: translate(-2px, -2px);
          }
          20% {
            clip-path: inset(20% 0 30% 0);
            transform: translate(2px, 2px);
          }
          40% {
            clip-path: inset(50% 0 20% 0);
            transform: translate(-2px, 2px);
          }
          60% {
            clip-path: inset(10% 0 60% 0);
            transform: translate(2px, -2px);
          }
          80% {
            clip-path: inset(80% 0 5% 0);
            transform: translate(-2px, 0);
          }
        }
        
        @keyframes glitch-2 {
          0%, 100% {
            clip-path: inset(0 0 0 0);
            transform: translate(2px, 2px);
          }
          20% {
            clip-path: inset(60% 0 10% 0);
            transform: translate(-2px, -2px);
          }
          40% {
            clip-path: inset(20% 0 50% 0);
            transform: translate(2px, -2px);
          }
          60% {
            clip-path: inset(30% 0 40% 0);
            transform: translate(-2px, 2px);
          }
          80% {
            clip-path: inset(5% 0 80% 0);
            transform: translate(2px, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default GlitchText;