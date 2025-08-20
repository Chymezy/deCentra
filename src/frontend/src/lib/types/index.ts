// Central type exports for the deCentra frontend

// Re-export all backend types from Candid declarations
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
  Result_1,
  Result_2,
  Result_3,
  Result_4,
  Result_5,
  Result_6,
  Result_7,
} from '../../../../declarations/backend/backend.did';

// Export frontend-specific types
export type {
  AuthState,
  AuthContextType,
  ComponentAuthState,
  SidebarUserProfile,
  NavigationItem,
  ProfileCreationData,
  ProfileUpdateData,
  AuthResult,
  ServiceResult,
  PrivacyMode,
} from './auth.types';

// Export utility functions from auth.types
export { 
  toComponentAuthState, 
  toSidebarUserProfile, 
  getNavigationItemsConfig 
} from './auth.types';

export type {
  UserService,
  PaginationOptions,
  CreateProfileOptions,
  UpdateProfileOptions,
} from './user.types';

// Export utility functions
export { isOk, isErr, fromOptional, toOptional } from './user.types';
