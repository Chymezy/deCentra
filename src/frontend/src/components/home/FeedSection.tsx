'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Principal } from '@dfinity/principal';
import type { FeedPost } from '../../../../declarations/backend/backend.did';
import { icons } from '@/lib/icons';
import {
  socialNetworkService,
  SocialNetworkServiceError,
} from '../../lib/services/social.service';
import PostCard from '../social/PostCard';

// Component props interface
interface FeedSectionProps {
  isAuthenticated: boolean;
  principal: Principal | null;
  login: () => void;
}

// Error state management following project standards
interface ErrorState {
  message: string;
  code: string;
  canRetry: boolean;
}

export default function FeedSection({
  isAuthenticated,
  principal,
  login,
}: FeedSectionProps) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);

  // Enhanced error handling following project standards
  const handleError = useCallback(
    (error: unknown, operation: string, canRetry = true) => {
      console.error(`${operation} error:`, error);

      if (error instanceof SocialNetworkServiceError) {
        setError({
          message: error.message,
          code: error.code,
          canRetry: canRetry && error.code !== 'AUTH_REQUIRED',
        });
      } else {
        setError({
          message: `Failed to ${operation.toLowerCase()}. Please try again.`,
          code: 'UNKNOWN_ERROR',
          canRetry,
        });
      }
    },
    []
  );

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch posts using enhanced service
  const fetchFeed = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      // Handle unauthenticated users gracefully
      if (!isAuthenticated) {
        setPosts([]);
        return;
      }

      // Use the enhanced service with proper pagination
      const feedPosts = await socialNetworkService.getUserFeed(0, 20);
      setPosts(feedPosts);
    } catch (error) {
      // Handle authentication errors specifically
      if (
        error instanceof SocialNetworkServiceError &&
        error.code === 'AUTH_REQUIRED'
      ) {
        setError({
          message:
            'Please connect with Internet Identity to view your personalized feed',
          code: 'AUTH_REQUIRED',
          canRetry: false,
        });
      } else {
        handleError(error, 'load feed');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, handleError, clearError]);

  // Create post using enhanced service with validation
  const createPost = useCallback(async () => {
    if (!isAuthenticated) {
      setError({
        message: 'Please connect with Internet Identity to create posts',
        code: 'AUTH_REQUIRED',
        canRetry: false,
      });
      return;
    }

    const trimmedContent = newPost.trim();
    if (!trimmedContent) {
      setError({
        message: 'Post content cannot be empty',
        code: 'VALIDATION_ERROR',
        canRetry: false,
      });
      return;
    }

    if (trimmedContent.length > 10000) {
      setError({
        message: 'Post content cannot exceed 10,000 characters',
        code: 'CONTENT_TOO_LONG',
        canRetry: false,
      });
      return;
    }

    try {
      setIsCreating(true);
      clearError();

      // Use enhanced service with validation and error handling
      await socialNetworkService.createPost(trimmedContent);

      // Success - clear form and refresh feed
      setNewPost('');
      await fetchFeed();
    } catch (error) {
      handleError(error, 'create post', false);
    } finally {
      setIsCreating(false);
    }
  }, [isAuthenticated, newPost, fetchFeed, handleError, clearError]);

  // Like post using enhanced service
  const likePost = useCallback(
    async (postId: bigint) => {
      if (!isAuthenticated) {
        setError({
          message: 'Please connect with Internet Identity to like posts',
          code: 'AUTH_REQUIRED',
          canRetry: false,
        });
        return;
      }

      try {
        await socialNetworkService.likePost(postId);
        // Refresh feed to update like status
        await fetchFeed();
      } catch (error) {
        handleError(error, 'like post');
      }
    },
    [isAuthenticated, fetchFeed, handleError]
  );

  // Validate post content with real-time feedback
  const handlePostChange = useCallback(
    (content: string) => {
      setNewPost(content);

      // Clear content-related errors when user starts typing
      if (
        error &&
        ['CONTENT_TOO_LONG', 'VALIDATION_ERROR'].includes(error.code)
      ) {
        clearError();
      }

      // Show warning when approaching character limit
      if (content.length > 9000 && content.length <= 10000) {
        // Visual warning will be handled in the UI
      }
    },
    [error, clearError]
  );

  // Check if post is valid for submission
  const isPostValid = useCallback(() => {
    const trimmedContent = newPost.trim();
    return trimmedContent.length > 0 && trimmedContent.length <= 10000;
  }, [newPost]);

  // Initial load
  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  if (loading) {
    return (
      <section className="py-20 bg-white" role="main" aria-label="Social feed">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-indigo mx-auto"></div>
            <p className="mt-4 text-charcoal-black/70">Loading your feed...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="feed"
      className="py-20 bg-white"
      role="main"
      aria-label="Social feed"
    >
      <div className="max-w-4xl mx-auto px-6">
        {/* Enhanced Error Display */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8"
            role="alert"
            aria-live="assertive"
          >
            <div className="text-center">
              <h3 className="text-xl font-heading font-bold text-red-600 mb-2">
                {error.code === 'AUTH_REQUIRED'
                  ? 'Authentication Required'
                  : 'Error'}
              </h3>
              <p className="text-red-700 mb-4">{error.message}</p>
              {error.canRetry && (
                <button
                  onClick={fetchFeed}
                  className="btn-primary bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  aria-label="Retry loading feed"
                >
                  Try Again
                </button>
              )}
              {error.code === 'AUTH_REQUIRED' && (
                <button
                  onClick={login}
                  className="btn-primary ml-4"
                  aria-label="Connect with Internet Identity"
                >
                  Connect Identity
                </button>
              )}
            </div>
          </div>
        )}

        {/* Authentication Notice */}
        {!isAuthenticated && !error && (
          <div className="bg-gradient-to-r from-deep-indigo/10 to-electric-blue/10 rounded-2xl p-6 mb-8 border border-deep-indigo/20">
            <div className="text-center">
              <h3 className="text-xl font-heading font-bold text-deep-indigo mb-2">
                Welcome to deCentra!
              </h3>
              <p className="text-charcoal-black/70 mb-4">
                Connect with Internet Identity to start posting and interacting
                with the community.
              </p>
              <button
                onClick={login}
                className="btn-primary"
                aria-label="Connect with Internet Identity to access full features"
              >
                Connect Internet Identity
              </button>
            </div>
          </div>
        )}

        {/* Create Post - Enhanced with validation */}
        {isAuthenticated && !error && (
          <div className="bg-gradient-to-r from-deep-indigo/5 to-electric-blue/5 rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-heading font-bold text-deep-indigo">
                Share Your Thoughts
              </h2>
              <button
                onClick={fetchFeed}
                disabled={loading}
                className="text-deep-indigo hover:text-electric-blue focus:outline-none focus:ring-2 focus:ring-deep-indigo rounded-lg p-2 transition-colors duration-200"
                aria-label="Refresh feed"
                title="Refresh feed"
              >
                <svg
                  className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
            <div className="flex gap-4">
              <label htmlFor="post-content" className="sr-only">
                Post content (maximum 10,000 characters)
              </label>
              <textarea
                id="post-content"
                value={newPost}
                onChange={(e) => handlePostChange(e.target.value)}
                placeholder="What's on your mind? Share your thoughts with the community..."
                className="flex-1 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-deep-indigo focus:border-transparent text-charcoal-black bg-white"
                rows={3}
                maxLength={10000}
                style={{ color: '#1A1A1A' }}
                aria-describedby="char-count post-help"
                disabled={isCreating}
              />
              <button
                onClick={createPost}
                disabled={isCreating || !isPostValid()}
                className="btn-primary self-end disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isCreating ? 'Creating post...' : 'Create post'}
              >
                {isCreating ? 'Posting...' : 'Post'}
              </button>
            </div>
            <div className="flex justify-between mt-2">
              <p
                id="char-count"
                className={`text-sm ${newPost.length > 9000 ? 'text-amber-600 font-medium' : 'text-gray-500'}`}
                aria-live="polite"
              >
                {newPost.length}/10,000 characters
                {newPost.length > 9000 && newPost.length <= 10000 && (
                  <span className="ml-2 text-amber-600 flex items-center">
                    <icons.warning className="w-4 h-4 mr-1" aria-hidden={true} />
                    Approaching limit
                  </span>
                )}
              </p>
              {principal && (
                <p className="text-sm text-gray-500">
                  Posting as: {principal.toString().slice(0, 8)}...
                  {principal.toString().slice(-8)}
                </p>
              )}
            </div>
            <p id="post-help" className="text-sm text-gray-400 mt-1">
              Posts are stored permanently on the blockchain and cannot be
              deleted.
            </p>
          </div>
        )}

        {/* Feed with enhanced accessibility and keyboard navigation */}
        {posts.length > 0 && (
          <div
            className="space-y-6"
            role="feed"
            aria-label={`Social media feed with ${posts.length} posts`}
            aria-describedby="feed-help"
          >
            <div id="feed-help" className="sr-only">
              Use Tab to navigate between posts and their interactive elements.
              Posts are listed chronologically with newest first.
            </div>
            {posts.map((feedPost, index) => (
              <PostCard
                key={feedPost.post.id.toString()}
                post={feedPost}
                isAuthenticated={isAuthenticated}
                onLike={likePost}
                onCommentAdded={fetchFeed}
                aria-posinset={index + 1}
                aria-setsize={posts.length}
              />
            ))}
          </div>
        )}

        {/* Empty State - Enhanced messaging */}
        {posts.length === 0 && !error && !loading && (
          <div className="text-center py-12" role="status">
            <div className="text-6xl mb-4 flex justify-center" aria-hidden="true">
              <icons.pencil className="w-16 h-16 text-deep-indigo" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-deep-indigo mb-2">
              {isAuthenticated ? 'Your feed is empty' : 'Welcome to deCentra'}
            </h3>
            <p className="text-charcoal-black/70 font-body">
              {isAuthenticated
                ? 'Start following users or create your first post to see content here!'
                : 'Connect with Internet Identity to start posting and see content from the community!'}
            </p>
            {isAuthenticated && (
              <button
                onClick={() => document.getElementById('post-content')?.focus()}
                className="btn-primary mt-4"
                aria-label="Focus on post creation form"
              >
                Create Your First Post
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
