'use client';

import { FeedContainer, FeedType } from '@/components/social/FeedContainer';

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-dark-background-primary">
      <FeedContainer feedType={FeedType.TRENDING} showComposer={false} />
    </div>
  );
}
