'use client';

import React from 'react';

export default function CTASection() {
  const scrollToFeed = () => {
    const feedSection = document.getElementById('feed');
    if (feedSection) {
      feedSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeveloperCTA = () => {
    alert('Developer APIs coming soon! This will include comprehensive SDKs and documentation.');
  };

  const handleCreatorCTA = () => {
    alert('Creator monetization features coming in Phase 2! Direct tipping and tokenization.');
  };

  const handleOrganizationCTA = () => {
    alert('Enterprise solutions coming soon! Custom deployments for organizations and NGOs.');
  };

  return (
    <section className="py-20 bg-gradient-to-r from-deep-indigo to-electric-blue relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-vibrant-orange/20 rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-8">
          Ready to Build the Future?
        </h2>
        <p className="text-xl text-white/90 font-body mb-12 max-w-2xl mx-auto">
          Join thousands of creators, developers, and communities who are already building 
          the future of decentralized social media.
        </p>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button 
            onClick={scrollToFeed}
            className="btn-primary transform hover:scale-105"
          >
            Start Building
          </button>
          <button 
            onClick={scrollToFeatures}
            className="btn-secondary"
          >
            Explore Platform
          </button>
        </div>

        {/* User Type CTAs */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-3xl mb-4">👨‍💻</div>
            <h3 className="text-xl font-heading font-bold text-white mb-2">Developers</h3>
            <p className="text-white/80 font-body mb-4 text-sm">
              Build on our open platform with comprehensive APIs and SDKs
            </p>
            <button 
              onClick={handleDeveloperCTA}
              className="w-full bg-white/20 text-white px-4 py-2 rounded-lg font-body text-sm hover:bg-white/30 transition-colors"
            >
              View APIs
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-3xl mb-4">🎥</div>
            <h3 className="text-xl font-heading font-bold text-white mb-2">Creators</h3>
            <p className="text-white/80 font-body mb-4 text-sm">
              Monetize your content directly without platform fees
            </p>
            <button 
              onClick={handleCreatorCTA}
              className="w-full bg-white/20 text-white px-4 py-2 rounded-lg font-body text-sm hover:bg-white/30 transition-colors"
            >
              Start Creating
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-3xl mb-4">🏢</div>
            <h3 className="text-xl font-heading font-bold text-white mb-2">Organizations</h3>
            <p className="text-white/80 font-body mb-4 text-sm">
              Deploy custom solutions for your community or organization
            </p>
            <button 
              onClick={handleOrganizationCTA}
              className="w-full bg-white/20 text-white px-4 py-2 rounded-lg font-body text-sm hover:bg-white/30 transition-colors"
            >
              Contact Sales
            </button>
          </div>
        </div>

        {/* Platform Features Preview */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-heading font-bold text-white mb-6">
            Platform Features
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">📝</div>
              <div className="text-white font-body text-sm">Posts & Feed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💬</div>
              <div className="text-white font-body text-sm">Comments & Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🪙</div>
              <div className="text-white font-body text-sm">Tokenization</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🔐</div>
              <div className="text-white font-body text-sm">Identity</div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-wrap justify-center items-center gap-8 text-white/60 font-body text-sm">
            <span>🔓 Open Source</span>
            <span>🌍 Censorship Resistant</span>
            <span>💰 Creator Monetization</span>
            <span>⚡ Built on ICP</span>
            <span>🔒 Zero Platform Fees</span>
          </div>
        </div>
      </div>
    </section>
  );
} 