import { useState } from 'react'
import Head from 'next/head'
import ModelRegistry from '../components/ModelRegistry'
import { useRouter } from 'next/router'

export default function ModelRegistryPage() {
  const router = useRouter()
  const [selectedModel, setSelectedModel] = useState(null)

  return (
    <>
      <Head>
        <title>Model Registry | GOAT Royalty</title>
        <meta name="description" content="Browse 100+ AI models across text, code, image, video, audio, and more. Powered by 27+ inference providers." />
      </Head>
      
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-900/30">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => router.back()}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-clip-text text-transparent"
                      style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    🧠 MODEL REGISTRY
                  </h1>
                  <p className="text-gray-400 text-sm mt-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    100+ AI Models • 27+ Inference Providers • Multi-Category Intelligence
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => router.push('/ai-studio')}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-yellow-600 text-white rounded-lg text-sm font-bold hover:from-red-500 hover:to-yellow-500 transition-all"
                >
                  🎨 AI Studio
                </button>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-700 transition-all border border-gray-700"
                >
                  📊 Dashboard
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <div className="text-2xl font-black text-red-500">100+</div>
                <div className="text-gray-400 text-xs">AI Models</div>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <div className="text-2xl font-black text-yellow-500">27+</div>
                <div className="text-gray-400 text-xs">Providers</div>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <div className="text-2xl font-black text-green-500">8</div>
                <div className="text-gray-400 text-xs">Categories</div>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <div className="text-2xl font-black text-blue-500">5</div>
                <div className="text-gray-400 text-xs">Provider Tiers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Model Registry Component */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <ModelRegistry 
            onModelSelect={setSelectedModel}
            selectedModel={selectedModel}
          />
        </div>

        {/* Footer */}
        <div className="max-w-7xl mx-auto px-4 py-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-500">
            <div>
              <h3 className="text-gray-300 font-bold mb-2">🔥 Cloud Primary</h3>
              <p>Google Gemini, OpenAI GPT, Anthropic Claude — enterprise-grade AI.</p>
            </div>
            <div>
              <h3 className="text-gray-300 font-bold mb-2">⚡ Fast Inference</h3>
              <p>Groq, Cerebras, SambaNova — ultra-low latency for real-time apps.</p>
            </div>
            <div>
              <h3 className="text-gray-300 font-bold mb-2">🌐 Open Models</h3>
              <p>Together AI, Fireworks, HuggingFace — best open-source models at scale.</p>
            </div>
          </div>
          <p className="text-gray-600 text-xs mt-6 text-center">
            GOAT Royalty Model Registry • Powered by GOAT Force Intelligence Network
          </p>
        </div>
      </div>
    </>
  )
}