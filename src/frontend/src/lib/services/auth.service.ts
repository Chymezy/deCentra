import { backend } from '../../../../declarations/backend';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import type {
  UserProfile,
  ProfileVisibility,
  MessagePrivacy,
  VerificationStatus,
} from '../types';
import { isOk } from '../types';

/**
 * Authentication service that interfaces with the backend canister
 * Handles user profile management, authentication state, and profile operations
 */
export class AuthService {
  private identity: Identity | null = null;

  /**
   * Set the authenticated identity for backend calls
   */
  setIdentity(identity: Identity) {
    this.identity = identity;
  }

  /**
   * Clear the authenticated identity
   */
  clearIdentity() {
    this.identity = null;
  }

  /**
   * Get the current authenticated user's profile
   * Uses the backend's get_my_profile method which automatically uses the caller's identity
   */
  async getCurrentUser(): Promise<UserProfile> {
    try {
      if (!this.identity) {
        throw new Error('User identity not set');
      }

      const result = await backend.get_my_profile();

      if (!result || result.length === 0) {
        throw new Error('User profile not found');
      }

      return result[0];
    } catch (error) {
      throw new Error(
        `Failed to get user profile: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get any user's profile by their Principal ID
   * Uses the backend's get_user_profile method
   */
  async getUserProfile(userId: Principal): Promise<UserProfile | null> {
    try {
      const result = await backend.get_user_profile(userId);

      if (!result || result.length === 0) {
        return null;
      }

      return result[0];
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  /**
   * Create a new user profile
   * Matches the backend's create_user_profile(username, bio?, avatar?) signature
   */
  async createUserProfile(
    username: string,
    bio?: string,
    avatar?: string
  ): Promise<UserProfile> {
    try {
      if (!this.identity) {
        throw new Error('User identity not set');
      }

      const result = await backend.create_user_profile(
        username,
        bio ? [bio] : [],
        avatar ? [avatar] : []
      );

      if (isOk(result)) {
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      throw new Error(
        `Failed to create user profile: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Update the current user's profile
   * Matches the backend's update_user_profile(username, bio?, avatar?) signature
   */
  async updateUserProfile(
    username: string,
    bio?: string,
    avatar?: string
  ): Promise<UserProfile> {
    try {
      if (!this.identity) {
        throw new Error('User identity not set');
      }

      const result = await backend.update_user_profile(
        username,
        bio ? [bio] : [],
        avatar ? [avatar] : []
      );

      if (isOk(result)) {
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      throw new Error(
        `Failed to update user profile: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Check if the current user has a profile
   */
  async hasProfile(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the current user's principal
   */
  getCurrentPrincipal(): Principal | null {
    return this.identity?.getPrincipal() || null;
  }

  /**
   * Utility method to transform ProfileVisibility enum to string
   */
  profileVisibilityToString(
    visibility: ProfileVisibility
  ): 'public' | 'followers' | 'private' {
    if ('Public' in visibility) return 'public';
    if ('FollowersOnly' in visibility) return 'followers';
    if ('Private' in visibility) return 'private';
    return 'public'; // fallback
  }

  /**
   * Utility method to transform string to ProfileVisibility enum
   */
  stringToProfileVisibility(
    visibility: 'public' | 'followers' | 'private'
  ): ProfileVisibility {
    switch (visibility) {
      case 'public':
        return { Public: null };
      case 'followers':
        return { FollowersOnly: null };
      case 'private':
        return { Private: null };
    }
  }

  /**
   * Utility method to transform MessagePrivacy enum to string
   */
  messagePrivacyToString(
    privacy: MessagePrivacy
  ): 'everyone' | 'followers' | 'nobody' {
    if ('Everyone' in privacy) return 'everyone';
    if ('FollowersOnly' in privacy) return 'followers';
    if ('Nobody' in privacy) return 'nobody';
    return 'followers'; // fallback
  }

  /**
   * Utility method to transform VerificationStatus to boolean
   */
  isVerified(status: VerificationStatus): boolean {
    return (
      'Verified' in status || 'Organization' in status || 'Journalist' in status
    );
  }

  /**
   * Get verification status as string
   */
  getVerificationStatus(status: VerificationStatus): string {
    if ('Unverified' in status) return 'unverified';
    if ('Verified' in status) return 'verified';
    if ('Organization' in status) return 'organization';
    if ('Journalist' in status) return 'journalist';
    if ('Whistleblower' in status) return 'whistleblower';
    return 'unverified';
  }

  /**
   * Convert backend timestamps (nanoseconds) to JavaScript Date
   */
  timestampToDate(timestamp: bigint): Date {
    // Backend timestamps are in nanoseconds, convert to milliseconds
    return new Date(Number(timestamp / 1_000_000n));
  }

  /**
   * Convert JavaScript Date to backend timestamp (nanoseconds)
   */
  dateToTimestamp(date: Date): bigint {
    return BigInt(date.getTime()) * 1_000_000n;
  }  /**
   * Check if a username is available for registration
   * Uses real-time validation to provide immediate feedback
   */
  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const result = await backend.check_username_availability(username);
      
      if (isOk(result)) {
        return result.Ok;
      } else {
        // If validation fails, username is not available (format invalid)
        console.warn('Username validation failed:', result.Err);
        return false;
      }
    } catch (error) {
      console.error('Failed to check username availability:', error);
      return false; // Assume unavailable on error for safety
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
