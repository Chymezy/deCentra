'use client';

import React, { useState, useEffect } from 'react';
import { backend } from '../../../../declarations/backend';
import type { FeedPost as CanisterFeedPost } from '../../../../declarations/backend/backend.did';
import PostCard from '../social/PostCard';

interface FeedSectionProps {
  isAuthenticated: boolean;
  principal: string | null;
  login: () => void;
}

export default function FeedSection({
  isAuthenticated,
  principal,
  login,
}: FeedSectionProps) {
  const [posts, setPosts] = useState<CanisterFeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Check if backend is available
  useEffect(() => {
    if (!backend) {
      setBackendError(
        'Backend connection not available. Please check your deployment.'
      );
      setLoading(false);
    }
  }, []);

  // Fetch posts from backend
  const fetchFeed = async () => {
    if (!backend) {
      setBackendError('Backend connection not available');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch first 20 posts (pagination can be added later)
      const feedResult = await backend.get_user_feed([0n], [20n]);
      if ('Ok' in feedResult) {
        setPosts(feedResult.Ok);
      } else {
        throw new Error(feedResult.Err);
      }
      setBackendError(null);
    } catch (error) {
      console.error('Error fetching feed:', error);
      setBackendError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create post via backend
  const createPost = async () => {
    if (!isAuthenticated || !newPost.trim()) return;
    if (!backend) {
      alert('Backend connection not available');
      return;
    }

    setIsCreating(true);
    try {
      const result = await backend.create_post(newPost, []);
      if ('Ok' in result) {
        setNewPost('');
        fetchFeed();
      } else {
        alert('Error creating post: ' + result.Err);
      }
    } catch (error) {
      console.error('Create post error:', error);
      alert('Error creating post: ' + error);
    } finally {
      setIsCreating(false);
    }
  };

  // Like post via backend
  const likePost = async (postId: bigint) => {
    if (!isAuthenticated) {
      alert('Please login to like posts');
      return;
    }
    if (!backend) {
      alert('Backend connection not available');
      return;
    }

    try {
      const result = await backend.like_post(postId);
      if ('Ok' in result) {
        fetchFeed(); // Refresh feed
      } else {
        alert('Error liking post: ' + result.Err);
      }
    } catch (error) {
      console.error('Like post error:', error);
      alert('Error liking post: ' + error);
    }
  };

  useEffect(() => {
    if (backend) {
      fetchFeed();
    }
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-indigo mx-auto"></div>
            <p className="mt-4 text-charcoal-black/70">Loading feed...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="feed" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        {/* Backend Error Notice */}
        {backendError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="text-center">
              <h3 className="text-xl font-heading font-bold text-red-600 mb-2">
                Connection Error
              </h3>
              <p className="text-red-700 mb-4">{backendError}</p>
              <button
                onClick={fetchFeed}
                className="btn-primary bg-red-600 hover:bg-red-700"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Authentication Notice */}
        {!isAuthenticated && !backendError && (
          <div className="bg-gradient-to-r from-deep-indigo/10 to-electric-blue/10 rounded-2xl p-6 mb-8 border border-deep-indigo/20">
            <div className="text-center">
              <h3 className="text-xl font-heading font-bold text-deep-indigo mb-2">
                Welcome to deCentra!
              </h3>
              <p className="text-charcoal-black/70 mb-4">
                Connect with Internet Identity to start posting and interacting
                with the community.
              </p>
              <button onClick={login} className="btn-primary">
                Connect Internet Identity
              </button>
            </div>
          </div>
        )}

        {/* Create Post - Only show if authenticated */}
        {isAuthenticated && !backendError && (
          <div className="bg-gradient-to-r from-deep-indigo/5 to-electric-blue/5 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-heading font-bold text-deep-indigo mb-4">
              Share Your Thoughts
            </h2>
            <div className="flex gap-4">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind? (Max 1000 characters)"
                className="flex-1 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-deep-indigo focus:border-transparent text-charcoal-black bg-white"
                rows={3}
                maxLength={1000}
                style={{ color: '#1A1A1A' }}
              />
              <button
                onClick={createPost}
                disabled={isCreating || !newPost.trim()}
                className="btn-primary self-end disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Posting...' : 'Post'}
              </button>
            </div>
            {principal && (
              <p className="text-sm text-gray-500 mt-2">
                Posting as: {principal.slice(0, 8)}...{principal.slice(-8)}
              </p>
            )}
          </div>
        )}

        {/* Feed */}
        <div className="space-y-6">
          {posts.map((feedPost) => (
            <PostCard
              key={feedPost.post.id.toString()}
              post={feedPost}
              isAuthenticated={isAuthenticated}
              onLike={likePost}
              onCommentAdded={fetchFeed}
            />
          ))}
        </div>

        {/* Empty State */}
        {posts.length === 0 && !backendError && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-heading font-bold text-deep-indigo mb-2">
              No posts yet
            </h3>
            <p className="text-charcoal-black/70 font-body">
              {isAuthenticated
                ? 'Be the first to share something on deCentra!'
                : 'Connect with Internet Identity to start posting!'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
