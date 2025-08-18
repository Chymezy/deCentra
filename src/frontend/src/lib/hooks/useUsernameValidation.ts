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
    if (!username) return false;
    if (username.length < 3 || username.length > 50) return false;
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) return false;
    return true;
  }, [username]);

  // Check availability with the backend
  const checkAvailability = useCallback(async (usernameToCheck: string) => {
    if (!isValid) {
      setIsAvailable(null);
      setError(null);
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const result = await userService.checkUsernameAvailability(usernameToCheck);
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
  }, [isValid]);

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

  // Reset states when username becomes invalid
  useEffect(() => {
    if (!isValid && username) {
      setIsAvailable(null);
      if (username.length > 0 && username.length < 3) {
        setError('Username must be at least 3 characters');
      } else if (username.length > 50) {
        setError('Username must be less than 50 characters');
      } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        setError('Username can only contain letters, numbers, underscore, and dash');
      } else {
        setError(null);
      }
    } else if (isValid) {
      setError(null);
    }
  }, [isValid, username]);

  return {
    isValid,
    isAvailable,
    isChecking,
    error
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

  const isValid = usernameValidation.isValid && 
                  usernameValidation.isAvailable === true && 
                  !bioError && 
                  !avatarError;

  const isLoading = usernameValidation.isChecking;

  const errors = {
    username: usernameValidation.error,
    bio: bioError,
    avatar: avatarError
  };

  return {
    isValid,
    isLoading,
    errors,
    usernameValidation
  };
}
