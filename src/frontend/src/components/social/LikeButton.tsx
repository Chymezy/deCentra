'use client';

import React, { useState } from 'react';
import { backend } from '../../../../declarations/backend';
import { useAuth } from '../AuthContext';

interface LikeButtonProps {
  postId: bigint;
  isLiked: boolean;
  likeCount: number;
  onLikeChange?: (postId: bigint, isLiked: boolean, newCount: number) => void;
}

/**
 * LikeButton Component
 *
 * Interactive like/unlike button with optimistic updates and backend integration.
 * Provides immediate user feedback while handling backend synchronization.
 *
 * Features:
 * - Optimistic UI updates for better UX
 * - Automatic error recovery with state rollback
 * - Authentication requirement enforcement
 * - Visual feedback for interactions
 * - Duplicate like prevention (handled by backend)
 */
export default function LikeButton({
  postId,
  isLiked: initialIsLiked,
  likeCount: initialLikeCount,
  onLikeChange,
}: LikeButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      alert('Please login to like posts');
      return;
    }

    if (isLoading) return; // Prevent double-clicks

    // Optimistic update
    const newIsLiked = !isLiked;
    const optimisticCount = newIsLiked ? likeCount + 1 : likeCount - 1;

    setIsLiked(newIsLiked);
    setLikeCount(optimisticCount);
    setIsLoading(true);

    try {
      let result;

      if (newIsLiked) {
        result = await backend.like_post(postId);
      } else {
        result = await backend.unlike_post(postId);
      }

      if ('Ok' in result) {
        // Success - notify parent component of the change
        onLikeChange?.(postId, newIsLiked, optimisticCount);
      } else {
        // Backend error - rollback optimistic update
        console.error('Like/unlike failed:', result.Err);
        setIsLiked(!newIsLiked);
        setLikeCount(likeCount);

        // Show user-friendly error message
        if (
          result.Err.includes('already liked') ||
          result.Err.includes('not liked')
        ) {
          // Duplicate like/unlike - sync with actual state
          setIsLiked(initialIsLiked);
          setLikeCount(initialLikeCount);
        } else {
          alert('Error updating like: ' + result.Err);
        }
      }
    } catch (error) {
      console.error('Network error during like/unlike:', error);

      // Rollback optimistic update
      setIsLiked(!newIsLiked);
      setLikeCount(likeCount);

      alert('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLikeToggle}
      disabled={!isAuthenticated || isLoading}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
        ${
          isLiked
            ? 'bg-red-50 text-red-600 hover:bg-red-100'
            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
        }
        ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        ${isLoading ? 'animate-pulse' : ''}
      `}
      aria-label={isLiked ? 'Unlike post' : 'Like post'}
      aria-pressed={isLiked}
    >
      <span
        className={`text-lg transition-transform duration-200 ${isLoading ? 'animate-bounce' : ''}`}
      >
        {isLiked ? '❤️' : '🤍'}
      </span>
      <span className="text-sm font-medium">
        {likeCount} {likeCount === 1 ? 'like' : 'likes'}
      </span>
    </button>
  );
}
