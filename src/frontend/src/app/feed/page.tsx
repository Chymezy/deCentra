'use client';

import Header from '@/components/Header';
import FeedSection from '@/components/home/FeedSection';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';

export default function FeedPage() {
  const { isAuthenticated, principal, login } = useAuth();
  return (
    <>
      <Header />
      <main className="pt-16">
        <FeedSection
          isAuthenticated={isAuthenticated}
          principal={principal}
          login={login}
        />
        <Footer />
      </main>
    </>
  );
}
