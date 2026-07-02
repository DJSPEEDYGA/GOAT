/**
 * GOAT Royalty App — Avatar Studio Page
 * D-ID, MetaHuman, DAZ3D avatar creation and Money Penny
 */

import React from 'react';
import Head from 'next/head';
import MainNavigation from '../components/MainNavigation';
import AvatarStudio from '../components/AvatarStudio';

export default function AvatarStudioPage() {
  return (
    <>
      <Head>
        <title>Avatar Studio | GOAT Royalty App</title>
        <meta name="description" content="Create AI-powered avatars with D-ID, MetaHuman, and DAZ 3D. Features Money Penny animated assistant." />
      </Head>
      <MainNavigation />
      <AvatarStudio />
    </>
  );
}