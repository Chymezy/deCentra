/**
 * Test file demonstrating the enhanced profile creation flow
 * with privacy mode support and comprehensive validation
 */
import { userService, UserServiceError, UserServiceErrorCode } from '@/lib/services/user.service';
import type { ProfileCreationData } from '@/lib/types';

// Example usage of the enhanced profile creation
export async function testProfileCreation() {
  // Test 1: Normal profile creation
  const normalProfile: ProfileCreationData = {
    username: 'alice_doe',
    bio: 'Digital rights activist and journalist passionate about free speech',
    avatar: '👩‍💻',
    privacyMode: 'normal'
  };

  try {
    const result = await userService.createProfile(normalProfile);
    if (result.success) {
      console.log('Normal profile created successfully:', result.data);
    } else {
      console.error('Normal profile creation failed:', result.error);
    }
  } catch (error) {
    if (error instanceof UserServiceError) {
      console.error(`Profile creation failed with code ${error.code}:`, error.message);
    }
  }

  // Test 2: Whistleblower profile creation (maximum privacy)
  const whistleblowerProfile: ProfileCreationData = {
    username: 'anonymous_source',
    bio: 'Corporate fraud whistleblower', // Minimal identifying info
    avatar: '🕵️',
    privacyMode: 'whistleblower'
  };

  try {
    const result = await userService.createProfile(whistleblowerProfile);
    if (result.success) {
      console.log('Whistleblower profile created with maximum protection');
      // Note: Detailed logging suppressed for whistleblower mode
    } else {
      console.error('Whistleblower profile creation failed:', result.error);
    }
  } catch (error) {
    if (error instanceof UserServiceError) {
      console.error(`Whistleblower profile failed with code ${error.code}:`, error.message);
    }
  }

  // Test 3: Validation error handling
  const invalidProfile: ProfileCreationData = {
    username: 'ab', // Too short
    bio: 'A'.repeat(501), // Too long
    avatar: 'invalid<script>alert("xss")</script>', // Contains XSS
    privacyMode: 'invalid' as typeof PROFILE_VALIDATION.PRIVACY_MODES[number] // Invalid privacy mode
  };

  try {
    const result = await userService.createProfile(invalidProfile);
    console.log('This should not succeed:', result);
  } catch (error) {
    if (error instanceof UserServiceError) {
      console.log(`Expected validation error - Code: ${error.code}, Message: ${error.message}`);
    }
  }

  // Test 4: Username availability check
  try {
    const availability = await userService.checkUsernameAvailability('potential_username');
    if (availability.success) {
      console.log('Username available:', availability.data);
    } else {
      console.error('Username check failed:', availability.error);
    }
  } catch (error) {
    console.error('Username availability check error:', error);
  }
}

// Example of validation constants for frontend components
export const PROFILE_VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
    HELPER_TEXT: 'Username must be 3-50 characters long and contain only letters, numbers, underscore, and dash'
  },
  BIO: {
    MAX_LENGTH: 500,
    HELPER_TEXT: 'Bio must be less than 500 characters'
  },
  AVATAR: {
    MAX_LENGTH: 100,
    HELPER_TEXT: 'Avatar must be less than 100 characters (emoji or short URL)'
  },
  PRIVACY_MODES: ['normal', 'anonymous', 'whistleblower'] as const
};

// Type-safe error checking utility
export function isUserServiceError(error: unknown): error is UserServiceError {
  return error instanceof UserServiceError;
}

// Error code checking utilities
export function isValidationError(error: UserServiceError): boolean {
  const validationCodes = [
    UserServiceErrorCode.USERNAME_TOO_SHORT,
    UserServiceErrorCode.USERNAME_TOO_LONG,
    UserServiceErrorCode.INVALID_USERNAME_FORMAT,
    UserServiceErrorCode.BIO_TOO_LONG,
    UserServiceErrorCode.AVATAR_TOO_LONG,
    UserServiceErrorCode.INVALID_PRIVACY_MODE
  ];
  return validationCodes.includes(error.code);
}

export function isNetworkError(error: UserServiceError): boolean {
  const networkCodes = [
    UserServiceErrorCode.NETWORK_ERROR,
    UserServiceErrorCode.BACKEND_ERROR,
    UserServiceErrorCode.RATE_LIMIT_EXCEEDED
  ];
  return networkCodes.includes(error.code);
}

export function isAuthenticationError(error: UserServiceError): boolean {
  const authCodes = [
    UserServiceErrorCode.NOT_INITIALIZED,
    UserServiceErrorCode.NOT_AUTHENTICATED,
    UserServiceErrorCode.SESSION_EXPIRED
  ];
  return authCodes.includes(error.code);
}
