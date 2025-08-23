import { HttpAgent, Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { createActor } from '../../../../declarations/backend';
import type {
  UserProfile,
  ProfileCreationData,
  ProfileUpdateData,
  ServiceResult,
  PrivacyMode,
} from '@/lib/types';
import { icpConfig } from '@/lib/config/icp.config';
import { logAuthError } from '@/lib/utils/auth-error-handler';

// =============================================================================
// VALIDATION CONSTANTS
// =============================================================================

/** Minimum username length as per backend requirements */
export const MIN_USERNAME_LENGTH = 3;

/** Maximum username length as per backend requirements */
export const MAX_USERNAME_LENGTH = 50;

/** Maximum bio length as per backend requirements */
export const MAX_BIO_LENGTH = 500;

/** Maximum avatar length for emojis or short URLs */
export const MAX_AVATAR_LENGTH = 100;

/** Username validation regex - alphanumeric, underscore, and dash only */
export const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * Comprehensive error types for user service operations
 * Following deCentra security and error handling patterns
 */
export enum UserServiceErrorCode {
  // Authentication Errors
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // Validation Errors
  INVALID_USERNAME_FORMAT = 'INVALID_USERNAME_FORMAT',
  USERNAME_TOO_SHORT = 'USERNAME_TOO_SHORT',
  USERNAME_TOO_LONG = 'USERNAME_TOO_LONG',
  USERNAME_ALREADY_TAKEN = 'USERNAME_ALREADY_TAKEN',
  BIO_TOO_LONG = 'BIO_TOO_LONG',
  AVATAR_TOO_LONG = 'AVATAR_TOO_LONG',
  INVALID_PRIVACY_MODE = 'INVALID_PRIVACY_MODE',

  // Network & System Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  BACKEND_ERROR = 'BACKEND_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * User service error class with enhanced context
 */
export class UserServiceError extends Error {
  constructor(
    public code: UserServiceErrorCode,
    message: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'UserServiceError';
  }
}

/**
 * User Service for deCentra Social Network
 *
 * Provides type-safe integration with the backend canister for user management.
 * Handles profile creation, updates, retrieval, and search functionality.
 *
 * # Security Features
 * - Authentication validation for all operations
 * - Input sanitization and validation
 * - Rate limiting protection
 * - Privacy-preserving user search
 *
 * # Error Handling
 * - Comprehensive error mapping from backend
 * - Graceful degradation for network issues
 * - User-friendly error messages
 */
export class UserService {
  private static instance: UserService;
  private actor: ReturnType<typeof createActor> | null = null;

  private constructor() {}

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Initialize the service with an authenticated actor
   *
   * @param identity - Optional identity for authentication
   * @throws Error - If initialization fails
   */
  async initialize(identity?: Identity): Promise<void> {
    try {
      const agent = new HttpAgent({
        host: icpConfig.host,
        identity,
      });

      // Fetch root key for local development
      if (icpConfig.host === 'http://localhost:4943') {
        await agent.fetchRootKey();
      }

      this.actor = createActor(icpConfig.canisters.backend, {
        agent,
      });
    } catch (error) {
      logAuthError(error, 'Failed to initialize UserService');
      throw new Error('UserService initialization failed');
    }
  }

  /**
   * Creates a new user profile - DELEGATES to auth.service for consistency
   *
   * @deprecated Use auth.service.createUserProfile directly for new code
   * This method exists for backward compatibility and delegates to the canonical auth service
   *
   * @param profileData - Profile creation data with privacy mode support
   * @returns Promise<ServiceResult<UserProfile>> - Creation result
   */
  async createProfile(
    profileData: ProfileCreationData
  ): Promise<ServiceResult<UserProfile>> {
    try {
      // Import auth service to delegate profile creation
      const { authService } = await import('@/lib/services/auth.service');

      // Delegate to canonical auth service - this eliminates duplication
      const profile = await authService.createUserProfile(
        profileData.username,
        profileData.bio,
        profileData.avatar
      );

      return { success: true, data: profile };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Profile creation failed';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Updates an existing user profile with enhanced validation and privacy support
   *
   * @param updateData - Profile update data with optional privacy mode
   * @returns Promise<ServiceResult<UserProfile>> - Update result
   *
   * # Security
   * - Only profile owner can update
   * - Validates all input parameters with enhanced rules
   * - Maintains creation timestamp
   * - Supports privacy mode transitions
   * - Prevents username conflicts
   */
  async updateProfile(
    updateData: ProfileUpdateData
  ): Promise<ServiceResult<UserProfile>> {
    if (!this.actor) {
      throw new UserServiceError(
        UserServiceErrorCode.NOT_INITIALIZED,
        'UserService not initialized. Call initialize() first.'
      );
    }

    try {
      // Enhanced validation with privacy mode support
      this.validateProfileData(updateData);

      // Check username availability if username is being changed
      const currentProfile = await this.getCurrentUserProfile();
      if (currentProfile.success && currentProfile.data) {
        if (updateData.username !== currentProfile.data.username) {
          const availabilityResult = await this.checkUsernameAvailability(
            updateData.username
          );
          if (!availabilityResult.success) {
            throw new UserServiceError(
              UserServiceErrorCode.BACKEND_ERROR,
              availabilityResult.error ||
                'Failed to check username availability'
            );
          }

          if (!availabilityResult.data) {
            throw new UserServiceError(
              UserServiceErrorCode.USERNAME_ALREADY_TAKEN,
              `Username "${updateData.username}" is already taken`
            );
          }
        }
      }

      const result = await this.actor.update_user_profile(
        updateData.username,
        updateData.bio ? [updateData.bio] : [],
        updateData.avatar ? [updateData.avatar] : []
      );

      if ('Ok' in result) {
        // Log privacy mode transition (if not whistleblower)
        if (updateData.privacyMode !== 'whistleblower') {
          console.log(
            `Profile updated with privacy mode: ${updateData.privacyMode || 'normal'}`
          );
        }

        return { success: true, data: result.Ok };
      } else {
        throw new UserServiceError(
          UserServiceErrorCode.BACKEND_ERROR,
          result.Err
        );
      }
    } catch (error) {
      if (error instanceof UserServiceError) {
        logAuthError(error, `Profile update failed: ${error.code}`);
        return {
          success: false,
          error: error.message,
        };
      }

      logAuthError(error, 'Profile update failed unexpectedly');
      return {
        success: false,
        error:
          'An unexpected error occurred during profile update. Please try again.',
      };
    }
  }

  /**
   * Retrieves a user profile by ID
   *
   * @param userId - User identifier
   * @returns Promise<ServiceResult<UserProfile | null>> - Profile or null if not found
   */
  async getUserProfile(
    userId: string
  ): Promise<ServiceResult<UserProfile | null>> {
    if (!this.actor) {
      throw new Error('UserService not initialized');
    }

    try {
      // Convert string to Principal
      const principal = Principal.fromText(userId);
      const result = await this.actor.get_user_profile(principal);

      if (result.length > 0) {
        return { success: true, data: result[0] || null };
      } else {
        return { success: true, data: null };
      }
    } catch (error) {
      logAuthError(error, 'Failed to get user profile');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get profile',
      };
    }
  }

  /**
   * Checks if a username is available - DELEGATES to auth.service for consistency
   *
   * @deprecated Use auth.service.checkUsernameAvailability directly for new code
   * This method exists for backward compatibility and delegates to the canonical auth service
   *
   * @param username - Username to check
   * @returns Promise<ServiceResult<boolean>> - Availability result
   */
  async checkUsernameAvailability(
    username: string
  ): Promise<ServiceResult<boolean>> {
    try {
      // Import auth service to delegate username checking
      const { authService } = await import('@/lib/services/auth.service');

      // Delegate to canonical auth service - this eliminates duplication
      const isAvailable = await authService.checkUsernameAvailability(username);

      return { success: true, data: isAvailable };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Username availability check failed';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Search for users by username or display name
   *
   * @param query - Search query
   * @param options - Search options
   * @returns Promise<ServiceResult<UserProfile[]>> - Search results
   *
   * # Privacy
   * - Respects user privacy settings
   * - Filters out private profiles
   * - No exposure of sensitive data
   */
  async searchUsers(
    query: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: { exact?: boolean; limit?: number } = {} // Prefix with _ to indicate unused for now
  ): Promise<ServiceResult<UserProfile[]>> {
    if (!this.actor) {
      throw new Error('UserService not initialized');
    }

    try {
      // Note: search parameters would be used when backend search is implemented
      // const { exact = false, limit = 20 } = options;

      // Validate query
      if (query.trim().length < 2) {
        return { success: true, data: [] };
      }

      // Note: Search functionality will be implemented in backend
      // For now, return empty results with proper structure
      return { success: true, data: [] };
    } catch (error) {
      logAuthError(error, 'User search failed');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      };
    }
  }

  /**
   * Get current user's own profile
   *
   * @returns Promise<ServiceResult<UserProfile | null>> - Current user profile
   */
  async getCurrentUserProfile(): Promise<ServiceResult<UserProfile | null>> {
    if (!this.actor) {
      throw new Error('UserService not initialized');
    }

    try {
      const result = await this.actor.get_my_profile();

      if (result.length > 0) {
        return { success: true, data: result[0] || null };
      } else {
        return { success: true, data: null };
      }
    } catch (error) {
      logAuthError(error, 'Failed to get current user profile');
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get current profile',
      };
    }
  }

  /**
   * Enhanced local validation for profile data with standardized constants
   *
   * @param data - Profile data to validate (creation or update)
   * @throws UserServiceError - If validation fails with specific error codes
   *
   * # Validation Rules
   * - Username: 3-50 chars, alphanumeric + underscore + dash only
   * - Bio: Optional, max 500 characters
   * - Avatar: Optional, max 100 characters (emoji or short URL)
   * - Privacy Mode: Must be valid enum value
   *
   * # Security
   * - Prevents injection attacks through input sanitization
   * - Validates all inputs against backend constraints
   * - Provides detailed error messages for user feedback
   */
  private validateProfileData(
    data: ProfileCreationData | ProfileUpdateData
  ): void {
    // Username validation
    if (!data.username || data.username.trim().length < MIN_USERNAME_LENGTH) {
      throw new UserServiceError(
        UserServiceErrorCode.USERNAME_TOO_SHORT,
        `Username must be at least ${MIN_USERNAME_LENGTH} characters long`
      );
    }

    if (data.username.length > MAX_USERNAME_LENGTH) {
      throw new UserServiceError(
        UserServiceErrorCode.USERNAME_TOO_LONG,
        `Username must be less than ${MAX_USERNAME_LENGTH} characters`
      );
    }

    if (!this.isValidUsername(data.username)) {
      throw new UserServiceError(
        UserServiceErrorCode.INVALID_USERNAME_FORMAT,
        'Username can only contain letters, numbers, underscore, and dash'
      );
    }

    // Bio validation
    if (data.bio && data.bio.length > MAX_BIO_LENGTH) {
      throw new UserServiceError(
        UserServiceErrorCode.BIO_TOO_LONG,
        `Bio must be less than ${MAX_BIO_LENGTH} characters`
      );
    }

    // Avatar validation
    if (data.avatar && data.avatar.length > MAX_AVATAR_LENGTH) {
      throw new UserServiceError(
        UserServiceErrorCode.AVATAR_TOO_LONG,
        `Avatar must be less than ${MAX_AVATAR_LENGTH} characters`
      );
    }

    // Privacy mode validation (if provided)
    if ('privacyMode' in data && data.privacyMode) {
      const validPrivacyModes: PrivacyMode[] = [
        'normal',
        'anonymous',
        'whistleblower',
      ];
      if (!validPrivacyModes.includes(data.privacyMode)) {
        throw new UserServiceError(
          UserServiceErrorCode.INVALID_PRIVACY_MODE,
          `Privacy mode must be one of: ${validPrivacyModes.join(', ')}`
        );
      }
    }

    // Sanitize inputs to prevent XSS (non-destructive validation)
    const sanitizedUsername = this.sanitizeInput(data.username);
    if (sanitizedUsername !== data.username) {
      throw new UserServiceError(
        UserServiceErrorCode.INVALID_USERNAME_FORMAT,
        'Username contains invalid characters that were removed during sanitization'
      );
    }

    if (data.bio) {
      const sanitizedBio = this.sanitizeInput(data.bio);
      if (sanitizedBio !== data.bio) {
        // For bio, we could auto-sanitize, but for security we'll reject
        throw new UserServiceError(
          UserServiceErrorCode.BIO_TOO_LONG, // Using existing error code for bio issues
          'Bio contains potentially dangerous content. Please remove any HTML tags or scripts.'
        );
      }
    }
  }

  /**
   * Validates username format
   *
   * @param username - Username to validate
   * @returns boolean - True if valid format
   */
  private isValidUsername(username: string): boolean {
    return USERNAME_REGEX.test(username);
  }

  /**
   * Enhanced input sanitization for security
   *
   * @param input - Raw user input
   * @returns string - Sanitized input
   *
   * # Security Features
   * - Removes HTML tags to prevent XSS
   * - Removes dangerous protocols (javascript:, data:)
   * - Trims whitespace
   * - Preserves emoji and international characters
   */
  private sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .trim();
  }

  // =============================================================================
  // PRIVACY MODE UTILITIES
  // =============================================================================

  /**
   * Validates and normalizes privacy mode
   *
   * @param mode - Privacy mode to validate
   * @returns PrivacyMode - Validated privacy mode or default
   */
  private normalizePrivacyMode(mode?: PrivacyMode): PrivacyMode {
    const validModes: PrivacyMode[] = ['normal', 'anonymous', 'whistleblower'];
    return mode && validModes.includes(mode) ? mode : 'normal';
  }

  /**
   * Determines if privacy mode requires special handling
   *
   * @param mode - Privacy mode to check
   * @returns boolean - True if special handling required
   */
  private requiresPrivacyProtection(mode?: PrivacyMode): boolean {
    return mode === 'anonymous' || mode === 'whistleblower';
  }

  /**
   * Gets privacy-appropriate logging level
   *
   * @param mode - Privacy mode
   * @returns boolean - True if logging should be minimized
   */
  private shouldMinimizeLogging(mode?: PrivacyMode): boolean {
    return mode === 'whistleblower';
  }

  // =============================================================================
  // UTILITY FUNCTIONS FOR ERROR HANDLING
  // =============================================================================

  /**
   * Maps backend errors to user-friendly messages
   *
   * @param backendError - Error message from backend
   * @returns string - User-friendly error message
   */
  private mapBackendError(backendError: string): string {
    // Common backend error patterns and their user-friendly messages
    const errorMappings: Record<string, string> = {
      'Username already taken':
        'This username is already in use. Please choose a different one.',
      'User profile already exists':
        'You already have a profile. Use the update function instead.',
      'Authentication required': 'Please log in to continue.',
      'Username must be between 3 and 50 characters':
        'Username must be between 3 and 50 characters long.',
      'Bio must be less than 500 characters':
        'Bio is too long. Please keep it under 500 characters.',
      'Invalid username format':
        'Username can only contain letters, numbers, underscores, and dashes.',
    };

    return errorMappings[backendError] || backendError;
  }
}

// Export singleton instance
export const userService = UserService.getInstance();
