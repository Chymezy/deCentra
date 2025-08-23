import { useState, useEffect, useCallback, useMemo } from 'react';
import { userService } from '@/lib/services/user.service';
import type { UsernameValidationResult } from '@/lib/types/user.types';

/**
 * Custom hook for real-time username validation
 *
 * Provides debounced username availability checking with validation
 * and user-friendly error messages for profile creation flows.
 *
 * Features:
 * - Real-time format validation
 * - Debounced availability checking
 * - Loading states for UI feedback
 * - Comprehensive error handling
 *
 * @param username - Username to validate
 * @param debounceDelay - Delay for debouncing API calls (default: 500ms)
 * @returns UsernameValidationResult with validation state
 *
 * @example
 * ```typescript
 * const { isValid, isAvailable, isChecking, error } = useUsernameValidation(username);
 *
 * // Use in form validation
 * const canProceed = isValid && isAvailable === true && !isChecking;
 * ```
 */
export function useUsernameValidation(
  username: string,
  debounceDelay: number = 500
): UsernameValidationResult {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate username format
  const isValid = useMemo(() => {
    const reservedWords = [
      'admin',
      'administrator',
      'mod',
      'moderator',
      'system',
      'root',
      'api',
      'www',
      'mail',
      'email',
      'support',
      'help',
      'info',
      'news',
      'blog',
      'decentra',
      'backend',
      'frontend',
      'canister',
      'icp',
      'dfinity',
      'anonymous',
      'null',
      'undefined',
      'true',
      'false',
      'test',
      'demo',
    ];

    if (!username) return false;
    if (username.length < 3 || username.length > 50) return false;
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) return false;
    if (
      username.startsWith('_') ||
      username.startsWith('-') ||
      username.endsWith('_') ||
      username.endsWith('-')
    )
      return false;
    if (reservedWords.includes(username.toLowerCase())) {
      setError('Username is reserved and cannot be used');
      return false;
    }

    let prevSpecial = false;
    for (const char of username) {
      const isSpecial = char === '_' || char === '-';
      if (isSpecial && prevSpecial) return false;
      prevSpecial = isSpecial;
    }

    return true;
  }, [username]);

  // Check availability with the backend
  const checkAvailability = useCallback(
    async (usernameToCheck: string) => {
      if (!isValid) {
        setIsAvailable(null);
        setError(null);
        return;
      }

      setIsChecking(true);
      setError(null);

      try {
        const result =
          await userService.checkUsernameAvailability(usernameToCheck);
        if (result.success) {
          setIsAvailable(result.data || false);
          if (!result.data) {
            setError('Username is already taken');
          }
        } else {
          setError(result.error || 'Unable to check availability');
          setIsAvailable(null);
        }
      } catch {
        setError('Network error checking username');
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    },
    [isValid]
  );

  // Debounced checking effect
  useEffect(() => {
    if (!username || !isValid) {
      setIsAvailable(null);
      setError(null);
      setIsChecking(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      checkAvailability(username);
    }, debounceDelay);

    return () => clearTimeout(timeoutId);
  }, [username, isValid, checkAvailability, debounceDelay]);

  return {
    isValid,
    isAvailable,
    isChecking,
    error,
  };
}

/**
 * Validation hook for profile form data
 *
 * Provides comprehensive validation for profile creation/update forms
 * with real-time feedback and error handling.
 *
 * @param profileData - Profile data to validate
 * @returns Validation state and error messages
 */
export function useProfileValidation(profileData: {
  username: string;
  bio?: string;
  avatar?: string;
}) {
  const usernameValidation = useUsernameValidation(profileData.username);

  const [bioError, setBioError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Bio validation
  useEffect(() => {
    if (profileData.bio && profileData.bio.length > 500) {
      setBioError('Bio must be less than 500 characters');
    } else {
      setBioError(null);
    }
  }, [profileData.bio]);

  // Avatar validation
  useEffect(() => {
    if (profileData.avatar && profileData.avatar.length > 100) {
      setAvatarError('Avatar must be less than 100 characters');
    } else {
      setAvatarError(null);
    }
  }, [profileData.avatar]);

  const isValid =
    usernameValidation.isValid &&
    usernameValidation.isAvailable === true &&
    !bioError &&
    !avatarError;

  const isLoading = usernameValidation.isChecking;

  const errors = {
    username: usernameValidation.error,
    bio: bioError,
    avatar: avatarError,
  };

  return {
    isValid,
    isLoading,
    errors,
    usernameValidation,
  };
}
