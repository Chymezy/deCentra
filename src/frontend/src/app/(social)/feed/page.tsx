'use client';

import { FeedContainer } from '@/components/social/FeedContainer';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function FeedPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center glass-card">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center glow-social animate-social-pulse">
            <span className="text-2xl">🔐</span>
          </div>
          <p className="text-gray-300 gradient-text-social">
            Redirecting to profile creation...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Enhanced welcome header with glassmorphism */}
      <div className="glass-nav-enhanced border-b border-glass-border/30 p-6 animate-fade-in">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center glow-social">
            <span className="text-white text-lg">🏠</span>
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-white gradient-text-social">
              Home
            </h1>
            <p className="text-gray-300 text-sm">
              Welcome to your personalized feed, stay connected with privacy
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced main feed content */}
      <FeedContainer showComposer={true} />
    </div>
  );
}
