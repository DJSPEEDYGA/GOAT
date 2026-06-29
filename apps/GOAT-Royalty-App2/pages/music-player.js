/**
 * 🎵 SuperGOAT Music Player Page
 * © 2025 Harvey Miller / FASTASSMAN Publishing Inc
 */
import dynamic from 'next/dynamic';
import Head from 'next/head';

const SuperGOATMusicPlayer = dynamic(() => import('../components/SuperGOATMusicPlayer'), { ssr: false });

export default function MusicPlayerPage() {
  return (
    <>
      <Head>
        <title>SuperGOAT Music Player | GOAT Royalty</title>
        <meta name="description" content="SuperGOAT Music Player — Stream and manage the FASTASSMAN Publishing catalog with real-time visualizer and royalty tracking." />
      </Head>
      <SuperGOATMusicPlayer />
    </>
  );
}