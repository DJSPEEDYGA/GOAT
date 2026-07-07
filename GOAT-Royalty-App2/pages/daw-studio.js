/**
 * GOAT Royalty App — DAW Studio Integration Page
 * Connect all your Digital Audio Workstations to GOAT
 */

import React from 'react';
import Head from 'next/head';
import MainNavigation from '../components/MainNavigation';
import DAWIntegrationHub from '../components/DAWIntegrationHub';

export default function DAWStudioPage() {
  return (
    <>
      <Head>
        <title>DAW Studio | GOAT Royalty App</title>
        <meta name="description" content="Connect Logic Pro, Ableton, FL Studio, Pro Tools, Cubase, and Akai MPC to your GOAT Royalty platform" />
      </Head>
      <MainNavigation />
      <DAWIntegrationHub />
    </>
  );
}