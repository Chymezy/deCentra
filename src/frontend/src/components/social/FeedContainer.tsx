'use client';

import { useState } from 'react';
import { PostComposer } from './PostComposer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/lib/contexts/AuthContext';
import { icons } from '@/lib/icons';
import type { Post } from '@/lib/types';
import { Principal } from '@dfinity/principal';

export enum FeedType {
  HOME = 'home',
  FOLLOWING = 'following',
  TRENDING = 'trending',
  LATEST = 'latest',
}

interface FeedContainerProps {
  feedType?: FeedType;
  showComposer?: boolean;
  className?: string;
}

export function FeedContainer({
  feedType = FeedType.HOME,
  showComposer = true,
  className = '',
}: FeedContainerProps) {
  const { isAuthenticated } = useAuth();
  const [isLoading] = useState(false);
  const [optimisticPosts, setOptimisticPosts] = useState<Post[]>([]);

  // Mock data for now - TODO: Replace with actual API calls
  const mockPosts: Post[] = [
    {
      id: BigInt(1),
      author_id: Principal.fromText('rdmx6-jaaaa-aaaah-qcaiq-cai'),
      content: 'Just launched my first dApp on the Internet Computer! The future of web3 is truly decentralized. 🚀 #ICP #Web3 #Decentralization',
      created_at: BigInt(Date.now() - 3600000), // 1 hour ago
      updated_at: BigInt(Date.now() - 3600000),
      like_count: BigInt(42),
      comment_count: BigInt(7),
      reposts_count: 12,
      visibility: { Public: null },
      edited_at: [],
      tips_received: BigInt(0),
      comments_count: 7,
      likes_count: 42,
    },
    {
      id: BigInt(2),
      author_id: Principal.fromText('rdmx6-jaaaa-aaaah-qcaiq-cai'),
      content: 'Privacy isn\'t about hiding something. It\'s about protecting what makes us human - our thoughts, our relationships, our freedom to be ourselves. That\'s why we need truly decentralized social networks.',
      created_at: BigInt(Date.now() - 7200000), // 2 hours ago
      updated_at: BigInt(Date.now() - 7200000),
      like_count: BigInt(128),
      comment_count: BigInt(23),
      reposts_count: 45,
      visibility: { Public: null },
      edited_at: [],
      tips_received: BigInt(0),
      comments_count: 23,
      likes_count: 128,
    },
    {
      id: BigInt(3),
      author_id: Principal.fromText('rdmx6-jaaaa-aaaah-qcaiq-cai'),
      content: 'Reminder: Your data is your property. Don\'t let corporations profit from your thoughts and connections. Choose platforms that respect your digital rights. 💪 #DataRights #Privacy',
      created_at: BigInt(Date.now() - 10800000), // 3 hours ago
      updated_at: BigInt(Date.now() - 10800000),
      like_count: BigInt(89),
      comment_count: BigInt(15),
      reposts_count: 31,
      visibility: { Public: null },
      edited_at: [],
      tips_received: BigInt(0),
      comments_count: 15,
      likes_count: 89,
    },
  ];

  const allPosts = [...optimisticPosts, ...mockPosts];

  const handleCreatePost = async (content: string) => {
    // Optimistic update
    const optimisticPost: Post = {
      id: BigInt(Date.now()),
      author_id: Principal.fromText('rdmx6-jaaaa-aaaah-qcaiq-cai'),
      content,
      created_at: BigInt(Date.now()),
      updated_at: BigInt(Date.now()),
      like_count: BigInt(0),
      comment_count: BigInt(0),
      reposts_count: 0,
      visibility: { Public: null },
      edited_at: [],
      tips_received: BigInt(0),
      comments_count: 0,
      likes_count: 0,
    };

    setOptimisticPosts(prev => [optimisticPost, ...prev]);

    try {
      // TODO: Implement actual post creation
      console.log('Creating post:', content);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove optimistic post after successful creation
      setOptimisticPosts(prev => prev.filter(p => p.id !== optimisticPost.id));
    } catch (error) {
      // Remove optimistic post on error
      setOptimisticPosts(prev => prev.filter(p => p.id !== optimisticPost.id));
      console.error('Failed to create post:', error);
    }
  };

  if (isLoading) {
    return (
      <div className={`max-w-2xl mx-auto ${className}`}>
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Post Composer */}
      {showComposer && isAuthenticated && (
        <PostComposer onPost={handleCreatePost} />
      )}

      {/* Feed */}
      <div className="space-y-0">
        {allPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-dark-text-secondary text-lg mb-2">No posts yet</p>
            <p className="text-dark-text-tertiary">
              {feedType === FeedType.FOLLOWING
                ? 'Follow some users to see their posts here'
                : 'Be the first to share something!'}
            </p>
          </div>
        ) : (
          allPosts.map((post, index) => (
            <SimplePostCard
              key={`${post.id}-${index}`}
              post={post}
              showBorder={index < allPosts.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Simple PostCard component for now
interface SimplePostCardProps {
  post: Post;
  showBorder?: boolean;
}

function SimplePostCard({ post, showBorder = true }: SimplePostCardProps) {
  return (
    <div className={`p-4 ${showBorder ? 'border-b border-dark-background-tertiary' : ''}`}>
      <div className="flex space-x-3">
        <div className="w-10 h-10 bg-deep-indigo rounded-full flex items-center justify-center flex-shrink-0">
          <icons.user className="w-5 h-5 text-white" aria-hidden={true} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-dark-text-primary">User</span>
            <span className="text-dark-text-tertiary text-sm">
              {new Date(Number(post.created_at) / 1000000).toLocaleDateString()}
            </span>
          </div>
          <p className="text-dark-text-primary whitespace-pre-wrap">{post.content}</p>
          <div className="flex items-center space-x-6 mt-3 text-dark-text-tertiary">
            <button className="flex items-center space-x-1 hover:text-electric-blue transition-colors">
              <icons.messages className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm">{Number(post.comment_count)}</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-vibrant-orange transition-colors">
              <icons.repost className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm">{post.reposts_count}</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
              <icons.like className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm">{Number(post.like_count)}</span>
            </button>
            <button className="hover:text-electric-blue transition-colors">
              <icons.share className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
