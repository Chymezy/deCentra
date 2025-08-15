'use client';

import React, { useState, useEffect } from 'react';
import { backend } from '../../../../declarations/backend';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Principal } from '@dfinity/principal';

interface FollowButtonProps {
  /** The Principal ID of the user to follow/unfollow */
  targetUserId: string;
  /** Initial following state (optional for optimization) */
  initialIsFollowing?: boolean;
  /** Size variant of the button */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className for styling */
  className?: string;
  /** Callback when follow state changes */
  onFollowStateChange?: (isFollowing: boolean) => void;
}

/**
 * FollowButton Component - Handles follow/unfollow interactions
 *
 * Features:
 * - Shows current follow state with appropriate button text
 * - Handles follow/unfollow API calls with loading states
 * - Provides visual feedback and error handling
 * - Respects user authentication state
 * - Optimistic UI updates for better UX
 *
 * @param props - FollowButton component props
 */
export default function FollowButton({
  targetUserId,
  initialIsFollowing = false,
  size = 'md',
  className = '',
  onFollowStateChange,
}: FollowButtonProps) {
  const { isAuthenticated, principal } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Don't show follow button for own profile
  const isOwnProfile = principal ? principal.toText() === targetUserId : false;

  /**
   * Checks the current follow status between the authenticated user and target user
   */
  const checkFollowStatus = async () => {
    if (!backend || !principal) return;

    try {
      const followerPrincipal = Principal.fromText(principal.toText());
      const targetPrincipal = Principal.fromText(targetUserId);

      const result = await backend.is_following(
        followerPrincipal,
        targetPrincipal
      );

      if ('Ok' in result) {
        setIsFollowing(result.Ok);
      } else {
        console.error('Error checking follow status:', result.Err);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  // Check follow status on mount and when authentication changes
  useEffect(() => {
    if (isAuthenticated && principal && !isOwnProfile) {
      checkFollowStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, principal, targetUserId, isOwnProfile]);

  /**
   * Handles the follow action
   */
  const handleFollow = async () => {
    if (!backend || !isAuthenticated) {
      setError('Please connect with Internet Identity first');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Optimistic update
    setIsFollowing(true);
    onFollowStateChange?.(true);

    try {
      const targetPrincipal = Principal.fromText(targetUserId);
      const result = await backend.follow_user(targetPrincipal);

      if ('Ok' in result) {
        // Success - optimistic update was correct
      } else {
        // Error - revert optimistic update
        setIsFollowing(false);
        onFollowStateChange?.(false);
        setError(result.Err);
      }
    } catch (error) {
      console.error('Error following user:', error);
      // Revert optimistic update
      setIsFollowing(false);
      onFollowStateChange?.(false);
      setError('Failed to follow user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the unfollow action
   */
  const handleUnfollow = async () => {
    if (!backend || !isAuthenticated) {
      setError('Please connect with Internet Identity first');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Optimistic update
    setIsFollowing(false);
    onFollowStateChange?.(false);

    try {
      const targetPrincipal = Principal.fromText(targetUserId);
      const result = await backend.unfollow_user(targetPrincipal);

      if ('Ok' in result) {
        // Success - optimistic update was correct
      } else {
        // Error - revert optimistic update
        setIsFollowing(true);
        onFollowStateChange?.(true);
        setError(result.Err);
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      // Revert optimistic update
      setIsFollowing(true);
      onFollowStateChange?.(true);
      setError('Failed to unfollow user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the button click based on current follow state
   */
  const handleClick = () => {
    if (isFollowing) {
      handleUnfollow();
    } else {
      handleFollow();
    }
  };

  // Don't render for own profile or when not authenticated
  if (!isAuthenticated || isOwnProfile) {
    return null;
  }

  // Button size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Button variant classes based on follow state
  const variantClasses = isFollowing
    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300'
    : 'bg-deep-indigo text-white hover:bg-deep-indigo/90 border border-deep-indigo';

  return (
    <div className="flex flex-col">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`
          ${sizeClasses[size]}
          ${variantClasses}
          rounded-xl font-medium transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:ring-2 focus:ring-deep-indigo focus:ring-offset-2
          active:transform active:scale-95
          ${className}
        `}
        aria-label={isFollowing ? 'Unfollow user' : 'Follow user'}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {isFollowing ? 'Unfollowing...' : 'Following...'}
          </span>
        ) : (
          <span>{isFollowing ? 'Following' : 'Follow'}</span>
        )}
      </button>

      {/* Error message */}
      {error && (
        <p className="text-red-500 text-sm mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
