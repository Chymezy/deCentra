import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthContext';

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
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
