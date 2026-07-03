import Head from 'next/head';
import dynamic from 'next/dynamic';

const VideoEditingStudio = dynamic(
  () => import('@/components/VideoEditingStudio'),
  { ssr: false }
);

export default function VideoStudioPage() {
  return (
    <>
      <Head>
        <title>Video Editing Studio | GOAT Royalty App</title>
        <meta name="description" content="Professional 3D Effects, AI Enhancement, Timeline Editor" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <VideoEditingStudio />
    </>
  );
}