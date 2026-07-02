import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamically import the component to avoid SSR issues
const AdvancedAIAgentSystem = dynamic(
  () => import('@/components/AdvancedAIAgentSystem'),
  { ssr: false }
);

export default function AdvancedAIAgentsPage() {
  return (
    <>
      <Head>
        <title>Advanced AI Agents | GOAT Royalty App</title>
        <meta name="description" content="Hierarchical, Autonomous, Multi-Agent AI System with Agentic RAG" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AdvancedAIAgentSystem />
    </>
  );
}