'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { userService } from '@/lib/services/user.service';
import { icons } from '@/lib/icons';
import type { UserProfile } from '@/lib/types/user.types';
import { useDebounce } from '../../lib/hooks/useDebounce';

interface UserSearchProps {
  onUserSelect?: (user: UserProfile) => void;
  placeholder?: string;
  className?: string;
  showResults?: boolean;
  maxResults?: number;
  autoFocus?: boolean;
}

/**
 * UserSearch Component
 *
 * Provides real-time user search with debounced queries and accessibility support.
 * Respects privacy settings and displays filtered results.
 *
 * Features:
 * - Debounced search queries (300ms default)
 * - Keyboard navigation support
 * - Privacy-respecting results filtering
 * - Loading and empty states
 * - Accessibility compliance (WCAG 2.1 AA)
 *
 * @param onUserSelect - Callback when user is selected
 * @param placeholder - Input placeholder text
 * @param className - Additional CSS classes
 * @param showResults - Whether to show dropdown results
 * @param maxResults - Maximum number of results to show
 * @param autoFocus - Whether to auto-focus the input
 */
export const UserSearch: React.FC<UserSearchProps> = ({
  onUserSelect,
  placeholder = 'Search users...',
  className = '',
  showResults = true,
  maxResults = 10,
  autoFocus = false,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  // Debounce search query to avoid excessive API calls
  const debouncedQuery = useDebounce(query, 300);

  // Search users function
  const searchUsers = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.trim().length < 2) {
        setResults([]);
        setError(null);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const result = await userService.searchUsers(searchQuery, {
          limit: maxResults,
        });
        if (result.success && result.data) {
          setResults(result.data);
        } else {
          setResults([]);
          setError('error' in result ? result.error : 'Search failed');
        }
      } catch (searchError) {
        console.error('Search failed:', searchError);
        setResults([]);
        setError('Network error during search');
      } finally {
        setIsSearching(false);
      }
    },
    [maxResults]
  );

  // Effect for debounced search
  useEffect(() => {
    if (debouncedQuery) {
      searchUsers(debouncedQuery);
    } else {
      setResults([]);
      setError(null);
    }
  }, [debouncedQuery, searchUsers]);

  // Handle user selection
  const handleUserSelect = (user: UserProfile) => {
    if (onUserSelect) {
      onUserSelect(user);
    }
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleUserSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setQuery(newQuery);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // Handle input blur with delay for clicks
  const handleInputBlur = () => {
    // Delay closing to allow clicks on results
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 200);
  };

  // Generate unique ID for accessibility
  const searchId = React.useId();
  const listboxId = `${searchId}-listbox`;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-colors"
          role="combobox"
          aria-expanded={isOpen && results.length > 0}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            selectedIndex >= 0
              ? `${searchId}-option-${selectedIndex}`
              : undefined
          }
          aria-describedby={error ? `${searchId}-error` : undefined}
        />

        {/* Search icon and loading indicator */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {isSearching ? (
            <div
              className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
              aria-label="Searching..."
            />
          ) : (
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Search results dropdown */}
      {showResults && isOpen && (
        <>
          {results.length > 0 && (
            <div
              className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              role="listbox"
              id={listboxId}
              aria-label="Search results"
            >
              {results.map((user, index) => (
                <button
                  key={user.id.toString()}
                  onClick={() => handleUserSelect(user)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${
                    selectedIndex === index ? 'bg-gray-50 dark:bg-gray-700' : ''
                  }`}
                  role="option"
                  id={`${searchId}-option-${index}`}
                  aria-selected={selectedIndex === index}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                      {user.avatar ? (
                        user.avatar
                      ) : (
                        <icons.user
                          className="w-4 h-4 text-gray-600 dark:text-gray-300"
                          aria-hidden={true}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        @{user.username}
                      </div>
                      {user.bio && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user.bio.slice(0, 50)}
                          {user.bio.length > 50 ? '...' : ''}
                        </div>
                      )}
                    </div>
                    {'Verified' in user.verification_status && (
                      <div className="flex-shrink-0">
                        <icons.check
                          className="w-4 h-4 text-blue-500"
                          aria-label="Verified user"
                        />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results message */}
          {query.length >= 2 &&
            results.length === 0 &&
            !isSearching &&
            !error && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-4 text-center text-gray-500 dark:text-gray-400">
                No users found for &quot;{query}&quot;
              </div>
            )}

          {/* Error message */}
          {error && (
            <div
              className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-600 rounded-lg shadow-lg p-4 text-center text-red-600 dark:text-red-400"
              id={`${searchId}-error`}
              role="alert"
            >
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * Compact UserSearch for smaller spaces
 */
export const UserSearchCompact: React.FC<Omit<UserSearchProps, 'className'>> = (
  props
) => {
  return <UserSearch {...props} className="max-w-xs" maxResults={5} />;
};

/**
 * UserSearch with enhanced features for admin interfaces
 */
export const UserSearchAdvanced: React.FC<
  UserSearchProps & {
    showVerificationStatus?: boolean;
    showUserStats?: boolean;
  }
> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showVerificationStatus = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showUserStats = true,
  ...props
}) => {
  // Features could be implemented based on flags
  // For now, just use the base component
  return <UserSearch {...props} />;
};
