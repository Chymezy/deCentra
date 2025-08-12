'use client';

import React from 'react';

export default function Hero() {
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

  return (
    <section
      id="home"
      className="relative min-h-screen bg-gradient-to-br from-deep-indigo via-electric-blue to-vibrant-orange flex items-center justify-center overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-4 h-4 bg-vibrant-orange rounded-full animate-pulse-slow opacity-60"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-electric-blue rounded-full animate-pulse-slow opacity-40"></div>
        <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-white rounded-full animate-pulse-slow opacity-50"></div>
        <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-white rounded-full animate-pulse-slow opacity-30"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        <div className="animate-fade-in">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black text-white mb-8 leading-tight">
            Own Your
            <span className="block bg-gradient-to-r from-vibrant-orange to-white bg-clip-text text-transparent">
              Digital Identity
            </span>
          </h1>

          {/* Value Proposition */}
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-12 font-body leading-relaxed">
            The first truly decentralized social platform where you control your
            data, monetize your content, and build communities that can&apos;t
            be silenced.
          </p>

          {/* Social Proof */}
          <div className="flex flex-wrap justify-center items-center gap-6 mb-12 text-white/80 font-body">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🌐</span>
              <span>Global accessibility</span>
            </div>
            <div className="flex items-center">
              <span className="text-2xl mr-2">🔒</span>
              <span>Zero censorship</span>
            </div>
            <div className="flex items-center">
              <span className="text-2xl mr-2">💰</span>
              <span>Direct monetization</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={scrollToFeed}
              className="btn-primary transform hover:scale-105"
            >
              Start Building
            </button>
            <button onClick={scrollToFeatures} className="btn-secondary">
              Explore Platform
            </button>
          </div>

          {/* Network of People */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-5xl mx-auto">
            <div className="relative">
              {/* Network Grid */}
              <div className="grid grid-cols-3 md:grid-cols-5 gap-8 mb-6 relative z-10">
                {/* People Nodes */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-vibrant-orange rounded-full flex items-center justify-center mb-2 animate-pulse">
                    <span className="text-white font-bold text-lg">👤</span>
                  </div>
                  <div className="text-white/90 font-body text-xs">Creator</div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-vibrant-orange to-deep-indigo rounded-full flex items-center justify-center mb-2 animate-pulse">
                    <span className="text-white font-bold text-lg">👤</span>
                  </div>
                  <div className="text-white/90 font-body text-xs">
                    Developer
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-deep-indigo to-electric-blue rounded-full flex items-center justify-center mb-2 animate-pulse">
                    <span className="text-white font-bold text-lg">👤</span>
                  </div>
                  <div className="text-white/90 font-body text-xs">
                    Community
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-vibrant-orange rounded-full flex items-center justify-center mb-2 animate-pulse">
                    <span className="text-white font-bold text-lg">👤</span>
                  </div>
                  <div className="text-white/90 font-body text-xs">
                    Activist
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-vibrant-orange to-deep-indigo rounded-full flex items-center justify-center mb-2 animate-pulse">
                    <span className="text-white font-bold text-lg">👤</span>
                  </div>
                  <div className="text-white/90 font-body text-xs">
                    Investor
                  </div>
                </div>
              </div>

              {/* Electric Connections - Behind Text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {/* Electric lines connecting all nodes */}
                  <path
                    d="M20 50 Q50 20 80 50 M20 50 Q50 80 80 50 M20 50 Q80 20 80 50 M20 50 Q80 80 80 50"
                    stroke="url(#electricGradient)"
                    strokeWidth="1.5"
                    fill="none"
                    className="animate-pulse"
                    opacity="0.6"
                  />
                  <defs>
                    <linearGradient
                      id="electricGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="50%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Power to the People Text */}
              <div className="text-center mt-6 relative z-10">
                <h3 className="text-2xl font-heading font-bold text-white mb-2">
                  Power to the People
                </h3>
                <p className="text-white/80 font-body text-sm">
                  Connected. Empowered. Uncensored.
                </p>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/60 font-body text-sm">
            <span>🔓 Open Source</span>
            <span>🌍 Censorship Resistant</span>
            <span>💰 Creator Monetization</span>
            <span>⚡ Built on ICP</span>
          </div>
        </div>
      </div>
    </section>
  );
}
