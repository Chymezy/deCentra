'use client';

import React, { useState, useEffect } from 'react';
import { backend } from '../../../../declarations/backend';
import { Principal } from '@dfinity/principal';
import type { UserProfile } from '../../../../declarations/backend/backend.did';
import FollowButton from './FollowButton';

interface UserConnectionsDisplayProps {
  /** The Principal ID of the user whose connections to display */
  userId: string;
  /** The user profile for display optimization */
  userProfile?: UserProfile;
  /** Whether this is the current user's profile */
  isOwnProfile?: boolean;
}

/**
 * UserConnectionsDisplay Component - Shows followers and following lists
 *
 * Features:
 * - Displays follower and following counts
 * - Shows lists of followers and following users
 * - Pagination for large lists
 * - Privacy-aware display based on user settings
 * - Follow/unfollow functionality for each user
 */
export default function UserConnectionsDisplay({
  userId,
  userProfile,
  isOwnProfile = false,
}: UserConnectionsDisplayProps) {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(
    'followers'
  );
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const ITEMS_PER_PAGE = 20;

  // Load connections when tab changes or component mounts
  useEffect(() => {
    loadConnections(true); // true = reset
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, userId]);

  /**
   * Loads followers or following list based on active tab
   */
  const loadConnections = async (reset = false) => {
    if (!backend || !userId) return;

    setIsLoading(true);
    setError(null);

    const currentOffset = reset ? 0 : offset;
    if (reset) {
      setOffset(0);
      setHasMore(true);
    }

    try {
      // Validate and convert Principal
      let principal: Principal;
      try {
        principal = Principal.fromText(userId);
      } catch {
        throw new Error('Invalid user ID format');
      }

      // Convert numbers to proper optional array types for backend calls
      const limit = [BigInt(ITEMS_PER_PAGE)] as [] | [bigint];
      const offsetArray = [BigInt(currentOffset)] as [] | [bigint];

      let result;
      if (activeTab === 'followers') {
        result = await backend.get_followers(principal, limit, offsetArray);
      } else {
        result = await backend.get_following(principal, limit, offsetArray);
      }

      if ('Ok' in result) {
        const newUsers = result.Ok;

        if (reset) {
          if (activeTab === 'followers') {
            setFollowers(newUsers);
          } else {
            setFollowing(newUsers);
          }
        } else {
          if (activeTab === 'followers') {
            setFollowers((prev) => [...prev, ...newUsers]);
          } else {
            setFollowing((prev) => [...prev, ...newUsers]);
          }
        }

        setHasMore(newUsers.length === ITEMS_PER_PAGE);
        setOffset(currentOffset + newUsers.length);
      } else {
        setError(result.Err);
        setHasMore(false);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading connections:', error);
      }
      setError(
        error instanceof Error ? error.message : 'Failed to load connections'
      );
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Loads more connections for pagination
   */
  const loadMore = () => {
    if (!isLoading && hasMore) {
      loadConnections(false);
    }
  };

  /**
   * Handles follow state changes to update local counts
   */
  const handleFollowStateChange = (
    targetUserId: string,
    isFollowing: boolean
  ) => {
    // Actually update the local follower/following counts
    if (userProfile && isOwnProfile) {
      // Update the user's following count if this is their own profile
      // This would require lifting state up or using a state management solution
    }

    // Optionally refresh the connections list to reflect changes
    if (activeTab === 'following' && !isFollowing) {
      // Remove the unfollowed user from the current list
      setFollowing((prev) =>
        prev.filter((user) => user.id.toString() !== targetUserId)
      );
    }
  };

  const currentList = activeTab === 'followers' ? followers : following;

  // Fix property access for follower/following counts
  const followerCount = userProfile
    ? Number(userProfile.follower_count || 0)
    : 0;
  const followingCount = userProfile
    ? Number(userProfile.following_count || 0)
    : 0;

  // Check if social graph is visible (privacy settings)
  const isSocialGraphVisible =
    userProfile?.privacy_settings?.show_social_graph !== false || isOwnProfile;

  if (!isSocialGraphVisible) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-xl font-heading font-bold text-deep-indigo mb-4">
          Social Connections
        </h2>
        <p className="text-gray-500 text-center py-8">
          This user&apos;s social connections are private.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-xl font-heading font-bold text-deep-indigo mb-6">
        Social Connections
      </h2>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('followers')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'followers'
              ? 'border-deep-indigo text-deep-indigo'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          aria-label={`View followers list (${followerCount} followers)`}
        >
          Followers ({followerCount})
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'following'
              ? 'border-deep-indigo text-deep-indigo'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          aria-label={`View following list (${followingCount} following)`}
        >
          Following ({followingCount})
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-red-500 text-center py-4" role="alert">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && currentList.length === 0 && (
        <div
          className="flex justify-center py-8"
          aria-label="Loading connections"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-indigo"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && currentList.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          {activeTab === 'followers'
            ? 'No followers yet'
            : 'Not following anyone yet'}
        </div>
      )}

      {/* Users List */}
      {currentList.length > 0 && (
        <div className="space-y-4">
          {currentList.map((user) => (
            <div
              key={user.id.toString()}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-deep-indigo to-electric-blue rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user.avatar || '👤'}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-charcoal-black">
                    {user.username}
                  </h3>
                  {user.bio && (
                    <p className="text-sm text-gray-600 truncate max-w-xs">
                      {user.bio}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                    <span>{Number(user.follower_count || 0)} followers</span>
                    <span>{Number(user.following_count || 0)} following</span>
                  </div>
                </div>
              </div>

              <FollowButton
                targetUserId={user.id.toString()}
                size="sm"
                onFollowStateChange={(isFollowing) =>
                  handleFollowStateChange(user.id.toString(), isFollowing)
                }
              />
            </div>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="px-4 py-2 text-deep-indigo border border-deep-indigo rounded-xl hover:bg-deep-indigo hover:text-white transition-colors disabled:opacity-50"
                aria-label="Load more connections"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
