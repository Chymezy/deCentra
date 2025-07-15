'use client';

import React, { useState, useEffect } from 'react';
import { deCentra_backend } from '../../../../declarations/deCentra_backend';
import type { FeedPost as CanisterFeedPost } from '../../../../declarations/deCentra_backend/deCentra_backend.did';
import type { Comment as CanisterComment } from '../../../../declarations/deCentra_backend/deCentra_backend.did';

interface FeedSectionProps {
  isAuthenticated: boolean;
  principal: string | null;
  login: () => void;
}

export default function FeedSection({ isAuthenticated, principal, login }: FeedSectionProps) {
  const [posts, setPosts] = useState<CanisterFeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, CanisterComment[]>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [commentSubmitting, setCommentSubmitting] = useState<Record<string, boolean>>({});

  // Check if backend is available
  useEffect(() => {
    if (!deCentra_backend) {
      setBackendError('Backend connection not available. Please check your deployment.');
      setLoading(false);
    }
  }, []);

  // Fetch posts from backend
  const fetchFeed = async () => {
    if (!deCentra_backend) {
      setBackendError('Backend connection not available');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch first 20 posts (pagination can be added later)
      const feed = await deCentra_backend.getFeed(0n, 20n);
      setPosts(feed);
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
    if (!deCentra_backend) {
      alert('Backend connection not available');
      return;
    }

    setIsCreating(true);
    try {
      const result = await deCentra_backend.createPost(newPost);
      if ('ok' in result) {
        setNewPost('');
        fetchFeed();
      } else {
        alert('Error creating post: ' + result.err);
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
    if (!deCentra_backend) {
      alert('Backend connection not available');
      return;
    }

    try {
      const result = await deCentra_backend.likePost(postId);
      if ('ok' in result) {
        fetchFeed(); // Refresh feed
      } else {
        alert('Error liking post: ' + result.err);
      }
    } catch (error) {
      console.error('Like post error:', error);
      alert('Error liking post: ' + error);
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId: bigint) => {
    setCommentLoading((prev) => ({ ...prev, [postId.toString()]: true }));
    try {
      const postComments = await deCentra_backend.getComments(postId);
      setComments((prev) => ({ ...prev, [postId.toString()]: postComments }));
    } catch {
      setComments((prev) => ({ ...prev, [postId.toString()]: [] }));
    } finally {
      setCommentLoading((prev) => ({ ...prev, [postId.toString()]: false }));
    }
  };

  // Add a comment to a post
  const addComment = async (postId: bigint) => {
    if (!isAuthenticated) {
      alert('Please login to comment');
      return;
    }
    const text = newComments[postId.toString()]?.trim();
    if (!text) return;
    setCommentSubmitting((prev) => ({ ...prev, [postId.toString()]: true }));
    try {
      const result = await deCentra_backend.addComment(postId, text);
      if ('ok' in result) {
        setNewComments((prev) => ({ ...prev, [postId.toString()]: '' }));
        fetchComments(postId);
        fetchFeed(); // update comment count
      } else {
        alert('Error adding comment: ' + result.err);
      }
    } catch (error) {
      alert('Error adding comment: ' + error);
    } finally {
      setCommentSubmitting((prev) => ({ ...prev, [postId.toString()]: false }));
    }
  };

  // Toggle comments section
  const toggleComments = (postId: bigint) => {
    setOpenComments((prev) => {
      const isOpen = prev[postId.toString()];
      if (!isOpen) fetchComments(postId);
      return { ...prev, [postId.toString()]: !isOpen };
    });
  };

  useEffect(() => {
    if (deCentra_backend) {
      fetchFeed();
    }
  }, []);

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

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
              <p className="text-red-700 mb-4">
                {backendError}
              </p>
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
                Connect with Internet Identity to start posting and interacting with the community.
              </p>
              <button
                onClick={login}
                className="btn-primary"
              >
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
            <div key={feedPost.post.id.toString()} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* Post Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-deep-indigo to-electric-blue rounded-full flex items-center justify-center text-white font-bold">
                  {feedPost.author.avatar}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-charcoal-black">
                    {feedPost.author.username}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatTime(Number(feedPost.post.createdAt))}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-charcoal-black font-body mb-4 leading-relaxed">
                {feedPost.post.content}
              </p>

              {/* Post Actions */}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => likePost(feedPost.post.id)}
                  className="flex items-center gap-2 text-gray-500 hover:text-vibrant-orange transition-colors"
                >
                  <span className="text-xl">❤️</span>
                  <span className="font-body">{feedPost.post.likes.toString()}</span>
                </button>
                <button
                  onClick={() => toggleComments(feedPost.post.id)}
                  className="flex items-center gap-2 text-gray-500 hover:text-deep-indigo transition-colors"
                >
                  <span className="text-xl">💬</span>
                  <span className="font-body">{feedPost.post.comments.toString()}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-electric-blue transition-colors">
                  <span className="text-xl">🔄</span>
                  <span className="font-body">Share</span>
                </button>
              </div>
              {/* Comments Section */}
              {openComments[feedPost.post.id.toString()] && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  {commentLoading[feedPost.post.id.toString()] ? (
                    <div className="text-gray-500 text-sm">Loading comments...</div>
                  ) : (
                    <div className="space-y-3 mb-3">
                      {(comments[feedPost.post.id.toString()] || []).length === 0 ? (
                        <div className="text-gray-400 text-sm">No comments yet.</div>
                      ) : (
                        comments[feedPost.post.id.toString()].map((comment) => (
                          <div key={comment.id.toString()} className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-deep-indigo to-electric-blue rounded-full flex items-center justify-center text-white font-bold text-sm">
                              💬
                            </div>
                            <div>
                              <div className="font-body text-charcoal-black text-sm mb-1">{comment.content}</div>
                              <div className="text-xs text-gray-400">{formatTime(Number(comment.createdAt))}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  {isAuthenticated && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={newComments[feedPost.post.id.toString()] || ''}
                        onChange={e => setNewComments(prev => ({ ...prev, [feedPost.post.id.toString()]: e.target.value }))}
                        placeholder="Add a comment..."
                        className="flex-1 p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-deep-indigo focus:border-transparent text-charcoal-black bg-white"
                        maxLength={500}
                      />
                      <button
                        onClick={() => addComment(feedPost.post.id)}
                        disabled={commentSubmitting[feedPost.post.id.toString()] || !(newComments[feedPost.post.id.toString()] || '').trim()}
                        className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {commentSubmitting[feedPost.post.id.toString()] ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
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
              {isAuthenticated ? 'Be the first to share something on deCentra!' : 'Connect with Internet Identity to start posting!'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
} 