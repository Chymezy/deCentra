'use client';

import { FeedContainer } from '@/components/social/FeedContainer';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function FeedPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-dark-text-secondary">Redirecting to profile creation...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Welcome message for new users */}
      <div className="border-b border-dark-border-subtle p-6">
        <h1 className="text-2xl font-heading font-bold text-dark-text-primary mb-2">
          Home
        </h1>
        <p className="text-dark-text-secondary">
          Welcome to your personalized feed
        </p>
      </div>

      {/* Main feed content */}
      <FeedContainer showComposer={true} />
    </div>
  );
}
