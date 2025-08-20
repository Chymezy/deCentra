import React from 'react';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import type { UserProfile } from '../../../../declarations/backend/backend.did';

// Re-export backend types for consistency
export type {
  UserProfile,
  PrivacySettings,
  ProfileVisibility,
  MessagePrivacy,
  VerificationStatus,
  PostVisibility,
  Post,
  FeedPost,
  Comment,
  PlatformStats,
} from '../../../../declarations/backend/backend.did';

// =============================================================================
// CORE TYPES
// =============================================================================

export type PrivacyMode = 'normal' | 'anonymous' | 'whistleblower';

/**
 * Core authentication state interface
 * Used by AuthContext and throughout the application
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  identity: Identity | null;
  principal: Principal | null;
  user: UserProfile | null;
  error: string | null;
  privacyMode?: PrivacyMode;
}

/**
 * Auth context interface with all authentication methods
 */
export interface AuthContextType extends AuthState {
  login: (privacyMode?: PrivacyMode) => Promise<void>;
  logout: () => Promise<void>;
  createUserProfile: (
    username: string,
    bio?: string,
    avatar?: string
  ) => Promise<UserProfile | null>;
  updateUserProfile: (
    username: string,
    bio?: string,
    avatar?: string
  ) => Promise<UserProfile | null>;
  refreshAuth: () => Promise<void>;
  clearAuthError: () => void;
  setPrivacyMode: (mode: PrivacyMode) => void;
}

// =============================================================================
// COMPONENT-SPECIFIC TYPES
// =============================================================================

/**
 * Simplified auth state for components that need basic user data
 */
export interface ComponentAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: {
    id: string;
    username: string;
    displayName?: string;
    avatar?: string;
    verified: boolean;
    privacyMode: PrivacyMode;
  };
  error?: string;
}

/**
 * Sidebar user profile interface
 */
export interface SidebarUserProfile {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  verified?: boolean;
  stats?: {
    followers: number;
    following: number;
    posts: number;
  };
}

/**
 * Navigation item interface
 */
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  active: boolean;
}

// =============================================================================
// FORM DATA TYPES
// =============================================================================

/**
 * Profile creation form data with privacy mode support
 */
export interface ProfileCreationData {
  username: string;
  bio?: string;
  avatar?: string;
  privacyMode?: PrivacyMode;
}

/**
 * Profile update form data
 */
export interface ProfileUpdateData {
  username: string;
  bio?: string;
  avatar?: string;
  privacyMode?: PrivacyMode;
}

// =============================================================================
// RESULT TYPES
// =============================================================================

/**
 * Generic authentication result type for better error handling
 */
export type AuthResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Service response types for async operations
 */
export type ServiceResult<T> = Promise<AuthResult<T>>;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Convert AuthState to ComponentAuthState for simplified component usage
 */
export function toComponentAuthState(authState: AuthState): ComponentAuthState {
  return {
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    user: authState.user ? {
      id: authState.user.id?.toString() || '',
      username: authState.user.username || '',
      displayName: authState.user.username || '', // Note: backend doesn't have display_name field
      avatar: authState.user.avatar || '👤',
      verified: 'Verified' in authState.user.verification_status,
      privacyMode: authState.privacyMode || 'normal',
    } : undefined,
    error: authState.error || undefined,
  };
}

/**
 * Convert UserProfile to SidebarUserProfile for sidebar display
 */
export function toSidebarUserProfile(user: UserProfile): SidebarUserProfile {
  return {
    id: user.id?.toString() || '',
    username: user.username || '',
    displayName: user.username || '', // Fallback to username since backend doesn't have display_name
    avatar: user.avatar || '👤',
    verified: 'Verified' in user.verification_status,
    stats: {
      followers: Number(user.follower_count || 0n),
      following: Number(user.following_count || 0n),
      posts: Number(user.post_count || 0n),
    },
  };
}

/**
 * Navigation items configuration (icons should be provided by consuming component)
 */
export const getNavigationItemsConfig = (currentPath: string): Omit<NavigationItem, 'icon'>[] => [
  { id: 'home', label: 'Home', href: '/', active: currentPath === '/' },
  { id: 'feed', label: 'Feed', href: '/feed', active: currentPath === '/feed' },
  { id: 'discover', label: 'Discover', href: '/discover', active: currentPath === '/discover' },
  { id: 'notifications', label: 'Notifications', href: '/notifications', active: currentPath === '/notifications' },
  { id: 'messages', label: 'Messages', href: '/messages', active: currentPath === '/messages' },
  { id: 'profile', label: 'Profile', href: '/profile', active: currentPath === '/profile' },
  { id: 'creator', label: 'Creator Hub', href: '/creator', active: currentPath === '/creator' },
  { id: 'settings', label: 'Settings', href: '/settings', active: currentPath === '/settings' },
];
