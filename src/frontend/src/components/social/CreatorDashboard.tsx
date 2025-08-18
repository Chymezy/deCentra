'use client';

import { useState } from 'react';

export function CreatorDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock creator analytics data
  const analytics = {
    totalEarnings: 123.45,
    totalTips: 89.23,
    totalSubscribers: 156,
    totalViews: 12543,
    avgEngagement: 8.7,
  };

  const recentActivity = [
    { type: 'tip', amount: 5.2, from: 'anonymous', post: 'Privacy rights post', time: '2 hours ago' },
    { type: 'subscription', amount: 10.0, from: 'alice_crypto', time: '5 hours ago' },
    { type: 'tip', amount: 2.1, from: 'bob_privacy', post: 'Decentralization guide', time: '1 day ago' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-dark-text-primary">Creator Dashboard</h1>
        <p className="text-dark-text-secondary">Monetize your content on the decentralized web</p>
      </div>

      {/* Period Selector */}
      <div className="flex justify-center space-x-2">
        {(['7d', '30d', '90d'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === period
                ? 'bg-electric-blue text-white'
                : 'bg-dark-background-secondary text-dark-text-secondary hover:text-dark-text-primary'
            }`}
          >
            {period === '7d' && 'Last 7 days'}
            {period === '30d' && 'Last 30 days'}
            {period === '90d' && 'Last 90 days'}
          </button>
        ))}
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-dark-background-secondary p-6 rounded-lg border border-dark-background-tertiary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-text-secondary text-sm">Total Earnings</p>
              <p className="text-2xl font-bold text-dark-text-primary">{analytics.totalEarnings} ICP</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-dark-background-secondary p-6 rounded-lg border border-dark-background-tertiary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-text-secondary text-sm">Total Tips</p>
              <p className="text-2xl font-bold text-dark-text-primary">{analytics.totalTips} ICP</p>
            </div>
            <div className="text-3xl">🎁</div>
          </div>
        </div>

        <div className="bg-dark-background-secondary p-6 rounded-lg border border-dark-background-tertiary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-text-secondary text-sm">Subscribers</p>
              <p className="text-2xl font-bold text-dark-text-primary">{analytics.totalSubscribers}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        <div className="bg-dark-background-secondary p-6 rounded-lg border border-dark-background-tertiary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-text-secondary text-sm">Total Views</p>
              <p className="text-2xl font-bold text-dark-text-primary">{analytics.totalViews.toLocaleString()}</p>
            </div>
            <div className="text-3xl">👁️</div>
          </div>
        </div>

        <div className="bg-dark-background-secondary p-6 rounded-lg border border-dark-background-tertiary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-text-secondary text-sm">Avg. Engagement</p>
              <p className="text-2xl font-bold text-dark-text-primary">{analytics.avgEngagement}%</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>

        <div className="bg-dark-background-secondary p-6 rounded-lg border border-dark-background-tertiary">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-dark-text-secondary text-sm mb-2">Set Up Tipping</p>
              <button className="bg-electric-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-electric-blue/90 transition-colors">
                Configure
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-dark-background-secondary rounded-lg border border-dark-background-tertiary">
        <div className="p-6 border-b border-dark-background-tertiary">
          <h2 className="text-xl font-semibold text-dark-text-primary">Recent Activity</h2>
        </div>
        <div className="divide-y divide-dark-background-tertiary">
          {recentActivity.map((activity, index) => (
            <div key={index} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-xl">
                  {activity.type === 'tip' ? '🎁' : '⭐'}
                </div>
                <div>
                  <p className="text-dark-text-primary font-medium">
                    {activity.type === 'tip' ? 'Tip received' : 'New subscriber'}
                  </p>
                  <p className="text-dark-text-secondary text-sm">
                    {activity.type === 'tip' ? `For "${activity.post}"` : `from @${activity.from}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-electric-blue font-bold">+{activity.amount} ICP</p>
                <p className="text-dark-text-tertiary text-sm">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Creator Tools */}
      <div className="bg-dark-background-secondary rounded-lg border border-dark-background-tertiary p-6">
        <h2 className="text-xl font-semibold text-dark-text-primary mb-4">Creator Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 text-left border border-dark-background-tertiary rounded-lg hover:border-electric-blue/50 transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💎</span>
              <div>
                <p className="font-medium text-dark-text-primary">Premium Content</p>
                <p className="text-sm text-dark-text-secondary">Create subscriber-only posts</p>
              </div>
            </div>
          </button>

          <button className="p-4 text-left border border-dark-background-tertiary rounded-lg hover:border-electric-blue/50 transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📊</span>
              <div>
                <p className="font-medium text-dark-text-primary">Analytics</p>
                <p className="text-sm text-dark-text-secondary">Detailed performance insights</p>
              </div>
            </div>
          </button>

          <button className="p-4 text-left border border-dark-background-tertiary rounded-lg hover:border-electric-blue/50 transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-medium text-dark-text-primary">Audience</p>
                <p className="text-sm text-dark-text-secondary">Manage your subscribers</p>
              </div>
            </div>
          </button>

          <button className="p-4 text-left border border-dark-background-tertiary rounded-lg hover:border-electric-blue/50 transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⚙️</span>
              <div>
                <p className="font-medium text-dark-text-primary">Settings</p>
                <p className="text-sm text-dark-text-secondary">Configure monetization</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
