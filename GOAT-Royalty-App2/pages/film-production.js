/**
 * GOAT Royalty App — Film Production Hub Page
 * Hollywood cameras, Final Draft, Dolby Atmos, VFX
 */

import React from 'react';
import Head from 'next/head';
import MainNavigation from '../components/MainNavigation';
import FilmProductionHub from '../components/FilmProductionHub';

export default function FilmProductionPage() {
  return (
    <>
      <Head>
        <title>Film Production Hub | GOAT Royalty App</title>
        <meta name="description" content="Complete film production pipeline with Hollywood cameras, Final Draft screenwriting, Dolby Atmos scoring, and VFX tools" />
      </Head>
      <MainNavigation />
      <FilmProductionHub />
    </>
  );
}