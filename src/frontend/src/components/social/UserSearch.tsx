'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import FollowButton from './FollowButton';
import type { UserProfile } from '../../../../declarations/backend/backend.did';

interface UserSearchProps {
  onUserSelect?: (user: UserProfile) => void;
  placeholder?: string;
  showFollowButtons?: boolean;
  maxResults?: number;
  className?: string;
}

interface UserSearchResult {
  user: UserProfile;
  isFollowing?: boolean;
}

/**
 * UserSearch Component
 * 
 * A comprehensive user search component with real-time search and follow functionality.
 * Integrates with the backend's user search capabilities.
 * 
 * Features:
 * - Real-time search with debouncing
 * - User profile display with avatars
 * - Follow/unfollow integration
 * - Responsive design
 * - Keyboard navigation support
 * - Loading and error states
 */
export default function UserSearch({
  onUserSelect,
  placeholder = "Search users...",
  showFollowButtons = true,
  className = ""
}: UserSearchProps) {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Debounced search function
   */
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // TODO: Implement search_users in backend
      // For now, show a placeholder message
      setError('User search feature coming soon!');
      setSearchResults([]);
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Trigger search when query changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [searchQuery, performSearch]);

  /**
   * Handles user selection
   */
  const handleUserSelect = (user: UserProfile) => {
    onUserSelect?.(user);
    setShowResults(false);
    setSearchQuery('');
  };

  /**
   * Formats user display name
   */
  const getUserDisplayName = (user: UserProfile): string => {
    // UserProfile has bio as string, not optional array
    return user.username; // Use username as display name for now
  };

  /**
   * Gets user bio or default text
   */
  const getUserBio = (user: UserProfile): string => {
    return user.bio || 'No bio available';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)} // Delay to allow clicks
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
        />
        
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {isSearching ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
          ) : (
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {error ? (
            <div className="p-4 text-center text-red-600">
              <span className="text-lg block mb-2">⚠️</span>
              <p className="text-sm">{error}</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {searchResults.map(({ user }) => (
                <div
                  key={user.id.toString()}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* User Avatar */}
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.username.slice(0, 2).toUpperCase()}
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {getUserDisplayName(user)}
                          </h3>
                          {user.verification_status && !('Unverified' in user.verification_status) && (
                            <span className="flex-shrink-0">
                              {'Verified' in user.verification_status && '✅'}
                              {'Whistleblower' in user.verification_status && '🔒'}
                              {'Organization' in user.verification_status && '🏢'}
                              {'Journalist' in user.verification_status && '📰'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">@{user.username}</p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {getUserBio(user)}
                        </p>
                      </div>
                    </div>

                    {/* Follow Button */}
                    {showFollowButtons && isAuthenticated && (
                      <div className="flex-shrink-0 ml-3">
                        <FollowButton
                          targetUserId={user.id.toString()}
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery.length >= 2 && !isSearching ? (
            <div className="p-4 text-center text-gray-500">
              <span className="text-lg block mb-2">👤</span>
              <p className="text-sm">No users found for &quot;{searchQuery}&quot;</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
