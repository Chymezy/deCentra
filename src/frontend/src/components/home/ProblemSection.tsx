'use client';

import React from 'react';

export default function ProblemSection() {
  const challenges = [
    {
      icon: "🔐",
      title: "Data Ownership",
      description: "Your content, your rules. No more algorithms deciding what you see or who sees you.",
      highlight: "Complete data sovereignty"
    },
    {
      icon: "💎",
      title: "Direct Monetization",
      description: "Keep 100% of your earnings. No platform fees, no intermediaries taking cuts.",
      highlight: "Zero platform fees"
    },
    {
      icon: "🌍",
      title: "Global Reach",
      description: "Access from anywhere, anytime. No regional restrictions or content blocking.",
      highlight: "Borderless connectivity"
    }
  ];

  const scrollToFeed = () => {
    const feedSection = document.getElementById('feed');
    if (feedSection) {
      feedSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="explore" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-deep-indigo mb-6">
            Why deCentra is Different
          </h2>
          <p className="text-xl text-charcoal-black/70 font-body max-w-3xl mx-auto">
            We&apos;re not just building another social platform. We&apos;re creating the foundation for digital freedom.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {challenges.map((challenge, index) => (
            <div key={index} className="bg-gradient-to-br from-deep-indigo/5 to-electric-blue/5 p-8 rounded-2xl border border-deep-indigo/10 hover:shadow-lg transition-all duration-300">
              <div className="text-4xl mb-4">{challenge.icon}</div>
              <h3 className="text-2xl font-heading font-bold text-deep-indigo mb-4">
                {challenge.title}
              </h3>
              <p className="text-charcoal-black/80 font-body mb-4">
                {challenge.description}
              </p>
              <div className="bg-deep-indigo/10 text-deep-indigo px-4 py-2 rounded-lg font-code text-sm font-bold">
                {challenge.highlight}
              </div>
            </div>
          ))}
        </div>

        {/* Value Proposition */}
        <div className="text-center bg-gradient-to-r from-deep-indigo to-electric-blue p-8 rounded-2xl text-white">
          <h3 className="text-2xl font-heading font-bold mb-4">
            Built for the Future of Social Media
          </h3>
          <p className="text-white/90 font-body mb-6 max-w-2xl mx-auto">
            Join thousands of creators, activists, and communities who are already building 
            the future of decentralized social media.
          </p>
          <button 
            onClick={scrollToFeed}
            className="btn-primary"
          >
            Join the Movement
          </button>
        </div>
      </div>
    </section>
  );
} 