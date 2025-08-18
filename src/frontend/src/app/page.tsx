'use client';

import React from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { SocialNetworkLayout } from '@/components/layout/SocialNetworkLayout';
import { Sidebar } from '@/components/layout/Sidebar';
import { icons } from '@/lib/icons';
import Hero from '@/components/home/Hero';
import ProblemSection from '@/components/home/ProblemSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import RoadmapSection from '@/components/home/RoadmapSection';
import CTASection from '@/components/home/CTASection';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  // If authenticated, show social layout with feed
  if (isAuthenticated) {
    return (
      <SocialNetworkLayout
        sidebar={
          <Sidebar
            user={user ? {
              id: user.id?.toString() || '',
              username: user.username || '',
              displayName: user.username || '', // Using username as fallback
              verified: false, // Default for now
              stats: {
                followers: 0,
                following: 0,
                posts: 0,
              },
            } : undefined}
            navigationItems={[
              { 
                id: 'home', 
                label: 'Home', 
                href: '/', 
                icon: <icons.home className="w-5 h-5" aria-hidden="true" />, 
                active: true 
              },
              { 
                id: 'feed', 
                label: 'Feed', 
                href: '/feed', 
                icon: <icons.feed className="w-5 h-5" aria-hidden="true" /> 
              },
              { 
                id: 'discover', 
                label: 'Discover', 
                href: '/discover', 
                icon: <icons.discover className="w-5 h-5" aria-hidden="true" /> 
              },
              { 
                id: 'notifications', 
                label: 'Notifications', 
                href: '/notifications', 
                icon: <icons.notifications className="w-5 h-5" aria-hidden="true" /> 
              },
              { 
                id: 'messages', 
                label: 'Messages', 
                href: '/messages', 
                icon: <icons.messages className="w-5 h-5" aria-hidden="true" /> 
              },
              { 
                id: 'profile', 
                label: 'Profile', 
                href: '/profile', 
                icon: <icons.profile className="w-5 h-5" aria-hidden="true" /> 
              },
              { 
                id: 'creator', 
                label: 'Creator Hub', 
                href: '/creator', 
                icon: <icons.creator className="w-5 h-5" aria-hidden="true" /> 
              },
              { 
                id: 'settings', 
                label: 'Settings', 
                href: '/settings', 
                icon: <icons.settings className="w-5 h-5" aria-hidden="true" /> 
              },
            ]}
            isAuthenticated={isAuthenticated}
          />
        }
        rightPanel={
          <div className="space-y-4">
            <div className="bg-privacy-background-secondary p-4 rounded-lg shadow-soft">
              <h3 className="text-lg font-heading font-semibold text-privacy-text mb-3">
                What&apos;s happening
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-privacy-text">#deCentralized</p>
                  <p className="text-privacy-text-muted">1,234 posts</p>
                </div>
                <div>
                  <p className="font-medium text-privacy-text">#Web3</p>
                  <p className="text-privacy-text-muted">892 posts</p>
                </div>
                <div>
                  <p className="font-medium text-privacy-text">#Privacy</p>
                  <p className="text-privacy-text-muted">567 posts</p>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <div className="p-6">
          <div className="bg-privacy-background-secondary rounded-lg shadow-soft p-6 mb-6">
            <h1 className="text-2xl font-heading font-bold text-privacy-text mb-4">
              Welcome to deCentra
            </h1>
            <p className="text-privacy-text-muted mb-4">
              Your personalized social feed will appear here. Start following users and creating content!
            </p>
            <button className="bg-privacy-primary hover:bg-privacy-primary/90 text-white px-6 py-2 rounded-lg transition-colors">
              Create Your First Post
            </button>
          </div>
          
          {/* Quick Start Guide */}
          <div className="bg-privacy-background-secondary rounded-lg shadow-soft p-6">
            <h2 className="text-xl font-heading font-semibold text-privacy-text mb-4">
              Quick Start Guide
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-privacy-primary rounded-full flex items-center justify-center text-white text-sm">1</div>
                <span className="text-privacy-text">Complete your profile</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-privacy-secondary rounded-full flex items-center justify-center text-white text-sm">2</div>
                <span className="text-privacy-text">Find and follow interesting users</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-privacy-accent rounded-full flex items-center justify-center text-white text-sm">3</div>
                <span className="text-privacy-text">Share your first post</span>
              </div>
            </div>
          </div>
        </div>
      </SocialNetworkLayout>
    );
  }

  // If not authenticated, show landing page
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
