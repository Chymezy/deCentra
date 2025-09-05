'use client';

import { PostComposer } from './PostComposer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/lib/contexts/AuthContext';
import { icons } from '@/lib/icons';
import type { FeedPost } from '@/lib/types';
import {
  useUserFeed,
  useSocialFeed,
  useCreatePost,
  usePostInteractions,
} from '@/lib/hooks/useSocial';
import { Fragment } from 'react';

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

  // Choose the appropriate feed hook based on feed type and authentication
  const shouldUseUserFeed =
    isAuthenticated &&
    (feedType === FeedType.HOME || feedType === FeedType.FOLLOWING);

  const userFeedQuery = useUserFeed();
  const socialFeedQuery = useSocialFeed();

  // Use the appropriate query based on authentication and feed type
  const feedQuery = shouldUseUserFeed ? userFeedQuery : socialFeedQuery;

  const createPostMutation = useCreatePost();

  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = feedQuery;

  // Flatten all pages into a single array of posts
  const allPosts = data?.pages.flatMap((page) => page.data) || [];

  const handleCreatePost = async (content: string) => {
    try {
      await createPostMutation.mutateAsync({
        content,
        visibility: { Public: null },
      });
    } catch (error) {
      console.error('Failed to create post:', error);
      // Error handling could be enhanced with toast notifications
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (error) {
    return (
      <div className={`max-w-2xl mx-auto ${className}`}>
        <div className="text-center py-12">
          <p className="text-red-400 text-lg mb-2">Failed to load feed</p>
          <p className="text-dark-text-tertiary">
            {error.message || 'Something went wrong'}
          </p>
        </div>
      </div>
    );
  }

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
            <p className="text-dark-text-secondary text-lg mb-2">
              No posts yet
            </p>
            <p className="text-dark-text-tertiary">
              {feedType === FeedType.FOLLOWING
                ? 'Follow some users to see their posts here'
                : 'Be the first to share something!'}
            </p>
          </div>
        ) : (
          <>
            {allPosts.map((feedPost, index) => (
              <FeedPostCard
                key={`${feedPost.post.id}-${index}`}
                feedPost={feedPost}
                showBorder={index < allPosts.length - 1}
              />
            ))}

            {/* Load More Button */}
            {hasNextPage && (
              <div className="text-center py-6">
                <button
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                  className="px-6 py-2 bg-electric-blue/20 hover:bg-electric-blue/30 text-electric-blue border border-electric-blue/30 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isFetchingNextPage ? (
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner size="sm" />
                      <span>Loading more...</span>
                    </div>
                  ) : (
                    'Load more posts'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Enhanced FeedPostCard component with real interactions
interface FeedPostCardProps {
  feedPost: FeedPost;
  showBorder?: boolean;
}

function FeedPostCard({ feedPost, showBorder = true }: FeedPostCardProps) {
  const { post, author, is_liked } = feedPost;
  const { handleLike, isLiking } = usePostInteractions(post.id.toString());

  const handleLikeClick = () => {
    handleLike(is_liked);
  };

  return (
    <div
      className={`p-4 ${showBorder ? 'border-b border-dark-background-tertiary' : ''}`}
    >
      <div className="flex space-x-3">
        <div className="w-10 h-10 bg-deep-indigo rounded-full flex items-center justify-center flex-shrink-0">
          <icons.user className="w-5 h-5 text-white" aria-hidden={true} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-dark-text-primary">
              {author?.username || 'User'}
            </span>
            <span className="text-dark-text-tertiary text-sm">
              {new Date(Number(post.created_at) / 1000000).toLocaleDateString()}
            </span>
          </div>
          <p className="text-dark-text-primary whitespace-pre-wrap">
            {post.content}
          </p>
          <div className="flex items-center space-x-6 mt-3 text-dark-text-tertiary">
            <button className="flex items-center space-x-1 hover:text-electric-blue transition-colors">
              <icons.messages className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm">{Number(post.comment_count)}</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-vibrant-orange transition-colors">
              <icons.repost className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm">{post.reposts_count}</span>
            </button>
            <button
              onClick={handleLikeClick}
              disabled={isLiking}
              className={`flex items-center space-x-1 transition-colors ${
                is_liked ? 'text-red-500' : 'hover:text-red-500'
              }`}
            >
              <icons.like
                className={`w-4 h-4 ${is_liked ? 'fill-current' : ''}`}
                aria-hidden="true"
              />
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
