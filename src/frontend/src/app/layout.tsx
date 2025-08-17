import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'deCentra - Fully On-Chain Social Network',
  description:
    'A censorship-resistant, privacy-first social network built 100% on the Internet Computer Protocol (ICP).',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-privacy-background text-privacy-text min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
