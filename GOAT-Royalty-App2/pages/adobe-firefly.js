/**
 * Adobe Firefly AI Studio Page
 * Full-featured AI creative studio for the GOAT Royalty App
 */

import dynamic from 'next/dynamic';
import Head from 'next/head';

const AdobeFireflyStudio = dynamic(
  () => import('../components/AdobeFireflyStudio'),
  { ssr: false }
);

export default function AdobeFireflyPage() {
  return (
    <>
      <Head>
        <title>Adobe Firefly AI Studio | GOAT Royalty</title>
        <meta name="description" content="AI-powered creative studio for music artists. Generate album covers, concert posters, music visuals, and more with Adobe Firefly AI." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AdobeFireflyStudio />
    </>
  );
}