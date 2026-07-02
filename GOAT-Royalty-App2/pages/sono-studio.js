/**
 * 🎹 Sono Production Suite — GOAT Royalty App
 * AI-Powered Music Production Hub
 * © 2025 Harvey Miller / FASTASSMAN Publishing Inc
 */

import dynamic from 'next/dynamic';
import Head from 'next/head';

const SonoProductionSuite = dynamic(() => import('../components/SonoProductionSuite'), { ssr: false });

export default function SonoStudioPage() {
  return (
    <>
      <Head>
        <title>Sono Production Suite | GOAT Royalty</title>
        <meta name="description" content="Sono Production Suite — AI-powered music production hub integrating Suno Studio, Sononym, Sonora Cinematic instruments, and professional audio tools for FASTASSMAN Publishing." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SonoProductionSuite />
    </>
  );
}