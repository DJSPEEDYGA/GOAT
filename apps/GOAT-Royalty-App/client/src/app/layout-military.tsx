import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import "./globals-military.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani", 
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "GOAT ROYALTY APP - MILITARY MISSION CONTROL",
  description: "Military-grade mission control center for GOAT Force royalty management. Supreme Commander DJ Speedy's tactical operations hub.",
  keywords: ["GOAT Force", "Military Mission Control", "Royalty Management", "DJ Speedy", "Waka Flocka Flame"],
  authors: [{ name: "DJ Speedy", url: "https://goatforce.com" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#2d4a2b",
  colorScheme: "dark",
};

export default function MilitaryRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/goat-assets/images/THE GOAT.webp" sizes="any" />
        <link rel="apple-touch-icon" href="/goat-assets/images/THE GOAT.webp" />
        <meta name="apple-mobile-web-app-title" content="GOAT Mission Control" />
        <meta name="application-name" content="GOAT Mission Control" />
        <meta name="msapplication-TileColor" content="#2d4a2b" />
        <meta name="theme-color" content="#2d4a2b" />
      </head>
      <body
        className={`${orbitron.variable} ${rajdhani.variable} antialiased`}
        style={{
          background: 'linear-gradient(135deg, #1a2f1a 0%, #0f0f0f 100%)',
          minHeight: '100vh',
          overflowX: 'hidden'
        }}
      >
        {children}
        
        {/* Preload critical assets */}
        <link rel="preload" href="/goat-assets/videos/MAIN GOAT VIDEO 2.mp4" as="video" />
        <link rel="preload" href="/goat-assets/images/THE GOAT.webp" as="image" />
      </body>
    </html>
  );
}