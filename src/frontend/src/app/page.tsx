'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import Hero from '@/components/home/Hero';
import ProblemSection from '@/components/home/ProblemSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import RoadmapSection from '@/components/home/RoadmapSection';
import CTASection from '@/components/home/CTASection';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to their feed
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // router.push('/feed');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state during authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-privacy-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-privacy-primary mx-auto mb-4"></div>
          <p className="text-privacy-text">Loading deCentra...</p>
        </div>
      </div>
    );
  }

  // Only show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-privacy-background">
      <Header />
      <main className="pt-16">
        <Hero />
        <ProblemSection />
        <FeaturesSection />
        <RoadmapSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
