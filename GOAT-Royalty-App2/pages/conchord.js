/**
 * 📄 Ingeta conChord Integration Page
 * Music Contracts, Rights & Royalty Management
 */

import Head from 'next/head';
import ConChordIntegration from '../components/ConChordIntegration';

export default function ConChordPage() {
  return (
    <>
      <Head>
        <title>Ingeta conChord | GOAT Royalty App</title>
        <meta name="description" content="Music contracts, rights and royalty management powered by Ingeta conChord integration" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ConChordIntegration />
    </>
  );
}