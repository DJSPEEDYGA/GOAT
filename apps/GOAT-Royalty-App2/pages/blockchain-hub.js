import Head from 'next/head';
import dynamic from 'next/dynamic';

const BlockchainMiningHub = dynamic(
  () => import('@/components/BlockchainMiningHub'),
  { ssr: false }
);

export default function BlockchainHubPage() {
  return (
    <>
      <Head>
        <title>Blockchain & Crypto Mining Hub | GOAT Royalty App</title>
        <meta name="description" content="Royalty Verification, Crypto Mining, Smart Contracts, NFT Minting" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <BlockchainMiningHub />
    </>
  );
}