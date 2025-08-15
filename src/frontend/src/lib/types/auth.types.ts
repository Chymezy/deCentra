import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

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

// Import backend types
import type { UserProfile } from '../../../../declarations/backend/backend.did';

export interface AuthState {
  isAuthenticated: boolean;
  identity: Identity | null;
  principal: Principal | null;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: () => Promise<void>;
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
}

// Profile creation form data
export interface ProfileCreationData {
  username: string;
  bio?: string;
  avatar?: string;
}

// Profile update form data
export interface ProfileUpdateData {
  username: string;
  bio?: string;
  avatar?: string;
}

// Authentication result types
export type AuthResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

// Service response types for better error handling
export type ServiceResult<T> = Promise<AuthResult<T>>;
