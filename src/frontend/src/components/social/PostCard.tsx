'use client';

import React, { useState } from 'react';
import { backend } from '../../../../declarations/backend';
import type {
  FeedPost,
  Comment,
} from '../../../../declarations/backend/backend.did';
import FollowButton from './FollowButton';

interface PostCardProps {
  /** The feed post data including author information */
  post: FeedPost;
  /** Whether the current user is authenticated */
  isAuthenticated: boolean;
  /** Callback when the post is liked/unliked */
  onLike?: (postId: bigint) => void;
  /** Callback when a comment is added */
  onCommentAdded?: (postId: bigint) => void;
}

/**
 * PostCard Component - Displays a social media post with engagement features
 *
 * Features:
 * - Shows post content and author information
 * - Like/unlike functionality
 * - Comment viewing and creation
 * - Follow/unfollow button for post author
 * - Responsive design with accessibility support
 */
export default function PostCard({
  post,
  isAuthenticated,
  onLike,
  onCommentAdded,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  /**
   * Handles the like action for this post
   */
  const handleLike = async () => {
    if (!isAuthenticated || !backend) {
      alert('Please connect with Internet Identity to like posts');
      return;
    }

    setIsLiking(true);
    try {
      const result = await backend.like_post(post.post.id);
      if ('Ok' in result) {
        onLike?.(post.post.id);
      } else {
        alert('Error liking post: ' + result.Err);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Error liking post. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  /**
   * Loads comments for this post
   */
  const loadComments = async () => {
    if (!backend) return;

    setIsLoadingComments(true);
    try {
      const postComments = await backend.get_post_comments(
        post.post.id,
        [],
        []
      );
      setComments(postComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  /**
   * Toggles comment visibility and loads comments if needed
   */
  const toggleComments = () => {
    if (!showComments && comments.length === 0) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  /**
   * Submits a new comment
   */
  const submitComment = async () => {
    if (!isAuthenticated || !backend || !newComment.trim()) {
      if (!isAuthenticated) {
        alert('Please connect with Internet Identity to comment');
      }
      return;
    }

    setIsSubmittingComment(true);
    try {
      const result = await backend.add_comment(post.post.id, newComment.trim());
      if ('Ok' in result) {
        setNewComment('');
        loadComments(); // Reload comments to show the new one
        onCommentAdded?.(post.post.id);
      } else {
        alert('Error adding comment: ' + result.Err);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  /**
   * Formats timestamp to readable date
   */
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000); // Convert from nanoseconds
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Handles Enter key press in comment input
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitComment();
    }
  };

  return (
    <article className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Post Header */}
      <header className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-deep-indigo to-electric-blue rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {post.author.avatar || '👤'}
            </span>
          </div>

          <div>
            <h3 className="font-semibold text-charcoal-black">
              {post.author.username}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <time
                dateTime={new Date(
                  Number(post.post.created_at) / 1_000_000
                ).toISOString()}
              >
                {formatDate(post.post.created_at)}
              </time>
              {post.author.verification_status &&
                'Verified' in post.author.verification_status && (
                  <span className="text-blue-500" title="Verified user">
                    ✓
                  </span>
                )}
            </div>
          </div>
        </div>

        {/* Follow Button */}
        <FollowButton targetUserId={post.author.id.toString()} size="sm" />
      </header>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-charcoal-black leading-relaxed whitespace-pre-wrap">
          {post.post.content}
        </p>
      </div>

      {/* Engagement Bar */}
      <footer className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isLiking || !isAuthenticated}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl transition-all ${
                post.is_liked
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'text-gray-600 hover:bg-gray-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={post.is_liked ? 'Unlike post' : 'Like post'}
            >
              <span className="text-lg">{post.is_liked ? '❤️' : '🤍'}</span>
              <span className="text-sm font-medium">
                {Number(post.post.like_count)}
              </span>
            </button>

            {/* Comment Button */}
            <button
              onClick={toggleComments}
              className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
              aria-label="View comments"
            >
              <span className="text-lg">💬</span>
              <span className="text-sm font-medium">
                {Number(post.post.comment_count)}
              </span>
            </button>
          </div>

          {/* Post Visibility Indicator */}
          <div className="text-xs text-gray-400">
            {'Public' in post.post.visibility && '🌍 Public'}
            {'FollowersOnly' in post.post.visibility && '👥 Followers'}
            {'Unlisted' in post.post.visibility && '🔗 Unlisted'}
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {/* Comment Input */}
            {isAuthenticated && (
              <div className="mb-4">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-deep-indigo to-electric-blue rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">👤</span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a comment..."
                      rows={2}
                      className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-deep-indigo focus:border-transparent text-sm"
                      disabled={isSubmittingComment}
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={submitComment}
                        disabled={isSubmittingComment || !newComment.trim()}
                        className="px-4 py-1.5 bg-deep-indigo text-white text-sm rounded-lg hover:bg-deep-indigo/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingComment ? 'Posting...' : 'Comment'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3">
              {isLoadingComments ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-deep-indigo"></div>
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id.toString()} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm">👤</span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm text-charcoal-black">
                            User {comment.author_id.toString().slice(0, 8)}...
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-charcoal-black">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
        )}
      </footer>
    </article>
  );
}
