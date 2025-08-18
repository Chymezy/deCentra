'use client';

import { FeedContainer } from '@/components/social/FeedContainer';

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-dark-background-primary">
      <FeedContainer showComposer={true} />
    </div>
  );
}
