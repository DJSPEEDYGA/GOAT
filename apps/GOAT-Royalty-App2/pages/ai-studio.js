/**
 * GOAT AI Studio Page - Google AI Studio-style Interface
 * Full-featured AI workspace with all SuperNinja tools
 */

import { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { ArrowLeft, Sparkles } from 'lucide-react';

const AIStudioWorkspace = dynamic(() => import('../components/AIStudioWorkspace'), { ssr: false });

export default function AIStudioPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>GOAT AI Studio | Super GOAT Royalty App</title>
        <meta name="description" content="AI Studio - Google AI Studio-style workspace powered by SuperNinja AI" />
      </Head>

      <div className="min-h-screen bg-gray-950 flex flex-col">
        {/* Compact Header */}
        <header className="flex items-center justify-between px-4 py-2 bg-black/50 border-b border-gray-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/super-goat-command')}
                    className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-yellow-500 to-red-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-black" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-none">GOAT AI Studio</h1>
                <p className="text-[9px] text-gray-500">SuperNinja AI × Google AI Studio</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-600 hidden md:block">Multi-Model AI Workspace</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] text-green-400">Online</span>
          </div>
        </header>

        {/* Main Workspace */}
        <div className="flex-1 overflow-hidden">
          <AIStudioWorkspace />
        </div>
      </div>
    </>
  );
}