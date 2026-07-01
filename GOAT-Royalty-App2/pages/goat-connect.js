/**
 * GOAT Royalty App — GOAT Connect Page
 * Music industry social networking, collaboration & dating
 */

import React from 'react';
import Head from 'next/head';
import MainNavigation from '../components/MainNavigation';
import GOATConnect from '../components/GOATConnect';

export default function GOATConnectPage() {
  return (
    <>
      <Head>
        <title>GOAT Connect | Music Industry Networking & Dating</title>
        <meta name="description" content="Connect with music industry professionals, find collaborators, and meet your creative soulmate on GOAT Connect" />
      </Head>
      <MainNavigation />
      <GOATConnect />
    </>
  );
}