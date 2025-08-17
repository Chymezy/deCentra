import React from 'react';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import type { UserProfile } from '../../../../declarations/backend/backend.did';

export type PrivacyMode = 'normal' | 'anonymous' | 'whistleblower';

/**
 * Unified authentication state interface
 * Used by both AuthContext and AuthGuard
 */
export interface UnifiedAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  identity: Identity | null;
  principal: Principal | null;
  user: UserProfile | null;
  error: string | null;
  privacyMode?: PrivacyMode;
}

/**
 * Auth state for components that need simplified user data
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
 * Convert UnifiedAuthState to ComponentAuthState
 */
export function toComponentAuthState(authState: UnifiedAuthState): ComponentAuthState {
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
 * Auth context interface with unified types
 */
export interface UnifiedAuthContextType extends UnifiedAuthState {
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
  setPrivacyMode: (mode: PrivacyMode) => void;
}

/**
 * Sidebar user interface
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
 * Convert UserProfile to SidebarUserProfile
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
 * Navigation item interface
 */
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  active: boolean;
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
