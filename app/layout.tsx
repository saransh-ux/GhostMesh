import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GhostMesh - Real-Time Offline Mesh Network & Security Command Center",
  description: "Decentralized, end-to-end encrypted mesh networking for critical communications with real-time socket relay.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
