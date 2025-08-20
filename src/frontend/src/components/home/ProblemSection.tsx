'use client';

import React from 'react';
import { icons } from '@/lib/icons';
import { Card, CardContent } from '@/components/ui/Card';

export default function ProblemSection() {
  const problems = [
    {
      icon: icons.lock,
      title: 'Platform Censorship',
      description: 'Governments and corporations can silence voices, remove content, and control narratives.',
      stat: '60% of internet users face content restrictions',
    },
    {
      icon: icons.chart,
      title: 'Data Exploitation',
      description: 'Your personal data is harvested, sold, and used against you by big tech platforms.',
      stat: '$200+ billion data broker industry',
    },
    {
      icon: icons.money,
      title: 'Creator Exploitation',
      description: 'Platforms take huge cuts from creator earnings while controlling monetization.',
      stat: '30-50% platform fees are standard',
    },
  ];

  const solutions = [
    {
      icon: icons.shield,
      title: 'Censorship Resistance',
      description: 'On-chain storage means no single entity can remove your content or silence your voice.',
      benefit: 'True digital freedom',
    },
    {
      icon: icons.lock,
      title: 'Data Sovereignty',
      description: 'You own your data completely. No tracking, no selling, no exploitation.',
      benefit: 'Complete privacy control',
    },
    {
      icon: icons.money,
      title: 'Fair Monetization',
      description: 'Direct ICP token payments to creators. No intermediaries, no hidden fees.',
      benefit: '100% of earnings kept',
    },
  ];

  return (
    <section id="problems" className="py-20 bg-privacy-background-secondary">
      <div className="max-w-7xl mx-auto px-6">
        {/* Problems Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-privacy-text mb-6">
            The Problem with Big Tech
          </h2>
          <p className="text-xl text-privacy-text-muted font-body max-w-3xl mx-auto">
            Current social platforms exploit users, silence voices, and extract value 
            without giving back. It&apos;s time for something better.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {problems.map((problem, index) => (
            <Card key={index} className="bg-privacy-background border-privacy-border shadow-soft hover:shadow-medium transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="text-5xl mb-6 flex justify-center">
                  <problem.icon className="w-12 h-12 text-privacy-danger" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-privacy-text mb-4">
                  {problem.title}
                </h3>
                <p className="text-privacy-text-muted mb-6 leading-relaxed">
                  {problem.description}
                </p>
                <div className="bg-privacy-danger/10 border border-privacy-danger/20 rounded-lg p-3">
                  <span className="text-privacy-danger font-semibold text-sm">
                    {problem.stat}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Solutions Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-privacy-text mb-6">
            The deCentra Solution
          </h2>
          <p className="text-xl text-privacy-text-muted font-body max-w-3xl mx-auto">
            Built on Internet Computer Protocol with true decentralization, 
            privacy, and user empowerment at its core.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <Card key={index} className="bg-privacy-background border-privacy-border shadow-soft hover:shadow-medium transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform flex justify-center">
                  <solution.icon className="w-12 h-12 text-privacy-success" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-privacy-text mb-4">
                  {solution.title}
                </h3>
                <p className="text-privacy-text-muted mb-6 leading-relaxed">
                  {solution.description}
                </p>
                <div className="bg-privacy-success/10 border border-privacy-success/20 rounded-lg p-3">
                  <span className="text-privacy-success font-semibold text-sm flex items-center justify-center gap-2">
                    <icons.check className="w-4 h-4" aria-hidden="true" />
                    {solution.benefit}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-privacy-background rounded-2xl p-8 shadow-medium border border-privacy-border">
            <h3 className="text-2xl font-heading font-bold text-privacy-text mb-4">
              Ready to Take Control?
            </h3>
            <p className="text-privacy-text-muted mb-6 max-w-2xl mx-auto">
              Join the movement toward true digital freedom. Your voice, your data, your future.
            </p>
            <button className="bg-privacy-primary hover:bg-privacy-primary/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-soft hover:shadow-medium">
              Start Your Journey
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
