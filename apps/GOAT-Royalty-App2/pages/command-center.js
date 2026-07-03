/**
 * GOAT Royalty - Command Center (Alternate Entry Point)
 * Redirects to the Super GOAT Command Center
 */

import React from 'react';
import Head from 'next/head';
import SuperGOATCommandCenter from '../components/SuperGOATCommandCenter';

export default function CommandCenterPage() {
  return (
    <>
      <Head>
        <title>GOAT Royalty | Command Center</title>
        <meta name="description" content="GOAT Royalty App - AI-Powered Music Royalty Management Command Center" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <SuperGOATCommandCenter />
    </>
  );
}