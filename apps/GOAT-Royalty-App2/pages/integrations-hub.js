import Head from 'next/head';
import dynamic from 'next/dynamic';

const DataProviderIntegrationHub = dynamic(
  () => import('@/components/DataProviderIntegrationHub'),
  { ssr: false }
);

export default function IntegrationsHubPage() {
  return (
    <>
      <Head>
        <title>Data Provider Integration Hub | GOAT Royalty App</title>
        <meta name="description" content="YouTube, Spotify, Stripe, Apple Music, ASCAP, BMI - Unified Automation" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DataProviderIntegrationHub />
    </>
  );
}