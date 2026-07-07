/**
 * AI Tools Hub Page
 */
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

const SuperNinjaToolsSuite = dynamic(() => import('../components/SuperNinjaToolsSuite'), { ssr: false });

export default function AIToolsPage() {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>AI Tools Suite | Super GOAT Royalty App</title>
      </Head>
      <div className="min-h-screen bg-gray-950">
        <header className="flex items-center gap-3 px-6 py-4 border-b border-gray-800/50">
          <button onClick={() => router.push('/super-goat-command')} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-sm font-bold text-white">AI Tools Suite</h1>
        </header>
        <SuperNinjaToolsSuite />
      </div>
    </>
  );
}