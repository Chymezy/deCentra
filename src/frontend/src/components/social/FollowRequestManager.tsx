'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { backend } from '../../../../declarations/backend';
import { useAuth } from '../AuthContext';
import type { FollowRequest } from '../../../../declarations/backend/backend.did';

interface FollowRequestManagerProps {
  onRequestCountChange?: (count: number) => void;
}

/**
 * FollowRequestManager Component
 *
 * Manages incoming follow requests with approve/reject functionality.
 * Provides a comprehensive interface for handling social connections.
 *
 * Features:
 * - Real-time follow request loading
 * - Approve/reject functionality with backend integration
 * - Request status management
 * - User-friendly request display
 * - Error handling and loading states
 */
export default function FollowRequestManager({
  onRequestCountChange,
}: FollowRequestManagerProps) {
  const { isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<bigint>>(new Set());
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches pending follow requests
   */
  const fetchFollowRequests = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await backend.get_pending_follow_requests();
      if ('Ok' in result) {
        setRequests(result.Ok);
        onRequestCountChange?.(result.Ok.length);
      } else {
        setError('Failed to load follow requests: ' + result.Err);
      }
    } catch (error) {
      console.error('Error fetching follow requests:', error);
      setError('Network error loading follow requests');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, onRequestCountChange]);

  /**
   * Approves a follow request
   */
  const approveRequest = async (requestId: bigint) => {
    setProcessingIds((prev) => new Set([...prev, requestId]));

    try {
      const result = await backend.approve_follow_request(requestId);
      if ('Ok' in result) {
        // Remove from requests list
        setRequests((prev) => prev.filter((req) => req.id !== requestId));
        onRequestCountChange?.(requests.length - 1);
      } else {
        alert('Failed to approve request: ' + result.Err);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Network error. Please try again.');
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  /**
   * Rejects a follow request
   */
  const rejectRequest = async (requestId: bigint) => {
    setProcessingIds((prev) => new Set([...prev, requestId]));

    try {
      const result = await backend.reject_follow_request(requestId);
      if ('Ok' in result) {
        // Remove from requests list
        setRequests((prev) => prev.filter((req) => req.id !== requestId));
        onRequestCountChange?.(requests.length - 1);
      } else {
        alert('Failed to reject request: ' + result.Err);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Network error. Please try again.');
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

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

  // Load requests when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchFollowRequests();
    }
  }, [isAuthenticated, fetchFollowRequests]);

  if (!isAuthenticated) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Please login to view follow requests</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Follow Requests
          </h2>
          <button
            onClick={fetchFollowRequests}
            disabled={isLoading}
            className="text-sm text-purple-600 hover:text-purple-800 disabled:opacity-50"
          >
            {isLoading ? '🔄' : '↻'} Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {error ? (
          <div className="text-center py-8">
            <span className="text-red-500 text-2xl block mb-2">⚠️</span>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={fetchFollowRequests}
              className="mt-2 text-sm text-purple-600 hover:text-purple-800"
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 text-sm mt-2">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl block mb-2">👥</span>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No follow requests
            </h3>
            <p className="text-gray-500 text-sm">
              When people request to follow you, they&apos;ll appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id.toString()}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {/* User Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {request.requester.toString().slice(0, 2).toUpperCase()}
                  </div>

                  {/* User Info */}
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {request.requester.toString().slice(0, 8)}...
                    </h4>
                    <p className="text-sm text-gray-500">
                      Requested {formatTimestamp(request.created_at)}
                    </p>
                    {request.message.length > 0 && (
                      <p className="text-sm text-gray-700 mt-1 italic">
                        &quot;{request.message[0]}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => approveRequest(request.id)}
                    disabled={processingIds.has(request.id)}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {processingIds.has(request.id) ? '...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => rejectRequest(request.id)}
                    disabled={processingIds.has(request.id)}
                    className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {processingIds.has(request.id) ? '...' : 'Decline'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
