/**
 * Gemini AI LLM Page
 * Full-featured AI chat interface powered by Google Gemini
 * Part of the GOAT Royalty App ecosystem
 * 
 * Security fixes applied per Copilot code review:
 * - Removed dangerouslySetInnerHTML global copyCode script
 *   (code copy now handled via React event delegation in GeminiLLM component)
 * - Fixed viewport meta: removed maximum-scale=1.0 for accessibility
 *   (allows pinch-zoom for low-vision users)
 */

import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with localStorage
const GeminiLLM = dynamic(() => import('../components/GeminiLLM'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#0a0a12',
      color: '#e8e8f0',
      fontFamily: 'Inter, -apple-system, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 60, height: 60,
          background: 'linear-gradient(135deg, #6c63ff, #4ecdc4)',
          borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, margin: '0 auto 20px',
          animation: 'pulse 2s infinite',
          boxShadow: '0 8px 32px rgba(108, 99, 255, 0.3)',
        }}>
          ✦
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Loading Gemini AI...</div>
        <div style={{ fontSize: 13, color: '#6b6b80' }}>Initializing the GOAT Royalty AI Engine</div>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
          }
        `}</style>
      </div>
    </div>
  ),
});

export default function GeminiAIPage() {
  return (
    <>
      <Head>
        <title>Gemini AI LLM | GOAT Royalty App</title>
        <meta name="description" content="Full-featured Gemini AI LLM chat interface - powered by Google's most capable AI models. Built for the GOAT Royalty App ecosystem." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <style>{`
          /* Reset for full-page AI experience */
          body, html { margin: 0; padding: 0; overflow: hidden; height: 100%; }
          #__next { height: 100%; }
        `}</style>
      </Head>
      <GeminiLLM />
    </>
  );
}