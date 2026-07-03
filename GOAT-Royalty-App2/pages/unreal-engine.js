/**
 * 🎮 Unreal Engine Hub Page — GOAT Force Entertainment
 * Virtual Production, MetaHuman, MetaSounds, ICVFX, Fab Marketplace
 */

import Head from 'next/head';
import UnrealEngineHub from '../components/UnrealEngineHub';

export default function UnrealEnginePage() {
  return (
    <>
      <Head>
        <title>Unreal Engine Hub | GOAT Force Entertainment</title>
        <meta name="description" content="Unreal Engine 5 integration for GOAT Force — Virtual Production, MetaHuman, MetaSounds, ICVFX, concert visualization, and music video production." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <UnrealEngineHub />
    </>
  );
}