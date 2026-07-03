/**
 * 💰 SuperGOAT Royalty Engine Page
 * © 2025 Harvey Miller / FASTASSMAN Publishing Inc
 */
import dynamic from 'next/dynamic';
import Head from 'next/head';

const SuperGOATRoyaltyEngine = dynamic(() => import('../components/SuperGOATRoyaltyEngine'), { ssr: false });

export default function RoyaltyEnginePage() {
  return (
    <>
      <Head>
        <title>Royalty Engine | GOAT Royalty</title>
        <meta name="description" content="SuperGOAT Royalty Engine — Live royalty calculation across all streaming platforms for the FASTASSMAN Publishing catalog." />
      </Head>
      <SuperGOATRoyaltyEngine />
    </>
  );
}