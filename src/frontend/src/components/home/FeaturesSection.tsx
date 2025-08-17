import React from 'react';

export default function FeaturesSection() {
  const features = [
    {
      icon: '🔒',
      title: 'Censorship Resistant',
      description:
        'No centralized servers to seize or censor. Your voice remains free, regardless of political pressure.',
      gradient: 'from-deep-indigo to-electric-blue',
    },
    {
      icon: '👥',
      title: 'DAO Governance',
      description:
        "Community-driven moderation. Users, not governments or corporations, decide what's acceptable.",
      gradient: 'from-electric-blue to-vibrant-orange',
    },
    {
      icon: '💰',
      title: 'Creator Monetization',
      description:
        'Direct micro-tipping with ICP tokens. No intermediaries taking cuts from your content.',
      gradient: 'from-vibrant-orange to-deep-indigo',
    },
    {
      icon: '🕵️',
      title: 'Anonymous Whistleblowing',
      description:
        'Secure tools for activists and journalists to share information without fear of retribution.',
      gradient: 'from-deep-indigo to-vibrant-orange',
    },
    {
      icon: '🌍',
      title: 'Global Accessibility',
      description:
        'Built for the 3.3 billion users in censored regions with seamless, borderless access.',
      gradient: 'from-electric-blue to-deep-indigo',
    },
    {
      icon: '⚡',
      title: '100% On-Chain',
      description:
        'All data, posts, and interactions stored on the Internet Computer Protocol for complete transparency.',
      gradient: 'from-vibrant-orange to-electric-blue',
    },
  ];

  const platformStats = [
    { metric: '99.9%', label: 'Uptime' },
    { metric: '0ms', label: 'Censorship' },
    { metric: '100%', label: 'Data Ownership' },
    { metric: '0%', label: 'Platform Fees' },
  ];

  return (
    <section
      id="features"
      className="py-20 bg-gradient-to-br from-charcoal-black via-dark-gray to-charcoal-black"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
            Platform Capabilities
          </h2>
          <p className="text-xl text-white/70 font-body max-w-3xl mx-auto">
            Built for the 3.3 billion users in censored regions, with features
            that traditional platforms can&apos;t provide.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-dark-gray shadow-neumorphic-inset p-8 rounded-2xl text-white hover:shadow-neumorphic-inset-hover transition-all duration-300 border border-white/5"
            >
              <div className="text-4xl mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-heading font-bold mb-4 text-electric-blue">
                {feature.title}
              </h3>
              <p className="text-white/80 font-body">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Platform Statistics */}
        <div className="bg-dark-gray shadow-neumorphic rounded-2xl p-8 border border-white/5">
          <h3 className="text-3xl font-heading font-bold text-white mb-8 text-center">
            Platform Performance
          </h3>
          <div className="grid md:grid-cols-4 gap-8">
            {platformStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-heading font-bold text-electric-blue mb-2">
                  {stat.metric}
                </div>
                <div className="text-white/70 font-body">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Advantages */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="bg-dark-gray shadow-neumorphic-inset p-8 rounded-2xl border border-white/5">
            <h3 className="text-2xl font-heading font-bold text-electric-blue mb-4">
              Technical Architecture
            </h3>
            <ul className="space-y-3 text-white/80 font-body">
              <li className="flex items-start">
                <span className="text-vibrant-orange mr-2">•</span>
                Fully decentralized on Internet Computer Protocol
              </li>
              <li className="flex items-start">
                <span className="text-vibrant-orange mr-2">•</span>
                Zero single points of failure
              </li>
              <li className="flex items-start">
                <span className="text-vibrant-orange mr-2">•</span>
                Cryptographic data integrity
              </li>
              <li className="flex items-start">
                <span className="text-vibrant-orange mr-2">•</span>
                Cross-chain interoperability
              </li>
            </ul>
          </div>

          <div className="bg-dark-gray shadow-neumorphic-inset p-8 rounded-2xl border border-white/5">
            <h3 className="text-2xl font-heading font-bold text-electric-blue mb-4">
              User Benefits
            </h3>
            <ul className="space-y-3 text-white/80 font-body">
              <li className="flex items-start">
                <span className="text-vibrant-orange mr-2">•</span>
                Complete data ownership and control
              </li>
              <li className="flex items-start">
                <span className="text-vibrant-orange mr-2">•</span>
                Direct monetization without fees
              </li>
              <li className="flex items-start">
                <span className="text-vibrant-orange mr-2">•</span>
                Global accessibility without restrictions
              </li>
              <li className="flex items-start">
                <span className="text-vibrant-orange mr-2">•</span>
                Community-driven governance
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
