/**
 * Deep Research Page
 */
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Brain } from 'lucide-react';
import dynamic from 'next/dynamic';

const DeepResearchPanel = dynamic(() => import('../components/DeepResearchPanel'), { ssr: false });

export default function DeepResearchPage() {
  const router = useRouter();
  return (
    <>
      <Head><title>Deep Research | Super GOAT Royalty App</title></Head>
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <header className="flex items-center justify-between px-4 py-2 bg-black/50 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/ai-tools')} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-none">Deep Research</h1>
                <p className="text-[9px] text-gray-500">In-depth analysis & planning</p>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-hidden"><DeepResearchPanel /></div>
      </div>
    </>
  );
}