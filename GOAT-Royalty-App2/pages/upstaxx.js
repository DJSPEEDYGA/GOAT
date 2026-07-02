/**
 * 💰 UpStaxx Tax Engine — GOAT Royalty Integration
 * AI-Powered Tax Strategy Platform for Music Professionals
 * © 2025 Harvey Miller / FASTASSMAN Publishing Inc
 */
import dynamic from 'next/dynamic';
import Head from 'next/head';

const UpStaxxTaxEngine = dynamic(() => import('../components/UpStaxxTaxEngine'), { ssr: false });

export default function UpStaxxPage() {
  return (
    <>
      <Head>
        <title>UpStaxx Tax Engine | GOAT Royalty</title>
        <meta name="description" content="UpStaxx × GOAT Royalty — AI-powered tax strategy engine with 350+ strategies, Mr. Green AI advisor, and music industry tax optimization." />
      </Head>
      <UpStaxxTaxEngine />
    </>
  );
}