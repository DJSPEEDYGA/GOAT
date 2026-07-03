/**
 * GOAT Royalty App — Blockchain Royalty Tracking Page
 * Smart contract-based transparent royalty distribution
 */

import React from 'react';
import Head from 'next/head';
import MainNavigation from '../components/MainNavigation';
import BlockchainRoyaltyTracker from '../components/BlockchainRoyaltyTracker';

export default function BlockchainPage() {
  return (
    <>
      <Head>
        <title>Blockchain Royalties | GOAT Royalty App</title>
        <meta name="description" content="Transparent blockchain-based royalty tracking and distribution with smart contracts on Polygon" />
      </Head>
      <MainNavigation />
      <BlockchainRoyaltyTracker />
    </>
  );
}