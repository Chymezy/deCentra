import type { Principal } from '@dfinity/principal';
import type { ProfileCreationData, ProfileUpdateData } from './auth.types';

// Re-export from auth.types for backward compatibility
export type { ProfileCreationData, ProfileUpdateData };

// Type aliases for legacy compatibility
export type CreateProfileOptions = ProfileCreationData;
export type UpdateProfileOptions = ProfileUpdateData;

// Re-export all backend types for consistency
export type {
  UserProfile,
  PrivacySettings,
  ProfileVisibility,
  MessagePrivacy,
  VerificationStatus,
  Post,
  PostVisibility,
  FeedPost,
  Comment,
  PlatformStats,
  FollowRequest,
  FollowRequestStatus,
} from '../../../../declarations/backend/backend.did';

// Import types we need for interfaces
import type {
  UserProfile,
  Post,
  PostVisibility,
  PlatformStats,
  Result_1,
  Result_2,
  Result_3,
  Result_4,
  Result_5,
  Result_6,
  Result_7,
} from '../../../../declarations/backend/backend.did';

// Enhanced user service interface matching the actual backend methods
export interface UserService {
  // User profile management
  create_user_profile: (
    username: string,
    bio?: string,
    avatar?: string
  ) => Promise<Result_3>;
  update_user_profile: (
    username: string,
    bio?: string,
    avatar?: string
  ) => Promise<Result_3>;
  get_user_profile: (userId: Principal) => Promise<UserProfile | undefined>;
  get_my_profile: () => Promise<UserProfile | undefined>;

  // Social connections
  follow_user: (targetUserId: Principal) => Promise<Result_1>;
  unfollow_user: (targetUserId: Principal) => Promise<Result_1>;
  get_followers: (
    userId: Principal,
    offset?: bigint,
    limit?: bigint
  ) => Promise<Result_4>;
  get_following: (
    userId: Principal,
    offset?: bigint,
    limit?: bigint
  ) => Promise<Result_4>;
  is_following: (userA: Principal, userB: Principal) => Promise<Result_7>;

  // Follow requests for private profiles
  get_pending_follow_requests: () => Promise<Result_5>;
  approve_follow_request: (requestId: bigint) => Promise<Result_1>;
  reject_follow_request: (requestId: bigint) => Promise<Result_1>;

  // Posts and content
  create_post: (
    content: string,
    visibility?: PostVisibility
  ) => Promise<Result_2>;
  get_user_posts: (
    userId: Principal,
    offset?: bigint,
    limit?: bigint
  ) => Promise<Post[]>;
  get_social_feed: (offset?: bigint, limit?: bigint) => Promise<Result_6>;
  get_user_feed: (offset?: bigint, limit?: bigint) => Promise<Result_6>;

  // Platform stats
  get_platform_stats: () => Promise<PlatformStats>;
  health_check: () => Promise<string>;
}

// Service layer types for user management
export interface UserServiceInterface {
  createProfile(data: ProfileCreationData): Promise<ServiceResult<UserProfile>>;
  updateProfile(data: ProfileUpdateData): Promise<ServiceResult<UserProfile>>;
  getUserProfile(userId: string): Promise<ServiceResult<UserProfile | null>>;
  checkUsernameAvailability(username: string): Promise<ServiceResult<boolean>>;
  searchUsers(query: string, options?: SearchOptions): Promise<ServiceResult<UserProfile[]>>;
  getCurrentUserProfile(): Promise<ServiceResult<UserProfile | null>>;
}

/**
 * Standard service result wrapper for consistent error handling
 */
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Search options for user discovery
 */
export interface SearchOptions {
  exact?: boolean;
  limit?: number;
}

/**
 * Extended profile creation options with privacy modes
 */
export interface CreateProfileOptionsExtended extends ProfileCreationData {
  privacyMode?: 'normal' | 'anonymous' | 'whistleblower';
}

/**
 * Extended profile update options with privacy preservation
 */
export interface UpdateProfileOptionsExtended extends ProfileUpdateData {
  preservePrivacy?: boolean;
}

/**
 * Username validation result
 */
export interface UsernameValidationResult {
  isValid: boolean;
  isAvailable: boolean | null;
  isChecking: boolean;
  error: string | null;
}

/**
 * Profile form validation errors
 */
export interface ProfileValidationErrors {
  username?: string;
  bio?: string;
  avatar?: string;
}

/**
 * Profile creation wizard state
 */
export interface ProfileWizardState {
  currentStep: number;
  isCreating: boolean;
  errors: ProfileValidationErrors;
  formData: ProfileCreationData;
}

// Utility types for working with the service
export interface PaginationOptions {
  offset?: number;
  limit?: number;
}

// Helper functions for working with backend results
export const isOk = <T>(
  result: { Ok: T } | { Err: string }
): result is { Ok: T } => {
  return 'Ok' in result;
};

export const isErr = <T>(
  result: { Ok: T } | { Err: string }
): result is { Err: string } => {
  return 'Err' in result;
};

// Transform backend optional values ([] | [T]) to TypeScript optionals
export const fromOptional = <T>(optional: [] | [T]): T | undefined => {
  return optional.length > 0 ? optional[0] : undefined;
};

export const toOptional = <T>(value: T | undefined): [] | [T] => {
  return value !== undefined ? [value] : [];
};

// Additional utility functions for service results

/**
 * Extract error message from service result
 */
export function getErrorMessage<T>(result: ServiceResult<T>): string {
  return result.error || 'An unknown error occurred';
}

/**
 * Check if service result indicates success
 */
export function isSuccess<T>(result: ServiceResult<T>): result is ServiceResult<T> & { success: true; data: T } {
  return result.success && result.data !== undefined;
}

/**
 * Create a successful service result
 */
export function createSuccessResult<T>(data: T): ServiceResult<T> {
  return { success: true, data };
}

/**
 * Create an error service result
 */
export function createErrorResult<T>(error: string): ServiceResult<T> {
  return { success: false, error };
}
