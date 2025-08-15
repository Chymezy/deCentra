import type { Principal } from '@dfinity/principal';

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

// Utility types for working with the service
export interface PaginationOptions {
  offset?: number;
  limit?: number;
}

export interface CreateProfileOptions {
  username: string;
  bio?: string;
  avatar?: string;
}

export interface UpdateProfileOptions {
  username: string;
  bio?: string;
  avatar?: string;
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
