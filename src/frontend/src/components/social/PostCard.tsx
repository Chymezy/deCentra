'use client';

import React, { useState } from 'react';
import type { FeedPost } from '../../../../declarations/backend/backend.did';
import FollowButton from './FollowButton';
import LikeButton from './LikeButton';
import CommentSystem from './CommentSystem';

interface PostCardProps {
  /** The feed post data including author information */
  post: FeedPost;
  /** Callback when the post is liked/unliked */
  onLike?: (postId: bigint) => void;
  /** Callback when a comment is added */
  onCommentAdded?: (postId: bigint) => void;
}

/**
 * Enhanced PostCard Component
 * 
 * Displays a social media post with comprehensive engagement features.
 * Fully integrated with the backend's social network capabilities.
 * 
 * Features:
 * - Rich post content display with author information
 * - Interactive like/unlike with real-time counts
 * - Comprehensive commenting system with threading
 * - Follow/unfollow functionality for post authors
 * - Responsive design with accessibility support
 * - Real-time engagement metrics
 * - Optimistic UI updates for better UX
 */
export default function PostCard({
  post,
  onLike,
  onCommentAdded,
}: PostCardProps) {
  const [currentLikeCount, setCurrentLikeCount] = useState(Number(post.post.like_count));
  const [currentCommentCount, setCurrentCommentCount] = useState(Number(post.post.comment_count));

  /**
   * Formats timestamp for display
   */
  const formatTimestamp = (timestamp: bigint): string => {
    const date = new Date(Number(timestamp) / 1000000); // Convert from nanoseconds
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  /**
   * Handles like count changes from the LikeButton component
   */
  const handleLikeChange = (postId: bigint, isLiked: boolean, newCount: number) => {
    setCurrentLikeCount(newCount);
    onLike?.(postId);
  };

  /**
   * Handles comment count changes from the CommentSystem component
   */
  const handleCommentCountChange = (newCount: number) => {
    setCurrentCommentCount(newCount);
    onCommentAdded?.(post.post.id);
  };

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          {/* Author Information */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {post.author.username.slice(0, 2).toUpperCase()}
            </div>
            
            {/* Author Details */}
            <div>
              <h3 className="font-semibold text-gray-900">
                {post.author.username}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>@{post.author.username}</span>
                <span>&bull;</span>
                <time dateTime={new Date(Number(post.post.created_at) / 1000000).toISOString()}>
                  {formatTimestamp(post.post.created_at)}
                </time>
              </div>
            </div>
          </div>

          {/* Follow Button */}
          <FollowButton
            targetUserId={post.author.id.toString()}
            size="sm"
            className="ml-4"
          />
        </div>
      </div>

      {/* Post Content */}
      <div className="px-6 pb-4">
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {post.post.content}
          </p>
        </div>
      </div>

      {/* Engagement Bar */}
      <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/50">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <LikeButton
            postId={post.post.id}
            likeCount={currentLikeCount}
            isLiked={post.is_liked}
            onLikeChange={handleLikeChange}
          />

          {/* Comment Count and Toggle */}
          <div className="flex items-center gap-1 text-gray-600">
            <span className="text-sm font-medium">
              {currentCommentCount} comments
            </span>
          </div>

          {/* Share Button (placeholder) */}
          <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span className="text-sm">Share</span>
          </button>
        </div>
      </div>

      {/* Comment System */}
      <CommentSystem
        postId={post.post.id}
        onCommentCountChange={handleCommentCountChange}
      />
    </article>
  );
}
