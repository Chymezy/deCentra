'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function DiscoverPage() {
  return (
    <>
      <Header />
      <main className="pt-16 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Discover</h1>
        <p className="text-lg text-gray-600">Discovery features coming soon.</p>
      </main>
      <Footer />
    </>
  );
}
