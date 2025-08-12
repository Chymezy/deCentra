'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { backend } from '../../../../declarations/backend';
import { useAuth } from '@/components/AuthContext';
import type {
  FollowRequest,
  UserProfile,
} from '../../../../declarations/backend/backend.did';

/**
 * FollowRequestsPanel Component - Manages incoming follow requests
 *
 * Features:
 * - Shows pending follow requests for the authenticated user
 * - Allows approval or rejection of requests
 * - Shows requester profile information
 * - Real-time updates when requests are processed
 * - Empty state when no pending requests
 */
export default function FollowRequestsPanel() {
  const { isAuthenticated } = useAuth();
  const [followRequests, setFollowRequests] = useState<FollowRequest[]>([]);
  const [requesterProfiles, setRequesterProfiles] = useState<
    Record<string, UserProfile>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(
    new Set()
  );
  const [error, setError] = useState<string | null>(null);

  /**
   * Loads pending follow requests for the authenticated user
   */
  const loadFollowRequests = useCallback(async () => {
    if (!backend || !isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await backend.get_pending_follow_requests();

      if ('Ok' in result) {
        const requests = result.Ok;
        setFollowRequests(requests);

        // Load requester profiles
        await loadRequesterProfiles(requests);
      } else {
        setError(result.Err);
      }
    } catch (error) {
      console.error('Error loading follow requests:', error);
      setError('Failed to load follow requests');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load follow requests when component mounts or authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      loadFollowRequests();
    }
  }, [isAuthenticated, loadFollowRequests]);

  /**
   * Loads profile information for all requesters
   */
  const loadRequesterProfiles = async (requests: FollowRequest[]) => {
    if (!backend) return;

    const profiles: Record<string, UserProfile> = {};

    for (const request of requests) {
      try {
        const profileResult = await backend.get_user_profile(request.requester);
        if (profileResult && profileResult.length > 0 && profileResult[0]) {
          profiles[request.requester.toString()] = profileResult[0];
        }
      } catch (error) {
        console.error('Error loading requester profile:', error);
      }
    }

    setRequesterProfiles(profiles);
  };

  /**
   * Approves a follow request
   */
  const approveRequest = async (requestId: string) => {
    if (!backend) return;

    const requestIdBig = BigInt(requestId);
    setProcessingRequests((prev) => new Set(prev).add(requestId));

    try {
      const result = await backend.approve_follow_request(requestIdBig);

      if ('Ok' in result) {
        // Remove the request from the list
        setFollowRequests((prev) =>
          prev.filter((req) => req.id.toString() !== requestId)
        );
      } else {
        setError(result.Err);
      }
    } catch (error) {
      console.error('Error approving follow request:', error);
      setError('Failed to approve follow request');
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  /**
   * Rejects a follow request
   */
  const rejectRequest = async (requestId: string) => {
    if (!backend) return;

    const requestIdBig = BigInt(requestId);
    setProcessingRequests((prev) => new Set(prev).add(requestId));

    try {
      const result = await backend.reject_follow_request(requestIdBig);

      if ('Ok' in result) {
        // Remove the request from the list
        setFollowRequests((prev) =>
          prev.filter((req) => req.id.toString() !== requestId)
        );
      } else {
        setError(result.Err);
      }
    } catch (error) {
      console.error('Error rejecting follow request:', error);
      setError('Failed to reject follow request');
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  /**
   * Formats the request creation date
   */
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000); // Convert from nanoseconds
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-bold text-deep-indigo">
          Follow Requests
        </h2>
        {followRequests.length > 0 && (
          <span className="bg-deep-indigo text-white text-sm px-2 py-1 rounded-full">
            {followRequests.length}
          </span>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="text-red-500 text-center py-4 mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-indigo"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && followRequests.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <p>No pending follow requests</p>
          <p className="text-sm mt-1">
            When users request to follow you, they&apos;ll appear here.
          </p>
        </div>
      )}

      {/* Follow Requests List */}
      {followRequests.length > 0 && (
        <div className="space-y-4">
          {followRequests.map((request) => {
            const requestId = request.id.toString();
            const requesterProfile =
              requesterProfiles[request.requester.toString()];
            const isProcessing = processingRequests.has(requestId);

            return (
              <div
                key={requestId}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-deep-indigo to-electric-blue rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {requesterProfile?.avatar || '👤'}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium text-charcoal-black">
                      {requesterProfile?.username || 'Unknown User'}
                    </h3>
                    {requesterProfile?.bio && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {requesterProfile.bio}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                      <span>
                        {Number(requesterProfile?.follower_count || 0)}{' '}
                        followers
                      </span>
                      <span>Requested on {formatDate(request.created_at)}</span>
                    </div>
                    {request.message && request.message.length > 0 && (
                      <p className="text-sm text-gray-700 mt-2 italic border-l-2 border-gray-300 pl-2">
                        &quot;{request.message[0]}&quot;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => approveRequest(requestId)}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-green-500 text-white text-sm rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Approve follow request"
                  >
                    {isProcessing ? '...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => rejectRequest(requestId)}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Reject follow request"
                  >
                    {isProcessing ? '...' : 'Decline'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Refresh Button */}
      {followRequests.length > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={loadFollowRequests}
            disabled={isLoading}
            className="text-deep-indigo hover:text-deep-indigo/80 text-sm font-medium disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      )}
    </div>
  );
}
