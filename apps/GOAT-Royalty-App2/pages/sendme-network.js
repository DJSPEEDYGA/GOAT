/**
 * 📡 SendMe P2P AI Network Page
 * Peer-to-Peer AI Agent Communication & File Sharing
 * © 2025 Harvey Miller / FASTASSMAN Publishing Inc
 */
import dynamic from 'next/dynamic';
import Head from 'next/head';

const SendMeP2PNetwork = dynamic(() => import('../components/SendMeP2PNetwork'), { ssr: false });

export default function SendMeNetworkPage() {
  return (
    <>
      <Head>
        <title>SendMe P2P AI Network | GOAT Royalty</title>
        <meta name="description" content="SendMe P2P AI Network — Two local AI assistants communicating peer-to-peer over LAN. No internet needed. QUIC + TLS 1.3 encrypted." />
      </Head>
      <SendMeP2PNetwork />
    </>
  );
}