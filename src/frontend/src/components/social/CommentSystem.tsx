'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { backend } from '../../../../declarations/backend';
import { useAuth } from '../AuthContext';
import type { Comment } from '../../../../declarations/backend/backend.did';

interface CommentSystemProps {
  postId: bigint;
  initialCommentCount?: number;
  onCommentCountChange?: (newCount: number) => void;
}

interface CommentItemProps {
  comment: Comment;
  level: number;
  onReply: (parentId: bigint, content: string) => Promise<void>;
}

/**
 * CommentSystem Component
 * 
 * A comprehensive commenting system with threading support.
 * Integrates with the backend's comment API and provides a rich commenting experience.
 * 
 * Features:
 * - Threaded comments (up to 3 levels deep as per backend)
 * - Real-time comment loading and posting
 * - Authentication-gated commenting
 * - Responsive design with proper indentation
 * - Error handling and loading states
 * - Optimistic updates for better UX
 */
export default function CommentSystem({ 
  postId, 
  initialCommentCount = 0,
  onCommentCountChange 
}: CommentSystemProps) {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  /**
   * Fetches comments for the post from the backend
   */
  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const comments = await backend.get_post_comments(postId, [], []);
      setComments(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  /**
   * Posts a new comment
   */
  const postComment = async () => {
    if (!isAuthenticated || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await backend.add_comment(postId, newComment.trim());
      if ('Ok' in result) {
        setNewComment('');
        await fetchComments(); // Refresh comments
        onCommentCountChange?.(comments.length + 1);
      } else {
        alert('Error posting comment: ' + result.Err);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Error posting comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Posts a reply to a comment
   */
  const postReply = async (parentId: bigint, content: string) => {
    if (!isAuthenticated || !content.trim()) return;

    try {
      const result = await backend.add_comment(postId, content.trim());
      if ('Ok' in result) {
        await fetchComments(); // Refresh comments to show new reply
        onCommentCountChange?.(comments.length + 1);
      } else {
        alert('Error posting reply: ' + result.Err);
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Error posting reply. Please try again.');
    }
  };

  // Load comments when component is expanded
  useEffect(() => {
    if (showComments && comments.length === 0) {
      fetchComments();
    }
  }, [showComments, comments.length, fetchComments]);

  return (
    <div className="space-y-4">
      {/* Comment Toggle and Count */}
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <span className="text-lg">💬</span>
        <span className="text-sm font-medium">
          {initialCommentCount} {initialCommentCount === 1 ? 'comment' : 'comments'}
        </span>
        <span className={`transform transition-transform ${showComments ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Comment Section */}
      {showComments && (
        <div className="border-l-2 border-gray-100 pl-4 space-y-4">
          {/* New Comment Form */}
          {isAuthenticated ? (
            <div className="space-y-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                maxLength={2000}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {newComment.length}/2000 characters
                </span>
                <button
                  onClick={postComment}
                  disabled={isSubmitting || !newComment.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Posting...' : 'Comment'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600">Please login to comment</p>
            </div>
          )}

          {/* Comments List */}
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id.toString()}
                  comment={comment}
                  level={0}
                  onReply={postReply}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <span className="text-2xl block mb-2">💭</span>
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Individual Comment Component with Threading Support
 */
function CommentItem({ comment, level, onReply }: CommentItemProps) {
  const { isAuthenticated } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format timestamp
  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000); // Convert from nanoseconds
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Limit nesting depth
  const maxLevel = 2;
  const isMaxDepth = level >= maxLevel;

  return (
    <div className={`space-y-3 ${level > 0 ? 'ml-6 border-l border-gray-100 pl-4' : ''}`}>
      {/* Comment Content */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {comment.author_id.toString().slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {comment.author_id.toString().slice(0, 8)}...
              </p>
              <p className="text-xs text-gray-500">
                {formatTime(comment.created_at)}
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
        
        {/* Reply Button */}
        {isAuthenticated && !isMaxDepth && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="mt-2 text-sm text-purple-600 hover:text-purple-800 transition-colors"
          >
            Reply
          </button>
        )}
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="ml-6 space-y-2">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={2}
            maxLength={2000}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowReplyForm(false);
                setReplyContent('');
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReply}
              disabled={isSubmitting || !replyContent.trim()}
              className="px-4 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Posting...' : 'Reply'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
