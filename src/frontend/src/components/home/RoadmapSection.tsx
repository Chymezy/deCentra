import React from 'react';

export default function RoadmapSection() {
  const phases = [
    {
      phase: "PHASE 1",
      title: "Core Platform",
      timeline: "Q1 2025",
      status: "In Development",
      features: [
        "Profiles & posts fully on-chain",
        "Internet Identity authentication", 
        "Basic feed & like functionality",
        "Deployed to ICP mainnet"
      ],
      gradient: "from-deep-indigo to-electric-blue"
    },
    {
      phase: "PHASE 2", 
      title: "Monetization & Governance",
      timeline: "Q2 2025",
      status: "Planned",
      features: [
        "Micro-tipping system",
        "Creator marketplace",
        "DAO moderation",
        "Whistleblower tools"
      ],
      gradient: "from-electric-blue to-vibrant-orange"
    },
    {
      phase: "PHASE 3",
      title: "Global Scale", 
      timeline: "Q3-Q4 2025",
      status: "Planned",
      features: [
        "Regional hubs",
        "Mobile apps",
        "Enterprise tools",
        "NGO partnerships"
      ],
      gradient: "from-vibrant-orange to-deep-indigo"
    }
  ];

  const marketData = [
    { metric: "3.3B", label: "Users in censored regions", icon: "🌏" },
    { metric: "$104B", label: "Global creator economy", icon: "🎥" },
    { metric: "10K+", label: "NGOs & watchdogs", icon: "📰" },
    { metric: "$35B", label: "Decentralized social TAM (2030)", icon: "💰" }
  ];

  return (
    <section id="build" className="py-20 bg-charcoal-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
            Platform Evolution
          </h2>
          <p className="text-xl text-white/70 font-body max-w-3xl mx-auto">
            Our roadmap to building the world&apos;s most powerful decentralized social platform.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {phases.map((phase, index) => (
            <div key={index} className="relative">
              <div className={`bg-gradient-to-br ${phase.gradient} p-8 rounded-2xl`}>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-white font-code font-bold text-sm">
                    {phase.phase}
                  </span>
                  <span className="text-white/80 font-body text-sm">
                    {phase.timeline}
                  </span>
                </div>
                
                <h3 className="text-2xl font-heading font-bold text-white mb-4">
                  {phase.title}
                </h3>
                
                <div className="mb-6">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    phase.status === "In Development" 
                      ? "bg-green-500 text-white" 
                      : "bg-white/20 text-white"
                  }`}>
                    {phase.status}
                  </span>
                </div>

                <ul className="text-white/90 font-body space-y-2">
                  {phase.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <span className="text-vibrant-orange mr-2">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Market Opportunity */}
        <div className="mt-20 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-3xl font-heading font-bold text-white mb-8 text-center">
            Market Opportunity
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {marketData.map((data, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-2">{data.icon}</div>
                <div className="text-2xl font-heading font-bold text-white">{data.metric}</div>
                <div className="text-white/70 font-body">{data.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Partnerships */}
        <div className="mt-16 bg-gradient-to-r from-deep-indigo/20 to-electric-blue/20 rounded-2xl p-8">
          <h3 className="text-2xl font-heading font-bold text-white mb-6 text-center">
            Strategic Focus Areas
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-4">👨‍💻</div>
              <h4 className="text-lg font-heading font-bold text-white mb-2">Developer Ecosystem</h4>
              <p className="text-white/80 font-body text-sm">
                Open APIs and SDKs for third-party integrations
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">🎥</div>
              <h4 className="text-lg font-heading font-bold text-white mb-2">Creator Economy</h4>
              <p className="text-white/80 font-body text-sm">
                Direct monetization tools for content creators
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">🏢</div>
              <h4 className="text-lg font-heading font-bold text-white mb-2">Enterprise Solutions</h4>
              <p className="text-white/80 font-body text-sm">
                Custom deployments for organizations and NGOs
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 