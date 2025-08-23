'use client';

import React, { useState } from 'react';
import { backend } from '../../../../declarations/backend';
import { icons } from '@/lib/icons';
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
    <article className="glass-social-card rounded-2xl p-6 mb-6 animate-fade-in-up hover:shadow-glass-glow transition-all duration-300 ease-out">
      {/* Post Header */}
      <header className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-glass-soft animate-social-pulse">
            {post.author.avatar ? (
              <span className="text-white font-bold text-lg">
                {post.author.avatar}
              </span>
            ) : (
              <icons.profile
                className="w-6 h-6 text-white"
                aria-hidden="true"
              />
            )}
          </div>

          <div>
            <h3 className="font-semibold text-white gradient-text-social">
              {post.author.username}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <time
                dateTime={new Date(
                  Number(post.post.created_at) / 1_000_000
                ).toISOString()}
                className="hover:text-indigo-300 transition-colors"
              >
                {formatDate(post.post.created_at)}
              </time>
              {post.author.verification_status &&
                'Verified' in post.author.verification_status && (
                  <span className="text-blue-400 glow-social" title="Verified user">
                    <icons.check
                      className="w-4 h-4 inline animate-social-bounce"
                      aria-hidden={true}
                    />
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
        <p className="text-gray-100 leading-relaxed whitespace-pre-wrap tracking-wide">
          {post.post.content}
        </p>
      </div>

      {/* Engagement Bar */}
      <footer className="border-t border-glass-border/40 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isLiking || !isAuthenticated}
              className={`glass-button-primary flex items-center space-x-2 px-3 py-1.5 rounded-xl transition-all duration-300 ease-out ${
                post.is_liked
                  ? 'from-red-500/20 to-pink-500/20 text-red-300 border-red-400/30 glow-accent'
                  : 'text-gray-300 hover:text-white hover:glow-social'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={post.is_liked ? 'Unlike post' : 'Like post'}
            >
              <icons.like
                className={`w-5 h-5 transition-transform duration-200 ${
                  post.is_liked ? 'fill-current scale-110 animate-social-bounce' : 'hover:scale-110'
                }`}
                aria-hidden="true"
              />
              <span className="text-sm font-medium">
                {Number(post.post.like_count)}
              </span>
            </button>

            {/* Comment Button */}
            <button
              onClick={toggleComments}
              className="glass-button-secondary flex items-center space-x-2 px-3 py-1.5 text-gray-300 hover:text-white rounded-xl transition-all duration-300 ease-out hover:glow-social"
              aria-label="View comments"
            >
              <icons.messages 
                className="w-5 h-5 hover:scale-110 transition-transform duration-200" 
                aria-hidden="true" 
              />
              <span className="text-sm font-medium">
                {Number(post.post.comment_count)}
              </span>
            </button>
          </div>

          {/* Post Visibility Indicator */}
          <div className="flex items-center text-xs text-gray-400 glass-interactive px-2 py-1 rounded-lg">
            {'Public' in post.post.visibility && (
              <>
                <icons.public className="w-3 h-3 mr-1 text-indigo-400" aria-hidden="true" />
                <span className="text-indigo-300">Public</span>
              </>
            )}
            {'FollowersOnly' in post.post.visibility && (
              <>
                <icons.followers className="w-3 h-3 mr-1 text-blue-400" aria-hidden="true" />
                <span className="text-blue-300">Followers</span>
              </>
            )}
            {'Unlisted' in post.post.visibility && (
              <>
                <icons.unlisted className="w-3 h-3 mr-1 text-orange-400" aria-hidden="true" />
                <span className="text-orange-300">Unlisted</span>
              </>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-glass-border/30 glass-card rounded-xl p-4 animate-fade-in-up">
            {/* Comment Input */}
            {isAuthenticated && (
              <div className="mb-4">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center shadow-glass-soft">
                    <icons.user
                      className="w-4 h-4 text-white"
                      aria-hidden={true}
                    />
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a comment..."
                      rows={2}
                      className="w-full p-3 glass-input-enhanced rounded-xl resize-none text-sm text-gray-100 placeholder-gray-400 transition-all duration-300"
                      disabled={isSubmittingComment}
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={submitComment}
                        disabled={isSubmittingComment || !newComment.trim()}
                        className="glass-button-primary px-4 py-1.5 text-sm rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400 glow-social"></div>
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id.toString()} className="flex space-x-3 animate-fade-in">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center shadow-glass-soft">
                      <icons.user
                        className="w-4 h-4 text-gray-300"
                        aria-hidden={true}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="glass-subtle rounded-xl p-3 transition-all duration-300 hover:glass-interactive">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm text-gray-200 gradient-text-social">
                            User {comment.author_id.toString().slice(0, 8)}...
                          </span>
                          <span className="text-xs text-gray-400 hover:text-gray-300 transition-colors">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-200 leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4 glass-subtle rounded-lg">
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
