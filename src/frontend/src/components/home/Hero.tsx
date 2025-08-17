'use client';

import React from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function Hero() {
  const { login, isAuthenticated } = useAuth();

  const handleGetStarted = async () => {
    if (!isAuthenticated) {
      await login();
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
      className="relative min-h-screen bg-privacy-background flex items-center justify-center overflow-hidden py-20"
    >
      {/* Neumorphic Background Elements */}
      <div className="absolute inset-0">
        {/* Floating neumorphic elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-privacy-background-secondary rounded-full shadow-soft animate-pulse-slow opacity-60"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-privacy-background-secondary rounded-full shadow-medium animate-pulse-slow opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-privacy-background-secondary rounded-full shadow-soft animate-pulse-slow opacity-50"></div>
        <div className="absolute top-1/2 left-1/3 w-8 h-8 bg-privacy-background-secondary rounded-full shadow-soft animate-pulse-slow opacity-30"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '48px 48px'
          }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-7xl mx-auto">
        <div className="animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center justify-center mb-8">
            <div className="bg-privacy-background-secondary border border-privacy-border rounded-full px-6 py-2 shadow-soft">
              <span className="text-privacy-primary font-semibold text-sm">
                ✨ Built on Internet Computer Protocol
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-black text-privacy-text mb-8 leading-tight">
            Own Your
            <span className="block bg-gradient-to-r from-privacy-primary to-privacy-accent bg-clip-text text-transparent">
              Digital Voice
            </span>
          </h1>

          {/* Value Proposition */}
          <p className="text-xl md:text-2xl text-privacy-text-muted max-w-4xl mx-auto mb-12 font-body leading-relaxed">
            The first truly decentralized social platform where you control your data, 
            monetize your content, and build communities that can&apos;t be silenced.
          </p>

          {/* Key Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <Card className="bg-privacy-background-secondary border-privacy-border shadow-soft hover:shadow-medium transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-privacy-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="font-semibold text-privacy-text mb-2">Censorship Resistant</h3>
                <p className="text-sm text-privacy-text-muted">100% on-chain storage. No central authority can silence your voice.</p>
              </CardContent>
            </Card>

            <Card className="bg-privacy-background-secondary border-privacy-border shadow-soft hover:shadow-medium transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-privacy-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="font-semibold text-privacy-text mb-2">Creator Economy</h3>
                <p className="text-sm text-privacy-text-muted">Monetize content with ICP tokens. Direct support from your audience.</p>
              </CardContent>
            </Card>

            <Card className="bg-privacy-background-secondary border-privacy-border shadow-soft hover:shadow-medium transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-privacy-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-semibold text-privacy-text mb-2">Privacy First</h3>
                <p className="text-sm text-privacy-text-muted">Anonymous posting, whistleblower protection, zero tracking.</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-privacy-primary hover:bg-privacy-primary/90 text-white px-8 py-4 text-lg font-semibold shadow-medium hover:shadow-strong transition-all duration-300"
            >
              {isAuthenticated ? 'Go to Feed' : 'Get Started Free'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={scrollToFeatures}
              size="lg"
              className="border-privacy-border text-privacy-text hover:bg-privacy-background-secondary px-8 py-4 text-lg font-semibold shadow-soft hover:shadow-medium transition-all duration-300"
            >
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-privacy-text mb-2">100%</div>
              <div className="text-sm text-privacy-text-muted">On-Chain</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-privacy-text mb-2">∞</div>
              <div className="text-sm text-privacy-text-muted">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-privacy-text mb-2">0</div>
              <div className="text-sm text-privacy-text-muted">Tracking</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-privacy-text mb-2">Web3</div>
              <div className="text-sm text-privacy-text-muted">Native</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-privacy-background to-transparent"></div>
    </section>
  );
}
