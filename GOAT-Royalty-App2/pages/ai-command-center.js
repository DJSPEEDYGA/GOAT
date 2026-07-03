import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamically import AICommandCenter to avoid SSR issues
const AICommandCenter = dynamic(() => import('../components/AICommandCenter'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading AI Command Center...</p>
      </div>
    </div>
  ),
});

export default function AICommandCenterPage() {
  return (
    <>
      <Head>
        <title>AI Command Center | GOAT Royalty App</title>
        <meta name="description" content="Autonomous AI-powered music royalty management with 215+ NVIDIA LLMs and GOAT Force LLM" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AICommandCenter />
    </>
  );
}