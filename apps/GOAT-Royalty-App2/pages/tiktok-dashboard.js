/**
 * 🐐 GOAT Royalty App — TikTok Dashboard Page
 * Full TikTok management hub powered by TikAPI
 * © 2025 Harvey Miller / FASTASSMAN Publishing Inc
 */

import Head from 'next/head';
import dynamic from 'next/dynamic';
import MainNavigation from '../components/MainNavigation';

const TikTokDashboard = dynamic(() => import('../components/TikTokDashboard'), { ssr: false });

export default function TikTokDashboardPage() {
  return (
    <>
      <Head>
        <title>TikTok Dashboard — GOAT Royalty App</title>
        <meta name="description" content="TikTok analytics, profile lookup, video performance, royalty tracking powered by TikAPI — GOAT Royalty App" />
      </Head>
      <MainNavigation />
      <TikTokDashboard />
    </>
  );
}