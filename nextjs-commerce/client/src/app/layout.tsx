import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GOAT Royalty App",
  description: "Professional royalty management platform with autonomous AI agent, multi-platform analytics, and payment processing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
