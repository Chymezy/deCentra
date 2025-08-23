import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from 'geist/font/sans'

import "./globals.css"
import { AuthProvider } from '@/lib/contexts/AuthContext';

export const metadata: Metadata = {
  title: "deCentra - Decentralized Social Media",
  description: "The decentralized social network for a free and open internet. Built on blockchain technology.",
  keywords: ["decentra", "decentralized", "social media", "blockchain", "web3", "censorship resistant"],
  authors: [{ name: "Marksman Green" }],
  creator: "Decentra Team",
  publisher: "Decentra",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://decentra.app",
    title: "Decentra - Decentralized Social Media",
    description: "The decentralized social network for a free and open internet",
    siteName: "deCentra",
  },
  twitter: {
    card: "summary_large_image",
    title: "deCentra - Decentralized Social Media",
    description: "The decentralized social network for a free and open internet",
    creator: "@deCentra_ICP",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={GeistSans.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
